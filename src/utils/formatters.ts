/**
 * Formatting and utility helpers for POS system
 */

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount || 0);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatNumber(amount: number): string {
  const rounded = Math.round(amount || 0);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

let invoiceCounter = 1045;
export function generateInvoiceNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  invoiceCounter += 1;
  const seq = String(invoiceCounter).padStart(4, '0');
  return `INV-${dateStr}-${seq}`;
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'cash':
      return 'Tunai (Cash)';
    case 'qris':
      return 'QRIS';
    case 'debit':
      return 'Kartu Debit';
    case 'credit':
      return 'Kartu Kredit';
    case 'transfer':
      return 'Transfer Bank';
    case 'ewallet':
      return 'E-Wallet';
    case 'split':
      return 'Split Bill';
    default:
      return method;
  }
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
