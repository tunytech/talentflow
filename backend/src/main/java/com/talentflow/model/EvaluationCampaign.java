package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "evaluation_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"company"})
@EqualsAndHashCode(exclude = {"company"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EvaluationCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la campagne est obligatoire")
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String frequency; // "Annuelle", "Semestrielle", "Trimestrielle"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status; // "PLANIFIEE", "EN_COURS", "CLOTUREE", "EN_RETARD"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonIgnoreProperties({"parent", "subCompanies", "logo"})
    private Company company;
}
