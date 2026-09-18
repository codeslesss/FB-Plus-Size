import { useState } from 'react'
import { fetchFiscalDocuments, fetchFiscalDocument } from '../api/invoices'
import { useApi } from '../hooks/useApi'
export default function FiscalDocuments() {
  const documents = useApi(fetchFiscalDocuments)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string>()
  async function download(id: string) {
    setError(''); setDownloading(id)
    try {
      const document = await fetchFiscalDocument(id)
      const url = URL.createObjectURL(new Blob([JSON.stringify({ aviso: 'REGISTRO INTERNO — SEM VALOR FISCAL. NFC-e não emitida.', ...document }, null, 2)], { type: 'application/json' }))
      const link = documentLink(url, id); link.click(); link.remove(); URL.revokeObjectURL(url)
    } catch (err) { setError(err instanceof Error ? err.message : 'Erro ao baixar registro') }
    finally { setDownloading(undefined) }
  }
  return <div className="p-6 space-y-6">
    <h1 className="text-3xl font-bold">Notas de saída</h1>
    <p role="status" className="border border-orange-400 bg-orange-50 text-orange-950 rounded-xl p-5">Emissão fiscal pendente de configuração. Cada nova venda gera um registro interno de saída, sem valor fiscal. Nenhuma NFC-e é autorizada nesta etapa.</p>
    <p>Registros das últimas 100 vendas realizadas após a ativação deste recurso.</p>
    {error && <p role="alert">{error}</p>}
    {documents.loading ? <p>Carregando…</p> : documents.error ? <p role="alert">{documents.error} <button onClick={documents.reload}>Tentar novamente</button></p> : !documents.data?.length ? <p>Nenhuma saída registrada.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Data</th><th>Cliente</th><th>Total</th><th>Situação</th><th>Registro</th></tr></thead><tbody>{documents.data.map(document => <tr key={document.id} className="border-b"><td className="p-3">{new Date(document.createdAt).toLocaleString('pt-BR')}</td><td>{document.sale?.customerName ?? '—'}</td><td>{Number(document.sale?.total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td>NFC-e não emitida</td><td><button disabled={!!downloading} onClick={() => void download(document.id)} className="underline p-3">{downloading === document.id ? 'Baixando…' : 'Baixar registro interno'}</button></td></tr>)}</tbody></table></div>}
  </div>
}
function documentLink(url: string, id: string) {
  const link = window.document.createElement('a'); link.href = url; link.download = `saida-interna-${id}.json`; window.document.body.append(link); return link
}
