import { useState, useEffect } from 'react';
import { X, CalendarDays } from 'lucide-react';
import type { AppointmentCreate, Doctor, Appointment } from '../types';
import { doctorApi } from '../api/client';

interface Props {
  patientId: string;
  initialData?: Appointment;
  onClose: () => void;
  onSubmit: (data: AppointmentCreate, id?: string) => void;
}

export default function AppointmentModal({ patientId, initialData, onClose, onSubmit }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [form, setForm] = useState({
    appointment_date: initialData ? new Date(initialData.appointment_date).toISOString().slice(0, 16) : '',
    reason: initialData?.reason || '',
    doctor_name: initialData?.doctor_name || '',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    doctorApi.list({ page: 1, page_size: 100 })
      .then(data => {
        setDoctors(data.items);
        if (data.items.length > 0 && !initialData?.doctor_name) {
          setForm(prev => ({ ...prev, doctor_name: data.items[0].full_name }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: patientId,
      appointment_date: new Date(form.appointment_date).toISOString(),
      reason: form.reason,
      doctor_name: form.doctor_name || undefined,
      notes: form.notes || undefined,
    }, initialData?.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <CalendarDays size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{initialData ? 'Edit Appointment' : 'Schedule Appointment'}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" id="close-apt-modal">
            <X size={18} className="text-surface-500 dark:text-surface-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label">Date & Time *</label>
            <input type="datetime-local" name="appointment_date" value={form.appointment_date} onChange={handleChange} required className="input-field" id="input-apt-date" />
          </div>
          <div>
            <label className="label">Reason for Visit *</label>
            <input name="reason" value={form.reason} onChange={handleChange} required className="input-field" placeholder="e.g., Annual Checkup" id="input-apt-reason" />
          </div>
          <div>
            <label className="label">Doctor</label>
            {loadingDoctors ? (
              <div className="input-field text-surface-400">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <input name="doctor_name" value={form.doctor_name} onChange={handleChange} className="input-field" placeholder="Enter doctor name" id="input-apt-doctor" />
            ) : (
              <select name="doctor_name" value={form.doctor_name} onChange={handleChange} className="input-field" id="input-apt-doctor">
                <option value="">Select a doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.full_name}>
                    {d.full_name}{d.specialization ? ` — ${d.specialization}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field min-h-[80px] resize-none" id="input-apt-notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" id="btn-save-apt">
              <CalendarDays size={16} /> {initialData ? 'Update' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
