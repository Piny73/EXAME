// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Importa l'AuthService
import { Observable } from 'rxjs';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user$: Observable<User | null>; // Osservabile per ottenere lo stato dell'utente

  constructor(private router: Router, private authService: AuthService) {
    this.user$ = this.authService.user$; // Assegna l'osservabile dall'AuthService
  }

  ngOnInit(): void {}

  logout() {
    // Chiama il metodo di logout dell'AuthService
    this.authService.logout();
    // Reindirizza alla pagina di login
    this.router.navigate(['/login']);
  }
}
