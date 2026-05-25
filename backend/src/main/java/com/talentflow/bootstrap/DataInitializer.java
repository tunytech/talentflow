package com.talentflow.bootstrap;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
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

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if the database is empty
        if (companyRepository.count() > 0) {
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
                AppSetting.builder().key("TOKEN_VALIDITY_MINUTES").value("15").description("Durée de validité en minutes du code secret de réinitialisation (15 minutes max)").build()
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
                AppSetting.builder().key("TOKEN_VALIDITY_MINUTES").value("15").description("Durée de validité en minutes du code secret").build()
        );

        for (AppSetting setting : europeSettings) {
            setting.setCompany(subsidiaryEurope);
            appSettingRepository.save(setting);
        }

        // Nous préparons la machine à crypter les mots de passe (comme une machine à écrire des codes secrets indéchiffrables)
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        // 5. Création de l'utilisateur Administrateur par défaut
        // Son mot de passe secret est crypté avec BCrypt pour être totalement protégé.
        User defaultAdmin = User.builder()
                .username("admin")
                .email("admin@tunytech.com")
                .password(encoder.encode("Admin123456!")) // Mot de passe fort crypté
                .firstName("Jean")
                .lastName("Administrateur")
                .company(parentCompany)
                .role(adminRole)
                .firstLogin(false) // Il s'est déjà connecté au moins une fois, donc pas d'obligation de changement
                .passwordLastChanged(java.time.LocalDateTime.now()) // Date de départ aujourd'hui
                .active(true)
                .build();
        userRepository.save(defaultAdmin);

        // Création de l'utilisateur RH France par défaut
        User rhFrance = User.builder()
                .username("rh.france")
                .email("rh.france@tunytech.com")
                .password(encoder.encode("RhFrance123!")) // Mot de passe fort crypté
                .firstName("Marie")
                .lastName("Lefebvre")
                .company(subSubFrance)
                .role(rhRole)
                .firstLogin(false) // Déjà connecté
                .passwordLastChanged(java.time.LocalDateTime.now()) // Date de départ aujourd'hui
                .active(true)
                .build();
        userRepository.save(rhFrance);

        // Création d'un NOUVEL EMPLOYE pour tester la force du premier changement de mot de passe !
        // Son mot de passe de base est "Bienvenue123!" et il a "firstLogin" réglé sur Vrai.
        User nouvelEmploye = User.builder()
                .username("nouveau.employe")
                .email("nouveau@tunytech.com")
                .password(encoder.encode("Bienvenue123!")) // Mot de passe provisoire
                .firstName("Amir")
                .lastName("Nouveau")
                .company(subSubFrance)
                .role(managerRole) // Rôle Manager par défaut
                .firstLogin(true) // OBLIGATION absolue de changer ce mot de passe à la première connexion !
                .passwordLastChanged(java.time.LocalDateTime.now()) // Date de départ aujourd'hui
                .active(true)
                .build();
        userRepository.save(nouvelEmploye);

        System.out.println("Talentflow database successfully initialized! Standard 'admin' (Admin123456!), 'rh.france' (RhFrance123!), and 'nouveau.employe' (Bienvenue123! - avec changement forcé) users seeded.");
    }
}
