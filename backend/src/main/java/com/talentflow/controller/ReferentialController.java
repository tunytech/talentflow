package com.talentflow.controller;

import com.talentflow.model.*;
import com.talentflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/referentials")
@CrossOrigin(origins = "*")
public class ReferentialController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private JobProfileRepository jobProfileRepository;

    private Optional<Company> requireCompany(Long companyId) {
        return companyRepository.findById(companyId);
    }

    // --- SKILL CATEGORIES ---

    @GetMapping("/companies/{companyId}/skill-categories")
    public ResponseEntity<List<SkillCategory>> getSkillCategories(@PathVariable Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(skillCategoryRepository.findByCompanyIdOrderBySortOrderAscNameAsc(companyId));
    }

    @PostMapping("/companies/{companyId}/skill-categories")
    public ResponseEntity<?> createSkillCategory(@PathVariable Long companyId, @RequestBody SkillCategory payload) {
        Optional<Company> company = requireCompany(companyId);
        if (company.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (skillCategoryRepository.existsByCompanyIdAndName(companyId, payload.getName())) {
            return ResponseEntity.badRequest().body("Une catégorie avec ce nom existe déjà.");
        }
        payload.setId(null);
        payload.setCompany(company.get());
        return ResponseEntity.ok(skillCategoryRepository.save(payload));
    }

    @PutMapping("/skill-categories/{id}")
    public ResponseEntity<?> updateSkillCategory(@PathVariable Long id, @RequestBody SkillCategory details) {
        return skillCategoryRepository.findById(id).map(category -> {
            if (!category.getName().equals(details.getName())
                    && skillCategoryRepository.existsByCompanyIdAndName(category.getCompany().getId(), details.getName())) {
                return ResponseEntity.badRequest().body("Une catégorie avec ce nom existe déjà.");
            }
            category.setName(details.getName());
            category.setDescription(details.getDescription());
            category.setSortOrder(details.getSortOrder() != null ? details.getSortOrder() : 0);
            category.setActive(details.isActive());
            return ResponseEntity.ok(skillCategoryRepository.save(category));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/skill-categories/{id}")
    public ResponseEntity<Void> deleteSkillCategory(@PathVariable Long id) {
        if (skillCategoryRepository.existsById(id)) {
            skillCategoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- SKILLS ---

    @GetMapping("/companies/{companyId}/skills")
    public ResponseEntity<List<Skill>> getSkills(@PathVariable Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(skillRepository.findByCompanyIdOrderByNameAsc(companyId));
    }

    @PostMapping("/companies/{companyId}/skills")
    public ResponseEntity<?> createSkill(@PathVariable Long companyId, @RequestBody Skill payload) {
        Optional<Company> company = requireCompany(companyId);
        if (company.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (skillRepository.existsByCompanyIdAndName(companyId, payload.getName())) {
            return ResponseEntity.badRequest().body("Une compétence avec ce nom existe déjà.");
        }
        payload.setId(null);
        payload.setCompany(company.get());
        resolveSkillCategory(payload);
        return ResponseEntity.ok(skillRepository.save(payload));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @RequestBody Skill details) {
        return skillRepository.findById(id).map(skill -> {
            if (!skill.getName().equals(details.getName())
                    && skillRepository.existsByCompanyIdAndName(skill.getCompany().getId(), details.getName())) {
                return ResponseEntity.badRequest().body("Une compétence avec ce nom existe déjà.");
            }
            skill.setName(details.getName());
            skill.setDescription(details.getDescription());
            skill.setExpectedLevel(details.getExpectedLevel() != null ? details.getExpectedLevel() : 3);
            skill.setMinRequiredLevel(details.getMinRequiredLevel() != null ? details.getMinRequiredLevel() : 1);
            skill.setCriticality(details.getCriticality() != null ? details.getCriticality() : SkillCriticality.MEDIUM);
            skill.setMandatoryByDefault(details.isMandatoryByDefault());
            skill.setActive(details.isActive());
            resolveSkillCategory(skill, details.getCategory());
            return ResponseEntity.ok(skillRepository.save(skill));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        if (skillRepository.existsById(id)) {
            skillRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void resolveSkillCategory(Skill skill) {
        resolveSkillCategory(skill, skill.getCategory());
    }

    private void resolveSkillCategory(Skill skill, SkillCategory categoryRef) {
        if (categoryRef != null && categoryRef.getId() != null) {
            skillCategoryRepository.findById(categoryRef.getId()).ifPresent(skill::setCategory);
        } else {
            skill.setCategory(null);
        }
    }

    // --- JOB PROFILES ---

    @GetMapping("/companies/{companyId}/job-profiles")
    public ResponseEntity<List<JobProfile>> getJobProfiles(@PathVariable Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(jobProfileRepository.findByCompanyIdWithSkills(companyId));
    }

    @PostMapping("/companies/{companyId}/job-profiles")
    public ResponseEntity<?> createJobProfile(@PathVariable Long companyId, @RequestBody JobProfilePayload payload) {
        Optional<Company> company = requireCompany(companyId);
        if (company.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (jobProfileRepository.existsByCompanyIdAndName(companyId, payload.getName())) {
            return ResponseEntity.badRequest().body("Un profil métier avec ce nom existe déjà.");
        }
        JobProfile profile = JobProfile.builder()
                .company(company.get())
                .name(payload.getName())
                .description(payload.getDescription())
                .responsibilityLevel(payload.getResponsibilityLevel())
                .active(payload.isActive())
                .build();
        applyProfileSkills(profile, payload.getSkillLinks());
        return ResponseEntity.ok(jobProfileRepository.save(profile));
    }

    @PutMapping("/job-profiles/{id}")
    public ResponseEntity<?> updateJobProfile(@PathVariable Long id, @RequestBody JobProfilePayload payload) {
        return jobProfileRepository.findByIdWithSkills(id).map(profile -> {
            if (!profile.getName().equals(payload.getName())
                    && jobProfileRepository.existsByCompanyIdAndName(profile.getCompany().getId(), payload.getName())) {
                return ResponseEntity.badRequest().body("Un profil métier avec ce nom existe déjà.");
            }
            profile.setName(payload.getName());
            profile.setDescription(payload.getDescription());
            profile.setResponsibilityLevel(payload.getResponsibilityLevel());
            profile.setActive(payload.isActive());
            profile.getProfileSkills().clear();
            applyProfileSkills(profile, payload.getSkillLinks());
            return ResponseEntity.ok(jobProfileRepository.save(profile));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/job-profiles/{id}")
    public ResponseEntity<Void> deleteJobProfile(@PathVariable Long id) {
        if (jobProfileRepository.existsById(id)) {
            jobProfileRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private void applyProfileSkills(JobProfile profile, List<SkillLinkPayload> links) {
        if (links == null) {
            return;
        }
        for (SkillLinkPayload link : links) {
            if (link.getSkillId() == null) {
                continue;
            }
            skillRepository.findById(link.getSkillId()).ifPresent(skill -> {
                JobProfileSkill ps = JobProfileSkill.builder()
                        .jobProfile(profile)
                        .skill(skill)
                        .expectedLevel(link.getExpectedLevel() != null ? link.getExpectedLevel() : skill.getExpectedLevel())
                        .mandatory(link.isMandatory())
                        .build();
                profile.getProfileSkills().add(ps);
            });
        }
    }

    public static class JobProfilePayload {
        private String name;
        private String description;
        private String responsibilityLevel;
        private boolean active = true;
        private List<SkillLinkPayload> skillLinks = new ArrayList<>();

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getResponsibilityLevel() { return responsibilityLevel; }
        public void setResponsibilityLevel(String responsibilityLevel) { this.responsibilityLevel = responsibilityLevel; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
        public List<SkillLinkPayload> getSkillLinks() { return skillLinks; }
        public void setSkillLinks(List<SkillLinkPayload> skillLinks) { this.skillLinks = skillLinks; }
    }

    public static class SkillLinkPayload {
        private Long skillId;
        private Integer expectedLevel;
        private boolean mandatory = true;

        public Long getSkillId() { return skillId; }
        public void setSkillId(Long skillId) { this.skillId = skillId; }
        public Integer getExpectedLevel() { return expectedLevel; }
        public void setExpectedLevel(Integer expectedLevel) { this.expectedLevel = expectedLevel; }
        public boolean isMandatory() { return mandatory; }
        public void setMandatory(boolean mandatory) { this.mandatory = mandatory; }
    }
}
