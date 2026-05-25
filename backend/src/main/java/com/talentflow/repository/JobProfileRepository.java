package com.talentflow.repository;

import com.talentflow.model.JobProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobProfileRepository extends JpaRepository<JobProfile, Long> {
    List<JobProfile> findByCompanyIdOrderByNameAsc(Long companyId);

    @Query("SELECT DISTINCT jp FROM JobProfile jp LEFT JOIN FETCH jp.profileSkills ps LEFT JOIN FETCH ps.skill WHERE jp.company.id = :companyId ORDER BY jp.name")
    List<JobProfile> findByCompanyIdWithSkills(@Param("companyId") Long companyId);

    @Query("SELECT jp FROM JobProfile jp LEFT JOIN FETCH jp.profileSkills ps LEFT JOIN FETCH ps.skill WHERE jp.id = :id")
    Optional<JobProfile> findByIdWithSkills(@Param("id") Long id);

    boolean existsByCompanyIdAndName(Long companyId, String name);
}
