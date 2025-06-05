// components/paginacion/paginacion.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-4 flex justify-center items-center gap-2">
      <button
        (click)="onCambiarPagina(paginaActual - 1)"
        [disabled]="paginaActual === 1"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        Anterior
      </button>

      <span class="px-3 py-1 text-gray-700">
        Página {{ paginaActual }} de {{ totalPaginas }}
      </span>

      <button
        (click)="onCambiarPagina(paginaActual + 1)"
        [disabled]="paginaActual === totalPaginas"
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        Siguiente
      </button>
    </div>
  `
})
export class PaginacionComponent {
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Output() cambiarPagina = new EventEmitter<number>();

  onCambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.cambiarPagina.emit(nuevaPagina);
    }
  }
}
