import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { switchMap, filter, take } from 'rxjs/operators';
import { of } from 'rxjs';

import { CalendarService } from '@core/services';
import { Appointment } from '@core/models';

@Component({
  selector: 'app-appointment-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  appointmentForm!: FormGroup;
  isEditMode = false;
  appointmentId: string | null = null;
  colorOptions = [
    { value: '#f44336', label: 'Red' },
    { value: '#e91e63', label: 'Pink' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#3f51b5', label: 'Indigo' },
    { value: '#2196f3', label: 'Blue' },
    { value: '#00bcd4', label: 'Cyan' },
    { value: '#4caf50', label: 'Green' },
    { value: '#ff9800', label: 'Orange' },
  ];

  constructor() {
    this.createForm();
  }

  ngOnInit(): void {
    this.appointmentForm.get('startTime')?.valueChanges.subscribe(() => {
      const endTimeControl = this.appointmentForm.get('endTime');
      endTimeControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{2}:\d{2}$/),
        this.endTimeValidator.bind(this),
      ]);
      endTimeControl?.updateValueAndValidity();
    });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.appointmentId = id;

          if (id) {
            this.isEditMode = true;
            return this.calendarService.getAppointmentById(id).pipe(
              filter((appointment) => !!appointment),
              take(1)
            );
          }

          return of(null);
        })
      )
      .subscribe((appointment) => {
        if (appointment) {
          this.appointmentForm.patchValue({
            title: appointment.title,
            description: appointment.description || '',
            date: appointment.startDate,
            startTime: this.formatTimeForInput(appointment.startDate),
            endTime: this.formatTimeForInput(appointment.endDate),
            color: appointment.color || '#2196f3',
          });
        }
      });
  }

  createForm(): void {
    this.appointmentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      date: [new Date(), [Validators.required]],
      startTime: [
        '09:00',
        [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)],
      ],
      endTime: [
        '10:00',
        [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)],
      ],
      color: ['#2196f3'],
    });
  }

  endTimeValidator(control: AbstractControl): Record<string, boolean> | null {
    if (!this.appointmentForm) {
      return null;
    }

    const startTime = this.appointmentForm.get('startTime')?.value;
    const endTime = control.value;

    if (!startTime || !endTime) {
      return null;
    }

    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);

    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (endMinutes <= startMinutes) {
      return { endTimeInvalid: true };
    }

    return null;
  }

  formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  parseTimeString(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      return;
    }

    const formValue = this.appointmentForm.value;
    const date = new Date(formValue.date);

    const startTime = this.parseTimeString(formValue.startTime);
    const endTime = this.parseTimeString(formValue.endTime);

    const startDate = new Date(date);
    startDate.setHours(startTime.hours, startTime.minutes, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endTime.hours, endTime.minutes, 0, 0);

    const appointment: Appointment = {
      id: this.appointmentId || crypto.randomUUID(),
      title: formValue.title,
      description: formValue.description,
      startDate,
      endDate,
      color: formValue.color,
    };

    if (this.isEditMode) {
      this.calendarService.updateAppointment(appointment);
    } else {
      this.calendarService.addAppointment(appointment);
    }

    this.router.navigate(['/']);
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
