import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-boton-crear-solicitud',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button class="btn btn-primary btn-sm" (click)="crear.emit()">
      <fa-icon [icon]="faPlus"></fa-icon> Crear solicitud
    </button>
  `
})
export class BotonCrearSolicitudComponent {
  @Output() crear = new EventEmitter<void>();
  faPlus = faPlus;
}
