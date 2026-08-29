import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';

export default function AppLayout({ title, children }) {
  return (
    <div className="relative flex min-h-screen bg-slate-50">
      <Head title={title} />

      
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-112 w-md rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
      </div>

      <Navbar />
      <main className="flex-1 overflow-y-auto px-10 py-8 pb-28 md:pb-8">{children}</main>
    </div>
  );
}
