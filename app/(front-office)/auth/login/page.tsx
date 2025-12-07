"use client";
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";
import colors from "../../../shared/constants/colors";

interface LoginModalProps {
  visible: boolean;
  onHide: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (userData: { firstName: string; lastName: string }) => void;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onHide,
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (loginData.email && loginData.password) {
        onLoginSuccess({ firstName: "John", lastName: "Doe" });
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log(`Connexion avec ${provider}`);
  };

  const modalFooter = (
    <div className="text-center mt-6">
      <span className="text-gray-600 text-sm">Vous n'avez pas de compte ?</span>
      <button
        className="ml-1 text-sm font-semibold text-oskar-green hover:underline focus:outline-none"
        onClick={onSwitchToRegister}
      >
        S'inscrire
      </button>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="text-center text-2xl font-bold text-gray-800">
          Bon retour !
        </div>
      }
      visible={visible}
      style={{ width: "90vw", maxWidth: "480px" }}
      onHide={onHide}
      className="rounded-xl shadow-2xl border border-gray-100"
      closeOnEscape={!loading}
      closable={!loading}
    >
      <form onSubmit={handleLogin} className="px-2 py-4 space-y-5">
        {/* Email */}
        <div className="relative">
          <label
            htmlFor="email"
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
              id="email"
              type="email"
              placeholder="votre@email.com"
              className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
              disabled={loading}
            />
          </span>
        </div>

        {/* Mot de passe */}
        <div className="relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <span className="p-input-icon-left w-full">
            <FontAwesomeIcon
              icon={faLock}
              className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Password
              id="password"
              placeholder="••••••••"
              className="w-full"
              inputClassName="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent transition-all"
              toggleMask
              feedback={false}
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
              disabled={loading}
            />
          </span>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              inputId="rememberMe"
              checked={loginData.rememberMe}
              onChange={(e) =>
                setLoginData({ ...loginData, rememberMe: e.checked || false })
              }
              disabled={loading}
              className="rounded"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600">
              Se souvenir de moi
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-oskar-green hover:underline disabled:opacity-50 focus:outline-none"
            disabled={loading}
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Bouton principal */}
        <Button
          type="submit"
          label={loading ? "Connexion en cours..." : "Se connecter"}
          className="w-full py-3 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          style={{ backgroundColor: colors.oskar.green }}
          loading={loading}
          disabled={loading}
        />

        {/* Séparateur */}
        <Divider>
          <span className="px-2 bg-white text-gray-500 text-xs font-medium">
            ou
          </span>
        </Divider>

        {/* Connexion sociale */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            icon={<FontAwesomeIcon icon={faGoogle} className="mr-2" />}
            label="Google"
            className="justify-center flex items-center gap-2 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
          />
          <Button
            type="button"
            icon={<FontAwesomeIcon icon={faFacebook} className="mr-2" />}
            label="Facebook"
            className="justify-center flex items-center gap-2 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            onClick={() => handleSocialLogin("facebook")}
            disabled={loading}
          />
        </div>

        {modalFooter}
      </form>
    </Dialog>
  );
};

export default LoginModal;
