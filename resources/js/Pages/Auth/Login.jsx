import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <Head title="Masuk" />

      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-md p-6">
        
        {/* Header Bersih Tanpa List Biru */}
        <div className="mb-5 pb-3 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">
            Masuk Akun
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Email */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="nama@student.ums.ac.id"
              required
              autoFocus
              className={`w-full px-3 py-2 border rounded outline-none transition-colors ${
                errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.email && (
              <span className="text-[11px] text-rose-600 mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          {/* Kata Sandi dengan Ikon Mata */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className={`w-full pl-3 pr-9 py-2 border rounded outline-none transition-colors ${
                  errors.password ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-slate-900 bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5"
                tabIndex={-1}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-rose-600 mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          {/* Ingat Sesi Saya */}
          <div className="flex items-center text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 h-4 w-4"
              />
              <span>Ingat sesi saya</span>
            </label>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            {processing ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Belum punya akun?{' '}
          <a href="/register" className="font-semibold text-slate-900 hover:underline">
            Daftar
          </a>
        </div>

      </div>
    </div>
  );
}