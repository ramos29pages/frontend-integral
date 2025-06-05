import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoSolicitud',
  standalone: true
})
export class EstadoSolicitudPipe implements PipeTransform {
  transform(estado: 'Abierta' | 'En Proceso' | 'Cerrada' | 'Cancelada'): string {
    const estados: { [key: string]: string } = {
      'Abierta': 'Abierta',
      'En Proceso': 'En Proceso',
      'Cerrada': 'Cerrada',
      'Cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }
}
