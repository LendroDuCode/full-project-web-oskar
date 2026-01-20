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
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

// Importez votre client API et endpoints
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface StatutMatrimonialType {
  uuid: string;
  libelle: string;
  code: string;
  slug: string;
  statut: "actif" | "inactif";
  createdAt?: string;
  updatedAt?: string;
}

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
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("activate")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faPlay} />
            Activer
          </button>
          <button
            className="btn btn-warning btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("deactivate")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faPause} />
            Désactiver
          </button>
          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-2"
            onClick={() => onBulkAction("delete")}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTrashIcon} />
            Supprimer
          </button>
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
  const [statuts, setStatuts] = useState<StatutMatrimonialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // États pour la sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];
  const [limit, setLimit] = useState(10);

  // Charger les statuts
  const fetchStatuts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(API_ENDPOINTS.STATUTS_MATRIMONIAUX.ALL);

      if (response.status === "success" && Array.isArray(response.data)) {
        setStatuts(response.data);
      } else {
        throw new Error("Format de réponse invalide");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des statuts:", err);
      setError(
        err.message || "Erreur lors du chargement des statuts matrimoniaux",
      );
      setStatuts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    fetchStatuts();
  }, [fetchStatuts]);

  // Fonction utilitaire
  const formatDate = (dateString: string | null | undefined) => {
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

  // Filtrer les statuts
  const filteredStatuts = useMemo(() => {
    let result = [...statuts];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.libelle.toLowerCase().includes(term) ||
          s.slug.toLowerCase().includes(term),
      );
    }
    if (selectedStatus !== "all") {
      result = result.filter((s) => s.statut === selectedStatus);
    }
    return result;
  }, [statuts, searchTerm, selectedStatus]);

  // Gestion de la sélection
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

  // Actions en masse
  const handleBulkAction = async (actionId: string) => {
    if (selectedRows.size === 0) {
      setLocalError("Veuillez sélectionner au moins un statut");
      setTimeout(() => setLocalError(null), 3000);
      return;
    }

    if (actionId === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

    try {
      // Simuler l'action (vous pouvez appeler votre API ici)
      setLocalError(null);
      setSuccessMessage(
        `${selectedRows.size} statut(s) ${actionId === "activate" ? "activé(s)" : "désactivé(s)"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      clearSelection();
    } catch (err: any) {
      setLocalError("Erreur lors de l'action en masse");
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLocalError(null);
      setSuccessMessage(
        `${selectedRows.size} statut(s) supprimé(s) avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowBulkDeleteModal(false);
      clearSelection();
    } catch (err: any) {
      setLocalError("Erreur lors de la suppression");
    }
  };

  // Export CSV
  const handleCSVExport = () => {
    if (filteredStatuts.length === 0) {
      setError("Aucun statut à exporter");
      return;
    }
    try {
      const csvContent = [
        ["Libellé", "Slug", "Statut", "Créé le", "Modifié le"],
        ...filteredStatuts.map((s) => [
          s.libelle || "",
          s.slug || "",
          s.statut || "",
          formatDate(s.createdAt),
          formatDate(s.updatedAt),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `statuts-matrimoniaux-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Export CSV réussi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Erreur lors de l'export CSV");
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    clearSelection();
  };

  // Pagination simulée (car l'API ne la fournit pas)
  const currentItems = useMemo(() => {
    return filteredStatuts.slice(0, limit);
  }, [filteredStatuts, limit]);

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
                    {filteredStatuts.length} statut(s)
                    {selectedRows.size > 0 &&
                      ` (${selectedRows.size} sélectionné(s))`}
                  </span>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={fetchStatuts}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>
                <button
                  onClick={handleCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={filteredStatuts.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>
                <button
                  onClick={() => alert("Fonctionnalité en développement")}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Statut
                </button>
              </div>
            </div>

            {/* Messages */}
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
                  onClick={() => {
                    setError(null);
                    setLocalError(null);
                  }}
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
                ></button>
              </div>
            )}
          </div>

          {/* Barre d'actions en masse */}
          <BulkActionsBar
            selectedCount={selectedRows.size}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
            isAllSelected={isAllSelected}
            totalItems={filteredStatuts.length}
            loading={loading}
          />

          {/* Filtres */}
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
                    <option value="actif">Actifs</option>
                    <option value="inactif">Inactifs</option>
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
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
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
                  className="btn btn-outline-secondary w-100"
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des statuts matrimoniaux...</p>
              </div>
            ) : filteredStatuts.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="alert alert-info mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="fs-1 mb-3 text-info"
                  />
                  <h5 className="alert-heading">
                    {statuts.length === 0
                      ? "Aucun statut trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0">
                    {statuts.length === 0
                      ? "Aucun statut matrimonial dans la base de données."
                      : "Aucun statut ne correspond à vos critères de recherche."}
                  </p>
                  <button
                    onClick={() => alert("Fonctionnalité en développement")}
                    className="btn btn-primary mt-3"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Ajouter le premier statut
                  </button>
                </div>
              </div>
            ) : (
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "50px" }} className="text-center">
                      <div className="form-check d-flex justify-content-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isAllSelected && currentItems.length > 0}
                          onChange={handleSelectAll}
                          disabled={currentItems.length === 0}
                        />
                      </div>
                    </th>
                    <th style={{ width: "60px" }} className="text-center">
                      #
                    </th>
                    <th style={{ width: "250px" }}>Libellé</th>
                    <th style={{ width: "150px" }}>Slug</th>
                    <th style={{ width: "120px" }}>Statut</th>
                    <th style={{ width: "150px" }}>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Créé le
                    </th>
                    <th style={{ width: "140px" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((statut, index) => (
                    <tr
                      key={statut.uuid}
                      className={`align-middle ${
                        selectedRows.has(statut.uuid) ? "table-active" : ""
                      }`}
                    >
                      <td className="text-center">
                        <div className="form-check d-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedRows.has(statut.uuid)}
                            onChange={() => handleRowSelect(statut.uuid)}
                          />
                        </div>
                      </td>
                      <td className="text-center text-muted fw-semibold">
                        {index + 1}
                      </td>
                      <td>
                        <div className="fw-semibold d-flex align-items-center">
                          {statut.libelle}
                          <DefaultBadge isDefault={false} />
                        </div>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">
                          {statut.slug}
                        </code>
                      </td>
                      <td>
                        <StatusBadge statut={statut.statut} />
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(statut.createdAt)}
                        </small>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-outline-warning"
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Supprimer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </>
  );
}
