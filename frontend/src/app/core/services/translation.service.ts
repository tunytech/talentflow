import { Injectable, signal, effect } from '@angular/core';
import { TRANSLATIONS } from './translations.db';

// Les types de langues que notre robot traducteur est capable de comprendre.
// Nous y avons ajouté de nouveaux super-pouvoirs : l'Italien ('it'), l'Espagnol ('es'),
// le Portugais ('pt') et le Polonais ('pl') pour conquérir le monde du business !
export type SupportedLanguage = 'fr' | 'en' | 'de' | 'nl' | 'it' | 'es' | 'pt' | 'pl';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // La liste des drapeaux magiques et des langues que l'utilisateur peut choisir.
  // Grâce à ces émojis drapeaux, l'interface utilisateur devient magnifique et très parlante !
  // La liste des langues prises en charge avec leur étiquette propre et l'URL de leur drapeau national en haute définition.
  // Grâce à flagcdn.com (un hébergeur d'images de drapeaux ultra-rapide), les drapeaux s'affichent
  // magnifiquement sous forme d'images, même sur les ordinateurs Windows qui ne savent pas dessiner les émojis drapeaux !
  public readonly languages = [
    { code: 'fr', name: '🇫🇷 Français', flagUrl: 'https://flagcdn.com/w40/fr.png' },
    { code: 'en', name: '🇬🇧 English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
    { code: 'de', name: '🇩🇪 Deutsch', flagUrl: 'https://flagcdn.com/w40/de.png' },
    { code: 'nl', name: '🇳🇱 Nederlands', flagUrl: 'https://flagcdn.com/w40/nl.png' },
    { code: 'it', name: '🇮🇹 Italiano', flagUrl: 'https://flagcdn.com/w40/it.png' },
    { code: 'es', name: '🇪🇸 Español', flagUrl: 'https://flagcdn.com/w40/es.png' },
    { code: 'pt', name: '🇵🇹 Português', flagUrl: 'https://flagcdn.com/w40/pt.png' },
    { code: 'pl', name: '🇵🇱 Polski', flagUrl: 'https://flagcdn.com/w40/pl.png' }
  ];

  // Le signal secret qui retient quelle langue est active en ce moment.
  private readonly activeLanguage = signal<SupportedLanguage>(this.getInitialLanguage());

  // Une version de sécurité du signal pour que personne ne puisse le modifier sans permission.
  public readonly currentLanguage = this.activeLanguage.asReadonly();

  constructor() {
    // Chaque fois que l'utilisateur change de langue, on s'en souvient dans la mémoire du navigateur !
    effect(() => {
      localStorage.setItem('talentflow-lang', this.activeLanguage());
    });
  }

  // Cette boîte à outils va lire dans la mémoire du navigateur si une langue a déjà été choisie,
  // sinon elle choisit le Français par défaut.
  private getInitialLanguage(): SupportedLanguage {
    const saved = localStorage.getItem('talentflow-lang') as SupportedLanguage;
    if (saved && ['fr', 'en', 'de', 'nl', 'it', 'es', 'pt', 'pl'].includes(saved)) {
      return saved;
    }
    return 'fr'; // Par défaut, on parle Français !
  }

  // Cette méthode permet de changer la langue active en un instant.
  public setLanguage(lang: SupportedLanguage): void {
    this.activeLanguage.set(lang);
  }

  /**
   * Translates a given key based on the active language.
   * If the key is not found, returns the key itself.
   */
  public translate(key: string): string {
    const entry = TRANSLATIONS[key];
    if (entry) {
      const activeLang = this.activeLanguage();
      return entry[activeLang] || entry['fr'] || key;
    }
    return key;
  }
}
