import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Consultation } from '../../models/doctor.model';
import { Patient } from '../../models/patient.model';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  selectedSource!: string;
  consultations: Consultation[] = [];
  reservedConsultations: Consultation[] = [];
  patients: Patient[] = [];
  doctor: any;

  constructor(
    private apiService: ApiService,
    private firebaseService: FirebaseService,
    private dataSourceService: DatasourceService
  ) {}

  ngOnInit(): void {
    this.dataSourceService.dataSource$.subscribe((value) => {
      this.selectedSource = value;
      this.loadData();
    });
  }

  loadData() {
    if (this.selectedSource === 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[0];
      });
      this.firebaseService
        .getData('doctors/0/consultations')
        .subscribe((data) => {
          this.consultations = data;
          this.reservedConsultations = this.consultations.filter(
            (x) => x.state == 'reserved'
          );
          this.consultations.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });
      this.firebaseService.getData('patients').subscribe((data) => {
        this.patients = data;
        console.log(data);
      });
    } else {
      this.apiService.getDoctors().subscribe((data) => {
        this.doctor = data[0];
      });
      this.apiService.getConsultations(1).subscribe((data) => {
        this.consultations = data;
        this.reservedConsultations = this.consultations.filter(
          (x) => x.state == 'reserved'
        );
        this.consultations.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
      this.apiService.getPatients().subscribe((data) => {
        this.patients = data;
        console.log(data);
      });
    }
  }

  formatDate(date: string) {
    return new Date(date).toDateString().slice(0, 15);
  }

  getPatientById(patientId: number) {
    return this.patients.filter((x) => x.id == patientId)[0];
  }

  removeConsultation(consultationId: number) {
    const newConsultations = this.consultations.filter(
      (x) => x.id != consultationId
    );
    this.doctor.consultations = newConsultations;
    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData('doctors/0', this.doctor);
    } else {
      this.apiService.updateDoctor(1, this.doctor).subscribe();
    }
  }
}
