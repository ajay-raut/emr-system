import axios from 'axios';
import type {
  Patient, PatientCreate, PatientUpdate,
  MedicalRecord, MedicalRecordCreate,
  Appointment, AppointmentCreate, AppointmentUpdate,
  Prescription, PrescriptionCreate, User, Doctor, DoctorCreate, DoctorUpdate,
  PaginatedResponse, PaginationParams
} from '../types';

// In production (Docker), Nginx proxies /api → backend, so use relative URLs.
// For local dev without Docker, set VITE_API_URL=http://localhost:8000
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Users ─── */
export const userApi = {
  list: () =>
    api.get<User[]>('/auth/users').then(r => r.data),
};

/* ─── Doctors ─── */
export const doctorApi = {
  list: (params?: PaginationParams & { search?: string }) =>
    api.get<PaginatedResponse<Doctor>>('/doctors/', { params }).then(r => r.data),
  create: (data: DoctorCreate) =>
    api.post<Doctor>('/doctors/', data).then(r => r.data),
  update: (id: string, data: DoctorUpdate) =>
    api.put<Doctor>(`/doctors/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/doctors/${id}`),
};

/* ─── Patients ─── */
export const patientApi = {
  list: (params?: PaginationParams & { search?: string; _t?: number }) =>
    api.get<PaginatedResponse<Patient>>('/patients/', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then(r => r.data),
  create: (data: PatientCreate) =>
    api.post<Patient>('/patients/', data).then(r => r.data),
  update: (id: string, data: PatientUpdate) =>
    api.put<Patient>(`/patients/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/patients/${id}`),
};

/* ─── Medical Records ─── */
export const recordApi = {
  list: (params?: PaginationParams & { patient_id?: string }) =>
    api.get<PaginatedResponse<MedicalRecord>>('/records/', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<MedicalRecord>(`/records/${id}`).then(r => r.data),
  create: (data: MedicalRecordCreate) =>
    api.post<MedicalRecord>('/records/', data).then(r => r.data),
  update: (id: string, data: MedicalRecordCreate) =>
    api.put<MedicalRecord>(`/records/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/records/${id}`),
};

/* ─── Appointments ─── */
export const appointmentApi = {
  list: (params?: PaginationParams & { patient_id?: string; status_filter?: string }) =>
    api.get<PaginatedResponse<Appointment>>('/appointments/', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`).then(r => r.data),
  create: (data: AppointmentCreate) =>
    api.post<Appointment>('/appointments/', data).then(r => r.data),
  update: (id: string, data: AppointmentUpdate) =>
    api.put<Appointment>(`/appointments/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/appointments/${id}`),
};

/* ─── Prescriptions ─── */
export const prescriptionApi = {
  list: (params?: PaginationParams & { patient_id?: string }) =>
    api.get<PaginatedResponse<Prescription>>('/prescriptions/', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Prescription>(`/prescriptions/${id}`).then(r => r.data),
  create: (data: PrescriptionCreate) =>
    api.post<Prescription>('/prescriptions/', data).then(r => r.data),
  update: (id: string, data: PrescriptionCreate) =>
    api.put<Prescription>(`/prescriptions/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/prescriptions/${id}`),
  downloadPdf: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default api;
