import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Company } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-company-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="company-node-container" [style.padding-left.px]="depth() * 24">
      <div class="company-node-card" [class.active-node]="isSelected()">
        <div class="node-info" (click)="onSelectCompany()">
          <!-- 
            AFFICHAGE DYNAMIQUE DU LOGO RÉEL :
            Si la société possède un logo en Base64, nous affichons l'image.
            Sinon, nous mettons notre icône d'immeuble 🏢 par défaut !
          -->
          <span class="node-icon" *ngIf="!company().logo">🏢</span>
          <img class="node-logo-img" *ngIf="company().logo" [src]="company().logo" alt="logo" />
          
          <div class="node-details">
            <span class="node-name">{{ company().name }}</span>
            <span class="node-meta" *ngIf="company().city">{{ company().city }}, {{ company().country }}</span>
          </div>
        </div>
        <div class="node-actions">
          <button class="node-btn add-btn" title="Ajouter une filiale sous ce niveau" (click)="onAddChild($event)">
            <span>+</span>
          </button>
          <button class="node-btn edit-btn" title="Modifier les informations" (click)="onEdit($event)">
            <span>✏️</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Render sub-companies recursively -->
    <ng-container *ngIf="company().subCompanies && company().subCompanies!.length > 0">
      <app-company-tree 
        *ngFor="let child of company().subCompanies" 
        [company]="child" 
        [selectedCompanyId]="selectedCompanyId()"
        [depth]="depth() + 1"
        (selectCompany)="selectCompany.emit($event)"
        (addChild)="addChild.emit($event)"
        (editCompany)="editCompany.emit($event)"
      ></app-company-tree>
    </ng-container>
  `,
  styles: [`
    .company-node-container {
      margin-bottom: 0.75rem;
      transition: all 0.2s ease;
    }
    
    .company-node-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
    }
    
    /* Subtle linking lines */
    .company-node-container:not(:first-child)::before {
      content: '';
      position: absolute;
      left: -12px;
      top: -12px;
      bottom: 50%;
      width: 12px;
      border-left: 2px dashed var(--border-color);
      border-bottom: 2px dashed var(--border-color);
      z-index: 1;
    }
    
    .company-node-card:hover {
      border-color: var(--color-primary);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }
    
    .active-node {
      border-color: var(--color-primary);
      background: rgba(var(--color-primary-rgb), 0.08);
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
    }
    
    .node-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    
    .node-icon {
      font-size: 1.25rem;
    }

    .node-logo-img {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: #ffffff;
      padding: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    
    .node-details {
      display: flex;
      flex-direction: column;
    }
    
    .node-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    
    .node-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .node-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .node-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }
    
    .add-btn:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #ffffff;
      transform: scale(1.1);
    }
    
    .edit-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--text-secondary);
      transform: scale(1.1);
    }
  `]
})
export class CompanyTreeComponent {
  company = input.required<Company>();
  selectedCompanyId = input<number>(0);
  depth = input<number>(0);
  
  selectCompany = output<number>();
  addChild = output<Company>();
  editCompany = output<Company>();

  isSelected = computed(() => this.company().id === this.selectedCompanyId());

  onSelectCompany() {
    if (this.company().id !== undefined) {
      this.selectCompany.emit(this.company().id!);
    }
  }

  onAddChild(event: MouseEvent) {
    event.stopPropagation();
    this.addChild.emit(this.company());
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.editCompany.emit(this.company());
  }
}
