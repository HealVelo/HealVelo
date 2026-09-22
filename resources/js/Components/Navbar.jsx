import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutGrid,
  Users,
  Activity,
  TrendingUp,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Physio Kit', href: '/physio-kit', icon: Activity },
  { label: 'Progress Tracking', href: '/progress-tracking', icon: TrendingUp },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const { url } = usePage();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isActive = (href) => url === href || url.startsWith(href + '/');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Sidebar Navigasi Desktop - Glassmorphism HealVelo */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col justify-between self-start overflow-hidden rounded-[28px] border border-white/70 bg-linear-to-b from-white/80 via-white/50 to-white/60 px-4 py-6 shadow-[0_8px_32px_rgba(2,132,199,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 md:ml-6 md:flex print:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/60 to-transparent" />
        <div>
          {/* Logo & Brand HealVelo */}
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 text-sm font-bold text-white shadow-md shadow-cyan-500/25">
              H
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900">HealVelo</p>
              <p className="text-[11px] font-semibold text-cyan-600">Physio Management</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tombol Logout */}
        <button
          type="button"
          onClick={() => router.post('/logout')}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50/80 transition-colors"
        >
          <LogOut size={17} strokeWidth={2} />
          Logout
        </button>
      </aside>

      {/* Floating Bottom Nav - Mobile Phone Glass Style */}
      <nav
        className={`fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-transform duration-300 ease-in-out md:hidden print:hidden ${
          visible ? 'translate-y-0' : 'translate-y-32'
        }`}
      >
        <div className="flex items-center justify-around rounded-[26px] border border-white/60 bg-white/70 px-2 py-2 shadow-[0_8px_32px_rgba(2,132,199,0.15)] backdrop-blur-2xl backdrop-saturate-150">
          {NAV_ITEMS.slice(0, 4).map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 transition-all ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                    active ? 'bg-linear-to-tr from-cyan-600 to-blue-600 text-white shadow-xs' : ''
                  }`}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                  {label === 'Progress Tracking' ? 'Progress' : label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}