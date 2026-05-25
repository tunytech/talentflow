import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Company } from '../../../../core/services/admin.service';

// Ce composant fabrique un magnifique organigramme graphique.
// Les sociétés s'affichent sous forme de rectangles colorés ("nœuds") disposés horizontalement 
// par niveau et reliés verticalement par des lignes, à la façon d'un arbre généalogique !
@Component({
  selector: 'app-company-org-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="org-node-box">
      <!-- Le rectangle représentant la société active -->
      <div 
        class="org-node-rect animate-pop" 
        [class.selected]="isSelected()" 
        (click)="onSelectCompany()">
        
        <!-- Affichage du logo en Base64 s'il existe, sinon l'icône standard 🏢 -->
        <div class="org-node-logo-wrapper">
          <img *ngIf="company().logo" [src]="company().logo" alt="logo" class="org-logo-img" />
          <span *ngIf="!company().logo" class="org-logo-fallback">🏢</span>
        </div>

        <div class="org-node-name">{{ company().name }}</div>
        <div class="org-node-city" *ngIf="company().city">{{ company().city }}</div>
        
        <!-- Petit badge pour repérer le nombre de filiales directes -->
        <span class="org-child-count" *ngIf="company().subCompanies && company().subCompanies!.length > 0">
          {{ company().subCompanies!.length }} filiale(s)
        </span>
      </div>

      <!-- 
        RÉCURSIVITÉ (LES ENFANTS) :
        Si cette société possède des sous-sociétés (filiales), nous créons une nouvelle ligne 
        et nous demandons à ce même composant d'app-company-org-chart de se dessiner lui-même 
        pour chaque filiale ! C'est ce qu'on appelle un composant récursif.
      -->
      <ul class="org-children-list" *ngIf="company().subCompanies && company().subCompanies!.length > 0">
        <li class="org-child-item" *ngFor="let child of company().subCompanies">
          <app-company-org-chart 
            [company]="child" 
            [selectedCompanyId]="selectedCompanyId()"
            (selectCompany)="selectCompany.emit($event)"
          ></app-company-org-chart>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    /* =========================================================================
       STYLES DE L'ORGANIGRAMME GRAPHIQUE EN ARBRE (FAMILY TREE EFFECT)
       ========================================================================= */
    
    .org-node-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    /* Le rectangle en verre dépoli (Glassmorphism) */
    .org-node-rect {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
      color: #ffffff;
      min-width: 180px;
      max-width: 220px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 1px rgba(255, 255, 255, 0.05);
      cursor: pointer;
      z-index: 10;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    /* Effet au survol : élévation et halo lumineux violet */
    .org-node-rect:hover {
      transform: translateY(-6px);
      border-color: #a855f7;
      box-shadow: 0 12px 30px rgba(168, 85, 247, 0.35);
      background: rgba(15, 23, 42, 0.8);
    }

    /* Node sélectionné */
    .org-node-rect.selected {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.18);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }

    /* Logo ou icône de la société */
    .org-node-logo-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.75rem auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: transform 0.3s;
    }

    .org-node-rect:hover .org-node-logo-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .org-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #ffffff;
      padding: 3px;
    }

    .org-logo-fallback {
      font-size: 1.5rem;
    }

    .org-node-name {
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: -0.3px;
      color: #ffffff;
      line-height: 1.3;
    }

    .org-node-city {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .org-child-count {
      display: inline-block;
      font-size: 0.65rem;
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      margin-top: 0.5rem;
    }

    /* =========================================================================
       LIGNES DE CONNEXION DE L'ARBRE GÉNÉALOGIQUE (Pure CSS Tree)
       ========================================================================= */

    /* Conteneur de la liste des enfants */
    .org-children-list {
      display: flex;
      flex-direction: row;
      padding-top: 24px;
      position: relative;
      list-style: none;
      margin: 0;
      padding-left: 0;
    }

    /* Ligne verticale qui descend sous le parent */
    .org-node-box > .org-children-list::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      border-left: 2px solid rgba(255, 255, 255, 0.15);
      width: 0;
      height: 24px;
      transform: translateX(-50%);
    }

    /* Chaque filiale sous le parent */
    .org-child-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding: 24px 12px 0 12px;
    }

    /* Lignes horizontales pour relier les frères/sœurs filiales */
    .org-child-item::before, .org-child-item::after {
      content: '';
      position: absolute;
      top: 0;
      right: 50%;
      border-top: 2px solid rgba(255, 255, 255, 0.15);
      width: 50%;
      height: 24px;
    }

    .org-child-item::after {
      right: auto;
      left: 50%;
      border-left: 2px solid rgba(255, 255, 255, 0.15);
    }

    /* Retrait des lignes si c'est un enfant unique */
    .org-child-item:only-child::after, .org-child-item:only-child::before {
      display: none;
    }

    .org-child-item:only-child {
      padding-top: 0;
    }

    /* Retrait des débords de lignes à gauche pour le 1er enfant et à droite pour le dernier */
    .org-child-item:first-child::before, 
    .org-child-item:last-child::after {
      border: 0 none;
    }

    .org-child-item:last-child::before {
      border-right: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 0 10px 0 0;
    }

    .org-child-item:first-child::after {
      border-radius: 10px 0 0 0;
    }

    /* Animation pop au chargement */
    .animate-pop {
      animation: popNode 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes popNode {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class CompanyOrgChartComponent {
  company = input.required<Company>();
  selectedCompanyId = input<number>(0);
  
  selectCompany = output<Company>();

  isSelected = computed(() => this.company().id === this.selectedCompanyId());

  onSelectCompany() {
    this.selectCompany.emit(this.company());
  }
}
