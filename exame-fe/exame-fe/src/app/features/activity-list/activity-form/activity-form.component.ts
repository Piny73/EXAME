// src/app/features/activity-list/activity-form/activity-form.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Activity, ActivityDTO } from '../../../core/models/activity.model';
import { ActivityService } from '../../../core/services/activity.service';
import { UtilsService } from '../../../core/utils.service';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {

  activityForm!: FormGroup;
  private activityCopy!: Activity;
  currentOwner!: number | null;
  showSaveDialog = false;
  showDeleteDialog = false;

  @Input() activity!: Activity;
  @Output() reload = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private utils: UtilsService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.activity) {
      this.populateFormWithActivityData();
    }
  }

  private initializeForm(): void {
    this.activityForm = this.fb.group({
      id: [0],
      description: ['', Validators.required],
      ownerid: [0, Validators.required],
      dtstart: [null, Validators.required],
      dtend: [null],
      enable: [false]
    });
  }

  selectActivity(selectedActivity: ActivityDTO): void {
    if (!selectedActivity) {
      console.warn('Nessuna attività selezionata');
      return;
    }

    this.activityForm.patchValue({
      id: selectedActivity.id,
      description: selectedActivity.description,
      ownerid: selectedActivity.ownerid,
      dtstart: selectedActivity.dtstart ? this.utils.formatDateForInput(selectedActivity.dtstart) : null,
      dtend: selectedActivity.dtend ? this.utils.formatDateForInput(selectedActivity.dtend) : null,
      enable: selectedActivity.enable
    });

    this.activityCopy = { ...selectedActivity };
    console.log('Attività selezionata:', selectedActivity);
  }

  private populateFormWithActivityData(): void {
    this.currentOwner = this.activity.ownerid;

    this.activityForm.patchValue({
      id: this.activity.id || 0,
      description: this.activity.description,
      ownerid: this.activity.ownerid,
      dtstart: this.activity.dtstart ? this.utils.formatDateForInput(this.activity.dtstart) : null,
      dtend: this.activity.dtend ? this.utils.formatDateForInput(this.activity.dtend) : null,
      enable: this.activity.enable
    });

    this.activityCopy = { ...this.activity };
    console.log('Form popolato con dati attività:', this.activityForm.value);
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      this.showSaveDialog = true;
    } else {
      console.log('Form non valido');
      this.activityForm.markAllAsTouched();
    }
  }

  save(): void {
    const activityData = {
      ...this.activityForm.value,
      dtstart: this.activityForm.value.dtstart ? this.utils.formatDateForBackend(new Date(this.activityForm.value.dtstart)) : null,
      dtend: this.activityForm.value.dtend ? this.utils.formatDateForBackend(new Date(this.activityForm.value.dtend)) : null,
      enable: this.activityForm.value.enable !== undefined ? this.activityForm.value.enable : false
    };

    console.log('Payload inviato:', activityData);

    if (activityData.id) {
      this.updateActivity(activityData);
    } else {
      this.createActivity(activityData);
    }
  }

  private updateActivity(activityData: any): void {
    this.activityService.update(activityData).subscribe({
      next: () => {
        console.log('Aggiornamento completato');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error) => {
        console.error('Errore durante l\'aggiornamento', error);
        alert('Errore durante l\'aggiornamento.');
      }
    });
  }

  private createActivity(activityData: any): void {
    this.activityService.save(activityData).subscribe({
      next: () => {
        console.log('Creazione completata');
        this.reload.emit(true);
        this.activeModal.close();
      },
      error: (error: any) => {
        console.error('Errore durante la creazione', error);
        alert('Errore durante la creazione.');
      }
    });
  }

  deleteObject(): void {
    const activityId = this.activityForm.value.id;
    if (activityId && activityId !== 0) {
      this.activityService.delete(activityId).subscribe({
        next: () => {
          console.log('Attività eliminata con successo:', activityId);
          this.reload.emit(true);
          this.activeModal.close();
        },
        error: (error: any) => {
          console.error('Errore durante l\'eliminazione dell\'attività', error);
          alert('Errore durante l\'eliminazione.');
        }
      });
    } else {
      console.warn('ID non valido per la cancellazione:', activityId);
    }
  }

  onOwnerSelected(event: number): void {
    this.activityForm.patchValue({ ownerid: event });
    console.log('Proprietario selezionato:', event);
  }

  openDeleteConfirmation(): void {
    this.showDeleteDialog = true;
    console.log('Dialog di conferma eliminazione aperta.');
  }

  cancelSave(): void {
    this.showSaveDialog = false;
    console.log('Salvataggio annullato.');
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    console.log('Eliminazione annullata.');
  }

  confirmSave(): void {
    this.showSaveDialog = false;
    this.save();
  }

  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.deleteObject();
  }

  resetForm(): void {
    this.activityForm.reset({
      id: 0,
      description: '',
      ownerid: null,
      dtstart: null,
      dtend: null,
      enable: false
    });
    console.log('Form resettato.');
  }
}
