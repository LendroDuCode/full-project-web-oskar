// app/(back-office)/dashboard-admin/vendeurs/liste-vendeurs-supprimes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faTrashRestore,
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
  faStore,
  faUserTag,
  faHistory,
  faExclamationTriangle,
  faBan,
  faCheckCircle,
  faLayerGroup,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faUsers,
  faUserShield,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

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
  deleted_at?: string;
  is_admin?: boolean;
  type?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
}

// Composant de statut
const StatusBadge = ({
  est_bloque,
  est_verifie,
  is_deleted,
  deleted_at,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span>Supprimé</span>
        {deleted_at && (
          <span className="fs-11 opacity-75">
            ({new Date(deleted_at).toLocaleDateString("fr-FR")})
          </span>
        )}
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

// Composant de modal générique pour les actions multiples
const BulkActionModal = ({
  show,
  type,
  vendeurs,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  type: "restore" | "delete";
  vendeurs: Vendeur[];
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || vendeurs.length === 0) return null;

  const isRestore = type === "restore";
  const title = isRestore
    ? "Confirmer la restauration multiple"
    : "Suppression définitive multiple";
  const icon = isRestore ? faTrashRestore : faTrash;
  const colorClass = isRestore ? "text-warning" : "text-danger";
  const buttonClass = isRestore ? "btn-warning" : "btn-danger";
  const actionText = isRestore ? "Restaurer" : "Supprimer définitivement";

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className={`modal-title ${colorClass}`}>
              <FontAwesomeIcon icon={icon} className="me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div
              className={`alert ${isRestore ? "alert-warning" : "alert-danger"} d-flex align-items-center`}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <div>
                <strong>
                  {isRestore ? "Attention" : "DANGER : Action irréversible"}
                </strong>
                <p className="mb-0">
                  {isRestore
                    ? `Vous êtes sur le point de restaurer ${vendeurs.length} vendeur(s) supprimé(s).`
                    : `Cette action supprimera définitivement ${vendeurs.length} vendeur(s) de la base de données.`}
                </p>
              </div>
            </div>

            <p>
              Êtes-vous {isRestore ? "sûr" : "ABSOLUMENT sûr"} de vouloir{" "}
              {isRestore ? "restaurer" : "supprimer définitivement"}{" "}
              <strong>{vendeurs.length} vendeur(s)</strong> ?
            </p>

            {!isRestore && (
              <ul className="text-danger">
                <li>Toutes les données associées seront perdues</li>
                <li>Cette action ne peut pas être annulée</li>
                <li>Les vendeurs ne pourront plus être restaurés</li>
              </ul>
            )}

            <div className="mt-3">
              <h6 className={`${colorClass} mb-2`}>Vendeurs sélectionnés :</h6>
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
                        {vendeur.deleted_at && <br />}
                        <small className="text-muted">
                          Supprimé le :{" "}
                          {new Date(vendeur.deleted_at!).toLocaleDateString(
                            "fr-FR",
                          )}
                        </small>
                      </div>
                    </div>
                  </li>
                ))}
                {vendeurs.length > 5 && (
                  <li className="list-group-item py-2 text-center text-muted">
                    ... et {vendeurs.length - 5} autre(s) vendeur(s)
                  </li>
                )}
              </ul>
            </div>

            <p className={`${colorClass} mt-3 mb-0`}>
              <small>
                {isRestore
                  ? "Les vendeurs seront restaurés dans la liste des vendeurs actifs."
                  : "Cette opération est irréversible. Veuillez confirmer seulement si vous êtes certain."}
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
              className={`btn ${buttonClass}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {isRestore ? "Restauration..." : "Suppression..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={icon} className="me-2" />
                  {actionText} {vendeurs.length} vendeur(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de modal pour les actions simples
const ActionModal = ({
  show,
  type,
  vendeur,
  loading,
  onClose,
  onConfirm,
}: {
  show: boolean;
  type: "restore" | "delete";
  vendeur: Vendeur | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!show || !vendeur) return null;

  const isRestore = type === "restore";
  const title = isRestore
    ? "Confirmer la restauration"
    : "Suppression définitive";
  const icon = isRestore ? faTrashRestore : faTrash;
  const colorClass = isRestore ? "text-warning" : "text-danger";
  const buttonClass = isRestore ? "btn-warning" : "btn-danger";
  const actionText = isRestore ? "Restaurer" : "Supprimer définitivement";

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className={`modal-title ${colorClass}`}>
              <FontAwesomeIcon icon={icon} className="me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div
              className={`alert ${isRestore ? "alert-warning" : "alert-danger"} d-flex align-items-center`}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <div>
                <strong>
                  {isRestore ? "Attention" : "DANGER : Action irréversible"}
                </strong>
                <p className="mb-0">
                  {isRestore
                    ? "Vous êtes sur le point de restaurer un vendeur supprimé."
                    : "Cette action supprimera définitivement le vendeur de la base de données."}
                </p>
              </div>
            </div>

            <p>
              Êtes-vous {isRestore ? "sûr" : "ABSOLUMENT sûr"} de vouloir{" "}
              {isRestore ? "restaurer" : "supprimer définitivement"} le vendeur{" "}
              <strong>
                {vendeur.nom} {vendeur.prenoms}
              </strong>{" "}
              ({vendeur.email}) ?
            </p>

            {!isRestore && (
              <ul className="text-danger">
                <li>Toutes les données associées seront perdues</li>
                <li>Cette action ne peut pas être annulée</li>
                <li>Le vendeur ne pourra plus être restauré</li>
              </ul>
            )}

            <div className="mb-3">
              <small className="text-muted">
                <strong>Supprimé le :</strong>{" "}
                {vendeur.deleted_at
                  ? new Date(vendeur.deleted_at).toLocaleString("fr-FR")
                  : "Date inconnue"}
              </small>
            </div>

            <p className={`${isRestore ? "text-success" : "text-danger"} mb-0`}>
              <small>
                {isRestore
                  ? "Le vendeur sera restauré dans la liste des vendeurs actifs."
                  : "Cette opération est irréversible. Veuillez confirmer seulement si vous êtes certain."}
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
              className={`btn ${buttonClass}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {isRestore ? "Restauration..." : "Suppression..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={icon} className="me-2" />
                  {actionText}
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
          <span className="fw-semibold">{totalItems}</span> vendeurs supprimés
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

// Hook personnalisé pour la gestion des filtres
const useFilters = () => {
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    dateFilter: "all",
    verificationStatus: "all",
    adminStatus: "all",
  });

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      dateFilter: "all",
      verificationStatus: "all",
      adminStatus: "all",
    });
  };

  return { filters, updateFilter, resetFilters };
};

