import type { AppEdge, AppNode } from '../App'
import { DefaultDefinition } from './default'

export interface LayoutDefinition {
  name: string
  builder: ({ mobile, language }: { mobile?: boolean, language?: string }) => Layout
}

export interface Layout {
  nodes: AppNode[]
  edges: AppEdge[]
}

export const layouts = {
  default: DefaultDefinition,
}
