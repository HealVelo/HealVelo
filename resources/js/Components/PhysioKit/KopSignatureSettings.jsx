import React from 'react';
import { Building2, Upload, Trash2 } from 'lucide-react';

export default function KopSignatureSettings({
  kopType,
  setKopType,
  customKopImage,
  onUploadKop,
  onResetKop,
  availableSupervisors = [],
  supervisorMode,
  selectedSupervisorId,
  onSupervisorChange,
  supervisorName,
  setSupervisorName,
  supervisorNik,
  setSupervisorNik,
  includeStudent,
  setIncludeStudent,
  studentName,
  setStudentName,
  studentNim,
  setStudentNim,
}) {
  return (
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
              <span>Format UMS</span>
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
                  <input type="file" accept="image/*" onChange={onUploadKop} className="hidden" />
                </label>
                {customKopImage && (
                  <button
                    type="button"
                    onClick={onResetKop}
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
              onChange={onSupervisorChange}
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
  );
}

