"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faRefresh,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faExchangeAlt,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faBan,
  faUsers,
  faPhone,
  faMoneyBillWave,
  faInfoCircle,
  faCheck,
  faTimes,
  faLayerGroup,
  faTag,
  faUser,
  faStore,
  faComment,
  faCheckSquare,
  faSquare,
  faDownload,
  faFileExport,
  faEyeSlash,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateEchangeModal from "../components/modals/CreateEchangeModal";
import EditEchangeModal from "../components/modals/EditEchangeModal";
import ViewEchangeModal from "../components/modals/ViewEchangeModal";

// ============ TYPES ============
interface EchangeVendeur {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string;
  image: string;
  typeDestinataire: string;
  typeEchange: string;
  agent: string;
  utilisateur: string;
  vendeur: string;
  objetPropose: string;
  objetDemande: string;
  estPublie: boolean | null;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  dateRefus: string | null;
  categorie: string;
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: any;
}

interface ApiResponse {
  status: string;
  data: EchangeVendeur[];
}

// ============ COMPOSANTS ============

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return {
          color: "warning",
          label: "En attente",
        };
      case "en_cours":
        return {
          color: "info",
          label: "En cours",
        };
      case "termine":
        return {
          color: "success",
          label: "Terminé",
        };
      case "annule":
        return {
          color: "danger",
          label: "Annulé",
        };
      default:
        return {
          color: "secondary",
          label: statut,
        };
    }
  };

  const config = getStatusConfig(statut);

  return (
    <span
      className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25`}
    >
      <FontAwesomeIcon
        icon={
          statut === "en_attente"
            ? faClock
            : statut === "en_cours"
              ? faExchangeAlt
              : statut === "termine"
                ? faCheckCircle
                : faTimesCircle
        }
        className="me-1"
      />
      {config.label}
    </span>
  );
};

// Composant de badge de publication
const PublicationBadge = ({ estPublie }: { estPublie: boolean | null }) => {
  if (estPublie === null) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
        <FontAwesomeIcon icon={faTimes} className="me-1" />
        Non défini
      </span>
    );
  }

  return estPublie ? (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
      <FontAwesomeIcon icon={faCheck} className="me-1" />
      Publié
    </span>
  ) : (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
      <FontAwesomeIcon icon={faTimes} className="me-1" />
      Non publié
    </span>
  );
};

// Composant de pagination
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 border-top">
      <div className="d-flex align-items-center gap-3">
        <div className="text-muted small">
          Affichage de <span className="fw-semibold">{indexOfFirstItem}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> échanges
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: "100px" }}
          value={itemsPerPage}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
          </li>

          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => onPageChange(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Composant de modal de suppression multiple
const DeleteMultipleModal = ({
  show,
  count,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  count: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Suppression multiple
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-warning mb-3 border-0">
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            <p className="mb-3">
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{count} échange(s)</strong> ?
            </p>
            <div className="text-danger small">
              Cette action est irréversible. Toutes les données associées seront
              perdues.
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Suppression en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer {count} échange(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PAGE PRINCIPALE ============

export default function EchangesVendeurPage() {
  // États
  const [echanges, setEchanges] = useState<EchangeVendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedEchange, setSelectedEchange] = useState<EchangeVendeur | null>(
    null,
  );

  // États pour la sélection multiple
  const [selectedEchanges, setSelectedEchanges] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EchangeVendeur;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Charger les échanges
  const fetchEchanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse>(
        API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES,
      );

      if (response.status === "success") {
        setEchanges(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.length,
          pages: Math.ceil(response.data.length / prev.limit),
        }));
      } else {
        throw new Error("Erreur lors du chargement des échanges");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des échanges:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des échanges",
      );
      setEchanges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les échanges au montage
  useEffect(() => {
    fetchEchanges();
  }, [fetchEchanges]);

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Fonctions de tri
  const requestSort = (key: keyof EchangeVendeur) => {
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

  const getSortIcon = (key: keyof EchangeVendeur) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Tri et filtrage des échanges
  const filteredEchanges = useMemo(() => {
    let result = [...echanges];

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (echange) =>
          echange.nomElementEchange?.toLowerCase().includes(term) ||
          echange.objetPropose?.toLowerCase().includes(term) ||
          echange.objetDemande?.toLowerCase().includes(term) ||
          echange.message?.toLowerCase().includes(term) ||
          echange.categorie?.toLowerCase().includes(term),
      );
    }

    // Filtrage par statut
    if (selectedStatus !== "all") {
      result = result.filter((echange) => echange.statut === selectedStatus);
    }

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [echanges, searchTerm, selectedStatus, sortConfig]);

  // Échanges paginés
  const paginatedEchanges = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredEchanges.slice(startIndex, startIndex + pagination.limit);
  }, [filteredEchanges, pagination.page, pagination.limit]);

  // Mettre à jour la pagination quand les filtres changent
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      total: filteredEchanges.length,
      pages: Math.ceil(filteredEchanges.length / prev.limit),
    }));
  }, [filteredEchanges, pagination.limit]);

  // Gestion des succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchEchanges();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Gestion de la sélection multiple
  const handleSelectEchange = (echangeUuid: string) => {
    setSelectedEchanges((prev) => {
      if (prev.includes(echangeUuid)) {
        return prev.filter((id) => id !== echangeUuid);
      } else {
        return [...prev, echangeUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageEchangeIds = paginatedEchanges.map((echange) => echange.uuid);
    const allSelected = pageEchangeIds.every((id) =>
      selectedEchanges.includes(id),
    );

    if (allSelected) {
      // Désélectionner tous les échanges de cette page
      setSelectedEchanges((prev) =>
        prev.filter((id) => !pageEchangeIds.includes(id)),
      );
      setSelectAll(false);
    } else {
      // Sélectionner tous les échanges de cette page
      const newSelection = [
        ...new Set([...selectedEchanges, ...pageEchangeIds]),
      ];
      setSelectedEchanges(newSelection);
      if (newSelection.length === filteredEchanges.length) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Désélectionner tout
      setSelectedEchanges([]);
    } else {
      // Sélectionner tout
      const allEchangeIds = filteredEchanges.map((echange) => echange.uuid);
      setSelectedEchanges(allEchangeIds);
    }
    setSelectAll(!selectAll);
  };

  // Mettre à jour selectAll quand selectedEchanges change
  useEffect(() => {
    if (filteredEchanges.length > 0) {
      const allSelected = filteredEchanges.every((echange) =>
        selectedEchanges.includes(echange.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedEchanges, filteredEchanges]);

  // Suppression d'un échange
  const handleDelete = async () => {
    if (!selectedEchange) return;

    try {
      await api.delete(API_ENDPOINTS.ECHANGES.DELETE(selectedEchange.uuid));
      setShowDeleteModal(false);
      setSelectedEchange(null);
      handleSuccess("Échange supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    if (selectedEchanges.length === 0) return;

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const echangeUuid of selectedEchanges) {
        try {
          await api.delete(API_ENDPOINTS.ECHANGES.DELETE(echangeUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'échange ${echangeUuid}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      handleSuccess(
        `${successCount} échange(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Réinitialiser la sélection
      setSelectedEchanges([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchEchanges();
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "publish" | "unpublish" | "accept" | "refuse",
  ) => {
    if (selectedEchanges.length === 0) {
      setError("Veuillez sélectionner au moins un échange");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const echangeUuid of selectedEchanges) {
        try {
          const echange = echanges.find((e) => e.uuid === echangeUuid);
          if (!echange) continue;

          switch (action) {
            case "publish":
              await api.post(API_ENDPOINTS.ECHANGES.PUBLISH, {
                uuid: echangeUuid,
              });
              break;
            case "unpublish":
              await api.put(API_ENDPOINTS.ECHANGES.UPDATE(echangeUuid), {
                estPublie: false,
              });
              break;
            case "accept":
              await api.put(API_ENDPOINTS.ECHANGES.ACCEPT(echangeUuid));
              break;
            case "refuse":
              await api.put(API_ENDPOINTS.ECHANGES.REFUSE(echangeUuid));
              break;
          }
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'échange ${echangeUuid}:`, err);
          errorCount++;
        }
      }

      handleSuccess(
        `${successCount} échange(s) ${action === "publish" ? "publié(s)" : action === "unpublish" ? "dépublié(s)" : action === "accept" ? "accepté(s)" : "refusé(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      // Rafraîchir la liste
      fetchEchanges();

      // Réinitialiser la sélection
      setSelectedEchanges([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Actions individuelles
  const handleIndividualAction = async (
    action: "accept" | "refuse" | "publish" | "unpublish",
  ) => {
    if (!selectedEchange) return;

    try {
      switch (action) {
        case "accept":
          await api.put(API_ENDPOINTS.ECHANGES.ACCEPT(selectedEchange.uuid));
          handleSuccess("Échange accepté avec succès !");
          break;
        case "refuse":
          await api.put(API_ENDPOINTS.ECHANGES.REFUSE(selectedEchange.uuid));
          handleSuccess("Échange refusé avec succès !");
          break;
        case "publish":
          await api.post(API_ENDPOINTS.ECHANGES.PUBLISH, {
            uuid: selectedEchange.uuid,
          });
          handleSuccess("Échange publié avec succès !");
          break;
        case "unpublish":
          await api.put(API_ENDPOINTS.ECHANGES.UPDATE(selectedEchange.uuid), {
            estPublie: false,
          });
          handleSuccess("Échange dépublié avec succès !");
          break;
      }
    } catch (err: any) {
      console.error(`❌ Erreur ${action}:`, err);
      setError(
        err.response?.data?.message || `Erreur lors de l'action ${action}`,
      );
      setTimeout(() => setError(null), 3000);
    }
  };

  // Export CSV
  const handleExport = () => {
    if (echanges.length === 0) {
      setError("Aucun échange à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const csvContent = [
      [
        "Nom",
        "Type",
        "Prix",
        "Statut",
        "Publication",
        "Catégorie",
        "Date Proposition",
        "Message",
      ],
      ...echanges.map((echange) => [
        `"${echange.nomElementEchange || ""}"`,
        echange.typeEchange,
        formatPrice(echange.prix),
        echange.statut,
        echange.estPublie ? "Publié" : "Non publié",
        echange.categorie,
        formatDate(echange.dateProposition),
        `"${echange.message || ""}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `echanges-vendeur-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Réinitialiser les filtres et la sélection
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setSelectedEchanges([]);
    setSelectAll(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: echanges.length,
      en_attente: echanges.filter((e) => e.statut === "en_attente").length,
      en_cours: echanges.filter((e) => e.statut === "en_cours").length,
      termine: echanges.filter((e) => e.statut === "termine").length,
      annule: echanges.filter((e) => e.statut === "annule").length,
      publies: echanges.filter((e) => e.estPublie === true).length,
      nonPublies: echanges.filter((e) => e.estPublie === false).length,
    };
  }, [echanges]);

  // Effet pour réinitialiser la sélection quand les filtres changent
  useEffect(() => {
    setSelectedEchanges([]);
    setSelectAll(false);
  }, [searchTerm, selectedStatus]);

  return (
    <>
      {/* Modals */}

      {selectedEchange && (
        <EditEchangeModal
          isOpen={showEditModal}
          echange={selectedEchange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEchange(null);
          }}
          onSuccess={() => handleSuccess("Échange modifié avec succès !")}
        />
      )}

      {selectedEchange && (
        <ViewEchangeModal
          isOpen={showViewModal}
          echange={selectedEchange}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEchange(null);
          }}
        />
      )}
      <CreateEchangeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => handleSuccess("Échange créé avec succès !")}
      />

      {/* Modal de suppression individuelle */}
      {showDeleteModal && selectedEchange && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 bg-danger text-white rounded-top-3">
                <h5 className="modal-title fw-bold">
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Confirmer la suppression
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEchange(null);
                  }}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning mb-3 border-0">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  <strong>Attention :</strong> Cette action est définitive
                </div>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer l'échange{" "}
                  <strong>{selectedEchange.nomElementEchange}</strong> ?
                </p>
                <div className="text-danger small">
                  Cette action est irréversible. Toutes les données associées à
                  cet échange seront perdues.
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEchange(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression multiple */}
      <DeleteMultipleModal
        show={showDeleteMultipleModal}
        count={selectedEchanges.length}
        loading={bulkActionLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête */}
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Échanges</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Mes Échanges</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredEchanges.length} échange(s)
                    {selectedEchanges.length > 0 &&
                      ` (${selectedEchanges.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchEchanges()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={echanges.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvel Échange
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  <div>
                    <strong>Erreur:</strong> {error}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Succès:</strong> {successMessage}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions en masse */}
          {selectedEchanges.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faExchangeAlt}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedEchanges.length} échange(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("publish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>Publier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unpublish")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faEyeSlash} />
                    <span>Dépublier</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("accept")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Accepter</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("refuse")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Refuser</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => setShowDeleteMultipleModal(true)}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedEchanges([]);
                      setSelectAll(false);
                    }}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Annuler</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filtres et recherche */}
          <div className="p-4 border-bottom bg-light-subtle">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, objet, catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredEchanges.length}</strong>{" "}
                    échange(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        et statut "
                        <strong>
                          {selectedStatus === "en_attente"
                            ? "En attente"
                            : selectedStatus === "en_cours"
                              ? "En cours"
                              : selectedStatus === "termine"
                                ? "Terminé"
                                : "Annulé"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedEchanges.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedEchanges.length} sélectionné(s)
                    </small>
                  )}
                  <button
                    onClick={() => handleSelectAll()}
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                    disabled={filteredEchanges.length === 0 || loading}
                    title={
                      selectAll ? "Tout désélectionner" : "Tout sélectionner"
                    }
                  >
                    <FontAwesomeIcon
                      icon={selectAll ? faCheckSquare : faSquare}
                    />
                    <span className="d-none d-md-inline">
                      {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des échanges */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des échanges...</p>
              </div>
            ) : filteredEchanges.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">
                    {echanges.length === 0
                      ? "Aucun échange trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0">
                    {echanges.length === 0
                      ? "Vous n'avez pas encore créé d'échange."
                      : "Aucun échange ne correspond à vos critères de recherche."}
                  </p>
                  {echanges.length === 0 && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer mon premier échange
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="text-center">
                        <div className="form-check d-flex justify-content-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectAll && paginatedEchanges.length > 0}
                            onChange={handleSelectAllOnPage}
                            disabled={paginatedEchanges.length === 0}
                            title={
                              selectAll
                                ? "Désélectionner cette page"
                                : "Sélectionner cette page"
                            }
                          />
                        </div>
                      </th>
                      <th style={{ width: "40px" }}>#</th>
                      <th style={{ width: "180px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("nomElementEchange")}
                        >
                          Nom de l'échange
                          {getSortIcon("nomElementEchange")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Type</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("prix")}
                        >
                          Prix
                          {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Publication</span>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("dateProposition")}
                        >
                          Date
                          {getSortIcon("dateProposition")}
                        </button>
                      </th>
                      <th style={{ width: "160px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEchanges.map((echange, index) => {
                      const isSelected = selectedEchanges.includes(
                        echange.uuid,
                      );

                      return (
                        <tr
                          key={echange.uuid}
                          className={`align-middle ${isSelected ? "table-active" : ""}`}
                        >
                          <td className="text-center">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={() =>
                                  handleSelectEchange(echange.uuid)
                                }
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
                                {echange.image ? (
                                  <img
                                    src={echange.image}
                                    alt={echange.nomElementEchange}
                                    className="rounded border"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        `https://via.placeholder.com/40/cccccc/ffffff?text=${echange.nomElementEchange?.charAt(0) || "E"}`;
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faExchangeAlt}
                                      className="text-muted"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <div className="fw-semibold">
                                  {echange.nomElementEchange}
                                </div>
                                <small
                                  className="text-muted d-block"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faLayerGroup}
                                    className="me-1"
                                  />
                                  {echange.categorie || "Non catégorisé"}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                              <FontAwesomeIcon icon={faTag} className="me-1" />
                              {echange.typeEchange || "Produit"}
                            </span>
                            <div className="small text-muted mt-1">
                              <FontAwesomeIcon icon={faUser} className="me-1" />
                              Initié par: {echange.nom_initiateur}
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold text-success">
                              {formatPrice(echange.prix)}
                            </div>
                            <div className="small text-muted">
                              <div>
                                <FontAwesomeIcon
                                  icon={faExchangeAlt}
                                  className="me-1"
                                />
                                Propose: {echange.objetPropose}
                              </div>
                              <div>
                                <FontAwesomeIcon
                                  icon={faExchangeAlt}
                                  className="me-1"
                                />
                                Demande: {echange.objetDemande}
                              </div>
                            </div>
                          </td>
                          <td>
                            <PublicationBadge estPublie={echange.estPublie} />
                          </td>
                          <td>
                            <StatusBadge statut={echange.statut} />
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-1"
                                />
                                Proposition:{" "}
                                {formatDate(echange.dateProposition)}
                              </div>
                              {echange.dateAcceptation && (
                                <div className="text-success">
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="me-1"
                                  />
                                  Accepté: {formatDate(echange.dateAcceptation)}
                                </div>
                              )}
                              {echange.dateRefus && (
                                <div className="text-danger">
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="me-1"
                                  />
                                  Refusé: {formatDate(echange.dateRefus)}
                                </div>
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
                                  setSelectedEchange(echange);
                                  setShowViewModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-outline-warning"
                                title="Modifier"
                                onClick={() => {
                                  setSelectedEchange(echange);
                                  setShowEditModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {echange.statut === "en_attente" && (
                                <>
                                  <button
                                    className="btn btn-outline-success"
                                    title="Accepter"
                                    onClick={() => {
                                      setSelectedEchange(echange);
                                      handleIndividualAction("accept");
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    title="Refuser"
                                    onClick={() => {
                                      setSelectedEchange(echange);
                                      handleIndividualAction("refuse");
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </>
                              )}
                              {echange.estPublie ? (
                                <button
                                  className="btn btn-outline-secondary"
                                  title="Dépublier"
                                  onClick={() => {
                                    setSelectedEchange(echange);
                                    handleIndividualAction("unpublish");
                                  }}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-info"
                                  title="Publier"
                                  onClick={() => {
                                    setSelectedEchange(echange);
                                    handleIndividualAction("publish");
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                                onClick={() => {
                                  setSelectedEchange(echange);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredEchanges.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredEchanges.length}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                    onLimitChange={(limit) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit,
                        page: 1,
                      }))
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .table td {
          border-bottom: 1px solid #e9ecef;
        }
        .badge {
          font-weight: 500;
        }
        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </>
  );
}
