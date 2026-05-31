package com.talentflow.bootstrap;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.time.LocalDate;

@Component
@Order(2)
public class SkillsReferentialInitializer implements CommandLineRunner {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private JobProfileRepository jobProfileRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeePostAssignmentRepository employeePostAssignmentRepository;

    @Autowired
    private EvaluationCampaignRepository evaluationCampaignRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private EvaluationSkillRepository evaluationSkillRepository;

    @Override
    public void run(String... args) {
        if (skillCategoryRepository.count() > 0) {
            return;
        }

        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) {
            return;
        }

        Company company = companies.get(0);
        System.out.println("Initializing skills referential for " + company.getName() + "...");

        SkillCategory tech = saveCategory(company, "Technique", "Compétences techniques et IT", 1);
        SkillCategory mgmt = saveCategory(company, "Management", "Leadership et gestion d'équipe", 2);
        SkillCategory quality = saveCategory(company, "Qualité", "Conformité et amélioration continue", 3);
        SkillCategory soft = saveCategory(company, "Soft skills", "Communication et comportement", 4);

        Skill java = saveSkill(company, tech, "Java", "Développement backend Java", 4, SkillCriticality.HIGH);
        Skill angular = saveSkill(company, tech, "Angular", "Développement frontend Angular", 4, SkillCriticality.HIGH);
        Skill devops = saveSkill(company, tech, "DevOps", "CI/CD et infrastructure cloud", 3, SkillCriticality.MEDIUM);
        Skill iso = saveSkill(company, quality, "ISO 27001", "Sécurité de l'information", 4, SkillCriticality.HIGH);
        Skill capa = saveSkill(company, quality, "Qualité CAPA", "Actions correctives et préventives", 3, SkillCriticality.MEDIUM);
        Skill leadership = saveSkill(company, mgmt, "Leadership", "Animation et motivation d'équipe", 3, SkillCriticality.MEDIUM);
        Skill communication = saveSkill(company, soft, "Communication client", "Relation client et présentation", 3, SkillCriticality.MEDIUM);

        saveJobProfile(company, "Ingénieur Projet", "Pilotage de projets techniques", "N+2",
                new Object[][]{{java, 4, true}, {angular, 3, true}, {leadership, 3, true}, {communication, 3, false}});

        saveJobProfile(company, "Responsable RH", "Gestion des ressources humaines", "N+1",
                new Object[][]{{leadership, 4, true}, {communication, 4, true}});

        saveJobProfile(company, "Ingénieur DevOps", "Infrastructure et déploiement", "Expert",
                new Object[][]{{devops, 5, true}, {java, 3, false}, {iso, 3, true}});

        // --- 6. CRÉATION DES AFFECTATIONS DE POSTES PAR DÉFAUT (EMPLOYEE POST ASSIGNMENTS) ---
        // On récupère les profils métiers qu'on vient de sauvegarder !
        List<JobProfile> profiles = jobProfileRepository.findAll();
        JobProfile ingProjet = profiles.stream().filter(p -> p.getName().equals("Ingénieur Projet")).findFirst().orElse(null);
        JobProfile respRh = profiles.stream().filter(p -> p.getName().equals("Responsable RH")).findFirst().orElse(null);
        JobProfile ingDevops = profiles.stream().filter(p -> p.getName().equals("Ingénieur DevOps")).findFirst().orElse(null);

        // On associe les casquettes à nos amis collaborateurs !
        employeeRepository.findAll().forEach(emp -> {
            if (emp.getEmail().equals("admin@tunytech.com") && ingProjet != null) {
                employeePostAssignmentRepository.save(EmployeePostAssignment.builder()
                        .employee(emp)
                        .jobProfile(ingProjet)
                        .startDate(LocalDate.of(2015, 1, 1))
                        .active(true)
                        .build());
            } else if (emp.getEmail().equals("rh.france@tunytech.com") && respRh != null) {
                employeePostAssignmentRepository.save(EmployeePostAssignment.builder()
                        .employee(emp)
                        .jobProfile(respRh)
                        .startDate(LocalDate.of(2018, 6, 1))
                        .active(true)
                        .build());
            } else if (emp.getEmail().equals("nouveau@tunytech.com") && ingDevops != null) {
                // Amir Nouveau a commencé comme Responsable RH de 2021-09-01 à 2022-12-31, puis est devenu DevOps actif !
                employeePostAssignmentRepository.save(EmployeePostAssignment.builder()
                        .employee(emp)
                        .jobProfile(ingDevops)
                        .startDate(LocalDate.of(2023, 1, 1))
                        .active(true)
                        .build());
                if (respRh != null) {
                    employeePostAssignmentRepository.save(EmployeePostAssignment.builder()
                            .employee(emp)
                            .jobProfile(respRh)
                            .startDate(LocalDate.of(2021, 9, 1))
                            .endDate(LocalDate.of(2022, 12, 31))
                            .active(false)
                            .build());
                }
            } else if (emp.getEmail().equals("t.mueller@tunytech.com") && ingDevops != null) {
                employeePostAssignmentRepository.save(EmployeePostAssignment.builder()
                        .employee(emp)
                        .jobProfile(ingDevops)
                        .startDate(LocalDate.of(2020, 3, 1))
                        .active(true)
                        .build());
            }
        });

