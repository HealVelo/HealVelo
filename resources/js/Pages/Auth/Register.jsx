import React, { useState, useMemo } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff, Check, ChevronDown } from 'lucide-react';

export default function Register({ supervisors = [] }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    role: 'mahasiswa',
    identifier_number: '',
    supervisor_id: supervisors[0]?.id || '',
    password: '',
    password_confirmation: '',
  });

  // Validasi real-time untuk indikator checklist kata sandi
  const rules = useMemo(() => {
    const pwd = data.password || '';
    return {
      hasMinLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      isMatching: pwd.length > 0 && pwd === data.password_confirmation,
    };
  }, [data.password, data.password_confirmation]);

  const preventClipboard = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/register');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <Head title="Pendaftaran Akun" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-md p-6">
        
        {/* Header Bersih Tanpa List Biru */}
        <div className="mb-5 pb-3 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900">
            Daftar Akun
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Nama Lengkap */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Afrizal Putra Pratama, S.Ft"
              required
              className={`w-full px-3 py-2 border rounded outline-none transition-colors ${
                errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.name && <span className="text-[11px] text-rose-600 mt-1 block">{errors.name}</span>}
          </div>

          {/* Peran & NIM/NIK */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Peran
              </label>
              <div className="relative">
                <select
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded outline-none focus:border-slate-900 bg-white cursor-pointer"
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="supervisor">Dosen / CI</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {data.role === 'mahasiswa' ? 'NIM' : 'NIK / NIDN'}
              </label>
              <input
                type="text"
                value={data.identifier_number}
                onChange={(e) => setData('identifier_number', e.target.value)}
                placeholder={data.role === 'mahasiswa' ? 'J120220...' : '198703...'}
                required
                className={`w-full px-3 py-2 font-mono border rounded outline-none transition-colors ${
                  errors.identifier_number ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-slate-900 bg-white'
                }`}
              />
              {errors.identifier_number && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.identifier_number}</span>
              )}
            </div>
          </div>

          {/* Dosen Pembimbing (Khusus Mahasiswa) */}
          {data.role === 'mahasiswa' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Dosen Pembimbing Klinis
              </label>
              <div className="relative">
                <select
                  value={data.supervisor_id}
                  onChange={(e) => setData('supervisor_id', e.target.value)}
                  required
                  className={`w-full appearance-none pl-3 pr-8 py-2 border rounded outline-none focus:border-slate-900 bg-white cursor-pointer ${
                    errors.supervisor_id ? 'border-rose-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Pilih Pembimbing --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.identifier_number || 'CI'})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
              {errors.supervisor_id && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.supervisor_id}</span>
              )}
            </div>
          )}

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
              className={`w-full px-3 py-2 border rounded outline-none transition-colors ${
                errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300 focus:border-slate-900 bg-white'
              }`}
            />
            {errors.email && <span className="text-[11px] text-rose-600 mt-1 block">{errors.email}</span>}
          </div>

          {/* Kolom Sandi & Ulangi Sandi (Anti Copy-Paste) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  onCopy={preventClipboard}
                  onPaste={preventClipboard}
                  onCut={preventClipboard}
                  placeholder="Min. 8 karakter"
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
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Ulangi Sandi
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  onCopy={preventClipboard}
                  onPaste={preventClipboard}
                  onCut={preventClipboard}
                  placeholder="Ulangi kata sandi"
                  required
                  className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded outline-none focus:border-slate-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5"
                  tabIndex={-1}
                  aria-label="Toggle confirm password"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {errors.password && (
            <span className="text-[11px] text-rose-600 block">{errors.password}</span>
          )}

          {/* Indikator Checklist Syarat Sandi */}
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5 text-[11px]">
            <span className="font-semibold text-slate-600 block text-[10px] uppercase tracking-wider">
              Kelayakan Kata Sandi:
            </span>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div className={`flex items-center gap-1.5 ${rules.hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check size={13} className={rules.hasMinLength ? 'text-emerald-600' : 'text-slate-300'} />
                <span>Min. 8 karakter</span>
              </div>

              <div className={`flex items-center gap-1.5 ${rules.hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check size={13} className={rules.hasUpper ? 'text-emerald-600' : 'text-slate-300'} />
                <span>Huruf besar (A-Z)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${rules.hasLower ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check size={13} className={rules.hasLower ? 'text-emerald-600' : 'text-slate-300'} />
                <span>Huruf kecil (a-z)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${rules.hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                <Check size={13} className={rules.hasNumber ? 'text-emerald-600' : 'text-slate-300'} />
                <span>Angka (0-9)</span>
              </div>
            </div>

            {data.password_confirmation && (
              <div className={`pt-1 border-t border-slate-200/60 flex items-center gap-1.5 ${rules.isMatching ? 'text-emerald-700 font-medium' : 'text-rose-600'}`}>
                <Check size={13} className={rules.isMatching ? 'text-emerald-600' : 'text-rose-400'} />
                <span>{rules.isMatching ? 'Konfirmasi kata sandi cocok' : 'Konfirmasi belum sesuai'}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium rounded transition-colors disabled:opacity-50 mt-2"
          >
            {processing ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <a href="/login" className="font-semibold text-slate-900 hover:underline">
            Masuk
          </a>
        </div>

      </div>
    </div>
  );
}