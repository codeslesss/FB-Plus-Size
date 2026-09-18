import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { BadRequestError } from './errors.js'
import { validatePurchase } from './fiscal.js'

export const MAX_XML_BYTES = 1_000_000

export function parsePurchaseXml(xml: string) {
  if (Buffer.byteLength(xml, 'utf8') > MAX_XML_BYTES) throw new BadRequestError('O XML deve ter no máximo 1 MB')
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new BadRequestError('Declarações de entidades não são permitidas')
  if (XMLValidator.validate(xml) !== true) throw new BadRequestError('XML inválido')
  try {
    const parsed = new XMLParser({ ignoreAttributes: false, parseTagValue: false, removeNSPrefix: true,
      processEntities: false }).parse(xml)
    const info = parsed.nfeProc?.NFe?.infNFe
    const protocol = parsed.nfeProc?.protNFe?.infProt
    if (!info || !protocol || String(protocol.cStat) !== '100') {
      throw new BadRequestError('Importe o XML completo da NF-e com protocolo de autorização (nfeProc)')
    }
    if (String(info.ide?.mod) !== '55' || String(info.ide?.tpNF) !== '1' ||
      String(info.ide?.tpAmb) !== '1' || String(protocol.tpAmb) !== '1') {
      throw new BadRequestError('Use uma NF-e de saída do fornecedor, modelo 55, em ambiente de produção')
    }
    const accessKey = String(info['@_Id'] ?? '').replace(/^NFe/, '')
    if (String(protocol.chNFe) !== accessKey) throw new BadRequestError('Protocolo e nota possuem chaves diferentes')
    const details = Array.isArray(info.det) ? info.det : [info.det]
    return validatePurchase({
      accessKey, supplierCnpj: info.emit?.CNPJ, supplierName: info.emit?.xNome,
      recipientCnpj: info.dest?.CNPJ, number: info.ide?.nNF, series: info.ide?.serie,
      issuedAt: info.ide?.dhEmi, total: Number(info.total?.ICMSTot?.vNF),
      items: details.map((detail: { '@_nItem'?: string; prod?: { cProd?: string; xProd?: string; NCM?: string; qCom?: string; vUnCom?: string; vProd?: string } }) => ({
        itemNumber: Number(detail?.['@_nItem']), supplierCode: detail?.prod?.cProd,
        name: detail?.prod?.xProd, ncm: detail?.prod?.NCM, quantity: Number(detail?.prod?.qCom),
        unitCost: Number(detail?.prod?.vUnCom), subtotal: Number(detail?.prod?.vProd),
      })),
    })
  } catch (error) {
    if (error instanceof BadRequestError) throw error
    throw new BadRequestError('Não foi possível ler os dados desta NF-e')
  }
}
