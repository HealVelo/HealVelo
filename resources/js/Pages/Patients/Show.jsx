import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { 
  ArrowLeft, 
  Stethoscope, 
  TrendingUp, 
  FileText, 
  Download, 
  Calendar, 
  ChevronRight,
  User,
  Hospital,
  X,
  Activity,
  CheckCircle2
} from 'lucide-react';

const REGIO_OPTIONS = [
  {
    id: 'pediatric_full_body',
    title: 'Pediatrik / Kasus Kompleks',
    desc: 'Cerebral Palsy, keterlambatan tumbuh kembang, dan spastisitas umum.',
    badge: 'Pediatrik',
  },
  {
    id: 'lumbal_spine',
    title: 'Lumbal Spine & Pelvis',
    desc: 'Low Back Pain (LBP), Ischialgia, HNP, dan spasme erector spinae.',
    badge: 'Muskuloskeletal',
  },
  {
    id: 'cervical_spine',
    title: 'Cervical & Thoracal',
    desc: 'Cervical Root Syndrome, Tortikolis, dan spasme upper trapezius.',
    badge: 'Spine',
  },
  {
    id: 'shoulder',
    title: 'Shoulder Complex',
    desc: 'Frozen Shoulder, Tendinitis Supraspinatus, dan impingement.',
    badge: 'Ekstremitas Atas',
  },
  {
    id: 'knee',
    title: 'Knee Joint',
    desc: 'Osteoarthritis (OA) Genu, cedera ACL/PCL, dan strain ligamen.',
    badge: 'Ekstremitas Bawah',
  },
  {
    id: 'ankle_foot',
    title: 'Ankle & Foot',
    desc: 'Sprain ankle, Plantar Fasciitis, dan koreksi drop foot.',
    badge: 'Ekstremitas Bawah',
  },
];

