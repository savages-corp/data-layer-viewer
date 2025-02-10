import type { BuiltInEdge, BuiltInNode, Connection, EdgeChange, EdgeTypes, NodeChange, NodeTypes, ReactFlowInstance } from '@xyflow/react'
import type { DataEdge } from './edges/DataEdge'
import type { ServiceNode } from './nodes/ServiceNode'
import type { StageNode } from './nodes/StageNode'
import type { WarehouseNode } from './nodes/WarehouseNode'

import { useWindowDimensions } from '@/lib/hooks/useWindowDimensions'

import { Stage } from '@/types/stage'
import { Status } from '@/types/status'

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
  ReactFlowProvider,
  reconnectEdge,
} from '@xyflow/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Select from 'react-select'

import { DataEdgeComponent } from './edges/DataEdge'
import { ServiceNodeComponent } from './nodes/ServiceNode'
import { StageNodeComponent } from './nodes/StageNode'

import { WarehouseNodeComponent } from './nodes/WarehouseNode'
import '@xyflow/react/dist/style.css'
import './App.css'

/* Set up various types of nodes and edges for the graph. */
export type AppNode = BuiltInNode | StageNode | ServiceNode | WarehouseNode
export const nodeTypes = {
  stage: StageNodeComponent,
  service: ServiceNodeComponent,
  warehouse: WarehouseNodeComponent,
  // Add any of your custom nodes here!
} satisfies NodeTypes

export type AppEdge = BuiltInEdge | DataEdge
export const edgeTypes = {
  data: DataEdgeComponent,
} satisfies EdgeTypes
/* --------------------------------------------------------- */

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
const initialEdges: AppEdge[] = [
  { id: 'pull-1', source: 'service-a', target: 'modelize-1', type: 'data', data: { shape: 'circle' } },
  { id: 'stage-1', source: 'modelize-1', target: 'egress-1', type: 'data', data: { shape: 'square' } },
  { id: 'push-1', source: 'egress-1', target: 'service-b', type: 'data', data: { shape: 'circle' } },
  { id: 'warehouse-1', source: 'modelize-1', target: 'warehouse', type: 'data', data: { shape: 'square' } },

] satisfies AppEdge[]

const initialNodes: AppNode[] = [
  {
    id: 'service-a',
    type: 'service',
    position: { x: -300, y: 0 },
    data: {
      label: 'Service A',
      status: Status.Success,
    },
  },
  {
    id: 'service-b',
    type: 'service',
    position: { x: 300, y: 0 },
    data: {
      label: 'Service B',
    },
  },
  // Data Layer container sub-flow
  {
    id: 'data-layer',
    type: 'group',
    position: { x: -50, y: -125 },
    style: { width: 300, height: 300 },
    zIndex: -2,
    data: {},
    draggable: false,
    selectable: false,
  },
  // {
  //   id: 'data-layer-label',
  //   position: { x: -50, y: -125 },
  //   type: 'default',
  //   data: { label: 'Data Layer' },
  //   parentId: 'data-layer',
  //   extent: 'parent',
  // },
  {
    id: 'data-layer-flow-1',
    type: 'group',
    position: { x: 24, y: 16 },
    style: { width: 256, height: 32, zIndex: -1 },
    data: {},
    zIndex: -1,
    parentId: 'data-layer',
    extent: 'parent',
    className: 'data-layer-flow',
  },
  {
    id: 'warehouse',
    position: { x: 8, y: 260 },
    type: 'warehouse',
    data: {
      label: 'Warehouse',
    },
    parentId: 'data-layer',
    extent: 'parent',
    draggable: false,
  },
  {
    id: 'modelize-1',
    position: { x: 0, y: 125 },
    type: 'stage',
    data: { stage: Stage.Modelize },
    parentId: 'data-layer-flow-1',
    extent: 'parent',
  },
  {
    id: 'egress-1',
    position: { x: 200, y: 125 },
    type: 'stage',
    data: { stage: Stage.Egress },
    parentId: 'data-layer-flow-1',
    extent: 'parent',
  },

] satisfies AppNode[]

export default function App(
  {
    locked,
    hideMinimap,
    hideControls,

  }: {
    locked?: boolean
    hideMinimap?: boolean
    hideControls?: boolean
  },
) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<AppNode, AppEdge>>()
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  const edgeReconnectSuccessful = useRef(true)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const { width, height } = useWindowDimensions()

  // Implement basic graph functionality.
  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    [setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<AppEdge>[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    [setEdges],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target)
        return // Prevent self-connections

      // Check for duplicate connections.
      const exists = edges.some(
        edge => edge.source === connection.source && edge.target === connection.target,
      )

      if (exists)
        return

      // Create a new edge based on the connection.
      const edge: AppEdge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`, // Unique ID
        source: connection.source,
        target: connection.target,
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
    (oldEdge: AppEdge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      setEdges(els => reconnectEdge(oldEdge, newConnection, els))
    },
    [setEdges],
  )

  const onReconnectEnd = useCallback(
    (_: any, edge: AppEdge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges(eds => eds.filter(e => e.id !== edge.id))
      }

      edgeReconnectSuccessful.current = true
    },
    [setEdges],
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: AppNode) => {
      if (!locked) // We don't need to do anything if the graph not locked.
        return

      if (!reactFlowInstance || !reactFlowWrapper.current)
        return

      if (!node.measured || !node.measured.width || !node.measured.height)
        return

      // Get the current viewport transformation
      const { x: viewportX, y: viewportY, zoom } = reactFlowInstance.getViewport()

      // Get the size of the React Flow wrapper element
      const { clientWidth, clientHeight } = reactFlowWrapper.current

      // Calculate the bounds in node coordinate space
      const left = -viewportX / zoom
      const top = -viewportY / zoom
      const right = (-viewportX + clientWidth) / zoom
      const bottom = (-viewportY + clientHeight) / zoom

      // Now you can check if the node is within these bounds
      const nodeRight = node.position.x + (node.width || 0)
      const nodeBottom = node.position.y + (node.height || 0)

      const isWithinBounds
        = node.position.x >= left
          && node.position.y >= top
          && nodeRight <= right
          && nodeBottom <= bottom

      if (!isWithinBounds) {
        // Clamp the node inside the boundaries.
        const newX = Math.max(left, Math.min(node.position.x, right - node.measured.width))
        const newY = Math.max(top, Math.min(node.position.y, bottom - node.measured.height))

        setNodes(nds =>
          nds.map(n =>
            n.id === node.id ? { ...n, position: { x: newX, y: newY } } : n,
          ),
        )
      }
    },
    [reactFlowInstance],
  )

  // If the viewport is resized, re-fit the view.
  useEffect(() => {
    if (reactFlowInstance)
      reactFlowInstance.fitView()
  }, [width, height])

  // Custom functionality.
  const addNode = (node: AppNode) => setNodes(nds => [...nds, node])

  const selectService = (option: ServiceOption | null) => {
    if (!option)
      return

    addNode({
      id: `${option.value}-${Date.now()}`, // Ensure unique ID
      type: 'service',
      position: { x: -256, y: Math.random() * 256 },
      data: { label: option.label, status: Status.Success },
    })
  }

  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} className="reactflow-wrapper" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          onInit={instance => setReactFlowInstance(instance)}
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
          onNodeDragStop={onNodeDragStop}
          fitView
          autoPanOnNodeDrag={!locked}
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
          {!hideMinimap && !locked && <MiniMap />}
          {!hideControls && !locked && <Controls />}
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}
