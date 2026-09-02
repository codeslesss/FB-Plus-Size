export function shortSaleId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}
