// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Déclaration pour TypeScript - Ajouter seulement ce qui n'existe pas
// declare global {
//   interface Window {
//     gtag?: (...args: any[]) => void;
//   }
// }

// Vérifier si on est en mode développement
const isDev = process.env.NODE_ENV === 'development';

// Initialisation de Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID) {
    if (isDev) console.warn('⚠️ Google Analytics: ID de mesure manquant');
    return;
  }

  // Vérifier si gtag existe déjà
  if (typeof window.gtag !== 'undefined') {
    if (isDev) console.log('✅ Google Analytics déjà initialisé');
    return;
  }

  // Initialiser dataLayer
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  // Définir la fonction gtag
  window.gtag = function(...args: any[]) {
    if (window.dataLayer) {
      window.dataLayer.push(args);
    }
  };
  
  // Envoyer la première vue de page
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: true,
    debug_mode: isDev,
  });

  if (isDev) {
    console.log(`✅ Google Analytics initialisé avec ID: ${GA_MEASUREMENT_ID}`);
  }

  // Charger le script GA
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

// Envoyer un événement personnalisé
export const sendEvent = (
  action: string,
  params?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;
  if (!window.gtag) {
    if (isDev) console.warn('⚠️ Google Analytics non initialisé');
    return;
  }
  if (!GA_MEASUREMENT_ID) return;

  if (isDev) {
    console.log(`📊 GA Event: ${action}`, params);
  }

  window.gtag('event', action, params);
};

// Envoyer une vue de page manuelle
export const sendPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  if (!GA_MEASUREMENT_ID) return;

  if (isDev) {
    console.log(`📄 GA Page View: ${path} - ${title || ''}`);
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Définir l'utilisateur
export const setGAUser = (params: {
  user_id?: string;
  user_type?: string;
  user_email?: string;
}) => {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  if (!GA_MEASUREMENT_ID) return;

  if (params.user_id) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: params.user_id,
    });
  }

  if (params.user_type) {
    window.gtag('set', 'user_properties', {
      user_type: params.user_type,
      user_email: params.user_email,
    });
  }

  if (isDev) {
    console.log(`👤 GA User set:`, params);
  }
};

// Alias pour compatibilité avec vos autres fichiers
export const sendGAEvent = sendEvent;
export const sendGAPageView = sendPageView;