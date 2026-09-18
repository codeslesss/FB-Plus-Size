import { z } from 'zod'
import { BadRequestError } from './errors.js'

export const FISCAL_PENDING_MESSAGE = 'NFC-e não emitida. É necessário configurar um emissor habilitado para Santa Catarina.'

export function fiscalIssuer() {
  return {
    cnpj: (process.env.FISCAL_CNPJ ?? '97240725000199').replace(/\D/g, ''),
    ie: process.env.FISCAL_IE ?? '264348370',
    name: 'FB PLUS SIZE COMERCIO DE VESTUARIO LTDA',
    uf: 'SC',
    emissionAvailable: false,
    message: FISCAL_PENDING_MESSAGE,
  }
}

export function validCnpj(value: string) {
  if (!/^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false
  for (const length of [12, 13]) {
    let weight = length - 7
    let sum = 0
    for (let index = 0; index < length; index++) {
      sum += Number(value[index]) * weight
      if (--weight < 2) weight = 9
    }
    const remainder = sum % 11
    if (Number(value[length]) !== (remainder < 2 ? 0 : 11 - remainder)) return false
  }
  return true
}

export function validAccessKey(value: string) {
  if (!/^\d{44}$/.test(value)) return false
  let sum = 0
  let weight = 2
  for (let index = 42; index >= 0; index--) {
    sum += Number(value[index]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  const digit = 11 - sum % 11
  return Number(value[43]) === (digit >= 10 ? 0 : digit)
}

export const cnpjSchema = z.string().transform((value) => value.replace(/\D/g, ''))
  .refine(validCnpj, 'CNPJ inválido')

export const purchaseItemSchema = z.object({
  itemNumber: z.number().int().positive(),
  supplierCode: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  ncm: z.string().regex(/^\d{8}$/).optional(),
  quantity: z.number().positive().max(1_000_000),
  unitCost: z.number().nonnegative().max(1_000_000),
  subtotal: z.number().nonnegative().max(1_000_000_000),
})

export const purchaseSchema = z.object({
  accessKey: z.string().refine(validAccessKey, 'Chave de acesso inválida').optional(),
  supplierCnpj: cnpjSchema,
  supplierName: z.string().trim().min(1).max(200),
  recipientCnpj: cnpjSchema,
  number: z.string().regex(/^\d{1,9}$/).transform((value) => String(Number(value))),
  series: z.string().regex(/^\d{1,3}$/).transform((value) => String(Number(value))),
  issuedAt: z.string().datetime({ offset: true }),
  total: z.number().nonnegative().max(1_000_000_000),
  items: z.array(purchaseItemSchema).min(1).max(500),
}).superRefine((invoice, ctx) => {
  if (new Set(invoice.items.map((item) => item.itemNumber)).size !== invoice.items.length) {
    ctx.addIssue({ code: 'custom', message: 'Número de item repetido na nota' })
  }
  if (invoice.accessKey && (invoice.accessKey.slice(6, 20) !== invoice.supplierCnpj ||
    invoice.accessKey.slice(20, 22) !== '55' ||
    Number(invoice.accessKey.slice(22, 25)) !== Number(invoice.series) ||
    Number(invoice.accessKey.slice(25, 34)) !== Number(invoice.number))) {
    ctx.addIssue({ code: 'custom', message: 'Chave de acesso não corresponde à nota de compra' })
  }
})

export type PurchaseInput = z.infer<typeof purchaseSchema>

export function validatePurchase(value: unknown): PurchaseInput {
  const result = purchaseSchema.safeParse(value)
  if (!result.success) throw new BadRequestError(result.error.issues.map((issue) => issue.message).join('; '))
  if (result.data.recipientCnpj !== fiscalIssuer().cnpj) {
    throw new BadRequestError('A nota de compra deve estar destinada ao CNPJ da loja')
  }
  return result.data
}
