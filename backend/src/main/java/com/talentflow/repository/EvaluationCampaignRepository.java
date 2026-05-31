package com.talentflow.repository;

import com.talentflow.model.EvaluationCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationCampaignRepository extends JpaRepository<EvaluationCampaign, Long> {
    List<EvaluationCampaign> findByCompanyId(Long companyId);
}
