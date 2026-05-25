export interface TranslationDict {
  [key: string]: {
    fr: string;
    en: string;
    de: string;
    nl: string;
    it: string;
    es: string;
    pt: string;
    pl: string;
  };
}

export const TRANSLATIONS: TranslationDict = {
  // Profile menu translations
  'profile_change_password': {
    fr: 'Changer mot de passe',
    en: 'Change password',
    de: 'Kennwort ändern',
    nl: 'Wachtwoord wijzigen',
    it: 'Cambia password',
    es: 'Cambiar contraseña',
    pt: 'Alterar senha',
    pl: 'Zmień hasło'
  },
  'profile_logout': {
    fr: 'Déconnexion',
    en: 'Log Out',
    de: 'Abmelden',
    nl: 'Afmelden',
    it: 'Disconnetti',
    es: 'Cerrar sesión',
    pt: 'Sair',
    pl: 'Wyloguj się'
  },
  'pwd_modal_title': {
    fr: 'Modifier le mot de passe',
    en: 'Modify Password',
    de: 'Kennwort ändern',
    nl: 'Wachtwoord wijzigen',
    it: 'Modifica Password',
    es: 'Modificar contraseña',
    pt: 'Modificar senha',
    pl: 'Zmień hasło'
  },
  'pwd_modal_current': {
    fr: 'Mot de passe actuel',
    en: 'Current password',
    de: 'Aktuelles Passwort',
    nl: 'Huidig wachtwoord',
    it: 'Password attuale',
    es: 'Contraseña actual',
    pt: 'Senha atual',
    pl: 'Bieżące hasło'
  },
  'pwd_modal_current_ph': {
    fr: 'Saisissez votre code actuel',
    en: 'Enter your current code',
    de: 'Geben Sie Ihr aktuelles Passwort ein',
    nl: 'Voer uw huidige code in',
    it: 'Inserisci il tuo codice attuale',
    es: 'Ingrese su código actual',
    pt: 'Digite sua senha atual',
    pl: 'Wprowadź swój bieżący kod'
  },
  'pwd_modal_new_ph': {
    fr: 'Choisissez une clé solide',
    en: 'Choose a strong key',
    de: 'Wählen Sie ein starkes Passwort',
    nl: 'Kies een sterk wachtwoord',
    it: 'Scegli una password sicura',
    es: 'Elija una contraseña segura',
    pt: 'Escolha uma senha forte',
    pl: 'Wybierz silne hasło'
  },
  'pwd_modal_confirm_ph': {
    fr: 'Saisissez à nouveau',
    en: 'Enter again',
    de: 'Erneut eingeben',
    nl: 'Voer opnieuw in',
    it: 'Inserisci di nuovo',
    es: 'Ingrese de nuevo',
    pt: 'Digite novamente',
    pl: 'Wprowadź ponownie'
  },
  'pwd_modal_submit': {
    fr: 'Changer',
    en: 'Change',
    de: 'Ändern',
    nl: 'Wijzigen',
    it: 'Modifica',
    es: 'Cambiar',
    pt: 'Alterar',
    pl: 'Zmień'
  },
  'pwd_modal_rule_match': {
    fr: 'Confirmé identique',
    en: 'Confirmed match',
    de: 'Bestätigte Übereinstimmung',
    nl: 'Bevestigde overeenkomst',
    it: 'Conferma identica',
    es: 'Confirmado idéntico',
    pt: 'Confirmado idéntico',
    pl: 'Zatwierdzona zgodność'
  },
  'toast_logout_success': {
    fr: 'Déconnexion réussie. À bientôt !',
    en: 'Logout successful. See you soon!',
    de: 'Abmeldung erfolgreich. Bis bald!',
    nl: 'Succesvol afgemeld. Tot ziens!',
    it: 'Disconnessione riuscita. A presto!',
    es: '¡Cierre de sesión exitoso. ¡Hasta pronto!',
    pt: 'Desconexão bem-sucedida. Até breve!',
    pl: 'Wylogowanie pomyślne. Do zobaczenia!'
  },
  'toast_theme_success': {
    fr: 'Thème changé avec succès !',
    en: 'Theme changed successfully!',
    de: 'Thema erfolgreich geändert!',
    nl: 'Thema succesvol gewijzigd!',
    it: 'Tema cambiato con successo!',
    es: '¡Tema cambiado con éxito!',
    pt: 'Tema alterado com sucesso!',
    pl: 'Motyw zmieniony pomyślnie!'
  },

  // General Action buttons
  'btn_save': {
    fr: 'Enregistrer',
    en: 'Save',
    de: 'Speichern',
    nl: 'Opslaan',
    it: 'Salva',
    es: 'Guardar',
    pt: 'Salvar',
    pl: 'Zapisz'
  },
  'btn_edit': {
    fr: 'Modifier',
    en: 'Edit',
    de: 'Bearbeiten',
    nl: 'Bewerken',
    it: 'Modifica',
    es: 'Editar',
    pt: 'Editar',
    pl: 'Edytuj'
  },
  'btn_delete': {
    fr: 'Supprimer',
    en: 'Delete',
    de: 'Löschen',
    nl: 'Verwijderen',
    it: 'Elimina',
    es: 'Eliminar',
    pt: 'Excluir',
    pl: 'Usuń'
  },
  'btn_cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    de: 'Abbrechen',
    nl: 'Annuleren',
    it: 'Annulla',
    es: 'Cancelar',
    pt: 'Cancelar',
    pl: 'Anuluj'
  },
  'btn_add_child': {
    fr: 'Ajouter filiale',
    en: 'Add subsidiary',
    de: 'Filiale hinzufügen',
    nl: 'Filiaal toevoegen',
    it: 'Aggiungi filiale',
    es: 'Agregar filial',
    pt: 'Adicionar filial',
    pl: 'Dodaj filię'
  },
  'btn_add_company': {
    fr: 'Ajouter société',
    en: 'Add company',
    de: 'Firma hinzufügen',
    nl: 'Bedrijf toevoegen',
    it: 'Aggiungi azienda',
    es: 'Agregar empresa',
    pt: 'Adicionar empresa',
    pl: 'Dodaj firmę'
  },
  'btn_export': {
    fr: 'Exporter Rapport',
    en: 'Export Report',
    de: 'Bericht exportieren',
    nl: 'Rapport exporteren',
    it: 'Esporta Rapporto',
    es: 'Exportar Informe',
    pt: 'Exportar Relatório',
    pl: 'Eksportuj raport'
  },
  
  // Navigation / Tabs
  'nav_dashboard': {
    fr: 'Tableau de Bord',
    en: 'Dashboard',
    de: 'Dashboard',
    nl: 'Dashboard',
    it: 'Cruscotto',
    es: 'Tablero',
    pt: 'Painel de Controle',
    pl: 'Panel sterowania'
  },
  'nav_admin': {
    fr: 'Administration',
    en: 'Administration',
    de: 'Administration',
    nl: 'Administratie',
    it: 'Amministrazione',
    es: 'Administración',
    pt: 'Administração',
    pl: 'Administracja'
  },
  'tab_companies': {
    fr: 'Sociétés & Filiales',
    en: 'Companies & Subsidiaries',
    de: 'Firmen & Filialen',
    nl: 'Bedrijven & Filialen',
    it: 'Aziende e Filiali',
    es: 'Empresas y Filiales',
    pt: 'Empresas e Filiais',
    pl: 'Firmy i filie'
  },
  'tab_roles': {
    fr: 'Utilisateurs & Rôles',
    en: 'Users & Roles',
    de: 'Benutzer & Rollen',
    nl: 'Gebruikers & Rollen',
    it: 'Utenti e Ruoli',
    es: 'Usuarios y Roles',
    pt: 'Usuários e Funções',
    pl: 'Użytkownicy i role'
  },
  'tab_settings': {
    fr: 'Paramètres Globaux',
    en: 'Global Parameters',
    de: 'Globale Parameter',
    nl: 'Globale Parameters',
    it: 'Parametri Globali',
    es: 'Parámetros Globales',
    pt: 'Parâmetros Globais',
    pl: 'Parametry globalne'
  },
  'tab_priority': {
    fr: 'Modules Prioritaires',
    en: 'Priority Modules',
    de: 'Prioritäre Module',
    nl: 'Prioritaire Modules',
    it: 'Moduli Prioritari',
    es: 'Módulos Prioritarios',
    pt: 'Módulos Prioritários',
    pl: 'Moduły priorytetowe'
  },
  
  // Settings labels
  'settings_work_hours': {
    fr: 'Heures de Travail',
    en: 'Working Hours',
    de: 'Arbeitszeit',
    nl: 'Werktijden',
    it: 'Ore di Lavoro',
    es: 'Horas de Trabajo',
    pt: 'Horas de Trabalho',
    pl: 'Godziny pracy'
  },
  'settings_max_daily': {
    fr: 'Heures maximum par jour',
    en: 'Max daily hours',
    de: 'Max. tägliche Stunden',
    nl: 'Max. dagelijkse uren',
    it: 'Ore massime giornaliere',
    es: 'Horas máximas diarias',
    pt: 'Horas máximas diárias',
    pl: 'Maksymalna liczba godzin dziennie'
  },
  'settings_wfh_rules': {
    fr: 'Règles de Télétravail',
    en: 'Teleworking Rules',
    de: 'Telearbeitsregeln',
    nl: 'Thuiswerkregels',
    it: 'Regole per lo Smart Working',
    es: 'Reglas de Teletrabajo',
    pt: 'Regras de Teletrabalho',
    pl: 'Zasady pracy zdalnej'
  },
  'settings_wfh_days_week': {
    fr: 'Jours autorisés par semaine',
    en: 'Allowed days per week',
    de: 'Erlaubte Tage pro Woche',
    nl: 'Toegestane dagen per week',
    it: 'Giorni autorizzati a settimana',
    es: 'Días permitidos por semana',
    pt: 'Dias permitidos por semana',
    pl: 'Dozwolone dni w tygodniu'
  },
  'settings_wfh_days_month': {
    fr: 'Jours autorisés par mois',
    en: 'Allowed days per month',
    de: 'Erlaubte Tage pro Monat',
    nl: 'Toegestane dagen per maand',
    it: 'Giorni autorizzati al mese',
    es: 'Días permitidos por mes',
    pt: 'Dias permitidos por mês',
    pl: 'Dozwolone dni w miesiącu'
  },
  'settings_wfh_exceptions': {
    fr: 'Motifs exceptionnels de télétravail',
    en: 'Exceptional WFH reasons',
    de: 'Außergewöhnliche WFH-Gründe',
    nl: 'Uitzonderlijke thuiswerkredenen',
    it: 'Motivi eccezionali smart working',
    es: 'Motivos excepcionales de teletrabajo',
    pt: 'Motivos excepcionais de teletrabalho',
    pl: 'Wyjątkowe powody pracy zdalnej'
  },
  'settings_select_theme': {
    fr: 'Sélectionner le Thème',
    en: 'Select Theme',
    de: 'Thema auswählen',
    nl: 'Thema selecteren',
    it: 'Seleziona Tema',
    es: 'Seleccionar Tema',
    pt: 'Selecionar Tema',
    pl: 'Wybierz motyw'
  },
  'settings_select_lang': {
    fr: 'Langue de l\'application',
    en: 'App Language',
    de: 'App-Sprache',
    nl: 'App-taal',
    it: 'Lingua dell\'applicazione',
    es: 'Idioma de la aplicación',
    pt: 'Idioma do aplicativo',
    pl: 'Język aplikacji'
  },
  
  // Table columns
  'col_name': {
    fr: 'Nom',
    en: 'Name',
    de: 'Name',
    nl: 'Naam',
    it: 'Nome',
    es: 'Nombre',
    pt: 'Nome',
    pl: 'Nazwisko'
  },
  'col_code': {
    fr: 'Code',
    en: 'Code',
    de: 'Code',
    nl: 'Code',
    it: 'Codice',
    es: 'Código',
    pt: 'Código',
    pl: 'Kod'
  },
  'col_address': {
    fr: 'Adresse',
    en: 'Address',
    de: 'Adresse',
    nl: 'Adres',
    it: 'Indirizzo',
    es: 'Dirección',
    pt: 'Endereço',
    pl: 'Adres'
  },
  'col_country': {
    fr: 'Pays',
    en: 'Country',
    de: 'Land',
    nl: 'Land',
    it: 'Paese',
    es: 'País',
    pt: 'País',
    pl: 'Kraj'
  },
  'col_city': {
    fr: 'Ville',
    en: 'City',
    de: 'Stadt',
    nl: 'Stad',
    it: 'Città',
    es: 'Ciudad',
    pt: 'Cidade',
    pl: 'Miasto'
  },
  'col_siret': {
    fr: 'Numéro SIRET / TVA',
    en: 'SIRET / VAT Number',
    de: 'SIRET / MwSt-Nummer',
    nl: 'SIRET / BTW-nummer',
    it: 'Codice IVA / Fiscale',
    es: 'CIF / IVA',
    pt: 'CNPJ / IVA',
    pl: 'NIP / REGON'
  },
  'col_actions': {
    fr: 'Actions',
    en: 'Actions',
    de: 'Aktionen',
    nl: 'Acties',
    it: 'Azioni',
    es: 'Acciones',
    pt: 'Ações',
    pl: 'Działania'
  },
  'col_role': {
    fr: 'Rôle',
    en: 'Role',
    de: 'Rolle',
    nl: 'Rol',
    it: 'Ruolo',
    es: 'Rol',
    pt: 'Função',
    pl: 'Rola'
  },
  'col_permissions': {
    fr: 'Permissions',
    en: 'Permissions',
    de: 'Berechtigungen',
    nl: 'Machtigingen',
    it: 'Autorizzazioni',
    es: 'Permisos',
    pt: 'Permissões',
    pl: 'Uprawnienia'
  },
  'col_email': {
    fr: 'Email',
    en: 'Email',
    de: 'E-Mail',
    nl: 'E-mail',
    it: 'Email',
    es: 'Correo electrónico',
    pt: 'E-mail',
    pl: 'E-mail'
  },
  
  // Dynamic alerts / status
  'status_active': {
    fr: 'Actif',
    en: 'Active',
    de: 'Aktiv',
    nl: 'Actief',
    it: 'Attivo',
    es: 'Activo',
    pt: 'Ativo',
    pl: 'Aktywny'
  },
  'status_inactive': {
    fr: 'Inactif',
    en: 'Inactive',
    de: 'Inaktiv',
    nl: 'Inactief',
    it: 'Inattivo',
    es: 'Inactivo',
    pt: 'Inativo',
    pl: 'Nieaktywny'
  },
  'msg_saved_success': {
    fr: 'Paramètres enregistrés avec succès !',
    en: 'Settings saved successfully!',
    de: 'Einstellungen erfolgreich gespeichert!',
    nl: 'Instellingen succesvol opgeslagen!',
    it: 'Impostazioni salvate con successo!',
    es: '¡Configuración guardada con éxito!',
    pt: 'Configurações salvas com sucesso!',
    pl: 'Ustawienia zapisane pomyślnie!'
  },
  
  // Priority modules
  'module_employees': {
    fr: 'Employés',
    en: 'Employees',
    de: 'Mitarbeiter',
    nl: 'Medewerkers',
    it: 'Dipendenti',
    es: 'Empleados',
    pt: 'Funcionários',
    pl: 'Pracownicy'
  },
  'module_skills': {
    fr: 'Gestion de Compétences',
    en: 'Skills Management',
    de: 'Kompetenzmanagement',
    nl: 'Competentiemanagement',
    it: 'Gestione delle Competenze',
    es: 'Gestión de Competencias',
    pt: 'Gestão de Competências',
    pl: 'Zarządzanie kompetencjami'
  },
  'module_habilitations': {
    fr: 'Habilitations & Certifications',
    en: 'Authorizations & Certifications',
    de: 'Berechtigungen & Zertifikate',
    nl: 'Machtigingen & Certificeringen',
    it: 'Abilitazioni & Certificazioni',
    es: 'Habilitaciones & Certificaciones',
    pt: 'Habilitações & Certificações',
    pl: 'Uprawnienia i certyfikaty'
  },
  'module_trainings': {
    fr: 'Formations',
    en: 'Training & Development',
    de: 'Schulung & Fortbildung',
    nl: 'Training & Opleiding',
    it: 'Formazione',
    es: 'Formaciones',
    pt: 'Treinamento',
    pl: 'Szkolenia'
  },
  
  // Dynamic fields
  'fields_company_parent': {
    fr: 'Société Mère',
    en: 'Parent Company',
    de: 'Muttergesellschaft',
    nl: 'Moedermaatschappij',
    it: 'Capogruppo',
    es: 'Sociedad Matriz',
    pt: 'Sociedade Controladora',
    pl: 'Jednostka dominująca'
  },
  'fields_company_details': {
    fr: 'Détails de la Société',
    en: 'Company Details',
    de: 'Firmendetails',
    nl: 'Bedrijfsdetails',
    it: 'Dettagli dell\'Azienda',
    es: 'Detalles de la Empresa',
    pt: 'Detalhes da Empresa',
    pl: 'Szczegóły firmy'
  },
  'fields_role_details': {
    fr: 'Détails du Rôle',
    en: 'Role Details',
    de: 'Rolledetails',
    nl: 'Roldetails',
    it: 'Dettagli del Ruolo',
    es: 'Detalles del Rol',
    pt: 'Detalhes da Função',
    pl: 'Szczegóły roli'
  },
  'fields_user_details': {
    fr: 'Détails de l\'Utilisateur',
    en: 'User Details',
    de: 'Benutzerdetails',
    nl: 'Gebruikersdetails',
    it: 'Dettagli dell\'Utente',
    es: 'Detalles del Usuario',
    pt: 'Detalhes do Usuário',
    pl: 'Szczegóły użytkownika'
  },

  // ==========================================
  // SÉCURITÉ & AUTHENTIFICATION
  // ==========================================
  'auth_login': {
    fr: 'Se connecter',
    en: 'Log In',
    de: 'Anmelden',
    nl: 'Inloggen',
    it: 'Accedi',
    es: 'Iniciar sesión',
    pt: 'Entrar',
    pl: 'Zaloguj się'
  },
  'auth_username': {
    fr: 'Identifiant (Email / Nom d\'utilisateur)',
    en: 'Identifier (Email / Username)',
    de: 'Kennung (E-Mail / Benutzername)',
    nl: 'Identificatie (E-mail / Gebruikersnaam)',
    it: 'Identificativo (Email / Username)',
    es: 'Identificador (Correo / Usuario)',
    pt: 'Identificador (E-mail / Nome de usuário)',
    pl: 'Identyfikator (E-mail / Nazwa użytkownika)'
  },
  'auth_password': {
    fr: 'Mot de passe',
    en: 'Password',
    de: 'Passwort',
    nl: 'Wachtwoord',
    it: 'Password',
    es: 'Contraseña',
    pt: 'Senha',
    pl: 'Hasło'
  },
  'auth_forgot': {
    fr: 'Mot de passe oublié ?',
    en: 'Forgot password?',
    de: 'Passwort vergessen?',
    nl: 'Wachtwoord vergeten?',
    it: 'Password dimenticata?',
    es: '¿Contraseña olvidada?',
    pt: 'Esqueceu a senha?',
    pl: 'Zapomniałeś hasła?'
  },
  'auth_slogan': {
    fr: 'Système RH Révolutionnaire',
    en: 'Revolutionary HR System',
    de: 'Revolutionäres HR-System',
    nl: 'Revolutionair HR-systeem',
    it: 'Sistema Risorse Umane Rivoluzionario',
    es: 'Sistema de Recursos Humanos Revolucionario',
    pt: 'Sistema Revolucionário de Recursos Humanos',
    pl: 'Rewolucyjny system kadrowy'
  },
  'auth_forgot_title': {
    fr: 'Récupération de mot de passe',
    en: 'Password Recovery',
    de: 'Passwort-Wiederherstellung',
    nl: 'Wachtwoordherstel',
    it: 'Recupero password',
    es: 'Recuperación de contraseña',
    pt: 'Recuperação de senha',
    pl: 'Odzyskiwanie hasła'
  },
  'auth_forgot_subtitle': {
    fr: 'Saisissez votre e-mail pour obtenir un code secret valable 15 min.',
    en: 'Enter your email to receive a secret code valid for 15 mins.',
    de: 'Geben Sie Ihre E-Mail ein, um einen 15 Min. gültigen Geheimcode zu erhalten.',
    nl: 'Voer uw e-mailadres in om een code te ontvangen die 15 minuten geldig is.',
    it: 'Inserisci la tua email per ricevere un codice segreto valido 15 minuti.',
    es: 'Ingrese su correo para recibir un código secreto válido por 15 minutos.',
    pt: 'Insira seu e-mail para receber um código secreto válido por 15 minutos.',
    pl: 'Wprowadź swój adres e-mail, aby otrzymać kod ważny przez 15 minut.'
  },
  'auth_get_code': {
    fr: 'Obtenir le code secret',
    en: 'Get secret code',
    de: 'Geheimcode anfordern',
    nl: 'Geheime code aanvragen',
    it: 'Ottieni codice segreto',
    es: 'Obtener código secreto',
    pt: 'Obter código secreto',
    pl: 'Pobierz tajny kod'
  },
  'auth_reset_title': {
    fr: 'Créer un nouveau mot de passe',
    en: 'Create new password',
    de: 'Neues Passwort erstellen',
    nl: 'Nieuw wachtwoord aanmaken',
    it: 'Crea nuova password',
    es: 'Crear nueva contraseña',
    pt: 'Criar nova senha',
    pl: 'Utwórz nowe hasło'
  },
  'auth_reset_subtitle': {
    fr: 'Saisissez le code de 6 chiffres reçu par e-mail et votre nouveau mot de passe.',
    en: 'Enter the 6-digit code received by email and your new password.',
    de: 'Geben Sie den erhaltenen 6-stelligen Code und Ihr neues Passwort ein.',
    nl: 'Voer de per e-mail ontvangen 6-cijferige code en uw nieuwe wachtwoord in.',
    it: 'Inserisci il codice di 6 cifre ricevuto via email e la tua nuova password.',
    es: 'Ingrese el código de 6 dígitos recibido por correo y su nueva contraseña.',
    pt: 'Insira o código de 6 dígitos recebido por e-mail e sua nova senha.',
    pl: 'Wprowadź 6-cyfrowy kod otrzymany pocztą elektroniczną i nowe hasło.'
  },
  'auth_code': {
    fr: 'Code secret (6 chiffres)',
    en: 'Secret code (6 digits)',
    de: 'Geheimcode (6-stellig)',
    nl: 'Geheime code (6 cijfers)',
    it: 'Codice segreto (6 cifre)',
    es: 'Código secreto (6 dígitos)',
    pt: 'Código secreto (6 dígitos)',
    pl: 'Tajny kod (6 cyfr)'
  },
  'auth_new_password': {
    fr: 'Nouveau mot de passe',
    en: 'New password',
    de: 'Neues Passwort',
    nl: 'Nieuw wachtwoord',
    it: 'Nuova password',
    es: 'Nueva contraseña',
    pt: 'Nova senha',
    pl: 'Nowe hasło'
  },
  'auth_confirm_password': {
    fr: 'Confirmer le mot de passe',
    en: 'Confirm password',
    de: 'Passwort bestätigen',
    nl: 'Wachtwoord bevestigen',
    it: 'Conferma password',
    es: 'Confirmar contraseña',
    pt: 'Confirmar senha',
    pl: 'Potwierdź hasło'
  },
  'auth_reset_btn': {
    fr: 'Valider le changement',
    en: 'Confirm change',
    de: 'Änderung bestätigen',
    nl: 'Wijziging bestätigen',
    it: 'Conferma modifica',
    es: 'Confirmar cambio',
    pt: 'Confirmar alteração',
    pl: 'Zatwierdź zmianę'
  },
  'auth_back_login': {
    fr: 'Retourner à l\'écran de connexion',
    en: 'Back to Log In',
    de: 'Zurück zur Anmeldung',
    nl: 'Terug naar inloggen',
    it: 'Torna alla pagina di accesso',
    es: 'Volver al inicio de sesión',
    pt: 'Voltar para a página de entrada',
    pl: 'Wróć do logowania'
  },
  'auth_force_title': {
    fr: 'Changement de mot de passe obligatoire',
    en: 'Mandatory password change',
    de: 'Obligatorische Passwortänderung',
    nl: 'Verplichte wachtwoordwijziging',
    it: 'Cambio password obbligatorio',
    es: 'Cambio de contraseña obligatorio',
    pt: 'Alteração de senha obrigatória',
    pl: 'Wymagana zmiana hasła'
  },
  'auth_force_subtitle': {
    fr: 'Pour votre sécurité, vous devez configurer un nouveau mot de passe solide.',
    en: 'For your security, you must set up a new strong password.',
    de: 'Zu Ihrer Sicherheit müssen Sie ein neues starkes Passwort einrichten.',
    nl: 'Voor uw veiligheid moet u een nieuw sterk wachtwoord instellen.',
    it: 'Per la tua sicurezza, devi impostare una nuova password complessa.',
    es: 'Por su seguridad, debe configurar una nueva contraseña segura.',
    pt: 'Para sua segurança, você deve configurar uma nova senha forte.',
    pl: 'Dla własnego bezpieczeństwa musisz ustawić nowe silne hasło.'
  },
  'auth_warning_8': {
    fr: '⚠️ Attention ! Une taille inférieure à 8 caractères est un danger pour votre sécurité !',
    en: '⚠️ Warning! A length below 8 characters is a security hazard!',
    de: '⚠️ Warnung! Eine Länge unter 8 Zeichen ist ein Sicherheitsrisiko!',
    nl: '⚠️ Waarschuwing! Een lengte van minder dan 8 tekens is een beveiligingsrisico!',
    it: '⚠️ Attenzione! Una password inferiore a 8 caratteri mette in pericolo la tua sicurezza!',
    es: '¡Atención! Una longitud inferior a 8 caracteres pone en peligro su seguridad.',
    pt: 'Atenção! Um comprimento menor que 8 caracteres coloca sua segurança em perigo.',
    pl: '⚠️ Uwaga! Hasło krótsze niż 8 znaków zagraża Twojemu bezpieczeństwu!'
  },
  'auth_rule_len': {
    fr: 'Au moins 12 caractères',
    en: 'At least 12 characters',
    de: 'Mindestens 12 Zeichen',
    nl: 'Ten minste 12 tekens',
    it: 'Almeno 12 caratteri',
    es: 'Al menos 12 caracteres',
    pt: 'Pelo menos 12 caracteres',
    pl: 'Co najmniej 12 znaków'
  },
  'auth_rule_case': {
    fr: 'Au moins une lettre MAJUSCULE',
    en: 'At least one UPPERCASE letter',
    de: 'Mindestens ein GROSSBUCHSTABE',
    nl: 'Ten minste één HOOFDLETTER',
    it: 'Almeno una lettera MAIUSCOLA',
    es: 'Al menos una letra MAYÚSCULA',
    pt: 'Pelo menos uma letra MAIÚSCULA',
    pl: 'Co najmniej jedna wielka litera'
  },
  'auth_rule_num': {
    fr: 'Au moins un chiffre (0-9)',
    en: 'At least one number (0-9)',
    de: 'Mindestens eine Zahl (0-9)',
    nl: 'Ten minste één cijfer (0-9)',
    it: 'Almeno un numero (0-9)',
    es: 'Al menos un número (0-9)',
    pt: 'Pelo menos um número (0-9)',
    pl: 'Co najmniej jedna cyfra (0-9)'
  },
  'auth_rule_spec': {
    fr: 'Au moins un caractère spécial (ex: @, !, $)',
    en: 'At least one special char (e.g. @, !, $)',
    de: 'Mindestens ein Sonderzeichen (z.B. @, !, $)',
    nl: 'Ten minste één speciaal teken (bijv. @, !, $)',
    it: 'Almeno un carattere speciale (es: @, !, $)',
    es: 'Al menos un carácter especial (p. ej., @, !, $)',
    pt: 'Pelo menos um caractere especial (ex: @, !, $)',
    pl: 'Co najmniej jeden znak specjalny (np. @, !, $)'
  },
  'auth_rule_name': {
    fr: 'Ne doit pas contenir votre prénom ou votre nom',
    en: 'Must not contain your first or last name',
    de: 'Darf nicht Ihren Vor- oder Nachnamen enthalten',
    nl: 'Mag uw voor- of achternaam niet bevatten',
    it: 'Non deve contenere il tuo nome o cognome',
    es: 'No debe contener su nombre o apellido',
    pt: 'Não deve conter seu primeiro ou último nome',
    pl: 'Nie może zawierać Twojego imienia ani nazwiska'
  },
  'auth_rule_hist': {
    fr: 'Différent des 3 derniers mots de passe utilisés',
    en: 'Different from the last 3 passwords used',
    de: 'Soll sich von den letzten 3 Passwörtern unterscheiden',
    nl: 'Moet verschillen van de laatste 3 gebruikte wachtwoorden',
    it: 'Diverso dalle ultime 3 password utilizzate',
    es: 'Diferente de las últimas 3 contraseñas utilizadas',
    pt: 'Diferente das últimas 3 senhas utilizadas',
    pl: 'Inne niż 3 ostatnie używane hasła'
  },

  // Seuils & Alertes
  'settings_thresholds_title': {
    fr: '📈 Seuils & Alertes Critiques',
    en: '📈 Critical Thresholds & Alerts',
    de: '📈 Kritische Schwellenwerte & Alarme',
    nl: '📈 Kritieke Drempels & Waarschuwingen',
    it: '📈 Soglie Critiche & Allarmi',
    es: '📈 Umbrales Críticos & Alertas',
    pt: '📈 Limites Críticos & Alertas',
    pl: '📈 Krytyczne progi i alarmy'
  },
  'settings_turnover_label': {
    fr: 'Seuil Critique de Turn-Over d\'entreprise (%)',
    en: 'Critical Company Turn-Over Threshold (%)',
    de: 'Kritischer Fluktuations-Schwellenwert (%)',
    nl: 'Kritieke Verloopdrempel van het Bedrijf (%)',
    it: 'Soglia critica di Turn-Over aziendale (%)',
    es: 'Umbral crítico de Turn-Over de la empresa (%)',
    pt: 'Limite crítico de Turn-Over da empresa (%)',
    pl: 'Krytyczny próg rotacji pracowników (%)'
  },
  'settings_turnover_desc': {
    fr: 'Si le taux de départ des collaborateurs dépasse ce seuil, une alerte s\'affiche sur le tableau de bord.',
    en: 'If the employee departure rate exceeds this threshold, an alert is displayed on the dashboard.',
    de: 'Wenn die Mitarbeiter-Abgangsrate diesen Schwellenwert überschreitet, wird eine Warnung auf dem Dashboard angezeigt.',
    nl: 'Als het verlooppercentage van medewerkers deze drempel overschrijdt, wordt er een waarschuwing op het dashboard getoond.',
    it: 'Se il tasso di abbandono dei dipendenti supera questa soglia, verrà visualizzato un avviso sulla bacheca.',
    es: 'Si la tasa de salida de empleados supera este umbral, se mostrará una alerta en el tablero.',
    pt: 'Se a taxa de saída de funcionários exceder esse limite, um alerta será exibido no painel.',
    pl: 'Jeśli wskaźnik odejść pracowników przekroczy ten próg, na panelu zostanie wyświetlone ostrzeżenie.'
  },

  // Référentiels HR
  'settings_hr_title': {
    fr: 'Compétences & profils métiers',
    en: 'Skills & job profiles',
    de: 'Kompetenzen & Berufsprofile',
    nl: 'Vaardigheden & functieprofielen',
    it: 'Competenze e profili professionali',
    es: 'Competencias y perfiles profesionales',
    pt: 'Competências e perfis profissionais',
    pl: 'Kompetencje i profile zawodowe'
  },
  'settings_other_referentials': {
    fr: 'Autres référentiels (formations, habilitations)',
    en: 'Other referentials (training, certifications)',
    de: 'Weitere Referenzen (Schulung, Zertifikate)',
    nl: 'Overige referenties (opleiding, certificeringen)',
    it: 'Altri referenziali (formazione, abilitazioni)',
    es: 'Otros referenciales (formación, habilitaciones)',
    pt: 'Outros referenciais (formação, habilitações)',
    pl: 'Inne słowniki (szkolenia, uprawnienia)'
  },
  'ref_skills_intro': {
    fr: 'Paramétrez les catégories, compétences et profils métiers de la société sélectionnée. Chaque profil métier regroupe les compétences attendues pour une fonction.',
    en: 'Configure categories, skills and job profiles for the selected company. Each job profile groups the expected skills for a role.',
    de: 'Konfigurieren Sie Kategorien, Kompetenzen und Berufsprofile für das ausgewählte Unternehmen.',
    nl: 'Configureer categorieën, vaardigheden en functieprofielen voor het geselecteerde bedrijf.',
    it: 'Configura categorie, competenze e profili per la società selezionata.',
    es: 'Configure categorías, competencias y perfiles para la empresa seleccionada.',
    pt: 'Configure categorias, competências e perfis para a empresa selecionada.',
    pl: 'Skonfiguruj kategorie, kompetencje i profile dla wybranej spółki.'
  },
  'ref_tab_categories': {
    fr: 'Catégories',
    en: 'Categories',
    de: 'Kategorien',
    nl: 'Categorieën',
    it: 'Categorie',
    es: 'Categorías',
    pt: 'Categorias',
    pl: 'Kategorie'
  },
  'ref_tab_skills': {
    fr: 'Compétences',
    en: 'Skills',
    de: 'Kompetenzen',
    nl: 'Vaardigheden',
    it: 'Competenze',
    es: 'Competencias',
    pt: 'Competências',
    pl: 'Kompetencje'
  },
  'ref_tab_job_profiles': {
    fr: 'Profils métiers',
    en: 'Job profiles',
    de: 'Berufsprofile',
    nl: 'Functieprofielen',
    it: 'Profili professionali',
    es: 'Perfiles profesionales',
    pt: 'Perfis profissionais',
    pl: 'Profile zawodowe'
  },
  'ref_name': { fr: 'Nom', en: 'Name', de: 'Name', nl: 'Naam', it: 'Nome', es: 'Nombre', pt: 'Nome', pl: 'Nazwa' },
  'ref_description': { fr: 'Description', en: 'Description', de: 'Beschreibung', nl: 'Beschrijving', it: 'Descrizione', es: 'Descripción', pt: 'Descrição', pl: 'Opis' },
  'ref_category': { fr: 'Catégorie', en: 'Category', de: 'Kategorie', nl: 'Categorie', it: 'Categoria', es: 'Categoría', pt: 'Categoria', pl: 'Kategoria' },
  'ref_sort_order': { fr: 'Ordre', en: 'Order', de: 'Reihenfolge', nl: 'Volgorde', it: 'Ordine', es: 'Orden', pt: 'Ordem', pl: 'Kolejność' },
  'ref_active': { fr: 'Actif', en: 'Active', de: 'Aktiv', nl: 'Actief', it: 'Attivo', es: 'Activo', pt: 'Ativo', pl: 'Aktywny' },
  'ref_inactive': { fr: 'Inactif', en: 'Inactive', de: 'Inaktiv', nl: 'Inactief', it: 'Inattivo', es: 'Inactivo', pt: 'Inativo', pl: 'Nieaktywny' },
  'ref_status': { fr: 'Statut', en: 'Status', de: 'Status', nl: 'Status', it: 'Stato', es: 'Estado', pt: 'Estado', pl: 'Status' },
  'ref_expected_level': { fr: 'Niveau attendu', en: 'Expected level', de: 'Erwartetes Niveau', nl: 'Verwacht niveau', it: 'Livello atteso', es: 'Nivel esperado', pt: 'Nível esperado', pl: 'Oczekiwany poziom' },
  'ref_min_level': { fr: 'Niveau minimal', en: 'Minimum level', de: 'Mindestniveau', nl: 'Minimumniveau', it: 'Livello minimo', es: 'Nivel mínimo', pt: 'Nível mínimo', pl: 'Poziom minimalny' },
  'ref_levels': { fr: 'Niveaux', en: 'Levels', de: 'Niveaus', nl: 'Niveaus', it: 'Livelli', es: 'Niveles', pt: 'Níveis', pl: 'Poziomy' },
  'ref_criticality': { fr: 'Criticité', en: 'Criticality', de: 'Kritikalität', nl: 'Kriticiteit', it: 'Criticità', es: 'Criticidad', pt: 'Criticidade', pl: 'Krytyczność' },
  'ref_criticality_low': { fr: 'Faible', en: 'Low', de: 'Niedrig', nl: 'Laag', it: 'Bassa', es: 'Baja', pt: 'Baixa', pl: 'Niska' },
  'ref_criticality_medium': { fr: 'Moyenne', en: 'Medium', de: 'Mittel', nl: 'Gemiddeld', it: 'Media', es: 'Media', pt: 'Média', pl: 'Średnia' },
  'ref_criticality_high': { fr: 'Élevée', en: 'High', de: 'Hoch', nl: 'Hoog', it: 'Alta', es: 'Alta', pt: 'Alta', pl: 'Wysoka' },
  'ref_mandatory_default': { fr: 'Obligatoire par défaut', en: 'Mandatory by default', de: 'Standardmäßig obligatorisch', nl: 'Standaard verplicht', it: 'Obbligatorio di default', es: 'Obligatorio por defecto', pt: 'Obrigatório por padrão', pl: 'Domyślnie obowiązkowe' },
  'ref_mandatory': { fr: 'Oblig.', en: 'Req.', de: 'Pflicht', nl: 'Verpl.', it: 'Obbl.', es: 'Obl.', pt: 'Obrig.', pl: 'Wym.' },
  'ref_responsibility_level': { fr: 'Niveau de responsabilité', en: 'Responsibility level', de: 'Verantwortungsebene', nl: 'Verantwoordelijkheidsniveau', it: 'Livello di responsabilità', es: 'Nivel de responsabilidad', pt: 'Nível de responsabilidade', pl: 'Poziom odpowiedzialności' },
  'ref_linked_skills': { fr: 'Compétences associées', en: 'Linked skills', de: 'Verknüpfte Kompetenzen', nl: 'Gekoppelde vaardigheden', it: 'Competenze collegate', es: 'Competencias vinculadas', pt: 'Competências associadas', pl: 'Powiązane kompetencje' },
  'ref_select_skill': { fr: 'Choisir une compétence…', en: 'Select a skill…', de: 'Kompetenz wählen…', nl: 'Vaardigheid kiezen…', it: 'Seleziona competenza…', es: 'Elegir competencia…', pt: 'Escolher competência…', pl: 'Wybierz kompetencję…' },
  'ref_add_skill': { fr: 'Ajouter', en: 'Add', de: 'Hinzufügen', nl: 'Toevoegen', it: 'Aggiungi', es: 'Añadir', pt: 'Adicionar', pl: 'Dodaj' },
  'ref_no_skills_linked': { fr: 'Aucune compétence associée pour l\'instant.', en: 'No skills linked yet.', de: 'Noch keine Kompetenzen verknüpft.', nl: 'Nog geen vaardigheden gekoppeld.', it: 'Nessuna competenza collegata.', es: 'Sin competencias vinculadas.', pt: 'Sem competências associadas.', pl: 'Brak powiązanych kompetencji.' },
  'ref_add': { fr: 'Ajouter', en: 'Add', de: 'Neu', nl: 'Nieuw', it: 'Nuovo', es: 'Nuevo', pt: 'Novo', pl: 'Dodaj' },
  'ref_edit': { fr: 'Modifier', en: 'Edit', de: 'Bearbeiten', nl: 'Bewerken', it: 'Modifica', es: 'Editar', pt: 'Editar', pl: 'Edytuj' },
  'ref_cancel': { fr: 'Annuler', en: 'Cancel', de: 'Abbrechen', nl: 'Annuleren', it: 'Annulla', es: 'Cancelar', pt: 'Cancelar', pl: 'Anuluj' },
  'ref_empty': { fr: 'Aucun élément. Créez le premier ci-contre.', en: 'No items. Create the first one on the left.', de: 'Keine Einträge.', nl: 'Geen items.', it: 'Nessun elemento.', es: 'Sin elementos.', pt: 'Sem itens.', pl: 'Brak elementów.' },
  'ref_confirm_delete': { fr: 'Supprimer cet élément ?', en: 'Delete this item?', de: 'Eintrag löschen?', nl: 'Verwijderen?', it: 'Eliminare?', es: '¿Eliminar?', pt: 'Excluir?', pl: 'Usunąć?' },
  'ref_save_success': { fr: 'Enregistré avec succès.', en: 'Saved successfully.', de: 'Erfolgreich gespeichert.', nl: 'Opgeslagen.', it: 'Salvato.', es: 'Guardado.', pt: 'Salvo.', pl: 'Zapisano.' },
  'ref_save_error': { fr: 'Erreur lors de l\'enregistrement.', en: 'Save failed.', de: 'Speicherfehler.', nl: 'Opslaan mislukt.', it: 'Errore di salvataggio.', es: 'Error al guardar.', pt: 'Erro ao salvar.', pl: 'Błąd zapisu.' },
  'ref_delete_success': { fr: 'Supprimé avec succès.', en: 'Deleted successfully.', de: 'Gelöscht.', nl: 'Verwijderd.', it: 'Eliminato.', es: 'Eliminado.', pt: 'Excluído.', pl: 'Usunięto.' },
  'settings_skills_label': {
    fr: 'Dictionnaire global des Compétences',
    en: 'Global Skills Dictionary',
    de: 'Globales Kompetenzwörterbuch',
    nl: 'Wereldwijd Vaardighedenwoordenboek',
    it: 'Dizionario globale delle Competenze',
    es: 'Diccionario global de Competencias',
    pt: 'Dicionário global de Competências',
    pl: 'Globalny słownik kompetencji'
  },
  'settings_trainings_label': {
    fr: 'Thèmes de Formation répertoriés',
    en: 'Listed Training Themes',
    de: 'Gelistete Schulungsthemen',
    nl: 'Genoteerde Trainingsthema\'s',
    it: 'Temi di formazione elencati',
    es: 'Temas de capacitación listados',
    pt: 'Temas de treinamento listados',
    pl: 'Wymienione tematy szkoleń'
  },
  'settings_habilitations_label': {
    fr: 'Habilitations & Certifications reconnues',
    en: 'Recognized Authorizations & Certifications',
    de: 'Anerkannte Berechtigungen & Zertifikate',
    nl: 'Erkende Machtigingen & Certificeringen',
    it: 'Abilitazioni & Certificazioni riconosciute',
    es: 'Habilitaciones & Certificaciones reconocidas',
    pt: 'Habilitações & Certificações reconhecidas',
    pl: 'Uznane uprawnienia i certyfikaty'
  },

  // Sécurité
  'settings_security_title': {
    fr: '🛡️ Règles de Sécurité des Mots de Passe',
    en: '🛡️ Password Security Rules',
    de: '🛡️ Passwort-Sicherheitsregeln',
    nl: '🛡️ Wachtwoordbeveiligingsregels',
    it: '🛡️ Regole di Sicurezza delle Password',
    es: '🛡️ Reglas de Seguridad de Contaseñas',
    pt: '🛡️ Regras de Segurança de Senhas',
    pl: '🛡️ Zasady bezpieczeństwa haseł'
  },
  'settings_min_len_label': {
    fr: 'Longueur minimale requise pour le mot de passe',
    en: 'Minimum required password length',
    de: 'Mindestens erforderliche Passwortlänge',
    nl: 'Minimaal vereiste wachtwoordlengte',
    it: 'Lunghezza minima richiesta per la password',
    es: 'Longitud mínima requerida de la contraseña',
    pt: 'Comprimento mínimo exigido da senha',
    pl: 'Minimalna wymagana długość hasła'
  },
  'settings_min_len_warning': {
    fr: '⚠️ Attention ! Définir un mot de passe de moins de 8 caractères n\'est PAS une bonne pratique de sécurité ! Le mot de passe risque d\'être trop facile à pirater.',
    en: '⚠️ Warning! Setting a password of less than 8 characters is NOT a good security practice! It may be too easy to hack.',
    de: '⚠️ Warnung! Ein Passwort mit weniger als 8 Zeichen ist KEINE gute Sicherheitsmaßnahme! Es könnte zu leicht zu hacken sein.',
    nl: '⚠️ Waarschuwing! Een wachtwoord van minder dan 8 tekens is GEEN goede beveiligingspraktijk! Het kan te gemakkelijk te hacken zijn.',
    it: '⚠️ Attenzione! Impostare una password inferiore a 8 caratteri NON è una buona pratica di sicurezza! Potrebbe essere troppo facile da craccare.',
    es: '¡Atención! Configurar una contraseña de menos de 8 caracteres NO es una buena práctica de seguridad. Podría ser demasiado fácil de descifrar.',
    pt: 'Atenção! Definir uma senha com menos de 8 caracteres NÃO é uma boa prática de segurança! Pode ser fácil de hackear.',
    pl: '⚠️ Uwaga! Ustawienie hasła krótszego niż 8 znaków NIE jest dobrą praktyką bezpieczeństwa! Może być zbyt łatwe do złamania.'
  },
  'settings_expiry_label': {
    fr: 'Durée de vie des mots de passe en jours (Expiration forcée)',
    en: 'Password lifetime in days (Forced expiry)',
    de: 'Passwort-Lebensdauer in Tagen (Erzwungener Ablauf)',
    nl: 'Levensduur van wachtwoorden in dagen (Geforceerd verloop)',
    it: 'Durata della password in giorni (Scadenza forzata)',
    es: 'Duración de la contraseña en días (Vencimiento forzado)',
    pt: 'Validade da senha em dias (Expiração forçada)',
    pl: 'Okres ważności hasła w dniach (wymuszone wygaśnięcie)'
  },
  'settings_expiry_desc': {
    fr: 'Par défaut : 180 jours (6 mois). L\'utilisateur devra changer son mot de passe passé ce délai.',
    en: 'Default: 180 days (6 months). The user will have to change their password after this period.',
    de: 'Standard: 180 Tage (6 Monate). Der Benutzer muss sein Passwort nach diesem Zeitraum ändern.',
    nl: 'Standaard: 180 dagen (6 maanden). De gebruiker moet zijn wachtwoord na deze periode wijzigen.',
    it: 'Predefinito: 180 giorni (6 mesi). L\'utente dovrà cambiare la password dopo questo periodo.',
    es: 'Por defecto: 180 días (6 meses). El usuario deberá cambiar su contraseña después de este período.',
    pt: 'Padrão: 180 dias (6 meses). O usuário terá que alterar sua senha após esse período.',
    pl: 'Domyślnie: 180 dni (6 miesięcy). Po tym okresie użytkownik będzie musiał zmienić hasło.'
  },
  'settings_token_validity_label': {
    fr: 'Validité maximale du code secret d\'oubli de mot de passe (Minutes)',
    en: 'Maximum validity of the password recovery secret code (Minutes)',
    de: 'Maximale Gültigkeit des Passwort-Wiederherstellungs-Codes (Minuten)',
    nl: 'Maximale geldigheid van de geheime code voor wachtwoordherstel (Minuten)',
    it: 'Validità massima del codice di recupero della password (Minuti)',
    es: 'Validez máxima del código secreto de recuperación de contraseña (Minutos)',
    pt: 'Validade máxima do código de recuperação de senha (Minutos)',
    pl: 'Maksymalna ważność tajnego kodu odzyskiwania hasła (minuty)'
  },
  'settings_token_validity_desc': {
    fr: 'Par défaut : 15 minutes max. Passé ce délai, le jeton de sécurité envoyé s\'autodétruit.',
    en: 'Default: 15 mins max. Beyond this, the security token is self-destroyed.',
    de: 'Standard: max. 15 Minuten. Danach wird das Sicherheitstoken selbst zerstört.',
    nl: 'Standaard: max. 15 minuten. Danach wird das beveiligingstoken vernietigd.',
    it: 'Predefinito: 15 minuti max. Oltre questo tempo, il token di sicurezza si autodistrugge.',
    es: 'Por defecto: 15 minutos máx. Después de esto, el token de seguridad se autodestruye.',
    pt: 'Padrão: 15 minutos máx. Além disso, o token de segurança é autodestruído.',
    pl: 'Domyślnie: maks. 15 minut. Po tym czasie token bezpieczeństwa ulega samozniszczeniu.'
  },

  // Temps
  'settings_work_start': {
    fr: 'Début de journée',
    en: 'Start of Day',
    de: 'Tagesbeginn',
    nl: 'Begin van de dag',
    it: 'Inizio giornata',
    es: 'Inicio del día',
    pt: 'Início do dia',
    pl: 'Początek dnia'
  },
  'settings_work_end': {
    fr: 'Fin de journée',
    en: 'End of Day',
    de: 'Tagesende',
    nl: 'Einde van de dag',
    it: 'Fine giornata',
    es: 'Fin del día',
    pt: 'Fim do dia',
    pl: 'Koniec dnia'
  },
  'settings_wfh_exceptions_placeholder': {
    fr: 'Séparez les motifs par des virgules...',
    en: 'Separate reasons with commas...',
    de: 'Trennen Sie die Gründe mit Kommas...',
    nl: 'Scheid redenen met komma\'s...',
    it: 'Separa i motivi con virgole...',
    es: 'Separe los motivos con comas...',
    pt: 'Separe os motivos com vírgulas...',
    pl: 'Rozdziel powody przecinkami...'
  },

  // Société
  'col_contact': {
    fr: 'Contact',
    en: 'Contact',
    de: 'Kontakt',
    nl: 'Contact',
    it: 'Contatto',
    es: 'Contacto',
    pt: 'Contato',
    pl: 'Kontakt'
  },
  'fields_company_logo': {
    fr: 'Logo de la Société (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    en: 'Company Logo (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    de: 'Firmenlogo (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    nl: 'Bedrijfslogo (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    it: 'Logo Aziendale (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    es: 'Logo de la Empresa (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    pt: 'Logotipo da Empresa (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)',
    pl: 'Logo firmy (PNG, JPEG, SVG, GIF, WEBP, BMP, ICO)'
  },
  'btn_delete_logo': {
    fr: '❌ Supprimer',
    en: '❌ Delete',
    de: '❌ Löschen',
    nl: '❌ Verwijderen',
    it: '❌ Elimina',
    es: '❌ Eliminar',
    pt: '❌ Excluir',
    pl: '❌ Usuń'
  },
  'fields_company_logo_desc': {
    fr: 'Les formats réels supportés s\'affichent automatiquement.',
    en: 'Supported image formats are displayed automatically.',
    de: 'Unterstützte Bildformate werden automatisch angezeigt.',
    nl: 'Ondersteunde afbeeldingsformaten worden automatisch weergegeven.',
    it: 'I formati di immagine supportati vengono visualizzati automaticamente.',
    es: 'Los formatos de imagen compatibles se muestran automáticamente.',
    pt: 'Os formatos de imagem suportados são exibidos automaticamente.',
    pl: 'Obsługiwane formaty obrazów są wyświetlane automatycznie.'
  },

  // Utilisateurs
  'users_title': {
    fr: '👥 Comptes Utilisateurs',
    en: '👥 User Accounts',
    de: '👥 Benutzerkonten',
    nl: '👥 Gebruikersaccounts',
    it: '👥 Account Utente',
    es: '👥 Cuentas de Usuario',
    pt: '👥 Contas de Usuário',
    pl: '👥 Konta użytkowników'
  },
  'btn_add_user': {
    fr: '+ Ajouter Utilisateur',
    en: '+ Add User',
    de: '+ Benutzer hinzufügen',
    nl: '+ Gebruiker toevoegen',
    it: '+ Aggiungi Utente',
    es: '+ Agregar Usuario',
    pt: '+ Adicionar Usuário',
    pl: '+ Dodaj użytkownika'
  },
  'users_new_title': {
    fr: 'Nouveau compte',
    en: 'New Account',
    de: 'Neues Konto',
    nl: 'Nieuw account',
    it: 'Nuovo Account',
    es: 'Nueva Cuenta',
    pt: 'Nova Conta',
    pl: 'Nowe konto'
  },
  'users_edit_title': {
    fr: 'Modifier le compte',
    en: 'Edit Account',
    de: 'Konto bearbeiten',
    nl: 'Account bewerken',
    it: 'Modifica Account',
    es: 'Editar Cuenta',
    pt: 'Editar Conta',
    pl: 'Edytuj konto'
  },
  'col_status': {
    fr: 'Statut',
    en: 'Status',
    de: 'Status',
    nl: 'Status',
    it: 'Stato',
    es: 'Estado',
    pt: 'Status',
    pl: 'Status'
  },

  // Permissions Matrix
  'permissions_matrix_title': {
    fr: '🛡️ Matrice de Permissions & Rôles',
    en: '🛡️ Permissions & Roles Matrix',
    de: '🛡️ Berechtigungs- und Rollenmatrix',
    nl: '🛡️ Machtigings- en Rollenmatrix',
    it: '🛡️ Matrice dei Ruoli & Autorizzazioni',
    es: '🛡️ Matriz de Roles & Permisos',
    pt: '🛡️ Matriz de Funções & Permissões',
    pl: '🛡️ Macierz ról i uprawnień'
  },
  'permissions_matrix_desc': {
    fr: 'Configurez les habilitations dynamiques des rôles de l\'application en cochant les cases de la grille ci-dessous.',
    en: 'Configure dynamic permissions for application roles by checking the boxes in the grid below.',
    de: 'Konfigurieren Sie dynamische Berechtigungen für Anwendungsrollen, indem Sie die Kontrollkästchen im Raster unten aktivieren.',
    nl: 'Configureer dynamische machtigingen voor applicatierollen door de selectievakjes in het onderstaande raster in te schakelen.',
    it: 'Configura le autorizzazioni dinamiche per i ruoli dell\'applicazione spuntando le caselle nella griglia sottostante.',
    es: 'Configure los permisos dinámicos para los roles de la aplicación marcando las casillas en la cuadrícula de abajo.',
    pt: 'Configure as permissões dinâmicas para as funções do aplicativo marcando as caixas na grade abaixo.',
    pl: 'Skonfiguruj dynamiczne uprawnienia dla ról aplikacji, zaznaczając pola w poniższej siatce.'
  },

  // Dashboard Stats & Details
  'stat_employees': {
    fr: 'Collaborateurs',
    en: 'Employees',
    de: 'Mitarbeiter',
    nl: 'Medewerkers',
    it: 'Collaboratori',
    es: 'Colaboradores',
    pt: 'Colaboradores',
    pl: 'Współpracownicy'
  },
  'stat_onboarding': {
    fr: 'Onboarding',
    en: 'Onboarding',
    de: 'Onboarding',
    nl: 'Onboarding',
    it: 'Onboarding',
    es: 'Onboarding',
    pt: 'Integration',
    pl: 'Wdrożenie'
  },
  'desc_employees': {
    fr: 'Registre multi-société des fiches collaborateurs, des contrats et du suivi de carrière.',
    en: 'Multi-company registry of employee profiles, contracts and career path tracking.',
    de: 'Unternehmensübergreifendes Register von Mitarbeiterprofilen, Verträgen und Karriereverfolgung.',
    nl: 'Multi-bedrijf register van medewerkersprofielen, contracten en loopbaantracking.',
    it: 'Registro multiaziendale dei profili dei dipendenti, dei contratti e dello sviluppo di carriera.',
    es: 'Registro multiempresa de perfiles de empleados, contratos y trayectoria profesional.',
    pt: 'Registro multiempresa de perfis de funcionários, contratos e plano de carreira.',
    pl: 'Wielofirmowy rejestr profili pracowników, umów i ścieżek kariery.'
  },
  'stat_skills': {
    fr: 'Compétences',
    en: 'Skills',
    de: 'Kompetenzen',
    nl: 'Vaardigheden',
    it: 'Competenze',
    es: 'Competencias',
    pt: 'Competências',
    pl: 'Umiejętności'
  },
  'stat_polyvalence': {
    fr: 'Polyvalence',
    en: 'Versatility',
    de: 'Vielseitigkeit',
    nl: 'Veelzijdigheid',
    it: 'Polivalenza',
    es: 'Polivalencia',
    pt: 'Polivalência',
    pl: 'Wszechstronność'
  },
  'desc_skills': {
    fr: 'Évaluation des compétences de 1 à 5, tableau de polyvalence des ateliers et détection des besoins.',
    en: 'Skills evaluation from 1 to 5, workshop versatility matrix and needs detection.',
    de: 'Kompetenzbewertung von 1 bis 5, Matrix der Vielseitigkeit in Werkstätten und Bedarfserkennung.',
    nl: 'Vaardigheidsbeoordeling van 1 tot 5, matrix van veelzijdigheid in workshops en behoeftendetectie.',
    it: 'Valutazione delle competenze da 1 a 5, matrice di polivalenza del laboratorio e rilevamento dei bisogni.',
    es: 'Evaluación de competencias de 1 a 5, matriz de polivalencia del taller y detección de necesidades.',
    pt: 'Avaliação de competências de 1 a 5, matriz de polivalência da oficina e detecção de necessidades.',
    pl: 'Ocena umiejętności od 1 do 5, matryca wszechstronności warsztatowej i wykrywanie potrzeb.'
  },
  'stat_expirations': {
    fr: 'Expirations',
    en: 'Expirations',
    de: 'Abläufe',
    nl: 'Verlopen',
    it: 'Scadenze',
    es: 'Vencimientos',
    pt: 'Vencimentos',
    pl: 'Terminy ważności'
  },
  'stat_certified': {
    fr: 'Certifiés',
    en: 'Certified',
    de: 'Zertifiziert',
    nl: 'Gecertificeerd',
    it: 'Certificato',
    es: 'Certificado',
    pt: 'Certificado',
    pl: 'Certyfikowany'
  },
  'desc_habilitations': {
    fr: 'Suivi des habilitations techniques, recyclages périodiques et alertes critiques d\'expiration.',
    en: 'Tracking of technical authorizations, periodic updates and critical expiration alerts.',
    de: 'Verfolgung technischer Berechtigungen, periodischer Updates und kritischer Ablaufwarnungen.',
    nl: 'Opvolging van technische machtigingen, periodieke updates en kritieke verloopwaarschuwingen.',
    it: 'Tracciamento delle abilitazioni tecniche, aggiornamenti periodici e avvisi critici di scadenza.',
    es: 'Seguimiento de habilitaciones técnicas, actualizaciones periódicas y alertas críticas de vencimiento.',
    pt: 'Rastreamento de habilitações técnicas, atualizações periódicas e alertas críticos de expiração.',
    pl: 'Śledzenie uprawnień technicznych, okresowych aktualizacji i krytycznych ostrzeżeń o wygaśnięciu.'
  },
  'stat_budget': {
    fr: 'Budget consommé',
    en: 'Spent Budget',
    de: 'Genutztes Budget',
    nl: 'Besteed Budget',
    it: 'Budget Speso',
    es: 'Presupuesto Gastado',
    pt: 'Orçamento Gasto',
    pl: 'Wydatkowany budżet'
  },
  'stat_satisfaction': {
    fr: 'Satisfaction',
    en: 'Satisfaction',
    de: 'Zufriedenheit',
    nl: 'Tevredenheid',
    it: 'Soddisfazione',
    es: 'Satisfacción',
    pt: 'Satisfação',
    pl: 'Satysfakcja'
  },
  'desc_trainings': {
    fr: 'Plan annuel de formation, suivi des budgets filiales et évaluations à chaud et à froid.',
    en: 'Annual training plan, tracking of subsidiary budgets and hot & cold evaluations.',
    de: 'Jährlicher Schulungsplan, Verfolgung von Tochtergesellschaftsbudgets und Hot & Cold Bewertungen.',
    nl: 'Jaarlijks trainingsplan, opvolging van dochterondernemingsbudgetten en hot & cold evaluaties.',
    it: 'Piano annuale di formazione, tracciamento dei budget delle filiali e valutazioni immediate e successive.',
    es: 'Plan anual de capacitación, seguimiento de presupuestos de filiales y evaluaciones directas e indirectas.',
    pt: 'Plano anual de treinamento, acompanhamento de orçamentos de filiais e avaliações diretas e indiretas.',
    pl: 'Roczny plan szkoleń, śledzenie budżetów filii oraz oceny bezpośrednie i pośrednie.'
  },
  'employees_list_title': {
    fr: '📄 Liste des Collaborateurs & Habilitations',
    en: '📄 Employees & Authorizations List',
    de: '📄 Mitarbeiter- und Autorisierungsliste',
    nl: '📄 Lijst van Medewerkers & Machtigingen',
    it: '📄 Elenco dei Dipendenti & Autorizzazioni',
    es: '📄 Lista de Empleados & Habilitaciones',
    pt: '📄 Lista de Funcionários & Habilitações',
    pl: '📄 Lista pracowników i uprawnień'
  },
  'employees_list_subtitle': {
    fr: 'Recherche globale croisée multi-filiales.',
    en: 'Cross-subsidiary global search.',
    de: 'Umfassende unternehmensübergreifende Suche.',
    nl: 'Uitgebreid dochterondernemingsoverschrijdend zoeken.',
    it: 'Ricerca globale incrociata tra filiali.',
    es: 'Búsqueda global cruzada entre filiales.',
    pt: 'Busca global cruzada entre filiais.',
    pl: 'Globalne wyszukiwanie między filiami.'
  },
  'search_placeholder': {
    fr: 'Rechercher nom, poste, compétence...',
    en: 'Search name, job, skill...',
    de: 'Suchen Sie nach Name, Job, Kompetenz...',
    nl: 'Zoek op naam, job, vaardigheid...',
    it: 'Cerca nome, posizione, competenza...',
    es: 'Buscar nombre, puesto, competencia...',
    pt: 'Buscar nome, cargo, competência...',
    pl: 'Szukaj nazwiska, stanowiska, umiejętności...'
  },
  'col_employee_name': {
    fr: 'Nom Collaborateur',
    en: 'Employee Name',
    de: 'Mitarbeitername',
    nl: 'Naam medewerker',
    it: 'Nome Dipendente',
    es: 'Nombre del Empleado',
    pt: 'Nome do Funcionário',
    pl: 'Nazwisko pracownika'
  },
  'col_job_title': {
    fr: 'Poste',
    en: 'Job Position',
    de: 'Stelle',
    nl: 'Functie',
    it: 'Posizione',
    es: 'Puesto de trabajo',
    pt: 'Cargo',
    pl: 'Stanowisko'
  },
  'col_key_skill': {
    fr: 'Compétence Clé',
    en: 'Key Skill',
    de: 'Schlüsselkompetenz',
    nl: 'Belangrijkste vaardigheid',
    it: 'Competenza Chiave',
    es: 'Competencia Clave',
    pt: 'Competência-Chave',
    pl: 'Kluczowa umiejętność'
  },
  'col_hab_exp': {
    fr: 'Exp. Habilitation',
    en: 'Auth. Expiry',
    de: 'Autorisierungsablauf',
    nl: 'Vervaldatum machtiging',
    it: 'Scadenza Autorizzazione',
    es: 'Vencimiento de Habilitación',
    pt: 'Vencimento de Habilitação',
    pl: 'Wygaśnięcie uprawnienia'
  }
};
