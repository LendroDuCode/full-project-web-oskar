// app/(back-office)/dashboard-admin/vendeurs/liste-vendeurs/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faBan,
  faCheckCircle,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faUser,
  faUserCheck,
  faUserSlash,
  faEnvelope,
  faPhone,
  faCalendar,
  faTrash,
  faStore,
  faUserTag,
  faUsers,
  faCheck,
  faTimes,
  faLock,
  faLockOpen,
  faUserShield,
  faCheckSquare,
  faSquare,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import DashboardHeader from "../../components/ModPanelHeader";
import CreateVendeurModal from "../components/modals/CreateVendeurModal";
import ModifierVendeurModal from "../components/modals/ModifierVendeurModal";

// Types pour les vendeurs
interface Vendeur {
  uuid: string;
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
  is_admin?: boolean;
  type?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  code?: string;
  avatar?: string;
}

// Composant de statut
const StatusBadge = ({
  est_bloque,
  est_verifie,
  is_deleted,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
  is_deleted?: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span>Supprimé</span>
      </span>
    );
  }

  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span>Bloqué</span>
      </span>
    );
  }

  if (!est_verifie) {
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faUserSlash} className="fs-12" />
        <span>Non vérifié</span>
      </span>
    );
  }

  return (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1">
      <FontAwesomeIcon icon={faUserCheck} className="fs-12" />
      <span>Actif</span>
    </span>
  );
};

