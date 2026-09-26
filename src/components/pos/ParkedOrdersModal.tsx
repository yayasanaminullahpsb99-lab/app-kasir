import React from 'react';
import { X, Clock, Play, Trash2, ShoppingBag } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatDateTime, formatRupiah } from '../../utils/formatters';

interface ParkedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkedOrdersModal: React.FC<ParkedOrdersModalProps> = ({ isOpen, onClose }) => {
  const { holdOrders, restoreHoldOrder, deleteHoldOrder, cart } = usePOS();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Daftar Tagihan Tersimpan (Hold)</h3>
              <p className="text-[11px] text-slate-400">
                {holdOrders.length} pesanan sedang diparkir sementara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {holdOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 stroke-[1.2] text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-300">Tidak ada tagihan tersimpan</div>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Gunakan tombol &quot;Simpan Tagihan&quot; di keranjang jika pelanggan ingin menambah pesanan nanti.
              </p>
            </div>
          ) : (
            holdOrders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const orderTotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-800 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-200 text-sm">{order.holdTitle}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Disimpan: {formatDateTime(order.createdAt)}
                      </div>
                      {order.customer && (
                        <div className="text-xs text-emerald-400 mt-1">
                          Pelanggan: {order.customer.name} ({order.customer.phone})
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {formatRupiah(orderTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400">{totalItems} item</div>
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {i.quantity}x {i.name}
                        </span>
                        <span className="font-mono">{formatRupiah(i.unitPrice * i.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => deleteHoldOrder(order.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>

                    <button
                      onClick={() => {
                        if (cart.length > 0) {
                          if (
                            !confirm(
                              'Keranjang saat ini masih terisi. Memulihkan pesanan ini akan menggantikan isi keranjang. Lanjutkan?'
                            )
                          ) {
                            return;
                          }
                        }
                        restoreHoldOrder(order.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Lanjutkan Pesanan</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
