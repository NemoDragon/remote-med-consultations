import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Absence,
  Availability,
  Consultation,
  Doctor,
} from '../models/doctor.model';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`);
  }

  getAbsences(doctorId: number): Observable<Absence[]> {
    return this.http
      .get(`${this.baseUrl}/doctors/${doctorId}`)
      .pipe(map((x) => this.getAbsencesFromDoctor(x)));
  }

  getAvailabilities(doctorId: number): Observable<Availability[]> {
    return this.http
      .get(`${this.baseUrl}/doctors/${doctorId}`)
      .pipe(map((x) => this.getAvailabilitiesFromDoctor(x)));
  }

  updateDoctor(doctorId: number, newDoctor: Doctor) {
    return this.http.put(`${this.baseUrl}/doctors/${doctorId}`, newDoctor);
  }

  getConsultations(doctorId: number): Observable<Consultation[]> {
    return this.http
      .get(`${this.baseUrl}/doctors/${doctorId}`)
      .pipe(map((x) => this.getConsultationsFromDoctor(x)));
  }

  getPatients(): Observable<any> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  addPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  getConsultationTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/consultationTypes`);
  }

  getAbsencesFromDoctor(doc: any): Absence[] {
    return doc.schedule.absences;
  }

  getAvailabilitiesFromDoctor(doc: any): Availability[] {
    return doc.schedule.availability;
  }

  getConsultationsFromDoctor(doc: any): Consultation[] {
    return doc.consultations;
  }
}
