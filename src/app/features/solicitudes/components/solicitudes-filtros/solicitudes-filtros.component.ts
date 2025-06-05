// components/filtros/filtros.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <h2 class="text-lg font-semibold mb-2">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Cliente"
          [(ngModel)]="filtrosLocal.cliente"
          class="p-2 border rounded w-full focus:ring-2 focus:outline-none focus:ring-blue-300" />

        <select
          [(ngModel)]="filtrosLocal.estado"
          class="p-2 border rounded w-full focus:ring-2 focus:outline-none focus:ring-blue-300">
          <option value="">Todos los estados</option>
          <option *ngFor="let estado of estados" [value]="estado">{{ estado }}</option>
        </select>

        <div class="flex gap-2">
          <button
            (click)="onAplicarFiltros()"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex-1 flex items-center justify-center gap-2">
            <i class="fas fa-search"></i> Buscar
          </button>
          <button
            (click)="onLimpiarFiltros()"
            class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <i class="fas fa-eraser"></i> Limpiar
          </button>
        </div>
      </div>
    </div>
  `
})
export class FiltrosComponent implements OnInit {
  @Input() estados: string[] = [];
  @Input() filtros: any = { estado: '', cliente: '' };
  @Output() aplicarFiltros = new EventEmitter<any>();
  @Output() limpiarFiltros = new EventEmitter<void>();

  filtrosLocal: any = { estado: '', cliente: '' };

  ngOnInit(): void {
    this.filtrosLocal = { ...this.filtros };
  }

  onAplicarFiltros(): void {
    this.aplicarFiltros.emit(this.filtrosLocal);
  }

  onLimpiarFiltros(): void {
    this.filtrosLocal = { estado: '', cliente: '' };
    this.limpiarFiltros.emit();
  }
}
