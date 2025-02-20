import type { AppNode } from '@/src/App'
import type { StageNode } from '@/src/components/Nodes/StageNode'
import type { ContainerNode } from '../Nodes/ContainerNode'

import { getTimedId } from '@/src/helpers/id'
import { Stage } from '@/types/stage'

export interface FlowPrefab {
  container: AppNode
  modelize: AppNode
  egress: AppNode
}

export function CreateFlowPrefab(datalayer: AppNode, id: string, x?: number, y?: number): FlowPrefab {
  const container: ContainerNode = {
    id: getTimedId(`flow-container-${id}`),
    type: 'container',
    position: { x: x || 0, y: y || 0 },
    style: { width: 256, height: 32, zIndex: -1 },
    data: {
      label: 'Flow',
      labelSize: 1,
    },
    parentId: datalayer.id,
    extent: 'parent',
  }

  // Because the modelize and egress stages are connected to each other, we need to create them together
  const modelizeId = getTimedId(`flow-modelize-${id}`)
  const egressId = getTimedId(`flow-egress-${id}`)

  const modelize: StageNode = {
    id: modelizeId,
    type: 'stage',
    position: { x: 0, y: 0 },
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
    position: { x: 200, y: 0 },
    data: {
      stage: Stage.Egress,
      partnerId: modelizeId,
    },
    parentId: container.id,
    extent: 'parent',
  }

  return {
    container,
    modelize,
    egress,
  }
}
