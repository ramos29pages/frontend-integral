import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../models/servicio.model';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = `${API_BASE_URL}`; // Base URL, endpoints will be more specific

  constructor(private http: HttpClient) { }

  getServiciosBySolicitudId(solicitudId: number): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/solicitudes/${solicitudId}/servicios`);
  }

  addServicioToSolicitud(solicitudId: number, servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.apiUrl}/solicitudes/${solicitudId}/servicios`, servicio);
  }

  updateServicio(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/servicios/${id}`, servicio);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/servicios/${id}`);
  }
}
