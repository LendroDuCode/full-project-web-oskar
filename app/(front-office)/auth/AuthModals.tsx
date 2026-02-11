"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import LoginModal from "./login/page";
import RegisterModal from "./register/page";
import CreateBoutiqueModal from "@/app/(back-office)/dashboard-vendeur/boutique/apercu/components/modals/CreateBoutiqueModal";
import { API_ENDPOINTS } from "@/config/api-endpoints";

const AuthModals = () => {
  const {
    showLoginModal,
    showRegisterModal,
    closeModals,
    switchToRegister,
    switchToLogin,
    login,
  } = useAuth();

  // AJOUT: États pour gérer la création de boutique
  const [showBoutiqueCreation, setShowBoutiqueCreation] = useState(false);
  const [newVendeurData, setNewVendeurData] = useState<any>(null);
  const [loadingBoutique, setLoadingBoutique] = useState(false);

  const handleLoginSuccess = (userData: any) => {
    // ... votre logique de connexion existante ...
  };

  const handleRegisterSuccess = (userData: any) => {
    // Fermer le modal d'inscription
    closeModals();

    // Si c'est un vendeur, sauvegarder les données
    if (userData.type === "vendeur") {
      setNewVendeurData(userData);
      // Le modal de proposition de création s'ouvrira automatiquement
    } else {
      // Pour les utilisateurs normaux, rediriger vers login
      setTimeout(() => {
        switchToLogin();
      }, 300);
    }
  };

  // AJOUT: Callback pour la création de boutique
  const handleCreateBoutique = async (boutiqueData: any) => {
    setLoadingBoutique(true);
    try {
      // Utiliser le token du vendeur
      const token = newVendeurData?.token || localStorage.getItem("token");

      // Appeler l'API pour créer la boutique
      const response = await fetch(API_ENDPOINTS.BOUTIQUES.CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...boutiqueData,
          vendeur_uuid: newVendeurData?.vendeurId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Fermer le modal de création
        setShowBoutiqueCreation(false);

        // Connecter l'utilisateur
        if (newVendeurData) {
          login(
            newVendeurData.userData || newVendeurData,
            newVendeurData.token,
          );
        }

        // Optionnel: Rediriger vers le dashboard vendeur
        setTimeout(() => {
          window.location.href = "/vendeur/dashboard";
        }, 1000);
      } else {
        console.error("Erreur création boutique");
        // Connecter quand même l'utilisateur
        if (newVendeurData) {
          login(
            newVendeurData.userData || newVendeurData,
            newVendeurData.token,
          );
        }
        setShowBoutiqueCreation(false);
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Connecter quand même l'utilisateur
      if (newVendeurData) {
        login(newVendeurData.userData || newVendeurData, newVendeurData.token);
      }
      setShowBoutiqueCreation(false);
    } finally {
      setLoadingBoutique(false);
    }
  };

  // AJOUT: Fonction appelée quand l'utilisateur veut créer une boutique
  const handleStartBoutiqueCreation = (vendeurData: any) => {
    setShowBoutiqueCreation(true);
    setNewVendeurData(vendeurData);
  };

  // AJOUT: Fermer le modal de création de boutique
  const handleCloseBoutiqueModal = () => {
    setShowBoutiqueCreation(false);
    // Connecter l'utilisateur même sans boutique
    if (newVendeurData) {
      login(newVendeurData.userData || newVendeurData, newVendeurData.token);
    }
  };

  return (
    <>
      <LoginModal
        visible={showLoginModal}
        onHide={closeModals}
        onSwitchToRegister={switchToRegister}
        onLoginSuccess={handleLoginSuccess}
      />

      <RegisterModal
        visible={showRegisterModal}
        onHide={closeModals}
        onSwitchToLogin={switchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
        onCreateBoutique={handleStartBoutiqueCreation}
      />

      {/* MODAL DE CRÉATION DE BOUTIQUE */}
      {showBoutiqueCreation && (
        <CreateBoutiqueModal
          show={showBoutiqueCreation}
          loading={loadingBoutique}
          onClose={handleCloseBoutiqueModal}
          onCreate={handleCreateBoutique}
        />
      )}
    </>
  );
};

export default AuthModals;
