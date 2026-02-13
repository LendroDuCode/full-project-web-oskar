"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  uuid: string;
  firstName?: string;
  lastName?: string;
  nom_complet?: string;
  email: string;
  type: string;
  role: string;
  temp_token?: string;
  tempToken?: string;
  est_bloque?: boolean;
  is_deleted?: boolean;
  avatar?: string;
  civilite?: string;
  telephone?: string;
  nom?: string;
  prenoms?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: any, token: string, shouldRedirect?: boolean) => void;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  switchToRegister: () => void;
  switchToLogin: () => void;
  redirectToDashboard: (userType?: string) => void;
  validateToken: () => Promise<boolean>;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Référence pour éviter les appels multiples
  const initialCheckDone = useRef(false);
  const logoutInProgress = useRef(false);

  // Fonction pour initialiser l'authentification
  const initializeAuth = useCallback(() => {
    if (logoutInProgress.current) {
      console.log(
        "🔄 AuthContext - Logout in progress, skipping initialization",
      );
      return;
    }

    console.log("🔄 AuthContext - Initializing auth state...");

    const savedUser = localStorage.getItem("oskar_user");
    const savedToken = localStorage.getItem("oskar_token");

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("✅ AuthContext - Found saved user:", parsedUser.type);

        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log("✅ AuthContext - User set from localStorage");

        // Valider le token
        const validateToken = async () => {
          try {
            const tokenParts = savedToken.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const exp = payload.exp * 1000;
              if (Date.now() >= exp) {
                console.warn("⚠️ AuthContext - Token expiré");
                await handleLogout(false);
                return false;
              }
            }
            return true;
          } catch (error) {
            console.error("❌ AuthContext - Erreur validation token:", error);
            return false;
          }
        };

        validateToken();
      } catch (error) {
        console.error("❌ AuthContext - Erreur parsing utilisateur:", error);
        localStorage.removeItem("oskar_user");
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user_type");
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      console.log("ℹ️ AuthContext - No saved auth found");
      setUser(null);
      setIsLoggedIn(false);
    }

    setIsInitialized(true);
    initialCheckDone.current = true;
    setAuthVersion((prev) => prev + 1);
  }, []);

  // Fonction de déconnexion interne
  const handleLogout = async (shouldRedirect: boolean = true) => {
    if (logoutInProgress.current) {
      console.log("🔄 AuthContext - Logout already in progress");
      return;
    }

    logoutInProgress.current = true;
    console.log("🔴 AuthContext - Starting logout process...");

    try {
      // Nettoyer le localStorage
      localStorage.removeItem("oskar_user");
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("oskar_user_type");
      localStorage.removeItem("oskar_remember_email");
      localStorage.removeItem("oskar_role");

      // Nettoyer les cookies
      document.cookie = "oskar_token=; path=/; max-age=0";
      document.cookie = "access_token=; path=/; max-age=0";

      // Mettre à jour le state
      setUser(null);
      setIsLoggedIn(false);
      setShowLoginModal(false);
      setShowRegisterModal(false);

      // Émettre l'événement de déconnexion
      const logoutEvent = new CustomEvent("oskar-logout", {
        detail: { timestamp: Date.now() },
      });
      window.dispatchEvent(logoutEvent);

      // Émettre l'événement de changement
      emitAuthChangeEvent(false, null);

      // Forcer un re-render
      setAuthVersion((prev) => prev + 1);

      console.log("✅ AuthContext - Logout successful");

      // Rediriger vers l'accueil
      if (shouldRedirect) {
        // Vérifier si on est déjà sur la page d'accueil
        const currentPath = window.location.pathname;
        if (currentPath !== "/") {
          router.push("/");
        } else {
          // Forcer un rechargement de la page d'accueil
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("❌ AuthContext - Error during logout:", error);
    } finally {
      logoutInProgress.current = false;
    }
  };

  // Écouter les changements de localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "oskar_user" || e.key === "oskar_token") {
        console.log("🔄 AuthContext - Storage changed, reinitializing auth");
        initializeAuth();
      }
    };

    // Écouter l'événement de déconnexion personnalisé
    const handleLogoutEvent = () => {
      console.log("🔄 AuthContext - Logout event received");
      handleLogout(false);
    };

    // Écouter les événements de localStorage
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés
    window.addEventListener("oskar-logout", handleLogoutEvent as EventListener);
    window.addEventListener(
      "auth-change-event",
      handleAuthChange as EventListener,
    );

    // Initialiser au montage (une seule fois)
    if (!initialCheckDone.current) {
      initializeAuth();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "oskar-logout",
        handleLogoutEvent as EventListener,
      );
      window.removeEventListener(
        "auth-change-event",
        handleAuthChange as EventListener,
      );
    };
  }, [initializeAuth]);

  // Fonction pour rediriger vers le dashboard
  const redirectToDashboard = (userType?: string) => {
    if (logoutInProgress.current) {
      console.log("🔄 AuthContext - Logout in progress, skipping redirect");
      return;
    }

    const typeToUse = userType?.toLowerCase() || user?.type?.toLowerCase();

    if (!typeToUse) {
      console.log("❌ AuthContext - Type utilisateur non spécifié");
      return;
    }

    console.log(`📍 AuthContext - Redirecting to dashboard for: ${typeToUse}`);

    switch (typeToUse) {
      case "admin":
        router.push("/dashboard-admin");
        break;
      case "agent":
        router.push("/dashboard-agent");
        break;
      case "vendeur":
        router.push("/dashboard-vendeur");
        break;
      case "utilisateur":
        router.push("/dashboard-utilisateur");
        break;
      default:
        router.push("/");
    }
  };

  // Fonction pour forcer la mise à jour
  const refreshAuthState = () => {
    if (logoutInProgress.current) return;

    console.log("🔄 AuthContext - Manual refresh triggered");
    initializeAuth();

    // Émettre un événement pour notifier les autres composants
    emitAuthChangeEvent(isLoggedIn, user);
  };

  // Émettre un événement de changement d'authentification
  const emitAuthChangeEvent = (loggedIn: boolean, userData: User | null) => {
    const event = new CustomEvent("auth-state-changed", {
      detail: { isLoggedIn: loggedIn, user: userData },
    });
    window.dispatchEvent(event);
  };

  // Gestionnaire pour les événements de changement d'authentification
  const handleAuthChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log(
      "🔄 AuthContext - Auth change event received:",
      customEvent.detail,
    );

    if (customEvent.detail?.isLoggedIn === false) {
      handleLogout(false);
    }
  };

  // Fonction login
  const login = (
    userData: any,
    token: string,
    shouldRedirect: boolean = false,
  ) => {
    if (logoutInProgress.current) {
      console.log("🔄 AuthContext - Logout in progress, cannot login");
      return;
    }

    console.log("✅ AuthContext - Login function called");

    // Sauvegarder les données
    localStorage.setItem("oskar_user", JSON.stringify(userData));
    localStorage.setItem("oskar_token", token);
    localStorage.setItem("oskar_user_type", userData.type);
    if (userData.role) {
      localStorage.setItem("oskar_role", userData.role);
    }

    // Mettre à jour le state IMMÉDIATEMENT
    setUser(userData);
    setIsLoggedIn(true);

    // Émettre l'événement
    emitAuthChangeEvent(true, userData);

    // Forcer un re-render
    setAuthVersion((prev) => prev + 1);

    console.log("✅ AuthContext - Login successful:", {
      type: userData.type,
      email: userData.email,
      isLoggedIn: true,
    });

    // Fermer les modals
    closeModals();

    // Rediriger si demandé
    if (shouldRedirect) {
      setTimeout(() => redirectToDashboard(userData.type), 100);
    }
  };

  // Fonction logout publique
  const logout = async () => {
    await handleLogout(true);
  };

  const openLoginModal = () => {
    if (logoutInProgress.current) return;
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const openRegisterModal = () => {
    if (logoutInProgress.current) return;
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const switchToRegister = () => {
    if (logoutInProgress.current) return;
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    if (logoutInProgress.current) return;
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const validateToken = async (): Promise<boolean> => {
    if (logoutInProgress.current) return false;

    const token = localStorage.getItem("oskar_token");
    if (!token) return false;

    try {
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000;
        const isValid = Date.now() < exp;

        if (!isValid) {
          console.warn("⚠️ AuthContext - Token expiré");
          await handleLogout(false);
        }

        return isValid;
      }
      return true;
    } catch (error) {
      console.error("❌ AuthContext - Token validation error:", error);
      return false;
    }
  };

  // Ne pas afficher les enfants tant que l'initialisation n'est pas terminée
  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Initialisation de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        openLoginModal,
        openRegisterModal,
        closeModals,
        showLoginModal,
        showRegisterModal,
        switchToRegister,
        switchToLogin,
        redirectToDashboard,
        validateToken,
        refreshAuthState,
      }}
      key={`auth-provider-${authVersion}`}
    >
      {children}
    </AuthContext.Provider>
  );
};
