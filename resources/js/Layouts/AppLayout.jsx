import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';

export default function AppLayout({ title, children }) {
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
        {children}
      </main>
    </div>
  );
}