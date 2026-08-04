import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutGrid,
  Users,
  Activity,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Physio Kit', href: '/physio-kit', icon: Activity },
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
      {/* Sidebar - desktop only, liquid glass style */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col justify-between self-start overflow-hidden rounded-[28px] border border-white/60 bg-linear-to-b from-white/70 via-white/40 to-white/50 px-4 py-6 shadow-[0_8px_32px_rgba(124,58,237,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 md:ml-6 md:flex">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/50 to-transparent" />
        <div>
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white shadow-md shadow-violet-300">
              H
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">HealVelo</p>
              <p className="text-xs text-violet-500">Physio Platform</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-300'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => router.post('/logout')}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50/70"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </aside>

      {/* Bottom nav - mobile only, iOS liquid glass style */}
      <nav
        className={`fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transition-transform duration-300 ease-in-out md:hidden ${
          visible ? 'translate-y-0' : 'translate-y-32'
        }`}
      >
        <div className="flex items-center justify-around rounded-[28px] border border-white/50 bg-white/50 px-3 py-3 shadow-[0_8px_32px_rgba(124,58,237,0.15)] backdrop-blur-2xl backdrop-saturate-150">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all ${
                  active ? 'text-violet-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    active ? 'bg-violet-600 text-white shadow-md shadow-violet-300' : ''
                  }`}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-violet-600' : 'text-slate-500'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}