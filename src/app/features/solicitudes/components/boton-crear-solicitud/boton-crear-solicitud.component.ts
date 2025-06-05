// components/crear-solicitud-button/crear-solicitud-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-crear-solicitud-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="flex justify-end mb-4">
      <button
        (click)="onAbrirModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
        <fa-icon [icon]="faPlus"></fa-icon>
        {{ mostrandoFormulario ? 'Ocultar Formulario' : 'Crear Nueva Solicitud' }}
      </button>
    </div>
  `
})
export class CrearSolicitudButtonComponent {
  @Input() mostrandoFormulario = false;
  @Output() abrirModal = new EventEmitter<void>();

  faPlus = faPlus;

  onAbrirModal(): void {
    this.abrirModal.emit();
  }
}
