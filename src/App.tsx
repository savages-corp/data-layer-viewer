import type { Connection, Edge, EdgeChange, NodeChange } from '@xyflow/react'
import type { AppNode } from './nodes'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
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
  { id: 'pull-1', source: 'service-a', target: 'modelize-1', type: 'data', animated: true, data: { shape: 'circle' } },
  { id: 'data-layer-1', source: 'modelize-1', target: 'egress-1', type: 'data', animated: true, data: { shape: 'square' } },
    { id: 'push-1', source: 'egress-1', target: 'service-b', type: 'data', animated: true, data: { shape: 'circle' } },

] satisfies Edge[]

const initialNodes: AppNode[] = [
  {
    id: 'service-a',
    type: 'service',
    position: { x: -300, y: 0 },
    data: { label: 'Service A' },
  },
  {
    id: 'service-b',
    type: 'service',
    position: { x: 300, y: 0 },
    data: { label: 'Service B' },
  },
  // Data Layer container sub-flow
  {
    id: 'data-layer',
    type: 'group',
    position: { x: -50, y: -125 },
    style: { width: 300, height: 300 },
    zIndex: -1,
    data: {},
  },
  {
    id: 'modelize-1',
    position: { x: 50, y: 125 },
    type: 'data-layer',
    data: { label: 'Modelize' },
    parentId: 'data-layer',
    extent: 'parent',
  },
  {
    id: 'egress-1',
    position: { x: 200, y: 125 },
    type: 'data-layer',
    data: { label: 'Egress' },
    parentId: 'data-layer',
    extent: 'parent',
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
        type: 'data',
        data: {
          shape: 'circle',
        },
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
      <Background
        variant={BackgroundVariant.Dots}
      />
      <MiniMap />
      <Controls />
    </ReactFlow>
  )
}
