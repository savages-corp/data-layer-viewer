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

// Helper to convert audit status to app Status enum
function convertAuditStatus(auditStatus: string, timestamp: string, inactiveDays: number = 2): Status {
  const date = new Date(timestamp)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)

  if (date < cutoffDate) // Consider flows older than the threshold as unset/inactive
    return Status.Unset

  return auditStatus as Status
}

function getNodeId(isSource: boolean, sourceType: string, sourceIdentifier: string, destinationType: string, destinationIdentifier: string): string {
  return isSource
    ? `source-${slugify(sourceType)}-${sourceIdentifier}-to-destination-${slugify(destinationType)}-${destinationIdentifier}`
    : `destination-${slugify(destinationType)}-${destinationIdentifier}-from-source-${slugify(sourceType)}-${sourceIdentifier}`
}

export function calculateExpectedDataEdges(auditData: AuditDBPush[], inactiveDays: number = 2): number {
  const expectedEdges = auditData.length * 3

  // For every flow that reports with warehouse usage, we add an additional edge
  const warehouseEdges = auditData.filter(flow => convertAuditStatus(flow.latest_status, flow.latest_timestamp, inactiveDays) === Status.SuccessWithWarehouse).length

  return expectedEdges + warehouseEdges
}

// Convert audit data into a layout structure
export function translateFromAuditData(auditData: AuditDBPush[], inactiveDays: number = 2): {
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
    const sourceId = getNodeId(true, flowData.source_type, flowData.source_identifier, flowData.destination_type, flowData.destination_identifier)
    let sourceNode = serviceNodes[sourceId]

    if (!sourceNode) {
      sourceNode = {
        id: sourceId,
        type: 'service',
        position: { x: -312, y: -96 + index * 72 },
        data: {
          status: convertAuditStatus(flowData.latest_status, flowData.latest_timestamp, inactiveDays),
          interval: 15, // Default interval
          imported: true,
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
    const destinationId = getNodeId(false, flowData.source_type, flowData.source_identifier, flowData.destination_type, flowData.destination_identifier)
    let destinationNode = serviceNodes[destinationId]

    if (!destinationNode) {
      destinationNode = {
        id: destinationId,
        type: 'service',
        position: { x: 296, y: -96 + index * 72 },
        data: {
          status: Status.Success, // Destinations don't show status
          interval: 15,
          imported: true,
          configuration: {
            type: flowData.destination_type as ServiceType,
            identifier: flowData.destination_identifier,
            parameters: {},
          },
        },
      }
      serviceNodes[destinationId] = destinationNode
      nodes.push(destinationNode)
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
      id: `${flow.egress.id}-to-dest-${destinationId}`,
      source: flow.egress.id,
      target: destinationNode.id,
      type: 'data',
      data: {
        shape: 'circle',
      },
      zIndex: 1,
    }

    edges.push(sourceToModelizeEdge, modelizeToEgressEdge, egressToDestEdge)

    // If the status indicates warehouse usage, add warehouse connection
    if (convertAuditStatus(flowData.latest_status, flowData.latest_timestamp, inactiveDays) === Status.SuccessWithWarehouse) {
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

// Update existing nodes with new audit data
export function updateFromAuditData(
  auditData: AuditDBPush[],
  existingNodes: AppNode[],
  existingEdges: AppEdge[],
  inactiveDays: number = 2,
): { nodes: AppNode[], edges: AppEdge[] } {
  const updatedNodes = [...existingNodes]
  const updatedEdges = [...existingEdges]

  auditData.forEach((flowData) => {
    const sourceId = getNodeId(true, flowData.source_type, flowData.source_identifier, flowData.destination_type, flowData.destination_identifier)
    const destinationId = getNodeId(false, flowData.source_type, flowData.source_identifier, flowData.destination_type, flowData.destination_identifier)

    const sourceNodeIndex = updatedNodes.findIndex(node => node.id === sourceId)
    const destinationNodeIndex = updatedNodes.findIndex(node => node.id === destinationId)

    if (sourceNodeIndex !== -1) {
      const sourceNode = updatedNodes[sourceNodeIndex] as ServiceNode
      sourceNode.data.status = convertAuditStatus(flowData.latest_status, flowData.latest_timestamp, inactiveDays)

      updatedNodes[sourceNodeIndex] = sourceNode
    }

    if (destinationNodeIndex !== -1) {
      const destinationNode = updatedNodes[destinationNodeIndex] as ServiceNode
      destinationNode.data.status = Status.Success // Destinations don't show status

      updatedNodes[destinationNodeIndex] = destinationNode
    }
  })

  return { nodes: updatedNodes, edges: updatedEdges }
}
