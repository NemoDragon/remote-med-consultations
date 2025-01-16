import { Component, OnInit } from '@angular/core';
import { format, addDays, startOfWeek } from 'date-fns';
import { ConsultationSlot } from '../../models/consultation-slot.model';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../services/calendar.service';
import { ApiService } from '../../services/api.service';
import {
  Absence,
  Availability,
  Consultation,
  Doctor,
} from '../../models/doctor.model';
import { FirebaseService } from '../../services/firebase.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  selectedSource!: string;
  currentWeek: Date[] = [];
  timeSlots: string[] = [];
  currentDate: Date = new Date();
  doctor: any;
  absences: Absence[] = [];
  absenceDates: string[] = [];
  availabilities: Availability[] = [];
  consultations: Consultation[] = [];
  showConsultationInfo = false;
  hoveredConsultation: any = null;
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
    private calendarService: CalendarService,
    private apiService: ApiService,
    private firebaseService: FirebaseService,
    private dataSourceService: DatasourceService
  ) {}

  ngOnInit(): void {
    this.dataSourceService.dataSource$.subscribe((value) => {
      this.selectedSource = value;
      this.loadData();
    });

    this.calendarService.currentDate$.subscribe((currentDate) => {
      this.generateWeek(currentDate);
    });

    this.generateTimeSlots();
    this.checkConsultationState();
  }

  loadData() {
    if (this.selectedSource === 'firebase') {
      this.firebaseService.getData('doctors').subscribe((data) => {
        this.doctor = data[0];
      });
      this.firebaseService
        .getData('doctors/0/schedule/absences')
        .subscribe((data) => {
          this.absences = data;
          this.absenceDates = this.absences.map((x) => x.date);
        });
      this.firebaseService
        .getData('doctors/0/schedule/availability')
        .subscribe((data) => {
          this.availabilities = data;
        });
      this.firebaseService
        .getData('doctors/0/consultations')
        .subscribe((data) => {
          this.consultations = data;
        });
    } else {
      this.apiService.getDoctors().subscribe((doctors) => {
        this.doctor = doctors[0];
      });
      this.apiService.getAbsences(1).subscribe((data) => {
        this.absences = data;
        this.absenceDates = data.map((x) => x.date);
      });
      this.apiService.getAvailabilities(1).subscribe((data) => {
        this.availabilities = data;
      });
      this.apiService.getConsultations(1).subscribe((data) => {
        this.consultations = data;
      });
    }
  }

  generateWeek(startDate: Date): void {
    this.currentWeek = [];
    while (startDate.getDay() != 1) {
      startDate.setDate(startDate.getDate() - 1);
    }
    const startOfWeek = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.currentWeek.push(day);
    }
  }

  nextWeek(): void {
    this.calendarService.setNextWeek();
  }

  previousWeek(): void {
    this.calendarService.setPreviousWeek();
  }

  formatDate(date: Date): string {
    return `${date.toLocaleDateString('en-EN', {
      weekday: 'long',
    })}, ${date.toLocaleDateString('pl-PL')}`;
  }

  // Generate time slots (0.5 h each)
  generateTimeSlots() {
    const start = 0; // Start at 8:00
    const end = 24;
    for (let hour = start; hour < end; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  generateCurrentWeek() {
    const start = startOfWeek(this.currentDate, { weekStartsOn: 1 }); // Monday
    for (let i = 0; i < 7; i++) {
      this.currentWeek.push(addDays(start, i));
    }
  }

  checkTime(time1: string, time2: string, day: Date) {
    const currentHours = Number(this.currentDate.getHours());
    const currentMinutes = Number(this.currentDate.getMinutes()) * 0.01;
    const time1Hours = Number(time1.slice(0, 2));
    const time1Minutes = Number(time1.slice(3, 5)) * 0.01;
    let time2Hours = Number(time2.slice(0, 2));
    const time2Minutes = Number(time2.slice(3, 5)) * 0.01;
    if (time2Hours == 0 && time2Minutes == 0) {
      time2Hours = 24;
    }
    const currentTime = currentHours + currentMinutes;
    const time1Combined = time1Hours + time1Minutes;
    const time2Combined = time2Hours + time2Minutes;
    return (
      currentTime >= time1Combined &&
      currentTime < time2Combined &&
      this.currentDate.toLocaleDateString('en-CA') ==
        day.toLocaleDateString('en-CA')
    );
  }

  isConsultation(time1: string, time2: string, day: Date) {
    const consultationDates = this.consultations.map((x) => x.date);
    if (!consultationDates.includes(day.toLocaleDateString('en-CA'))) {
      return false;
    }
    for (let consultation of this.consultations) {
      if (consultation.date == day.toLocaleDateString('en-CA')) {
        const consultationStartTime =
          Number(consultation.timeSlot.start.slice(0, 2)) +
          Number(consultation.timeSlot.start.slice(3, 5)) * 0.01;
        const consultationEndTime =
          Number(consultation.timeSlot.end.slice(0, 2)) +
          Number(consultation.timeSlot.end.slice(3, 5)) * 0.01;
        const combinedTimes = this.getCombinedTimes(time1, time2);
        const time1Combined = combinedTimes[0];
        const time2Combined = combinedTimes[1];
        if (
          time1Combined >= consultationStartTime &&
          time2Combined <= consultationEndTime
        ) {
          return true;
        }
      }
    }
    return false;
  }

  countConsultations(day: Date) {
    let result = 0;
    for (let i = 0; i < this.timeSlots.length; i++) {
      if (
        this.isConsultation(
          this.timeSlots[i],
          this.timeSlots[(i + 1) % this.timeSlots.length],
          day
        )
      ) {
        result += 1;
      }
    }
    return result;
  }

  checkConsultationState() {
    const currentHours = Number(this.currentDate.getHours());
    const currentMinutes = Number(this.currentDate.getMinutes()) * 0.01;
    const currentTime = currentHours + currentMinutes;
    const currentDateDay = this.currentDate.toLocaleDateString('en-CA');
    let updatedConsultations: Consultation[] = [];
    for (let i = 0; i < this.consultations.length; i++) {
      const consultationEndTime =
        Number(this.consultations[i].timeSlot.end.slice(0, 2)) +
        Number(this.consultations[i].timeSlot.end.slice(3, 5)) * 0.01;
      const consultationDate = this.consultations[i].date;
      if (this.absenceDates.includes(consultationDate)) {
        const newConsultation = this.consultations[i];
        newConsultation.state = 'cancelled';
        updatedConsultations.push(newConsultation);
      } else if (consultationDate < currentDateDay) {
        const newConsultation = this.consultations[i];
        newConsultation.state = 'completed';
        updatedConsultations.push(newConsultation);
      } else if (
        consultationDate == currentDateDay &&
        consultationEndTime < currentTime
      ) {
        const newConsultation = this.consultations[i];
        newConsultation.state = 'completed';
        updatedConsultations.push(newConsultation);
      } else {
        updatedConsultations.push(this.consultations[i]);
      }
    }
    console.log(this.doctor.consultations);
    this.doctor.consultations = updatedConsultations;
    if (this.selectedSource == 'firebase') {
      this.firebaseService.updateData('doctors/0', this.doctor);
    } else {
      this.apiService.updateDoctor(1, this.doctor).subscribe();
    }
  }

  isConsultationPast(time1: string, time2: string, day: Date) {
    const currentHours = Number(this.currentDate.getHours());
    const currentMinutes = Number(this.currentDate.getMinutes()) * 0.01;
    const currentTime = currentHours + currentMinutes;
    let time2Hours = Number(time2.slice(0, 2));
    const time2Minutes = Number(time2.slice(3, 5)) * 0.01;
    if (time2Hours == 0 && time2Minutes == 0) {
      time2Hours = 24;
    }
    const time2Combined = time2Hours + time2Minutes;
    if (
      this.isConsultation(time1, time2, day) &&
      this.currentDate.toLocaleDateString('en-CA') >
        day.toLocaleDateString('en-CA')
    ) {
      return true;
    } else if (
      this.isConsultation(time1, time2, day) &&
      this.currentDate.toLocaleDateString('en-CA') ==
        day.toLocaleDateString('en-CA') &&
      currentTime > time2Combined
    ) {
      return true;
    }

    return false;
  }

  getConsultationType(time1: string, time2: string, day: Date) {
    const consultationDates = this.consultations.map((x) => x.date);
    if (!consultationDates.includes(day.toLocaleDateString('en-CA'))) {
      return 'not';
    }
    for (let consultation of this.consultations) {
      if (consultation.date == day.toLocaleDateString('en-CA')) {
        const consultationStartTime =
          Number(consultation.timeSlot.start.slice(0, 2)) +
          Number(consultation.timeSlot.start.slice(3, 5)) * 0.01;
        const consultationEndTime =
          Number(consultation.timeSlot.end.slice(0, 2)) +
          Number(consultation.timeSlot.end.slice(3, 5)) * 0.01;
        const combinedTimes = this.getCombinedTimes(time1, time2);
        const time1Combined = combinedTimes[0];
        const time2Combined = combinedTimes[1];
        if (
          time1Combined >= consultationStartTime &&
          time2Combined <= consultationEndTime
        ) {
          return consultation.type;
        }
      }
    }
    return 'not';
  }

  getConsultationState(time1: string, time2: string, day: Date) {
    const consultationDates = this.consultations.map((x) => x.date);
    if (!consultationDates.includes(day.toLocaleDateString('en-CA'))) {
      return 'not';
    }
    for (let consultation of this.consultations) {
      if (consultation.date == day.toLocaleDateString('en-CA')) {
        const consultationStartTime =
          Number(consultation.timeSlot.start.slice(0, 2)) +
          Number(consultation.timeSlot.start.slice(3, 5)) * 0.01;
        const consultationEndTime =
          Number(consultation.timeSlot.end.slice(0, 2)) +
          Number(consultation.timeSlot.end.slice(3, 5)) * 0.01;
        const combinedTimes = this.getCombinedTimes(time1, time2);
        const time1Combined = combinedTimes[0];
        const time2Combined = combinedTimes[1];
        if (
          time1Combined >= consultationStartTime &&
          time2Combined <= consultationEndTime
        ) {
          return consultation.state;
        }
      }
    }
    return 'not';
  }

  isAvailability(time1: string, time2: string, day: Date) {
    for (let availability of this.availabilities) {
      if (
        availability.type == 'one-time' &&
        availability.date == day.toLocaleDateString('en-CA')
      ) {
        for (let timeSlot of availability.timeSlots) {
          const availabilityStartTime =
            Number(timeSlot.start.slice(0, 2)) +
            Number(timeSlot.start.slice(3, 5)) * 0.01;
          const availabilityEndTime =
            Number(timeSlot.end.slice(0, 2)) +
            Number(timeSlot.end.slice(3, 5)) * 0.01;
          const combinedTimes = this.getCombinedTimes(time1, time2);
          const time1Combined = combinedTimes[0];
          const time2Combined = combinedTimes[1];
          return (
            time1Combined >= availabilityStartTime &&
            time2Combined <= availabilityEndTime
          );
        }
      } else if (availability.type == 'cyclic') {
        if (
          availability.daysOfWeek != undefined &&
          availability.startDate != undefined &&
          availability.endDate != undefined
        ) {
          if (
            availability.daysOfWeek.includes(this.dayNames[day.getDay()]) &&
            availability.startDate <= day.toLocaleDateString('en-CA') &&
            availability.endDate >= day.toLocaleDateString('en-CA')
          ) {
            for (let timeSlot of availability.timeSlots) {
              const availabilityStartTime =
                Number(timeSlot.start.slice(0, 2)) +
                Number(timeSlot.start.slice(3, 5)) * 0.01;
              const availabilityEndTime =
                Number(timeSlot.end.slice(0, 2)) +
                Number(timeSlot.end.slice(3, 5)) * 0.01;
              const combinedTimes = this.getCombinedTimes(time1, time2);
              const time1Combined = combinedTimes[0];
              const time2Combined = combinedTimes[1];
              if (
                time1Combined >= availabilityStartTime &&
                time2Combined <= availabilityEndTime
              ) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  getCombinedTimes(time1: string, time2: string) {
    const time1Hours = Number(time1.slice(0, 2));
    const time1Minutes = Number(time1.slice(3, 5)) * 0.01;
    let time2Hours = Number(time2.slice(0, 2));
    const time2Minutes = Number(time2.slice(3, 5)) * 0.01;
    if (time2Hours == 0 && time2Minutes == 0) {
      time2Hours = 24;
    }
    const time1Combined = time1Hours + time1Minutes;
    const time2Combined = time2Hours + time2Minutes;
    return [time1Combined, time2Combined];
  }

  showConsultationDetails(time1: string, time2: string, day: Date): void {
    this.hoveredConsultation = this.consultations.find((consultation) => {
      const consultationStartTime =
        Number(consultation.timeSlot.start.slice(0, 2)) +
        Number(consultation.timeSlot.start.slice(3, 5)) * 0.01;
      const consultationEndTime =
        Number(consultation.timeSlot.end.slice(0, 2)) +
        Number(consultation.timeSlot.end.slice(3, 5)) * 0.01;
      const combinedTimes = this.getCombinedTimes(time1, time2);
      const time1Combined = combinedTimes[0];
      const time2Combined = combinedTimes[1];

      return (
        consultation.date === day.toLocaleDateString('en-CA') &&
        time1Combined >= consultationStartTime &&
        time2Combined <= consultationEndTime
      );
    });
  }

  hideConsultationDetails(): void {
    this.hoveredConsultation = null;
  }
}
