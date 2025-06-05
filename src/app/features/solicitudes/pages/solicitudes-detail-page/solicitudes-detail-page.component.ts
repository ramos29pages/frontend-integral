import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../../../core/services/solicitud.service';
// import { ServicioService } from '../../../../core/services/servicio.service'; // No longer needed for fetching services here
import { Solicitud } from '../../../../core/models/solicitud.model';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { SolicitudDetailComponent } from '../../components/solicitud-detail/solicitud-detail.component'; // Import the component
import { Servicio } from '../../../../core/models/servicio.model'; // Import the Service model

@Component({
  selector: 'app-solicitud-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    FontAwesomeModule,
    SolicitudDetailComponent // Import the detail component
  ],
  template: `
    <div class="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-gray-800">Detalle de Solicitud</h2>
        <div class="flex space-x-3">
          <button
            [routerLink]="['/solicitudes/editar', solicitud.id]"
            class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md flex items-center"
            *ngIf="solicitud && hasPendingServices(solicitud)"
          >
            <fa-icon [icon]="faEdit" class="mr-2"></fa-icon>
            Editar
          </button>
          <button
            (click)="deleteSolicitud()"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center"
            *ngIf="solicitud && !hasApprovedServices(solicitud)"
          >
            <fa-icon [icon]="faTrash" class="mr-2"></fa-icon>
            Eliminar
          </button>
          <button
            routerLink="/solicitudes"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md flex items-center"
          >
            <fa-icon [icon]="faArrowLeft" class="mr-2"></fa-icon>
            Volver al listado
          </button>
        </div>
      </div>

      <app-loading-spinner [loading]="isLoading"></app-loading-spinner>

      <app-solicitud-detail
        *ngIf="!isLoading && solicitud"
        [solicitud]="solicitud"
      ></app-solicitud-detail>
    </div>
  `,
  styles: []
})
export class SolicitudDetailPageComponent implements OnInit {
  solicitud: Solicitud | null = null;
  solicitudId: number | null = null;
  isLoading = true;

  faEdit = faEdit;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    // private servicioService: ServicioService // Removed: Services are loaded with the request now
  ) { }

  ngOnInit(): void {
    this.solicitudId = this.route.snapshot.params['id'];
    if (this.solicitudId) {
      this.loadSolicitudDetail();
    } else {
      Swal.fire('Error', 'ID de solicitud no proporcionado.', 'error');
      this.router.navigate(['/solicitudes']);
    }
  }

  loadSolicitudDetail(): void {
    this.isLoading = true;
    if (this.solicitudId) {
      this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
        next: (solicitudData: Solicitud) => {
          // Services are already loaded within solicitudData due to joinedload in backend
          this.solicitud = solicitudData;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading solicitud detail:', err);
          Swal.fire('Error', 'No se pudo cargar la solicitud.', 'error');
          this.router.navigate(['/solicitudes']);
          this.isLoading = false;
        }
      });
    }
  }

  async deleteSolicitud(): Promise<void> {
    if (!this.solicitud || !this.solicitud.id) return;

    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrás revertir esto! La solicitud y todos sus servicios serán eliminados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.solicitudService.deleteSolicitud(this.solicitud.id).subscribe({
        next: () => {
          Swal.fire(
            '¡Eliminada!',
            'La solicitud ha sido eliminada.',
            'success'
          );
          this.router.navigate(['/solicitudes']); // Redirect to list after deletion
        },
        error: (err) => {
          console.error('Error deleting solicitud:', err);
          let errorMessage = 'No se pudo eliminar la solicitud.';
          if (err.status === 400 && err.error && err.error.detail) { // Use err.error.detail for FastAPI errors
            errorMessage = err.error.detail;
          } else if (err.status === 404) {
            errorMessage = 'La solicitud no fue encontrada.';
          }
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    }
  }

  // Helper to check business rules for UI display
  hasPendingServices(solicitud: Solicitud): boolean {
    return solicitud.servicios?.some(s => s.estado_servicio === 'Pendiente') || false;
  }

  hasApprovedServices(solicitud: Solicitud): boolean {
    return solicitud.servicios?.some(s => s.estado_servicio === 'Aprobado') || false;
  }
}
