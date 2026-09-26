import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import {
  formatRupiah,
  getPaymentMethodLabel,
  downloadCSV,
} from '../../utils/formatters';

export const ReportsAndAnalytics: React.FC = () => {
  const { transactions, products, categories, settings } = usePOS();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 3600 * 1000;

    return transactions.filter((tx) => {
      if (tx.status !== 'completed') return false;
      const txTime = new Date(tx.date).getTime();

      if (timeRange === 'today') {
        return txTime >= startOfToday;
      } else if (timeRange === '7days') {
        return txTime >= startOfToday - 7 * oneDayMs;
      } else if (timeRange === '30days') {
        return txTime >= startOfToday - 30 * oneDayMs;
      }
      return true;
    });
  }, [transactions, timeRange]);

  // Aggregate Metrics
  const grossSales = filteredTransactions.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalCost = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const totalTax = filteredTransactions.reduce((acc, t) => acc + t.taxAmount, 0);
  const totalService = filteredTransactions.reduce((acc, t) => acc + t.serviceAmount, 0);
  const netProfit = filteredTransactions.reduce((acc, t) => acc + t.netProfit, 0);
  const totalTransactionsCount = filteredTransactions.length;
  const aov = totalTransactionsCount > 0 ? Math.round(grossSales / totalTransactionsCount) : 0;
  const profitMarginPercent = grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0;

  // Best Selling Products
  const bestSellers = useMemo(() => {
    const map: { [prodId: string]: { name: string; qty: number; revenue: number; categoryId: string } } = {};

    filteredTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        if (!map[item.productId]) {
          const prod = products.find((p) => p.id === item.productId);
          map[item.productId] = {
            name: item.name,
            qty: 0,
            revenue: 0,
            categoryId: prod?.categoryId || 'other',
          };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.unitPrice * item.quantity;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTransactions, products]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: { [method: string]: number } = {
      cash: 0,
      qris: 0,
      debit: 0,
      ewallet: 0,
      split: 0,
    };

    filteredTransactions.forEach((tx) => {
      map[tx.paymentMethod] = (map[tx.paymentMethod] || 0) + tx.grandTotal;
    });

    return Object.entries(map).map(([method, total]) => ({
      method,
      label: getPaymentMethodLabel(method),
      total,
      percentage: grossSales > 0 ? Math.round((total / grossSales) * 100) : 0,
    }));
  }, [filteredTransactions, grossSales]);

  // Hourly Distribution (08:00 - 22:00)
  const hourlySales = useMemo(() => {
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    const data = hours.map((hour) => {
      const total = filteredTransactions
        .filter((tx) => {
          const h = new Date(tx.date).getHours();
          return h >= hour && h < hour + 2;
        })
        .reduce((sum, tx) => sum + tx.grandTotal, 0);

      return {
        label: `${String(hour).padStart(2, '0')}:00`,
        total,
      };
    });

    const maxTotal = Math.max(...data.map((d) => d.total), 1);
    return data.map((d) => ({
      ...d,
      heightPercent: Math.max(12, Math.round((d.total / maxTotal) * 100)),
    }));
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    let csv = `LAPORAN PENJUALAN - ${settings.storeName}\n`;
    csv += `Periode Filter: ${timeRange}\n`;
    csv += `Total Penjualan: ${grossSales}\n`;
    csv += `Laba Bersih: ${netProfit}\n`;
    csv += `Total Transaksi: ${totalTransactionsCount}\n\n`;

    csv += 'PRODUK TERLARIS\n';
    csv += 'Nama Produk,Qty Terjual,Total Omset\n';
    bestSellers.forEach((item) => {
      csv += `"${item.name}",${item.qty},${item.revenue}\n`;
    });

    csv += '\nMETODE PEMBAYARAN\n';
    csv += 'Metode,Total,Persentase\n';
    paymentBreakdown.forEach((p) => {
      csv += `"${p.label}",${p.total},${p.percentage}%\n`;
    });

    downloadCSV(`laporan_kasirpro_${timeRange}_${Date.now()}.csv`, csv);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Laporan & Analitik Penjualan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis performa omset, laba kotor vs HPP, dan tren jam sibuk toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['today', '7days', '30days', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === 'today' && 'Hari Ini'}
                {range === '7days' && '7 Hari'}
                {range === '30days' && '30 Hari'}
                {range === 'all' && 'Semua'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Download Laporan CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={handlePrintSummary}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Cetak Ringkasan"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Sales */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Omset (Gross)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatRupiah(grossSales)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {totalTransactionsCount} transaksi
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Laba Bersih Toko</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">
            Margin: {profitMarginPercent}% dari omset
          </div>
        </div>

        {/* COGS */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Modal Barang (HPP)</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {formatRupiah(totalCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Biaya pokok penjualan
          </div>
        </div>

        {/* AOV */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Rata-rata Order (AOV)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-2">
            {formatRupiah(aov)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Per struk transaksi
          </div>
        </div>
      </div>

      {/* Grid: Charts & Top Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Sales Activity Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Aktivitas Omset Berdasarkan Jam</h3>
              <p className="text-[11px] text-slate-400">Distribusi waktu transaksi harian toko</p>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-800">
            {hourlySales.map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-emerald-400 whitespace-nowrap">
                  {formatRupiah(h.total)}
                </div>
                <div
                  className="w-full bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t-lg transition-all"
                  style={{ height: `${h.heightPercent}%` }}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Best Selling Products */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Top 5 Produk Terlaris</h3>
              <p className="text-[11px] text-slate-400">Paling banyak terjual di periode ini</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {bestSellers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Belum ada transaksi di periode ini.
              </div>
            ) : (
              bestSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-slate-400 text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.qty} item terjual</div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    {formatRupiah(item.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Komposisi Metode Pembayaran</h3>
            <p className="text-[11px] text-slate-400">Pilihan pembayaran favorit pembeli</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {paymentBreakdown.map((p) => (
            <div
              key={p.method}
              className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between"
            >
              <div className="text-xs font-semibold text-slate-300">{p.label}</div>
              <div className="mt-3">
                <div className="text-base font-bold font-mono text-emerald-400">
                  {formatRupiah(p.total)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {p.percentage}% dari total omset
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
