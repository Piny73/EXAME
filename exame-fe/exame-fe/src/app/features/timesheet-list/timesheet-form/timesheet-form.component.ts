import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { UtilsService } from '../../../core/utils.service';
import { TimeSheetDTO } from '../../../core/models/timesheet.model';
import { User } from '../../../core/models/user.model';
import { Activity, ActivityDTO } from '../../../core/models/activity.model';
import { UserService } from '../../../core/services/user.service';
import { ActivityService } from '../../../core/services/activity.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.css']
})
export class TimesheetFormComponent implements OnInit {


  timesheetForm!: FormGroup;
  userList: User[] = [];
  activityList: Activity[] = [];
  isEditing = false;
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
    this.isEditing = !!this.timesheet;
    if (this.timesheet) {
      this.loadTimesheetData();
    }
    this.loadUsers();
    this.loadActivities();
  }

  private initializeForm(): void {
    this.timesheetForm = this.fb.group({
      id: [null],
      userId: [null, Validators.required],
      activityId: [null, Validators.required],
      dtstart: [null, Validators.required],
      dtend: [null],
      workDate: [null, Validators.required],
      detail: ['', [Validators.required, Validators.maxLength(500)]],
      hoursWorked: [null, [Validators.required, Validators.min(0)]]
    });
  }

  selectActivity(selectedActivity: ActivityDTO): void {
    if (!selectedActivity) {
      console.warn('Nessuna attività selezionata');
      return;
    }
  }

  selectTimeSheet(selectedTimeSheet: TimeSheetDTO): void {
   if(!selectedTimeSheet){
    console.warn('Nessuna timesheet selezionata');
    return;
   }
    }

  private loadTimesheetData(): void {
    if (!this.timesheet) {
      console.warn('Timesheet non valido o non trovato');
      return;
    }
  
    // Popola il form con i dati del timesheet, verificando se i campi di data non sono null
    this.timesheetForm.patchValue({
      id: this.timesheet.id,
      userId: this.timesheet.userid,
      activityId: this.timesheet.activityid,
      dtstart: this.timesheet.dtstart ? this.utils.formatDateForInput(this.timesheet.dtstart) : '',
      dtend: this.timesheet.dtend ? this.utils.formatDateForInput(this.timesheet.dtend) : '',
      workDate: this.timesheet.workDate ? this.utils.formatDateForInput(this.timesheet.workDate) : '',
      detail: this.timesheet.detail,
      hoursWorked: this.timesheet.hoursWorked
    });
  }

  private loadUsers(): void {
    this.userService.getAllUsers()
      .pipe(finalize(() => console.log('Caricamento utenti completato')))
      .subscribe({
        next: (data: User[]) => this.userList = data,
        error: (error) => console.error('Errore durante il caricamento degli utenti:', error)
      });
  }

  private loadActivities(): void {
    this.activityService.fill()
      .pipe(finalize(() => console.log('Caricamento attività completato')))
      .subscribe({
        next: (data: Activity[]) => this.activityList = data,
        error: (error) => console.error('Errore durante il caricamento delle attività:', error)
      });
  }

  resetForm(): void {
    this.timesheetForm.reset();
    this.isEditing = false;
  }

  onSubmit(): void {
    if (this.timesheetForm.invalid) {
      this.timesheetForm.markAllAsTouched();
      return;
    }

    const timesheetData: TimeSheetDTO = {
      id: this.timesheetForm.value.id || 0,
      userid: parseInt(this.timesheetForm.value.userId, 10),
      activityid: parseInt(this.timesheetForm.value.activityId, 10),
      dtstart: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtstart)),
      dtend: this.timesheetForm.value.dtend ? this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtend)) : null,
      workDate: this.utils.formatDateForDateInput(new Date(this.timesheetForm.value.workDate)),
      detail: this.timesheetForm.value.detail,
      hoursWorked: this.timesheetForm.value.hoursWorked
    };

    if (timesheetData.id) {
      this.updateTimesheet(timesheetData);
    } else {
      this.createTimesheet(timesheetData);
    }
  }

  private createTimesheet(timesheetData: TimeSheetDTO): void {
    console.log('Payload inviato per la creazione:', timesheetData);
    this.timesheetService.save(timesheetData).subscribe({
      next: () => {
        console.log('Creazione completata con successo');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => this.handleError(error, 'Errore durante la creazione')
    });
  }

  private updateTimesheet(timesheetData: TimeSheetDTO): void {
    console.log('Payload inviato per l\'aggiornamento:', timesheetData);
    this.timesheetService.updateTimesheet(timesheetData).subscribe({
      next: () => {
        console.log('Aggiornamento completato con successo');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => this.handleError(error, 'Errore durante l\'aggiornamento')
    });
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    alert(message);
  }

  openDeleteConfirmation(): void {
    this.showDeleteDialog = true;
    console.log('Dialog di conferma eliminazione aperta.');
  }
}

