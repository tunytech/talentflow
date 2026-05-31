package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * =========================================================================
 * LA FICHE D'IDENTITÉ UNIQUE DU COLLABORATEUR (EMPLOYEE)
 * =========================================================================
 * C'est le carnet secret de chaque personne travaillant dans notre château !
 * On y écrit son nom, son prénom, comment l'appeler au téléphone professionnel, 
 * son chef N+1 (qui le guide), son anniversaire, son genre configuré et toutes 
 * les belles casquettes (postes) qu'il a portées depuis son entrée dans le château.
 */
@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"company", "manager", "postAssignments"})
@EqualsAndHashCode(exclude = {"company", "manager", "postAssignments"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Le nom de famille est obligatoire")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email(message = "L'adresse e-mail doit être valide")
    @NotBlank(message = "L'e-mail est obligatoire")
    @Column(nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"subCompanies", "parent", "logo"})
    private Company company;

    // --- ANCIENNES PROPRIÉTÉS ---
    @Column(name = "job_title")
    private String jobTitle; // Main active job title (cached or legacy)

    @Column(name = "key_skill")
    private String keySkill;

    @Builder.Default
    @Column(name = "skill_level", nullable = false, columnDefinition = "integer default 1")
    private int skillLevel = 1;

    @Column(name = "habilitation_name")
    private String habilitationName;

    @Column(name = "habilitation_expiry_date")
    private LocalDate habilitationExpiryDate;

    @Builder.Default
    @Column(name = "active", nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    // --- NOUVELLES PROPRIÉTÉS ENRICHIES DÉMATÉRIALISÉES (SANS HARDCODING) ---

    // Le numéro de téléphone professionnel (ex: pour l'appeler au bureau)
    @Column(name = "phone_number")
    private String phoneNumber;

    // La date de naissance (très utile pour fêter son anniversaire et calculer l'âge moyen !)
    @Column(name = "birth_date")
    private LocalDate birthDate;

    // Le sexe ou genre de la personne (ex: "Homme", "Femme", "Non défini")
    // Note : Cette valeur est issue d'une liste dynamique paramétrable en Admin (GENDER_LIST appSetting) !
    @Column(name = "gender")
    private String gender;

    // Le nom du département ou service (ex: "R&D", "Commerce", "RH")
    @Column(name = "department")
    private String department;

    // Le grand chef N+1 (Le manager direct) ! C'est un lien vers un autre collaborateur de la bande.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"manager", "postAssignments", "company"})
    private Employee manager;

    // La date magique du premier jour où il est entré travailler dans notre château
    @Column(name = "entry_date")
    private LocalDate entryDate;

    // La date prévisionnelle où il pourra partir se reposer en retraite dorée !
    @Column(name = "retirement_date")
    private LocalDate retirementDate;

    // Le grand album photo de toutes les casquettes (postes) qu'il a portées !
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnoreProperties({"employee"})
    private List<EmployeePostAssignment> postAssignments = new ArrayList<>();
}
