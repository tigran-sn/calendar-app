import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private currentDateSubject = new BehaviorSubject<Date>(new Date());
  private connectedDayIdsSubject = new BehaviorSubject<string[]>([]);
  currentDate$ = this.currentDateSubject.asObservable();
  connectedDayIds$ = this.connectedDayIdsSubject.asObservable();

  setCurrentDate(date: Date): void {
    this.currentDateSubject.next(date);
  }

  updateConnectedDayIds(ids: string[]): void {
    this.connectedDayIdsSubject.next(ids);
  }

  getCurrentDate(): Observable<Date> {
    return this.currentDate$;
  }

  getMonthDays(year: number, month: number): Date[] {
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek > 0) {
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = new Date(year, month, -i);
        days.push(day);
      }
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) {
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  }

  getWeekDays(): string[] {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
  }

  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
}
