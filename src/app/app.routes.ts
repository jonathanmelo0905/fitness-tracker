import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'calculator',
    loadComponent: () => import('./pages/calculator/calculator.page').then(m => m.CalculatorPage),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then(m => m.ResultsPage),
  },
  {
    path: '',
    redirectTo: 'calculator',
    pathMatch: 'full',
  },
];
