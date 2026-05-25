package com.talentflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// Cette étiquette dit à Spring Boot que cette classe est un modèle de table.
// C'est-à-dire qu'un tableau nommé "password_history" sera créé automatiquement
// dans notre base de données locale (notre grand classeur) pour ranger les informations.
@Entity
@Table(name = "password_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordHistory {

    // L'identifiant unique (comme un numéro de ticket de caisse) pour chaque ligne de l'historique.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nous lions chaque mot de passe enregistré à un utilisateur particulier.
    // L'option (fetch = FetchType.LAZY) permet de ne charger les informations de l'utilisateur
    // que si nous en avons réellement besoin (ce qui fait gagner de la vitesse à l'ordinateur !).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // C'est le mot de passe crypté (brouillé par une formule mathématique secrète).
    // Nous ne stockons JAMAIS le vrai mot de passe écrit en clair, car si quelqu'un 
    // vole le classeur de données, il ne pourrait pas lire les vrais mots de passe des utilisateurs !
    @Column(nullable = false)
    private String password;

    // Une horloge virtuelle qui enregistre le moment exact (date et heure) 
    // où ce mot de passe a été utilisé. Cela nous permet de savoir quel est le plus ancien 
    // et quel est le plus récent pour faire le tri et ne garder que les 3 derniers !
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
