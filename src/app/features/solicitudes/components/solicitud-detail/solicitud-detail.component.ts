import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitud } from '../../../../core/models/solicitud.model';
import { ServicioItemComponent } from '../servicio-item/servicio-item.component';
import { EstadoSolicitudPipe } from '../../../../shared/pipes/estado-solicitud.pipe';

@Component({
  selector: 'app-solicitud-detail',
  standalone: true,
  imports: [
    CommonModule,
    ServicioItemComponent,
    EstadoSolicitudPipe
  ],
  template: `
    <div *ngIf="solicitud" class="mb-6 p-4 border rounded-lg bg-gray-50">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p><span class="font-semibold">ID Solicitud:</span> {{ solicitud.id }}</p>
          <p><span class="font-semibold">Cliente:</span> {{ solicitud.cliente }}</p>
          <p><span class="font-semibold">Email Cliente:</span> {{ solicitud.email_cliente }}</p>
        </div>
        <div>
          <p><span class="font-semibold">Fecha Solicitud:</span> {{ solicitud.fecha_solicitud | date:'medium' }}</p>
          <p><span class="font-semibold">Estado:</span>
            <span [ngClass]="{
              'px-2 inline-flex text-sm leading-5 font-semibold rounded-full': true,
              'bg-blue-100 text-blue-800': solicitud.estado === 'Abierta',
              'bg-yellow-100 text-yellow-800': solicitud.estado === 'En Proceso',
              'bg-green-100 text-green-800': solicitud.estado === 'Cerrada',
              'bg-red-100 text-red-800': solicitud.estado === 'Cancelada'
            }">
              {{ solicitud.estado | estadoSolicitud }}
            </span>
          </p>
          <p><span class="font-semibold">Última Modificación:</span> {{ solicitud.fecha_ultima_modificacion | date:'medium' }}</p>
        </div>
      </div>
      <div class="mt-4">
        <p><span class="font-semibold">Observaciones:</span> {{ solicitud.observaciones || 'N/A' }}</p>
      </div>
    </div>

    <h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Servicios Asociados</h3>
    <div *ngIf="!solicitud?.servicios" class="text-center py-4 text-gray-600">
      <p>No hay servicios asociados a esta solicitud.</p>
    </div>
    <div *ngIf="solicitud?.servicios">
      <app-servicio-item *ngFor="let servicio of solicitud?.servicios" [servicio]="servicio"></app-servicio-item>
    </div>
  `,
  styles: []
})
export class SolicitudDetailComponent {
  @Input() solicitud: Solicitud | null = null;
}
