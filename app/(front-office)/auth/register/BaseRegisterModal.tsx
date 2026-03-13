"use client";

import { useEffect } from "react";
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
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            width: "100%",
            maxWidth: "1000px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            minHeight: "500px",
            maxHeight: "90vh",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onHide}
            disabled={loading}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              width: "2rem",
              height: "2rem",
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
              style={{ color: "#4b5563", fontSize: "1rem" }}
            />
          </button>

          {/* Panneau gauche - avec stopPropagation */}
          <div
            style={{
              flex: "0 0 40%",
              backgroundColor: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
              color: "white",
              padding: "2rem",
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
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span
                    style={{
                      color: accountType === "vendeur" ? "#0ea5e9" : "#16a34a",
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                    }}
                  >
                    OS
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                    }}
                  >
                    OskarStore
                  </h2>
                  <p
                    style={{
                      opacity: 0.9,
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    {accountType === "vendeur"
                      ? "Plateforme de vente"
                      : "Marketplace"}
                  </p>
                </div>
              </div>

              {onAccountTypeChange && (
                <div
                  style={{
                    marginBottom: "2rem",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
                      padding: "0.75rem",
                      backgroundColor:
                        accountType === "utilisateur" ? "white" : "transparent",
                      color: accountType === "utilisateur" ? "#16a34a" : "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} />
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
                      padding: "0.75rem",
                      backgroundColor:
                        accountType === "vendeur" ? "white" : "transparent",
                      color: accountType === "vendeur" ? "#0ea5e9" : "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faStore} />
                    <span>Proféssionnel</span>
                  </button>
                </div>
              )}

              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                {title || (accountType === "vendeur"
                  ? "Devenez vendeur sur OskarStore"
                  : "Rejoignez notre communauté")}
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: accountType === "vendeur" ? "#bae6fd" : "#bbf7d0",
                  marginBottom: "2rem",
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
              flex: "0 0 60%",
              padding: "2rem",
              overflowY: "auto",
              maxHeight: "90vh",
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