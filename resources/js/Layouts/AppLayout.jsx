import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function AppLayout({ title, children }) {
  const { flash } = usePage().props;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [flash?.success, flash?.warning, flash?.error]);

  const activeMessage = !dismissed ? (flash?.success || flash?.warning || flash?.error) : null;
  const isWarning = Boolean(flash?.warning || flash?.error);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-white">
      <Head title={title ? `${title} - EasyFisio` : 'EasyFisio Management'} />

      {/* Background Glow Bersih Sesuai Palet HealVelo (Disembunyikan saat Cetak) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-112 w-96 rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      {/* Navigasi / Sidebar (Disembunyikan saat Cetak) */}
      <div className="print:hidden shrink-0">
        <Navbar />
      </div>

      {/* Konten Halaman Utama */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-6 pb-24 md:pb-10 print:p-0 print:m-0 print:overflow-visible">
        {activeMessage && (
          <div
            className={`mb-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-medium shadow-2xs print:hidden ${
              isWarning
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {isWarning ? (
                <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              )}
              <span>{activeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Tutup notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}