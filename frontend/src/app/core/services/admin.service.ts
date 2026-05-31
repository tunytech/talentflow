import { Injectable, signal } from '@angular/core';

export interface Company {
  id?: number;
  name: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactInfo?: string;
  parent?: { id: number; name?: string } | null;
  subCompanies?: Company[];
  
  // ==========================================
  // LOGO DE LA SOCIÉTÉ (EN BASE64)
  // ==========================================
  // Contient l'image du logo convertie en grand texte pour l'afficher à la place de l'immeuble.
  logo?: string;
}

export interface Permission {
  id?: number;
  name: string;
  description?: string;
}

export interface Role {
  id?: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface AppSetting {
  id?: number;
  key: string;
  value: string;
  description?: string;
}

export interface EmployeePostAssignment {
  id?: number;
  jobProfile: JobProfile;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: Company | null;
  jobTitle?: string;
  keySkill?: string;
  skillLevel?: number;
  habilitationName?: string;
  habilitationExpiryDate?: string;
  active: boolean;
  
  // --- NOUVELLES PROPRIETES ENRICHIES ---
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  department?: string;
  manager?: Employee | null;
  entryDate?: string;
  retirementDate?: string;
  postAssignments?: EmployeePostAssignment[];
}

export interface User {
  id?: number;
  username: string;
  email: string;
  active: boolean;
  company?: Company | null;
  role?: Role | null;

  // ==========================================
  // INFORMATIONS DE SÉCURITÉ DE L'UTILISATEUR
  // ==========================================
  firstName?: string; // Le prénom
  lastName?: string;  // Le nom de famille
  firstLogin?: boolean; // Si c'est la toute première connexion
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  accountDisabled?: boolean;

  // --- RELATION OPTIONNELLE COLLABORATEUR ---
  employee?: Employee | null;
}

export interface EmailAlertConfig {
  id?: number;
  key: string;
  name: string;
  active: boolean;
  recipientRole?: string;
}

export interface SystemNotification {
  id?: number;
  user?: User;
  content: string;
  acknowledged: boolean;
  repeated: boolean;
  createdAt: string;
}

export type SkillCriticality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SkillCategory {
  id?: number;
  name: string;
  description?: string;
  sortOrder?: number;
  active: boolean;
}

export interface Skill {
  id?: number;
  name: string;
  description?: string;
  category?: { id?: number; name?: string } | null;
  expectedLevel?: number;
  minRequiredLevel?: number;
  criticality?: SkillCriticality;
  mandatoryByDefault?: boolean;
  active: boolean;
}

export interface JobProfileSkill {
  id?: number;
  skill?: Skill;
  expectedLevel?: number;
  mandatory?: boolean;
}

export interface SkillLinkPayload {
  skillId: number;
  expectedLevel?: number;
  mandatory?: boolean;
}

export interface JobProfile {
  id?: number;
  name: string;
  description?: string;
  responsibilityLevel?: string;
  active: boolean;
  profileSkills?: JobProfileSkill[];
  skillLinks?: SkillLinkPayload[];
}

export interface EvaluationCampaign {
  id?: number;
  name: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: 'PLANIFIEE' | 'EN_COURS' | 'CLOTUREE' | 'EN_RETARD';
  company?: Company;
}

export interface EvaluationSkill {
  id: number;
  skillId: number;
  skillName: string;
  skillDescription?: string;
  skillCriticality?: string;
  expectedLevel: number;
  selfLevel?: number;
  acquiredLevel?: number;
  managerComment?: string;
  mandatory: boolean;
  majorRisk: boolean;
}

export interface Evaluation {
  id: number;
  campaignId: number;
  campaignName: string;
  campaignStatus: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  status: 'CREEE' | 'AUTO_EVALUATION' | 'ARBITRAGE' | 'TERMINEE';
  selfComment?: string;
  managerComment?: string;
  trainingRequest?: string;
  trainingRecommendation?: string;
  skills: EvaluationSkill[];
  globalScore: number;
  majorRisk: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = 'http://localhost:8080/api/admin';

  // Signals for state
  public readonly companies = signal<Company[]>([]);
  public readonly roles = signal<Role[]>([]);
  public readonly permissions = signal<Permission[]>([]);
  public readonly users = signal<User[]>([]);
  public readonly employees = signal<Employee[]>([]);
  public readonly settings = signal<AppSetting[]>([]);
  public readonly activeCompanyId = signal<number>(1); // Default to first company
  public readonly skillCategories = signal<SkillCategory[]>([]);
  public readonly skills = signal<Skill[]>([]);
  public readonly jobProfiles = signal<JobProfile[]>([]);

