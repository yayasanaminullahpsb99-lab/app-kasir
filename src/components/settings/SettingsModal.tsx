import React, { useState } from 'react';
import {
  Settings,
  Store,
  Receipt,
  Volume2,
  Database,
  RotateCcw,
  Download,
  Upload,
  Check,
  Percent,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoData,
    exportDataJSON,
    importDataJSON,
  } = usePOS();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [taxPercent, setTaxPercent] = useState(settings.taxPercent);
  const [enableService, setEnableService] = useState(settings.enableService);
  const [servicePercent, setServicePercent] = useState(settings.servicePercent);
  const [receiptPaperWidth, setReceiptPaperWidth] = useState<'58mm' | '80mm'>(
    settings.receiptPaperWidth
  );
  const [enableSound, setEnableSound] = useState(settings.enableSound);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      storeTagline,
      address,
      phone,
      receiptFooter,
      enableTax,
      taxPercent,
      enableService,
      servicePercent,
      receiptPaperWidth,
      enableSound,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_kasirpro_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        alert('Data berhasil dipulihkan dari file backup!');
      } else {
        alert('Gagal memproses file backup. Pastikan format JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Pengaturan Toko & Sistem POS</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan identitas struk kasir, persentase pajak & biaya layanan, hardware printer, dan pencadangan data.
            </p>
          </div>

          {savedSuccess && (
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Pengaturan Tersimpan</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* SECTION 1: PROFIL TOKO */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Identitas & Profil Usaha</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nama Toko / Usaha *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Slogan / Kategori Usaha</label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  placeholder="Contoh: Coffee Roastery & Eatery"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">No. Telepon / WhatsApp Kasir</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Alamat Lengkap Toko</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">
                  Catatan Kaki Struk (Footer Cetak)
                </label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Ucapan terima kasih, info media sosial, atau kebijakan retur..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* SECTION 2: PAJAK & BIAYA LAYANAN */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Perhitungan Pajak & Biaya Layanan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pajak PPN */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Pajak Resto / PPN</span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTax}
                      onChange={(e) => setEnableTax(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-slate-300 font-medium">Aktifkan</span>
                  </label>
                </div>
                {enableTax && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-right"
                    />
                    <span className="text-slate-400 font-semibold">% dari subtotal</span>
                  </div>
                )}
              </div>

              {/* Service Charge */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Biaya Layanan (Service Charge)</span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableService}
                      onChange={(e) => setEnableService(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-slate-300 font-medium">Aktifkan</span>
                  </label>
                </div>
                {enableService && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      value={servicePercent}
                      onChange={(e) => setServicePercent(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-right"
                    />
                    <span className="text-slate-400 font-semibold">% (khusus F&B Dine-in)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* SECTION 3: STRUK & SUARA */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Printer Struk & Efek Suara Kasir</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Format Lebar Kertas Printer Thermal
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiptPaperWidth('58mm')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold ${
                      receiptPaperWidth === '58mm'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    58mm (Standar Mini POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptPaperWidth('80mm')}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold ${
                      receiptPaperWidth === '80mm'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    80mm (Lebar Epson/Star)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Efek Audio Suara Kasir
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200">
                    Aktifkan suara beep scanner & lonceng transaksi
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Simpan Perubahan Pengaturan
            </button>
          </div>
        </form>

        <div className="border-t border-slate-800 my-6" />

        {/* SECTION 4: DATA MANAGEMENT & BACKUP */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Pencadangan & Pemulihan Basis Data (Backup & Restore)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors flex flex-col justify-between"
            >
              <Download className="w-5 h-5 text-emerald-400 mb-2" />
              <div>
                <div className="font-bold text-slate-200 text-xs">Download Backup JSON</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Simpan seluruh data transaksi & katalog ke file lokal komputer
                </div>
              </div>
            </button>

            {/* Import */}
            <label className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors flex flex-col justify-between cursor-pointer">
              <Upload className="w-5 h-5 text-cyan-400 mb-2" />
              <div>
                <div className="font-bold text-slate-200 text-xs">Pulihkan dari Backup</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Import file JSON backup sebelumnya
                </div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                if (
                  confirm(
                    'Peringatan: Seluruh data transaksi, pelanggan, dan stok akan direset kembali ke data bawaan demo. Lanjutkan?'
                  )
                ) {
                  resetToDemoData();
                  alert('Data berhasil direset ke data demo bawaan!');
                }
              }}
              className="p-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/60 text-left transition-colors flex flex-col justify-between"
            >
              <RotateCcw className="w-5 h-5 text-rose-400 mb-2" />
              <div>
                <div className="font-bold text-rose-300 text-xs">Reset ke Data Demo</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Kembalikan sistem ke kondisi awal baru
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
