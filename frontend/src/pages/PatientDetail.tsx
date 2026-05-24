import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Droplets, CalendarDays,
  Stethoscope, Pill, FileDown, Plus, Trash2, AlertCircle, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi, recordApi, appointmentApi, prescriptionApi } from '../api/client';
import type { Patient, MedicalRecord, Appointment, Prescription } from '../types';
import RecordModal from '../components/RecordModal';
import AppointmentModal from '../components/AppointmentModal';
import PrescriptionModal from '../components/PrescriptionModal';

type Tab = 'records' | 'appointments' | 'prescriptions';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [tab, setTab] = useState<Tab>('records');
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const [p, r, a, rx] = await Promise.all([
        patientApi.get(id),
        recordApi.list({ patient_id: id, page: 1, page_size: 100 }),
        appointmentApi.list({ patient_id: id, page: 1, page_size: 100 }),
        prescriptionApi.list({ patient_id: id, page: 1, page_size: 100 }),
      ]);
      setPatient(p);
      setRecords(r.items);
      setAppointments(a.items);
      setPrescriptions(rx.items);
    } catch { toast.error('Failed to load patient'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleDownloadPdf = async (rxId: string) => {
    try { await prescriptionApi.downloadPdf(rxId); toast.success('PDF downloaded'); }
    catch { toast.error('Failed to download PDF'); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled', 'No Show': 'badge-noshow' };
    return map[s] || 'badge-scheduled';
  };

  if (loading) return <div className="page-container flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!patient) return <div className="page-container text-center py-20"><AlertCircle size={48} className="mx-auto text-red-400 mb-3" /><p className="text-surface-600">Patient not found</p><Link to="/patients" className="btn-primary mt-4"><ArrowLeft size={16} /> Back</Link></div>;

  const age = Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000);

  const tabs: { key: Tab; label: string; icon: typeof Stethoscope; count: number }[] = [
    { key: 'records', label: 'Records', icon: Stethoscope, count: records.length },
    { key: 'appointments', label: 'Appointments', icon: CalendarDays, count: appointments.length },
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill, count: prescriptions.length },
  ];

  return (
    <div className="page-container">
      {/* Back */}
      <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      {/* Patient Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-2xl font-bold text-white">{patient.first_name[0]}{patient.last_name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{patient.first_name} {patient.last_name}</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{patient.gender} · {age} years old</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300"><Phone size={15} className="text-surface-400 dark:text-surface-500" /> {patient.phone}</div>
              {patient.email && <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300"><Mail size={15} className="text-surface-400 dark:text-surface-500" /> {patient.email}</div>}
              {patient.blood_group && <div className="flex items-center gap-2 text-sm text-red-600 font-medium"><Droplets size={15} /> {patient.blood_group}</div>}
              {patient.address && <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300"><MapPin size={15} className="text-surface-400 dark:text-surface-500" /> {patient.address}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white dark:bg-surface-900 rounded-xl p-1 border border-surface-200 dark:border-surface-700 w-fit">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary-600 text-white shadow-sm' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
            id={`tab-${key}`}>
            <Icon size={15} /> {label} <span className={`text-xs px-1.5 py-0.5 rounded-md ${tab === key ? 'bg-white/20' : 'bg-surface-100 dark:bg-surface-800'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ── Records ── */}
        {tab === 'records' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingRecord(null); setShowRecordModal(true); }} className="btn-primary" id="btn-add-record"><Plus size={16} /> Add Record</button>
            </div>
            {records.length === 0 ? (
              <div className="card p-12 text-center"><Stethoscope size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" /><p className="text-surface-500 dark:text-surface-400">No medical records yet</p></div>
            ) : (
              <div className="space-y-3">
                {records.map(r => (
                  <div key={r.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-surface-800 dark:text-surface-200">{r.diagnosis}</p>
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{new Date(r.visit_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {r.symptoms && <p className="text-sm text-surface-600 dark:text-surface-300 mt-2"><span className="font-medium">Symptoms:</span> {r.symptoms}</p>}
                        {r.vitals && <p className="text-sm text-surface-600 dark:text-surface-300 mt-1"><span className="font-medium">Vitals:</span> {r.vitals}</p>}
                        {r.notes && <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 italic">{r.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button onClick={() => { setEditingRecord(r); setShowRecordModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-surface-400 dark:text-surface-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={async () => { await recordApi.delete(r.id); toast.success('Record deleted'); load(); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Appointments ── */}
        {tab === 'appointments' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingAppointment(null); setShowAptModal(true); }} className="btn-primary" id="btn-add-apt"><Plus size={16} /> Schedule Appointment</button>
            </div>
            {appointments.length === 0 ? (
              <div className="card p-12 text-center"><CalendarDays size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" /><p className="text-surface-500 dark:text-surface-400">No appointments yet</p></div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-surface-800 dark:text-surface-200">{a.reason}</p>
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{new Date(a.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        {a.doctor_name && <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Doctor: {a.doctor_name}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(a.status)}>{a.status}</span>
                        <button onClick={() => { setEditingAppointment(a); setShowAptModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-surface-400 dark:text-surface-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={async () => { await appointmentApi.delete(a.id); toast.success('Appointment deleted'); load(); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Prescriptions ── */}
        {tab === 'prescriptions' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingPrescription(null); setShowRxModal(true); }} className="btn-primary" id="btn-add-rx"><Plus size={16} /> New Prescription</button>
            </div>
            {prescriptions.length === 0 ? (
              <div className="card p-12 text-center"><Pill size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" /><p className="text-surface-500 dark:text-surface-400">No prescriptions yet</p></div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map(rx => (
                  <div key={rx.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-base font-semibold text-surface-800 dark:text-surface-200">Prescription</p>
                          {rx.diagnosis && <span className="badge bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 ring-1 ring-violet-600/10 dark:ring-violet-500/20">{rx.diagnosis}</span>}
                        </div>
                        <p className="text-xs text-surface-400 dark:text-surface-500">Dr. {rx.doctor_name} · {new Date(rx.created_at).toLocaleDateString()}</p>
                        <div className="mt-3 space-y-1.5">
                          {rx.items.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                              <span className="font-medium text-surface-700 dark:text-surface-300">{item.medication_name}</span>
                              <span className="text-surface-400 dark:text-surface-500">·</span>
                              <span className="text-surface-500 dark:text-surface-400">{item.dosage} — {item.frequency} — {item.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDownloadPdf(rx.id)} className="btn-secondary text-xs py-2" id={`download-rx-${rx.id}`}>
                          <FileDown size={14} /> Download PDF
                        </button>
                        <button onClick={() => { setEditingPrescription(rx); setShowRxModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-surface-400 dark:text-surface-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={async () => { await prescriptionApi.delete(rx.id); toast.success('Prescription deleted'); load(); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRecordModal && <RecordModal patientId={id!} initialData={editingRecord || undefined} onClose={() => setShowRecordModal(false)} onSubmit={async (d, rId) => { if (rId) { await recordApi.update(rId, d); toast.success('Record updated'); } else { await recordApi.create(d); toast.success('Record added'); } setShowRecordModal(false); load(); }} />}
      {showAptModal && <AppointmentModal patientId={id!} initialData={editingAppointment || undefined} onClose={() => setShowAptModal(false)} onSubmit={async (d, aId) => { if (aId) { await appointmentApi.update(aId, d); toast.success('Appointment updated'); } else { await appointmentApi.create(d); toast.success('Appointment scheduled'); } setShowAptModal(false); load(); }} />}
      {showRxModal && <PrescriptionModal patientId={id!} initialData={editingPrescription || undefined} onClose={() => setShowRxModal(false)} onSubmit={async (d, rxId) => { if (rxId) { await prescriptionApi.update(rxId, d); toast.success('Prescription updated'); } else { await prescriptionApi.create(d); toast.success('Prescription created'); } setShowRxModal(false); load(); }} />}
    </div>
  );
}
