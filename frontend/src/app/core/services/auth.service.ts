import { Injectable, signal, inject } from '@angular/core';
import { TranslationService } from './translation.service';

// Interface représentant l'utilisateur connecté avec toutes ses informations
export interface LoggedUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: number;
  companyName?: string;
  logo?: string; // Logo de l'entreprise au format Base64
}

// Les données renvoyées lors d'une tentative de connexion
export interface LoginResponse {
  success?: boolean;
  firstLoginRequired?: boolean;
  passwordExpired?: boolean;
  userId?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  companyId?: number;
  companyName?: string;
  logo?: string;
  message?: string;
  token?: string; // Jeton magique de réinitialisation renvoyé en dev local
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = 'http://localhost:8080/api/auth';
  private translationService = inject(TranslationService);

  // Le signal réactif qui contient les détails de l'utilisateur connecté.
  // S'il n'y a personne, il est réglé sur "null" (vide).
  public readonly currentUser = signal<LoggedUser | null>(null);

  // =========================================================================
  // SIMULATION DE SÉCURITÉ EN MÉMOIRE (FALLBACK SI LE BACKEND N'EST PAS LANCÉ)
  // =========================================================================
  
  // La liste des utilisateurs fictifs pour tester directement dans le navigateur !
  private mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@tunytech.com',
      password: 'Admin123456!',
      firstName: 'Jean',
      lastName: 'Administrateur',
      role: 'Administrateur',
      companyId: 1,
      companyName: 'Tunytech Holdings (Société Mère)',
      firstLogin: false,
      passwordLastChanged: new Date(), // Changé aujourd'hui
      resetToken: null as string | null,
      tokenExpiry: null as Date | null,
      logo: '' // Logo vide par défaut
    },
    {
      id: 2,
      username: 'rh.france',
      email: 'rh.france@tunytech.com',
      password: 'RhFrance123!',
      firstName: 'Marie',
      lastName: 'Lefebvre',
      role: 'Responsable RH',
      companyId: 4,
      companyName: 'Tunytech France (Sous-Filiale)',
      firstLogin: false,
      passwordLastChanged: new Date(),
      resetToken: null as string | null,
      tokenExpiry: null as Date | null,
      logo: ''
    },
    {
      id: 3,
      username: 'nouveau.employe',
      email: 'nouveau@tunytech.com',
      password: 'Bienvenue123!', // Mot de passe par défaut
      firstName: 'Amir',
      lastName: 'Nouveau',
      role: 'Manager',
      companyId: 4,
      companyName: 'Tunytech France (Sous-Filiale)',
      firstLogin: true, // IMPORTANT : Ce nouvel employé doit obligatoirement changer de mot de passe !
      passwordLastChanged: new Date(),
      resetToken: null as string | null,
      tokenExpiry: null as Date | null,
      logo: ''
    }
  ];

  // Historique en mémoire pour se rappeler des 3 derniers mots de passe utilisés
  // La clé de la boîte est l'identifiant (userId) de l'utilisateur
  private mockPasswordHistory: { [userId: number]: string[] } = {
    1: ['AncienMdp999!', 'MdpSuperSecret88!'],
    2: ['MarieRh777!', 'FranceRoxx1!'],
    3: ['Provisoire123!', 'Depart000!']
  };

  constructor() {
    // Lors du démarrage, on vérifie si quelqu'un était déjà connecté dans la mémoire du navigateur (LocalStorage)
    const saved = localStorage.getItem('talentflow_user');
    if (saved) {
      try {
        this.currentUser.set(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('talentflow_user');
      }
    }
  }

  // ==========================================
  // FONCTION DE CONNEXION (LOGIN)
  // ==========================================
  public async login(username: string, password: string): Promise<LoginResponse> {
    try {
      // 1. On tente d'appeler le vrai serveur Spring Boot
      const res = await fetch(`${this.authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.status === 401 || res.status === 403) {
        const err = await res.json();
        throw new Error(err.message || 'Identifiants invalides');
      }

      if (res.ok) {
        const data: LoginResponse = await res.json();
        // Si la connexion réussit pleinement (pas de reset requis)
        if (data.success && data.userId) {
          const logged: LoggedUser = {
            userId: data.userId,
            username: data.username || '',
            email: data.email || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            role: data.role || 'Collaborateur',
            companyId: data.companyId,
            companyName: data.companyName,
            logo: data.logo
          };
          this.currentUser.set(logged);
          localStorage.setItem('talentflow_user', JSON.stringify(logged));
        }
        return data;
      }
    } catch (e: any) {
      console.warn('Backend indisponible ou erreur réseau. Bascule vers la simulation en mémoire...', e.message);
    }

    // 2. Fallback de simulation si le serveur est éteint
    const user = this.mockUsers.find(u => u.username === username || u.email === username);
    if (!user) {
      throw new Error("Oups ! Nous ne trouvons aucun compte avec cet identifiant en mode déconnecté.");
    }

    if (user.password !== password) {
      throw new Error("Le mot de passe saisi est incorrect en mode simulation.");
    }

    // A. Cas de la première connexion forcée
    if (user.firstLogin) {
      return {
        firstLoginRequired: true,
        userId: user.id,
        username: user.username,
        message: "C'est votre première connexion ! Par mesure de sécurité, vous devez changer votre mot de passe."
      };
    }

    // B. Cas de l'expiration du mot de passe (6 mois factices)
    // Pour simuler cela, imaginons qu'un utilisateur fictif expire pour le test.
    // (Dans cette simulation, on ne bloque pas sauf si configuré)

    // C. Connexion réussie en mémoire !
    const logged: LoggedUser = {
      userId: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      logo: user.logo
    };

    this.currentUser.set(logged);
    localStorage.setItem('talentflow_user', JSON.stringify(logged));

    return {
      success: true,
      ...logged
    };
  }

  // ==========================================
  // DECONNEXION
  // ==========================================
  public logout() {
    this.currentUser.set(null);
    localStorage.removeItem('talentflow_user');
  }

  // ==========================================
  // CHANGEMENT FORCÉ DE MOT DE PASSE
  // ==========================================
  public async forceChangePassword(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.authUrl}/force-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }
      return data;
    } catch (e: any) {
      console.warn('Backend indisponible. Traitement en simulation locale...', e.message);
      
      // Validation en mémoire
      const user = this.mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error("Utilisateur introuvable !");
      }

      // Application des règles de complexité en simulation
      const validationError = this.simulatePasswordValidation(newPassword, user);
      if (validationError) {
        throw new Error(validationError);
      }

      // Sauvegarde dans l'historique en mémoire (avant de changer !)
      if (!this.mockPasswordHistory[userId]) {
        this.mockPasswordHistory[userId] = [];
      }
      this.mockPasswordHistory[userId].unshift(user.password);
      if (this.mockPasswordHistory[userId].length > 3) {
        this.mockPasswordHistory[userId].pop(); // Ne garder que les 3 derniers
      }

      // Mise à jour
      user.password = newPassword;
      user.firstLogin = false;
      user.passwordLastChanged = new Date();

      return {
        success: true,
        message: "Super ! Votre mot de passe a été mis à jour avec succès en mode simulation."
      };
    }
  }

  // ==========================================
  // CHANGEMENT DU MOT DE PASSE DE SESSION (PROFIL)
  // ==========================================
  public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.authUrl}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la modification du mot de passe');
      }
      return data;
    } catch (e: any) {
      console.warn('Backend indisponible. Simulation locale du changement...', e.message);
      
      const user = this.mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error("Utilisateur introuvable !");
      }

      if (user.password !== oldPassword) {
        throw new Error("L'ancien mot de passe saisi est incorrect.");
      }

      // Validation
      const error = this.simulatePasswordValidation(newPassword, user);
      if (error) {
        throw new Error(error);
      }

      // Historique
      if (!this.mockPasswordHistory[userId]) {
        this.mockPasswordHistory[userId] = [];
      }
      this.mockPasswordHistory[userId].unshift(user.password);
      if (this.mockPasswordHistory[userId].length > 3) {
        this.mockPasswordHistory[userId].pop();
      }

      user.password = newPassword;
      user.passwordLastChanged = new Date();

      return {
        success: true,
        message: "[Simulateur local] Votre mot de passe a été modifié avec succès !"
      };
    }
  }

  // ==========================================
  // DEMANDE DE CODE OUBLI (FORGOT PASSWORD)
  // ==========================================
  public async forgotPassword(email: string): Promise<LoginResponse> {
    try {
      const res = await fetch(`${this.authUrl}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la demande de jeton');
      }
      return data;
    } catch (e: any) {
      console.warn('Backend indisponible. Génération locale du jeton...', e.message);

      const user = this.mockUsers.find(u => u.email === email);
      if (!user) {
        // Message identique même si l'e-mail n'existe pas pour tromper les curieux
        return {
          success: true,
          message: "Si cet e-mail existe, un code secret de 6 chiffres vous a été envoyé !"
        };
      }

      // Fabrication du jeton à 6 chiffres
      const code = String(Math.floor(100000 + Math.random() * 900000));
      user.resetToken = code;
      user.tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Valable 15 minutes

      console.log(`=========================================`);
      console.log(`🔑 SIMULATION D'ENVOI D'EMAIL (CONSOLE BROWSER)`);
      console.log(`POUR : ${email}`);
      console.log(`CODE DE RÉINITIALISATION : ${code}`);
      console.log(`=========================================`);

      return {
        success: true,
        token: code, // Renvoyé pour faciliter votre copier-coller pendant le test !
        message: `[Simulateur local] Code envoyé avec succès ! Code secret : ${code} (affiché aussi dans la console).`
      };
    }
  }

  // ==========================================
  // RÉINITIALISATION COMPLÈTE DU MOT DE PASSE (RESET PASSWORD)
  // ==========================================
  public async resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.authUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Code invalide ou expiré');
      }
      return data;
    } catch (e: any) {
      console.warn('Backend indisponible. Réinitialisation locale en cours...', e.message);

      const user = this.mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error("Adresse e-mail non reconnue.");
      }

      if (!user.resetToken || user.resetToken !== token) {
        throw new Error("Le code de sécurité saisi est incorrect.");
      }

      if (!user.tokenExpiry || new Date() > user.tokenExpiry) {
        throw new Error("Désolé, ce code secret a expiré (validité de 15 minutes dépassée).");
      }

      // Validation
      const error = this.simulatePasswordValidation(newPassword, user);
      if (error) {
        throw new Error(error);
      }

      // Historique
      if (!this.mockPasswordHistory[user.id]) {
        this.mockPasswordHistory[user.id] = [];
      }
      this.mockPasswordHistory[user.id].unshift(user.password);
      if (this.mockPasswordHistory[user.id].length > 3) {
        this.mockPasswordHistory[user.id].pop();
      }

      // Sauvegarde
      user.password = newPassword;
      user.resetToken = null;
      user.tokenExpiry = null;
      user.firstLogin = false;
      user.passwordLastChanged = new Date();

      return {
        success: true,
        message: "Victoire ! Votre mot de passe a été réinitialisé en mode local. Vous pouvez vous connecter !"
      };
    }
  }

  // ==========================================
  // VALIDATEUR DE MOT DE PASSE SIMULÉ CÔTÉ FRONTEND
  // ==========================================
  public simulatePasswordValidation(password: string, user: any): string | null {
    // 1. Taille minimale (12 par défaut)
    const minLength = 12;
    if (password.length < minLength) {
      return `Le mot de passe est trop court ! Il doit faire au moins ${minLength} caractères.`;
    }

    // 2. Lettre majuscule
    if (!/[A-Z]/.test(password)) {
      return "Il manque au moins une lettre MAJUSCULE (ex: A, B, C...).";
    }

    // 3. Chiffre
    if (!/[0-9]/.test(password)) {
      return "Il manque au moins un chiffre (0, 1, 2...).";
    }

    // 4. Caractère spécial
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return "Il manque un caractère spécial (comme @, #, $, !, %, *...).";
    }

    // 5. Pas d'infos personnelles (prénom ou nom)
    if (user.firstName && password.toLowerCase().includes(user.firstName.toLowerCase())) {
      return `Le mot de passe ne doit pas contenir votre prénom (${user.firstName}).`;
    }
    if (user.lastName && password.toLowerCase().includes(user.lastName.toLowerCase())) {
      return `Le mot de passe ne doit pas contenir votre nom de famille (${user.lastName}).`;
    }

    // 6. Historique des 3 derniers
    const history = this.mockPasswordHistory[user.id] || [];
    if (history.includes(password)) {
      return "Interdit ! Ce mot de passe ressemble trop à l'un de vos 3 derniers mots de passe utilisés.";
    }

    return null; // Pas d'erreur !
  }

  // ==========================================================
  // METTRE A JOUR LE LOGO DANS LA SESSION COURANTE ET EN BASE
  // ==========================================================
  public updateCurrentCompanyLogo(logoBase64: string) {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, logo: logoBase64 };
      this.currentUser.set(updated);
      localStorage.setItem('talentflow_user', JSON.stringify(updated));

      // Mettre à jour l'utilisateur en mémoire dans la liste
      const mockU = this.mockUsers.find(u => u.id === user.userId);
      if (mockU) {
        mockU.logo = logoBase64;
      }
    }
  }
}
