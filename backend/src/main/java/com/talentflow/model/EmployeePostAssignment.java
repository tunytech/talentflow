package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * =========================================================================
 * LA CASQUETTE DE TRAVAIL DU COLLABORATEUR (EMPLOYEE POST ASSIGNMENT)
 * =========================================================================
 * C'est comme une boîte magique qui garde l'histoire de toutes les casquettes 
 * (les métiers) portées par notre collègue ! 
 * Un jour il peut être "Responsable RH", un autre jour "Super Commercial", 
 * et parfois il peut même porter deux casquettes en même temps !
 */
@Entity
@Table(name = "employee_post_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"employee"})
@EqualsAndHashCode(exclude = {"employee"})
public class EmployeePostAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Qui porte cette jolie casquette ? Notre cher collaborateur !
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"postAssignments", "manager", "company"})
    private Employee employee;

    // Quel est le super travail associé à cette casquette ? (Le poste paramétré en Admin)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_profile_id", nullable = false)
    @JsonIgnoreProperties({"company", "profileSkills"})
    private JobProfile jobProfile;

    // Le jour où il a commencé à mettre cette casquette sur sa tête !
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // Le jour où il a retiré cette casquette (peut être vide s'il la porte encore !)
    @Column(name = "end_date")
    private LocalDate endDate;

    // Est-ce qu'il porte encore cette casquette aujourd'hui sur sa tête ?
    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;
}
