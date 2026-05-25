import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, Permission } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matrix-container table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Permissions / Actions</th>
            <th *ngFor="let role of roles()" class="text-center role-column">
              <div class="role-header-wrapper">
                <span class="role-badge">🛡️</span>
                <span class="role-name">{{ role.name }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let perm of permissions()">
            <td class="perm-info">
              <span class="perm-name">{{ perm.name }}</span>
              <span class="perm-desc">{{ perm.description }}</span>
            </td>
            <td *ngFor="let role of roles()" class="text-center checkbox-cell" (click)="togglePermission(role, perm)">
              <div class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  [checked]="hasPermission(role, perm)" 
                  (change)="$event.stopPropagation(); togglePermission(role, perm)"
                  class="matrix-checkbox"
                />
                <span class="checkbox-indicator" [class.checked]="hasPermission(role, perm)"></span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .matrix-container {
      margin-top: 1rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    
    .role-column {
      width: 180px;
    }
    
    .text-center {
      text-align: center !important;
    }
    
    .role-header-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    
    .role-badge {
      font-size: 1.1rem;
    }
    
    .role-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .perm-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    
    .perm-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    
    .perm-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .checkbox-cell {
      cursor: pointer;
      vertical-align: middle;
    }
    
    .checkbox-wrapper {
      display: inline-flex;
      position: relative;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .matrix-checkbox {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    
    .checkbox-indicator {
      height: 22px;
      width: 22px;
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      display: inline-block;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .checkbox-indicator:hover {
      border-color: var(--color-primary);
      transform: scale(1.05);
    }
    
    .checkbox-indicator.checked {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.4);
    }
    
    .checkbox-indicator.checked::after {
      content: "";
      position: absolute;
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `]
})
export class PermissionMatrixComponent {
  roles = input.required<Role[]>();
  permissions = input.required<Permission[]>();
  
  updateRole = output<Role>();

  hasPermission(role: Role, perm: Permission): boolean {
    return role.permissions.some(p => p.name === perm.name);
  }

  togglePermission(role: Role, perm: Permission) {
    let updatedPermissions = [...role.permissions];
    const existsIndex = updatedPermissions.findIndex(p => p.name === perm.name);
    
    if (existsIndex >= 0) {
      // Remove
      updatedPermissions.splice(existsIndex, 1);
    } else {
      // Add
      updatedPermissions.push(perm);
    }
    
    const updatedRole: Role = {
      ...role,
      permissions: updatedPermissions
    };
    
    this.updateRole.emit(updatedRole);
  }
}
