package com.talentflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @JsonIgnore
    private String password;

    @Email(message = "L'adresse e-mail doit être valide")
    @NotBlank(message = "L'e-mail est obligatoire")
    @Column(nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Builder.Default
    private boolean active = true;

    // ==========================================
    // SÉCURITÉ : LES NOUVELLES INFORMATIONS DU COMPTE
    // ==========================================

    // Le prénom de l'utilisateur (exemple : "Jean").
    // Nous le gardons en mémoire pour être sûrs que l'utilisateur ne mette pas 
    // son propre prénom dans son mot de passe secret, ce qui serait trop facile à deviner !
    @Column(name = "first_name")
    private String firstName;

    // Le nom de famille de l'utilisateur (exemple : "DUPONT").
    // Tout comme le prénom, nous l'enregistrons pour interdire son utilisation 
    // dans le mot de passe pour des raisons évidentes de sécurité.
    @Column(name = "last_name")
    private String lastName;

    // Un interrupteur magique "Vrai" ou "Faux".
    // Quand on crée un nouveau compte, cet interrupteur est réglé sur "Vrai" (true).
    // Lors de sa première connexion, l'application verra ce "Vrai" et obligera 
    // immédiatement l'utilisateur à créer son propre mot de passe personnalisé.
    // Une fois cela fait, l'interrupteur passera sur "Faux" (false) pour ne plus l'embêter.
    @Builder.Default
    @Column(name = "first_login", nullable = false, columnDefinition = "boolean default true")
    private boolean firstLogin = true;

    // Une horloge virtuelle qui enregistre le jour et l'heure exacts 
    // où le mot de passe a été modifié pour la dernière fois.
    // Cela nous permet de compter les jours (comme sur un calendrier) et de forcer 
    // l'utilisateur à changer son mot de passe tous les 6 mois (180 jours) pour rester en sécurité !
    @Column(name = "password_last_changed")
    private java.time.LocalDateTime passwordLastChanged;

    // Un code secret à usage unique (comme un ticket de manège à usage unique).
    // Si l'utilisateur clique sur "Mot de passe oublié", l'ordinateur fabrique ce code magique.
    // L'utilisateur devra nous redonner ce même code pour prouver que c'est bien lui 
    // et pouvoir choisir un nouveau mot de passe.
    @Column(name = "reset_token")
    private String resetToken;

    // La date et l'heure exactes auxquelles le code secret (resetToken) va s'autodétruire.
    // Par exemple, si le code est valide pendant 15 minutes, nous calculons "Heure actuelle + 15 minutes".
    // Si l'utilisateur essaie d'entrer le code après cette heure, le système lui dira "Trop tard !"
    @Column(name = "token_expiry")
    private java.time.LocalDateTime tokenExpiry;

    // Le nombre de tentatives consécutives de connexion infructueuses (mot de passe incorrect).
    @Builder.Default
    @Column(name = "failed_login_attempts", nullable = false, columnDefinition = "integer default 0")
    private int failedLoginAttempts = 0;

    // L'horloge qui indique jusqu'à quand le compte est verrouillé après 3 échecs (5 minutes).
    @Column(name = "locked_until")
    private java.time.LocalDateTime lockedUntil;

    // Un indicateur de blocage définitif. Si l'utilisateur dépasse la limite à nouveau après son verrouillage de 5 minutes,
    // son compte est bloqué définitivement (accountDisabled = true) et nécessite l'intervention d'un administrateur.
    @Builder.Default
    @Column(name = "account_disabled", nullable = false, columnDefinition = "boolean default false")
    private boolean accountDisabled = false;

    // --- ASSOCIATION DE COLLABORATEUR (OPTIONNELLE) ---
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;
}
