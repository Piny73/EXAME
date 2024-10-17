import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../core/services/timesheet.service';
import { TimeSheetDTO } from '../../core/models/timesheet.model';
import { finalize } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Importa NgbModal per il modal
import { TimesheetFormComponent } from '../timesheet-list/timesheet-form/timesheet-form.component'; // Importa il TimesheetFormComponent

@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent implements OnInit {
  timesheets: TimeSheetDTO[] = [];
  showDeleteDialog = false;
  timesheetToDelete: TimeSheetDTO | null = null;
  loading = false; // Indicatore di caricamento
  errorMessage = ''; // Messaggio di errore

  constructor(
    private timesheetService: TimesheetService,
    private modalService: NgbModal // Inietta NgbModal per gestire il modal
  ) {}

  ngOnInit(): void {
    this.loadTimesheets();
  }

  // Carica i timesheet dal servizio
  loadTimesheets(): void {
    this.loading = true;
    this.errorMessage = '';
    this.timesheetService.getTimesheets().pipe(
      finalize(() => this.loading = false) // Disabilita l'indicatore di caricamento alla fine della richiesta
    ).subscribe(
      (data: TimeSheetDTO[]) => {
        this.timesheets = data;
      },
      (error: any) => {
        this.errorMessage = 'Errore durante il caricamento dei timesheet.';
        console.error(this.errorMessage, error);
      }
    );
  }

  // Apre il modal per aggiungere o modificare un timesheet
  openTimesheetModal(timesheet?: TimeSheetDTO): void {
    const modalRef = this.modalService.open(TimesheetFormComponent, { size: 'lg' });
  
    // Se viene passato un timesheet, modificalo; altrimenti, crea un nuovo timesheet
    if (timesheet) {
      modalRef.componentInstance.timesheet = { ...timesheet }; // Clona il timesheet per evitare modifiche dirette
    } else {
      // Inizializza un nuovo timesheet vuoto
      modalRef.componentInstance.timesheet = {
        id: null,
        userid: null,
        activityid: null,
        dtstart: '',
        dtend: '',
        detail: ''
      };
    }
  
    // Ricarica la lista dei timesheet quando il modal è chiuso
    modalRef.componentInstance.reload.subscribe((shouldReload: boolean) => {
      if (shouldReload) {
        this.loadTimesheets(); // Ricarica i timesheet dopo il salvataggio/modifica
      }
    });
  }
  

  // Conferma l'eliminazione di un timesheet
  confirmDelete(timesheet: TimeSheetDTO): void {
    this.timesheetToDelete = timesheet;
    this.showDeleteDialog = true;
  }

  // Elimina un timesheet confermato
  deleteTimesheet(): void {
    if (this.timesheetToDelete) {
      this.loading = true;
      this.errorMessage = '';
      this.timesheetService.deleteTimesheet(this.timesheetToDelete.id).pipe(
        finalize(() => this.loading = false)
      ).subscribe(
        () => {
          this.loadTimesheets();  // Ricarica i timesheet dopo l'eliminazione
          this.cancelDelete();    // Chiudi il dialogo di conferma
        },
        (error: any) => {
          this.errorMessage = 'Errore durante l\'eliminazione del timesheet.';
          console.error(this.errorMessage, error);
        }
      );
    }
  }

  // Annulla il dialogo di eliminazione
  cancelDelete(): void {
    this.timesheetToDelete = null;
    this.showDeleteDialog = false;
  }
}
