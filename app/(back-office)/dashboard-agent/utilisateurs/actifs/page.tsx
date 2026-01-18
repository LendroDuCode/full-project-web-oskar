// app/(back-office)/dashboard-admin/utilisateurs/liste-utilisateurs/page.tsx
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
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faLock,
  faLockOpen,
  faEnvelopeOpen,
  faUserShield,
  faInfoCircle,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import CreateUserModal from "../components/modals/CreateUserModal";

// Types pour les utilisateurs

// Type principal User
interface User {
  // Identifiant unique
  uuid: string;
  code_utilisateur?: string;

  // Informations personnelles
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  photo_profil?: string;

  // Authentification
  mot_de_passe?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted?: boolean;
  raison_blocage?: string;
  date_derniere_connexion?: string;
  date_derniere_deconnexion?: string;

  // Rôles et permissions
  role_uuid: string;
  is_admin: boolean;
  permissions?: string[];

  // Civilité
  civilite_uuid?: string;

  // Statut matrimonial
  statut_matrimonial_uuid?: string;

  // Adresse
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;

  // Informations professionnelles
  profession?: string;
  employeur?: string;
  secteur_activite?: string;

  // Métadonnées
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;

  // Relations (optionnelles selon le contexte)
  civilite?: Civilite;
  role?: Role;
  statut_matrimonial?: StatutMatrimonial;
  user_profile?: UserProfile;
}

// Type pour le profil utilisateur étendu
interface UserProfile {
  uuid: string;
  user_uuid: string;
  bio?: string;
  site_web?: string;
  reseaux_sociaux?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferences?: {
    langue?: string;
    fuseau_horaire?: string;
    notifications_email?: boolean;
    notifications_push?: boolean;
    theme?: "light" | "dark" | "auto";
  };
  statistiques?: {
    nombre_connexions: number;
    derniere_activite?: string;
    temps_total_session?: number;
  };
  created_at?: string;
  updated_at?: string;
}

// Type pour les civilités
interface Civilite {
  uuid: string;
  libelle: string;
  code: string;
  ordre?: number;
  created_at?: string;
  updated_at?: string;
}

