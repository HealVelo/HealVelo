import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Select Body Area', subtitle: 'Choose the area to assess' },
  { id: 2, title: 'Assessment', subtitle: 'Complete evaluation' },
  { id: 3, title: 'Treatment Plan', subtitle: 'Generate recommendations' },
];

const BODY_AREAS = [
  { key: 'neck', label: 'Neck', emoji: '🦴' },
  { key: 'shoulder', label: 'Shoulder', emoji: '💪' },
  { key: 'upper-back', label: 'Upper Back', emoji: '🫁' },
  { key: 'lower-back', label: 'Lower Back', emoji: '🦴' },
  { key: 'hip', label: 'Hip', emoji: '🦵' },
  { key: 'knee', label: 'Knee', emoji: '🦵' },
  { key: 'ankle', label: 'Ankle', emoji: '👟' },
];

const GUIDE_STEPS = [
  { id: 1, title: 'Select Body Area', text: 'Click on the area you want to assess' },
  { id: 2, title: 'Complete Assessment', text: 'Fill in the evaluation forms' },
  { id: 3, title: 'AI Analysis', text: 'Get AI-powered diagnosis insights' },
  { id: 4, title: 'Treatment Plan', text: 'Generate customized treatment recommendations' },
];

export default function PhysioKit() {
  const [selectedArea, setSelectedArea] = useState(null);
  const currentStep = 1;

  const handleNextStep = () => {
    if (!selectedArea) return;
    router.visit(`/physio-kit/assessment?area=${selectedArea}`);
  };

  return (
    <AppLayout title="Physio Kit">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Physio Kit</h1>
        <p className="text-sm text-slate-500">Select the body area for assessment</p>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step.id === currentStep
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.id}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    step.id === currentStep ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-400">{step.subtitle}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <ChevronRight size={18} className="mx-4 shrink-0 text-slate-300" />
            )}
          </div>
        ))}
      </div>

      {/* Body area grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {BODY_AREAS.map(({ key, label, emoji }) => {
          const selected = selectedArea === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedArea(key)}
              className={`flex flex-col items-center gap-3 rounded-2xl border bg-white py-8 shadow-sm transition ${
                selected
                  ? 'border-violet-500 ring-2 ring-violet-100'
                  : 'border-slate-100 hover:border-violet-200'
              }`}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-medium text-slate-800">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Body map reference */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Body Map Reference</h2>
          <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
            {/* Placeholder silhouette — swap with a real body-map illustration/SVG */}
            <svg width="72" height="140" viewBox="0 0 72 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="36" cy="18" r="16" fill="currentColor" />
              <path
                d="M12 46c0-6 10-10 24-10s24 4 24 10v34c0 5-4 9-9 9h-2l2 45H27l2-45h-2c-5 0-9-4-9-9V46z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Assessment guide */}
        <div className="rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Assessment Guide</h2>
          <ol className="space-y-4">
            {GUIDE_STEPS.map(({ id, title, text }) => (
              <li key={id} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                  {id}
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/80">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Next step */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!selectedArea}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
            selectedArea
              ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 hover:bg-violet-700'
              : 'cursor-not-allowed bg-slate-100 text-slate-400'
          }`}
        >
          Next Step
          <ChevronRight size={16} />
        </button>
      </div>
    </AppLayout>
  );
}