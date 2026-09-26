import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  CashMovement,
  Category,
  Customer,
  HoldOrder,
  OrderType,
  PaymentMethod,
  Product,
  ProductVariantOption,
  Shift,
  SplitPaymentDetail,
  StoreSettings,
  Transaction,
} from '../types/pos';
import {
  initialCategories,
  initialCustomers,
  initialProducts,
  initialShift,
  initialStoreSettings,
  initialTransactions,
} from '../data/initialData';
import { generateInvoiceNo } from '../utils/formatters';
import { playCashDrawerSound, playErrorBeep, playScannerBeep, playSuccessChime } from '../utils/audio';

interface POSContextType {
  // Navigation & Mode
  activeTab: 'pos' | 'products' | 'transactions' | 'reports' | 'shift' | 'customers' | 'settings';
  setActiveTab: (tab: 'pos' | 'products' | 'transactions' | 'reports' | 'shift' | 'customers' | 'settings') => void;
  storeMode: 'all' | 'cafe' | 'retail';
  setStoreMode: (mode: 'all' | 'cafe' | 'retail') => void;

  // Data
  products: Product[];
  categories: Category[];
  customers: Customer[];
  transactions: Transaction[];
  shifts: Shift[];
  currentShift: Shift | null;
  cashMovements: CashMovement[];
  settings: StoreSettings;
  holdOrders: HoldOrder[];

