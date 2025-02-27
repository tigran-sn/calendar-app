import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/calendar/calendar-view/calendar-view.component').then(
        (m) => m.CalendarViewComponent
      ),
  },
  {
    path: 'appointment',
    loadComponent: () =>
      import(
        './features/appointment/appointment-form/appointment-form.component'
      ).then((m) => m.AppointmentFormComponent),
  },
  {
    path: 'appointment/:id',
    loadComponent: () =>
      import(
        './features/appointment/appointment-form/appointment-form.component'
      ).then((m) => m.AppointmentFormComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
