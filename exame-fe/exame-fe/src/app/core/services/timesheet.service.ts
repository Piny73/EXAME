// src/app/services/timesheet.service.ts

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TimeSheetDTO } from '../models/timesheet.model';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private readonly endpoint = 'timesheet';

  constructor(private apiService: ApiService) {}

  /**
   * Ottiene tutti i Timesheet.
   * @returns Un Observable che emette un array di TimeSheetDTO.
   */
  getTimesheets(): Observable<TimeSheetDTO[]> {
    return this.apiService.get<TimeSheetDTO[]>(this.endpoint).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Ottiene un singolo Timesheet tramite ID.
   * @param id L'ID del Timesheet.
   * @returns Un Observable che emette il TimeSheetDTO corrispondente.
   */
  getTimesheetById(id: number): Observable<TimeSheetDTO> {
    return this.apiService.get<TimeSheetDTO>(`${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Salva un nuovo Timesheet.
   * @param timesheetData I dati del Timesheet da salvare.
   * @returns Un Observable che emette il TimeSheetDTO creato.
   */
  save(timesheetData: TimeSheetDTO): Observable<TimeSheetDTO> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.post<TimeSheetDTO>(this.endpoint, timesheetData, headers).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Aggiorna un Timesheet esistente.
   * @param timesheetData I dati del Timesheet da aggiornare.
   * @returns Un Observable che emette il TimeSheetDTO aggiornato.
   */
  updateTimesheet(timesheetData: TimeSheetDTO): Observable<TimeSheetDTO> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.put<TimeSheetDTO>(`${this.endpoint}/${timesheetData.id}`, timesheetData, headers).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un Timesheet tramite ID.
   * @param id L'ID del Timesheet da eliminare.
   * @returns Un Observable che completa senza emettere valori.
   */
  deleteTimesheet(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Carica tutti i Timesheet, convertendo i campi data in oggetti `Date`.
   * @returns Un Observable che emette un array di TimeSheetDTO.
   */
  fill(): Observable<TimeSheetDTO[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.get<TimeSheetDTO[]>(this.endpoint, headers).pipe(
      map((timesheets: TimeSheetDTO[]) => 
        timesheets.map(timesheet => ({
          ...timesheet,
          dtstart: timesheet.dtstart ? new Date(timesheet.dtstart) : null,
          dtend: timesheet.dtend ? new Date(timesheet.dtend) : null,
          workDate: timesheet.workDate ? new Date(timesheet.workDate) : null
        }))
      ),
      tap((response: TimeSheetDTO[]) => console.log('Timesheets loaded:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Metodo di gestione degli errori
   * @param error L'errore occorso.
   * @returns Un Observable che emette un errore.
   */
  private handleError(error: any): Observable<never> {
    console.error('Errore durante la chiamata HTTP:', error);
    return throwError(() => new Error('Errore nella comunicazione con il server.'));
  }
}
