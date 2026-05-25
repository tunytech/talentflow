package com.talentflow.repository;

import com.talentflow.model.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppSettingRepository extends JpaRepository<AppSetting, Long> {
    List<AppSetting> findByCompanyId(Long companyId);
    Optional<AppSetting> findByCompanyIdAndKey(Long companyId, String key);
}
