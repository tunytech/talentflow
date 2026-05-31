# Référentiel des User Stories - Talentflow

Ce document contient la version officielle de référence du **Backlog Agile des User Stories** du projet **Talentflow**. Ce backlog intègre à la fois les fonctionnalités déjà implémentées et validées, ainsi que l'ensemble des exigences fonctionnelles détaillées fournies par la direction de projet.

---

## 🏆 Liste des Épics

1. **EPIC-01 : Gestion du Personnel & Cloisonnement Multi-Sociétés** (Rattachement RH, Importation, Cycle de vie)
2. **EPIC-02 : Référentiel de Compétences & Profils Métiers** (Catalogue global, Profils et fonctions)
3. **EPIC-03 : Campagnes d'Évaluation & Arbitrage Managériel** (Planification, Auto-évaluation, Arbitrage N+1, Gap Analysis)
4. **EPIC-04 : Module de Recrutement (ATS - Applicant Tracking System)** (Offres, Scoring, Pipelines Kanban)
5. **EPIC-05 : Module d'Onboarding & Offboarding** (Parcours d'intégration, Restitution de matériel)

---

## 🏃 Épic 01 : Gestion du Personnel & Cloisonnement Multi-Sociétés

### `US 01.1` : Modèle de droits multi-sociétés et affectation RH
*   **En tant que** : Responsable RH (Société Mère ou Filiale)
*   **Je veux** : Pouvoir être affecté à une ou plusieurs filiales (ou à la société mère pour voir tout le groupe) afin de gérer le personnel de mon périmètre.
*   **Afin de** : Garantir le cloisonnement des données tout en permettant une gestion partagée du personnel.
*   **Critères d'acceptation :**
    *   **Périmètre Société Mère** : Un RH rattaché à la "Société Mère" a une visibilité et des droits de création/édition sur toutes les filiales et sous-filiales du groupe.
    *   **Périmètre Multi-Filiales** : Un RH peut être explicitement associé à une liste de filiales (ex: Filiale A et Filiale B). Il ne verra et ne pourra agir que sur ces entités.
    *   **Périmètre Sous-Filiale** : Un RH d'une sous-filiale ne voit que sa propre sous-filiale.
*   **Statut** : 📝 À planifier

### `US 01.2` (Mise à jour) : Formulaire de création et Contrôles de Saisie Stricts
*   **En tant que** : Responsable RH
*   **Je veux** : Saisir les informations du collaborateur avec des contrôles de validation en temps réel sur les champs.
*   **Afin d'** : Éviter les erreurs de saisie et garantir la propreté des données dans le système.
*   **Critères d'acceptation (Contrôles des Inputs) :**
    *   **Nom / Prénom** : Caractères alphabétiques uniquement (lettres, espaces, tirets). Les chiffres sont interdits.
    *   **Email professionnel** : Doit respecter le format standard regex (`compte@domaine.extension`). Unicité obligatoire globale.
    *   **Téléphone (GSM)** : Sélection obligatoire du préfixe pays via une liste déroulante (ex: `+33` France, `+32` Belgique, `+352` Luxembourg, `+216` Tunisie, etc.) suivi du numéro au format numérique uniquement.
    *   **Sexe** : Liste déroulante fermée dynamique (chargée depuis les réglages `GENDER_LIST` en base de données : `Homme`, `Femme`, `Autre` / `Non défini`).
    *   **Intitulé de poste (Fonction)** : Liste déroulante dynamique alimentée par le Menu Administration.
    *   **Champs Optionnels** : Numéro de téléphone, Manager direct (sélectionnable parmi les employés de la même filiale ou de la société mère), Date de fin de période d'essai, Date prévisionnelle de départ.
    *   **Cohérence des Dates** : La date de début de contrat doit être une date valide. La date prévisionnelle de départ à la retraite/pension doit être strictement supérieure à la date de début de contrat. Si ce n'est pas le cas, le formulaire bloque avec un message d'erreur.
*   **Statut** : 📝 À planifier (Évolution du formulaire de base existant)

### `US 01.3` : Importation en masse de collaborateurs (Excel / CSV)
*   **En tant que** : Responsable RH
*   **Je veux** : Importer un fichier Excel ou CSV contenant une liste de collaborateurs.
*   **Afin de** : Gagner du temps lors du déploiement initial ou d'intégrations massives.
*   **Critères d'acceptation :**
    *   **Format** : L'application met à disposition un modèle de fichier (Template) à télécharger.
    *   **Validation des données** : Avant l'import final, le système vérifie la conformité (ex: format des dates, unicité des emails, existence de la filiale spécifiée).
    *   **Rapport d'erreur** : Si des lignes sont incorrectes, l'import est bloqué pour ces lignes et un rapport indique précisément les erreurs (ex: *"Ligne 4 : Filiale inconnue"*). Les lignes valides sont importées.
