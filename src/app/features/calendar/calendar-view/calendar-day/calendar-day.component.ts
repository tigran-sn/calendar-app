import { booleanAttribute, Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

import { take } from 'rxjs/operators';

import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { Appointment } from '@core/models';
import { CalendarService } from '@core/services';
import { AppointmentItemComponent } from '@features/appointment/appointment-form/appointment-item/appointment-item.component';

@Component({
  selector: 'app-calendar-day',
  imports: [DragDropModule, AppointmentItemComponent],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
})
export class CalendarDayComponent {
  @Input() date: Date = new Date();
  @Input() appointments: Appointment[] = [];
  @Input({ transform: booleanAttribute }) isCurrentMonth = true;

  private calendarService = inject(CalendarService);
  private router = inject(Router);

  get isToday(): boolean {
    const today = new Date();
    return (
      today.getDate() === this.date.getDate() &&
      today.getMonth() === this.date.getMonth() &&
      today.getFullYear() === this.date.getFullYear()
    );
  }

  get dayId(): string {
    return `day-${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getDate()}`;
  }

  onDrop(event: CdkDragDrop<Appointment[]>): void {
    console.log('Drop event occurred:', event);

    if (event.previousContainer === event.container) {
      console.log('Same container, no action needed');
      return;
    }

    const appointmentId = event.item.data;
    console.log('Appointment ID:', appointmentId);

    this.calendarService
      .getAppointmentById(appointmentId)
      .pipe(take(1))
      .subscribe((appointment) => {
        console.log('Found appointment:', appointment);

        if (appointment) {
          const timeDiff =
            appointment.endDate.getTime() - appointment.startDate.getTime();

          const newStartDate = new Date(this.date);
          newStartDate.setHours(appointment.startDate.getHours());
          newStartDate.setMinutes(appointment.startDate.getMinutes());

          const newEndDate = new Date(newStartDate.getTime() + timeDiff);

          console.log(
            'Moving appointment to new dates:',
            newStartDate,
            newEndDate
          );
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

  createNewAppointmentWithDate(): void {
    this.router.navigate(['/appointment'], {
      queryParams: {
        date: this.date.toISOString(),
      },
    });
  }
}
