// app/(back-office)/dashboard-admin/utilisateurs/[uuid]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faBan,
  faCheckCircle,
  faTrash,
  faUser,
  faEnvelope,
  faPhone,
  faCalendar,
  faShield,
  faIdCard,
  faExclamationTriangle,
  faSpinner,
  faCopy,
  faGlobe,
  faMapMarkerAlt,
  faBuilding,
  faKey,
  faLock,
  faUnlock,
  faEye,
  faEyeSlash,
  faCheck,
  faTimes,
  faUserSlash,
  faHistory,
  faDatabase,
  faBox,
  faStar,
  faShoppingCart,
  faSync,
  faArrowRight,
  faEllipsisV,
  faFilter,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// Types
interface Civilite {
  uuid: string;
  libelle: string;
  slug?: string;
  statut?: string;
}

interface Role {
  uuid: string;
  name: string;
  feature?: string;
  status?: string;
}

interface Produit {
  uuid: string;
  libelle: string;
  image?: string;
  image_key?: string;
  prix: string;
  statut: string;
  estPublie: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  description?: string;
  disponible?: boolean;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

interface User {
  uuid: string;
  id: number;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  code_utilisateur?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  is_deleted: boolean;
  statut: string;
  avatar?: string;
  avatar_key?: string;
  indicatif?: string;
  adminUuid?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  civilite?: Civilite;
  role?: Role;
  produits?: Produit[];
  statut_matrimonial_uuid?: string;
  date_naissance?: string;
  otp?: string;
  otp_expire?: string;
  is_active_otp?: number;
  email_verifie_le?: string;
  token_verification?: string;
  adresse_uuid?: string;
  mot_de_passe?: string;
  statut_matrimonial?: {
    uuid: string;
    libelle: string;
  };
}

export default function DetailUtilisateurPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.uuid as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "info" | "produits" | "historique"
  >("info");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fonction pour récupérer l'utilisateur
  const fetchUser = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setImageErrors(new Set());

      console.log(`🔄 Fetching user with ID: ${userId}`);
      console.log(
        `📡 API Endpoint: ${API_ENDPOINTS.ADMIN.USERS.DETAIL(userId)}`,
      );

      // ✅ APPEL DIRECT - L'API retourne les données directement
      const userData = await api.get<User>(
        API_ENDPOINTS.ADMIN.USERS.DETAIL(userId),
      );

      console.log("✅ User data received:", userData);

      if (!userData || !userData.uuid) {
        throw new Error("Données utilisateur invalides");
      }

