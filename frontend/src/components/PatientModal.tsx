import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { PatientCreate } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (data: PatientCreate) => void;
  initialData?: Partial<PatientCreate>;
  title?: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientModal({ onClose, onSubmit, initialData, title = 'Add New Patient' }: Props) {
  const [form, setForm] = useState<PatientCreate>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || 'Male',
    blood_group: initialData?.blood_group || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    emergency_contact: initialData?.emergency_contact || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" id="close-patient-modal">
            <X size={18} className="text-surface-500 dark:text-surface-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John"
                id="input-first-name"
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Doe"
                id="input-last-name"
              />
            </div>
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                required
                className="input-field"
                id="input-dob"
              />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field" id="input-gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Blood + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange} className="input-field" id="input-blood-group">
                <option value="">Select...</option>
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="+1 (555) 123-4567"
                id="input-phone"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="john.doe@email.com"
              id="input-email"
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field min-h-[60px] resize-none"
              placeholder="123 Main Street, City, State"
              id="input-address"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="label">Emergency Contact</label>
            <input
              name="emergency_contact"
              value={form.emergency_contact}
              onChange={handleChange}
              className="input-field"
              placeholder="+1 (555) 987-6543"
              id="input-emergency-contact"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" id="btn-cancel-patient">
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="btn-save-patient">
              <Plus size={16} />
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
