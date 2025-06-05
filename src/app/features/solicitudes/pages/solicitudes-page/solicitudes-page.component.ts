// solicitudes-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { Solicitud, PagedResponse } from '../../../../core/models/solicitud.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Importar los componentes separados
import { CrearSolicitudButtonComponent } from '../../components/boton-crear-solicitud/boton-crear-solicitud.component';
import { ModalCreacionComponent } from '../../components/solicitud-create-modal/solicitud-create-modal.component';
import { FiltrosComponent } from '../../components/solicitudes-filtros/solicitudes-filtros.component';
import { TablaSolicitudesComponent } from '../../components/solicitudes-tabla/solicitudes-tabla.component';
import { PaginacionComponent } from '../../components/solicitudes-paginacion/solicitudes-paginacion.component';

@Component({
  selector: 'app-solicitudes-page',
  standalone: true,
  imports: [
    CommonModule,
    CrearSolicitudButtonComponent,
    ModalCreacionComponent,
    FiltrosComponent,
    TablaSolicitudesComponent,
    PaginacionComponent
  ],
  template: `
    <div class="p-4">
      <!-- Botón crear solicitud -->
      <app-crear-solicitud-button
        [mostrandoFormulario]="mostrarFormularioCreacion"
        (abrirModal)="abrirModalCreacion()">
      </app-crear-solicitud-button>

      <!-- Modal de creación -->
      <app-modal-creacion
        [mostrar]="mostrarFormularioCreacion"
        [cargando]="cargandoCreacion"
        (cerrar)="cerrarModal()"
        (crear)="onCrearSolicitud($event)">
      </app-modal-creacion>

      <!-- Filtros -->
      <app-filtros
        [estados]="estados"
        [filtros]="filtros"
        (aplicarFiltros)="aplicarFiltros($event)"
        (limpiarFiltros)="limpiarFiltros()">
      </app-filtros>

      <!-- Tabla de solicitudes -->
      <app-tabla-solicitudes
        [solicitudes]="solicitudes"
        [cargando]="cargando"
        (verDetalle)="verDetalle($event)"
        (editarSolicitud)="editarSolicitud($event)"
        (eliminarSolicitud)="confirmarEliminar($event)">
      </app-tabla-solicitudes>

      <!-- Paginación -->
      <app-paginacion
        *ngIf="totalPaginas > 1"
        [paginaActual]="paginaActual"
        [totalPaginas]="totalPaginas"
        (cambiarPagina)="cambiarPagina($event)">
      </app-paginacion>
    </div>
  `
})
export class SolicitudesPageComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  estados = ['Abierta', 'En Proceso', 'Cerrada', 'Cancelada'];
  filtros = {
    estado: '',
    cliente: '',
  };
  paginaActual = 1;
  totalPaginas = 0;
  totalRegistros = 0;
  cargando = false;
  mostrarFormularioCreacion = false;
  cargandoCreacion = false;

  constructor(
    private solicitudService: SolicitudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;

    const params = {
      page: this.paginaActual,
      size: 10,
      ...this.filtros
    };

    this.solicitudService.getSolicitudes(params).subscribe({
      next: (response: PagedResponse<Solicitud>) => {
        this.solicitudes = response.content;
        this.totalPaginas = response.totalPages;
        this.totalRegistros = response.totalElements;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  abrirModalCreacion(): void {
    this.mostrarFormularioCreacion = true;
  }

  cerrarModal(): void {
    this.mostrarFormularioCreacion = false;
  }

  onCrearSolicitud(solicitudData: any): void {
    this.cargandoCreacion = true;

    const nuevaSolicitud: Solicitud = {
      id: 0,
      cliente: solicitudData.cliente,
      email_cliente: solicitudData.email_cliente,
      fecha_solicitud: new Date().toISOString(),
      estado: 'Abierta',
      observaciones: solicitudData.observaciones,
      fecha_ultima_modificacion: new Date().toISOString(),
      servicios: solicitudData.servicios.map((s: any) => ({
        id_servicio: 0,
        id_solicitud: 0,
        nombre_servicio: s.nombre_servicio,
        fecha_reunion: s.fecha_reunion,
        estado_servicio: 'Pendiente',
        comentarios: s.comentarios,
        costo_estimado: s.costo_estimado
      }))
    };

    this.solicitudService.createSolicitud(nuevaSolicitud).subscribe({
      next: (response) => {
        this.cargandoCreacion = false;
        this.cerrarModal();
        this.cargarSolicitudes();

        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Solicitud creada exitosamente',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.cargandoCreacion = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al crear la solicitud'
        });
      }
    });
  }

  aplicarFiltros(filtros: any): void {
    this.filtros = filtros;
    this.paginaActual = 1;
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.filtros = { estado: '', cliente: '' };
    this.paginaActual = 1;
    this.cargarSolicitudes();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarSolicitudes();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/solicitudes', id]);
  }

  editarSolicitud(id: number): void {
    this.router.navigate(['/solicitudes/editar', id]);
  }

  confirmarEliminar(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarSolicitud(id);
      }
    });
  }

  eliminarSolicitud(id: number): void {
    this.solicitudService.deleteSolicitud(id).subscribe({
      next: () => {
        this.cargarSolicitudes();
        Swal.fire('Eliminado', 'La solicitud ha sido eliminada', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar la solicitud', 'error');
      }
    });
  }
}
