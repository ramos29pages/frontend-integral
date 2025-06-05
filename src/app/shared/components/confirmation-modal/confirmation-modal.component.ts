import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    `,
  styles: []
})
export class ConfirmationModalComponent {
  // This component will be more of a service wrapper around Swal.fire()
  // No direct template rendering. The parent component will call a method on this 'service' or trigger an event.

  constructor() { }

  /**
   * Shows a confirmation dialog using SweetAlert2.
   * @param title The title of the modal.
   * @param text The main text content of the modal.
   * @param confirmButtonText The text for the confirm button.
   * @param icon The icon for the modal (e.g., 'warning', 'info', 'success', 'error').
   * @returns A promise that resolves to true if confirmed, false otherwise.
   */
  async confirm(
    title: string = 'Confirmación',
    text: string = '¿Está seguro de realizar esta acción?',
    confirmButtonText: string = 'Confirmar',
    icon: 'warning' | 'info' | 'success' | 'error' | 'question' = 'warning'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  }
}
