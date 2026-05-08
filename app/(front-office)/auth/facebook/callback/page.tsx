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
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        console.log("🔑 Token Facebook reçu:", accessToken?.substring(0, 50) + "...");

        if (!accessToken) {
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

        const response = await fetch(API_ENDPOINTS.AUTH.UTILISATEUR.FACEBOOK, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: accessToken }),
        });

        const data = await response.json();
        console.log("📦 Réponse API:", data);

        if (response.ok && data.status === "success" && data.data) {
          const userData = data.data;
          
          localStorage.setItem("oskar_token", userData.token);
          localStorage.setItem("oskar_user", JSON.stringify(userData.user));
          localStorage.setItem("oskar_user_type", "utilisateur");
          
          if (userData.refreshToken) {
            localStorage.setItem("oskar_refresh_token", userData.refreshToken);
          }
          
          setStatus("success");
          
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-state-changed", {
              detail: { isLoggedIn: true, user: userData.user }
            }));
            window.dispatchEvent(new Event("force-header-update"));
          }
          
          if (window.opener) {
            window.opener.postMessage({ type: "oauth-success", token: userData.token }, window.location.origin);
            setTimeout(() => window.close(), 1500);
          } else {
            setTimeout(() => {
              if (userData.user.type === "utilisateur") {
                router.push("/dashboard-utilisateur");
              } else if (userData.user.type === "vendeur") {
                router.push("/dashboard-vendeur");
              } else {
                router.push("/");
              }
            }, 1500);
          }
        } else {
          throw new Error(data.message || "Erreur lors de l'authentification");
        }
      } catch (error: any) {
        console.error("❌ Erreur callback Facebook:", error);
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
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#1877f2" />
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h5 className="text-success">Connexion réussie !</h5>
            <p className="text-muted">Fermeture de la fenêtre...</p>
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
            <p className="text-muted small">Fermeture...</p>
          </>
        )}
      </div>
    </div>
  );
}