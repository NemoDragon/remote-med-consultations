import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private currentDate = new BehaviorSubject<Date>(new Date());
  currentDate$ = this.currentDate.asObservable();

  setNextWeek(): void {
    const nextWeek = new Date(this.currentDate.value);
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.currentDate.next(nextWeek);
  }

  setPreviousWeek(): void {
    const previousWeek = new Date(this.currentDate.value);
    previousWeek.setDate(previousWeek.getDate() - 7);
    this.currentDate.next(previousWeek);
  }
}
