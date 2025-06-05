import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitud } from '../../../../core/models/solicitud.model';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { EstadoSolicitudPipe } from '../../../../shared/pipes/estado-solicitud.pipe';

@Component({
  selector: 'app-solicitud-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, EstadoSolicitudPipe],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead class="bg-gray-100 border-b border-gray-200">
          <tr>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Cliente</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha Solicitud</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</th>
            <th class="py-3 px-6 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr *ngFor="let solicitud of solicitudes" class="hover:bg-gray-50">
            <td class="py-4 px-6 text-sm text-gray-900">{{ solicitud.id }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ solicitud.cliente }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ solicitud.email_cliente }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ solicitud.fecha_solicitud | date:'shortDate' }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">
              <span [ngClass]="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                'bg-blue-100 text-blue-800': solicitud.estado === 'Abierta',
                'bg-yellow-100 text-yellow-800': solicitud.estado === 'En Proceso',
                'bg-green-100 text-green-800': solicitud.estado === 'Cerrada',
                'bg-red-100 text-red-800': solicitud.estado === 'Cancelada'
              }">
                {{ solicitud.estado | estadoSolicitud }}
              </span>
            </td>
            <td class="py-4 px-6 text-center text-sm font-medium">
              <div class="flex justify-center space-x-2">
                <button
                  [routerLink]="['/solicitudes', solicitud.id]"
                  class="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-gray-200"
                  title="Ver Detalle"
                >
                  <fa-icon [icon]="faEye" size="lg"></fa-icon>
                </button>
                <button
                  [routerLink]="['/solicitudes/edit', solicitud.id]"
                  class="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-gray-200"
                  title="Editar Solicitud"
                >
                  <fa-icon [icon]="faEdit" size="lg"></fa-icon>
                </button>
                <button
                  (click)="deleteSolicitud.emit(solicitud.id!)"
                  class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-gray-200"
                  title="Eliminar Solicitud"
                >
                  <fa-icon [icon]="faTrash" size="lg"></fa-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class SolicitudListComponent {
  @Input() solicitudes: Solicitud[] = [];
  @Output() deleteSolicitud = new EventEmitter<number>();

  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;

  constructor() {}
}
