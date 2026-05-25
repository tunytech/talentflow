package com.talentflow.controller;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Allows easy integration with Angular dev server
public class AdminController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Autowired
    private UserRepository userRepository;

    // --- COMPANIES API ---
    @GetMapping("/companies")
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @GetMapping("/companies/root")
    public List<Company> getRootCompanies() {
        return companyRepository.findByParentIsNull();
    }

    @PostMapping("/companies")
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        if (company.getParent() != null && company.getParent().getId() != null) {
            Optional<Company> parent = companyRepository.findById(company.getParent().getId());
            parent.ifPresent(company::setParent);
        } else {
            company.setParent(null);
        }
        Company saved = companyRepository.save(company);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company details) {
        return companyRepository.findById(id).map(company -> {
            company.setName(details.getName());
            company.setVatNumber(details.getVatNumber());
            company.setAddress(details.getAddress());
            company.setCountry(details.getCountry());
            company.setCity(details.getCity());
            company.setPostalCode(details.getPostalCode());
            company.setContactInfo(details.getContactInfo());
            
            // Si le client nous transmet un logo (en Base64), nous le mettons à jour !
            if (details.getLogo() != null) {
                company.setLogo(details.getLogo());
            }
            
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ENREGISTREMENT ET UPLOAD DE LOGO ---
    // Cet endpoint reçoit une requête contenant le logo encodé en texte (Base64)
    // et l'associe directement à la société correspondante.
    @PostMapping("/companies/{id}/logo")
    public ResponseEntity<Company> uploadLogo(@PathVariable Long id, @RequestBody LogoPayload payload) {
        return companyRepository.findById(id).map(company -> {
            // Nous insérons la grande chaîne de caractères Base64 dans la colonne logo !
            company.setLogo(payload.getLogo());
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Petite structure d'accueil temporaire pour récupérer le logo au format JSON
    public static class LogoPayload {
        private String logo;
        public String getLogo() { return logo; }
        public void setLogo(String logo) { this.logo = logo; }
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- ROLES & PERMISSIONS API ---
    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @GetMapping("/permissions")
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role saved = roleRepository.save(role);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role details) {
        return roleRepository.findById(id).map(role -> {
            role.setName(details.getName());
            role.setDescription(details.getDescription());
            role.setPermissions(details.getPermissions());
            return ResponseEntity.ok(roleRepository.save(role));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- SETTINGS API ---
    @GetMapping("/settings/company/{companyId}")
    public List<AppSetting> getSettingsByCompany(@PathVariable Long companyId) {
        return appSettingRepository.findByCompanyId(companyId);
    }

    @PostMapping("/settings/company/{companyId}")
    public ResponseEntity<List<AppSetting>> saveSettings(@PathVariable Long companyId, @RequestBody List<AppSetting> settings) {
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        if (!companyOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Company company = companyOpt.get();
        for (AppSetting setting : settings) {
            Optional<AppSetting> existing = appSettingRepository.findByCompanyIdAndKey(companyId, setting.getKey());
            if (existing.isPresent()) {
                AppSetting existingSetting = existing.get();
                existingSetting.setValue(setting.getValue());
                existingSetting.setDescription(setting.getDescription());
                appSettingRepository.save(existingSetting);
            } else {
                setting.setCompany(company);
                appSettingRepository.save(setting);
            }
        }
        return ResponseEntity.ok(appSettingRepository.findByCompanyId(companyId));
    }

    // --- USERS API ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (user.getCompany() != null && user.getCompany().getId() != null) {
            companyRepository.findById(user.getCompany().getId()).ifPresent(user::setCompany);
        }
        if (user.getRole() != null && user.getRole().getId() != null) {
            roleRepository.findById(user.getRole().getId()).ifPresent(user::setRole);
        }
        // Simplified passwords for demonstration
        if (user.getPassword() == null) {
            user.setPassword("password123");
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User details) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(details.getUsername());
            user.setEmail(details.getEmail());
            user.setActive(details.isActive());
            if (details.getCompany() != null && details.getCompany().getId() != null) {
                companyRepository.findById(details.getCompany().getId()).ifPresent(user::setCompany);
            }
            if (details.getRole() != null && details.getRole().getId() != null) {
                roleRepository.findById(details.getRole().getId()).ifPresent(user::setRole);
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
