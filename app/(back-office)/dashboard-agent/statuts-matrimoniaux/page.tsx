// app/(back-office)/dashboard-admin/statuts-matrimoniaux/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
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
  faHeart,
  faRing,
  faUsers,
  faCalendar,
  faCircle,
  faCircleCheck,
  faCircleXmark,
  faStar,
  faCrown,
  faCheckSquare,
  faSquare,
  faCheck,
  faPlay,
  faPause,
  faBan as faBanIcon,
  faCheck as faCheckIcon,
  faTrash as faTrashIcon,
  faHeartBroken,
  faHeartCrack,
  faHandshake,
  faExclamationTriangle, // AJOUTÉ
} from "@fortawesome/free-solid-svg-icons";
import { useStatutsMatrimoniaux } from "@/hooks/useStatutsMatrimoniaux";

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

// Badge de statut par défaut
const DefaultBadge = ({ isDefault }: { isDefault: boolean }) => {
  if (!isDefault) return null;

  return (
    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1 ms-2">
      <FontAwesomeIcon icon={faCrown} className="fs-12" />
      <span>Par défaut</span>
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
              {selectedCount} statut(s) sélectionné(s)
            </h6>
            <small className="text-muted">
              {isAllSelected
                ? "Tous les statuts sont sélectionnés"
                : `${selectedCount} sur ${totalItems} statuts sélectionnés`}
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
            <FontAwesomeIcon icon={faBanIcon} />
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
  indexOfFirstItem,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  indexOfFirstItem: number;
  onPageChange: (page: number) => void;
}) => {
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
          Affichage de{" "}
          <span className="fw-semibold">{indexOfFirstItem + 1}</span> à{" "}
          <span className="fw-semibold">{indexOfLastItem}</span> sur{" "}
          <span className="fw-semibold">{totalItems}</span> statuts
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
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{count} statut(s) matrimonial(aux)</strong> ?
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
                  Supprimer les statuts
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StatutsMatrimoniauxPage() {
  const {
    statuts,
    loading,
    error,
    pagination,
    fetchStatuts,
    toggleStatutStatus,
    setStatutDefaut,
    deleteStatut,
    setPage,
    setLimit,
    refresh,
  } = useStatutsMatrimoniaux();

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedStatut, setSelectedStatut] =
    useState<StatutMatrimonialType | null>(null);

  // États pour la sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StatutMatrimonialType;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour les messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les statuts au montage
  useEffect(() => {
    fetchStatuts();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStatuts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        actif:
          selectedStatus !== "all" ? selectedStatus === "actif" : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit, searchTerm, selectedStatus]);

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
      }).format(date);
    } catch {
      return "N/A";
    }
  }, []);

  // Fonction de tri
  const sortStatuts = useCallback(
    (statutsList: StatutMatrimonialType[]) => {
      if (!sortConfig || !statutsList.length) return statutsList;

      return [...statutsList].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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

  const requestSort = useCallback((key: keyof StatutMatrimonialType) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }, []);

  const getSortIcon = useCallback(
    (key: keyof StatutMatrimonialType) => {
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

  // Filtrer et trier les statuts
  const filteredStatuts = useMemo(() => {
    return sortStatuts(statuts);
  }, [statuts, sortStatuts]);

  // Calculer les éléments à afficher
  const currentItems = useMemo(() => {
    return filteredStatuts.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit,
    );
  }, [filteredStatuts, pagination.page, pagination.limit]);

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
      const allUuids = new Set(filteredStatuts.map((s) => s.uuid));
      setSelectedRows(allUuids);
      setIsAllSelected(true);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageUuids = new Set(currentItems.map((s) => s.uuid));
    const newSelected = new Set(selectedRows);

    // Vérifier si toutes les lignes de la page sont déjà sélectionnées
    const allPageSelected = currentItems.every((s) => newSelected.has(s.uuid));

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
    const allUuids = new Set(filteredStatuts.map((s) => s.uuid));
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
      currentItems.every((s) => selectedRows.has(s.uuid))
    );
  }, [currentItems, selectedRows]);

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

      // Mettre à jour chaque statut sélectionné
      const updatePromises = Array.from(selectedRows).map((uuid) =>
        toggleStatutStatus(uuid),
      );

      await Promise.all(updatePromises);

      clearSelection();
      await refresh();

      setSuccessMessage(
        `${selectedRows.size} statut(s) ${newStatus === "actif" ? "activé(s)" : "désactivé(s)"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors du changement de statut en masse:", err);
      setLocalError(
        err.message ||
          `Erreur lors de ${newStatus === "actif" ? "l'activation" : "la désactivation"} des statuts`,
      );
    }
  };

  // Fonction pour supprimer en masse
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setLocalError(null);

      // Ne pas supprimer les statuts par défaut
      const statutsToDelete = Array.from(selectedRows).filter((uuid) => {
        const statut = statuts.find((s) => s.uuid === uuid);
        return statut && !statut.defaut;
      });

      if (statutsToDelete.length === 0) {
        setLocalError("Impossible de supprimer les statuts par défaut");
        return;
      }

      // Supprimer chaque statut sélectionné
      const deletePromises = statutsToDelete.map((uuid) => deleteStatut(uuid));

      await Promise.all(deletePromises);

      setShowBulkDeleteModal(false);
      clearSelection();
      await refresh();

      setSuccessMessage(
        `${statutsToDelete.length} statut(s) supprimé(s) avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression en masse:", err);
      setLocalError(err.message || "Erreur lors de la suppression des statuts");
    }
  };

  // Fonction pour changer le statut d'un statut matrimonial
  const handleToggleStatus = async (statutItem: StatutMatrimonialType) => {
    try {
      setLocalError(null);
      await toggleStatutStatus(statutItem.uuid);
      setSuccessMessage(
        `Statut matrimonial ${statutItem.statut === "actif" ? "désactivé" : "activé"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      setLocalError(err.message || "Erreur lors du changement de statut");
    }
  };

  // Fonction pour définir comme statut par défaut
  const handleSetDefault = async (statutItem: StatutMatrimonialType) => {
    try {
      setLocalError(null);
      await setStatutDefaut(statutItem.uuid);
      setSuccessMessage("Statut par défaut défini avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la définition du statut par défaut:", err);
      setLocalError(
        err.message || "Erreur lors de la définition du statut par défaut",
      );
    }
  };

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      setLocalError(null);

      const response = await fetch(
        "/api/admin/export-statuts-matrimoniaux-pdf",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Erreur lors de l'export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `statuts-matrimoniaux-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Export PDF réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de l'export:", err);
      // Fallback CSV export
      handleCSVExport();
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (filteredStatuts.length === 0) {
      setLocalError("Aucun statut à exporter");
      return;
    }

    try {
      const csvContent = [
        ["Libellé", "Slug", "Statut", "Par défaut", "Créé le", "Modifié le"],
        ...filteredStatuts.map((s) => [
          s.libelle || "",
          s.slug || "",
          s.statut || "",
          s.defaut ? "Oui" : "Non",
          formatDate(s.createdAt),
          formatDate(s.updatedAt),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `statuts-matrimoniaux-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Export CSV réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setLocalError("Erreur lors de l'export CSV");
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSortConfig(null);
    setPage(1);
    clearSelection();
    setLocalError(null);
  };

  // Icône selon le type de statut
  const getStatutIcon = (libelle: string) => {
    const lowerLibelle = libelle.toLowerCase();
    if (
      lowerLibelle.includes("célibataire") ||
      lowerLibelle.includes("celibataire")
    ) {
      return faUsers;
    } else if (
      lowerLibelle.includes("marié") ||
      lowerLibelle.includes("marie")
    ) {
      return faRing;
    } else if (
      lowerLibelle.includes("divorcé") ||
      lowerLibelle.includes("divorce")
    ) {
      return faHeartBroken;
    } else if (
      lowerLibelle.includes("veuf") ||
      lowerLibelle.includes("veuve")
    ) {
      return faHeartCrack;
    } else if (
      lowerLibelle.includes("pacsé") ||
      lowerLibelle.includes("pacse")
    ) {
      return faHandshake;
    }
    return faHeart;
  };

  return (
    <>
      {/* Modal de suppression multiple */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        loading={loading}
        count={selectedRows.size}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">
                  Gestion des Profils Utilisateurs
                </p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    Liste des Statuts Matrimoniaux
                  </h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total} statuts
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
                  disabled={statuts.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Statut
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {(error || localError) && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2"
                />
                <strong>Attention:</strong> {error || localError}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLocalError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                <strong>Succès:</strong> {successMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions groupées */}
          {selectedRows.size > 0 && (
            <BulkActionsBar
              selectedCount={selectedRows.size}
              onSelectAll={handleSelectAll}
              onClearSelection={clearSelection}
              onBulkAction={handleBulkAction}
              isAllSelected={isAllSelected}
              totalItems={filteredStatuts.length}
              loading={loading}
            />
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
                    placeholder="Rechercher par libellé ou slug..."
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
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
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
                    Total: <strong>{pagination.total}</strong> statuts
                    {filteredStatuts.length !== pagination.total && (
                      <>
                        {" "}
                        | Filtrés: <strong>{filteredStatuts.length}</strong>
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

          {/* Tableau des statuts */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des statuts matrimoniaux...</p>
              </div>
            ) : (
              <>
                {filteredStatuts.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucun statut trouvé</h5>
                      <p className="mb-0">
                        {statuts.length === 0
                          ? "Aucun statut matrimonial dans la base de données"
                          : "Aucun statut ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter le premier statut
                      </button>
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
                                className="form-check-input"
                                type="checkbox"
                                checked={isPageAllSelected}
                                onChange={handleSelectAllOnPage}
                                title="Sélectionner/désélectionner toutes les lignes de cette page"
                                disabled={loading}
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "250px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("libelle")}
                              disabled={loading}
                            >
                              <FontAwesomeIcon
                                icon={faHeart}
                                className="me-1"
                              />
                              Libellé
                              {getSortIcon("libelle")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("slug")}
                              disabled={loading}
                            >
                              Slug
                              {getSortIcon("slug")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("statut")}
                              disabled={loading}
                            >
                              Statut
                              {getSortIcon("statut")}
                            </button>
                          </th>
                          <th style={{ width: "100px" }}>
                            <span className="fw-semibold">Défaut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("createdAt")}
                              disabled={loading}
                            >
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé le
                              {getSortIcon("createdAt")}
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
                        {currentItems.map((statutItem, index) => (
                          <tr
                            key={statutItem.uuid}
                            className="align-middle"
                            style={{
                              backgroundColor: selectedRows.has(statutItem.uuid)
                                ? "rgba(13, 110, 253, 0.05)"
                                : "inherit",
                            }}
                          >
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedRows.has(statutItem.uuid)}
                                  onChange={() =>
                                    handleRowSelect(statutItem.uuid)
                                  }
                                  disabled={loading || statutItem.defaut}
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
                                    <FontAwesomeIcon
                                      icon={getStatutIcon(statutItem.libelle)}
                                    />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold d-flex align-items-center">
                                    {statutItem.libelle}
                                    <DefaultBadge
                                      isDefault={statutItem.defaut || false}
                                    />
                                  </div>
                                  <small className="text-muted">
                                    {statutItem.slug}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {statutItem.slug}
                              </code>
                            </td>
                            <td>
                              <StatusBadge statut={statutItem.statut} />
                            </td>
                            <td>
                              {statutItem.defaut ? (
                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="me-1"
                                  />
                                  Oui
                                </span>
                              ) : (
                                <span className="badge bg-light text-muted">
                                  Non
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(statutItem.createdAt)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() =>
                                    setSelectedStatut(statutItem) &&
                                    setShowEditModal(true)
                                  }
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  title={
                                    statutItem.statut === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(statutItem)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      statutItem.statut === "actif"
                                        ? faBan
                                        : faCheckCircle
                                    }
                                  />
                                </button>
                                {!statutItem.defaut && (
                                  <button
                                    className="btn btn-outline-info"
                                    title="Définir par défaut"
                                    onClick={() => handleSetDefault(statutItem)}
                                    disabled={loading}
                                  >
                                    <FontAwesomeIcon icon={faCrown} />
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() =>
                                    setSelectedStatut(statutItem) &&
                                    setShowDeleteModal(true)
                                  }
                                  disabled={loading || statutItem.defaut}
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
                    {pagination.total > pagination.limit && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={filteredStatuts.length}
                        itemsPerPage={pagination.limit}
                        indexOfFirstItem={
                          (pagination.page - 1) * pagination.limit
                        }
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
        }

        .font-monospace {
          font-family:
            "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
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
      `}</style>
    </>
  );
}
