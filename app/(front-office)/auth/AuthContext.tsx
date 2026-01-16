"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User, shouldRedirect?: boolean) => void; // Ajout d'un paramètre optionnel
  logout: () => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModals: () => void;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  switchToRegister: () => void;
  switchToLogin: () => void;
  redirectToDashboard: (userType?: string) => void; // Nouvelle fonction exportée
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
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const savedUser = localStorage.getItem("oskar_user");
    const savedToken = localStorage.getItem("oskar_token");

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);

        // ⚠️ NE PAS REDIRIGER AUTOMATIQUEMENT !
        // L'utilisateur reste sur la page où il se trouve

        console.log(
          "AuthContext - Utilisateur connecté détecté mais pas de redirection automatique",
        );
      } catch (error) {
        console.error("Erreur lors du parsing de l'utilisateur:", error);
        localStorage.removeItem("oskar_user");
        localStorage.removeItem("oskar_token");
      }
    }
  }, []);

  // Fonction pour rediriger vers le dashboard (maintenant exportée)
  const redirectToDashboard = (userType?: string) => {
    const typeToUse = userType || user?.type;

    if (!typeToUse) {
      console.log(
        "AuthContext - Type utilisateur non spécifié pour la redirection",
      );
      return;
    }

    console.log(
      `AuthContext - Redirection vers dashboard pour type: ${typeToUse}`,
    );

    switch (typeToUse.toLowerCase()) {
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
        console.log(`AuthContext - Type inconnu: ${typeToUse}`);
    }
  };

  // Fonction login modifiée avec paramètre optionnel
  const login = (userData: User, shouldRedirect: boolean = false) => {
    setUser(userData);
    setIsLoggedIn(true);

    // Sauvegarder dans localStorage
    localStorage.setItem("oskar_user", JSON.stringify(userData));
    if (userData.temp_token) {
      localStorage.setItem("oskar_token", userData.temp_token);
    }

    console.log("AuthContext - Connexion réussie");

    // Rediriger vers le dashboard SEULEMENT si demandé
    if (shouldRedirect) {
      console.log("AuthContext - Redirection après login demandée");
      redirectToDashboard(userData.type);
    } else {
      console.log("AuthContext - Pas de redirection après login");
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);

    // Supprimer de localStorage
    localStorage.removeItem("oskar_user");
    localStorage.removeItem("oskar_token");
    localStorage.removeItem("oskar_remember_email");

    // Supprimer les cookies aussi
    document.cookie = "oskar_user=; path=/; max-age=0";
    document.cookie = "oskar_token=; path=/; max-age=0";

    console.log("AuthContext - Déconnexion effectuée");

    // Rediriger vers la page d'accueil
    router.push("/");
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
        redirectToDashboard, // Exporté pour pouvoir l'utiliser manuellement
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
