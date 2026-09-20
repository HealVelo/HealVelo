import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AccordionSection from '@/Components/AccordionSection';
import FormInput from '@/Components/FormInput';
import Button from '@/Components/Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Trash2, 
  MessageSquare, 
  X, 
  Check, 
  AlertCircle, 
  RotateCcw,
  ClipboardCheck,
  CheckCircle2,
  Baby,
  UserCheck
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 1, title: 'Data Subjektif' },
  { id: 2, title: 'DATA OBJEKTIF' },
  { id: 3, title: 'Pengukuran & Special Tests' },
];

const GERAKAN_DEFAULT = ['Fleksi', 'Ekstensi', 'Abduksi', 'Adduksi', 'Eksorotasi', 'Endorotasi'];

export default function Assessment({ area = 'shoulder', patient_id = '', patients = [] }) {
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(1);
  const [activeNrsModal, setActiveNrsModal] = useState(null);
  const [customTestInput, setCustomTestInput] = useState('');
  
  // State untuk Restore Draft & Modal Navigasi
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [missingModal, setMissingModal] = useState(null);

  // State Audit Form Keseluruhan (Check Form Button)
  const [showCheckFormModal, setShowCheckFormModal] = useState(false);

  // State "Touched": Peringatan aktif ketika user mencoba melangkah maju
  const [attemptedStep1, setAttemptedStep1] = useState(false);
  const [attemptedStep2, setAttemptedStep2] = useState(false);
  const [attemptedStep3, setAttemptedStep3] = useState(false);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const targetPatientId = patient_id || (urlParams ? urlParams.get('patient_id') || '' : '');
  const storageKey = `healvelo_assessment_draft_${targetPatientId || 'guest'}_${area}`;

  // ========================================================
  // INITIAL STATE FORM LENGKAP
  // ========================================================
  const { data, setData, post, processing, errors } = useForm({
    patient_id: targetPatientId,
    selected_regio: area,

    // DATA SUBJEKTIF
    keluhan_utama: '',
    riwayat_penyakit_sekarang: '',
    riwayat_penyakit_dahulu: '',
    riwayat_penyakit_penyerta: '',
    riwayat_pribadi_keluarga: '',
    
    // Khusus Pediatrik (Tumbuh Kembang)
    riwayat_prenatal: '',
    riwayat_natal: '',
    riwayat_postnatal: '',

    anamnesis_sistem: {
      kepala_leher: '',
      kardiovaskuler: '',
      respirasi: '',
      gastrointestinalis: '',
      urogenital: '',
      muskuloskeletal: '',
      nervorum: '',
    },

    // 1.1 TANDA VITAL
    vital_sign: {
      td: '',
      hr: '',
      rr: '',
      temp: '',
      tb: '',
      bb: '',
    },

    // 1.2 - 1.4 PEMERIKSAAN FISIK
    inspeksi_statis: '',
    inspeksi_dinamis: '',
    palpasi: '',
    perkusi: '',

    // 1.6 GERAKAN DASAR
    gerak_aktif: GERAKAN_DEFAULT.map((g) => ({ gerakan: g, rom_dex: '', nyeri_dex: '', rom_sin: '', nyeri_sin: '' })),
    gerak_pasif: GERAKAN_DEFAULT.map((g) => ({ gerakan: g, rom_dex: '', nyeri_dex: '', endfeel_dex: '', rom_sin: '', nyeri_sin: '', endfeel_sin: '' })),
    gerak_isometrik: GERAKAN_DEFAULT.map((g) => ({ gerakan: g, nyeri_dex: '', tahanan_dex: '', nyeri_sin: '', tahanan_sin: '' })),

    // 1.9.a NYERI NRS
    pain_nrs: {
      diam: { dex_val: '', dex_ket: '', sin_val: '', sin_ket: '' },
      tekan: { dex_val: '', dex_ket: '', sin_val: '', sin_ket: '' },
      gerak: { dex_val: '', dex_ket: '', sin_val: '', sin_ket: '' },
    },

    // 1.9.b MMT
    mmt_rows: GERAKAN_DEFAULT.map((g) => ({ gerakan: g, dex_skor: '', sin_skor: '' })),

    // 1.9.c LGS
    lgs_data: {
      dextra: {
        ekstensi_fleksi: '',
        abduksi_adduksi: '',
        eksorotasi_endorotasi: '',
      },
      sinistra: {
        ekstensi_fleksi: '',
        abduksi_adduksi: '',
        eksorotasi_endorotasi: '',
      },
      normal: {
        ekstensi_fleksi: 'S: 45-0-180',
        abduksi_adduksi: 'F: 180-0-45',
        eksorotasi_endorotasi: 'R: 90-0-80',
      },
    },

    // SENSIBILITAS, GMFCS & GMFM TOTAL
    sensibilitas_records: {
      Visual: 'Normal',
      Auditory: 'Normal',
      Vestibular: 'Normal',
      Tactile: 'Normal',
      Proprioceptive: 'Normal',
    },
    gmfcs_level: 'Level II',
    gmfm_total: '',

    // SPECIAL TESTS
    special_tests: [
      { name: 'Neer Test', result: '' },
      { name: 'Hawkins-Kennedy Test', result: '' },
      { name: 'Speed Test', result: '' },
    ],
  });

  // ========================================================
  // DETEKSI CERDAS OTOMATIS & TERKUNCI (TANPA MANUAL SWITCH)
  // ========================================================
  const currentPatient = useMemo(() => {
    return patients.find((p) => String(p.id) === String(data.patient_id));
  }, [patients, data.patient_id]);

  // Terkunci murni: Jika umur <= 12 tahun ATAU regio awal adalah pediatric_full_body
  const isPediatricMode = useMemo(() => {
    if (area === 'pediatric_full_body') return true;
    if (currentPatient && currentPatient.age !== undefined && currentPatient.age !== null) {
      return Number(currentPatient.age) <= 12;
    }
    return false;
  }, [currentPatient, area]);

  // Sinkronisasi otomatis regio saat pasien dipilih
  useEffect(() => {
    if (currentPatient) {
      const isChild = Number(currentPatient.age) <= 12;
      if (isChild && data.selected_regio !== 'pediatric_full_body') {
        setData('selected_regio', 'pediatric_full_body');
      } else if (!isChild && data.selected_regio === 'pediatric_full_body' && area !== 'pediatric_full_body') {
        setData('selected_regio', area);
      }
    }
  }, [currentPatient]);

  // ========================================================
  // AUTO-SAVE & RESTORE DRAFT
  // ========================================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasContent = Boolean(
          parsed.keluhan_utama || 
          parsed.riwayat_penyakit_sekarang || 
          parsed.vital_sign?.td ||
          parsed.vital_sign?.hr
        );
        if (hasContent) {
          setShowRestoreModal(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasContent = Boolean(
        data.keluhan_utama ||
        data.riwayat_penyakit_sekarang ||
        data.vital_sign?.td ||
        data.vital_sign?.hr
      );
      if (hasContent) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [data, storageKey]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => {
          setData(k, v);
        });
      }
    } catch (e) {
      console.error(e);
    }
    setShowRestoreModal(false);
  };

  // ========================================================
  // VALIDASI INPUT VITAL & FORMAT LGS STRIP
  // ========================================================
  const handleBloodPressureChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      setData('vital_sign', { ...data.vital_sign, td: '' });
      return;
    }
    if (raw.length > 6) raw = raw.substring(0, 6);

    let formatted = raw;
    if (raw.length > 3) {
      const sys = Math.min(parseInt(raw.substring(0, 3), 10) || 0, 260);
      const dia = Math.min(parseInt(raw.substring(3), 10) || 0, 160);
      formatted = `${sys}/${dia}`;
    }
    setData('vital_sign', { ...data.vital_sign, td: formatted });
  };

  const handleHeartRateChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setData('vital_sign', { ...data.vital_sign, hr: '' });
      return;
    }
    let val = parseInt(raw, 10);
    if (isNaN(val)) return;
    if (val < 0) val = 0;
    if (val > 220) val = 220;
    setData('vital_sign', { ...data.vital_sign, hr: val.toString() });
  };

  const handleRespiratoryRateChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setData('vital_sign', { ...data.vital_sign, rr: '' });
      return;
    }
    let val = parseInt(raw, 10);
    if (isNaN(val)) return;
    if (val > 80) val = 80;
    setData('vital_sign', { ...data.vital_sign, rr: val.toString() });
  };

  const handleTemperatureChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setData('vital_sign', { ...data.vital_sign, temp: '' });
      return;
    }
    let val = parseFloat(raw);
    if (isNaN(val)) return;
    if (val > 43.0) val = 43.0;
    setData('vital_sign', { ...data.vital_sign, temp: raw });
  };

  const handleHeightChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setData('vital_sign', { ...data.vital_sign, tb: '' });
      return;
    }
    let val = parseInt(raw, 10);
    if (isNaN(val)) return;
    if (val > 250) val = 250;
    setData('vital_sign', { ...data.vital_sign, tb: val.toString() });
  };

  const handleWeightChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setData('vital_sign', { ...data.vital_sign, bb: '' });
      return;
    }
    let val = parseFloat(raw);
    if (isNaN(val)) return;
    if (val > 250) val = 250;
    setData('vital_sign', { ...data.vital_sign, bb: raw });
  };

  const handleLgsFormatChange = (side, field, rawValue) => {
    const cleanNumbers = rawValue.replace(/[^0-9]/g, '');
    let formatted = cleanNumbers;
    if (cleanNumbers.length > 5) {
      formatted = `${cleanNumbers.substring(0, 2)}-${cleanNumbers.substring(2, 3)}-${cleanNumbers.substring(3, 6)}`;
    } else if (cleanNumbers.length > 2) {
      formatted = `${cleanNumbers.substring(0, 1)}-${cleanNumbers.substring(1, 2)}-${cleanNumbers.substring(2, 5)}`;
    } else if (cleanNumbers.length > 1) {
      formatted = `${cleanNumbers.substring(0, 1)}-${cleanNumbers.substring(1)}`;
    }

    setData('lgs_data', {
      ...data.lgs_data,
      [side]: {
        ...data.lgs_data[side],
        [field]: formatted,
      },
    });
  };

  // ========================================================
  // AUDIT KELENGKAPAN FIELD (3 TAHAP STATUS BADGE)
  // ========================================================

  // 1. Data Subjektif
  const subjektifItems = useMemo(() => {
    const missing = [];
    if (!data.keluhan_utama?.trim()) missing.push({ id: 'target_keluhan_utama', label: '1. Keluhan Utama' });
    if (!data.riwayat_penyakit_sekarang?.trim()) missing.push({ id: 'target_riwayat_sekarang', label: '2. Riwayat Penyakit Sekarang' });
    
    if (isPediatricMode) {
      if (!data.riwayat_prenatal?.trim() && !data.riwayat_penyakit_dahulu?.trim()) missing.push({ id: 'target_prenatal', label: '3. Riwayat Prenatal' });
      if (!data.riwayat_natal?.trim() && !data.riwayat_penyakit_penyerta?.trim()) missing.push({ id: 'target_natal', label: '4. Riwayat Natal' });
      if (!data.riwayat_postnatal?.trim() && !data.riwayat_pribadi_keluarga?.trim()) missing.push({ id: 'target_postnatal', label: '5. Riwayat Postnatal' });
    } else {
      if (!data.riwayat_penyakit_dahulu?.trim()) missing.push({ id: 'target_riwayat_dahulu', label: '3. Riwayat Penyakit Dahulu' });
      if (!data.riwayat_penyakit_penyerta?.trim()) missing.push({ id: 'target_riwayat_penyerta', label: '4. Riwayat Penyakit Penyerta' });
      if (!data.riwayat_pribadi_keluarga?.trim()) missing.push({ id: 'target_riwayat_pribadi', label: '5. Riwayat Pribadi & Keluarga' });
    }

    const hasSistem = Object.values(data.anamnesis_sistem || {}).some((v) => v && v.trim().length > 0);
    if (!hasSistem) {
      missing.push({ id: 'target_anamnesis_sistem', label: '6. Anamnesis Sistemik (Minimal 1 sistem)' });
    }

    const isComplete = missing.length === 0;
    const filledCount = 6 - missing.length;

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (filledCount > 0 || attemptedStep1) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data, attemptedStep1, isPediatricMode]);

  // 2. Tanda Vital 1.1
  const vitalItems = useMemo(() => {
    const missing = [];
    if (!data.vital_sign.td?.includes('/')) missing.push({ id: 'target_vital_td', label: '1.1 Tekanan Darah (Sys/Dia)' });
    if (!data.vital_sign.hr) missing.push({ id: 'target_vital_hr', label: '1.1 Denyut Nadi (HR)' });
    if (!data.vital_sign.rr) missing.push({ id: 'target_vital_rr', label: '1.1 Pernapasan (RR)' });
    if (!data.vital_sign.temp) missing.push({ id: 'target_vital_temp', label: '1.1 Temperatur Suhu' });
    if (!data.vital_sign.tb) missing.push({ id: 'target_vital_tb', label: '1.1 Tinggi Badan' });
    if (!data.vital_sign.bb) missing.push({ id: 'target_vital_bb', label: '1.1 Berat Badan' });

    const isComplete = missing.length === 0;
    const filledCount = 6 - missing.length;

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (filledCount > 0 || attemptedStep2) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.vital_sign, attemptedStep2]);

  // 3. Pemeriksaan Fisik 1.2 - 1.4
  const fisikItems = useMemo(() => {
    const missing = [];
    if (!data.inspeksi_statis?.trim()) missing.push({ id: 'target_inspeksi_statis', label: '1.2 Inspeksi Statis' });
    if (!data.inspeksi_dinamis?.trim()) missing.push({ id: 'target_inspeksi_dinamis', label: '1.2 Inspeksi Dinamis' });
    if (!data.palpasi?.trim()) missing.push({ id: 'target_palpasi', label: '1.3 Palpasi' });

    const isComplete = missing.length === 0;
    const filledCount = 3 - missing.length;

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (filledCount > 0 || attemptedStep2) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.inspeksi_statis, data.inspeksi_dinamis, data.palpasi, attemptedStep2]);

  // 4. Gerakan Dasar 1.6
  const gerakItems = useMemo(() => {
    const missing = [];
    const uncompletedAktif = data.gerak_aktif.filter((r) => !r.rom_dex || !r.nyeri_dex || !r.rom_sin || !r.nyeri_sin);
    if (uncompletedAktif.length > 0) {
      missing.push({ id: 'target_gerak_aktif', label: `1.6 a Gerak Aktif (${uncompletedAktif.length} regio belum lengkap)` });
    }

    const uncompletedPasif = data.gerak_pasif.filter((r) => !r.rom_dex || !r.nyeri_dex || !r.endfeel_dex || !r.rom_sin || !r.nyeri_sin || !r.endfeel_sin);
    if (uncompletedPasif.length > 0) {
      missing.push({ id: 'target_gerak_pasif', label: `1.6 b Gerak Pasif (${uncompletedPasif.length} regio belum lengkap)` });
    }

    const uncompletedIsometrik = data.gerak_isometrik.filter((r) => !r.nyeri_dex || !r.tahanan_dex || !r.nyeri_sin || !r.tahanan_sin);
    if (uncompletedIsometrik.length > 0) {
      missing.push({ id: 'target_gerak_isometrik', label: `1.6 c Gerak Isometrik (${uncompletedIsometrik.length} regio belum lengkap)` });
    }

    const isComplete = missing.length === 0;
    const hasAny = data.gerak_aktif.some((r) => r.rom_dex || r.nyeri_dex) ||
                   data.gerak_pasif.some((r) => r.rom_dex || r.endfeel_dex) ||
                   data.gerak_isometrik.some((r) => r.tahanan_dex);

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (hasAny || attemptedStep2) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.gerak_aktif, data.gerak_pasif, data.gerak_isometrik, attemptedStep2]);

  // 5. Nyeri NRS 1.9.a
  const nrsItems = useMemo(() => {
    const missing = [];
    ['diam', 'tekan', 'gerak'].forEach((k) => {
      if (data.pain_nrs[k].dex_val === '') missing.push({ id: `target_nrs_${k}`, label: `1.9 a Nyeri ${k} Dextra` });
      if (data.pain_nrs[k].sin_val === '') missing.push({ id: `target_nrs_${k}`, label: `1.9 a Nyeri ${k} Sinistra` });
    });

    const isComplete = missing.length === 0;
    const hasAny = ['diam', 'tekan', 'gerak'].some((k) => data.pain_nrs[k].dex_val !== '' || data.pain_nrs[k].sin_val !== '');

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (hasAny || attemptedStep3) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.pain_nrs, attemptedStep3]);

  // 6. MMT 1.9.b
  const mmtItems = useMemo(() => {
    const missing = [];
    const uncompletedMmt = data.mmt_rows.filter((r) => r.dex_skor === '' || r.sin_skor === '');
    if (uncompletedMmt.length > 0) {
      missing.push({ id: 'target_mmt_table', label: `1.9 b MMT (${uncompletedMmt.length} gerakan belum dinilai)` });
    }

    const isComplete = missing.length === 0;
    const hasAny = data.mmt_rows.some((r) => r.dex_skor !== '' || r.sin_skor !== '');

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (hasAny || attemptedStep3) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.mmt_rows, attemptedStep3]);

  // 7. LGS 1.9.c
  const lgsItems = useMemo(() => {
    const missing = [];
    ['ekstensi_fleksi', 'abduksi_adduksi', 'eksorotasi_endorotasi'].forEach((f) => {
      if (!data.lgs_data.dextra[f]?.trim()) missing.push({ id: 'target_lgs_table', label: `1.9 c LGS Dextra (${f})` });
      if (!data.lgs_data.sinistra[f]?.trim()) missing.push({ id: 'target_lgs_table', label: `1.9 c LGS Sinistra (${f})` });
    });

    const isComplete = missing.length === 0;
    const hasAny = Object.values(data.lgs_data.dextra).some((v) => v?.trim()) ||
                   Object.values(data.lgs_data.sinistra).some((v) => v?.trim());

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (hasAny || attemptedStep3) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.lgs_data, attemptedStep3]);

  // 8. Special Tests
  const specialTestsItems = useMemo(() => {
    const missing = [];
    data.special_tests.forEach((t) => {
      if (!t.result) missing.push({ id: 'target_special_tests', label: `Special Test: ${t.name}` });
    });

    const isComplete = missing.length === 0;
    const hasAny = data.special_tests.some((t) => Boolean(t.result));

    let status = 'empty';
    if (isComplete) {
      status = 'complete';
    } else if (hasAny || attemptedStep3) {
      status = 'partial';
    }

    return { isComplete, missing, status };
  }, [data.special_tests, attemptedStep3]);

  // Smart Navigation & Highlight Animasi
  const scrollToTargetElement = (elementId, targetStep) => {
    setCurrentWorkflowStep(targetStep);
    setMissingModal(null);
    setShowCheckFormModal(false);

    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-500', 'bg-blue-50/90', 'animate-pulse');
        const inputChild = el.querySelector('input, textarea, select');
        if (inputChild) inputChild.focus();
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-blue-500', 'bg-blue-50/90', 'animate-pulse');
        }, 2500);
      }
    }, 200);
  };

  // Guard Validasi Navigasi Tab
  const handleTabClick = (targetStep) => {
    if (targetStep === 1) {
      setCurrentWorkflowStep(1);
      return;
    }
    if (targetStep === 2) {
      setAttemptedStep1(true);
      if (!subjektifItems.isComplete) {
        setMissingModal({
          title: 'Lengkapi Data Subjektif Terlebih Dahulu',
          stepId: 1,
          items: subjektifItems.missing,
        });
        return;
      }
      setCurrentWorkflowStep(2);
      return;
    }
    if (targetStep === 3) {
      setAttemptedStep1(true);
      setAttemptedStep2(true);
      if (!subjektifItems.isComplete) {
        setCurrentWorkflowStep(1);
        setMissingModal({
          title: 'Lengkapi Data Subjektif Terlebih Dahulu',
          stepId: 1,
          items: subjektifItems.missing,
        });
        return;
      }
      const combinedStep2 = [...vitalItems.missing, ...fisikItems.missing, ...gerakItems.missing];
      if (combinedStep2.length > 0) {
        setCurrentWorkflowStep(2);
        setMissingModal({
          title: 'Lengkapi DATA OBJEKTIF & Gerakan Dasar 1.6',
          stepId: 2,
          items: combinedStep2,
        });
        return;
      }
      setCurrentWorkflowStep(3);
    }
  };

  const handleProceedStep2 = () => handleTabClick(2);
  const handleProceedStep3 = () => handleTabClick(3);

  const handleAddCustomTest = () => {
    if (!customTestInput.trim()) return;
    setData('special_tests', [...data.special_tests, { name: customTestInput.trim(), result: '' }]);
    setCustomTestInput('');
  };

  const handleRemoveTest = (index) => {
    setData('special_tests', data.special_tests.filter((_, i) => i !== index));
  };

  // Kompilasi Seluruh Audit Formulir (Check Form)
  const allAudits = useMemo(() => {
    return [
      { step: 1, title: 'I. Data Subjektif', missing: subjektifItems.missing },
      { step: 2, title: 'II. 1.1 Tanda-Tanda Vital', missing: vitalItems.missing },
      { step: 2, title: 'II. 1.2-1.4 Pemeriksaan Fisik', missing: fisikItems.missing },
      { step: 2, title: 'II. 1.6 Gerakan Dasar (a, b, c)', missing: gerakItems.missing },
      { step: 3, title: 'III. 1.9.a Nyeri NRS', missing: nrsItems.missing },
      { step: 3, title: 'III. 1.9.b MMT Motorik', missing: mmtItems.missing },
      { step: 3, title: 'III. 1.9.c LGS / ROM Sendi', missing: lgsItems.missing },
      { step: 3, title: 'III. Special Tests', missing: specialTestsItems.missing },
    ];
  }, [subjektifItems, vitalItems, fisikItems, gerakItems, nrsItems, mmtItems, lgsItems, specialTestsItems]);

  const totalMissingCount = useMemo(() => {
    return allAudits.reduce((acc, curr) => acc + curr.missing.length, 0);
  }, [allAudits]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedStep1(true);
    setAttemptedStep2(true);
    setAttemptedStep3(true);

    if (totalMissingCount > 0) {
      setShowCheckFormModal(true);
      return;
    }

    post('/physio-kit/assessment', {
      onSuccess: () => {
        localStorage.removeItem(storageKey);
      },
    });
  };

  return (
    <AppLayout title={`Assessment Fisioterapi - ${area.toUpperCase()}`}>
      <div className="mb-6 border-b border-slate-200 pb-4">
        <a href="/patients" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1">
          <ArrowLeft size={14} /> Kembali ke Direktori Pasien
        </a>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Form Status Klinik S1 Fisioterapi</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Formulir pemeriksaan klinis muskuloskeletal terstandarisasi. Field bertanda <span className="text-red-500 font-bold">*</span> wajib diisi.[cite: 2]
        </p>
      </div>

      {/* Navigasi Horizontal Berurutan */}
      <div className="mb-6 flex border border-slate-200 bg-white rounded-xs overflow-hidden shadow-2xs">
        {WORKFLOW_STEPS.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => handleTabClick(step.id)}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-r last:border-r-0 transition-colors ${
              currentWorkflowStep === step.id
                ? 'bg-blue-600 text-white'
                : currentWorkflowStep > step.id
                ? 'bg-cyan-50 text-cyan-900'
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentWorkflowStep === step.id ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'
            }`}>
              {step.id}
            </span>
            <span>{step.title}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto pb-16">
        
        {/* ========================================================================= */}
        {/* TAHAP 1: DATA SUBJEKTIF (1 - 6 LENGKAP + ADAPTIF PEDIATRIK)              */}
        {/* ========================================================================= */}
        {currentWorkflowStep === 1 && (
          <div>
            <div className="border border-slate-200 bg-white p-5 rounded-xs mb-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider mb-3 border-b pb-2">Identitas Kasus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Pasien Terdaftar <span className="text-red-500 font-bold">*</span>
                  </label>
                  <select
                    value={data.patient_id}
                    onChange={(e) => setData('patient_id', e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-xs p-2 text-xs bg-white focus:border-cyan-600 outline-none"
                  >
                    <option value="">-- Pilih Pasien Terdaftar --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (No. RM: {p.no_rm || '-'} | Umur: {p.age} Thn)</option>
                    ))}
                  </select>
                  {errors.patient_id && <span className="text-[11px] text-red-600 mt-1 block">{errors.patient_id}</span>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Regio Pemeriksaan</label>
                  <input
                    type="text"
                    value={data.selected_regio}
                    disabled
                    className="w-full border border-slate-200 bg-slate-100 rounded-xs p-2 text-xs font-mono uppercase text-slate-600"
                  />
                </div>
              </div>

              {/* INDIKATOR STATUS TERKUNCI OTOMATIS BERDASARKAN UMUR (TANPA MANUAL SWITCH) */}
              {currentPatient && (
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xs border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    {isPediatricMode ? (
                      <span className="px-2.5 py-1 rounded font-bold text-[10px] uppercase bg-amber-100 text-amber-900 flex items-center gap-1.5 border border-amber-300 shadow-2xs">
                        <Baby size={14} className="text-amber-700" /> Mode Pediatrik Terkunci (Usia &le; 12 Tahun)[cite: 7]
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded font-bold text-[10px] uppercase bg-blue-100 text-blue-900 flex items-center gap-1.5 border border-blue-300 shadow-2xs">
                        <UserCheck size={14} className="text-blue-700" /> Mode Dewasa / Umum Terkunci (Usia &gt; 12 Tahun)
                      </span>
                    )}
                    <span className="text-slate-600 text-[11px]">
                      Usia Pasien: <strong className="text-slate-900">{currentPatient.age} Tahun</strong> &bull; Sistem secara otomatis menerapkan instrumen evaluasi {isPediatricMode ? 'tumbuh kembang anak' : 'muskuloskeletal dewasa'}.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <AccordionSection 
                number="A" 
                title="Data Subjektif (Anamnesis Auto / Hetero)" 
                defaultOpen={true} 
                status={subjektifItems.status}
              >
                <div className="space-y-4">
                  {attemptedStep1 && !subjektifItems.isComplete && (
                    <div 
                      onClick={() => setMissingModal({
                        title: 'Data Subjektif Belum Lengkap',
                        stepId: 1,
                        items: subjektifItems.missing,
                      })}
                      className="cursor-pointer bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xs flex items-center justify-between text-xs hover:bg-rose-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-rose-600" />
                        <span><strong>Perhatian:</strong> Ada {subjektifItems.missing.length} poin subjektif yang belum terisi lengkap (1-6).</span>
                      </div>
                      <span className="font-bold underline text-[11px]">Lihat & Lengkapi →</span>
                    </div>
                  )}

                  <div id="target_keluhan_utama">
                    <FormInput
                      label="1. KELUHAN UTAMA (PATIENT/FAMILY PERCEPTION OF PROBLEM)"
                      name="keluhan_utama"
                      value={data.keluhan_utama}
                      onChange={(e) => setData('keluhan_utama', e.target.value)}
                      placeholder="Lokasi spesifik keluhan dan sensasi rasa nyeri yang dirasakan..."
                      required={true}
                    />
                  </div>

                  <div id="target_riwayat_sekarang">
                    <FormInput
                      label="2. RIWAYAT PENYAKIT SEKARANG (RPS)"
                      name="riwayat_penyakit_sekarang"
                      value={data.riwayat_penyakit_sekarang}
                      onChange={(e) => setData('riwayat_penyakit_sekarang', e.target.value)}
                      required={true}
                      placeholder="Onset waktu, kronologi cedera, posisi yang memicu..."
                    />
                  </div>

                  {/* KONDISIONAL OTOMATIS PEDIATRIK VS DEWASA */}
                  {isPediatricMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                      <div id="target_prenatal">
                        <FormInput
                          label="3. PRENATAL"
                          name="riwayat_prenatal"
                          value={data.riwayat_prenatal}
                          onChange={(e) => setData('riwayat_prenatal', e.target.value)}
                          placeholder="Usia ibu saat hamil, komplikasi, obat..."
                        />
                      </div>
                      <div id="target_natal">
                        <FormInput
                          label="4. NATAL"
                          name="riwayat_natal"
                          value={data.riwayat_natal}
                          onChange={(e) => setData('riwayat_natal', e.target.value)}
                          placeholder="Persalinan sesar/normal, asfiksia, HPL..."
                        />
                      </div>
                      <div id="target_postnatal">
                        <FormInput
                          label="5. POSTNATAL"
                          name="riwayat_postnatal"
                          value={data.riwayat_postnatal}
                          onChange={(e) => setData('riwayat_postnatal', e.target.value)}
                          placeholder="Kejang demam, kuning, keterlambatan motorik..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                      <div id="target_riwayat_dahulu">
                        <FormInput
                          label="3. RIWAYAT PENYAKIT DAHULU"
                          name="riwayat_penyakit_dahulu"
                          value={data.riwayat_penyakit_dahulu}
                          onChange={(e) => setData('riwayat_penyakit_dahulu', e.target.value)}
                          required={true}
                          placeholder="Pernah mengalami trauma / riwayat operasi terkait..."
                        />
                      </div>
                      <div id="target_riwayat_penyerta">
                        <FormInput
                          label="4. RIWAYAT PENYAKIT PENYERTA"
                          name="riwayat_penyakit_penyerta"
                          value={data.riwayat_penyakit_penyerta}
                          onChange={(e) => setData('riwayat_penyakit_penyerta', e.target.value)}
                          required={true}
                          placeholder="Hipertensi, diabetes, asam urat, dll..."
                        />
                      </div>
                      <div id="target_riwayat_pribadi">
                        <FormInput
                          label="5. RIWAYAT PRIBADI DAN KELUARGA"
                          name="riwayat_pribadi_keluarga"
                          value={data.riwayat_pribadi_keluarga}
                          onChange={(e) => setData('riwayat_pribadi_keluarga', e.target.value)}
                          required={true}
                          placeholder="Aktivitas kerja, hobi olahraga, riwayat keturunan..."
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. ANAMNESIS SISTEM */}
                  <div id="target_anamnesis_sistem" className="border border-slate-200 rounded-xs overflow-hidden mt-4">
                    <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs font-bold uppercase">
                      <span>6. Anamnesis Sistem Organ Tubuh <span className="text-red-400">*</span></span>
                      <span className="text-[10px] text-slate-300 font-normal">Wajib terisi minimal 1 sistem organ</span>
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-100 font-bold uppercase text-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left w-1/3">Sistem</th>
                          <th className="px-4 py-2 text-left">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {[
                          { key: 'kepala_leher', label: 'Kepala dan Leher' },
                          { key: 'kardiovaskuler', label: 'Kardiovaskuler' },
                          { key: 'respirasi', label: 'Respirasi' },
                          { key: 'gastrointestinalis', label: 'Gastrointestinalis' },
                          { key: 'urogenital', label: 'Urogenital' },
                          { key: 'muskuloskeletal', label: 'Muskuloskeletal' },
                          { key: 'nervorum', label: 'Nervorum' },
                        ].map((item, idx) => (
                          <tr key={item.key} className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                            <td className="px-4 py-2 font-semibold text-slate-800">{item.label}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={data.anamnesis_sistem[item.key]}
                                  onChange={(e) =>
                                    setData('anamnesis_sistem', {
                                      ...data.anamnesis_sistem,
                                      [item.key]: e.target.value,
                                    })
                                  }
                                  placeholder="Ketik keluhan atau klik opsi normal..."
                                  className="flex-1 border border-slate-300 rounded-xs px-2.5 py-1 text-xs focus:border-cyan-600 outline-none bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setData('anamnesis_sistem', {
                                      ...data.anamnesis_sistem,
                                      [item.key]: 'Tidak dikeluhkan, dalam batas normal',
                                    })
                                  }
                                  className="px-2 py-1 text-[10px] font-semibold bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 rounded-xs whitespace-nowrap transition-colors"
                                >
                                  Normal
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionSection>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="button" variant="primary" onClick={handleProceedStep2}>
                Lanjut ke DATA OBJEKTIF <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 2: DATA OBJEKTIF (TTV, FISIK, GERAKAN DASAR 1.6)                     */}
        {/* ========================================================================= */}
        {currentWorkflowStep === 2 && (
          <div>
            {/* SEKSI 1.1: TANDA-TANDA VITAL */}
            <div className="relative mb-4">
              <AccordionSection 
                number="1.1" 
                title="TANDA-TANDA VITAL" 
                defaultOpen={true} 
                status={vitalItems.status}
              >
                <div className="space-y-3">
                  {attemptedStep2 && !vitalItems.isComplete && (
                    <div 
                      onClick={() => setMissingModal({
                        title: 'Tanda-Tanda Vital Belum Lengkap (1.1)',
                        stepId: 2,
                        items: vitalItems.missing,
                      })}
                      className="cursor-pointer bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xs flex items-center justify-between text-xs hover:bg-rose-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-rose-600" />
                        <span><strong>Perhatian 1.1:</strong> Ada {vitalItems.missing.length} parameter tanda vital yang belum terisi.</span>
                      </div>
                      <span className="font-bold underline text-[11px]">Lihat & Lengkapi →</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div id="target_vital_td">
                      <FormInput
                        label="Tekanan Darah"
                        required={true}
                        value={data.vital_sign.td}
                        onChange={handleBloodPressureChange}
                        placeholder="120/80"
                        suffix="mmHg"
                      />
                    </div>

                    <div id="target_vital_hr">
                      <FormInput
                        label="Denyut Nadi"
                        type="number"
                        min={0}
                        max={220}
                        required={true}
                        value={data.vital_sign.hr}
                        onChange={handleHeartRateChange}
                        placeholder="75"
                        suffix="bpm"
                      />
                    </div>

                    <div id="target_vital_rr">
                      <FormInput
                        label="Pernapasan"
                        type="number"
                        min={0}
                        max={80}
                        required={true}
                        value={data.vital_sign.rr}
                        onChange={handleRespiratoryRateChange}
                        placeholder="18"
                        suffix="/mnt"
                      />
                    </div>

                    <div id="target_vital_temp">
                      <FormInput
                        label="Temperatur"
                        type="number"
                        step="0.1"
                        min={0}
                        max={43}
                        required={true}
                        value={data.vital_sign.temp}
                        onChange={handleTemperatureChange}
                        placeholder="36.5"
                        suffix="°C"
                      />
                    </div>

                    <div id="target_vital_tb">
                      <FormInput
                        label="Tinggi Badan"
                        type="number"
                        min={0}
                        max={250}
                        required={true}
                        value={data.vital_sign.tb}
                        onChange={handleHeightChange}
                        placeholder="165"
                        suffix="cm"
                      />
                    </div>

                    <div id="target_vital_bb">
                      <FormInput
                        label="Berat Badan"
                        type="number"
                        min={0}
                        max={250}
                        required={true}
                        value={data.vital_sign.bb}
                        onChange={handleWeightChange}
                        placeholder="60"
                        suffix="kg"
                      />
                    </div>
                  </div>
                </div>
              </AccordionSection>
            </div>

            {/* SEKSI 1.2 - 1.4: PEMERIKSAAN FISIK */}
            <div className="relative mb-4">
              <AccordionSection 
                number="1.2 - 1.4" 
                title="Inspeksi, Palpasi & Perkusi" 
                defaultOpen={true} 
                status={fisikItems.status}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="target_inspeksi_statis">
                      <FormInput
                        label="1.2. Inspeksi Statis"
                        required={true}
                        value={data.inspeksi_statis}
                        onChange={(e) => setData('inspeksi_statis', e.target.value)}
                        placeholder="Posture, deformitas, pembengkakan saat posisi rileks..."
                      />
                    </div>
                    <div id="target_inspeksi_dinamis">
                      <FormInput
                        label="1.2. Inspeksi Dinamis"
                        required={true}
                        value={data.inspeksi_dinamis}
                        onChange={(e) => setData('inspeksi_dinamis', e.target.value)}
                        placeholder="Gait, pola jalan, koordinasi dan kelancaran gerak..."
                      />
                    </div>
                    <div id="target_palpasi">
                      <FormInput
                        label="1.3. Palpasi"
                        required={true}
                        value={data.palpasi}
                        onChange={(e) => setData('palpasi', e.target.value)}
                        placeholder="Nyeri tekan, spasme, suhu lokal, tonus jaringan lunak..."
                      />
                    </div>
                    <div id="target_perkusi">
                      <FormInput
                        label="1.4. Perkusi"
                        value={data.perkusi}
                        onChange={(e) => setData('perkusi', e.target.value)}
                        placeholder="Refleks fisiologis (Biceps, Triceps, Patella, Achilles)..."
                      />
                    </div>
                  </div>
                </div>
              </AccordionSection>
            </div>

            {/* SEKSI 1.6 GERAKAN DASAR */}
            <div className="relative mb-4">
              <AccordionSection 
                number="1.6" 
                title="GERAKAN DASAR & INTEGRITAS SENDI" 
                defaultOpen={true} 
                status={gerakItems.status}
              >
                <div className="space-y-4">
                  
                  {/* a. Gerak Aktif */}
                  <div id="target_gerak_aktif" className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>a. Gerak Aktif <span className="text-red-500 font-bold">*</span></span>
                      <span className="text-[11px] font-normal text-slate-500">Pilih status ROM dan respon nyeri</span>
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-slate-800 text-white font-bold uppercase">
                          <tr>
                            <th rowSpan="2" className="px-3 py-2 text-left w-1/3 border-r">Regio: Gerakan</th>
                            <th colSpan="2" className="px-3 py-1 text-center border-r bg-blue-700">Dextra</th>
                            <th colSpan="2" className="px-3 py-1 text-center bg-cyan-700">Sinistra</th>
                          </tr>
                          <tr className="border-t border-slate-700">
                            <th className="px-2 py-1 text-center">ROM</th>
                            <th className="px-2 py-1 text-center border-r">Nyeri</th>
                            <th className="px-2 py-1 text-center">ROM</th>
                            <th className="px-2 py-1 text-center">Nyeri</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {data.gerak_aktif.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium border-r text-slate-800">{row.gerakan}</td>
                              <td className="px-2 py-1">
                                <select
                                  value={row.rom_dex}
                                  onChange={(e) => {
                                    const list = [...data.gerak_aktif];
                                    list[i].rom_dex = e.target.value;
                                    setData('gerak_aktif', list);
                                  }}
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1.5 text-xs bg-white outline-none focus:border-blue-600"
                                >
                                  <option value="">- ROM -</option>
                                  <option value="Full">Full</option>
                                  <option value="Terbatas">Terbatas</option>
                                  <option value="Hipermobilitas">Hipermobilitas</option>
                                </select>
                              </td>
                              <td className="px-2 py-1 border-r text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_aktif];
                                        list[i].nyeri_dex = sym;
                                        setData('gerak_aktif', list);
                                      }}
                                      className={`px-2 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_dex === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                      }`}
                                    >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1">
                                <select
                                  value={row.rom_sin}
                                  onChange={(e) => {
                                    const list = [...data.gerak_aktif];
                                    list[i].rom_sin = e.target.value;
                                    setData('gerak_aktif', list);
                                  }}
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1.5 text-xs bg-white outline-none focus:border-blue-600"
                                >
                                  <option value="">- ROM -</option>
                                  <option value="Full">Full</option>
                                  <option value="Terbatas">Terbatas</option>
                                  <option value="Hipermobilitas">Hipermobilitas</option>
                                </select>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_aktif];
                                        list[i].nyeri_sin = sym;
                                        setData('gerak_aktif', list);
                                      }}
                                      className={`px-2 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_sin === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                      }`}
                                    >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* b. Gerak Pasif */}
                  <div id="target_gerak_pasif" className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-slate-800 mb-2 border-b border-slate-200 pb-1">
                      b. Gerak Pasif & End-Feel <span className="text-red-500 font-bold">*</span>
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-slate-800 text-white font-bold uppercase">
                          <tr>
                            <th rowSpan="2" className="px-3 py-2 text-left w-1/4 border-r">Regio: Gerakan</th>
                            <th colSpan="3" className="px-3 py-1 text-center border-r bg-blue-700">Dextra</th>
                            <th colSpan="3" className="px-3 py-1 text-center bg-cyan-700">Sinistra</th>
                          </tr>
                          <tr className="border-t border-slate-700">
                            <th className="px-2 py-1 text-center">ROM</th>
                            <th className="px-2 py-1 text-center">Nyeri</th>
                            <th className="px-2 py-1 text-center border-r">End Feel</th>
                            <th className="px-2 py-1 text-center">ROM</th>
                            <th className="px-2 py-1 text-center">Nyeri</th>
                            <th className="px-2 py-1 text-center">End Feel</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {data.gerak_pasif.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium border-r text-slate-800">{row.gerakan}</td>
                              <td className="px-2 py-1">
                                <select
                                  value={row.rom_dex}
                                  onChange={(e) => {
                                    const list = [...data.gerak_pasif];
                                    list[i].rom_dex = e.target.value;
                                    setData('gerak_pasif', list);
                                  }}
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1 text-xs bg-white outline-none focus:border-blue-600"
                                >
                                  <option value="">- ROM -</option>
                                  <option value="Full">Full</option>
                                  <option value="Terbatas">Terbatas</option>
                                </select>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_pasif];
                                        list[i].nyeri_dex = sym;
                                        setData('gerak_pasif', list);
                                      }}
                                      className={`px-1.5 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_dex === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                    >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1 border-r">
                                <input
                                  type="text"
                                  value={row.endfeel_dex}
                                  onChange={(e) => {
                                    const list = [...data.gerak_pasif];
                                    list[i].endfeel_dex = e.target.value;
                                    setData('gerak_pasif', list);
                                  }}
                                  placeholder="Normal / Hard"
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1.5 text-xs outline-none focus:border-cyan-600 bg-white"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <select
                                  value={row.rom_sin}
                                  onChange={(e) => {
                                    const list = [...data.gerak_pasif];
                                    list[i].rom_sin = e.target.value;
                                    setData('gerak_pasif', list);
                                  }}
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1 text-xs bg-white outline-none focus:border-blue-600"
                                >
                                  <option value="">- ROM -</option>
                                  <option value="Full">Full</option>
                                  <option value="Terbatas">Terbatas</option>
                                </select>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_pasif];
                                        list[i].nyeri_sin = sym;
                                        setData('gerak_pasif', list);
                                      }}
                                      className={`px-1.5 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_sin === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={row.endfeel_sin}
                                  onChange={(e) => {
                                    const list = [...data.gerak_pasif];
                                    list[i].endfeel_sin = e.target.value;
                                    setData('gerak_pasif', list);
                                  }}
                                  placeholder="Normal / Hard"
                                  className="w-full border border-slate-300 rounded-xs py-1 px-1.5 text-xs outline-none focus:border-cyan-600 bg-white"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* c. Gerak Isometrik */}
                  <div id="target_gerak_isometrik">
                    <h4 className="text-xs font-bold uppercase text-slate-800 mb-2 border-b border-slate-200 pb-1">
                      c. Gerak Isometrik Melawan Tahanan <span className="text-red-500 font-bold">*</span>
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-slate-800 text-white font-bold uppercase">
                          <tr>
                            <th rowSpan="2" className="px-3 py-2 text-left w-1/3 border-r">Regio: Gerakan</th>
                            <th colSpan="2" className="px-3 py-1 text-center border-r bg-blue-700">Dextra</th>
                            <th colSpan="2" className="px-3 py-1 text-center bg-cyan-700">Sinistra</th>
                          </tr>
                          <tr className="border-t border-slate-700">
                            <th className="px-2 py-1 text-center">Nyeri</th>
                            <th className="px-2 py-1 text-center border-r">Tahanan</th>
                            <th className="px-2 py-1 text-center">Nyeri</th>
                            <th className="px-2 py-1 text-center">Tahanan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {data.gerak_isometrik.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-3 py-1.5 font-medium border-r text-slate-800">{row.gerakan}</td>
                              <td className="px-2 py-1 text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_isometrik];
                                        list[i].nyeri_dex = sym;
                                        setData('gerak_isometrik', list);
                                      }}
                                      className={`px-2 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_dex === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                    >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1 border-r">
                                <input
                                  type="text"
                                  value={row.tahanan_dex}
                                  onChange={(e) => {
                                    const list = [...data.gerak_isometrik];
                                    list[i].tahanan_dex = e.target.value;
                                    setData('gerak_isometrik', list);
                                  }}
                                  placeholder="Mampu / Tidak"
                                  className="w-full border border-slate-300 rounded-xs py-1 px-2 text-xs outline-none focus:border-cyan-600 bg-white"
                                />
                              </td>
                              <td className="px-2 py-1 text-center">
                                <div className="flex justify-center gap-1">
                                  {['+', '-'].map((sym) => (
                                    <button
                                      key={sym}
                                      type="button"
                                      onClick={() => {
                                        const list = [...data.gerak_isometrik];
                                        list[i].nyeri_sin = sym;
                                        setData('gerak_isometrik', list);
                                      }}
                                      className={`px-2 py-0.5 text-xs font-bold rounded-xs border ${
                                        row.nyeri_sin === sym
                                          ? sym === '+' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-white text-slate-600 border-slate-300'
                                      }`}
                                    >
                                      {sym}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={row.tahanan_sin}
                                  onChange={(e) => {
                                    const list = [...data.gerak_isometrik];
                                    list[i].tahanan_sin = e.target.value;
                                    setData('gerak_isometrik', list);
                                  }}
                                  placeholder="Mampu / Tidak"
                                  className="w-full border border-slate-300 rounded-xs py-1 px-2 text-xs outline-none focus:border-cyan-600 bg-white"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            </div>

            <div className="flex justify-between pt-3">
              <Button type="button" variant="outline" onClick={() => setCurrentWorkflowStep(1)}>
                <ArrowLeft size={14} /> Kembali ke Subjektif
              </Button>
              <Button type="button" variant="primary" onClick={handleProceedStep3}>
                Lanjut ke Pengukuran & Uji Klinis <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAHAP 3: PENGUKURAN, SPECIAL TESTS & SENSIBILITAS                          */}
        {/* ========================================================================= */}
        {currentWorkflowStep === 3 && (
          <div>
            <AccordionSection number="1.9.a" title="Pemeriksaan Nyeri (NRS)" defaultOpen={true} status={nrsItems.status}>
              <div className="overflow-x-auto border border-slate-200 rounded-xs">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-800 text-white font-bold uppercase">
                    <tr>
                      <th rowSpan="2" className="px-4 py-2 text-left border-r w-1/4">NRS Nyeri</th>
                      <th colSpan="2" className="px-4 py-1 text-center border-r bg-blue-700">Dextra</th>
                      <th colSpan="2" className="px-4 py-1 text-center bg-cyan-700">Sinistra</th>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <th className="px-2 py-1 text-center">Nilai (0 - 10)</th>
                      <th className="px-2 py-1 text-center border-r">Keterangan</th>
                      <th className="px-2 py-1 text-center">Nilai (0 - 10)</th>
                      <th className="px-2 py-1 text-center">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {[
                      { key: 'diam', label: 'Diam' },
                      { key: 'tekan', label: 'Tekan' },
                      { key: 'gerak', label: 'Gerak' },
                    ].map((row) => {
                      const hasDexKet = Boolean(data.pain_nrs[row.key].dex_ket?.trim());
                      const hasSinKet = Boolean(data.pain_nrs[row.key].sin_ket?.trim());

                      return (
                        <tr key={row.key} id={`target_nrs_${row.key}`} className="hover:bg-slate-50 transition-all">
                          <td className="px-4 py-2 font-bold text-slate-800 border-r">{row.label}</td>
                          <td className="px-2 py-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={data.pain_nrs[row.key].dex_val}
                              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                              onChange={(e) => {
                                let val = e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0));
                                setData('pain_nrs', {
                                  ...data.pain_nrs,
                                  [row.key]: { ...data.pain_nrs[row.key], dex_val: val.toString() },
                                });
                              }}
                              placeholder="0"
                              className="w-16 text-center border border-slate-300 py-1 text-xs rounded-xs font-bold outline-none focus:border-cyan-600 bg-white"
                            />
                          </td>
                          <td className="px-2 py-1 border-r text-center">
                            <button
                              type="button"
                              onClick={() => setActiveNrsModal({ key: row.key, side: 'dex', label: `${row.label} Dextra` })}
                              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xs font-semibold border transition-colors ${
                                hasDexKet
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {hasDexKet ? <Check size={12} /> : <MessageSquare size={12} />}
                              {hasDexKet ? 'Terisi' : 'Keterangan'}
                            </button>
                          </td>
                          <td className="px-2 py-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={data.pain_nrs[row.key].sin_val}
                              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                              onChange={(e) => {
                                let val = e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0));
                                setData('pain_nrs', {
                                  ...data.pain_nrs,
                                  [row.key]: { ...data.pain_nrs[row.key], sin_val: val.toString() },
                                });
                              }}
                              placeholder="0"
                              className="w-16 text-center border border-slate-300 py-1 text-xs rounded-xs font-bold outline-none focus:border-cyan-600 bg-white"
                            />
                          </td>
                          <td className="px-2 py-1 text-center">
                            <button
                              type="button"
                              onClick={() => setActiveNrsModal({ key: row.key, side: 'sin', label: `${row.label} Sinistra` })}
                              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xs font-semibold border transition-colors ${
                                hasSinKet
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {hasSinKet ? <Check size={12} /> : <MessageSquare size={12} />}
                              {hasSinKet ? 'Terisi' : 'Keterangan'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </AccordionSection>

            <AccordionSection number="1.9.b" title="MMT (Manual Muscle Testing)" defaultOpen={true} status={mmtItems.status}>
              <div id="target_mmt_table" className="overflow-x-auto border border-slate-200 rounded-xs transition-all">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-800 text-white font-bold uppercase">
                    <tr>
                      <th rowSpan="2" className="px-4 py-2 text-left border-r w-1/4">Regio</th>
                      <th rowSpan="2" className="px-4 py-2 text-left border-r w-1/3">Gerakan</th>
                      <th colSpan="2" className="px-4 py-1 text-center bg-blue-700">Skor (0 - 5)</th>
                    </tr>
                    <tr className="border-t border-slate-700">
                      <th className="px-2 py-1 text-center border-r">Dextra</th>
                      <th className="px-2 py-1 text-center">Sinistra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {data.mmt_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {idx === 0 && (
                          <td rowSpan={data.mmt_rows.length} className="px-4 py-2 font-bold uppercase text-slate-700 border-r align-top bg-slate-50/70">
                            {area}
                          </td>
                        )}
                        <td className="px-4 py-1.5 font-semibold text-slate-800 border-r">{row.gerakan}</td>
                        <td className="px-2 py-1 border-r text-center">
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={row.dex_skor}
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                            onChange={(e) => {
                              let val = e.target.value === '' ? '' : Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0));
                              const updated = [...data.mmt_rows];
                              updated[idx].dex_skor = val.toString();
                              setData('mmt_rows', updated);
                            }}
                            placeholder="-"
                            className="w-16 text-center border border-slate-300 py-1 text-xs rounded-xs font-bold outline-none focus:border-cyan-600 bg-white"
                          />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={row.sin_skor}
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                            onChange={(e) => {
                              let val = e.target.value === '' ? '' : Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0));
                              const updated = [...data.mmt_rows];
                              updated[idx].sin_skor = val.toString();
                              setData('mmt_rows', updated);
                            }}
                            placeholder="-"
                            className="w-16 text-center border border-slate-300 py-1 text-xs rounded-xs font-bold outline-none focus:border-cyan-600 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionSection>

            {/* 1.9.c LGS DENGAN AUTO-HYPHEN */}
            <AccordionSection number="1.9.c" title="LGS (Lingkup Gerak Sendi / ROM)" defaultOpen={true} status={lgsItems.status}>
              <div id="target_lgs_table" className="overflow-x-auto border border-slate-200 rounded-xs transition-all">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-800 text-white font-bold uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left w-1/4 border-r">Regio</th>
                      <th className="px-4 py-2 text-left w-1/3 border-r">Bidang Gerak</th>
                      <th className="px-4 py-2 text-center border-r bg-blue-700">Hasil ROM (Ketik angka saja, strip otomatis)</th>
                      <th className="px-4 py-2 text-center bg-cyan-700">ROM Normal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {/* DEXTRA */}
                    <tr className="border-t">
                      <td rowSpan="3" className="px-4 py-2 font-bold uppercase text-slate-800 border-r align-top bg-blue-50/40">
                        {area} Dextra
                      </td>
                      <td className="px-4 py-2 border-r font-medium">Ekstensi / Fleksi (Sagital)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.dextra.ekstensi_fleksi}
                          onChange={(e) => handleLgsFormatChange('dextra', 'ekstensi_fleksi', e.target.value)}
                          placeholder="0-0-130"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.ekstensi_fleksi}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-r font-medium">Abduksi / Adduksi (Frontal)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.dextra.abduksi_adduksi}
                          onChange={(e) => handleLgsFormatChange('dextra', 'abduksi_adduksi', e.target.value)}
                          placeholder="180-0-45"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.abduksi_adduksi}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-r font-medium">Rotasi Eksternal / Internal (Rotasi)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.dextra.eksorotasi_endorotasi}
                          onChange={(e) => handleLgsFormatChange('dextra', 'eksorotasi_endorotasi', e.target.value)}
                          placeholder="90-0-80"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.eksorotasi_endorotasi}
                      </td>
                    </tr>

                    {/* SINISTRA */}
                    <tr className="border-t-2 border-slate-300">
                      <td rowSpan="3" className="px-4 py-2 font-bold uppercase text-slate-800 border-r align-top bg-cyan-50/40">
                        {area} Sinistra
                      </td>
                      <td className="px-4 py-2 border-r font-medium">Ekstensi / Fleksi (Sagital)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.sinistra.ekstensi_fleksi}
                          onChange={(e) => handleLgsFormatChange('sinistra', 'ekstensi_fleksi', e.target.value)}
                          placeholder="0-0-130"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.ekstensi_fleksi}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-r font-medium">Abduksi / Adduksi (Frontal)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.sinistra.abduksi_adduksi}
                          onChange={(e) => handleLgsFormatChange('sinistra', 'abduksi_adduksi', e.target.value)}
                          placeholder="180-0-45"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.abduksi_adduksi}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-r font-medium">Rotasi Eksternal / Internal (Rotasi)</td>
                      <td className="px-3 py-1.5 border-r text-center">
                        <input
                          type="text"
                          value={data.lgs_data.sinistra.eksorotasi_endorotasi}
                          onChange={(e) => handleLgsFormatChange('sinistra', 'eksorotasi_endorotasi', e.target.value)}
                          placeholder="90-0-80"
                          className="w-full text-center border border-slate-300 rounded-xs py-1 text-xs font-mono outline-none focus:border-blue-600 bg-white font-bold"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono text-slate-500 bg-slate-50">
                        {data.lgs_data.normal.eksorotasi_endorotasi}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AccordionSection>

            {/* SENSIBILITAS & GMFCS (LENGKAP UNTUK MENGISI STATUS KLINIK) */}
            <AccordionSection number="Sensibilitas" title="Pemeriksaan Sensori & Fungsional" defaultOpen={true}>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.keys(data.sensibilitas_records).map((sens) => (
                    <div key={sens} className="p-2 border border-slate-200 rounded-xs bg-slate-50">
                      <span className="block font-bold text-slate-700 mb-1">{sens}</span>
                      <select
                        value={data.sensibilitas_records[sens]}
                        onChange={(e) => setData('sensibilitas_records', {
                          ...data.sensibilitas_records,
                          [sens]: e.target.value,
                        })}
                        className="w-full p-1 border border-slate-300 rounded-xs bg-white outline-none"
                      >
                        <option value="Normal">Normal</option>
                        <option value="1 (Ringan)">1 (Ringan)</option>
                        <option value="2 (Sedang)">2 (Sedang)</option>
                        <option value="3 (Berat)">3 (Berat)</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Tingkat Fungsional (GMFCS)
                    </label>
                    <select
                      value={data.gmfcs_level}
                      onChange={(e) => setData('gmfcs_level', e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded-xs bg-white outline-none font-bold"
                    >
                      <option value="Level I">Level I (Berjalan Tanpa Hambatan)</option>
                      <option value="Level II">Level II (Berjalan dengan Keterbatasan)</option>
                      <option value="Level III">Level III (Berjalan dengan Alat Bantu)</option>
                      <option value="Level IV">Level IV (Mobilitas Mandiri Terbatas)</option>
                      <option value="Level V">Level V (Ketergantungan Kursi Roda)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Skor GMFM Total (%) [Opsional]
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={data.gmfm_total}
                      onChange={(e) => setData('gmfm_total', e.target.value)}
                      placeholder="Contoh: 61.6"
                      className="w-full p-1.5 border border-slate-300 rounded-xs bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* SPECIAL TESTS */}
            <AccordionSection number="Special Tests" title="Pemeriksaan Spesifik" defaultOpen={true} status={specialTestsItems.status}>
              <div id="target_special_tests" className="space-y-3 transition-all">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTestInput}
                    onChange={(e) => setCustomTestInput(e.target.value)}
                    placeholder="Tambah uji spesifik baru (misal: Drop Arm Test)..."
                    className="flex-1 border border-slate-300 rounded-xs px-3 py-1.5 text-xs focus:border-cyan-600 outline-none bg-white"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddCustomTest}>
                    <Plus size={14} /> Tambah Test
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {data.special_tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between border border-slate-200 p-3 bg-white rounded-xs text-xs shadow-2xs">
                      <span className="font-semibold text-slate-800">{test.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...data.special_tests];
                            updated[index].result = 'Negatif';
                            setData('special_tests', updated);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded-xs border transition-colors ${
                            test.result === 'Negatif'
                              ? 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          Negatif (-)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...data.special_tests];
                            updated[index].result = 'Positif';
                            setData('special_tests', updated);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded-xs border transition-colors ${
                            test.result === 'Positif'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          Positif (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTest(index)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionSection>

            {/* ACTION BUTTONS: CHECK FORM & SUBMIT */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setCurrentWorkflowStep(2)}>
                <ArrowLeft size={14} /> Kembali ke DATA OBJEKTIF
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setShowCheckFormModal(true)}
                  className="flex-1 sm:flex-none border-blue-300 text-blue-800 bg-blue-50/70 hover:bg-blue-100"
                >
                  <ClipboardCheck size={14} />
                  Check Form ({totalMissingCount > 0 ? `${totalMissingCount} Kosong` : 'Lengkap'})
                </Button>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={processing}
                  className="flex-1 sm:flex-none shadow-md"
                >
                  <Sparkles size={14} className="text-cyan-300" />
                  {processing ? 'Menganalisis Model ICF...' : 'Simpan & Analisis AI (ICF)'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </form>

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
              value={data.pain_nrs[activeNrsModal.key][`${activeNrsModal.side}_ket`]}
              onChange={(e) =>
                setData('pain_nrs', {
                  ...data.pain_nrs,
                  [activeNrsModal.key]: {
                    ...data.pain_nrs[activeNrsModal.key],
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

    </AppLayout>
  );
}