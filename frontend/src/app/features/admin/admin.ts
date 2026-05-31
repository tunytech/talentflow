import { Component, signal, computed, OnInit, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '../../core/services/theme.service';
import { TranslationService, SupportedLanguage } from '../../core/services/translation.service';
import { AdminService, Company, Role, Permission, User, Employee, EmployeePostAssignment, AppSetting, EmailAlertConfig, SystemNotification, EvaluationCampaign, EvaluationSkill, Evaluation } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

import { CompanyTreeComponent } from './components/company-tree/company-tree.component';
import { CompanyOrgChartComponent } from './components/company-org-chart/company-org-chart.component';
import { PermissionMatrixComponent } from './components/permission-matrix/permission-matrix.component';
import { HrReferentialsComponent } from './components/hr-referentials/hr-referentials.component';

// PrimeNG UI Modules
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

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
  imports: [
    CommonModule, 
    FormsModule, 
    CompanyTreeComponent, 
    CompanyOrgChartComponent, 
    PermissionMatrixComponent, 
    HrReferentialsComponent,
    TableModule,
    SelectModule,
    SliderModule,
    ProgressBarModule,
    DialogModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
    ButtonModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Static options lists for PrimeNG dropdown selectors
  frequencies = [
    { label: 'Annuelle', value: 'Annuelle' },
    { label: 'Semestrielle', value: 'Semestrielle' },
    { label: 'Trimestrielle', value: 'Trimestrielle' }
  ];

  campaignStatuses = [
    { label: '📅 Planifiée', value: 'PLANIFIEE' },
    { label: '🟢 En Cours', value: 'EN_COURS' },
    { label: '🔴 Clôturée', value: 'CLOTUREE' },
    { label: '⚠️ En Retard', value: 'EN_RETARD' }
  ];

  skillLevels = [
    { label: '★☆☆☆☆ (Débutant)', value: 1 },
    { label: '★★☆☆☆ (Intermédiaire)', value: 2 },
    { label: '★★★☆☆ (Confirmé)', value: 3 },
    { label: '★★★★☆ (Avancé)', value: 4 },
    { label: '★★★★★ (Expert)', value: 5 }
  ];

  // Computed signal arrays to link flat database structures reactively into PrimeNG Dropdowns
  genderDropdownOptions = computed(() => {
    return this.genderOptions().map(g => ({ label: g, value: g }));
  });

  companyDropdownOptions = computed(() => {
    return this.adminService.companies().map(c => ({ label: c.name || 'Sans nom', value: c.id }));
  });

  managerDropdownOptions = computed(() => {
    return this.adminService.employees().map(emp => ({ label: `${emp.firstName} ${emp.lastName}`, value: emp.id }));
  });

  jobProfileDropdownOptions = computed(() => {
    return this.jobProfileOptions().map(jp => ({ label: jp.name || 'Sans titre', value: jp.id }));
  });

  // Sidebar State (Barre latérale ouverte ou fermée)
  isSidebarCollapsed = signal<boolean>(false);
  isSkillsMenuExpanded = signal<boolean>(false);

  // Tab State (Onglet actif dans l'administration)
  activeTab = signal<'companies' | 'users' | 'employees' | 'job-profiles' | 'skills-mapping' | 'security' | 'email-alerts' | 'connection-notifications' | 'priority-dashboard' | 'evaluation-campaigns' | 'skills-evaluation' | 'certifications'>('companies');

  // Support lists for alerts and notifications
  emailAlerts = signal<EmailAlertConfig[]>([]);
  notificationsList = signal<SystemNotification[]>([]);

  // EPIC-03 EVALUATIONS & CAMPAIGNS SIGNALS
  campaignsList = signal<EvaluationCampaign[]>([]);
  evaluationsList = signal<Evaluation[]>([]);
  selfEvaluationsList = signal<Evaluation[]>([]);
  teamEvaluationsList = signal<Evaluation[]>([]);
  selectedEvaluation = signal<Evaluation | null>(null);
  selectedCampaignId = signal<number | null>(null);

  isViewingEvaluation = signal<boolean>(false);
  isEvaluatingSelf = signal<boolean>(false);
  isEvaluatingArbitrage = signal<boolean>(false);

  isCreatingCampaign = signal<boolean>(false);
  isEditingCampaign = signal<boolean>(false);

  campaignFormModel = {
    id: undefined as number | undefined,
    name: '',
    frequency: 'Annuelle',
    startDate: new Date("2026-05-31").toISOString().split('T')[0],
    endDate: new Date("2026-06-30").toISOString().split('T')[0],
    status: 'PLANIFIEE' as 'PLANIFIEE' | 'EN_COURS' | 'CLOTUREE' | 'EN_RETARD'
  };

  evaluationSelfFormModel = {
    selfComment: '',
    trainingRequest: '',
    skills: [] as any[]
  };

  evaluationArbitrageFormModel = {
    managerComment: '',
    trainingRecommendation: '',
    skills: [] as any[]
  };

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
    active: true,
    firstName: '',
    lastName: '',
    employeeId: null as number | null
  };

  isCreatingEmployee = signal<boolean>(false);
  isEditingEmployee = signal<boolean>(false);
  selectedEmployee: Employee | null = null;

  // Option de genre dynamique sans hardcoding (chargée depuis les réglages Administration)
  genderOptions = computed(() => {
    const setting = this.adminService.settings().find(s => s.key === 'GENDER_LIST');
    if (setting && setting.value) {
      return setting.value.split(',').map(s => s.trim());
    }
    return ['Homme', 'Femme', 'Non défini'];
  });

  // Profils métiers dynamiques sans hardcoding (chargés depuis le référentiel des postes)
  jobProfileOptions = computed(() => {
    return this.adminService.jobProfiles().filter(jp => jp.active);
  });

  // Nombre d'habilitations expirant dans moins de 90 jours
  upcomingHabilitationExpirationsCount = computed(() => {
    return this.adminService.employees().filter(e => {
      if (!e.habilitationExpiryDate) return false;
      return this.getHabStatus(e.habilitationExpiryDate) === 'warning';
    }).length;
  });

  // Calcul dynamique de la moyenne d'âge active pour la société courante (computed)
  averageAge = computed(() => {
    const activeId = this.adminService.activeCompanyId();
    const empList = this.adminService.employees().filter(e => e.active && e.company?.id === activeId);
    if (empList.length === 0) return 0;
    
    let totalAge = 0;
    let count = 0;
    const currentYear = new Date("2026-05-25").getFullYear(); // Current mock time year
    
    empList.forEach(e => {
      if (e.birthDate) {
        const birthYear = new Date(e.birthDate).getFullYear();
        if (!isNaN(birthYear)) {
          totalAge += (currentYear - birthYear);
          count++;
        }
      }
    });
    
    return count > 0 ? Math.round(totalAge / count) : 0;
  });

  // Départs en retraite proches (computed)
  upcomingDepartures = computed(() => {
    const activeId = this.adminService.activeCompanyId();
    const empList = this.adminService.employees().filter(e => e.active && e.company?.id === activeId);
    const currentYear = new Date("2026-05-25").getFullYear();
    
    return empList
      .filter(e => e.retirementDate)
      .map(e => {
        const retYear = new Date(e.retirementDate!).getFullYear();
        return {
          name: `${e.firstName} ${e.lastName}`,
          retirementDate: e.retirementDate,
          yearsRemaining: !isNaN(retYear) ? retYear - currentYear : 0
        };
      })
      .sort((a, b) => new Date(a.retirementDate!).getTime() - new Date(b.retirementDate!).getTime())
      .slice(0, 5);
  });

  employeeFormModel = {
    firstName: '',
    lastName: '',
    email: '',
    companyId: 1,
    jobTitle: '',
    keySkill: '',
    skillLevel: 1,
    habilitationName: '',
    habilitationExpiryDate: '',
    active: true,
    
    // Nouveaux champs riches paramétrables
    phoneNumber: '',
    birthDate: '',
    gender: 'Non défini',
    department: '',
    managerId: null as number | null,
    entryDate: '',
    retirementDate: '',
    postAssignments: [] as EmployeePostAssignment[]
  };

  addPostAssignment() {
    const defaultProfile = this.jobProfileOptions()[0];
    if (!defaultProfile) {
      alert("Veuillez d'abord configurer des profils métiers dans l'onglet Administration !");
      return;
    }
    
    this.employeeFormModel.postAssignments.push({
      jobProfile: defaultProfile,
      startDate: new Date("2026-05-25").toISOString().split('T')[0],
      active: true
    });
  }

  removePostAssignment(index: number) {
    this.employeeFormModel.postAssignments.splice(index, 1);
  }

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
    HABILITATION_LIST: 'ISO 27001 Lead Auditor,DPO Certification,AWS Cloud Practitioner,Habilitation B2V',
    
    // PARAMÈTRE DYNAMIQUE GENDER_LIST
    GENDER_LIST: 'Homme,Femme,Non défini'
  };

  // --- PRIORITY MODULES & REPORTING DATA ---
  searchQuery = signal<string>('');
  isExporting = signal<boolean>(false);
  
  totalEmployeesCount = computed(() => this.adminService.employees().length);

  // --- FILTERS & SEARCH FOR COLLABORATORS REGISTRY ---
  selectedBranchFilterId = signal<number | null>(null);
  employeeSearchQuery = signal<string>('');

  filteredRegistryEmployees = computed(() => {
    let list = this.adminService.employees();
    
    // Filter by active branch (company)
    const branchId = this.selectedBranchFilterId();
    if (branchId !== null) {
      list = list.filter(e => e.company?.id === branchId);
    }
    
    // Filter by search query
    const query = this.employeeSearchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(query) ||
        (e.email && e.email.toLowerCase().includes(query)) ||
        (e.jobTitle && e.jobTitle.toLowerCase().includes(query)) ||
        (e.company?.name && e.company.name.toLowerCase().includes(query)) ||
        (e.department && e.department.toLowerCase().includes(query))
      );
    }
    
    return list;
  });

  // Helper to format dates in French e.g., "15 Janv 2027"
  formatExpiryDate(dateStr?: string): string {
    if (!dateStr) return 'Aucune';
    try {
      const date = new Date(dateStr);
      const months = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  }

  // Helper to calculate dynamic warning status (warning if expiring in less than 90 days)
  getHabStatus(dateStr?: string): 'ok' | 'warning' {
    if (!dateStr) return 'ok';
    try {
      const expiry = new Date(dateStr);
      const now = new Date("2026-05-25"); // Current time
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < 90 ? 'warning' : 'ok';
    } catch {
      return 'ok';
    }
  }

  filteredEmployees = computed(() => {
    const empList = this.adminService.employees();
    const query = this.searchQuery().toLowerCase().trim();
    
    const mapped = empList.map(e => {
      return {
        name: `${e.firstName} ${e.lastName}`.trim(),
        email: e.email,
        company: e.company?.name || 'N/A',
        role: e.jobTitle || 'Collaborateur',
        skill: e.keySkill || 'N/A',
        skillLevel: e.skillLevel || 1,
        habilitation: e.habilitationName || 'Aucune',
        habExp: this.formatExpiryDate(e.habilitationExpiryDate),
        habStatus: this.getHabStatus(e.habilitationExpiryDate),
        active: e.active
      };
    });

    const activeOnly = mapped.filter(e => e.active);

    if (!query) return activeOnly;
    return activeOnly.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.role.toLowerCase().includes(query) || 
      e.skill.toLowerCase().includes(query) ||
      e.company.toLowerCase().includes(query) ||
      e.habilitation.toLowerCase().includes(query)
    );
  });

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 768) {
      this.isSidebarCollapsed.set(true);
    } else {
      this.isSidebarCollapsed.set(false);
    }
  }

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
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed.set(true);
    }
    this.adminService.loadAllData().then(() => {
      this.adminService.fetchReferentials(this.adminService.activeCompanyId());
      this.loadEmailAlerts();
      this.loadNotifications();
    });
  }

  async loadEmailAlerts() {
    this.emailAlerts.set(await this.adminService.fetchEmailAlerts());
  }

  async loadNotifications() {
    this.notificationsList.set(await this.adminService.fetchNotifications());
  }

  async onToggleEmailAlert(config: EmailAlertConfig) {
    if (config.id) {
      try {
        await this.adminService.toggleEmailAlert(config.id);
        await this.loadEmailAlerts();
        this.triggerToast("Alerte e-mail mise à jour !");
      } catch (e: any) {
        alert(e.message || "Erreur lors de la modification de l'alerte.");
      }
    }
  }

  async onAcknowledgeNotification(notif: SystemNotification) {
    if (notif.id) {
      try {
        await this.adminService.acknowledgeNotification(notif.id);
        await this.loadNotifications();
        this.triggerToast("Notification acquittée !");
      } catch (e: any) {
        alert(e.message || "Erreur lors de l'acquittement.");
      }
    }
  }

  async onUnlockUser(u: User) {
    if (u.id) {
      try {
        await this.adminService.unlockUser(u.id);
        this.triggerToast("L'utilisateur a été déverrouillé avec succès !");
      } catch (e: any) {
        alert(e.message || "Erreur de déverrouillage.");
      }
    }
  }

  // --- SIDEBAR ACTIONS ---
  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  setActiveTab(tab: 'companies' | 'users' | 'employees' | 'job-profiles' | 'skills-mapping' | 'security' | 'email-alerts' | 'connection-notifications' | 'priority-dashboard' | 'evaluation-campaigns' | 'skills-evaluation' | 'certifications') {
    this.activeTab.set(tab);
    if (tab === 'email-alerts') {
      this.loadEmailAlerts();
    } else if (tab === 'connection-notifications') {
      this.loadNotifications();
    } else if (tab === 'evaluation-campaigns') {
      this.loadCampaigns();
    } else if (tab === 'skills-evaluation') {
      this.loadSelfEvaluations();
      this.loadTeamEvaluations();
    }
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
      active: true,
      firstName: '',
      lastName: '',
      employeeId: null
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
      active: u.active,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      employeeId: u.employee?.id || null
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
    const employee = this.userFormModel.employeeId 
      ? this.adminService.employees().find(e => e.id === Number(this.userFormModel.employeeId)) 
      : null;

    const payload: User = {
      id: this.selectedUser?.id,
      username: this.userFormModel.username,
      email: this.userFormModel.email,
      active: this.userFormModel.active,
      company: company || null,
      role: role || null,
      employee: employee || null,
      firstName: employee ? employee.firstName : this.userFormModel.firstName,
      lastName: employee ? employee.lastName : this.userFormModel.lastName
    };

    const saved = await this.adminService.saveUser(payload);
    this.triggerToast(`Compte "${saved.username}" enregistré avec succès !`);
    this.onCancelUserForm();
  }

  async onDeleteUser(u: User) {
    if (u.id !== undefined) {
      const confirmDelete = confirm(`Désactiver le compte de l'utilisateur "${u.username}" ?`);
      if (confirmDelete) {
        await this.adminService.deleteUser(u.id);
        this.triggerToast(`Utilisateur désactivé !`);
      }
    }
  }

  // --- EMPLOYEES CRUD LOGIC ---
  onOpenEmployeeCreate() {
    this.isCreatingEmployee.set(true);
    this.isEditingEmployee.set(false);
    this.selectedEmployee = null;
    this.employeeFormModel = {
      firstName: '',
      lastName: '',
      email: '',
      companyId: this.adminService.activeCompanyId(),
      jobTitle: '',
      keySkill: '',
      skillLevel: 1,
      habilitationName: '',
      habilitationExpiryDate: '',
      active: true,
      
      // New rich fields
      phoneNumber: '',
      birthDate: '',
      gender: this.genderOptions()[0] || 'Non défini',
      department: '',
      managerId: null as number | null,
      entryDate: '',
      retirementDate: '',
      postAssignments: [] as EmployeePostAssignment[]
    };
  }

  onEditEmployee(e: Employee) {
    this.selectedEmployee = e;
    this.isCreatingEmployee.set(false);
    this.isEditingEmployee.set(true);
    this.employeeFormModel = {
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      companyId: e.company?.id || 1,
      jobTitle: e.jobTitle || '',
      keySkill: e.keySkill || '',
      skillLevel: e.skillLevel || 1,
      habilitationName: e.habilitationName || '',
      habilitationExpiryDate: e.habilitationExpiryDate || '',
      active: e.active,
      
      // New rich fields
      phoneNumber: e.phoneNumber || '',
      birthDate: e.birthDate || '',
      gender: e.gender || 'Non défini',
      department: e.department || '',
      managerId: e.manager?.id || null,
      entryDate: e.entryDate || '',
      retirementDate: e.retirementDate || '',
      postAssignments: e.postAssignments ? [...e.postAssignments] : []
    };
  }

  onCancelEmployeeForm() {
    this.isCreatingEmployee.set(false);
    this.isEditingEmployee.set(false);
    this.selectedEmployee = null;
  }

  async onSaveEmployee(event: Event) {
    event.preventDefault();
    if (!this.employeeFormModel.firstName || !this.employeeFormModel.lastName || !this.employeeFormModel.email) return;

    const company = this.adminService.companies().find(c => c.id === Number(this.employeeFormModel.companyId));
    const manager = this.employeeFormModel.managerId 
      ? this.adminService.employees().find(emp => emp.id === Number(this.employeeFormModel.managerId))
      : null;

    const payload: Employee = {
      id: this.selectedEmployee?.id,
      firstName: this.employeeFormModel.firstName,
      lastName: this.employeeFormModel.lastName,
      email: this.employeeFormModel.email,
      company: company || null,
      jobTitle: this.employeeFormModel.jobTitle,
      keySkill: this.employeeFormModel.keySkill,
      skillLevel: Number(this.employeeFormModel.skillLevel),
      habilitationName: this.employeeFormModel.habilitationName,
      habilitationExpiryDate: this.employeeFormModel.habilitationExpiryDate || undefined,
      active: this.employeeFormModel.active,
      
      // New rich fields
      phoneNumber: this.employeeFormModel.phoneNumber,
      birthDate: this.employeeFormModel.birthDate || undefined,
      gender: this.employeeFormModel.gender,
      department: this.employeeFormModel.department,
      manager: manager || null,
      entryDate: this.employeeFormModel.entryDate || undefined,
      retirementDate: this.employeeFormModel.retirementDate || undefined,
      postAssignments: this.employeeFormModel.postAssignments
    };

    const saved = await this.adminService.saveEmployee(payload);
    this.triggerToast(`Collaborateur "${saved.firstName} ${saved.lastName}" enregistré avec succès !`);
    this.onCancelEmployeeForm();
  }

  async onDeleteEmployee(e: Employee) {
    if (e.id !== undefined) {
      const confirmDelete = confirm(`Désactiver le collaborateur "${e.firstName} ${e.lastName}" ?`);
      if (confirmDelete) {
        await this.adminService.deleteEmployee(e.id);
        this.triggerToast(`Collaborateur désactivé !`);
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
      HABILITATION_LIST: 'ISO 27001 Lead Auditor,DPO Certification,AWS Cloud Practitioner,Habilitation B2V',
      
      // Dynamic gender list
      GENDER_LIST: 'Homme,Femme,Non défini'
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
      { key: 'HABILITATION_LIST', value: this.settingsModel.HABILITATION_LIST, description: 'Liste des habilitations et certifications de l\'entreprise' },
      { key: 'GENDER_LIST', value: this.settingsModel.GENDER_LIST, description: 'Liste des genres autorisés pour les collaborateurs (séparés par des virgules)' }
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

  // --- EPIC-03 CAMPAIGNS AND EVALUATIONS METHODS ---
  get loggedInEmployeeId(): number | null {
    const user = this.adminService.users().find(u => u.id === this.authService.currentUser()?.userId);
    if (user?.employee?.id) {
      return user.employee.id;
    }
    const username = this.authService.currentUser()?.username;
    if (username === 'admin') return 1;
    if (username === 'rh.france') return 2;
    if (username === 'nouveau.employe') return 3;
    if (username === 'hejer.benali') return 4;
    if (username === 'jan.devries') return 5;
    return null;
  }

  async loadCampaigns() {
    const companyId = this.adminService.activeCompanyId();
    const data = await this.adminService.fetchCampaigns(companyId);
    this.campaignsList.set(data);
    if (data.length > 0 && this.selectedCampaignId() === null) {
      this.selectedCampaignId.set(data[0].id || null);
    }
    await this.loadCampaignEvaluations();
  }

  async loadCampaignEvaluations() {
    const campaignId = this.selectedCampaignId();
    if (campaignId !== null) {
      const data = await this.adminService.fetchEvaluationsByCampaign(campaignId);
      this.evaluationsList.set(data);
    } else {
      this.evaluationsList.set([]);
    }
  }

  async loadSelfEvaluations() {
    const empId = this.loggedInEmployeeId;
    if (empId) {
      const data = await this.adminService.fetchEvaluationsByEmployee(empId);
      this.selfEvaluationsList.set(data);
    } else {
      this.selfEvaluationsList.set([]);
    }
  }

  async loadTeamEvaluations() {
    const empId = this.loggedInEmployeeId;
    if (empId) {
      const data = await this.adminService.fetchEvaluationsByManager(empId);
      this.teamEvaluationsList.set(data);
    } else {
      this.teamEvaluationsList.set([]);
    }
  }

  onOpenCampaignCreate() {
    this.isCreatingCampaign.set(true);
    this.isEditingCampaign.set(false);
    this.campaignFormModel = {
      id: undefined,
      name: '',
      frequency: 'Annuelle',
      startDate: new Date("2026-05-31").toISOString().split('T')[0],
      endDate: new Date("2026-06-30").toISOString().split('T')[0],
      status: 'PLANIFIEE'
    };
  }

  onEditCampaign(c: EvaluationCampaign) {
    this.isCreatingCampaign.set(false);
    this.isEditingCampaign.set(true);
    this.campaignFormModel = {
      id: c.id,
      name: c.name,
      frequency: c.frequency,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status
    };
  }

  onCancelCampaignForm() {
    this.isCreatingCampaign.set(false);
    this.isEditingCampaign.set(false);
  }

  async onSaveCampaign(event: Event) {
    event.preventDefault();
    if (!this.campaignFormModel.name) return;

    const companyId = this.adminService.activeCompanyId();
    const payload: EvaluationCampaign = {
      id: this.campaignFormModel.id,
      name: this.campaignFormModel.name,
      frequency: this.campaignFormModel.frequency,
      startDate: this.campaignFormModel.startDate,
      endDate: this.campaignFormModel.endDate,
      status: this.campaignFormModel.status,
      company: { id: companyId, name: '' }
    };

    await this.adminService.saveCampaign(payload);
    this.triggerToast(`Campagne d'évaluation enregistrée avec succès !`);
    this.onCancelCampaignForm();
    await this.loadCampaigns();
  }

  async onCheckCampaignAlerts() {
    try {
      const res = await this.adminService.checkCampaignAlerts();
      await this.loadNotifications();
      this.triggerToast(`Système d'alertes exécuté : ${res.message || 'Succès'}`);
    } catch (e: any) {
      alert("Erreur lors de l'exécution des alertes : " + e.message);
    }
  }

  onViewEvaluation(evalObj: Evaluation) {
    this.selectedEvaluation.set(evalObj);
    this.isViewingEvaluation.set(true);
    this.isEvaluatingSelf.set(false);
    this.isEvaluatingArbitrage.set(false);
  }

  onStartSelfEvaluation(evalObj: Evaluation) {
    this.selectedEvaluation.set(evalObj);
    this.isViewingEvaluation.set(false);
    this.isEvaluatingSelf.set(true);
    this.isEvaluatingArbitrage.set(false);

    this.evaluationSelfFormModel = {
      selfComment: evalObj.selfComment || '',
      trainingRequest: evalObj.trainingRequest || '',
      skills: evalObj.skills.map(s => ({
        id: s.id,
        skillId: s.skillId,
        skillName: s.skillName,
        skillDescription: s.skillDescription,
        expectedLevel: s.expectedLevel,
        selfLevel: s.selfLevel || 1,
        mandatory: s.mandatory
      }))
    };
  }

  onStartArbitrage(evalObj: Evaluation) {
    this.selectedEvaluation.set(evalObj);
    this.isViewingEvaluation.set(false);
    this.isEvaluatingSelf.set(false);
    this.isEvaluatingArbitrage.set(true);

    this.evaluationArbitrageFormModel = {
      managerComment: evalObj.managerComment || '',
      trainingRecommendation: evalObj.trainingRecommendation || '',
      skills: evalObj.skills.map(s => ({
        id: s.id,
        skillId: s.skillId,
        skillName: s.skillName,
        skillDescription: s.skillDescription,
        expectedLevel: s.expectedLevel,
        selfLevel: s.selfLevel,
        acquiredLevel: s.acquiredLevel || s.selfLevel || 1,
        managerComment: s.managerComment || '',
        mandatory: s.mandatory
      }))
    };
  }

  onCancelEvaluationForms() {
    this.isViewingEvaluation.set(false);
    this.isEvaluatingSelf.set(false);
    this.isEvaluatingArbitrage.set(false);
    this.selectedEvaluation.set(null);
  }

  async onSaveSelfEvaluation(event: Event) {
    event.preventDefault();
    const evalId = this.selectedEvaluation()?.id;
    if (evalId) {
      await this.adminService.submitSelfEvaluation(evalId, this.evaluationSelfFormModel);
      this.triggerToast("Votre auto-évaluation a été transmise au manager !");
      this.onCancelEvaluationForms();
      await this.loadSelfEvaluations();
    }
  }

  async onSaveArbitrage(event: Event) {
    event.preventDefault();
    const evalId = this.selectedEvaluation()?.id;
    if (evalId) {
      await this.adminService.submitArbitrage(evalId, this.evaluationArbitrageFormModel);
      this.triggerToast("L'arbitrage de l'évaluation a été finalisé avec succès !");
      this.onCancelEvaluationForms();
      await this.loadTeamEvaluations();
      await this.loadCampaignEvaluations();
    }
  }
}
