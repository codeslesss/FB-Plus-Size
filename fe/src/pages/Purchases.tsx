import { useState, type FormEvent } from 'react'
import { fetchProducts } from '../api/products'
import { fetchPurchases, fetchFiscalSettings, previewPurchase, registerPurchase, type PurchaseDraft, type Mapping } from '../api/invoices'
import { useApi } from '../hooks/useApi'

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const inputClass = 'border border-outline-variant rounded-lg p-3 w-full bg-surface'
const buttonClass = 'rounded-lg bg-primary-container text-white px-4 py-3 disabled:opacity-50'
const emptyItem = () => ({ itemNumber: 1, supplierCode: '', name: '', quantity: 1, unitCost: 0, subtotal: 0 })
function emptyDraft(): PurchaseDraft {
  return { supplierCnpj: '', supplierName: '', recipientCnpj: '', number: '', series: '1', issuedAt: new Date().toISOString(), total: 0, items: [emptyItem()] }
}
export default function Purchases() {
  const products = useApi(() => fetchProducts({ active: true }))
  const history = useApi(fetchPurchases)
  const settings = useApi(fetchFiscalSettings)
  const [draft, setDraft] = useState<PurchaseDraft>(emptyDraft)
  const [xml, setXml] = useState<string>()
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const variants = (products.data ?? []).flatMap(product => product.variants.map(variant => ({ ...variant, label: `${product.name} · ${variant.size} · ${variant.color} (${product.sku})` })))
  function mapItem(itemNumber: number, patch: Partial<Mapping>) {
    setMappings(current => {
      const existing = current.find(item => item.itemNumber === itemNumber) ?? { itemNumber, productVariantId: '', stockQuantity: 1 }
      return [...current.filter(item => item.itemNumber !== itemNumber), { ...existing, ...patch }]
    })
  }
  async function importFile(file?: File) {
    if (!file) return
    setMessage(''); setBusy(true)
    try {
      if (file.size > 1_000_000) throw new Error('XML deve ter no máximo 1 MB')
      const content = await file.text()
      const parsed = await previewPurchase(content)
      setDraft(parsed); setXml(content); setMappings([])
      setMessage('XML carregado. Vincule os itens aos produtos e confira as unidades recebidas.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao importar XML') }
    finally { setBusy(false) }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await registerPurchase({ ...draft, recipientCnpj: settings.data?.cnpj ?? draft.recipientCnpj }, mappings, xml)
      setDraft(emptyDraft()); setXml(undefined); setMappings([]); history.reload(); products.reload()
      setMessage('Nota cadastrada e estoque atualizado.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao cadastrar nota') }
    finally { setBusy(false) }
  }
  function changeItem(index: number, field: 'supplierCode' | 'name' | 'quantity' | 'unitCost', value: string) {
    setDraft(current => ({ ...current, items: current.items.map((item, i) => {
      if (i !== index) return item
      const next = { ...item, [field]: field === 'quantity' || field === 'unitCost' ? Number(value) : value }
      return { ...next, subtotal: Math.round(next.quantity * next.unitCost * 100) / 100 }
    }) }))
  }
  return <div className="p-6 space-y-6">
    <h1 className="text-3xl font-bold">Notas de entrada</h1>
    <p>Cadastre a nota de compra ou importe o XML da NF-e. A confirmação adiciona as unidades recebidas ao estoque.</p>
    <p className="text-on-surface-variant">Cadastre os produtos antes em Produtos, com estoque inicial zero para evitar entrada duplicada.</p>
    <div className="flex gap-3 flex-wrap">
      <label className={buttonClass}>Importar XML<input aria-label="Importar XML da NF-e" type="file" accept=".xml,text/xml,application/xml" disabled={busy} className="block mt-2" onChange={event => { void importFile(event.target.files?.[0]); event.target.value = '' }} /></label>
      <button type="button" disabled={busy} className={buttonClass} onClick={() => { setDraft(emptyDraft()); setXml(undefined); setMappings([]); setMessage('') }}>Novo cadastro manual</button>
    </div>
    {message && <p role="status" className="p-4 border rounded-lg">{message}</p>}
    {(products.error || settings.error) && <p role="alert">{products.error || settings.error} <button onClick={() => { products.reload(); settings.reload() }}>Tentar novamente</button></p>}
    <form onSubmit={save} className="space-y-4 border border-outline-variant rounded-xl p-5 bg-surface">
      <fieldset disabled={busy} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {(['supplierCnpj', 'supplierName', 'number', 'series'] as const).map((field, index) => <label key={field}>{['CNPJ do fornecedor', 'Fornecedor', 'Número da nota', 'Série'][index]}<input required readOnly={!!xml} className={inputClass} value={draft[field]} onChange={event => setDraft({ ...draft, [field]: event.target.value })} /></label>)}
        <label>Data de emissão<input required readOnly={!!xml} className={inputClass} type="date" value={draft.issuedAt.slice(0, 10)} onChange={event => { if (event.target.value) setDraft({ ...draft, issuedAt: `${event.target.value}T12:00:00-03:00` }) }} /></label>
        <label>Total da nota (incluindo frete e tributos)<input required readOnly={!!xml} className={inputClass} type="number" step="0.01" min="0" value={draft.total} onChange={event => setDraft({ ...draft, total: Number(event.target.value) })} /></label>
      </div>
      {draft.accessKey && <p className="break-all">Chave: {draft.accessKey}</p>}
      {draft.items.map((item, index) => <div key={item.itemNumber} className="border border-outline-variant rounded-lg p-4 space-y-3">
        <h2 className="font-bold">Item {item.itemNumber}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label>Código do fornecedor<input required readOnly={!!xml} className={inputClass} value={item.supplierCode} onChange={event => changeItem(index, 'supplierCode', event.target.value)} /></label>
          <label>Descrição na nota<input required readOnly={!!xml} className={inputClass} value={item.name} onChange={event => changeItem(index, 'name', event.target.value)} /></label>
          <label>Quantidade na nota<input required readOnly={!!xml} className={inputClass} type="number" min="0.0001" step="any" value={item.quantity} onChange={event => changeItem(index, 'quantity', event.target.value)} /></label>
          <label>Custo unitário na nota<input required readOnly={!!xml} className={inputClass} type="number" min="0" step="any" value={item.unitCost} onChange={event => changeItem(index, 'unitCost', event.target.value)} /></label>
          <label>Produto / tamanho / cor<select required className={inputClass} value={mappings.find(mapping => mapping.itemNumber === item.itemNumber)?.productVariantId ?? ''} onChange={event => mapItem(item.itemNumber, { productVariantId: event.target.value })}><option value="">Selecione</option>{variants.map(variant => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label>
          <label>Unidades recebidas para estoque<input required className={inputClass} type="number" min="1" max="1000000" step="1" value={mappings.find(mapping => mapping.itemNumber === item.itemNumber)?.stockQuantity ?? ''} onChange={event => mapItem(item.itemNumber, { stockQuantity: Number(event.target.value) })} /></label>
        </div>
        <p>Subtotal dos produtos: {money(item.subtotal)}. Confira a conversão de caixas/pacotes para unidades.</p>
        {!xml && draft.items.length > 1 && <button type="button" onClick={() => { setDraft({ ...draft, items: draft.items.filter((_, i) => i !== index) }); setMappings(mappings.filter(mapping => mapping.itemNumber !== item.itemNumber)) }}>Remover item</button>}
      </div>)}
      {!xml && <button type="button" className={buttonClass} onClick={() => setDraft({ ...draft, items: [...draft.items, { ...emptyItem(), itemNumber: Math.max(...draft.items.map(item => item.itemNumber)) + 1 }] })}>Adicionar item</button>}
      <p>O custo recebido usa o subtotal dos produtos dividido pelas unidades recebidas; frete e tributos não são rateados.</p>
      <button className={buttonClass} disabled={busy || !settings.data || !variants.length}>{busy ? 'Processando…' : 'Confirmar nota e entrada no estoque'}</button>
      </fieldset>
    </form>
    <h2 className="text-xl font-bold">Notas cadastradas (últimas 100)</h2>
    {history.loading ? <p>Carregando…</p> : history.error ? <p role="alert">{history.error} <button onClick={history.reload}>Tentar novamente</button></p> : !history.data?.length ? <p>Nenhuma nota cadastrada.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Nota / série</th><th>Fornecedor</th><th>Emissão</th><th>Total</th><th>Origem</th></tr></thead><tbody>{history.data.map(note => <tr key={note.id} className="border-b"><td className="p-3">{note.number} / {note.series}</td><td>{note.supplierName}</td><td>{new Date(note.issuedAt).toLocaleDateString('pt-BR')}</td><td>{money(note.total)}</td><td>{note.source === 'XML' ? 'XML' : 'Manual'}</td></tr>)}</tbody></table></div>}
  </div>
}
