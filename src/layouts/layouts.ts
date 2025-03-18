import type { TranslationKey } from '@/types/i18n'
import type { Ti18n } from '@zealsprince/ti18n'
import type { AppEdge, AppNode } from '../App'
import type { DatalayerPrefab } from '../prefabs/datalayer'
import type { FlowPrefab } from '../prefabs/flow'

import { AggregatorDefinition } from './aggregator'
import { AutomationDefinition } from './automation'
import { CrmDefinition } from './crm'
import { DefaultDefinition } from './default'
import { EmptyDefinition } from './empty'
import { ExternalDefinition } from './external'
import { FinanceDefinition } from './finance'
import { PortfolioDefinition } from './portfolio'

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
  crm: CrmDefinition,
  external: ExternalDefinition,
  finance: FinanceDefinition,
  portfolio: PortfolioDefinition,
  aggregator: AggregatorDefinition,
  automation: AutomationDefinition,
  empty: EmptyDefinition,
} satisfies Record<string, LayoutDefinition>
