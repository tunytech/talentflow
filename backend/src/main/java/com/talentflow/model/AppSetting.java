package com.talentflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(
    name = "app_settings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "setting_key"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // La boîte aux lettres de la société à qui appartient ce réglage.
    // Chaque entreprise ou filiale a son propre coffre-fort de paramètres personnalisés.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // L'étiquette ou le nom du paramètre secret (par exemple : "MAX_HOURS_DAILY" pour les heures max).
    // C'est comme le nom inscrit sur un bocal pour savoir ce qu'il contient !
    @NotBlank(message = "La clé de configuration est obligatoire")
    @Column(name = "setting_key", nullable = false)
    private String key; // e.g. "MAX_HOURS_DAILY", "WFH_EXCEPTION_MOTIFS"

    // Ce qui est écrit à l'intérieur du bocal (par exemple : "8" ou "Français").
    // C'est la valeur ou le réglage actif en lui-même.
    @Column(name = "setting_value")
    private String value; // e.g. "8", "Grève des transports,Conditions météo"

    // Une petite phrase d'explication écrite sur le bocal pour expliquer 
    // à quoi sert ce réglage et comment les humains doivent l'utiliser.
    private String description;
}
