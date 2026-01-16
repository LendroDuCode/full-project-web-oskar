// app/(back-office)/dashboard-admin/vendeurs/[uuid]/page.tsx
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
  faStore,
  faTag,
  faBuilding,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import EditVendeurModal from "../components/modals/ModifierVendeurModal";

// Types pour les vendeurs
interface Vendeur {
  uuid: string;
  id?: number;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  is_admin?: boolean;
  type?: string;
  code?: string;
  code_vendeur?: string;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
  indicatif?: string;
  date_naissance?: string;
  statut_matrimonial_uuid?: string;
  adminUuid?: string;
  agentUuid?: string;
  role_uuid: string;
  adresse_uuid?: string;
  adresse?: {
    ville?: string;
    pays?: string;
    adresse?: string;
  };
  // Ajouts spécifiques aux vendeurs
  type_vendeur?: string;
  specialite?: string;
  commission?: number;
  notes?: string;
  statut?: string;
}

export default function DetailVendeurPage() {
  const params = useParams();
  const router = useRouter();
  const vendeurId = params.uuid as string;

  const [vendeur, setVendeur] = useState<Vendeur | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Styles personnalisés
  const styles = {
    cardHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.purple}15 0%, ${colors.oskar.lightGrey} 100%)`,
      borderLeft: `4px solid ${colors.oskar.purple}`,
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
          : status === "bloqué"
            ? `${colors.oskar.orange}15`
            : `${colors.oskar.secondary}15`,
      color:
        status === "actif"
          ? colors.oskar.green
          : status === "bloqué"
            ? colors.oskar.orange
            : colors.oskar.secondary,
      border: `1px solid ${
        status === "actif"
          ? colors.oskar.green + "30"
          : status === "bloqué"
            ? colors.oskar.orange + "30"
            : colors.oskar.secondary + "30"
      }`,
    }),
    typeBadge: (type: string) => ({
      background:
        type === "premium"
          ? `${colors.oskar.gold}15`
          : type === "expert"
            ? `${colors.oskar.blue}15`
            : `${colors.oskar.secondary}15`,
      color:
        type === "premium"
          ? colors.oskar.gold
          : type === "expert"
            ? colors.oskar.blue
            : colors.oskar.secondary,
      border: `1px solid ${
        type === "premium"
          ? colors.oskar.gold + "30"
          : type === "expert"
            ? colors.oskar.blue + "30"
            : colors.oskar.secondary + "30"
      }`,
    }),
  };

  // Charger les données du vendeur - VERSION CORRIGÉE
  useEffect(() => {
    const fetchVendeur = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching vendeur with ID:", vendeurId);

        // IMPORTANT : Votre API retourne directement Vendeur, pas { data: Vendeur }
        // On utilise directement Vendeur comme type, pas { data: Vendeur }
        const response = await api.get<Vendeur>(
          API_ENDPOINTS.ADMIN.VENDEURS.DETAIL(vendeurId),
        );

        console.log("✅ Vendeur data received:", response);

        // IMPORTANT : response est directement le vendeur, pas response.data
        if (response && response.uuid) {
          setVendeur(response); // Directement response, pas response.data
        } else {
          console.error("Vendeur data structure error:", response);
          setError("Vendeur non trouvé ou structure de données invalide");
        }
      } catch (err: any) {
        console.error("❌ Error fetching vendeur:", err);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des données";

        setError(`Erreur: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (vendeurId) {
      fetchVendeur();
    }
  }, [vendeurId]);

  // Fonctions d'action - CORRIGÉES
  const handleToggleBlock = async () => {
    if (!vendeur) return;

    try {
      setActionLoading(true);

      const endpoint = vendeur.est_bloque
        ? API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(vendeurId)
        : API_ENDPOINTS.ADMIN.VENDEURS.BLOCK(vendeurId);

      // IMPORTANT : API retourne directement Vendeur
      const response = await api.post<Vendeur>(endpoint);

      setVendeur(response); // Directement response, pas response.data

      setSuccessMessage(
        `Vendeur ${vendeur.est_bloque ? "débloqué" : "bloqué"} avec succès`,
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
      !vendeur ||
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce vendeur ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(vendeurId));

      setSuccessMessage("Vendeur supprimé avec succès");
      setTimeout(() => {
        router.push("/dashboard-admin/vendeurs/liste-vendeurs");
      }, 1500);
    } catch (err: any) {
      console.error("Error deleting vendeur:", err);
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
    if (!vendeur || !confirm("Êtes-vous sûr de vouloir restaurer ce vendeur ?"))
      return;

    try {
      setActionLoading(true);

      // IMPORTANT : API retourne directement Vendeur
      const response = await api.post<Vendeur>(
        API_ENDPOINTS.ADMIN.VENDEURS.RESTORE(vendeurId),
      );

      setVendeur(response); // Directement response, pas response.data
      setSuccessMessage("Vendeur restauré avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error restoring vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la restauration",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (
      !vendeur ||
      !confirm(
        "⚠️ ATTENTION : Suppression définitive !\n\nÊtes-vous ABSOLUMENT sûr de vouloir supprimer DÉFINITIVEMENT ce vendeur ?\n\nCette action est IRREVERSIBLE et toutes les données seront PERDUES.",
      )
    )
      return;

    try {
      setActionLoading(true);
      await api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(vendeurId));

      setSuccessMessage("Vendeur supprimé définitivement avec succès");
      setTimeout(() => {
        router.push("/dashboard-admin/vendeurs/liste-vendeurs-supprimes");
      }, 1500);
    } catch (err: any) {
      console.error("Error permanent deleting vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression définitive",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Fonction pour recharger les données après modification
  const reloadVendeur = async () => {
    try {
      const response = await api.get<Vendeur>(
        API_ENDPOINTS.ADMIN.VENDEURS.DETAIL(vendeurId),
      );
      setVendeur(response); // Directement response
    } catch (err) {
      console.error("Erreur lors du rechargement:", err);
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

  // Formater la date de naissance
  const formatDateNaissance = (dateString: string | null | undefined) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Non spécifié";
    }
  };

  // Calculer l'âge
  const calculateAge = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
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
    if (vendeur?.avatar) {
      return (
        <img
          src={vendeur.avatar}
          alt={`${vendeur.nom} ${vendeur.prenoms}`}
          className="rounded-circle"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    const initials = `${vendeur?.nom?.charAt(0) || ""}${
      vendeur?.prenoms?.charAt(0) || ""
    }`.toUpperCase();
    return (
      <span className="fw-bold fs-4" style={{ color: colors.oskar.purple }}>
        {initials}
      </span>
    );
  };

  // Obtenir le type de vendeur affiché
  const getVendeurType = () => {
    return vendeur?.type || vendeur?.type_vendeur || "standard";
  };

  // Obtenir le chemin de retour approprié
  const getBackPath = () => {
    if (vendeur?.is_deleted) {
      return "/dashboard-admin/vendeurs/liste-vendeurs-supprimes";
    } else if (vendeur?.est_bloque) {
      return "/dashboard-admin/vendeurs/liste-vendeurs-bloques";
    }
    return "/dashboard-admin/vendeurs/liste-vendeurs";
  };

  // Afficher le chargement
  if (loading) {
    return (
      <div className="p-3 p-md-4">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ color: colors.oskar.purple }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">
            Chargement des données du vendeur...
          </p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur ou l'absence de vendeur
  if (error || !vendeur) {
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
              <p className="mb-0">{error || "Vendeur non trouvé"}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={() => router.push(getBackPath())}
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
      <EditVendeurModal
        isOpen={showEditModal}
        vendeur={vendeur}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setSuccessMessage("Vendeur modifié avec succès !");
          reloadVendeur();
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
                  onClick={() => router.push(getBackPath())}
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Retour
                </button>
                <div>
                  <h5 className="mb-0 fw-bold">
                    Profil de {vendeur.nom} {vendeur.prenoms}
                  </h5>
                  <p className="mb-0 text-muted">
                    {vendeur.code_vendeur || "Aucun code"} • UUID:
                    <button
                      className="btn btn-link p-0 ms-2 text-decoration-none"
                      onClick={() => copyToClipboard(vendeur.uuid)}
                      title="Copier l'UUID"
                    >
                      <small className="text-muted">
                        {vendeur.uuid.substring(0, 8)}...
                      </small>
                      <FontAwesomeIcon icon={faCopy} className="ms-1 fs-12" />
                    </button>
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {vendeur.is_deleted ? (
                  <>
                    <button
                      className="btn btn-success text-white"
                      onClick={handleRestore}
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
                    <button
                      className="btn btn-outline-danger"
                      onClick={handlePermanentDelete}
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      Supprimer définitivement
                    </button>
                  </>
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
                      className={`btn ${vendeur.est_bloque ? "btn-success" : "btn-danger"}`}
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
                          icon={vendeur.est_bloque ? faCheckCircle : faBan}
                          className="me-2"
                        />
                      )}
                      {vendeur.est_bloque ? "Débloquer" : "Bloquer"}
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
                        background: `linear-gradient(135deg, ${colors.oskar.purple}15 0%, ${colors.oskar.lightGrey} 100%)`,
                        border: `3px solid ${colors.oskar.purple}30`,
                      }}
                    >
                      {getAvatarContent()}
                    </div>

                    {/* Nom complet */}
                    <h4 className="fw-bold mb-2">
                      {vendeur.nom} {vendeur.prenoms}
                    </h4>
                    <p className="text-muted mb-4">
                      {vendeur.civilite?.libelle || "Non spécifié"}
                    </p>

                    {/* Badges de statut */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      <span
                        className="badge d-flex align-items-center gap-1 py-2 px-3"
                        style={styles.typeBadge(getVendeurType())}
                      >
                        <FontAwesomeIcon icon={faStore} className="fs-12" />
                        {getVendeurType().toUpperCase()}
                      </span>

                      <span
                        className="badge d-flex align-items-center gap-1 py-2 px-3"
                        style={styles.statusBadge(
                          vendeur.statut || vendeur.is_deleted
                            ? "supprimé"
                            : vendeur.est_bloque
                              ? "bloqué"
                              : "actif",
                        )}
                      >
                        <FontAwesomeIcon icon={faUser} className="fs-12" />
                        {vendeur.is_deleted
                          ? "Supprimé"
                          : vendeur.est_bloque
                            ? "Bloqué"
                            : "Actif"}
                      </span>

                      {vendeur.est_verifie && (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="fs-12 me-1"
                          />
                          Vérifié
                        </span>
                      )}

                      {vendeur.is_admin && (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faShield}
                            className="fs-12 me-1"
                          />
                          Admin
                        </span>
                      )}

                      {vendeur.specialite && (
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faTag}
                            className="fs-12 me-1"
                          />
                          {vendeur.specialite}
                        </span>
                      )}
                    </div>

                    {/* Informations spécifiques vendeur */}
                    <div className="w-100">
                      <h6 className="text-muted mb-2">Informations Vendeur</h6>
                      <div className="d-flex flex-column gap-2">
                        {vendeur.commission && (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span className="fw-semibold">Commission:</span>
                            <span className="badge bg-primary bg-opacity-10 text-primary">
                              {vendeur.commission}%
                            </span>
                          </div>
                        )}
                        {vendeur.adresse?.ville && (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-muted"
                            />
                            <span>{vendeur.adresse.ville}</span>
                          </div>
                        )}
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
                            style={{ color: colors.oskar.purple }}
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
                              <p className="fw-semibold mb-0">{vendeur.nom}</p>
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
                              <p className="fw-semibold mb-0">
                                {vendeur.prenoms}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Civilité
                            </label>
                            <p className="fw-semibold mb-0">
                              {vendeur.civilite?.libelle || "Non spécifié"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Date de naissance
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0 me-2">
                                {formatDateNaissance(vendeur.date_naissance)}
                              </p>
                              {vendeur.date_naissance && (
                                <small className="text-muted">
                                  ({calculateAge(vendeur.date_naissance)} ans)
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Code vendeur
                            </label>
                            <div className="d-flex align-items-center">
                              <p className="fw-semibold mb-0 me-2">
                                {vendeur.code_vendeur || "Non attribué"}
                              </p>
                              {vendeur.code_vendeur && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(vendeur.code_vendeur!)
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
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Type de vendeur
                            </label>
                            <p className="fw-semibold mb-0">
                              {getVendeurType().toUpperCase()}
                            </p>
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
                                {vendeur.email}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(vendeur.email)}
                                title="Copier l'email"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                            {!vendeur.est_verifie && (
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
                                {vendeur.telephone}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() =>
                                  copyToClipboard(vendeur.telephone)
                                }
                                title="Copier le téléphone"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                            {vendeur.indicatif && (
                              <small className="text-muted">
                                Indicatif: {vendeur.indicatif}
                              </small>
                            )}
                          </div>
                          {vendeur.adresse && (
                            <>
                              <div className="col-md-6">
                                <label className="form-label text-muted mb-1">
                                  <FontAwesomeIcon
                                    icon={faMapMarkerAlt}
                                    className="me-1"
                                  />
                                  Ville
                                </label>
                                <p className="fw-semibold mb-0">
                                  {vendeur.adresse.ville || "Non spécifié"}
                                </p>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label text-muted mb-1">
                                  <FontAwesomeIcon
                                    icon={faBuilding}
                                    className="me-1"
                                  />
                                  Pays
                                </label>
                                <p className="fw-semibold mb-0">
                                  {vendeur.adresse.pays || "Non spécifié"}
                                </p>
                              </div>
                              {vendeur.adresse.adresse && (
                                <div className="col-12">
                                  <label className="form-label text-muted mb-1">
                                    Adresse complète
                                  </label>
                                  <p className="fw-semibold mb-0">
                                    {vendeur.adresse.adresse}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
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
                                {vendeur.uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(vendeur.uuid)}
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
                            <p className="fw-semibold mb-0">
                              {vendeur.id || "N/A"}
                            </p>
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
                                {vendeur.adminUuid || "Non spécifié"}
                              </code>
                              {vendeur.adminUuid && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(vendeur.adminUuid!)
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
                                {vendeur.role_uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() =>
                                  copyToClipboard(vendeur.role_uuid)
                                }
                                title="Copier l'UUID rôle"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                          </div>
                          {vendeur.agentUuid && (
                            <div className="col-md-6">
                              <label className="form-label text-muted mb-1">
                                Agent UUID
                              </label>
                              <div className="d-flex align-items-center">
                                <code
                                  className="bg-light rounded p-1 me-2 fs-12"
                                  style={{ flex: 1 }}
                                >
                                  {vendeur.agentUuid}
                                </code>
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(vendeur.agentUuid!)
                                  }
                                  title="Copier l'UUID agent"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="fs-12 text-muted"
                                  />
                                </button>
                              </div>
                            </div>
                          )}
                          {vendeur.adresse_uuid && (
                            <div className="col-md-6">
                              <label className="form-label text-muted mb-1">
                                Adresse UUID
                              </label>
                              <div className="d-flex align-items-center">
                                <code
                                  className="bg-light rounded p-1 me-2 fs-12"
                                  style={{ flex: 1 }}
                                >
                                  {vendeur.adresse_uuid}
                                </code>
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(vendeur.adresse_uuid!)
                                  }
                                  title="Copier l'UUID adresse"
                                >
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="fs-12 text-muted"
                                  />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes et informations supplémentaires */}
                  {vendeur.notes && (
                    <div className="col-12">
                      <div
                        className="card border-0 mb-3"
                        style={styles.infoCard}
                      >
                        <div className="card-header bg-transparent border-0 py-3">
                          <h6 className="mb-0 fw-bold">
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="me-2"
                              style={{ color: colors.oskar.blue }}
                            />
                            Notes et Informations
                          </h6>
                        </div>
                        <div className="card-body p-4">
                          <div className="bg-light rounded p-3">
                            <p
                              className="mb-0"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {vendeur.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                                {formatDate(vendeur.created_at)}
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
                                {formatDate(vendeur.updated_at)}
                              </p>
                            </div>
                          </div>
                          {vendeur.deleted_at && (
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
                                  {formatDate(vendeur.deleted_at)}
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
