import type { ContainerNode } from '@/components/Nodes/ContainerNode'
import type { StageNode } from '@/components/Nodes/StageNode'

import type { AppNode } from '@/src/App'

import { getTimedId } from '@/src/helpers/nodes'
import { flowWidth, stageOffsets } from '@/src/helpers/positioning'
import { Stage } from '@/types/stage'

export interface FlowPrefab {
  container: AppNode
  ingest: AppNode
  modelize: AppNode
  egress: AppNode
}

/*
  A flow moves data through the three medallion layers of the Data Layer:
    Source -> Ingest (Bronze, raw) -> Modelize (Silver, conformed) -> Egress (Gold, curated) -> Destination
*/
export function CreateFlowPrefab(datalayer: AppNode, id: string, x?: number, y?: number): FlowPrefab {
  const container: ContainerNode = {
    id: getTimedId(`flow-container-${id}`),
    type: 'container',
    position: { x: x ?? 0, y: y ?? 0 },
    style: { width: flowWidth, height: 32, zIndex: -1 },
    data: {
      label: 'Flow',
      labelSize: 1,
    },
    parentId: datalayer.id,
    extent: 'parent',
  }

  // The stages are chained to each other, so we need to create their IDs together.
  const ingestId = getTimedId(`flow-ingest-${id}`)
  const modelizeId = getTimedId(`flow-modelize-${id}`)
  const egressId = getTimedId(`flow-egress-${id}`)

  const ingest: StageNode = {
    id: ingestId,
    type: 'stage',
    position: { x: stageOffsets.ingest, y: 0 },
    data: {
      stage: Stage.Ingest,
      partnerId: modelizeId,
    },
    parentId: container.id,
    extent: 'parent',
  }

  const modelize: StageNode = {
    id: modelizeId,
    type: 'stage',
    position: { x: stageOffsets.modelize, y: 0 },
    data: {
      stage: Stage.Modelize,
      partnerId: egressId,
    },
    parentId: container.id,
    extent: 'parent',
  }

  const egress: StageNode = {
    id: egressId,
    type: 'stage',
    position: { x: stageOffsets.egress, y: 0 },
    data: {
      stage: Stage.Egress,
      partnerId: modelizeId,
    },
    parentId: container.id,
    extent: 'parent',
  }

  return {
    container,
    ingest,
    modelize,
    egress,
  }
}
