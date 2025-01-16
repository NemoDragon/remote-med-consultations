import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Consultation } from '../../models/doctor.model';
import { Patient } from '../../models/patient.model';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';
import { ActivatedRoute } from '@angular/router';

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
    private dataSourceService: DatasourceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let doctorId = this.route.snapshot.paramMap.get('id') || '0';
    this.dataSourceService.dataSource$.subscribe((value) => {
      this.selectedSource = value;
      this.loadData(doctorId);
    });
  }

  loadData(id: string) {
    if (this.selectedSource === 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[Number(id)];
      });
      this.firebaseService
        .getData(`doctors/${id}/consultations`)
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
        this.doctor = data[Number(id)];
      });
      this.apiService.getConsultations(Number(id)).subscribe((data) => {
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
      this.firebaseService.updateData(`doctors/${this.doctor.id}`, this.doctor);
    } else {
      this.apiService.updateDoctor(this.doctor.id, this.doctor).subscribe();
    }
    this.loadData(this.doctor.id);
  }
}
