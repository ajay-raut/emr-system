import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Trash2, Eye, Phone, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '../api/client';
import type { Patient, PatientCreate } from '../types';
import PatientModal from '../components/PatientModal';
import Pagination from '../components/Pagination';

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);
  
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
      const params: any = { page: currentPage, page_size: pageSize, search };
      if (cacheBuster > 0) {
        params._t = cacheBuster;
      }
      const data = await patientApi.list(params);
      setPatients(data.items);
      setTotalPages(data.total_pages);
      setTotalItems(data.total);
      setHasNext(data.has_next);
      setHasPrev(data.has_prev);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [search]);

  useEffect(() => { 
    load(); 
  }, [currentPage, search, cacheBuster]);

  const handleCreate = async (data: PatientCreate) => {
    try {
      await patientApi.create(data);
      toast.success('Patient created');
      setShowModal(false);
      // Add a small delay to ensure backend cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentPage(1);
      setCacheBuster(Date.now());
    } catch { toast.error('Failed to create patient'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient and all related records?')) return;
    try {
      await patientApi.delete(id);
      toast.success('Patient deleted');
      // Add a small delay to ensure backend cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      // If we're on a page that becomes empty after delete, go to previous page
      if (patients.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      setCacheBuster(Date.now());
    } catch { toast.error('Failed to delete patient'); }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Patients</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">{totalItems} registered patients</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" id="btn-add-patient">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patients by name..."
          className="input-field pl-11"
          id="search-patients"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-surface-400 dark:text-surface-500">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
            <p className="text-surface-500 dark:text-surface-400">No patients found</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
              <Plus size={16} /> Add First Patient
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-3 text-left">Patient</th>
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-left">Gender</th>
                    <th className="px-6 py-3 text-left">Blood Group</th>
                    <th className="px-6 py-3 text-left">DOB</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-700 dark:text-primary-400">{p.first_name[0]}{p.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.first_name} {p.last_name}</p>
                            {p.email && <p className="text-xs text-surface-400 dark:text-surface-500">{p.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-300">
                          <Phone size={13} /> {p.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{p.gender}</td>
                      <td className="px-6 py-4">
                        {p.blood_group ? (
                          <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                            <Droplets size={13} /> {p.blood_group}
                          </span>
                        ) : <span className="text-surface-400 dark:text-surface-500 text-sm">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">
                        {new Date(p.date_of_birth).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/patients/${p.id}`} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" id={`view-patient-${p.id}`}>
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" id={`delete-patient-${p.id}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>

      {showModal && <PatientModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </div>
  );
}
