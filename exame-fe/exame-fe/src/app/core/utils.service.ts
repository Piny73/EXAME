// utils.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  // Metodo per formattare una data nel formato 'yyyy-MM-ddTHH:mm' per l'invio al backend
  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Formatta la data nel formato 'yyyy-MM-ddTHH:mm'
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Metodo per convertire una stringa di data in un oggetto Date
  parseDateFromString(dateString: string): Date {
    return new Date(dateString); // Crea un nuovo oggetto Date dalla stringa
  }

// Metodo per formattare una data nel formato 'yyyy-MM-ddTHH:mm' per l'uso con input di tipo datetime-local
formatDateForInput(date: Date | string): string {
  let dateObj: Date;

  // Se l'input è una stringa, convertila in un oggetto Date
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  // Ritorna la data formattata come 'yyyy-MM-ddTHH:mm'
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


  // Metodo per formattare una data nel formato 'yyyy-MM-dd' per l'input di tipo date
  formatDateForDateInput(date: Date | string): string {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    // Ritorna la data formattata come 'yyyy-MM-dd'
    return `${year}-${month}-${day}`;
  }
}
