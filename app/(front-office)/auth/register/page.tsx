"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import colors from "../../../shared/constants/colors";

interface RegisterModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (userData: {
    firstName: string;
    lastName: string;
  }) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onHide,
  onSwitchToLogin,
  onRegisterSuccess,
}) => {
  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (
        registerData.email &&
        registerData.password &&
        registerData.acceptTerms
      ) {
        onRegisterSuccess({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        });
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: "google" | "facebook") => {
    console.log(`Inscription avec ${provider}`);
  };

  const handlePasswordChange = (value: string) => {
    setRegisterData({ ...registerData, password: value });
    if (passwordMismatch) setPasswordMismatch(false);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setRegisterData({ ...registerData, confirmPassword: value });
    if (passwordMismatch) setPasswordMismatch(false);
  };

  const modalFooter = (
    <div className="text-center mt-6">
      <span className="text-gray-600 text-sm">Vous avez déjà un compte ?</span>
      <button
        className="ml-1 text-sm font-semibold text-oskar-green hover:underline focus:outline-none"
        onClick={onSwitchToLogin}
      >
        Se connecter
      </button>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="text-center text-2xl font-bold text-gray-800">
          Bienvenue !
        </div>
      }
      visible={visible}
      style={{ width: "90vw", maxWidth: "500px" }}
      onHide={onHide}
      className="rounded-xl shadow-2xl border border-gray-100"
      closeOnEscape={!loading}
      closable={!loading}
    >
      <form onSubmit={handleRegister} className="px-2 py-4 space-y-5">
        {/* Prénom et Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prénom
            </label>
            <span className="p-input-icon-left w-full">
              <FontAwesomeIcon
                icon={faUser}
                className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <InputText
                id="firstName"
                placeholder="Jean"
                className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
                value={registerData.firstName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    firstName: e.target.value,
                  })
                }
                required
                disabled={loading}
              />
            </span>
          </div>

          <div className="relative">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
            </label>
            <InputText
              id="lastName"
              placeholder="Dupont"
              className="w-full py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
              value={registerData.lastName}
              onChange={(e) =>
                setRegisterData({ ...registerData, lastName: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label
            htmlFor="registerEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <span className="p-input-icon-left w-full">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <InputText
              id="registerEmail"
              type="email"
              placeholder="votre@email.com"
              className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
              disabled={loading}
            />
          </span>
        </div>

        {/* Mot de passe */}
        <div className="relative">
          <label
            htmlFor="registerPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <Password
            id="registerPassword"
            placeholder="••••••••"
            className="w-full"
            inputClassName="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
            toggleMask
            value={registerData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Confirmation mot de passe */}
        <div className="relative">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmer le mot de passe
          </label>
          <Password
            id="confirmPassword"
            placeholder="••••••••"
            className="w-full"
            inputClassName="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
            toggleMask
            value={registerData.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
            disabled={loading}
          />
          {passwordMismatch && (
            <small className="text-red-500 text-xs mt-1 block">
              Les mots de passe ne correspondent pas
            </small>
          )}
        </div>

        {/* CGU */}
        <div className="flex items-start space-x-3">
          <Checkbox
            inputId="acceptTerms"
            checked={registerData.acceptTerms}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                acceptTerms: e.checked || false,
              })
            }
            disabled={loading}
            className="mt-0.5 rounded"
          />
          <label
            htmlFor="acceptTerms"
            className="text-sm text-gray-600 leading-relaxed"
          >
            J'accepte les{" "}
            <button
              type="button"
              className="text-oskar-green hover:underline focus:outline-none"
            >
              conditions d'utilisation
            </button>{" "}
            et la{" "}
            <button
              type="button"
              className="text-oskar-green hover:underline focus:outline-none"
            >
              politique de confidentialité
            </button>
            .
          </label>
        </div>

        {/* Bouton principal */}
        <Button
          type="submit"
          label={loading ? "Création en cours..." : "Créer mon compte"}
          className="w-full py-3 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          style={{ backgroundColor: colors.oskar.green }}
          loading={loading}
          disabled={loading || !registerData.acceptTerms || passwordMismatch}
        />

        {/* Séparateur */}
        <Divider>
          <span className="px-2 bg-white text-gray-500 text-xs font-medium">
            ou
          </span>
        </Divider>

        {/* Inscription sociale */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            icon={<FontAwesomeIcon icon={faGoogle} className="mr-2" />}
            label="Google"
            className="justify-center flex items-center gap-2 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => handleSocialRegister("google")}
            disabled={loading}
          />
          <Button
            type="button"
            icon={<FontAwesomeIcon icon={faFacebook} className="mr-2" />}
            label="Facebook"
            className="justify-center flex items-center gap-2 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => handleSocialRegister("facebook")}
            disabled={loading}
          />
        </div>

        {modalFooter}
      </form>
    </Dialog>
  );
};

export default RegisterModal;
