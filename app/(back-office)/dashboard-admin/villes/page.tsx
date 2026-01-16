// app/(back-office)/dashboard-admin/villes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCity,
  faMapMarkerAlt,
  faFlag,
  faCalendar,
  faBuilding,
  faGlobe,
  faEye,
  faChartLine,
  faLocationDot,
  faCheckSquare,
  faSquare,
  faCheck,
  faBan,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import { useVilles } from "@/hooks/useVilles";
import type { Ville } from "@/services/villes/villes.types";
import CreateVilleModal from "./components/modals/CreateVilleModal";
import EditVilleModal from "./components/modals/EditVilleModal";
import DeleteVilleModal from "./components/modals/DeleteVilleModal";

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  if (statut === "actif") {
    return (
      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faCheckCircle} className="fs-12" />
        <span>Actif</span>
      </span>
    );
  }

  return (
    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faTimesCircle} className="fs-12" />
      <span>Inactif</span>
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
          <span className="fw-semibold">{totalItems}</span> villes
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

// Composant principal
export default function VillesPage() {
  const {
    villes,
    loading,
    error,
    pagination,
    fetchVilles,
    activateVille,
    deactivateVille,
    activateVilles,
    deactivateVilles,
    deleteVilles,
    setPage,
    setLimit,
    refresh,
  } = useVilles();

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVille, setSelectedVille] = useState<Ville | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedPays, setSelectedPays] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Ville;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour les messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // État pour la sélection multiple
  const [selectedVilles, setSelectedVilles] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les villes au montage
  useEffect(() => {
    fetchVilles();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
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

    if (selectedPays !== "all") {
      params.pays_uuid = selectedPays;
    }

    console.log("🔍 Fetching villes with params:", params);
    fetchVilles(params);
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedStatut,
    selectedPays,
  ]);

  // Réinitialiser la sélection quand les données changent
  useEffect(() => {
    setSelectedVilles(new Set());
    setIsSelectAll(false);
  }, [villes, pagination.page]);

  // Fonctions pour gérer les modals
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setLocalError(null);
  };

  const handleOpenEditModal = (ville: Ville) => {
    setSelectedVille(ville);
    setShowEditModal(true);
    setLocalError(null);
  };

  const handleOpenDeleteModal = (ville: Ville) => {
    setSelectedVille(ville);
    setShowDeleteModal(true);
    setLocalError(null);
  };

  // Fonction appelée après création réussie
  const handleVilleCreated = () => {
    setSuccessMessage("Ville créée avec succès !");
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction appelée après modification réussie
  const handleVilleUpdated = () => {
    setSuccessMessage("Ville modifiée avec succès !");
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction appelée après suppression réussie
  const handleVilleDeleted = () => {
    setSuccessMessage("Ville supprimée avec succès !");
    refresh();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour changer le statut d'une ville
  const handleToggleStatus = async (villeItem: Ville) => {
    try {
      setLocalError(null);

      if (villeItem.statut === "actif") {
        await deactivateVille(villeItem.uuid);
        setSuccessMessage("Ville désactivée avec succès");
      } else {
        await activateVille(villeItem.uuid);
        setSuccessMessage("Ville activée avec succès");
      }

      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("❌ Erreur lors du changement de statut:", err);
      setLocalError(err.message || "Erreur lors du changement de statut");
    }
  };

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
  const sortVilles = useCallback(
    (villesList: Ville[]) => {
      if (!sortConfig || !villesList.length) return villesList;

      return [...villesList].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Gérer les valeurs nulles
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Gérer le tri par pays
        if (sortConfig.key === "pays") {
          const aPays = a.pays?.nom || "";
          const bPays = b.pays?.nom || "";
          if (aPays < bPays) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aPays > bPays) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }

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

  const requestSort = useCallback((key: keyof Ville) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  }, []);

  const getSortIcon = useCallback(
    (key: keyof Ville) => {
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

  // Filtrer et trier les villes
  const filteredVilles = useMemo(() => {
    let result = villes;

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (ville) =>
          ville.nom?.toLowerCase().includes(searchLower) ||
          ville.code_postal?.toLowerCase().includes(searchLower) ||
          ville.pays?.nom?.toLowerCase().includes(searchLower) ||
          ville.pays?.code?.toLowerCase().includes(searchLower),
      );
    }

    // Filtrer par statut
    if (selectedStatut !== "all") {
      result = result.filter((ville) => ville.statut === selectedStatut);
    }

    // Filtrer par pays
    if (selectedPays !== "all") {
      result = result.filter((ville) => ville.pays?.uuid === selectedPays);
    }

    // Trier
    return sortVilles(result);
  }, [villes, searchTerm, selectedStatut, selectedPays, sortVilles]);

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      setLocalError(null);

      // Créer le contenu CSV
      const csvContent = [
        ["Nom", "Code Postal", "Pays", "Statut", "Créé le", "Modifié le"],
        ...filteredVilles.map((v) => [
          v.nom || "",
          v.code_postal || "",
          v.pays?.nom || "N/A",
          v.statut || "",
          formatDate(v.created_at),
          formatDate(v.updated_at),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `villes-${new Date().toISOString().split("T")[0]}.csv`;
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
    setSelectedPays("all");
    setSortConfig(null);
    setPage(1);
    setLocalError(null);
    setSelectedVilles(new Set());
    setIsSelectAll(false);
  };

  // Calculer les éléments à afficher
  const currentItems = useMemo(() => {
    return filteredVilles.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit,
    );
  }, [filteredVilles, pagination.page, pagination.limit]);

  // Extraire les pays uniques pour le filtre
  const uniquePays = useMemo(() => {
    const paysMap = new Map();
    villes.forEach((ville) => {
      if (ville.pays && !paysMap.has(ville.pays.uuid)) {
        paysMap.set(ville.pays.uuid, ville.pays);
      }
    });
    return Array.from(paysMap.values());
  }, [villes]);

  // Gestion de la sélection multiple
  const toggleSelectVille = (villeUuid: string) => {
    const newSelected = new Set(selectedVilles);
    if (newSelected.has(villeUuid)) {
      newSelected.delete(villeUuid);
    } else {
      newSelected.add(villeUuid);
    }
    setSelectedVilles(newSelected);
  };

  const toggleSelectAll = () => {
    if (isSelectAll || selectedVilles.size === currentItems.length) {
      setSelectedVilles(new Set());
      setIsSelectAll(false);
    } else {
      const allUuids = new Set(currentItems.map((v) => v.uuid));
      setSelectedVilles(allUuids);
      setIsSelectAll(true);
    }
  };

  const handleActivateSelected = async () => {
    if (selectedVilles.size === 0) return;

    try {
      setLocalError(null);
      await activateVilles(Array.from(selectedVilles));
      setSuccessMessage(
        `${selectedVilles.size} ville(s) activée(s) avec succès`,
      );
      setSelectedVilles(new Set());
      setIsSelectAll(false);
      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Erreur lors de l'activation");
    }
  };

  const handleDeactivateSelected = async () => {
    if (selectedVilles.size === 0) return;

    try {
      setLocalError(null);
      await deactivateVilles(Array.from(selectedVilles));
      setSuccessMessage(
        `${selectedVilles.size} ville(s) désactivée(s) avec succès`,
      );
      setSelectedVilles(new Set());
      setIsSelectAll(false);
      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Erreur lors de la désactivation");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVilles.size === 0) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedVilles.size} ville(s) ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      setLocalError(null);
      await deleteVilles(Array.from(selectedVilles));
      setSuccessMessage(
        `${selectedVilles.size} ville(s) supprimée(s) avec succès`,
      );
      setSelectedVilles(new Set());
      setIsSelectAll(false);
      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Erreur lors de la suppression");
    }
  };

  return (
    <>
      {/* Modals */}
      <CreateVilleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleVilleCreated}
      />

      {selectedVille && (
        <>
          <EditVilleModal
            isOpen={showEditModal}
            ville={selectedVille}
            onClose={() => {
              setShowEditModal(false);
              setSelectedVille(null);
            }}
            onSuccess={handleVilleUpdated}
          />

          <DeleteVilleModal
            isOpen={showDeleteModal}
            ville={selectedVille}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedVille(null);
            }}
            onSuccess={handleVilleDeleted}
          />
        </>
      )}

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Géographie</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Villes</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total}{" "}
                    {pagination.total === 1 ? "ville" : "villes"}
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
                  disabled={villes.length === 0 || loading}
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
                  Nouvelle Ville
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {(error || localError) && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
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
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
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
          </div>

          {/* Barre d'actions groupées */}
          {selectedVilles.size > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <FontAwesomeIcon
                    icon={faCheckSquare}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedVilles.size} ville(s) sélectionnée(s)
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    onClick={handleActivateSelected}
                    className="btn btn-sm btn-success d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faToggleOn} />
                    Activer
                  </button>
                  <button
                    onClick={handleDeactivateSelected}
                    className="btn btn-sm btn-warning d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faToggleOff} />
                    Désactiver
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="btn btn-sm btn-danger d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVilles(new Set());
                      setIsSelectAll(false);
                    }}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faBan} />
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    placeholder="Rechercher par nom, code postal, pays..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1); // Reset à la première page lors de la recherche
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
                    value={selectedStatut}
                    onChange={(e) => {
                      setSelectedStatut(e.target.value);
                      setPage(1);
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actives</option>
                    <option value="inactif">Inactives</option>
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
                    value={selectedPays}
                    onChange={(e) => {
                      setSelectedPays(e.target.value);
                      setPage(1);
                    }}
                    disabled={loading}
                  >
                    <option value="all">Tous les pays</option>
                    {uniquePays.map((pays) => (
                      <option key={pays.uuid} value={pays.uuid}>
                        {pays.nom} ({pays.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faFilter} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={pagination.limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
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
                    Total: <strong>{pagination.total}</strong> villes
                    {filteredVilles.length !== pagination.total && (
                      <>
                        {" "}
                        | Filtrées: <strong>{filteredVilles.length}</strong>
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

          {/* Tableau des villes */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des villes...</p>
              </div>
            ) : (
              <>
                {filteredVilles.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0 shadow-sm"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faCity}
                        className="fs-1 mb-3 text-info opacity-75"
                      />
                      <h5 className="alert-heading fw-bold">
                        Aucune ville trouvée
                      </h5>
                      <p className="mb-0 text-muted">
                        {villes.length === 0
                          ? "Aucune ville dans la base de données"
                          : "Aucune ville ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter la première ville
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "50px" }} className="text-center">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={
                                  isSelectAll ||
                                  selectedVilles.size === currentItems.length
                                }
                                onChange={toggleSelectAll}
                                disabled={loading || currentItems.length === 0}
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
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faCity} className="me-2" />
                              Ville
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("code_postal")}
                              disabled={loading}
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-2"
                              />
                              Code Postal
                              {getSortIcon("code_postal")}
                            </button>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent d-flex align-items-center"
                              onClick={() => requestSort("pays")}
                              disabled={loading}
                            >
                              <FontAwesomeIcon
                                icon={faGlobe}
                                className="me-2"
                              />
                              Pays
                              {getSortIcon("pays")}
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
                              Créée le
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
                        {currentItems.map((villeItem, index) => (
                          <tr key={villeItem.uuid} className="align-middle">
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedVilles.has(villeItem.uuid)}
                                  onChange={() =>
                                    toggleSelectVille(villeItem.uuid)
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
                                    className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faCity} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {villeItem.nom}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="text-muted me-2"
                                />
                                <code className="fw-bold bg-light px-2 py-1 rounded">
                                  {villeItem.code_postal}
                                </code>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faGlobe}
                                  className="text-muted me-2"
                                />
                                <div>
                                  <div className="fw-semibold">
                                    {villeItem.pays?.nom || "N/A"}
                                  </div>
                                  <small className="text-muted">
                                    {villeItem.pays?.code}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <StatusBadge statut={villeItem.statut} />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(villeItem.created_at)}
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
                                  onClick={() => handleOpenEditModal(villeItem)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className={`btn ${
                                    villeItem.statut === "actif"
                                      ? "btn-outline-danger"
                                      : "btn-outline-success"
                                  }`}
                                  title={
                                    villeItem.statut === "actif"
                                      ? "Désactiver"
                                      : "Activer"
                                  }
                                  onClick={() => handleToggleStatus(villeItem)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      villeItem.statut === "actif"
                                        ? faTimesCircle
                                        : faCheckCircle
                                    }
                                  />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() =>
                                    handleOpenDeleteModal(villeItem)
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

                    {/* Pagination */}
                    {pagination.total > pagination.limit && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={filteredVilles.length}
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
      `}</style>
    </>
  );
}
