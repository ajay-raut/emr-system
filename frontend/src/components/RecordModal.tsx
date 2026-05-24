import { useState } from 'react';
import { X, Stethoscope } from 'lucide-react';
import type { MedicalRecordCreate, MedicalRecord } from '../types';

interface Props {
  patientId: string;
  initialData?: MedicalRecord;
  onClose: () => void;
  onSubmit: (data: MedicalRecordCreate, id?: string) => void;
}

export default function RecordModal({ patientId, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    diagnosis: initialData?.diagnosis || '',
    notes: initialData?.notes || '',
    symptoms: initialData?.symptoms || '',
    vitals: initialData?.vitals || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: patientId,
      diagnosis: form.diagnosis,
      notes: form.notes || undefined,
      symptoms: form.symptoms || undefined,
      vitals: form.vitals || undefined,
    }, initialData?.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{initialData ? 'Edit Medical Record' : 'Add Medical Record'}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" id="close-record-modal">
            <X size={18} className="text-surface-500 dark:text-surface-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label">Diagnosis *</label>
            <input name="diagnosis" value={form.diagnosis} onChange={handleChange} required className="input-field" placeholder="e.g., Acute Bronchitis" id="input-rec-diagnosis" />
          </div>
          <div>
            <label className="label">Symptoms</label>
            <textarea name="symptoms" value={form.symptoms} onChange={handleChange} className="input-field min-h-[70px] resize-none" placeholder="Cough, fever, chest pain..." id="input-rec-symptoms" />
          </div>
          <div>
            <label className="label">Vitals</label>
            <input name="vitals" value={form.vitals} onChange={handleChange} className="input-field" placeholder="BP: 120/80, Temp: 98.6°F, HR: 72" id="input-rec-vitals" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field min-h-[80px] resize-none" placeholder="Encounter notes..." id="input-rec-notes" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" id="btn-save-record">
              <Stethoscope size={16} /> {initialData ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
