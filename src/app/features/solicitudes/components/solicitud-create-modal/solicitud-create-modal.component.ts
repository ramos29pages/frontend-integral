import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalFormSolicitudComponent } from '../modal-form-solicitud/modal-form-solicitud.component';
import { Solicitud } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-solicitud-create-modal',
  standalone: true,
  imports: [CommonModule, ModalFormSolicitudComponent],
  template: `
    <dialog id="modal-crear-solicitud" class="modal" [open]="open">
      <div class="modal-box max-w-4xl w-full">
        <app-modal-form-solicitud
          [loading]="loading"
          (save)="onCreate($event)"
          (cancel)="onCancel()"
        />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="onCancel()">Cerrar</button>
      </form>
    </dialog>
  `
})
export class SolicitudCreateModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Output() create = new EventEmitter<Solicitud>();
  @Output() cancel = new EventEmitter<void>();

  onCreate(data: Solicitud) {
    this.create.emit(data);
  }

  onCancel() {
    this.cancel.emit();
  }
}
