import { Routes } from '@angular/router';
import { MainLayout } from './components/main-layout/main-layout';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Dashboard
      }
    ]
  }
];
