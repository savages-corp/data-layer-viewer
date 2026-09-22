import type { ContainerNode } from '@/components/Nodes/ContainerNode'
import type { WarehouseNode } from '@/components/Nodes/WarehouseNode'
import { getTimedId } from '@/src/helpers/nodes'

import {
  calculateDataLayerHeight,
  calculateDataLayerY,
  calculateLayerBandHeight,
  calculateLayerBandX,
  calculateWarehouseY,
  dataLayerWidth,
  layerBandTop,
  layerBandWidth,
  stageOffsets,
} from '@/src/helpers/positioning'
import { Layer } from '@/types/stage'

export interface DatalayerPrefab {
  container: ContainerNode
  bronze: ContainerNode
  silver: ContainerNode
  gold: ContainerNode
  warehouse: WarehouseNode
}

/*
  Visual identity of the three medallion layers. Kept here so every layout renders them identically.
*/
export const LayerStyle: Record<Layer, { label: string, color: string, textColor: string }> = {
  [Layer.Bronze]: { label: 'Bronze', color: '#f3e4d6', textColor: '#a5673f' },
  [Layer.Silver]: { label: 'Silver', color: '#e9ecef', textColor: '#6c757d' },
  [Layer.Gold]: { label: 'Gold', color: '#fbf1cf', textColor: '#b8860b' },
}

export function AdjustDatalayerPrefab(datalayer: DatalayerPrefab, flowCount: number): DatalayerPrefab {
  const datalayerHeight = calculateDataLayerHeight(flowCount)

  if (datalayer.container.style)
    datalayer.container.style.height = datalayerHeight

  datalayer.container.position = { x: -48, y: calculateDataLayerY(flowCount) }
  datalayer.warehouse.position = { x: 4, y: calculateWarehouseY(datalayerHeight) }

  for (const band of [datalayer.bronze, datalayer.silver, datalayer.gold]) {
    if (band.style)
      band.style.height = calculateLayerBandHeight(datalayerHeight)
  }

  return datalayer
}

function createLayerBand(layer: Layer, stageOffset: number, datalayerHeight: number, parentId: string): ContainerNode {
  const style = LayerStyle[layer]

  return {
    id: getTimedId(`layer-${layer.toLowerCase()}`),
    type: 'container',
    position: { x: calculateLayerBandX(stageOffset), y: layerBandTop },
    style: { width: layerBandWidth, height: calculateLayerBandHeight(datalayerHeight), zIndex: -2 },
    data: {
      annotation: style.label,
      annotationAlignment: 'center',
      annotationSide: 'bottom',
      annotationSize: 2,
      color: style.color,
      textColor: style.textColor,
      outlineStyle: 'dashed',
    },
    parentId,
    extent: 'parent',
    draggable: false,
    selectable: false,
  }
}

export function CreateDatalayerPrefab(flowCount: number): (DatalayerPrefab) {
  const datalayerHeight = calculateDataLayerHeight(flowCount)
  const container: ContainerNode = {
    id: getTimedId('datalayer'),
    type: 'container',
    position: { x: -48, y: calculateDataLayerY(flowCount) },
    style: { width: dataLayerWidth, height: datalayerHeight },
    zIndex: -3,
    data: {
      annotation: 'Data Layer',
      annotationSize: 2,
      textColor: '#31c787',
      color: '#eaf9f3',
    },
    draggable: false,
    selectable: false,
  }

  // The three medallion layers sit behind the flows and line up with the Ingest, Modelize and Egress stages.
  const bronze = createLayerBand(Layer.Bronze, stageOffsets.ingest, datalayerHeight, container.id)
  const silver = createLayerBand(Layer.Silver, stageOffsets.modelize, datalayerHeight, container.id)
  const gold = createLayerBand(Layer.Gold, stageOffsets.egress, datalayerHeight, container.id)

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

  return { container, bronze, silver, gold, warehouse }
}
