import type { TranslationKey } from '@/types/i18n'

import type { Ti18n } from '@zealsprince/ti18n'

import type { AppEdge, AppNode } from '../App'
import type { DatalayerPrefab } from '../prefabs/datalayer'

import type { FlowPrefab } from '../prefabs/flow'
import { DefaultDefinition } from './default'
import { EmptyDefinition } from './empty'

export interface LayoutDefinition {
  name: ({ ti18n }: { ti18n: Ti18n<TranslationKey> }) => string
  builder: ({ ti18n, mobile }: { ti18n: Ti18n<TranslationKey>, mobile?: boolean }) => Layout
}

export interface Layout {
  datalayer: DatalayerPrefab
  nodes: AppNode[]
  edges: AppEdge[]
  flows: FlowPrefab[]
}

export const layouts: Record<string, LayoutDefinition> = {
  default: DefaultDefinition,
  empty: EmptyDefinition,
} satisfies Record<string, LayoutDefinition>
