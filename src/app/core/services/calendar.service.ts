import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, map } from 'rxjs';

import { Appointment } from '@core/models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  constructor() {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      appointments.forEach((appointment: any) => {
        appointment.startDate = new Date(appointment.startDate);
        appointment.endDate = new Date(appointment.endDate);
      });
      this.appointmentsSubject.next(appointments);
    }
  }

  private saveToLocalStorage(appointments: Appointment[]): void {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointmentsByDate(date: Date): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map((appointments) =>
        appointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.startDate);
          return (
            appointmentDate.getDate() === date.getDate() &&
            appointmentDate.getMonth() === date.getMonth() &&
            appointmentDate.getFullYear() === date.getFullYear()
          );
        })
      )
    );
  }

  getAppointmentById(id: string): Observable<Appointment | undefined> {
    return this.appointments$.pipe(
      map((appointments) =>
        appointments.find((appointment) => appointment.id === id)
      )
    );
  }

  addAppointment(appointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const newAppointments = [...currentAppointments, appointment];
    this.appointmentsSubject.next(newAppointments);
    this.saveToLocalStorage(newAppointments);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const newAppointments = currentAppointments.map((appointment) =>
      appointment.id === updatedAppointment.id
        ? updatedAppointment
        : appointment
    );
    this.appointmentsSubject.next(newAppointments);
    this.saveToLocalStorage(newAppointments);
  }

  deleteAppointment(id: string): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const newAppointments = currentAppointments.filter(
      (appointment) => appointment.id !== id
    );
    this.appointmentsSubject.next(newAppointments);
    this.saveToLocalStorage(newAppointments);
  }

  moveAppointment(id: string, newStartDate: Date, newEndDate: Date): void {
    const currentAppointments = this.appointmentsSubject.getValue();

    const newAppointments = currentAppointments.map((appointment) => {
      if (appointment.id === id) {
        return {
          ...appointment,
          startDate: newStartDate,
          endDate: newEndDate,
        };
      }
      return appointment;
    });

    this.appointmentsSubject.next(newAppointments);
    this.saveToLocalStorage(newAppointments);
  }
}
