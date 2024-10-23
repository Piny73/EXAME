import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  userList: User[] = [];
  activityList: Activity[] = [];

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

  selectTimeSheet(selectedTimesheet: TimeSheetDTO): void {
    if (!selectedTimesheet) {
      console.warn('Nessun timesheet selezionato');
      return;
    }

    // Carica i dati del timesheet selezionato nel form
    this.timesheetForm.patchValue({
      id: selectedTimesheet.id,
      userId: selectedTimesheet.userId,
      activityId: selectedTimesheet.activityId,
      dtstart: selectedTimesheet.dtstart ? this.utils.formatDateForInput(selectedTimesheet.dtstart) : '',
      dtend: selectedTimesheet.dtend ? this.utils.formatDateForInput(selectedTimesheet.dtend) : '',
      workDate: selectedTimesheet.workDate ? this.utils.formatDateForDateInput(selectedTimesheet.workDate) : '',
      detail: selectedTimesheet.detail,
      hoursWorked: selectedTimesheet.hoursWorked
    });

    console.log('Timesheet selezionato:', selectedTimesheet);
  }

  selectActivity(selectedActivity: Activity): void {
    if (!selectedActivity) {
      console.warn('Nessuna attività selezionata');
      return;
    }

    // Aggiorna il campo activityId del form con l'attività selezionata
    this.timesheetForm.patchValue({
      activityId: selectedActivity.id
    });

    console.log('Attività selezionata:', selectedActivity);
  }

  private loadTimesheetData(): void {
    if (!this.timesheet) {
      console.warn('Timesheet non valido o non trovato');
      return;
    }

    // Patch dei valori al form, convertendo i tipi Date in stringhe formattate per i controlli di input
    this.timesheetForm.patchValue({
      id: this.timesheet.id,
      userId: this.timesheet.userId,
      activityId: this.timesheet.activityId,
      dtstart: this.timesheet.dtstart ? this.utils.formatDateForInput(this.timesheet.dtstart) : '',
      dtend: this.timesheet.dtend ? this.utils.formatDateForInput(this.timesheet.dtend) : '',
      workDate: this.timesheet.workDate ? this.utils.formatDateForDateInput(this.timesheet.workDate) : '',
      detail: this.timesheet.detail,
      hoursWorked: this.timesheet.hoursWorked
    });
  }

  public loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => this.userList = data,
      error: (error) => console.error('Errore durante il caricamento degli utenti:', error)
    });
  }

  public loadActivities(): void {
    this.activityService.fill().subscribe({
      next: (data: Activity[]) => this.activityList = data,
      error: (error) => console.error('Errore durante il caricamento delle attività:', error)
    });
  }

  public resetForm(): void {
    this.timesheetForm.reset();
  }

  public onSubmit(): void {
    if (this.timesheetForm.valid) {
      const timesheetData: TimeSheetDTO = {
        id: this.timesheetForm.value.id || 0,
        userId: this.timesheetForm.value.userId ? parseInt(this.timesheetForm.value.userId, 10) : null,
        activityId: this.timesheetForm.value.activityId ? parseInt(this.timesheetForm.value.activityId, 10) : null,
        dtstart: this.timesheetForm.value.dtstart ? new Date(this.timesheetForm.value.dtstart) : null,
        dtend: this.timesheetForm.value.dtend ? new Date(this.timesheetForm.value.dtend) : null,
        workDate: this.timesheetForm.value.workDate ? new Date(this.timesheetForm.value.workDate) : null,
        detail: this.timesheetForm.value.detail,
        hoursWorked: this.timesheetForm.value.hoursWorked
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

  private handleError(error: any, message: string): void {
    console.error(message, error);
    alert(message);
  }
}
