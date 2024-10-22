// login.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login } from '../../core/models/login.model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  islogin: boolean = true;
  loginForm!: FormGroup;
  errorMessage: string = '';
  @Output() onLogin = new EventEmitter<boolean>();

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usr: ['', Validators.required],
      pwd: ['', Validators.required]
    });

    if (this.authService.getUser()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const login: Login = this.loginForm.value as Login;
      this.authService.login(login).subscribe({
        next: (response) => {
          console.log('Login effettuato con successo', response);
          this.onLogin.emit(true); // Emitti l'evento di login
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Errore nel login', error);
          this.errorMessage = 'Login fallito. Verifica le tue credenziali.';
        }
      });
    }
  }

  openRegistrazione() {
    this.router.navigate(['/registrazione']);
  }
}


