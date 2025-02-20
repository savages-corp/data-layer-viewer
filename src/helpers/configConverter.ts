export interface ConfigFlow {
  name: string
  warehouse: boolean
  interval?: number
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
export function translateToConfig(flows: any[], nodes: any[], edges: any[]): ConfigFlow[] {
  const getServiceFromEdge = (stageNodeId: string, isSource: boolean) => {
    // For modelize node (expects an incoming edge from a service node)
    if (!isSource) {
      const edge = edges.find(e => e.target === stageNodeId)
      return edge ? nodes.find(n => n.id === edge.source) : null
    }
    // For egress node (expects an outgoing edge to a service node)
    const edge = edges.find(e => e.source === stageNodeId)
    return edge ? nodes.find(n => n.id === edge.target) : null
  }

  return flows.map((flow) => {
    // Retrieve the service nodes connected to the modelize and egress nodes.
    const sourceService = getServiceFromEdge(flow.modelize.id, false)
    const destinationService = getServiceFromEdge(flow.egress.id, true)
    // Build a name from the service node labels or fallback
    const sourceLabel = sourceService?.data?.label || 'Source'
    const destLabel = destinationService?.data?.label || 'Destination'

    return {
      name: `${sourceLabel} -> ${destLabel}`,
      warehouse: true,
      // Optionally use a shared interval from the flow object if present.
      ...(flow.interval ? { interval: flow.interval } : {}),
      source: {
        type: sourceService?.data?.service || 'UNKNOWN',
        configuration: {
          identifier: sourceLabel.toLowerCase().replace(/\s+/g, '-'),
          ...(sourceService?.data?.parameters || {}),
        },
      },
      destination: {
        type: destinationService?.data?.service || 'UNKNOWN',
        configuration: {
          identifier: destLabel.toLowerCase().replace(/\s+/g, '-'),
          ...(destinationService?.data?.parameters || {}),
        },
      },
    }
  })
}
