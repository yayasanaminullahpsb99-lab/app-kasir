import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Product, ProductVariantOption } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';

interface VariantModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedVariants: ProductVariantOption[],
    notes: string
  ) => void;
}

export const VariantModal: React.FC<VariantModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Default selection: pick first option of required groups
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: { label: string; extraPrice: number } }>(() => {
    const initial: { [groupName: string]: { label: string; extraPrice: number } } = {};
    if (product.variantGroups) {
      product.variantGroups.forEach((group) => {
        if (group.options.length > 0 && group.required) {
          initial[group.name] = group.options[0];
        }
      });
    }
    return initial;
  });

  if (!isOpen) return null;

  const handleSelectOption = (groupName: string, option: { label: string; extraPrice: number }) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const extraTotal = Object.values(selectedOptions).reduce((acc, opt) => acc + opt.extraPrice, 0);
  const unitPrice = product.sellPrice + extraTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const variants: ProductVariantOption[] = Object.entries(selectedOptions).map(
      ([name, opt]) => ({
        name,
        option: opt.label,
        extraPrice: opt.extraPrice,
      })
    );

    onAddToCart(product, quantity, variants, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base">{product.name}</h3>
            <div className="text-xs text-emerald-400 font-mono font-medium mt-0.5">
              Harga dasar: {formatRupiah(product.sellPrice)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {product.variantGroups?.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {group.name}
                </span>
                {group.required ? (
                  <span className="text-[11px] text-amber-400">Wajib pilih 1</span>
                ) : (
                  <span className="text-[11px] text-slate-400">Opsional</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {group.options.map((opt) => {
                  const isSelected = selectedOptions[group.name]?.label === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(group.name, opt)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                      {opt.extraPrice > 0 && (
                        <span className="font-mono text-emerald-400">
                          +{formatRupiah(opt.extraPrice)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes per item */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Es sedikit, jangan terlalu pedas, bungkus pisah"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Jumlah Porsi
            </span>
            <div className="flex items-center gap-3 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-white text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Total Harga</div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {formatRupiah(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
