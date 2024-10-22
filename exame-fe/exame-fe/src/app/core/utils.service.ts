import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  // Metodo per formattare la data nel formato ISO 8601 'yyyy-MM-ddTHH:mm:ss.SSS' per inviare al backend
  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // I mesi partono da 0 in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Ritorna la data nel formato ISO 8601 completo di tempo
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  // Metodo per formattare la data per il frontend (da yyyy-MM-dd a dd/MM/yyyy) e viceversa
formatDate(_date: string | null | undefined, toFrontendFormat: boolean): string | null {
  if (!_date || _date.trim() === '') {
    console.warn("Data non valida:", _date);
    return null; // Oppure ritorna un valore predefinito, come una stringa vuota ""
  }

  let day: string, month: string, year: string;
  const separator = _date.includes('/') ? '/' : '-';
  const parts = _date.split(separator);

  // Controlla che la data abbia esattamente 3 parti
  if (parts.length !== 3) {
    console.error("Formato non valido, la data dovrebbe avere 3 parti:", _date);
    return null;
  }

  // Converti il formato a seconda del valore di toFrontendFormat
  if (toFrontendFormat) {
    // Formato yyyy-MM-dd o yyyy/MM/dd a dd/MM/yyyy
    if (separator === '-') {
      [year, month, day] = parts;
    } else {
      [year, month, day] = parts; // Già nel formato corretto
    }
    return `${day}/${month}/${year}`;
  } else {
    // Formato dd/MM/yyyy a yyyy-MM-dd
    [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
}


  // Metodo per formattare l'ora nel formato 'HH:mm:ss.SSS'
  formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Ritorna l'ora nel formato 'HH:mm:ss.SSS'
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  // Metodo per formattare data e ora insieme (ISO 8601)
  formatDateTime(date: Date): string {
    return this.formatDateForBackend(date); // Riutilizza formatDateForBackend che gestisce già tutto
  }
}
