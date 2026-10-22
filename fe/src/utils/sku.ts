/** Mirrors be/src/lib/sku.ts so the form can preview the generated prefix. */
export function skuPrefix(category: string): string {
  const letters = category
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
  return letters.length >= 3 ? letters.slice(0, 3) : 'PRD'
}
