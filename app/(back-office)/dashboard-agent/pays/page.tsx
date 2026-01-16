// app/(back-office)/dashboard-admin/pays/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faBan,
  faCheckCircle,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faGlobe,
  faPhone,
  faCode,
  faCalendar,
  faCircleCheck,
  faCircleXmark,
  faExclamationTriangle,
  faCheck,
  faPlay,
  faPause,
  faCheck as faCheckIcon,
  faTrash as faTrashIcon,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { usePays } from "@/hooks/usePays";
import type { Pays } from "@/services/pays/pays.types";
import CreatePaysModal from "./modals/CreatePaysModal";
import DeletePaysModal from "./modals/DeletePaysModal";
import EditPaysModal from "./modals/EditPaysModal";

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  if (statut === "actif") {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faCircleCheck} className="fs-12" />
        <span>Actif</span>
      </span>
    );
  }

  return (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faCircleXmark} className="fs-12" />
      <span>Inactif</span>
    </span>
  );
};

// Barre d'actions groupées
const BulkActionsBar = ({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  isAllSelected,
  totalItems,
  loading,
}: {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  isAllSelected: boolean;
  totalItems: number;
  loading: boolean;
}) => {
  if (selectedCount === 0) return null;

  const bulkActions = [
    {
      id: "activate",
      label: "Activer",
      icon: faPlay,
      variant: "success" as const,
    },
    {
      id: "deactivate",
      label: "Désactiver",
      icon: faPause,
      variant: "warning" as const,
    },
    {
      id: "delete",
      label: "Supprimer",
      icon: faTrashIcon,
      variant: "danger" as const,
      requiresConfirmation: true,
    },
  ];

  return (
    <div className="bg-primary bg-opacity-10 border-primary border-start border-5 p-3 mb-3 rounded">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">
              {selectedCount} pays sélectionné(s)
            </h6>
            <small className="text-muted">
              {isAllSelected
                ? "Tous les pays sont sélectionnés"
                : `${selectedCount} sur ${totalItems} pays sélectionnés`}
            </small>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onSelectAll}
            disabled={loading}
          >
            {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>

          {bulkActions.map((action) => (
            <button
              key={action.id}
              className={`btn btn-${action.variant} btn-sm d-flex align-items-center gap-2`}
              onClick={() => onBulkAction(action.id)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={action.icon} />
              {action.label}
            </button>
          ))}

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClearSelection}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faBan} />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de pagination
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-4 border-top">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-muted">
          Affichage de <span className="fw-semibold">{indexOfFirstItem}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> pays
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="Première page"
              >
                «
              </button>
            </li>

            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                ‹
              </button>
            </li>

            {renderPageNumbers().map((pageNum, index) => (
              <li
                key={index}
                className={`page-item ${
                  pageNum === currentPage ? "active" : ""
                } ${pageNum === "..." ? "disabled" : ""}`}
              >
                {pageNum === "..." ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(pageNum as number)}
                  >
                    {pageNum}
                  </button>
                )}
              </li>
            ))}

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                ›
              </button>
            </li>

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Dernière page"
              >
                »
              </button>
            </li>
          </ul>
        </nav>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Page :</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= totalPages) {
                onPageChange(value);
              }
            }}
            className="form-control form-control-sm text-center"
            style={{ width: "70px" }}
          />
          <span className="text-muted">sur {totalPages}</span>
        </div>
      </div>
    </div>
  );
};

