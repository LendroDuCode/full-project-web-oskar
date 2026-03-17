"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faBan,
  faCheckCircle,
  faExclamationCircle,
  faUserCheck,
  faUserClock,
  faUserSlash,
  faSearch,
  faFilter,
  faDownload,
  faPlus,
  faEnvelope,
  faPhone,
  faCalendarAlt,
  faIdCard,
  faShieldAlt,
  faTimes,
  faRefresh,
  faLock,
  faUnlock,
  faUser,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// ============================================
// TYPES
// ============================================

interface Agent {
  uuid: string;
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  avatar: string | null;
  photo: string | null;
  avatar_url: string | null;
  est_bloque: boolean;
  is_admin: boolean;
  statut: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  civilite: {
    libelle: string;
    slug: string;
  } | null;
  role: {
    uuid: string;
    name: string;
    feature: string;
    status: string;
  } | null;
  adminUuid: string | null;
}

interface AgentsResponse {
  data: Agent[];
  count: number;
  status: string;
}

interface AgentDetailsModalProps {
  agent: Agent | null;
  show: boolean;
  onClose: () => void;
  onBlock?: (uuid: string) => Promise<void>;
  onUnblock?: (uuid: string) => Promise<void>;
  onDelete?: (uuid: string) => Promise<void>;
}

// ============================================
// MODAL DE DÉTAILS D'AGENT
// ============================================

