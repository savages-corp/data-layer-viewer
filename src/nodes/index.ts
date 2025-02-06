import type { BuiltInNode, Node, NodeTypes } from '@xyflow/react'
import { ServiceNodeComponent } from './ServiceNode'

export type DataLayerNode = Node<
  {
    label?: string
  },
  'data-layer'
>

export type ServiceNode = Node<
  {
    label?: string
  },
  'service'
>

export type AppNode = BuiltInNode | DataLayerNode | ServiceNode

export const initialNodes: AppNode[] = [
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
]

export const nodeTypes = {
  service: ServiceNodeComponent,
  // Add any of your custom nodes here!
} satisfies NodeTypes
