import type { AppNode } from '@/src/App'
import { Stage } from '@/types/stage'
import { getTimedId } from './id'
import { StageNode } from '../components/Nodes/StageNode'

interface DataLayerFlow {
  flow: AppNode
  modelize: AppNode
  egress: AppNode
}

export function CreateFlow(datalayer: AppNode, id: string, x?: number, y?: number): DataLayerFlow {
  const flowId = getTimedId(`flow-${id}`)
  const modelizeId = getTimedId(`modelize-${id}`)
  const egressId = getTimedId(`egress-${id}`)

  const modelize : StageNode = {
      id: modelizeId,
      type: 'stage',
      position: { x: 0, y: 0 },
      data: {
        stage: Stage.Modelize,
        partnerId: egressId,
      },
      parentId: flowId,
      extent: 'parent',
    }

  const egress : StageNode = {
      id: egressId,
      type: 'stage',
      position: { x: 200, y: 0 },
      data: {
        stage: Stage.Egress,
        partnerId: modelizeId,
      },
      parentId: flowId,
      extent: 'parent',
    }

  return {
    flow: {
      id: flowId,
      type: 'container',
      position: { x: x || 0, y: y || 0 },
      style: { width: 256, height: 32, zIndex: -1 },
      data: {
        label: 'Flow',
        labelSize: 1,
      },
      parentId: datalayer.id,
      extent: 'parent',
    },

    modelize,
    egress,
  }
}
