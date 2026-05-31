package com.talentflow.repository;

import com.talentflow.model.EvaluationSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationSkillRepository extends JpaRepository<EvaluationSkill, Long> {
    List<EvaluationSkill> findByEvaluationId(Long evaluationId);
    List<EvaluationSkill> findBySkillId(Long skillId);
}