// Type pour les rôles
interface Role {
  uuid: string;
  name: string;
  description?: string;
  permissions: string[];
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type pour les statuts matrimoniaux
interface StatutMatrimonial {
  uuid: string;
  libelle: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour les formulaires
interface UserFormData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  civilite_uuid?: string;
  role_uuid: string;
  statut_matrimonial_uuid?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  profession?: string;
  employeur?: string;
  secteur_activite?: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
  mot_de_passe?: string;
  confirm_mot_de_passe?: string;
}

// Type pour la création d'utilisateur
interface CreateUserData {
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  mot_de_passe: string;
  confirm_mot_de_passe: string;
  civilite_uuid?: string;
  role_uuid: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
}

// Type pour la mise à jour d'utilisateur
interface UpdateUserData {
  nom?: string;
  prenoms?: string;
  email?: string;
  telephone?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  civilite_uuid?: string;
  role_uuid?: string;
  statut_matrimonial_uuid?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  profession?: string;
  employeur?: string;
  secteur_activite?: string;
  est_verifie?: boolean;
  est_bloque?: boolean;
  is_admin?: boolean;
  mot_de_passe?: string;
  photo_profil?: string;
}

// Type pour la réponse API
interface ApiResponseUser {
  success: boolean;
  message: string;
  data: User | User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Type pour les filtres de recherche
interface UserFilterType {
  search?: string;
  role_uuid?: string;
  civilite_uuid?: string;
  statut_matrimonial_uuid?: string;
  est_bloque?: boolean | string;
  est_verifie?: boolean | string;
  is_admin?: boolean | string;
  is_deleted?: boolean | string;
  date_debut?: string;
  date_fin?: string;
  orderBy?: keyof User | "role.name" | "civilite.libelle";
  orderDirection?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Type pour les statistiques utilisateur
interface UserStatsType {
  total: number;
  actifs: number;
  bloques: number;
  non_verifies: number;
  admins: number;
  nouveaux_cette_semaine: number;
  taux_activite: number;
  repartition_par_role: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  croissance_mensuelle: number;
}

// Type pour l'historique des connexions
interface UserLoginHistory {
  uuid: string;
  user_uuid: string;
  ip_address: string;
  user_agent: string;
  device_type?: string;
  browser?: string;
  os?: string;
  location?: {
    ville?: string;
    region?: string;
    pays?: string;
  };
  status: "success" | "failed" | "blocked";
  reason?: string;
  created_at: string;
}

// Type pour les activités utilisateur
interface UserActivity {
  uuid: string;
  user_uuid: string;
  type:
    | "connexion"
    | "deconnexion"
    | "modification"
    | "creation"
    | "suppression"
    | "telechargement"
    | "upload";
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Type pour les options de sélection
interface UserOptionType {
  value: string;
  label: string;
  email: string;
  role?: string;
  disabled?: boolean;
}

// Type pour l'export
interface UserExportData {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite: string;
  role: string;
  est_verifie: boolean;
  est_bloque: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  derniere_connexion?: string;
}

// Type pour les notifications utilisateur
interface UserNotification {
  uuid: string;
  user_uuid: string;
  type: "info" | "success" | "warning" | "error" | "system";
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

// Type pour les préférences utilisateur
interface UserPreferences {
  uuid: string;
  user_uuid: string;
  langue: string;
  fuseau_horaire: string;
  format_date: string;
  format_heure: string;
  notifications_email: boolean;
  notifications_push: boolean;
  theme: "light" | "dark" | "auto";
  email_frequency: "immediate" | "daily" | "weekly";
  created_at: string;
  updated_at: string;
}
// Interface local pour le composant
interface LocalUser extends Omit<User, "civilite" | "role"> {
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
}

// Interface pour la pagination
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Composant de statut
const StatusBadge = ({
  est_bloque,
  est_verifie,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
}) => {
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
  user,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  user: LocalUser | null;
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
            {type === "single" && user ? (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <strong>
                    {user.nom} {user.prenoms}
                  </strong>{" "}
                  ({user.email}) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à cet utilisateur seront perdues.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer <strong>{count}</strong>{" "}
                  utilisateur(s) sélectionné(s) ?
                </p>
                <p className="text-danger mb-0">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à ces utilisateurs seront perdues.
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
                    ? `Supprimer ${count} utilisateur(s)`
                    : "Supprimer définitivement"}
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
          <span className="fw-semibold">{totalItems}</span> utilisateurs
        </div>

        <nav aria-label="Pagination">
          <ul className="pagination mb-0">
            {/* Première page */}
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

            {/* Page précédente */}
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

            {/* Pages numérotées */}
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

            {/* Page suivante */}
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

            {/* Dernière page */}
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

export default function ListeUtilisateursActifsPage() {
  // États principaux
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<LocalUser | null>(null);

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LocalUser | "role.name" | "civilite.libelle";
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la sélection multiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // États pour les messages et chargements
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Options pour les éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  // Fonction pour charger les utilisateurs
  const fetchUsers = useCallback(
    async (params?: any) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: String(params?.page || pagination.page),
          limit: String(params?.limit || pagination.limit),
          ...params,
        });

        // Nettoyer les paramètres undefined
        Object.keys(queryParams).forEach((key) => {
          if (
            queryParams.get(key) === undefined ||
            queryParams.get(key) === null
          ) {
            queryParams.delete(key);
          }
        });

        const endpoint = `${API_ENDPOINTS.ADMIN.USERS.LIST}?${queryParams.toString()}`;
        console.log("📡 Requête API:", endpoint);

        const response = await api.get(endpoint);

        if (response.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);

          // Mettre à jour la pagination si disponible
          if (response.data.meta) {
            setPagination({
              page: response.data.meta.current_page || 1,
              limit: response.data.meta.per_page || pagination.limit,
              total: response.data.meta.total || response.data.data.length,
              pages: response.data.meta.last_page || 1,
            });
          } else {
            // Fallback si pas de métadonnées
            setPagination((prev) => ({
              ...prev,
              page: params?.page || prev.page,
              limit: params?.limit || prev.limit,
              total: response.data.data.length,
              pages: Math.ceil(
                response.data.data.length / (params?.limit || prev.limit),
              ),
            }));
          }
        } else {
          console.error("❌ Format de réponse inattendu:", response.data);
          setError("Format de réponse inattendu du serveur");
          setUsers([]);
        }
      } catch (err: any) {
        console.error("❌ Erreur lors du chargement des utilisateurs:", err);

        let errorMessage = "Erreur lors du chargement des utilisateurs";
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Fonction pour mettre à jour un utilisateur
  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await api.put(
        API_ENDPOINTS.ADMIN.USERS.UPDATE(userId),
        userData,
      );

      if (response.data) {
        // Mettre à jour l'utilisateur dans la liste
        setUsers((prev) =>
          prev.map((user) =>
            user.uuid === userId ? { ...user, ...response.data } : user,
          ),
        );
        return response.data;
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la mise à jour:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await api.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(userId));

      // Retirer l'utilisateur de la liste
      setUsers((prev) => prev.filter((user) => user.uuid !== userId));

      // Mettre à jour le total
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        pages: Math.ceil((prev.total - 1) / prev.limit),
      }));

