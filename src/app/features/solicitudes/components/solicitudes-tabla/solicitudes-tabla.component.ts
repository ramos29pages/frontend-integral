import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Solicitud } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-solicitudes-tabla',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let solicitud of solicitudes">
            <td>{{ solicitud.fecha_solicitud | date }}</td>
            <td>{{ solicitud.email_cliente }}</td>
          <td class="p-3">
            <span class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              [class.bg-green-100.text-green-800]="solicitud.estado === 'Abierta'"
              [class.bg-yellow-100.text-yellow-800]="solicitud.estado === 'En Proceso'"
              [class.bg-blue-100.text-blue-800]="solicitud.estado === 'Cerrada'"
              [class.bg-red-100.text-red-800]="solicitud.estado === 'Cancelada'">
              {{ solicitud.estado }}
            </span>
          </td>
            <td>
              <button class="btn btn-xs btn-outline" (click)="ver.emit(solicitud)">Ver</button>
              <button class="btn btn-xs btn-outline" (click)="editar.emit(solicitud)">Editar</button>
              <button class="btn btn-xs btn-outline btn-error" (click)="eliminar.emit(solicitud)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class SolicitudesTablaComponent {
  @Input() solicitudes: Solicitud[] = [];
  @Output() ver = new EventEmitter<Solicitud>();
  @Output() editar = new EventEmitter<Solicitud>();
  @Output() eliminar = new EventEmitter<Solicitud>();
}
