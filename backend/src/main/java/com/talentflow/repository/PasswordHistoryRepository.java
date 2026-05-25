package com.talentflow.repository;

import com.talentflow.model.PasswordHistory;
import com.talentflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Cette étiquette @Repository indique à Spring Boot que ce fichier sert à piocher, ajouter, 
// modifier ou supprimer des fiches dans notre coffre-fort (la table password_history).
// C'est un traducteur magique entre notre code Java et le langage SQL de la base de données.
@Repository
public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {

    // Cette fonction magique va demander à la base de données : 
    // "Donne-moi tous les anciens mots de passe enregistrés pour cet utilisateur précis, 
    // et trie-les du plus récent au plus ancien (OrderByCreatedAtDesc) !"
    // C'est très utile pour vérifier si le nouveau mot de passe ressemble aux 3 derniers !
    List<PasswordHistory> findByUserOrderByCreatedAtDesc(User user);

    // Cette fonction permet de supprimer toutes les fiches d'historique d'un utilisateur.
    // Très utile s'il quitte l'entreprise et qu'on supprime son compte.
    void deleteByUser(User user);
}
