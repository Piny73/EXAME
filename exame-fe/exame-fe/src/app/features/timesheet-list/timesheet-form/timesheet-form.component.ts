import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  private timesheetCopy!: TimeSheetDTO;
  currentUser!: number | null;
  currentActivity!: number | null;
  showSaveDialog = false;
  showDeleteDialog = false;
  userList: User[] = [];
  activityList: Activity[] = [];

  @Input() timesheet!: TimeSheetDTO; // Riceve il timesheet da modificare o uno nuovo da creare
  @Output() reload = new EventEmitter<boolean>(); // Evento per ricaricare la lista

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private utils: UtilsService,
    public activeModal: NgbActiveModal,
    private userService: UserService, // Aggiunta UserService
    private activityService: ActivityService // Aggiunta ActivityService
  ) {}

  ngOnInit(): void {
    this.timesheetForm = this.fb.group({
      id: [null],
      userid: [null, Validators.required],
      activityid: [null, Validators.required],
      dtstart: ['', Validators.required],
      dtend: [''],
      detail: ['', Validators.maxLength(500)]
    });

    if (this.timesheet) {
      this.currentUser = this.timesheet.userid;
      this.currentActivity = this.timesheet.activityid;
      this.timesheet.dtstart = this.timesheet.dtstart ? this.utils.formatDate(this.timesheet.dtstart, true) : '';
      this.timesheet.dtend = this.timesheet.dtend ? this.utils.formatDate(this.timesheet.dtend, true) : '';
      this.timesheetCopy = { ...this.timesheet };
      this.timesheetForm.patchValue({ ...this.timesheet });
    }

    // Carica le liste di utenti e attività
    this.loadUsers();
    this.loadActivities();
  }

  // Carica la lista degli utenti
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.userList = data;
        console.log('Utenti caricati:', this.userList); // Per debugging
      },
      error: (error) => {
        console.error('Errore durante il caricamento degli utenti:', error);
      }
    });
  }

// Carica la lista delle attività dal backend
loadActivities(): void {
  this.activityService.fill().subscribe({
    next: (data: Activity[]) => {
      this.activityList = data;
      console.log('Attività caricate:', this.activityList); // Per debugging
    },
    error: (error) => {
      console.error('Errore durante il caricamento delle attività:', error);
    }
  });
}


  onActivitySelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const activityId = parseInt(target.value, 10);
    this.currentActivity = activityId;
    this.timesheetForm.patchValue({ activityid: activityId });
  }

  onUserSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const userId = parseInt(target.value, 10);
    this.currentUser = userId;
    this.timesheetForm.patchValue({ userid: userId });
  }

  onSubmit(): void {
    if (this.timesheetForm.valid) {
      console.log('Form è valido, avvio il salvataggio...');
      this.save(); // Chiama il metodo save per salvare il timesheet
    } else {
      console.log('Form non valido, impossibile salvare');
      this.timesheetForm.markAllAsTouched(); // Mostra gli errori di validazione
    }
  }
    // Metodo per formattare le date nel formato 'dd/MM/yyyy HH:mm:ss' prima di inviare al backend
  formatDateForBackend(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  save(): void {
    const timesheetData = { ...this.timesheetForm.value };
    
    // Converti le date al formato corretto per il backend
    timesheetData.dtstart = this.utils.formatDateForBackend(new Date(timesheetData.dtstart));
    timesheetData.dtend = this.utils.formatDateForBackend(new Date(timesheetData.dtend));
    
    if (timesheetData.id) {
      this.timesheetService.updateTimesheet(timesheetData).subscribe({
        next: () => {
          console.log('Aggiornamento completato con successo');
          this.reload.emit(true);
          this.activeModal.close();
        },
        error: (error: any) => {
          console.error('Errore durante l\'aggiornamento', error);
          alert('Errore durante l\'aggiornamento.');
        }
      });
    } else {
      this.timesheetService.save(timesheetData).subscribe({
        next: () => {
          console.log('Creazione completata con successo');
          this.reload.emit(true);
          this.activeModal.close();
        },
        error: (error: any) => {
          console.error('Errore durante la creazione', error);
          alert('Errore durante la creazione.');
        }
      });
    }
  }
  
  
  
  

  resetForm(): void {
    this.timesheet = { ...this.timesheetCopy };
    this.timesheetForm.reset(this.timesheet);
  }

  // Gestione dei dialog di conferma
  cancelSave(): void {
    this.showSaveDialog = false;
  }

  confirmSave(): void {
    this.showSaveDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  openDeleteConfirmation(): void {
    this.showDeleteDialog = true;
  }
}


