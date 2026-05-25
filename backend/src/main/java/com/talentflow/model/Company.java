package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"parent", "subCompanies"})
@EqualsAndHashCode(exclude = {"parent", "subCompanies"})
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la société est obligatoire")
    @Column(nullable = false)
    private String name;

    @Column(name = "vat_number")
    private String vatNumber; // Numéro de TVA ou SIRET

    private String address;
    private String country;
    private String city;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "contact_info")
    private String contactInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"subCompanies", "parent"})
    private Company parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnoreProperties({"parent"})
    private List<Company> subCompanies = new ArrayList<>();

    // ==========================================
    // LOGO DE LA SOCIÉTÉ (UPLOAD RÉEL)
    // ==========================================

    // Le logo de la société.
    // Il est stocké sous forme de texte très long (Base64), c'est-à-dire une traduction en lettres 
    // et en chiffres du dessin ou de la photo du logo.
    // Nous utilisons le type "TEXT" dans la base de données car un logo converti en texte peut faire 
    // des milliers de caractères de long. C'est parfait pour stocker n'importe quel format (PNG, SVG, etc.).
    @Column(columnDefinition = "TEXT")
    private String logo;
}
