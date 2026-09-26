import React, { useState, useMemo } from 'react';
import {
  Search,
  Scan,
  Coffee,
  ShoppingBag,
  Utensils,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Clock,
  UserCheck,
  UserPlus,
  Percent,
  Sparkles,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product, ProductVariantOption } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';
import { ProductCard } from './ProductCard';
import { VariantModal } from './VariantModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ParkedOrdersModal } from './ParkedOrdersModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const POSTerminal: React.FC = () => {
  const {
    products,
    categories,
    storeMode,
    customers,
    cart,
    addToCart,
    updateCartItemQty,
    updateCartItemNotes,
    updateCartItemDiscount,
    removeCartItem,
    clearCart,
    subtotal,
    discountAmount,
    pointsDiscount,
    taxAmount,
    serviceAmount,
    grandTotal,
    totalItemsCount,
    orderType,
    setOrderType,
    tableNo,
    setTableNo,
    selectedCustomer,
    setSelectedCustomer,
    redeemPoints,
    setRedeemPoints,
    orderDiscountType,
    orderDiscountValue,
    setOrderDiscount,
    holdCurrentOrder,
    holdOrders,
    settings,
    receiptTransaction,
    isReceiptModalOpen,
    closeReceiptModal,
  } = usePOS();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingItemNoteId, setEditingItemNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [isDiscountDrawerOpen, setIsDiscountDrawerOpen] = useState(false);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }
      // Mode filter
      if (storeMode === 'cafe') {
        const cat = categories.find((c) => c.id === p.categoryId);
        if (cat?.targetMode === 'retail') return false;
      } else if (storeMode === 'retail') {
        const cat = categories.find((c) => c.id === p.categoryId);
        if (cat?.targetMode === 'cafe') return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        return matchName || matchSku || matchBarcode;
      }
      return true;
    });
  }, [products, categories, selectedCategory, storeMode, searchQuery]);

  // Product Selection handler
  const handleProductSelect = (product: Product) => {
    if (product.variantGroups && product.variantGroups.length > 0) {
      setVariantModalProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleAddWithVariants = (
    product: Product,
    quantity: number,
    variants: ProductVariantOption[],
    notes: string
  ) => {
    addToCart(product, quantity, variants, notes);
  };

  const tableList = [
    'Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05',
    'Meja 06', 'Meja 07', 'Meja 08', 'Meja VIP 1', 'Outdoor A', 'Outdoor B'
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT SECTION: PRODUCT CATALOG & CATEGORIES */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 overflow-hidden">
        {/* Top Control Bar: Search & Quick Barcode */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu, produk, SKU, atau barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Barcode Scanner Modal Button */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
            title="Buka scanner barcode"
          >
            <Scan className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Barcode Scan</span>
          </button>

          {/* Parked Orders Button */}
          <button
            onClick={() => setIsParkedModalOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
            title="Daftar tagihan yang disimpan (Hold)"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Tagihan Parkir</span>
            {holdOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {holdOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {categories
            .filter((c) => {
              if (storeMode === 'cafe' && c.targetMode === 'retail') return false;
              if (storeMode === 'retail' && c.targetMode === 'cafe') return false;
              return true;
            })
            .map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat.id === 'cat_coffee' && <Coffee className="w-3.5 h-3.5" />}
                  {cat.id === 'cat_food' && <Utensils className="w-3.5 h-3.5" />}
                  {cat.id === 'cat_groceries' && <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <ShoppingBag className="w-12 h-12 stroke-[1.2] text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-300">Tidak ada produk ditemukan</div>
              <p className="text-xs text-slate-500 mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: ACTIVE CART & ORDER SUMMARY */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-slate-900 flex flex-col shrink-0 border-t lg:border-t-0 shadow-2xl h-[45vh] lg:h-auto">
        {/* Cart Header & Order Settings */}
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
          {/* Order Type Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-800 rounded-lg border border-slate-700">
            {(['dine_in', 'takeaway', 'retail'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  orderType === type
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'dine_in' && 'Dine In'}
                {type === 'takeaway' && 'Bungkus'}
                {type === 'retail' && 'Retail'}
              </button>
            ))}
          </div>

          {/* Table Selector (if Dine In) & Customer Selector */}
          <div className="flex items-center gap-2">
            {orderType === 'dine_in' && (
              <select
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {tableList.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl}
                  </option>
                ))}
              </select>
            )}

            {/* Customer Pill Button */}
            <div className="relative flex-1">
              <button
                onClick={() => setIsCustomerSelectOpen(!isCustomerSelectOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  selectedCustomer
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {selectedCustomer ? selectedCustomer.name : 'Pilih Pelanggan'}
                  </span>
                </div>
                {selectedCustomer && (
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 shrink-0">
                    {selectedCustomer.points} Poin
                  </span>
                )}
              </button>

              {/* Customer Selector Dropdown */}
              {isCustomerSelectOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
                    Daftar Pelanggan Member:
                  </div>
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setIsCustomerSelectOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.phone}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {c.points} Poin
                        </span>
                        <div className="text-[10px] text-slate-400">{c.tier}</div>
                      </div>
                    </button>
                  ))}
                  {selectedCustomer && (
                    <button
                      onClick={() => {
                        setSelectedCustomer(null);
                        setRedeemPoints(false);
                        setIsCustomerSelectOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-rose-400 hover:bg-slate-700/50 rounded-lg mt-1"
                    >
                      Lepas Pelanggan
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Member Point Redeem Banner if customer selected */}
          {selectedCustomer && selectedCustomer.points > 0 && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-slate-300">
                  Tukarkan poin ({selectedCustomer.points} pts)
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-medium text-emerald-400">Gunakan</span>
              </label>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-1 opacity-50" />
              <div className="text-xs font-medium text-slate-400">Keranjang Masih Kosong</div>
              <p className="text-[11px] text-slate-500 text-center max-w-[200px] mt-0.5">
                Pilih produk dari menu di samping untuk memulai transaksi.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              const hasItemDiscount = item.discountPercent && item.discountPercent > 0;
              const lineDiscount = hasItemDiscount ? (lineTotal * item.discountPercent!) / 100 : 0;
              const finalLineTotal = lineTotal - lineDiscount;

              return (
                <div
                  key={item.cartItemId}
                  className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col gap-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {item.name}
                      </div>

                      {/* Variants string */}
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <div className="text-[10px] text-emerald-400 italic">
                          {item.selectedVariants.map((v) => v.option).join(', ')}
                        </div>
                      )}

                      {/* Note snippet */}
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                          <MessageSquare className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">&quot;{item.notes}&quot;</span>
                        </div>
                      )}
                    </div>

                    {/* Final Line Total */}
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-slate-100">
                        {formatRupiah(finalLineTotal)}
                      </div>
                      {hasItemDiscount && (
                        <div className="text-[10px] text-rose-400 font-mono line-through">
                          {formatRupiah(lineTotal)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Quick actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                    <div className="flex items-center gap-1.5">
                      {/* Note Button */}
                      <button
                        onClick={() => {
                          setEditingItemNoteId(item.cartItemId);
                          setTempNoteText(item.notes || '');
                        }}
                        className={`p-1 rounded text-slate-400 hover:text-white transition-colors ${
                          item.notes ? 'text-amber-400' : ''
                        }`}
                        title="Tambah/ubah catatan"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Item Discount toggle */}
                      <button
                        onClick={() => {
                          const disc = prompt('Diskon item (%)', (item.discountPercent || 0).toString());
                          if (disc !== null) {
                            updateCartItemDiscount(item.cartItemId, parseInt(disc, 10) || 0);
                          }
                        }}
                        className={`p-1 rounded text-slate-400 hover:text-white transition-colors ${
                          hasItemDiscount ? 'text-rose-400 font-bold' : ''
                        }`}
                        title="Beri diskon item (%)"
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-700">
                      <button
                        onClick={() => updateCartItemQty(item.cartItemId, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(item.cartItemId, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Note Editor Inline Dialog */}
        {editingItemNoteId && (
          <div className="p-3 bg-slate-850 border-t border-slate-700 space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Catatan Item:
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: Kurang manis, extra es..."
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingItemNoteId(null)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateCartItemNotes(editingItemNoteId, tempNoteText.trim());
                  setEditingItemNoteId(null);
                }}
                className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        )}

        {/* Calculation Summary & Total */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          {/* Subtotal & Discounts */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({totalItemsCount} item)</span>
              <span className="font-mono text-slate-200">{formatRupiah(subtotal)}</span>
            </div>

            {/* Overall Discount Button */}
            <div className="flex justify-between items-center text-slate-400">
              <button
                onClick={() => setIsDiscountDrawerOpen(!isDiscountDrawerOpen)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Percent className="w-3 h-3" />
                <span>Diskon Transaksi:</span>
              </button>
              <span className="font-mono text-rose-400">
                {discountAmount > 0 ? `-${formatRupiah(discountAmount)}` : 'Rp 0'}
              </span>
            </div>

            {/* Discount Inputs if open */}
            {isDiscountDrawerOpen && (
              <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2">
                <select
                  value={orderDiscountType}
                  onChange={(e) =>
                    setOrderDiscount(e.target.value as 'percent' | 'fixed', orderDiscountValue)
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="percent">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
                <input
                  type="number"
                  placeholder="0"
                  value={orderDiscountValue || ''}
                  onChange={(e) =>
                    setOrderDiscount(orderDiscountType, parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white text-right"
                />
              </div>
            )}

            {/* Points discount if redeemed */}
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Poin Member Digunakan</span>
                <span className="font-mono">-{formatRupiah(pointsDiscount)}</span>
              </div>
            )}

            {/* Service Charge */}
            {serviceAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Layanan ({settings.servicePercent}%)</span>
                <span className="font-mono text-slate-200">{formatRupiah(serviceAmount)}</span>
              </div>
            )}

            {/* Tax */}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>PPN ({settings.taxPercent}%)</span>
                <span className="font-mono text-slate-200">{formatRupiah(taxAmount)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Total Bayar
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          {/* Action Buttons: Hold, Clear, Pay */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => clearCart()}
              disabled={cart.length === 0}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              title="Kosongkan keranjang"
            >
              Batal
            </button>

            <button
              onClick={() => holdCurrentOrder()}
              disabled={cart.length === 0}
              className="py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Simpan sementara tagihan ini"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tahan</span>
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar (F9)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {variantModalProduct && (
        <VariantModal
          product={variantModalProduct}
          isOpen={!!variantModalProduct}
          onClose={() => setVariantModalProduct(null)}
          onAddToCart={handleAddWithVariants}
        />
      )}

      {isBarcodeModalOpen && (
        <BarcodeScannerModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
        />
      )}

      {isParkedModalOpen && (
        <ParkedOrdersModal
          isOpen={isParkedModalOpen}
          onClose={() => setIsParkedModalOpen(false)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {isReceiptModalOpen && receiptTransaction && (
        <ReceiptModal
          transaction={receiptTransaction}
          isOpen={isReceiptModalOpen}
          onClose={closeReceiptModal}
        />
      )}
    </div>
  );
};
