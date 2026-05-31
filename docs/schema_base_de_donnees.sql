-- =============================================================================
-- SCRIPT SQL DDL - SCHÉMA DE LA BASE DE DONNÉES TALENTFLOW (POSTGRESQL)
-- =============================================================================
-- Ce fichier contient les définitions physiques des tables de la base de données.
-- Il intègre strictement les contraintes multi-sociétés (cloisonnement RH),
-- l'historique chronologique des postes, et le dictionnaire de compétences (1 à 4).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CLOISONNEMENT & STRUTURE COMPOSITE (MULTI-SOCIÉTÉS)
-- -----------------------------------------------------------------------------

-- Table des Sociétés & Filiales (Organisation arborescente composite)
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vat_number VARCHAR(100) UNIQUE, -- SIRET / Numéro de TVA
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255),
    logo TEXT, -- Contenu Base64 pour le stockage direct du logo
    parent_id BIGINT,
    
    CONSTRAINT fk_company_parent FOREIGN KEY (parent_id) 
        REFERENCES companies(id) ON DELETE CASCADE
);

-- Table des Rôles Système
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Table des Permissions unitaires
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Table de liaison Rôles - Permissions (Matrice des droits)
CREATE TABLE roles_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) 
        REFERENCES permissions(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 2. COLLABORATEURS & CONTRÔLES DE SAISIE STRICTS (US 01.2 & US 01.5)
-- -----------------------------------------------------------------------------

-- Table principale des Collaborateurs (Fiches RH uniques)
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    
    -- Nom / Prénom : Lettres, espaces et tirets uniquement (chiffres interdits)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- E-mail professionnel unique avec validation stricte par Regex
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Numéro de téléphone pro : Préfixe obligatoire suivi de chiffres uniquement
    phone_prefix VARCHAR(10) NOT NULL, -- ex: '+33', '+32', '+216'
    phone_number VARCHAR(20) NOT NULL, -- ex: '612345678'
    
    -- Sexe : Liste fermée d'options
    gender VARCHAR(50) NOT NULL,
    
    -- Rattachement administratif
    company_id BIGINT NOT NULL,
    department VARCHAR(150),
    
    -- Responsable Hiérarchique N+1 (Relation réflexive)
    manager_id BIGINT,
    
    -- Cycle de vie et dates de contrat
    entry_date DATE NOT NULL, -- Date de début de contrat
    retirement_date DATE,     -- Date prévisionnelle de retraite
    trial_period_expiry DATE,  -- Date de fin de période d'essai (optionnel)
    departure_date DATE,      -- Date de départ effectif (optionnel)
    
    -- Statut RH actuel du collaborateur
    status VARCHAR(50) NOT NULL DEFAULT 'Actif', -- 'En attente', 'Actif', 'En préavis', 'Sorti'
    
    -- Cache historique (facultatif / rétro-compatibilité)
    job_title VARCHAR(255),
    key_skill VARCHAR(255),
    skill_level INTEGER DEFAULT 1,
    habilitation_name VARCHAR(255),
    habilitation_expiry_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    -- CONTRAINTES DE VALIDATION STRICTES (CHECK CONSTRAINTS)
    
    -- 1. Lettres uniquement pour Nom et Prénom
    CONSTRAINT chk_employee_first_name CHECK (first_name ~ '^[A-Za-zÀ-ÖØ-öø-ÿ\s\-\s]+$'),
    CONSTRAINT chk_employee_last_name CHECK (last_name ~ '^[A-Za-zÀ-ÖØ-öø-ÿ\s\-\s]+$'),
    
    -- 2. Format e-mail regex standardisé
    CONSTRAINT chk_employee_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    
    -- 3. Numéro de téléphone GSM (chiffres uniquement pour le corps du numéro)
    CONSTRAINT chk_employee_phone CHECK (phone_number ~ '^[0-9]+$'),
    
    -- 4. Genres autorisés (Homme, Femme, Autre)
    CONSTRAINT chk_employee_gender CHECK (gender IN ('Homme', 'Femme', 'Autre', 'Non défini')),
    
    -- 5. Statuts RH autorisés
    CONSTRAINT chk_employee_status CHECK (status IN ('En attente', 'Actif', 'En préavis', 'Sorti')),
    
    -- 6. Cohérence des dates (Retraite strictement supérieure à l'entrée de contrat)
    CONSTRAINT chk_employee_dates_retirement CHECK (retirement_date IS NULL OR retirement_date > entry_date),
    
    -- 7. Clés étrangères
    CONSTRAINT fk_employee_company FOREIGN KEY (company_id) 
        REFERENCES companies(id),
    CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) 
        REFERENCES employees(id) ON DELETE SET NULL
);

