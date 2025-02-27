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
    path: '**',
    redirectTo: '',
  },
];
