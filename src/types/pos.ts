export type OrderType = 'retail' | 'dine_in' | 'takeaway';

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'transfer' | 'ewallet' | 'split';

export type CustomerTier = 'Silver' | 'Gold' | 'Platinum';

export interface ProductVariantOption {
  name: string; // e.g. "Size" or "Level Gula"
  option: string; // e.g. "Large (+Rp 5.000)"
  extraPrice: number;
}

export interface ProductVariantGroup {
  id: string;
  name: string; // e.g. "Ukuran", "Level Pedas"
  required: boolean;
  options: {
    label: string;
    extraPrice: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  buyPrice: number; // HPP (Harga Pokok Penjualan)
  sellPrice: number; // Harga Jual
  stock: number;
  minStock: number;
  unit: string; // pcs, porsi, cup, kg, botol
  image?: string;
  color?: string; // fallback banner color
  variantGroups?: ProductVariantGroup[];
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  targetMode?: 'all' | 'cafe' | 'retail';
}

export interface CartItem {
  cartItemId: string; // unique per cart line
  productId: string;
  name: string;
  unitPrice: number;
  buyPrice: number;
  quantity: number;
  selectedVariants?: ProductVariantOption[];
  notes?: string;
  discountPercent?: number; // per item discount
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  tier: CustomerTier;
  totalSpent: number;
  visitsCount: number;
  joinedAt: string;
}

export interface SplitPaymentDetail {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  date: string; // ISO String
  cashierName: string;
  orderType: OrderType;
  tableNo?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    pointsEarned: number;
  };
  items: CartItem[];
  subtotal: number;
  discountAmount: number; // overall discount
  discountReason?: string;
  pointsRedeemed?: number;
  pointsDiscount?: number;
  taxPercent: number;
  taxAmount: number;
  servicePercent: number;
  serviceAmount: number;
  grandTotal: number;
  totalCost: number; // Total HPP
  netProfit: number; // grandTotal - tax - service - totalCost
  paymentMethod: PaymentMethod;
  cashPaid?: number;
  changeAmount?: number;
  splitDetails?: SplitPaymentDetail[];
  status: 'completed' | 'voided';
  voidReason?: string;
  voidedAt?: string;
}

export interface HoldOrder {
  id: string;
  holdTitle: string;
  createdAt: string;
  orderType: OrderType;
  tableNo?: string;
  customer?: Customer;
  items: CartItem[];
  notes?: string;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  timestamp: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  businessMode: 'all' | 'cafe' | 'retail';
  address: string;
  phone: string;
  receiptFooter: string;
  enableTax: boolean;
  taxPercent: number;
  enableService: boolean;
  servicePercent: number;
  receiptPaperWidth: '58mm' | '80mm';
  enableSound: boolean;
  currency: string;
  qrisMerchantName: string;
  qrisNmid: string;
}
