import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, Activity, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Pemilihan Regio', subtitle: 'Pilih area muskuloskeletal' },
  { id: 2, title: 'Pemeriksaan Klinis', subtitle: 'Data subjektif & objektif' },
  { id: 3, title: 'Analisis & Rencana Terapi', subtitle: 'Klasifikasi ICF & FITT' },
];

const BODY_AREAS = [
  { key: 'cervical', label: 'Cervical / Leher', code: 'CER-01', desc: 'Diskus, radiks saraf, facet' },
  { key: 'shoulder', label: 'Shoulder / Bahu', code: 'SHL-02', desc: 'Rotator cuff, glenohumeral, AC joint' },
  { key: 'thoracal', label: 'Thoracal / Punggung Atas', code: 'THO-03', desc: 'Postur, skapula, kosta' },
  { key: 'lumbal', label: 'Lumbal / Punggung Bawah', code: 'LUM-04', desc: 'LBP, HNP, stabilitas lumbopelvic' },
  { key: 'hip', label: 'Hip / Panggul', code: 'HIP-05', desc: 'Pelvis, labrum, fleksor/abduktor' },
  { key: 'knee', label: 'Knee / Lutut', code: 'KNE-06', desc: 'Ligamen (ACL/PCL), meniskus, patella' },
  { key: 'ankle', label: 'Ankle & Foot', code: 'ANK-07', desc: 'Talokrural, ligamen, arkus pedis' },
];

const GUIDE_STEPS = [
  { id: '01', title: 'Pilih Regio Terkait', text: 'Tentukan area anatomi utama yang mengalami keluhan spesifik.' },
  { id: '02', title: 'Input Pengukuran Terstandar', text: 'Lengkapi vital sign, LGS (SFTR), grading MMT, dan special test.' },
  { id: '03', title: 'Generasi Diagnosis ICF', text: 'Sistem menyusun kode Body Function, Structure, dan Aktivitas.' },
  { id: '04', title: 'Program Intervensi', text: 'Perumusan dosis terapi berbasis frekuensi, intensitas, waktu, dan tipe.' },
];

export default function PhysioKitIndex() {
  const [selectedArea, setSelectedArea] = useState(null);
  const currentStep = 1;

  const handleNextStep = () => {
    if (!selectedArea) return;
    router.visit(`/physio-kit/assessment?area=${selectedArea}`);
  };

  return (
    <AppLayout title="Physio Kit - Pemilihan Regio">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Physio Kit Assessment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Modul evaluasi fisioterapi terintegrasi standar klasifikasi ICF.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  step.id === currentStep ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step.id}
              </span>
              <div>
                <p className={`text-xs font-bold tracking-wide uppercase ${
                  step.id === currentStep ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.subtitle}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight size={16} className="mx-4 hidden shrink-0 text-slate-300 sm:block" />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Pilih Regio Pemeriksaan
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BODY_AREAS.map(({ key, label, code, desc }) => {
            const isSelected = selectedArea === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedArea(key)}
                className={`flex flex-col justify-between border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">{code}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-cyan-600" />}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{label}</h3>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'font-semibold text-cyan-700' : 'text-slate-400'}>
                    {isSelected ? 'Terpilih' : 'Klik untuk memilih'}
                  </span>
                  <Activity size={12} className={isSelected ? 'text-cyan-600' : 'text-slate-300'} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-xs text-slate-500">
          {selectedArea ? `Regio aktif: ${selectedArea.toUpperCase()}` : 'Pilih regio sebelum melanjutkan.'}
        </span>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!selectedArea}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors ${
            selectedArea ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
          }`}
        >
          Lanjut ke Pemeriksaan
          <ChevronRight size={14} />
        </button>
      </div>
    </AppLayout>
  );
}