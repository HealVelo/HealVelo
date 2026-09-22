import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AccordionSection({ 
  number, 
  title, 
  subtitle = '', 
  children, 
  defaultOpen = false,
  status = 'empty' // 'complete' | 'partial' | 'empty'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const statusStyles = {
    complete: {
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      badgeText: 'Lengkap',
      dot: 'bg-emerald-500',
    },
    partial: {
      border: 'border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      badgeText: 'Belum Lengkap',
      dot: 'bg-amber-500',
    },
    empty: {
      border: 'border-rose-200',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeText: 'Belum Terisi',
      dot: 'bg-rose-500',
    }
  };

  const currentStatus = statusStyles[status] || statusStyles.empty;

  return (
    <div className={`border bg-white rounded-xs overflow-hidden mb-4 transition-colors ${currentStatus.border} shadow-2xs`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-xs">
            {number}
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 border rounded-xs ${currentStatus.badgeBg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.badgeText}
          </span>
          {isOpen ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export { AccordionSection };