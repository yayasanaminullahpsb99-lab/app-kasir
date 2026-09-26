import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Printer,
  Ban,
  X,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types/pos';
import {
  formatDateTime,
  formatRupiah,
  getPaymentMethodLabel,
  downloadCSV,
} from '../../utils/formatters';

export const TransactionHistory: React.FC = () => {
  const { transactions, voidTransaction, openReceiptModal } = usePOS();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Void confirmation dialog
  const [voidTargetTx, setVoidTargetTx] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState('Pelanggan salah pesan / retur');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 3600 * 1000;

    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime();

      // Date filtering
      if (dateFilter === 'today') {
        if (txTime < startOfToday) return false;
      } else if (dateFilter === 'yesterday') {
        if (txTime < startOfToday - oneDayMs || txTime >= startOfToday) return false;
      } else if (dateFilter === '7days') {
        if (txTime < startOfToday - 7 * oneDayMs) return false;
      } else if (dateFilter === '30days') {
        if (txTime < startOfToday - 30 * oneDayMs) return false;
      }

      // Payment method filtering
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) {
        return false;
      }

      // Status filtering
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchInvoice = tx.invoiceNo.toLowerCase().includes(q);
        const matchCustomer = tx.customer?.name.toLowerCase().includes(q) || false;
        const matchCashier = tx.cashierName.toLowerCase().includes(q);
        return matchInvoice || matchCustomer || matchCashier;
      }

      return true;
    });
  }, [transactions, dateFilter, methodFilter, statusFilter, searchQuery]);

  const handleConfirmVoid = () => {
    if (!voidTargetTx) return;
    voidTransaction(voidTargetTx.id, voidReason);
    setVoidTargetTx(null);
    if (selectedTx && selectedTx.id === voidTargetTx.id) {
      setSelectedTx(null);
    }
  };

  const handleExportCSV = () => {
    let csv = 'No Invoice,Tanggal,Kasir,Tipe Pesanan,Pelanggan,Metode Bayar,Total HPP,Grand Total,Laba Bersih,Status\n';
    filteredTransactions.forEach((tx) => {
      csv += `"${tx.invoiceNo}","${formatDateTime(tx.date)}","${tx.cashierName}","${tx.orderType}","${
        tx.customer?.name || '-'
      }","${tx.paymentMethod}",${tx.totalCost},${tx.grandTotal},${tx.netProfit},"${tx.status}"\n`;
    });
    downloadCSV(`riwayat_transaksi_${Date.now()}.csv`, csv);
  };

  const totalFilteredSales = filteredTransactions
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.grandTotal, 0);

  const totalFilteredProfit = filteredTransactions
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.netProfit, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Transaksi Terfilter</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {filteredTransactions.length} Transaksi
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {filteredTransactions.filter((t) => t.status === 'completed').length} Berhasil ·{' '}
            {filteredTransactions.filter((t) => t.status === 'voided').length} Batal
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Omset Penjualan</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatRupiah(totalFilteredSales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hanya transaksi berstatus selesai</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Estimasi Laba Bersih</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {formatRupiah(totalFilteredProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Setelah dikurangi modal HPP</div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. invoice, kasir, atau pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date */}
          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value as 'today' | 'yesterday' | '7days' | '30days' | 'all')
            }
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="yesterday">Kemarin</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
          </select>

          {/* Payment Method */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Pembayaran</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS</option>
            <option value="debit">Kartu Debit</option>
            <option value="ewallet">E-Wallet</option>
            <option value="split">Split Bill</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="voided">Dibatalkan (Void)</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[11px] text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. Invoice & Waktu</th>
                <th className="py-3.5 px-4">Kasir & Tipe</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-4 text-right">Laba Bersih</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada transaksi ditemukan pada kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isVoided = tx.status === 'voided';
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isVoided ? 'opacity-60 bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-100 flex items-center gap-2">
                          <span>{tx.invoiceNo}</span>
                          {tx.tableNo && (
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-sans text-slate-300">
                              {tx.tableNo}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDateTime(tx.date)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200">{tx.cashierName}</div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {tx.orderType.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {tx.customer ? (
                          <div>
                            <div className="text-slate-200">{tx.customer.name}</div>
                            <div className="text-[10px] text-emerald-400">
                              +{tx.customer.pointsEarned} Poin
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Umum / Anonim</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-300">
                          {getPaymentMethodLabel(tx.paymentMethod)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatRupiah(tx.grandTotal)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-cyan-400">
                        {formatRupiah(tx.netProfit)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isVoided ? (
                          <span className="text-[11px] font-semibold text-rose-400 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Batal (Void)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Lihat rincian transaksi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Struk */}
                          <button
                            onClick={() => openReceiptModal(tx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Cetak ulang struk"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Void / Cancel */}
                          {!isVoided && (
                            <button
                              onClick={() => {
                                setVoidTargetTx(tx);
                                setVoidReason('Pelanggan membatalkan pesanan');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Batalkan / Void transaksi"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Rincian Transaksi: {selectedTx.invoiceNo}
                </h3>
                <div className="text-[11px] text-slate-400">
                  {formatDateTime(selectedTx.date)} · Kasir: {selectedTx.cashierName}
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {selectedTx.status === 'voided' && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300">
                  <div className="font-bold">Transaksi Telah Dibatalkan (Void)</div>
                  <div className="text-[11px] mt-0.5">Alasan: {selectedTx.voidReason}</div>
                  <div className="text-[10px] text-rose-400/80 mt-0.5">
                    Waktu Pembatalan: {formatDateTime(selectedTx.voidedAt || '')}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Daftar Produk ({selectedTx.items.length} jenis):
                </div>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        {item.selectedVariants && item.selectedVariants.length > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            {item.selectedVariants.map((v) => v.option).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-slate-400 italic">
                            Catatan: {item.notes}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.quantity} x {formatRupiah(item.unitPrice)}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">
                    {formatRupiah(selectedTx.subtotal)}
                  </span>
                </div>
                {selectedTx.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Diskon</span>
                    <span className="font-mono">-{formatRupiah(selectedTx.discountAmount)}</span>
                  </div>
                )}
                {selectedTx.pointsDiscount && selectedTx.pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Diskon Poin Member</span>
                    <span className="font-mono">-{formatRupiah(selectedTx.pointsDiscount)}</span>
                  </div>
                )}
                {selectedTx.serviceAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Biaya Layanan ({selectedTx.servicePercent}%)</span>
                    <span className="font-mono">{formatRupiah(selectedTx.serviceAmount)}</span>
                  </div>
                )}
                {selectedTx.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>PPN ({selectedTx.taxPercent}%)</span>
                    <span className="font-mono">{formatRupiah(selectedTx.taxAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-1.5 flex justify-between font-bold text-sm">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-emerald-400">
                    {formatRupiah(selectedTx.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Total HPP / Modal</span>
                  <span className="font-mono">{formatRupiah(selectedTx.totalCost)}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-semibold">
                  <span>Laba Bersih Transaksi</span>
                  <span className="font-mono">{formatRupiah(selectedTx.netProfit)}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between">
              <button
                onClick={() => {
                  openReceiptModal(selectedTx);
                  setSelectedTx(null);
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>

              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM VOID MODAL */}
      {voidTargetTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <Ban className="w-5 h-5" />
              <h3 className="font-bold text-slate-100 text-sm">
                Batalkan Transaksi (Void)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi{' '}
              <span className="font-mono font-bold text-white">{voidTargetTx.invoiceNo}</span>{' '}
              senilai{' '}
              <span className="font-mono font-bold text-emerald-400">
                {formatRupiah(voidTargetTx.grandTotal)}
              </span>
              ? Stok produk akan otomatis dikembalikan ke etalase toko.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Alasan Pembatalan:
              </label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Contoh: Salah input pesanan / retur kasir"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVoidTargetTx(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVoid}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Ya, Batalkan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
