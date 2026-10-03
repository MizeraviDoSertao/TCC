import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app.component').then(module => module.AppComponent),
    title: 'Fraud Detection Dashboard'
  },
  {
    path: 'claims',
    loadComponent: () => import('./claims/claims.component').then(module => module.ClaimsComponent),
    title: 'Explorar sinistros'
  },
  {
    path: 'imports',
    loadComponent: () => import('./imports/imports.component').then(module => module.ImportsComponent),
    title: 'Importações'
  },
  {
    path: 'models',
    loadComponent: () => import('./models/models.component').then(module => module.ModelsComponent),
    title: 'Gestão de modelos'
  },
  {
    path: 'transactions/:transactionId',
    loadComponent: () => import('./transaction-detail/transaction-detail.component')
      .then(module => module.TransactionDetailComponent),
    title: 'Detalhes da transação'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
