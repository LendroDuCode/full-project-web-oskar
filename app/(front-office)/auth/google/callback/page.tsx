"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔄 Google Callback - Début du traitement");
        
        // Récupérer le token depuis l'URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        let idToken = params.get("id_token");
        
        if (!idToken) {
          const accessToken = params.get("access_token");
          if (accessToken) {
            console.log("⚠️ Access token trouvé, utilisation comme fallback");
            idToken = accessToken;
          }
        }
        
        console.log("🔑 Token Google reçu:", idToken?.substring(0, 50) + "...");

        if (!idToken) {
          setStatus("error");
          setErrorMessage("Token non trouvé dans l'URL");
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              router.push("/");
            }
          }, 3000);
          return;
        }

        // Appeler l'API backend
        console.log("📡 Appel API Google connexion...");
        const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.GOOGLE_CONNEXION, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await response.json();
        console.log("📦 Réponse API complète:", JSON.stringify(data, null, 2));

        if (response.ok && data.status === "success" && data.data) {
          const { token, refreshToken, user, isNewUser } = data.data;
          
          console.log("✅ Authentification réussie:", {
            userEmail: user.email,
            userType: user.type,
            tokenLength: token?.length,
            hasRefreshToken: !!refreshToken,
            isNewUser
          });
          
          // ✅ Sauvegarder les données d'authentification (3 arguments seulement)
          // La méthode saveAuthData attend (token, user, userType)
          api.saveAuthData(token, user, user.type);
          
          // ✅ Sauvegarder le refresh token séparément si disponible
          if (refreshToken) {
            localStorage.setItem("oskar_refresh_token", refreshToken);
          }
          
          // ✅ Forcer une mise à jour du localStorage pour être sûr
          localStorage.setItem("oskar_user", JSON.stringify(user));
          localStorage.setItem("oskar_user_type", user.type);
          localStorage.setItem("oskar_token", token);
          
          // Anciens formats pour compatibilité
          localStorage.setItem("token", token);
          localStorage.setItem("temp_token", token);
          localStorage.setItem("tempToken", token);
          
          // ✅ Déclencher les événements de mise à jour
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-state-changed", {
              detail: { isLoggedIn: true, user: user }
            }));
            window.dispatchEvent(new Event("force-header-update"));
            window.dispatchEvent(new Event("oskar-auth-success"));
          }
          
          setStatus("success");
          
          // Attendre que les données soient bien sauvegardées
          setTimeout(() => {
            // Vérification que le token est bien présent
            const savedToken = localStorage.getItem("oskar_token");
            console.log("✅ Vérification post-sauvegarde - Token présent:", !!savedToken);
            
            if (window.opener) {
              // Envoyer les données à la fenêtre parente
              window.opener.postMessage({ 
                type: "oauth-success", 
                token: token,
                user: user,
                refreshToken: refreshToken
              }, window.location.origin);
              setTimeout(() => window.close(), 1500);
            } else {
              // Redirection après succès
              setTimeout(() => {
                if (isNewUser) {
                  router.push("/bienvenue");
                } else if (user.type === "utilisateur") {
                  router.push("/dashboard-utilisateur");
                } else if (user.type === "vendeur") {
                  router.push("/dashboard-vendeur");
                } else {
                  router.push("/");
                }
              }, 1500);
            }
          }, 500);
        } else {
          throw new Error(data.message || data.error || "Erreur lors de l'authentification");
        }
      } catch (error: any) {
        console.error("❌ Erreur callback Google:", error);
        setStatus("error");
        setErrorMessage(error.message || "Erreur lors de l'authentification");
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            router.push("/");
          }
        }, 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="spinner-border text-success mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <h5 className="text-dark">Connexion en cours...</h5>
            <p className="text-muted">Veuillez patienter...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mb-3">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#16a34a" />
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h5 className="text-success">Connexion réussie !</h5>
            <p className="text-muted">Redirection en cours...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-3">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h5 className="text-danger">Erreur de connexion</h5>
            <p className="text-muted">{errorMessage}</p>
            <p className="text-muted small">Fermeture de la fenêtre...</p>
          </>
        )}
      </div>
    </div>
  );
}