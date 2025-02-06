import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react'
import type { AppNode, ServiceNode } from './nodes'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  reconnectEdge,
} from '@xyflow/react'

import { useCallback, useRef, useState } from 'react'
import Select from 'react-select'

import { edgeTypes } from './edges'
import { nodeTypes } from './nodes'

import '@xyflow/react/dist/style.css'

interface ServiceOption {
  label: string
  value: string
}

// The options for the select input.
const serviceOptions: ServiceOption[] = [
  { label: 'Salesforce', value: 'salesforce' },
  { label: 'Custom', value: 'custom' },
]

// The initial state of the graph.
const initialEdges: Edge[] = [
  { id: 'base', source: 'service', target: 'data-layer', animated: true },
] satisfies Edge[]

const initialNodes: AppNode[] = [
  {
    id: 'service',
    type: 'service',
    position: { x: 0, y: 0 },
    data: { label: 'Service' },
  },
  {
    id: 'data-layer',
    type: 'data-layer',
    position: { x: -100, y: 100 },
    data: { label: 'Data Layer' },
  },
] satisfies AppNode[]

export default function App(
  {
    locked,
  }: {
    locked?: boolean
  },
) {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const edgeReconnectSuccessful = useRef(true)

  // Implement basic graph functionality.
  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    [setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    [setEdges],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) // Prevent self-connections.
        return

      // Create a new edge based on the connection.
      const edge: Edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        animated: true,
      }

      setEdges(eds => addEdge(edge, eds))
    },
    [setEdges],
  )

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true
    setEdges(els => reconnectEdge(oldEdge, newConnection, els))
  }, [])

  const onReconnectEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges(eds => eds.filter(e => e.id !== edge.id))
    }

    edgeReconnectSuccessful.current = true
  }, [])

  // Custom functionality.
  const addNode = (node: AppNode) => setNodes(nds => [...nds, node])
  // const removeNode = (nodeId: string) => setNodes(nds => nds.filter(n => n.id !== nodeId))

  const selectService = (option: ServiceOption | null) => {
    if (!option)
      return

    addNode({
      id: option.value,
      type: 'service',
      position: { x: -256, y: Math.random() * 256 },
      data: { label: option.label },
    })
  }

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}

      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}

      onConnect={onConnect}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onReconnectEnd={onReconnectEnd}

      // Fit the view to the nodes when the component mounts.
      fitView

      // Allow zooming and panning unless the viewer is locked.
      panOnDrag={!locked}
      zoomOnScroll={!locked}
      zoomOnPinch={!locked}
    >
      {/* <Panel position="top-left">Sources</Panel> */}
      <Panel position="top-left">
        <Select placeholder="Add a service" options={serviceOptions} value={null} onChange={option => selectService(option)} />
      </Panel>
      {/* <Panel position="top-right">Destinations</Panel> */}
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  )
}
