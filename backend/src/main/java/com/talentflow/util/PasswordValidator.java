package com.talentflow.util;

import com.talentflow.model.AppSetting;
import com.talentflow.model.PasswordHistory;
import com.talentflow.model.User;
import com.talentflow.repository.AppSettingRepository;
import com.talentflow.repository.PasswordHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

// Cette étiquette @Component dit à Spring Boot : "Prends cette classe, fabrique-la une fois
// et distribue-la à tous ceux qui en ont besoin dans l'application."
// C'est notre inspecteur de sécurité en chef pour les mots de passe.
@Component
public class PasswordValidator {

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;

    // Notre machine à chiffrer et décoder (en comparant) les codes secrets.
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Cette méthode magique vérifie si le nouveau mot de passe respecte TOUTES les règles d'or de sécurité.
     * Si quelque chose ne va pas, elle renvoie un message clair expliquant le problème.
     * Si tout est parfait, elle renvoie une boîte vide (Optional.empty()).
     */
    public Optional<String> validate(String password, User user) {
        
        // --- REGLE 1 : Pas de mot de passe tout vide ---
        if (password == null || password.trim().isEmpty()) {
            return Optional.of("Le mot de passe ne peut pas être vide ! C'est comme essayer de fermer un coffre sans clé.");
        }

        // --- REGLE 2 : Récupérer la taille minimale depuis les paramètres d'administration ---
        // Nous allons chercher dans la boîte aux lettres des configurations le paramètre "MIN_PASSWORD_LENGTH".
        // Si la filiale ou la société de l'utilisateur n'a rien paramétré, on utilise 12 par défaut (la norme ultra-sécurisée).
        int minLength = 12;
        if (user.getCompany() != null) {
            Optional<AppSetting> setting = appSettingRepository.findByCompanyIdAndKey(
                    user.getCompany().getId(), "MIN_PASSWORD_LENGTH"
            );
            if (setting.isPresent()) {
                try {
                    minLength = Integer.parseInt(setting.get().getValue());
                } catch (NumberFormatException e) {
                    // Si l'administrateur s'est trompé en écrivant autre chose qu'un chiffre, on garde 12.
                    minLength = 12;
                }
            }
        }

        // Est-ce que le mot de passe est trop court ?
        if (password.length() < minLength) {
            return Optional.of("Le mot de passe est trop court ! Il doit faire au moins " + minLength + 
                    " caractères pour être solide comme un château fort.");
        }

        // --- REGLE 3 : Complexité obligatoire (Majuscule, Chiffre, Caractère spécial) ---
        
        // A. Vérification de la lettre majuscule (A à Z)
        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        if (!hasUppercase) {
            return Optional.of("Sécurité insuffisante : Il manque au moins une lettre MAJUSCULE (ex: A, B, C...) pour faire peur aux pirates !");
        }

        // B. Vérification du chiffre (0 à 9)
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasDigit) {
            return Optional.of("Sécurité insuffisante : Il manque au moins un chiffre (0, 1, 2...) pour rendre le code secret plus difficile à deviner.");
        }

        // C. Vérification du caractère spécial (tout ce qui n'est ni lettre ni chiffre : @, #, $, !, %, etc.)
        boolean hasSpecial = password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch));
        if (!hasSpecial) {
            return Optional.of("Sécurité insuffisante : Il manque un caractère spécial (comme @, #, $, !, %, *...) pour brouiller les pistes.");
        }

        // --- REGLE 4 : Pas d'informations personnelles (prénom ou nom) ---
        // Les pirates essaient toujours le nom ou le prénom en premier !
        
        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            // On convertit tout en minuscules pour ne pas se faire avoir par "Amir" ou "amir" ou "AMIR".
            String lowerFirstName = user.getFirstName().toLowerCase();
            if (password.toLowerCase().contains(lowerFirstName)) {
                return Optional.of("Alerte Sécurité : Le mot de passe ne doit pas contenir votre prénom (" + 
                        user.getFirstName() + "). C'est le premier piège à éviter !");
            }
        }

        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
            String lowerLastName = user.getLastName().toLowerCase();
            if (password.toLowerCase().contains(lowerLastName)) {
                return Optional.of("Alerte Sécurité : Le mot de passe ne doit pas contenir votre nom de famille (" + 
                        user.getLastName() + "). C'est trop facile à deviner !");
            }
        }

        // --- REGLE 5 : Interdiction de réutiliser les 3 derniers mots de passe ---
        // Nous allons piocher dans l'historique de l'utilisateur.
        List<PasswordHistory> historyList = passwordHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        
        // Nous ne regardons que les 3 lignes les plus récentes (comme les 3 dernières entrées du journal intime)
        int checkLimit = Math.min(historyList.size(), 3);
        for (int i = 0; i < checkLimit; i++) {
            PasswordHistory oldPassword = historyList.get(i);
            
            // La machine compare le nouveau mot de passe tapé avec l'ancien crypté.
            if (encoder.matches(password, oldPassword.getPassword())) {
                return Optional.of("Interdit ! Ce mot de passe ressemble trop à l'un de vos 3 derniers mots de passe utilisés. " +
                        "Veuillez faire preuve d'imagination pour un nouveau code unique !");
            }
        }

        // Si l'inspecteur n'a rien trouvé d'anormal, tout est parfait !
        return Optional.empty();
    }
}
