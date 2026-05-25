package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(
    name = "skills",
    uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "name"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnoreProperties({"parent", "subCompanies", "logo"})
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"company"})
    private SkillCategory category;

    @NotBlank(message = "Le nom de la compétence est obligatoire")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "expected_level")
    private Integer expectedLevel = 3;

    @Builder.Default
    @Column(name = "min_required_level")
    private Integer minRequiredLevel = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SkillCriticality criticality = SkillCriticality.MEDIUM;

    @Builder.Default
    @Column(name = "mandatory_by_default")
    private boolean mandatoryByDefault = true;

    @Builder.Default
    private boolean active = true;
}
