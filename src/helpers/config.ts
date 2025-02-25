import type { ServiceNode } from '../components/Nodes/ServiceNode'
import type { FlowPrefab } from '../prefabs/flow'
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
