"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserTie,
  faStore,
  faSearch,
  faFilter,
  faEye,
  faEdit,
  faBan,
  faTrash,
  faRefresh,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faUserCheck,
  faUserXmark,
  faUserSlash,
  faInfoCircle,
  faKey,
  faCog,
  faCheck,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface User {
  id: number | string;
  uuid: string;
  nom: string;
  prenoms?: string;
  email: string;
  telephone?: string;
  avatar?: string;
  status: string;
  statut?: string;
  est_bloque: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  date_inscription?: string;
  derniere_connexion?: string;
  role?: {
    name: string;
  };
  civilite?: {
    libelle: string;
  };
  est_verifie?: boolean;
  type?: string;
  feature?: string;
  adminUuid?: string;
  role_uuid?: string;
  civilite_uuid?: string;
}

interface UserSectionProps {
  type: "utilisateurs" | "agents" | "vendeurs";
  title: string;
  icon: any;
  color: string;
}

export default function UsersManagementSection() {
  const [activeTab, setActiveTab] = useState<
    "utilisateurs" | "agents" | "vendeurs"
  >("utilisateurs");
  const [loading, setLoading] = useState({
    utilisateurs: true,
    agents: true,
    vendeurs: true,
  });
  const [error, setError] = useState<string | null>(null);

  const userSections: UserSectionProps[] = [
    {
      type: "utilisateurs",
      title: "Gestion des Utilisateurs",
      icon: faUsers,
      color: "primary",
    },
    {
      type: "agents",
      title: "Gestion des Agents",
      icon: faUserTie,
      color: "info",
    },
    {
      type: "vendeurs",
      title: "Gestion des Vendeurs",
      icon: faStore,
      color: "success",
    },
  ];

  const getEndpoints = (type: "utilisateurs" | "agents" | "vendeurs") => {
    switch (type) {
      case "utilisateurs":
        return API_ENDPOINTS.ADMIN.USERS;
      case "agents":
        return API_ENDPOINTS.ADMIN.AGENTS;
      case "vendeurs":
        return API_ENDPOINTS.ADMIN.VENDEURS;
    }
  };

  const refreshData = async () => {
    const currentEndpoints = getEndpoints(activeTab);
    // Logique de rafraîchissement sera gérée dans chaque UserSection
    console.log("Rafraîchissement demandé pour:", activeTab);
  };

  return (
    <div className="container-fluid p-0">
      {/* En-tête avec tabs */}
      <div className="card border shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1">Gestion des Comptes</h4>
              <p className="text-muted small mb-0">
                Gérez les utilisateurs, agents et vendeurs de la plateforme
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                onClick={refreshData}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Rafraîchir
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-body pt-0">
          <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
            {userSections.map((section) => (
              <li key={section.type} className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === section.type ? "active" : ""}`}
                  onClick={() => setActiveTab(section.type)}
                  style={{
                    borderBottomColor:
                      activeTab === section.type
                        ? `var(--bs-${section.color})`
                        : "transparent",
                  }}
                >
                  <FontAwesomeIcon
                    icon={section.icon}
                    className={`me-2 text-${section.color}`}
                  />
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contenu des tabs */}
      <div className="tab-content">
        {userSections.map((section) => (
          <div
            key={section.type}
            className={`tab-pane fade ${activeTab === section.type ? "show active" : ""}`}
            role="tabpanel"
          >
            <UserSection
              type={section.type}
              title={section.title}
              icon={section.icon}
              color={section.color}
              loading={loading[section.type]}
              onLoadingChange={(isLoading) =>
                setLoading((prev) => ({ ...prev, [section.type]: isLoading }))
              }
              onError={setError}
            />
          </div>
        ))}
      </div>

      {/* Logs d'audit */}
      <div className="mt-4">
        <AuditLogsSection />
      </div>
    </div>
  );
}

function UserSection({
  type,
  title,
  icon,
  color,
  loading,
  onLoadingChange,
  onError,
}: UserSectionProps & {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string | null) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeView, setActiveView] = useState<
    "actifs" | "bloques" | "supprimes"
  >("actifs");
  const itemsPerPage = 10;

  const endpoints =
    type === "utilisateurs"
      ? API_ENDPOINTS.ADMIN.USERS
      : type === "agents"
        ? API_ENDPOINTS.ADMIN.AGENTS
        : API_ENDPOINTS.ADMIN.VENDEURS;

  // Fonction pour normaliser les données utilisateur selon votre API
  const normalizeUserData = (data: any): User => {
    return {
      id: data.id || 0,
      uuid: data.uuid || "",
      nom: data.nom || "N/A",
      prenoms: data.prenoms || data.prenom || "",
      email: data.email || "N/A",
      telephone: data.telephone || "",
      avatar: data.avatar || null,
      status: determineStatus(data),
      statut: data.statut || data.status || "actif",
      est_bloque: data.est_bloque || false,
      is_deleted: data.is_deleted || false,
      deleted_at: data.deleted_at || null,
      created_at: data.created_at || data.date_inscription || "",
      updated_at: data.updated_at || data.updatedAt || "",
      date_inscription: data.created_at || data.date_inscription || "",
      derniere_connexion: data.derniere_connexion || data.last_login || "",
      role: data.role || { name: "Non spécifié" },
      civilite: data.civilite || { libelle: "Non spécifié" },
      est_verifie: data.est_verifie || false,
      type: data.type || "standard",
      feature: data.feature || "",
      adminUuid: data.adminUuid || "",
      role_uuid: data.role_uuid || "",
      civilite_uuid: data.civilite_uuid || "",
    };
  };

  // Fonction pour déterminer le statut selon votre logique métier
  const determineStatus = (data: any): string => {
    if (data.is_deleted || data.deleted_at) return "supprime";
    if (data.est_bloque) return "bloque";
    return data.statut || data.status || "actif";
  };

  const fetchUsers = async (view: "actifs" | "bloques" | "supprimes") => {
    try {
      onLoadingChange(true);
      onError(null);

      let endpoint;
      switch (view) {
        case "bloques":
          endpoint = endpoints.BLOCKED;
          break;
        case "supprimes":
          endpoint = endpoints.DELETED;
          break;
        default:
          endpoint = endpoints.LIST;
      }

      const response = await api.get(endpoint);

      console.log(`API Response for ${type} ${view}:`, response);

      let rawData: any[] = [];

      // Gestion du format de réponse de votre API
      if (response?.data && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (Array.isArray(response)) {
        rawData = response;
      } else if (response?.items && Array.isArray(response.items)) {
        rawData = response.items;
      }

      // Normaliser les données
      const normalizedData = rawData.map(normalizeUserData);

      console.log(`Normalized data for ${type} ${view}:`, normalizedData);

      // Filtrer selon la vue
      let filteredData = normalizedData;
      if (view === "actifs") {
        filteredData = normalizedData.filter(
          (user) => !user.is_deleted && !user.deleted_at && !user.est_bloque,
        );
      } else if (view === "bloques") {
        filteredData = normalizedData.filter((user) => user.est_bloque);
      } else if (view === "supprimes") {
        filteredData = normalizedData.filter(
          (user) => user.is_deleted || user.deleted_at,
        );
      }

      if (view === "actifs") {
        setUsers(filteredData);
      } else if (view === "bloques") {
        setBlockedUsers(filteredData);
      } else {
        setDeletedUsers(filteredData);
      }
    } catch (err: any) {
      console.error(`Erreur lors du chargement des ${type} ${view}:`, err);
      onError(err.message || `Erreur lors du chargement des ${type}`);

      // Données de démo en cas d'erreur
      const demoData = generateDemoData(type, view);
      if (view === "actifs") {
        setUsers(demoData);
      } else if (view === "bloques") {
        setBlockedUsers(demoData);
      } else {
        setDeletedUsers(demoData);
      }
    } finally {
      onLoadingChange(false);
    }
  };

  // Données de démonstration
  const generateDemoData = (type: string, view: string): User[] => {
    const baseNames =
      type === "utilisateurs"
        ? ["Jean", "Marie", "Paul", "Sophie", "Thomas"]
        : type === "agents"
          ? ["Moussa", "Amina", "Ibrahim", "Fatou"]
          : ["TechStore", "FashionShop", "ElectroPro", "BookWorld"];

    const lastNames =
      type === "utilisateurs"
        ? ["Dupont", "Martin", "Bernard", "Dubois", "Richard"]
        : type === "agents"
          ? ["Traoré", "Diallo", "Sow", "Camara"]
          : ["Corporation", "Enterprises", "Group", "Ltd"];

    return Array.from({ length: 8 }, (_, i) => {
      const firstName = baseNames[i % baseNames.length];
      const lastName = lastNames[i % lastNames.length];
      const email =
        type === "vendeurs"
          ? `${firstName.toLowerCase()}@${lastName.toLowerCase()}.com`
          : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com`;

      return normalizeUserData({
        id: i + 1,
        uuid: `uuid-${i + 1}`,
        nom: lastName,
        prenoms: type === "vendeurs" ? undefined : firstName,
        email: email,
        telephone: `+33 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        avatar: null,
        est_bloque: view === "bloques",
        is_deleted: view === "supprimes",
        deleted_at: view === "supprimes" ? new Date().toISOString() : null,
        created_at: new Date(
          Date.now() - Math.random() * 31536000000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
        statut:
          view === "actifs"
            ? "actif"
            : view === "bloques"
              ? "bloque"
              : "supprime",
        role: {
          name:
            type === "utilisateurs"
              ? "Client"
              : type === "agents"
                ? "Support"
                : "Vendeur Pro",
        },
        civilite: { libelle: "Monsieur" },
        est_verifie: Math.random() > 0.5,
        type: "standard",
      });
    });
  };

  useEffect(() => {
    fetchUsers(activeView);
  }, [type, activeView]);

  const currentUsers =
    activeView === "actifs"
      ? users
      : activeView === "bloques"
        ? blockedUsers
        : deletedUsers;

  const filteredUsers = currentUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.prenoms || ""} ${user.nom}`.toLowerCase().trim();
    return (
      fullName.includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.telephone?.toLowerCase().includes(searchLower) ||
      user.nom?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleBlockUser = async (uuid: string) => {
    if (window.confirm("Voulez-vous vraiment bloquer cet utilisateur ?")) {
      try {
        await api.put(endpoints.BLOCK(uuid));
        fetchUsers(activeView);
        alert("Utilisateur bloqué avec succès");
      } catch (err) {
        console.error("Erreur lors du blocage:", err);
        onError("Erreur lors du blocage de l'utilisateur");
      }
    }
  };

  const handleUnblockUser = async (uuid: string) => {
    if (window.confirm("Voulez-vous vraiment débloquer cet utilisateur ?")) {
      try {
        await api.put(endpoints.UNBLOCK(uuid));
        fetchUsers(activeView);
        alert("Utilisateur débloqué avec succès");
      } catch (err) {
        console.error("Erreur lors du déblocage:", err);
        onError("Erreur lors du déblocage de l'utilisateur");
      }
    }
  };

  const handleDeleteUser = async (uuid: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await api.delete(endpoints.DELETE(uuid));
        fetchUsers(activeView);
        alert("Utilisateur supprimé avec succès");
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        onError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const handleRestoreUser = async (uuid: string) => {
    if (window.confirm("Voulez-vous vraiment restaurer cet utilisateur ?")) {
      try {
        await api.put(endpoints.RESTORE(uuid));
        fetchUsers(activeView);
        alert("Utilisateur restauré avec succès");
      } catch (err) {
        console.error("Erreur lors de la restauration:", err);
        onError("Erreur lors de la restauration de l'utilisateur");
      }
    }
  };

  const getStatusInfo = (user: User) => {
    if (user.is_deleted || user.deleted_at) {
      return { icon: faUserSlash, color: "secondary", text: "Supprimé" };
    }
    if (user.est_bloque) {
      return { icon: faUserXmark, color: "danger", text: "Bloqué" };
    }
    return {
      icon: faUserCheck,
      color: "success",
      text: user.statut === "actif" ? "Actif" : "Inactif",
    };
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Non disponible";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getFullName = (user: User) => {
    return `${user.prenoms || ""} ${user.nom}`.trim() || "Nom non disponible";
  };

  const getInitials = (user: User) => {
    const fullName = getFullName(user);
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="card border shadow-sm">
      {/* En-tête de section */}
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-dark">
              <FontAwesomeIcon icon={icon} className={`me-2 text-${color}`} />
              {title}
            </h5>
            <p className="text-muted small mb-0">
              {type === "utilisateurs" && "Gestion des comptes clients"}
              {type === "agents" && "Gestion des comptes agents de support"}
              {type === "vendeurs" &&
                "Gestion des comptes vendeurs professionnels"}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {/* Boutons de vue */}
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${activeView === "actifs" ? `btn-${color}` : "btn-outline-secondary"}`}
                onClick={() => setActiveView("actifs")}
              >
                <FontAwesomeIcon icon={faUserCheck} className="me-1" />
                Actifs ({users.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeView === "bloques" ? `btn-${color}` : "btn-outline-secondary"}`}
                onClick={() => setActiveView("bloques")}
              >
                <FontAwesomeIcon icon={faUserXmark} className="me-1" />
                Bloqués ({blockedUsers.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeView === "supprimes" ? `btn-${color}` : "btn-outline-secondary"}`}
                onClick={() => setActiveView("supprimes")}
              >
                <FontAwesomeIcon icon={faUserSlash} className="me-1" />
                Supprimés ({deletedUsers.length})
              </button>
            </div>

            {/* Bouton d'export */}
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faDownload} />
              <span className="d-none d-md-inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card-body border-bottom">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery("")}
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faFilter} />
                Filtrer
              </button>
              <button
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                onClick={() => fetchUsers(activeView)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faRefresh} spin={loading} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-4">
                Utilisateur
              </th>
              <th scope="col">Contact</th>
              <th scope="col">Statut</th>
              <th scope="col">Date d'inscription</th>
              <th scope="col">Dernière activité</th>
              <th scope="col" className="text-end pe-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p className="text-muted">Chargement des données...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon
                      icon={icon}
                      className="fs-1 text-muted mb-3"
                    />
                    <p className="text-muted mb-2">Aucun utilisateur trouvé</p>
                    {searchQuery && (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSearchQuery("")}
                      >
                        Réinitialiser la recherche
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const statusInfo = getStatusInfo(user);
                const fullName = getFullName(user);
                const initials = getInitials(user);

                return (
                  <tr key={user.uuid} className="align-middle">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: `var(--bs-${color}-subtle)`,
                            color: `var(--bs-${color})`,
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="fw-medium">{fullName}</div>
                          <div className="text-muted small">
                            {user.role?.name || "Non spécifié"} •{" "}
                            {user.civilite?.libelle || "Non spécifié"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium">{user.email}</div>
                      {user.telephone && (
                        <div className="text-muted small">{user.telephone}</div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${statusInfo.color}-subtle text-${statusInfo.color} d-flex align-items-center gap-1`}
                      >
                        <FontAwesomeIcon icon={statusInfo.icon} />
                        {statusInfo.text}
                      </span>
                      {user.est_verifie && (
                        <div className="mt-1">
                          <small className="badge bg-info-subtle text-info">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-1"
                            />
                            Vérifié
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-muted">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="text-muted">
                        {formatDate(user.updated_at)}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewUser(user)}
                          title="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        {activeView === "actifs" && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleBlockUser(user.uuid)}
                              title="Bloquer l'utilisateur"
                              disabled={user.est_bloque}
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user.uuid)}
                              title="Supprimer l'utilisateur"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}

                        {activeView === "bloques" && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleUnblockUser(user.uuid)}
                              title="Débloquer l'utilisateur"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user.uuid)}
                              title="Supprimer définitivement"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}

                        {activeView === "supprimes" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleRestoreUser(user.uuid)}
                            title="Restaurer l'utilisateur"
                          >
                            <FontAwesomeIcon icon={faRefresh} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="card-footer bg-white border-top py-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="text-muted small">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)} sur{" "}
              {filteredUsers.length} entrées
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`btn btn-sm ${currentPage === pageNum ? `btn-${color}` : "btn-outline-secondary"}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-muted">...</span>
              )}

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedUser && showDetailsModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Détails de {getFullName(selectedUser)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: "120px",
                        height: "120px",
                        backgroundColor: `var(--bs-${color}-subtle)`,
                        color: `var(--bs-${color})`,
                        fontSize: "3rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(selectedUser)}
                    </div>
                    <h5 className="mt-3 mb-1">{getFullName(selectedUser)}</h5>
                    <div
                      className={`badge bg-${getStatusInfo(selectedUser).color}-subtle text-${getStatusInfo(selectedUser).color}`}
                    >
                      {getStatusInfo(selectedUser).text}
                    </div>
                    {selectedUser.est_verifie && (
                      <div className="mt-2">
                        <small className="badge bg-info-subtle text-info">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-1"
                          />
                          Compte vérifié
                        </small>
                      </div>
                    )}
                    {selectedUser.type && (
                      <div className="mt-1">
                        <small className="badge bg-warning-subtle text-warning">
                          Type: {selectedUser.type}
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-muted small">
                          Email
                        </label>
                        <div className="fw-medium">{selectedUser.email}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Téléphone
                        </label>
                        <div className="fw-medium">
                          {selectedUser.telephone || "Non renseigné"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Date d'inscription
                        </label>
                        <div className="fw-medium">
                          {formatDate(selectedUser.created_at)}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Dernière mise à jour
                        </label>
                        <div className="fw-medium">
                          {formatDate(selectedUser.updated_at)}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Rôle
                        </label>
                        <div className="fw-medium">
                          {selectedUser.role?.name || "Non spécifié"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Civilité
                        </label>
                        <div className="fw-medium">
                          {selectedUser.civilite?.libelle || "Non spécifié"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">
                          Statut compte
                        </label>
                        <div className="fw-medium">
                          {selectedUser.est_bloque ? "Bloqué" : "Actif"} •
                          {selectedUser.is_deleted
                            ? " Supprimé"
                            : " Non supprimé"}
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small">
                          Identifiant unique
                        </label>
                        <div className="fw-medium small font-monospace">
                          {selectedUser.uuid}
                        </div>
                      </div>
                      {selectedUser.feature && (
                        <div className="col-12">
                          <label className="form-label text-muted small">
                            Fonctionnalité
                          </label>
                          <div className="fw-medium">
                            {selectedUser.feature}
                          </div>
                        </div>
                      )}
                      {selectedUser.deleted_at && (
                        <div className="col-12">
                          <label className="form-label text-muted small">
                            Date de suppression
                          </label>
                          <div className="fw-medium text-danger">
                            {formatDate(selectedUser.deleted_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fermer
                </button>
                <button type="button" className="btn btn-primary">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant AuditLogsSection
function AuditLogsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const totalPages = 42;
  const totalEntries = 247;

  useEffect(() => {
    // Simuler le chargement des logs
    setTimeout(() => {
      const mockLogs = [
        {
          id: 1,
          date: "12 Jan 2025",
          time: "14:32:15",
          adminName: "Moussa Traoré",
          adminRole: "Super Admin",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
          action: "Bannissement User #44",
          actionIcon: faBan,
          actionColor: "bg-danger-subtle text-danger",
          targetId: "User ID: 44",
          targetDetails: "kofi.jean@mail.com",
          ipAddress: "192.168.1.45",
          status: "Succès",
          statusColor: "bg-success-subtle text-success",
        },
        {
          id: 2,
          date: "12 Jan 2025",
          time: "13:18:42",
          adminName: "Amina Diallo",
          adminRole: "Modérateur",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
          action: "Validation Boutique",
          actionIcon: faCheckCircle,
          actionColor: "bg-primary-subtle text-primary",
          targetId: "Shop ID: 128",
          targetDetails: "Boutique Tech Pro",
          ipAddress: "10.0.0.23",
          status: "Succès",
          statusColor: "bg-success-subtle text-success",
        },
        {
          id: 3,
          date: "12 Jan 2025",
          time: "12:05:33",
          adminName: "Jean Koffi",
          adminRole: "Modérateur",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
          action: "Modification Permissions",
          actionIcon: faKey,
          actionColor: "bg-info-subtle text-info",
          targetId: "User ID: 892",
          targetDetails: "fatou.camara@mail.com",
          ipAddress: "192.168.1.12",
          status: "Succès",
          statusColor: "bg-success-subtle text-success",
        },
        {
          id: 4,
          date: "12 Jan 2025",
          time: "10:47:21",
          adminName: "Ibrahim Sow",
          adminRole: "Admin",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
          action: "Tentative accès non autorisé",
          actionIcon: faExclamationTriangle,
          actionColor: "bg-warning-subtle text-warning",
          targetId: "System Config",
          targetDetails: "Database Settings",
          ipAddress: "45.142.33.78",
          status: "Bloqué",
          statusColor: "bg-danger-subtle text-danger",
        },
        {
          id: 5,
          date: "12 Jan 2025",
          time: "09:23:10",
          adminName: "Fatou Camara",
          adminRole: "Modérateur",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
          action: "Validation Annonce",
          actionIcon: faCheck,
          actionColor: "bg-success-subtle text-success",
          targetId: "Annonce ID: 3421",
          targetDetails: "iPhone 14 Pro Max",
          ipAddress: "192.168.1.45",
          status: "Succès",
          statusColor: "bg-success-subtle text-success",
        },
        {
          id: 6,
          date: "11 Jan 2025",
          time: "18:56:44",
          adminName: "Youssouf Keita",
          adminRole: "Admin",
          adminAvatar:
            "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
          action: "Mise à jour Système",
          actionIcon: faCog,
          actionColor: "bg-secondary-subtle text-secondary",
          targetId: "System Core",
          targetDetails: "Version 2.4.1",
          ipAddress: "10.0.0.1",
          status: "Succès",
          statusColor: "bg-success-subtle text-success",
        },
      ];
      setAuditLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetDetails.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [1, 2, 3];
    if (totalPages > 5) {
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section
      id="audit-logs-section"
      className="card border shadow-sm"
    ></section>
  );
}