  private readonly referentialUrl = 'http://localhost:8080/api/admin/referentials';

  // FALLBACK MOCK STORE (Premium mock data matches backend bootstrap)
  private mockCompanies: Company[] = [
    { id: 1, name: 'Tunytech Holdings (Société Mère)', vatNumber: 'SIRET-882711002', address: '10 Rue de la Paix', city: 'Paris', postalCode: '75002', country: 'France', contactInfo: 'contact@tunytech.com', parent: null },
    { id: 2, name: 'Tunytech Europe (Filiale)', vatNumber: 'VAT-EU772619', address: 'Avenue Louise 120', city: 'Bruxelles', postalCode: '1000', country: 'Belgique', contactInfo: 'europe@tunytech.com', parent: { id: 1 } },
    { id: 3, name: 'Tunytech Americas (Filiale)', vatNumber: 'TAX-US-99182', address: '5th Avenue 500', city: 'New York', postalCode: '10001', country: 'États-Unis', contactInfo: 'americas@tunytech.com', parent: { id: 1 } },
    { id: 4, name: 'Tunytech France (Sous-Filiale)', vatNumber: 'SIRET-882711002-00014', address: '20 Boulevard Haussmann', city: 'Paris', postalCode: '75009', country: 'France', contactInfo: 'france@tunytech.com', parent: { id: 2 } }
  ];

  private mockPermissions: Permission[] = [
    { id: 1, name: 'READ_COMPANIES', description: 'Lire les informations des sociétés' },
    { id: 2, name: 'WRITE_COMPANIES', description: 'Créer et modifier des sociétés/filiales' },
    { id: 3, name: 'READ_USERS', description: 'Consulter les comptes utilisateurs' },
    { id: 4, name: 'WRITE_USERS', description: 'Gérer les utilisateurs et les rôles' },
    { id: 5, name: 'READ_EMPLOYEES', description: 'Consulter le registre des collaborateurs' },
    { id: 6, name: 'WRITE_EMPLOYEES', description: 'Gérer la fiche des employés' },
    { id: 7, name: 'CONFIG_SYSTEM', description: 'Modifier la configuration globale de l\'application' }
  ];

  private mockRoles: Role[] = [];
  private mockEmployees: Employee[] = [];
  private mockUsers: User[] = [];
  private mockSettings: { [companyId: number]: AppSetting[] } = {};

  constructor() {
    this.initMockStore();
    this.loadAllData();
  }

