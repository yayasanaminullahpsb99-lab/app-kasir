import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Sparkles,
  Award,
  Phone,
  Mail,
  Edit2,
  X,
  CheckCircle,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Customer } from '../../types/pos';
import { formatDateShort, formatRupiah } from '../../utils/formatters';

export const CustomerManagement: React.FC = () => {
  const { customers, addCustomer, updateCustomer } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
      }
      return true;
    });
  }, [customers, tierFilter, searchQuery]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        tier: 'Silver',
      });
    }
    setIsModalOpen(false);
  };

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Member Terdaftar</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {customers.length} Orang
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pelanggan setia toko</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Poin Loyalitas Beredar</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalPoints} Poin
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Setara {formatRupiah(totalPoints * 100)} potongan</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Member Platinum Aktif</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {customers.filter((c) => c.tier === 'Platinum').length} Member
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Belanja diatas Rp 3.000.000</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, nomor HP, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Tingkat (Tier)</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Member</span>
          </button>
        </div>
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{c.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>

                {/* Tier Badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    c.tier === 'Platinum'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : c.tier === 'Gold'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>{c.tier}</span>
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <div className="text-[10px] text-slate-400">Saldo Poin</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {c.points} Pts
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/60">
                  <div className="text-[10px] text-slate-400">Total Belanja</div>
                  <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                    {formatRupiah(c.totalSpent)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
              <div>{c.visitsCount} kali transaksi</div>
              <button
                onClick={() => openEditModal(c)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">
              {editingCustomer ? 'Ubah Data Pelanggan' : 'Pendaftaran Member Baru'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nomor WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="rian@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
