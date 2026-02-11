"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  logout: () => void;
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
  const router = useRouter();

  // Fonction pour initialiser l'authentification
  const initializeAuth = useCallback(() => {
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
                logout();
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
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      console.log("ℹ️ AuthContext - No saved auth found");
      setUser(null);
      setIsLoggedIn(false);
    }

    // Forcer un re-render
    setAuthVersion((prev) => prev + 1);
  }, []);

  // Écouter les changements de localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "oskar_user" || e.key === "oskar_token") {
        console.log("🔄 AuthContext - Storage changed, reinitializing auth");
        initializeAuth();
      }
    };

    // Écouter les événements de localStorage
    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés
    const handleAuthChange = () => {
      console.log("🔄 AuthContext - Custom auth change event received");
      initializeAuth();
    };

    window.addEventListener(
      "auth-change-event",
      handleAuthChange as EventListener,
    );

    // Initialiser au montage
    initializeAuth();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "auth-change-event",
        handleAuthChange as EventListener,
      );
    };
  }, [initializeAuth]);

  // Fonction pour rediriger vers le dashboard
  const redirectToDashboard = (userType?: string) => {
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
    console.log("🔄 AuthContext - Manual refresh triggered");
    initializeAuth();

    // Émettre un événement pour notifier les autres composants
    const event = new CustomEvent("auth-state-changed", {
      detail: { isLoggedIn, user },
    });
    window.dispatchEvent(event);
  };

  // Émettre un événement de changement d'authentification
  const emitAuthChangeEvent = (isLoggedIn: boolean, user: User | null) => {
    const event = new CustomEvent("auth-state-changed", {
      detail: { isLoggedIn, user },
    });
    window.dispatchEvent(event);
  };

  // Fonction login
  const login = (
    userData: any,
    token: string,
    shouldRedirect: boolean = false,
  ) => {
    console.log("✅ AuthContext - Login function called");

    // Sauvegarder les données
    localStorage.setItem("oskar_user", JSON.stringify(userData));
    localStorage.setItem("oskar_token", token);
    localStorage.setItem("oskar_user_type", userData.type);

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

  const logout = () => {
    console.log("🔴 AuthContext - Logging out...");

    // Nettoyer le localStorage
    localStorage.removeItem("oskar_user");
    localStorage.removeItem("oskar_token");
    localStorage.removeItem("oskar_user_type");
    localStorage.removeItem("oskar_remember_email");

    // Nettoyer les cookies
    document.cookie = "oskar_token=; path=/; max-age=0";
    document.cookie = "access_token=; path=/; max-age=0";

    // Mettre à jour le state
    setUser(null);
    setIsLoggedIn(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);

    // Émettre l'événement
    emitAuthChangeEvent(false, null);

    // Forcer un re-render
    setAuthVersion((prev) => prev + 1);

    console.log("✅ AuthContext - Logout successful");

    // Rediriger vers l'accueil
    setTimeout(() => router.push("/"), 100);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const validateToken = async (): Promise<boolean> => {
    const token = localStorage.getItem("oskar_token");
    if (!token) return false;

    try {
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000;
        return Date.now() < exp;
      }
      return true;
    } catch (error) {
      console.error("❌ AuthContext - Token validation error:", error);
      return false;
    }
  };

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
