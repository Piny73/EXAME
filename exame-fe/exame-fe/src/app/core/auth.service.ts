// auth.service.ts
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Login } from './models/login.model';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly endpoint = 'users/login'; // Endpoint di login
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage()); // Mantiene lo stato dell'utente
  public user$ = this.userSubject.asObservable(); // Osservabile per accedere allo stato dell'utente

  constructor(private apiService: ApiService) { }

  // Metodo per effettuare il login
  login(login: Login): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.apiService.post<User>(this.endpoint, login, headers).pipe(
      map(response => {
        if (response && response.id && response.namesurname) {
          this.saveUserInLocalStorage(response); // Salva l'utente nel localStorage
          this.userSubject.next(response); // Aggiorna lo stato dell'utente
        } else {
          console.error('Errore: la risposta non contiene un utente valido', response);
        }
        return response;
      })
    );
  }

  // Metodo per ottenere l'utente corrente
  getUser(): User | null {
    return this.userSubject.value;
  }

  // Metodo per ottenere l'utente dal localStorage
  private getUserFromLocalStorage(): User | null {
    if (typeof window !== 'undefined' && localStorage.getItem('user')) {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          if (parsedUser && parsedUser.id && parsedUser.namesurname && parsedUser.email) {
            return new User(parsedUser);
          }
        } catch (e) {
          console.error('Errore nel parsing dell\'utente dal localStorage:', e);
        }
      }
    }
    return null;
  }

  // Metodo per salvare l'utente nel localStorage
  private saveUserInLocalStorage(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Metodo per effettuare il logout
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    this.userSubject.next(null); // Aggiorna lo stato dell'utente a null
  }

  // Metodo per ottenere il nome dell'utente corrente
  getUserName(): string | null {
    return this.userSubject.value?.namesurname || null;
  }
}

