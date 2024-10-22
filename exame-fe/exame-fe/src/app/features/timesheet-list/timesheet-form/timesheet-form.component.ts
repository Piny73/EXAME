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

  get hoursPerDayControls() {
    return (this.timesheetForm.get('hoursPerDay') as FormArray).controls;
  }

  private initializeForm(): void {
    this.timesheetForm = this.fb.group({
      id: [null],
      userId: [null, Validators.required],
      activityId: [null, Validators.required],
      dtstart: ['', Validators.required],
      dtend: [''],
      detail: ['', [Validators.required, Validators.maxLength(500)]],
      hoursPerDay: this.fb.array([])
    });
  }

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

  public selectActivity(activity: Activity): void {
    this.timesheetForm.patchValue({
      activityId: activity.id
    });
  }

  public selectTimeSheet(timesheet: TimeSheetDTO): void {
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

  public loadTimesheets(): void {
    this.timesheetService.getTimesheets().subscribe({
      next: (data: TimeSheetDTO[]) => this.timesheets = data,
      error: (error) => console.error('Errore durante il caricamento dei timesheet:', error)
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
    this.resetHoursPerDay();
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

  public onSubmit(): void {
    if (this.timesheetForm.valid) {
      const timesheetData: any = {
        id: this.timesheetForm.value.id || null,
        userid: parseInt(this.timesheetForm.value.userId, 10),
        activityid: parseInt(this.timesheetForm.value.activityId, 10),
        dtstart: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtstart)).slice(0, -4),
        dtend: this.utils.formatDateForBackend(new Date(this.timesheetForm.value.dtend)).slice(0, -4),
        detail: this.timesheetForm.value.detail,
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

  private getHoursPerDay(): { [date: string]: number } {
    const hours = this.timesheetForm.get('hoursPerDay') as FormArray;
    const result: { [date: string]: number } = {};

    hours.controls.forEach(control => {
      const dateValue = control.get('date')?.value;
      if (dateValue) {
        let formattedDate = dateValue;

        if (dateValue.includes('-')) {
          formattedDate = dateValue.replace(/-/g, '/');
        } else if (dateValue.includes('/')) {
          const [day, month, year] = dateValue.split('/');
          if (day && month && year) {
            formattedDate = `${year}/${month}/${day}`;
          } else {
            console.error(`Formato data non valido: ${dateValue}`);
            return;
          }
        }

        const hoursWorked = control.get('hours')?.value;
        if (hoursWorked !== null && hoursWorked !== undefined) {
          result[formattedDate] = hoursWorked;
        }
      }
    });
    return result;
  }

  private createTimesheet(timesheetData: any): void {
    this.timesheetService.save(timesheetData).subscribe({
      next: () => {
        console.log('Creazione completata con successo');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => this.handleError(error, 'Errore durante la creazione')
    });
  }

  private updateTimesheet(timesheetData: any): void {
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
