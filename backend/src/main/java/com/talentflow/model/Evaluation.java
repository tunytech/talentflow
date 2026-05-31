package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"campaign", "employee", "evaluationSkills"})
@EqualsAndHashCode(exclude = {"campaign", "employee", "evaluationSkills"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campaign_id", nullable = false)
    private EvaluationCampaign campaign;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"manager", "postAssignments", "company"})
    private Employee employee;

    @Column(nullable = false)
    private String status; // "CREEE", "AUTO_EVALUATION", "ARBITRAGE", "TERMINEE"

    @Column(name = "self_comment", columnDefinition = "TEXT")
    private String selfComment;

    @Column(name = "manager_comment", columnDefinition = "TEXT")
    private String managerComment;

    @Column(name = "training_request", columnDefinition = "TEXT")
    private String trainingRequest;

    @Column(name = "training_recommendation", columnDefinition = "TEXT")
    private String trainingRecommendation;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JsonIgnoreProperties({"evaluation"})
    private List<EvaluationSkill> evaluationSkills = new ArrayList<>();
}
