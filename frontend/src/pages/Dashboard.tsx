import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, FileText, Pill, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { patientApi, appointmentApi, recordApi, prescriptionApi } from '../api/client';
import type { Patient, Appointment } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, records: 0, prescriptions: 0 });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, appointments, records, prescriptions] = await Promise.all([
          patientApi.list({ page: 1, page_size: 100 }),
          appointmentApi.list({ page: 1, page_size: 100 }),
          recordApi.list({ page: 1, page_size: 100 }),
          prescriptionApi.list({ page: 1, page_size: 100 }),
        ]);
        setStats({
          patients: patients.total,
          appointments: appointments.total,
          records: records.total,
          prescriptions: prescriptions.total,
        });
        setRecentPatients(patients.items.slice(0, 5));
        setUpcomingApts(appointments.items.filter(a => a.status === 'Scheduled').slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Patients', value: stats.patients, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Appointments', value: stats.appointments, icon: CalendarDays, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Medical Records', value: stats.records, icon: FileText, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Prescriptions', value: stats.prescriptions, icon: Pill, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-200 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-surface-500 dark:text-surface-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">Welcome to MedRecord Pro</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card group" id={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className="relative">
              <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-surface-900 dark:text-white">{value}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Recent Patients</h2>
            <Link to="/patients" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {recentPatients.length === 0 ? (
              <div className="p-8 text-center text-surface-400 dark:text-surface-500 text-sm">No patients yet. Add your first patient!</div>
            ) : (
              recentPatients.map(p => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                        {p.first_name[0]}{p.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">{p.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-surface-400 dark:text-surface-500">
                    {p.gender} · {p.blood_group || '—'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {upcomingApts.length === 0 ? (
              <div className="p-8 text-center text-surface-400 dark:text-surface-500 text-sm">No upcoming appointments</div>
            ) : (
              upcomingApts.map(a => (
                <div key={a.id} className="px-6 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{a.reason}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                        {new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="badge-scheduled">{a.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