*   **Statut** : 📝 À planifier

### `US 01.4` (Futur Sprint) : Création automatique via le Recrutement
*   **En tant que** : Système TalentFlow (Workflow Automatique)
*   **Je veux** : Générer automatiquement une fiche collaborateur dès qu'un candidat passe au statut "Contrat de travail signé" dans le module Recrutement.
*   **Afin de** : Éviter la double saisie et lancer le processus d'onboarding immédiatement.
*   **Critères d'acceptation :**
    *   **Déclencheur** : Statut Recrutement = "Contrat de travail signé".
    *   **Création de la fiche** : La fiche est créée avec le statut "En attente d'onboarding" en reprenant les données disponibles (Nom, Prénom, Email, Sexe, Poste, Filiale).
    *   **Notification** : Le Responsable RH de la filiale concernée reçoit une alerte/notification sur son tableau de bord : *"Une nouvelle fiche a été créée pour [Nom]. Veuillez compléter les informations manquantes (Manager, Période d'essai, etc.)"*.
*   **Statut** : 📝 À planifier

### `US 01.5` : Gestion Multi-postes et Historique des Fonctions
*   **En tant que** : Responsable RH / Système TalentFlow
*   **Je veux** : Associer une ou plusieurs fonctions à un collaborateur, datées dans le temps (Date de début, Date de fin).
*   **Afin de** : Conserver l'historique de sa carrière et pouvoir évaluer ses compétences en fonction du poste exact qu'il occupe à une date précise.
*   **Critères d'acceptation :**
    *   **Multi-fonctions simultanées** : Un collaborateur peut occuper 2 postes en même temps (ex: Responsable Achat ET Responsable Marketing). Chaque affectation a sa propre date de début.
    *   **Évolution de poste (Historique)** : Si un collaborateur change de poste (ex: passe de Responsable Marketing à Responsable Commercial au 1er octobre), le RH clôture l'ancien poste (ajout d'une date de fin au 30 septembre) et crée la nouvelle ligne de poste au 1er octobre.
    *   **Impact Compétences** : Le profil du collaborateur hérite automatiquement des "compétences requises" liées à ses fonctions actives. Les anciennes fonctions archivées ne demandent plus d'évaluation active.
*   **Statut** : 🟢 Implémenté / Validé (Socle technique et timeline graphique déjà opérationnels)

### `US 01.6` : Recherche multicritère et filtres à facettes combinables
*   **En tant que** : Responsable RH (Société Mère ou Filiale)
*   **Je veux** : Filtrer et rechercher des collaborateurs depuis l'écran principal du Registre.
*   **Afin de** : Retrouver rapidement des profils spécifiques selon différents critères combinés.
*   **Critères d'acceptation :**
    *   **Filtre par Filiale / Société** : Affichage dynamique restreint au périmètre du RH connecté (US 01.1).
    *   **Filtre par Poste / Fonction** : Liste déroulante des postes métiers paramétrés.
    *   **Filtre par Manager N+1** : Sélection d'un manager pour afficher uniquement son équipe directe.
    *   **Filtre par Type de contrat** : Filtrage par CDI, CDD, Alternance, Stage, etc.
    *   **Recherche textuelle** : Champ de saisie globale filtrant en temps réel sur les champs Nom, Prénom, E-mail.
*   **Statut** : 📝 À planifier

### `US 01.7` : Cycle de vie dynamique et gestion des statuts RH
*   **En tant que** : Responsable RH
*   **Je veux** : Suivre et mettre à jour le statut du cycle de vie professionnel de chaque collaborateur.
*   **Afin de** : Gérer correctement les transitions administratives et conserver les historiques.
*   **Critères d'acceptation :**
    *   **Les Statuts gérés** :
        1. *En attente d'onboarding* : Le contrat est signé (US 01.4) mais le collaborateur n'est pas encore en poste.
        2. *Actif* : Le collaborateur est actuellement en poste.
        3. *En préavis* : Le départ est planifié (démission, retraite) mais la date de fin n'est pas encore passée.
        4. *Sorti / Historisé* : Le collaborateur a quitté l'entreprise. Ses fiches historiques restent consultables pour audit (Soft Delete) mais il n'apparaît plus dans les effectifs actifs.
*   **Statut** : 📝 À planifier

