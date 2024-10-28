// src/app/components/timesheet-list/timesheet-list.component.ts

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { TimesheetService } from '../../core/services/timesheet.service';
import { TimeSheetDTO } from '../../core/models/timesheet.model';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetFormComponent } from './timesheet-form/timesheet-form.component';

interface TimeSheetData {
  loading: boolean;
  timesheetList: TimeSheetDTO[] | null;
  error: string | null;
}

@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent implements OnInit {
  timesheetData$!: Observable<TimeSheetData>; // Observable per dati caricati
  selectedTimesheet: TimeSheetDTO | null = null;

  @Output() timesheetSelected = new EventEmitter<TimeSheetDTO>();

  constructor(
    private timesheetService: TimesheetService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadTimesheets(); // Carica i dati al montaggio del componente
  }

  loadTimesheets(): void {
    this.timesheetData$ = this.timesheetService.fill().pipe(
      map((timesheets: TimeSheetDTO[]) => ({
        loading: false,
        timesheetList: timesheets.filter(timesheet => timesheet.canceled !== 1), // Esclude timesheet cancellate
        error: null
      })),
      catchError(error => {
        console.error('Errore durante il caricamento dei timesheet:', error);
        return of({
          loading: false,
          timesheetList: null,
          error: 'Si è verificato un errore nel caricamento dei timesheet.'
        });
      }),
      startWith({ loading: true, timesheetList: null, error: null })
    );
  }

  selectTimesheet(timesheet: TimeSheetDTO): void {
    this.selectedTimesheet = timesheet;
    this.timesheetSelected.emit(timesheet);
    console.log('Timesheet selezionato:', timesheet);
  }

  openTimesheetModal(timesheet?: TimeSheetDTO): void {
    const modalRef = this.modalService.open(TimesheetFormComponent, { size: 'lg' });
    modalRef.componentInstance.timesheet = timesheet ? { ...timesheet } : this.createEmptyTimeSheet();

    modalRef.componentInstance.reload.subscribe((shouldReload: boolean) => {
      if (shouldReload) {
        this.loadTimesheets(); // Ricarica i dati dopo il salvataggio/modifica
      }
    });
  }

  private createEmptyTimeSheet(): TimeSheetDTO {
    return {
      id: 0,
      userid: null,
      activityid: null,
      dtstart: null,
      dtend: null,
      detail: '',
      hoursWorked: 0,
      workDate: null,
      canceled: 0 // Assicurati che questo campo esista e sia gestito
    };
  }
}
