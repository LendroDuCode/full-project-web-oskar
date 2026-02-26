"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import LoginModal from "./login/page";
import RegisterModal from "./register/page";
import CreateBoutiqueModal from "@/app/(back-office)/dashboard-vendeur/boutique/apercu/components/modals/CreateBoutiqueModal";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowRight,
  faPlus,
  faStore,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const AuthModals = () => {
  const {
    showLoginModal,
    showRegisterModal,
    closeModals,
    switchToRegister,
    switchToLogin,
    login,
    openLoginModal,
  } = useAuth();

  // États pour gérer la création de boutique APRÈS connexion
  const [showBoutiquePrompt, setShowBoutiquePrompt] = useState(false);
  const [showBoutiqueCreation, setShowBoutiqueCreation] = useState(false);
  const [vendeurData, setVendeurData] = useState<any>(null);
  const [loadingBoutique, setLoadingBoutique] = useState(false);
  const [boutiqueError, setBoutiqueError] = useState<string | null>(null);

  const handleLoginSuccess = (userData: any) => {
    console.log("✅ Login success - userData:", userData);

    // Connexion réussie - Vérifier si c'est un vendeur
    if (userData.type === "vendeur") {
      console.log("👤 Vendeur connecté, préparation du prompt boutique");

      // Stocker les données du vendeur
      setVendeurData(userData);

      // Fermer le modal de connexion
      closeModals();

      // Ouvrir le prompt de proposition de boutique APRÈS UN COURT DÉLAI
      setTimeout(() => {
        console.log("🔄 Ouverture du prompt de création de boutique");
        setShowBoutiquePrompt(true);
      }, 500);
    } else {
      // Pour les utilisateurs normaux, connexion directe
      console.log("👤 Utilisateur normal connecté, redirection dashboard");
      login(userData, userData.token || userData.temp_token, true);
    }
  };

  const handleVendeurRegistered = (vendeurData: any) => {
    console.log("👤 Vendeur inscrit, données stockées:", vendeurData);
    setVendeurData(vendeurData);
    // Ne PAS ouvrir le prompt ici, on attend la connexion
  };

  const handleRegisterSuccess = (userData: any) => {
    console.log("✅ Register success - userData:", userData);
    // Pour les utilisateurs normaux seulement
    if (userData.type !== "vendeur") {
      console.log("👤 Utilisateur normal inscrit, ouverture login");
      setTimeout(() => {
        switchToLogin();
      }, 500);
    }
  };

  // Callback pour quand l'utilisateur veut créer une boutique (depuis le prompt)
  const handleCreateBoutique = async (boutiqueData: any) => {
    console.log("🏪 Création de boutique demandée");
    setLoadingBoutique(true);
    setBoutiqueError(null);

    try {
      // Utiliser le token du vendeur
      const token = vendeurData?.token || localStorage.getItem("token");

      console.log("📦 Envoi des données à l'API...");

      // Appeler l'API pour créer la boutique
      const response = await fetch(API_ENDPOINTS.BOUTIQUES.CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: boutiqueData, // Déjà FormData
      });

      const data = await response.json();
      console.log("📦 Réponse API création boutique:", data);

      if (response.ok) {
        console.log("✅ Boutique créée avec succès");

        // Fermer le modal de création
        setShowBoutiqueCreation(false);
        setShowBoutiquePrompt(false);

        // Connecter l'utilisateur avec succès
        if (vendeurData) {
          console.log("🔑 Connexion du vendeur après création boutique");
          login(vendeurData.userData || vendeurData, vendeurData.token, true);
          setVendeurData(null);
        }
      } else {
        console.error("❌ Erreur création boutique:", data);
        setBoutiqueError(
          data.message || "Erreur lors de la création de la boutique",
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setBoutiqueError(
        error.message || "Erreur lors de la création de la boutique",
      );
    } finally {
      setLoadingBoutique(false);
    }
  };

  // ✅ CORRECTION: Cette fonction est appelée quand l'utilisateur clique sur "Créer ma boutique" dans le prompt
  const handleStartBoutiqueCreation = () => {
    console.log("🏪 Utilisateur a choisi de créer une boutique");
    setShowBoutiquePrompt(false); // Fermer le prompt
    setShowBoutiqueCreation(true); // Ouvrir le modal de création immédiatement (SANS setTimeout)
  };

  // Fermer le modal de création de boutique sans créer
  const handleCloseBoutiqueModal = () => {
    console.log("❌ Fermeture modal création boutique");
    setShowBoutiqueCreation(false);
    setShowBoutiquePrompt(false);
    setBoutiqueError(null);

    // Connecter l'utilisateur même sans boutique
    if (vendeurData) {
      console.log("🔑 Connexion du vendeur sans création boutique");
      login(vendeurData.userData || vendeurData, vendeurData.token, true);
      setVendeurData(null);
    }
  };

  // Fonction pour ignorer la création de boutique (depuis le prompt)
  const handleSkipBoutiqueCreation = () => {
    console.log("⏭️ Utilisateur a choisi de ne pas créer de boutique");
    setShowBoutiquePrompt(false);
    setShowBoutiqueCreation(false);

    if (vendeurData) {
      console.log("🔑 Connexion du vendeur sans boutique");
      login(vendeurData.userData || vendeurData, vendeurData.token, true);
      setVendeurData(null);
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
        onVendeurRegistered={handleVendeurRegistered}
        onShowLoginAfterRegister={openLoginModal}
      />

      {/* PROMPT DE CRÉATION DE BOUTIQUE (après connexion) */}
      {showBoutiquePrompt && vendeurData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 30000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loadingBoutique) {
              handleSkipBoutiqueCreation();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              width: "100%",
              maxWidth: "500px",
              overflow: "hidden",
              position: "relative",
              animation: "slideIn 0.4s ease-out",
            }}
          >
            {/* Bouton de fermeture */}
            <button
              onClick={handleSkipBoutiqueCreation}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                zIndex: 10,
                width: "2.5rem",
                height: "2.5rem",
                backgroundColor: "#f8fafc",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: loadingBoutique ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              disabled={loadingBoutique}
              onMouseOver={(e) => {
                if (!loadingBoutique)
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
              }}
              onMouseOut={(e) => {
                if (!loadingBoutique)
                  e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              aria-label="Fermer"
            >
              <FontAwesomeIcon
                icon={faTimes}
                style={{ color: "#64748b", fontSize: "1.25rem" }}
              />
            </button>

            {/* Header avec illustration */}
            <div
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "white",
                padding: "2.5rem 2rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "200px",
                  height: "200px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "150px",
                  height: "150px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "50%",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                    animation: "bounce 2s infinite",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faStore}
                    style={{ fontSize: "3rem", color: "#0ea5e9" }}
                  />
                </div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  Bienvenue dans l'aventure ! 🎉
                </h2>
                <p
                  style={{
                    opacity: 0.9,
                    fontSize: "1.1rem",
                    maxWidth: "400px",
                    margin: "0 auto",
                    lineHeight: "1.5",
                  }}
                >
                  Vous êtes maintenant connecté en tant que vendeur
                </p>
              </div>
            </div>

            {/* Body avec contenu */}
            <div style={{ padding: "2.5rem" }}>
              {/* Message de succès */}
              <div
                style={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                  border: "2px solid #bae6fd",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "#0ea5e9",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      style={{ color: "white", fontSize: "1.5rem" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: 0,
                        color: "#0369a1",
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Prêt à commencer !
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        lineHeight: "1.6",
                        fontSize: "0.95rem",
                      }}
                    >
                      Votre compte vendeur est actif. Pour commencer à vendre,
                      créez votre première boutique.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {boutiqueError && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Erreur :</strong> {boutiqueError}
                </div>
              )}

              {/* Avantages de créer une boutique maintenant */}
              <div style={{ marginBottom: "2rem" }}>
                <h4
                  style={{
                    color: "#1e293b",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FontAwesomeIcon icon={faArrowRight} color="#0ea5e9" />
                  Pourquoi créer votre boutique maintenant ?
                </h4>
                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    "Commencez à vendre immédiatement",
                    "Accédez aux outils professionnels",
                    "Atteignez des milliers de clients",
                    "Gérez vos premiers revenus",
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        backgroundColor: "#f8fafc",
                        borderRadius: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "1.5rem",
                          height: "1.5rem",
                          backgroundColor: "#0ea5e9",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          style={{ color: "white", fontSize: "0.75rem" }}
                        />
                      </div>
                      <span style={{ color: "#475569", fontSize: "0.9rem" }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={handleStartBoutiqueCreation}
                  disabled={loadingBoutique}
                  style={{
                    backgroundColor: "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "1.25rem",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: loadingBoutique ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    boxShadow: "0 10px 20px rgba(14, 165, 233, 0.3)",
                    opacity: loadingBoutique ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loadingBoutique) {
                      e.currentTarget.style.backgroundColor = "#0284c7";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 15px 25px rgba(14, 165, 233, 0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loadingBoutique) {
                      e.currentTarget.style.backgroundColor = "#0ea5e9";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 20px rgba(14, 165, 233, 0.3)";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faStore} />
                  Créer ma boutique maintenant
                </button>

                <button
                  onClick={handleSkipBoutiqueCreation}
                  disabled={loadingBoutique}
                  style={{
                    backgroundColor: "transparent",
                    color: "#64748b",
                    border: "2px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: loadingBoutique ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    opacity: loadingBoutique ? 0.5 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loadingBoutique) {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loadingBoutique) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                  }}
                >
                  Créer plus tard depuis mon tableau de bord
                </button>
              </div>

              {/* Note informative */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  borderLeft: "4px solid #0ea5e9",
                }}
              >
                <p style={{ margin: 0, lineHeight: "1.5" }}>
                  <strong>Note :</strong> Vous pouvez créer plusieurs boutiques
                  plus tard. Nous vous recommandons de commencer avec une
                  boutique principale pour vos premiers produits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRÉATION DE BOUTIQUE */}
      {showBoutiqueCreation && vendeurData && (
        <CreateBoutiqueModal
          show={showBoutiqueCreation}
          loading={loadingBoutique}
          onClose={handleCloseBoutiqueModal}
          onCreate={handleCreateBoutique}
          vendeurData={vendeurData}
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};

export default AuthModals;
