package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluation_skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"evaluation"})
@EqualsAndHashCode(exclude = {"evaluation"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EvaluationSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @JsonIgnoreProperties({"evaluationSkills"})
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    @JsonIgnoreProperties({"company"})
    private Skill skill;

    @Column(name = "expected_level", nullable = false)
    private Integer expectedLevel;

    @Column(name = "self_level")
    private Integer selfLevel;

    @Column(name = "acquired_level")
    private Integer acquiredLevel;

    @Column(name = "manager_comment", columnDefinition = "TEXT")
    private String managerComment;

    @Builder.Default
    @Column(nullable = false)
    private boolean mandatory = false;
}
