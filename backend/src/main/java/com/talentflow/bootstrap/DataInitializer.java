package com.talentflow.bootstrap;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if the database is empty
        if (companyRepository.count() > 0) {
            // Check if we need to seed the 50 collaborators (brownfield execution)
            if (employeeRepository.count() < 20) {
                seed50Collaborators();
            }
            return;
        }

        System.out.println("Initializing premium Talentflow database with default configurations...");

        // 1. Create Companies & Subsidiaries
        Company parentCompany = Company.builder()
                .name("Tunytech Holdings (Société Mère)")
                .vatNumber("SIRET-882711002")
                .address("10 Rue de la Paix")
                .city("Paris")
                .postalCode("75002")
                .country("France")
                .contactInfo("contact@tunytech.com")
                .build();
        parentCompany = companyRepository.save(parentCompany);

        Company subsidiaryEurope = Company.builder()
                .name("Tunytech Europe (Filiale)")
                .parent(parentCompany)
                .vatNumber("VAT-EU772619")
                .address("Avenue Louise 120")
                .city("Bruxelles")
                .postalCode("1000")
                .country("Belgique")
                .contactInfo("europe@tunytech.com")
                .build();
        subsidiaryEurope = companyRepository.save(subsidiaryEurope);

        Company subsidiaryAmericas = Company.builder()
                .name("Tunytech Americas (Filiale)")
                .parent(parentCompany)
                .vatNumber("TAX-US-99182")
                .address("5th Avenue 500")
                .city("New York")
                .postalCode("10001")
                .country("États-Unis")
                .contactInfo("americas@tunytech.com")
                .build();
        subsidiaryAmericas = companyRepository.save(subsidiaryAmericas);

        Company subSubFrance = Company.builder()
                .name("Tunytech France (Sous-Filiale)")
                .parent(subsidiaryEurope)
                .vatNumber("SIRET-882711002-00014")
                .address("20 Boulevard Haussmann")
                .city("Paris")
                .postalCode("75009")
                .country("France")
                .contactInfo("france@tunytech.com")
                .build();
        subSubFrance = companyRepository.save(subSubFrance);

        // 2. Create Permissions
        List<Permission> permissionsList = Arrays.asList(
                Permission.builder().name("READ_COMPANIES").description("Lire les informations des sociétés").build(),
                Permission.builder().name("WRITE_COMPANIES").description("Créer et modifier des sociétés/filiales").build(),
                Permission.builder().name("READ_USERS").description("Consulter les comptes utilisateurs").build(),
                Permission.builder().name("WRITE_USERS").description("Gérer les utilisateurs et attribuer les rôles").build(),
                Permission.builder().name("READ_EMPLOYEES").description("Consulter le registre des collaborateurs").build(),
                Permission.builder().name("WRITE_EMPLOYEES").description("Gérer la fiche des employés").build(),
                Permission.builder().name("CONFIG_SYSTEM").description("Modifier la configuration globale de l'application").build()
        );
        
        Map<String, Permission> permissionsMap = new HashMap<>();
        for (Permission perm : permissionsList) {
            Permission saved = permissionRepository.save(perm);
            permissionsMap.put(saved.getName(), saved);
        }

        // 3. Create Roles with dynamic permission mapping
        Role adminRole = Role.builder()
                .name("Administrateur")
                .description("Accès complet à la configuration et aux données")
                .permissions(new HashSet<>(permissionsMap.values()))
                .build();
        adminRole = roleRepository.save(adminRole);

        Role managerRole = Role.builder()
                .name("Manager")
                .description("Gestion de son équipe et consultation générale")
                .permissions(new HashSet<>(Arrays.asList(
                        permissionsMap.get("READ_COMPANIES"),
                        permissionsMap.get("READ_USERS"),
                        permissionsMap.get("READ_EMPLOYEES")
                )))
                .build();
        managerRole = roleRepository.save(managerRole);

        Role rhRole = Role.builder()
                .name("Responsable RH")
                .description("Gestion du recrutement, compétences et formations")
                .permissions(new HashSet<>(Arrays.asList(
                        permissionsMap.get("READ_COMPANIES"),
                        permissionsMap.get("READ_EMPLOYEES"),
                        permissionsMap.get("WRITE_EMPLOYEES")
                )))
                .build();
        rhRole = roleRepository.save(rhRole);

        Role qualityRole = Role.builder()
                .name("Qualité")
                .description("Gestion de la conformité ISO et des habilitations")
                .permissions(new HashSet<>(Arrays.asList(
                        permissionsMap.get("READ_COMPANIES"),
                        permissionsMap.get("READ_EMPLOYEES")
                )))
                .build();
        qualityRole = roleRepository.save(qualityRole);

        // 4. Création des paramètres système par défaut pour la Société Mère (Tunytech Holdings)
        // Nous créons une boîte à outils de configurations avec des explications simples.
        List<AppSetting> settings = Arrays.asList(
                AppSetting.builder().key("WORK_START_HOUR").value("08:00").description("Heure de début de la journée de travail").build(),
                AppSetting.builder().key("WORK_END_HOUR").value("17:00").description("Heure de fin de la journée de travail").build(),
                AppSetting.builder().key("MAX_HOURS_DAILY").value("8").description("Nombre maximal d'heures de travail par jour").build(),
                AppSetting.builder().key("WFH_DAYS_WEEK").value("2").description("Nombre de jours autorisés de télétravail par semaine").build(),
                AppSetting.builder().key("WFH_DAYS_MONTH").value("8").description("Nombre de jours de télétravail autorisés par mois").build(),
                AppSetting.builder().key("WFH_EXCEPTION_MOTIFS").value("Grève des transports,Grève générale,Conditions météo extrêmes,Crise sanitaire,Situation familiale exceptionnelle").description("Liste des motifs valides de télétravail exceptionnel").build(),
                
                // --- NOUVEAUX PARAMÈTRES DE SÉCURITÉ ---
                AppSetting.builder().key("MIN_PASSWORD_LENGTH").value("12").description("Longueur minimale autorisée pour les mots de passe (12 recommandé, alerte si < 8)").build(),
                AppSetting.builder().key("PASSWORD_EXPIRY_DAYS").value("180").description("Durée de validité du mot de passe en jours (180 jours = 6 mois)").build(),
                AppSetting.builder().key("TOKEN_VALIDITY_MINUTES").value("15").description("Durée de validité en minutes du code secret de réinitialisation (15 minutes max)").build(),
                
                // --- PARAMÈTRE DYNAMIQUE DE GENRE ---
                AppSetting.builder().key("GENDER_LIST").value("Homme,Femme,Non défini").description("Liste des genres autorisés pour les collaborateurs (séparés par des virgules)").build()
        );

        for (AppSetting setting : settings) {
            setting.setCompany(parentCompany);
            appSettingRepository.save(setting);
        }

        // Nous faisons de même pour la filiale Tunytech Europe avec ses propres règles
        List<AppSetting> europeSettings = Arrays.asList(
                AppSetting.builder().key("WORK_START_HOUR").value("09:00").description("Heure de début de la journée de travail").build(),
                AppSetting.builder().key("WORK_END_HOUR").value("18:00").description("Heure de fin de la journée de travail").build(),
                AppSetting.builder().key("MAX_HOURS_DAILY").value("8").description("Nombre maximal d'heures de travail par jour").build(),
                AppSetting.builder().key("WFH_DAYS_WEEK").value("3").description("Nombre de jours autorisés de télétravail par semaine").build(),
                AppSetting.builder().key("WFH_DAYS_MONTH").value("12").description("Nombre de jours de télétravail autorisés par mois").build(),
                AppSetting.builder().key("WFH_EXCEPTION_MOTIFS").value("Grève des transports,Grève générale,Inondations").description("Motifs exceptionnels").build(),
                
                // Paramètres sécurité pour la filiale Europe
                AppSetting.builder().key("MIN_PASSWORD_LENGTH").value("12").description("Longueur minimale autorisée pour les mots de passe").build(),
                AppSetting.builder().key("PASSWORD_EXPIRY_DAYS").value("180").description("Durée de validité du mot de passe en jours").build(),
                AppSetting.builder().key("TOKEN_VALIDITY_MINUTES").value("15").description("Durée de validité en minutes du code secret").build(),
                
                // --- PARAMÈTRE DYNAMIQUE DE GENRE ---
                AppSetting.builder().key("GENDER_LIST").value("Homme,Femme,Non défini").description("Liste des genres autorisés pour les collaborateurs").build()
        );

        for (AppSetting setting : europeSettings) {
            setting.setCompany(subsidiaryEurope);
            appSettingRepository.save(setting);
        }

        // Nous préparons la machine à crypter les mots de passe (comme une machine à écrire des codes secrets indéchiffrables)
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        // --- 5. CRÉATION DES COLLABORATEURS (EMPLOYEES) ---
        Employee empAdmin = Employee.builder()
                .firstName("Jean")
                .lastName("Administrateur")
                .email("admin@tunytech.com")
                .company(parentCompany)
                .jobTitle("System Architect")
                .keySkill("Java & Angular Architecture")
                .skillLevel(5)
                .habilitationName("ISO 27001 Auditor")
                .habilitationExpiryDate(java.time.LocalDate.of(2027, 1, 15))
                .active(true)
                .phoneNumber("+33 6 12 34 56 78")
                .birthDate(java.time.LocalDate.of(1980, 5, 15))
                .gender("Homme")
                .department("Direction")
                .entryDate(java.time.LocalDate.of(2015, 1, 1))
                .retirementDate(java.time.LocalDate.of(2045, 5, 15))
                .build();
        empAdmin = employeeRepository.save(empAdmin);

        Employee empRh = Employee.builder()
                .firstName("Marie")
                .lastName("Lefebvre")
                .email("rh.france@tunytech.com")
                .company(subSubFrance)
                .jobTitle("Responsable RH")
                .keySkill("Recrutement & Onboarding")
                .skillLevel(4)
                .habilitationName("RGPD DPO Certification")
                .habilitationExpiryDate(java.time.LocalDate.of(2026, 10, 30))
                .active(true)
                .phoneNumber("+33 6 98 76 54 32")
                .birthDate(java.time.LocalDate.of(1985, 11, 20))
                .gender("Femme")
                .department("Ressources Humaines")
                .manager(empAdmin)
                .entryDate(java.time.LocalDate.of(2018, 6, 1))
                .retirementDate(java.time.LocalDate.of(2050, 11, 20))
                .build();
        empRh = employeeRepository.save(empRh);

        Employee empDevops = Employee.builder()
                .firstName("Amir")
                .lastName("Nouveau")
                .email("nouveau@tunytech.com")
                .company(subSubFrance)
                .jobTitle("Ingénieur DevOps")
                .keySkill("CI/CD & Cloud Infrastructure")
                .skillLevel(4)
                .habilitationName("AWS Certified Practitioner")
                .habilitationExpiryDate(java.time.LocalDate.of(2026, 9, 5))
                .active(true)
                .phoneNumber("+33 6 11 22 33 44")
                .birthDate(java.time.LocalDate.of(1992, 3, 10))
                .gender("Homme")
                .department("R&D")
                .manager(empRh)
                .entryDate(java.time.LocalDate.of(2021, 9, 1))
                .retirementDate(java.time.LocalDate.of(2057, 3, 10))
                .build();
        empDevops = employeeRepository.save(empDevops);

        Employee empQuality = Employee.builder()
                .firstName("Hejer")
                .lastName("Ben Ali")
                .email("hejer.benali@tunytech.com")
                .company(subSubFrance)
                .jobTitle("Qualité Assurance")
                .keySkill("Conformité & CAPA")
                .skillLevel(5)
                .habilitationName("ISO 9001 Lead Auditor")
                .habilitationExpiryDate(java.time.LocalDate.of(2026, 6, 12))
                .active(true)
                .phoneNumber("+33 6 55 66 77 88")
                .birthDate(java.time.LocalDate.of(1988, 7, 25))
                .gender("Femme")
                .department("Qualité")
                .manager(empRh)
                .entryDate(java.time.LocalDate.of(2019, 2, 15))
                .retirementDate(java.time.LocalDate.of(2053, 7, 25))
                .build();
        empQuality = employeeRepository.save(empQuality);

        Employee empSupport = Employee.builder()
                .firstName("Jan")
                .lastName("de Vries")
                .email("jan.devries@tunytech.com")
                .company(parentCompany)
                .jobTitle("Technicien Support")
                .keySkill("Maintenance & Hardware")
                .skillLevel(3)
                .habilitationName("Habilitation Électrique B2V")
                .habilitationExpiryDate(java.time.LocalDate.of(2026, 3, 18))
                .active(true)
                .phoneNumber("+31 6 44 55 66 77")
                .birthDate(java.time.LocalDate.of(1975, 9, 5))
                .gender("Homme")
                .department("Support")
                .manager(empAdmin)
                .entryDate(java.time.LocalDate.of(2016, 10, 1))
                .retirementDate(java.time.LocalDate.of(2040, 9, 5))
                .build();
        empSupport = employeeRepository.save(empSupport);

        // Collaborateur indépendant sans compte utilisateur (Thomas Mueller)
        Employee empIndependent = Employee.builder()
                .firstName("Thomas")
                .lastName("Mueller")
                .email("t.mueller@tunytech.com")
                .company(subsidiaryEurope)
                .jobTitle("Ingénieur DevOps")
                .keySkill("Kubernetes & Security")
                .skillLevel(4)
                .habilitationName("Kubernetes Administrator (CKA)")
                .habilitationExpiryDate(java.time.LocalDate.of(2026, 9, 5))
                .active(true)
                .phoneNumber("+49 170 889977")
                .birthDate(java.time.LocalDate.of(1990, 12, 1))
                .gender("Non défini")
                .department("R&D")
                .manager(empAdmin)
                .entryDate(java.time.LocalDate.of(2020, 3, 1))
                .retirementDate(java.time.LocalDate.of(2055, 12, 1))
                .build();
        employeeRepository.save(empIndependent);

        // --- 6. CRÉATION DES COMPTES UTILISATEURS (USERS) LIÉS ---
        User defaultAdmin = User.builder()
                .username("admin")
                .email("admin@tunytech.com")
                .password(encoder.encode("Admin123456!"))
                .firstName("Jean")
                .lastName("Administrateur")
                .company(parentCompany)
                .role(adminRole)
                .firstLogin(false)
                .passwordLastChanged(java.time.LocalDateTime.now())
                .active(true)
                .employee(empAdmin)
                .build();
        userRepository.save(defaultAdmin);

        User rhFrance = User.builder()
                .username("rh.france")
                .email("rh.france@tunytech.com")
                .password(encoder.encode("RhFrance123!"))
                .firstName("Marie")
                .lastName("Lefebvre")
                .company(subSubFrance)
                .role(rhRole)
                .firstLogin(false)
                .passwordLastChanged(java.time.LocalDateTime.now())
                .active(true)
                .employee(empRh)
                .build();
        userRepository.save(rhFrance);

        User nouvelEmploye = User.builder()
                .username("nouveau.employe")
                .email("nouveau@tunytech.com")
                .password(encoder.encode("Bienvenue123!"))
                .firstName("Amir")
                .lastName("Nouveau")
                .company(subSubFrance)
                .role(managerRole)
                .firstLogin(true)
                .passwordLastChanged(java.time.LocalDateTime.now())
                .active(true)
                .employee(empDevops)
                .build();
        userRepository.save(nouvelEmploye);

        User hejerBenAli = User.builder()
                .username("hejer.benali")
                .email("hejer.benali@tunytech.com")
                .password(encoder.encode("Hejer12345!"))
                .firstName("Hejer")
                .lastName("Ben Ali")
                .company(subSubFrance)
                .role(qualityRole)
                .firstLogin(false)
                .passwordLastChanged(java.time.LocalDateTime.now())
                .active(true)
                .employee(empQuality)
                .build();
        userRepository.save(hejerBenAli);

        User janDeVries = User.builder()
                .username("jan.devries")
                .email("jan.devries@tunytech.com")
                .password(encoder.encode("Jan12345!"))
                .firstName("Jan")
                .lastName("de Vries")
                .company(parentCompany)
                .role(managerRole)
                .firstLogin(false)
                .passwordLastChanged(java.time.LocalDateTime.now())
                .active(true)
                .employee(empSupport)
                .build();
        userRepository.save(janDeVries);

        // Seed the 50 collaborators for fresh database installations
        seed50Collaborators();

        System.out.println("Talentflow database successfully initialized! Standard 'admin' (Admin123456!), 'rh.france' (RhFrance123!), and 'nouveau.employe' (Bienvenue123! - avec changement forcé) users seeded.");
    }

    private void seed50Collaborators() {
        System.out.println("Seeding 50 diverse premium collaborators in the database...");
        
        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) {
            return;
        }
        
        // Find Tunytech France or fallback to first company
        Company targetCompany = companies.stream()
                .filter(c -> c.getName().contains("France"))
                .findFirst()
                .orElse(companies.get(0));
                
        // Find a default manager
        List<Employee> existingEmployees = employeeRepository.findAll();
        Employee manager = existingEmployees.stream()
                .filter(e -> e.getFirstName().equals("Marie") && e.getLastName().equals("Lefebvre"))
                .findFirst()
                .orElse(!existingEmployees.isEmpty() ? existingEmployees.get(0) : null);

        String[][] rawNames = {
            {"French", "Homme", "Pierre", "Dubois", "Coordinateur Sécurité"},
            {"French", "Femme", "Sophie", "Martin", "Développeuse Java"},
            {"French", "Homme", "Thomas", "Bernard", "Lead Dev Angular"},
            {"French", "Femme", "Julie", "Petit", "Scrum Master"},
            {"French", "Homme", "Lucas", "Richard", "Administrateur Système"},
            {"French", "Femme", "Chloe", "Durand", "UX Designer"},
            {"French", "Homme", "Maxime", "Leroi", "Ingénieur Réseau"},
            {"French", "Femme", "Lea", "Moreau", "RH Specialist"},
            {"French", "Homme", "Laurent", "Simon", "Product Owner"},
            {"French", "Femme", "Celine", "Laurent", "QA Specialist"},
            
            {"Belgian", "Homme", "Jan", "Peeters", "Business Analyst"},
            {"Belgian", "Femme", "Emma", "Janssens", "Fullstack Developer"},
            {"Belgian", "Homme", "Daan", "Maes", "Solution Architect"},
            {"Belgian", "Femme", "Elise", "Jacobs", "Security Engineer"},
            {"Belgian", "Homme", "Jonas", "Mertens", "Cloud Engineer"},
            {"Belgian", "Femme", "Laura", "Claes", "Product Manager"},
            {"Belgian", "Homme", "Wouter", "Wouters", "Support Level 2"},
            {"Belgian", "Femme", "Sarah", "Goossens", "Talent Acquisition"},
            {"Belgian", "Homme", "Pieter", "De Smet", "DevOps Engineer"},
            {"Belgian", "Femme", "Charlotte", "Vermeulen", "Financial Controller"},
            
            {"Italian", "Homme", "Giovanni", "Rossi", "Mobile Developer"},
            {"Italian", "Femme", "Francesca", "Bianchi", "Data Scientist"},
            {"Italian", "Homme", "Alessandro", "Ferrari", "Machine Learning Specialist"},
            {"Italian", "Femme", "Giulia", "Russo", "Database Administrator"},
            {"Italian", "Homme", "Matteo", "Colombo", "SysOps Administrator"},
            {"Italian", "Femme", "Chiara", "Bruno", "Content Designer"},
            {"Italian", "Homme", "Leonardo", "Marchetti", "R&D Engineer"},
            {"Italian", "Femme", "Sofia", "Ricci", "Executive Assistant"},
            {"Italian", "Homme", "Lorenzo", "Marini", "IT Support"},
            {"Italian", "Femme", "Valentina", "Moretti", "Project Coordinator"},
            
            {"Spanish", "Homme", "Carlos", "Garcia", "Tech Lead"},
            {"Spanish", "Femme", "Maria", "Rodriguez", "Backend Developer"},
            {"Spanish", "Homme", "Alejandro", "Martinez", "Frontend Developer"},
            {"Spanish", "Femme", "Lucia", "Hernandez", "Technical Writer"},
            {"Spanish", "Homme", "Javier", "Lopez", "Support Specialist"},
            {"Spanish", "Femme", "Elena", "Gonzalez", "Agile Coach"},
            {"Spanish", "Homme", "Manuel", "Perez", "Release Manager"},
            {"Spanish", "Femme", "Carmen", "Sanchez", "Office Manager"},
            {"Spanish", "Homme", "Diego", "Ramirez", "Network Administrator"},
            {"Spanish", "Femme", "Isabel", "Torres", "Legal Advisor"},
            
            {"Portuguese", "Homme", "Joao", "Silva", "Software Engineer"},
            {"Portuguese", "Femme", "Ana", "Santos", "Cybersecurity Analyst"},
            {"Portuguese", "Homme", "Pedro", "Ferreira", "Embedded Systems Dev"},
            {"Portuguese", "Femme", "Mariana", "Pereira", "Data Analyst"},
            {"Portuguese", "Homme", "Tiago", "Oliveira", "Hardware Engineer"},
            {"Portuguese", "Femme", "Beatriz", "Costa", "HR Generalist"},
            {"Portuguese", "Homme", "Rui", "Rodrigues", "Site Reliability Eng"},
            {"Portuguese", "Femme", "Ines", "Gomes", "UI Designer"},
            {"Portuguese", "Homme", "Diogo", "Martins", "Integration Engineer"},
            {"Portuguese", "Femme", "Sofia", "Lopes", "QA Lead"}
        };

        for (int i = 0; i < 50; i++) {
            String culture = rawNames[i][0];
            String gender = rawNames[i][1];
            String firstName = rawNames[i][2];
            String lastName = rawNames[i][3];
            String jobTitle = rawNames[i][4];
            
            // Age distribution from 23 to 64
            int age = 23 + (i * 41) / 49;
            java.time.LocalDate birthDate = java.time.LocalDate.of(2026 - age, 1 + (i % 12), 1 + (i % 28));
            
            // Email format: prenom.nom@tunytech.co
            String firstNameLower = firstName.toLowerCase()
                .replaceAll("[\\s]", "")
                .replace("á", "a")
                .replace("ã", "a")
                .replace("í", "i")
                .replace("é", "e")
                .replace("ô", "o")
                .replace("ç", "c");
            String lastNameLower = lastName.toLowerCase()
                .replaceAll("[\\s]", "")
                .replace("á", "a")
                .replace("ã", "a")
                .replace("í", "i")
                .replace("é", "e")
                .replace("ô", "o")
                .replace("ç", "c");
            String email = firstNameLower + "." + lastNameLower + "@tunytech.co";
            
            // Retirement constraints:
            // 3 people retiring after 1 year (i = 49, 48, 47)
            // 2 people retiring after 3 years (i = 46, 45)
            // others retire at 65
            java.time.LocalDate retirementDate;
            if (i == 49 || i == 48 || i == 47) {
                retirementDate = java.time.LocalDate.of(2027, 5, 25);
            } else if (i == 46 || i == 45) {
                retirementDate = java.time.LocalDate.of(2029, 5, 25);
            } else {
                retirementDate = birthDate.plusYears(65);
            }
            
            Employee emp = Employee.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .company(targetCompany)
                .jobTitle(jobTitle)
                .keySkill("Expertise en " + culture)
                .skillLevel(2 + (i % 4)) // varied skill levels
                .active(true)
                .phoneNumber("+33 6 " + String.format("%02d %02d %02d %02d", 10 + i, 20 + i, 30 + i, 40 + i))
                .birthDate(birthDate)
                .gender(gender)
                .department("R&D / Richesse Humaine")
                .manager(manager)
                .entryDate(java.time.LocalDate.of(2020 - (i % 5), 1 + (i % 12), 1 + (i % 28)))
                .retirementDate(retirementDate)
                .build();
                
            employeeRepository.save(emp);
        }
        System.out.println("Successfully seeded 50 diverse collaborators (tunytech.co)!");
    }
}