  // Cart
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  tableNo: string;
  setTableNo: (table: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (c: Customer | null) => void;
  redeemPoints: boolean;
  setRedeemPoints: (redeem: boolean) => void;
  orderDiscountType: 'percent' | 'fixed';
  orderDiscountValue: number;
  setOrderDiscount: (type: 'percent' | 'fixed', value: number) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;

  // Cart Calculations
  subtotal: number;
  discountAmount: number;
  pointsDiscount: number;
  taxAmount: number;
  serviceAmount: number;
  grandTotal: number;
  totalItemsCount: number;

  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedVariants?: ProductVariantOption[], notes?: string) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  updateCartItemNotes: (cartItemId: string, notes: string) => void;
  updateCartItemDiscount: (cartItemId: string, discountPercent: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;

  // Hold & Parked orders
  holdCurrentOrder: (title?: string) => void;
  restoreHoldOrder: (holdId: string) => void;
  deleteHoldOrder: (holdId: string) => void;

  // Checkout
  processPayment: (details: {
    paymentMethod: PaymentMethod;
    cashPaid?: number;
    changeAmount?: number;
    splitDetails?: SplitPaymentDetail[];
  }) => Transaction;

  // Transaction Actions
  voidTransaction: (transactionId: string, reason: string) => boolean;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  quickRestockProduct: (id: string, qty: number) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Customer CRUD
  addCustomer: (c: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'visitsCount' | 'joinedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Shift Actions
  openShift: (startingCash: number, cashierName: string) => void;
  closeShift: (actualCash: number, notes?: string) => void;
  addCashMovement: (type: 'in' | 'out', amount: number, reason: string) => void;

  // Settings & System
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Receipt Modal State
  receiptTransaction: Transaction | null;
  isReceiptModalOpen: boolean;
  openReceiptModal: (tx: Transaction) => void;
  closeReceiptModal: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'kasirpro_products_v1',
  CATEGORIES: 'kasirpro_categories_v1',
  CUSTOMERS: 'kasirpro_customers_v1',
  TRANSACTIONS: 'kasirpro_transactions_v1',
  SHIFTS: 'kasirpro_shifts_v1',
  CURRENT_SHIFT: 'kasirpro_current_shift_v1',
  CASH_MOVEMENTS: 'kasirpro_cash_movements_v1',
  SETTINGS: 'kasirpro_settings_v1',
  HOLD_ORDERS: 'kasirpro_hold_orders_v1',
  STORE_MODE: 'kasirpro_store_mode_v1',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'transactions' | 'reports' | 'shift' | 'customers' | 'settings'>('pos');

  // Load state from localStorage with fallback
  const [storeMode, setStoreModeState] = useState<'all' | 'cafe' | 'retail'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_MODE);
    return saved ? (JSON.parse(saved) as 'all' | 'cafe' | 'retail') : 'all';
  });

  const [settings, setSettingsState] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategoriesState] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [customers, setCustomersState] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [transactions, setTransactionsState] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [shifts, setShiftsState] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentShift, setCurrentShiftState] = useState<Shift | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    return saved ? JSON.parse(saved) : initialShift;
  });

  const [cashMovements, setCashMovementsState] = useState<CashMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [holdOrders, setHoldOrdersState] = useState<HoldOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOLD_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNo, setTableNo] = useState<string>('Meja 01');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [redeemPoints, setRedeemPoints] = useState<boolean>(false);
  const [orderDiscountType, setOrderDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Receipt Modal State
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_MODE, JSON.stringify(storeMode));
  }, [storeMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(currentShift));
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(cashMovements));
  }, [cashMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLD_ORDERS, JSON.stringify(holdOrders));
  }, [holdOrders]);

  const setStoreMode = (mode: 'all' | 'cafe' | 'retail') => {
    setStoreModeState(mode);
    if (mode === 'retail') {
      setOrderType('retail');
    } else if (orderType === 'retail') {
      setOrderType('dine_in');
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const itemSub = item.unitPrice * item.quantity;
    const itemDiscount = item.discountPercent ? (itemSub * item.discountPercent) / 100 : 0;
    return acc + (itemSub - itemDiscount);
  }, 0);

  const discountAmount =
    orderDiscountType === 'percent'
      ? Math.round((subtotal * orderDiscountValue) / 100)
      : Math.min(orderDiscountValue, subtotal);

  // 1 point = Rp 100 discount, max 50% of (subtotal - discountAmount)
  const availableCustomerPoints = selectedCustomer ? selectedCustomer.points : 0;
  const maxRedeemablePointsDiscount = Math.floor((subtotal - discountAmount) * 0.5);
  const potentialPointsDiscount = availableCustomerPoints * 100;
  const pointsDiscount =
    redeemPoints && selectedCustomer
      ? Math.min(potentialPointsDiscount, Math.max(0, maxRedeemablePointsDiscount))
      : 0;
  const actualPointsRedeemed = Math.ceil(pointsDiscount / 100);

  const taxableAmount = Math.max(0, subtotal - discountAmount - pointsDiscount);

  // Apply service charge if enabled and not retail
  const serviceAmount =
    settings.enableService && orderType !== 'retail'
      ? Math.round((taxableAmount * settings.servicePercent) / 100)
      : 0;

  // Apply tax (PPN)
  const taxAmount = settings.enableTax
    ? Math.round(((taxableAmount + serviceAmount) * settings.taxPercent) / 100)
    : 0;

  const grandTotal = Math.max(0, taxableAmount + serviceAmount + taxAmount);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedVariants?: ProductVariantOption[],
    notes = ''
  ) => {
    if (product.stock <= 0) {
      playErrorBeep(settings.enableSound);
      return;
    }

    // Calculate effective unit price with variant add-ons
    const variantExtra = (selectedVariants || []).reduce((acc, v) => acc + v.extraPrice, 0);
    const unitPrice = product.sellPrice + variantExtra;

    // Check if duplicate item exists (same product, same variants, same notes)
    const variantKey = (selectedVariants || [])
      .map((v) => `${v.name}:${v.option}`)
      .sort()
      .join('|');

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const itemVariantKey = (item.selectedVariants || [])
          .map((v) => `${v.name}:${v.option}`)
          .sort()
          .join('|');
        return item.productId === product.id && itemVariantKey === variantKey && item.notes === notes;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + quantity;
        if (newQty > product.stock) {
          playErrorBeep(settings.enableSound);
          return prev;
        }
        updated[existingIndex] = { ...currentItem, quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          productId: product.id,
          name: product.name,
          unitPrice,
          buyPrice: product.buyPrice,
          quantity,
          selectedVariants,
          notes,
        };
        return [...prev, newItem];
      }
    });

    playScannerBeep(settings.enableSound);
  };

  const updateCartItemQty = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const product = products.find((p) => p.id === item.productId);
            const maxStock = product ? product.stock : 9999;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > maxStock) {
              playErrorBeep(settings.enableSound);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const updateCartItemNotes = (cartItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, notes } : item))
    );
  };

  const updateCartItemDiscount = (cartItemId: string, discountPercent: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, discountPercent: Math.min(100, Math.max(0, discountPercent)) } : item
      )
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setRedeemPoints(false);
    setOrderDiscountValue(0);
    setOrderNotes('');
  };

  const setOrderDiscount = (type: 'percent' | 'fixed', value: number) => {
    setOrderDiscountType(type);
    setOrderDiscountValue(Math.max(0, value));
  };

  // Hold / Recall orders
  const holdCurrentOrder = (title?: string) => {
    if (cart.length === 0) return;
    const holdTitle =
      title ||
      (orderType === 'dine_in'
        ? `${tableNo} (${cart.length} item)`
        : selectedCustomer
        ? `${selectedCustomer.name} (${cart.length} item)`
        : `Pesanan #${holdOrders.length + 1} (${cart.length} item)`);

    const newHold: HoldOrder = {
      id: `hold_${Date.now()}`,
      holdTitle,
      createdAt: new Date().toISOString(),
      orderType,
      tableNo: orderType === 'dine_in' ? tableNo : undefined,
      customer: selectedCustomer || undefined,
      items: [...cart],
      notes: orderNotes,
    };

    setHoldOrdersState((prev) => [newHold, ...prev]);
    clearCart();
    playCashDrawerSound(settings.enableSound);
  };

  const restoreHoldOrder = (holdId: string) => {
    const target = holdOrders.find((h) => h.id === holdId);
    if (!target) return;

    setCart(target.items);
    setOrderType(target.orderType);
    if (target.tableNo) setTableNo(target.tableNo);
    if (target.customer) setSelectedCustomer(target.customer);
    if (target.notes) setOrderNotes(target.notes);

    setHoldOrdersState((prev) => prev.filter((h) => h.id !== holdId));
  };

  const deleteHoldOrder = (holdId: string) => {
    setHoldOrdersState((prev) => prev.filter((h) => h.id !== holdId));
  };

  // Process Checkout & Payment
  const processPayment = (details: {
    paymentMethod: PaymentMethod;
    cashPaid?: number;
    changeAmount?: number;
    splitDetails?: SplitPaymentDetail[];
  }): Transaction => {
    const invoiceNo = generateInvoiceNo();
    const cashierName = currentShift ? currentShift.cashierName : 'Kasir Utama';

    // Calculate total cost (HPP)
    const totalCost = cart.reduce((acc, item) => acc + item.buyPrice * item.quantity, 0);
    const netProfit = grandTotal - taxAmount - serviceAmount - totalCost;

    // Customer loyalty calculation
    const pointsEarned = selectedCustomer ? Math.floor(grandTotal / 1000) : 0; // 1 point per Rp 1.000

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      cashierName,
      orderType,
      tableNo: orderType === 'dine_in' ? tableNo : undefined,
      customer: selectedCustomer
        ? {
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            pointsEarned,
          }
        : undefined,
      items: [...cart],
      subtotal,
      discountAmount,
      discountReason: discountAmount > 0 ? (orderDiscountType === 'percent' ? `Diskon ${orderDiscountValue}%` : 'Diskon Khusus') : undefined,
      pointsRedeemed: actualPointsRedeemed > 0 ? actualPointsRedeemed : undefined,
      pointsDiscount: pointsDiscount > 0 ? pointsDiscount : undefined,
      taxPercent: settings.enableTax ? settings.taxPercent : 0,
      taxAmount,
      servicePercent: settings.enableService && orderType !== 'retail' ? settings.servicePercent : 0,
      serviceAmount,
      grandTotal,
      totalCost,
      netProfit,
      paymentMethod: details.paymentMethod,
      cashPaid: details.cashPaid,
      changeAmount: details.changeAmount,
      splitDetails: details.splitDetails,
      status: 'completed',
    };

    // 1. Update stock
    setProductsState((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.filter((ci) => ci.productId === prod.id);
        if (cartMatch.length > 0) {
          const totalQtyUsed = cartMatch.reduce((sum, item) => sum + item.quantity, 0);
          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalQtyUsed),
          };
        }
        return prod;
      })
    );

    // 2. Update customer record (points, total spent, visits)
    if (selectedCustomer) {
      setCustomersState((prev) =>
        prev.map((c) => {
          if (c.id === selectedCustomer.id) {
            const netPoints = c.points - actualPointsRedeemed + pointsEarned;
            const newTotalSpent = c.totalSpent + grandTotal;
            let newTier = c.tier;
            if (newTotalSpent > 3000000) newTier = 'Platinum';
            else if (newTotalSpent > 1000000) newTier = 'Gold';
            return {
              ...c,
              points: Math.max(0, netPoints),
              totalSpent: newTotalSpent,
              visitsCount: c.visitsCount + 1,
              tier: newTier,
            };
          }
          return c;
        })
      );
    }

    // 3. Update active shift cash drawer if payment is cash
    if (currentShift) {
      let cashContribution = 0;
      let nonCashContribution = 0;

      if (details.paymentMethod === 'cash') {
        cashContribution = grandTotal;
      } else if (details.paymentMethod === 'split' && details.splitDetails) {
        details.splitDetails.forEach((s) => {
          if (s.method === 'cash') cashContribution += s.amount;
          else nonCashContribution += s.amount;
        });
      } else {
        nonCashContribution = grandTotal;
      }

      setCurrentShiftState((prev) => {
        if (!prev) return prev;
        const newTotalCashSales = prev.totalCashSales + cashContribution;
        const newTotalNonCashSales = prev.totalNonCashSales + nonCashContribution;
        const expectedCash = prev.startingCash + newTotalCashSales + prev.cashIn - prev.cashOut;
        return {
          ...prev,
          totalCashSales: newTotalCashSales,
          totalNonCashSales: newTotalNonCashSales,
          expectedCash,
        };
      });
    }

    // 4. Save transaction
    setTransactionsState((prev) => [newTransaction, ...prev]);

    // 5. Sound & feedback
    playSuccessChime(settings.enableSound);

    // 6. Reset cart & open receipt
    clearCart();
    setReceiptTransaction(newTransaction);
    setIsReceiptModalOpen(true);

    return newTransaction;
  };

  // Void / Cancel Transaction
  const voidTransaction = (transactionId: string, reason: string): boolean => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.status === 'voided') return false;

    // 1. Mark transaction as voided
    setTransactionsState((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'voided',
              voidReason: reason,
              voidedAt: new Date().toISOString(),
            }
          : t
      )
    );

    // 2. Return stock
    setProductsState((prev) =>
      prev.map((prod) => {
        const itemMatch = tx.items.filter((item) => item.productId === prod.id);
        if (itemMatch.length > 0) {
          const qtyToRestore = itemMatch.reduce((sum, item) => sum + item.quantity, 0);
          return {
            ...prod,
            stock: prod.stock + qtyToRestore,
          };
        }
        return prod;
      })
    );

    // 3. Reverse customer points if applicable
    if (tx.customer) {
      setCustomersState((prev) =>
        prev.map((c) => {
          if (c.id === tx.customer!.id) {
            const pointsToRevert = tx.customer!.pointsEarned || 0;
            const pointsRedeemedRestored = tx.pointsRedeemed || 0;
            return {
              ...c,
              points: Math.max(0, c.points - pointsToRevert + pointsRedeemedRestored),
              totalSpent: Math.max(0, c.totalSpent - tx.grandTotal),
              visitsCount: Math.max(0, c.visitsCount - 1),
            };
          }
          return c;
        })
      );
    }

    // 4. Adjust cash drawer in current shift if cash
    if (currentShift && tx.paymentMethod === 'cash') {
      setCurrentShiftState((prev) => {
        if (!prev) return prev;
        const newTotalCashSales = Math.max(0, prev.totalCashSales - tx.grandTotal);
        const expectedCash = prev.startingCash + newTotalCashSales + prev.cashIn - prev.cashOut;
        return {
          ...prev,
          totalCashSales: newTotalCashSales,
          expectedCash,
        };
      });
    }

    return true;
  };

  // Product CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProd,
      id: `prod_${Date.now()}`,
    };
    setProductsState((prev) => [product, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProductsState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProductsState((prev) => prev.filter((p) => p.id !== id));
  };

  const quickRestockProduct = (id: string, qty: number) => {
    setProductsState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p))
    );
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}`,
    };
    setCategoriesState((prev) => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    if (id === 'all') return;
    setCategoriesState((prev) => prev.filter((c) => c.id !== id));
  };

  // Customer CRUD
  const addCustomer = (c: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'visitsCount' | 'joinedAt'>) => {
    const newCust: Customer = {
      ...c,
      id: `cust_${Date.now()}`,
      points: 50, // welcome bonus points
      totalSpent: 0,
      visitsCount: 0,
      tier: 'Silver',
      joinedAt: new Date().toISOString(),
    };
    setCustomersState((prev) => [newCust, ...prev]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomersState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Shift Management
  const openShift = (startingCash: number, cashierName: string) => {
    const newShift: Shift = {
      id: `shift_${Date.now()}`,
      cashierName,
      openedAt: new Date().toISOString(),
      startingCash,
      totalCashSales: 0,
      totalNonCashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      status: 'open',
    };
    setCurrentShiftState(newShift);
  };

  const closeShift = (actualCash: number, notes = '') => {
    if (!currentShift) return;
    const discrepancy = actualCash - currentShift.expectedCash;
    const closed: Shift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      actualCash,
      discrepancy,
      status: 'closed',
      notes,
    };
    setShiftsState((prev) => [closed, ...prev]);
    setCurrentShiftState(null);
  };

  const addCashMovement = (type: 'in' | 'out', amount: number, reason: string) => {
    if (!currentShift) return;
    const movement: CashMovement = {
      id: `mov_${Date.now()}`,
      shiftId: currentShift.id,
      type,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    setCashMovementsState((prev) => [movement, ...prev]);

    setCurrentShiftState((prev) => {
      if (!prev) return prev;
      const cashIn = type === 'in' ? prev.cashIn + amount : prev.cashIn;
      const cashOut = type === 'out' ? prev.cashOut + amount : prev.cashOut;
      const expectedCash = prev.startingCash + prev.totalCashSales + cashIn - cashOut;
      return {
        ...prev,
        cashIn,
        cashOut,
        expectedCash,
      };
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setStoreModeState('all');
    setSettingsState(initialStoreSettings);
    setProductsState(initialProducts);
    setCategoriesState(initialCategories);
    setCustomersState(initialCustomers);
    setTransactionsState(initialTransactions);
    setCurrentShiftState(initialShift);
    setShiftsState([]);
    setCashMovementsState([]);
    setHoldOrdersState([]);
    clearCart();
  };

  const exportDataJSON = (): string => {
    const backup = {
      settings,
      storeMode,
      products,
      categories,
      customers,
      transactions,
      shifts,
      currentShift,
      cashMovements,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProductsState(data.products);
      if (data.categories && Array.isArray(data.categories)) setCategoriesState(data.categories);
      if (data.customers && Array.isArray(data.customers)) setCustomersState(data.customers);
      if (data.transactions && Array.isArray(data.transactions)) setTransactionsState(data.transactions);
      if (data.settings) setSettingsState(data.settings);
      if (data.storeMode) setStoreModeState(data.storeMode);
      if (data.currentShift) setCurrentShiftState(data.currentShift);
      if (data.shifts) setShiftsState(data.shifts);
      if (data.cashMovements) setCashMovementsState(data.cashMovements);
      return true;
    } catch {
      return false;
    }
  };

  const openReceiptModal = (tx: Transaction) => {
    setReceiptTransaction(tx);
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        storeMode,
        setStoreMode,
        products,
        categories,
        customers,
        transactions,
        shifts,
        currentShift,
        cashMovements,
        settings,
        holdOrders,
        cart,
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
        orderNotes,
        setOrderNotes,
        subtotal,
        discountAmount,
        pointsDiscount,
        taxAmount,
        serviceAmount,
        grandTotal,
        totalItemsCount,
        addToCart,
        updateCartItemQty,
        updateCartItemNotes,
        updateCartItemDiscount,
        removeCartItem,
        clearCart,
        holdCurrentOrder,
        restoreHoldOrder,
        deleteHoldOrder,
        processPayment,
        voidTransaction,
        addProduct,
        updateProduct,
        deleteProduct,
        quickRestockProduct,
        addCategory,
        deleteCategory,
        addCustomer,
        updateCustomer,
        openShift,
        closeShift,
        addCashMovement,
        updateSettings,
        resetToDemoData,
        exportDataJSON,
        importDataJSON,
        receiptTransaction,
        isReceiptModalOpen,
        openReceiptModal,
        closeReceiptModal,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
