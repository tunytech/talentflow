package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "job_profiles",
    uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "name"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnoreProperties({"parent", "subCompanies", "logo"})
    private Company company;

    @NotBlank(message = "Le nom du profil métier est obligatoire")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "responsibility_level")
    private String responsibilityLevel;

    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "jobProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobProfileSkill> profileSkills = new ArrayList<>();
}
