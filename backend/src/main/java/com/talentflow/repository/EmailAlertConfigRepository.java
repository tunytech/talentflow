package com.talentflow.repository;

import com.talentflow.model.EmailAlertConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailAlertConfigRepository extends JpaRepository<EmailAlertConfig, Long> {
    Optional<EmailAlertConfig> findByKey(String key);
}
