package com.talentflow.repository;

import com.talentflow.model.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillCategoryRepository extends JpaRepository<SkillCategory, Long> {
    List<SkillCategory> findByCompanyIdOrderBySortOrderAscNameAsc(Long companyId);
    boolean existsByCompanyIdAndName(Long companyId, String name);
}
