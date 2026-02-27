// app/(front-office)/auth/useAuthStatus.ts
"use client";

import { useState, useEffect } from "react";

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    try {
      const token =
        localStorage.getItem("oskar_token") || localStorage.getItem("token");
      const userStr = localStorage.getItem("oskar_user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.error("Erreur parsing user:", e);
    }

    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
    return false;
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-state-changed", handleAuthChange);
    window.addEventListener("force-header-update", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
      window.removeEventListener("force-header-update", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return { isAuthenticated, user, loading, checkAuth };
};
