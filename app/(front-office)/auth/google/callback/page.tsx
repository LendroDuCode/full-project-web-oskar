// app/auth/google/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔄 Google Callback - Début du traitement");
        
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // ✅ Récupérer id_token (pas access_token)
        const idToken = params.get("id_token");
        
        console.log("🔑 id_token reçu:", idToken?.substring(0, 50) + "...");
        console.log("📦 Tous les paramètres:", Object.fromEntries(params.entries()));

        if (!idToken) {
          setStatus("error");
          setErrorMessage("id_token non trouvé dans l'URL. Vérifiez que response_type=id_token");
          setTimeout(() => {
            if (window.opener) window.close();
            else router.push("/");
          }, 3000);
          return;
        }

        // ✅ Envoyer l'id_token à votre backend (SANS useAccessToken)
        const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.GOOGLE_CONNEXION, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: idToken }), // ✅ Envoyer id_token uniquement
        });

        const data = await response.json();
        console.log("📦 Réponse API:", data);

        if (response.ok && data.status === "success" && data.data) {
          const { tempToken, refreshToken, user, isNewUser } = data.data;
          
          // Sauvegarder les données
          localStorage.setItem("oskar_token", tempToken);
          localStorage.setItem("oskar_user", JSON.stringify(user));
          localStorage.setItem("oskar_user_type", user.type);
          if (refreshToken) localStorage.setItem("oskar_refresh_token", refreshToken);
          
          localStorage.setItem("token", tempToken);
          localStorage.setItem("temp_token", tempToken);
          localStorage.setItem("tempToken", tempToken);
          
          // Déclencher les événements
          window.dispatchEvent(new CustomEvent("auth-state-changed", {
            detail: { isLoggedIn: true, user: user }
          }));
          window.dispatchEvent(new Event("force-header-update"));
          
          setStatus("success");
          
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ 
                type: "oauth-success", 
                token: tempToken,
                user: user,
                refreshToken: refreshToken
              }, window.location.origin);
              setTimeout(() => window.close(), 1500);
            } else {
              if (isNewUser) router.push("/bienvenue");
              else if (user.type === "utilisateur") router.push("/dashboard-utilisateur");
              else if (user.type === "vendeur") router.push("/dashboard-vendeur");
              else router.push("/");
            }
          }, 1500);
        } else {
          throw new Error(data.message || data.error || "Erreur lors de l'authentification");
        }
      } catch (error: any) {
        console.error("❌ Erreur callback Google:", error);
        setStatus("error");
        setErrorMessage(error.message || "Erreur lors de l'authentification");
        
        if (window.opener) {
          window.opener.postMessage({ type: "oauth-error", error: error.message }, window.location.origin);
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => router.push("/"), 3000);
        }
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
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
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
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h5 className="text-danger">Erreur de connexion</h5>
            <p className="text-muted">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  );
}