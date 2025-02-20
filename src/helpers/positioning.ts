
// I'm keeping all positions and calculations in one file for easier access and modification.
// Mainly because when manually defining layouts, it's easier to derive the positions on instantiation with fixed logic/values which will match the dynamic changes.
const flowHeight = 72

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

export function calculateNextFlowY(flowCount: number): number {
  // Calculate the y position for the next flow.
  return 32 + flowCount * flowHeight
}
