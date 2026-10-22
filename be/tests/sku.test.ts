import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextSku, skuPrefix } from '../src/lib/sku.js'

test('prefixo do SKU vem da categoria, sem acentos', () => {
  assert.equal(skuPrefix('Vestidos'), 'VES')
  assert.equal(skuPrefix('Calças Jeans'), 'CAL')
  assert.equal(skuPrefix('  blusas'), 'BLU')
  assert.equal(skuPrefix('12'), 'PRD')
})

test('SKU segue a maior numeração existente do prefixo', () => {
  assert.equal(nextSku('VES', []), 'VES-0001')
  assert.equal(nextSku('VES', ['VES-0001', 'VES-0007', 'VES-ANTIGO', 'VESX-0099']), 'VES-0008')
  assert.equal(nextSku('VES', ['VES-9999']), 'VES-10000')
})
