import type { AppEdge, AppNode } from '../App'
import { DefaultDefinition } from './default'

export interface LayoutDefinition {
  name: string
  builder: () => Layout
}

export interface Layout {
  nodes: AppNode[]
  edges: AppEdge[]
}

export const layouts = {
  default: DefaultDefinition,
}
