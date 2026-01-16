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
} from "@fortawesome/free-solid-svg-icons";
import { userService } from "@/services/utilisateurs/utilisateur.service";
import colors from "@/app/shared/constants/colors";
import EditUserModal from "../components/modals/ModifierUserModal";
import type { User } from "@/services/utilisateurs/user.types";

export default function DetailUtilisateurPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.uuid as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Styles personnalisés
  const styles = {
    cardHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.lightGrey} 100%)`,
      borderLeft: `4px solid ${colors.oskar.blue}`,
    },
    infoCard: {
      background: colors.oskar.lightGrey,
      borderRadius: "12px",
      border: `1px solid ${colors.oskar.lightGrey}`,
    },
    statusBadge: (status: string) => ({
      background:
        status === "actif"
          ? `${colors.oskar.green}15`
          : `${colors.oskar.orange}15`,
      color: status === "actif" ? colors.oskar.green : colors.oskar.orange,
      border: `1px solid ${status === "actif" ? colors.oskar.green + "30" : colors.oskar.orange + "30"}`,
    }),
  };

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching user with ID:", userId);

        const userData = await userService.getUser(userId);

        console.log("✅ User data received:", userData);

        if (userData) {
          setUser(userData);
        } else {
          setError("Utilisateur non trouvé");
        }
      } catch (err: any) {
        console.error("❌ Error fetching user:", err);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des données";

        setError(`Erreur: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Fonctions d'action
  const handleToggleBlock = async () => {
    if (!user) return;

    try {
      setActionLoading(true);

      const updatedUser = user.est_bloque
        ? await userService.unblockUser(userId)
        : await userService.blockUser(userId);

      setUser(updatedUser);

      setSuccessMessage(
        `Utilisateur ${user.est_bloque ? "débloqué" : "bloqué"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error toggling block:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'opération",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !user ||
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await userService.deleteUser(userId);

      setSuccessMessage("Utilisateur supprimé avec succès");
      setTimeout(() => {
        router.push("/dashboard-admin/utilisateurs/liste-utilisateurs");
      }, 1500);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (
      !user ||
      !confirm("Êtes-vous sûr de vouloir restaurer cet utilisateur ?")
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const restoredUser = await userService.restoreUser(userId);

      setUser(restoredUser);
      setSuccessMessage("Utilisateur restauré avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error restoring user:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la restauration",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Non spécifié";
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pouvez ajouter un toast ici
    console.log("Copié dans le presse-papier:", text);
  };

  // Obtenir l'avatar ou l'initiale
  const getAvatarContent = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={`${user.nom} ${user.prenoms}`}
          className="rounded-circle"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    const initials =
      `${user?.nom?.charAt(0) || ""}${user?.prenoms?.charAt(0) || ""}`.toUpperCase();
    return (
      <span className="fw-bold fs-4" style={{ color: colors.oskar.blue }}>
        {initials}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-3 p-md-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ color: colors.oskar.blue }}
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

  if (error || !user) {
    return (
      <div className="p-3 p-md-4">
        <div
          className="alert alert-danger border-0 shadow-sm"
          style={{ borderRadius: "12px" }}
        >
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div
                className="rounded-circle p-2"
                style={{ backgroundColor: `${colors.oskar.orange}20` }}
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  style={{ color: colors.oskar.orange }}
                />
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1">Erreur</h6>
              <p className="mb-0">{error || "Utilisateur non trouvé"}</p>
            </div>
          </div>
          <div className="mt-3">
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
      </div>
    );
  }

  return (
    <>
      {/* Modal de modification */}
      <EditUserModal
        isOpen={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSuccess={async () => {
          setSuccessMessage("Utilisateur modifié avec succès !");
          try {
            const refreshedUser = await userService.getUser(userId);
            setUser(refreshedUser);
          } catch (err) {
            console.error("Erreur lors du rechargement:", err);
          }
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />

      {/* Messages de succès */}
      {successMessage && (
        <div className="p-3 p-md-4">
          <div
            className="alert alert-success alert-dismissible fade show border-0 shadow-sm"
            role="alert"
            style={{ borderRadius: "12px" }}
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.green}20` }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ color: colors.oskar.green }}
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1">Succès</h6>
                <p className="mb-0">{successMessage}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 p-md-4">
        <div
          className="card border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête avec actions */}
          <div className="card-header border-0 py-4" style={styles.cardHeader}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary me-3"
                  onClick={() =>
                    router.push(
                      "/dashboard-admin/utilisateurs/liste-utilisateurs",
                    )
                  }
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Retour
                </button>
                <div>
                  <h5 className="mb-0 fw-bold">
                    Profil de {user.nom} {user.prenoms}
                  </h5>
                  <p className="mb-0 text-muted">
                    {user.code_utilisateur || "Aucun code"} • UUID:
                    <button
                      className="btn btn-link p-0 ms-2 text-decoration-none"
                      onClick={() => copyToClipboard(user.uuid)}
                      title="Copier l'UUID"
                    >
                      <small className="text-muted">
                        {user.uuid.substring(0, 8)}...
                      </small>
                      <FontAwesomeIcon icon={faCopy} className="ms-1 fs-12" />
                    </button>
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {user.is_deleted ? (
                  <button
                    className="btn btn-success text-white"
                    onClick={handleRestore}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    ) : (
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    )}
                    Restaurer
                  </button>
                ) : (
                  <>
                    <button
                      className="btn text-white d-flex align-items-center"
                      onClick={() => setShowEditModal(true)}
                      disabled={actionLoading}
                      style={{ background: colors.oskar.orange }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          colors.oskar.orangeHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.oskar.orange;
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-2" />
                      Modifier
                    </button>

                    <button
                      className={`btn ${user.est_bloque ? "btn-success" : "btn-danger"}`}
                      onClick={handleToggleBlock}
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
                          icon={user.est_bloque ? faCheckCircle : faBan}
                          className="me-2"
                        />
                      )}
                      {user.est_bloque ? "Débloquer" : "Bloquer"}
                    </button>

                    <button
                      className="btn btn-outline-danger"
                      onClick={handleDelete}
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="card-body p-4">
            <div className="row">
              {/* Colonne gauche - Avatar et statut */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 h-100" style={styles.infoCard}>
                  <div className="card-body d-flex flex-column align-items-center text-center p-4">
                    {/* Avatar */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "120px",
                        height: "120px",
                        background: `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.lightGrey} 100%)`,
                        border: `3px solid ${colors.oskar.blue}30`,
                      }}
                    >
                      {getAvatarContent()}
                    </div>

                    {/* Nom complet */}
                    <h4 className="fw-bold mb-2">
                      {user.nom} {user.prenoms}
                    </h4>
                    <p className="text-muted mb-4">
                      {user.civilite?.libelle || "Non spécifié"}
                    </p>

                    {/* Badges de statut */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      <span
                        className="badge d-flex align-items-center gap-1 py-2 px-3"
                        style={styles.statusBadge(user.statut)}
                      >
                        <FontAwesomeIcon icon={faUser} className="fs-12" />
                        {user.statut || "inconnu"}
                      </span>

                      {user.est_verifie && (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="fs-12 me-1"
                          />
                          Vérifié
                        </span>
                      )}

                      {user.est_bloque && (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faBan}
                            className="fs-12 me-1"
                          />
                          Bloqué
                        </span>
                      )}

                      {user.is_admin && (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faShield}
                            className="fs-12 me-1"
                          />
                          Administrateur
                        </span>
                      )}

                      {user.is_deleted && (
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="fs-12 me-1"
                          />
                          Supprimé
                        </span>
                      )}
                    </div>

                    {/* Rôle */}
                    <div className="w-100">
                      <h6 className="text-muted mb-2">Rôle</h6>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <FontAwesomeIcon
                          icon={faShield}
                          className="text-primary"
                        />
                        <span className="fw-semibold">
                          {user.role?.name || "Non spécifié"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Informations détaillées */}
              <div className="col-md-8">
                <div className="row g-3">
                  {/* Informations personnelles */}
                  <div className="col-12">
                    <div className="card border-0 mb-3" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faIdCard}
                            className="me-2"
                            style={{ color: colors.oskar.blue }}
                          />
                          Informations Personnelles
                        </h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Nom
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0">{user.nom}</p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Prénoms
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0">{user.prenoms}</p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Civilité
                            </label>
                            <p className="fw-semibold mb-0">
                              {user.civilite?.libelle || "Non spécifié"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Code utilisateur
                            </label>
                            <div className="d-flex align-items-center">
                              <p className="fw-semibold mb-0 me-2">
                                {user.code_utilisateur || "Non attribué"}
                              </p>
                              {user.code_utilisateur && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(user.code_utilisateur!)
                                  }
                                  title="Copier le code"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="fs-12 text-muted"
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="col-12">
                    <div className="card border-0 mb-3" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className="me-2"
                            style={{ color: colors.oskar.green }}
                          />
                          Informations de Contact
                        </h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-1"
                              />
                              Email
                            </label>
                            <div className="d-flex align-items-center">
                              <p className="fw-semibold mb-0 me-2">
                                {user.email}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(user.email)}
                                title="Copier l'email"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                            {!user.est_verifie && (
                              <small className="text-warning">
                                <FontAwesomeIcon
                                  icon={faExclamationTriangle}
                                  className="me-1"
                                />
                                Email non vérifié
                              </small>
                            )}
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-1"
                              />
                              Téléphone
                            </label>
                            <div className="d-flex align-items-center">
                              <p className="fw-semibold mb-0 me-2">
                                {user.telephone}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(user.telephone)}
                                title="Copier le téléphone"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                            {user.indicatif && (
                              <small className="text-muted">
                                Indicatif: {user.indicatif}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations système */}
                  <div className="col-12">
                    <div className="card border-0 mb-3" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faShield}
                            className="me-2"
                            style={{ color: colors.oskar.orange }}
                          />
                          Informations Système
                        </h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              UUID
                            </label>
                            <div className="d-flex align-items-center">
                              <code
                                className="bg-light rounded p-1 me-2 fs-12"
                                style={{ flex: 1 }}
                              >
                                {user.uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(user.uuid)}
                                title="Copier l'UUID"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              ID
                            </label>
                            <p className="fw-semibold mb-0">{user.id}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Admin UUID
                            </label>
                            <div className="d-flex align-items-center">
                              <code
                                className="bg-light rounded p-1 me-2 fs-12"
                                style={{ flex: 1 }}
                              >
                                {user.adminUuid || "Non spécifié"}
                              </code>
                              {user.adminUuid && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(user.adminUuid!)
                                  }
                                  title="Copier l'UUID admin"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="fs-12 text-muted"
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Rôle UUID
                            </label>
                            <div className="d-flex align-items-center">
                              <code
                                className="bg-light rounded p-1 me-2 fs-12"
                                style={{ flex: 1 }}
                              >
                                {user.role_uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(user.role_uuid)}
                                title="Copier l'UUID rôle"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historique */}
                  <div className="col-12">
                    <div className="card border-0" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="me-2"
                            style={{ color: colors.oskar.black }}
                          />
                          Historique
                        </h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label text-muted mb-1">
                              Créé le
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0">
                                {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-muted mb-1">
                              Modifié le
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0">
                                {formatDate(user.updated_at)}
                              </p>
                            </div>
                          </div>
                          {user.deleted_at && (
                            <div className="col-md-4">
                              <label className="form-label text-muted mb-1">
                                Supprimé le
                              </label>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="text-muted me-2"
                                />
                                <p className="fw-semibold mb-0">
                                  {formatDate(user.deleted_at)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .badge {
          border-radius: 20px !important;
          font-weight: 500;
        }

        code {
          font-family: "Courier New", Courier, monospace;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .btn-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
