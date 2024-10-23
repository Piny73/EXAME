// src/app/models/timesheet.model.ts

import { Activity } from "./activity.model";
import { User } from "./user.model";

export class TimeSheet {
  id!: number;                      // Identificatore univoco del Timesheet
  activityid!: number | null;       // ID dell'attività associata, ora accetta null
  userid!: number | null;           // ID dell'utente, ora accetta null
  detail!: string;                  // Dettagli del lavoro svolto
  dtstart!: string | null;          // Data e ora di inizio, ora di tipo string
  dtend!: string | null;            // Data e ora di fine, ora di tipo string
  user!: User;                      // Oggetto utente associato
  activity!: Activity;              // Oggetto attività associata
  hoursWorked!: number;             // Numero di ore lavorate
  workDate!: string | null;         // Data del giorno lavorato, ora di tipo string

  constructor(init?: Partial<TimeSheet>) {
    Object.assign(this, init);      // Assegna valori iniziali se forniti
  }
}

export interface TimeSheetDTO {
  id: number;                      // Identificatore del Timesheet
  activityid: number | null;       // ID dell'attività associata, ora accetta null
  userid: number | null;           // ID dell'utente, ora accetta null
  dtstart: string | null;          // Data e ora di inizio, ora di tipo string
  dtend: string | null;            // Data e ora di fine, ora di tipo string
  detail: string;                  // Dettagli del lavoro svolto
  hoursWorked: number;             // Numero di ore lavorate
  workDate: string | null;         // Data del giorno lavorato, ora di tipo string
}

