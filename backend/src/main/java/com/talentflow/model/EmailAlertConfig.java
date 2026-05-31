package com.talentflow.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_alert_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailAlertConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private boolean active = true;

    @Column(name = "recipient_role")
    private String recipientRole;
}
