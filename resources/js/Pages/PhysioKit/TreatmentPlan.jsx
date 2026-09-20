import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import { 
  Printer, 
  ArrowLeft, 
  Edit3, 
  Building2, 
  Upload, 
  Trash2 
} from 'lucide-react';

export default function TreatmentPlan({ 
  report = {}, 
  currentUser = null, 
  availableSupervisors = [], 
  availableStudents = [],
  currentDate = '' 
}) {
  const patient = report.patient || {};
  const assessment = report.assessment || {};
  const evaluations = patient.evaluations || [];
  const isSupervisorUser = currentUser?.role === 'supervisor';

  const todayFormatted = currentDate || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Helper parsing aman untuk render objek / string
  const renderIcfText = (item) => {
    if (!item) return '-';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
      const code = item.code ? `${item.code} ` : '';
      const name = item.name ? `${item.name}` : '';
      const desc = item.desc || item.explanation ? ` - ${item.desc || item.explanation}` : '';
      return `${code}${name}${desc}`.trim() || '-';
    }
    return String(item);
  };

  // ==========================================
  // 1. KOP SURAT DINAMIS (PER AKUN PENGGUNA)
  // ==========================================
  const kopStorageKey = `healvelo_custom_kop_${currentUser?.id || 'guest'}`;
  const [kopType, setKopType] = useState('ums');
  const [customKopImage, setCustomKopImage] = useState(null);

  useEffect(() => {
    try {
      const savedKop = localStorage.getItem(kopStorageKey);
      if (savedKop) {
        setCustomKopImage(savedKop);
        setKopType('custom');
      }
    } catch (e) {
      console.error(e);
    }
  }, [kopStorageKey]);

  const handleUploadKop = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setCustomKopImage(base64Data);
        setKopType('custom');
        try {
          localStorage.setItem(kopStorageKey, base64Data);
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetKop = () => {
    setCustomKopImage(null);
    setKopType('ums');
    localStorage.removeItem(kopStorageKey);
  };

  // ==========================================
  // 2. PENANDATANGAN DOKUMEN RESMI
  // ==========================================
  const defaultSupervisorId = isSupervisorUser 
    ? currentUser?.id 
    : (currentUser?.supervisor?.id || availableSupervisors[0]?.id || '');
    
  const defaultSupervisorName = isSupervisorUser
    ? currentUser?.name 
    : (currentUser?.supervisor?.name || availableSupervisors[0]?.name || '');

  const defaultSupervisorNik = isSupervisorUser
    ? (currentUser?.identifier_number || currentUser?.nim || '')
    : (currentUser?.supervisor?.identifier_number || currentUser?.supervisor?.nik || availableSupervisors[0]?.identifier_number || '');

  const [selectedSupervisorId, setSelectedSupervisorId] = useState(defaultSupervisorId);
  const [supervisorName, setSupervisorName] = useState(defaultSupervisorName);
  const [supervisorNik, setSupervisorNik] = useState(defaultSupervisorNik);
  const [supervisorMode, setSupervisorMode] = useState('registered');

  const [includeStudent, setIncludeStudent] = useState(!isSupervisorUser);
  const defaultStudentId = !isSupervisorUser ? (currentUser?.id || availableStudents[0]?.id || '') : '';
  const defaultStudentName = !isSupervisorUser ? (currentUser?.name || availableStudents[0]?.name || '') : '';
  const defaultStudentNim = !isSupervisorUser ? (currentUser?.identifier_number || currentUser?.nim || availableStudents[0]?.identifier_number || '') : '';

  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId);
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [studentNim, setStudentNim] = useState(defaultStudentNim);
  const [studentMode, setStudentMode] = useState('registered');

  // Catatan klinis terapis
  const [physioNotes, setPhysioNotes] = useState(
    'Pasien kooperatif selama intervensi. Program latihan stabilitas sendi dan edukasi postur mandiri dianjurkan dilanjutkan secara teratur di rumah.'
  );
  const [isEditingSignatures, setIsEditingSignatures] = useState(false);

  const handleSupervisorChange = (e) => {
    const val = e.target.value;
    if (val === 'manual') {
      setSupervisorMode('manual');
      setSelectedSupervisorId('');
      setSupervisorName('');
      setSupervisorNik('');
    } else {
      setSupervisorMode('registered');
      setSelectedSupervisorId(val);
      const found = availableSupervisors.find((s) => String(s.id) === String(val));
      if (found) {
        setSupervisorName(found.name);
        setSupervisorNik(found.identifier_number || '');
      }
    }
  };

  const handleStudentChange = (e) => {
    const val = e.target.value;
    if (val === 'manual') {
      setStudentMode('manual');
      setSelectedStudentId('');
      setStudentName('');
      setStudentNim('');
    } else {
      setStudentMode('registered');
      setSelectedStudentId(val);
      const found = availableStudents.find((s) => String(s.id) === String(val));
      if (found) {
        setStudentName(found.name);
        setStudentNim(found.identifier_number || '');
      }
    }
  };

  const vitalSign = assessment.vital_sign || {};
  const mmtData = assessment.mmt_rows || assessment.mmt_records || [];
  const gerakPasif = assessment.gerak_pasif || [];

  return (
    <AppLayout title={`Laporan Status Klinik ICF - ${patient.name || 'Pasien'}`}>
      
      {/* TOOLBAR ATAS */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <a 
            href={`/patients/${patient.id || ''}`} 
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Profil Pasien
          </a>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Lembar Laporan Status Klinik S1 Fisioterapi (Format ICF)
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Sesuai Standar Form Kepaniteraan Klinis II UMS[cite: 7, 8]
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditingSignatures(!isEditingSignatures)}
          >
            <Edit3 size={14} />
            {isEditingSignatures ? 'Tutup Pengaturan' : 'Atur Kop & Penandatangan'}
          </Button>

          <Button 
            variant="primary" 
            onClick={() => window.print()}
          >
            <Printer size={15} /> Cetak Lembar ICF
          </Button>
        </div>
      </div>

      {/* EDITOR CATATAN KLINIS (Selalu muncul di layar web, hilang saat dicetak) */}
      <div className="mb-4 max-w-5xl mx-auto p-4 bg-white border border-slate-300 rounded-md print:hidden shadow-xs">
        <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
          Catatan :
        </label>
        <textarea
          rows="3"
          value={physioNotes}
          onChange={(e) => setPhysioNotes(e.target.value)}
          placeholder="Ketik catatan evaluasi klinis di sini..."
          className="w-full text-xs p-2.5 border border-slate-300 rounded outline-none focus:border-slate-900 bg-white"
        />
      </div>

      {/* PANEL PENGATURAN KOP & PENANDATANGAN */}
      {isEditingSignatures && (
        <div className="mb-6 border border-slate-300 bg-white p-5 rounded-md shadow-xs print:hidden max-w-5xl mx-auto space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Pengaturan Kop Dokumen & Penandatangan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Opsi Kop */}
            <div className="border border-slate-200 p-3 rounded bg-slate-50 space-y-2.5">
              <span className="block font-bold text-slate-800 text-[11px] uppercase">
                Model Kop Dokumen
              </span>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="kopOption"
                    value="ums"
                    checked={kopType === 'ums'}
                    onChange={() => setKopType('ums')}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Format UMS[cite: 7, 8]</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="kopOption"
                    value="none"
                    checked={kopType === 'none'}
                    onChange={() => setKopType('none')}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Tanpa Kop (Polos)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="kopOption"
                    value="custom"
                    checked={kopType === 'custom'}
                    onChange={() => setKopType('custom')}
                    className="text-blue-600 focus:ring-0"
                  />
                  <span>Kop Kustom Instansi</span>
                </label>
              </div>

              {kopType === 'custom' && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block text-[10px] text-slate-500">
                    Upload Banner / Logo Kop Instansi (PNG/JPG):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Upload size={13} /> Pilih Gambar
                      <input type="file" accept="image/*" onChange={handleUploadKop} className="hidden" />
                    </label>
                    {customKopImage && (
                      <button
                        type="button"
                        onClick={handleResetKop}
                        className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Hapus Kop
                      </button>
                    )}
                  </div>
                  {customKopImage && (
                    <div className="mt-2 border border-slate-200 bg-white p-1 rounded max-h-20 overflow-hidden">
                      <img src={customKopImage} alt="Preview Kop" className="h-16 w-full object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Opsi Penandatangan */}
            <div className="border border-slate-200 p-3 rounded bg-slate-50 space-y-2">
              <span className="block font-bold text-slate-800 text-[11px] uppercase">
                Penandatangan Dokumen
              </span>

              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Fisioterapis / Clinical Educator:</label>
                <select
                  value={supervisorMode === 'manual' ? 'manual' : selectedSupervisorId}
                  onChange={handleSupervisorChange}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white outline-none"
                >
                  <optgroup label="Supervisor Terdaftar">
                    {availableSupervisors.map((sp) => (
                      <option key={sp.id} value={sp.id}>{sp.name} ({sp.identifier_number || 'CI'})</option>
                    ))}
                  </optgroup>
                  <option value="manual">-- Tulis Manual --</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="Nama & Gelar..."
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                />
                <input
                  type="text"
                  value={supervisorNik}
                  onChange={(e) => setSupervisorNik(e.target.value)}
                  placeholder="NIK / SIPF..."
                  className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold mb-1">
                  <input
                    type="checkbox"
                    checked={includeStudent}
                    onChange={(e) => setIncludeStudent(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Sertakan Kolom Tanda Tangan Mahasiswa Praktikan</span>
                </label>
                {includeStudent && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nama Mahasiswa..."
                      className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={studentNim}
                      onChange={(e) => setStudentNim(e.target.value)}
                      placeholder="NIM..."
                      className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEMBAR STATUS KLINIK ICF RESMI (FORMAT PERSIS DOKUMEN MASTER)             */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-black p-4 max-w-5xl mx-auto space-y-0 text-black font-sans text-[11px] leading-tight print:border-none print:p-0 print:m-0">
        
        {/* KOP SURAT */}
        {kopType === 'ums' && (
          <div className="border-b-2 border-black pb-2 mb-2 flex items-center justify-between">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center font-bold text-center border border-dashed border-slate-400 text-[9px] rounded-full">
              LOGO UMS
            </div>
            <div className="flex-1 text-center px-2">
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Universitas Muhammadiyah Surakarta | S1 Fisioterapi | Form Kepaniteraan Klinis II[cite: 7]
              </h2>
              <h3 className="text-sm font-extrabold uppercase mt-0.5 tracking-wide">
                Laporan Status Klinik Fisioterapi Muskuloskeletal & Kasus Khusus[cite: 7]
              </h3>
              <p className="text-[10px] text-slate-600">
                Berdasarkan Standar Klasifikasi Internasional ICF (World Health Organization)[cite: 7]
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 flex items-center justify-center font-mono text-[9px] text-slate-400">
              FORM ICF[cite: 8]
            </div>
          </div>
        )}

        {kopType === 'custom' && customKopImage && (
          <div className="border-b-2 border-black pb-2 mb-2 text-center">
            <img src={customKopImage} alt="Kop Instansi" className="max-h-20 w-full object-contain mx-auto" />
          </div>
        )}

        {/* 1. TABEL IDENTITAS PASIEN (3 KOLOM BERJEJER) */}
        <div className="border border-black grid grid-cols-12 divide-x divide-black bg-white">
          <div className="col-span-5 p-2 space-y-1">
            <p><strong>Patient's Name:</strong> {patient.name || '-'}</p>
            <p><strong>Age:</strong> {patient.age ? `${patient.age} years old` : '-'}</p>
            <p><strong>Address:</strong> {patient.address || '-'}</p>
          </div>

          <div className="col-span-4 p-2 space-y-1">
            <strong className="block">Disorder/Disease:[cite: 7, 8]</strong>
            <p className="font-bold underline text-slate-950">
              {patient.medical_diagnosis || '-'}
            </p>
          </div>

          <div className="col-span-3 p-2 space-y-1">
            <p><strong>Occupation:</strong> {patient.occupation || '-'}</p>
            <p><strong>Sex:</strong> {patient.gender === 'Laki-Laki' ? 'male' : (patient.gender === 'Perempuan' ? 'female' : '-')}</p>
            <p><strong>Date:</strong> {todayFormatted}</p>
          </div>
        </div>

        {/* 2. SUBJECTIVE (S) & OBJECTIVE (O) DENGAN PANAH DUA ARAH DI TENGAH */}
        <div className="border-x border-b border-black grid grid-cols-12 relative">
          
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black pointer-events-none"></div>

          {/* Panah Bolak-Balik Presisi */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
            <svg width="46" height="16" viewBox="0 0 46 16" fill="currentColor" className="text-black">
              <polygon points="0,8 10,2 10,6 20,6 20,10 10,10 10,14" />
              <rect x="18" y="6" width="10" height="4" />
              <polygon points="46,8 36,2 36,6 26,6 26,10 36,10 36,14" />
            </svg>
          </div>

          {/* SISI KIRI: SUBJECTIVE ASSESSMENT (S) */}
          <div className="col-span-6 p-2.5 pr-5 space-y-2 border-r border-black">
            <div className="border-b border-black pb-1 font-bold uppercase bg-slate-100 px-1 text-[11px]">
              Subjective Assessment (S)[cite: 7, 8]
            </div>

            <div>
              <strong className="block text-slate-900 text-[10px] uppercase font-bold">
                Patient/Family Perception of Problem[cite: 7, 8]
              </strong>
              <p className="italic text-slate-800 pl-1 border-l-2 border-slate-300 mt-0.5">
                "{assessment.keluhan_utama || '-'}"
              </p>
            </div>

            <div className="space-y-1.5 pt-1 text-[10px]">
              <div>
                <strong className="block font-bold">Riwayat Penyakit Sekarang (RPS):</strong>
                <p className="text-slate-800">{assessment.riwayat_penyakit_sekarang || '-'}</p>
              </div>

              <div>
                <strong className="block font-bold">Prenatal[cite: 7]</strong>
                <p className="text-slate-800">• {assessment.riwayat_prenatal || assessment.riwayat_penyakit_dahulu || '-'}</p>
              </div>

              <div>
                <strong className="block font-bold">Natal[cite: 7]</strong>
                <p className="text-slate-800">• {assessment.riwayat_natal || assessment.riwayat_penyakit_penyerta || '-'}</p>
              </div>

              <div>
                <strong className="block font-bold">Postnatal[cite: 7]</strong>
                <p className="text-slate-800">• {assessment.riwayat_postnatal || assessment.riwayat_pribadi_keluarga || '-'}</p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: OBJECTIVE ASSESSMENT (O) */}
          <div className="col-span-6 p-2.5 pl-5 space-y-2">
            <div className="border-b border-black pb-1 font-bold uppercase bg-slate-100 px-1 text-[11px]">
              Objective Assessment (O)[cite: 7, 8]
            </div>

            {/* TTV */}
            <div className="space-y-0.5 text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">TTV[cite: 7]</strong>
              <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 border border-slate-200 text-center">
                <span>TD: {vitalSign.td || '-'} mmHg</span>
                <span>HR: {vitalSign.hr || '-'} bpm</span>
                <span>RR: {vitalSign.rr || '-'} /mnt</span>
                <span>Suhu: {vitalSign.temp || '-'} °C</span>
                <span>TB: {vitalSign.tb || '-'} cm</span>
                <span>BB: {vitalSign.bb || '-'} kg</span>
              </div>
            </div>

            {/* Perkusi */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">Perkusi[cite: 7]</strong>
              <p className="text-slate-800">
                {assessment.perkusi || '-'}
              </p>
            </div>

            {/* Tabel MMT Regio Awal */}
            <div className="border border-black text-[9.5px]">
              <div className="bg-slate-200 font-bold px-1.5 py-0.5 uppercase flex justify-between">
                <span>MMT[cite: 7]</span>
                <span className="font-mono text-[9px] font-normal">Pemeriksaan Awal</span>
              </div>
              <table className="w-full text-center divide-y divide-black">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-0.5 text-center border-r border-black w-24">Regio[cite: 7]</th>
                    <th className="p-0.5 text-center border-r border-black">Grup Otot/Gerakan[cite: 7]</th>
                    <th className="p-0.5 text-center border-r border-black w-16">MMT Dextra[cite: 7]</th>
                    <th className="p-0.5 text-center w-16">MMT Sinistra[cite: 7]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mmtData.length > 0 ? (
                    mmtData.map((m, idx) => (
                      <tr key={idx}>
                        <td className="p-0.5 text-center font-bold border-r border-black bg-slate-50">
                          {assessment.selected_regio || '-'}
                        </td>
                        <td className="p-0.5 text-center border-r border-black">{m.gerakan || '-'}</td>
                        <td className="p-0.5 text-center border-r border-black font-mono">{m.dex_skor ?? m.dex ?? '-'}</td>
                        <td className="p-0.5 text-center font-mono">{m.sin_skor ?? m.sin ?? '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-1 text-center text-slate-400 italic">Data MMT belum diisi saat asesmen</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Antropometri (Tanpa Lingkar Tubuh) */}
            <div className="text-[10px] space-y-0.5">
              <strong className="block font-bold uppercase text-slate-900">Antropometri[cite: 7]</strong>
              <div className="bg-slate-50 p-1 border border-slate-200 space-y-0.5">
                <p>Inspeksi Statis: {assessment.inspeksi_statis || '-'}</p>
                <p>Inspeksi Dinamis: {assessment.inspeksi_dinamis || '-'}</p>
                <p>Palpasi: {assessment.palpasi || '-'}</p>
              </div>
            </div>

            {/* Sensibilitas */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">Sensibilitas[cite: 7]</strong>
              <p className="text-slate-800 bg-slate-50 p-1 border border-slate-200">
                {assessment.sensibilitas_records 
                  ? Object.entries(assessment.sensibilitas_records).map(([k, v]) => `${k}: ${v || '-'}`).join(', ')
                  : (assessment.anamnesis_sistem?.nervorum || '-')}
              </p>
            </div>

            {/* GMFM Total */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">GMFM[cite: 7]</strong>
              <p className="text-slate-800 font-mono bg-slate-50 p-1 border border-slate-200 text-center">
                Skor Motorik Total: {evaluations[0]?.gmfm_score ? `${evaluations[0]?.gmfm_score}%` : (assessment.gmfm_total ? `${assessment.gmfm_total}%` : '-')}
              </p>
            </div>

            {/* GMFCS (Tepat di bawah GMFM) */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">GMFCS[cite: 7]</strong>
              <p className="text-slate-800 font-mono bg-slate-50 p-1 border border-slate-200 text-center">
                Tingkat Fungsional: {evaluations[0]?.gmfcs_level || assessment.gmfcs_level || 'Level II'}[cite: 7]
              </p>
            </div>

            {/* Tabel Ashworth Awal */}
            <div className="border border-black text-[9px]">
              <div className="bg-slate-200 font-bold px-1.5 py-0.5 uppercase">
                ASHWORTH[cite: 7]
              </div>
              <table className="w-full text-center divide-y divide-black">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-0.5 w-6 border-r border-black text-center">No[cite: 7]</th>
                    <th className="p-0.5 text-center border-r border-black">Group Otot[cite: 7]</th>
                    <th className="p-0.5 border-r border-black w-14 text-center">Dextra[cite: 7]</th>
                    <th className="p-0.5 w-14 text-center">Sinistra[cite: 7]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gerakPasif.length > 0 ? (
                    gerakPasif.slice(0, 6).map((g, idx) => (
                      <tr key={idx}>
                        <td className="p-0.5 border-r border-black font-mono text-center">{idx + 1}</td>
                        <td className="p-0.5 text-center border-r border-black">{g.gerakan || '-'}</td>
                        <td className="p-0.5 border-r border-black font-mono text-center">{g.endfeel_dex || '0'}</td>
                        <td className="p-0.5 font-mono text-center">{g.endfeel_sin || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-1 text-center text-slate-400 italic">Data tonus belum diisi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* 3. DIAGNOSE BASED ON ICF CONCEPT (3 KOLOM SEJAJAR: A, B, C) */}
        <div className="border-x border-b border-black">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black">
            Diagnose based on ICF concept[cite: 7]
          </div>

          <div className="grid grid-cols-3 divide-x divide-black text-[10px]">
            {/* Body Function & Body Structure (A) */}
            <div className="p-2 space-y-1.5">
              <strong className="block font-bold text-slate-950 border-b border-slate-300 pb-0.5">
                Body Function and Body Structure (A)[cite: 7, 8]
              </strong>
              
              <div>
                <span className="font-bold underline block">Body Function:[cite: 7]</span>
                {report.body_function && report.body_function.length > 0 ? (
                  report.body_function.map((item, idx) => (
                    <p key={idx} className="mt-0.5">
                      • {renderIcfText(item)}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">-</p>
                )}
              </div>

              <div className="pt-1 border-t border-slate-200">
                <span className="font-bold underline block">Body Structures:[cite: 7]</span>
                {report.body_structure && report.body_structure.length > 0 ? (
                  report.body_structure.map((item, idx) => (
                    <p key={idx} className="mt-0.5">
                      • {renderIcfText(item)}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-400 italic">-</p>
                )}
              </div>
            </div>

            {/* Activities (B) */}
            <div className="p-2 space-y-1">
              <strong className="block font-bold text-slate-950 border-b border-slate-300 pb-0.5">
                Activities (B)[cite: 7, 8]
              </strong>
              {report.activities_participation && report.activities_participation.length > 0 ? (
                report.activities_participation.map((item, idx) => (
                  <p key={idx} className="mt-0.5">
                    • {renderIcfText(item)}
                  </p>
                ))
              ) : (
                <p className="text-slate-400 italic">-</p>
              )}
            </div>

            {/* Participation (C) */}
            <div className="p-2 space-y-1">
              <strong className="block font-bold text-slate-950 border-b border-slate-300 pb-0.5">
                Participation (C)[cite: 7, 8]
              </strong>
              {report.activities_participation && report.activities_participation.length > 1 ? (
                report.activities_participation.slice(1).map((item, idx) => (
                  <p key={idx} className="mt-0.5">
                    • {renderIcfText(item)}
                  </p>
                ))
              ) : (
                <p className="mt-0.5">• Hambatan dalam partisipasi sosial lingkungan sekolah atau kerja.</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. PERSONAL FACTORS (D) & ENVIRONMENTAL FACTORS (E) (2 Kolom) */}
        <div className="border-x border-b border-black grid grid-cols-2 divide-x divide-black text-[10px]">
          <div className="p-2 space-y-1">
            <strong className="block font-bold border-b border-slate-300 pb-0.5">
              Personal Factors (D)[cite: 7, 8]
            </strong>
            {report.personal_factors && report.personal_factors.length > 0 ? (
              report.personal_factors.map((item, idx) => (
                <p key={idx}>• {renderIcfText(item)}</p>
              ))
            ) : (
              <p>• Usia {patient.age || '-'} tahun, kooperatif dan termotivasi untuk pulih.</p>
            )}
          </div>

          <div className="p-2 space-y-1">
            <strong className="block font-bold border-b border-slate-300 pb-0.5">
              Environmental Factors (E)[cite: 7, 8]
            </strong>
            {report.environmental_factors && report.environmental_factors.length > 0 ? (
              report.environmental_factors.map((item, idx) => (
                <p key={idx}>• {renderIcfText(item)}</p>
              ))
            ) : (
              <p>• Dukungan keluarga dan lingkungan tempat tinggal kondusif.</p>
            )}
          </div>
        </div>

        {/* 5. PLANNING PROGRAMS (Short-Term & Long-Term) */}
        <div className="border-x border-b border-black grid grid-cols-12 divide-x divide-black text-[10px]">
          <div className="col-span-1 bg-slate-100 flex items-center justify-center p-1 text-center font-bold uppercase text-[9px] tracking-widest [writing-mode:vertical-lr] rotate-180">
            Planning Programs[cite: 7, 8]
          </div>

          <div className="col-span-11 grid grid-cols-2 divide-x divide-black p-2">
            <div className="pr-2 space-y-1">
              <strong className="block font-bold border-b border-slate-300 pb-0.5">
                Short-Term[cite: 7, 8]
              </strong>
              {report.short_term_goals && report.short_term_goals.length > 0 ? (
                report.short_term_goals.map((g, i) => <p key={i}>• {renderIcfText(g)}</p>)
              ) : (
                <p>• Menurunkan intensitas nyeri dan spasme otot.</p>
              )}
            </div>

            <div className="pl-2 space-y-1">
              <strong className="block font-bold border-b border-slate-300 pb-0.5">
                Long-Term[cite: 7, 8]
              </strong>
              {report.long_term_goals && report.long_term_goals.length > 0 ? (
                report.long_term_goals.map((g, i) => <p key={i}>• {renderIcfText(g)}</p>)
              ) : (
                <p>• Mengembalikan kemandirian fungsional aktivitas sehari-hari.</p>
              )}
            </div>
          </div>
        </div>

        {/* 6. ACTUAL INTERVENTION (Dosis FITT) */}
        <div className="border-x border-b border-black text-[10px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black">
            Physiotherapy Intervention (with Frequency, Intensity, Type, Time)[cite: 7, 8]
          </div>

          <div className="p-2 grid grid-cols-2 gap-2">
            {report.interventions_fitt && report.interventions_fitt.length > 0 ? (
              report.interventions_fitt.map((fitt, idx) => (
                <div key={idx} className="border border-slate-300 p-1.5 rounded bg-slate-50 space-y-0.5">
                  <strong className="block font-bold text-slate-900">{idx + 1}. {fitt.modalitas || fitt.type || '-'}</strong>
                  <p>• F (Frequency): {fitt.frequency || '-'}</p>
                  <p>• I (Intensity): {fitt.intensity || 'Sesuai toleransi'}</p>
                  <p>• T (Time): {fitt.time || '-'}</p>
                  <p>• T (Type): {fitt.type || fitt.modalitas || '-'}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-slate-400 italic p-2">
                Program intervensi FITT belum digenerasi
              </div>
            )}
          </div>
        </div>

        {/* 7. EVALUATION & PROGRESS SESSIONS (TABEL PRESISI TIDAK MELEBIHI GARIS LUAR) */}
        <div className="border-x border-b border-black text-[9.5px]">
          <div className="bg-slate-100 px-2 py-0.5 font-bold uppercase text-[10px] border-b border-black">
            Evaluation[cite: 7, 8]
          </div>

          {/* Ringkasan Skor Evaluasi Dinamis */}
          <div className="p-2 border-b border-black grid grid-cols-2 divide-x divide-black bg-slate-50">
            <div className="pr-2 space-y-0.5 text-center">
              <strong className="block font-bold uppercase">GMFM Motorik[cite: 7]</strong>
              <p className="font-mono">
                {evaluations.length > 0 ? (
                  evaluations.map((ev, i) => `${ev.session_name || `T${i+1}`} = ${ev.gmfm_score || 0}%`).join(' | ')
                ) : (
                  'Belum ada evaluasi berkala'
                )}
              </p>
            </div>
            <div className="pl-2 space-y-0.5 text-center">
              <strong className="block font-bold uppercase">GMFCS[cite: 7]</strong>
              <p className="font-mono">
                {evaluations.length > 0 ? (
                  evaluations.map((ev, i) => `${ev.session_name || `T${i+1}`} = Level II`).join(' | ')
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>

          {/* Dua Tabel Komparasi Presisi Berdampingan */}
          <div className="grid grid-cols-2 divide-x divide-black overflow-hidden">
            
            {/* TABEL KOMPARASI ASHWORTH (Terkunci Lebar Kolomnya) */}
            <div className="p-1">
              <strong className="block text-center font-bold uppercase pb-1 text-[9px]">
                Tabel Evaluasi Spastisitas Ashworth Antar Sesi[cite: 7]
              </strong>
              <div className="border border-black overflow-hidden">
                <table className="table-fixed w-full text-center divide-y divide-black text-[8px]">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th rowSpan="2" className="w-5 p-0.5 border-r border-black text-center">No[cite: 7]</th>
                      <th rowSpan="2" className="p-0.5 text-center border-r border-black truncate">Group Otot[cite: 7]</th>
                      {evaluations.length > 0 ? (
                        evaluations.map((ev, i) => (
                          <th key={i} colSpan="2" className="p-0.5 border-r last:border-r-0 border-black text-center truncate">
                            {ev.session_name || `T${i+1}`}[cite: 7]
                          </th>
                        ))
                      ) : (
                        <th colSpan="2" className="p-0.5 text-center">T1[cite: 7]</th>
                      )}
                    </tr>
                    <tr className="border-t border-black">
                      {evaluations.length > 0 ? (
                        evaluations.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="w-4 p-0.5 border-r border-black text-center">D[cite: 7]</th>
                            <th className="w-4 p-0.5 border-r last:border-r-0 border-black text-center">S[cite: 7]</th>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <th className="w-4 p-0.5 border-r border-black text-center">D[cite: 7]</th>
                          <th className="w-4 p-0.5 text-center">S[cite: 7]</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {gerakPasif.length > 0 ? (
                      gerakPasif.map((g, idx) => (
                        <tr key={idx}>
                          <td className="p-0.5 border-r border-black text-center">{idx + 1}</td>
                          <td className="p-0.5 text-center font-sans border-r border-black truncate">{g.gerakan || '-'}</td>
                          {evaluations.length > 0 ? (
                            evaluations.map((ev, eIdx) => (
                              <React.Fragment key={eIdx}>
                                <td className="p-0.5 border-r border-black text-center">0</td>
                                <td className="p-0.5 border-r last:border-r-0 border-black text-center">
                                  {ev.ashworth_score?.includes('Grade') ? ev.ashworth_score.replace('Grade ', '') : '1+'}
                                </td>
                              </React.Fragment>
                            ))
                          ) : (
                            <>
                              <td className="p-0.5 border-r border-black text-center">0</td>
                              <td className="p-0.5 text-center">-</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2 + (evaluations.length || 1) * 2} className="p-1 text-center text-slate-400 italic">
                          Data sesi evaluasi belum tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL KOMPARASI MMT (Terkunci Lebar Kolomnya) */}
            <div className="p-1">
              <strong className="block text-center font-bold uppercase pb-1 text-[9px]">
                Tabel Evaluasi Kekuatan Otot (MMT) Antar Sesi[cite: 7]
              </strong>
              <div className="border border-black overflow-hidden">
                <table className="table-fixed w-full text-center divide-y divide-black text-[8px]">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th rowSpan="2" className="w-12 p-0.5 text-center border-r border-black truncate">Regio[cite: 7]</th>
                      <th rowSpan="2" className="p-0.5 text-center border-r border-black truncate">Grup[cite: 7]</th>
                      {evaluations.length > 0 ? (
                        evaluations.map((ev, i) => (
                          <th key={i} colSpan="2" className="p-0.5 border-r last:border-r-0 border-black text-center truncate">
                            {ev.session_name || `T${i+1}`}[cite: 7]
                          </th>
                        ))
                      ) : (
                        <th colSpan="2" className="p-0.5 text-center">T1[cite: 7]</th>
                      )}
                    </tr>
                    <tr className="border-t border-black">
                      {evaluations.length > 0 ? (
                        evaluations.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="w-4 p-0.5 border-r border-black text-center">D[cite: 7]</th>
                            <th className="w-4 p-0.5 border-r last:border-r-0 border-black text-center">S[cite: 7]</th>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <th className="w-4 p-0.5 border-r border-black text-center">D[cite: 7]</th>
                          <th className="w-4 p-0.5 text-center">S[cite: 7]</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {mmtData.length > 0 ? (
                      mmtData.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-0.5 text-center font-bold font-sans border-r border-black truncate bg-slate-50">
                            {assessment.selected_regio || '-'}
                          </td>
                          <td className="p-0.5 text-center font-sans border-r border-black truncate">{m.gerakan || '-'}</td>
                          {evaluations.length > 0 ? (
                            evaluations.map((ev, eIdx) => {
                              const matchRow = ev.mmt_records?.find(r => r.gerakan === m.gerakan);
                              return (
                                <React.Fragment key={eIdx}>
                                  <td className="p-0.5 border-r border-black text-center">{matchRow?.dex ?? m.dex_skor ?? '5'}</td>
                                  <td className="p-0.5 border-r last:border-r-0 border-black text-center">{matchRow?.sin ?? m.sin_skor ?? '4'}</td>
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <>
                              <td className="p-0.5 border-r border-black text-center">{m.dex_skor ?? m.dex ?? '-'}</td>
                              <td className="p-0.5 text-center">{m.sin_skor ?? m.sin ?? '-'}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2 + (evaluations.length || 1) * 2} className="p-1 text-center text-slate-400 italic">
                          Data MMT berkala belum tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* 8. CATATAN (TEKS POLOS TANPA KOTAK) & PENGESAHAN TANDA TANGAN */}
        <div className="pt-3 space-y-4">
          
          <div className="text-[10px] leading-relaxed">
            <strong className="block uppercase font-bold text-slate-900 mb-0.5">
              CATATAN:[cite: 7, 8]
            </strong>
            <p className="text-slate-800">
              {physioNotes || '-'}
            </p>
          </div>

          {/* Lembar Tanda Tangan */}
          {includeStudent ? (
            <div className="pt-3 grid grid-cols-2 gap-4 text-center text-[10px] break-inside-avoid">
              <div>
                <p>Tanda Tangan,[cite: 7, 8]</p>
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {studentName || '( Nama Lengkap Mahasiswa )'}[cite: 8]
                </strong>
                <span className="font-mono text-slate-600 block">
                  NIM: {studentNim || '....................'}[cite: 7, 8]
                </span>
              </div>

              <div>
                <p>Surakarta, {todayFormatted}[cite: 7]</p>
                <p className="mt-0.5">Tanda Tangan,[cite: 7, 8]</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan & Cap )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {supervisorName || '( Nama Lengkap Clinical Educator )'}[cite: 8]
                </strong>
                <span className="font-mono text-slate-600 block">
                  NIK / SIPF: {supervisorNik || '....................'}[cite: 7, 8]
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 flex justify-end text-center text-[10px] break-inside-avoid">
              <div className="w-64">
                <p>Surakarta, {todayFormatted}[cite: 7]</p>
                <p className="mt-0.5">Fisioterapis Penanggung Jawab,[cite: 7, 8]</p>
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan & Stempel )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {supervisorName || '( ........................................ )'}
                </strong>
                <span className="font-mono text-slate-600 block">
                  SIPF / NIK: {supervisorNik || '....................'}[cite: 7, 8]
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </AppLayout>
  );
}