// Modal de suppression multiple
const BulkDeleteModal = ({
  show,
  loading,
  count,
  onClose,
  onConfirm,
}: {
  show: boolean;
  loading: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
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
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            <p className="mb-3">
              Êtes-vous sûr de vouloir supprimer <strong>{count} pays</strong> ?
            </p>
            <div className="text-danger">
              <small>
                Cette action est irréversible. Toutes les données associées
                seront perdues.
              </small>
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
                  Supprimer les pays
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de statistiques
const StatsCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="mb-0 fw-bold">{value}</h3>
        </div>
        <div
          className={`bg-${color} bg-opacity-10 text-${color} rounded-circle d-flex align-items-center justify-content-center`}
          style={{ width: "48px", height: "48px" }}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  </div>
);

// Composant principal
export default function PaysPage() {
  const {
    pays,
    loading,
    error,
    pagination,
    fetchPays,
    togglePaysStatus,
    deletePays,
    setPage,
    setLimit,
    refresh,
  } = usePays();

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedPays, setSelectedPays] = useState<Pays | null>(null);

  // États pour la sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pays;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour les messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Statistiques
  const stats = useMemo(() => {
    const actifs = pays.filter((p) => p.statut === "actif").length;
    const inactifs = pays.filter((p) => p.statut === "inactif").length;

    return {
      total: pays.length,
      actifs,
      inactifs,
      pourcentageActifs:
        pays.length > 0 ? Math.round((actifs / pays.length) * 100) : 0,
    };
  }, [pays]);

  // Charger les pays au montage
  useEffect(() => {
    console.log("🔄 Chargement initial des pays...");
    const loadPays = async () => {
      try {
        await fetchPays();
        console.log("✅ Pays chargés:", pays.length);
      } catch (err) {
        console.error("❌ Erreur lors du chargement:", err);
        setLocalError("Impossible de charger la liste des pays");
      }
    };
    loadPays();
  }, []);

  // Gérer les changements de pagination et filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedStatut !== "all") {
        params.statut = selectedStatut;
      }

      console.log("🔍 Fetching avec params:", params);
      fetchPays(params).catch((err) => {
        console.error("❌ Erreur fetchPays:", err);
        setLocalError("Erreur lors du filtrage des données");
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit, searchTerm, selectedStatut]);

  // Fonction pour formater la date
  const formatDate = useCallback((dateString: string | null | undefined) => {
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
  }, []);

  // Fonction de tri
  const sortPays = useCallback(
    (paysList: Pays[]) => {
      if (!sortConfig || !paysList.length) return paysList;

      return [...paysList].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Gérer les valeurs nulles
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Gérer les dates
        if (
          sortConfig.key === "created_at" ||
          sortConfig.key === "updated_at"
        ) {
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Gérer les strings
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Gérer les autres types
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    },
    [sortConfig],
  );

  const requestSort = useCallback((key: keyof Pays) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const getSortIcon = useCallback(
    (key: keyof Pays) => {
      if (!sortConfig || sortConfig.key !== key) {
        return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
      }
      return sortConfig.direction === "asc" ? (
        <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
      ) : (
        <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
      );
    },
    [sortConfig],
  );

  // Filtrer et trier les pays
  const filteredPays = useMemo(() => {
    let filtered = pays;

    // Filtrer par statut
    if (selectedStatut !== "all") {
      filtered = filtered.filter((p) => p.statut === selectedStatut);
    }

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.nom?.toLowerCase().includes(term) ||
          p.code?.toLowerCase().includes(term) ||
          p.indicatif?.toLowerCase().includes(term),
      );
    }

    // Trier
    return sortPays(filtered);
  }, [pays, searchTerm, selectedStatut, sortPays]);

  // Calculer les éléments à afficher
  const currentItems = useMemo(() => {
    return filteredPays.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit,
    );
  }, [filteredPays, pagination.page, pagination.limit]);

  // Gestion de la sélection multiple
  const handleRowSelect = (uuid: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      newSelected.add(uuid);
    }
    setSelectedRows(newSelected);
    updateAllSelectedStatus(newSelected);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(new Set());
      setIsAllSelected(false);
    } else {
      const allUuids = new Set(filteredPays.map((p) => p.uuid));
      setSelectedRows(allUuids);
      setIsAllSelected(true);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageUuids = new Set(currentItems.map((p) => p.uuid));
    const newSelected = new Set(selectedRows);

    // Vérifier si toutes les lignes de la page sont déjà sélectionnées
    const allPageSelected = currentItems.every((p) => newSelected.has(p.uuid));

    if (allPageSelected) {
      // Désélectionner toutes les lignes de la page
      pageUuids.forEach((uuid) => newSelected.delete(uuid));
    } else {
      // Sélectionner toutes les lignes de la page
      pageUuids.forEach((uuid) => newSelected.add(uuid));
    }

    setSelectedRows(newSelected);
    updateAllSelectedStatus(newSelected);
  };

  const updateAllSelectedStatus = (selectedSet: Set<string>) => {
    const allUuids = new Set(filteredPays.map((p) => p.uuid));
    setIsAllSelected(
      selectedSet.size === allUuids.size &&
        Array.from(allUuids).every((uuid) => selectedSet.has(uuid)),
    );
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
    setIsAllSelected(false);
  };

  // Vérifier si une ligne de la page courante est sélectionnée
  const isPageAllSelected = useMemo(() => {
    return (
      currentItems.length > 0 &&
      currentItems.every((p) => selectedRows.has(p.uuid))
    );
  }, [currentItems, selectedRows]);

  // Fonctions pour gérer les modals
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setLocalError(null);
  };

  const handleOpenEditModal = (pays: Pays) => {
    setSelectedPays(pays);
    setShowEditModal(true);
    setLocalError(null);
  };

  const handleOpenViewModal = (pays: Pays) => {
    setSelectedPays(pays);
    setShowViewModal(true);
    setLocalError(null);
  };

  const handleOpenDeleteModal = (pays: Pays) => {
    setSelectedPays(pays);
    setShowDeleteModal(true);
    setLocalError(null);
  };

  // Fonction pour gérer les actions groupées
  const handleBulkAction = async (actionId: string) => {
    if (selectedRows.size === 0) return;

    try {
      setLocalError(null);

      switch (actionId) {
        case "activate":
          await handleBulkStatusChange("actif");
          break;
        case "deactivate":
          await handleBulkStatusChange("inactif");
          break;
        case "delete":
          setShowBulkDeleteModal(true);
          break;
        default:
          break;
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de l'action groupée:", err);
      setLocalError(err.message || "Erreur lors de l'action groupée");
    }
  };

  // Fonction pour changer le statut en masse
  const handleBulkStatusChange = async (newStatus: "actif" | "inactif") => {
    if (selectedRows.size === 0) return;

    try {
      setLocalError(null);

      // Mettre à jour chaque pays sélectionné
      const updatePromises = Array.from(selectedRows).map((uuid) =>
        togglePaysStatus(uuid),
      );

      await Promise.all(updatePromises);

      clearSelection();
      await refresh();

      setSuccessMessage(
        `${selectedRows.size} pays ${newStatus === "actif" ? "activé(s)" : "désactivé(s)"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors du changement de statut en masse:", err);
      setLocalError(
        err.message ||
          `Erreur lors de ${newStatus === "actif" ? "l'activation" : "la désactivation"} des pays`,
      );
    }
  };

  // Fonction pour supprimer en masse
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setLocalError(null);

      // Supprimer chaque pays sélectionné
      const deletePromises = Array.from(selectedRows).map((uuid) =>
        deletePays(uuid),
      );

      await Promise.all(deletePromises);

      setShowBulkDeleteModal(false);
      clearSelection();
      await refresh();

      setSuccessMessage(`${selectedRows.size} pays supprimé(s) avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression en masse:", err);
      setLocalError(err.message || "Erreur lors de la suppression des pays");
    }
  };

  // Fonction appelée après création réussie
  const handlePaysCreated = () => {
    setSuccessMessage("Pays créé avec succès !");
    clearSelection();
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction appelée après modification réussie
  const handlePaysUpdated = () => {
    setSuccessMessage("Pays modifié avec succès !");
    clearSelection();
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction appelée après suppression réussie
  const handlePaysDeleted = () => {
    setSuccessMessage("Pays supprimé avec succès !");
    clearSelection();
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour changer le statut d'un pays
  const handleToggleStatus = async (paysItem: Pays) => {
    try {
      setLocalError(null);
      await togglePaysStatus(paysItem.uuid);
      setSuccessMessage(
        `Pays ${paysItem.statut === "actif" ? "désactivé" : "activé"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors du changement de statut:", err);
      setLocalError(err.message || "Erreur lors du changement de statut");
    }
  };

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      setLocalError(null);

      // Créer le contenu CSV
      const csvContent = [
        ["Nom", "Code", "Indicatif", "Statut", "Créé le", "Modifié le"],
        ...filteredPays.map((p) => [
          p.nom || "",
          p.code || "",
          p.indicatif || "",
          p.statut || "",
          formatDate(p.created_at),
          formatDate(p.updated_at),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pays-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage("Export CSV réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors de l'export:", err);
      setLocalError("Erreur lors de l'export des données");
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatut("all");
    setSortConfig(null);
    setPage(1);
    clearSelection();
    setLocalError(null);
  };

  return (
    <>
      {/* Modals */}
      <CreatePaysModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePaysCreated}
      />

      {selectedPays && (
        <>
          <EditPaysModal
            isOpen={showEditModal}
            pays={selectedPays}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPays(null);
            }}
            onSuccess={handlePaysUpdated}
          />

          <DeletePaysModal
            isOpen={showDeleteModal}
            pays={selectedPays}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedPays(null);
            }}
            onSuccess={handlePaysDeleted}
          />
        </>
      )}

      {/* Modal de suppression multiple */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        loading={loading}
        count={selectedRows.size}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <div className="p-3 p-md-4">
        {/* En-tête avec titre et boutons */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Géographie</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Pays</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total}{" "}
                    {pagination.total === 1 ? "pays" : "pays"}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => refresh()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={pays.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Pays
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'actions groupées */}
        {selectedRows.size > 0 && (
          <BulkActionsBar
            selectedCount={selectedRows.size}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
            isAllSelected={isAllSelected}
            totalItems={filteredPays.length}
            loading={loading}
          />
        )}

        {/* Messages d'alerte */}
        {(error || localError) && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-4 border-0 shadow-sm"
            role="alert"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Attention:</strong> {error || localError}
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setLocalError(null);
              }}
              aria-label="Fermer"
            ></button>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm"
            role="alert"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            <strong>Succès:</strong> {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Fermer"
            ></button>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, code ou indicatif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    value={selectedStatut}
                    onChange={(e) => setSelectedStatut(e.target.value)}
                    disabled={loading}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actifs</option>
                    <option value="inactif">Inactifs</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={pagination.limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
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
                    Total: <strong>{pagination.total}</strong> pays
                    {filteredPays.length !== pagination.total && (
                      <>
                        {" "}
                        | Filtrés: <strong>{filteredPays.length}</strong>
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <button
                  onClick={resetFilters}
                  className="btn btn-sm btn-outline-secondary"
                  disabled={loading}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des pays */}
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des pays...</p>
              </div>
            ) : (
              <>
                {filteredPays.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0 shadow-sm"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="fs-1 mb-3 text-info opacity-75"
                      />
                      <h5 className="alert-heading fw-bold">
                        Aucun pays trouvé
                      </h5>
                      <p className="mb-0 text-muted">
                        {pays.length === 0
                          ? "Aucun pays dans la base de données"
                          : "Aucun pays ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter le premier pays
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th
                              style={{ width: "50px" }}
                              className="text-center"
                            >
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={isPageAllSelected}
                                  onChange={handleSelectAllOnPage}
                                  title="Sélectionner/désélectionner toutes les lignes de cette page"
                                  disabled={loading}
                                />
                              </div>
                            </th>
                            <th
                              style={{ width: "60px" }}
                              className="text-center"
                            >
                              #
                            </th>
                            <th style={{ width: "200px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                                onClick={() => requestSort("nom")}
                                disabled={loading}
                              >
                                <FontAwesomeIcon
                                  icon={faGlobe}
                                  className="me-2"
                                />
                                Nom
                                {getSortIcon("nom")}
                              </button>
                            </th>
                            <th style={{ width: "120px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                                onClick={() => requestSort("code")}
                                disabled={loading}
                              >
                                <FontAwesomeIcon
                                  icon={faCode}
                                  className="me-2"
                                />
                                Code
                                {getSortIcon("code")}
                              </button>
                            </th>
                            <th style={{ width: "150px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                                onClick={() => requestSort("indicatif")}
                                disabled={loading}
                              >
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="me-2"
                                />
                                Indicatif
                                {getSortIcon("indicatif")}
                              </button>
                            </th>
                            <th style={{ width: "120px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                                onClick={() => requestSort("statut")}
                                disabled={loading}
                              >
                                Statut
                                {getSortIcon("statut")}
                              </button>
                            </th>
                            <th style={{ width: "150px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                                onClick={() => requestSort("created_at")}
                                disabled={loading}
                              >
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-2"
                                />
                                Créé le
                                {getSortIcon("created_at")}
                              </button>
                            </th>
                            <th
                              style={{ width: "140px" }}
                              className="text-center"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((paysItem, index) => (
                            <tr
                              key={paysItem.uuid}
                              className="align-middle"
                              style={{
                                backgroundColor: selectedRows.has(paysItem.uuid)
                                  ? "rgba(13, 110, 253, 0.05)"
                                  : "inherit",
                              }}
                            >
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={selectedRows.has(paysItem.uuid)}
                                    onChange={() =>
                                      handleRowSelect(paysItem.uuid)
                                    }
                                    disabled={loading}
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
                                      className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                      style={{ width: "40px", height: "40px" }}
                                    >
                                      <FontAwesomeIcon icon={faGlobe} />
                                    </div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <div
                                      className="fw-semibold cursor-pointer"
                                      onClick={() =>
                                        handleOpenViewModal(paysItem)
                                      }
                                      style={{ cursor: "pointer" }}
                                    >
                                      {paysItem.nom}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faCode}
                                    className="text-muted me-2"
                                  />
                                  <code className="fw-bold bg-light px-2 py-1 rounded">
                                    {paysItem.code}
                                  </code>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faPhone}
                                    className="text-muted me-2"
                                  />
                                  <span className="fw-semibold">
                                    {paysItem.indicatif}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <StatusBadge statut={paysItem.statut} />
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="text-muted me-2"
                                  />
                                  <small className="text-muted">
                                    {formatDate(paysItem.created_at)}
                                  </small>
                                </div>
                              </td>
                              <td className="text-center">
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                >
                                  <button
                                    className="btn btn-outline-info"
                                    title="Voir détails"
                                    onClick={() =>
                                      handleOpenViewModal(paysItem)
                                    }
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                  <button
                                    className="btn btn-outline-warning"
                                    title="Modifier"
                                    onClick={() =>
                                      handleOpenEditModal(paysItem)
                                    }
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    className={`btn ${
                                      paysItem.statut === "actif"
                                        ? "btn-outline-danger"
                                        : "btn-outline-success"
                                    }`}
                                    title={
                                      paysItem.statut === "actif"
                                        ? "Désactiver"
                                        : "Activer"
                                    }
                                    onClick={() => handleToggleStatus(paysItem)}
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        paysItem.statut === "actif"
                                          ? faBan
                                          : faCheckCircle
                                      }
                                    />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    title="Supprimer"
                                    onClick={() =>
                                      handleOpenDeleteModal(paysItem)
                                    }
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={filteredPays.length}
                        itemsPerPage={pagination.limit}
                        onPageChange={setPage}
                      />
                    )}
                  </>
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
          min-width: 36px;
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .form-control:disabled,
        .form-select:disabled,
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-link:disabled {
          color: #6c757d;
          pointer-events: none;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .cursor-pointer:hover {
          color: #0d6efd;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
