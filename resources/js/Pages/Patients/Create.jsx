import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import FormInput from '@/Components/FormInput';
import { ArrowLeft, Save, User, FileText } from 'lucide-react';

export default function PatientCreate() {
  const { data, setData, post, processing, errors } = useForm({
    // KETERANGAN UMUM PENDERITA
    name: '',
    age: '',
    gender: 'Laki-Laki',
    religion: '',
    occupation: '',
    address: '',
    no_rm: '',

    // DATA-DATA MEDIS RUMAH SAKIT
    medical_diagnosis: '',
    clinical_notes: '',
    general_treatment: '',
    doctor_referral: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/patients');
  };

  return (
    <AppLayout title="Pendaftaran Pasien Baru - EasyFisio">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <a 
          href="/patients" 
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali ke Daftar Pasien
        </a>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Form Pendaftaran Pasien Baru</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Lengkapi identitas umum penderita dan rekam medis rujukan rumah sakit. Field bertanda <span className="text-red-500 font-bold">*</span> wajib diisi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16">
        
        {/* I. KETERANGAN UMUM PENDERITA */}
        <Card 
          title="I. KETERANGAN UMUM PENDERITA" 
          subtitle="Identitas demografi dasar pasien fisioterapi."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <FormInput
              label="Nama Lengkap"
              name="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required={true}
              placeholder="Contoh: An. Fahreza / Ny. Sarah"
              error={errors.name}
            />

            <FormInput
              label="Nomor Rekam Medis (No RM)"
              name="no_rm"
              value={data.no_rm}
              onChange={(e) => setData('no_rm', e.target.value)}
              placeholder="Contoh: 10871"
              error={errors.no_rm}
            />

            <FormInput
              label="Umur"
              name="age"
              value={data.age}
              onChange={(e) => setData('age', e.target.value)}
              required={true}
              placeholder="Contoh: 4 tahun 7 bulan / 32 tahun"
              error={errors.age}
            />

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                Jenis Kelamin <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={data.gender}
                onChange={(e) => setData('gender', e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xs py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.gender && <span className="text-[11px] text-red-600 mt-1 block">{errors.gender}</span>}
            </div>

            <FormInput
              label="Pekerjaan"
              name="occupation"
              value={data.occupation}
              onChange={(e) => setData('occupation', e.target.value)}
              required={true}
              placeholder="Contoh: Pelajar / Karyawan Swasta / Belum Bekerja"
              error={errors.occupation}
            />

            <FormInput
              label="Agama"
              name="religion"
              value={data.religion}
              onChange={(e) => setData('religion', e.target.value)}
              placeholder="Contoh: Islam / Kristen / Katolik / Hindu / Buddha"
              error={errors.religion}
            />

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows="2"
                value={data.address}
                onChange={(e) => setData('address', e.target.value)}
                placeholder="Alamat domisili atau tempat tinggal pasien saat ini..."
                className="w-full border border-slate-300 rounded-xs p-2.5 text-xs text-slate-800 bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none"
              />
              {errors.address && <span className="text-[11px] text-red-600 mt-1 block">{errors.address}</span>}
            </div>
          </div>
        </Card>

        {/* II. DATA-DATA MEDIS RUMAH SAKIT */}
        <Card 
          title="II. DATA-DATA MEDIS RUMAH SAKIT" 
          subtitle="Catatan rujukan klinis, pemeriksaan penunjang, dan terapi umum dokter."
        >
          <div className="space-y-4 text-xs">
            <FormInput
              label="A. DIAGNOSIS MEDIS"
              name="medical_diagnosis"
              value={data.medical_diagnosis}
              onChange={(e) => setData('medical_diagnosis', e.target.value)}
              placeholder="Contoh: Cerebral Palsy Spastik Diplegi / Frozen Shoulder Dextra"
              error={errors.medical_diagnosis}
            />

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                B. CATATAN KLINIS
              </label>
              <p className="text-[10px] text-slate-400 mb-1">
                (Hasil: Foto Rontgen, uji Laboratorium, CT-Scan, MRI, EMG, EKG, EEG, dll yang terkait permasalahan fisioterapi)
              </p>
              <textarea
                rows="3"
                value={data.clinical_notes}
                onChange={(e) => setData('clinical_notes', e.target.value)}
                placeholder="Rontgen AP/Lat: Tidak tampak diskontinuitas tulang, penyempitan foramen L4-L5..."
                className="w-full border border-slate-300 rounded-xs p-2.5 text-xs text-slate-800 bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 outline-none"
              />
              {errors.clinical_notes && <span className="text-[11px] text-red-600 mt-1 block">{errors.clinical_notes}</span>}
            </div>

            <FormInput
              label="B. TERAPI UMUM (GENERAL TREATMENT)"
              name="general_treatment"
              value={data.general_treatment}
              onChange={(e) => setData('general_treatment', e.target.value)}
              placeholder="Contoh: NSAID oral 2x1, Muscle relaxant, Vitamin B kompleks"
              error={errors.general_treatment}
            />

            <FormInput
              label="C. RUJUKAN FISIOTERAPI DARI DOKTER"
              name="doctor_referral"
              value={data.doctor_referral}
              onChange={(e) => setData('doctor_referral', e.target.value)}
              placeholder="Contoh: Mohon evaluasi & program fisioterapi mobilisasi dan penguatan otot"
              error={errors.doctor_referral}
            />
          </div>
        </Card>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <a href="/patients">
            <Button type="button" variant="outline">Batal</Button>
          </a>
          <Button type="submit" variant="primary" disabled={processing}>
            <Save size={14} /> Simpan Data Pasien
          </Button>
        </div>

      </form>
    </AppLayout>
  );
}