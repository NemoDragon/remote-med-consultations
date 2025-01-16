import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Absence, Consultation, Doctor } from '../../models/doctor.model';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css',
})
export class AbsenceComponent implements OnInit {
  selectedSource!: string;
  doctor: any;
  absence: Absence = {
    date: '',
    reason: '',
  };
  absences: Absence[] = [];
  consultations: Consultation[] = [];
  showAbsenceConflictInfo = false;
  showConsultationConflictInfo = false;

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
    if (this.selectedSource == 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[0];
      });
      this.firebaseService
        .getData('doctors/0/consultations')
        .subscribe((data) => {
          this.consultations = data;
        });
      this.firebaseService
        .getData('doctors/0/schedule/absences')
        .subscribe((data) => {
          this.absences = data;
          console.log(data);
          this.absences.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        });
    } else {
      this.apiService.getDoctors().subscribe((doctors) => {
        this.doctor = doctors[0];
      });
      this.apiService.getConsultations(1).subscribe((data) => {
        this.consultations = data;
      });
      this.apiService.getAbsences(1).subscribe((data) => {
        this.absences = data;
        this.absences.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
    }
  }

  formatAbsenceDate(date: string) {
    return new Date(date).toDateString().slice(0, 15);
  }

  submitAbsence() {
    if (this.absences.map((x) => x.date).includes(this.absence.date)) {
      this.showAbsenceConflictInfo = true;
    } else {
      if (this.consultations.map((x) => x.date).includes(this.absence.date)) {
        this.showConsultationConflictInfo = true;
        // todo
      }
      console.log(this.absence);
      this.absences.push(this.absence);
      this.absences.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      this.doctor.schedule.absences = this.absences;
      if (this.selectedSource == 'firebase') {
        this.firebaseService.updateData('doctors/0', this.doctor);
      } else {
        this.apiService.updateDoctor(1, this.doctor).subscribe();
      }
      console.log(this.doctor);
    }
  }

  removeAbsence(absenceDateToRemove: string) {
    this.absences = this.absences.filter((x) => x.date != absenceDateToRemove);
    console.log(this.absences);
    this.doctor.schedule.absences = this.absences;
    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData('doctors/0', this.doctor);
    } else {
      this.apiService.updateDoctor(1, this.doctor).subscribe();
    }
  }
}
