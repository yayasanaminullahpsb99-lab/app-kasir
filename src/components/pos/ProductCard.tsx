import React from 'react';
import { Plus, AlertTriangle, Layers, Coffee, Utensils, ShoppingBag, Package } from 'lucide-react';
import { Product } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
  const hasVariants = product.variantGroups && product.variantGroups.length > 0;

  const getFallbackIcon = () => {
    if (product.categoryId === 'cat_coffee') return <Coffee className="w-8 h-8 opacity-70" />;
    if (product.categoryId === 'cat_food' || product.categoryId === 'cat_snack') return <Utensils className="w-8 h-8 opacity-70" />;
    if (product.categoryId === 'cat_groceries') return <ShoppingBag className="w-8 h-8 opacity-70" />;
    return <Package className="w-8 h-8 opacity-70" />;
  };

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all duration-150 select-none ${
        isOutOfStock
          ? 'bg-slate-800/40 border-slate-800 opacity-60 cursor-not-allowed'
          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/70 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/30 cursor-pointer active:scale-[0.98]'
      }`}
    >
      <div>
        {/* Visual Header / Banner */}
        <div
          className="w-full h-24 rounded-lg flex items-center justify-center relative overflow-hidden mb-2.5"
          style={{
            backgroundColor: product.color || '#334155',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          }}
        >
          <div className="text-white drop-shadow-md">
            {getFallbackIcon()}
          </div>

          {/* Barcode / SKU snippet */}
          <div className="absolute bottom-1 left-2 font-mono text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
            {product.sku}
          </div>

          {/* Variant indicator */}
          {hasVariants && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs font-medium">
              <Layers className="w-3 h-3" />
              <span>Varian</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h4 className="font-semibold text-slate-100 text-sm leading-tight group-hover:text-emerald-300 transition-colors line-clamp-2">
          {product.name}
        </h4>

        {/* Short description if exists */}
        {product.description && (
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        )}
      </div>

      {/* Footer: Price & Stock status */}
      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
        <div>
          <div className="text-emerald-400 font-bold font-mono text-sm tracking-tight tabular-nums">
            {formatRupiah(product.sellPrice)}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            {isOutOfStock ? (
              <span className="text-rose-400 font-medium">Stok Habis</span>
            ) : isLowStock ? (
              <span className="text-amber-400 font-medium flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                Sisa {product.stock} {product.unit}
              </span>
            ) : (
              <span>
                Stok: <span className="font-mono text-slate-300">{product.stock}</span> {product.unit}
              </span>
            )}
          </div>
        </div>

        <button
          disabled={isOutOfStock}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            isOutOfStock
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-bold shadow-xs'
          }`}
          title="Tambah ke keranjang"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
