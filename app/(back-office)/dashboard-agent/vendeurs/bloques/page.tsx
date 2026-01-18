// app/(back-office)/dashboard-admin/vendeurs/liste-vendeurs-bloques/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  faHistory,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import EditVendeurModal from "../components/modals/ModifierVendeurModal";

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

// Composant de modal de déblocage multiple
const BulkUnblockModal = ({
  show,
  vendeurs,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  vendeurs: Vendeur[];
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || vendeurs.length === 0) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-warning">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Confirmer le déblocage multiple
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Êtes-vous sûr de vouloir débloquer{" "}
              <strong>{vendeurs.length} vendeur(s)</strong> ?
            </p>
            <div className="mt-3">
              <h6 className="text-warning mb-2">Vendeurs sélectionnés :</h6>
              <ul className="list-group list-group-flush">
                {vendeurs.slice(0, 5).map((vendeur) => (
                  <li key={vendeur.uuid} className="list-group-item py-2">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-muted me-2"
                      />
                      <div>
                        <strong>
                          {vendeur.nom} {vendeur.prenoms}
                        </strong>
                        <br />
                        <small className="text-muted">{vendeur.email}</small>
                      </div>
                    </div>
                  </li>
                ))}
                {vendeurs.length > 5 && (
                  <li className="list-group-item py-2 text-center text-muted">
                    ... et {vendeurs.length - 5} autres vendeur(s)
                  </li>
                )}
              </ul>
            </div>
            <p className="text-warning mt-3 mb-0">
              <small>
                Les vendeurs pourront à nouveau se connecter à leur compte.
              </small>
            </p>
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
              className="btn btn-warning"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Déblocage...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Débloquer {vendeurs.length} vendeur(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de suppression multiple
const BulkDeleteModal = ({
  show,
  vendeurs,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  vendeurs: Vendeur[];
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || vendeurs.length === 0) return null;

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
              Confirmer la suppression multiple
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{vendeurs.length} vendeur(s)</strong> ?
            </p>
            <div className="mt-3">
              <h6 className="text-danger mb-2">Vendeurs sélectionnés :</h6>
              <ul className="list-group list-group-flush">
                {vendeurs.slice(0, 5).map((vendeur) => (
                  <li key={vendeur.uuid} className="list-group-item py-2">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-muted me-2"
                      />
                      <div>
                        <strong>
                          {vendeur.nom} {vendeur.prenoms}
                        </strong>
                        <br />
                        <small className="text-muted">{vendeur.email}</small>
                      </div>
                    </div>
                  </li>
                ))}
                {vendeurs.length > 5 && (
                  <li className="list-group-item py-2 text-center text-muted">
                    ... et {vendeurs.length - 5} autres vendeur(s)
                  </li>
                )}
              </ul>
            </div>
            <p className="text-danger mt-3 mb-0">
              <small>
                Cette action enverra les vendeurs dans la liste des vendeurs
                supprimés. Vous pourrez les restaurer ultérieurement.
              </small>
            </p>
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
                  Supprimer {vendeurs.length} vendeur(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de déblocage simple
const UnblockModal = ({
  show,
  vendeur,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  vendeur: Vendeur | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !vendeur) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-warning">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Confirmer le déblocage
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Êtes-vous sûr de vouloir débloquer le vendeur{" "}
              <strong>
                {vendeur.nom} {vendeur.prenoms}
              </strong>{" "}
              ({vendeur.email}) ?
            </p>
            <p className="text-warning mb-0">
              <small>
                Le vendeur pourra à nouveau se connecter à son compte.
              </small>
            </p>
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
              className="btn btn-warning"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Déblocage...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Débloquer le vendeur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal de suppression simple
const DeleteModal = ({
  show,
  vendeur,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  vendeur: Vendeur | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !vendeur) return null;

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
              Confirmer la suppression
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
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
                  Supprimer
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
          <span className="fw-semibold">{totalItems}</span> vendeurs bloqués
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

export default function ListeVendeursBloquesPage() {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUnblockModal, setShowBulkUnblockModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedVendeur, setSelectedVendeur] = useState<Vendeur | null>(null);
  const [selectedVendeurForEdit, setSelectedVendeurForEdit] =
    useState<Vendeur | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vendeur | "civilite.libelle" | "role.name";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedVendeurs, setSelectedVendeurs] = useState<Set<string>>(
    new Set(),
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  // États pour les messages et chargements
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkUnblockLoading, setBulkUnblockLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Charger les vendeurs bloqués au montage
  useEffect(() => {
    fetchVendeursBloques();
  }, []);

  // Fonction pour charger les vendeurs bloqués
  const fetchVendeursBloques = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", currentLimit.toString());

        // Correction : utiliser les paramètres passés ou les états actuels
        const searchValue =
          params?.search !== undefined ? params.search : searchTerm;
        const typeValue =
          params?.type !== undefined ? params.type : selectedType;

        if (searchValue && searchValue.trim() !== "") {
          queryParams.append("search", searchValue.trim());
        }

        if (typeValue && typeValue !== "all") {
          queryParams.append("type", typeValue);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `${API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED}?${queryString}`
          : API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED;

        console.log("🔄 Fetching blocked vendeurs from:", endpoint);

        const response = await api.get<{
          data: Vendeur[];
          count: number;
          status: string;
        }>(endpoint);

        console.log("✅ Blocked vendeurs received:", {
          count: response.data?.length || 0,
          total: response.count,
        });

        // Vérifier que la réponse contient bien des vendeurs bloqués
        const blockedVendeurs = (response.data || []).filter(
          (v) => v.est_bloque,
        );
        setVendeurs(blockedVendeurs);

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: response.count || blockedVendeurs.length,
          pages:
            Math.ceil(
              (response.count || blockedVendeurs.length) / currentLimit,
            ) || 1,
        }));

        // Réinitialiser la sélection
        setSelectedVendeurs(new Set());
        setIsAllSelected(false);
      } catch (err: any) {
        console.error("❌ Error fetching blocked vendeurs:", err);
        setError(
          err.message || "Erreur lors du chargement des vendeurs bloqués",
        );
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, searchTerm, selectedType],
  );

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const fetchData = async () => {
      await fetchVendeursBloques({
        page: pagination.page,
        limit: pagination.limit,
      });
    };

    // Debounce pour éviter trop d'appels API
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit]);

  // Fonction pour gérer les filtres
  const handleFilterChange = useCallback(async () => {
    // Réinitialiser à la première page quand les filtres changent
    await fetchVendeursBloques({
      page: 1,
      limit: pagination.limit,
      search: searchTerm,
      type: selectedType,
    });
  }, [fetchVendeursBloques, searchTerm, selectedType, pagination.limit]);

  // Utiliser un debounce pour les changements de recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "" || selectedType !== "all") {
        handleFilterChange();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType, handleFilterChange]);

  // Fonction pour débloquer un vendeur
  const handleUnblockVendeur = async () => {
    if (!selectedVendeur) return;

    try {
      setUnblockLoading(true);

      await api.post(
        API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(selectedVendeur.uuid),
      );

      setShowUnblockModal(false);
      setSelectedVendeur(null);
      setSuccessMessage("Vendeur débloqué avec succès");
      fetchVendeursBloques();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors du déblocage:", err);
      setError("Erreur lors du déblocage du vendeur");
    } finally {
      setUnblockLoading(false);
    }
  };

  // Fonction pour débloquer plusieurs vendeurs
  const handleBulkUnblock = async () => {
    if (selectedVendeurs.size === 0) return;

    try {
      setBulkUnblockLoading(true);

      // Débloquer chaque vendeur sélectionné
      const promises = Array.from(selectedVendeurs).map((uuid) =>
        api.post(API_ENDPOINTS.ADMIN.VENDEURS.UNBLOCK(uuid)),
      );

      await Promise.all(promises);

      setShowBulkUnblockModal(false);
      setSuccessMessage(
        `${selectedVendeurs.size} vendeur(s) débloqué(s) avec succès`,
      );
      fetchVendeursBloques();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors du déblocage multiple:", err);
      setError("Erreur lors du déblocage des vendeurs");
    } finally {
      setBulkUnblockLoading(false);
    }
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
      fetchVendeursBloques();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression du vendeur");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs vendeurs
  const handleBulkDelete = async () => {
    if (selectedVendeurs.size === 0) return;

    try {
      setBulkDeleteLoading(true);

      // Supprimer chaque vendeur sélectionné
      const promises = Array.from(selectedVendeurs).map((uuid) =>
        api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(uuid)),
      );

      await Promise.all(promises);

      setShowBulkDeleteModal(false);
      setSuccessMessage(
        `${selectedVendeurs.size} vendeur(s) supprimé(s) avec succès`,
      );
      fetchVendeursBloques();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression multiple:", err);
      setError("Erreur lors de la suppression des vendeurs");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de déblocage
  const openUnblockModal = (vendeur: Vendeur) => {
    setSelectedVendeur(vendeur);
    setShowUnblockModal(true);
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (vendeur: Vendeur) => {
    setSelectedVendeur(vendeur);
    setShowDeleteModal(true);
  };

  // Fonction pour ouvrir le modal de déblocage multiple
  const openBulkUnblockModal = () => {
    if (selectedVendeurs.size === 0) {
      setError("Veuillez sélectionner au moins un vendeur");
      return;
    }
    setShowBulkUnblockModal(true);
  };

  // Fonction pour ouvrir le modal de suppression multiple
  const openBulkDeleteModal = () => {
    if (selectedVendeurs.size === 0) {
      setError("Veuillez sélectionner au moins un vendeur");
      return;
    }
    setShowBulkDeleteModal(true);
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
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedVendeurs(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(vendeurs.map((v) => v.uuid));
      setSelectedVendeurs(allIds);
      setIsAllSelected(true);
    }
  };

  const toggleSelectVendeur = (vendeurId: string) => {
    const newSelected = new Set(selectedVendeurs);
    if (newSelected.has(vendeurId)) {
      newSelected.delete(vendeurId);
    } else {
      newSelected.add(vendeurId);
    }
    setSelectedVendeurs(newSelected);
    setIsAllSelected(newSelected.size === vendeurs.length);
  };

  const isVendeurSelected = (vendeurId: string) => {
    return selectedVendeurs.has(vendeurId);
  };

  const clearSelection = () => {
    setSelectedVendeurs(new Set());
    setIsAllSelected(false);
  };

  // Filtrer et trier les vendeurs
  const filteredVendeurs = sortVendeurs(
    vendeurs.filter((v) => {
      // Filtre par recherche
      const searchMatch =
        !searchTerm ||
        searchTerm.trim() === "" ||
        v.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.prenoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.telephone.includes(searchTerm);

      // Filtre par type
      const typeMatch = selectedType === "all" || v.type === selectedType;

      return searchMatch && typeMatch && v.est_bloque && !v.is_deleted;
    }),
  );

  const currentItems = filteredVendeurs.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Fonction pour exporter les données
  const handleExport = async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.VENDEURS.EXPORT_BLOCKED_PDF,
        {
        },
      );

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vendeurs-bloques-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Export PDF réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
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
        "Date de blocage",
        "Créé le",
      ],
      ...filteredVendeurs.map((v) => [
        v.nom || "",
        v.prenoms || "",
        v.email || "",
        v.telephone || "",
        v.civilite?.libelle || "Non spécifié",
        v.type || "standard",
        "Bloqué",
        v.est_bloque ? formatDate(v.updated_at) : "N/A",
        formatDate(v.created_at),
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
      `vendeurs-bloques-${new Date().toISOString().split("T")[0]}.csv`,
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
    setSelectedType("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedVendeurs(new Set());
    setIsAllSelected(false);
  };

  // Calculer le nombre de vendeurs sélectionnés dans la page courante
  const selectedOnCurrentPage = currentItems.filter((v) =>
    selectedVendeurs.has(v.uuid),
  ).length;

  return (
    <>
      {/* Modal de modification de vendeur
      <EditVendeurModal
        isOpen={showEditModal}
        vendeur={selectedVendeurForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVendeurForEdit(null);
        }}
        onSuccess={() => {
          setSuccessMessage("Vendeur modifié avec succès");
          fetchVendeursBloques();
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
      */}
      

      {/* Modal de déblocage simple */}
      <UnblockModal
        show={showUnblockModal}
        vendeur={selectedVendeur}
        loading={unblockLoading}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedVendeur(null);
        }}
        onConfirm={handleUnblockVendeur}
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
      />

      {/* Modal de déblocage multiple */}
      <BulkUnblockModal
        show={showBulkUnblockModal}
        vendeurs={Array.from(selectedVendeurs).map(
          (id) => vendeurs.find((v) => v.uuid === id) as Vendeur,
        )}
        loading={bulkUnblockLoading}
        onClose={() => setShowBulkUnblockModal(false)}
        onConfirm={handleBulkUnblock}
      />

      {/* Modal de suppression multiple */}
      <BulkDeleteModal
        show={showBulkDeleteModal}
        vendeurs={Array.from(selectedVendeurs).map(
          (id) => vendeurs.find((v) => v.uuid === id) as Vendeur,
        )}
        loading={bulkDeleteLoading}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Vendeurs Bloqués</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    Liste des Vendeurs Bloqués
                  </h2>
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                    {pagination.total} vendeur(s) bloqué(s)
                  </span>
                  {selectedVendeurs.size > 0 && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                      {selectedVendeurs.size} sélectionné(s)
                    </span>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchVendeursBloques()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <Link
                  href="/dashboard-agent/vendeurs/liste-vendeurs"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faStore} />
                  Voir les vendeurs actifs
                </Link>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  disabled={vendeurs.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter PDF
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
          </div>

          {/* Actions de sélection multiple */}
          {selectedVendeurs.size > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="text-warning"
                  />
                  <span className="fw-semibold">
                    {selectedVendeurs.size} vendeur(s) sélectionné(s)
                    {selectedOnCurrentPage > 0 && (
                      <span className="text-muted ms-2">
                        ({selectedOnCurrentPage} sur cette page)
                      </span>
                    )}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                    onClick={clearSelection}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Annuler la sélection
                  </button>

                  <button
                    className="btn btn-sm btn-success d-flex align-items-center gap-2"
                    onClick={openBulkUnblockModal}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Débloquer ({selectedVendeurs.size})
                  </button>

                  <button
                    className="btn btn-sm btn-danger d-flex align-items-center gap-2"
                    onClick={openBulkDeleteModal}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer ({selectedVendeurs.size})
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
                    placeholder="Rechercher parmi les vendeurs bloqués..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm("")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-3">
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
                    <option value="expert">Expert</option>
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
            </div>

            <div className="row mt-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Total: <strong>{pagination.total}</strong> vendeurs bloqués
                    {filteredVendeurs.length !== pagination.total && (
                      <>
                        {" "}
                        | Filtrés: <strong>{filteredVendeurs.length}</strong>
                      </>
                    )}
                    {selectedVendeurs.size > 0 && (
                      <>
                        {" "}
                        | Sélectionnés: <strong>{selectedVendeurs.size}</strong>
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

          {/* Tableau des vendeurs bloqués */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des vendeurs bloqués...</p>
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
                        icon={faBan}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucun vendeur bloqué</h5>
                      <p className="mb-0">
                        {vendeurs.length === 0
                          ? "Aucun vendeur n'est actuellement bloqué"
                          : "Aucun vendeur bloqué ne correspond à vos critères de recherche"}
                      </p>
                      <div className="mt-3">
                        <Link
                          href="/dashboard-admin/vendeurs/liste-vendeurs"
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon icon={faStore} className="me-2" />
                          Voir les vendeurs actifs
                        </Link>
                      </div>
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
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                disabled={loading}
                              />
                            </div>
                          </th>
                          <th style={{ width: "60px" }} className="text-center">
                            #
                          </th>
                          <th style={{ width: "200px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("nom")}
                            >
                              Nom & Prénoms
                              {getSortIcon("nom")}
                            </button>
                          </th>
                          <th style={{ width: "200px" }}>
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
                          <th style={{ width: "150px" }}>
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
                          <th style={{ width: "150px" }}>
                            <button
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                              onClick={() => requestSort("updated_at")}
                            >
                              <FontAwesomeIcon
                                icon={faHistory}
                                className="me-1"
                              />
                              Bloqué le
                              {getSortIcon("updated_at")}
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
                        {currentItems.map((vendeur, index) => (
                          <tr key={vendeur.uuid} className="align-middle">
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={isVendeurSelected(vendeur.uuid)}
                                  onChange={() =>
                                    toggleSelectVendeur(vendeur.uuid)
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
                                    className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faBan} />
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
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faHistory}
                                  className="text-danger me-2"
                                />
                                <small className="text-danger fw-semibold">
                                  {formatDate(vendeur.updated_at)}
                                </small>
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
                                    window.open(
                                      `/dashboard-admin/vendeurs/${vendeur.uuid}`,
                                      "_blank",
                                    );
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
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
                                  className="btn btn-outline-success"
                                  title="Débloquer"
                                  onClick={() => openUnblockModal(vendeur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
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
                    {pagination.total > pagination.limit && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={filteredVendeurs.length}
                        itemsPerPage={pagination.limit}
                        indexOfFirstItem={
                          (pagination.page - 1) * pagination.limit
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

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .bg-warning.bg-opacity-10 {
          background-color: rgba(255, 193, 7, 0.1) !important;
        }
      `}</style>
    </>
  );
}
