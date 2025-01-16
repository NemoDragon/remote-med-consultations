import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Availability, Doctor, TimeSlot } from '../../models/doctor.model';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css',
})
export class AvailabilityComponent implements OnInit {
  selectedSource!: string;
  availabilityType: string = '';
  availabilityDate: string = '';
  availabilityStartDate: string = '';
  availabilityEndDate: string = '';
  availabilityDaysOfWeek: string[] = [];
  availabilityTimeSlots: TimeSlot[] = [];
  availability: Availability = {
    type: 'cyclic',
    timeSlots: [],
  };
  availabilities: Availability[] = [];
  doctor: any;
  timeOptions: string[] = [];

  dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

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

    this.generateTimeOptions();
  }

  loadData() {
    if (this.selectedSource === 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[0];
      });
      this.firebaseService
        .getData('doctors/0/schedule/availability')
        .subscribe((data) => {
          this.availabilities = data;
        });
    } else {
      this.apiService.getDoctors().subscribe((doctors) => {
        this.doctor = doctors[0];
      });
      this.apiService.getAvailabilities(1).subscribe((data) => {
        this.availabilities = data;
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

  toggleDaySelection(day: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.availabilityDaysOfWeek.push(day);
    } else {
      const index = this.availabilityDaysOfWeek.indexOf(day);
      if (index !== -1) {
        this.availabilityDaysOfWeek.splice(index, 1);
      }
    }
    console.log('Checked days:', this.availabilityDaysOfWeek);
  }

  addTimeSlot(): void {
    this.availabilityTimeSlots.push({ start: '', end: '' });
  }

  removeTimeSlot(index: number): void {
    this.availabilityTimeSlots.splice(index, 1);
  }

  submitCyclicAvailability() {
    this.availability.type = 'cyclic';
    this.availability.startDate = this.availabilityStartDate;
    this.availability.endDate = this.availabilityEndDate;
    this.availability.daysOfWeek = this.availabilityDaysOfWeek;
    this.availability.timeSlots = this.availabilityTimeSlots;
    console.log('CYclic availability:', this.availability);
    this.availabilities.push(this.availability);
    this.doctor.schedule.availability = this.availabilities;
    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData('doctors/0', this.doctor);
    } else {
      this.apiService.updateDoctor(1, this.doctor).subscribe();
    }
  }

  submitSingleAvailability() {
    this.availability.type = 'one-time';
    this.availability.date = this.availabilityDate;
    this.availability.timeSlots = this.availabilityTimeSlots;
    console.log('One-time availability:', this.availability);
    this.availabilities.push(this.availability);
    this.doctor.schedule.availability = this.availabilities;
    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData('doctors/0', this.doctor);
    } else {
      this.apiService.updateDoctor(1, this.doctor).subscribe();
    }
  }
}
