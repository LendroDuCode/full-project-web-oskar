// hooks/useAnalytics.ts
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { sendPageView, sendEvent } from '@/lib/gtag';  // ✅ Correction: sendPageView au lieu de sendGAPageView

export const useAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    sendPageView(url, document.title);
  }, [pathname, searchParams]);

  // Fonctions utilitaires pour les événements
  const trackEvent = (action: string, params?: Record<string, any>) => {
    sendEvent(action, params);
  };

  const trackAnnonceView = (type: string, id: string, category?: string) => {
    sendEvent('view_annonce', {
      event_category: 'annonces',
      event_label: type,
      annonce_id: id,
      annonce_type: type,
      annonce_category: category,
    });
  };

  const trackAnnonceCreation = (type: string, withAI: boolean) => {
    sendEvent('create_annonce', {
      event_category: 'annonces',
      event_label: type,
      annonce_type: type,
      ai_moderation: withAI,
    });
  };

  const trackAddToFavorites = (type: string, id: string) => {
    sendEvent('add_to_favorites', {
      event_category: 'engagement',
      event_label: type,
      annonce_id: id,
      annonce_type: type,
    });
  };

  const trackContact = (type: string, method: 'whatsapp' | 'message' | 'phone') => {
    sendEvent('contact_vendeur', {
      event_category: 'interaction',
      event_label: type,
      contact_method: method,
    });
  };

  const trackSearch = (query: string, resultsCount: number) => {
    sendEvent('search', {
      event_category: 'recherche',
      event_label: query,
      search_query: query,
      search_results: resultsCount,
    });
  };

  const trackLogin = (method: 'email' | 'google' | 'facebook', userType: string) => {
    sendEvent('login', {
      event_category: 'authentication',
      event_label: method,
      login_method: method,
      user_type: userType,
    });
  };

  const trackRegister = (userType: string, method: 'email' | 'google' | 'facebook') => {
    sendEvent('register', {
      event_category: 'authentication',
      event_label: method,
      user_type: userType,
      registration_method: method,
    });
  };

  const trackLogout = () => {
    sendEvent('logout', {
      event_category: 'authentication',
    });
  };

  const trackError = (errorType: string, errorMessage: string, component?: string) => {
    sendEvent('error', {
      event_category: 'errors',
      event_label: errorType,
      error_type: errorType,
      error_message: errorMessage,
      component: component,
    });
  };

  return {
    trackEvent,
    trackAnnonceView,
    trackAnnonceCreation,
    trackAddToFavorites,
    trackContact,
    trackSearch,
    trackLogin,
    trackRegister,
    trackLogout,
    trackError,
  };
};