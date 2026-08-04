import AppLayout from '@/Layouts/AppLayout';
import {
  Users,
  ClipboardList,
  Dumbbell,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STAT_CARDS = [
  { label: 'Total Patients', value: '2,847', change: '+12.5%', trend: 'up', icon: Users, iconBg: 'bg-violet-600' },
  { label: 'Assessments', value: '1,234', change: '+8.2%', trend: 'up', icon: ClipboardList, iconBg: 'bg-sky-500' },
  { label: 'Exercise Programs', value: '856', change: '+15.3%', trend: 'up', icon: Dumbbell, iconBg: 'bg-emerald-500' },
  { label: 'Generated Reports', value: '643', change: '-2.4%', trend: 'down', icon: FileText, iconBg: 'bg-amber-500' },
];

const ACTIVITY_DATA = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 48 },
  { day: 'Thu', value: 62 },
  { day: 'Fri', value: 55 },
  { day: 'Sat', value: 38 },
  { day: 'Sun', value: 44 },
];

const BODY_AREA_DATA = [
  { name: 'Neck', value: 245, color: '#7C3AED' },
  { name: 'Shoulder', value: 189, color: '#A855F7' },
  { name: 'Lower Back', value: 156, color: '#06B6D4' },
  { name: 'Knee', value: 134, color: '#10B981' },
  { name: 'Hip', value: 98, color: '#F59E0B' },
];

const LATEST_PATIENTS = [
  { initials: 'SJ', name: 'Sarah Johnson', complaint: 'Cervical Pain', status: 'In Progress', time: '2 hours ago' },
  { initials: 'MC', name: 'Michael Chen', complaint: 'Knee Injury', status: 'Completed', time: '5 hours ago' },
  { initials: 'EW', name: 'Emma Williams', complaint: 'Lower Back Pain', status: 'In Progress', time: '1 day ago' },
  { initials: 'JB', name: 'James Brown', complaint: 'Shoulder Strain', status: 'Pending', time: '1 day ago' },
];

const STATUS_STYLES = {
  'In Progress': 'bg-violet-100 text-violet-600',
  Completed: 'bg-emerald-100 text-emerald-600',
  Pending: 'bg-amber-100 text-amber-600',
};

export default function Dashboard({ userName = 'Physio Pro' }) {
  return (
    <AppLayout title="Dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          Hello, {userName} <span></span>
        </h1>
        <p className="text-sm text-slate-500">Welcome back to your dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, change, trend, icon: Icon, iconBg }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} text-white`}>
                <Icon size={18} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Activity Analytics */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Activity Analytics</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cases by Body Area */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Cases by Body Area</h2>
          <div className="mx-auto h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BODY_AREA_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {BODY_AREA_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2">
            {BODY_AREA_DATA.map(({ name, value, color }) => (
              <li key={name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                </span>
                <span className="font-medium text-slate-900">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Latest Patients */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Latest Patients</h2>
          <ul className="divide-y divide-slate-100">
            {LATEST_PATIENTS.map(({ initials, name, complaint, status, time }) => (
              <li key={name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-600">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{complaint}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">{time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Insights */}
        <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-sm">
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles size={18} />
            </div>
            <h2 className="mb-2 text-base font-semibold">AI Insights</h2>
            <p className="text-sm leading-relaxed text-white/85">
              Your patient recovery rate has increased by 18% this month. AI suggests focusing on
              preventive exercises for recurring lower back pain cases.
            </p>
          </div>
          <button
            type="button"
            className="mt-6 rounded-xl bg-white py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
          >
            View Details
          </button>
        </div>
      </div>
    </AppLayout>
  );
}