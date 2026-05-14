// app/auth/facebook/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export default function FacebookCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("🔄 Facebook Callback - Début du traitement");
        
        // Récupérer le token depuis l'URL fragment (#)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        console.log("🔑 access_token Facebook reçu:", accessToken?.substring(0, 50) + "...");
        console.log("📦 Tous les paramètres:", Object.fromEntries(params.entries()));

        if (!accessToken) {
          setStatus("error");
          setErrorMessage("access_token non trouvé dans l'URL");
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ 
                type: "oauth-error", 
                error: "access_token non trouvé" 
              }, window.location.origin);
              window.close();
            } else {
              router.push("/");
            }
          }, 3000);
          return;
        }

        console.log("📡 Appel API Facebook connexion...");
        
        // ✅ Vérifier que l'endpoint est correct
        const endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.FACEBOOK;
        console.log("📡 Endpoint:", endpoint);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ token: accessToken }),
        });

        console.log("📡 Status HTTP:", response.status);
        console.log("📡 Headers:", Object.fromEntries(response.headers.entries()));

        // ✅ Vérifier si la réponse est OK avant de parser le JSON
        if (!response.ok) {
          const text = await response.text();
          console.error("❌ Réponse non OK:", text);
          throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
        }

        // ✅ Vérifier que la réponse n'est pas vide
        const textResponse = await response.text();
        console.log("📦 Réponse brute:", textResponse.substring(0, 200));
        
        if (!textResponse || textResponse.trim() === "") {
          throw new Error("Réponse vide du serveur");
        }

        // ✅ Parser le JSON
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error("❌ Erreur parsing JSON:", parseError);
          throw new Error("La réponse du serveur n'est pas un JSON valide");
        }
        
        console.log("📦 Réponse API parsée:", data);

        if (data.status === "success" && data.data) {
          // ✅ Facebook retourne "token" (pas "tempToken")
          const { token, refreshToken, user, isNewUser } = data.data;
          
          console.log("✅ Authentification réussie:", {
            userEmail: user.email,
            userType: user.type,
            tokenLength: token?.length,
          });
          
          // Sauvegarder les données
          localStorage.setItem("oskar_token", token);
          localStorage.setItem("oskar_user", JSON.stringify(user));
          localStorage.setItem("oskar_user_type", user.type);
          if (refreshToken) localStorage.setItem("oskar_refresh_token", refreshToken);
          
          // Anciens formats pour compatibilité
          localStorage.setItem("token", token);
          localStorage.setItem("temp_token", token);
          localStorage.setItem("tempToken", token);
          
          // Déclencher les événements
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-state-changed", {
              detail: { isLoggedIn: true, user: user }
            }));
            window.dispatchEvent(new Event("force-header-update"));
          }
          
          setStatus("success");
          
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ 
                type: "oauth-success", 
                token: token,
                user: user,
                refreshToken: refreshToken
              }, window.location.origin);
              setTimeout(() => window.close(), 1500);
            } else {
              if (isNewUser) {
                router.push("/bienvenue");
              } else if (user.type === "utilisateur") {
                router.push("/dashboard-utilisateur");
              } else if (user.type === "vendeur") {
                router.push("/dashboard-vendeur");
              } else {
                router.push("/");
              }
            }
          }, 1500);
        } else {
          throw new Error(data.message || data.error || "Erreur lors de l'authentification");
        }
      } catch (error: any) {
        console.error("❌ Erreur callback Facebook:", error);
        setStatus("error");
        setErrorMessage(error.message || "Erreur lors de l'authentification");
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: "oauth-error", 
            error: error.message 
          }, window.location.origin);
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
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
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
                <circle cx="12" cy="12" r="10" fill="#1877f2" />
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
            <p className="text-muted small mt-2">Fermeture de la fenêtre...</p>
          </>
        )}
      </div>
    </div>
  );
}