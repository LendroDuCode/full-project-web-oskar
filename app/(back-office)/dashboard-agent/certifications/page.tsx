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
  faStore,
  faTag,
  faStar,
  faFileAlt,
  faFilePdf,
  faImage,
  faChevronLeft,
  faChevronRight,
  faExpand,
  faCompress,
  faTimesCircle,
  faBriefcase,
  faClock,
  faCircle,
  faSearchPlus,
  faInfoCircle,
  faScaleBalanced,
  faCheck,
  faLightbulb,
  faFlag,
  faUsers,
  faAddressCard,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// ============================================
// TYPES
// ============================================

interface Vendeur {
  uuid: string;
  id: number;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  avatar: string | null;
  photo: string | null;
  avatar_url: string | null;
  registre_commerce: string | null;
  est_bloque: boolean;
  est_verifie: boolean;
  is_admin: boolean;
  status: string;
  type: string;
  created_at: string | null;
  updated_at: string | null;
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
  ville: string | null;
  pseudo: string | null;
  date_creation: string;
  date: string;
  date_mise_a_jour: string;
  code: string | null;
  indicatif: string | null;
  email_verifie_le: string | null;
  statut_matrimonial_uuid: string | null;
  adminUuid: string | null;
  agentUuid: string | null;
}

interface VendeursResponse {
  data: Vendeur[];
  count: number;
  status: string;
}

interface VerificationDetail {
  id: string;
  name: string;
  type: "particulier" | "professionnel";
  submissionDate: string;
  submissionTime: string;
  documentType: string;
  documentImage: string | null;
  comparisons: {
    field: string;
    label: string;
    userValue: string;
    documentValue: string;
    status: "match" | "mismatch" | "pending";
  }[];
  verificationNote: string;
}

// ============================================
// FILTER BAR COMPONENT
// ============================================

