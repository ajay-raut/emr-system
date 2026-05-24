import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pill } from 'lucide-react';
import type { PrescriptionCreate, PrescriptionItemCreate, Doctor, Prescription } from '../types';
import { doctorApi } from '../api/client';

interface Props {
  patientId: string;
  initialData?: Prescription;
  onClose: () => void;
  onSubmit: (data: PrescriptionCreate, id?: string) => void;
}

const emptyItem: PrescriptionItemCreate = {
  medication_name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

export default function PrescriptionModal({ patientId, initialData, onClose, onSubmit }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorName, setDoctorName] = useState(initialData?.doctor_name || '');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [items, setItems] = useState<PrescriptionItemCreate[]>(
    initialData?.items?.length ? initialData.items.map(i => ({
      medication_name: i.medication_name,
      dosage: i.dosage,
      frequency: i.frequency,
      duration: i.duration,
      instructions: i.instructions || ''
    })) : [{ ...emptyItem }]
  );

  useEffect(() => {
    doctorApi.list({ page: 1, page_size: 100 }).then(response => {
      setDoctors(response.items);
      if (response.items.length > 0 && !initialData?.doctor_name) {
        setDoctorName(response.items[0].full_name);
      }
    }).catch(console.error);
  }, []);

  const addItem = () => setItems(prev => [...prev, { ...emptyItem }]);

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, field: keyof PrescriptionItemCreate, value: string) => {
    setItems(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: patientId,
      doctor_name: doctorName,
      diagnosis: diagnosis || undefined,
      notes: notes || undefined,
      items,
    }, initialData?.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
              <Pill size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{initialData ? 'Edit Prescription' : 'New Prescription'}</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">{initialData ? 'Update medications for this patient' : 'Add medications for this patient'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" id="close-rx-modal">
            <X size={18} className="text-surface-500 dark:text-surface-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Doctor + Diagnosis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prescribing Doctor</label>
              <select
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                className="input-field"
                id="select-rx-doctor"
                required
              >
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.full_name}>
                    {doc.full_name} {doc.specialization ? `(${doc.specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Diagnosis</label>
              <input
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="input-field"
                placeholder="e.g., Upper Respiratory Infection"
                id="input-rx-diagnosis"
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-surface-800 dark:text-surface-200">Medications</label>
              <button
                type="button"
                onClick={addItem}
                className="btn-ghost text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                id="btn-add-medication"
              >
                <Plus size={14} />
                Add Medication
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200/60 dark:border-surface-700 animate-slide-up"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-surface-400 dark:text-surface-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                      <input
                        value={item.medication_name}
                        onChange={e => updateItem(idx, 'medication_name', e.target.value)}
                        className="input-field"
                        placeholder="Medication name (e.g., Amoxicillin)"
                        required
                      />
                    </div>
                    <input
                      value={item.dosage}
                      onChange={e => updateItem(idx, 'dosage', e.target.value)}
                      className="input-field"
                      placeholder="Dosage (e.g., 500mg)"
                      required
                    />
                    <input
                      value={item.frequency}
                      onChange={e => updateItem(idx, 'frequency', e.target.value)}
                      className="input-field"
                      placeholder="Frequency (e.g., 3x daily)"
                      required
                    />
                    <input
                      value={item.duration}
                      onChange={e => updateItem(idx, 'duration', e.target.value)}
                      className="input-field"
                      placeholder="Duration (e.g., 7 days)"
                      required
                    />
                    <input
                      value={item.instructions || ''}
                      onChange={e => updateItem(idx, 'instructions', e.target.value)}
                      className="input-field"
                      placeholder="Instructions (e.g., After meals)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="Follow-up instructions, precautions, etc."
              id="input-rx-notes"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" id="btn-cancel-rx">
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-save-rx">
              <Pill size={16} />
              {initialData ? 'Update Prescription' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
