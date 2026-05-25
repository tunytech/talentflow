import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './features/admin/admin';
import { LoginComponent } from './features/login/login';
import { AuthService } from './core/services/auth.service';

// Le composant racine App sert de chef d'orchestre principal pour toute l'application.
// Standalone: true signifie qu'il est autonome et s'auto-suffit.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AdminComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Le titre principal de l'application
  protected readonly title = signal('Talentflow');

  // Nous injectons le service d'authentification pour surveiller en direct (signal réactif) 
  // si un utilisateur est connecté ou s'il doit d'abord passer par l'écran de connexion.
  protected authService = inject(AuthService);
}
