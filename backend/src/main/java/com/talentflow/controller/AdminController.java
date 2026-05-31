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

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeePostAssignmentRepository employeePostAssignmentRepository;

    @Autowired
    private EmailAlertConfigRepository emailAlertConfigRepository;

    @Autowired
    private SystemNotificationRepository systemNotificationRepository;

    @Autowired
    private JobProfileRepository jobProfileRepository;

    private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

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
            
            if (details.getLogo() != null) {
                company.setLogo(details.getLogo());
            }
            
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/companies/{id}/logo")
    public ResponseEntity<Company> uploadLogo(@PathVariable Long id, @RequestBody LogoPayload payload) {
        return companyRepository.findById(id).map(company -> {
            company.setLogo(payload.getLogo());
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

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

    // --- USERS API (WITH SECURE PASSWORD HASHING & LOCKOUTS) ---
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
        if (user.getEmployee() != null && user.getEmployee().getId() != null) {
            employeeRepository.findById(user.getEmployee().getId()).ifPresent(user::setEmployee);
        }
        
        // Hachage sécurisé du mot de passe à la création (norme BCrypt)
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode("password123"));
        } else {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // Initialisation des données de sécurité
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setAccountDisabled(false);
        user.setFirstLogin(true);
        user.setPasswordLastChanged(java.time.LocalDateTime.now());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User details) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(details.getUsername());
            user.setEmail(details.getEmail());
            user.setActive(details.isActive());
            user.setFirstName(details.getFirstName());
            user.setLastName(details.getLastName());
            
            if (details.getCompany() != null && details.getCompany().getId() != null) {
                companyRepository.findById(details.getCompany().getId()).ifPresent(user::setCompany);
            }
            if (details.getRole() != null && details.getRole().getId() != null) {
                roleRepository.findById(details.getRole().getId()).ifPresent(user::setRole);
            }
            if (details.getEmployee() != null && details.getEmployee().getId() != null) {
                employeeRepository.findById(details.getEmployee().getId()).ifPresent(user::setEmployee);
            } else {
                user.setEmployee(null);
            }
            
            // Si l'administrateur modifie explicitement le statut d'activité
            if (!details.isActive()) {
                user.setAccountDisabled(true); // Désactive aussi côté sécurité
            } else {
                user.setAccountDisabled(false);
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
            }

            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Déverrouillage d'un compte bloqué suite à tentatives infructueuses
    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<User> unlockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setAccountDisabled(false);
            user.setActive(true); // Réactive le compte
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Règle de non-suppression physique : Désactivation uniquement !
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(false);
            user.setAccountDisabled(true); // Bloque définitivement suite départ
            userRepository.save(user);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- EMPLOYEES API (CRUD avec soft-delete) ---
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        try {
            validateEmployee(employee);
            
            if (employee.getCompany() != null && employee.getCompany().getId() != null) {
                companyRepository.findById(employee.getCompany().getId()).ifPresent(employee::setCompany);
            }
            if (employee.getManager() != null && employee.getManager().getId() != null) {
                employeeRepository.findById(employee.getManager().getId()).ifPresent(employee::setManager);
            } else {
                employee.setManager(null);
            }
            employee.setActive(true);
            
            // Handle post assignments
            if (employee.getPostAssignments() != null) {
                for (EmployeePostAssignment assignment : employee.getPostAssignments()) {
                    assignment.setEmployee(employee);
                    if (assignment.getJobProfile() != null && assignment.getJobProfile().getId() != null) {
                        jobProfileRepository.findById(assignment.getJobProfile().getId()).ifPresent(assignment::setJobProfile);
                    }
                }
            }
            
            Employee saved = employeeRepository.save(employee);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee details) {
        try {
            details.setId(id); // Set the current ID for email uniqueness check exclusion
            validateEmployee(details);
            
            return employeeRepository.findById(id).map(employee -> {
                employee.setFirstName(details.getFirstName());
                employee.setLastName(details.getLastName());
                employee.setEmail(details.getEmail());
                employee.setJobTitle(details.getJobTitle());
                employee.setKeySkill(details.getKeySkill());
                employee.setSkillLevel(details.getSkillLevel());
                employee.setHabilitationName(details.getHabilitationName());
                employee.setHabilitationExpiryDate(details.getHabilitationExpiryDate());
                employee.setActive(details.isActive());
                
                // New rich fields
                employee.setPhoneNumber(details.getPhoneNumber());
                employee.setBirthDate(details.getBirthDate());
                employee.setGender(details.getGender());
                employee.setDepartment(details.getDepartment());
                employee.setEntryDate(details.getEntryDate());
                employee.setRetirementDate(details.getRetirementDate());
                
                if (details.getCompany() != null && details.getCompany().getId() != null) {
                    companyRepository.findById(details.getCompany().getId()).ifPresent(employee::setCompany);
                } else {
                    employee.setCompany(null);
                }
                
                if (details.getManager() != null && details.getManager().getId() != null) {
                    employeeRepository.findById(details.getManager().getId()).ifPresent(employee::setManager);
                } else {
                    employee.setManager(null);
                }
                
                // Sync post assignments
                employee.getPostAssignments().clear();
                if (details.getPostAssignments() != null) {
                    for (EmployeePostAssignment assignment : details.getPostAssignments()) {
                        EmployeePostAssignment newAssignment = EmployeePostAssignment.builder()
                                .employee(employee)
                                .startDate(assignment.getStartDate())
                                .endDate(assignment.getEndDate())
                                .active(assignment.isActive())
                                .build();
                        if (assignment.getJobProfile() != null && assignment.getJobProfile().getId() != null) {
                            jobProfileRepository.findById(assignment.getJobProfile().getId()).ifPresent(newAssignment::setJobProfile);
                        }
                        employee.getPostAssignments().add(newAssignment);
                    }
                }
                
                // Si le collaborateur est désactivé, on désactive aussi son compte utilisateur associé s'il existe
                if (!details.isActive()) {
                    userRepository.findAll().stream()
                        .filter(u -> u.getEmployee() != null && u.getEmployee().getId().equals(id))
                        .findFirst()
                        .ifPresent(u -> {
                            u.setActive(false);
                            u.setAccountDisabled(true);
                            userRepository.save(u);
                        });
                }

                return ResponseEntity.ok(employeeRepository.save(employee));
            }).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id).map(employee -> {
            employee.setActive(false);
            employeeRepository.save(employee);
            
            // Désactiver aussi le compte utilisateur lié s'il existe
            userRepository.findAll().stream()
                .filter(u -> u.getEmployee() != null && u.getEmployee().getId().equals(id))
                .findFirst()
                .ifPresent(u -> {
                    u.setActive(false);
                    u.setAccountDisabled(true);
                    userRepository.save(u);
                });

            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- REFERENTIALS: JOB PROFILES / FUNCTIONS API ---
    @GetMapping("/job-profiles")
    public List<JobProfile> getAllJobProfiles() {
        return jobProfileRepository.findAll();
    }

    @PostMapping("/job-profiles")
    public ResponseEntity<JobProfile> createJobProfile(@RequestBody JobProfile profile) {
        if (profile.getCompany() != null && profile.getCompany().getId() != null) {
            companyRepository.findById(profile.getCompany().getId()).ifPresent(profile::setCompany);
        }
        JobProfile saved = jobProfileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/job-profiles/{id}")
    public ResponseEntity<JobProfile> updateJobProfile(@PathVariable Long id, @RequestBody JobProfile details) {
        return jobProfileRepository.findById(id).map(profile -> {
            profile.setName(details.getName());
            profile.setDescription(details.getDescription());
            profile.setActive(details.isActive());
            
            if (details.getCompany() != null && details.getCompany().getId() != null) {
                companyRepository.findById(details.getCompany().getId()).ifPresent(profile::setCompany);
            }
            
            return ResponseEntity.ok(jobProfileRepository.save(profile));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Règle de non-suppression : Désactivation uniquement !
    @DeleteMapping("/job-profiles/{id}")
    public ResponseEntity<Void> deactivateJobProfile(@PathVariable Long id) {
        return jobProfileRepository.findById(id).map(profile -> {
            profile.setActive(false);
            jobProfileRepository.save(profile);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- EMAIL ALERTS API ---
    @GetMapping("/email-alerts")
    public List<EmailAlertConfig> getAllEmailAlerts() {
        return emailAlertConfigRepository.findAll();
    }

    @PostMapping("/email-alerts/{id}/toggle")
    public ResponseEntity<EmailAlertConfig> toggleEmailAlert(@PathVariable Long id) {
        return emailAlertConfigRepository.findById(id).map(config -> {
            config.setActive(!config.isActive());
            return ResponseEntity.ok(emailAlertConfigRepository.save(config));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- NOTIFICATIONS API ---
    @GetMapping("/notifications")
    public List<SystemNotification> getAllNotifications() {
        return systemNotificationRepository.findAll();
    }

    @PostMapping("/notifications/{id}/acknowledge")
    public ResponseEntity<SystemNotification> acknowledgeNotification(@PathVariable Long id) {
        return systemNotificationRepository.findById(id).map(notification -> {
            notification.setAcknowledged(true);
            return ResponseEntity.ok(systemNotificationRepository.save(notification));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void validateEmployee(Employee employee) {
        // 1. Contrôle des Noms / Prénoms (lettres, espaces et tirets uniquement)
        String nameRegex = "^[A-Za-zÀ-ÖØ-öø-ÿ\\s\\-]+$";
        if (employee.getFirstName() == null || !employee.getFirstName().trim().matches(nameRegex)) {
            throw new IllegalArgumentException("Le prénom doit contenir uniquement des lettres, tirets et espaces.");
        }
        if (employee.getLastName() == null || !employee.getLastName().trim().matches(nameRegex)) {
            throw new IllegalArgumentException("Le nom de famille doit contenir uniquement des lettres, tirets et espaces.");
        }

        // 2. Validation du Format de l'Email
        String emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (employee.getEmail() == null || !employee.getEmail().trim().matches(emailRegex)) {
            throw new IllegalArgumentException("L'adresse e-mail professionnelle n'est pas au format valide (ex: prenom.nom@domaine.com).");
        }

        // 3. Contrôle de l'unicité de l'Email
        Optional<Employee> existing = employeeRepository.findByEmail(employee.getEmail().trim());
        if (existing.isPresent()) {
            if (employee.getId() == null || !existing.get().getId().equals(employee.getId())) {
                throw new IllegalArgumentException("L'adresse e-mail professionnelle est déjà utilisée par un autre collaborateur.");
            }
        }

        // 4. Contrôle du Téléphone (GSM) & Préfixes autorisés
        String phone = employee.getPhoneNumber();
        if (phone != null && !phone.trim().isEmpty()) {
            String cleanPhone = phone.trim().replaceAll("\\s+", ""); // remove spaces
            
            // Liste des préfixes autorisés
            String[] prefixes = {"+33", "+32", "+352", "+216", "+34", "+351", "+49", "+1"};
            boolean hasValidPrefix = false;
            String matchedPrefix = "";
            for (String prefix : prefixes) {
                if (cleanPhone.startsWith(prefix)) {
                    hasValidPrefix = true;
                    matchedPrefix = prefix;
                    break;
                }
            }
            if (!hasValidPrefix) {
                throw new IllegalArgumentException("Le numéro de téléphone doit commencer par un préfixe valide (ex: +33 France, +32 Belgique, +216 Tunisie).");
            }
            
            // Le reste doit contenir uniquement des chiffres
            String numberWithoutPrefix = cleanPhone.substring(matchedPrefix.length());
            if (!numberWithoutPrefix.matches("^[0-9]+$")) {
                throw new IllegalArgumentException("Le numéro de téléphone doit contenir uniquement des chiffres après le préfixe.");
            }
        }

        // 5. Cohérence des Dates (Retraite strictement supérieure à l'entrée de contrat)
        if (employee.getEntryDate() != null && employee.getRetirementDate() != null) {
            if (!employee.getRetirementDate().isAfter(employee.getEntryDate())) {
                throw new IllegalArgumentException("La date prévisionnelle de retraite doit être strictement supérieure à la date d'entrée (début de contrat).");
            }
        }
    }
}
