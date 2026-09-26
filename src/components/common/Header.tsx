import React from 'react';
import {
  ShoppingBag,
  Package,
  History,
  BarChart3,
  Coins,
  Users,
  Settings,
  Store,
  Coffee,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { formatRupiah } from '../../utils/formatters';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    storeMode,
    setStoreMode,
    currentShift,
    settings,
  } = usePOS();

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: ShoppingBag },
    { id: 'products', label: 'Produk & Stok', icon: Package },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: History },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'shift', label: 'Shift & Kas', icon: Coins },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight leading-none text-white flex items-center gap-2">
                <span>{settings.storeName || 'KasirPro'}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                {settings.storeTagline || 'Sistem Kasir Pintar'}
              </div>
            </div>
          </div>

          {/* Business Mode Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 ml-2">
            <button
              onClick={() => setStoreMode('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                storeMode === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Semua kategori makanan & retail"
            >
              Semua Mode
            </button>
            <button
              onClick={() => setStoreMode('cafe')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                storeMode === 'cafe'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Khusus F&B, Kafe & Resto (dengan meja)"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Kafe & Resto</span>
            </button>
            <button
              onClick={() => setStoreMode('retail')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                storeMode === 'retail'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Khusus Minimarket / Retail Toko"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Retail</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Shift / Cash Drawer Status */}
        <div className="flex items-center gap-2">
          {currentShift ? (
            <div
              onClick={() => setActiveTab('shift')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors"
              title="Klik untuk kelola shift & laci kasir"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 leading-none">
                  Kas Laci: <span className="text-emerald-400 font-mono font-medium">{formatRupiah(currentShift.expectedCash)}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentShift.cashierName}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('shift')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Buka Shift</span>
            </button>
          )}

          {/* Quick Cashier shortcut */}
          {activeTab !== 'pos' && (
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ke Kasir</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-3 py-2 border-t border-slate-800 gap-1 bg-slate-900/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
