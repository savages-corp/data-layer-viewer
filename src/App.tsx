import type { OnConnect } from '@xyflow/react'
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'

import { useCallback, useState } from 'react'
import Select from 'react-select'

import { edgeTypes, initialEdges } from './edges'
import { initialNodes, nodeTypes } from './nodes'

import '@xyflow/react/dist/style.css'

interface Option {
  label: string
  value: string
}

const options: Option[] = [
  { label: 'Salesforce', value: 'salesforce' },
  { label: 'Custom', value: 'custom' },
]

export default function App({ locked }: { locked?: boolean }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect: OnConnect = useCallback(
    connection => setEdges(edges => addEdge(connection, edges)),
    [setEdges],
  )

  const [selectedOption, setSelectedOption] = useState<Option | null>(null)

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}

      // Fit the view to the nodes when the component mounts.
      fitView

      // Allow zooming and panning unless the viewer is locked.
      panOnDrag={!locked}
      zoomOnScroll={!locked}
      zoomOnPinch={!locked}
    >
      <Panel position="top-left">
        <Select placeholder="Add a service" options={options} value={null} onChange={option => setSelectedOption(option)} />
      </Panel>
      <Panel position="top-right">
        {selectedOption && selectedOption.value}
      </Panel>
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  )
}
