"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import LoginModal from "./login/page";
import UserRegisterModal from "./register/UserRegisterModal";
import VendeurRegisterModal from "./register/VendeurRegisterModal";
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

  const [showUserRegister, setShowUserRegister] = useState(false);
  const [showVendeurRegister, setShowVendeurRegister] = useState(false);
  const [showBoutiquePrompt, setShowBoutiquePrompt] = useState(false);
  const [showBoutiqueCreation, setShowBoutiqueCreation] = useState(false);
  const [vendeurData, setVendeurData] = useState<any>(null);
  const [loadingBoutique, setLoadingBoutique] = useState(false);
  const [boutiqueError, setBoutiqueError] = useState<string | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [hasActiveBoutique, setHasActiveBoutique] = useState(false);

  // Gestion de l'affichage du modal d'inscription
  useEffect(() => {
    if (showRegisterModal) {
      setShowUserRegister(true);
      setShowVendeurRegister(false);
    } else {
      setShowUserRegister(false);
      setShowVendeurRegister(false);
    }
  }, [showRegisterModal]);

  useEffect(() => {
    if (showBoutiquePrompt) {
      setTimeout(() => {
        setPromptVisible(true);
      }, 50);
    } else {
      setPromptVisible(false);
    }
  }, [showBoutiquePrompt]);

  const handleLoginSuccess = (userData: any) => {
    console.log("✅ Login success - userData:", userData);
    setVerificationDone(false);
    setHasActiveBoutique(false);

    if (userData.type === "vendeur") {
      console.log("👤 Vendeur connecté, vérification des boutiques...");

      const checkExistingBoutique = async () => {
        try {
          const token = userData.token || userData.temp_token;
          console.log("🔑 Token utilisé:", token?.substring(0, 20) + "...");
          
          const endpoint = API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR;
          console.log("📡 Appel API:", endpoint);
          
          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("📡 Statut réponse:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("📦 Réponse API boutiques (brute):", data);
            
            // ✅ Extraire correctement les boutiques selon la structure de l'API
            let boutiquesArray = [];
            
            if (Array.isArray(data)) {
              boutiquesArray = data;
              console.log("📦 Format: tableau direct");
            } else if (data.data && Array.isArray(data.data)) {
              boutiquesArray = data.data;
              console.log("📦 Format: { data: [...] }");
            } else if (data.boutiques && Array.isArray(data.boutiques)) {
              boutiquesArray = data.boutiques;
              console.log("📦 Format: { boutiques: [...] }");
            } else if (data.results && Array.isArray(data.results)) {
              boutiquesArray = data.results;
              console.log("📦 Format: { results: [...] }");
            } else {
              console.log("📦 Format non reconnu, recherche de propriété tableau...");
              for (const key in data) {
                if (Array.isArray(data[key])) {
                  boutiquesArray = data[key];
                  console.log(`📦 Propriété tableau trouvée: ${key}`);
                  break;
                }
              }
            }

            console.log(`📊 ${boutiquesArray.length} boutique(s) trouvée(s) avant filtrage`);
            
            // 🔍 AFFICHER LE DÉTAIL COMPLET DE CHAQUE BOUTIQUE POUR DIAGNOSTIC
            if (boutiquesArray.length > 0) {
              boutiquesArray.forEach((boutique: any, index: number) => {
                console.log(`🔍 Boutique ${index + 1} - Détail complet:`, {
                  uuid: boutique.uuid,
                  nom: boutique.nom,
                  statut: boutique.statut,
                  est_bloque: boutique.est_bloque,
                  est_ferme: boutique.est_ferme,
                  type_statut: typeof boutique.statut,
                  tous_les_champs: Object.keys(boutique),
                  valeurs: Object.entries(boutique).map(([key, val]) => ({ key, val }))
                });
              });
            }

            // ✅ Vérifier si une boutique existe (même si elle n'est pas "active")
            if (boutiquesArray.length > 0) {
              console.log("✅ Vendeur avec boutique(s) existante(s)");
              
              // Sauvegarder toutes les boutiques, pas seulement les actives
              const updatedUser = {
                ...userData,
                has_boutique: true,
                boutiques: boutiquesArray,
                boutique_uuid: boutiquesArray[0]?.uuid,
              };

              localStorage.setItem("oskar_user", JSON.stringify(updatedUser));
              setVendeurData(updatedUser);
              setHasActiveBoutique(true); // Considérer qu'il a une boutique

              console.log("🔑 Connexion directe du vendeur avec boutique");
              closeModals();
              // ✅ IMPORTANT: Le 3ème paramètre false signifie "pas de redirection"
              login(updatedUser, userData.token || userData.temp_token, false);
              
              // S'assurer que le prompt ne s'affiche pas
              setShowBoutiquePrompt(false);
              setPromptVisible(false);
            } else {
              console.log("🆕 Nouveau vendeur sans boutique");
              setVendeurData(userData);
              setHasActiveBoutique(false);
              closeModals();

              setTimeout(() => {
                console.log("🔄 Ouverture du prompt de création de boutique");
                setShowBoutiquePrompt(true);
              }, 300);
            }
            
            setVerificationDone(true);
          } else {
            console.warn("⚠️ Erreur vérification boutique, statut:", response.status);
            const errorText = await response.text();
            console.warn("📦 Réponse erreur:", errorText);
            
            setVerificationDone(true);
            setVendeurData(userData);
            setHasActiveBoutique(false);
            closeModals();

            setTimeout(() => {
              console.log("🔄 Ouverture du prompt (par défaut)");
              setShowBoutiquePrompt(true);
            }, 300);
          }
        } catch (error) {
          console.error("❌ Erreur vérification boutique:", error);
          setVerificationDone(true);
          setVendeurData(userData);
          setHasActiveBoutique(false);
          closeModals();

          setTimeout(() => {
            console.log("🔄 Ouverture du prompt (après erreur)");
            setShowBoutiquePrompt(true);
          }, 300);
        }
      };

      checkExistingBoutique();
    } else {
      console.log("👤 Utilisateur normal connecté, reste sur la page");
      // ✅ IMPORTANT: Le 3ème paramètre false signifie "pas de redirection"
      login(userData, userData.token || userData.temp_token, false);
      closeModals();
    }
  };

  const handleVendeurRegistered = (vendeurData: any) => {
    console.log("👤 Vendeur inscrit, données stockées:", vendeurData);
    setVendeurData(vendeurData);
    setVerificationDone(false);
    setHasActiveBoutique(false);
  };

  const handleUserRegisterSuccess = (userData: any) => {
    console.log("✅ Utilisateur inscrit avec succès");
    closeModals();
    setTimeout(() => {
      switchToLogin();
    }, 500);
  };

  const switchToVendeurRegister = () => {
    console.log("🔄 Passage au modal vendeur");
    setShowUserRegister(false);
    setShowVendeurRegister(true);
  };

  const switchToUserRegister = () => {
    console.log("🔄 Passage au modal utilisateur");
    setShowVendeurRegister(false);
    setShowUserRegister(true);
  };

  const handleCreateBoutique = async (boutiqueData: any) => {
    console.log("🏪 Création de boutique demandée");
    setLoadingBoutique(true);
    setBoutiqueError(null);

    try {
      const token =
        vendeurData?.token ||
        localStorage.getItem("oskar_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("temp_token");

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("🔑 Token trouvé, longueur:", token.length);

      const formDataToSend = new FormData();

      formDataToSend.append("nom", boutiqueData.get("nom"));
      formDataToSend.append("type_boutique_uuid", boutiqueData.get("type_boutique_uuid"));

      const description = boutiqueData.get("description");
      if (description) formDataToSend.append("description", description);

      const politique_retour = boutiqueData.get("politique_retour");
      if (politique_retour) formDataToSend.append("politique_retour", politique_retour);

      const conditions_utilisation = boutiqueData.get("conditions_utilisation");
      if (conditions_utilisation)
        formDataToSend.append("conditions_utilisation", conditions_utilisation);

      const logo = boutiqueData.get("logo");
      if (logo instanceof File) formDataToSend.append("logo", logo);

      const banniere = boutiqueData.get("banniere");
      if (banniere instanceof File) formDataToSend.append("banniere", banniere);

      if (vendeurData?.vendeurId) {
        formDataToSend.append("vendeur_uuid", vendeurData.vendeurId);
      } else if (vendeurData?.uuid) {
        formDataToSend.append("vendeur_uuid", vendeurData.uuid);
      }

      const response = await fetch(API_ENDPOINTS.BOUTIQUES.CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log("📦 Statut réponse:", response.status);

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.log("📦 Réponse texte:", text);
        responseData = { message: text };
      }

      if (!response.ok) {
        console.error("❌ Erreur réponse:", responseData);
        throw new Error(
          responseData.message ||
            responseData.error ||
            `Erreur ${response.status}`,
        );
      }

      console.log("✅ Réponse API création boutique:", responseData);

      setShowBoutiqueCreation(false);
      setShowBoutiquePrompt(false);
      setPromptVisible(false);

      if (vendeurData) {
        const updatedUser = {
          ...vendeurData,
          has_boutique: true,
          boutique_uuid: responseData.boutique?.uuid || responseData.uuid,
        };

        if (token) {
          console.log("💾 Sauvegarde du token");
          localStorage.setItem("oskar_token", token);
          localStorage.setItem("temp_token", token);
          localStorage.setItem("tempToken", token);
          localStorage.setItem("token", token);
          
          const expires = new Date();
          expires.setDate(expires.getDate() + 1);
          document.cookie = `oskar_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        }
        
        localStorage.setItem("oskar_user", JSON.stringify(updatedUser));
        localStorage.setItem("oskar_user_type", "vendeur");

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth-state-changed", {
              detail: { isLoggedIn: true, user: updatedUser },
            }),
          );
          window.dispatchEvent(new Event("force-header-update"));
        }

        console.log("🔑 Connexion du vendeur après création boutique");
        // ✅ IMPORTANT: Le 3ème paramètre false signifie "pas de redirection"
        login(updatedUser, token, false);
        
        setVendeurData(null);
        setLoadingBoutique(false);
        setVerificationDone(true);
        setHasActiveBoutique(true);

        showSuccessNotification("Boutique créée avec succès !");
      }
    } catch (error: any) {
      console.error("❌ Erreur création boutique:", error);
      setBoutiqueError(
        error.message || "Erreur lors de la création de la boutique",
      );
      setLoadingBoutique(false);
    }
  };

  const showSuccessNotification = (message: string) => {
    console.log("✅", message);
  };

  const handleStartBoutiqueCreation = () => {
    console.log("🏪 Utilisateur a choisi de créer une boutique");
    setShowBoutiquePrompt(false);
    setPromptVisible(false);

    setTimeout(() => {
      setShowBoutiqueCreation(true);
    }, 200);
  };

  const handleCloseBoutiqueModal = () => {
    console.log("❌ Fermeture modal création boutique");
    setShowBoutiqueCreation(false);
    setBoutiqueError(null);
    setLoadingBoutique(false);
    setVendeurData(null);
  };

  const handleSkipBoutiqueCreation = () => {
    console.log("⏭️ Utilisateur a choisi de ne pas créer de boutique");
    setShowBoutiquePrompt(false);
    setPromptVisible(false);

    if (vendeurData) {
      console.log("🔑 Connexion du vendeur sans boutique");
      // ✅ IMPORTANT: Le 3ème paramètre false signifie "pas de redirection"
      login(vendeurData.userData || vendeurData, vendeurData.token, false);
      setVendeurData(null);
      setVerificationDone(true);
      setHasActiveBoutique(false);
    }
  };

  // ✅ Condition d'affichage du prompt : seulement si pas de boutique du tout
  const shouldShowPrompt = 
    showBoutiquePrompt && 
    vendeurData && 
    verificationDone && 
    !hasActiveBoutique;

  console.log("🔄 État actuel:", {
    showBoutiquePrompt,
    hasActiveBoutique,
    verificationDone,
    shouldShowPrompt,
    vendeurData: vendeurData ? "présent" : "absent"
  });

  return (
    <>
      <LoginModal
        visible={showLoginModal}
        onHide={closeModals}
        onSwitchToRegister={switchToRegister}
        onLoginSuccess={handleLoginSuccess}
      />

      <UserRegisterModal
        visible={showUserRegister}
        onHide={() => {
          setShowUserRegister(false);
          closeModals();
        }}
        onSwitchToLogin={switchToLogin}
        onRegisterSuccess={handleUserRegisterSuccess}
        onSwitchToVendeur={switchToVendeurRegister}
      />

      <VendeurRegisterModal
        visible={showVendeurRegister}
        onHide={() => {
          setShowVendeurRegister(false);
          closeModals();
        }}
        onSwitchToLogin={switchToLogin}
        onVendeurRegistered={handleVendeurRegistered}
        onShowLoginAfterRegister={openLoginModal}
        onSwitchToUser={switchToUserRegister}
      />

      {/* PROMPT DE CRÉATION DE BOUTIQUE - UNIQUEMENT SI PAS DE BOUTIQUE */}
      {shouldShowPrompt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: promptVisible
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0)",
            zIndex: 30000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            transition: "background-color 0.3s ease",
            pointerEvents: promptVisible ? "auto" : "none",
          }}
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !loadingBoutique &&
              promptVisible
            ) {
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
              transform: promptVisible
                ? "translateY(0) scale(1)"
                : "translateY(-30px) scale(0.95)",
              opacity: promptVisible ? 1 : 0,
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              pointerEvents: promptVisible ? "auto" : "none",
            }}
          >
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
              aria-label="Fermer"
            >
              <FontAwesomeIcon
                icon={faTimes}
                style={{ color: "#64748b", fontSize: "1.25rem" }}
              />
            </button>

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

            <div style={{ padding: "2.5rem" }}>
              <div
                style={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                  border: "2px solid #bae6fd",
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
                <div style={{ display: "grid", gap: "0.75rem" }}>
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
                >
                  Créer plus tard depuis mon tableau de bord
                </button>
              </div>

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
                  plus tard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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