// utils.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  
  constructor() { }

  // Metodo per formattare una data nel formato ISO 8601 per inviare al backend
  formatDateForBackend(date: Date): string {
    return date.toISOString(); // Ritorna la data in formato ISO 8601
  }

  // Metodo per convertire una stringa in un oggetto Date per l'input del form
  parseDateFromString(dateString: string): Date {
    return new Date(dateString); // Crea un nuovo oggetto Date dalla stringa
  }

  // Metodo per formattare una data nel formato 'yyyy-MM-ddTHH:mm' per l'uso con datetime-local
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // I mesi partono da 0 in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Ritorna la data formattata come 'yyyy-MM-ddTHH:mm'
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Metodo per formattare una data per l'uso con input di tipo 'date' (solo data)
  formatDateForDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Ritorna la data nel formato 'yyyy-MM-dd'
    return `${year}-${month}-${day}`;
  }

  // Metodo per formattare una stringa di data per il frontend (conversione da e verso il formato visualizzato)
  formatDate(_date: string | null | undefined, toFrontendFormat: boolean): string | null {
    if (!_date || _date.trim() === '') {
      console.warn("Data non valida:", _date);
      return null; 
    }

    let day: string, month: string, year: string;
    const separator = _date.includes('/') ? '/' : '-';
    const parts = _date.split(separator);

    if (parts.length !== 3) {
      console.error("Formato non valido, la data dovrebbe avere 3 parti:", _date);
      return null;
    }

    if (toFrontendFormat) {
      if (separator === '-') {
        [year, month, day] = parts;
      } else {
        [year, month, day] = parts;
      }
      return `${day}/${month}/${year}`;
    } else {
      [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
  }
}
