import React, { useState } from 'react';
import {
  Coins,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatDateTime, formatRupiah } from '../../utils/formatters';

export const ShiftManagement: React.FC = () => {
  const {
    currentShift,
    shifts,
    cashMovements,
    openShift,
    closeShift,
    addCashMovement,
  } = usePOS();

  // Modals state
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');

  // Open Shift Form
  const [newCashierName, setNewCashierName] = useState('Kasir 1');
  const [newStartingCash, setNewStartingCash] = useState<number>(200000);

  // Cash Movement Form
  const [movementAmount, setMovementAmount] = useState<number>(50000);
  const [movementReason, setMovementReason] = useState('');

  // Close Shift Form
  const [actualCashInput, setActualCashInput] = useState<number>(
    currentShift ? currentShift.expectedCash : 0
  );
  const [closingNotes, setClosingNotes] = useState('');

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim()) return;
    openShift(newStartingCash, newCashierName.trim());
    setIsOpenShiftModalOpen(false);
  };

  const handleCashMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movementAmount <= 0 || !movementReason.trim()) return;
    addCashMovement(movementType, movementAmount, movementReason.trim());
    setIsCashMovementModalOpen(false);
    setMovementReason('');
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeShift(actualCashInput, closingNotes.trim());
    setIsCloseShiftModalOpen(false);
  };

  const discrepancy = currentShift ? actualCashInput - currentShift.expectedCash : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Active Shift Header / Card */}
      {currentShift ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Unlock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Shift Kasir Sedang Aktif</h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Kasir: <span className="font-semibold text-slate-200">{currentShift.cashierName}</span> · Dibuka: {formatDateTime(currentShift.openedAt)}
                </div>
              </div>
            </div>

            {/* Quick Actions for active shift */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMovementType('in');
                  setMovementReason('Modal tambahan / uang receh');
                  setIsCashMovementModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Kas Masuk</span>
              </button>

              <button
                onClick={() => {
                  setMovementType('out');
                  setMovementReason('Beli kebutuhan operasional kasir');
                  setIsCashMovementModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Kas Keluar</span>
              </button>

              <button
                onClick={() => {
                  setActualCashInput(currentShift.expectedCash);
                  setIsCloseShiftModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Tutup Kasir (End Shift)</span>
              </button>
            </div>
          </div>

          {/* Cash Drawer Numbers Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium">Modal Awal Kasir</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                {formatRupiah(currentShift.startingCash)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium">Penjualan Tunai</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {formatRupiah(currentShift.totalCashSales)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium">Kas Masuk (In)</div>
              <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                +{formatRupiah(currentShift.cashIn)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium">Kas Keluar (Out)</div>
              <div className="text-lg font-mono font-bold text-rose-400 mt-1">
                -{formatRupiah(currentShift.cashOut)}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <div className="text-emerald-400 text-xs font-bold">Uang Fisik Seharusnya</div>
              <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                {formatRupiah(currentShift.expectedCash)}
              </div>
            </div>
          </div>

          {/* Non Cash summary badge */}
          <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
            <span>
              Total Penjualan Non-Tunai (QRIS/Debit/E-Wallet):{' '}
              <strong className="text-slate-200 font-mono">
                {formatRupiah(currentShift.totalNonCashSales)}
              </strong>
            </span>
            <span className="text-[11px] text-slate-500">
              (Langsung masuk rekening/settlement bank)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Kasir Sedang Ditutup</h2>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Buka shift kasir terlebih dahulu untuk mulai melayani transaksi penjualan dan mencatat uang modal awal di laci.
            </p>
          </div>
          <button
            onClick={() => setIsOpenShiftModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <Unlock className="w-4 h-4" />
            <span>Buka Shift Kasir Baru</span>
          </button>
        </div>
      )}

      {/* Cash In / Out Log for current shift */}
      {cashMovements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">
            Riwayat Kas Masuk & Kas Keluar (Peti Kas)
          </h3>
          <div className="divide-y divide-slate-800 text-xs">
            {cashMovements.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-1 rounded-md ${
                      m.type === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {m.type === 'in' ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200">{m.reason}</div>
                    <div className="text-[10px] text-slate-400">{formatDateTime(m.timestamp)}</div>
                  </div>
                </div>
                <div
                  className={`font-mono font-bold ${
                    m.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {m.type === 'in' ? '+' : '-'}
                  {formatRupiah(m.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Shifts History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
          Riwayat Shift Terdahulu
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[11px] text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4">Waktu Buka & Tutup</th>
                <th className="py-3 px-4 text-right">Modal Awal</th>
                <th className="py-3 px-4 text-right">Penjualan Tunai</th>
                <th className="py-3 px-4 text-right">Kas Diharapkan</th>
                <th className="py-3 px-4 text-right">Kas Dihitung Fisik</th>
                <th className="py-3 px-4 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada riwayat shift yang ditutup.
                  </td>
                </tr>
              ) : (
                shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-200">{s.cashierName}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      <div>Buka: {formatDateTime(s.openedAt)}</div>
                      <div>Tutup: {s.closedAt ? formatDateTime(s.closedAt) : '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatRupiah(s.startingCash)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {formatRupiah(s.totalCashSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatRupiah(s.expectedCash)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {formatRupiah(s.actualCash || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {s.discrepancy === 0 ? (
                        <span className="text-emerald-400">Pas (Rp 0)</span>
                      ) : (s.discrepancy || 0) > 0 ? (
                        <span className="text-emerald-400">+{formatRupiah(s.discrepancy || 0)} (Lebih)</span>
                      ) : (
                        <span className="text-rose-400">{formatRupiah(s.discrepancy || 0)} (Kurang)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: BUKA SHIFT */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">Buka Shift Kasir Baru</h3>
            <form onSubmit={handleOpenShiftSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nama Kasir Bertugas</label>
                <input
                  type="text"
                  required
                  value={newCashierName}
                  onChange={(e) => setNewCashierName(e.target.value)}
                  placeholder="Contoh: Budi (Kasir 1)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Modal Awal Laci (Kembalian)</label>
                <input
                  type="number"
                  required
                  value={newStartingCash}
                  onChange={(e) => setNewStartingCash(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Buka Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KAS MASUK / KELUAR */}
      {isCashMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">
              Catat {movementType === 'in' ? 'Kas Masuk' : 'Kas Keluar (Peti Kas)'}
            </h3>
            <form onSubmit={handleCashMovementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Contoh: Beli es batu kristal / isi saldo receh"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCashMovementModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TUTUP KASIR (END SHIFT) */}
      {isCloseShiftModalOpen && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">Tutup Kasir & Serah Terima Shift</h3>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Modal Awal:</span>
                <span className="font-mono text-slate-200">{formatRupiah(currentShift.startingCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Penjualan Tunai:</span>
                <span className="font-mono text-emerald-400">+{formatRupiah(currentShift.totalCashSales)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kas Masuk:</span>
                <span className="font-mono text-emerald-400">+{formatRupiah(currentShift.cashIn)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kas Keluar:</span>
                <span className="font-mono text-rose-400">-{formatRupiah(currentShift.cashOut)}</span>
              </div>
              <div className="border-t border-slate-700 pt-1 flex justify-between font-bold text-slate-200">
                <span>Total Seharusnya di Laci:</span>
                <span className="font-mono text-emerald-400">{formatRupiah(currentShift.expectedCash)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Hitungan Uang Fisik Aktual di Laci (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-base font-bold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                  discrepancy === 0
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : discrepancy > 0
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                <span>Selisih:</span>
                <span className="font-mono font-bold">
                  {discrepancy === 0
                    ? 'Pas (Tidak Ada Selisih)'
                    : discrepancy > 0
                    ? `+${formatRupiah(discrepancy)} (Uang Lebih)`
                    : `${formatRupiah(discrepancy)} (Uang Kurang)`}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Catatan Shift (Opsional)</label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Catatan kendala / serah terima..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Sahkan & Tutup Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
