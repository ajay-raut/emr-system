import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Trash2, CheckCircle2, XCircle, Clock, AlertTriangle, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi, patientApi } from '../api/client';
import type { Appointment, Patient } from '../types';
import AppointmentModal from '../components/AppointmentModal';
import Pagination from '../components/Pagination';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? undefined : filter;
      const [apts, pts] = await Promise.all([
        appointmentApi.list({ page: currentPage, page_size: pageSize, status_filter: statusFilter }),
        patientApi.list({ page: 1, page_size: 100 }) // Load patients for dropdown
      ]);
      setAppointments(apts.items);
      setTotalPages(apts.total_pages);
      setTotalItems(apts.total);
      setHasNext(apts.has_next);
      setHasPrev(apts.has_prev);
      setPatients(pts.items);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [filter]);

  useEffect(() => { 
    load(); 
  }, [currentPage, filter]);

  const getPatientName = (pid: string) => {
    const p = patients.find(pt => pt.id === pid);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown';
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'Completed': return <CheckCircle2 size={15} className="text-emerald-500" />;
      case 'Cancelled': return <XCircle size={15} className="text-red-500" />;
      case 'No Show': return <AlertTriangle size={15} className="text-amber-500" />;
      default: return <Clock size={15} className="text-blue-500" />;
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled', 'No Show': 'badge-noshow' };
    return map[s] || 'badge-scheduled';
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appointmentApi.update(id, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Appointments</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">{totalItems} total appointments</p>
          </div>
        </div>
        {patients.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedPatient}
              onChange={e => setSelectedPatient(e.target.value)}
              className="input-field w-48"
              id="select-patient-for-apt"
            >
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </select>
            <button
              onClick={() => { if (selectedPatient) { setEditingAppointment(null); setShowModal(true); } else toast.error('Select a patient first'); }}
              className="btn-primary"
              id="btn-schedule-apt"
            >
              <Plus size={16} /> Schedule
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'Scheduled', 'Completed', 'Cancelled', 'No Show'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-12 text-center text-surface-400">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays size={48} className="mx-auto text-surface-300 mb-3" />
          <p className="text-surface-500">No appointments found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {appointments.map(a => (
              <div key={a.id} className="card p-5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {statusIcon(a.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/patients/${a.patient_id}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700">{getPatientName(a.patient_id)}</Link>
                        <span className={statusBadge(a.status)}>{a.status}</span>
                      </div>
                      <p className="text-sm text-surface-700 dark:text-surface-300 mt-0.5">{a.reason}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                        {new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {a.doctor_name && ` · ${a.doctor_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {a.status === 'Scheduled' && (
                      <>
                        <button onClick={() => updateStatus(a.id, 'Completed')} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-surface-400 dark:text-surface-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title="Mark Completed"><CheckCircle2 size={16} /></button>
                        <button onClick={() => updateStatus(a.id, 'Cancelled')} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Cancel"><XCircle size={16} /></button>
                      </>
                    )}
                    <button onClick={() => { setSelectedPatient(a.patient_id); setEditingAppointment(a); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-surface-400 dark:text-surface-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={async () => { await appointmentApi.delete(a.id); toast.success('Deleted'); load(); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            hasNext={hasNext}
            hasPrev={hasPrev}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </>
      )}

      {showModal && selectedPatient && (
        <AppointmentModal
          patientId={selectedPatient}
          initialData={editingAppointment || undefined}
          onClose={() => { setShowModal(false); setEditingAppointment(null); }}
          onSubmit={async (d, id) => { 
            if (id) {
              await appointmentApi.update(id, d);
              toast.success('Appointment updated');
            } else {
              await appointmentApi.create(d); 
              toast.success('Appointment scheduled');
            }
            setShowModal(false); 
            setEditingAppointment(null);
            load(); 
          }}
        />
      )}
    </div>
  );
}
