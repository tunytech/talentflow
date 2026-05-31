package com.talentflow.controller;

import com.talentflow.model.AppSetting;
import com.talentflow.model.PasswordHistory;
import com.talentflow.model.User;
import com.talentflow.repository.AppSettingRepository;
import com.talentflow.repository.PasswordHistoryRepository;
import com.talentflow.repository.UserRepository;
import com.talentflow.repository.SystemNotificationRepository;
import com.talentflow.model.SystemNotification;
import com.talentflow.util.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

// @RestController indique à Spring Boot que cette classe va gérer les requêtes web du navigateur.
// C'est comme le standard téléphonique de notre bureau d'accueil.
// @CrossOrigin("*") permet à notre application frontend (sur le port 4200) de discuter 
// librement avec le backend (sur le port 8080) sans blocage du navigateur.
@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;

    @Autowired
    private SystemNotificationRepository systemNotificationRepository;

    @Autowired
    private PasswordValidator passwordValidator;

    // Notre machine à chiffrer les codes secrets
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ==========================================
    // 1. ENDPOINT DE CONNEXION (LOGIN)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // A. Recherche de l'utilisateur par son nom d'utilisateur ou e-mail
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Oups ! Nous ne trouvons aucun compte avec cet identifiant."));
        }

        User user = userOpt.get();

        // B. Vérification de l'état actif ou bloqué du compte
        if (user.isAccountDisabled() || !user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Ce compte est désactivé ou bloqué définitivement. Veuillez contacter votre administrateur."));
        }

        // C. Chargement des paramètres globaux de sécurité
        int maxAttempts = 3;
        int lockoutMinutes = 5;
        if (user.getCompany() != null) {
            Optional<AppSetting> attemptsSetting = appSettingRepository.findByCompanyIdAndKey(
                    user.getCompany().getId(), "MAX_LOGIN_ATTEMPTS"
            );
            if (attemptsSetting.isPresent()) {
                try {
                    maxAttempts = Integer.parseInt(attemptsSetting.get().getValue());
                } catch (NumberFormatException e) {}
            }

            Optional<AppSetting> durationSetting = appSettingRepository.findByCompanyIdAndKey(
                    user.getCompany().getId(), "LOCKOUT_DURATION_MINUTES"
            );
            if (durationSetting.isPresent()) {
                try {
                    lockoutMinutes = Integer.parseInt(durationSetting.get().getValue());
                } catch (NumberFormatException e) {}
            }
        }

        // D. Vérification du verrouillage temporaire (Locked Until)
        if (user.getLockedUntil() != null) {
            if (LocalDateTime.now().isBefore(user.getLockedUntil())) {
                long secondsRemaining = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toSeconds();
                long minutesRemaining = secondsRemaining / 60;
                secondsRemaining = secondsRemaining % 60;
                
                String timeStr = minutesRemaining > 0 
                        ? minutesRemaining + " minute(s) et " + secondsRemaining + " seconde(s)"
                        : secondsRemaining + " seconde(s)";
                        
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Ce compte est temporairement verrouillé suite à plusieurs échecs successifs. Veuillez réessayer dans " + timeStr + "."));
            }
        }

        // E. Comparaison du mot de passe tapé avec celui stocké en base
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            int currentAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(currentAttempts);

            if (currentAttempts == maxAttempts) {
                // Premier verrouillage de X minutes
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutMinutes));
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Ce compte est temporairement verrouillé pour " + lockoutMinutes + " minutes suite à " + maxAttempts + " échecs successifs."));
            } else if (currentAttempts > maxAttempts) {
                // Déjà verrouillé précédemment, nouvelle erreur après le verrouillage -> Blocage définitif !
                user.setAccountDisabled(true);
                user.setActive(false); // Rendre inactif
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Sécurité : Votre compte a été désactivé définitivement après un échec supplémentaire. Veuillez contacter impérativement un administrateur."));
            } else {
                // Erreur simple, on décompte les essais restants
                userRepository.save(user);
                int remaining = maxAttempts - currentAttempts;
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Le mot de passe saisi est incorrect. Il vous reste " + remaining + " tentative(s) avant le verrouillage du compte."));
            }
        }

        // F. CAS 1 : PREMIÈRE CONNEXION FORCÉE
        // Si l'utilisateur ne s'est jamais connecté (firstLogin est vrai)
        if (user.isFirstLogin()) {
            // Remise à zéro des échecs en cas de mot de passe correct
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "firstLoginRequired", true,
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : "",
                    "message", "C'est votre première connexion ! Par mesure de sécurité, vous devez changer votre mot de passe."
            ));
        }

        // G. CAS 2 : EXPIRATION DU MOT DE PASSE (6 MOIS / 180 JOURS)
        int expiryDays = 180;
        if (user.getCompany() != null) {
            Optional<AppSetting> setting = appSettingRepository.findByCompanyIdAndKey(
                    user.getCompany().getId(), "PASSWORD_EXPIRY_DAYS"
            );
            if (setting.isPresent()) {
                try {
                    expiryDays = Integer.parseInt(setting.get().getValue());
                } catch (NumberFormatException e) {
                    expiryDays = 180;
                }
            }
        }

        // Nous vérifions quand a eu lieu le dernier changement
        LocalDateTime lastChanged = user.getPasswordLastChanged();
        if (lastChanged == null) {
            lastChanged = LocalDateTime.now().minusDays(expiryDays + 1); // Forcer le changement si vide
        }

        // Si la date actuelle dépasse la date du dernier changement + le nombre de jours autorisés
        if (LocalDateTime.now().isAfter(lastChanged.plusDays(expiryDays))) {
            // Remise à zéro des échecs en cas de mot de passe correct
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "passwordExpired", true,
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : "",
                    "message", "Votre mot de passe a expiré après " + expiryDays + " jours. Veuillez le modifier."
            ));
        }

        // H. CONNEXION RÉUSSIE !
        // Remise à zéro des compteurs de sécurité
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Chargement des notifications actives de l'utilisateur
        List<SystemNotification> notificationEntities = systemNotificationRepository.findByUserAndAcknowledgedFalseOrderByCreatedAtDesc(user);
        List<Map<String, Object>> notifications = new ArrayList<>();
        for (SystemNotification n : notificationEntities) {
            notifications.add(Map.of(
                "id", n.getId(),
                "content", n.getContent(),
                "createdAt", n.getCreatedAt().toString()
            ));
        }

        // Nous renvoyons toutes les informations nécessaires à l'affichage (Société, Rôle, Prénom, Nom)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
        response.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        response.put("role", user.getRole() != null ? user.getRole().getName() : "Collaborateur");
        response.put("companyId", user.getCompany() != null ? user.getCompany().getId() : "");
        response.put("companyName", user.getCompany() != null ? user.getCompany().getName() : "");
        response.put("logo", user.getCompany() != null && user.getCompany().getLogo() != null ? user.getCompany().getLogo() : "");
        response.put("notifications", notifications);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. ENDPOINT DE CHANGEMENT DE MOT DE PASSE OBLIGATOIRE
    // ==========================================
    @PostMapping("/force-change")
    public ResponseEntity<?> forceChange(@RequestBody ForceChangeRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur non trouvé."));
        }

        User user = userOpt.get();

        // A. Validation du nouveau mot de passe avec notre inspecteur de sécurité
        Optional<String> validationError = passwordValidator.validate(request.getNewPassword(), user);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", validationError.get()));
        }

        // B. Ajout du mot de passe actuel dans l'historique de sécurité (pour empêcher sa réutilisation future)
        PasswordHistory history = PasswordHistory.builder()
                .user(user)
                .password(user.getPassword()) // Enregistrement de l'ancien crypté
                .createdAt(LocalDateTime.now())
                .build();
        passwordHistoryRepository.save(history);

        // C. Nettoyage de l'historique pour ne garder que les 3 derniers (pour ne pas encombrer le disque dur)
        List<PasswordHistory> histories = passwordHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        if (histories.size() > 3) {
            for (int i = 3; i < histories.size(); i++) {
                passwordHistoryRepository.delete(histories.get(i));
            }
        }

        // D. Mise à jour des données de l'utilisateur
        user.setPassword(encoder.encode(request.getNewPassword())); // Cryptage du nouveau code
        user.setFirstLogin(false); // L'interrupteur repasse à faux puisqu'il a changé le mot de passe !
        user.setPasswordLastChanged(LocalDateTime.now()); // On relance le calendrier des 6 mois à zéro !
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Super ! Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter."
        ));
    }

    // ==========================================
    // 3. ENVOI DE JETON EN CAS D'OUBLI (FORGOT PASSWORD)
    // ==========================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Pour des raisons de discrétion (afin qu'un pirate ne sache pas si un email existe),
            // on renvoie toujours un message de réussite, mais on n'envoie rien en interne.
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Si cet e-mail existe, un code secret de 6 chiffres vous a été envoyé !"
            ));
        }

        User user = userOpt.get();

        // A. Génération d'un code secret aléatoire à 6 chiffres
        Random random = new Random();
        int codeInt = 100000 + random.nextInt(900000); // Entre 100000 et 999999
        String code = String.valueOf(codeInt);

        // B. Recherche du temps de validité configuré en base pour ce code (par défaut 15 minutes)
        int validityMinutes = 15;
        if (user.getCompany() != null) {
            Optional<AppSetting> setting = appSettingRepository.findByCompanyIdAndKey(
                    user.getCompany().getId(), "TOKEN_VALIDITY_MINUTES"
            );
            if (setting.isPresent()) {
                try {
                    validityMinutes = Integer.parseInt(setting.get().getValue());
                } catch (NumberFormatException e) {
                    validityMinutes = 15;
                }
            }
        }

        // C. Enregistrement du code secret et de sa date de péremption chez l'utilisateur
        user.setResetToken(code);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(validityMinutes));
        userRepository.save(user);

        // Dans une vraie application, nous enverrions un e-mail avec un serveur SMTP.
        // Pour vos tests faciles en local, nous imprimons le code dans la console du serveur, 
        // ET nous le renvoyons aussi dans la réponse JSON pour que vous puissiez tester le flux sans ouvrir la console !
        System.out.println("==================================================");
        System.out.println("🔑 CODE DE RÉINITIALISATION GÉNÉRÉ POUR : " + user.getEmail());
        System.out.println("👉 LE CODE SECRET EST : " + code);
        System.out.println("⏳ VALABLE PENDANT : " + validityMinutes + " minutes (jusqu'à " + user.getTokenExpiry() + ")");
        System.out.println("==================================================");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", code, // Renvoi astucieux pour le test en local
                "message", "Un code secret a été envoyé à votre adresse e-mail. Il est valable pendant " + validityMinutes + " minutes."
        ));
    }

    // ==========================================
    // 4. RÉINITIALISATION FINALE DU MOT DE PASSE (RESET PASSWORD)
    // ==========================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Adresse e-mail non reconnue."));
        }

        User user = userOpt.get();

        // A. Vérification de la présence d'un jeton actif
        if (user.getResetToken() == null || !user.getResetToken().equals(request.getToken())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le code de sécurité saisi est incorrect. Veuillez vérifier vos e-mails."));
        }

        // B. Vérification de l'heure d'expiration
        if (user.getTokenExpiry() == null || LocalDateTime.now().isAfter(user.getTokenExpiry())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Désolé, ce code secret a expiré (validité dépassée). Veuillez en demander un nouveau."));
        }

        // C. Validation du nouveau mot de passe avec notre inspecteur
        Optional<String> validationError = passwordValidator.validate(request.getNewPassword(), user);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", validationError.get()));
        }

        // D. Ajout de l'ancien mot de passe dans l'historique
        PasswordHistory history = PasswordHistory.builder()
                .user(user)
                .password(user.getPassword())
                .createdAt(LocalDateTime.now())
                .build();
        passwordHistoryRepository.save(history);

        // E. Nettoyage de l'historique
        List<PasswordHistory> histories = passwordHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        if (histories.size() > 3) {
            for (int i = 3; i < histories.size(); i++) {
                passwordHistoryRepository.delete(histories.get(i));
            }
        }

        // F. Enregistrement du mot de passe tout neuf et effacement du jeton à usage unique
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        user.setFirstLogin(false); // Il a réinitialisé son mot de passe, donc ce n'est plus sa première fois
        user.setPasswordLastChanged(LocalDateTime.now()); // Remise à zéro des 6 mois
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Victoire ! Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter en toute sécurité !"
        ));
    }

    // ==========================================
    // 5. ENDPOINT DE CHANGEMENT DE MOT DE PASSE DE SESSION (DEPUIS LE PROFIL)
    // ==========================================
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur non trouvé."));
        }

        User user = userOpt.get();

        // A. Vérification de l'ancien mot de passe
        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "L'ancien mot de passe saisi est incorrect."));
        }

        // B. Validation du nouveau mot de passe avec notre inspecteur de sécurité
        Optional<String> validationError = passwordValidator.validate(request.getNewPassword(), user);
        if (validationError.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", validationError.get()));
        }

        // C. Ajout du mot de passe actuel dans l'historique
        PasswordHistory history = PasswordHistory.builder()
                .user(user)
                .password(user.getPassword())
                .createdAt(LocalDateTime.now())
                .build();
        passwordHistoryRepository.save(history);

        // D. Nettoyage de l'historique
        List<PasswordHistory> histories = passwordHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        if (histories.size() > 3) {
            for (int i = 3; i < histories.size(); i++) {
                passwordHistoryRepository.delete(histories.get(i));
            }
        }

        // E. Mise à jour
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setPasswordLastChanged(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Super ! Votre mot de passe a été changé avec succès."
        ));
    }

    // ==========================================
    // STRUCTURES DE DONNÉES DE COMMANDE (DTO)
    // ==========================================

    // Modèle pour changer le mot de passe depuis le profil
    public static class ChangePasswordRequest {
        private Long userId;
        private String oldPassword;
        private String newPassword;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // Modèle pour la requête de connexion
    public static class LoginRequest {
        private String username;
        private String password;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // Modèle pour forcer le changement
    public static class ForceChangeRequest {
        private Long userId;
        private String newPassword;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // Modèle pour demander un jeton d'oubli
    public static class ForgotRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Modèle pour réinitialiser le mot de passe oublié
    public static class ResetRequest {
        private String email;
        private String token;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
