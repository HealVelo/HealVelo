import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { 
  Search, 
  TrendingUp, 
  Plus, 
  User, 
  ChevronRight, 
  X 
} from 'lucide-react';

const GERAKAN_DEFAULT = ['Fleksi', 'Ekstensi', 'Abduksi', 'Adduksi', 'Eksorotasi', 'Endorotasi'];

export default function ProgressTrackingIndex({ patients = [], selectedPatient = null, evaluations = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState('gmfm'); // 'gmfm' | 'nrs'

  // Batas tanggal validasi
  const todayStr = new Date().toISOString().substring(0, 10);
  const patientRegisteredDate = selectedPatient?.created_at 
    ? selectedPatient.created_at.substring(0, 10) 
    : '2020-01-01';

  // Filter daftar pasien secara real-time
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.no_rm?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Penomoran sesi berikutnya
  const nextSessionNumber = (evaluations?.length || 0) + 1;
  const nextSessionCode = `T${nextSessionNumber}`;

  // Form Evaluasi Sesi Baru
  const { data, setData, processing, errors, reset, setError, clearErrors } = useForm({
    patient_id: selectedPatient?.id || '',
    session_code: nextSessionCode,
    evaluation_date: todayStr,
    pain_nrs: { diam: 0, tekan: 0, gerak: 0 },
    mmt_records: GERAKAN_DEFAULT.map((g) => ({ gerakan: g, dex: 5, sin: 5 })),
    lgs_records: { ekstensi_fleksi: 'S: 0-0-130', abduksi_adduksi: 'F: 130-0-30' },
    gmfm_score: '',
    ashworth_score: 'Grade 0 (Normal)',
    clinical_notes: '',
  });

  // Handler Nilai NRS Terkunci Ketat: 0 - 10
  const handleNrsChange = (field, rawValue) => {
    if (rawValue === '') {
      setData('pain_nrs', { ...data.pain_nrs, [field]: '' });
      return;
    }
    let val = parseInt(rawValue, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 10) val = 10;

    clearErrors(`pain_nrs.${field}`);
    setData('pain_nrs', { ...data.pain_nrs, [field]: val });
  };

  // Handler Nilai GMFM Terkunci Ketat: 0.0 - 100.0%
  const handleGmfmChange = (rawValue) => {
    if (rawValue === '') {
      setData('gmfm_score', '');
      return;
    }
    let val = parseFloat(rawValue);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;

    clearErrors('gmfm_score');
    setData('gmfm_score', val);
  };

  const handleSelectPatient = (id) => {
    router.visit(`/progress-tracking?patient_id=${id}`, { preserveState: true });
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();

    // Validasi Catatan Klinis
    if (!data.clinical_notes || data.clinical_notes.trim().length < 5) {
      setError('clinical_notes', 'Catatan evaluasi wajib diisi minimal 5 karakter kalimat deskriptif.');
      return;
    }

    // Validasi Skor GMFM
    if (data.gmfm_score === '' || isNaN(data.gmfm_score)) {
      setError('gmfm_score', 'Skor GMFM wajib diisi dengan nilai antara 0 - 100%.');
      return;
    }

    // Payload eksplisit memastikan evaluation_date dan session_name terkirim utuh
    const payload = {
      ...data,
      patient_id: selectedPatient?.id || data.patient_id,
      session_name: data.session_code || nextSessionCode,
      evaluation_date: data.evaluation_date || todayStr,
    };

    router.post('/progress-tracking', payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  // Data time-series evaluasi
  const timelineData = useMemo(() => {
    if (evaluations && evaluations.length > 0) {
      return evaluations.map((ev) => ({
        session: ev.session_name || ev.session_code || 'T1',
        date: ev.evaluation_date ? String(ev.evaluation_date).substring(0, 10) : todayStr,
        gmfm: Number(ev.gmfm_score) || 0,
        pain: Number(ev.pain_nrs?.gerak) || 0,
        ashworth: ev.ashworth_score || 'Grade 0',
        notes: ev.clinical_notes || '',
      }));
    }
    return [
      { session: 'T1', date: '2026-08-15', gmfm: 65, pain: 6, ashworth: 'Grade 2 (Sedang)', notes: 'Nyeri gerak saat fleksi lumbal masih dominan.' },
      { session: 'T2', date: '2026-08-22', gmfm: 75.5, pain: 4, ashworth: 'Grade 1 (Ringan)', notes: 'Ketegangan otot berkurang paska stretching.' },
      { session: 'T3', date: '2026-08-29', gmfm: 88, pain: 2, ashworth: 'Grade 0 (Normal)', notes: 'Pasien mampu duduk bekerja dengan core stability meningkat.' },
    ];
  }, [evaluations, todayStr]);

  // Kalkulasi Chart SVG Responsif
  const chartWidth = 560;
  const chartHeight = 160;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 30;

  const chartPoints = useMemo(() => {
    return timelineData.map((item, idx) => {
      const x = padLeft + (idx * (chartWidth - padLeft - padRight)) / (timelineData.length - 1 || 1);
      const val = activeMetricTab === 'gmfm' ? item.gmfm : item.pain;
      
      // Rentang skala akurat: GMFM (0 s/d 100%), NRS (0 s/d 10)
      const minVal = 0;
      const maxVal = activeMetricTab === 'gmfm' ? 100 : 10;
      
      const boundedVal = Math.min(Math.max(val, minVal), maxVal);
      const y = (chartHeight - padBottom) - ((boundedVal - minVal) / (maxVal - minVal)) * (chartHeight - padTop - padBottom);
      
      return { x, y, val, item };
    });
  }, [timelineData, activeMetricTab]);

  const lineD = chartPoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  return (
    <AppLayout title="Progress Tracking (Evaluation)">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Modul */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={22} />
              Progress Tracking & Evaluasi Pasien
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau perkembangan klinis per sesi terapi ($T_1, T_2, T_3, \dots$) secara berkala dan visual.
            </p>
          </div>

          {selectedPatient && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={15} /> Catat Evaluasi ({nextSessionCode})
            </Button>
          )}
        </div>

        {/* Layout Split Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SISI KIRI: DIREKTORI PENCARIAN PASIEN (4 Kolom) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pilih Pasien Terdaftar
              </h2>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {patients.length} Total
              </span>
            </div>

            {/* Input Pencarian Cepat */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau No. RM..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* List Pasien */}
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const isSelected = selectedPatient?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPatient(p.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-400 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`h-9 w-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <strong className={`block text-xs truncate ${isSelected ? 'text-blue-950 font-bold' : 'text-slate-900 font-semibold'}`}>
                            {p.name}
                          </strong>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            RM: {p.no_rm || '-'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={15} className={isSelected ? 'text-blue-600' : 'text-slate-300'} />
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Pasien tidak ditemukan.
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: DETAIL TRACKING & EVALUASI (8 Kolom) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedPatient ? (
              <>
                {/* Banner Profil Pasien Terpilih */}
                <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md">
                        Pasien Aktif
                      </span>
                      <span className="text-xs text-slate-300 font-mono">ID #{selectedPatient.id}</span>
                    </div>
                    <h2 className="text-lg font-extrabold">{selectedPatient.name}</h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      No. RM: <strong className="text-white font-mono">{selectedPatient.no_rm || '-'}</strong> | {selectedPatient.gender} | {selectedPatient.age} Tahun
                    </p>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Diagnosis Rujukan</span>
                    <strong className="text-xs text-blue-200 block max-w-xs truncate">
                      {selectedPatient.medical_diagnosis || 'Belum ada rujukan diagnosis'}
                    </strong>
                  </div>
                </div>

                {/* Grafik Visual Kurva Pemulihan */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Grafik Perkembangan Terapi
                      </h3>
                      <p className="text-[11px] text-slate-400">Tren perubahan nilai motorik dan penurunan nyeri</p>
                    </div>

                    <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs self-start">
                      <button
                        type="button"
                        onClick={() => setActiveMetricTab('gmfm')}
                        className={`px-3 py-1 font-bold rounded-lg transition-all ${
                          activeMetricTab === 'gmfm' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        GMFM Motorik (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMetricTab('nrs')}
                        className={`px-3 py-1 font-bold rounded-lg transition-all ${
                          activeMetricTab === 'nrs' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Skala Nyeri (NRS)
                      </button>
                    </div>
                  </div>

                  {/* SVG Chart Tanpa Overflow Menabrak */}
                  <div className="w-full h-52 bg-slate-50/50 border border-slate-100 rounded-xl pt-2 overflow-hidden relative">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                      {[0.2, 0.45, 0.7].map((r, i) => (
                        <line 
                          key={i} 
                          x1={padLeft} 
                          y1={chartHeight * r} 
                          x2={chartWidth - padRight} 
                          y2={chartHeight * r} 
                          stroke="#e2e8f0" 
                          strokeDasharray="3 3" 
                        />
                      ))}
                      <path 
                        d={lineD} 
                        fill="none" 
                        stroke={activeMetricTab === 'gmfm' ? '#2563eb' : '#e11d48'} 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      {chartPoints.map((pt, idx) => (
                        <g key={idx}>
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="4.5" 
                            fill="#ffffff" 
                            stroke={activeMetricTab === 'gmfm' ? '#2563eb' : '#e11d48'} 
                            strokeWidth="2.5" 
                          />
                          <text 
                            x={pt.x} 
                            y={pt.y - 8} 
                            textAnchor="middle" 
                            className="text-[10px] font-mono font-bold fill-slate-800"
                          >
                            {pt.val}{activeMetricTab === 'gmfm' ? '%' : ''}
                          </text>
                          <text 
                            x={pt.x} 
                            y={chartHeight - 8} 
                            textAnchor="middle" 
                            className="text-[9px] font-mono font-bold fill-slate-400"
                          >
                            {pt.item.session}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Kartu Ringkasan Sesi Fleksibel */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {timelineData.map((d, index) => (
                      <div key={index} className="border border-slate-200 bg-white p-3 rounded-xl text-center shadow-xs">
                        <span className="text-[10px] font-mono font-bold text-blue-700 block truncate">
                          {d.session} ({d.date.substring(5)})
                        </span>
                        <strong className="text-sm font-extrabold text-slate-900 block my-0.5">
                          {activeMetricTab === 'gmfm' ? `${d.gmfm}%` : `Nyeri: ${d.pain}/10`}
                        </strong>
                        <span className="text-[10px] text-slate-400 block font-mono truncate" title={d.ashworth}>
                          {d.ashworth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matriks Komparasi Tabel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Matriks Komparasi Antar Sesi Kunjungan
                  </h3>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5 text-left w-1/4 border-r border-slate-700">Parameter</th>
                          {timelineData.map((d, idx) => (
                            <th key={idx} className="px-4 py-2.5 text-center border-r border-slate-700 last:border-r-0 bg-blue-900">
                              {d.session} ({d.date.substring(5)})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-100">GMFM Motorik</td>
                          {timelineData.map((d, i) => (
                            <td key={i} className="px-4 py-2.5 text-center font-mono font-bold text-blue-700 border-r border-slate-100 last:border-r-0">
                              {d.gmfm}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-100">Nyeri Gerak (NRS)</td>
                          {timelineData.map((d, i) => (
                            <td key={i} className="px-4 py-2.5 text-center font-mono font-bold text-rose-600 border-r border-slate-100 last:border-r-0">
                              {d.pain} / 10
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-100">Spastisitas Ashworth</td>
                          {timelineData.map((d, i) => (
                            <td key={i} className="px-4 py-2.5 text-center font-mono text-slate-800 border-r border-slate-100 last:border-r-0">
                              {d.ashworth}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-bold text-slate-700 bg-slate-50 border-r border-slate-100">Catatan Terapis</td>
                          {timelineData.map((d, i) => (
                            <td key={i} className="px-4 py-2.5 text-slate-600 italic text-[11px] border-r border-slate-100 last:border-r-0">
                              {d.notes || '-'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <User size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Pilih Pasien Terlebih Dahulu</h3>
                <p className="text-xs text-slate-400 mt-1">Pilih salah satu pasien di daftar sebelah kiri untuk melihat evaluasi berkala.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL INPUT SESI EVALUASI BARU (DENGAN VALIDASI KETAT)   */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-xl w-full my-8 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Tambah Sesi Evaluasi ({data.session_code})
                </h3>
                <p className="text-xs text-slate-500">Pasien: <strong className="text-slate-800">{selectedPatient?.name}</strong></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Header Sesi & Tanggal (Terkunci Min & Max) */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 border border-blue-200 p-3 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">Kode Sesi</label>
                  <input
                    type="text"
                    value={data.session_code}
                    onChange={(e) => setData('session_code', e.target.value)}
                    required
                    placeholder="Contoh: T1, T2, T3"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold bg-white outline-none focus:border-blue-600"
                  />
                  {errors.session_code && <span className="text-[10px] text-red-600 mt-1 block">{errors.session_code}</span>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-blue-900 mb-1">Tanggal Evaluasi</label>
                  <input
                    type="date"
                    min={patientRegisteredDate}
                    max={todayStr}
                    value={data.evaluation_date || todayStr}
                    onChange={(e) => setData('evaluation_date', e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white outline-none focus:border-blue-600"
                  />
                  {errors.evaluation_date && <span className="text-[10px] text-red-600 mt-1 block">{errors.evaluation_date}</span>}
                </div>
              </div>

              {/* 1. Evaluasi Nyeri (NRS) - Kunci 0 sampai 10 */}
              <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/40">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
                  <span className="font-bold uppercase text-slate-800 text-[11px]">
                    Skala Nyeri NRS
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Rentang 0 - 10</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-semibold mb-1">Diam (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={data.pain_nrs.diam}
                      onChange={(e) => handleNrsChange('diam', e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 text-center font-mono font-bold text-xs focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-semibold mb-1">Tekan (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={data.pain_nrs.tekan}
                      onChange={(e) => handleNrsChange('tekan', e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 text-center font-mono font-bold text-xs focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-semibold mb-1">Gerak (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={data.pain_nrs.gerak}
                      onChange={(e) => handleNrsChange('gerak', e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-lg p-2 text-center font-mono font-bold text-xs focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Uji Fungsional & Spastisitas - Kunci GMFM 0.0 - 100.0% */}
              <div className="grid grid-cols-2 gap-3 border border-slate-200 p-3.5 rounded-xl bg-slate-50/40">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    GMFM Motorik (%) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Nilai 0 - 100 (cth: 70.4)"
                    value={data.gmfm_score}
                    onChange={(e) => handleGmfmChange(e.target.value)}
                    required
                    className={`w-full border rounded-lg p-2 text-xs font-mono font-bold bg-white outline-none ${
                      errors.gmfm_score ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                  {errors.gmfm_score && <span className="text-[10px] text-red-600 mt-1 block">{errors.gmfm_score}</span>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                    Skala Ashworth (Spastisitas)
                  </label>
                  <select
                    value={data.ashworth_score}
                    onChange={(e) => setData('ashworth_score', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:border-blue-600 outline-none"
                  >
                    <option value="Grade 0 (Normal)">Grade 0 (Tonus Normal)</option>
                    <option value="Grade 1 (Ringan)">Grade 1 (Tahanan Ringan Akhir ROM)</option>
                    <option value="Grade 1+ (Ringan-Sedang)">Grade 1+ (Tahanan Ringan &lt; 50% ROM)</option>
                    <option value="Grade 2 (Sedang)">Grade 2 (Tonus Meningkat Nyata)</option>
                    <option value="Grade 3 (Berat)">Grade 3 (Tonus Berat, Gerak Sulit)</option>
                    <option value="Grade 4 (Kaku Rigid)">Grade 4 (Kaku Rigid Ekstensi/Fleksi)</option>
                  </select>
                </div>
              </div>

              {/* 3. Catatan Klinis */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                  Catatan Klinis Evaluasi <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="3"
                  value={data.clinical_notes}
                  onChange={(e) => {
                    clearErrors('clinical_notes');
                    setData('clinical_notes', e.target.value);
                  }}
                  required
                  placeholder="Wajib diisi: Jelaskan respon pasien, peningkatan mobilitas sendi, atau anjuran latihan rumah..."
                  className={`w-full border rounded-lg p-2.5 text-xs outline-none ${
                    errors.clinical_notes ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
                {errors.clinical_notes && (
                  <span className="text-[10px] text-red-600 mt-1 block font-medium">
                    {errors.clinical_notes}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={processing}>
                  Simpan Sesi Evaluasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppLayout>
  );
}