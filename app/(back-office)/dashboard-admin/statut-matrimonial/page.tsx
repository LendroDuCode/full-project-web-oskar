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
  faCode,
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

// Importez vos modals
import CreateStatutMatrimonialModal from "./components/modals/CreateStatutMatrimonialModal";
import EditStatutMatrimonialModal from "./components/modals/EditStatutMatrimonialModal";
import DeleteStatutMatrimonialModal from "./components/modals/DeleteStatutMatrimonialModal";

// Importez votre client API et endpoints
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import ViewStatutMatrimonialModal from "./components/modals/ViewStatutMatrimonialModal";
import BulkDeleteModal from "./components/modals/BulkDeleteModal";
import BulkActionsBar from "./components/modals/BulkActionsBar";
import DefaultBadge from "./components/modals/DefaultBadge";
import StatusBadge from "./components/modals/StatusBadge";

// Types pour le statut matrimonial
interface StatutMatrimonialType {
  // Identifiant unique
  uuid: string;

  // Informations principales
  libelle: string;
  slug: string;
  code: string;
  description?: string;
  is_default: boolean;

  // Statut et configuration
  statut: "actif" | "inactif";
  defaut: boolean;
  ordre?: number;

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // Données statistiques (optionnelles)
  nombreUtilisations?: number;
  derniereUtilisation?: string;

  // Historique des modifications
  historique?: Array<{
    date: string;
    action: string;
    utilisateur: string;
    details?: string;
  }>;

  // Relations (optionnelles selon les besoins)
  utilisateurs?: Array<{
    uuid: string;
    nom: string;
    prenom: string;
    email: string;
  }>;

  // Validation et contraintes
  estValide?: boolean;
  contraintes?: {
    minAge?: number;
    maxAge?: number;
    conditions?: string[];
  };
}

export default function StatutsMatrimoniauxPage() {
  // États principaux
  const [statuts, setStatuts] = useState<StatutMatrimonialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour la sélection multiple
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStatut, setSelectedStatut] =
    useState<StatutMatrimonialType | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [limit, setLimit] = useState(10);

  const itemsPerPageOptions = [5, 10, 20, 50];

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
          s.slug.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term),
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

  // Actions sur un statut unique
  const openViewModal = (statut: StatutMatrimonialType) => {
    setSelectedStatut(statut);
    setShowViewModal(true);
  };

  const openEditModal = (statut: StatutMatrimonialType) => {
    setSelectedStatut(statut);
    setShowEditModal(true);
  };

  const openDeleteModal = (statut: StatutMatrimonialType) => {
    setSelectedStatut(statut);
    setShowDeleteModal(true);
  };

  const handleDeleteStatut = async () => {
    if (!selectedStatut) return;

    try {
      setLoading(true);
      setError(null);

      await api.delete(
        API_ENDPOINTS.STATUTS_MATRIMONIAUX.DELETE(selectedStatut.uuid),
      );

      setShowDeleteModal(false);
      setSelectedStatut(null);
      clearSelection();
      await fetchStatuts();

      setSuccessMessage("Statut matrimonial supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du statut",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Actions en masse
  const handleBulkAction = async (actionId: string) => {
    if (selectedRows.size === 0) {
      setError("Veuillez sélectionner au moins un statut");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (actionId === "delete") {
      setShowBulkDeleteModal(true);
      return;
    }

    try {
      const promises = Array.from(selectedRows).map((uuid) => {
        const newStatus = actionId === "activate" ? "actif" : "inactif";
        return api.put(API_ENDPOINTS.STATUTS_MATRIMONIAUX.UPDATE(uuid), {
          statut: newStatus,
        });
      });

      await Promise.all(promises);

      setSuccessMessage(
        `${selectedRows.size} statut(s) ${actionId === "activate" ? "activé(s)" : "désactivé(s)"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      clearSelection();
      await fetchStatuts();
    } catch (err: any) {
      setError("Erreur lors de l'action en masse");
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = Array.from(selectedRows).map((uuid) =>
        api.delete(API_ENDPOINTS.STATUTS_MATRIMONIAUX.DELETE(uuid)),
      );

      await Promise.all(promises);

      setShowBulkDeleteModal(false);
      clearSelection();
      await fetchStatuts();

      setSuccessMessage(
        `${selectedRows.size} statut(s) supprimé(s) avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du succès
  const handleSuccess = (message: string = "Opération réussie") => {
    setSuccessMessage(message);
    clearSelection();
    fetchStatuts();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Export CSV
  const handleCSVExport = () => {
    if (filteredStatuts.length === 0) {
      setError("Aucun statut à exporter");
      return;
    }
    try {
      const csvContent = [
        [
          "Libellé",
          "Code",
          "Slug",
          "Statut",
          "Ordre",
          "Par défaut",
          "Créé le",
          "Modifié le",
        ],
        ...filteredStatuts.map((s) => [
          s.libelle || "",
          s.code || "",
          s.slug || "",
          s.statut || "",
          s.ordre || "0",
          s.is_default ? "Oui" : "Non",
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

  // Pagination
  const currentItems = useMemo(() => {
    return filteredStatuts.slice(0, limit);
  }, [filteredStatuts, limit]);

  return (
    <>
      {/* Modals */}
      <CreateStatutMatrimonialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />

      <EditStatutMatrimonialModal
        isOpen={showEditModal}
        statut={selectedStatut}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStatut(null);
        }}
        onSuccess={handleSuccess}
      />

      <ViewStatutMatrimonialModal
        isOpen={showViewModal}
        statut={selectedStatut}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStatut(null);
        }}
        onEdit={() => {
          if (selectedStatut) {
            setShowViewModal(false);
            setShowEditModal(true);
          }
        }}
      />

      {/* CORRIGÉ : Utilisation correcte des props */}
      <DeleteStatutMatrimonialModal
        isOpen={showDeleteModal} // Utilisez isOpen au lieu de show
        statut={selectedStatut}
        loading={loading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStatut(null);
        }}
        onConfirm={handleDeleteStatut}
        onSuccess={() =>
          handleSuccess("Statut matrimonial supprimé avec succès")
        } // Ajoutez onSuccess
      />

      <BulkDeleteModal
        show={showBulkDeleteModal}
        loading={loading}
        count={selectedRows.size}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
      />

      {/* Interface principale */}
      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            {/* En-tête */}
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
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Statut
                </button>
              </div>
            </div>

            {/* Messages */}
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
                    placeholder="Rechercher par libellé, slug ou code..."
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
                    onClick={() => setShowCreateModal(true)}
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
                    <th style={{ width: "200px" }}>Libellé</th>
                    <th style={{ width: "100px" }}>Code</th>
                    <th style={{ width: "150px" }}>Slug</th>
                    <th style={{ width: "100px" }}>Statut</th>
                    <th style={{ width: "150px" }}>
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Créé le
                    </th>
                    <th style={{ width: "160px" }} className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((statut, index) => (
                    <tr
                      key={statut.uuid}
                      className={`align-middle ${selectedRows.has(statut.uuid) ? "table-active" : ""}`}
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
                          <DefaultBadge
                            isDefault={statut.is_default || false}
                          />
                        </div>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">
                          {statut.code}
                        </code>
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
                          {/* NOUVEAU : Bouton Voir détails */}
                          <button
                            className="btn btn-outline-info"
                            title="Voir détails"
                            onClick={() => openViewModal(statut)}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            title="Modifier"
                            onClick={() => openEditModal(statut)}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Supprimer"
                            onClick={() => openDeleteModal(statut)}
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
