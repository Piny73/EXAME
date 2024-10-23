// src/app/models/activity.model.ts

import { User } from './user.model';

export class Activity {
  id!: number; // Identificatore dell'attività
  description!: string; // Descrizione dell'attività
  dtstart!: Date | null; // Data di inizio, ora di tipo Date, può essere null
  dtend!: Date | null; // Data di fine, ora di tipo Date, può essere null
  ownerid!: number; // ID del proprietario dell'attività
  enable!: boolean; // Stato dell'attività (attiva o disabilitata)
  owner!: User | null; // Riferimento all'utente proprietario, può essere null
  ownerName?: string; // Campo per il nome del proprietario

  constructor(init?: Partial<Activity>) {
    Object.assign(this, init);
  }
}
// activity.model.ts
export interface ActivityDTO {
  id: number;
  description: string;
  dtstart: Date;
  dtend: Date;
  ownerid: number;
  enable: boolean;
  ownerName: string;
}