  private initMockStore() {
    // Seed mock roles
    this.mockRoles = [
      {
        id: 1,
        name: 'Administrateur',
        description: 'Accès complet à la configuration et aux données',
        permissions: [...this.mockPermissions]
      },
      {
        id: 2,
        name: 'Manager',
        description: 'Gestion de son équipe et consultation générale',
        permissions: [this.mockPermissions[0], this.mockPermissions[2], this.mockPermissions[4]]
      },
      {
        id: 3,
        name: 'Responsable RH',
        description: 'Gestion du recrutement, compétences et formations',
        permissions: [this.mockPermissions[0], this.mockPermissions[4], this.mockPermissions[5]]
      },
      {
        id: 4,
        name: 'Qualité',
        description: 'Gestion de la conformité ISO et des habilitations',
        permissions: [this.mockPermissions[0], this.mockPermissions[4]]
      }
    ];

    // Seed mock employees
    this.mockEmployees = [
      { 
        id: 1, firstName: 'Jean', lastName: 'Administrateur', email: 'admin@tunytech.com', company: this.mockCompanies[0], jobTitle: 'System Architect', keySkill: 'Java & Angular Architecture', skillLevel: 5, habilitationName: 'ISO 27001 Auditor', habilitationExpiryDate: '2027-01-15', active: true,
        phoneNumber: '+33 6 12 34 56 78', birthDate: '1980-05-15', gender: 'Homme', department: 'Direction', manager: null, entryDate: '2015-01-01', retirementDate: '2045-05-15', postAssignments: []
      },
      { 
        id: 2, firstName: 'Marie', lastName: 'Lefebvre', email: 'rh.france@tunytech.com', company: this.mockCompanies[3], jobTitle: 'Responsable RH', keySkill: 'Recrutement & Onboarding', skillLevel: 4, habilitationName: 'RGPD DPO Certification', habilitationExpiryDate: '2026-10-30', active: true,
        phoneNumber: '+33 6 98 76 54 32', birthDate: '1985-11-20', gender: 'Femme', department: 'Ressources Humaines', manager: null, entryDate: '2018-06-01', retirementDate: '2050-11-20', postAssignments: []
      },
      { 
        id: 3, firstName: 'Amir', lastName: 'Nouveau', email: 'nouveau@tunytech.com', company: this.mockCompanies[3], jobTitle: 'Ingénieur DevOps', keySkill: 'CI/CD & Cloud Infrastructure', skillLevel: 4, habilitationName: 'AWS Certified Practitioner', habilitationExpiryDate: '2026-09-05', active: true,
        phoneNumber: '+33 6 11 22 33 44', birthDate: '1992-03-10', gender: 'Homme', department: 'R&D', manager: null, entryDate: '2021-09-01', retirementDate: '2057-03-10', postAssignments: []
      },
      { 
        id: 4, firstName: 'Hejer', lastName: 'Ben Ali', email: 'hejer.benali@tunytech.com', company: this.mockCompanies[3], jobTitle: 'Qualité Assurance', keySkill: 'Conformité & CAPA', skillLevel: 5, habilitationName: 'ISO 9001 Lead Auditor', habilitationExpiryDate: '2026-06-12', active: true,
        phoneNumber: '+33 6 55 66 77 88', birthDate: '1988-07-25', gender: 'Femme', department: 'Qualité', manager: null, entryDate: '2019-02-15', retirementDate: '2053-07-25', postAssignments: []
      },
      { 
        id: 5, firstName: 'Jan', lastName: 'de Vries', email: 'jan.devries@tunytech.com', company: this.mockCompanies[0], jobTitle: 'Technicien Support', keySkill: 'Maintenance & Hardware', skillLevel: 3, habilitationName: 'Habilitation Électrique B2V', habilitationExpiryDate: '2026-03-18', active: true,
        phoneNumber: '+31 6 44 55 66 77', birthDate: '1975-09-05', gender: 'Homme', department: 'Support', manager: null, entryDate: '2016-10-01', retirementDate: '2040-09-05', postAssignments: []
      },
      { 
        id: 6, firstName: 'Thomas', lastName: 'Mueller', email: 't.mueller@tunytech.com', company: this.mockCompanies[1], jobTitle: 'Ingénieur DevOps', keySkill: 'Kubernetes & Security', skillLevel: 4, habilitationName: 'Kubernetes Administrator (CKA)', habilitationExpiryDate: '2026-09-05', active: true,
        phoneNumber: '+49 170 889977', birthDate: '1990-12-01', gender: 'Non défini', department: 'R&D', manager: null, entryDate: '2020-03-01', retirementDate: '2055-12-01', postAssignments: []
      }
    ];

    // Link mock N+1 relationships
    this.mockEmployees[1].manager = this.mockEmployees[0]; // Marie managed by Jean
    this.mockEmployees[2].manager = this.mockEmployees[1]; // Amir managed by Marie
    this.mockEmployees[3].manager = this.mockEmployees[1]; // Hejer managed by Marie
    this.mockEmployees[4].manager = this.mockEmployees[0]; // Jan managed by Jean
    this.mockEmployees[5].manager = this.mockEmployees[0]; // Thomas managed by Jean

    // Seed mock users
    this.mockUsers = [
      { id: 1, username: 'admin', email: 'admin@tunytech.com', active: true, company: this.mockCompanies[0], role: this.mockRoles[0], employee: this.mockEmployees[0] },
      { id: 2, username: 'rh.france', email: 'rh.france@tunytech.com', active: true, company: this.mockCompanies[3], role: this.mockRoles[2], employee: this.mockEmployees[1] },
      { id: 3, username: 'nouveau.employe', email: 'nouveau@tunytech.com', active: true, company: this.mockCompanies[3], role: this.mockRoles[1], employee: this.mockEmployees[2] },
      { id: 4, username: 'hejer.benali', email: 'hejer.benali@tunytech.com', active: true, company: this.mockCompanies[3], role: this.mockRoles[3], employee: this.mockEmployees[3] },
      { id: 5, username: 'jan.devries', email: 'jan.devries@tunytech.com', active: true, company: this.mockCompanies[0], role: this.mockRoles[1], employee: this.mockEmployees[4] }
    ];

    // Seed mock settings for Parent (id 1)
    this.mockSettings[1] = [
      { id: 1, key: 'WORK_START_HOUR', value: '08:00', description: 'Heure de début' },
      { id: 2, key: 'WORK_END_HOUR', value: '17:00', description: 'Heure de fin' },
      { id: 3, key: 'MAX_HOURS_DAILY', value: '8', description: 'Heures max par jour' },
      { id: 4, key: 'WFH_DAYS_WEEK', value: '2', description: 'Jours de télétravail / semaine' },
      { id: 5, key: 'WFH_DAYS_MONTH', value: '8', description: 'Jours de télétravail / mois' },
      { id: 6, key: 'WFH_EXCEPTION_MOTIFS', value: 'Grève des transports,Grève générale,Conditions météo extrêmes,Crise sanitaire,Situation familiale exceptionnelle', description: 'Motifs exceptionnels' }
    ];

    // Seed mock settings for Europe (id 2)
    this.mockSettings[2] = [
      { id: 7, key: 'WORK_START_HOUR', value: '09:00', description: 'Heure de début' },
      { id: 8, key: 'WORK_END_HOUR', value: '18:00', description: 'Heure de fin' },
      { id: 9, key: 'MAX_HOURS_DAILY', value: '8', description: 'Heures max par jour' },
      { id: 10, key: 'WFH_DAYS_WEEK', value: '3', description: 'Jours de télétravail / semaine' },
      { id: 11, key: 'WFH_DAYS_MONTH', value: '12', description: 'Jours de télétravail / mois' },
      { id: 12, key: 'WFH_EXCEPTION_MOTIFS', value: 'Grève des transports,Grève générale,Inondations', description: 'Motifs exceptionnels' }
    ];
  }

