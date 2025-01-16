import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Consultation, Doctor } from '../../models/doctor.model';
import { Patient } from '../../models/patient.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit {
  selectedSource!: string;
  firstname: string = '';
  surname: string = '';
  patient: Patient = {
    id: 0,
    name: '',
    gender: '',
    age: 0,
    pesel: '',
  };
  consultation: Consultation = {
    id: 0,
    date: '',
    timeSlot: { start: '', end: '' },
    patientId: 0,
    type: '',
    state: '',
    details: '',
  };
  doctor: any;
  timeOptions: string[] = [];
  patients: Patient[] = [];

  constructor(
    private apiService: ApiService,
    private firebaseService: FirebaseService,
    private dataSourceService: DatasourceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let doctorId = this.route.snapshot.paramMap.get('id') || '0';
    this.dataSourceService.dataSource$.subscribe((value) => {
      this.selectedSource = value;
      this.loadData(doctorId);
    });

    this.generateTimeOptions();
  }

  loadData(id: string) {
    if (this.selectedSource === 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[Number(id)];
      });
      this.firebaseService.getData('patients').subscribe((data) => {
        this.patients = data;
      });
    } else {
      this.apiService.getDoctors().subscribe((data) => {
        this.doctor = data[Number(id)];
      });
      this.apiService.getPatients().subscribe((data) => {
        this.patients = data;
      });
    }
  }

  generateTimeOptions(): void {
    const startHour = 0;
    const endHour = 24;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = this.formatTime(hour, minute);
        this.timeOptions.push(time);
      }
    }
  }

  formatTime(hour: number, minute: number): string {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  }

  addConsultation() {
    this.consultation.state = 'reserved';
    this.consultation.id = this.doctor.consultations.length + 1;
    while (
      Array(this.doctor.consultations)
        .map((x) => x.id)
        .includes(this.consultation.id)
    ) {
      this.consultation.id += 1;
    }
    this.patient.name = this.firstname + ' ' + this.surname;
    const pesel = this.patient.pesel;
    this.patient.id = this.patients.length + 1;
    if (
      this.patient.pesel !=
      this.patients.filter((x) => x.pesel == pesel).map((x) => x.pesel)[0]
    ) {
      if (this.selectedSource == 'firebase') {
        this.firebaseService.addData(
          `patients/${this.patient.id}`,
          this.patient
        );
      } else {
        this.apiService.addPatient(this.patient).subscribe();
      }
      this.consultation.patientId = this.patient.id;
    } else {
      this.consultation.patientId = this.patients
        .filter((x) => x.pesel == pesel)
        .map((x) => x.id)[0];
    }
    this.doctor.consultations.push(this.consultation);

    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData(`doctors/${this.doctor.id}`, this.doctor);
    } else {
      this.apiService.updateDoctor(this.doctor.id, this.doctor).subscribe();
    }
  }
}
