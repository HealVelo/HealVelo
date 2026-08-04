import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, Filter, ArrowUpDown, Plus, Eye, Pencil, MoreHorizontal } from 'lucide-react';

const PATIENTS = [
  { initials: 'SJ', name: 'Sarah Johnson', phone: '+1 (555) 123-4567', age: 32, complaint: 'Cervical Neck Pain', assessment: '2024-06-25', status: 'Active' },
  { initials: 'MC', name: 'Michael Chen', phone: '+1 (555) 234-5678', age: 45, complaint: 'Knee Ligament Injury', assessment: '2024-06-24', status: 'Recovered' },
  { initials: 'EW', name: 'Emma Williams', phone: '+1 (555) 345-6789', age: 28, complaint: 'Lower Back Pain', assessment: '2024-06-23', status: 'Active' },
  { initials: 'JB', name: 'James Brown', phone: '+1 (555) 456-7890', age: 51, complaint: 'Shoulder Rotator Cuff', assessment: '2024-06-22', status: 'In Treatment' },
  { initials: 'OD', name: 'Olivia Davis', phone: '+1 (555) 567-8901', age: 37, complaint: 'Hip Flexor Strain', assessment: '2024-06-21', status: 'Active' },
  { initials: 'WM', name: 'William Martinez', phone: '+1 (555) 678-9012', age: 42, complaint: 'Ankle Sprain', assessment: '2024-06-20', status: 'Recovered' },
];

const STATUS_STYLES = {
  Active: 'bg-violet-100 text-violet-600',
  Recovered: 'bg-emerald-100 text-emerald-600',
  'In Treatment': 'bg-amber-100 text-amber-600',
};

export default function Patients({ patients = PATIENTS, currentPage = 1, totalPages = 3, totalPatients = 48 }) {
  const [search, setSearch] = useState('');

  return (
    <AppLayout title="Patients">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">Manage and track all your patients</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, complaint, or phone..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Filter size={15} />
            Filter
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowUpDown size={15} />
            Sort
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700"
          >
            <Plus size={16} />
            New Patient
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="px-6 py-4 font-medium">Patient Name</th>
              <th className="px-6 py-4 font-medium">Age</th>
              <th className="px-6 py-4 font-medium">Primary Complaint</th>
              <th className="px-6 py-4 font-medium">Latest Assessment</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map(({ initials, name, phone, age, complaint, assessment, status }) => (
              <tr key={phone} className="hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-400">{phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{age}</td>
                <td className="px-6 py-4 text-violet-600">{complaint}</td>
                <td className="px-6 py-4 text-slate-500">{assessment}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <button type="button" className="hover:text-violet-600" aria-label={`View ${name}`}>
                      <Eye size={16} />
                    </button>
                    <button type="button" className="hover:text-violet-600" aria-label={`Edit ${name}`}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="hover:text-violet-600" aria-label={`More options for ${name}`}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">1</span> to{' '}
            <span className="font-medium text-slate-700">{patients.length}</span> of{' '}
            <span className="font-medium text-slate-700">{totalPatients}</span> patients
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50">
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`h-8 w-8 rounded-lg text-sm font-medium ${
                  page === currentPage ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}