import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService, SupportedLanguage } from '../../core/services/translation.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  // Nous injectons nos services magiques (nos outils spéciaux) dans notre composant
  private authService = inject(AuthService);
  protected translationService = inject(TranslationService);
  private adminService = inject(AdminService);

  // ==========================================
  // BOITES DE Saisie DE FORMULAIRE (MODELS)
  // ==========================================
  
  // Champs pour l'écran de Connexion normal
  public username = '';
  public password = '';

  // Champs pour l'écran "Mot de passe oublié"
  public email = '';

  // Champs pour l'écran de "Réinitialisation" (Saisie du Code + Nouveau Mot de passe)
  public token = '';
  public newPassword = signal<string>('');
  public confirmPassword = signal<string>('');

  // ==========================================
  // GESTION DE L'ÉCRAN ACTIF (VUES)
  // ==========================================
  
  // Cette variable dit à Angular quel panneau de contrôle afficher en premier.
  // Les options sont : 
  // - 'login' (écran de connexion normal)
  // - 'forgot' (demande de code de réinitialisation)
  // - 'reset' (saisie du code secret + nouveau mot de passe)
  // - 'forceChange' (changement obligatoire à la première connexion ou après 6 mois)
  public view: 'login' | 'forgot' | 'reset' | 'forceChange' = 'login';

  // Le signal secret qui retient si la liste déroulante des langues est grande ouverte
  // ou fermée sur l'écran d'accueil de connexion.
  public isLangDropdownOpen = signal<boolean>(false);

  // ID de l'utilisateur qui doit obligatoirement changer son mot de passe
  private userIdForForceChange: number | null = null;
  
  // Prénom et nom de l'utilisateur stockés temporairement pour vérifier 
  // qu'il ne les insère pas dans son mot de passe secret !
  private tempFirstName = '';
  private tempLastName = '';

  // ==========================================
  // SIGNAUX D'ALERTE ET DE SUCCÈS (ALERTS)
  // ==========================================
  public errorMessage = signal<string>('');
  public successMessage = signal<string>('');
  
  // Paramètres globaux récupérés depuis l'administration
  public minPasswordLength = signal<number>(12);

  ngOnInit() {
    this.loadMinLengthLimit();
  }

  /**
   * Cette fonction charge la longueur minimale configurée par l'administrateur.
   * Si aucune valeur n'est trouvée, on garde 12 par défaut (la norme solide).
   */
  private async loadMinLengthLimit() {
    try {
      // Nous allons piocher dans les paramètres de la société active
      const companyId = this.adminService.activeCompanyId();
      await this.adminService.fetchSettings(companyId);
      const settings = this.adminService.settings();
      const lengthSetting = settings.find(s => s.key === 'MIN_PASSWORD_LENGTH');
      if (lengthSetting) {
        const val = parseInt(lengthSetting.value);
        if (!isNaN(val)) {
          this.minPasswordLength.set(val);
        }
      }
    } catch (e) {
      this.minPasswordLength.set(12); // Fallback de sécurité
    }
  }

  // =========================================================================
  // ANALYSE DU NOUVEAU MOT DE PASSE EN TEMPS RÉEL (POUR UN BEAU VISUEL)
  // =========================================================================

  // 1. Est-ce que le mot de passe est assez long ?
  // Cette méthode vérifie que le texte tapé a plus de caractères que le chiffre minimum choisi par l'administrateur.
  public isLengthValid = computed(() => {
    return this.newPassword().length >= this.minPasswordLength();
  });

  // 2. Contient-il une lettre MAJUSCULE ?
  // Cette méthode regarde si une lettre de A à Z en grand se cache dans le texte.
  public isCapitalValid = computed(() => {
    return /[A-Z]/.test(this.newPassword());
  });

  // 3. Contient-il un chiffre ?
  // Cette méthode cherche au moins un numéro (0, 1, 2... 9) dans le texte.
  public isDigitValid = computed(() => {
    return /[0-9]/.test(this.newPassword());
  });

  // 4. Contient-il un caractère spécial ?
  // Cette méthode regarde s'il y a un symbole bizarre comme un point d'exclamation ou un arobase.
  public isSpecialValid = computed(() => {
    return /[^a-zA-Z0-9]/.test(this.newPassword());
  });

  // 5. Est-ce qu'il ne contient pas le prénom ou le nom de famille de l'utilisateur ?
  // On compare en transformant tout en petites lettres pour ne pas se faire piéger par les majuscules !
  public isPersonalNameValid = computed(() => {
    const pwd = this.newPassword().toLowerCase();
    if (!pwd) return true; // Si c'est vide, il n'y a pas d'erreur, donc c'est vert.
    
    if (this.tempFirstName && pwd.includes(this.tempFirstName.toLowerCase())) {
      return false; // Erreur : le prénom est présent !
    }
    if (this.tempLastName && pwd.includes(this.tempLastName.toLowerCase())) {
      return false; // Erreur : le nom de famille est présent !
    }
    return true; // Parfait : le prénom et le nom sont bien absents.
  });

  // 6. Est-ce que la confirmation correspond exactement ?
  // On compare si le deuxième texte tapé est le jumeau parfait du premier !
  public isMatchValid = computed(() => {
    const pwd = this.newPassword();
    const conf = this.confirmPassword();
    if (!pwd || !conf) return false;
    return pwd === conf;
  });

  // 7. Calcul d'une barre de force du mot de passe (en pourcentage : 0%, 25%, 50%, 75%, 100%)
  // Chaque règle respectée fait gagner 20 points à l'utilisateur !
  public passwordStrengthPercent = computed(() => {
    let score = 0;
    const pwd = this.newPassword();
    if (pwd.length > 0) score += 20;
    if (this.isLengthValid()) score += 20;
    if (this.isCapitalValid()) score += 20;
    if (this.isDigitValid()) score += 20;
    if (this.isSpecialValid()) score += 20;
    return score;
  });

  // Couleur de la barre de force (rouge = faible, orange = moyen, vert = fort)
  public strengthColorClass(): string {
    const percent = this.passwordStrengthPercent();
    if (percent <= 40) return 'strength-low';
    if (percent <= 80) return 'strength-medium';
    return 'strength-high';
  }

  // ==========================================
  // CLIC : BOUTON SE CONNECTER
  // ==========================================
  public async onLogin(event: Event) {
    event.preventDefault(); // Empêche la page de se recharger
    this.clearMessages();

    try {
      const response = await this.authService.login(this.username, this.password);

      // CAS A : Première connexion - obligation de changer son mot de passe !
      if (response.firstLoginRequired && response.userId) {
        this.userIdForForceChange = response.userId;
        this.tempFirstName = response.firstName || 'Amir';
        this.tempLastName = response.lastName || 'Nouveau';
        this.view = 'forceChange';
        this.successMessage.set("Connexion réussie ! Veuillez maintenant définir un mot de passe sécurisé.");
        return;
      }

      // CAS B : Le mot de passe a expiré (6 mois de vie dépassés)
      if (response.passwordExpired && response.userId) {
        this.userIdForForceChange = response.userId;
        this.tempFirstName = response.firstName || '';
        this.tempLastName = response.lastName || '';
        this.view = 'forceChange';
        this.errorMessage.set("Votre mot de passe a expiré après 180 jours de bons et loyaux services. Veuillez le changer !");
        return;
      }

      // CAS C : Connexion réussie, l'état global a été mis à jour par l'AuthService
      this.successMessage.set("Connexion réussie ! Redirection en cours...");
    } catch (e: any) {
      this.errorMessage.set(e.message || "Impossible de se connecter.");
    }
  }

  // ==========================================
  // CLIC : DEMANDE DE RÉCUPÉRATION (FORGOT)
  // ==========================================
  public async onForgot(event: Event) {
    event.preventDefault();
    this.clearMessages();

    if (!this.email) {
      this.errorMessage.set("Veuillez saisir votre adresse e-mail !");
      return;
    }

    try {
      const response = await this.authService.forgotPassword(this.email);
      this.successMessage.set(response.message || "Code secret généré !");
      
      // En mode développement local, on récupère directement le jeton
      if (response.token) {
        this.token = response.token; 
      }
      
      // On bascule automatiquement sur l'écran de réinitialisation !
      this.view = 'reset';
    } catch (e: any) {
      this.errorMessage.set(e.message || "Erreur lors de la demande.");
    }
  }

  // ==========================================
  // CLIC : CRÉATION DU NOUVEAU MOT DE PASSE (RESET)
  // ==========================================
  public async onReset(event: Event) {
    event.preventDefault();
    this.clearMessages();

    if (!this.token) {
      this.errorMessage.set("Veuillez saisir le code secret à 6 chiffres !");
      return;
    }

    if (!this.isLengthValid() || !this.isCapitalValid() || !this.isDigitValid() || !this.isSpecialValid()) {
      this.errorMessage.set("Le nouveau mot de passe ne respecte pas les critères de sécurité obligatoires.");
      return;
    }

    if (!this.isMatchValid()) {
      this.errorMessage.set("Les deux mots de passe saisis ne correspondent pas !");
      return;
    }

    try {
      const res = await this.authService.resetPassword(this.email, this.token, this.newPassword());
      this.successMessage.set(res.message || "Félicitations, votre mot de passe a été mis à jour !");
      
      // On efface les champs
      this.newPassword.set('');
      this.confirmPassword.set('');
      this.token = '';
      this.email = '';
      
      // On retourne à l'accueil de connexion
      setTimeout(() => {
        this.view = 'login';
        this.clearMessages();
      }, 3000);
    } catch (e: any) {
      this.errorMessage.set(e.message || "Échec de la réinitialisation.");
    }
  }

  // ==========================================
  // CLIC : CHANGEMENT DE MOT DE PASSE OBLIGATOIRE (FORCE)
  // ==========================================
  public async onForceChange(event: Event) {
    event.preventDefault();
    this.clearMessages();

    if (!this.userIdForForceChange) {
      this.errorMessage.set("Erreur interne : aucun utilisateur associé.");
      return;
    }

    if (!this.isLengthValid() || !this.isCapitalValid() || !this.isDigitValid() || !this.isSpecialValid()) {
      this.errorMessage.set("Veuillez respecter tous les critères de complexité exigés !");
      return;
    }

    if (!this.isPersonalNameValid()) {
      this.errorMessage.set("Sécurité : Le mot de passe ne doit pas contenir votre nom ou prénom !");
      return;
    }

    if (!this.isMatchValid()) {
      this.errorMessage.set("Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await this.authService.forceChangePassword(this.userIdForForceChange, this.newPassword());
      this.successMessage.set(res.message || "Mot de passe mis à jour !");

      this.newPassword.set('');
      this.confirmPassword.set('');

      // On retourne à la connexion pour tester la nouvelle clé
      setTimeout(() => {
        this.view = 'login';
        this.clearMessages();
      }, 3000);
    } catch (e: any) {
      this.errorMessage.set(e.message || "Échec de la mise à jour forcée.");
    }
  }

  // ==========================================
  // NAVIGATION SIMPLIFIÉE ENTRE LES PANNEAUX
  // ==========================================
  public switchView(newView: 'login' | 'forgot' | 'reset' | 'forceChange') {
    this.clearMessages();
    this.view = newView;
    
    // On réinitialise les boîtes
    this.newPassword.set('');
    this.confirmPassword.set('');
  }

  // ==========================================
  // OUTILS PRATIQUES (HELPERS)
  // ==========================================
  private clearMessages() {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // --- DÉTECTEUR GLOBAL DE CLIC POUR FERMER LE MENU DES LANGUES ---
  // Si l'utilisateur clique en dehors de la boîte de sélection de la langue,
  // la liste d'options se ferme automatiquement et proprement !
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isLangDropdownOpen() && !target.closest('.language-dropdown-container')) {
      this.isLangDropdownOpen.set(false);
    }
  }

  // Ouvrir ou fermer le menu de sélection de langue
  public toggleLangDropdown() {
    this.isLangDropdownOpen.update(v => !v);
  }

  // Changer de langue i18n et refermer la boîte magique
  public selectLanguage(langCode: string) {
    this.translationService.setLanguage(langCode as SupportedLanguage);
    this.isLangDropdownOpen.set(false);
  }
}