export default function ListeVendeursSupprimesPage() {
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
  const [showActionModal, setShowActionModal] = useState<{
    type: "restore" | "delete";
    bulk: boolean;
  } | null>(null);
  const [selectedVendeur, setSelectedVendeur] = useState<Vendeur | null>(null);

  // États pour les filtres
  const { filters, updateFilter, resetFilters } = useFilters();

  // États pour le tri
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Vendeur | "civilite.libelle" | "role.name";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedVendeurs, setSelectedVendeurs] = useState<Set<string>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);

  // États pour les messages et chargements
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Options pour les filtres
  const filterOptions = useMemo(
    () => ({
      type: [
        { value: "all", label: "Tous les types" },
        { value: "standard", label: "Standard" },
        { value: "premium", label: "Premium" },
        { value: "expert", label: "Expert" },
      ],
      dateFilter: [
        { value: "all", label: "Toutes les dates" },
        { value: "today", label: "Aujourd'hui" },
        { value: "yesterday", label: "Hier" },
        { value: "week", label: "Cette semaine" },
        { value: "month", label: "Ce mois" },
        { value: "older", label: "Plus anciens" },
      ],
      verificationStatus: [
        { value: "all", label: "Tous les statuts" },
        { value: "verified", label: "Vérifiés" },
        { value: "not_verified", label: "Non vérifiés" },
      ],
      adminStatus: [
        { value: "all", label: "Tous" },
        { value: "admin", label: "Admins" },
        { value: "not_admin", label: "Non admins" },
      ],
    }),
    [],
  );

  // Charger les vendeurs supprimés au montage
  useEffect(() => {
    fetchVendeursSupprimes();
  }, []);

  // Fonction pour charger les vendeurs supprimés
  const fetchVendeursSupprimes = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      date_filter?: string;
      verification_status?: string;
      admin_status?: string;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", currentLimit.toString());

        if (params?.search) queryParams.append("search", params.search);
        if (params?.type && params.type !== "all")
          queryParams.append("type", params.type);
        if (params?.date_filter && params.date_filter !== "all")
          queryParams.append("date_filter", params.date_filter);
        if (params?.verification_status && params.verification_status !== "all")
          queryParams.append("verification_status", params.verification_status);
        if (params?.admin_status && params.admin_status !== "all")
          queryParams.append("admin_status", params.admin_status);

        const queryString = queryParams.toString();
        const endpoint = queryString
          ? `${API_ENDPOINTS.ADMIN.VENDEURS.DELETED}?${queryString}`
          : API_ENDPOINTS.ADMIN.VENDEURS.DELETED;

        const response = await api.get<{
          data: Vendeur[];
          count: number;
          status: string;
        }>(endpoint);

        // Assurer que seuls les vendeurs supprimés sont affichés
        const deletedVendeurs = (response.data || []).filter(
          (v) => v.is_deleted,
        );

        setVendeurs(deletedVendeurs);

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: response.count || deletedVendeurs.length,
          pages:
            Math.ceil(
              (response.count || deletedVendeurs.length) / currentLimit,
            ) || 1,
        }));

        // Réinitialiser la sélection
        setSelectedVendeurs(new Set());
        setSelectAll(false);
      } catch (err: any) {
        console.error("❌ Error fetching deleted vendeurs:", err);
        setError(
          err.message || "Erreur lors du chargement des vendeurs supprimés",
        );
        setVendeurs([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Gérer les changements de filtres avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendeursSupprimes({
        page: 1,
        limit: pagination.limit,
        search: filters.search || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        date_filter:
          filters.dateFilter !== "all" ? filters.dateFilter : undefined,
        verification_status:
          filters.verificationStatus !== "all"
            ? filters.verificationStatus
            : undefined,
        admin_status:
          filters.adminStatus !== "all" ? filters.adminStatus : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, pagination.limit, fetchVendeursSupprimes]);

  // Gérer les changements de page
  useEffect(() => {
    if (pagination.page > 1) {
      fetchVendeursSupprimes({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        date_filter:
          filters.dateFilter !== "all" ? filters.dateFilter : undefined,
        verification_status:
          filters.verificationStatus !== "all"
            ? filters.verificationStatus
            : undefined,
        admin_status:
          filters.adminStatus !== "all" ? filters.adminStatus : undefined,
      });
    }
  }, [pagination.page, pagination.limit]);

  // Fonction pour restaurer un ou plusieurs vendeurs
  const handleRestoreVendeurs = useCallback(async (uuids: string[]) => {
    try {
      setActionLoading(true);

      const promises = uuids.map((uuid) =>
        api.post(API_ENDPOINTS.ADMIN.VENDEURS.RESTORE(uuid)),
      );

      await Promise.all(promises);

      setSuccessMessage(`${uuids.length} vendeur(s) restauré(s) avec succès`);

      // Retirer les vendeurs restaurés de la liste locale
      setVendeurs((prev) => prev.filter((v) => !uuids.includes(v.uuid)));

      // Mettre à jour le total
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - uuids.length),
        pages:
          Math.ceil(Math.max(0, prev.total - uuids.length) / prev.limit) || 1,
      }));

      // Réinitialiser la sélection
      setSelectedVendeurs(new Set());
      setSelectAll(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la restauration:", err);
      setError(err.response?.data?.message || "Erreur lors de la restauration");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Fonction pour supprimer définitivement un ou plusieurs vendeurs
  const handlePermanentDeleteVendeurs = useCallback(async (uuids: string[]) => {
    try {
      setActionLoading(true);

      const promises = uuids.map((uuid) =>
        api.delete(API_ENDPOINTS.ADMIN.VENDEURS.DELETE(uuid)),
      );

      await Promise.all(promises);

      setSuccessMessage(
        `${uuids.length} vendeur(s) supprimé(s) définitivement`,
      );

      // Retirer les vendeurs de la liste locale
      setVendeurs((prev) => prev.filter((v) => !uuids.includes(v.uuid)));

      // Mettre à jour le total
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - uuids.length),
        pages:
          Math.ceil(Math.max(0, prev.total - uuids.length) / prev.limit) || 1,
      }));

      // Réinitialiser la sélection
      setSelectedVendeurs(new Set());
      setSelectAll(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression définitive:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression définitive",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  }, []);

  // Fonction pour ouvrir le modal d'action
  const openActionModal = (
    type: "restore" | "delete",
    bulk: boolean = false,
  ) => {
    if (bulk && selectedVendeurs.size === 0) {
      setError("Veuillez sélectionner au moins un vendeur");
      return;
    }
    setShowActionModal({ type, bulk });
  };

  // Fonction pour confirmer l'action
  const handleConfirmAction = () => {
    if (!showActionModal) return;

    const uuids = showActionModal.bulk
      ? Array.from(selectedVendeurs)
      : selectedVendeur
        ? [selectedVendeur.uuid]
        : [];

    if (uuids.length === 0) return;

    if (showActionModal.type === "restore") {
      handleRestoreVendeurs(uuids);
    } else {
      handlePermanentDeleteVendeurs(uuids);
    }

    setShowActionModal(null);
    setSelectedVendeur(null);
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
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "N/A";
    }
  }, []);

  // Fonction pour calculer la durée depuis la suppression
  const getDeletedDuration = useCallback(
    (dateString: string | null | undefined) => {
      if (!dateString) return "N/A";

      try {
        const deletedDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - deletedDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
          }
          return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
        } else if (diffDays === 1) {
          return "Hier";
        } else if (diffDays < 7) {
          return `Il y a ${diffDays} jours`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
        } else {
          const months = Math.floor(diffDays / 30);
          return `Il y a ${months} mois`;
        }
      } catch {
        return "N/A";
      }
    },
    [],
  );

  // Fonction de tri
  const sortVendeurs = useCallback(
    (vendeursList: Vendeur[]) => {
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

        // Gestion spéciale pour les dates de suppression
        if (sortConfig.key === "deleted_at") {
          aValue = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
          bValue = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
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

  const requestSort = useCallback(
    (key: keyof Vendeur | "role.name" | "civilite.libelle") => {
      let direction: "asc" | "desc" = "asc";
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === "asc"
      ) {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig],
  );

  const getSortIcon = useCallback(
    (key: keyof Vendeur | "role.name" | "civilite.libelle") => {
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

  // Filtrer et trier les vendeurs supprimés
  const filteredVendeurs = useMemo(() => {
    let filtered = vendeurs;

    // Filtrage côté client pour les options qui ne sont pas gérées par l'API
    if (filters.verificationStatus !== "all") {
      filtered = filtered.filter((v) =>
        filters.verificationStatus === "verified"
          ? v.est_verifie
          : !v.est_verifie,
      );
    }

    if (filters.adminStatus !== "all") {
      filtered = filtered.filter((v) =>
        filters.adminStatus === "admin" ? v.is_admin : !v.is_admin,
      );
    }

    return sortVendeurs(filtered);
  }, [vendeurs, filters.verificationStatus, filters.adminStatus, sortVendeurs]);

  const currentItems = useMemo(() => {
    return filteredVendeurs.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit,
    );
  }, [filteredVendeurs, pagination.page, pagination.limit]);

  // Gestion de la sélection multiple - DOIT ÊTRE DÉFINI APRÈS currentItems
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedVendeurs(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(currentItems.map((v) => v.uuid));
      setSelectedVendeurs(allIds);
      setSelectAll(true);
    }
  }, [selectAll, currentItems]);

  const toggleSelectVendeur = useCallback(
    (vendeurId: string) => {
      const newSelected = new Set(selectedVendeurs);
      if (newSelected.has(vendeurId)) {
        newSelected.delete(vendeurId);
      } else {
        newSelected.add(vendeurId);
      }
      setSelectedVendeurs(newSelected);
      setSelectAll(newSelected.size === currentItems.length);
    },
    [selectedVendeurs, currentItems.length],
  );

  const isVendeurSelected = useCallback(
    (vendeurId: string) => {
      return selectedVendeurs.has(vendeurId);
    },
    [selectedVendeurs],
  );

  const clearSelection = useCallback(() => {
    setSelectedVendeurs(new Set());
    setSelectAll(false);
  }, []);

  // Fonction pour exporter les données supprimées
  const handleExport = useCallback(async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.VENDEURS.EXPORT_DELETED_PDF,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vendeurs-supprimes-${new Date().toISOString().split("T")[0]}.pdf`;
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
  }, []);

  // Fallback CSV export
  const handleCSVExport = useCallback(() => {
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
        "Date de suppression",
        "Supprimé il y a",
        "Créé le",
      ],
      ...filteredVendeurs.map((v) => [
        v.nom || "",
        v.prenoms || "",
        v.email || "",
        v.telephone || "",
        v.civilite?.libelle || "Non spécifié",
        v.type || "standard",
        v.is_deleted ? "Supprimé" : v.est_bloque ? "Bloqué" : "Actif",
        formatDate(v.deleted_at),
        getDeletedDuration(v.deleted_at),
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
      `vendeurs-supprimes-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Export CSV réussi");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [filteredVendeurs, formatDate, getDeletedDuration]);

  // Réinitialiser tous les filtres
  const handleResetFilters = useCallback(() => {
    resetFilters();
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    clearSelection();
  }, [resetFilters, clearSelection]);

  // Statistiques
  const stats = useMemo(
    () => ({
      total: vendeurs.length,
      premium: vendeurs.filter((v) => v.type === "premium").length,
      verified: vendeurs.filter((v) => v.est_verifie).length,
      admins: vendeurs.filter((v) => v.is_admin).length,
    }),
    [vendeurs],
  );

  // Calculer le nombre de vendeurs sélectionnés sur la page courante
  const selectedOnCurrentPage = useMemo(
    () => currentItems.filter((v) => selectedVendeurs.has(v.uuid)).length,
    [currentItems, selectedVendeurs],
  );

  return (
    <>
      {/* Modals pour les actions */}
      {showActionModal &&
        (showActionModal.bulk ? (
          <BulkActionModal
            show={true}
            type={showActionModal.type}
            vendeurs={Array.from(selectedVendeurs).map(
              (id) => vendeurs.find((v) => v.uuid === id) as Vendeur,
            )}
            loading={actionLoading}
            onClose={() => setShowActionModal(null)}
            onConfirm={handleConfirmAction}
          />
        ) : (
          <ActionModal
            show={true}
            type={showActionModal.type}
            vendeur={selectedVendeur}
            loading={actionLoading}
            onClose={() => {
              setShowActionModal(null);
              setSelectedVendeur(null);
            }}
            onConfirm={handleConfirmAction}
          />
        ))}

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* En-tête simplifié */}
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">
                    Liste des Vendeurs Supprimés
                  </h2>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">
                    {pagination.total} vendeur(s) supprimé(s)
                  </span>
                  {selectedVendeurs.size > 0 && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                      {selectedVendeurs.size} sélectionné(s)
                    </span>
                  )}
                </div>
                <p className="text-muted mb-0 mt-1">
                  Gestion des vendeurs supprimés - Vous pouvez restaurer ou
                  supprimer définitivement
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchVendeursSupprimes()}
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
                  Vendeurs actifs
                </Link>

                <Link
                  href="/dashboard-agent/vendeurs/liste-vendeurs-bloques"
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faBan} />
                  Vendeurs bloqués
                </Link>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={vendeurs.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2"
                />
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
                    className="btn btn-sm btn-warning d-flex align-items-center gap-2"
                    onClick={() => openActionModal("restore", true)}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTrashRestore} />
                    Restaurer ({selectedVendeurs.size})
                  </button>

                  <button
                    className="btn btn-sm btn-danger d-flex align-items-center gap-2"
                    onClick={() => openActionModal("delete", true)}
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
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                  />
                  {filters.search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => updateFilter("search", "")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faUserTag} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                  >
                    {filterOptions.type.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faCalendar} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={filters.dateFilter}
                    onChange={(e) => updateFilter("dateFilter", e.target.value)}
                  >
                    {filterOptions.dateFilter.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className="text-muted"
                    />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={filters.verificationStatus}
                    onChange={(e) =>
                      updateFilter("verificationStatus", e.target.value)
                    }
                  >
                    {filterOptions.verificationStatus.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faUserShield}
                      className="text-muted"
                    />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={filters.adminStatus}
                    onChange={(e) =>
                      updateFilter("adminStatus", e.target.value)
                    }
                  >
                    {filterOptions.adminStatus.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-1">
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
                        {option}
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
                    Total: <strong>{pagination.total}</strong> vendeurs
                    supprimés
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
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-outline-secondary"
                  disabled={loading}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>

          {/* Tableau des vendeurs supprimés */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des vendeurs supprimés...</p>
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
                        icon={faTrash}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucun vendeur supprimé</h5>
                      <p className="mb-0">
                        {vendeurs.length === 0
                          ? "Aucun vendeur n'a été supprimé"
                          : "Aucun vendeur supprimé ne correspond à vos critères de recherche"}
                      </p>
                      <div className="mt-3 d-flex gap-2 justify-content-center">
                        <Link
                          href="/dashboard-agent/vendeurs/liste-vendeurs"
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon icon={faStore} className="me-2" />
                          Voir les vendeurs actifs
                        </Link>
                        <Link
                          href="/dashboard-agent/vendeurs/liste-vendeurs-bloques"
                          className="btn btn-danger"
                        >
                          <FontAwesomeIcon icon={faBan} className="me-2" />
                          Voir les vendeurs bloqués
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
                                checked={selectAll}
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
                              onClick={() => requestSort("deleted_at")}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="me-1"
                              />
                              Supprimé le
                              {getSortIcon("deleted_at")}
                            </button>
                          </th>
                          <th style={{ width: "120px" }}>
                            <span className="fw-semibold">Durée</span>
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
                                    className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold text-decoration-line-through">
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
                                  className="text-truncate text-decoration-line-through"
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
                                <span className="font-monospace text-decoration-line-through">
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
                                deleted_at={vendeur.deleted_at}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="text-secondary me-2"
                                />
                                <small className="text-secondary fw-semibold">
                                  {formatDate(vendeur.deleted_at)}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faHistory}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {getDeletedDuration(vendeur.deleted_at)}
                                </small>
                              </div>
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
                                  title="Restaurer"
                                  onClick={() => {
                                    setSelectedVendeur(vendeur);
                                    openActionModal("restore", false);
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faTrashRestore} />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer définitivement"
                                  onClick={() => {
                                    setSelectedVendeur(vendeur);
                                    openActionModal("delete", false);
                                  }}
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

        .text-decoration-line-through {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .fs-11 {
          font-size: 0.6875rem;
        }

        .bg-opacity-10 {
          background-color: rgba(var(--bs-secondary-rgb), 0.1) !important;
        }

        .card-body.py-2 {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
      `}</style>
    </>
  );
}
