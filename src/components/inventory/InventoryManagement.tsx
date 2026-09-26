import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  FolderPlus,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';

export const InventoryManagement: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    quickRestockProduct,
    addCategory,
    deleteCategory,
  } = usePOS();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [quickRestockProductTarget, setQuickRestockProductTarget] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: 'cat_coffee',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'pcs',
    color: '#0284C7',
    description: '',
    isActive: true,
  });

  // Category Form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryTargetMode, setNewCategoryTargetMode] = useState<'all' | 'cafe' | 'retail'>('all');

  // Stats
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.buyPrice * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (stockStatusFilter === 'low' && (p.stock <= 0 || p.stock > p.minStock)) return false;
      if (stockStatusFilter === 'out' && p.stock > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, stockStatusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      barcode: `899${Math.floor(100000000 + Math.random() * 900000000)}`,
      categoryId: categories.find((c) => c.id !== 'all')?.id || 'cat_coffee',
      buyPrice: 10000,
      sellPrice: 15000,
      stock: 20,
      minStock: 5,
      unit: 'pcs',
      color: '#0284C7',
      description: '',
      isActive: true,
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      color: product.color || '#0284C7',
      description: product.description || '',
      isActive: product.isActive,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
      });
    } else {
      addProduct({
        ...formData,
      });
    }
    setIsAddEditModalOpen(false);
  };

  const handleQuickRestockSubmit = () => {
    if (!quickRestockProductTarget || restockAmount <= 0) return;
    quickRestockProduct(quickRestockProductTarget.id, restockAmount);
    setQuickRestockProductTarget(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory({
      name: newCategoryName.trim(),
      iconName: 'Package',
      targetMode: newCategoryTargetMode,
    });
    setNewCategoryName('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Jenis Produk</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {products.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Item aktif di katalog</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Stok Unit</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalStockItems}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Fisik di gudang/toko</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Nilai Modal Persediaan</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {formatRupiah(totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Berdasarkan HPP Beli</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Perlu Restock</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {lowStockCount + outOfStockCount}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {lowStockCount} menipis · {outOfStockCount} habis
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama, SKU, atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Category & Stock Status */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as 'all' | 'low' | 'out')}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status Stok</option>
            <option value="low">Hanya Stok Menipis</option>
            <option value="out">Hanya Stok Habis</option>
          </select>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-emerald-400" />
            <span>Kategori</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 uppercase tracking-wider text-[11px] text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Produk / SKU</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">HPP (Modal)</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-right">Margin / Profit</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada produk yang cocok dengan pencarian / filter ini.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const categoryName = categories.find((c) => c.id === prod.categoryId)?.name || '-';
                  const marginRp = prod.sellPrice - prod.buyPrice;
                  const marginPercent = prod.buyPrice > 0 ? Math.round((marginRp / prod.sellPrice) * 100) : 100;
                  const isLow = prod.stock > 0 && prod.stock <= prod.minStock;
                  const isOut = prod.stock <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{prod.name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>SKU: {prod.sku}</span>
                          <span>·</span>
                          <span>Barcode: {prod.barcode}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300">{categoryName}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatRupiah(prod.buyPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                        {formatRupiah(prod.sellPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <span className="text-slate-200">{formatRupiah(marginRp)}</span>
                        <div className="text-[10px] text-emerald-400">+{marginPercent}%</div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-200'}>
                          {prod.stock} {prod.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="text-[11px] font-semibold text-rose-400">Habis</span>
                        ) : isLow ? (
                          <span className="text-[11px] font-semibold text-amber-400 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Menipis (Min: {prod.minStock})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-400">Aman</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Restock */}
                          <button
                            onClick={() => {
                              setQuickRestockProductTarget(prod);
                              setRestockAmount(10);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Restock stok cepat"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Ubah detail produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus produk "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Susu Aren Spesial"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">SKU / Kode Item</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="pcs, cup, porsi, kg, botol"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Harga Beli / HPP (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.buyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, buyPrice: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellPrice: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Batas Minimum Peringatan</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Deskripsi Ringkas</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-sm"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK RESTOCK */}
      {quickRestockProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm">
              Restock Cepat: {quickRestockProductTarget.name}
            </h3>
            <p className="text-xs text-slate-400">
              Stok saat ini:{' '}
              <span className="font-mono text-emerald-400 font-bold">
                {quickRestockProductTarget.stock} {quickRestockProductTarget.unit}
              </span>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Jumlah Tambahan Stok Masuk:
              </label>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                      restockAmount === amt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-center text-sm font-bold mt-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuickRestockProductTarget(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleQuickRestockSubmit}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold"
              >
                Tambahkan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY MANAGER */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm">Kelola Kategori Produk</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Add form */}
              <form onSubmit={handleAddCategorySubmit} className="space-y-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-xs font-semibold text-slate-300">Tambah Kategori Baru</div>
                <input
                  type="text"
                  placeholder="Nama Kategori (contoh: Pastry & Cake)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={newCategoryTargetMode}
                    onChange={(e) => setNewCategoryTargetMode(e.target.value as 'all' | 'cafe' | 'retail')}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="all">Untuk Semua Mode</option>
                    <option value="cafe">Khusus Mode Kafe/Resto</option>
                    <option value="retail">Khusus Mode Retail</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                  >
                    Tambah
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Daftar Kategori:
                </div>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Target: {c.targetMode === 'cafe' ? 'Kafe' : c.targetMode === 'retail' ? 'Retail' : 'Semua'}
                      </div>
                    </div>
                    {c.id !== 'all' && (
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
