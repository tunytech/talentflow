package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "job_profile_skills",
    uniqueConstraints = @UniqueConstraint(columnNames = {"job_profile_id", "skill_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobProfileSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_profile_id", nullable = false)
    @JsonIgnore
    private JobProfile jobProfile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    @JsonIgnoreProperties({"company", "category"})
    private Skill skill;

    @Builder.Default
    @Column(name = "expected_level")
    private Integer expectedLevel = 3;

    @Builder.Default
    private boolean mandatory = true;
}
