import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  SkillCategory,
  Skill,
  JobProfile,
  SkillCriticality,
  SkillLinkPayload
} from '../../../../core/services/admin.service';
import { TranslationService } from '../../../../core/services/translation.service';

type ReferentialPanel = 'categories' | 'skills' | 'jobProfiles';

@Component({
  selector: 'app-hr-referentials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-referentials.component.html',
  styleUrl: './hr-referentials.component.css'
})
export class HrReferentialsComponent implements OnChanges {
  @Input({ required: true }) companyId!: number;
  @Input() onToast?: (message: string) => void;
  @Input() initialPanel?: ReferentialPanel;

  private readonly adminService = inject(AdminService);
  private readonly translationService = inject(TranslationService);

  activePanel = signal<ReferentialPanel>('categories');

  categoryForm = { id: undefined as number | undefined, name: '', description: '', sortOrder: 0, active: true };
  skillForm = {
    id: undefined as number | undefined,
    name: '',
    description: '',
    categoryId: null as number | null,
    expectedLevel: 3,
    minRequiredLevel: 1,
    criticality: 'MEDIUM' as SkillCriticality,
    mandatoryByDefault: true,
    active: true
  };
  profileForm = {
    id: undefined as number | undefined,
    name: '',
    description: '',
    responsibilityLevel: '',
    active: true,
    skillLinks: [] as { skillId: number; skillName: string; expectedLevel: number; mandatory: boolean }[]
  };

  selectedSkillToAdd = signal<number | null>(null);

  // Signaux réactifs pour l'interface en cascades de liaison de compétences
  selectedFamilyId = signal<number | null>(null);
  selectedSkillId = signal<number | null>(null);
  selectedLevel = signal<number>(3);
  selectedMandatory = signal<boolean>(true);