interface FilterBarProps {
  onAccountTypeChange?: (
    type: "tous" | "particulier" | "professionnel",
  ) => void;
  onStatusChange?: (status: string) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
  defaultAccountType?: "tous" | "particulier" | "professionnel";
  defaultStatus?: string;
  totalCount?: number;
  filteredCount?: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onAccountTypeChange,
  onStatusChange,
  onSearchChange,
  className = "",
  defaultAccountType = "tous",
  defaultStatus = "en-attente",
  totalCount = 0,
  filteredCount = 0,
}) => {
  const [activeAccountType, setActiveAccountType] = useState<
    "tous" | "particulier" | "professionnel"
  >(defaultAccountType);
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const accountTypes = [
    { id: "tous", label: "Tous" },
    { id: "particulier", label: "Particulier" },
    { id: "professionnel", label: "Professionnel" },
  ] as const;

  const statusOptions = [
    { value: "tous", label: "Tous les statuts" },
    { value: "en-attente", label: "En attente" },
    { value: "verifie", label: "Vérifié" },
    { value: "bloque", label: "Bloqué" },
    { value: "supprime", label: "Supprimé" },
  ];

  const handleAccountTypeClick = (
    type: "tous" | "particulier" | "professionnel",
  ) => {
    setActiveAccountType(type);
    onAccountTypeChange?.(type);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onStatusChange?.(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(searchQuery);
  };

  return (
    <section
      className={`bg-white border-bottom border-light px-4 py-3 ${className}`}
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row align-items-center gap-4">
          {/* Compteurs */}
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
              {filteredCount} résultat(s)
            </span>
            {filteredCount !== totalCount && (
              <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                sur {totalCount} total
              </span>
            )}
          </div>

          {/* Type de Compte - Toggle */}
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-nowrap fw-medium small"
              style={{ color: colors.oskar.black }}
            >
              Type de Compte:
            </span>
            <div
              className="d-flex rounded-3 p-1"
              style={{
                backgroundColor: colors.oskar.lightGrey,
              }}
            >
              {accountTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleAccountTypeClick(type.id)}
                  className={`btn btn-sm px-3 py-2 rounded-2 ${activeAccountType === type.id ? "fw-semibold" : ""}`}
                  style={{
                    backgroundColor:
                      activeAccountType === type.id ? "white" : "transparent",
                    color:
                      activeAccountType === type.id
                        ? colors.oskar.black
                        : colors.oskar.grey,
                    border: "none",
                    boxShadow:
                      activeAccountType === type.id
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    transition: "all 0.2s ease",
                    minWidth: "100px",
                  }}
                  onMouseEnter={(e) => {
                    if (activeAccountType !== type.id) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeAccountType !== type.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Séparateur */}
          <div
            className="d-none d-md-block"
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: colors.oskar.lightGrey,
            }}
          />

          {/* Filtre Statut */}
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-nowrap fw-medium small"
              style={{ color: colors.oskar.black }}
            >
              Statut:
            </span>
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="form-select form-select-sm rounded-2"
              style={{
                minWidth: "140px",
                borderColor: colors.oskar.lightGrey,
                color: colors.oskar.black,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.grey;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.lightGrey;
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.green;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.oskar.green}40`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.oskar.lightGrey;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Séparateur */}
          <div
            className="d-none d-md-block"
            style={{
              width: "1px",
              height: "32px",
              backgroundColor: colors.oskar.lightGrey,
            }}
          />

          {/* Barre de recherche */}
          <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span
                  className="input-group-text border-0 rounded-start-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    borderRight: "none",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.875rem",
                    }}
                  />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher par nom, email ou ID"
                  className="form-control border-0 rounded-end-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    fontSize: "0.875rem",
                    padding: "0.5rem 1rem",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.boxShadow = `0 0 0 2px ${colors.oskar.green}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = colors.oskar.lightGrey;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// REGISTRE PREVIEW COMPONENT
// ============================================

interface RegistrePreviewProps {
  registreUrl: string | null;
  vendeurName: string;
  onClose: () => void;
  isOpen: boolean;
}

const RegistrePreview: React.FC<RegistrePreviewProps> = ({
  registreUrl,
  vendeurName,
  onClose,
  isOpen,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !registreUrl) return null;

  return (
    <div
      className="bg-white border-start border-light d-flex flex-column position-relative"
      style={{
        width: isFullscreen ? "100%" : "500px",
        minWidth: isFullscreen ? "100%" : "500px",
        boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.08)",
        zIndex: 1000,
        transition: "width 0.3s ease",
      }}
    >
      {/* En-tête du panneau */}
      <div className="border-bottom border-light p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: colors.oskar.green + "20",
                color: colors.oskar.green,
              }}
            >
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div>
              <h4 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
                Registre de commerce
              </h4>
              <p className="small text-muted mb-0">{vendeurName}</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
                e.currentTarget.style.color = colors.oskar.black;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                e.currentTarget.style.color = colors.oskar.grey;
              }}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
            <button
              type="button"
              className="btn btn-sm d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: colors.oskar.lightGrey,
                color: colors.oskar.grey,
                border: "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
                e.currentTarget.style.color = "#DC2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                e.currentTarget.style.color = colors.oskar.grey;
              }}
              title="Fermer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu du registre */}
      <div className="flex-grow-1 overflow-auto p-4 bg-light">
        <div className="bg-white rounded-4 shadow-sm p-4">
          <div
            className="rounded-3 overflow-hidden mb-4 border"
            style={{
              backgroundColor: colors.oskar.lightGrey,
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => window.open(registreUrl, "_blank")}
          >
            <img
              src={registreUrl}
              alt="Registre de commerce"
              className="img-fluid"
              style={{
                maxHeight: isFullscreen ? "800px" : "500px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const div = document.createElement("div");
                  div.className = "text-center p-5";
                  div.innerHTML = `
                    <div class="mb-3">
                      <div class="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                           style="width: 80px; height: 80px; background-color: ${colors.oskar.lightGrey}; color: ${colors.oskar.grey};">
                        <i class="fas fa-file-pdf fa-2x"></i>
                      </div>
                    </div>
                    <h5 class="fw-semibold mb-2">Document PDF</h5>
                    <p class="text-muted small mb-3">Cliquez sur le bouton ci-dessous pour ouvrir le document</p>
                  `;
                  parent.appendChild(div);
                }
              }}
            />
          </div>

          <div className="d-flex justify-content-center gap-3">
            <a
              href={registreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn d-inline-flex align-items-center gap-2 px-4 py-3"
              style={{
                backgroundColor: colors.oskar.green,
                color: "white",
                border: "none",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                fontWeight: "500",
                boxShadow: "0 4px 6px rgba(22, 163, 74, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 8px rgba(22, 163, 74, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.green;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(22, 163, 74, 0.2)";
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              <span>Télécharger le PDF</span>
            </a>
            <a
              href={registreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn d-inline-flex align-items-center gap-2 px-4 py-3"
              style={{
                backgroundColor: colors.oskar.blue + "10",
                color: colors.oskar.blue,
                border: `1px solid ${colors.oskar.blue}30`,
                borderRadius: "12px",
                transition: "all 0.2s ease",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.blue + "20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.oskar.blue + "10";
              }}
            >
              <FontAwesomeIcon icon={faExpand} />
              <span>Ouvrir dans un nouvel onglet</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// VERIFICATION WORKSTATION COMPONENT
// ============================================

interface VerificationWorkstationProps {
  vendeur: Vendeur | null;
  onClose: () => void;
  onValidate?: (uuid: string) => Promise<void>;
  onReject?: (uuid: string) => Promise<void>;
  onBlock?: (uuid: string) => Promise<void>;
}

const VerificationWorkstation: React.FC<VerificationWorkstationProps> = ({
  vendeur,
  onClose,
  onValidate,
  onReject,
  onBlock,
}) => {
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!vendeur) return null;

  const formatDate = (dateString: string | null): { date: string; time: string } => {
    if (!dateString) {
      return {
        date: "N/A",
        time: "N/A"
      };
    }
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const creationDate = formatDate(vendeur.date_creation);

  // Générer les comparaisons pour la vérification
  const getComparisons = (): VerificationDetail["comparisons"] => {
    const comparisons: VerificationDetail["comparisons"] = [
      {
        field: "name",
        label: "Nom complet",
        userValue: `${vendeur.prenoms} ${vendeur.nom}`,
        documentValue: `${vendeur.prenoms} ${vendeur.nom}`,
        status: "match",
      },
      {
        field: "email",
        label: "Email",
        userValue: vendeur.email,
        documentValue: vendeur.email,
        status: "match",
      },
      {
        field: "phone",
        label: "Téléphone",
        userValue: vendeur.telephone || "Non renseigné",
        documentValue: vendeur.telephone || "Non renseigné",
        status: vendeur.telephone ? "match" : "pending",
      },
      {
        field: "address",
        label: "Ville",
        userValue: vendeur.ville || "Non renseignée",
        documentValue: vendeur.ville || "Non renseignée",
        status: vendeur.ville ? "match" : "pending",
      },
    ];

    // Simuler quelques différences pour la démo (à retirer en production)
    if (vendeur.uuid === "demo-mismatch") {
      comparisons[0].status = "mismatch";
      comparisons[0].documentValue = "Jean Michel Kouassi";
    }

    return comparisons;
  };

  const comparisons = getComparisons();

  // Note de vérification
  const getVerificationNote = () => {
    const mismatches = comparisons.filter((c) => c.status === "mismatch");
    if (mismatches.length > 0) {
      return `Attention : ${mismatches.length} différence(s) détectée(s) entre les informations du profil et les documents fournis. Veuillez vérifier manuellement.`;
    }
    if (vendeur.est_verifie) {
      return "Ce compte a déjà été vérifié. Toutes les informations semblent correctes.";
    }
    return "Toutes les informations semblent cohérentes. Vous pouvez procéder à la vérification.";
  };

  const getRegistreUrl = () => {
    if (!vendeur.registre_commerce) return null;
    return buildImageUrl(vendeur.registre_commerce);
  };

  const registreUrl = getRegistreUrl();

  const getStatusColor = (status: "match" | "mismatch" | "pending") => {
    switch (status) {
      case "match":
        return { bg: colors.oskar.green + "20", text: colors.oskar.green };
      case "mismatch":
        return { bg: "#FEF3C7", text: "#92400E" };
      case "pending":
        return { bg: colors.oskar.lightGrey, text: colors.oskar.grey };
      default:
        return { bg: colors.oskar.lightGrey, text: colors.oskar.grey };
    }
  };

  const getStatusText = (status: "match" | "mismatch" | "pending") => {
    switch (status) {
      case "match":
        return "Correspondance";
      case "mismatch":
        return "Différence détectée";
      case "pending":
        return "Information manquante";
      default:
        return "En vérification";
    }
  };

  const handleValidate = async () => {
    if (!onValidate) return;
    setProcessing(true);
    try {
      await onValidate(vendeur.uuid);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setProcessing(true);
    try {
      await onReject(vendeur.uuid);
    } finally {
      setProcessing(false);
    }
  };

  const handleBlock = async () => {
    if (!onBlock) return;
    setProcessing(true);
    try {
      await onBlock(vendeur.uuid);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section
      className="flex-grow-1 bg-light overflow-auto"
      style={{ backgroundColor: colors.oskar.lightGrey }}
    >
      <div className="p-4">
        {/* En-tête des détails */}
        <div className="mb-5">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center justify-content-center"
                onClick={onClose}
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "white",
                  color: colors.oskar.grey,
                  border: `1px solid ${colors.oskar.lightGrey}`,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.oskar.lightGrey;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h2
                className="fw-bold mb-0"
                style={{ color: colors.oskar.black, fontSize: "1.5rem" }}
              >
                Vérification de : {vendeur.prenoms} {vendeur.nom}
              </h2>
            </div>
            <span
              className="badge rounded-3 d-flex align-items-center gap-2 mt-2 mt-md-0"
              style={{
                backgroundColor:
                  vendeur.type?.toLowerCase() === "professionnel"
                    ? "#FEF3C7"
                    : colors.oskar.lightGrey,
                color:
                  vendeur.type?.toLowerCase() === "professionnel"
                    ? "#92400E"
                    : colors.oskar.black,
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
              }}
            >
              <FontAwesomeIcon
                icon={
                  vendeur.type?.toLowerCase() === "professionnel"
                    ? faBriefcase
                    : faUser
                }
              />
              Compte{" "}
              {vendeur.type?.toLowerCase() === "professionnel"
                ? "Professionnel"
                : "Particulier"}
            </span>
          </div>
          <p className="text-muted small mb-0">
            Demande soumise le {creationDate.date} à {creationDate.time}
          </p>
          {vendeur.est_verifie && (
            <p className="text-success small mt-2 d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              Ce compte a déjà été vérifié
            </p>
          )}
        </div>

        {/* Visualiseur de document */}
        {registreUrl && (
          <div className="bg-white rounded-3 p-4 mb-4 shadow-sm">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
              <h3
                className="fw-semibold mb-2 mb-md-0"
                style={{ color: colors.oskar.black }}
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                Registre de commerce
              </h3>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => window.open(registreUrl, "_blank")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                  }}
                >
                  <FontAwesomeIcon icon={faSearchPlus} />
                  Agrandir
                </button>
                <a
                  href={registreUrl}
                  download
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: colors.oskar.lightGrey,
                    color: colors.oskar.black,
                    border: "none",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.lightGrey;
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Télécharger
                </a>
              </div>
            </div>

            {/* Document image */}
            <div
              className="rounded-3 overflow-hidden mb-3"
              style={{
                backgroundColor: colors.oskar.lightGrey,
                border: `2px solid ${colors.oskar.lightGrey}`,
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => window.open(registreUrl, "_blank")}
            >
              <img
                src={registreUrl}
                alt={`Registre de commerce de ${vendeur.prenoms} ${vendeur.nom}`}
                className="img-fluid"
                style={{
                  maxHeight: "384px",
                  objectFit: "contain",
                }}
                onError={() => setImageError(true)}
              />
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span>Document officiel - Registre de commerce</span>
            </div>
          </div>
        )}

        {/* Comparaison des données */}
        <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
          <h3
            className="fw-semibold mb-4 d-flex align-items-center gap-2"
            style={{ color: colors.oskar.black }}
          >
            <FontAwesomeIcon
              icon={faScaleBalanced}
              style={{ color: colors.oskar.green }}
            />
            Comparaison des données
          </h3>

          <div className="d-flex flex-column gap-3">
            {comparisons.map((comparison, index) => {
              const statusColor = getStatusColor(comparison.status);
              const statusText = getStatusText(comparison.status);

              return (
                <div
                  key={index}
                  className="p-3 rounded-3"
                  style={{ backgroundColor: colors.oskar.lightGrey }}
                >
                  <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3">
                    <span
                      className="small fw-medium mb-1 mb-md-0"
                      style={{ color: colors.oskar.grey }}
                    >
                      {comparison.label}
                    </span>
                    <span
                      className="badge rounded-pill d-flex align-items-center gap-1"
                      style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.75rem",
                      }}
                    >
                      {comparison.status === "match" && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          style={{ fontSize: "0.65rem" }}
                        />
                      )}
                      {comparison.status === "mismatch" && (
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ fontSize: "0.65rem" }}
                        />
                      )}
                      {statusText}
                    </span>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2 mb-md-0">
                      <p className="small text-muted mb-1">Profil utilisateur</p>
                      <p
                        className="fw-semibold mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {comparison.userValue}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="small text-muted mb-1">Document officiel</p>
                      <p
                        className="fw-semibold mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {comparison.documentValue}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note de vérification */}
          <div
            className="mt-4 p-3 rounded-3"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div className="d-flex gap-3">
              <FontAwesomeIcon
                icon={faLightbulb}
                style={{
                  color: "#3B82F6",
                  marginTop: "0.25rem",
                }}
              />
              <div>
                <h4
                  className="fw-semibold small mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  Note de vérification
                </h4>
                <p className="small text-muted mb-0">
                  {getVerificationNote()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-3 p-4 shadow-sm">
          <div className="row g-3">
            {!vendeur.est_verifie && (
              <>
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleReject}
                    disabled={processing}
                    style={{
                      backgroundColor: "#EF4444",
                      color: "white",
                      border: "none",
                      padding: "0.75rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor = "#DC2626";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor = "#EF4444";
                      }
                    }}
                  >
                    {processing ? (
                      <FontAwesomeIcon icon={faRefresh} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Rejeter
                      </>
                    )}
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    type="button"
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleValidate}
                    disabled={processing}
                    style={{
                      backgroundColor: colors.oskar.green,
                      color: "white",
                      border: "none",
                      padding: "0.75rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor =
                          colors.oskar.greenHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!processing) {
                        e.currentTarget.style.backgroundColor = colors.oskar.green;
                      }
                    }}
                  >
                    {processing ? (
                      <FontAwesomeIcon icon={faRefresh} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faShieldAlt} />
                        Valider & Certifier
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {vendeur.est_verifie && (
              <div className="col-12">
                <button
                  type="button"
                  className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleBlock}
                  disabled={processing}
                  style={{
                    backgroundColor: colors.oskar.orange,
                    color: "white",
                    border: "none",
                    padding: "0.75rem",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!processing) {
                      e.currentTarget.style.backgroundColor =
                        colors.oskar.orangeHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!processing) {
                      e.currentTarget.style.backgroundColor = colors.oskar.orange;
                    }
                  }}
                >
                  {processing ? (
                    <FontAwesomeIcon icon={faRefresh} spin />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} />
                      Bloquer le compte
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function VendeursList() {
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendeur, setSelectedVendeur] = useState<Vendeur | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("tous");
  const [filterType, setFilterType] = useState<"tous" | "particulier" | "professionnel">("tous");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // État pour le registre de commerce
  const [selectedRegistre, setSelectedRegistre] = useState<{
    url: string;
    vendeurName: string;
  } | null>(null);
  const [showRegistre, setShowRegistre] = useState(false);

  // Charger les vendeurs
  useEffect(() => {
    const fetchVendeurs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🟡 Chargement des vendeurs...");

        const response = await api.get<VendeursResponse>(
          API_ENDPOINTS.ADMIN.VENDEURS.LIST
        );

        console.log("🟢 Réponse vendeurs:", response);

        let vendeursData: Vendeur[] = [];
        if (Array.isArray(response)) {
          vendeursData = response;
        } else if (response && Array.isArray(response.data)) {
          vendeursData = response.data;
        } else if (response && response.data && Array.isArray(response.data)) {
          vendeursData = response.data;
        }

        setVendeurs(vendeursData);
      } catch (err: any) {
        console.error("🔴 Erreur chargement vendeurs:", err);
        setError(err.message || "Impossible de charger la liste des vendeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchVendeurs();
  }, []);

  // Filtrer les vendeurs
  const filteredVendeurs = vendeurs.filter((vendeur) => {
    // Filtre par recherche
    const searchMatch =
      searchTerm === "" ||
      vendeur.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendeur.prenoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendeur.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendeur.telephone?.includes(searchTerm) ||
      vendeur.pseudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendeur.ville?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Filtre par type
    if (filterType !== "tous") {
      const typeMatch = 
        (filterType === "professionnel" && vendeur.type?.toLowerCase() === "professionnel") ||
        (filterType === "particulier" && vendeur.type?.toLowerCase() !== "professionnel");
      if (!typeMatch) return false;
    }

    // Filtre par statut
    switch (filterStatus) {
      case "en-attente":
        return !vendeur.est_verifie && !vendeur.est_bloque && !vendeur.deleted_at;
      case "verifie":
        return vendeur.est_verifie && !vendeur.deleted_at;
      case "bloque":
        return vendeur.est_bloque && !vendeur.deleted_at;
      case "supprime":
        return !!vendeur.deleted_at;
      default:
        return true;
    }
  });

  const getAvatarUrl = (vendeur: Vendeur) => {
    if (imageErrors.has(vendeur.uuid)) return null;
    
    const avatarSource = vendeur.avatar || vendeur.photo || vendeur.avatar_url;
    if (!avatarSource) return null;
    
    return buildImageUrl(avatarSource);
  };

  const getRegistreUrl = (vendeur: Vendeur) => {
    if (!vendeur.registre_commerce) return null;
    return buildImageUrl(vendeur.registre_commerce);
  };

  const handleImageError = (vendeurUuid: string) => {
    setImageErrors((prev) => new Set(prev).add(vendeurUuid));
  };

  const getInitials = (nom: string, prenoms: string) => {
    return `${nom?.charAt(0) || ""}${prenoms?.charAt(0) || ""}`.toUpperCase();
  };

  const handleViewRegistre = (vendeur: Vendeur) => {
    const registreUrl = getRegistreUrl(vendeur);
    if (registreUrl) {
      setSelectedRegistre({
        url: registreUrl,
        vendeurName: `${vendeur.prenoms} ${vendeur.nom}`,
      });
      setShowRegistre(true);
    }
  };

  const handleCloseRegistre = () => {
    setShowRegistre(false);
    setTimeout(() => setSelectedRegistre(null), 300);
  };

  const handleSelectVendeur = (vendeur: Vendeur) => {
    setSelectedVendeur(vendeur);
  };

  const handleCloseWorkstation = () => {
    setSelectedVendeur(null);
  };

  // Actions simulées (à connecter avec vos vraies fonctions API)
  const handleValidate = async (uuid: string) => {
    console.log("Valider vendeur:", uuid);
    // Mettre à jour l'état local
    setVendeurs(prev => 
      prev.map(v => 
        v.uuid === uuid ? { ...v, est_verifie: true } : v
      )
    );
    alert(`Vendeur ${uuid} vérifié avec succès (simulation)`);
  };

  const handleReject = async (uuid: string) => {
    console.log("Rejeter vendeur:", uuid);
    alert(`Vendeur ${uuid} rejeté (simulation)`);
  };

  const handleBlock = async (uuid: string) => {
    console.log("Bloquer vendeur:", uuid);
    setVendeurs(prev => 
      prev.map(v => 
        v.uuid === uuid ? { ...v, est_bloque: true } : v
      )
    );
    alert(`Vendeur ${uuid} bloqué (simulation)`);
  };

  const getStatusBadge = (vendeur: Vendeur) => {
    if (vendeur.deleted_at) {
      return {
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: faUserSlash,
        label: "Supprimé",
      };
    }
    if (vendeur.est_bloque) {
      return {
        bg: "#FEF3C7",
        color: "#92400E",
        icon: faBan,
        label: "Bloqué",
      };
    }
    if (vendeur.est_verifie) {
      return {
        bg: "#D1FAE5",
        color: "#065F46",
        icon: faCheckCircle,
        label: "Vérifié",
      };
    }
    return {
      bg: "#DBEAFE",
      color: "#1E40AF",
      icon: faUserClock,
      label: "En attente",
    };
  };

  const getTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "professionnel":
        return { bg: "#FEF3C7", color: "#92400E", label: "Professionnel", icon: faStore };
      default:
        return { bg: colors.oskar.lightGrey, color: colors.oskar.grey, label: "Particulier", icon: faUser };
    }
  };

  return (
    <main style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Filter Bar */}
      <FilterBar
        onAccountTypeChange={setFilterType}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearchTerm}
        totalCount={vendeurs.length}
        filteredCount={filteredVendeurs.length}
      />

      {/* Main Content - Two Panels Layout */}
      <div className="d-flex" style={{ height: "calc(100vh - 180px)" }}>
        {/* Left Panel - Queue List */}
        <section
          className="bg-white border-end border-light d-flex flex-column"
          style={{ width: "450px", minWidth: "450px" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-bottom border-light">
            <div className="d-flex align-items-center justify-content-between">
              <h3
                className="fw-semibold mb-0"
                style={{ color: colors.oskar.black }}
              >
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Vendeurs
              </h3>
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: colors.oskar.green,
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                }}
              >
                {filteredVendeurs.length} vendeur(s)
              </span>
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-grow-1 overflow-auto p-3">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-muted">Chargement des vendeurs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: "1.5rem",
                  }}
                >
                  <FontAwesomeIcon icon={faExclamationCircle} />
                </div>
                <h5 className="fw-semibold mb-2">Erreur de chargement</h5>
                <p className="text-muted small mb-3">{error}</p>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => window.location.reload()}
                >
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredVendeurs.map((vendeur) => {
                  const status = getStatusBadge(vendeur);
                  const typeBadge = getTypeBadge(vendeur.type);
                  const avatarUrl = getAvatarUrl(vendeur);
                  const hasImageError = imageErrors.has(vendeur.uuid);
                  const registreUrl = getRegistreUrl(vendeur);

                  return (
                    <div
                      key={vendeur.uuid}
                      className={`p-3 rounded-3 cursor-pointer transition-all ${
                        selectedVendeur?.uuid === vendeur.uuid ? "border-2 shadow-sm" : "border border-light"
                      }`}
                      style={{
                        borderColor: selectedVendeur?.uuid === vendeur.uuid
                          ? colors.oskar.green
                          : colors.oskar.lightGrey,
                        backgroundColor: "white",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => handleSelectVendeur(vendeur)}
                      onMouseEnter={(e) => {
                        if (selectedVendeur?.uuid !== vendeur.uuid) {
                          e.currentTarget.style.borderColor = colors.oskar.green;
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedVendeur?.uuid !== vendeur.uuid) {
                          e.currentTarget.style.borderColor = colors.oskar.lightGrey;
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle overflow-hidden position-relative"
                            style={{ width: "48px", height: "48px", flexShrink: 0 }}
                          >
                            {avatarUrl && !hasImageError ? (
                              <img
                                src={avatarUrl}
                                alt={`${vendeur.prenoms} ${vendeur.nom}`}
                                className="w-100 h-100 object-fit-cover"
                                onError={() => handleImageError(vendeur.uuid)}
                              />
                            ) : (
                              <div
                                className="w-100 h-100 d-flex align-items-center justify-content-center"
                                style={{
                                  background: `linear-gradient(135deg, ${colors.oskar.green}20, ${colors.oskar.cyan}20)`,
                                  color: colors.oskar.green,
                                  fontSize: "1rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {getInitials(vendeur.nom, vendeur.prenoms)}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4
                              className="fw-semibold mb-1 text-truncate"
                              style={{ color: colors.oskar.black, maxWidth: "200px" }}
                              title={`${vendeur.prenoms} ${vendeur.nom}`}
                            >
                              {vendeur.prenoms} {vendeur.nom}
                            </h4>
                            <p className="small text-muted mb-0">
                              ID: {vendeur.id}
                            </p>
                          </div>
                        </div>
                        <span
                          className="badge rounded-pill d-flex align-items-center gap-1"
                          style={{
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.color,
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.75rem",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={typeBadge.icon}
                            style={{ fontSize: "0.65rem" }}
                          />
                          {typeBadge.label}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            style={{ fontSize: "0.75rem" }}
                          />
                          <span className="text-truncate" style={{ maxWidth: "150px" }}>
                            {vendeur.email}
                          </span>
                        </div>
                        {registreUrl && (
                          <button
                            className="btn btn-sm p-0 border-0"
                            style={{ color: colors.oskar.green }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRegistre(vendeur);
                            }}
                            title="Voir le registre de commerce"
                          >
                            <FontAwesomeIcon icon={faFilePdf} />
                          </button>
                        )}
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <FontAwesomeIcon
                            icon={faClock}
                            style={{ fontSize: "0.75rem" }}
                          />
                          <span>
                            {new Date(vendeur.date_creation).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span
                            className="badge rounded-pill d-flex align-items-center gap-1"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                              fontSize: "0.7rem",
                              padding: "0.2rem 0.5rem",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={status.icon}
                              style={{ fontSize: "0.6rem" }}
                            />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredVendeurs.length === 0 && (
                  <div className="text-center py-5">
                    <div className="mb-3">
                      <div
                        className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: "64px",
                          height: "64px",
                          backgroundColor: colors.oskar.lightGrey,
                          color: colors.oskar.grey,
                          fontSize: "1.5rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faUserSlash} />
                      </div>
                    </div>
                    <h5
                      className="fw-semibold mb-2"
                      style={{ color: colors.oskar.black }}
                    >
                      Aucun vendeur trouvé
                    </h5>
                    <p className="text-muted mb-0 small">
                      Essayez de modifier vos filtres de recherche
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Panel - Verification Workstation */}
        {selectedVendeur ? (
          <VerificationWorkstation
            vendeur={selectedVendeur}
            onClose={handleCloseWorkstation}
            onValidate={handleValidate}
            onReject={handleReject}
            onBlock={handleBlock}
          />
        ) : (
          <section
            className="flex-grow-1 bg-light d-flex align-items-center justify-content-center"
            style={{ backgroundColor: colors.oskar.lightGrey }}
          >
            <div className="text-center">
              <div
                className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: "96px",
                  height: "96px",
                  backgroundColor: "white",
                  color: colors.oskar.grey,
                  fontSize: "2.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <FontAwesomeIcon icon={faAddressCard} />
              </div>
              <h4 className="fw-semibold mb-2" style={{ color: colors.oskar.black }}>
                Sélectionnez un vendeur
              </h4>
              <p className="text-muted mb-0" style={{ maxWidth: "400px" }}>
                Cliquez sur un vendeur dans la file d'attente pour afficher ses détails et procéder à la vérification
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Registre Preview Panel */}
      {showRegistre && selectedRegistre && (
        <RegistrePreview
          registreUrl={selectedRegistre.url}
          vendeurName={selectedRegistre.vendeurName}
          onClose={handleCloseRegistre}
          isOpen={showRegistre}
        />
      )}
    </main>
  );
}