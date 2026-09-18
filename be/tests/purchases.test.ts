import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import express from 'express'
process.env.JWT_SECRET = 'test-only-secret-not-for-production'
const { createApp } = await import('../src/app.js')
import purchases from '../src/routes/purchases.js'
import { prisma } from '../src/lib/prisma.js'
import { HttpError } from '../src/lib/errors.js'
import { parsePurchaseXml } from '../src/lib/purchaseXml.js'
import { validatePurchase, validCnpj } from '../src/lib/fiscal.js'
const draft = { supplierCnpj: '11222333000181', supplierName: 'Fornecedor', recipientCnpj: '97240725000199', number: '001', series: '001', issuedAt: '2026-09-18T12:00:00-03:00', total: 100, items: [{ itemNumber: 1, supplierCode: 'CX1', name: 'Caixa de blusas', quantity: 2, unitCost: 50, subtotal: 100 }] }
const variantId = 'aaaaaaaaaaaaaaaaaaaaaaaa'
const app = express(); app.use('/protected', createApp()); app.use(express.json()); app.use((req, _res, next) => { req.user = { id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Teste', email: 'teste@example.com' }; next() }); app.use('/purchases', purchases)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(err instanceof HttpError ? err.status : 500).json({ error: err.message }))
const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve))
const address = server.address() as { port: number }; after(() => new Promise<void>(resolve => server.close(() => resolve())))
async function post(body: unknown) { const response = await fetch(`http://127.0.0.1:${address.port}/purchases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: response.status, body: await response.json() } }
function database(active = true) {
  let stock = 0; let cost = 0; let saved = false
  const tx = { productVariant: { findMany: async () => [{ id: variantId, product: { active } }], update: async ({ data }: any) => { stock += data.stockQuantity.increment; cost = data.lastPurchaseUnitCost } }, purchaseInvoice: { create: async ({ data }: any) => { if (saved) throw { code: 'P2002' }; saved = true; return { id: 'invoice', ...data } } } }
  prisma.$transaction = (async (callback: any) => callback(tx)) as typeof prisma.$transaction
  return { stock: () => stock, cost: () => cost }
}
const payload = () => ({ invoice: draft, mappings: [{ itemNumber: 1, productVariantId: variantId, stockQuantity: 20 }] })
test('valida CNPJ e normaliza número/série para impedir duplicidade por zeros', () => { assert.ok(validCnpj(draft.supplierCnpj)); assert.equal(validCnpj('11111111111111'), false); assert.equal(validatePurchase(draft).number, '1'); assert.equal(validatePurchase(draft).series, '1') })
test('não aceita notas destinadas a outro CNPJ', () => assert.throws(() => validatePurchase({ ...draft, recipientCnpj: draft.supplierCnpj }), /CNPJ da loja/))
test('XML malformado, entidades e falta de protocolo são rejeitados', () => { for (const xml of ['<broken>', '<!DOCTYPE test><test/>', '<NFe><infNFe/></NFe>']) assert.throws(() => parsePurchaseXml(xml)) })
test('converte caixas em unidades explicitamente e impede repetir entrada', async () => { const db = database(); assert.equal((await post(payload())).status, 201); assert.equal(db.stock(), 20); assert.equal(db.cost(), 5); assert.equal((await post(payload())).status, 400); assert.equal(db.stock(), 20) })
test('mapeamento ausente, duplicado ou quantidade fracionada não altera estoque', async () => { const db = database(); for (const mappings of [[], [...payload().mappings, ...payload().mappings], [{ ...payload().mappings[0], stockQuantity: 1.5 }]]) assert.equal((await post({ invoice: draft, mappings })).status, 400); assert.equal(db.stock(), 0) })
test('produto inativo não recebe entrada', async () => { const db = database(false); assert.equal((await post(payload())).status, 400); assert.equal(db.stock(), 0) })
test('subtotal manual inconsistente é rejeitado', async () => { const db = database(); assert.equal((await post({ ...payload(), invoice: { ...draft, items: [{ ...draft.items[0], subtotal: 1 }] } })).status, 400); assert.equal(db.stock(), 0) })

function xmlFixture() {
  const base = '42' + '2609' + draft.supplierCnpj + '55' + '001' + '000000001' + '1' + '00000001'
  let sum = 0; let weight = 2
  for (let i = 42; i >= 0; i--) { sum += Number(base[i]) * weight; weight = weight === 9 ? 2 : weight + 1 }
  const digit = 11 - sum % 11; const key = base + (digit >= 10 ? 0 : digit)
  return `<nfeProc><NFe><infNFe Id="NFe${key}"><ide><mod>55</mod><tpNF>1</tpNF><tpAmb>1</tpAmb><nNF>1</nNF><serie>1</serie><dhEmi>${draft.issuedAt}</dhEmi></ide><emit><CNPJ>${draft.supplierCnpj}</CNPJ><xNome>Fornecedor</xNome></emit><dest><CNPJ>${draft.recipientCnpj}</CNPJ></dest><det nItem="1"><prod><cProd>CX1</cProd><xProd>Caixa</xProd><NCM>61091000</NCM><qCom>2</qCom><vUnCom>50</vUnCom><vProd>100</vProd></prod></det><total><ICMSTot><vNF>100</vNF></ICMSTot></total></infNFe></NFe><protNFe><infProt><tpAmb>1</tpAmb><cStat>100</cStat><chNFe>${key}</chNFe></infProt></protNFe></nfeProc>`
}
test('importa XML completo e rejeita protocolo divergente e homologação', () => {
  const xml = xmlFixture(); const parsed = parsePurchaseXml(xml)
  assert.equal(parsed.items[0].quantity, 2); assert.equal(parsed.total, 100)
  assert.throws(() => parsePurchaseXml(xml.replace('<chNFe>', '<chNFe>9')), /chaves diferentes/)
  assert.throws(() => parsePurchaseXml(xml.replaceAll('<tpAmb>1', '<tpAmb>2')), /produção/)
})

test('rotas de notas exigem sessão no aplicativo real', async () => {
  for (const path of ['/api/purchases', '/api/fiscal/documents', '/api/fiscal/settings']) {
    const response = await fetch(`http://127.0.0.1:${address.port}/protected${path}`)
    assert.equal(response.status, 401)
  }
})
