import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Divide,
  CheckCircle,
  Delete,
  Plus,
  Trash2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod, SplitPaymentDetail } from '../../types/pos';
import { formatRupiah } from '../../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { grandTotal, processPayment, settings } = usePOS();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('cash');

  // Cash tender state
  const [cashGiven, setCashGiven] = useState<number>(grandTotal);
  const [customCashInput, setCustomCashInput] = useState<string>(grandTotal.toString());

  // QRIS state
  const [qrisStatus, setQrisStatus] = useState<'pending' | 'scanning' | 'success'>('pending');

  // Card tender state
  const [cardBank, setCardBank] = useState('BCA');
  const [cardLastDigits, setCardLastDigits] = useState('');
  const [cardRefNo, setCardRefNo] = useState('');

  // E-Wallet state
  const [ewalletProvider, setEwalletProvider] = useState('GoPay');
  const [ewalletRef, setEwalletRef] = useState('');

  // Split bill state
  const [splitDetails, setSplitDetails] = useState<SplitPaymentDetail[]>([
    { method: 'cash', amount: Math.floor(grandTotal / 2) },
    { method: 'qris', amount: grandTotal - Math.floor(grandTotal / 2) },
  ]);

  if (!isOpen) return null;

  // Change amount
  const changeAmount = Math.max(0, cashGiven - grandTotal);
  const isCashSufficient = cashGiven >= grandTotal;

  // Split sum
  const splitTotal = splitDetails.reduce((sum, s) => sum + s.amount, 0);
  const splitRemaining = grandTotal - splitTotal;

  // Quick cash options
  const quickCashOptions = [
    grandTotal, // Uang pas
    Math.ceil(grandTotal / 10000) * 10000, // round up 10k
    Math.ceil(grandTotal / 50000) * 50000, // round up 50k
    100000,
    200000,
  ].filter((val, idx, arr) => val >= grandTotal && arr.indexOf(val) === idx);

  const handleCashKeypad = (val: string) => {
    if (val === 'C') {
      setCustomCashInput('0');
      setCashGiven(0);
    } else if (val === 'backspace') {
      const next = customCashInput.length > 1 ? customCashInput.slice(0, -1) : '0';
      setCustomCashInput(next);
      setCashGiven(parseInt(next, 10) || 0);
    } else {
      const next = customCashInput === '0' ? val : customCashInput + val;
      if (next.length <= 9) {
        setCustomCashInput(next);
        setCashGiven(parseInt(next, 10) || 0);
      }
    }
  };

  const handleSelectQuickCash = (amt: number) => {
    setCashGiven(amt);
    setCustomCashInput(amt.toString());
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  const handleFinishPayment = () => {
    if (activeMethod === 'cash') {
      if (!isCashSufficient) return;
      processPayment({
        paymentMethod: 'cash',
        cashPaid: cashGiven,
        changeAmount,
      });
    } else if (activeMethod === 'qris') {
      processPayment({
        paymentMethod: 'qris',
      });
    } else if (activeMethod === 'debit' || activeMethod === 'credit') {
      processPayment({
        paymentMethod: activeMethod,
        splitDetails: [{
          method: activeMethod,
          amount: grandTotal,
          referenceNo: `${cardBank}-${cardLastDigits || 'XXXX'}`,
        }],
      });
    } else if (activeMethod === 'ewallet') {
      processPayment({
        paymentMethod: 'ewallet',
        splitDetails: [{
          method: 'ewallet',
          amount: grandTotal,
          referenceNo: `${ewalletProvider}-${ewalletRef || 'OK'}`,
        }],
      });
    } else if (activeMethod === 'split') {
      if (splitRemaining !== 0) return;
      processPayment({
        paymentMethod: 'split',
        splitDetails,
      });
    }

    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <div className="text-xs text-slate-400 font-medium">Proses Pembayaran</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {formatRupiah(grandTotal)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'cash', label: 'Tunai', icon: Banknote },
            { id: 'qris', label: 'QRIS', icon: QrCode },
            { id: 'debit', label: 'Debit / Kartu', icon: CreditCard },
            { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
            { id: 'split', label: 'Split Bill', icon: Divide },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeMethod === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMethod(item.id as PaymentMethod)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isSelected
                    ? 'border-emerald-400 text-emerald-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: TUNAI */}
          {activeMethod === 'cash' && (
            <div className="space-y-4">
              {/* Quick Cash Buttons */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Pilihan Cepat Nominal Uang:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickCashOptions.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleSelectQuickCash(amt)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                        cashGiven === amt
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {amt === grandTotal ? 'Uang Pas: ' : ''}
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash given & Change display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                  <div className="text-[11px] text-slate-400">Uang Diterima:</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {formatRupiah(cashGiven)}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    isCashSufficient
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="text-[11px] text-slate-400">
                    {isCashSufficient ? 'Kembalian:' : 'Kurang:'}
                  </div>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      isCashSufficient ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(isCashSufficient ? changeAmount : grandTotal - cashGiven)}
                  </div>
                </div>
              </div>

              {/* On-screen Keypad */}
              <div className="pt-2">
                <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                  Input Manual via Keypad:
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'backspace'].map(
                    (key) => (
                      <button
                        key={key}
                        onClick={() => handleCashKeypad(key)}
                        className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-sm border border-slate-700/60 active:scale-95 transition-transform flex items-center justify-center"
                      >
                        {key === 'backspace' ? <Delete className="w-4 h-4" /> : key}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QRIS */}
          {activeMethod === 'qris' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/40 max-w-xs">
                {/* Simulated QR Code SVG */}
                <div className="w-48 h-48 bg-white flex flex-col items-center justify-center relative">
                  <svg className="w-44 h-44 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code decorative modules */}
                    <path d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                    <path d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                    <path d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="48" y="14" width="8" height="6" />
                    <rect x="12" y="38" width="6" height="8" />
                    <rect x="24" y="44" width="8" height="6" />
                    <rect x="38" y="36" width="24" height="24" className="text-emerald-600 fill-current" />
                    <rect x="42" y="40" width="16" height="16" fill="white" />
                    <path d="M48,44 h4 v8 h-4 z" className="text-emerald-600 fill-current" />
                    <rect x="68" y="42" width="12" height="6" />
                    <rect x="42" y="68" width="10" height="8" />
                    <rect x="58" y="74" width="14" height="8" />
                    <rect x="78" y="70" width="12" height="12" />
                    <rect x="88" y="86" width="8" height="8" />
                  </svg>
                  <div className="text-[10px] font-black text-slate-800 tracking-wider mt-1">
                    QRIS · STANDAR PEMBAYARAN NASIONAL
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-200">
                  {settings.qrisMerchantName || 'KASIRPRO JAKARTA'}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  NMID: {settings.qrisNmid || 'ID1020304050607'}
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                  {formatRupiah(grandTotal)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQrisStatus('scanning');
                    setTimeout(() => setQrisStatus('success'), 1200);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    qrisStatus === 'success'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {qrisStatus === 'scanning'
                    ? 'Memeriksa pembayaran...'
                    : qrisStatus === 'success'
                    ? '✓ Pembayaran Berhasil Diterima'
                    : 'Simulasi Verifikasi QRIS'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KARTU DEBIT / KREDIT */}
          {(activeMethod === 'debit' || activeMethod === 'credit') && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Pilih Mesin EDC / Bank Penerbit:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga', 'Lainnya'].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setCardBank(bank)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        cardBank === bank
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    4 Digit Terakhir Kartu:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Contoh: 8842"
                    value={cardLastDigits}
                    onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">
                    No. Ref / Approval Code:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 124890"
                    value={cardRefNo}
                    onChange={(e) => setCardRefNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-400">
                Gesek atau tap kartu pelanggan pada terminal EDC, lalu catat kode approval struk EDC di atas untuk arsip kasir.
              </div>
            </div>
          )}

          {/* TAB 4: E-WALLET */}
          {activeMethod === 'ewallet' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Pilih Dompet Digital:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['GoPay', 'OVO', 'ShopeePay', 'DANA'].map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => setEwalletProvider(wallet)}
                      className={`p-3 rounded-xl text-xs font-semibold border transition-all ${
                        ewalletProvider === wallet
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {wallet}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  No. HP Akun / ID Transaksi E-Wallet:
                </label>
                <input
                  type="text"
                  placeholder="081234567890 atau TR-EWAL-001"
                  value={ewalletRef}
                  onChange={(e) => setEwalletRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SPLIT BILL */}
          {activeMethod === 'split' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Daftar Pembagian Pembayaran:
                </span>
                <button
                  onClick={() =>
                    setSplitDetails((prev) => [
                      ...prev,
                      { method: 'cash', amount: Math.max(0, splitRemaining) },
                    ])
                  }
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Jalur</span>
                </button>
              </div>

              <div className="space-y-2">
                {splitDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-3"
                  >
                    <select
                      value={item.method}
                      onChange={(e) => {
                        const val = e.target.value as PaymentMethod;
                        setSplitDetails((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, method: val } : s))
                        );
                      }}
                      className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="cash">Tunai</option>
                      <option value="qris">QRIS</option>
                      <option value="debit">Kartu Debit</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>

                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setSplitDetails((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, amount: val } : s))
                        );
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-right"
                    />

                    {splitDetails.length > 1 && (
                      <button
                        onClick={() =>
                          setSplitDetails((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between text-xs">
                <span className="text-slate-400">Sisa Belum Terbayar:</span>
                <span
                  className={`font-mono font-bold ${
                    splitRemaining === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatRupiah(splitRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
          >
            Batal
          </button>

          <button
            onClick={handleFinishPayment}
            disabled={
              (activeMethod === 'cash' && !isCashSufficient) ||
              (activeMethod === 'split' && splitRemaining !== 0)
            }
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