  readonly criticalityOptions: SkillCriticality[] = ['LOW', 'MEDIUM', 'HIGH'];
  readonly levelOptions = [1, 2, 3, 4, 5];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId'] && this.companyId) {
      this.loadAll();
    }
    if (changes['initialPanel'] && this.initialPanel) {
      this.activePanel.set(this.initialPanel);
    }
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  get categories() {
    return this.adminService.skillCategories;
  }

  get skills() {
    return this.adminService.skills;
  }

  get jobProfiles() {
    return this.adminService.jobProfiles;
  }

  async loadAll(): Promise<void> {
    await Promise.all([
      this.adminService.fetchSkillCategories(this.companyId),
      this.adminService.fetchSkills(this.companyId),
      this.adminService.fetchJobProfiles(this.companyId)
    ]);
  }

  setPanel(panel: ReferentialPanel): void {
    this.activePanel.set(panel);
  }

  // --- Categories ---

  resetCategoryForm(): void {
    this.categoryForm = { id: undefined, name: '', description: '', sortOrder: 0, active: true };
  }

  editCategory(c: SkillCategory): void {
    this.categoryForm = {
      id: c.id,
      name: c.name,
      description: c.description || '',
      sortOrder: c.sortOrder ?? 0,
      active: c.active
    };
  }

  async saveCategory(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.categoryForm.name.trim()) return;

    const payload: SkillCategory = {
      id: this.categoryForm.id,
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description,
      sortOrder: this.categoryForm.sortOrder,
      active: this.categoryForm.active
    };

    const result = await this.adminService.saveSkillCategory(this.companyId, payload);
    if (result.ok) {
      this.toast(this.t('ref_save_success'));
      this.resetCategoryForm();
    } else {
      this.toast(result.error || this.t('ref_save_error'));
    }
  }

  async deleteCategory(c: SkillCategory): Promise<void> {
    if (!c.id || !confirm(this.t('ref_confirm_delete'))) return;
    const ok = await this.adminService.deleteSkillCategory(c.id);
    if (ok) {
      this.toast(this.t('ref_delete_success'));
      if (this.categoryForm.id === c.id) this.resetCategoryForm();
    }
  }

  // --- Skills ---

  resetSkillForm(): void {
    this.skillForm = {
      id: undefined,
      name: '',
      description: '',
      categoryId: null,
      expectedLevel: 3,
      minRequiredLevel: 1,
      criticality: 'MEDIUM',
      mandatoryByDefault: true,
      active: true
    };
  }

  editSkill(s: Skill): void {
    this.skillForm = {
      id: s.id,
      name: s.name,
      description: s.description || '',
      categoryId: s.category?.id ?? null,
      expectedLevel: s.expectedLevel ?? 3,
      minRequiredLevel: s.minRequiredLevel ?? 1,
      criticality: s.criticality ?? 'MEDIUM',
      mandatoryByDefault: s.mandatoryByDefault ?? true,
      active: s.active
    };
  }

  async saveSkill(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.skillForm.name.trim()) return;

    const category = this.skillForm.categoryId
      ? this.categories().find(c => c.id === this.skillForm.categoryId)
      : undefined;

    const payload: Skill = {
      id: this.skillForm.id,
      name: this.skillForm.name.trim(),
      description: this.skillForm.description,
      category: category ? { id: category.id, name: category.name } : null,
      expectedLevel: this.skillForm.expectedLevel,
      minRequiredLevel: this.skillForm.minRequiredLevel,
      criticality: this.skillForm.criticality,
      mandatoryByDefault: this.skillForm.mandatoryByDefault,
      active: this.skillForm.active
    };

    const result = await this.adminService.saveSkill(this.companyId, payload);
    if (result.ok) {
      this.toast(this.t('ref_save_success'));
      this.resetSkillForm();
    } else {
      this.toast(result.error || this.t('ref_save_error'));
    }
  }

  async deleteSkill(s: Skill): Promise<void> {
    if (!s.id || !confirm(this.t('ref_confirm_delete'))) return;
    const ok = await this.adminService.deleteSkill(s.id);
    if (ok) {
      this.toast(this.t('ref_delete_success'));
      if (this.skillForm.id === s.id) this.resetSkillForm();
    }
  }

  categoryName(categoryId?: number): string {
    if (!categoryId) return '—';
    return this.categories().find(c => c.id === categoryId)?.name || '—';
  }

  // --- Job profiles ---

  resetProfileForm(): void {
    this.profileForm = {
      id: undefined,
      name: '',
      description: '',
      responsibilityLevel: '',
      active: true,
      skillLinks: []
    };
    this.selectedSkillToAdd.set(null);
    this.selectedFamilyId.set(null);
    this.selectedSkillId.set(null);
    this.selectedLevel.set(3);
    this.selectedMandatory.set(true);
  }

  editProfile(p: JobProfile): void {
    this.profileForm = {
      id: p.id,
      name: p.name,
      description: p.description || '',
      responsibilityLevel: p.responsibilityLevel || '',
      active: p.active,
      skillLinks: (p.profileSkills || []).map(ps => ({
        skillId: ps.skill!.id!,
        skillName: ps.skill!.name,
        expectedLevel: ps.expectedLevel ?? 3,
        mandatory: ps.mandatory ?? true
      }))
    };
  }

  availableSkillsForProfile() {
    const linked = new Set(this.profileForm.skillLinks.map(l => l.skillId));
    return this.skills().filter(s => s.id && s.active && !linked.has(s.id));
  }

  addSkillToProfile(): void {
    const skillId = this.selectedSkillToAdd();
    if (!skillId) return;
    const skill = this.skills().find(s => s.id === skillId);
    if (!skill) return;
    this.profileForm.skillLinks.push({
      skillId: skill.id!,
      skillName: skill.name,
      expectedLevel: skill.expectedLevel ?? 3,
      mandatory: skill.mandatoryByDefault ?? true
    });
    this.selectedSkillToAdd.set(null);
  }

  // --- Cascade Skill Link association methods ---
  onFamilySelected(familyId: number | null): void {
    this.selectedFamilyId.set(familyId);
    this.selectedSkillId.set(null); // Reset subsequent selections
  }

  skillsForSelectedFamily() {
    const familyId = this.selectedFamilyId();
    if (!familyId) return [];
    const linked = new Set(this.profileForm.skillLinks.map(l => l.skillId));
    return this.skills().filter(s => 
      s.id && 
      s.active && 
      s.category?.id === familyId && 
      !linked.has(s.id)
    );
  }

  addCascadingSkillToProfile(): void {
    const skillId = this.selectedSkillId();
    if (!skillId) return;
    const skill = this.skills().find(s => s.id === skillId);
    if (!skill) return;

    this.profileForm.skillLinks.push({
      skillId: skill.id!,
      skillName: skill.name,
      expectedLevel: this.selectedLevel(),
      mandatory: this.selectedMandatory()
    });

    // Reset selectors
    this.selectedSkillId.set(null);
  }

  removeSkillFromProfile(skillId: number): void {
    this.profileForm.skillLinks = this.profileForm.skillLinks.filter(l => l.skillId !== skillId);
  }

  async saveProfile(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.profileForm.name.trim()) return;

    const skillLinks: SkillLinkPayload[] = this.profileForm.skillLinks.map(l => ({
      skillId: l.skillId,
      expectedLevel: l.expectedLevel,
      mandatory: l.mandatory
    }));

    const payload: JobProfile = {
      id: this.profileForm.id,
      name: this.profileForm.name.trim(),
      description: this.profileForm.description,
      responsibilityLevel: this.profileForm.responsibilityLevel,
      active: this.profileForm.active,
      skillLinks
    };

    const result = await this.adminService.saveJobProfile(this.companyId, payload);
    if (result.ok) {
      this.toast(this.t('ref_save_success'));
      this.resetProfileForm();
    } else {
      this.toast(result.error || this.t('ref_save_error'));
    }
  }

  async deleteProfile(p: JobProfile): Promise<void> {
    if (!p.id || !confirm(this.t('ref_confirm_delete'))) return;
    const ok = await this.adminService.deleteJobProfile(p.id);
    if (ok) {
      this.toast(this.t('ref_delete_success'));
      if (this.profileForm.id === p.id) this.resetProfileForm();
    }
  }

  criticalityLabel(c: SkillCriticality | undefined): string {
    if (!c) return '—';
    const key = `ref_criticality_${c.toLowerCase()}`;
    const translated = this.t(key);
    return translated !== key ? translated : c;
  }

  private toast(message: string): void {
    this.onToast?.(message);
  }
}
