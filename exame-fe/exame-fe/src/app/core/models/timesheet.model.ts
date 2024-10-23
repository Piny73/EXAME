// src/app/models/timesheet.model.ts

import { Activity } from "./activity.model";
import { User } from "./user.model";

export class TimeSheet {
  id!: number;                      // Identificatore univoco del Timesheet
  activityId!: number | null;       // ID dell'attività associata, ora accetta null
  userId!: number | null;           // ID dell'utente, ora accetta null
  detail!: string;                  // Dettagli del lavoro svolto
  dtstart!: Date | null;            // Data e ora di inizio, ora di tipo Date
  dtend!: Date | null;              // Data e ora di fine, ora di tipo Date
  user!: User;                      // Oggetto utente associato
  activity!: Activity;              // Oggetto attività associata
  hoursWorked!: number;             // Numero di ore lavorate
  workDate!: Date;                  // Data del giorno lavorato, ora di tipo Date

  constructor(init?: Partial<TimeSheet>) {
    Object.assign(this, init);      // Assegna valori iniziali se forniti
  }
}

export interface TimeSheetDTO {
  id: number;                      // Identificatore del Timesheet
  activityId: number | null;       // ID dell'attività associata, ora accetta null
  userId: number | null;           // ID dell'utente, ora accetta null
  dtstart: Date | null;            // Data e ora di inizio, ora di tipo Date
  dtend: Date | null;              // Data e ora di fine, ora di tipo Date
  detail: string;                  // Dettagli del lavoro svolto
  hoursWorked: number;             // Numero di ore lavorate
  workDate: Date | null;                  // Data del giorno lavorato, ora di tipo Date
}