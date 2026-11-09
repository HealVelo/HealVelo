import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import KopSignatureSettings from '@/Components/PhysioKit/KopSignatureSettings';
import { Printer, ArrowLeft, Edit3 } from 'lucide-react';

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
  const defaultStudentName = !isSupervisorUser ? (currentUser?.name || availableStudents[0]?.name || '') : '';
  const defaultStudentNim = !isSupervisorUser ? (currentUser?.identifier_number || currentUser?.nim || availableStudents[0]?.identifier_number || '') : '';

  const [studentName, setStudentName] = useState(defaultStudentName);
  const [studentNim, setStudentNim] = useState(defaultStudentNim);

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

  const vitalSign = assessment.vital_sign || {};
  const mmtData = assessment.mmt_rows || assessment.mmt_records || [];
  const gerakPasif = assessment.gerak_pasif || [];

  const formatAshworthScore = (rawScore) => {
    if (!rawScore) return '-';
    return String(rawScore).replace(/^Grade\s+/i, '').trim() || '-';
  };

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
            Sesuai Standar Form Kepaniteraan Klinis II UMS
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
        <KopSignatureSettings
          kopType={kopType}
          setKopType={setKopType}
          customKopImage={customKopImage}
          onUploadKop={handleUploadKop}
          onResetKop={handleResetKop}
          availableSupervisors={availableSupervisors}
          supervisorMode={supervisorMode}
          selectedSupervisorId={selectedSupervisorId}
          onSupervisorChange={handleSupervisorChange}
          supervisorName={supervisorName}
          setSupervisorName={setSupervisorName}
          supervisorNik={supervisorNik}
          setSupervisorNik={setSupervisorNik}
          includeStudent={includeStudent}
          setIncludeStudent={setIncludeStudent}
          studentName={studentName}
          setStudentName={setStudentName}
          studentNim={studentNim}
          setStudentNim={setStudentNim}
        />
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
                Universitas Muhammadiyah Surakarta | S1 Fisioterapi | Form Kepaniteraan Klinis II
              </h2>
              <h3 className="text-sm font-extrabold uppercase mt-0.5 tracking-wide">
                Laporan Status Klinik Fisioterapi Muskuloskeletal & Kasus Khusus
              </h3>
              <p className="text-[10px] text-slate-600">
                Berdasarkan Standar Klasifikasi Internasional ICF (World Health Organization)
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 flex items-center justify-center font-mono text-[9px] text-slate-400">
              FORM ICF
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
            <strong className="block">Disorder/Disease:</strong>
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
              Subjective Assessment (S)
            </div>

            <div>
              <strong className="block text-slate-900 text-[10px] uppercase font-bold">
                Patient/Family Perception of Problem
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
                <strong className="block font-bold">Prenatal</strong>
                <p className="text-slate-800">• {assessment.riwayat_prenatal || assessment.riwayat_penyakit_dahulu || '-'}</p>
              </div>

              <div>
                <strong className="block font-bold">Natal</strong>
                <p className="text-slate-800">• {assessment.riwayat_natal || assessment.riwayat_penyakit_penyerta || '-'}</p>
              </div>

              <div>
                <strong className="block font-bold">Postnatal</strong>
                <p className="text-slate-800">• {assessment.riwayat_postnatal || assessment.riwayat_pribadi_keluarga || '-'}</p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: OBJECTIVE ASSESSMENT (O) */}
          <div className="col-span-6 p-2.5 pl-5 space-y-2">
            <div className="border-b border-black pb-1 font-bold uppercase bg-slate-100 px-1 text-[11px]">
              Objective Assessment (O)
            </div>

            {/* TTV */}
            <div className="space-y-0.5 text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">TTV</strong>
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
              <strong className="block font-bold uppercase text-slate-900">Perkusi</strong>
              <p className="text-slate-800">
                {assessment.perkusi || '-'}
              </p>
            </div>

            {/* Tabel MMT Regio Awal */}
            <div className="border border-black text-[9.5px]">
              <div className="bg-slate-200 font-bold px-1.5 py-0.5 uppercase flex justify-between">
                <span>MMT</span>
                <span className="font-mono text-[9px] font-normal">Pemeriksaan Awal</span>
              </div>
              <table className="w-full text-center divide-y divide-black">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-0.5 text-center border-r border-black w-24">Regio</th>
                    <th className="p-0.5 text-center border-r border-black">Grup Otot/Gerakan</th>
                    <th className="p-0.5 text-center border-r border-black w-16">MMT Dextra</th>
                    <th className="p-0.5 text-center w-16">MMT Sinistra</th>
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
              <strong className="block font-bold uppercase text-slate-900">Antropometri</strong>
              <div className="bg-slate-50 p-1 border border-slate-200 space-y-0.5">
                <p>Inspeksi Statis: {assessment.inspeksi_statis || '-'}</p>
                <p>Inspeksi Dinamis: {assessment.inspeksi_dinamis || '-'}</p>
                <p>Palpasi: {assessment.palpasi || '-'}</p>
              </div>
            </div>

            {/* Sensibilitas */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">Sensibilitas</strong>
              <p className="text-slate-800 bg-slate-50 p-1 border border-slate-200">
                {assessment.sensibilitas_records 
                  ? Object.entries(assessment.sensibilitas_records).map(([k, v]) => `${k}: ${v || '-'}`).join(', ')
                  : (assessment.anamnesis_sistem?.nervorum || '-')}
              </p>
            </div>

            {/* GMFM Total */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">GMFM</strong>
              <p className="text-slate-800 font-mono bg-slate-50 p-1 border border-slate-200 text-center">
                Skor Motorik Total: {evaluations[0]?.gmfm_score ? `${evaluations[0]?.gmfm_score}%` : (assessment.gmfm_total ? `${assessment.gmfm_total}%` : '-')}
              </p>
            </div>

            {/* GMFCS (Tepat di bawah GMFM) */}
            <div className="text-[10px]">
              <strong className="block font-bold uppercase text-slate-900">GMFCS</strong>
              <p className="text-slate-800 font-mono bg-slate-50 p-1 border border-slate-200 text-center">
                Tingkat Fungsional: {evaluations[0]?.gmfcs_level || assessment.gmfcs_level || '-'}
              </p>
            </div>

            {/* Tabel Ashworth Awal */}
            <div className="border border-black text-[9px]">
              <div className="bg-slate-200 font-bold px-1.5 py-0.5 uppercase">
                ASHWORTH
              </div>
              <table className="w-full text-center divide-y divide-black">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-0.5 w-6 border-r border-black text-center">No</th>
                    <th className="p-0.5 text-center border-r border-black">Group Otot</th>
                    <th className="p-0.5 border-r border-black w-14 text-center">Dextra</th>
                    <th className="p-0.5 w-14 text-center">Sinistra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gerakPasif.length > 0 ? (
                    gerakPasif.slice(0, 6).map((g, idx) => (
                      <tr key={idx}>
                        <td className="p-0.5 border-r border-black font-mono text-center">{idx + 1}</td>
                        <td className="p-0.5 text-center border-r border-black">{g.gerakan || '-'}</td>
                        <td className="p-0.5 border-r border-black font-mono text-center">{g.endfeel_dex || '-'}</td>
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
            Diagnose based on ICF concept
          </div>

          <div className="grid grid-cols-3 divide-x divide-black text-[10px]">
            {/* Body Function & Body Structure (A) */}
            <div className="p-2 space-y-1.5">
              <strong className="block font-bold text-slate-950 border-b border-slate-300 pb-0.5">
                Body Function and Body Structure (A)
              </strong>
              
              <div>
                <span className="font-bold underline block">Body Function:</span>
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
                <span className="font-bold underline block">Body Structures:</span>
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
                Activities (B)
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
                Participation (C)
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
              Personal Factors (D)
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
              Environmental Factors (E)
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
            Planning Programs
          </div>

          <div className="col-span-11 grid grid-cols-2 divide-x divide-black p-2">
            <div className="pr-2 space-y-1">
              <strong className="block font-bold border-b border-slate-300 pb-0.5">
                Short-Term
              </strong>
              {report.short_term_goals && report.short_term_goals.length > 0 ? (
                report.short_term_goals.map((g, i) => <p key={i}>• {renderIcfText(g)}</p>)
              ) : (
                <p>• Menurunkan intensitas nyeri dan spasme otot.</p>
              )}
            </div>

            <div className="pl-2 space-y-1">
              <strong className="block font-bold border-b border-slate-300 pb-0.5">
                Long-Term
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
            Physiotherapy Intervention (with Frequency, Intensity, Type, Time)
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
            Evaluation
          </div>

          {/* Ringkasan Skor Evaluasi Dinamis */}
          <div className="p-2 border-b border-black grid grid-cols-2 divide-x divide-black bg-slate-50">
            <div className="pr-2 space-y-0.5 text-center">
              <strong className="block font-bold uppercase">GMFM Motorik</strong>
              <p className="font-mono">
                {evaluations.length > 0 ? (
                  evaluations.map((ev, i) => `${ev.session_name || `T${i+1}`} = ${ev.gmfm_score ?? '-'}%`).join(' | ')
                ) : (
                  'Belum ada evaluasi berkala'
                )}
              </p>
            </div>
            <div className="pl-2 space-y-0.5 text-center">
              <strong className="block font-bold uppercase">GMFCS</strong>
              <p className="font-mono">
                {evaluations.length > 0 ? (
                  evaluations.map((ev, i) => `${ev.session_name || `T${i+1}`} = ${ev.gmfcs_level || assessment.gmfcs_level || '-'}`).join(' | ')
                ) : (
                  assessment.gmfcs_level || '-'
                )}
              </p>
            </div>
          </div>

          {/* Dua Tabel Komparasi Presisi Berdampingan */}
          <div className="grid grid-cols-2 divide-x divide-black overflow-hidden">
            
            {/* TABEL KOMPARASI ASHWORTH (Terkunci Lebar Kolomnya) */}
            <div className="p-1">
              <strong className="block text-center font-bold uppercase pb-1 text-[9px]">
                Tabel Evaluasi Spastisitas Ashworth Antar Sesi
              </strong>
              <div className="border border-black overflow-hidden">
                <table className="table-fixed w-full text-center divide-y divide-black text-[8px]">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th rowSpan="2" className="w-5 p-0.5 border-r border-black text-center">No</th>
                      <th rowSpan="2" className="p-0.5 text-center border-r border-black truncate">Group Otot</th>
                      {evaluations.length > 0 ? (
                        evaluations.map((ev, i) => (
                          <th key={i} colSpan="2" className="p-0.5 border-r last:border-r-0 border-black text-center truncate">
                            {ev.session_name || `T${i+1}`}
                          </th>
                        ))
                      ) : (
                        <th colSpan="2" className="p-0.5 text-center">T1</th>
                      )}
                    </tr>
                    <tr className="border-t border-black">
                      {evaluations.length > 0 ? (
                        evaluations.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="w-4 p-0.5 border-r border-black text-center">D</th>
                            <th className="w-4 p-0.5 border-r last:border-r-0 border-black text-center">S</th>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <th className="w-4 p-0.5 border-r border-black text-center">D</th>
                          <th className="w-4 p-0.5 text-center">S</th>
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
                                <td className="p-0.5 border-r border-black text-center">{g.endfeel_dex || '-'}</td>
                                <td className="p-0.5 border-r last:border-r-0 border-black text-center">
                                  {formatAshworthScore(ev.ashworth_score)}
                                </td>
                              </React.Fragment>
                            ))
                          ) : (
                            <>
                              <td className="p-0.5 border-r border-black text-center">{g.endfeel_dex || '-'}</td>
                              <td className="p-0.5 text-center">{g.endfeel_sin || '-'}</td>
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
                Tabel Evaluasi Kekuatan Otot (MMT) Antar Sesi
              </strong>
              <div className="border border-black overflow-hidden">
                <table className="table-fixed w-full text-center divide-y divide-black text-[8px]">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th rowSpan="2" className="w-12 p-0.5 text-center border-r border-black truncate">Regio</th>
                      <th rowSpan="2" className="p-0.5 text-center border-r border-black truncate">Grup</th>
                      {evaluations.length > 0 ? (
                        evaluations.map((ev, i) => (
                          <th key={i} colSpan="2" className="p-0.5 border-r last:border-r-0 border-black text-center truncate">
                            {ev.session_name || `T${i+1}`}
                          </th>
                        ))
                      ) : (
                        <th colSpan="2" className="p-0.5 text-center">T1</th>
                      )}
                    </tr>
                    <tr className="border-t border-black">
                      {evaluations.length > 0 ? (
                        evaluations.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="w-4 p-0.5 border-r border-black text-center">D</th>
                            <th className="w-4 p-0.5 border-r last:border-r-0 border-black text-center">S</th>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <th className="w-4 p-0.5 border-r border-black text-center">D</th>
                          <th className="w-4 p-0.5 text-center">S</th>
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
                                  <td className="p-0.5 border-r border-black text-center">{matchRow?.dex ?? m.dex_skor ?? '-'}</td>
                                  <td className="p-0.5 border-r last:border-r-0 border-black text-center">{matchRow?.sin ?? m.sin_skor ?? '-'}</td>
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
              CATATAN:
            </strong>
            <p className="text-slate-800">
              {physioNotes || '-'}
            </p>
          </div>

          {/* Lembar Tanda Tangan */}
          {includeStudent ? (
            <div className="pt-3 grid grid-cols-2 gap-4 text-center text-[10px] break-inside-avoid">
              <div>
                <p>Tanda Tangan,</p>
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {studentName || '( Nama Lengkap Mahasiswa )'}
                </strong>
                <span className="font-mono text-slate-600 block">
                  NIM: {studentNim || '....................'}
                </span>
              </div>

              <div>
                <p>Surakarta, {todayFormatted}</p>
                <p className="mt-0.5">Tanda Tangan,</p>
                <div className="h-12 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan & Cap )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {supervisorName || '( Nama Lengkap Clinical Educator )'}
                </strong>
                <span className="font-mono text-slate-600 block">
                  NIK / SIPF: {supervisorNik || '....................'}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 flex justify-end text-center text-[10px] break-inside-avoid">
              <div className="w-64">
                <p>Surakarta, {todayFormatted}</p>
                <p className="mt-0.5">Fisioterapis Penanggung Jawab,</p>
                <div className="h-14 flex items-end justify-center">
                  <span className="font-serif italic text-slate-300 select-none">( Tanda Tangan & Stempel )</span>
                </div>
                <strong className="block underline text-slate-900 mt-1">
                  {supervisorName || '( ........................................ )'}
                </strong>
                <span className="font-mono text-slate-600 block">
                  SIPF / NIK: {supervisorNik || '....................'}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

    </AppLayout>
  );
}
