import type { AppEdge, AppNode } from '../App'

import type { DatalayerPrefab } from '../prefabs/datalayer'
import type { FlowPrefab } from '../prefabs/flow'

import { DefaultDefinition } from './default'

export interface LayoutDefinition {
  name: string
  builder: ({ mobile, language }: { mobile?: boolean, language?: string }) => Layout
}

export interface Layout {
  datalayer: DatalayerPrefab
  nodes: AppNode[]
  edges: AppEdge[]
  flows: FlowPrefab[]
}

export const layouts = {
  default: DefaultDefinition,
}
