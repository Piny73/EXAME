// src/app/models/activity.model.ts

import { User } from './user.model';

export class Activity {
  id!: number; // Identificatore dell'attività
  description!: string; // Descrizione dell'attività
  dtstart!: Date | null; // Data di inizio, può essere null
  dtend!: Date | null; // Data di fine, può essere null
  ownerid!: number; // ID del proprietario dell'attività
  enable!: boolean; // Stato dell'attività (attiva o disabilitata)
  ownerName!: User | null; // Proprietario dell'attività, di tipo User o null
  constructor(init?: Partial<Activity>) {
    Object.assign(this, init);
  }
}

// Modifica anche l'interfaccia ActivityDTO
export interface ActivityDTO {
  id: number;
  description: string;
  dtstart: Date;
  dtend: Date;
  ownerid: number;
  enable: boolean;
  ownerName: User | null; // Proprietario di tipo User o null
}

