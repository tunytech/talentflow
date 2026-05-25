package com.talentflow.bootstrap;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

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

        System.out.println("Skills referential initialized.");
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