const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({
  agent,
  show,
  onClose,
  onBlock,
  onUnblock,
  onDelete,
}) => {
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!show || !agent) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${nom?.charAt(0) || ""}${prenoms?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusBadge = (estBloque: boolean, deletedAt: string | null) => {
    if (deletedAt) {
      return {
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: faUserSlash,
        label: "Supprimé",
        border: "#FCA5A5",
      };
    }
    if (estBloque) {
      return {
        bg: "#FEF3C7",
        color: "#92400E",
        icon: faBan,
        label: "Bloqué",
        border: "#FCD34D",
      };
    }
    return {
      bg: "#D1FAE5",
      color: "#065F46",
      icon: faCheckCircle,
      label: "Actif",
      border: "#6EE7B7",
    };
  };

  const status = getStatusBadge(agent.est_bloque, agent.deleted_at);

  // ✅ Utilisation de buildImageUrl pour l'avatar
  const getAvatarUrl = () => {
    if (imageError) return null;
    
    const avatarSource = agent.avatar || agent.photo || agent.avatar_url;
    if (!avatarSource) return null;
    
    return buildImageUrl(avatarSource);
  };

  const avatarUrl = getAvatarUrl();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBlockAction = async () => {
    if (!onBlock) return;
    setProcessing(true);
    try {
      await onBlock(agent.uuid);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnblockAction = async () => {
    if (!onUnblock) return;
    setProcessing(true);
    try {
      await onUnblock(agent.uuid);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!onDelete || !confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) return;
    setProcessing(true);
    try {
      await onDelete(agent.uuid);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040, backdropFilter: "blur(5px)" }}
        onClick={onClose}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">
            {/* En-tête du modal */}
            <div
              className="modal-header border-bottom-0 p-4 position-relative"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.purple} 100%)`,
                color: "white",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
                  style={{ width: "56px", height: "56px" }}
                >
                  <FontAwesomeIcon icon={faIdCard} className="fs-3" />
                </div>
                <div>
                  <h3 className="fw-bold mb-1">Détails de l'agent</h3>
                  <p className="mb-0 opacity-90 small">
                    Informations complètes du profil
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 mt-3 me-3"
                onClick={onClose}
                aria-label="Fermer"
                disabled={processing}
              />
            </div>

            {/* Corps du modal */}
            <div className="modal-body p-4">
              <div className="row g-4">
                {/* Colonne gauche - Avatar et statut */}
                <div className="col-md-5">
                  <div className="text-center">
                    {/* Avatar */}
                    <div
                      className="rounded-circle mx-auto mb-3 overflow-hidden position-relative shadow"
                      style={{
                        width: "140px",
                        height: "140px",
                        border: `4px solid ${status.border}`,
                      }}
                    >
                      {avatarUrl && !imageError ? (
                        <img
                          src={avatarUrl}
                          alt={`${agent.prenoms} ${agent.nom}`}
                          className="w-100 h-100 object-fit-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{
                            background: `linear-gradient(135deg, ${colors.oskar.blue}20, ${colors.oskar.purple}20)`,
                            color: colors.oskar.blue,
                            fontSize: "3rem",
                            fontWeight: "bold",
                          }}
                        >
                          {getInitials(agent.nom, agent.prenoms)}
                        </div>
                      )}
                    </div>

                    {/* Nom complet */}
                    <h4 className="fw-bold mb-1">
                      {agent.prenoms} {agent.nom}
                    </h4>
                    <p className="text-muted small mb-3">
                      {agent.civilite?.libelle || "Civilité non spécifiée"}
                    </p>

                    {/* Badge de statut */}
                    <div
                      className="badge d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4 shadow-sm"
                      style={{
                        backgroundColor: status.bg,
                        color: status.color,
                        fontSize: "0.875rem",
                        border: `1px solid ${status.border}`,
                      }}
                    >
                      <FontAwesomeIcon icon={status.icon} />
                      <span className="fw-semibold">{status.label}</span>
                    </div>

                    {/* Rôle */}
                    {agent.role && (
                      <div
                        className="p-3 rounded-3 mb-3"
                        style={{
                          backgroundColor: colors.oskar.lightGrey,
                          border: `1px solid ${colors.oskar.lightGrey}`,
                        }}
                      >
                        <p className="small text-muted mb-1">Rôle</p>
                        <p className="fw-semibold mb-0 d-flex align-items-center gap-2">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            style={{ color: colors.oskar.purple }}
                          />
                          {agent.role.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne droite - Informations détaillées */}
                <div className="col-md-7">
                  <div className="p-4 bg-light rounded-4 h-100">
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-3">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        style={{ color: colors.oskar.green }}
                      />
                      Informations personnelles
                    </h5>

                    <div className="d-flex flex-column gap-4">
                      {/* Email */}
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: colors.oskar.blue + "20",
                            color: colors.oskar.blue,
                          }}
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="small text-muted mb-1">Email</p>
                          <p className="fw-semibold mb-0 text-truncate" title={agent.email}>
                            {agent.email}
                          </p>
                        </div>
                      </div>

                      {/* Téléphone */}
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: colors.oskar.green + "20",
                            color: colors.oskar.green,
                          }}
                        >
                          <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <div>
                          <p className="small text-muted mb-1">Téléphone</p>
                          <p className="fw-semibold mb-0">
                            {agent.telephone || "Non renseigné"}
                          </p>
                        </div>
                      </div>

                      {/* Date de création */}
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: colors.oskar.orange + "20",
                            color: colors.oskar.orange,
                          }}
                        >
                          <FontAwesomeIcon icon={faCalendarAlt} />
                        </div>
                        <div>
                          <p className="small text-muted mb-1">
                            Date de création
                          </p>
                          <p className="fw-semibold mb-0">
                            {formatDate(agent.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Dernière mise à jour */}
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: colors.oskar.purple + "20",
                            color: colors.oskar.purple,
                          }}
                        >
                          <FontAwesomeIcon icon={faUserClock} />
                        </div>
                        <div>
                          <p className="small text-muted mb-1">
                            Dernière mise à jour
                          </p>
                          <p className="fw-semibold mb-0">
                            {formatDate(agent.updated_at)}
                          </p>
                        </div>
                      </div>

                      {/* UUID */}
                      <div className="mt-2">
                        <div className="p-3 rounded-3 bg-white border">
                          <p className="small text-muted mb-1">UUID</p>
                          <p className="small mb-0 font-monospace text-break">
                            {agent.uuid}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="d-flex gap-2 mt-4 pt-3 border-top">
                {!agent.deleted_at && (
                  <>
                    {agent.est_bloque ? (
                      <button
                        className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3"
                        style={{
                          backgroundColor: colors.oskar.green,
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.oskar.green;
                        }}
                        onClick={handleUnblockAction}
                        disabled={processing}
                      >
                        {processing ? (
                          <FontAwesomeIcon icon={faRefresh} spin />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUnlock} />
                            <span>Débloquer</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3"
                        style={{
                          backgroundColor: colors.oskar.orange,
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.oskar.orangeHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.oskar.orange;
                        }}
                        onClick={handleBlockAction}
                        disabled={processing}
                      >
                        {processing ? (
                          <FontAwesomeIcon icon={faRefresh} spin />
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLock} />
                            <span>Bloquer</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
                
                {!agent.deleted_at && (
                  <button
                    className="btn d-flex align-items-center justify-content-center gap-2 py-3"
                    style={{
                      backgroundColor: "#FEE2E2",
                      color: "#DC2626",
                      border: "none",
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                      fontWeight: "500",
                      minWidth: "120px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FECACA";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FEE2E2";
                    }}
                    onClick={handleDeleteAction}
                    disabled={processing}
                  >
                    {processing ? (
                      <FontAwesomeIcon icon={faRefresh} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Supprimer</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "tous" | "actif" | "bloque" | "supprime"
  >("tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Charger les agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🟡 Chargement des agents...");

        const response = await api.get<AgentsResponse>(
          API_ENDPOINTS.ADMIN.AGENTS.LIST
        );

        console.log("🟢 Réponse agents:", response);

        // La réponse peut être directement un tableau ou avoir une propriété data
        let agentsData: Agent[] = [];
        if (Array.isArray(response)) {
          agentsData = response;
        } else if (response && Array.isArray(response.data)) {
          agentsData = response.data;
        } else if (response && response.data && Array.isArray(response.data)) {
          agentsData = response.data;
        }

        setAgents(agentsData);
      } catch (err: any) {
        console.error("🔴 Erreur chargement agents:", err);
        setError(err.message || "Impossible de charger la liste des agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Filtrer les agents
  const filteredAgents = agents.filter((agent) => {
    // Filtre par recherche
    const searchMatch =
      searchTerm === "" ||
      agent.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.telephone?.includes(searchTerm);

    if (!searchMatch) return false;

    // Filtre par statut
    switch (filterStatus) {
      case "actif":
        return !agent.est_bloque && !agent.deleted_at;
      case "bloque":
        return agent.est_bloque && !agent.deleted_at;
      case "supprime":
        return !!agent.deleted_at;
      default:
        return true;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAgents = filteredAgents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (agent: Agent) => {
    if (agent.deleted_at) {
      return {
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: faUserSlash,
        label: "Supprimé",
      };
    }
    if (agent.est_bloque) {
      return {
        bg: "#FEF3C7",
        color: "#92400E",
        icon: faBan,
        label: "Bloqué",
      };
    }
    return {
      bg: "#D1FAE5",
      color: "#065F46",
      icon: faCheckCircle,
      label: "Actif",
    };
  };

  // ✅ Utilisation de buildImageUrl pour l'avatar
  const getAvatarUrl = (agent: Agent) => {
    if (imageErrors.has(agent.uuid)) return null;
    
    const avatarSource = agent.avatar || agent.photo || agent.avatar_url;
    if (!avatarSource) return null;
    
    return buildImageUrl(avatarSource);
  };

  const handleImageError = (agentUuid: string) => {
    setImageErrors((prev) => new Set(prev).add(agentUuid));
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${nom?.charAt(0) || ""}${prenoms?.charAt(0) || ""}`.toUpperCase();
  };

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedAgent(null), 300);
  };

  // Actions simulées (à connecter avec vos vraies fonctions API)
  const handleBlock = async (uuid: string) => {
    console.log("Bloquer agent:", uuid);
    // Implémentez votre logique de blocage ici
    alert(`Agent ${uuid} bloqué (simulation)`);
  };

  const handleUnblock = async (uuid: string) => {
    console.log("Débloquer agent:", uuid);
    // Implémentez votre logique de déblocage ici
    alert(`Agent ${uuid} débloqué (simulation)`);
  };

  const handleDelete = async (uuid: string) => {
    console.log("Supprimer agent:", uuid);
    // Implémentez votre logique de suppression ici
    alert(`Agent ${uuid} supprimé (simulation)`);
  };

  return (
    <>
      <div className="container-fluid p-4">
        {/* En-tête */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-1" style={{ color: colors.oskar.black }}>
              Gestion des Agents
            </h1>
            <p className="text-muted mb-0 d-flex align-items-center gap-2">
              <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                {filteredAgents.length} agent(s) trouvé(s)
              </span>
              {filteredAgents.length !== agents.length && (
                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                  Filtré sur {agents.length} total
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="row g-3 mb-4">
          <div className="col-md-7">
            <div className="position-relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="position-absolute top-50 translate-middle-y"
                style={{
                  left: "1rem",
                  color: colors.oskar.grey,
                  zIndex: 10,
                }}
              />
              <input
                type="text"
                className="form-control form-control-lg ps-5"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: "12px",
                  border: `1px solid ${colors.oskar.lightGrey}`,
                  padding: "0.75rem 1rem 0.75rem 3rem",
                }}
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="position-relative">
              <FontAwesomeIcon
                icon={faFilter}
                className="position-absolute top-50 translate-middle-y"
                style={{
                  left: "1rem",
                  color: colors.oskar.grey,
                  zIndex: 10,
                }}
              />
              <select
                className="form-select form-select-lg ps-5"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(
                    e.target.value as "tous" | "actif" | "bloque" | "supprime"
                  );
                  setCurrentPage(1);
                }}
                style={{
                  borderRadius: "12px",
                  border: `1px solid ${colors.oskar.lightGrey}`,
                  padding: "0.75rem 1rem 0.75rem 3rem",
                  cursor: "pointer",
                }}
              >
                <option value="tous">📋 Tous les statuts</option>
                <option value="actif">✅ Agents actifs</option>
                <option value="bloque">🔒 Agents bloqués</option>
                <option value="supprime">🗑️ Agents supprimés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des agents */}
        <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="text-muted">Chargement des agents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <div
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: "2rem",
                }}
              >
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
              <h5 className="fw-bold mb-2">Erreur de chargement</h5>
              <p className="text-muted mb-3">{error}</p>
              <button
                className="btn btn-outline-primary px-4 py-2 rounded-pill"
                onClick={() => window.location.reload()}
              >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Réessayer
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0" style={{ width: "300px" }}>Agent</th>
                    <th className="px-4 py-3 border-0">Contact</th>
                    <th className="px-4 py-3 border-0">Rôle</th>
                    <th className="px-4 py-3 border-0">Statut</th>
                    <th className="px-4 py-3 border-0">Date création</th>
                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAgents.map((agent) => {
                    const status = getStatusBadge(agent);
                    const avatarUrl = getAvatarUrl(agent);
                    const hasImageError = imageErrors.has(agent.uuid);

                    return (
                      <tr key={agent.uuid} className="border-bottom">
                        {/* Agent */}
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle overflow-hidden shadow-sm"
                              style={{ width: "56px", height: "56px", flexShrink: 0 }}
                            >
                              {avatarUrl && !hasImageError ? (
                                <img
                                  src={avatarUrl}
                                  alt={`${agent.prenoms} ${agent.nom}`}
                                  className="w-100 h-100 object-fit-cover"
                                  onError={() => handleImageError(agent.uuid)}
                                />
                              ) : (
                                <div
                                  className="w-100 h-100 d-flex align-items-center justify-content-center"
                                  style={{
                                    background: `linear-gradient(135deg, ${colors.oskar.blue}20, ${colors.oskar.purple}20)`,
                                    color: colors.oskar.blue,
                                    fontSize: "1.25rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getInitials(agent.nom, agent.prenoms)}
                                </div>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="fw-semibold mb-1 text-truncate" title={`${agent.prenoms} ${agent.nom}`}>
                                {agent.prenoms} {agent.nom}
                              </p>
                              <p className="small text-muted mb-0">
                                {agent.civilite?.libelle || "Civilité N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="small mb-1 d-flex align-items-center gap-2">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                style={{ color: colors.oskar.grey, width: "16px" }}
                              />
                              <span className="text-truncate" style={{ maxWidth: "200px" }} title={agent.email}>
                                {agent.email}
                              </span>
                            </p>
                            <p className="small mb-0 d-flex align-items-center gap-2">
                              <FontAwesomeIcon
                                icon={faPhone}
                                style={{ color: colors.oskar.grey, width: "16px" }}
                              />
                              {agent.telephone || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* Rôle */}
                        <td className="px-4 py-3">
                          {agent.role ? (
                            <div>
                              <p className="fw-semibold mb-1">
                                {agent.role.name}
                              </p>
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: agent.role.status === "actif" ? "#D1FAE5" : "#FEE2E2",
                                  color: agent.role.status === "actif" ? "#065F46" : "#991B1B",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {agent.role.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3">
                          <span
                            className="badge d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                              fontSize: "0.75rem",
                              fontWeight: "500",
                            }}
                          >
                            <FontAwesomeIcon icon={status.icon} size="sm" />
                            {status.label}
                          </span>
                        </td>

                        {/* Date création */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="fw-medium mb-1">
                              {formatDate(agent.created_at)}
                            </p>
                            <p className="small text-muted mb-0">
                              ID: {agent.id}
                            </p>
                          </div>
                        </td>

                        {/* Actions - SEULEMENT le bouton Détails */}
                        <td className="px-4 py-3">
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn d-flex align-items-center gap-2 px-4 py-2"
                              style={{
                                backgroundColor: colors.oskar.blue + "10",
                                color: colors.oskar.blue,
                                border: `1px solid ${colors.oskar.blue}30`,
                                borderRadius: "10px",
                                transition: "all 0.2s ease",
                                fontWeight: "500",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.oskar.blue + "20";
                                e.currentTarget.style.borderColor = colors.oskar.blue;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = colors.oskar.blue + "10";
                                e.currentTarget.style.borderColor = colors.oskar.blue + "30";
                              }}
                              onClick={() => handleViewDetails(agent)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>Détails</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Message si aucun agent */}
                  {currentAgents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <div className="mb-3">
                          <div
                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: colors.oskar.lightGrey,
                              color: colors.oskar.grey,
                              fontSize: "2rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faUserSlash} />
                          </div>
                        </div>
                        <h5 className="fw-semibold mb-2">
                          Aucun agent trouvé
                        </h5>
                        <p className="text-muted mb-3">
                          {searchTerm || filterStatus !== "tous"
                            ? "Essayez de modifier vos filtres de recherche"
                            : "La liste des agents est vide"}
                        </p>
                        {(searchTerm || filterStatus !== "tous") && (
                          <button
                            className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                            onClick={() => {
                              setSearchTerm("");
                              setFilterStatus("tous");
                            }}
                          >
                            <FontAwesomeIcon icon={faRefresh} className="me-2" />
                            Réinitialiser les filtres
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredAgents.length > 0 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
            <div className="text-muted small">
              Affichage de <span className="fw-semibold text-dark">{startIndex + 1}</span> à{" "}
              <span className="fw-semibold text-dark">
                {Math.min(startIndex + itemsPerPage, filteredAgents.length)}
              </span>{" "}
              sur <span className="fw-semibold text-dark">{filteredAgents.length}</span> agents
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <select
                className="form-select form-select-sm rounded-pill"
                style={{ width: "120px", cursor: "pointer" }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>

              <nav aria-label="Navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-start-pill"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      aria-label="Première page"
                    >
                      <span aria-hidden="true">«</span>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Page précédente"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>
                  </li>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Page suivante"
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-end-pill"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      aria-label="Dernière page"
                    >
                      <span aria-hidden="true">»</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <AgentDetailsModal
        agent={selectedAgent}
        show={showModal}
        onClose={handleCloseModal}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onDelete={handleDelete}
      />
    </>
  );
}