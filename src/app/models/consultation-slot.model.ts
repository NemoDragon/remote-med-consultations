export interface ConsultationSlot {
  time: string;
  isReserved: boolean;
  consultationType?: string;
  patientInfo?: {
    name: string;
    details: string;
  };
  isPast: boolean;
}
