"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faStore, faUser } from "@fortawesome/free-solid-svg-icons";

export interface BaseRegisterModalProps {
  visible: boolean;
  onHide: () => void;
  loading?: boolean;
  accountType: "utilisateur" | "vendeur";
  onAccountTypeChange?: (type: "utilisateur" | "vendeur") => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const BaseRegisterModal: React.FC<BaseRegisterModalProps> = ({
  visible,
  onHide,
  loading = false,
  accountType,
  onAccountTypeChange,
  children,
  title,
  subtitle,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Détection de l'écran mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Gestion du scroll
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visible]);

  // Fermeture avec Echap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible && !loading) {
        onHide();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [visible, loading, onHide]);

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
        }}
        onClick={onHide}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          overflowY: "auto",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "center",
          padding: isMobile ? "0.5rem" : "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            width: "100%",
            maxWidth: isMobile ? "100%" : "1000px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            minHeight: isMobile ? "auto" : "500px",
            maxHeight: isMobile ? "95vh" : "90vh",
            margin: isMobile ? "0" : "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onHide}
            disabled={loading}
            style={{
              position: "absolute",
              top: isMobile ? "0.75rem" : "1rem",
              right: isMobile ? "0.75rem" : "1rem",
              zIndex: 10,
              width: isMobile ? "2rem" : "2rem",
              height: isMobile ? "2rem" : "2rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
            aria-label="Fermer"
          >
            <FontAwesomeIcon
              icon={faXmark}
              style={{ color: "#4b5563", fontSize: isMobile ? "1rem" : "1rem" }}
            />
          </button>

          {/* Panneau gauche - TOUJOURS PRÉSENT SUR MOBILE MAIS AVEC HAUTEUR RÉDUITE */}
          <div
            style={{
              flex: isMobile ? "0 0 auto" : "0 0 40%",
              background: accountType === "vendeur" 
                ? "linear-gradient(135deg, #e6f7e6 0%, #d4eed4 100%)"
                : "linear-gradient(135deg, #e6f7e6 0%, #d4eed4 100%)",
              color: "#1e293b",
              padding: isMobile ? "1.5rem 1rem" : "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              cursor: "default",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(74, 222, 128, 0.2) 0%, transparent 50%)`,
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  marginBottom: isMobile ? "1rem" : "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "0.75rem" : "1rem",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "3rem" : "4rem",
                    height: isMobile ? "3rem" : "4rem",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "bold",
                      fontSize: isMobile ? "1.2rem" : "1.5rem",
                    }}
                  >
                    OS
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: isMobile ? "1.2rem" : "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                      color: "#1e293b",
                    }}
                  >
                    OskarStore
                  </h2>
                  <p
                    style={{
                      opacity: 0.8,
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      margin: 0,
                      color: "#334155",
                    }}
                  >
                    {accountType === "vendeur"
                      ? "Plateforme de vente"
                      : "Marketplace"}
                  </p>
                </div>
              </div>

              {/* SÉLECTEUR DE TYPE DE COMPTE - TOUJOURS AFFICHÉ */}
              {onAccountTypeChange && (
                <div
                  style={{
                    marginBottom: isMobile ? "1rem" : "2rem",
                    backgroundColor: "rgba(22, 163, 74, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.5rem",
                    display: "flex",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccountTypeChange("utilisateur");
                    }}
                    style={{
                      flex: 1,
                      padding: isMobile ? "0.6rem" : "0.75rem",
                      backgroundColor:
                        accountType === "utilisateur" ? "#16a34a" : "transparent",
                      color: accountType === "utilisateur" ? "white" : "#166534",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isMobile ? "0.3rem" : "0.5rem",
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} style={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }} />
                    <span>Particulier</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccountTypeChange("vendeur");
                    }}
                    style={{
                      flex: 1,
                      padding: isMobile ? "0.6rem" : "0.75rem",
                      backgroundColor:
                        accountType === "vendeur" ? "#16a34a" : "transparent",
                      color: accountType === "vendeur" ? "white" : "#166534",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isMobile ? "0.3rem" : "0.5rem",
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faStore} style={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }} />
                    <span>Professionnel</span>
                  </button>
                </div>
              )}

              <h1
                style={{
                  fontSize: isMobile ? "1.2rem" : "1.75rem",
                  fontWeight: "bold",
                  marginBottom: isMobile ? "0.5rem" : "1rem",
                  color: "#1e293b",
                }}
              >
                {title || (accountType === "vendeur"
                  ? "Devenez vendeur sur OskarStore"
                  : "Rejoignez notre communauté")}
              </h1>
              <p
                style={{
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                  color: "#334155",
                  marginBottom: isMobile ? "0.5rem" : "2rem",
                  lineHeight: "1.6",
                }}
              >
                {subtitle || (accountType === "vendeur"
                  ? "Créez votre boutique en ligne, atteignez des milliers de clients et gérez vos ventes simplement."
                  : "Découvrez des produits uniques, échangez avec la communauté et profitez d'une expérience shopping exceptionnelle.")}
              </p>
            </div>
          </div>

          {/* Panneau droit */}
          <div
            style={{
              flex: isMobile ? "1" : "0 0 60%",
              padding: isMobile ? "1.5rem 1rem" : "2rem",
              overflowY: "auto",
              maxHeight: isMobile ? "calc(95vh - 250px)" : "90vh",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseRegisterModal;