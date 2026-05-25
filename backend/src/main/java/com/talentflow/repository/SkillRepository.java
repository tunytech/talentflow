package com.talentflow.repository;

import com.talentflow.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByCompanyIdOrderByNameAsc(Long companyId);
    boolean existsByCompanyIdAndName(Long companyId, String name);
}
