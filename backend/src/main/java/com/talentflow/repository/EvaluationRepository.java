package com.talentflow.repository;

import com.talentflow.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByCampaignId(Long campaignId);
    List<Evaluation> findByEmployeeId(Long employeeId);
    List<Evaluation> findByEmployeeManagerId(Long managerId);
}
