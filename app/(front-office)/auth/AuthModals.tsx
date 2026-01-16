"use client";

import { useAuth } from "./AuthContext";
import LoginModal from "./login/page";
import RegisterModal from "./register/page";

const AuthModals = () => {
  const {
    showLoginModal,
    showRegisterModal,
    closeModals,
    switchToRegister,
    switchToLogin,
    login,
  } = useAuth();

  const handleLoginSuccess = (userData: any) => {
    // Adaptez selon votre structure de données
    login({
      uuid: "temp-uuid",
      email: "user@example.com",
      type: "utilisateur",
      role: "user",
      ...userData,
    });
  };

  const handleRegisterSuccess = (userData: any) => {
    handleLoginSuccess(userData);
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
      />
    </>
  );
};

export default AuthModals;