      setUser(userData);
    } catch (err: any) {
      console.error("❌ Error fetching user:", err);

      let errorMessage = "Erreur lors du chargement de l'utilisateur";

      if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Actions API
  const blockUser = async (): Promise<void> => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.USERS.BLOCK(userId));
      await fetchUser(); // Rafraîchir les données
      setSuccessMessage("Utilisateur bloqué avec succès");
    } catch (err: any) {
      console.error("Error blocking user:", err);
      setError(err.response?.data?.message || "Erreur lors du blocage");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const unblockUser = async (): Promise<void> => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(userId));
      await fetchUser(); // Rafraîchir les données
      setSuccessMessage("Utilisateur débloqué avec succès");
    } catch (err: any) {
      console.error("Error unblocking user:", err);
      setError(err.response?.data?.message || "Erreur lors du déblocage");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (): Promise<void> => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(userId));
      setSuccessMessage("Utilisateur supprimé avec succès");

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push("/dashboard-admin/utilisateurs/liste-utilisateurs");
      }, 2000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setActionLoading(false);
    }
  };

  const restoreUser = async (): Promise<void> => {
    try {
      setActionLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.USERS.RESTORE(userId));
      await fetchUser(); // Rafraîchir les données
      setSuccessMessage("Utilisateur restauré avec succès");
    } catch (err: any) {
      console.error("Error restoring user:", err);
      setError(err.response?.data?.message || "Erreur lors de la restauration");
    } finally {
      setActionLoading(false);
    }
  };

  const resetPassword = async (): Promise<void> => {
    if (
      !confirm("Voulez-vous réinitialiser le mot de passe de cet utilisateur ?")
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await api.post(
        `${API_ENDPOINTS.ADMIN.USERS.DETAIL(userId)}/reset-password`,
      );
      setTemporaryPassword(result.password);
      setSuccessMessage("Mot de passe réinitialisé avec succès");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(
        err.response?.data?.message || "Erreur lors de la réinitialisation",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fonctions utilitaires
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Non spécifié";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Non spécifié";
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      const message = document.createElement("div");
      message.className =
        "fixed top-4 right-4 bg-success text-white px-4 py-2 rounded shadow-lg z-50";
      message.textContent = "Copié !";
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getInitials = (nom: string, prenoms: string): string => {
    return `${nom?.charAt(0) || ""}${prenoms?.charAt(0) || ""}`.toUpperCase();
  };

  const formatPrice = (price: string): string => {
    return (
      parseFloat(price).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + " FCFA"
    );
  };

  // ✅ Gestion des erreurs d'image
  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => new Set(prev).add(imageId));
  };

  // ✅ Obtenir l'URL de l'avatar
  const getAvatarUrl = (): string | null => {
    if (imageErrors.has("avatar")) return null;

    if (user?.avatar) {
      const url = buildImageUrl(user.avatar);
      if (url) return url;
    }

    if (user?.avatar_key) {
      const url = buildImageUrl(user.avatar_key);
      if (url) return url;
    }

    return null;
  };

  // ✅ Obtenir l'URL de l'image d'un produit
  const getProductImageUrl = (produit: Produit): string | null => {
    const productId = `product-${produit.uuid}`;
    if (imageErrors.has(productId)) return null;

    if (produit.image_key) {
      const url = buildImageUrl(produit.image_key);
      if (url) return url;
    }

    if (produit.image) {
      const url = buildImageUrl(produit.image);
      if (url) return url;
    }

    return null;
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">
            Chargement des données de l'utilisateur...
          </p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error && !user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger shadow-sm">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="fs-4" />
            </div>
            <div className="flex-grow-1 ms-3">
              <h5 className="alert-heading">Erreur</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={() =>
                router.push("/dashboard-agent/utilisateurs/liste-utilisateurs")
              }
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Retour à la liste
            </button>
            <button className="btn btn-outline-secondary" onClick={fetchUser}>
              <FontAwesomeIcon icon={faSync} className="me-2" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur après chargement
  if (!user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <h5 className="alert-heading">Utilisateur non trouvé</h5>
          <p>
            L'utilisateur avec l'ID "{userId}" n'existe pas ou a été supprimé.
          </p>
          <button
            className="btn btn-primary"
            onClick={() =>
              router.push("/dashboard-admin/utilisateurs/liste-utilisateurs")
            }
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl();

  return (
    <div className="container-fluid py-4">
      {/* Messages d'alerte */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4 shadow-sm"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show mb-4 shadow-sm"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
          ></button>
        </div>
      )}

      {/* Modal mot de passe temporaire */}
      {temporaryPassword && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faKey} className="me-2" />
                  Mot de passe temporaire
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setTemporaryPassword(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  Ce mot de passe est temporaire et ne sera affiché qu'une seule
                  fois.
                </div>
                <div className="mb-3">
                  <label className="form-label">Nouveau mot de passe :</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={temporaryPassword}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => copyToClipboard(temporaryPassword)}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setTemporaryPassword(null)}
                >
                  J'ai noté le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                {user.nom} {user.prenoms}
              </h1>
              <p className="text-muted mb-0">
                ID: {user.id} • {user.email}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  router.push(
                    "/dashboard-admin/utilisateurs/liste-utilisateurs",
                  )
                }
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Retour
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={fetchUser}
                disabled={actionLoading}
              >
                <FontAwesomeIcon
                  icon={faSync}
                  className={actionLoading ? "fa-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <FontAwesomeIcon icon={faIdCard} className="me-2" />
                Informations
              </button>
            </li>
            {user.produits && user.produits.length > 0 && (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "produits" ? "active" : ""}`}
                  onClick={() => setActiveTab("produits")}
                >
                  <FontAwesomeIcon icon={faBox} className="me-2" />
                  Produits ({user.produits.length})
                </button>
              </li>
            )}
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "historique" ? "active" : ""}`}
                onClick={() => setActiveTab("historique")}
              >
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Historique
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="row">
        <div className="col-12">
          {/* Onglet Informations */}
          {activeTab === "info" && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  {/* Colonne gauche - Avatar et statut */}
                  <div className="col-lg-4 mb-4">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        {/* Avatar */}
                        <div className="mb-4">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`${user.nom} ${user.prenoms}`}
                              className="rounded-circle border"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                              }}
                              onError={() => handleImageError("avatar")}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                              style={{
                                width: "120px",
                                height: "120px",
                                backgroundColor: colors.oskar.blue + "20",
                                border: `3px solid ${colors.oskar.blue}30`,
                                fontSize: "2rem",
                                color: colors.oskar.blue,
                              }}
                            >
                              {getInitials(user.nom, user.prenoms)}
                            </div>
                          )}
                        </div>

                        {/* Nom complet */}
                        <h4 className="mb-1">
                          {user.nom} {user.prenoms}
                        </h4>
                        <p className="text-muted mb-3">{user.email}</p>

                        {/* Badges de statut */}
                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                          <span
                            className={`badge ${user.est_verifie ? "bg-success" : "bg-warning"}`}
                          >
                            <FontAwesomeIcon
                              icon={user.est_verifie ? faCheckCircle : faTimes}
                              className="me-1"
                            />
                            {user.est_verifie ? "Vérifié" : "Non vérifié"}
                          </span>
                          <span
                            className={`badge ${user.est_bloque ? "bg-danger" : "bg-success"}`}
                          >
                            <FontAwesomeIcon
                              icon={user.est_bloque ? faLock : faUnlock}
                              className="me-1"
                            />
                            {user.est_bloque ? "Bloqué" : "Actif"}
                          </span>
                          <span className="badge bg-info">
                            <FontAwesomeIcon icon={faShield} className="me-1" />
                            {user.role?.name || "Utilisateur"}
                          </span>
                          {user.is_admin && (
                            <span className="badge bg-purple">
                              <FontAwesomeIcon icon={faUser} className="me-1" />
                              Administrateur
                            </span>
                          )}
                        </div>

                        {/* Actions rapides */}
                        <div className="d-grid gap-2">
                          {user.is_deleted ? (
                            <button
                              className="btn btn-success"
                              onClick={restoreUser}
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  spin
                                  className="me-2"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="me-2"
                                />
                              )}
                              Restaurer
                            </button>
                          ) : (
                            <>
                              <button
                                className={`btn ${user.est_bloque ? "btn-success" : "btn-danger"}`}
                                onClick={
                                  user.est_bloque ? unblockUser : blockUser
                                }
                                disabled={actionLoading}
                              >
                                {actionLoading ? (
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    className="me-2"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={user.est_bloque ? faUnlock : faLock}
                                    className="me-2"
                                  />
                                )}
                                {user.est_bloque ? "Débloquer" : "Bloquer"}
                              </button>
                              <button
                                className="btn btn-warning"
                                onClick={resetPassword}
                                disabled={actionLoading}
                              >
                                <FontAwesomeIcon
                                  icon={faKey}
                                  className="me-2"
                                />
                                Réinitialiser MDP
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={deleteUser}
                                disabled={actionLoading}
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="me-2"
                                />
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite - Détails */}
                  <div className="col-lg-8">
                    <div className="row">
                      {/* Informations personnelles */}
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-transparent">
                            <h6 className="mb-0">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="me-2 text-primary"
                              />
                              Informations personnelles
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <small className="text-muted">Nom complet</small>
                              <p className="mb-0 fw-bold">
                                {user.nom} {user.prenoms}
                              </p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Civilité</small>
                              <p className="mb-0">
                                {user.civilite?.libelle || "Non spécifié"}
                              </p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">
                                Date de naissance
                              </small>
                              <p className="mb-0">
                                {user.date_naissance
                                  ? formatDate(user.date_naissance)
                                  : "Non spécifié"}
                              </p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">
                                Statut matrimonial
                              </small>
                              <p className="mb-0">
                                {user.statut_matrimonial?.libelle ||
                                  "Non spécifié"}
                              </p>
                            </div>
                            <div className="mb-0">
                              <small className="text-muted">
                                Code utilisateur
                              </small>
                              <p className="mb-0">
                                {user.code_utilisateur || "Non attribué"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-transparent">
                            <h6 className="mb-0">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-2 text-success"
                              />
                              Contact
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <small className="text-muted">Email</small>
                              <div className="d-flex align-items-center">
                                <p className="mb-0 fw-bold me-2">
                                  {user.email}
                                </p>
                                <button
                                  className="btn btn-sm btn-link p-0"
                                  onClick={() => copyToClipboard(user.email)}
                                  title="Copier l'email"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="text-muted"
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Téléphone</small>
                              <div className="d-flex align-items-center">
                                <p className="mb-0 me-2">{user.telephone}</p>
                                <button
                                  className="btn btn-sm btn-link p-0"
                                  onClick={() =>
                                    copyToClipboard(user.telephone)
                                  }
                                  title="Copier le téléphone"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="text-muted"
                                  />
                                </button>
                              </div>
                            </div>
                            {user.indicatif && (
                              <div className="mb-0">
                                <small className="text-muted">Indicatif</small>
                                <p className="mb-0">{user.indicatif}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informations système */}
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-transparent">
                            <h6 className="mb-0">
                              <FontAwesomeIcon
                                icon={faDatabase}
                                className="me-2 text-warning"
                              />
                              Informations système
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <small className="text-muted">UUID</small>
                              <div className="d-flex align-items-center">
                                <code
                                  className="text-truncate me-2"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {user.uuid}
                                </code>
                                <button
                                  className="btn btn-sm btn-link p-0"
                                  onClick={() => copyToClipboard(user.uuid)}
                                  title="Copier l'UUID"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="text-muted"
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">Rôle</small>
                              <p className="mb-0">{user.role?.name}</p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">
                                Admin créateur
                              </small>
                              <p className="mb-0">
                                {user.adminUuid || "Système"}
                              </p>
                            </div>
                            <div className="mb-0">
                              <small className="text-muted">
                                Statut système
                              </small>
                              <p className="mb-0">{user.statut}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Authentification */}
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-transparent">
                            <h6 className="mb-0">
                              <FontAwesomeIcon
                                icon={faShield}
                                className="me-2 text-danger"
                              />
                              Authentification
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <small className="text-muted">Dernier OTP</small>
                              <p className="mb-0">{user.otp || "Aucun"}</p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">
                                Expiration OTP
                              </small>
                              <p className="mb-0">
                                {user.otp_expire
                                  ? formatDate(user.otp_expire)
                                  : "Aucun"}
                              </p>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted">
                                Email vérifié le
                              </small>
                              <p className="mb-0">
                                {user.email_verifie_le
                                  ? formatDate(user.email_verifie_le)
                                  : "Non vérifié"}
                              </p>
                            </div>
                            <div className="mb-0">
                              <small className="text-muted">
                                Token vérification
                              </small>
                              <p className="mb-0 text-truncate">
                                {user.token_verification || "Aucun"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Produits */}
          {activeTab === "produits" &&
            user.produits &&
            user.produits.length > 0 && (
              <div className="card shadow-sm">
                <div className="card-header bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <FontAwesomeIcon icon={faBox} className="me-2" />
                      Produits ({user.produits.length})
                    </h6>
                    <button className="btn btn-sm btn-outline-primary">
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      Filtrer
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {user.produits.map((produit) => {
                      const productImageUrl = getProductImageUrl(produit);

                      return (
                        <div key={produit.uuid} className="col">
                          <div className="card h-100 border hover-shadow">
                            <div className="position-relative">
                              {productImageUrl ? (
                                <img
                                  src={productImageUrl}
                                  alt={produit.libelle}
                                  className="card-img-top"
                                  style={{
                                    height: "200px",
                                    objectFit: "cover",
                                  }}
                                  onError={() =>
                                    handleImageError(`product-${produit.uuid}`)
                                  }
                                />
                              ) : (
                                <div
                                  className="card-img-top d-flex align-items-center justify-content-center bg-light"
                                  style={{ height: "200px" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faBox}
                                    className="text-muted"
                                    style={{ fontSize: "3rem" }}
                                  />
                                </div>
                              )}
                              <div className="position-absolute top-0 end-0 m-2">
                                <span
                                  className={`badge ${produit.estPublie ? "bg-success" : "bg-warning"}`}
                                >
                                  {produit.estPublie ? "Publié" : "Non publié"}
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              <h6 className="card-title text-truncate">
                                {produit.libelle}
                              </h6>
                              <div className="mb-2">
                                <span className="fw-bold text-primary">
                                  {formatPrice(produit.prix)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="text-warning me-1"
                                  />
                                  <small>
                                    {produit.note_moyenne.toFixed(1)} (
                                    {produit.nombre_avis})
                                  </small>
                                </div>
                                <div>
                                  <FontAwesomeIcon
                                    icon={faShoppingCart}
                                    className="text-muted me-1"
                                  />
                                  <small>Qté: {produit.quantite}</small>
                                </div>
                              </div>
                              {produit.description && (
                                <p
                                  className="card-text small text-muted mb-0"
                                  style={{ height: "3rem", overflow: "hidden" }}
                                >
                                  {produit.description}
                                </p>
                              )}
                            </div>
                            <div className="card-footer bg-transparent">
                              <button className="btn btn-sm btn-outline-primary w-100">
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="me-2"
                                />
                                Voir détails
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* Onglet Historique */}
          {activeTab === "historique" && (
            <div className="card shadow-sm">
              <div className="card-header bg-transparent">
                <h6 className="mb-0">
                  <FontAwesomeIcon icon={faHistory} className="me-2" />
                  Historique
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Dates importantes</h6>
                        <div className="mb-3">
                          <small className="text-muted">Création</small>
                          <p className="mb-0 fw-bold">
                            {formatDate(user.created_at)}
                          </p>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted">
                            Dernière modification
                          </small>
                          <p className="mb-0 fw-bold">
                            {formatDate(user.updated_at)}
                          </p>
                        </div>
                        {user.deleted_at && (
                          <div className="mb-0">
                            <small className="text-muted">Suppression</small>
                            <p className="mb-0 fw-bold text-danger">
                              {formatDate(user.deleted_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title mb-3">Statistiques</h6>
                        <div className="mb-3">
                          <small className="text-muted">Produits créés</small>
                          <p className="mb-0 fw-bold">
                            {user.produits?.length || 0}
                          </p>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted">Statut actuel</small>
                          <p className="mb-0 fw-bold">
                            {user.is_deleted ? "Supprimé" : "Actif"}
                          </p>
                        </div>
                        <div className="mb-0">
                          <small className="text-muted">Type de compte</small>
                          <p className="mb-0 fw-bold">
                            {user.is_admin
                              ? "Administrateur"
                              : "Utilisateur standard"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pied de page */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body text-center">
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    router.push(`/dashboard-admin/utilisateurs/${userId}/edit`)
                  }
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={fetchUser}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon
                    icon={faSync}
                    className={`me-2 ${actionLoading ? "fa-spin" : ""}`}
                  />
                  Rafraîchir
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() =>
                    router.push(
                      "/dashboard-admin/utilisateurs/liste-utilisateurs",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom: 3px solid #0d6efd;
        }
        .badge.bg-purple {
          background-color: #6f42c1;
        }
        .card {
          border-radius: 12px;
        }
        .modal {
          z-index: 1060;
        }
      `}</style>
    </div>
  );
}