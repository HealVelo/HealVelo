import React from 'react';
import { ClipboardCheck, X, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import Button from '@/Components/Button';

export default function AssessmentModals({
  showCheckFormModal,
  setShowCheckFormModal,
  totalMissingCount,
  allAudits,
  scrollToTargetElement,
  handleSubmit,
  showRestoreModal,
  setShowRestoreModal,
  handleRestoreDraft,
  missingModal,
  setMissingModal,
  activeNrsModal,
  setActiveNrsModal,
  painNrs,
  setData,
}) {
  return (
    <>
      {/* MODAL CHECK FORM LENGKAP */}
      {showCheckFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <ClipboardCheck size={17} className="text-blue-600" />
                <span>Hasil Audit Kelengkapan Formulir Asesmen</span>
              </div>
              <button onClick={() => setShowCheckFormModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="my-4">
              {totalMissingCount === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <span><strong>Formulir Sempurna!</strong> Seluruh kolom wajib dari Tahap 1 hingga Tahap 3 telah terisi lengkap dan siap dianalisis oleh AI.</span>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ditemukan <strong className="text-rose-600 font-bold">{totalMissingCount} field</strong> yang belum terisi lengkap. Klik salah satu item di bawah untuk langsung menuju field yang bersangkutan:
                </p>
              )}
            </div>

            {totalMissingCount > 0 && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
                {allAudits.map((group, gIdx) => group.missing.length > 0 && (
                  <div key={gIdx} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-1.5">
                    <span className="font-bold text-[11px] text-slate-700 block uppercase tracking-wider">
                      {group.title} ({group.missing.length} belum)
                    </span>
                    <div className="space-y-1">
                      {group.missing.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => scrollToTargetElement(item.id, group.step)}
                          className="w-full text-left p-2 rounded-md bg-white border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 flex items-center justify-between transition-colors group text-[11px]"
                        >
                          <span className="text-slate-700 group-hover:text-blue-900 font-medium">{item.label}</span>
                          <span className="text-[10px] text-blue-600 font-bold">Lengkapi →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" className="text-xs" onClick={() => setShowCheckFormModal(false)}>
                Tutup Audit
              </Button>
              {totalMissingCount === 0 && (
                <Button
                  variant="primary"
                  className="text-xs"
                  onClick={(e) => {
                    setShowCheckFormModal(false);
                    handleSubmit(e);
                  }}
                >
                  Lanjut Simpan Sekarang
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING RESTORE DRAFT MODAL */}
      {showRestoreModal && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border border-blue-300 rounded-xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
              <RotateCcw size={16} />
              <span>Draf Asesmen Ditemukan</span>
            </div>
            <button onClick={() => setShowRestoreModal(false)} className="text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
            Sistem mendeteksi draf asesmen sebelumnya yang belum tersimpan ke server.
          </p>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowRestoreModal(false)}
              className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800"
            >
              Abaikan
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors"
            >
              Klik untuk Restore Data
            </button>
          </div>
        </div>
      )}

      {/* MODAL POP-UP MISSING FIELDS */}
      {missingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase">
                <AlertCircle size={16} />
                <span>{missingModal.title}</span>
              </div>
              <button onClick={() => setMissingModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 mb-2">
              Klik salah satu kolom berikut untuk langsung menuju posisi input (ditandai dengan kedipan biru):
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {missingModal.items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToTargetElement(item.id, missingModal.stepId)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-between text-xs transition-all group"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-blue-900">{item.label}</span>
                  <span className="text-[10px] text-blue-600 font-bold">Isi Sekarang →</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <Button variant="outline" className="text-xs" onClick={() => setMissingModal(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KETERANGAN NYERI NRS */}
      {activeNrsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-300 shadow-lg rounded-xs max-w-md w-full p-5">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-xs font-bold uppercase text-slate-900">
                Deskripsi Nyeri: {activeNrsModal.label}
              </h3>
              <button onClick={() => setActiveNrsModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <textarea
              rows="3"
              value={painNrs[activeNrsModal.key][`${activeNrsModal.side}_ket`]}
              onChange={(e) =>
                setData('pain_nrs', {
                  ...painNrs,
                  [activeNrsModal.key]: {
                    ...painNrs[activeNrsModal.key],
                    [`${activeNrsModal.side}_ket`]: e.target.value,
                  },
                })
              }
              placeholder="Deskripsikan sensasi nyeri..."
              className="w-full border border-slate-300 rounded-xs p-2 text-xs focus:border-cyan-600 outline-none bg-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="primary" onClick={() => setActiveNrsModal(null)}>
                Simpan Deskripsi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