// Composant de modal de suppression
const DeleteModal = ({
  show,
  vendeur,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  vendeur: Vendeur | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: "single" | "multiple";
  count?: number;
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {type === "multiple"
                ? "Suppression multiple"
                : "Confirmer la suppression"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {type === "single" && vendeur ? (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer le vendeur{" "}
                  <strong>
                    {vendeur.nom} {vendeur.prenoms}
                  </strong>{" "}
                  ({vendeur.email}) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action enverra le vendeur dans la liste des vendeurs
                    supprimés. Vous pourrez le restaurer ultérieurement.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer <strong>{count}</strong>{" "}
                  vendeur(s) sélectionné(s) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action est irréversible. Les vendeurs seront envoyés
                    dans la liste des vendeurs supprimés.
                  </small>
                </p>
              </>
            )}
          </div>
          <div className="modal-footer">
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
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {type === "multiple"
                    ? `Supprimer ${count} vendeur(s)`
                    : "Supprimer"}
                </>
              )}
            </button>
          </div>
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
          <span className="fw-semibold">{totalItems}</span> vendeurs
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

export default function ListeVendeursActifsPage() {
  // États pour les données
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedVendeur, setSelectedVendeur] = useState<Vendeur | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVendeurForEdit, setSelectedVendeurForEdit] =
    useState<Vendeur | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vendeur | "civilite.libelle" | "role.name";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedVendeurs, setSelectedVendeurs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les messages et chargements
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les vendeurs avec pagination uniquement
  const fetchVendeurs = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", currentLimit.toString());

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `${API_ENDPOINTS.ADMIN.VENDEURS.LIST}?${queryString}`
          : API_ENDPOINTS.ADMIN.VENDEURS.LIST;

        console.log("🔄 Fetching vendeurs from:", endpoint);

        const response = await api.get<{
          data: Vendeur[];
          count: number;
          status: string;
        }>(endpoint);

        console.log("✅ Vendeurs received:", {
          count: response.data?.length || 0,
          total: response.count,
        });

        setVendeurs(response.data || []);

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: response.count || 0,
          pages: Math.ceil((response.count || 0) / currentLimit) || 1,
        }));
      } catch (err: any) {
        console.error("❌ Error fetching vendeurs:", err);
        setError(err.message || "Erreur lors du chargement des vendeurs");
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Charger les vendeurs au montage
  useEffect(() => {
    fetchVendeurs();
  }, []);

  // Fonction pour ouvrir la modal de création
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // Fonction appelée après création réussie
  const handleVendeurCreated = () => {
    setSuccessMessage("Vendeur créé avec succès !");
    fetchVendeurs({
      page: 1,
      limit: pagination.limit,
    });
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour supprimer un vendeur
  const handleDeleteVendeur = async () => {
    if (!selectedVendeur) return;

    try {
      setDeleteLoading(true);
      await api.delete(
        API_ENDPOINTS.ADMIN.VENDEURS.DELETE(selectedVendeur.uuid),
      );

      setShowDeleteModal(false);
      setSelectedVendeur(null);
      setSuccessMessage("Vendeur supprimé avec succès");

      // Rafraîchir la liste
      fetchVendeurs({
        page: 1,
        limit: pagination.limit,
      });

      // Réinitialiser la sélection
      setSelectedVendeurs([]);
      setSelectAll(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setInfoMessage(err.message || "Erreur lors de la suppression du vendeur");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs vendeurs
  const handleDeleteMultipleVendeurs = async () => {
    if (selectedVendeurs.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Supprimer chaque vendeur sélectionné
      for (const vendeurId of selectedVendeurs) {
        try {
          await api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(vendeurId));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le vendeur ${vendeurId}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} vendeur(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedVendeurs([]);
      setSelectAll(false);

      // Rafraîchir la liste
      fetchVendeurs({
        page: 1,
        limit: pagination.limit,
      });
    } catch (err: any) {
      console.error("Erreur lors de la suppression multiple:", err);
      setInfoMessage("Erreur lors de la suppression des vendeurs");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (vendeur: Vendeur) => {
    setSelectedVendeur(vendeur);
    setShowDeleteModal(true);
  };

  // Fonction pour bloquer/débloquer un vendeur
  const handleToggleBlock = async (vendeur: Vendeur) => {
    try {
      const endpoint = vendeur.est_bloque
        ? API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(vendeur.uuid)
        : API_ENDPOINTS.ADMIN.VENDEURS.BLOCK(vendeur.uuid);

      await api.post(endpoint);

      // Rafraîchir la liste
      fetchVendeurs({
        page: pagination.page,
        limit: pagination.limit,
      });

      setSuccessMessage(
        `Vendeur ${vendeur.est_bloque ? "débloqué" : "bloqué"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de l'opération:", err);
      setInfoMessage(err.message || "Erreur lors de l'opération");
    }
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

  // Fonction de tri
  const sortVendeurs = (vendeursList: Vendeur[]) => {
    if (!sortConfig || !vendeursList.length) return vendeursList;

    return [...vendeursList].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "role.name") {
        aValue = a.role?.name || "";
        bValue = b.role?.name || "";
      } else if (sortConfig.key === "civilite.libelle") {
        aValue = a.civilite?.libelle || "";
        bValue = b.civilite?.libelle || "";
      } else {
        aValue = a[sortConfig.key as keyof Vendeur];
        bValue = b[sortConfig.key as keyof Vendeur];
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

  const requestSort = (
    key: keyof Vendeur | "role.name" | "civilite.libelle",
  ) => {
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

  const getSortIcon = (
    key: keyof Vendeur | "role.name" | "civilite.libelle",
  ) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  // Gestion de la sélection multiple
  const handleSelectVendeur = (vendeurId: string) => {
    setSelectedVendeurs((prev) => {
      if (prev.includes(vendeurId)) {
        return prev.filter((id) => id !== vendeurId);
      } else {
        return [...prev, vendeurId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVendeurs([]);
    } else {
      const allVendeurIds = filteredVendeurs.map((vendeur) => vendeur.uuid);
      setSelectedVendeurs(allVendeurIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAllOnPage = () => {
    const pageVendeurIds = currentItems.map((vendeur) => vendeur.uuid);
    const allSelected = pageVendeurIds.every((id) =>
      selectedVendeurs.includes(id),
    );

    if (allSelected) {
      // Désélectionner tous les vendeurs de la page
      setSelectedVendeurs((prev) =>
        prev.filter((id) => !pageVendeurIds.includes(id)),
      );
    } else {
      // Sélectionner tous les vendeurs de la page
      const newSelection = [
        ...new Set([...selectedVendeurs, ...pageVendeurIds]),
      ];
      setSelectedVendeurs(newSelection);
    }
  };

  // Filtrer les vendeurs côté client (solution de secours)
  const filteredVendeurs = useMemo(() => {
    let result = vendeurs.filter((v) => !v.is_deleted);

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.nom?.toLowerCase().includes(searchLower) ||
          v.prenoms?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower) ||
          v.telephone?.includes(searchTerm),
      );
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        result = result.filter((v) => !v.est_bloque && v.est_verifie);
      } else if (selectedStatus === "blocked") {
        result = result.filter((v) => v.est_bloque);
      } else if (selectedStatus === "unverified") {
        result = result.filter((v) => !v.est_verifie);
      }
    }

    // Filtrer par type
    if (selectedType !== "all") {
      result = result.filter((v) => v.type === selectedType);
    }

    // Appliquer le tri
    if (sortConfig && result.length > 0) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "role.name") {
          aValue = a.role?.name || "";
          bValue = b.role?.name || "";
        } else if (sortConfig.key === "civilite.libelle") {
          aValue = a.civilite?.libelle || "";
          bValue = b.civilite?.libelle || "";
        } else {
          aValue = a[sortConfig.key as keyof Vendeur];
          bValue = b[sortConfig.key as keyof Vendeur];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [vendeurs, searchTerm, selectedStatus, selectedType, sortConfig]);

  // Pagination côté client
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredVendeurs.slice(startIndex, endIndex);
  }, [filteredVendeurs, pagination.page, pagination.limit]);

  // Mettre à jour la pagination totale basée sur les résultats filtrés
  const filteredPagination = useMemo(() => {
    const totalPages = Math.ceil(filteredVendeurs.length / pagination.limit);
    return {
      ...pagination,
      total: filteredVendeurs.length,
      pages: totalPages > 0 ? totalPages : 1,
    };
  }, [filteredVendeurs.length, pagination]);

  // Actions en masse
  const handleBulkAction = async (
    action:
      | "block"
      | "unblock"
      | "verify"
      | "delete"
      | "makePremium"
      | "makeStandard",
  ) => {
    if (selectedVendeurs.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un vendeur");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const vendeurId of selectedVendeurs) {
        try {
          switch (action) {
            case "block":
              await api.post(API_ENDPOINTS.ADMIN.VENDEURS.BLOCK(vendeurId));
              successCount++;
              break;
            case "unblock":
              await api.post(API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(vendeurId));
              successCount++;
              break;
            case "verify":
              // Note: Vous devrez créer un endpoint pour vérifier les vendeurs
              // await api.post(API_ENDPOINTS.ADMIN.VENDEURS.VERIFY(vendeurId));
              successCount++;
              break;
            case "makePremium":
              await api.put(API_ENDPOINTS.ADMIN.VENDEURS.UPDATE(vendeurId), {
                type: "premium",
              });
              successCount++;
              break;
            case "makeStandard":
              await api.put(API_ENDPOINTS.ADMIN.VENDEURS.UPDATE(vendeurId), {
                type: "standard",
              });
              successCount++;
              break;
            case "delete":
              // Pour la suppression, on utilise la modal de confirmation
              setShowDeleteMultipleModal(true);
              setBulkActionLoading(false);
              return;
          }
        } catch (err) {
          console.error(`Erreur pour le vendeur ${vendeurId}:`, err);
          errorCount++;
        }
      }

      if (action !== "delete") {
        setSuccessMessage(
          `${successCount} vendeur(s) ${getActionLabel(action)} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
        );
        setTimeout(() => setSuccessMessage(null), 3000);

        // Rafraîchir la liste
        fetchVendeurs({
          page: pagination.page,
          limit: pagination.limit,
        });

        // Réinitialiser la sélection pour les actions non-destructives
        setSelectedVendeurs([]);
        setSelectAll(false);
      }
    } catch (err: any) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage(err.message || "Erreur lors de l'action en masse");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "block":
        return "bloqué(s)";
      case "unblock":
        return "débloqué(s)";
      case "verify":
        return "vérifié(s)";
      case "makePremium":
        return "passé(s) en premium";
      case "makeStandard":
        return "passé(s) en standard";
      default:
        return "modifié(s)";
    }
  };

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.VENDEURS.EXPORT_PDF, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vendeurs-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Export PDF réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de l'export:", err);
      handleCSVExport();
    }
  };

  // Fallback CSV export
  const handleCSVExport = () => {
    if (filteredVendeurs.length === 0) return;

    const csvContent = [
      [
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Type",
        "Statut",
        "Créé le",
        "Modifié le",
      ],
      ...filteredVendeurs.map((v) => [
        v.nom || "",
        v.prenoms || "",
        v.email || "",
        v.telephone || "",
        v.civilite?.libelle || "Non spécifié",
        v.type || "standard",
        v.est_bloque ? "Bloqué" : v.est_verifie ? "Actif" : "Non vérifié",
        formatDate(v.created_at),
        formatDate(v.updated_at),
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
      `vendeurs-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Export CSV réussi");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedVendeurs([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll quand on change de page ou de sélection
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((vendeur) =>
        selectedVendeurs.includes(vendeur.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedVendeurs, currentItems]);

  // Effet pour gérer les changements de filtres
  useEffect(() => {
    // Réinitialiser à la première page quand les filtres changent
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, selectedStatus, selectedType]);

  return (
    <>
      {/* Modal de création de vendeur */}
      <CreateVendeurModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleVendeurCreated}
      />

      {/* Modal de modification de vendeur */}
      <ModifierVendeurModal
        isOpen={showEditModal}
        vendeur={selectedVendeurForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVendeurForEdit(null);
        }}
        onSuccess={() => {
          setSuccessMessage("Vendeur modifié avec succès");
          fetchVendeurs({
            page: pagination.page,
            limit: pagination.limit,
          });
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />

      {/* Modal de suppression simple */}
      <DeleteModal
        show={showDeleteModal}
        vendeur={selectedVendeur}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVendeur(null);
        }}
        onConfirm={handleDeleteVendeur}
        type="single"
      />

      {/* Modal de suppression multiple */}
      <DeleteModal
        show={showDeleteMultipleModal}
        vendeur={null}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteMultipleModal(false);
        }}
        onConfirm={handleDeleteMultipleVendeurs}
        type="multiple"
        count={selectedVendeurs.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Vendeurs</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Vendeurs</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredVendeurs.length} vendeur(s){" "}
                    {selectedVendeurs.length > 0 &&
                      `(${selectedVendeurs.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    fetchVendeurs({
                      page: pagination.page,
                      limit: pagination.limit,
                    })
                  }
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={vendeurs.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Vendeur
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon icon={faBan} className="me-2" />
                <strong>Attention:</strong> {error}
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

            {infoMessage && (
              <div
                className="alert alert-info alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Information:</strong> {infoMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions en masse */}
          {selectedVendeurs.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedVendeurs.length} vendeur(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("verify")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Vérifier email</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("block")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Bloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("unblock")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faLockOpen} />
                    <span>Débloquer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("makePremium")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Passer en Premium</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("makeStandard")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Passer en Standard</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("delete")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Supprimer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => {
                      setSelectedVendeurs([]);
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
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher par nom, prénom, email ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">
                      Actifs (vérifiés et non bloqués)
                    </option>
                    <option value="blocked">Bloqués</option>
                    <option value="unverified">Non vérifiés</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faUserTag} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
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
                    onChange={(e) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }))
                    }
                  >
                    {itemsPerPageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-1">
                <button
                  onClick={resetFilters}
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  title="Réinitialiser les filtres"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  <span className="d-none d-md-inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredVendeurs.length}</strong>{" "}
                    vendeur(s) sur <strong>{vendeurs.length}</strong> au total
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        | Statut: "
                        <strong>
                          {selectedStatus === "active"
                            ? "Actifs"
                            : selectedStatus === "blocked"
                              ? "Bloqués"
                              : "Non vérifiés"}
                        </strong>
                        "
                      </>
                    )}
                    {selectedType !== "all" && (
                      <>
                        {" "}
                        | Type: "
                        <strong>
                          {selectedType === "premium" ? "Premium" : "Standard"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedVendeurs.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedVendeurs.length} sélectionné(s)
                    </small>
                  )}
                  <button
                    onClick={handleSelectAllOnPage}
                    className="btn btn-sm btn-outline-primary"
                    disabled={currentItems.length === 0}
                  >
                    <FontAwesomeIcon icon={faCheckSquare} className="me-1" />
                    Sélectionner la page
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des vendeurs */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des vendeurs...</p>
              </div>
            ) : (
              <>
                {filteredVendeurs.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faStore}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucun vendeur trouvé</h5>
                      <p className="mb-0">
                        {vendeurs.length === 0
                          ? "Aucun vendeur dans la base de données"
                          : "Aucun vendeur ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer le premier vendeur
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
                                type="checkbox"
                                className="form-check-input"
                                checked={selectAll && currentItems.length > 0}
                                onChange={handleSelectAll}
                                disabled={currentItems.length === 0}
                                title={
                                  selectAll
                                    ? "Tout désélectionner"
                                    : "Tout sélectionner"
                                }
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "180px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("nom")}
                            >
                              Nom & Prénoms
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "180px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("email")}
                            >
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-1"
                              />
                              Email
                              {getSortIcon("email")}
                            </button>
                          </th>
                          <th style={{ width: "140px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("telephone")}
                            >
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-1"
                              />
                              Téléphone
                              {getSortIcon("telephone")}
                            </button>
                          </th>
                          <th style={{ width: "100px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("civilite.libelle")}
                            >
                              Civilité
                              {getSortIcon("civilite.libelle")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("type")}
                            >
                              Type
                              {getSortIcon("type")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Statut</span>
                          </th>
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
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
                            style={{ width: "140px" }}
                            className="text-center"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((vendeur, index) => (
                          <tr
                            key={vendeur.uuid}
                            className={`align-middle ${selectedVendeurs.includes(vendeur.uuid) ? "table-active" : ""}`}
                          >
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedVendeurs.includes(
                                    vendeur.uuid,
                                  )}
                                  onChange={() =>
                                    handleSelectVendeur(vendeur.uuid)
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
                                  <div
                                    className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faStore} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {vendeur.nom} {vendeur.prenoms}
                                  </div>
                                  {vendeur.is_admin && (
                                    <span className="badge bg-info bg-opacity-10 text-info fs-11 px-2 py-1">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faEnvelope}
                                  className="text-muted me-2"
                                />
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: "180px" }}
                                  title={vendeur.email}
                                >
                                  {vendeur.email}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="text-muted me-2"
                                />
                                <span className="font-monospace">
                                  {vendeur.telephone}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {vendeur.civilite?.libelle || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${vendeur.type === "premium" ? "bg-warning" : "bg-secondary"} bg-opacity-10 text-dark border`}
                              >
                                {vendeur.type || "standard"}
                              </span>
                            </td>
                            <td>
                              <StatusBadge
                                est_bloque={vendeur.est_bloque}
                                est_verifie={vendeur.est_verifie}
                                is_deleted={vendeur.is_deleted}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(vendeur.created_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <Link
                                  href={`/dashboard-agent/vendeurs/${vendeur.uuid}`}
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    setSelectedVendeurForEdit(vendeur);
                                    setShowEditModal(true);
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  title={
                                    vendeur.est_bloque ? "Débloquer" : "Bloquer"
                                  }
                                  onClick={() => handleToggleBlock(vendeur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      vendeur.est_bloque ? faCheckCircle : faBan
                                    }
                                  />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => openDeleteModal(vendeur)}
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
                    {filteredPagination.total > filteredPagination.limit && (
                      <Pagination
                        currentPage={filteredPagination.page}
                        totalPages={filteredPagination.pages}
                        totalItems={filteredVendeurs.length}
                        itemsPerPage={filteredPagination.limit}
                        indexOfFirstItem={
                          (filteredPagination.page - 1) *
                          filteredPagination.limit
                        }
                        onPageChange={(page) =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
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
