import { Component, OnInit } from '@angular/core';
import { TimesheetService } from '../../core/services/timesheet.service';
import { TimeSheetDTO } from '../../core/models/timesheet.model';
import { finalize } from 'rxjs/operators';
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

  constructor(
    private timesheetService: TimesheetService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadTimesheets();
  }

  // Carica i timesheet dal servizio
  private loadTimesheets(): void {
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