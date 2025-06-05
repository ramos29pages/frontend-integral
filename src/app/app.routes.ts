import { Routes } from '@angular/router';
import { SolicitudesPageComponent } from './features/solicitudes/pages/solicitudes-page/solicitudes-page.component';
import { SolicitudFormPageComponent } from './features/solicitudes/pages/solicitudes-form-page/solicitudes-form-page.component';
import { SolicitudDetailPageComponent } from './features/solicitudes/pages/solicitudes-detail-page/solicitudes-detail-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/solicitudes', pathMatch: 'full' },
  { path: 'solicitudes', component: SolicitudesPageComponent },
  { path: 'solicitudes/new', component: SolicitudFormPageComponent },
  { path: 'solicitudes/editar/:id', component: SolicitudFormPageComponent },
  { path: 'solicitudes/:id', component: SolicitudDetailPageComponent },
  { path: '**', redirectTo: '/solicitudes' } // Wildcard for unmatched routes
];
