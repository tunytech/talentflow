package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(
    name = "skill_categories",
    uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "name"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnoreProperties({"parent", "subCompanies", "logo"})
    private Company company;

    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    @Column(nullable = false)
    private String name;

    private String description;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    private boolean active = true;
}
