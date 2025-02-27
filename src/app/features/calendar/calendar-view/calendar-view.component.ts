import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { Observable, combineLatest, map, take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { DateService } from '@core/services/date.service';
import { CalendarService } from '@core/services/calendar.service';
import { Appointment } from '@core/models/appointment.model';
import { CalendarDayComponent } from './calendar-day/calendar-day.component';

@Component({
  selector: 'app-calendar-view',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CalendarDayComponent,
    DragDropModule,
    AsyncPipe,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
})
export class CalendarViewComponent {
  public dateService = inject(DateService);
  private calendarService = inject(CalendarService);
  private router = inject(Router);

  weekDays: string[] = [];
  calendarDays$: Observable<
    {
      date: Date;
      appointments: Appointment[];
      isCurrentMonth: boolean;
    }[]
  >;
  currentDate$: Observable<Date>;

  constructor() {
    this.weekDays = this.dateService.getWeekDays();
    this.currentDate$ = this.dateService.getCurrentDate();

    this.calendarDays$ = combineLatest([
      this.currentDate$,
      this.calendarService.appointments$,
    ]).pipe(
      map(([currentDate, appointments]) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = this.dateService.getMonthDays(year, month);

        return days.map((date) => {
          const dayAppointments = appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.startDate);
            return this.dateService.isSameDay(appointmentDate, date);
          });

          return {
            date,
            appointments: dayAppointments,
            isCurrentMonth: date.getMonth() === month,
          };
        });
      })
    );
  }

  previousMonth(): void {
    this.currentDate$.pipe(take(1)).subscribe((currentDate) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      this.dateService.setCurrentDate(newDate);
    });
  }

  nextMonth(): void {
    this.currentDate$.pipe(take(1)).subscribe((currentDate) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      this.dateService.setCurrentDate(newDate);
    });
  }

  addAppointment(): void {
    this.router.navigate(['/appointment']);
  }
}
