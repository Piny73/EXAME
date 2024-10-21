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
  timesheets: TimeSheetDTO[] = [];
  loading = false; // Indicatore di caricamento
  errorMessage = ''; // Messaggio di errore

  @Output() timesheetSelected = new EventEmitter<TimeSheetDTO>(); // Output per emettere evento di selezione

  constructor(
    private timesheetService: TimesheetService,
    private activityService: ActivityService,
    private userService: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadTimesheets();
  }

  // Carica i timesheet dal servizio
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
          // Mappa i dati aggiungendo la descrizione dell'attività e il nome del proprietario
          this.timesheets = timesheets.map(timesheet => ({
            ...timesheet,
            activityDescription: activities.find(a => a.id === timesheet.activityId)?.description || 'N/A',
            ownerName: users.find(u => u.id === timesheet.userId)?.name || 'N/A'
          }));
        },
        error => {
          this.errorMessage = 'Errore durante il caricamento dei timesheet.';
          console.error(this.errorMessage, error);
        }
      );
  }

  // Seleziona una timesheet ed emette l'evento
  selectTimesheet(timesheet: TimeSheetDTO): void {
    this.timesheetSelected.emit(timesheet); // Emette l'evento di selezione
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
      userId: null,
      activityId: null,
      dtstart: null,
      dtend: null,
      detail: '',
      hoursPerDay: {}
    };
  }
}
