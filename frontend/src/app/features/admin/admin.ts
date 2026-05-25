import { Component, signal, computed, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '../../core/services/theme.service';
import { TranslationService, SupportedLanguage } from '../../core/services/translation.service';
import { AdminService, Company, Role, Permission, User, AppSetting } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

import { CompanyTreeComponent } from './components/company-tree/company-tree.component';
import { CompanyOrgChartComponent } from './components/company-org-chart/company-org-chart.component';
import { PermissionMatrixComponent } from './components/permission-matrix/permission-matrix.component';
import { HrReferentialsComponent } from './components/hr-referentials/hr-referentials.component';

interface EmployeeMock {
  name: string;
  email: string;
  company: string;
  role: string;
  skill: string;
  skillLevel: number;
  habilitation: string;
  habExp: string;
  habStatus: 'ok' | 'warning';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CompanyTreeComponent, CompanyOrgChartComponent, PermissionMatrixComponent, HrReferentialsComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Sidebar State (Barre latérale ouverte ou fermée)
  isSidebarCollapsed = signal<boolean>(false);

  // Tab State (Onglet actif dans l'administration)
  activeTab = signal<'companies' | 'roles' | 'settings' | 'priority'>('companies');

  // Profile and Password State (Menu déroulant et changement de mot de passe)
  isProfileDropdownOpen = signal<boolean>(false);
  isLangDropdownOpen = signal<boolean>(false);
  showPasswordModal = signal<boolean>(false);
  
  passwordFormModel = {
    currentPassword: signal<string>(''),
    newPassword: signal<string>(''),
    confirmPassword: signal<string>('')
  };

  // Sélection de la vue des Sociétés :
  // - 'tree' : Liste arborescente classique verticale
  // - 'chart' : Organigramme sous forme de rectangles multiniveaux cliquables connectés en arbre !
  companyViewMode = signal<'tree' | 'chart'>('tree');

  // =========================================================================
  // ANALYSE DU MOT DE PASSE DU PROFIL EN TEMPS RÉEL (SIGNALS COMPUTED)
  // =========================================================================
  
  // Charge la longueur minimale configurée en administration
  profileMinPasswordLength = computed(() => {
    const lengthSetting = this.adminService.settings().find(s => s.key === 'MIN_PASSWORD_LENGTH');
    if (lengthSetting) {
      const val = parseInt(lengthSetting.value);
      return isNaN(val) ? 12 : val;
    }
    return 12;
  });

  isProfileLengthValid = computed(() => {
    return this.passwordFormModel.newPassword().length >= this.profileMinPasswordLength();
  });

  isProfileCapitalValid = computed(() => {
    return /[A-Z]/.test(this.passwordFormModel.newPassword());
  });

  isProfileDigitValid = computed(() => {
    return /[0-9]/.test(this.passwordFormModel.newPassword());
  });

  isProfileSpecialValid = computed(() => {
    return /[^a-zA-Z0-9]/.test(this.passwordFormModel.newPassword());
  });

  isProfilePersonalNameValid = computed(() => {
    const pwd = this.passwordFormModel.newPassword().toLowerCase();
    if (!pwd) return true;
    const user = this.authService.currentUser();
    if (!user) return true;
    
    if (user.firstName && pwd.includes(user.firstName.toLowerCase())) {
      return false;
    }
    if (user.lastName && pwd.includes(user.lastName.toLowerCase())) {
      return false;
    }
    return true;
  });

  isProfileMatchValid = computed(() => {
    const pwd = this.passwordFormModel.newPassword();
    const conf = this.passwordFormModel.confirmPassword();
    if (!pwd || !conf) return false;
    return pwd === conf;
  });

  profilePasswordStrengthPercent = computed(() => {
    let score = 0;
    const pwd = this.passwordFormModel.newPassword();
    if (pwd.length > 0) score += 20;
    if (this.isProfileLengthValid()) score += 20;
    if (this.isProfileCapitalValid()) score += 20;
    if (this.isProfileDigitValid()) score += 20;
    if (this.isProfileSpecialValid()) score += 20;
    return score;
  });

  profileStrengthColorClass = computed(() => {
    const percent = this.profilePasswordStrengthPercent();
    if (percent <= 40) return 'strength-low';
    if (percent <= 80) return 'strength-medium';
    return 'strength-high';
  });

  // Traduction dynamique en direct de l'utilisateur connecté via l'AuthService
  get loggedInUser() {
    const user = this.authService.currentUser();
    return {
      name: user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'Amir Aouani',
      role: user?.role || 'Administrateur',
      avatar: user?.firstName ? user.firstName.charAt(0).toUpperCase() : '👤'
    };
  }

  // Toast Alerts (Les petites bulles d'alerte vertes ou rouges en haut à droite)
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  // --- COMPANIES TAB DATA ---
  selectedCompany = signal<Company | null>(null);
  isAddingSubsidiary = signal<boolean>(false);
  parentCompanyForSubsidiary = signal<Company | null>(null);
  
  companyFormModel = {
    name: '',
    vatNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    contactInfo: '',
    logo: '' // Contient le logo converti en texte Base64 (uploadé par l'utilisateur) !
  };

  // Dynamic tree computed from flat companies list
  rootCompanies = computed(() => {
    const flatList = this.adminService.companies();
    const companyMap = new Map<number, Company>();
    
    // 1. Map all to cloned nodes
    flatList.forEach(c => {
      if (c.id !== undefined) {
        companyMap.set(c.id, { ...c, subCompanies: [] });
      }
    });
    
    const roots: Company[] = [];
    
    // 2. Arrange in tree structure
    companyMap.forEach(c => {
      if (c.parent && c.parent.id && companyMap.has(c.parent.id)) {
        const parentComp = companyMap.get(c.parent.id)!;
        parentComp.subCompanies = parentComp.subCompanies || [];
        parentComp.subCompanies.push(c);
      } else {
        roots.push(c);
      }
    });
    
    return roots;
  });

  // --- ROLES & USERS TAB DATA ---
  isCreatingUser = signal<boolean>(false);
  isEditingUser = signal<boolean>(false);
  selectedUser: User | null = null;
  
  userFormModel = {
    username: '',
    email: '',
    companyId: 1,
    roleId: 1,
    active: true
  };

  // --- SETTINGS TAB DATA ---
  
  // Onglet secondaire actif pour organiser nos 100+ paramètres système par catégorie !
  // Les catégories sont :
  // - 'time' : Heures de travail et télétravail
  // - 'security' : Règles strictes des mots de passe
  // - 'hr' : Référentiels (Compétences, Formations, Habilitations)
  // - 'alerts' : Alertes de turn-over et notifications critiques
  activeSettingsSubTab = signal<'time' | 'security' | 'hr' | 'alerts'>('time');

  settingsModel = {
    WORK_START_HOUR: '08:00',
    WORK_END_HOUR: '17:00',
    MAX_HOURS_DAILY: 8,
    WFH_DAYS_WEEK: 2,
    WFH_DAYS_MONTH: 8,
    WFH_EXCEPTION_MOTIFS: '',
    
    // NOUVEAUX PARAMÈTRES DE SÉCURITÉ DES MOTS DE PASSE
    MIN_PASSWORD_LENGTH: 12,
    PASSWORD_EXPIRY_DAYS: 180,
    TOKEN_VALIDITY_MINUTES: 15,
    
    // PARAMÈTRE DE SEUIL CRITIQUE
    TURNOVER_CRITICAL_THRESHOLD: 15,

    TRAINING_THEMES: 'Audit ISO 27001,Sensibilisation RGPD,Management Agile,CI/CD SecOps,Coaching RH',
    HABILITATION_LIST: 'ISO 27001 Lead Auditor,DPO Certification,AWS Cloud Practitioner,Habilitation B2V'
  };

  // --- PRIORITY MODULES & REPORTING DATA ---
  searchQuery = signal<string>('');
  isExporting = signal<boolean>(false);
  totalEmployeesCount = 124;

  public readonly allEmployees: EmployeeMock[] = [
    { name: 'Amir Aouani', email: 'amir.aouani@tunytech.com', company: 'Tunytech Holdings', role: 'System Architect', skill: 'Java & Angular Architecture', skillLevel: 5, habilitation: 'ISO 27001 Auditor', habExp: '15 Janv 2027', habStatus: 'ok' },
    { name: 'Marie Laurent', email: 'marie.laurent@tunytech.com', company: 'Tunytech Europe', role: 'Responsable RH', skill: 'Recrutement & Onboarding', skillLevel: 4, habilitation: 'RGPD DPO Certification', habExp: '30 Oct 2026', habStatus: 'ok' },
    { name: 'Hejer Ben Ali', email: 'hejer.benali@tunytech.com', company: 'Tunytech France', role: 'Qualité Assurance', skill: 'Conformité & CAPA', skillLevel: 5, habilitation: 'ISO 9001 Lead Auditor', habExp: '12 Juin 2026', habStatus: 'warning' },
    { name: 'Thomas Mueller', email: 't.mueller@tunytech.com', company: 'Tunytech Europe', role: 'Ingénieur DevOps', skill: 'CI/CD & Cloud Infrastructure', skillLevel: 4, habilitation: 'AWS Certified Practitioner', habExp: '05 Sept 2026', habStatus: 'ok' },
    { name: 'Jan de Vries', email: 'j.devries@tunytech.com', company: 'Tunytech Holdings', role: 'Technicien Support', skill: 'Maintenance & Hardware', skillLevel: 3, habilitation: 'Habilitation Électrique B2V', habExp: '18 Mars 2026', habStatus: 'warning' }
  ];

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allEmployees;
    return this.allEmployees.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.role.toLowerCase().includes(query) || 
      e.skill.toLowerCase().includes(query) ||
      e.company.toLowerCase().includes(query) ||
      e.habilitation.toLowerCase().includes(query)
    );
  });

  constructor(
    public readonly themeService: ThemeService,
    public readonly translationService: TranslationService,
    public readonly adminService: AdminService,
    public readonly authService: AuthService
  ) {
    // Écouteur réactif : chaque fois que la liste des configurations change dans la base,
    // nous mettons à jour notre formulaire en direct !
    effect(() => {
      const activeSettings = this.adminService.settings();
      this.mapSettingsToModel(activeSettings);
    });
  }

  // ==========================================
  // ACTION DE DÉCONNEXION DE L'UTILISATEUR
  // ==========================================
  public onLogout() {
    // Nous effaçons les informations de l'utilisateur de la mémoire
    this.authService.logout();
    this.triggerToast(this.t('toast_logout_success'));
  }

  ngOnInit() {
    this.adminService.loadAllData().then(() => {
      this.adminService.fetchReferentials(this.adminService.activeCompanyId());
    });
  }

  // --- SIDEBAR ACTIONS ---
  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  setActiveTab(tab: 'companies' | 'roles' | 'settings' | 'priority') {
    this.activeTab.set(tab);
  }

  // --- TRANS / THEME SELECTORS ---
  setLanguage(lang: any) {
    this.translationService.setLanguage(lang as SupportedLanguage);
    this.triggerToast(`${this.t('msg_saved_success')}`);
  }

  selectLanguage(langCode: any) {
    this.setLanguage(langCode);
    this.isLangDropdownOpen.set(false);
  }

  setTheme(themeName: any) {
    this.themeService.setTheme(themeName as string);
    this.triggerToast(this.t('toast_theme_success'));
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  private triggerToast(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  triggerToastFromRef(message: string): void {
    this.triggerToast(message);
  }

  // --- COMPANIES TAB LOGIC ---
  onSelectCompany(id: number) {
    const found = this.adminService.companies().find(c => c.id === id);
    if (found) {
      this.selectedCompany.set(found);
      this.isAddingSubsidiary.set(false);
      this.parentCompanyForSubsidiary.set(null);
      this.mapCompanyToForm(found);
    }
  }

  onAddNewRootCompany() {
    this.selectedCompany.set(null);
    this.parentCompanyForSubsidiary.set(null);
    this.isAddingSubsidiary.set(true);
    this.clearCompanyForm();
  }

  onAddChildSubsidiary(parentCompany: Company) {
    this.selectedCompany.set(null);
    this.parentCompanyForSubsidiary.set(parentCompany);
    this.isAddingSubsidiary.set(true);
    this.clearCompanyForm();
  }

  onEditCompany(company: Company) {
    this.selectedCompany.set(company);
    this.isAddingSubsidiary.set(false);
    this.parentCompanyForSubsidiary.set(null);
    this.mapCompanyToForm(company);
  }

  private mapCompanyToForm(c: Company) {
    this.companyFormModel = {
      name: c.name || '',
      vatNumber: c.vatNumber || '',
      address: c.address || '',
      city: c.city || '',
      postalCode: c.postalCode || '',
      country: c.country || '',
      contactInfo: c.contactInfo || '',
      logo: c.logo || '' // Charger le logo s'il existe déjà
    };
  }

  private clearCompanyForm() {
    this.companyFormModel = {
      name: '',
      vatNumber: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      contactInfo: '',
      logo: '' // Remise à blanc
    };
  }

  onCancelCompanyForm() {
    this.selectedCompany.set(null);
    this.isAddingSubsidiary.set(false);
    this.parentCompanyForSubsidiary.set(null);
    this.clearCompanyForm();
  }

  async onSaveCompany(event: Event) {
    event.preventDefault();
    if (!this.companyFormModel.name) return;

    let parentRef = null;
    if (this.isAddingSubsidiary() && this.parentCompanyForSubsidiary()) {
      parentRef = { id: this.parentCompanyForSubsidiary()!.id! };
    } else if (this.selectedCompany() && this.selectedCompany()!.parent) {
      parentRef = { id: this.selectedCompany()!.parent!.id! };
    }

    const payload: Company = {
      id: this.selectedCompany()?.id,
      name: this.companyFormModel.name,
      vatNumber: this.companyFormModel.vatNumber,
      address: this.companyFormModel.address,
      city: this.companyFormModel.city,
      postalCode: this.companyFormModel.postalCode,
      country: this.companyFormModel.country,
      contactInfo: this.companyFormModel.contactInfo,
      parent: parentRef,
      logo: this.companyFormModel.logo // Insérer le logo dans le paquet de sauvegarde
    };

    const saved = await this.adminService.saveCompany(payload);
    
    // Si nous modifions la société actuellement affichée en haut à gauche pour l'utilisateur connecté,
    // nous rafraîchissons en direct son logo de session !
    if (saved && saved.id === this.authService.currentUser()?.companyId && saved.logo) {
      this.authService.updateCurrentCompanyLogo(saved.logo);
    }

    this.triggerToast(`Société "${saved.name}" enregistrée avec succès !`);
    this.onCancelCompanyForm();
  }

  // ==========================================
  // LECTURE ET VÉRIFICATION DE LA PHOTO DU LOGO (UPLOAD RÉEL)
  // ==========================================
  onLogoFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // A. Validation des 7 formats réels demandés par le cahier des charges
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'bmp', 'ico'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      alert(`Format non supporté ! L'application accepte uniquement : ${allowedExtensions.join(', ').toUpperCase()}`);
      event.target.value = ''; // On vide le sélecteur
      return;
    }

    // B. Transformation de la photo en texte (Base64) pour que l'ordinateur puisse la ranger dans la base locale
    const reader = new FileReader();
    
    // Dès que la machine a fini de lire l'image :
    reader.onload = () => {
      const base64String = reader.result as string;
      
      // On logue le succès et on met à jour notre formulaire en direct !
      this.companyFormModel.logo = base64String;
      
      this.triggerToast("Image chargée avec succès dans le formulaire ! Cliquez sur Enregistrer.");
    };
    
    reader.readAsDataURL(file);
  }

  async onDeleteCompany() {
    const active = this.selectedCompany();
    if (active && active.id !== undefined) {
      const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer la société "${active.name}" ?`);
      if (confirmDelete) {
        await this.adminService.deleteCompany(active.id);
        this.triggerToast(`Société supprimée avec succès !`);
        this.onCancelCompanyForm();
      }
    }
  }

  // --- USERS & ROLES TAB LOGIC ---
  onOpenUserCreate() {
    this.isCreatingUser.set(true);
    this.isEditingUser.set(false);
    this.selectedUser = null;
    this.userFormModel = {
      username: '',
      email: '',
      companyId: this.adminService.companies()[0]?.id || 1,
      roleId: this.adminService.roles()[0]?.id || 1,
      active: true
    };
  }

  onEditUser(u: User) {
    this.selectedUser = u;
    this.isCreatingUser.set(false);
    this.isEditingUser.set(true);
    this.userFormModel = {
      username: u.username,
      email: u.email,
      companyId: u.company?.id || 1,
      roleId: u.role?.id || 1,
      active: u.active
    };
  }

  onCancelUserForm() {
    this.isCreatingUser.set(false);
    this.isEditingUser.set(false);
    this.selectedUser = null;
  }

  async onSaveUser(event: Event) {
    event.preventDefault();
    if (!this.userFormModel.username || !this.userFormModel.email) return;

    const company = this.adminService.companies().find(c => c.id === Number(this.userFormModel.companyId));
    const role = this.adminService.roles().find(r => r.id === Number(this.userFormModel.roleId));

    const payload: User = {
      id: this.selectedUser?.id,
      username: this.userFormModel.username,
      email: this.userFormModel.email,
      active: this.userFormModel.active,
      company: company || null,
      role: role || null
    };

    const saved = await this.adminService.saveUser(payload);
    this.triggerToast(`Compte "${saved.username}" enregistré avec succès !`);
    this.onCancelUserForm();
  }

  async onDeleteUser(u: User) {
    if (u.id !== undefined) {
      const confirmDelete = confirm(`Supprimer le compte de l'utilisateur "${u.username}" ?`);
      if (confirmDelete) {
        await this.adminService.deleteUser(u.id);
        this.triggerToast(`Utilisateur supprimé !`);
      }
    }
  }

  async onUpdateRolePermissions(updatedRole: Role) {
    const saved = await this.adminService.saveRole(updatedRole);
    this.triggerToast(`Permissions du rôle "${saved.name}" mises à jour !`);
  }

  // --- SETTINGS TAB LOGIC ---
  onSelectSettingsCompany(id: any) {
    const companyId = Number(id);
    this.adminService.fetchSettings(companyId);
    this.adminService.fetchReferentials(companyId);
  }

  private mapSettingsToModel(settingsList: AppSetting[]) {
    const model = {
      WORK_START_HOUR: '08:00',
      WORK_END_HOUR: '17:00',
      MAX_HOURS_DAILY: 8,
      WFH_DAYS_WEEK: 2,
      WFH_DAYS_MONTH: 8,
      WFH_EXCEPTION_MOTIFS: '',
      
      // Sécurité des mots de passe
      MIN_PASSWORD_LENGTH: 12,
      PASSWORD_EXPIRY_DAYS: 180,
      TOKEN_VALIDITY_MINUTES: 15,
      
      // Alertes de Turn-over
      TURNOVER_CRITICAL_THRESHOLD: 15,

      TRAINING_THEMES: 'Audit ISO 27001,Sensibilisation RGPD,Management Agile,CI/CD SecOps,Coaching RH',
      HABILITATION_LIST: 'ISO 27001 Lead Auditor,DPO Certification,AWS Cloud Practitioner,Habilitation B2V'
    };

    settingsList.forEach(s => {
      if (s.key in model) {
        // Si le paramètre est censé être un nombre, nous le traduisons en type "Number" pour l'input
        const numericKeys = [
          'MAX_HOURS_DAILY', 'WFH_DAYS_WEEK', 'WFH_DAYS_MONTH', 
          'MIN_PASSWORD_LENGTH', 'PASSWORD_EXPIRY_DAYS', 
          'TOKEN_VALIDITY_MINUTES', 'TURNOVER_CRITICAL_THRESHOLD'
        ];
        if (numericKeys.includes(s.key)) {
          (model as any)[s.key] = Number(s.value);
        } else {
          (model as any)[s.key] = s.value;
        }
      }
    });

    this.settingsModel = model;
  }

  async onSaveSettings(event: Event) {
    event.preventDefault();
    const companyId = this.adminService.activeCompanyId();
    
    // Nous construisons le paquet de fiches de paramètres avec des explications claires
    const settingsArray: AppSetting[] = [
      { key: 'WORK_START_HOUR', value: this.settingsModel.WORK_START_HOUR, description: 'Heure de début de la journée' },
      { key: 'WORK_END_HOUR', value: this.settingsModel.WORK_END_HOUR, description: 'Heure de fin de la journée' },
      { key: 'MAX_HOURS_DAILY', value: String(this.settingsModel.MAX_HOURS_DAILY), description: 'Nombre maximum d\'heures de travail par jour' },
      { key: 'WFH_DAYS_WEEK', value: String(this.settingsModel.WFH_DAYS_WEEK), description: 'Jours autorisés de télétravail par semaine' },
      { key: 'WFH_DAYS_MONTH', value: String(this.settingsModel.WFH_DAYS_MONTH), description: 'Jours autorisés de télétravail par mois' },
      { key: 'WFH_EXCEPTION_MOTIFS', value: this.settingsModel.WFH_EXCEPTION_MOTIFS, description: 'Liste des motifs valides de télétravail exceptionnel' },
      
      // Sécurité des mots de passe
      { key: 'MIN_PASSWORD_LENGTH', value: String(this.settingsModel.MIN_PASSWORD_LENGTH), description: 'Longueur minimale autorisée pour les mots de passe' },
      { key: 'PASSWORD_EXPIRY_DAYS', value: String(this.settingsModel.PASSWORD_EXPIRY_DAYS), description: 'Nombre de jours avant l\'expiration obligatoire du MDP' },
      { key: 'TOKEN_VALIDITY_MINUTES', value: String(this.settingsModel.TOKEN_VALIDITY_MINUTES), description: 'Durée en minutes de la validité du code de récupération' },
      
      // Seuils critiques
      { key: 'TURNOVER_CRITICAL_THRESHOLD', value: String(this.settingsModel.TURNOVER_CRITICAL_THRESHOLD), description: 'Seuil critique de Turn-Over en pourcentage' },
      
      { key: 'TRAINING_THEMES', value: this.settingsModel.TRAINING_THEMES, description: 'Référentiel des thèmes de formation de l\'entreprise' },
      { key: 'HABILITATION_LIST', value: this.settingsModel.HABILITATION_LIST, description: 'Liste des habilitations et certifications de l\'entreprise' }
    ];

    // Envoi au service d'administration (en base de données)
    await this.adminService.saveSettings(companyId, settingsArray);
    this.triggerToast(`${this.t('msg_saved_success')}`);
  }

  // --- DÉTECTEUR GLOBAL DE CLIC POUR FERMER LE MENU PROFIL ---
  // Cette fonction magique écoute tous les clics faits sur l'écran.
  // Si le menu de profil est grand ouvert et que l'utilisateur clique ailleurs 
  // (en dehors du bloc du profil), le menu se ferme instantanément et proprement !
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Si le clic n'a pas eu lieu à l'intérieur du conteneur du profil (.profile-wrapper),
    // on range le menu en mettant son signal d'ouverture à faux.
    if (this.isProfileDropdownOpen() && !target.closest('.profile-wrapper')) {
      this.isProfileDropdownOpen.set(false);
      this.isLangDropdownOpen.set(false);
    }
  }

  // --- USER PROFILE & PASSWORD ACTIONS ---
  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
  }

  openPasswordModal() {
    this.showPasswordModal.set(true);
    this.isProfileDropdownOpen.set(false);
    this.passwordFormModel.currentPassword.set('');
    this.passwordFormModel.newPassword.set('');
    this.passwordFormModel.confirmPassword.set('');
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
  }

  async onSavePassword(event: Event) {
    event.preventDefault();
    const user = this.authService.currentUser();
    if (!user) return;

    if (!this.passwordFormModel.currentPassword() || !this.passwordFormModel.newPassword() || !this.passwordFormModel.confirmPassword()) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (!this.isProfileLengthValid() || !this.isProfileCapitalValid() || !this.isProfileDigitValid() || !this.isProfileSpecialValid()) {
      alert("Le nouveau mot de passe ne respecte pas les critères de complexité exigés.");
      return;
    }

    if (!this.isProfilePersonalNameValid()) {
      alert("Le mot de passe ne doit pas contenir votre prénom ou votre nom de famille.");
      return;
    }

    if (!this.isProfileMatchValid()) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      const res = await this.authService.changePassword(
        user.userId,
        this.passwordFormModel.currentPassword(),
        this.passwordFormModel.newPassword()
      );
      this.triggerToast(res.message || "Mot de passe modifié avec succès !");
      this.closePasswordModal();
    } catch (e: any) {
      alert(e.message || "Erreur lors du changement de mot de passe.");
    }
  }

  // --- REPORT EXPORT & SEARCH ---
  onSearch() {
    // Search is handled reactively by filteredEmployees computed signal
  }

  onExportReport() {
    this.isExporting.set(true);
    setTimeout(() => {
      this.isExporting.set(false);
      this.triggerToast(`Rapport exporté avec succès en ${this.translationService.languages.find(l => l.code === this.translationService.currentLanguage())?.name} !`);
    }, 1500);
  }
}
