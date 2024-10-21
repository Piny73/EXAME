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

  @Input() timesheet!: TimeSheetDTO; 
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

  // Inizializza il FormGroup
  private initializeForm(): void {
    this.timesheetForm = this.fb.group({
      id: [null],
      userId: [null, Validators.required],
      activityId: [null, Validators.required],
      dtstart: ['', Validators.required],
      dtend: [''],
      detail: ['', [Validators.required, Validators.maxLength(500)]],
      hoursPerDay: this.fb.array([]) // Inizializza come FormArray
    });
  }

  // Carica i dati del timesheet se esistente
  private loadTimesheetData(): void {
    this.timesheetForm.patchValue({
      ...this.timesheet,
      dtstart: this.utils.formatDate(this.timesheet.dtstart, true),
      dtend: this.utils.formatDate(this.timesheet.dtend, true),
      detail: this.timesheet.detail
    });

    this.resetHoursPerDay();
    for (const [date, hours] of Object.entries(this.timesheet.hoursPerDay)) {
      this.addHoursPerDay(date, hours);
    }
  }

  // Carica la lista dei timesheet
  private loadTimesheets(): void {
    this.timesheetService.getTimesheets().subscribe({
      next: (data: TimeSheetDTO[]) => this.timesheets = data,
      error: (error) => console.error('Errore durante il caricamento dei timesheet:', error)
    });
  }

  // Carica la lista degli utenti
  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => this.userList = data,
      error: (error) => console.error('Errore durante il caricamento degli utenti:', error)
    });
  }

  // Carica la lista delle attività
  private loadActivities(): void {
    this.activityService.fill().subscribe({
      next: (data: Activity[]) => this.activityList = data,
      error: (error) => console.error('Errore durante il caricamento delle attività:', error)
    });
  }

  // Aggiunge un nuovo giorno alle ore lavorate
  addHoursPerDay(date?: string, hours?: number): void {
    const hoursFormGroup = this.fb.group({
      date: [date || '', Validators.required],
      hours: [hours || '', [Validators.required, Validators.min(0)]]
    });
    (this.timesheetForm.get('hoursPerDay') as FormArray).push(hoursFormGroup);
  }

  // Rimuove un giorno alle ore lavorate
  removeHoursPerDay(index: number): void {
    const hoursArray = this.timesheetForm.get('hoursPerDay') as FormArray;
    if (hoursArray.length > 0) {
      hoursArray.removeAt(index);
    }
  }

  // Resetta l'array hoursPerDay
  private resetHoursPerDay(): void {
    const hoursArray = this.timesheetForm.get('hoursPerDay') as FormArray;
    while (hoursArray.length) {
      hoursArray.removeAt(0);
    }
  }

  // Gestione dell'invio del form
  onSubmit(): void {
    if (this.timesheetForm.valid) {
      const timesheetData: TimeSheetDTO = {
        ...this.timesheetForm.value,
        dtstart: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtstart)),
        dtend: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtend)),
        hoursPerDay: this.getHoursPerDay()
      };

      if (timesheetData.id) {
        this.timesheetService.updateTimesheet(timesheetData).subscribe({
          next: () => {
            console.log('Aggiornamento completato con successo');
            this.reload.emit(true);
            this.activeModal.close();
          },
          error: (error) => this.handleError(error, 'Errore durante l\'aggiornamento')
        });
      } else {
        this.timesheetService.save(timesheetData).subscribe({
          next: () => {
            console.log('Creazione completata con successo');
            this.reload.emit(true);
            this.activeModal.close();
          },
          error: (error) => this.handleError(error, 'Errore durante la creazione')
        });
      }
    } else {
      this.timesheetForm.markAllAsTouched();
    }
  }

  // Estrae le ore per giorno dall'array di controlli
  private getHoursPerDay(): { [date: string]: number } {
    const hours = this.timesheetForm.get('hoursPerDay') as FormArray;
    const result: { [date: string]: number } = {};
    hours.controls.forEach(control => {
      const date = control.get('date')?.value;
      const hoursWorked = control.get('hours')?.value;
      if (date && hoursWorked) {
        result[date] = hoursWorked;
      }
    });
    return result;
  }

  // Funzione per selezionare un timesheet
  selectTimesheet(timesheet: TimeSheetDTO): void {
    this.timesheetForm.patchValue({
      id: timesheet.id,
      userId: timesheet.userId,
      activityId: timesheet.activityId,
      dtstart: timesheet.dtstart,
      dtend: timesheet.dtend,
      detail: timesheet.detail
    });
  }

  // Gestione della selezione dell'attività
  onActivitySelected(activity: Activity): void {
    this.timesheetForm.patchValue({
      activityId: activity.id,
      dtstart: activity.dtstart,
      dtend: activity.dtend
    });
  }

  // Gestione del reset del form
  resetForm(): void {
    this.timesheetForm.reset();
    this.resetHoursPerDay();
  }

  // Gestione della conferma di salvataggio
  confirmSave(): void {
    this.showSaveDialog = true;
  }

  cancelSave(): void {
    this.showSaveDialog = false;
  }

  // Gestione della conferma di cancellazione
  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  openDeleteConfirmation(): void {
    this.showDeleteDialog = true;
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    alert(message);
  }
}

