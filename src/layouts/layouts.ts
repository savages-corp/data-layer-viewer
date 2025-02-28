import type { Ti18n } from '@zealsprince/ti18n'

import type { AppEdge, AppNode } from '../App'

import type { DatalayerPrefab } from '../prefabs/datalayer'
import type { FlowPrefab } from '../prefabs/flow'

import { DefaultDefinition } from './default'

export interface LayoutDefinition {
  name: string
  builder: ({ ti18n, mobile }: { ti18n: Ti18n, mobile?: boolean }) => Layout
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
