import type { Layout, LayoutDefinition } from './layouts'

import { calculateNextFlowY } from '../helpers/positioning'
import { CreateDatalayerPrefab } from '../prefabs/datalayer'
import { CreateFlowPrefab } from '../prefabs/flow'

function builder() : (Layout) {
  const datalayer = CreateDatalayerPrefab(2)
  const flow = CreateFlowPrefab(datalayer.container, '2', 24, calculateNextFlowY(0))
  const layout: Layout = {
    datalayer,
    nodes: [
      ...Object.values(datalayer),
      ...Object.values(flow),
    ],
    edges: [],
    flows: [flow],
  } satisfies Layout

  return layout
}

export const EmptyDefinition: LayoutDefinition = {
  name: '(Empty)',
  builder,

} satisfies LayoutDefinition