### `US 01.8` : Actions rapides et actions contextuelles en bout de ligne
*   **En tant que** : Responsable RH
*   **Je veux** : Disposer d'un menu contextuel d'actions rapides sur chaque ligne du registre des collaborateurs.
*   **Afin de** : Déclencher des actions administratives courantes en un seul clic.
*   **Critères d'acceptation :**
    *   **Actions contextuelles disponibles** :
        *   ✏️ *Modifier la fiche* : Redirige vers le formulaire d'édition de la fiche RH (US 01.2).
        *   💼 *Gérer la carrière* : Accès direct à la gestion chronologique et multi-postes (US 01.5).
        *   🔑 *Créer/Lier un compte d'accès* : Associe en un clic un compte utilisateur système (`User`) à ce collaborateur.
        *   📅 *Déclarer un départ* : Permet de saisir la date prévisionnelle de départ ou de retraite pour planifier la transition du statut vers *En préavis* puis *Sorti*.
        *   ❌ *Désactiver / Archiver* : Suspension RH temporaire ou archivage définitif.
*   **Statut** : 📝 À planifier

---

## 🏃 Épic 02 : Référentiel de Compétences & Profils Métiers

### `US 02.1` : Gestion du catalogue global des compétences
*   **En tant qu'** : Administrateur RH
*   **Je veux** : Alimenter et mettre à jour à tout moment une base de données centrale des compétences de l'entreprise, classées par Familles.
*   **Afin de** : Disposer d'un dictionnaire unique pour tous les profils de poste de l'organisation.
*   **Critères d'acceptation :**
    *   **Structure d'une compétence** : Chaque compétence possède obligatoirement : un Libellé (ex: Anglais, Python), une Famille (ex: Linguistique, Langages de programmation, Soft Skills) et une Description optionnelle.
    *   **Évolutivité** : L'administrateur peut ajouter une nouvelle compétence ou une nouvelle famille à tout moment sans bloquer le système.
*   **Statut** : 🟢 Implémenté / Validé (Module HR-Referentials déjà opérationnel pour les compétences et familles de compétences)

### `US 02.2` : Association des compétences requises à un Profil/Poste
*   **En tant qu'** : Administrateur RH
*   **Je veux** : Associer les compétences requises à un profil spécifique (ex: Développeur) en les filtrant par Famille et en leur attribuant le niveau attendu de 1 à 4.
*   **Afin de** : Définir le niveau d'exigence précis pour chaque fonction de l'entreprise.
*   **Critères d'acceptation (Comportement de l'interface) :**
    *   **Étape 1 : Sélection de la Famille**  
        L'utilisateur choisit une Famille dans une liste déroulante (ex: Compétences linguistiques).
    *   **Étape 2 : Sélection des compétences multi-choix**  
        Le système affiche uniquement les compétences de cette famille (ex: Allemand, Anglais, Français). L'utilisateur peut en cocher une ou plusieurs.
    *   **Étape 3 : Affectation du Niveau Requis**  
        Pour chaque compétence cochée, l'utilisateur sélectionne un niveau obligatoire de 1 à 4 via le référentiel d'entreprise :
        
        | Niveau | Intitulé | Description |
        | :--- | :--- | :--- |
        | **1** | Débutant | Connaissances de base. Nécessite un accompagnement constant pour réaliser les tâches. |
        | **2** | Intermédiaire | Peut réaliser les tâches courantes avec une supervision occasionnelle. Compréhension correcte du sujet. |
        | **3** | Autonome / Confirmé | Travaille de manière autonome, maîtrise bien la compétence et peut résoudre les problèmes courants. |
        | **4** | Expert | Maîtrise complète. Référence technique ou métier, capable de former et d’améliorer les processus. |
        
    *   **Étape 4 : Enchaînement**  
        L'utilisateur peut ensuite passer à la famille suivante (ex: Langages de programmation), sélectionner les technologies utilisées dans l'entreprise (ex: Java, React), leur attribuer un niveau requis, et ainsi de suite jusqu'à la validation du profil de poste.
*   **Statut** : 🟢 Implémenté / Validé (Module d'association par profils d'exigences opérationnel en administration)

---

## 🏃 Épic 03 : Campagnes d'Évaluation & Arbitrage Managériel

### `US 03.1` : Configuration et cycle de vie d'une campagne
*   **En tant qu'** : Administrateur RH
*   **Je veux** : Planifier et paramétrer une campagne d'évaluation des compétences.
*   **Afin de** : Cadrer la période durant laquelle les collaborateurs et managers doivent s'évaluer.
*   **Critères d'acceptation :**
    *   **Paramètres requis** : Fréquence (Annuelle / Trimestrielle), Date de début de la campagne, Durée de la campagne (ex: 2 semaines).
    *   **Statuts de la campagne** : Le système gère les statuts suivants : Planifiée $\rightarrow$ En cours $\rightarrow$ Clôturée $\rightarrow$ En retard (si la date de fin est dépassée mais que des évaluations restent à compléter).
    *   **Souplesse** : Même si la date de fin est dépassée, la campagne reste ouverte techniquement pour permettre les saisies tardives des managers.
*   **Statut** : 📝 À planifier

