import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div *ngIf="loading" class="flex items-center justify-center p-4">
      <fa-icon [icon]="faSpinner" class="fa-spin text-blue-500 text-3xl"></fa-icon>
      <p class="ml-2 text-lg text-gray-700">{{ message }}</p>
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() loading: boolean = false;
  @Input() message: string = 'Cargando...';
  faSpinner = faSpinner;
}