  // --- DUAL MODE DATA FETCHERS ---
  public async loadAllData() {
    await this.fetchCompanies();
    await this.fetchPermissions();
    await this.fetchRoles();
    await this.fetchUsers();
    await this.fetchEmployees();
    await this.fetchSettings(this.activeCompanyId());
  }

  public async fetchCompanies() {
    try {
      const res = await fetch(`${this.baseUrl}/companies`);
      if (res.ok) {
        const data = await res.json();
        this.companies.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    this.companies.set([...this.mockCompanies]);
  }

  public async saveCompany(company: Company): Promise<Company> {
    try {
      const isEdit = company.id !== undefined;
      const url = isEdit ? `${this.baseUrl}/companies/${company.id}` : `${this.baseUrl}/companies`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      if (res.ok) {
        const saved = await res.json();
        await this.fetchCompanies();
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    
    if (company.id !== undefined) {
      this.mockCompanies = this.mockCompanies.map(c => c.id === company.id ? { ...c, ...company } : c);
    } else {
      const newId = Math.max(...this.mockCompanies.map(c => c.id || 0)) + 1;
      const newCompany = { ...company, id: newId };
      this.mockCompanies.push(newCompany);
      company = newCompany;
    }
    await this.fetchCompanies();
    return company;
  }

  public async deleteCompany(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchCompanies();
        return true;
      }
    } catch (e) {
      // Fallback
    }
    this.mockCompanies = this.mockCompanies.filter(c => c.id !== id);
    await this.fetchCompanies();
    return true;
  }

  public async fetchPermissions() {
    try {
      const res = await fetch(`${this.baseUrl}/permissions`);
      if (res.ok) {
        const data = await res.json();
        this.permissions.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    this.permissions.set([...this.mockPermissions]);
  }

  public async fetchRoles() {
    try {
      const res = await fetch(`${this.baseUrl}/roles`);
      if (res.ok) {
        const data = await res.json();
        this.roles.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    this.roles.set([...this.mockRoles]);
  }

  public async saveRole(role: Role): Promise<Role> {
    try {
      const isEdit = role.id !== undefined;
      const url = isEdit ? `${this.baseUrl}/roles/${role.id}` : `${this.baseUrl}/roles`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role)
      });
      if (res.ok) {
        const saved = await res.json();
        await this.fetchRoles();
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    
    if (role.id !== undefined) {
      this.mockRoles = this.mockRoles.map(r => r.id === role.id ? { ...r, ...role } : r);
    } else {
      const newId = Math.max(...this.mockRoles.map(r => r.id || 0)) + 1;
      const newRole = { ...role, id: newId };
      this.mockRoles.push(newRole);
      role = newRole;
    }
    await this.fetchRoles();
    return role;
  }

  public async fetchSettings(companyId: number) {
    this.activeCompanyId.set(companyId);
    try {
      const res = await fetch(`${this.baseUrl}/settings/company/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        this.settings.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    
    const companySettings = this.mockSettings[companyId] || this.getDefaultMockSettings();
    this.settings.set([...companySettings]);
  }

  private getDefaultMockSettings(): AppSetting[] {
    return [
      { key: 'WORK_START_HOUR', value: '08:00', description: 'Heure de début' },
      { key: 'WORK_END_HOUR', value: '17:00', description: 'Heure de fin' },
      { key: 'MAX_HOURS_DAILY', value: '8', description: 'Heures max par jour' },
      { key: 'WFH_DAYS_WEEK', value: '2', description: 'Jours de télétravail / semaine' },
      { key: 'WFH_DAYS_MONTH', value: '8', description: 'Jours de télétravail / mois' },
      { key: 'WFH_EXCEPTION_MOTIFS', value: 'Grève des transports,Grève générale,Conditions météo extrêmes', description: 'Motifs exceptionnels' }
    ];
  }

  public async saveSettings(companyId: number, settingsToSave: AppSetting[]): Promise<AppSetting[]> {
    try {
      const res = await fetch(`${this.baseUrl}/settings/company/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });
      if (res.ok) {
        const data = await res.json();
        this.settings.set(data);
        return data;
      }
    } catch (e) {
      // Fallback
    }
    
    this.mockSettings[companyId] = settingsToSave.map((s, index) => ({
      id: s.id || Math.floor(Math.random() * 1000) + 100,
      ...s
    }));
    this.settings.set([...this.mockSettings[companyId]]);
    return this.mockSettings[companyId];
  }

  public async fetchUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/users`);
      if (res.ok) {
        const data = await res.json();
        this.users.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    this.users.set([...this.mockUsers]);
  }

  public async saveUser(user: User): Promise<User> {
    try {
      const isEdit = user.id !== undefined;
      const url = isEdit ? `${this.baseUrl}/users/${user.id}` : `${this.baseUrl}/users`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const saved = await res.json();
        await this.fetchUsers();
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    
    if (user.id !== undefined) {
      this.mockUsers = this.mockUsers.map(u => u.id === user.id ? { ...u, ...user } : u);
    } else {
      const newId = Math.max(...this.mockUsers.map(u => u.id || 0)) + 1;
      const newUser = { ...user, id: newId };
      this.mockUsers.push(newUser);
      user = newUser;
    }
    await this.fetchUsers();
    return user;
  }

  public async deleteUser(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchUsers();
        return true;
      }
    } catch (e) {
      // Fallback
    }
    this.mockUsers = this.mockUsers.filter(u => u.id !== id);
    await this.fetchUsers();
    return true;
  }

  // --- EMPLOYEES API (CRUD DUAL-MODE) ---
  public async fetchEmployees() {
    try {
      const res = await fetch(`${this.baseUrl}/employees`);
      if (res.ok) {
        const data = await res.json();
        this.employees.set(data);
        return;
      }
    } catch (e) {
      // Fallback
    }
    this.employees.set([...this.mockEmployees]);
  }

  public async saveEmployee(employee: Employee): Promise<Employee> {
    try {
      const isEdit = employee.id !== undefined;
      const url = isEdit ? `${this.baseUrl}/employees/${employee.id}` : `${this.baseUrl}/employees`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee)
      });
      if (res.ok) {
        const saved = await res.json();
        await this.fetchEmployees();
        await this.fetchUsers(); // refresh users too in case employee state changed
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    
    if (employee.id !== undefined) {
      this.mockEmployees = this.mockEmployees.map(e => e.id === employee.id ? { ...e, ...employee } : e);
    } else {
      const newId = Math.max(...this.mockEmployees.map(e => e.id || 0)) + 1;
      const newEmployee = { ...employee, id: newId, active: true };
      this.mockEmployees.push(newEmployee);
      employee = newEmployee;
    }
    await this.fetchEmployees();
    return employee;
  }

  public async deleteEmployee(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchEmployees();
        await this.fetchUsers();
        return true;
      }
    } catch (e) {
      // Fallback
    }
    this.mockEmployees = this.mockEmployees.map(e => e.id === id ? { ...e, active: false } : e);
    await this.fetchEmployees();
    return true;
  }

  // --- SKILLS REFERENTIAL API ---

  public async fetchSkillCategories(companyId: number): Promise<void> {
    try {
      const res = await fetch(`${this.referentialUrl}/companies/${companyId}/skill-categories`);
      if (res.ok) {
        this.skillCategories.set(await res.json());
        return;
      }
    } catch {
      // empty on error
    }
    this.skillCategories.set([]);
  }

  public async saveSkillCategory(companyId: number, category: SkillCategory): Promise<{ ok: boolean; data?: SkillCategory; error?: string }> {
    try {
      const isEdit = category.id !== undefined;
      const url = isEdit
        ? `${this.referentialUrl}/skill-categories/${category.id}`
        : `${this.referentialUrl}/companies/${companyId}/skill-categories`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (res.ok) {
        await this.fetchSkillCategories(companyId);
        return { ok: true, data: await res.json() };
      }
      const err = await res.text();
      return { ok: false, error: err || 'Erreur serveur' };
    } catch {
      return { ok: false, error: 'Backend indisponible' };
    }
  }

  public async deleteSkillCategory(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.referentialUrl}/skill-categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const companyId = this.activeCompanyId();
        await this.fetchSkillCategories(companyId);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  public async fetchSkills(companyId: number): Promise<void> {
    try {
      const res = await fetch(`${this.referentialUrl}/companies/${companyId}/skills`);
      if (res.ok) {
        this.skills.set(await res.json());
        return;
      }
    } catch {
      // empty
    }
    this.skills.set([]);
  }

  public async saveSkill(companyId: number, skill: Skill): Promise<{ ok: boolean; data?: Skill; error?: string }> {
    try {
      const isEdit = skill.id !== undefined;
      const url = isEdit
        ? `${this.referentialUrl}/skills/${skill.id}`
        : `${this.referentialUrl}/companies/${companyId}/skills`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
      });
      if (res.ok) {
        await this.fetchSkills(companyId);
        return { ok: true, data: await res.json() };
      }
      const err = await res.text();
      return { ok: false, error: err || 'Erreur serveur' };
    } catch {
      return { ok: false, error: 'Backend indisponible' };
    }
  }

  public async deleteSkill(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.referentialUrl}/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchSkills(this.activeCompanyId());
        await this.fetchJobProfiles(this.activeCompanyId());
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  public async fetchJobProfiles(companyId: number): Promise<void> {
    try {
      const res = await fetch(`${this.referentialUrl}/companies/${companyId}/job-profiles`);
      if (res.ok) {
        this.jobProfiles.set(await res.json());
        return;
      }
    } catch {
      // empty
    }
    this.jobProfiles.set([]);
  }

  public async saveJobProfile(companyId: number, profile: JobProfile): Promise<{ ok: boolean; data?: JobProfile; error?: string }> {
    try {
      const isEdit = profile.id !== undefined;
      const url = isEdit
        ? `${this.referentialUrl}/job-profiles/${profile.id}`
        : `${this.referentialUrl}/companies/${companyId}/job-profiles`;
      const body = {
        name: profile.name,
        description: profile.description,
        responsibilityLevel: profile.responsibilityLevel,
        active: profile.active,
        skillLinks: profile.skillLinks || []
      };
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        await this.fetchJobProfiles(companyId);
        return { ok: true, data: await res.json() };
      }
      const err = await res.text();
      return { ok: false, error: err || 'Erreur serveur' };
    } catch {
      return { ok: false, error: 'Backend indisponible' };
    }
  }

  public async deleteJobProfile(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${this.referentialUrl}/job-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await this.fetchJobProfiles(this.activeCompanyId());
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  // --- ADDITIONAL ACTIONS: USER UNLOCK, EMAIL ALERTS & NOTIFICATIONS ---

  public async unlockUser(userId: number): Promise<User> {
    const res = await fetch(`${this.baseUrl}/users/${userId}/unlock`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      await this.fetchUsers();
      return data;
    }
    throw new Error("Impossible de déverrouiller l'utilisateur.");
  }

  public async fetchEmailAlerts(): Promise<EmailAlertConfig[]> {
    try {
      const res = await fetch(`${this.baseUrl}/email-alerts`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [
      { id: 1, key: 'CAMPAIGN_OPEN_ALERT', name: 'La campagne de recrutement est ouverte', active: true, recipientRole: 'Manager' },
      { id: 2, key: 'CAMPAIGN_CLOSE_ALERT', name: 'La campagne de recrutement est fermée', active: false, recipientRole: 'Responsable RH' },
      { id: 3, key: 'EVAL_START_ALERT', name: 'La campagne d\'évaluation a commencé', active: true, recipientRole: 'Tous' },
      { id: 4, key: 'EVAL_CLOSE_ALERT', name: 'La campagne d\'évaluation est cloturée', active: true, recipientRole: 'Tous' },
      { id: 5, key: 'HABILITATION_EXPIRY_ALERT', name: 'L\'habilitation X va bientôt expirer', active: true, recipientRole: 'Responsable RH' }
    ];
  }

  public async toggleEmailAlert(id: number): Promise<EmailAlertConfig> {
    const res = await fetch(`${this.baseUrl}/email-alerts/${id}/toggle`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error("Impossible de modifier l'alerte.");
  }

  public async fetchNotifications(): Promise<SystemNotification[]> {
    try {
      const res = await fetch(`${this.baseUrl}/notifications`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [];
  }

  public async acknowledgeNotification(id: number): Promise<SystemNotification> {
    const res = await fetch(`${this.baseUrl}/notifications/${id}/acknowledge`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error("Impossible d'acquitter la notification.");
  }

  public async fetchReferentials(companyId: number): Promise<void> {
    this.activeCompanyId.set(companyId);
    await Promise.all([
      this.fetchSkillCategories(companyId),
      this.fetchSkills(companyId),
      this.fetchJobProfiles(companyId)
    ]);
  }

  // --- MOCK EVALUATIONS STORE ---
  private mockCampaigns: EvaluationCampaign[] = [
    { id: 1, name: "Campagne Annuelle d'Évaluation 2026", frequency: 'Annuelle', startDate: '2026-05-01', endDate: '2026-06-30', status: 'EN_COURS' }
  ];

  private mockEvaluations: Evaluation[] = [
    {
      id: 1,
      campaignId: 1,
      campaignName: "Campagne Annuelle d'Évaluation 2026",
      campaignStatus: 'EN_COURS',
      employeeId: 2, // Marie Lefebvre
      employeeName: 'Marie Lefebvre',
      employeeEmail: 'rh.france@tunytech.com',
      status: 'ARBITRAGE',
      selfComment: "L'année a été excellente. Je souhaite me perfectionner sur la gestion agile et DevOps pour accompagner les équipes techniques.",
      trainingRequest: "Formation DevOps agile pour non-techniques",
      skills: [
        { id: 10, skillId: 6, skillName: 'Leadership', expectedLevel: 3, selfLevel: 3, mandatory: true, majorRisk: false },
        { id: 11, skillId: 7, skillName: 'Communication client', expectedLevel: 4, selfLevel: 4, mandatory: true, majorRisk: false }
      ],
      globalScore: 100,
      majorRisk: false
    },
    {
      id: 2,
      campaignId: 1,
      campaignName: "Campagne Annuelle d'Évaluation 2026",
      campaignStatus: 'EN_COURS',
      employeeId: 6, // Thomas Mueller
      employeeName: 'Thomas Mueller',
      employeeEmail: 't.mueller@tunytech.com',
      status: 'TERMINEE',
      selfComment: "J'ai beaucoup travaillé DevOps cette année. Sur la sécurité ISO 27001, je dois encore progresser.",
      managerComment: "Excellent travail sur DevOps et Java. Attention cependant aux notions de sécurité ISO 27001 indispensables sur les projets DevOps.",
      trainingRecommendation: "Certification ISO 27001 Auditor",
      skills: [
        { id: 20, skillId: 3, skillName: 'DevOps', expectedLevel: 5, selfLevel: 4, acquiredLevel: 5, mandatory: true, majorRisk: false },
        { id: 21, skillId: 1, skillName: 'Java', expectedLevel: 3, selfLevel: 3, acquiredLevel: 3, mandatory: false, majorRisk: false },
        { id: 22, skillId: 4, skillName: 'ISO 27001', expectedLevel: 3, selfLevel: 2, acquiredLevel: 2, managerComment: "Niveau insuffisant sur les audits de sécurité. Une formation est fortement recommandée.", mandatory: true, majorRisk: true }
      ],
      globalScore: 91,
      majorRisk: true
    },
    {
      id: 3,
      campaignId: 1,
      campaignName: "Campagne Annuelle d'Évaluation 2026",
      campaignStatus: 'EN_COURS',
      employeeId: 3, // Amir Nouveau
      employeeName: 'Amir Nouveau',
      employeeEmail: 'nouveau@tunytech.com',
      status: 'CREEE',
      skills: [
        { id: 30, skillId: 3, skillName: 'DevOps', expectedLevel: 5, mandatory: true, majorRisk: false },
        { id: 31, skillId: 1, skillName: 'Java', expectedLevel: 3, mandatory: false, majorRisk: false },
        { id: 32, skillId: 4, skillName: 'ISO 27001', expectedLevel: 3, mandatory: true, majorRisk: false }
      ],
      globalScore: 0,
      majorRisk: false
    }
  ];

  // --- EVALUATIONS API (DUAL-MODE) ---
  private readonly evalBaseUrl = 'http://localhost:8080/api/evaluations';

  public async fetchCampaigns(companyId: number): Promise<EvaluationCampaign[]> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/campaigns?companyId=${companyId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return [...this.mockCampaigns];
  }

  public async saveCampaign(campaign: EvaluationCampaign): Promise<EvaluationCampaign> {
    try {
      const isEdit = campaign.id !== undefined;
      const url = isEdit ? `${this.evalBaseUrl}/campaigns/${campaign.id}` : `${this.evalBaseUrl}/campaigns`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    if (campaign.id !== undefined) {
      this.mockCampaigns = this.mockCampaigns.map(c => c.id === campaign.id ? { ...c, ...campaign } : c);
    } else {
      const newId = Math.max(...this.mockCampaigns.map(c => c.id || 0), 0) + 1;
      const newCampaign = { ...campaign, id: newId };
      this.mockCampaigns.push(newCampaign);
      campaign = newCampaign;
    }
    return campaign;
  }

  public async fetchEvaluationsByCampaign(campaignId: number): Promise<Evaluation[]> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/campaign/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        return data.map((e: any) => this.calculateEvaluationStats(e));
      }
    } catch {
      // ignore
    }
    return this.mockEvaluations.filter(e => e.campaignId === campaignId);
  }

  public async fetchEvaluationsByEmployee(employeeId: number): Promise<Evaluation[]> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/employee/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        return data.map((e: any) => this.calculateEvaluationStats(e));
      }
    } catch {
      // ignore
    }
    return this.mockEvaluations.filter(e => e.employeeId === employeeId);
  }

  public async fetchEvaluationsByManager(managerId: number): Promise<Evaluation[]> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/manager/${managerId}`);
      if (res.ok) {
        const data = await res.json();
        return data.map((e: any) => this.calculateEvaluationStats(e));
      }
    } catch {
      // ignore
    }
    if (managerId === 2) {
      return this.mockEvaluations.filter(e => e.employeeId === 3);
    } else if (managerId === 1) {
      return this.mockEvaluations.filter(e => e.employeeId === 2 || e.employeeId === 6);
    }
    return [];
  }

  public async fetchEvaluationDetails(id: number): Promise<Evaluation> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const found = this.mockEvaluations.find(e => e.id === id);
    if (found) return found;
    throw new Error("Evaluation non trouvée.");
  }