### `US 03.2` : Système de notifications et relances automatiques
*   **En tant que** : Système TalentFlow (Tâche planifiée / Cron Job)
*   **Je veux** : Envoyer des alertes et des emails automatiques aux collaborateurs et managers selon l'état de la campagne.
*   **Afin de** : Garantir un fort taux de complétion des évaluations dans les temps.
*   **Critères d'acceptation :**
    *   **Alerte J-7** : Une semaine avant le lancement, envoi d'un email d'information à toute l'entreprise.
    *   **Alerte J-1** : Un jour avant, rappel du lancement imminent.
    *   **Relances en cours** : Pendant la campagne, affichage sur le tableau de bord : *"Attention, il vous reste X jours pour finaliser vos évaluations"*.
    *   **Alerte "En retard"** : Si la date de fin est atteinte et que l'évaluation n'est pas validée, le manager N+1 reçoit une notification et un email de relance dédié.
*   **Statut** : 📝 À planifier

### `US 03.3` : Grille d'auto-évaluation et souhaits de formation
*   **En tant que** : Collaborateur
*   **Je veux** : Consulter la grille des compétences requises pour mon poste actuel et saisir mon auto-évaluation (facultative).
*   **Afin de** : Donner mon avis sur mon niveau et exprimer mes besoins en montée en compétences.
*   **Critères d'acceptation :**
    *   **Interface** : Un tableau affiche la liste des compétences requises de mon poste (avec l'intitulé et la description du niveau attendu 1 à 4).
    *   **Auto-évaluation (Optionnelle)** : Le collaborateur peut choisir sa note acquise (1 à 4). Il n'a aucune obligation de soumettre le formulaire s'il ne le souhaite pas.
    *   **Demande de formation** : En bas de sa grille, le collaborateur dispose d'un champ pour formuler une demande de formation spécifique liée à ses compétences.
*   **Statut** : 📝 À planifier

### `US 03.4` : Évaluation et arbitrage par le Manager N+1
*   **En tant que** : Manager N+1
*   **Je veux** : Valider ou modifier les notes d'évaluation de mon collaborateur et ajouter des commentaires.
*   **Afin de** : Acter le niveau réel acquis et proposer des axes de développement.
*   **Critères d'acceptation :**
    *   **Arbitrage** : Le manager voit la note requise par le poste et la note d'auto-évaluation du collaborateur. Il saisit la note finale validée (qui peut être égale, supérieure ou inférieure).
    *   **Commentaires multiniveaux** : Le manager peut ajouter un commentaire ciblé sur une compétence précise (ex: uniquement sur l'Anglais) OU un commentaire global sur une famille de compétences (ex: sur les compétences linguistiques en général).
    *   **Recommandation de formation** : Le manager peut cocher une option ou rédiger une recommandation de formation pour le collaborateur.
*   **Statut** : 📝 À planifier

### `US 03.5` : Calcul des scores d'évaluation (Collaborateur & Entreprise)
*   **En tant que** : Responsable RH / Manager
*   **Je veux** : Consulter les scores calculés automatiquement à l'échelle d'un collaborateur et de l'entreprise.
*   **Afin d'** : Évaluer la performance globale et identifier visuellement les écarts critiques (Gap).
*   **Critères d'acceptation (Logique de calcul) :**
    *   **Note Globale Collaborateur ($Score_{collab}$)** : Moyenne pondérée ou simple des écarts entre le requis et l'acquis sur son poste.
        $$\text{Écart (Gap)} = \text{Niveau Acquis Validé} - \text{Niveau Requis}$$
    *   **Météo des compétences de la Société ($Score_{competence}$)** : Pour une compétence donnée (ex: Administration Système), le système calcule la moyenne des niveaux acquis de tous les collaborateurs occupant un poste où cette compétence est requise.
    *   **Alerte Risque** : Si la moyenne de l'entreprise sur une compétence critique est inférieure à un seuil (ex: moyenne acquis < 2 alors que le requis moyen est de 3.5), le système affiche un indicateur visuel de Risque Majeur (ex: *"Risque critique sur l'Administration Système"*).
*   **Statut** : 📝 À planifier

### `US 03.6` : Plan d'action RH et assignation de formations
*   **En tant que** : Responsable RH
*   **Je veux** : Analyser les demandes/recommandations de formation et associer des plans de formation aux profils en sous-effectif de compétences.
*   **Afin de** : Réduire les écarts (gaps) constatés lors de la campagne.
*   **Critères d'acceptation :**
    *   **Console RH** : Un écran centralise toutes les demandes de formation des collaborateurs et les recommandations des managers issues de la campagne.
    *   **Assignation de masse** : Le RH peut sélectionner une liste de collaborateurs ayant un écart négatif sur une compétence et leur assigner une formation spécifique en un seul clic.
*   **Statut** : 📝 À planifier
