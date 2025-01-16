export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  schedule: Schedule;
  consultations: Consultation[];
}

export interface Schedule {
  availability: Availability[];
  absences: Absence[];
}

export interface Availability {
  type: 'cyclic' | 'one-time';
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  daysOfWeek?: string[]; // For cyclic schedules
  date?: string; // For one-time availability
  timeSlots: TimeSlot[];
}

export interface Absence {
  date: string; // Format: YYYY-MM-DD
  reason: string;
}

export interface TimeSlot {
  start: string; // Format: HH:mm
  end: string; // Format: HH:mm
}

export interface Consultation {
  id: number;
  date: string; // Format: YYYY-MM-DD
  timeSlot: TimeSlot;
  patientId: number;
  type: string;
  state: string;
  details: string;
}
