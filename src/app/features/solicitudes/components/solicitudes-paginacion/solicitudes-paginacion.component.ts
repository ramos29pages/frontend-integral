import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitudes-paginacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="join">
      <button
        class="join-item btn btn-sm"
        [disabled]="page <= 1"
        (click)="onChange(page - 1)"
      >
        «
      </button>
      <button class="join-item btn btn-sm">Página {{ page }}</button>
      <button
        class="join-item btn btn-sm"
        [disabled]="page >= totalPages"
        (click)="onChange(page + 1)"
      >
        »
      </button>
    </div>
  `
})
export class SolicitudesPaginacionComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  onChange(p: number) {
    this.pageChange.emit(p);
  }
}
