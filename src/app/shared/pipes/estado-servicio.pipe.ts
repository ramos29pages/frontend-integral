import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoServicio',
  standalone: true
})
export class EstadoServicioPipe implements PipeTransform {
  transform(estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Vencido'): string {
    const estados: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'Aprobado': 'Aprobado',
      'Rechazado': 'Rechazado',
      'Vencido': 'Vencido'
    };
    return estados[estado] || estado;
  }
}
