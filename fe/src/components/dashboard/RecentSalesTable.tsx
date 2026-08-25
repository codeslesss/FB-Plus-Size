interface Sale {
  time: string
  product: string
  value: string
  payment: string
  paymentIcon: string
}

const sales: Sale[] = [
  { time: '14:32', product: 'Calça Jeans Plus Size Flare', value: 'R$ 189,90', payment: 'Crédito', paymentIcon: 'credit_card' },
  { time: '13:15', product: 'Blusa Tricot Gola V', value: 'R$ 89,90', payment: 'Pix', paymentIcon: 'qr_code_2' },
  { time: '11:45', product: 'Vestido Estampado Floral', value: 'R$ 210,00', payment: 'Débito', paymentIcon: 'credit_card' },
  { time: '10:20', product: 'Conjunto Moletom Casual', value: 'R$ 250,00', payment: 'Dinheiro', paymentIcon: 'payments' },
]

function RecentSalesTable() {
  return (
    <div className="md:col-span-12 bg-surface-container-high rounded-xl p-md border border-outline-variant mt-sm overflow-x-auto">
      <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Últimas Vendas</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
            <th className="pb-sm font-medium pl-2">Hora</th>
            <th className="pb-sm font-medium">Produto</th>
            <th className="pb-sm font-medium">Valor</th>
            <th className="pb-sm font-medium pr-2">Forma de Pagamento</th>
          </tr>
        </thead>
        <tbody className="text-body-md font-body-md text-on-surface">
          {sales.map((sale, index) => (
            <tr
              key={`${sale.time}-${sale.product}`}
              className={`hover:bg-surface-bright/50 transition-colors ${
                index < sales.length - 1 ? 'border-b border-outline-variant' : ''
              }`}
            >
              <td className="py-sm pl-2">{sale.time}</td>
              <td className="py-sm">{sale.product}</td>
              <td className="py-sm font-bold">{sale.value}</td>
              <td className="py-sm pr-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container text-label-md font-label-md">
                  <span className="material-symbols-outlined text-[16px]">{sale.paymentIcon}</span>
                  {sale.payment}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecentSalesTable
