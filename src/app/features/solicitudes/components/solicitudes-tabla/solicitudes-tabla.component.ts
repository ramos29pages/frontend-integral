// components/tabla-solicitudes/tabla-solicitudes.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Solicitud } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-tabla-solicitudes',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div *ngIf="!cargando && solicitudes.length > 0" class="bg-white rounded shadow overflow-auto">
      <table class="w-full table-auto">
        <thead class="bg-blue-50">
          <tr>
            <th class="p-3 text-left text-blue-800 font-semibold"></th>
            <th class="p-3 text-left text-blue-800 font-semibold">Cliente</th>
            <th class="p-3 text-left text-blue-800 font-semibold">Email</th>
            <th class="p-3 text-left text-blue-800 font-semibold">Estado</th>
            <th class="p-3 text-left text-blue-800 font-semibold">Fecha</th>
            <th class="p-3 text-left text-blue-800 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let solicitud of solicitudes" class="border-b hover:bg-gray-50 transition-colors">
            <td class="p-3">
              <img
                [src]="'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg'"
                alt="Avatar"
                class="w-10 h-10 rounded-full object-cover"
                [class.opacity-50]="!solicitud.cliente">
            </td>
            <td class="p-3 font-medium">{{ solicitud.cliente || 'Sin nombre' }}</td>
            <td class="p-3">{{ solicitud.email_cliente }}</td>
            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                [class.bg-green-100.text-green-800]="solicitud.estado === 'Abierta'"
                [class.bg-yellow-100.text-yellow-800]="solicitud.estado === 'En Proceso'"
                [class.bg-blue-100.text-blue-800]="solicitud.estado === 'Cerrada'"
                [class.bg-red-100.text-red-800]="solicitud.estado === 'Cancelada'">
                {{ solicitud.estado }}
              </span>
            </td>
            <td class="p-3">{{ solicitud.fecha_solicitud | date }}</td>
            <td class="p-3">
              <div class="flex space-x-2">
                <button
                  (click)="onVerDetalle(solicitud.id)"
                  class="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  title="Ver detalle">
                  <fa-icon [icon]="faEye"></fa-icon>
                </button>
                <button
                  (click)="onEditarSolicitud(solicitud.id)"
                  class="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                  title="Editar">
                  <fa-icon [icon]="faEdit"></fa-icon>
                </button>
                <button
                  (click)="onEliminarSolicitud(solicitud.id)"
                  class="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                  title="Eliminar">
                  <fa-icon [icon]="faTrash"></fa-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading state -->
    <div *ngIf="cargando" class="bg-white rounded shadow p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Cargando solicitudes...</p>
    </div>

    <!-- Empty state -->
    <div *ngIf="!cargando && solicitudes.length === 0" class="bg-white rounded shadow p-8 text-center">
      <p class="text-gray-600">No se encontraron solicitudes</p>
    </div>
  `
})
export class TablaSolicitudesComponent {
  @Input() solicitudes: Solicitud[] = [];
  @Input() cargando = false;
  @Output() verDetalle = new EventEmitter<number>();
  @Output() editarSolicitud = new EventEmitter<number>();
  @Output() eliminarSolicitud = new EventEmitter<number>();

  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;

  onVerDetalle(id: number): void {
    this.verDetalle.emit(id);
  }

  onEditarSolicitud(id: number): void {
    this.editarSolicitud.emit(id);
  }

  onEliminarSolicitud(id: number): void {
    this.eliminarSolicitud.emit(id);
  }
}
