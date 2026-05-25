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

    // Seed mock users
    this.mockUsers = [
      { id: 1, username: 'admin', email: 'admin@tunytech.com', active: true, company: this.mockCompanies[0], role: this.mockRoles[0] },
      { id: 2, username: 'rh.france', email: 'rh.france@tunytech.com', active: true, company: this.mockCompanies[3], role: this.mockRoles[2] },
      { id: 3, username: 'm.dupont', email: 'm.dupont@tunytech.com', active: true, company: this.mockCompanies[1], role: this.mockRoles[1] }
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

  public async fetchReferentials(companyId: number): Promise<void> {
    this.activeCompanyId.set(companyId);
    await Promise.all([
      this.fetchSkillCategories(companyId),
      this.fetchSkills(companyId),
      this.fetchJobProfiles(companyId)
    ]);
  }
}
