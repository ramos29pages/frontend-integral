import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitudes-filtros',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        class="input input-sm input-bordered w-full md:w-auto"
        placeholder="Buscar"
        [value]="term"
        (input)="onTermChange($any($event.target).value)"
      />
      <select
        class="select select-sm select-bordered w-full md:w-auto"
        [value]="estado"
        (change)="onEstadoChange($any($event.target).value)"
      >
        <option value="">Todos</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobado">Aprobado</option>
        <option value="rechazado">Rechazado</option>
      </select>
    </div>
  `
})
export class SolicitudesFiltrosComponent {
  @Input() term = '';
  @Input() estado = '';
  @Output() termChange = new EventEmitter<string>();
  @Output() estadoChange = new EventEmitter<string>();

  onTermChange(value: string) {
    this.termChange.emit(value);
  }

  onEstadoChange(value: string) {
    this.estadoChange.emit(value);
  }
}
