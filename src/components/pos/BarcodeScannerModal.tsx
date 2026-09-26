import React, { useState } from 'react';
import { X, Scan, Search, Barcode, Check } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah } from '../../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const { products, addToCart } = usePOS();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const matched = products.find(
      (p) => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matched) {
      if (matched.stock <= 0) {
        setMessage({ text: `${matched.name} stok habis!`, type: 'error' });
        return;
      }
      addToCart(matched, 1);
      setMessage({ text: `Berhasil menambahkan: ${matched.name}`, type: 'success' });
      setBarcodeInput('');
    } else {
      setMessage({ text: `Barcode "${cleanCode}" tidak ditemukan!`, type: 'error' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanCode(barcodeInput);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Simulasi Barcode Scanner Kasir</h3>
              <p className="text-[11px] text-slate-400">Scan atau ketik kode barcode/SKU barang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder animation */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center">
          <div className="relative w-64 h-32 rounded-xl border-2 border-dashed border-emerald-500/60 bg-emerald-950/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-[bounce_2s_infinite]" />
            <div className="flex flex-col items-center gap-1.5 text-slate-400">
              <Barcode className="w-12 h-12 opacity-40 text-emerald-400" />
              <span className="text-[11px] font-mono tracking-wider text-slate-400">ARAHKAN BARCODE KE SINI</span>
            </div>
          </div>

          {/* Input field */}
          <div className="w-full mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Scan / ketik barcode (tekan Enter)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => handleScanCode(barcodeInput)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
            >
              Scan
            </button>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`w-full mt-2.5 p-2 rounded-lg text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/50 text-rose-300 border border-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <X className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Quick Click Registered Barcodes */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Klik Cepat Produk Terdaftar:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {products.slice(0, 8).map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleScanCode(prod.barcode)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-left transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-200 truncate">{prod.name}</div>
                  <div className="text-[10px] font-mono text-emerald-400">{prod.barcode}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-medium text-slate-300">
                    {formatRupiah(prod.sellPrice)}
                  </div>
                  <div className="text-[10px] text-slate-400">Stok: {prod.stock}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
