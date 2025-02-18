import type { BuiltInEdge, BuiltInNode, Connection, EdgeChange, EdgeTypes, NodeChange, NodeTypes, ReactFlowInstance } from '@xyflow/react'
import type { DataEdge } from './components/Edges/DataEdge'
import type { ContainerNode } from './components/Nodes/ContainerNode'
import type { ServiceNode } from './components/Nodes/ServiceNode'
import type { StageNode } from './components/Nodes/StageNode'
import type { WarehouseNode } from './components/Nodes/WarehouseNode'

import type { Layout } from './layouts/layouts'
import { Service } from '@/types/service'
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
import { DataEdgeComponent } from './components/Edges/DataEdge'
import { ContainerNodeComponent } from './components/Nodes/ContainerNode'

import { ServiceNodeComponent } from './components/Nodes/ServiceNode'
import { StageNodeComponent } from './components/Nodes/StageNode'
import { WarehouseNodeComponent } from './components/Nodes/WarehouseNode'
import { useWindowDimensions } from './hooks/useWindowDimensions'
import { layouts } from './layouts/layouts'
import '@xyflow/react/dist/style.css'
import './App.css'

/* Set up various types of nodes and edges for the graph. */
export type AppNode = BuiltInNode | StageNode | ServiceNode | WarehouseNode | ContainerNode
export const nodeTypes = {
  stage: StageNodeComponent,
  service: ServiceNodeComponent,
  warehouse: WarehouseNodeComponent,
  container: ContainerNodeComponent,
  // Add any of your custom nodes here!
} satisfies NodeTypes

export type AppEdge = BuiltInEdge | DataEdge
export const edgeTypes = {
  data: DataEdgeComponent,
} satisfies EdgeTypes
/* --------------------------------------------------------- */

interface LayoutOption {
  label: string
  value: string
  layout: Layout
}

const layoutOptions: LayoutOption[] = [
  ...Object.entries(layouts).map(([key, value]) => ({
    label: value.name,
    value: key,
    layout: value.builder(),
  })),
]

interface ServiceOption {
  label: string
  value: string
  service: Service
  status?: Status
}

// The options for the select input.
const serviceOptions: ServiceOption[] = [
  { value: 'AWS', label: 'Amazon Web Services (AWS)', service: Service.Aws },
  { value: 'Azure', label: 'Microsoft Azure', service: Service.Azure },
  { value: 'Database', label: 'Database', service: Service.Database },
  { value: 'GCP', label: 'Google Cloud Platform (GCP)', service: Service.Gcp },
  { value: 'Hubspot', label: 'Hubspot', service: Service.Hubspot },
  { value: 'Salesforce', label: 'Salesforce', service: Service.Salesforce },
  { value: 'Slack', label: 'Slack', service: Service.Slack },
  { value: 'Zapier', label: 'Zapier', service: Service.Zapier },
]

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowDimensions()

  const edgeReconnectSuccessful = useRef(true)

  const defaultLayout = layouts.default.builder() // Build the default layout.

  const [nodes, setNodes] = useState(defaultLayout.nodes)
  const [edges, setEdges] = useState(defaultLayout.edges)

  // In case of a layout change, we need to update the nodes and edges separately.
  const [pendingEdges, setPendingEdges] = useState<AppEdge[] | null>(null)

  // New effect that runs after nodes update.
  useEffect(() => {
    if (pendingEdges) {
      setEdges(pendingEdges)
      setPendingEdges(null)

      if (reactFlowInstance)
        reactFlowInstance.fitView()
    }
  }, [pendingEdges])

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

      // This is where we have to handle the different type of node connections and their rules.
      if (reactFlowInstance) {
        // Get the source node as we will be adjusting the data edge based on it.
        const sourceNode = reactFlowInstance.getNode(connection.source)
        const targetNode = reactFlowInstance.getNode(connection.target)

        if (!sourceNode || !targetNode)
          return

        // A service node can only connect to another service node or a Stage Modelize node.
        if (sourceNode.type === 'service') {
          if (targetNode.type !== 'service' && targetNode.type !== 'stage') {
            return
          }

          if (targetNode.type === 'stage') {
            const stageNode = targetNode as StageNode

            if (stageNode.data.stage !== Stage.Modelize) {
              return
            }
          }
        }

        // A stage node has two variations: Modelize and Egress.
        // - Modelize can only emit a connection to a Stage Egress or a Warehouse node.
        if (sourceNode.type === 'stage') {
          const stageNode = sourceNode as StageNode

          if (stageNode.data.stage === Stage.Modelize) {
            if (targetNode.type !== 'stage' && targetNode.type !== 'warehouse') {
              return
            }
            else {
              // If the target is a stage node, ensure it's the corresponding Egress node.
              if (targetNode.type === 'stage' && targetNode.id !== stageNode.data.partnerId)
                return
            }

            edge.data!.shape = 'square'
          }
        }
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

  // const addFlow = () => {
  //   const id = `${Date.now()}`
  //   const newFlow = createFlow(id, 24, Math.random() * 100)

  //   setFlows(flows => [...flows, newFlow.Flow])
  //   addNode(newFlow.Flow)
  //   addNode(newFlow.Modelize)
  //   addNode(newFlow.Egress)
  // }

  // Modify setLayout to update nodes and pendingEdges only.
  const setLayout = (layout: Layout) => {
    setNodes(layout.nodes)
    setPendingEdges(layout.edges)
  }

  const selectLayout = (option: LayoutOption | null) => {
    if (!option)
      return

    setLayout(option.layout)
  }

  const selectService = (option: ServiceOption | null) => {
    if (!option)
      return

    addNode({
      id: `${option.value}-${Date.now()}`, // Ensure unique ID
      type: 'service',
      position: { x: -32 + Math.random() * 64, y: -256 + Math.random() * 16 },
      data: {
        label: option.value,
        status: option.status || Status.Success,
        service: option.service,
      },
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
          <Panel position="top-left" style={{ width: '320px' }}>
            <Select
              placeholder="Select a layout"
              options={layoutOptions}
              value={null}
              onChange={option => selectLayout(option)}
            />
          </Panel>
          <Panel position="top-right" style={{ width: '320px' }}>
            <Select
              placeholder="Add a service"
              options={serviceOptions}
              value={null}
              onChange={option => selectService(option)}
            />
          </Panel>
          {/* <Panel position="top-right">
            <button onClick={addFlow}>Add Flow</button>
          </Panel> */}
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
