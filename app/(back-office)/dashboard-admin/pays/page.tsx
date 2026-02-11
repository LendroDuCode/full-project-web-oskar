"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faCheckCircle,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faTimes,
  faGlobe,
  faFlag,
  faMapMarkerAlt,
  faLanguage,
  faUsers,
  faCalendar,
  faCopy,
  faExclamationTriangle,
  faSync,
  faInfoCircle,
  faLayerGroup,
  faToggleOn,
  faToggleOff,
  faGlobeAmericas,
  faCity,
  faEarthAfrica,
  faEarthAmericas,
  faEarthAsia,
  faEarthEurope,
  faEarthOceania,
  faCode,
  faClock,
  faCalendarAlt,
  faHistory,
  faCog,
  faList,
  faQuestionCircle,
  faDatabase, // AJOUTÉ: Import manquant
  faPhone,
  faMoneyBill,
  faLanguage as faLang,
  faUsers as faUsersIcon,
  faMountain,
  faClock as faClockIcon,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import CreatePaysModal from "./components/modals/CreatePaysModal";
import EditPaysModal from "./components/modals/EditPaysModal";
import { useRouter } from "next/navigation";
import ViewPaysModal from "./components/modals/ViewPaysModal";

// Interface Pays
interface Pays {
  uuid: string;
  id: number;
  nom: string;
  code: string;
  code_iso: string;
  indicatif: string;
  devise: string;
  langue: string;
  continent: string;
  capitale: string;
  population: number;
  superficie: number;
  fuseau_horaire: string;
  domaine_internet: string;
  statut: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updatedAt: string;
}

// Interface pour l'état de sélection
interface SelectionState {
  allSelected: boolean;
  selectedIds: Set<string>;
}

// Composant de badge de statut
const StatusBadge = ({
  statut,
  is_deleted,
}: {
  statut: string;
  is_deleted: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span className="fw-semibold">Supprimé</span>
      </span>
    );
  }

  switch (statut) {
    case "actif":
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
          <span className="fw-semibold">Actif</span>
        </span>
      );
    case "inactif":
      return (
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faExclamationTriangle} className="fs-12" />
          <span className="fw-semibold">Inactif</span>
        </span>
      );
    default:
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1">
          <FontAwesomeIcon icon={faFlag} className="fs-12" />
          <span className="fw-semibold">{statut || "Inconnu"}</span>
        </span>
      );
  }
};

// Composant de badge de continent - CORRIGÉ
const ContinentBadge = ({ continent }: { continent?: string | null }) => {
  if (!continent || continent.trim() === "") {
    return (
      <span
        className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
        style={{
          backgroundColor: `${colors.oskar.grey}15`,
          color: colors.oskar.grey,
          border: `1px solid ${colors.oskar.grey}30`,
          borderRadius: "20px",
        }}
      >
        <FontAwesomeIcon icon={faQuestionCircle} className="fs-12" />
        <span className="fw-semibold">Non spécifié</span>
      </span>
    );
  }

  const getContinentConfig = (continentName: string) => {
    const continentLower = continentName.toLowerCase();
    if (continentLower.includes("afrique")) {
      return {
        icon: faEarthAfrica,
        color: "success",
        bgColor: colors.oskar.green,
        textColor: colors.oskar.green,
      };
    } else if (continentLower.includes("europe")) {
      return {
        icon: faEarthEurope,
        color: "primary",
        bgColor: colors.oskar.blue,
        textColor: colors.oskar.blue,
      };
    } else if (
      continentLower.includes("asie") ||
      continentLower.includes("asia")
    ) {
      return {
        icon: faEarthAsia,
        color: "warning",
        bgColor: colors.oskar.orange,
        textColor: colors.oskar.orange,
      };
    } else if (
      continentLower.includes("amérique") ||
      continentLower.includes("america")
    ) {
      return {
        icon: faEarthAmericas,
        color: "danger",
        bgColor: colors.oskar.red,
        textColor: colors.oskar.red,
      };
    } else if (
      continentLower.includes("océanie") ||
      continentLower.includes("oceania")
    ) {
      return {
        icon: faEarthOceania,
        color: "info",
        bgColor: colors.oskar.cyan,
        textColor: colors.oskar.cyan,
      };
    } else {
      return {
        icon: faGlobe,
        color: "secondary",
        bgColor: colors.oskar.grey,
        textColor: colors.oskar.grey,
      };
    }
  };

  const config = getContinentConfig(continent);

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
      style={{
        backgroundColor: `${config.bgColor}15`,
        color: config.textColor,
        border: `1px solid ${config.bgColor}30`,
        borderRadius: "20px",
      }}
    >
      <FontAwesomeIcon icon={config.icon} className="fs-12" />
      <span className="fw-semibold">{continent}</span>
    </span>
  );
};

