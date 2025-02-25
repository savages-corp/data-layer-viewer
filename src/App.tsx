import type { ServiceConfiguration } from '@/types/service'
import type { BuiltInEdge, BuiltInNode, Connection, EdgeChange, EdgeTypes, FitViewOptions, NodeChange, NodeTypes, ReactFlowInstance } from '@xyflow/react'
import type { GroupBase } from 'react-select'
import type { DataEdge } from './components/Edges/DataEdge'
import type { AnnotationNode } from './components/Nodes/AnnotationNode'
import type { ContainerNode } from './components/Nodes/ContainerNode'

import type { ServiceNode } from './components/Nodes/ServiceNode'
import type { StageNode } from './components/Nodes/StageNode'
import type { WarehouseNode } from './components/Nodes/WarehouseNode'

import type { Layout } from './layouts/layouts'
import { ServiceType } from '@/types/service'
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'

import { stringify as YAMLStringify } from 'yaml'

import Button from './components/Common/Button'
import Modal from './components/Common/Modal'

import { DataEdgeComponent } from './components/Edges/DataEdge'
import { AnnotationNodeComponent } from './components/Nodes/AnnotationNode'
import { ContainerNodeComponent } from './components/Nodes/ContainerNode'
import { ServiceNodeComponent } from './components/Nodes/ServiceNode'
import { StageNodeComponent } from './components/Nodes/StageNode'
import { WarehouseNodeComponent } from './components/Nodes/WarehouseNode'

import { translateToConfig } from './helpers/config'
import { calculateDataLayerHeight, calculateDataLayerY, calculateNextFlowY, calculateWarehouseY } from './helpers/positioning'
import { slugify } from './helpers/string'

import { useWindowDimensions } from './hooks/useWindowDimensions'

import { layouts } from './layouts/layouts'

import { CreateFlowPrefab } from './prefabs/flow'

import '@xyflow/react/dist/style.css'
import './App.css'

/* Set up various types of nodes and edges for the graph. */
export type AppNode = BuiltInNode | AnnotationNode | StageNode | ServiceNode | WarehouseNode | ContainerNode
export const nodeTypes = {
  annotation: AnnotationNodeComponent,
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
    layout: value.builder({}),
  })),
]

interface ServiceOption {
  label: string
  status?: Status
  configuration: ServiceConfiguration
}

interface GroupedOption {
  label: string
  options: ServiceOption[]
}

