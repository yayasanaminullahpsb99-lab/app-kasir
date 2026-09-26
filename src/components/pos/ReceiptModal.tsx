import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types/pos';
import {
  formatDateTime,
  formatRupiah,
  getPaymentMethodLabel,
} from '../../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { settings } = usePOS();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    settings.receiptPaperWidth || '58mm'
  );
  const [copiedWA, setCopiedWA] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppText = () => {
    let text = `*${settings.storeName.toUpperCase()}*\n`;
    text += `${settings.address}\n`;
    text += `Telp: ${settings.phone}\n`;
    text += `--------------------------------\n`;
    text += `No: ${transaction.invoiceNo}\n`;
    text += `Waktu: ${formatDateTime(transaction.date)}\n`;
    text += `Kasir: ${transaction.cashierName}\n`;
    if (transaction.tableNo) text += `Meja: ${transaction.tableNo}\n`;
    if (transaction.customer) text += `Pelanggan: ${transaction.customer.name}\n`;
    text += `--------------------------------\n`;

    transaction.items.forEach((item) => {
      text += `${item.name}\n`;
      text += `  ${item.quantity} x ${formatRupiah(item.unitPrice)} = ${formatRupiah(
        item.unitPrice * item.quantity
      )}\n`;
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        text += `  (${item.selectedVariants.map((v) => v.option).join(', ')})\n`;
      }
    });

    text += `--------------------------------\n`;
    text += `Subtotal: ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.discountAmount > 0) {
      text += `Diskon: -${formatRupiah(transaction.discountAmount)}\n`;
    }
    if (transaction.pointsDiscount && transaction.pointsDiscount > 0) {
      text += `Poin Terpakai: -${formatRupiah(transaction.pointsDiscount)}\n`;
    }
    if (transaction.serviceAmount > 0) {
      text += `Layanan (${transaction.servicePercent}%): ${formatRupiah(
        transaction.serviceAmount
      )}\n`;
    }
    if (transaction.taxAmount > 0) {
      text += `PPN (${transaction.taxPercent}%): ${formatRupiah(transaction.taxAmount)}\n`;
    }
    text += `*TOTAL: ${formatRupiah(transaction.grandTotal)}*\n`;
    text += `Pembayaran: ${getPaymentMethodLabel(transaction.paymentMethod)}\n`;
    if (transaction.cashPaid) {
      text += `Tunai: ${formatRupiah(transaction.cashPaid)}\n`;
      text += `Kembalian: ${formatRupiah(transaction.changeAmount || 0)}\n`;
    }
    text += `--------------------------------\n`;
    text += `${settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}\n`;

    return text;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  const handleOpenWhatsAppWeb = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    const phone = transaction.customer?.phone
      ? transaction.customer.phone.replace(/^0/, '62')
      : '';
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header toolbar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200 text-sm">Struk Pembayaran</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 ml-2">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  paperWidth === '58mm'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  paperWidth === '80mm'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400'
                }`}
              >
                80mm
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt paper view */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center items-start">
          <div
            id="thermal-receipt-print-area"
            className={`bg-white text-black p-5 shadow-2xl font-mono text-xs select-text rounded-xs transition-all ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
            style={{
              fontFamily: '"JetBrains Mono", Courier, monospace',
              lineHeight: 1.35,
            }}
          >
            {/* Header store */}
            <div className="text-center pb-2">
              <div className="font-bold text-sm tracking-wider uppercase">
                {settings.storeName}
              </div>
              <div className="text-[11px] text-gray-700">{settings.address}</div>
              <div className="text-[10px] text-gray-600">Telp: {settings.phone}</div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* Meta */}
            <div className="text-[10.5px] space-y-0.5">
              <div className="flex justify-between">
                <span>No. Transaksi</span>
                <span className="font-bold">{transaction.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{formatDateTime(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.tableNo && (
                <div className="flex justify-between">
                  <span>Meja</span>
                  <span className="font-bold">{transaction.tableNo}</span>
                </div>
              )}
              {transaction.customer && (
                <div className="flex justify-between">
                  <span>Pelanggan</span>
                  <span>{transaction.customer.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tipe Pesanan</span>
                <span className="uppercase">{transaction.orderType.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* Item list */}
            <div className="space-y-2 py-1 text-[11px]">
              {transaction.items.map((item, idx) => {
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    {item.selectedVariants && item.selectedVariants.length > 0 && (
                      <div className="text-[9.5px] text-gray-600 italic">
                        {item.selectedVariants.map((v) => v.option).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[9.5px] text-gray-600 italic">
                        Catatan: {item.notes}
                      </div>
                    )}
                    <div className="flex justify-between text-gray-800">
                      <span>
                        {item.quantity} x {formatRupiah(item.unitPrice)}
                      </span>
                      <span className="font-bold">{formatRupiah(lineTotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2" />

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Diskon {transaction.discountReason ? `(${transaction.discountReason})` : ''}</span>
                  <span>-{formatRupiah(transaction.discountAmount)}</span>
                </div>
              )}

              {transaction.pointsDiscount && transaction.pointsDiscount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Potongan Poin ({transaction.pointsRedeemed} Poin)</span>
                  <span>-{formatRupiah(transaction.pointsDiscount)}</span>
                </div>
              )}

              {transaction.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Layanan ({transaction.servicePercent}%)</span>
                  <span>{formatRupiah(transaction.serviceAmount)}</span>
                </div>
              )}

              {transaction.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({transaction.taxPercent}%)</span>
                  <span>{formatRupiah(transaction.taxAmount)}</span>
                </div>
              )}

              <div className="border-b border-black my-1" />

              <div className="flex justify-between font-bold text-sm pt-0.5">
                <span>TOTAL AKHIR</span>
                <span>{formatRupiah(transaction.grandTotal)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Metode Bayar</span>
                <span className="font-bold uppercase">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </span>
              </div>

              {transaction.paymentMethod === 'cash' && transaction.cashPaid && (
                <>
                  <div className="flex justify-between">
                    <span>Tunai Diterima</span>
                    <span>{formatRupiah(transaction.cashPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian</span>
                    <span>{formatRupiah(transaction.changeAmount || 0)}</span>
                  </div>
                </>
              )}

              {transaction.splitDetails && transaction.splitDetails.length > 0 && (
                <div className="pt-1 text-[10px] text-gray-600">
                  {transaction.splitDetails.map((s, i) => (
                    <div key={i} className="flex justify-between">
                      <span>• {getPaymentMethodLabel(s.method)}</span>
                      <span>{formatRupiah(s.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {transaction.customer && transaction.customer.pointsEarned > 0 && (
                <div className="mt-2 p-1.5 bg-gray-100 rounded text-center text-[10px] text-gray-800">
                  + {transaction.customer.pointsEarned} Poin Loyalitas Didapatkan!
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-3" />

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-gray-600 whitespace-pre-line leading-relaxed">
              {settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}
            </div>

            {/* QR verification snippet */}
            <div className="mt-3 flex flex-col items-center justify-center pt-1 border-t border-dotted border-gray-300">
              <div className="w-14 h-14 bg-gray-100 flex items-center justify-center p-1 border border-gray-300 rounded">
                <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm0 4h4v2h-4v-2zm-4-4h2v2h-2v-2zm2 2h2v4h-2v-4zm2-2h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5 tracking-tighter">
                E-VERIFIED: {transaction.invoiceNo}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Salin teks struk untuk dikirim manual"
            >
              {copiedWA ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedWA ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleOpenWhatsAppWeb}
              className="px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Struk (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Transaksi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
