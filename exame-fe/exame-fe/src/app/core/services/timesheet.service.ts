// src/app/services/timesheet.service.ts

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TimeSheet, TimeSheetDTO } from '../models/timesheet.model';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  private readonly endpoint = 'timesheet';
  private timesheetList: TimeSheet[] = [];
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

  // Metodo per aggiornare un'attività esistente
  update(timesheet:TimeSheet): Observable<TimeSheet> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.put<TimeSheet>(`${this.endpoint}/${timesheet.id}`, timesheet, headers).pipe(
      tap(response => {
        const index = this.timesheetList.findIndex(t => t.id === timesheet.id);
        if (index > -1) {
          this.timesheetList[index] = response; // Aggiorna la cache
        }
      }),
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
  fill(): Observable<TimeSheet[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.apiService.get<TimeSheet[]>(this.endpoint, headers).pipe(
      map((timesheets: TimeSheet[]) => {
        return timesheets.map(timesheet => ({
          ...timesheet,
          dtstart: timesheet.dtstart ? new Date(timesheet.dtstart) : null,
          dtend: timesheet.dtend ? new Date(timesheet.dtend) : null,
          workDate: timesheet.workDate ? new Date(timesheet.workDate) : null
        }))
      }),
      tap((response: TimeSheet[]) => console.log('Timesheets loaded:', response)),
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