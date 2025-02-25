export function getTimedId(id: string) {
  return `${id}-${Date.now()}`
}
