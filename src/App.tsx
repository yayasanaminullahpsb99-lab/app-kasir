import React, { useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/common/Header';
import { POSTerminal } from './components/pos/POSTerminal';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { ReportsAndAnalytics } from './components/reports/ReportsAndAnalytics';
import { ShiftManagement } from './components/shift/ShiftManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { SettingsModal } from './components/settings/SettingsModal';

const POSAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = usePOS();

  // Keyboard shortcuts (F1: Kasir, F2: Produk, F3: Transaksi, F4: Laporan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('products');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('transactions');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('reports');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'pos' && <POSTerminal />}
        {activeTab === 'products' && <InventoryManagement />}
        {activeTab === 'transactions' && <TransactionHistory />}
        {activeTab === 'reports' && <ReportsAndAnalytics />}
        {activeTab === 'shift' && <ShiftManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'settings' && <SettingsModal />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
