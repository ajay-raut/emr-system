/* ─── TypeScript interfaces matching FastAPI Pydantic schemas ─── */

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  specialization?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface DoctorCreate {
  full_name: string;
  specialization?: string;
  email?: string;
  phone?: string;
}

export interface DoctorUpdate {
  full_name?: string;
  specialization?: string;
  email?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group?: string | null;
  email?: string | null;
  phone: string;
  address?: string | null;
  emergency_contact?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  email?: string;
  phone: string;
  address?: string;
  emergency_contact?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  diagnosis: string;
  notes?: string | null;
  symptoms?: string | null;
  vitals?: string | null;
  visit_date: string;
  created_at: string;
}

export interface MedicalRecordCreate {
  patient_id: string;
  diagnosis: string;
  notes?: string;
  symptoms?: string;
  vitals?: string;
  visit_date?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  doctor_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface AppointmentCreate {
  patient_id: string;
  appointment_date: string;
  reason: string;
  doctor_name?: string;
  notes?: string;
}

export interface AppointmentUpdate {
  appointment_date?: string;
  reason?: string;
  status?: string;
  doctor_name?: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
}

export interface PrescriptionItemCreate {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_name: string;
  diagnosis?: string | null;
  notes?: string | null;
  created_at: string;
  items: PrescriptionItem[];
}

export interface PrescriptionCreate {
  patient_id: string;
  doctor_name?: string;
  diagnosis?: string;
  notes?: string;
  items: PrescriptionItemCreate[];
}

export interface DashboardStats {
  total_patients: number;
  total_appointments: number;
  total_records: number;
  total_prescriptions: number;
}

/* ─── Pagination Types ─── */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
