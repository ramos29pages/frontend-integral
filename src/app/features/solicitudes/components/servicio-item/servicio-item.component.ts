import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../../core/models/servicio.model';
import { EstadoServicioPipe } from '../../../../shared/pipes/estado-servicio.pipe';

@Component({
  selector: 'app-servicio-item',
  standalone: true,
  imports: [CommonModule, EstadoServicioPipe],
  template: `
    <div class="border p-4 rounded-md bg-white shadow-sm mb-4">
      <h4 class="text-lg font-medium text-gray-700 mb-2">Servicio: {{ servicio.nombre_servicio }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
        <p><span class="font-semibold">ID Servicio:</span> {{ servicio.id_servicio || 'Nuevo' }}</p>
        <p><span class="font-semibold">Fecha Reunión:</span> {{ servicio.fecha_reunion | date:'medium' }}</p>
        <p><span class="font-semibold">Estado:</span>
          <span [ngClass]="{
            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
            'bg-blue-100 text-blue-800': servicio.estado_servicio === 'Pendiente',
            'bg-green-100 text-green-800': servicio.estado_servicio === 'Aprobado',
            'bg-red-100 text-red-800': servicio.estado_servicio === 'Rechazado',
            'bg-purple-100 text-purple-800': servicio.estado_servicio === 'Vencido'
          }">
            {{ servicio.estado_servicio | estadoServicio }}
          </span>
        </p>
        <p *ngIf="servicio.estado_servicio === 'Aprobado' && servicio.costo_estimado !== null">
          <span class="font-semibold">Costo Estimado:</span> {{ servicio.costo_estimado | currency:'USD':'symbol':'1.2-2' }}
        </p>
        <p class="md:col-span-2"><span class="font-semibold">Comentarios:</span> {{ servicio.comentarios || 'N/A' }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class ServicioItemComponent {
  @Input() servicio!: Servicio; // Non-null assertion, expect parent to pass it
}
