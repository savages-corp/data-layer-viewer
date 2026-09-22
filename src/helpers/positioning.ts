// I'm keeping all positions and calculations in one file for easier access and modification.
// Mainly because when manually defining layouts, it's easier to derive the positions on instantiation with fixed logic/values which will match the dynamic changes.
const flowHeight = 72

// Horizontal geometry of the Data Layer container. Flows sit at x = 24 inside the container and are 256 wide,
// which leaves room for three 64px stages at x = 0, 96 and 192. The three medallion layer bands are centered on those stages.
export const dataLayerWidth = 300
export const flowOffsetX = 24
export const flowWidth = 256
export const stageWidth = 64
export const stageOffsets = { ingest: 0, modelize: 96, egress: 192 } as const
export const layerBandWidth = 96
export const layerBandTop = 28

export function calculateDataLayerHeight(flowCount: number): number {
  // Calculate the new height based on the number of flows.
  return (flowCount + 1) * flowHeight
}

export function calculateDataLayerY(flowCount: number): number {
  // Calculate the new y position based on the number of flows.
  return -16 - (24 * flowCount - 1)
}

export function calculateWarehouseY(datalayerHeight: number): number {
  // Calculate the new y position based on the data layer height.
  return datalayerHeight - 36
}

export function calculateLayerBandHeight(datalayerHeight: number): number {
  // Layer bands run from below the flow annotations down to the layer labels, which sit above the warehouse node.
  return calculateWarehouseY(datalayerHeight) - layerBandTop - 24
}

export function calculateLayerBandX(stageOffset: number): number {
  // Center a layer band on the stage it belongs to.
  return flowOffsetX + stageOffset + stageWidth / 2 - layerBandWidth / 2
}

export function calculateNextFlowY(flowCount: number): number {
  // Calculate the y position for the next flow.
  return 32 + flowCount * flowHeight
}
