import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  hu: {
    // Navigation
    nav_overview: 'Áttekintés',
    nav_scripts: 'Script Generátor',
    nav_hooks: 'Hook Könyvtár',
    nav_videos: 'Videó Gyár',
    nav_analytics: 'Analitika',
    nav_settings: 'Beállítások',
    nav_logout: 'Kijelentkezés',
    
    // Auth
    login_title: 'Bejelentkezés',
    register_title: 'Regisztráció',
    email: 'E-mail',
    password: 'Jelszó',
    name: 'Név',
    login_button: 'Bejelentkezés',
    register_button: 'Regisztráció',
    
    // Dashboard
    welcome: 'Üdvözöl',
    total_scripts: 'Összes Script',
    total_hooks: 'Összes Hook',
    avg_retention: 'Átlag Retention',
    
    // Script Generator
    topic: 'Téma',
    keywords: 'Kulcsszavak',
    generate: 'Generálás',
    script: 'Script',
    hook: 'Hook',
    character_count: 'Karakterszám',
    copy: 'Másolás',
    
    // Video Factory
    generate_video: 'Videó Generálás',
    select_script: 'Script Kiválasztása',
    voice_settings: 'Hang Beállítások',
    background_music: 'Háttérzene',
    b_roll_search: 'B-roll Keresés',
    
    // Common
    save: 'Mentés',
    cancel: 'Mégse',
    delete: 'Törlés',
    edit: 'Szerkesztés',
    close: 'Bezárás',
    loading: 'Betöltés...',
    error: 'Hiba',
    success: 'Siker'
  },
  de: {
    nav_overview: 'Übersicht',
    nav_scripts: 'Skript-Generator',
    nav_hooks: 'Hook-Bibliothek',
    nav_videos: 'Video-Fabrik',
    nav_analytics: 'Analytik',
    nav_settings: 'Einstellungen',
    nav_logout: 'Abmelden',
    
    login_title: 'Anmelden',
    register_title: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    name: 'Name',
    login_button: 'Anmelden',
    register_button: 'Registrieren',
    
    topic: 'Thema',
    keywords: 'Schlüsselwörter',
    generate: 'Generieren',
    script: 'Skript',
    hook: 'Hook',
    character_count: 'Zeichenzahl'
  },
  en: {
    nav_overview: 'Overview',
    nav_scripts: 'Script Generator',
    nav_hooks: 'Hook Library',
    nav_videos: 'Video Factory',
    nav_analytics: 'Analytics',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    
    login_title: 'Login',
    register_title: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    login_button: 'Login',
    register_button: 'Register',
    
    topic: 'Topic',
    keywords: 'Keywords',
    generate: 'Generate',
    script: 'Script',
    hook: 'Hook',
    character_count: 'Character Count'
  },
  pl: {
    nav_overview: 'Przegląd',
    nav_scripts: 'Generator Skryptów',
    nav_hooks: 'Biblioteka Hooków',
    nav_videos: 'Fabryka Wideo',
    nav_analytics: 'Analityka',
    nav_settings: 'Ustawienia',
    nav_logout: 'Wyloguj'
  },
  nl: {
    nav_overview: 'Overzicht',
    nav_scripts: 'Script Generator',
    nav_hooks: 'Hook Bibliotheek',
    nav_videos: 'Video Fabriek',
    nav_analytics: 'Analytics',
    nav_settings: 'Instellingen',
    nav_logout: 'Uitloggen'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'hu'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['hu'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};