export function paymentIcon(method: string): string {
  switch (method) {
    case 'Pix':
      return 'qr_code_2'
    case 'Dinheiro':
      return 'payments'
    default:
      return 'credit_card'
  }
}
