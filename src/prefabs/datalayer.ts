import type { ContainerNode } from '@/components/Nodes/ContainerNode'
import type { WarehouseNode } from '@/components/Nodes/WarehouseNode'
import { getTimedId } from '@/src/helpers/nodes'

import { calculateDataLayerHeight, calculateDataLayerY, calculateWarehouseY } from '@/src/helpers/positioning'

export interface DatalayerPrefab {
  container: ContainerNode
  warehouse: WarehouseNode
}

export function CreateDatalayerPrefab(flowCount: number) : (DatalayerPrefab) {
  const datalayerHeight = calculateDataLayerHeight(flowCount)
  const container: ContainerNode = {
    id: getTimedId('datalayer'),
    type: 'container',
    position: { x: -48, y: calculateDataLayerY(flowCount) },
    style: { width: 300, height: datalayerHeight },
    zIndex: -2,
    data: {
      annotation: 'Data Layer',
      annotationSize: 2,
      textColor: '#31c787',
      color: '#eaf9f3',
    },
    draggable: false,
    selectable: false,
  }

  const warehouse: WarehouseNode = {
    id: getTimedId('warehouse'),
    position: { x: 4, y: calculateWarehouseY(datalayerHeight) },
    style: { width: 292, height: 32 },
    type: 'warehouse',
    data: {
      label: 'Data Layer Warehouse',
    },
    parentId: container.id,
    extent: 'parent',
    draggable: false,
  }

  return { container, warehouse }
}
