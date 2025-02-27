import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Appointment } from '../../../core/models/appointment.model';
import { CalendarService } from '../../../core/services/calendar.service';
import { AppointmentItemComponent } from '../../appointment/appointment-item/appointment-item.component';

@Component({
  selector: 'app-calendar-day',
  imports: [DragDropModule, AppointmentItemComponent],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
})
export class CalendarDayComponent implements OnInit {
  @Input() date: Date = new Date();
  @Input() appointments: Appointment[] = [];
  @Input() isCurrentMonth: boolean = true;

  constructor(
    private calendarService: CalendarService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get isToday(): boolean {
    const today = new Date();
    return (
      today.getDate() === this.date.getDate() &&
      today.getMonth() === this.date.getMonth() &&
      today.getFullYear() === this.date.getFullYear()
    );
  }

  onDrop(event: CdkDragDrop<Date>): void {
    const appointmentId = event.item.data.id;
    const newDate = this.date;

    this.calendarService
      .getAppointmentById(appointmentId)
      .subscribe((appointment) => {
        if (appointment) {
          const timeDiff =
            appointment.endDate.getTime() - appointment.startDate.getTime();

          const newStartDate = new Date(newDate);
          newStartDate.setHours(appointment.startDate.getHours());
          newStartDate.setMinutes(appointment.startDate.getMinutes());

          const newEndDate = new Date(newStartDate.getTime() + timeDiff);

          this.calendarService.moveAppointment(
            appointmentId,
            newStartDate,
            newEndDate
          );
        }
      });
  }

  editAppointment(id: string): void {
    this.router.navigate(['/appointment', id]);
  }

  deleteAppointment(id: string, event: Event): void {
    event.stopPropagation();
    this.calendarService.deleteAppointment(id);
  }
}
