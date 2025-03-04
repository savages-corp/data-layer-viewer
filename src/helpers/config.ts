import type { ServiceNode } from '@/components/Nodes/ServiceNode'
import type { AppEdge, AppNode } from '../App'
import type { DatalayerPrefab } from '../prefabs/datalayer'
import type { FlowPrefab } from '../prefabs/flow'

import { ServiceType } from '@/types/service'
import { Status } from '@/types/status'

import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

import { getTimedId } from './nodes'
import { calculateNextFlowY } from './positioning'
import { slugify } from './string'

export interface ConfigFlow {
  name: string
  warehouse: boolean
  interval: number
  source: {
    type: string
    configuration: {
      identifier: string
      [key: string]: any
    }
  }
  destination: {
    type: string
    configuration: {
      identifier: string
      [key: string]: any
    }
  }
}

// Assumes nodes and edges follow react-flow types with id, data, etc.
export function translateToConfig(flows: FlowPrefab[], nodes: any[], edges: any[]): ConfigFlow[] {
  const getServiceFromEdge = (stageNodeId: string, isSource: boolean): ServiceNode => {
    if (!isSource) {
      const edge = edges.find(e => e.target === stageNodeId)
      return edge ? nodes.find(n => n.id === edge.source) : null
    }

    const edge = edges.find(e => e.source === stageNodeId)
    return edge ? nodes.find(n => n.id === edge.target) : null
  }

  return flows.reduce<ConfigFlow[]>((acc, flow: FlowPrefab) => {
    // We get the source and destination services from the edges to associate them with the flow.
    const sourceService = getServiceFromEdge(flow.modelize.id, false)
    const destinationService = getServiceFromEdge(flow.egress.id, true)

    // Only include flows if both source and destination are connected.
    if (!sourceService || !destinationService)
      return acc

    // Infer the warehouse flag by checking if modelize connects to a WarehouseNode.
    const isWarehouse = edges.some(edge =>
      edge.source === flow.modelize.id
      && nodes.find(n => n.id === edge.target && n.type === 'warehouse'),
    )

    const sourceIdentifier = sourceService.data.configuration.identifier || 'source'
    const destIdentifier = destinationService.data.configuration.identifier || 'destination'

    acc.push({
      name: `${sourceIdentifier} -> ${destIdentifier}`,
      warehouse: isWarehouse,
      interval: sourceService.data.interval || 15, // Default interval of 15 seconds (near real-time).
      source: {
        type: sourceService.data.configuration.type || 'UNKNOWN',
        configuration: {
          identifier: slugify(sourceService.data.configuration.identifier),
          parameters: sourceService.data.configuration.parameters || {},
        },
      },
      destination: {
        type: destinationService.data.configuration.type || 'UNKNOWN',
        configuration: {
          identifier: slugify(destinationService.data.configuration.identifier),
          parameters: destinationService.data.configuration.parameters || {},
        },
      },
    })
    return acc
  }, [])
}

// Convert imported config back to flow graph structure
export function translateFromConfig(importedConfig: ConfigFlow[]): {
  datalayer: DatalayerPrefab
  flows: FlowPrefab[]
  nodes: AppNode[]
  edges: AppEdge[]
} {
  // Create a new data layer with enough capacity for all the flows
  const datalayer = CreateDatalayerPrefab(importedConfig.length)

  // Create array to hold all our flows, nodes and edges
  const flows: FlowPrefab[] = []
  const nodes: AppNode[] = [...Object.values(datalayer)]
  const edges: AppEdge[] = []

  // Track service nodes we've created to avoid duplicates
  const serviceNodes: Record<string, ServiceNode> = {}

  // Process each flow from the config
  importedConfig.forEach((flowConfig, index) => {
    // Create a new flow at the appropriate vertical position
    const flow = CreateFlowPrefab(
      datalayer.container,
      index.toString(),
      24,
      calculateNextFlowY(index),
    )

    flows.push(flow)

    // Add flow nodes to the nodes array
    nodes.push(flow.container, flow.modelize, flow.egress)

    // Extract source and destination names from the flow name if available
    let sourceName = flowConfig.source.configuration.identifier
    let destName = flowConfig.destination.configuration.identifier

    // If the flow name contains "->" then split it to get custom source and destination names
    if (flowConfig.name && flowConfig.name.includes('->')) {
      const nameParts = flowConfig.name.split('->').map(part => part.trim())
      if (nameParts.length >= 2) {
        sourceName = nameParts[0] || sourceName
        destName = nameParts[1] || destName
      }
    }

    // Create or reuse source service node
    const sourceId = `${slugify(flowConfig.source.type)}-source-${flowConfig.source.configuration.identifier}`
    let sourceNode = serviceNodes[sourceId]

    if (!sourceNode) {
      sourceNode = {
        id: sourceId,
        type: 'service',
        position: { x: -312, y: -48 + index * 96 },
        data: {
          status: Status.Success,
          interval: flowConfig.interval || 15,
          configuration: {
            type: flowConfig.source.type as ServiceType || ServiceType.GenericDatabase,
            identifier: sourceName,
            parameters: flowConfig.source.configuration.parameters || {},
          },
        },
      }

      serviceNodes[sourceId] = sourceNode
      nodes.push(sourceNode)
    }

    // Create or reuse destination service node
    const destId = `${slugify(flowConfig.destination.type)}-destination-${flowConfig.destination.configuration.identifier}`
    let destNode = serviceNodes[destId]

    if (!destNode) {
      destNode = {
        id: destId,
        type: 'service',
        position: { x: 296, y: -48 + index * 96 },
        data: {
          status: Status.Success,
          interval: 15,
          configuration: {
            type: flowConfig.destination.type as ServiceType || ServiceType.CommonSalesforce,
            identifier: destName,
            parameters: flowConfig.destination.configuration.parameters || {},
          },
        },
      }

      serviceNodes[destId] = destNode
      nodes.push(destNode)
    }

    // Create edges to connect the flow
    const sourceToModelizeEdge: AppEdge = {
      id: `source-modelize-${index}-${getTimedId('')}`,
      source: sourceNode.id,
      target: flow.modelize.id,
      type: 'data',
      data: {
        initialStatus: Status.Success,
        shape: 'circle',
      },
      zIndex: 1,
    }

    const modelizeToEgressEdge: AppEdge = {
      id: `modelize-egress-${index}-${getTimedId('')}`,
      source: flow.modelize.id,
      target: flow.egress.id,
      type: 'data',
      data: {
        initialStatus: Status.Success,
        shape: 'square',
      },
      zIndex: 1,
    }

    const egressToDestEdge: AppEdge = {
      id: `egress-dest-${index}-${getTimedId('')}`,
      source: flow.egress.id,
      target: destNode.id,
      type: 'data',
      data: {
        initialStatus: Status.Success,
        shape: 'circle',
      },
      zIndex: 1,
    }

    edges.push(sourceToModelizeEdge, modelizeToEgressEdge, egressToDestEdge)

    // If warehouse is enabled, add edge to warehouse
    if (flowConfig.warehouse) {
      const warehouseEdge: AppEdge = {
        id: `warehouse-${index}-${getTimedId('')}`,
        source: flow.modelize.id,
        target: datalayer.warehouse.id,
        type: 'data',
        data: {
          initialStatus: Status.Success,
          shape: 'square',
        },
        zIndex: 1,
      }

      edges.push(warehouseEdge)
    }
  })

  return {
    datalayer,
    flows,
    nodes,
    edges,
  }
}