      return true;
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir la liste
  const refresh = () => {
    fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm.trim() || undefined,
      est_bloque:
        selectedStatus === "blocked"
          ? "true"
          : selectedStatus === "active"
            ? "false"
            : undefined,
      est_verifie:
        selectedStatus === "unverified"
          ? "false"
          : selectedStatus === "active"
            ? "true"
            : undefined,
      is_admin:
        selectedRole === "admin"
          ? "true"
          : selectedRole === "user"
            ? "false"
            : undefined,
    });
  };

  // Fonctions pour la pagination
  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  // Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  // Gérer les changements de pagination et filtres
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Construction des paramètres de requête
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
        };

        // Ajout du terme de recherche si spécifié
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        // Ajout du filtre de statut si spécifié
        if (selectedStatus !== "all") {
          if (selectedStatus === "blocked") {
            params.est_bloque = "true";
          } else if (selectedStatus === "unverified") {
            params.est_verifie = "false";
          } else if (selectedStatus === "active") {
            params.est_bloque = "false";
            params.est_verifie = "true";
          }
        }

        // Ajout du filtre de rôle si spécifié
        if (selectedRole !== "all") {
          params.is_admin = selectedRole === "admin" ? "true" : "false";
        }

        console.log("📡 Paramètres de requête:", params);
        await fetchUsers(params);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des utilisateurs:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    selectedStatus,
    selectedRole,
  ]);

  // Fonction pour ouvrir la modal de création
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  // Fonction appelée après création réussie
  const handleUserCreated = () => {
    setSuccessMessage("Utilisateur créé avec succès !");
    refresh(); // Rafraîchir la liste des utilisateurs
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      await deleteUser(selectedUser.uuid);

      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage("Utilisateur supprimé avec succès");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setInfoMessage("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour supprimer plusieurs utilisateurs
  const handleDeleteMultipleUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Supprimer chaque utilisateur sélectionné
      for (const userId of selectedUsers) {
        try {
          await deleteUser(userId);
          successCount++;
        } catch (err) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      setSuccessMessage(
        `${successCount} utilisateur(s) supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Réinitialiser la sélection
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de la suppression multiple:", err);
      setInfoMessage("Erreur lors de la suppression des utilisateurs");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (utilisateur: LocalUser) => {
    setSelectedUser(utilisateur);
    setShowDeleteModal(true);
  };

  // Fonction pour bloquer/débloquer un utilisateur
  const handleToggleBlock = async (utilisateur: LocalUser) => {
    try {
      if (utilisateur.is_admin) {
        // Pour les admins
        const endpoint = utilisateur.est_bloque
          ? API_ENDPOINTS.ADMIN.USERS.UNBLOCK(utilisateur.uuid)
          : API_ENDPOINTS.ADMIN.USERS.BLOCK(utilisateur.uuid);

        await api.post(endpoint);
      } else {
        // Pour les utilisateurs réguliers
        await updateUser(utilisateur.uuid, {
          ...utilisateur,
          est_bloque: !utilisateur.est_bloque,
        } as Partial<User>);
      }

      // Rafraîchir la liste
      refresh();

      setSuccessMessage(
        `Utilisateur ${utilisateur.est_bloque ? "débloqué" : "bloqué"} avec succès`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erreur lors de l'opération:", err);
      setInfoMessage("Erreur lors de l'opération");
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
  const sortUtilisateurs = (utilisateurs: LocalUser[]) => {
    if (!sortConfig || !utilisateurs.length) return utilisateurs;

    return [...utilisateurs].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "role.name") {
        aValue = a.role?.name || "";
        bValue = b.role?.name || "";
      } else if (sortConfig.key === "civilite.libelle") {
        aValue = a.civilite?.libelle || "";
        bValue = b.civilite?.libelle || "";
      } else {
        aValue = a[sortConfig.key as keyof LocalUser];
        bValue = b[sortConfig.key as keyof LocalUser];
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
    key: keyof LocalUser | "role.name" | "civilite.libelle",
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
    key: keyof LocalUser | "role.name" | "civilite.libelle",
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
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const allUserIds = currentItems.map((user) => user.uuid);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  // Actions en masse
  const handleBulkAction = async (
    action:
      | "block"
      | "unblock"
      | "verify"
      | "delete"
      | "makeAdmin"
      | "removeAdmin",
  ) => {
    if (selectedUsers.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un utilisateur");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (action === "delete") {
      setShowDeleteMultipleModal(true);
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const userId of selectedUsers) {
        try {
          const user = users.find((u) => u.uuid === userId);
          if (!user) continue;

          switch (action) {
            case "block":
              await api.post(API_ENDPOINTS.ADMIN.USERS.BLOCK(userId));
              successCount++;
              break;
            case "unblock":
              await api.post(API_ENDPOINTS.ADMIN.USERS.UNBLOCK(userId));
              successCount++;
              break;
            case "verify":
              await updateUser(userId, { est_verifie: true } as Partial<User>);
              successCount++;
              break;
            case "makeAdmin":
              await updateUser(userId, { is_admin: true } as Partial<User>);
              successCount++;
              break;
            case "removeAdmin":
              await updateUser(userId, { is_admin: false } as Partial<User>);
              successCount++;
              break;
          }
        } catch (err) {
          console.error(`Erreur pour l'utilisateur ${userId}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} utilisateur(s) ${getActionLabel(action)} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Rafraîchir la liste
      refresh();
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setInfoMessage("Erreur lors de l'action en masse");
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
      case "makeAdmin":
        return "promu(s) administrateur";
      case "removeAdmin":
        return "rétrogradé(s)";
      default:
        return "modifié(s)";
    }
  };

  // Filtrer et trier les utilisateurs
  const filteredUtilisateurs = sortUtilisateurs(
    users.filter((user: LocalUser) => {
      // Filtrage côté client pour les cas où l'API ne filtre pas correctement
      let passesFilter = true;

      // Filtre par recherche
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        passesFilter =
          passesFilter &&
          (user.nom?.toLowerCase().includes(searchLower) ||
            user.prenoms?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.telephone?.includes(searchTerm));
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        if (selectedStatus === "blocked") {
          passesFilter = passesFilter && user.est_bloque === true;
        } else if (selectedStatus === "unverified") {
          passesFilter = passesFilter && user.est_verifie === false;
        } else if (selectedStatus === "active") {
          passesFilter =
            passesFilter &&
            user.est_bloque === false &&
            user.est_verifie === true;
        }
      }

      // Filtre par rôle
      if (selectedRole !== "all") {
        if (selectedRole === "admin") {
          passesFilter = passesFilter && user.is_admin === true;
        } else if (selectedRole === "user") {
          passesFilter = passesFilter && user.is_admin === false;
        }
      }

      return passesFilter;
    }) as LocalUser[],
  );

  const currentItems = filteredUtilisateurs.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  // Fallback CSV export
  const handleCSVExport = () => {
    if (filteredUtilisateurs.length === 0) return;

    const csvContent = [
      [
        "Nom",
        "Prénoms",
        "Email",
        "Téléphone",
        "Civilité",
        "Rôle",
        "Statut",
        "Créé le",
        "Modifié le",
      ],
      ...filteredUtilisateurs.map((u) => [
        u.nom || "",
        u.prenoms || "",
        u.email || "",
        u.telephone || "",
        u.civilite?.libelle || "Non spécifié",
        u.role?.name || "Utilisateur",
        u.est_bloque ? "Bloqué" : u.est_verifie ? "Actif" : "Non vérifié",
        formatDate(u.created_at),
        formatDate(u.updated_at),
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
      `utilisateurs-${new Date().toISOString().split("T")[0]}.csv`,
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
    setSelectedRole("all");
    setSortConfig(null);
    setPage(1);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll quand on change de page ou de sélection
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((user) =>
        selectedUsers.includes(user.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, currentItems]);

  return (
    <>
      {/* Modal de création d'utilisateur */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
      />

      {/* Modal de modification d'utilisateur
        <EditUserModal
          isOpen={showEditModal}
          user={
            selectedUserForEdit
              ? {
                  ...selectedUserForEdit,
                  date_naissance: selectedUserForEdit.date_naissance ?? undefined,
                }
              : null
          }
          onClose={() => {
            setShowEditModal(false);
            setSelectedUserForEdit(null);
          }}
          onSuccess={() => {
            setSuccessMessage("Utilisateur modifié avec succès");
            refresh();
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
        */}

      {/* Modal de suppression simple */}
      <DeleteModal
        show={showDeleteModal}
        user={selectedUser}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        type="single"
      />

      {/* Modal de suppression multiple */}
      <DeleteModal
        show={showDeleteMultipleModal}
        user={null}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteMultipleModal(false);
        }}
        onConfirm={handleDeleteMultipleUsers}
        type="multiple"
        count={selectedUsers.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Utilisateurs</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Liste des Utilisateurs</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {pagination.total} utilisateur(s){" "}
                    {selectedUsers.length > 0 &&
                      `(${selectedUsers.length} sélectionné(s))`}
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
                  onClick={handleCSVExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={users.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter CSV
                </button>

                <button
                  onClick={handleOpenCreateModal}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouvel Utilisateur
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
          {selectedUsers.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
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
                    onClick={() => handleBulkAction("makeAdmin")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUserShield} />
                    <span>Promouvoir admin</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("removeAdmin")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Retirer admin</span>
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
                      setSelectedUsers([]);
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1); // Retour à la première page lors de la recherche
                    }}
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
                      setPage(1);
                    }}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs (vérifiés)</option>
                    <option value="blocked">Bloqués</option>
                    <option value="unverified">Non vérifiés</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faUser} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Administrateurs</option>
                    <option value="user">Utilisateurs</option>
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
                    Résultats: <strong>{pagination.total}</strong>{" "}
                    utilisateur(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        avec statut "
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
                    {selectedRole !== "all" && (
                      <>
                        {" "}
                        et rôle "
                        <strong>
                          {selectedRole === "admin"
                            ? "Administrateurs"
                            : "Utilisateurs"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedUsers.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedUsers.length} sélectionné(s)
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3">Chargement des utilisateurs...</p>
              </div>
            ) : (
              <>
                {users.length === 0 ? (
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
                        Aucun utilisateur trouvé
                      </h5>
                      <p className="mb-0">
                        {users.length === 0
                          ? "Aucun utilisateur dans la base de données"
                          : "Aucun utilisateur ne correspond à vos critères de recherche"}
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary mt-3"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer le premier utilisateur
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
                              onClick={() => requestSort("role.name")}
                            >
                              Rôle
                              {getSortIcon("role.name")}
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
                        {currentItems.map((utilisateur, index) => (
                          <tr
                            key={utilisateur.uuid}
                            className={`align-middle ${selectedUsers.includes(utilisateur.uuid) ? "table-active" : ""}`}
                          >
                            <td className="text-center">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedUsers.includes(
                                    utilisateur.uuid,
                                  )}
                                  onChange={() =>
                                    handleSelectUser(utilisateur.uuid)
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
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <FontAwesomeIcon icon={faUser} />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div className="fw-semibold">
                                    {utilisateur.nom} {utilisateur.prenoms}
                                  </div>
                                  {utilisateur.is_admin && (
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
                                  title={utilisateur.email}
                                >
                                  {utilisateur.email}
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
                                  {utilisateur.telephone}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {utilisateur.civilite?.libelle || "N/A"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${utilisateur.is_admin ? "bg-primary" : "bg-secondary"} bg-opacity-10 text-dark border`}
                              >
                                {utilisateur.role?.name || "Utilisateur"}
                              </span>
                            </td>
                            <td>
                              <StatusBadge
                                est_bloque={utilisateur.est_bloque || false}
                                est_verifie={utilisateur.est_verifie || false}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-muted me-2"
                                />
                                <small className="text-muted">
                                  {formatDate(utilisateur.created_at)}
                                </small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <Link
                                  href={`/dashboard-admin/utilisateurs/${utilisateur.uuid}`}
                                  className="btn btn-outline-primary"
                                  title="Voir détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                                <button
                                  className="btn btn-outline-warning"
                                  title="Modifier"
                                  onClick={() => {
                                    // Préparer les données de l'utilisateur pour la modal
                                    const userForEdit: any = {
                                      uuid: utilisateur.uuid,
                                      nom: utilisateur.nom,
                                      prenoms: utilisateur.prenoms,
                                      email: utilisateur.email,
                                      telephone: utilisateur.telephone,
                                      civilite_uuid: utilisateur.civilite_uuid,
                                      role_uuid: utilisateur.role_uuid,
                                      est_verifie:
                                        utilisateur.est_verifie || false,
                                      est_bloque:
                                        utilisateur.est_bloque || false,
                                      is_admin: utilisateur.is_admin || false,
                                      code_utilisateur:
                                        utilisateur.code_utilisateur,
                                      created_at: utilisateur.created_at,
                                      updated_at: utilisateur.updated_at,
                                      civilite: utilisateur.civilite,
                                      role: utilisateur.role,
                                    };

                                    setSelectedUserForEdit(userForEdit);
                                    setShowEditModal(true);
                                  }}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button
                                  className="btn btn-outline-secondary"
                                  title={
                                    utilisateur.est_bloque
                                      ? "Débloquer"
                                      : "Bloquer"
                                  }
                                  onClick={() => handleToggleBlock(utilisateur)}
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      utilisateur.est_bloque
                                        ? faCheckCircle
                                        : faBan
                                    }
                                  />
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="Supprimer"
                                  onClick={() => openDeleteModal(utilisateur)}
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
                        totalItems={pagination.total}
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
