import type { BuiltInNode, Node, NodeTypes } from '@xyflow/react'
import { DataLayerNodeComponent } from './DataLayerNode'
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
  'data-layer': DataLayerNodeComponent,
  'service': ServiceNodeComponent,
  // Add any of your custom nodes here!
} satisfies NodeTypes
