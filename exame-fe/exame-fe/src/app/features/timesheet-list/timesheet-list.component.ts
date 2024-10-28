// src/app/components/timesheet-list/timesheet-list.component.ts

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { TimesheetService } from '../../core/services/timesheet.service';
import { TimeSheetDTO } from '../../core/models/timesheet.model';
import { ActivityService } from '../../core/services/activity.service';
import { UserService } from '../../core/services/user.service';
import { finalize, forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetFormComponent } from './timesheet-form/timesheet-form.component';

@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent implements OnInit {
  timesheets: TimeSheetDTO[] = []; // Lista dei timesheet
  loading: boolean = false; // Indicatore di caricamento
  errorMessage: string = ''; // Messaggio di errore
  selectedTimesheet: TimeSheetDTO | null = null; // Proprietà per tenere traccia del timesheet selezionato

  @Output() timesheetSelected = new EventEmitter<TimeSheetDTO>(); // Output per emettere evento di selezione

  constructor(
    private timesheetService: TimesheetService,
    private activityService: ActivityService,
    private userService: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadTimesheets(); // Carica i timesheet al caricamento del componente
  }

  // Carica i timesheet dal servizio, con attività e utenti associati
  private loadTimesheets(): void {
    this.loading = true;
    this.errorMessage = '';

    // Carica i timesheet, le attività e gli utenti contemporaneamente
    forkJoin({
      timesheets: this.timesheetService.getTimesheets(),
      activities: this.activityService.fill(),
      users: this.userService.getAllUsers()
    })
      .pipe(finalize(() => (this.loading = false))) // Disabilita l'indicatore di caricamento alla fine della richiesta
      .subscribe(
        ({ timesheets, activities, users }) => {
          // Mappa i dati aggiungendo la descrizione dell'attività, il nome del proprietario, le ore lavorate e la data di lavoro
          this.timesheets = timesheets.map(timesheet => ({
            ...timesheet,
            activityDescription: activities.find(a => a.id === timesheet.activityid)?.description || 'N/A',
            ownerName: users.find(u => u.id === timesheet.userid)?.name || 'N/A',
            hoursWorked: timesheet.hoursWorked, // Ore lavorate
            workDate: timesheet.workDate // Data del giorno lavorato
          }));
        },
        error => {
          this.errorMessage = 'Errore durante il caricamento dei timesheet.';
          console.error(this.errorMessage, error);
        }
      );
  }

  // Gestisce la selezione di un timesheet ed emette l'evento
  selectTimesheet(timesheet: TimeSheetDTO): void {
    this.selectedTimesheet = timesheet; // Aggiorna il timesheet selezionato
    this.timesheetSelected.emit(timesheet);
    console.log('Timesheet selezionato:', timesheet);
  }

  // Apre il modal per aggiungere o modificare un timesheet
  openTimesheetModal(timesheet?: TimeSheetDTO): void {
    const modalRef = this.modalService.open(TimesheetFormComponent, { size: 'lg' });
    modalRef.componentInstance.timesheet = timesheet ? { ...timesheet } : this.createEmptyTimeSheet();

    // Ricarica la lista dei timesheet quando il modal è chiuso
    modalRef.componentInstance.reload.subscribe((shouldReload: boolean) => {
      if (shouldReload) {
        this.loadTimesheets(); // Ricarica i timesheet dopo il salvataggio/modifica
      }
    });
  }

  // Crea un nuovo timesheet vuoto
  private createEmptyTimeSheet(): TimeSheetDTO {
    return {
      id: 0,
      userid: null,
      activityid: null,
      dtstart: null,
      dtend: null,
      detail: '',
      hoursWorked: 0, // Imposta il valore di default per le ore lavorate
      workDate: null // Imposta il valore di default per la data del giorno lavorato
    };
  }
}
