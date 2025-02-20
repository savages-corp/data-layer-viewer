import type { AppEdge, AppNode } from '../App'
import type { ContainerNode } from '../components/Nodes/ContainerNode'
import type { FlowPrefab } from '../components/Prefabs/FlowPrefab'
import { DefaultDefinition } from './default'

export interface LayoutDefinition {
  name: string
  builder: ({ mobile, language }: { mobile?: boolean, language?: string }) => Layout
}

export interface Layout {
  datalayer: ContainerNode
  warehouse: AppNode
  nodes: AppNode[]
  edges: AppEdge[]
  flows: FlowPrefab[]
}

export const layouts = {
  default: DefaultDefinition,
}
