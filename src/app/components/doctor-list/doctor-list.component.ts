import { Component, OnInit } from '@angular/core';
import { Doctor } from '../../models/doctor.model';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getDoctors().subscribe((doctors) => {
      this.doctors = doctors;
    });
  }
}
