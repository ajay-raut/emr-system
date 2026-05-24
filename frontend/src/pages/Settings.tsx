import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, UserPlus, Key, Save, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi } from '../api/client';
import type { Doctor } from '../types';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'users' | 'security'>('appearance');

  // Doctor Form State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);

  const [doctorForm, setDoctorForm] = useState({
    full_name: '',
    specialization: '',
    email: '',
    phone: '',
  });

  const fetchDoctors = () => {
    doctorApi.list({ page: 1, page_size: 100 }).then(response => setDoctors(response.items)).catch(console.error);
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchDoctors();
    }
  }, [activeTab]);

  // Password Reset State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleAddOrUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctorId) {
      doctorApi.update(editingDoctorId, doctorForm).then(() => {
        toast.success('Doctor updated successfully!');
        setEditingDoctorId(null);
        setDoctorForm({ full_name: '', specialization: '', email: '', phone: '' });
        fetchDoctors();
      }).catch((err) => {
        toast.error('Failed to update doctor.');
        console.error(err);
      });
    } else {
      doctorApi.create(doctorForm).then(() => {
        toast.success('Doctor added successfully!');
        setDoctorForm({ full_name: '', specialization: '', email: '', phone: '' });
        fetchDoctors();
      }).catch((err) => {
        toast.error('Failed to add doctor.');
        console.error(err);
      });
    }
  };

  const handleEdit = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setDoctorForm({
      full_name: doc.full_name,
      specialization: doc.specialization || '',
      email: doc.email || '',
      phone: doc.phone || '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      doctorApi.delete(id).then(() => {
        toast.success('Doctor deleted successfully!');
        fetchDoctors();
      }).catch((err) => {
        toast.error('Failed to delete doctor.');
        console.error(err);
      });
    }
  };

  const cancelEdit = () => {
    setEditingDoctorId(null);
    setDoctorForm({ full_name: '', specialization: '', email: '', phone: '' });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your application preferences and system settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'appearance'
                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            <UserPlus size={18} />
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            <Key size={18} />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Appearance Settings</h2>
              <div className="flex items-center justify-between p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-white">Theme Preference</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Toggle between light and dark mode.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all text-surface-700 dark:text-surface-300"
                >
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  {editingDoctorId ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <form onSubmit={handleAddOrUpdateDoctor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Dr. John Doe"
                        value={doctorForm.full_name}
                        onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Specialization</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g., Cardiologist"
                        value={doctorForm.specialization}
                        onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="john@hospital.com"
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="+1 234 567 8900"
                        value={doctorForm.phone}
                        onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    {editingDoctorId && (
                      <button type="button" onClick={cancelEdit} className="btn-secondary">
                        <X size={16} /> Cancel
                      </button>
                    )}
                    <button type="submit" className="btn-primary">
                      {editingDoctorId ? <Save size={16} /> : <UserPlus size={16} />}
                      {editingDoctorId ? 'Update Doctor' : 'Add Doctor'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Doctors List */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800">
                  <h3 className="font-semibold text-surface-900 dark:text-white">Registered Doctors</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="table-header">
                        <th className="p-4 font-semibold">Doctor</th>
                        <th className="p-4 font-semibold">Specialization</th>
                        <th className="p-4 font-semibold">Contact</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                      {doctors.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-surface-500 dark:text-surface-400">
                            No doctors registered yet.
                          </td>
                        </tr>
                      ) : (
                        doctors.map((doc) => (
                          <tr key={doc.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                            <td className="p-4">
                              <p className="font-medium text-surface-900 dark:text-white">{doc.full_name}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-surface-600 dark:text-surface-300">{doc.specialization || '-'}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-surface-600 dark:text-surface-300">{doc.email || '-'}</p>
                              <p className="text-xs text-surface-500 dark:text-surface-400">{doc.phone || '-'}</p>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(doc)}
                                  className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Reset Password</h2>
              <form onSubmit={handleResetPassword} className="space-y-4 max-w-md">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="btn-primary w-full">
                    <Save size={16} />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