// Fonction pour formater les grands nombres
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("fr-FR").format(num);
};

// Fonction pour formater la date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
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
    return "N/A";
  }
};

// Fonction pour formater la date sans heure
const formatDateOnly = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
};

// Composant Modal de Confirmation de Suppression
const DeleteConfirmationModal = ({
  show,
  pays,
  onClose,
  onConfirm,
  loading,
}: {
  show: boolean;
  pays: Pays | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => {
  if (!show || !pays) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-danger text-white border-0">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Confirmation de suppression
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body py-4">
            <div className="d-flex align-items-start gap-3">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                <FontAwesomeIcon icon={faTrash} className="text-danger fs-4" />
              </div>
              <div>
                <h6 className="fw-bold mb-2">
                  Êtes-vous sûr de vouloir supprimer ce pays ?
                </h6>
                <p className="text-muted mb-3">
                  Cette action supprimera définitivement le pays{" "}
                  <strong className="text-danger">{pays.nom}</strong> (
                  {pays.code}) du système. Cette action est irréversible.
                </p>
                <div className="alert alert-warning bg-opacity-10 border-warning mb-0">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  <strong>Attention :</strong> Toutes les données associées à ce
                  pays seront également supprimées.
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Suppression en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} />
                  Oui, supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PaysPage() {
  const router = useRouter();

  // États pour les données
  const [paysList, setPaysList] = useState<Pays[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pays;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selection, setSelection] = useState<SelectionState>({
    allSelected: false,
    selectedIds: new Set<string>(),
  });

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  const fetchPays = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching pays from:", API_ENDPOINTS.PAYS.LIST);

      // Utiliser l'API avec une gestion d'erreur améliorée
      const response = await api.get<any>(API_ENDPOINTS.PAYS.LIST);

      console.log("🔍 API RESPONSE:", {
        status: response?.status,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        dataIsArray: Array.isArray(response?.data),
        fullResponse: response,
      });

      // Log plus détaillé pour debug
      if (response?.data) {
        console.log("📊 Data structure:", Object.keys(response.data));
        console.log("📊 First item sample:", response.data[0]);
      }

      // Extraire les données selon différentes structures possibles
      let paysData: Pays[] = [];

      if (Array.isArray(response)) {
        paysData = response;
      } else if (response && Array.isArray(response.data)) {
        paysData = response.data;
      } else if (response?.data && Array.isArray(response.data.data)) {
        paysData = response.data.data;
      } else if (response && typeof response === "object") {
        // Chercher un tableau dans l'objet
        const arrayKeys = Object.keys(response).filter((key) =>
          Array.isArray(response[key as keyof typeof response]),
        );
        if (arrayKeys.length > 0) {
          paysData = response[arrayKeys[0] as keyof typeof response] as Pays[];
        }
      }

      console.log("✅ Extracted pays data:", {
        count: paysData.length,
        firstItem: paysData[0],
      });

      if (paysData.length > 0) {
        // Nettoyer les données
        const cleanedData = paysData.map((pays) => ({
          ...pays,
          continent: pays.continent || "Non spécifié",
          capitale: pays.capitale || "N/A",
          devise: pays.devise || "N/A",
          langue: pays.langue || "N/A",
          code_iso: pays.code_iso || "N/A",
          fuseau_horaire: pays.fuseau_horaire || "N/A",
          domaine_internet: pays.domaine_internet || "N/A",
          population: pays.population || 0,
          superficie: pays.superficie || 0,
          indicatif: pays.indicatif || "N/A",
          created_at: pays.created_at || new Date().toISOString(),
          updatedAt: pays.updatedAt || new Date().toISOString(),
          is_deleted: pays.is_deleted || false,
          statut: pays.statut || "inactif",
        }));

        setPaysList(cleanedData);
        setPagination((prev) => ({
          ...prev,
          total: response?.total || response?.data?.total || paysData.length,
          pages: Math.ceil(
            (response?.total || response?.data?.total || paysData.length) /
              prev.limit,
          ),
        }));
        setSelection({
          allSelected: false,
          selectedIds: new Set(),
        });
      } else {
        setError("Aucune donnée de pays trouvée");
        setPaysList([]);
        setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
      }
    } catch (err: any) {
      console.error("❌ Error fetching pays:", err);

      // Message d'erreur plus informatif
      if (err.response?.status === 404) {
        setError(
          "L'endpoint API des pays n'a pas été trouvé. Vérifiez la configuration.",
        );
      } else if (err.response?.status === 401) {
        setError(
          "Vous n'êtes pas autorisé à accéder aux données. Veuillez vous reconnecter.",
        );
      } else if (err.message?.includes("Network")) {
        setError("Erreur de réseau. Vérifiez votre connexion Internet.");
      } else {
        setError(err.message || "Erreur lors du chargement des pays");
      }

      setPaysList([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour supprimer un pays
  const deletePays = async (uuid: string) => {
    try {
      setActionLoading(true);

      // Utiliser l'endpoint DELETE avec le bon format
      const endpoint = API_ENDPOINTS.PAYS.DELETE(uuid);
      console.log("🗑️ Deleting pays with endpoint:", endpoint);

      await api.delete(endpoint);

      // Mettre à jour localement
      setPaysList((prev) => prev.filter((pays) => pays.uuid !== uuid));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      return true;
    } catch (err: any) {
      console.error("❌ Error deleting pays:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Fonction pour basculer le statut d'un pays
  const togglePaysStatus = async (uuid: string) => {
    try {
      setActionLoading(true);

      const pays = paysList.find((p) => p.uuid === uuid);
      if (!pays) throw new Error("Pays non trouvé");

      const newStatus = pays.statut === "actif" ? "inactif" : "actif";

      console.log(
        "🔄 Toggling status for pays:",
        uuid,
        "from",
        pays.statut,
        "to",
        newStatus,
      );

      // Utiliser l'endpoint UPDATE avec les données correctes
      await api.put(API_ENDPOINTS.PAYS.UPDATE(uuid), {
        ...pays,
        statut: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Mettre à jour localement
      setPaysList((prev) =>
        prev.map((p) => (p.uuid === uuid ? { ...p, statut: newStatus } : p)),
      );

      return true;
    } catch (err: any) {
      console.error("❌ Error toggling pays status:", err);
      throw new Error(
        err.response?.data?.message || "Erreur lors du changement de statut",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Fonctions pour la sélection multiple
  const toggleSelectAll = useCallback(() => {
    setSelection((prev) => {
      const newAllSelected = !prev.allSelected;
      const visiblePays = getVisiblePays();

      if (newAllSelected) {
        const newSelectedIds = new Set(visiblePays.map((pays) => pays.uuid));
        return {
          allSelected: true,
          selectedIds: newSelectedIds,
        };
      } else {
        return {
          allSelected: false,
          selectedIds: new Set(),
        };
      }
    });
  }, [paysList, searchTerm, selectedStatus, selectedContinent]);

  const toggleSelectPays = useCallback((uuid: string) => {
    setSelection((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(uuid)) {
        newSelectedIds.delete(uuid);
      } else {
        newSelectedIds.add(uuid);
      }

      const visiblePays = getVisiblePays();
      const allVisibleSelected = visiblePays.every((pays) =>
        newSelectedIds.has(pays.uuid),
      );

      return {
        allSelected: allVisibleSelected,
        selectedIds: newSelectedIds,
      };
    });
  }, []);

  const getVisiblePays = () => {
    let filtered = [...paysList];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pays) =>
          (pays.nom?.toLowerCase() || "").includes(searchLower) ||
          (pays.code?.toLowerCase() || "").includes(searchLower) ||
          (pays.code_iso?.toLowerCase() || "").includes(searchLower) ||
          (pays.capitale?.toLowerCase() || "").includes(searchLower) ||
          (pays.continent?.toLowerCase() || "").includes(searchLower),
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((pays) => pays.statut === selectedStatus);
    }

    if (selectedContinent !== "all") {
      filtered = filtered.filter(
        (pays) => pays.continent === selectedContinent,
      );
    }

    return sortPays(filtered);
  };

  const getSelectedPays = () => {
    return paysList.filter((pays) => selection.selectedIds.has(pays.uuid));
  };

  const clearSelection = () => {
    setSelection({
      allSelected: false,
      selectedIds: new Set(),
    });
  };

  // ✅ Fonction pour gérer la suppression d'un pays
  const handleDeletePays = async () => {
    if (!selectedPays) return;

    try {
      await deletePays(selectedPays.uuid);

      setShowDeleteModal(false);
      setSelectedPays(null);

      setSuccessMessage(`Pays "${selectedPays.nom}" supprimé avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(err.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ Fonction pour basculer le statut d'un pays
  const handleToggleStatus = async (pays: Pays) => {
    try {
      await togglePaysStatus(pays.uuid);

      setSuccessMessage(
        `Pays "${pays.nom}" ${
          pays.statut === "actif" ? "désactivé" : "activé"
        } avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      setError(err.message || "Erreur lors du changement de statut");
      setTimeout(() => setError(null), 3000);
    }
  };

  // ✅ Fonction pour gérer la création d'un pays
  const handlePaysCreated = () => {
    setSuccessMessage("Pays créé avec succès !");
    fetchPays();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ✅ Fonction pour gérer la modification d'un pays
  const handlePaysUpdated = () => {
    setSuccessMessage("Pays modifié avec succès !");
    fetchPays();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ✅ Fonction de tri
  const sortPays = (paysList: Pays[]) => {
    if (!sortConfig || !paysList.length) return paysList;

    return [...paysList].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (sortConfig.key === "created_at" || sortConfig.key === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: keyof Pays) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Pays) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // ✅ Filtrer les pays basé sur la recherche
  const filteredPays = useMemo(() => {
    let filtered = [...paysList];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pays) =>
          (pays.nom?.toLowerCase() || "").includes(searchLower) ||
          (pays.code?.toLowerCase() || "").includes(searchLower) ||
          (pays.code_iso?.toLowerCase() || "").includes(searchLower) ||
          (pays.capitale?.toLowerCase() || "").includes(searchLower) ||
          (pays.continent?.toLowerCase() || "").includes(searchLower),
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((pays) => pays.statut === selectedStatus);
    }

    if (selectedContinent !== "all") {
      filtered = filtered.filter(
        (pays) => pays.continent === selectedContinent,
      );
    }

    return sortPays(filtered);
  }, [paysList, searchTerm, selectedStatus, selectedContinent, sortConfig]);

  // ✅ Calculer les éléments actuels avec pagination
  const currentItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredPays.slice(start, end);
  }, [filteredPays, pagination.page, pagination.limit]);

  // ✅ Calculer les statistiques
  const statistics = useMemo(() => {
    const activePays = paysList.filter(
      (pays) => pays.statut === "actif" && !pays.is_deleted,
    );
    const inactivePays = paysList.filter(
      (pays) => pays.statut !== "actif" && !pays.is_deleted,
    );
    const deletedPays = paysList.filter((pays) => pays.is_deleted);

    return {
      total: paysList.length,
      active: activePays.length,
      inactive: inactivePays.length,
      deleted: deletedPays.length,
      selected: selection.selectedIds.size,
    };
  }, [paysList, selection.selectedIds.size]);

  // ✅ Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedContinent("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  };

  // ✅ Obtenir les continents uniques
  const continents = useMemo(() => {
    if (!paysList.length) return [];
    const continentList = paysList
      .map((pays) => pays.continent || "Non spécifié")
      .filter(Boolean);
    return [...new Set(continentList)].sort();
  }, [paysList]);

  // Charger les pays au montage
  useEffect(() => {
    fetchPays();
  }, []);

  // Fonction pour copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setInfoMessage("Copié dans le presse-papier");
    setTimeout(() => setInfoMessage(null), 2000);
  };

  return (
    <>
      {/* Modal de création de pays */}
      <CreatePaysModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePaysCreated}
      />

      {/* Modal de modification de pays */}
      <EditPaysModal
        isOpen={showEditModal}
        pays={selectedPays}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPays(null);
        }}
        onSuccess={handlePaysUpdated}
      />

      {/* Modal ViewPaysModal */}
      <ViewPaysModal
        show={showViewModal}
        pays={selectedPays}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPays(null);
        }}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        pays={selectedPays}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPays(null);
        }}
        onConfirm={handleDeletePays}
        loading={actionLoading}
      />

      <div className="p-3 p-md-4">
        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Erreur:</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            <strong>Succès:</strong> {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
            ></button>
          </div>
        )}

        {infoMessage && (
          <div
            className="alert alert-info alert-dismissible fade show mb-4"
            role="alert"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            <strong>Information:</strong> {infoMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setInfoMessage(null)}
            ></button>
          </div>
        )}

        {/* Barre d'actions de sélection */}
        {selection.selectedIds.size > 0 && (
          <div
            className="alert alert-primary alert-dismissible fade show mb-4 border-0 shadow-sm"
            role="alert"
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h6 className="mb-1 fw-bold">
                    {selection.selectedIds.size} pays sélectionné(s)
                  </h6>
                  <p className="mb-0 text-muted">
                    {getSelectedPays()
                      .slice(0, 3)
                      .map((p) => p.nom)
                      .join(", ")}
                    {selection.selectedIds.size > 3 && "..."}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkActionsModal(true)}
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faLayerGroup} />
                  Actions groupées
                </button>

                <button
                  onClick={clearSelection}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={actionLoading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler la sélection
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faGlobe}
                      className="me-2 text-primary"
                    />
                    Gestion des Pays
                  </h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary d-flex align-items-center gap-1">
                    {statistics.total} pays
                    {statistics.active > 0 && (
                      <span className="badge bg-success ms-1">
                        {statistics.active} actif(s)
                      </span>
                    )}
                    {statistics.selected > 0 && (
                      <span className="badge bg-info ms-1">
                        {statistics.selected} sélectionné(s)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-muted mb-0 mt-2">
                  Gérez les pays disponibles dans le système
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchPays()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faSync} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Pays
                </button>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, code, capitale..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faGlobe} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedContinent}
                    onChange={(e) => {
                      setSelectedContinent(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous les continents</option>
                    {continents.map((continent) => (
                      <option key={continent} value={continent}>
                        {continent}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-muted"
                    />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                    disabled={loading}
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredPays.length}</strong> pays
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selection.selectedIds.size > 0 && (
                      <span className="ms-2 text-primary">
                        • <strong>{selection.selectedIds.size}</strong>{" "}
                        sélectionné(s)
                      </span>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex justify-content-end gap-2">
                  <button
                    onClick={resetFilters}
                    className="btn btn-outline-secondary btn-sm"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des pays */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">
                  <FontAwesomeIcon icon={faSync} spin className="me-2" />
                  Chargement des pays...
                </p>
              </div>
            ) : (
              <>
                {filteredPays.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <div className="bg-info bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faGlobe}
                          className="fs-1 text-info"
                        />
                      </div>
                      <h5 className="alert-heading">
                        {paysList.length === 0
                          ? "Aucun pays"
                          : "Aucun résultat"}
                      </h5>
                      <p className="mb-0">
                        {paysList.length === 0
                          ? "Aucun pays n'a été ajouté dans le système."
                          : "Aucun pays ne correspond à vos critères de recherche."}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-2" />
                          Ajouter un nouveau pays
                        </button>
                        {(searchTerm ||
                          selectedStatus !== "all" ||
                          selectedContinent !== "all") && (
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-secondary ms-2"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2" />
                            Effacer les filtres
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50px" }}>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selection.allSelected}
                                onChange={toggleSelectAll}
                                disabled={loading || actionLoading}
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("nom")}
                            >
                              Nom du Pays
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "100px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("code")}
                            >
                              <FontAwesomeIcon icon={faFlag} className="me-1" />
                              Code
                              {getSortIcon("code")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("continent")}
                            >
                              <FontAwesomeIcon
                                icon={faGlobe}
                                className="me-1"
                              />
                              Continent
                              {getSortIcon("continent")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <span className="fw-semibold">Capitale</span>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Statut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("created_at")}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé le
                              {getSortIcon("created_at")}
                            </button>
                          </th>
                          <th
                            style={{ width: "160px" }}
                            className="text-center"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((pays, index) => (
                          <tr
                            key={pays.uuid}
                            className="align-middle"
                            style={{
                              opacity: pays.is_deleted ? 0.6 : 1,
                              backgroundColor: selection.selectedIds.has(
                                pays.uuid,
                              )
                                ? "rgba(13, 110, 253, 0.05)"
                                : "transparent",
                            }}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selection.selectedIds.has(pays.uuid)}
                                  onChange={() => toggleSelectPays(pays.uuid)}
                                  disabled={actionLoading || pays.is_deleted}
                                />
                              </div>
                            </td>
                            <td className="text-center text-muted fw-semibold">
                              {(pagination.page - 1) * pagination.limit +
                                index +
                                1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                  <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                                      pays.statut === "actif"
                                        ? "bg-primary bg-opacity-10 text-primary"
                                        : "bg-secondary bg-opacity-10 text-secondary"
                                    }`}
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faFlag} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {pays.nom}
                                    {pays.is_deleted && (
                                      <span className="badge bg-dark bg-opacity-10 text-dark border border-dark ms-2 px-2 py-1">
                                        <FontAwesomeIcon
                                          icon={faTrash}
                                          className="fs-12 me-1"
                                        />
                                        Supprimé
                                      </span>
                                    )}
                                  </div>
                                  <div className="d-flex align-items-center mt-1">
                                    <code
                                      className="text-muted fs-12 me-2"
                                      style={{
                                        fontFamily: "monospace",
                                        cursor: "pointer",
                                        maxWidth: "150px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      onClick={() => copyToClipboard(pays.uuid)}
                                      title="Cliquer pour copier l'UUID"
                                    >
                                      {pays.uuid.substring(0, 8)}...
                                    </code>
                                    <FontAwesomeIcon
                                      icon={faCopy}
                                      className="fs-12 text-muted cursor-pointer"
                                      onClick={() => copyToClipboard(pays.uuid)}
                                      title="Copier l'UUID"
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <span className="badge bg-info bg-opacity-10 text-info border border-info px-2 py-1">
                                  {pays.code}
                                </span>
                                <small className="text-muted">
                                  ISO: {pays.code_iso || "N/A"}
                                </small>
                              </div>
                            </td>
                            <td>
                              <ContinentBadge continent={pays.continent} />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCity}
                                  className="text-muted me-2"
                                />
                                <span>{pays.capitale || "N/A"}</span>
                              </div>
                            </td>
                            <td>
                              <StatusBadge
                                statut={pays.statut}
                                is_deleted={pays.is_deleted}
                              />
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="text-muted me-2"
                                  />
                                  <small className="text-muted">
                                    {formatDateOnly(pays.created_at)}
                                  </small>
                                </div>
                                {pays.updatedAt &&
                                  pays.updatedAt !== pays.created_at && (
                                    <small className="text-muted mt-1">
                                      Modifié: {formatDateOnly(pays.updatedAt)}
                                    </small>
                                  )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                  onClick={() => {
                                    setSelectedPays(pays);
                                    setShowViewModal(true);
                                  }}
                                  disabled={actionLoading}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>

                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    setSelectedPays(pays);
                                    setShowEditModal(true);
                                  }}
                                  disabled={actionLoading || pays.is_deleted}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>

                                <button
                                  className={`btn ${
                                    pays.statut === "actif"
                                      ? "btn-outline-warning"
                                      : "btn-outline-success"
                                  }`}
                                  title={
                                    pays.statut === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(pays)}
                                  disabled={actionLoading || pays.is_deleted}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      pays.statut === "actif"
                                        ? faToggleOff
                                        : faToggleOn
                                    }
                                  />
                                </button>

                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => {
                                    setSelectedPays(pays);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={actionLoading || pays.is_deleted}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {filteredPays.length > pagination.limit && (
                      <div className="d-flex justify-content-between align-items-center p-3 border-top">
                        <div className="text-muted">
                          Affichage de{" "}
                          <strong>
                            {Math.min(
                              (pagination.page - 1) * pagination.limit + 1,
                              filteredPays.length,
                            )}
                          </strong>{" "}
                          à{" "}
                          <strong>
                            {Math.min(
                              pagination.page * pagination.limit,
                              filteredPays.length,
                            )}
                          </strong>{" "}
                          sur <strong>{filteredPays.length}</strong> pays
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.max(prev.page - 1, 1),
                              }))
                            }
                            disabled={pagination.page === 1}
                          >
                            Précédent
                          </button>
                          {Array.from(
                            { length: Math.min(5, pagination.pages) },
                            (_, i) => {
                              let pageNum = i + 1;
                              if (pagination.pages > 5) {
                                const half = Math.floor(5 / 2);
                                let start = pagination.page - half;
                                let end = pagination.page + half;

                                if (start < 1) {
                                  start = 1;
                                  end = 5;
                                }
                                if (end > pagination.pages) {
                                  end = pagination.pages;
                                  start = Math.max(1, end - 4);
                                }

                                pageNum = start + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  className={`btn btn-sm ${
                                    pagination.page === pageNum
                                      ? "btn-primary"
                                      : "btn-outline-secondary"
                                  }`}
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      page: pageNum,
                                    }))
                                  }
                                >
                                  {pageNum}
                                </button>
                              );
                            },
                          )}
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.min(prev.page + 1, pagination.pages),
                              }))
                            }
                            disabled={pagination.page === pagination.pages}
                          >
                            Suivant
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
