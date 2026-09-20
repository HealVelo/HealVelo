import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Components/Button';
import FormInput from '@/Components/FormInput';
import { 
  UserPlus, 
  Search, 
  Stethoscope, 
  X, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const BODY_REGIONS = [
  { key: 'cervical', label: 'Cervical / Leher', code: 'CER-01' },
  { key: 'shoulder', label: 'Shoulder / Bahu', code: 'SHL-02' },
  { key: 'thoracal', label: 'Thoracal / Punggung Atas', code: 'THO-03' },
  { key: 'lumbal', label: 'Lumbal / Punggung Bawah', code: 'LUM-04' },
  { key: 'hip', label: 'Hip / Panggul', code: 'HIP-05' },
  { key: 'knee', label: 'Knee / Lutut', code: 'KNE-06' },
  { key: 'ankle', label: 'Ankle & Foot', code: 'ANK-07' },
  { key: 'pediatric_full_body', label: 'Pediatrik / Kasus Kompleks', code: 'PED-08' },
];

const RELIGIONS = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];

export default function PatientIndex({ patients = [], currentPage = 1, totalPages = 1, totalPatients = 0 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatientForAssessment, setSelectedPatientForAssessment] = useState(null);
  const [selectedRegionKey, setSelectedRegionKey] = useState('');
  const [isGeneratingRm, setIsGeneratingRm] = useState(false);

  const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
    name: '',
    no_rm: '',
    age: '',
    gender: 'Laki-Laki',
    occupation: '',
    religion: 'Islam',
    address: '',
    medical_diagnosis: '',
    clinical_notes: '',
    general_treatment: '',
    doctor_referral: '',
    clinical_attachment: null,
  });

  // Generator No. RM Otomatis
  const handleGenerateRm = async () => {
    setIsGeneratingRm(true);
    try {
      const res = await fetch('/api/patients/generate-rm');
      const json = await res.json();
      if (json.no_rm) {
        setData('no_rm', json.no_rm);
        clearErrors('no_rm');
      }
    } catch (err) {
      console.error('Gagal generate No RM', err);
    } finally {
      setIsGeneratingRm(false);
    }
  };

  // Validasi Nama Hanya Huruf & Minimal 3 Karakter
  const handleNameChange = (e) => {
    const val = e.target.value;
    const regex = /^[a-zA-Z\s.,'-]*$/;
    if (!regex.test(val)) {
      setError('name', 'Nama lengkap hanya boleh mengandung karakter huruf alfabet.');
      return;
    }
    clearErrors('name');
    setData('name', val);
  };

  // Validasi Umur Angka Positif Maksimal 120
  const handleAgeChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setData('age', '');
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 120) {
      return;
    }
    clearErrors('age');
    setData('age', num);
  };

  const handleCreatePatientSubmit = (e) => {
    e.preventDefault();
    if (data.name.trim().length < 3) {
      setError('name', 'Nama pasien minimal 3 karakter.');
      return;
    }
    post('/patients', {
      forceFormData: true,
      onSuccess: () => {
        setIsCreateModalOpen(false);
        reset();
      },
    });
  };

  const handleProceedToAssessment = () => {
    if (!selectedPatientForAssessment || !selectedRegionKey) return;
    router.visit(`/physio-kit/assessment?area=${selectedRegionKey}&patient_id=${selectedPatientForAssessment.id}`);
  };

  const filteredPatients = patients.filter((p) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.no_rm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.complaint?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="Direktori Pasien - EasyFisio">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Direktori Pasien</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Total pasien terdaftar: <strong className="text-slate-800 font-mono">{totalPatients} Pasien</strong>
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus size={15} /> Tambah Pasien Baru
        </Button>
      </div>

      {/* Filter Pencarian */}
      <div className="mb-4 flex items-center gap-2 border border-slate-200 bg-white p-2 rounded-xs max-w-md shadow-2xs">
        <Search size={16} className="text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama pasien, No RM, atau keluhan diagnosis..."
          className="w-full text-xs text-slate-800 bg-transparent outline-none"
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => setSearchTerm('')} 
            className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Tabel Data Pasien */}
      <div className="border border-slate-200 bg-white rounded-xs shadow-2xs overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-800 text-white uppercase font-bold tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3">Inisial & Nama Pasien</th>
              <th className="px-4 py-3">No. RM</th>
              <th className="px-4 py-3">Umur / Gender</th>
              <th className="px-4 py-3">Diagnosis / Keluhan</th>
              <th className="px-4 py-3">Tgl Registrasi</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, idx) => (
                <tr 
                  key={patient.id} 
                  onClick={() => router.visit(`/patients/${patient.id}`)}
                  className={`cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 hover:bg-slate-100/60'
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center justify-center text-xs">
                        {patient.initials || 'PX'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block hover:text-blue-600 transition-colors">
                          {patient.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID #{patient.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-slate-700">
                    {patient.no_rm}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                    {patient.age} th / {patient.gender || '-'}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-block max-w-xs truncate font-medium text-slate-900">
                      {patient.complaint}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {patient.created_at}
                  </td>
                  {/* Kolom Aksi Presisi di Tengah */}
                  <td 
                    className="px-5 py-3.5 whitespace-nowrap text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientForAssessment(patient);
                        setSelectedRegionKey('');
                      }}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-white text-[11px] bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xs transition-colors shadow-2xs"
                    >
                      <Stethoscope size={13} /> Assessment
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  {searchTerm ? 'Tidak ada data pasien yang sesuai kata kunci.' : 'Belum ada data pasien tersimpan.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Halaman <strong className="text-slate-800">{currentPage}</strong> dari {totalPages || 1}</span>
        <span className="text-[11px] text-slate-400">Klik baris pasien untuk membuka detail rekam medis</span>
      </div>

      {/* MODAL 1: TAMBAH PASIEN BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 shadow-xl rounded-xs max-w-2xl w-full my-8 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-blue-700" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  Pendaftaran Pasien Baru
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePatientSubmit} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* I. Keterangan Umum Penderita */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
                  I. Keterangan Umum Penderita
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Nama Lengkap <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={handleNameChange}
                      required
                      placeholder="Hanya huruf (min. 3 karakter)..."
                      className="w-full border border-slate-300 rounded-xs py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none"
                    />
                    {errors.name && <span className="text-[11px] text-red-600 mt-1 block">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Nomor Rekam Medis (No RM)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.no_rm}
                        onChange={(e) => setData('no_rm', e.target.value)}
                        placeholder="Contoh: 10871"
                        className="w-full border border-slate-300 rounded-xs py-1.5 px-2.5 text-xs font-mono text-slate-800 bg-white focus:border-cyan-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRm}
                        disabled={isGeneratingRm}
                        title="Generate No RM Otomatis"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-[11px] font-bold uppercase text-slate-700 whitespace-nowrap"
                      >
                        <RefreshCw size={12} className={isGeneratingRm ? 'animate-spin' : ''} /> Auto
                      </button>
                    </div>
                    {errors.no_rm && <span className="text-[11px] text-red-600 mt-1 block">{errors.no_rm}</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Umur (Tahun) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={data.age}
                      onChange={handleAgeChange}
                      required
                      placeholder="0 - 120"
                      className="w-full border border-slate-300 rounded-xs py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:border-cyan-600 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {errors.age && <span className="text-[11px] text-red-600 mt-1 block">{errors.age}</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Jenis Kelamin <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={data.gender}
                      onChange={(e) => setData('gender', e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-xs py-1.5 px-2 text-xs bg-white focus:border-cyan-600 outline-none"
                    >
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <FormInput
                    label="Pekerjaan"
                    value={data.occupation}
                    onChange={(e) => setData('occupation', e.target.value)}
                    required={true}
                    placeholder="Contoh: Belum Bekerja / Pegawai Swasta"
                    error={errors.occupation}
                  />

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Agama
                    </label>
                    <select
                      value={data.religion}
                      onChange={(e) => setData('religion', e.target.value)}
                      className="w-full border border-slate-300 rounded-xs py-1.5 px-2 text-xs bg-white focus:border-cyan-600 outline-none"
                    >
                      {RELIGIONS.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      rows="2"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      placeholder="Contoh: Karangtengah 02/06 Kartasura, Sukoharjo"
                      className="w-full border border-slate-300 rounded-xs p-2 text-xs focus:border-cyan-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* II. Data-Data Medis Rumah Sakit */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
                  II. Data-Data Medis Rumah Sakit
                </h4>
                <div className="space-y-3 text-xs">
                  <FormInput
                    label="A. DIAGNOSIS MEDIS"
                    value={data.medical_diagnosis}
                    onChange={(e) => setData('medical_diagnosis', e.target.value)}
                    placeholder="Contoh: Cerebral Palsy Hemiplegi Spastik"
                  />

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      B. CATATAN KLINIS (Rontgen, Uji Lab, CT-Scan, MRI, EMG, EEG)
                    </label>
                    <textarea
                      rows="2"
                      value={data.clinical_notes}
                      onChange={(e) => setData('clinical_notes', e.target.value)}
                      placeholder="Catatan hasil pembacaan dokter / pemeriksaan penunjang..."
                      className="w-full border border-slate-300 rounded-xs p-2 text-xs focus:border-cyan-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                      Unggah Berkas Penunjang (PDF / Gambar Radiologi)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-slate-700 text-xs font-semibold">
                        <Upload size={14} /> Pilih PDF/Gambar
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          onChange={(e) => setData('clinical_attachment', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-500 truncate">
                        {data.clinical_attachment ? data.clinical_attachment.name : 'Tidak ada berkas dipilih'}
                      </span>
                    </div>
                  </div>

                  <FormInput
                    label="B. TERAPI UMUM (GENERAL TREATMENT)"
                    value={data.general_treatment}
                    onChange={(e) => setData('general_treatment', e.target.value)}
                    placeholder="Medikamentosa / terapi umum dokter..."
                  />

                  <FormInput
                    label="C. RUJUKAN FISIOTERAPI DARI DOKTER"
                    value={data.doctor_referral}
                    onChange={(e) => setData('doctor_referral', e.target.value)}
                    placeholder="Instruksi rujukan fisioterapi spesifik..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={processing}>
                  Simpan Data Pasien
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PILIH REGIO ASSESSMENT */}
      {selectedPatientForAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-300 shadow-xl rounded-xs max-w-xl w-full p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-xs">
                  Asesmen Fisioterapi
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Pilih Regio Kasus: <span className="text-blue-600">{selectedPatientForAssessment.name}</span>
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedPatientForAssessment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {BODY_REGIONS.map((reg) => {
                const isSelected = selectedRegionKey === reg.key;
                return (
                  <button
                    key={reg.key}
                    type="button"
                    onClick={() => setSelectedRegionKey(reg.key)}
                    className={`p-3 text-left border rounded-xs transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/70 ring-1 ring-cyan-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{reg.code}</span>
                      <strong className="text-xs text-slate-900 block mt-1 leading-snug">{reg.label}</strong>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={14} className="text-cyan-600 mt-2 self-end" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs text-slate-500">
                {selectedRegionKey ? `Regio: ${selectedRegionKey.toUpperCase()}` : 'Pilih regio keluhan'}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedPatientForAssessment(null)}>
                  Batal
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  disabled={!selectedRegionKey} 
                  onClick={handleProceedToAssessment}
                >
                  Buka Assessment <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}