-- Table des Comptes Utilisateurs (Identifiants d'accès reliés à la fiche RH)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stockage crypté (BCrypt)
    email VARCHAR(255) NOT NULL UNIQUE,
    company_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    employee_id BIGINT UNIQUE, -- Liaison 1:1 optionnelle vers la fiche RH
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Métriques de sécurité et politiques de détection d'intrusions
    first_login BOOLEAN NOT NULL DEFAULT TRUE,
    password_last_changed TIMESTAMP,
    reset_token VARCHAR(255),
    token_expiry TIMESTAMP,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    account_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_user_company FOREIGN KEY (company_id) 
        REFERENCES companies(id),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id),
    CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE SET NULL
);

-- Table de liaison RH - Multi-Sociétés (Pour la US 01.1 : Cloisonnement RH)
-- Associe explicitement un compte RH à la liste des filiales sur lesquelles il a des droits.
CREATE TABLE user_companies (
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, company_id),
    
    CONSTRAINT fk_user_companies_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_companies_company FOREIGN KEY (company_id) 
        REFERENCES companies(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. HISTORIQUE DE CARRIÈRE & MULTI-POSTES CONCURRENTS (US 01.5)
-- -----------------------------------------------------------------------------

-- Table du Référentiel des Postes Métiers
CREATE TABLE job_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    responsibility_level INTEGER CHECK (responsibility_level >= 1 AND responsibility_level <= 10),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    company_id BIGINT,
    
    CONSTRAINT fk_job_profile_company FOREIGN KEY (company_id) 
        REFERENCES companies(id) ON DELETE CASCADE
);

-- Table chronologique d'Affectation des Postes (Timeline de carrière)
CREATE TABLE employee_post_assignments (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    job_profile_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- La date de fin doit être supérieure ou égale à la date de début
    CONSTRAINT chk_assignment_dates CHECK (end_date IS NULL OR end_date >= start_date),
    
    CONSTRAINT fk_assignment_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_profile FOREIGN KEY (job_profile_id) 
        REFERENCES job_profiles(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 4. RÉFÉRENTIEL DE COMPÉTENCES & EXIGENCES PAR POSTE (US 02.1 & US 02.2)
-- -----------------------------------------------------------------------------

-- Table des Familles de Compétences (Catégories)
CREATE TABLE skill_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    company_id BIGINT,
    
    CONSTRAINT fk_category_company FOREIGN KEY (company_id) 
        REFERENCES companies(id) ON DELETE CASCADE
);

-- Table des Compétences Unitaires
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    company_id BIGINT,
    criticality VARCHAR(50) DEFAULT 'MOYEN',
    min_required_level INTEGER DEFAULT 1,
    expected_level INTEGER DEFAULT 3,
    mandatory_by_default BOOLEAN DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT chk_skill_criticality CHECK (criticality IN ('FAIBLE', 'MOYEN', 'CRITIQUE')),
    
    CONSTRAINT fk_skill_category FOREIGN KEY (category_id) 
        REFERENCES skill_categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_skill_company FOREIGN KEY (company_id) 
        REFERENCES companies(id) ON DELETE CASCADE
);

-- Table de liaison Profil Métier - Compétence (Exigences et arbitrage de niveau 1 à 4)
CREATE TABLE job_profile_skills (
    id BIGSERIAL PRIMARY KEY,
    job_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    
    -- Le niveau requis est strictement compris entre 1 (Débutant) et 4 (Expert)
    expected_level INTEGER NOT NULL,
    mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT chk_profile_skill_level CHECK (expected_level >= 1 AND expected_level <= 4),
    
    CONSTRAINT fk_profile_skill_profile FOREIGN KEY (job_profile_id) 
        REFERENCES job_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_skill_skill FOREIGN KEY (skill_id) 
        REFERENCES skills(id) ON DELETE CASCADE,
        
    -- Une compétence ne peut être associée qu'une seule fois à un poste donné
    CONSTRAINT uq_profile_skill UNIQUE (job_profile_id, skill_id)
);

-- -----------------------------------------------------------------------------
-- INDEX DE PERFORMANCE (RECOMMANDÉS POUR LES FILTRES ET LE CLOISONNEMENT)
-- -----------------------------------------------------------------------------
CREATE INDEX idx_employee_company ON employees(company_id);
CREATE INDEX idx_employee_status ON employees(status);
CREATE INDEX idx_employee_manager ON employees(manager_id);
CREATE INDEX idx_assignment_employee ON employee_post_assignments(employee_id);
CREATE INDEX idx_assignment_active ON employee_post_assignments(active);
CREATE INDEX idx_profile_skill_profile ON job_profile_skills(job_profile_id);
