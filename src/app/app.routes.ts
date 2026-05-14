import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'calculator',
    loadComponent: () => import('./pages/calculator/calculator.page').then(m => m.CalculatorPage),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then(m => m.ResultsPage),
  },
  {
    path: 'physical-evaluation',
    loadComponent: () => import('./pages/physical-evaluation/physical-evaluation.page').then(m => m.PhysicalEvaluationPage),
  },
  {
    path: 'physical-evaluation-results',
    loadComponent: () => import('./pages/physical-evaluation-results/physical-evaluation-results.page').then(m => m.PhysicalEvaluationResultsPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