// The options for the select input.
const groupedServiceOptions: GroupedOption[] = [
  {
    label: 'Common Services',
    options: [
      {
        label: 'Amazon Web Services (AWS)',
        configuration: {
          identifier: 'AWS',
          type: ServiceType.CommonAws,
        },
      },
      {
        label: 'Azure',
        configuration: {
          identifier: 'Microsoft Azure',
          type: ServiceType.CommonAzure,
        },
      },
      {
        label: 'Google Cloud Platform (GCP)',
        configuration: {
          identifier: 'GCP',
          type: ServiceType.CommonGcp,
        },
      },
      {
        label: 'Hubspot',
        configuration: {
          identifier: 'Hubspot',
          type: ServiceType.CommonHubspot,
        },
      },
      {
        label: 'Salesforce',
        configuration: {
          identifier: 'Salesforce',
          type: ServiceType.CommonSalesforce,
        },
      },
      {
        label: 'Slack',
        configuration: {
          identifier: 'Slack',
          type: ServiceType.CommonSlack,
        },
      },
      {
        label: 'Zapier',
        configuration: {
          identifier: 'Zapier',
          type: ServiceType.CommonZapier,
        },
      },
    ],
  },
  {
    label: 'Infrastructure Services',
    options: [
      {
        label: 'Database',
        configuration: {
          identifier: 'Database',
          type: ServiceType.InfrastructureDb,
        },
      },
      {
        label: 'Warehouse',
        configuration: {
          identifier: 'Warehouse',
          type: ServiceType.InfrastructureWarehouse,
        },
      },
    ],
  },
  {
    label: 'Generic Services',
    options: [
      {
        label: 'HTTP',
        configuration: {
          identifier: 'Generic HTTP Service',
          type: ServiceType.GenericHttp,
        },
      },
      {
        label: 'SQL',
        configuration: {
          identifier: 'Generic SQL Service',
          type: ServiceType.GenericDatabase,
        },
      },
    ],
  },
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<AppNode, AppEdge>>()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowDimensions()

  const edgeReconnectSuccessful = useRef(true)

  const defaultLayout = layouts.default.builder({}) // Build the default layout.

  const [layoutFlag, setLayoutFlag] = useState(false)
  const [layout, setLayout] = useState<Layout>(defaultLayout)
  const [datalayer, setDatalayer] = useState(defaultLayout.datalayer)
  const [flows, setFlows] = useState(defaultLayout.flows)
  const [nodes, setNodes] = useState(defaultLayout.nodes)
  const [edges, setEdges] = useState(defaultLayout.edges)

  // In case of a layout change, we need to update the nodes and edges separately.
  const [pendingEdges, setPendingEdges] = useState<AppEdge[] | null>(null)

  // Fit the view to all nodes except annotations. Additionally pad the height by 32 pixels.
  const fitViewOptions = useMemo(() => (
    {
      nodes: nodes.filter(n => n.type !== 'annotation'),
    } satisfies FitViewOptions
  ), [nodes])

  // New effect that runs after nodes update.
  useEffect(() => {
    if (pendingEdges) {
      setEdges(pendingEdges)
      setPendingEdges(null)

      if (reactFlowInstance) // Fit the view to all nodes except annotations.
        reactFlowInstance.fitView(fitViewOptions)
    }
  }, [pendingEdges])

  // Modify setLayout to update nodes and pendingEdges only.
  useEffect(() => {
    setLayoutFlag(false)
    setDatalayer(layout.datalayer)
    setFlows(layout.flows)
    setNodes(layout.nodes)
    setPendingEdges(layout.edges)
  }, [layout, layoutFlag])

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
        zIndex: 1,
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

  // TODO: This should be done outside the React Flow component - specifically we shouldn't use nodes for this.
  // If the viewport is resized, re-fit the view but ignore annotations. Re-pin annotations to the corners.
  // const onViewportChange = useCallback((viewport: Viewport) => {
  //   if (!reactFlowInstance || !reactFlowWrapper.current)
  //     return

  //   const { x: vx, y: vy, zoom } = viewport
  //   const { clientWidth /* , clientHeight */ } = reactFlowWrapper.current
  //   const left = -vx / zoom
  //   const top = -vy / zoom
  //   const right = (-vx + clientWidth) / zoom
  //   // const bottom = (-vy + clientHeight) / zoom

  //   setNodes(nds =>
  //     nds.map((n) => {
  //       if (n.type === 'annotation' && n.data.isPinned) {
  //         let newX = n.position.x
  //         let newY = n.position.y

  //         // Use n.data.pinnedPosition with default to 'top-right'
  //         const pos = n.data.pinnedPosition || 'top-right'

  //         // Use n.width and n.height if available; else fallback values
  //         const nodeWidth = (n.width as number) || 150
  //         const nodeHeight = (n.height as number) || 50

  //         switch (pos) {
  //           case 'top-left':
  //             newX = left + nodeWidth - 192
  //             newY = top + nodeHeight - 16
  //             break

  //           case 'top-right':
  //             newX = right - nodeWidth - 8
  //             newY = top + nodeHeight - 16
  //             break

  //             // case 'bottom-left':
  //             //   newX = left + 0
  //             //   newY = bottom - nodeHeight - 0
  //             //   break

  //             // case 'bottom-right':
  //             //   newX = right - nodeWidth - 0
  //             //   newY = bottom - nodeHeight - 0
  //             //   break

  //           default:
  //             newX = right - nodeWidth - 0
  //             newY = top + 0
  //         }
  //         return { ...n, position: { x: newX, y: newY } }
  //       }
  //       return n
  //     }),
  //   )
  // }, [reactFlowInstance, reactFlowWrapper]) // Layout flag is captured too to make sure a reset still pins the annotations.

  // If the viewport is resized, make sure to re-fit the view.
  useEffect(() => {
    if (reactFlowInstance)
      reactFlowInstance.fitView(fitViewOptions)
  }, [reactFlowInstance, reactFlowWrapper, width, height, pendingEdges, layoutFlag])

  // Resize the Data Layer container based on the amount of child nodes.
  // Recommended defaults for the Data Layer container:
  // position: { x: -48, y: -128 },
  // style: { width: 300, height: 256 },
  useEffect(() => {
    if (!reactFlowInstance || !datalayer)
      return

    // Calculate the new height based on the number of flows.
    const newHeight = calculateDataLayerHeight(flows.length)

    // Adjust the Data Layer position Y to place it in the center of the viewport.
    const newY = calculateDataLayerY(flows.length)

    setNodes(nds => nds.map((n) => {
      if (n.id === datalayer.container.id) {
        return {
          ...n,
          position: { x: -48, y: newY },
          style: { width: 300, height: newHeight },
        }
      }

      // Adjust the position of the warehouse node.
      // Recommended position with two flows: { x: 4, y: 264 }
      if (n.id === datalayer.warehouse.id) {
        return {
          ...n,
          position: { x: 4, y: calculateWarehouseY(newHeight) },
        }
      }

      return n
    }))
  }, [datalayer, flows])

  // Custom functionality.
  const addNode = (node: AppNode) => setNodes(nds => [...nds, node])

  const addFlow = () => {
    if (!datalayer)
      return

    const flow = CreateFlowPrefab(datalayer.container, Date.now().toString(), 24, calculateNextFlowY(flows.length))

    setNodes(nds => [...nds, flow.container, flow.modelize, flow.egress])
    setFlows(flws => [...flws, flow])
  }

  const removeFlow = () => {
    if (!reactFlowInstance || !datalayer || !flows.length)
      return

    const flow = flows.pop()

    if (!flow)
      return

    // Before we continue, let's make our life easier by getting the IDs of the nodes associated with the flow.
    const ids = [flow.container.id, flow.modelize.id, flow.egress.id]

    // We have to do a few operations here. Firstly, remove the nodes associated with the flow. Then, remove nodes that have any of them as parents.
    let nodes = reactFlowInstance.getNodes() || []
    // nodes = nodes.filter(n => !ids.includes(n.id) && (n.parentId && !ids.includes(n.parentId)))
    nodes = nodes.filter(n => !ids.includes(n.id))
    nodes = nodes.filter(n => !ids.includes(n.parentId as string))

    setNodes(nodes)
    setEdges(eds => eds.filter(e => !ids.includes(e.source) && !ids.includes(e.target)))
    setFlows(flws => flws.filter(f => f.container.id !== flow.container.id))
  }

  const selectLayout = (option: LayoutOption | null) => {
    if (!option)
      return

    // Since some times the layout is the same, we need to call setLayoutFlag to force the update.
    setLayoutFlag(true)
    setLayout(option.layout)
  }

  const selectService = (option: ServiceOption | null) => {
    if (!option)
      return

    addNode({
      id: `${slugify(option.configuration.type)}-${Date.now()}`,
      type: 'service',
      position: { x: -32 + Math.random() * 64, y: -256 + Math.random() * 16 },
      data: {
        status: option.status || Status.Success,
        interval: 15, // Default interval of 15 seconds.
        configuration: option.configuration,
      },
    })
  }

  return (
    <>
      <Modal title="Configuration" isOpen={isModalOpen} setIsOpen={setIsModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-split">
          <div className="modal-split-container">
            <h2>JSON</h2>
            <pre>
              {JSON.stringify(translateToConfig(flows, nodes, edges), null, 2)}
            </pre>
          </div>
          <div className="modal-split-container">
            <h2>YAML</h2>
            <pre>
              {YAMLStringify(translateToConfig(flows, nodes, edges), null, 2)}
            </pre>
          </div>
        </div>
      </Modal>
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} className="reactflow-wrapper" style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            onInit={instance => setReactFlowInstance(instance)}
            nodes={nodes}
            nodeTypes={nodeTypes}
            edges={edges}
            edgeTypes={edgeTypes}

            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onNodeDragStop={onNodeDragStop}

            autoPanOnNodeDrag={!locked}
            panOnDrag={!locked}
            zoomOnScroll={!locked}
            zoomOnPinch={!locked}
            zoomOnDoubleClick={!locked}
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
              <Select<ServiceOption, false, GroupBase<ServiceOption>>
                placeholder="Add a service"
                options={groupedServiceOptions}
                value={null}
                onChange={option => selectService(option)}
              />
            </Panel>
            <Panel position="bottom-center">
              <div className="reactflow-panel reactflow-panel-flow">
                <Button className="reactflow-panel-flow-left" onClick={addFlow}>Add Flow</Button>
                <Button className="reactflow-panel-flow-middle" onClick={removeFlow}>Remove Flow</Button>
                <Button className="reactflow-panel-flow-right" onClick={() => setIsModalOpen(true)}>Config</Button>
              </div>
            </Panel>
            <Panel position="bottom-right">
              <div className="reactflow-panel">
              </div>
            </Panel>
            <Background
              variant={BackgroundVariant.Dots}
            />
            {!hideMinimap && !locked && <MiniMap />}
            {!hideControls && !locked && <Controls />}
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </>
  )
}