  public async submitSelfEvaluation(id: number, payload: any): Promise<Evaluation> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/${id}/self`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }

    this.mockEvaluations = this.mockEvaluations.map(e => {
      if (e.id === id) {
        const updatedSkills = e.skills.map(es => {
          const matching = payload.skills?.find((ps: any) => ps.id === es.id);
          if (matching) {
            return { ...es, selfLevel: matching.selfLevel };
          }
          return es;
        });
        const updated = {
          ...e,
          selfComment: payload.selfComment,
          trainingRequest: payload.trainingRequest,
          status: 'ARBITRAGE' as const,
          skills: updatedSkills
        };
        return this.calculateEvaluationStats(updated);
      }
      return e;
    });

    return this.fetchEvaluationDetails(id);
  }

  public async submitArbitrage(id: number, payload: any): Promise<Evaluation> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/${id}/arbitrage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }

    this.mockEvaluations = this.mockEvaluations.map(e => {
      if (e.id === id) {
        const updatedSkills = e.skills.map(es => {
          const matching = payload.skills?.find((ps: any) => ps.id === es.id);
          if (matching) {
            const skillRisk = matching.acquiredLevel < es.expectedLevel && (es.mandatory || es.skillCriticality === 'HIGH');
            return { 
              ...es, 
              acquiredLevel: matching.acquiredLevel, 
              managerComment: matching.managerComment,
              majorRisk: skillRisk 
            };
          }
          return es;
        });
        const updated = {
          ...e,
          managerComment: payload.managerComment,
          trainingRecommendation: payload.trainingRecommendation,
          status: 'TERMINEE' as const,
          skills: updatedSkills
        };
        return this.calculateEvaluationStats(updated);
      }
      return e;
    });

    return this.fetchEvaluationDetails(id);
  }

  public async checkCampaignAlerts(): Promise<any> {
    try {
      const res = await fetch(`${this.evalBaseUrl}/campaigns/check-alerts`, {
        method: 'POST'
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return {
      message: "Simulation des relances : Emails envoyés et notifications créées.",
      J7Notifications: 6,
      J1Notifications: 6,
      lateNotifications: 2
    };
  }

  private calculateEvaluationStats(evalObj: any): Evaluation {
    let totalExpected = 0;
    let totalAcquiredMet = 0;
    let hasMajorRisk = false;

    const skills = (evalObj.skills || []).map((es: any) => {
      const expected = es.expectedLevel || 3;
      const acquired = es.acquiredLevel;
      totalExpected += expected;
      if (acquired !== undefined && acquired !== null) {
        totalAcquiredMet += Math.min(acquired, expected);
      }

      let skillRisk = false;
      if (acquired !== undefined && acquired !== null && acquired < expected) {
        if (es.mandatory || es.skillCriticality === 'HIGH' || es.skill?.criticality === 'HIGH') {
          skillRisk = true;
          hasMajorRisk = true;
        }
      }

      return {
        ...es,
        majorRisk: skillRisk
      };
    });

    const globalScore = totalExpected > 0 
      ? Math.round((totalAcquiredMet / totalExpected) * 100) 
      : 100;

    return {
      ...evalObj,
      skills,
      globalScore,
      majorRisk: hasMajorRisk
    };
  }
}