        // --- 7. INITIALISATION DES CAMPAGNES ET ÉVALUATIONS D'ESSAI (EPIC-03 SEED) ---
        System.out.println("Initializing evaluation campaigns and assessments...");
        EvaluationCampaign campaign = EvaluationCampaign.builder()
                .company(company)
                .name("Campagne Annuelle d'Évaluation 2026")
                .frequency("Annuelle")
                .startDate(LocalDate.of(2026, 5, 1))
                .endDate(LocalDate.of(2026, 6, 30))
                .status("EN_COURS")
                .build();
        evaluationCampaignRepository.save(campaign);

        // a. Évaluation pour Marie France (rh.france@tunytech.com) - Statut: ARBITRAGE
        Employee marie = employeeRepository.findAll().stream().filter(e -> e.getEmail().equals("rh.france@tunytech.com")).findFirst().orElse(null);
        if (marie != null) {
            Evaluation evalMarie = Evaluation.builder()
                    .campaign(campaign)
                    .employee(marie)
                    .status("ARBITRAGE")
                    .selfComment("L'année a été excellente. Je souhaite me perfectionner sur la gestion agile et DevOps pour accompagner les équipes techniques.")
                    .trainingRequest("Formation DevOps agile pour non-techniques")
                    .build();
            evaluationRepository.save(evalMarie);

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalMarie)
                    .skill(leadership)
                    .expectedLevel(3)
                    .selfLevel(3)
                    .mandatory(true)
                    .build());

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalMarie)
                    .skill(communication)
                    .expectedLevel(4)
                    .selfLevel(4)
                    .mandatory(true)
                    .build());
        }

        // b. Évaluation pour Thomas Müller (t.mueller@tunytech.com) - Statut: TERMINEE (Avec Risque Majeur car ISO 27001 requis 3, acquis 2 obligatoire)
        Employee thomas = employeeRepository.findAll().stream().filter(e -> e.getEmail().equals("t.mueller@tunytech.com")).findFirst().orElse(null);
        if (thomas != null) {
            Evaluation evalThomas = Evaluation.builder()
                    .campaign(campaign)
                    .employee(thomas)
                    .status("TERMINEE")
                    .selfComment("J'ai beaucoup travaillé DevOps cette année. Sur la sécurité ISO 27001, je dois encore progresser.")
                    .managerComment("Excellent travail sur DevOps et Java. Attention cependant aux notions de sécurité ISO 27001 indispensables sur les projets DevOps.")
                    .trainingRecommendation("Certification ISO 27001 Auditor")
                    .build();
            evaluationRepository.save(evalThomas);

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalThomas)
                    .skill(devops)
                    .expectedLevel(5)
                    .selfLevel(4)
                    .acquiredLevel(5)
                    .mandatory(true)
                    .build());

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalThomas)
                    .skill(java)
                    .expectedLevel(3)
                    .selfLevel(3)
                    .acquiredLevel(3)
                    .mandatory(false)
                    .build());

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalThomas)
                    .skill(iso)
                    .expectedLevel(3)
                    .selfLevel(2)
                    .acquiredLevel(2)
                    .managerComment("Niveau insuffisant sur les audits de sécurité. Une formation est fortement recommandée.")
                    .mandatory(true) // Risque majeur déclenché !
                    .build());
        }

        // c. Évaluation pour Amir Nouveau (nouveau@tunytech.com) - Statut: CREEE (Auto-évaluation à remplir)
        Employee amir = employeeRepository.findAll().stream().filter(e -> e.getEmail().equals("nouveau@tunytech.com")).findFirst().orElse(null);
        if (amir != null) {
            Evaluation evalAmir = Evaluation.builder()
                    .campaign(campaign)
                    .employee(amir)
                    .status("CREEE")
                    .build();
            evaluationRepository.save(evalAmir);

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalAmir)
                    .skill(devops)
                    .expectedLevel(5)
                    .mandatory(true)
                    .build());

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalAmir)
                    .skill(java)
                    .expectedLevel(3)
                    .mandatory(false)
                    .build());

            evaluationSkillRepository.save(EvaluationSkill.builder()
                    .evaluation(evalAmir)
                    .skill(iso)
                    .expectedLevel(3)
                    .mandatory(true)
                    .build());
        }

        System.out.println("Skills referential and evaluation seeds initialized.");
    }

    private SkillCategory saveCategory(Company company, String name, String desc, int order) {
        return skillCategoryRepository.save(SkillCategory.builder()
                .company(company)
                .name(name)
                .description(desc)
                .sortOrder(order)
                .active(true)
                .build());
    }

    private Skill saveSkill(Company company, SkillCategory cat, String name, String desc, int level, SkillCriticality crit) {
        return skillRepository.save(Skill.builder()
                .company(company)
                .category(cat)
                .name(name)
                .description(desc)
                .expectedLevel(level)
                .minRequiredLevel(Math.max(1, level - 1))
                .criticality(crit)
                .mandatoryByDefault(true)
                .active(true)
                .build());
    }

    private void saveJobProfile(Company company, String name, String desc, String level, Object[][] links) {
        JobProfile profile = JobProfile.builder()
                .company(company)
                .name(name)
                .description(desc)
                .responsibilityLevel(level)
                .active(true)
                .build();
        for (Object[] link : links) {
            Skill skill = (Skill) link[0];
            int expectedLevel = (Integer) link[1];
            boolean mandatory = (Boolean) link[2];
            profile.getProfileSkills().add(JobProfileSkill.builder()
                    .jobProfile(profile)
                    .skill(skill)
                    .expectedLevel(expectedLevel)
                    .mandatory(mandatory)
                    .build());
        }
        jobProfileRepository.save(profile);
    }
}
