import type { BuiltInEdge, Edge, EdgeTypes } from '@xyflow/react'
import { DataEdgeComponent } from './DataEdge'

export type DataEdge = Edge<
  {
    state?: boolean
    shape?: 'circle' | 'square' | 'triangle'
  },
  'data-edge'
>

export type AppEdge = BuiltInEdge | DataEdge

export const edgeTypes = {
  data: DataEdgeComponent,
} satisfies EdgeTypes
