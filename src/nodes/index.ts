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

export const nodeTypes = {
  service: ServiceNodeComponent,
  // Add any of your custom nodes here!
} satisfies NodeTypes
