// src/app/features/activity-list/activity-list.component.ts

import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { Activity, ActivityDTO } from '../../core/models/activity.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivityService } from '../../core/services/activity.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs';

interface ActivityData {
  loading: boolean;
  activityList: Activity[] | null;
  error: string | null;
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit, OnChanges {

  private modalService = inject(NgbModal);

  @Output() onSelectActivity = new EventEmitter<ActivityDTO>();
  @Input() isUpdated!: number;

  title = 'Activity';
  activityData$!: Observable<ActivityData>;
  selectedActivity: Activity | null = null;
  totalHoursMap: { [activityId: number]: number } = {};
  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentUpdate = changes['isUpdated']?.currentValue ?? 0;
    const previousUpdate = changes['isUpdated']?.previousValue ?? 0;

    if (currentUpdate > previousUpdate) {
      this.load();
    }
  }

  load(): void {
    this.activityData$ = this.activityService.fill().pipe(
      map((data: Activity[]) => ({
        loading: false,
        activityList: data,
        error: null
      })),
      catchError(error => {
        console.error('Errore durante il caricamento delle attività:', error);
        return of({
          loading: false,
          activityList: null,
          error: 'Si è verificato un errore nel caricamento delle attività.'
        });
      }),
      startWith({ loading: true, activityList: null, error: null })
    );

    // Chiamata al metodo per caricare le ore totali una volta caricata la lista delle attività
    this.activityData$.subscribe(() => {
      this.loadTotalHours();
    });
  }

  // Metodo per caricare il totale delle ore per ogni attività
  loadTotalHours(): void {
    if (this.activityData$) {
      this.activityData$.pipe(
        map(data => data.activityList || [])
      ).subscribe(activities => {
        activities.forEach(activity => {
          this.activityService.getTotalHoursByActivity(activity.id).subscribe({
            next: (hours) => {
              console.log(`Ore totali per l'attività con ID ${activity.id}:`, hours); // Log di controllo
              this.totalHoursMap[activity.id] = hours; // Memorizza le ore totali nella mappa
            },
            error: (error) => {
              console.error(`Errore nel recupero delle ore per l'attività con ID ${activity.id}:`, error);
            }
          });
        });
      });
    }
  }

// Metodo per gestire la selezione di un'attività
selectActivity(activity: Activity): void {
  const activityDTO: ActivityDTO = {
    id: activity.id,
    description: activity.description,
    dtstart: activity.dtstart || new Date(),
    dtend: activity.dtend || new Date(),
    ownerid: activity.ownerid,
    enable: activity.enable,
    ownerName: activity.ownerName || null
  };
  this.onSelectActivity.emit(activityDTO);
}

  // Metodo per cancellare una singola attività
  deleteActivity(activity: Activity): void {
    if (activity.id && confirm(`Sei sicuro di voler eliminare l'attività "${activity.description}" di "${activity.ownerName}"?`)) {
      console.log('Eliminazione dell\'attività con ID:', activity.id);
      this.activityService.delete(activity.id).subscribe({
        next: () => {
          console.log('Attività eliminata con successo:', activity.id);
          this.load(); // Ricarica la lista delle attività dopo la cancellazione
        },
        error: (error: any) => {
          console.error('Errore durante l\'eliminazione dell\'attività', error);
        }
      });
    } else {
      console.error('ID attività non valido o non presente:', activity.id);
    }
  }

  // Apertura del dettaglio/modifica dell'attività
  openDetail(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' });
  }

  // Apertura per creare una nuova attività
  openNew(content: TemplateRef<any>) {
    this.selectedActivity = null; // Resetta la selezione per una nuova attività
    this.modalService.open(content, { size: 'xl' });
  }

  // Quando ricevi l'evento di reload, chiama load()
  reload(load: boolean) {
    if (load) {
      this.load(); // Ricarica la lista
    }
  }
}
