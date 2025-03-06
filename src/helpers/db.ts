import type { ServiceNode } from '@/components/Nodes/ServiceNode'

import type { AuditDBPush } from '@/types/auditdb'
import type { ServiceType } from '@/types/service'

import type { AppEdge, AppNode } from '../App'

import type { DatalayerPrefab } from '../prefabs/datalayer'
import type { FlowPrefab } from '../prefabs/flow'

import { Status } from '@/types/status'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'
import { getTimedId } from './nodes'
import { calculateNextFlowY } from './positioning'
import { slugify } from './string'

// Helper to check if a timestamp is more than 2 days old
function isInactive(timestamp: string): boolean {
  const date = new Date(timestamp)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  return date < twoDaysAgo
}

// Helper to convert audit status to app Status enum
function convertAuditStatus(auditStatus: string, timestamp: string): Status {
  if (isInactive(timestamp)) {
    return Status.Unset
  }

  switch (auditStatus) {
    case 'SUCCESS':
    case 'SUCCESS-NOTHING-NEW':
      return Status.Success
    case 'SUCCESS-WITH-WAREHOUSE':
      return Status.SuccessWithWarehouse
    case 'ERROR-SERVICE-PULL':
      return Status.ErrorServicePull
    case 'ERROR-SERVICE-PUSH':
      return Status.ErrorServicePush
    case 'UNSET':
      return Status.Unset
    default:
      return Status.ErrorInternalUnknown
  }
}

// Convert audit data into a layout structure
export function translateFromAuditData(auditData: AuditDBPush[]): {
  datalayer: DatalayerPrefab
  flows: FlowPrefab[]
  nodes: AppNode[]
  edges: AppEdge[]
} {
  // Create a new data layer with enough capacity for all flows
  const datalayer = CreateDatalayerPrefab(auditData.length)

  // Create arrays to hold all our flows, nodes and edges
  const flows: FlowPrefab[] = []
  const nodes: AppNode[] = [...Object.values(datalayer)]
  const edges: AppEdge[] = []

  // Track service nodes we've created to avoid duplicates
  const serviceNodes: Record<string, ServiceNode> = {}

  // Process each flow from the audit data
  auditData.forEach((flowData, index) => {
    // Create flow container with proper positioning
    const flow = CreateFlowPrefab(
      datalayer.container,
      getTimedId(`flow-${index}`),
      24,
      calculateNextFlowY(index),
    )

    // Add flow nodes to our collection
    flows.push(flow)
    nodes.push(flow.container, flow.modelize, flow.egress)

    // Create source service node
    const sourceId = `flow-${index}-source-${slugify(flowData.source_type)}-${flowData.source_identifier}`
    let sourceNode = serviceNodes[sourceId]

    if (!sourceNode) {
      sourceNode = {
        id: sourceId,
        type: 'service',
        position: { x: -312, y: -96 + index * 72 },
        data: {
          status: convertAuditStatus(flowData.latest_status, flowData.latest_timestamp),
          interval: 15, // Default interval
          configuration: {
            type: flowData.source_type as ServiceType,
            identifier: flowData.source_identifier,
            parameters: {},
          },
        },
      }
      serviceNodes[sourceId] = sourceNode
      nodes.push(sourceNode)
    }

    // Create destination service node
    const destId = `flow-${index}-destination-${slugify(flowData.destination_type)}-${flowData.destination_identifier}`
    let destNode = serviceNodes[destId]

    if (!destNode) {
      destNode = {
        id: destId,
        type: 'service',
        position: { x: 296, y: -96 + index * 72 },
        data: {
          status: Status.Success, // Destinations don't show status
          interval: 15,
          configuration: {
            type: flowData.destination_type as ServiceType,
            identifier: flowData.destination_identifier,
            parameters: {},
          },
        },
      }
      serviceNodes[destId] = destNode
      nodes.push(destNode)
    }

    // Create edges to connect the flow
    const sourceToModelizeEdge: AppEdge = {
      id: `${sourceId}-to-modelize-${flow.modelize.id}`,
      source: sourceNode.id,
      target: flow.modelize.id,
      type: 'data',
      data: {
        shape: 'circle',
      },
      zIndex: 1,
    }

    const modelizeToEgressEdge: AppEdge = {
      id: `${flow.modelize.id}-to-egress-${flow.egress.id}`,
      source: flow.modelize.id,
      target: flow.egress.id,
      type: 'data',
      data: {
        shape: 'square',
      },
      zIndex: 1,
    }

    const egressToDestEdge: AppEdge = {
      id: `${flow.egress.id}-to-dest-${destId}`,
      source: flow.egress.id,
      target: destNode.id,
      type: 'data',
      data: {
        shape: 'circle',
      },
      zIndex: 1,
    }

    edges.push(sourceToModelizeEdge, modelizeToEgressEdge, egressToDestEdge)

    // If the status indicates warehouse usage, add warehouse connection
    if (convertAuditStatus(flowData.latest_status, flowData.latest_timestamp) === Status.SuccessWithWarehouse) {
      const modelizeToWarehouseEdge: AppEdge = {
        id: `${flow.modelize.id}-to-warehouse-${datalayer.warehouse.id}`,
        source: flow.modelize.id,
        target: datalayer.warehouse.id,
        type: 'data',
        data: {
          shape: 'square',
        },
        zIndex: 1,
      }
      edges.push(modelizeToWarehouseEdge)
    }
  })

  return {
    datalayer,
    flows,
    nodes,
    edges,
  }
}