export default function PatientShow({ patient }) {
  const [isRegioModalOpen, setIsRegioModalOpen] = useState(false);
  const [selectedRegio, setSelectedRegio] = useState('lumbal_spine');

  const registeredDateStr = patient.created_at ? patient.created_at.substring(0, 10) : '-';

  const handleStartAssessment = () => {
    setIsRegioModalOpen(false);
    router.visit(`/physio-kit/assessment?area=${selectedRegio}&patient_id=${patient.id}`);
  };

  return (
    <AppLayout title={`Rekam Medis - ${patient.name}`}>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        
        {/* TOP BAR: Breadcrumb & Tombol Aksi Utama */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <a 
              href="/patients" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition-colors"
            >
              <ArrowLeft size={14} /> Kembali ke Direktori Pasien
            </a>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Rekam Medis Pasien
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Terdaftar sejak: {registeredDateStr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href={`/progress-tracking?patient_id=${patient.id}`}>
              <Button variant="outline" className="text-xs">
                <TrendingUp size={14} className="text-blue-600" />
                Progress Tracking (Evaluation)[cite: 2]
              </Button>
            </a>
            <Button 
              variant="primary" 
              className="text-xs" 
              onClick={() => setIsRegioModalOpen(true)}
            >
              <Stethoscope size={14} />
              Buat Assessment Baru
            </Button>
          </div>
        </div>

        {/* HERO CARD: Ringkasan Identitas Pasien */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
              {patient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{patient.name}</h2>
                <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-xs border border-blue-200">
                  RM: {patient.no_rm || '-'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.gender} • {patient.age} Tahun • {patient.occupation || 'Belum Bekerja'} • {patient.religion || 'Islam'}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnosis Medis Rujukan</span>
            <strong className="text-xs text-blue-900 font-bold block max-w-sm truncate">
              {patient.medical_diagnosis || 'Belum ada rujukan diagnosis'}
            </strong>
          </div>
        </div>

        {/* SECTION 1: DATA PASIEN & MEDIS RS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* I. Keterangan Umum */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
              <User size={15} className="text-blue-600" />
              I. Keterangan Umum Penderita
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Nama Lengkap</span>
                <strong className="text-slate-900">{patient.name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Nomor Rekam Medis (RM)</span>
                <strong className="font-mono text-slate-900">{patient.no_rm || '-'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Umur / Jenis Kelamin</span>
                <span>{patient.age} Tahun / {patient.gender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Pekerjaan</span>
                <span>{patient.occupation || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Alamat Tempat Tinggal</span>
                <p className="p-2 bg-slate-50 rounded-xs border border-slate-100 leading-relaxed text-slate-800">
                  {patient.address || 'Tidak dicantumkan'}
                </p>
              </div>
            </div>
          </div>

          {/* II. Data Medis Rumah Sakit */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-2">
              <Hospital size={15} className="text-blue-600" />
              II. Data-Data Medis Rumah Sakit
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">A. Diagnosis Medis</span>
                <p className="p-2 bg-blue-50/70 border border-blue-100 rounded-xs font-bold text-blue-900">
                  {patient.medical_diagnosis || 'Belum ada rujukan diagnosis'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">B. Catatan Klinis Penunjang (Rontgen, Lab, MRI)</span>
                <p className="p-2 bg-slate-50 border border-slate-100 rounded-xs leading-relaxed text-slate-800">
                  {patient.clinical_notes || 'Tidak ada catatan radiologi/laboratorium.'}
                </p>
              </div>

              {patient.clinical_attachment_path && (
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Berkas Lampiran Radiologi</span>
                  <a
                    href={`/patients/${patient.id}/attachment`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold rounded-xs transition-colors"
                  >
                    <Download size={13} /> Unduh / Lihat Berkas
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">C. Terapi Umum & Rujukan Fisioterapi</span>
                <p className="p-2 bg-slate-50 border border-slate-100 rounded-xs text-slate-800">
                  {patient.doctor_referral || patient.general_treatment || 'Inisiatif orang tua / Belum ada rujukan tertulis'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: DAFTAR LAPORAN STATUS KLINIK ICF */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText size={15} className="text-blue-600" />
                Daftar Laporan Status Klinik ICF Terbit
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total terdaftar: {patient.icf_reports?.length || 0} berkas laporan evaluasi klinis
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {patient.icf_reports && patient.icf_reports.length > 0 ? (
              patient.icf_reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-slate-200 hover:border-blue-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs rounded-xs shrink-0">
                      REPORT #{report.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Laporan Asesmen & Status Klinik Fisioterapi
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                        <Calendar size={12} />
                        Tanggal: {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/physio-kit/treatment-plan?report=${report.id}`}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs self-end sm:self-auto"
                  >
                    Buka Dokumen <ChevronRight size={13} />
                  </a>
                </div>
              ))
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg">
                <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Belum ada laporan status klinik ICF yang dihasilkan untuk pasien ini.</p>
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    className="text-xs" 
                    onClick={() => setIsRegioModalOpen(true)}
                  >
                    Mulai Asesmen Pertama Sekarang
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* POP-UP MODAL: PEMILIHAN REGIO ANATOMIS SEBELUM ASESMEN    */}
      {/* ========================================================= */}
      {isRegioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 shadow-2xl rounded-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Stethoscope size={16} className="text-blue-600" />
                  Pilih Regio Anatomis Pemeriksaan
                </h3>
                <p className="text-xs text-slate-500">
                  Pasien: <strong className="text-slate-800">{patient.name}</strong> (RM: {patient.no_rm})
                </p>
              </div>
              <button 
                onClick={() => setIsRegioModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Pilihan Regio Grid */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-600">
                Pilih regio tubuh yang sesuai dengan keluhan utama pasien untuk memuat form evaluasi fisik, uji spesifik, dan tes fungsional yang relevan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REGIO_OPTIONS.map((regio) => {
                  const isSelected = selectedRegio === regio.id;
                  return (
                    <div
                      key={regio.id}
                      onClick={() => setSelectedRegio(regio.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                            {regio.badge}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-blue-600" />
                          )}
                        </div>
                        <h4 className={`text-xs font-bold mt-1 ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                          {regio.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {regio.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRegioModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleStartAssessment}
              >
                Lanjut ke Formulir Asesmen <ChevronRight size={14} />
              </Button>
            </div>

          </div>
        </div>
      )}

    </AppLayout>
  );
}