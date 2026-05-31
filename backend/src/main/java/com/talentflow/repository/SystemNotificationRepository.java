package com.talentflow.repository;

import com.talentflow.model.SystemNotification;
import com.talentflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    List<SystemNotification> findByUserAndAcknowledgedFalseOrderByCreatedAtDesc(User user);
}
