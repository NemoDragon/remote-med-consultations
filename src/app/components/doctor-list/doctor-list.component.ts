import { Component, OnInit } from '@angular/core';
import { Doctor } from '../../models/doctor.model';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent implements OnInit {
  selectedSource!: string;
  doctors: Doctor[] = [];

  constructor(
    private apiService: ApiService,
    private firebase: FirebaseService,
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
      this.firebase.getData('doctors').subscribe((doctors) => {
        this.doctors = doctors;
      });
    } else {
      this.apiService.getDoctors().subscribe((doctors) => {
        this.doctors = doctors;
      });
    }
  }
}
