// app/(back-office)/dashboard-admin/agents/[uuid]/page.tsx
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
  faBriefcase,
  faBuilding,
  faMoneyBill,
  faMapMarkerAlt,
  faFileContract,
  faUserTie,
  faTrashRestore,
  faHistory,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import EditAgentModal from "../components/modals/EditAgentModal";
import colors from "@/app/shared/constants/colors";

// Types pour l'agent
interface Agent {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid: string;
  role_uuid: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  is_deleted: boolean;
  deleted_at: string;

  // Propriétés spécifiques aux agents
  matricule?: string;
  date_embauche?: string;
  departement?: string;
  fonction?: string;
  salaire?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  commentaire?: string;

  // Données système
  id?: string;
  avatar?: string;
  statut?: string;
  adminUuid?: string;
  adresse_uuid?: string;
  created_at?: string;
  updated_at?: string;

  // Données liées (optionnelles selon API)
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
}

export default function DetailAgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.uuid as string;

  const [agent, setAgent] = useState<Agent | null>(null);
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
          : status === "supprimé"
            ? `${colors.oskar.green}15`
            : `${colors.oskar.orange}15`,
      color:
        status === "actif"
          ? colors.oskar.green
          : status === "supprimé"
            ? colors.oskar.green
            : colors.oskar.orange,
      border: `1px solid ${
        status === "actif"
          ? colors.oskar.green + "30"
          : status === "supprimé"
            ? colors.oskar.green + "30"
            : colors.oskar.orange + "30"
      }`,
    }),
  };

  // Charger les données de l'agent
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching agent with ID:", agentId);

        const response = await api.get<Agent>(
          API_ENDPOINTS.ADMIN.AGENTS.DETAIL(agentId),
        );

        console.log("✅ Agent data received:", response);

        if (response) {
          setAgent(response);
        } else {
          setError("Agent non trouvé");
        }
      } catch (err: any) {
        console.error("❌ Error fetching agent:", err);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des données";

        setError(`Erreur: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  // Fonctions d'action
  const handleToggleBlock = async () => {
    if (!agent) return;

    try {
      setActionLoading(true);

      if (agent.est_bloque) {
        // Débloquer l'agent
        const response = await api.post(
          API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(agentId),
        );
        setAgent(response.data);
        setSuccessMessage("Agent débloqué avec succès");
      } else {
        // Bloquer l'agent
        const response = await api.post(
          API_ENDPOINTS.ADMIN.AGENTS.BLOCK(agentId),
        );
        setAgent(response.data);
        setSuccessMessage("Agent bloqué avec succès");
      }

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
    if (!agent) return;

    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet agent ? Cette action le déplacera dans la corbeille.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.delete(
        API_ENDPOINTS.ADMIN.AGENTS.DELETE(agentId),
      );

      console.log("🗑️ Delete response:", response);

      if (response.data?.status === "success") {
        // Rafraîchir les données
        const updatedAgent = await api.get<Agent>(
          API_ENDPOINTS.ADMIN.AGENTS.DETAIL(agentId),
        );
        setAgent(updatedAgent);

        setSuccessMessage("Agent déplacé dans la corbeille");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!agent) return;

    if (
      !confirm(
        "ATTENTION : Cette suppression est définitive ! Êtes-vous sûr de vouloir supprimer définitivement cet agent ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      // IMPORTANT: Vérifiez que cet endpoint existe dans votre API
      const response = await api.delete(
        `/admin/agent/${agentId}/permanent-delete`, // À adapter selon votre API
      );

      console.log("🔴 Permanent delete response:", response);

      if (response.data?.status === "success") {
        setSuccessMessage("Agent supprimé définitivement");
        setTimeout(() => {
          router.push("/dashboard-admin/agents/liste-agents");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error permanently deleting agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression définitive",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!agent) return;

    if (!confirm("Êtes-vous sûr de vouloir restaurer cet agent ?")) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await api.post(
        API_ENDPOINTS.ADMIN.AGENTS.RESTORE(agentId),
      );

      console.log("🔄 Restore response:", response);

      if (response.data?.status === "success") {
        // Rafraîchir les données
        const updatedAgent = await api.get<Agent>(
          API_ENDPOINTS.ADMIN.AGENTS.DETAIL(agentId),
        );
        setAgent(updatedAgent);

        setSuccessMessage("Agent restauré avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Error restoring agent:", err);
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

  // Formater la date sans heure
  const formatDateOnly = (dateString: string | null | undefined) => {
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

  // Formater le salaire
  const formatSalaire = (salaire: string | undefined) => {
    if (!salaire) return "Non spécifié";

    try {
      // Essayer de formater comme un nombre
      const montant = parseFloat(salaire);
      if (!isNaN(montant)) {
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XOF",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(montant);
      }
      return salaire;
    } catch {
      return salaire;
    }
  };

  // Copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pouvez ajouter un toast ici
    console.log("Copié dans le presse-papier:", text);
    setSuccessMessage("Texte copié dans le presse-papier");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Obtenir l'avatar ou l'initiale
  const getAvatarContent = () => {
    if (agent?.avatar) {
      return (
        <img
          src={agent.avatar}
          alt={`${agent.nom} ${agent.prenoms}`}
          className="rounded-circle"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    const initials =
      `${agent?.nom?.charAt(0) || ""}${agent?.prenoms?.charAt(0) || ""}`.toUpperCase();
    return (
      <span className="fw-bold fs-4" style={{ color: colors.oskar.blue }}>
        {initials}
      </span>
    );
  };

  // Calculer l'ancienneté
  const calculateAnciennete = (dateEmbauche: string | undefined) => {
    if (!dateEmbauche) return "Non spécifié";

    try {
      const embauche = new Date(dateEmbauche);
      const now = new Date();

      if (isNaN(embauche.getTime())) return "Date invalide";

      const diffMs = now.getTime() - embauche.getTime();
      const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      const diffMonths = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24 * 365.25)) /
          (1000 * 60 * 60 * 24 * 30.44),
      );

      if (diffYears === 0 && diffMonths === 0) {
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
      } else if (diffYears === 0) {
        return `${diffMonths} mois`;
      } else if (diffMonths === 0) {
        return `${diffYears} an${diffYears > 1 ? "s" : ""}`;
      } else {
        return `${diffYears} an${diffYears > 1 ? "s" : ""} ${diffMonths} mois`;
      }
    } catch {
      return "Non spécifié";
    }
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
            Chargement des données de l'agent...
          </p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
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
              <p className="mb-0">{error || "Agent non trouvé"}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={() =>
                router.push("/dashboard-admin/agents/liste-agents")
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
      <EditAgentModal
        isOpen={showEditModal}
        agent={agent}
        onClose={() => setShowEditModal(false)}
        onSuccess={async () => {
          setSuccessMessage("Agent modifié avec succès !");
          try {
            const refreshedAgent = await api.get<Agent>(
              API_ENDPOINTS.ADMIN.AGENTS.DETAIL(agentId),
            );
            setAgent(refreshedAgent);
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
                    router.push("/dashboard-admin/agents/liste-agents")
                  }
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Retour
                </button>
                <div>
                  <h5 className="mb-0 fw-bold">
                    {agent.is_deleted ? "🔴 " : ""}
                    {agent.nom} {agent.prenoms}
                    {agent.matricule && (
                      <small className="text-muted ms-2">
                        • {agent.matricule}
                      </small>
                    )}
                  </h5>
                  <p className="mb-0 text-muted">
                    {agent.fonction || "Agent"} •{" "}
                    {agent.departement || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {agent.is_deleted ? (
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
                          icon={faTrashRestore}
                          className="me-2"
                        />
                      )}
                      Restaurer
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handlePermanentDelete}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                      )}
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
                      className={`btn ${agent.est_bloque ? "btn-success" : "btn-danger"}`}
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
                          icon={agent.est_bloque ? faCheckCircle : faBan}
                          className="me-2"
                        />
                      )}
                      {agent.est_bloque ? "Débloquer" : "Bloquer"}
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
              {/* Colonne gauche - Avatar et informations principales */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 h-100" style={styles.infoCard}>
                  <div className="card-body d-flex flex-column align-items-center text-center p-4">
                    {/* Avatar */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "120px",
                        height: "120px",
                        background: agent.is_deleted
                          ? `linear-gradient(135deg, ${colors.oskar.yellow}15 0%, ${colors.oskar.lightGrey} 100%)`
                          : `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.lightGrey} 100%)`,
                        border: `3px solid ${agent.is_deleted ? colors.oskar.lightGrey + "30" : colors.oskar.blue + "30"}`,
                      }}
                    >
                      {getAvatarContent()}
                    </div>

                    {/* Nom complet */}
                    <h4 className="fw-bold mb-2">
                      {agent.nom} {agent.prenoms}
                    </h4>
                    {agent.matricule && (
                      <p className="text-muted mb-1">
                        <FontAwesomeIcon icon={faIdCard} className="me-1" />
                        Matricule: {agent.matricule}
                      </p>
                    )}

                    {/* Poste et département */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-1">
                        {agent.fonction || "Agent"}
                      </h6>
                      <p className="text-muted mb-0">
                        {agent.departement || "Non spécifié"}
                      </p>
                    </div>

                    {/* Ancienneté */}
                    {agent.date_embauche && (
                      <div className="mb-3">
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="me-1 text-muted"
                        />
                        <span className="text-muted">Ancienneté: </span>
                        <span className="fw-semibold">
                          {calculateAnciennete(agent.date_embauche)}
                        </span>
                      </div>
                    )}

                    {/* Badges de statut */}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                      <span
                        className="badge d-flex align-items-center gap-1 py-2 px-3"
                        style={styles.statusBadge(agent.statut || "inconnu")}
                      >
                        <FontAwesomeIcon icon={faUser} className="fs-12" />
                        {agent.is_deleted
                          ? "Supprimé"
                          : agent.statut || "inconnu"}
                      </span>

                      {agent.est_verifie && !agent.is_deleted && (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="fs-12 me-1"
                          />
                          Vérifié
                        </span>
                      )}

                      {agent.est_bloque && !agent.is_deleted && (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faBan}
                            className="fs-12 me-1"
                          />
                          Bloqué
                        </span>
                      )}

                      {agent.is_admin && !agent.is_deleted && (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 py-2 px-3">
                          <FontAwesomeIcon
                            icon={faShield}
                            className="fs-12 me-1"
                          />
                          Administrateur
                        </span>
                      )}
                    </div>

                    {/* Salaire */}
                    {agent.salaire && !agent.is_deleted && (
                      <div className="w-100 mt-2">
                        <h6 className="text-muted mb-2">Salaire</h6>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <FontAwesomeIcon
                            icon={faMoneyBill}
                            className="text-success"
                          />
                          <span className="fw-bold fs-5">
                            {formatSalaire(agent.salaire)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite - Informations détaillées */}
              <div className="col-md-8">
                <div className="row g-3">
                  {/* Informations professionnelles */}
                  <div className="col-12">
                    <div className="card border-0 mb-3" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faBriefcase}
                            className="me-2"
                            style={{ color: colors.oskar.blue }}
                          />
                          Informations Professionnelles
                        </h6>
                      </div>
                      <div className="card-body p-4">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faIdCard}
                                className="me-1"
                              />
                              Matricule
                            </label>
                            <div className="d-flex align-items-center">
                              <p className="fw-semibold mb-0 me-2">
                                {agent.matricule || "Non attribué"}
                              </p>
                              {agent.matricule && (
                                <button
                                  className="btn btn-link p-0 text-decoration-none"
                                  onClick={() =>
                                    copyToClipboard(agent.matricule!)
                                  }
                                  title="Copier le matricule"
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
                              <FontAwesomeIcon
                                icon={faUserTie}
                                className="me-1"
                              />
                              Fonction
                            </label>
                            <p className="fw-semibold mb-0">
                              {agent.fonction || "Non spécifié"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="me-1"
                              />
                              Département
                            </label>
                            <p className="fw-semibold mb-0">
                              {agent.departement || "Non spécifié"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faCalendarDay}
                                className="me-1"
                              />
                              Date d'embauche
                            </label>
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-muted me-2"
                              />
                              <p className="fw-semibold mb-0">
                                {formatDateOnly(agent.date_embauche)}
                              </p>
                            </div>
                            {agent.date_embauche && (
                              <small className="text-muted">
                                Ancienneté:{" "}
                                {calculateAnciennete(agent.date_embauche)}
                              </small>
                            )}
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faMoneyBill}
                                className="me-1"
                              />
                              Salaire
                            </label>
                            <p className="fw-semibold mb-0">
                              {formatSalaire(agent.salaire)}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faFileContract}
                                className="me-1"
                              />
                              Commentaire
                            </label>
                            <p className="fw-semibold mb-0">
                              {agent.commentaire || "Aucun commentaire"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations personnelles */}
                  <div className="col-12">
                    <div className="card border-0 mb-3" style={styles.infoCard}>
                      <div className="card-header bg-transparent border-0 py-3">
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="me-2"
                            style={{ color: colors.oskar.green }}
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
                              <p className="fw-semibold mb-0">{agent.nom}</p>
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
                                {agent.prenoms}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Civilité
                            </label>
                            <p className="fw-semibold mb-0">
                              {agent.civilite?.libelle || "Non spécifié"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted mb-1">
                              Statut matrimonial
                            </label>
                            <p className="fw-semibold mb-0">
                              {agent.statut || "Non spécifié"}
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
                            style={{ color: colors.oskar.orange }}
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
                                {agent.email}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(agent.email)}
                                title="Copier l'email"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                            {!agent.est_verifie && !agent.is_deleted && (
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
                                {agent.telephone}
                              </p>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(agent.telephone)}
                                title="Copier le téléphone"
                              >
                                <FontAwesomeIcon
                                  icon={faCopy}
                                  className="fs-12 text-muted"
                                />
                              </button>
                            </div>
                          </div>

                          {/* Adresse */}
                          <div className="col-12">
                            <label className="form-label text-muted mb-1">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-1"
                              />
                              Adresse
                            </label>
                            <div className="d-flex align-items-start">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="text-muted me-2 mt-1"
                              />
                              <div>
                                <p className="fw-semibold mb-0">
                                  {agent.adresse || "Non spécifié"}
                                </p>
                                {(agent.ville || agent.code_postal) && (
                                  <p className="text-muted mb-0 small">
                                    {agent.ville}
                                    {agent.code_postal
                                      ? `, ${agent.code_postal}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            </div>
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
                            style={{ color: colors.oskar.black }}
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
                                {agent.uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(agent.uuid)}
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
                            <p className="fw-semibold mb-0">{agent.id}</p>
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
                                {agent.role_uuid}
                              </code>
                              <button
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => copyToClipboard(agent.role_uuid)}
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
                                {formatDate(agent.created_at)}
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
                                {formatDate(agent.updated_at)}
                              </p>
                            </div>
                          </div>
                          {agent.deleted_at && (
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
                                  {formatDate(agent.deleted_at)}
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
