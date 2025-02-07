import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react'
import type { AppNode } from './nodes'
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
import { nodeTypes } from './nodes' // Ensure this maps to the updated ServiceNodeComponent

import '@xyflow/react/dist/style.css'

import './App.css'

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
    type: 'service', // Ensure this matches the key in nodeTypes
    position: { x: 0, y: 0 },
    data: { label: 'Service' },
  },
  {
    id: 'data-layer',
    type: 'data-layer', // Ensure this type is defined in nodeTypes
    position: { x: -100, y: 100 },
    data: { label: 'Data Layer' },
  },
] satisfies AppNode[]

export default function App({ locked }: { locked?: boolean }) {
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
      if (connection.source === connection.target)
        return // Prevent self-connections

      // Check for duplicate connections
      const exists = edges.some(
        edge => edge.source === connection.source && edge.target === connection.target,
      )

      if (exists)
        return

      // Create a new edge based on the connection.
      const edge: Edge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`, // Unique ID
        source: connection.source,
        target: connection.target,
        animated: true,
      }

      setEdges(eds => addEdge(edge, eds))
    },
    [edges, setEdges],
  )

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      setEdges(els => reconnectEdge(oldEdge, newConnection, els))
    },
    [setEdges],
  )

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges(eds => eds.filter(e => e.id !== edge.id))
      }

      edgeReconnectSuccessful.current = true
    },
    [setEdges],
  )

  // Custom functionality.
  const addNode = (node: AppNode) => setNodes(nds => [...nds, node])

  const selectService = (option: ServiceOption | null) => {
    if (!option)
      return

    addNode({
      id: `${option.value}-${Date.now()}`, // Ensure unique ID
      type: 'service',
      position: { x: -256, y: Math.random() * 256 },
      data: { label: option.label },
    })
  }

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes} // Ensure this includes 'service' mapped to ServiceNodeComponent
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onReconnectEnd={onReconnectEnd}
      fitView
      panOnDrag={!locked}
      zoomOnScroll={!locked}
      zoomOnPinch={!locked}
    >
      <Panel position="top-left">
        <Select
          placeholder="Add a service"
          options={serviceOptions}
          value={null}
          onChange={option => selectService(option)}
        />
      </Panel>
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  )
}
