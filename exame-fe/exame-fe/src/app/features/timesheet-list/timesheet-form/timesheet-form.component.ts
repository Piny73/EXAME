import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { UtilsService } from '../../../core/utils.service';
import { TimeSheetDTO } from '../../../core/models/timesheet.model';
import { User } from '../../../core/models/user.model';
import { Activity } from '../../../core/models/activity.model';
import { UserService } from '../../../core/services/user.service';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.css']
})
export class TimesheetFormComponent implements OnInit {

  timesheetForm!: FormGroup;
  timesheets: TimeSheetDTO[] = [];
  userList: User[] = [];
  activityList: Activity[] = [];
  showSaveDialog = false;
  showDeleteDialog = false;

  @Input() timesheet: TimeSheetDTO | null = null;
  @Output() reload = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private utils: UtilsService,
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.timesheet) {
      this.loadTimesheetData();
    }
    this.loadTimesheets();
    this.loadUsers();
    this.loadActivities();
  }

  // Getter per accedere al FormArray hoursPerDay
  get hoursPerDayControls() {
    return (this.timesheetForm.get('hoursPerDay') as FormArray).controls;
  }

// Inizializzazione del FormGroup
private initializeForm(): void {
  this.timesheetForm = this.fb.group({
    id: [null],
    userId: [null, Validators.required],
    activityId: [null, Validators.required],
    activityDescription: [''], // Aggiungi il controllo per la descrizione dell'attività
    dtstart: ['', Validators.required],
    dtend: [''],
    detail: ['', [Validators.required, Validators.maxLength(500)]],
    hoursPerDay: this.fb.array([]) // Inizializza come FormArray
  });
}

  // Carica i dati del timesheet se esistente
  private loadTimesheetData(): void {
    if (!this.timesheet) {
      console.warn('Timesheet non valido o non trovato');
      return;
    }

    this.timesheetForm.patchValue({
      ...this.timesheet,
      dtstart: this.utils.formatDate(this.timesheet.dtstart, true),
      dtend: this.utils.formatDate(this.timesheet.dtend, true),
      detail: this.timesheet.detail
    });

    this.resetHoursPerDay();
    const hoursPerDay = this.timesheet.hoursPerDay || {};
    for (const [date, hours] of Object.entries(hoursPerDay)) {
      this.addHoursPerDay(date, hours);
    }
  }

  private loadTimesheets(): void {
    this.timesheetService.getTimesheets().subscribe({
      next: (data: TimeSheetDTO[]) => this.timesheets = data,
      error: (error) => console.error('Errore durante il caricamento dei timesheet:', error)
    });
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => this.userList = data,
      error: (error) => console.error('Errore durante il caricamento degli utenti:', error)
    });
  }

  private loadActivities(): void {
    this.activityService.fill().subscribe({
      next: (data: Activity[]) => this.activityList = data,
      error: (error) => console.error('Errore durante il caricamento delle attività:', error)
    });
  }

  addHoursPerDay(date?: string, hours?: number): void {
    const hoursFormGroup = this.fb.group({
      date: [date || '', Validators.required],
      hours: [hours || '', [Validators.required, Validators.min(0)]]
    });
    (this.timesheetForm.get('hoursPerDay') as FormArray).push(hoursFormGroup);
  }

  removeHoursPerDay(index: number): void {
    const hoursArray = this.timesheetForm.get('hoursPerDay') as FormArray;
    if (hoursArray.length > 0) {
      hoursArray.removeAt(index);
    }
  }

  private resetHoursPerDay(): void {
    const hoursArray = this.timesheetForm.get('hoursPerDay') as FormArray;
    while (hoursArray.length) {
      hoursArray.removeAt(0);
    }
  }

  onSubmit(): void {
    if (this.timesheetForm.valid) {
      const timesheetData: TimeSheetDTO = {
        ...this.timesheetForm.value,
        dtstart: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtstart)),
        dtend: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtend)),
        hoursPerDay: this.getHoursPerDay()
      };

      if (timesheetData.id) {
        this.updateTimesheet(timesheetData);
      } else {
        this.createTimesheet(timesheetData);
      }
    } else {
      this.timesheetForm.markAllAsTouched();
    }
  }

  private updateTimesheet(timesheetData: TimeSheetDTO): void {
    this.timesheetService.updateTimesheet(timesheetData).subscribe({
      next: () => {
        console.log('Aggiornamento completato con successo');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => this.handleError(error, 'Errore durante l\'aggiornamento')
    });
  }

  private createTimesheet(timesheetData: TimeSheetDTO): void {
    this.timesheetService.save(timesheetData).subscribe({
      next: () => {
        console.log('Creazione completata con successo');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => this.handleError(error, 'Errore durante la creazione')
    });
  }

  // Estrae le ore per giorno dall'array di controlli
  private getHoursPerDay(): { [date: string]: number } {
    const hours = this.timesheetForm.get('hoursPerDay') as FormArray;
    const result: { [date: string]: number } = {};
    hours.controls.forEach(control => {
      const date = control.get('date')?.value;
      const hoursWorked = control.get('hours')?.value;
      if (date && hoursWorked !== null && hoursWorked !== undefined) {
        result[date] = hoursWorked;
      }
    });
    return result;
  }
    // Aggiungi la gestione della selezione di un'attività
    selectActivity(activity: Activity): void {
      console.log('Attività selezionata:', activity); // Verifica che l'attività includa ownerid
      this.timesheetForm.patchValue({
        id: activity.id,
        description: activity.description,
        ownerid: activity.ownerid,
        dtstart: activity.dtstart,
        dtend: activity.dtend,
        enable: activity.enable
      });
    }
  // Metodo per gestire la selezione della timesheet
  selectTimeSheet(timesheet: TimeSheetDTO): void {
    this.timesheetForm.patchValue({
      id: timesheet.id,
      userId: timesheet.userId,
      activityId: timesheet.activityId,
      dtstart: timesheet.dtstart,
      dtend: timesheet.dtend,
      detail: timesheet.detail
    });

    this.resetHoursPerDay();
    for (const [date, hours] of Object.entries(timesheet.hoursPerDay || {})) {
      this.addHoursPerDay(date, hours);
    }
  }

  resetForm(): void {
    this.timesheetForm.reset();
    this.resetHoursPerDay();
  }

  confirmSave(): void {
    this.showSaveDialog = false;
    this.onSubmit();
  }

  cancelSave(): void {
    this.showSaveDialog = false;
  }

  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.deleteTimesheet();
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  openDeleteConfirmation(): void {
    this.showDeleteDialog = true;
  }

  private deleteTimesheet(): void {
    if (this.timesheet?.id) {
      this.timesheetService.deleteTimesheet(this.timesheet.id).subscribe({
        next: () => {
          console.log('Eliminazione completata con successo');
          this.reload.emit(true);
          this.activeModal.close();
        },
        error: (error) => this.handleError(error, 'Errore durante l\'eliminazione')
      });
    }
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    alert(message);
  }
}
