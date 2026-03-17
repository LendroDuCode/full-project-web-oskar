"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faRefresh,
  faDownload,
  faSearch,
  faTimes,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faBan,
  faSignOutAlt,
  faLock,
  faLockOpen,
  faInfoCircle,
  faStore as faStoreSolid,
  faSpinner,
  faBug,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import CreateBoutiqueModal from "./components/modals/CreateBoutiqueModal";
import EditBoutiqueModal from "./components/modals/EditBoutiqueModal";
import DeleteBoutiqueModal from "./components/modals/DeleteBoutiqueModal";
import BoutiqueStatusBadge from "./components/modals/BoutiqueStatusBadge";
import Pagination from "./components/modals/Pagination";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  let cleanPath = imagePath
    .replace(/\s+/g, "")
    .replace(/-/g, "-")
    .trim();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return cleanPath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return cleanPath;
  }

  if (cleanPath.includes("%2F")) {
    const finalPath = cleanPath.replace(/%2F\s+/, "%2F");
    return `${apiUrl}${filesUrl}/${finalPath}`;
  }

  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

interface Boutique {
  is_deleted: false;
  deleted_at: null;
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key: string | null;
  banniere_key: string | null;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  vendeurUuid: string;
  agentUuid: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
}

interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string | null;
  image_key?: string;
  statut: string;
}

interface PaginatedResponse {
  data: Boutique[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ListeBoutiquesVendeur() {
  const router = useRouter();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Boutique;
    direction: "asc" | "desc";
  } | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const handleImageError = (
    uuid: string,
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.currentTarget;

    if (target.src.includes("localhost")) {
      const productionUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
        "https://oskar-api.mysonec.pro";
      target.src = target.src.replace(
        /http:\/\/localhost(:\d+)?/g,
        productionUrl,
      );
      return;
    }

    if (target.src.includes("%20")) {
      target.src = target.src.replace(/%20/g, "");
      return;
    }

    setImageErrors((prev) => new Set(prev).add(uuid));
    target.onerror = null;
  };

  const getLogoUrl = (boutique: Boutique): string | null => {
    if (imageErrors.has(boutique.uuid)) return null;

    if (boutique.logo_key) {
      const url = buildImageUrl(boutique.logo_key);
      if (url) return url;
    }

    if (boutique.logo) {
      const url = buildImageUrl(boutique.logo);
      if (url) return url;
    }

    return null;
  };

  const getBanniereUrl = (boutique: Boutique): string | null => {
    if (imageErrors.has(`${boutique.uuid}-banner`)) return null;

    if (boutique.banniere_key) {
      const url = buildImageUrl(boutique.banniere_key);
      if (url) return url;
    }

    if (boutique.banniere) {
      const url = buildImageUrl(boutique.banniere);
      if (url) return url;
    }

    return null;
  };

  const checkAuthentication = useCallback(() => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("oskar_token")
          : null;
      console.log("🔐 Vérification authentification:", {
        hasToken: !!token,
        tokenLength: token?.length,
      });

      if (!token) {
        console.warn("⚠️ Utilisateur non authentifié");
        setIsAuthenticated(false);
        setError("Veuillez vous connecter pour accéder à cette page");

        setTimeout(() => {
          router.push("/login");
        }, 2000);

        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("❌ Erreur vérification authentification:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, [router]);

  const clearAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("oskar_token");
      localStorage.removeItem("user_type");
    }
  }, []);

  const checkApiResponse = async () => {
    try {
      setDebugInfo({ status: "loading", message: "Vérification en cours..." });

      const token = localStorage.getItem("oskar_token");
      if (!token) {
        setDebugInfo({ status: "error", message: "Token non trouvé" });
        return;
      }

      const url = API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR;
      console.log("🔍 Vérification manuelle de l'API:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      console.log("📄 Réponse brute:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setDebugInfo({
          status: "error",
          message: "La réponse n'est pas du JSON valide",
          rawResponse: responseText.substring(0, 500),
        });
        return;
      }

      console.log("📊 Données parsées:", data);

      setDebugInfo({
        status: "success",
        statusCode: response.status,
        data: data,
        structure: {
          isArray: Array.isArray(data),
          hasDataProperty: data && typeof data === "object" && "data" in data,
          dataIsArray: data.data ? Array.isArray(data.data) : false,
          keys: data ? Object.keys(data) : [],
        },
      });

      let boutiquesData: Boutique[] = [];

      if (Array.isArray(data)) {
        boutiquesData = data;
        console.log(
          "✅ Réponse est un tableau direct avec",
          data.length,
          "éléments",
        );
      } else if (data && Array.isArray(data.data)) {
        boutiquesData = data.data;
        console.log(
          "✅ Réponse a une propriété data qui est un tableau avec",
          data.data.length,
          "éléments",
        );
      } else if (data && data.data && Array.isArray(data.data.data)) {
        boutiquesData = data.data.data;
        console.log(
          "✅ Réponse a une structure data.data avec",
          data.data.data.length,
          "éléments",
        );
      } else if (data && data.success && Array.isArray(data.data)) {
        boutiquesData = data.data;
        console.log(
          "✅ Réponse a success:true et data est un tableau avec",
          data.data.length,
          "éléments",
        );
      }

      if (boutiquesData.length > 0) {
        console.log("🏪 Boutiques trouvées:", boutiquesData);
        setBoutiques(boutiquesData);
        setSuccessMessage(`${boutiquesData.length} boutique(s) trouvée(s) !`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log("ℹ️ Aucune boutique trouvée dans la réponse");
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la vérification:", error);
      setDebugInfo({
        status: "error",
        message: error.message,
        stack: error.stack,
      });
    }
  };

  const fetchBoutiques = useCallback(async () => {
    if (!checkAuthentication()) {
      setAuthLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("📥 Chargement des boutiques...");

      const token = localStorage.getItem("oskar_token");
      console.log("🔑 Token présent:", !!token);

      const url = API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR;
      console.log("🌐 URL appelée:", url);

      const response = await api.get<any>(url);

      console.log("📦 Réponse brute:", response);

      let boutiquesData: Boutique[] = [];
      let paginationData = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
      };

      if (Array.isArray(response)) {
        console.log("✅ Cas 1: Réponse est un tableau direct");
        boutiquesData = response;
        paginationData.total = response.length;
        paginationData.pages = Math.ceil(
          response.length / paginationData.limit,
        );
      }
      else if (response && typeof response === "object" && "data" in response) {
        if (Array.isArray(response.data)) {
          console.log("✅ Cas 2: response.data est un tableau");
          boutiquesData = response.data;
          paginationData = {
            page: response.page || 1,
            limit: response.limit || 10,
            total: response.total || response.data.length,
            pages:
              response.totalPages ||
              Math.ceil(response.data.length / (response.limit || 10)),
          };
        }
        else if (response.data && typeof response.data === "object") {
          const possibleArrays = [
            "data",
            "items",
            "results",
            "boutiques",
            "list",
          ];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              console.log(`✅ Cas 3: response.data.${key} est un tableau`);
              boutiquesData = response.data[key];
              paginationData = {
                page: response.data.page || response.page || 1,
                limit: response.data.limit || response.limit || 10,
                total:
                  response.data.total ||
                  response.total ||
                  response.data[key].length,
                pages: response.data.totalPages || response.totalPages || 1,
              };
              break;
            }
          }
        }
      }
      else if (response && response.success && Array.isArray(response.data)) {
        console.log(
          "✅ Cas 4: response.success et response.data est un tableau",
        );
        boutiquesData = response.data;
        paginationData.total = response.data.length;
        paginationData.pages = Math.ceil(
          response.data.length / paginationData.limit,
        );
      }

      console.log(`📊 ${boutiquesData.length} boutique(s) trouvée(s)`);

      if (boutiquesData.length > 0) {
        console.log("🏪 Première boutique:", boutiquesData[0]);
      }

      setBoutiques(boutiquesData);
      setPagination(paginationData);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des boutiques:", err);
      console.error("📝 Détails de l'erreur:", {
        status: err.status,
        message: err.message,
        response: err.response,
      });

      if (
        err.status === 401 ||
        err.message?.includes("401") ||
        err.response?.status === 401 ||
        err.message?.includes("Non authentifié") ||
        err.message?.includes("Unauthorized")
      ) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setIsAuthenticated(false);
        clearAuthToken();

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(err.message || "Erreur lors du chargement des boutiques");
      }

      setBoutiques([]);
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  }, [checkAuthentication, router, clearAuthToken]);

  useEffect(() => {
    console.log("🚀 Initialisation page boutiques");
    checkAuthentication();
    fetchBoutiques();
  }, [fetchBoutiques, checkAuthentication]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const requestSort = (key: keyof Boutique) => {
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

  const getSortIcon = (key: keyof Boutique) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="text-primary ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
    );
  };

  const filteredBoutiques = useMemo(() => {
    let result = [...boutiques];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (boutique) =>
          boutique.nom.toLowerCase().includes(term) ||
          (boutique.description?.toLowerCase() || "").includes(term) ||
          boutique.slug.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((boutique) => {
        if (statusFilter === "bloque") {
          return boutique.est_bloque || boutique.statut === "bloque";
        }
        if (statusFilter === "ferme") {
          return boutique.est_ferme || boutique.statut === "ferme";
        }
        return boutique.statut === statusFilter;
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (sortConfig.key === "created_at") {
          return sortConfig.direction === "asc"
            ? new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime();
        }

        return 0;
      });
    }

    return result;
  }, [boutiques, searchTerm, statusFilter, sortConfig]);

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchBoutiques();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleViewBoutique = (boutiqueUuid: string) => {
    router.push(`/dashboard-vendeur/boutique/apercu/${boutiqueUuid}`);
  };

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour créer une boutique");
      router.push("/login");
      return;
    }
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (boutique: Boutique) => {
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour modifier une boutique");
      router.push("/login");
      return;
    }
    setSelectedBoutique(boutique);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (boutique: Boutique) => {
    if (!isAuthenticated) {
      setError("Veuillez vous connecter pour supprimer une boutique");
      router.push("/login");
      return;
    }
    setSelectedBoutique(boutique);
    setShowDeleteModal(true);
  };

  const handleCreateBoutique = async (data: any) => {
    try {
      if (!checkAuthentication()) {
        throw new Error("Authentification requise");
      }

      setActionLoading(true);
      console.log("🚀 Création d'une nouvelle boutique...");

      const formData = new FormData();
      formData.append("nom", data.nom);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.logo) {
        console.log("📸 Logo ajouté:", data.logo.name);
        formData.append("logo", data.logo);
      }

      if (data.banniere) {
        console.log("🎨 Bannière ajoutée:", data.banniere.name);
        formData.append("banniere", data.banniere);
      }

      if (data.politique_retour) {
        formData.append("politique_retour", data.politique_retour);
      }

      if (data.conditions_utilisation) {
        formData.append("conditions_utilisation", data.conditions_utilisation);
      }

      console.log("📤 Envoi à l'API:", {
        endpoint: API_ENDPOINTS.BOUTIQUES.CREATE,
        data: {
          nom: data.nom,
          hasLogo: !!data.logo,
          hasBanniere: !!data.banniere,
        },
      });

      const response = await api.postFormData(
        API_ENDPOINTS.BOUTIQUES.CREATE,
        formData,
      );

      console.log("✅ Boutique créée avec succès:", response);

      setShowCreateModal(false);
      setSuccessMessage("Boutique créée avec succès !");

      setTimeout(() => {
        fetchBoutiques();
      }, 500);
    } catch (err: any) {
      console.error("❌ Erreur création boutique:", err);

      if (
        err.status === 401 ||
        err.message?.includes("401") ||
        err.response?.status === 401 ||
        err.message?.includes("Authentification")
      ) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setIsAuthenticated(false);
        clearAuthToken();

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(
          err.message ||
            "Erreur lors de la création de la boutique. Vérifiez vos informations.",
        );
      }

      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBoutique = async (data: any) => {
    if (!selectedBoutique) return;

    try {
      if (!checkAuthentication()) {
        throw new Error("Authentification requise");
      }

      setActionLoading(true);
      console.log("✏️ Modification boutique:", selectedBoutique.uuid);

      const formData = new FormData();
      formData.append("nom", data.nom);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.logo) {
        formData.append("logo", data.logo);
      }

      if (data.banniere) {
        formData.append("banniere", data.banniere);
      }

      if (data.politique_retour) {
        formData.append("politique_retour", data.politique_retour);
      }

      if (data.conditions_utilisation) {
        formData.append("conditions_utilisation", data.conditions_utilisation);
      }

      const response = await api.putFormData(
        API_ENDPOINTS.BOUTIQUES.DETAIL(selectedBoutique.uuid),
        formData,
      );

      console.log("✅ Boutique modifiée avec succès:", response);
      handleSuccess("Boutique modifiée avec succès !");
      setShowEditModal(false);
      setSelectedBoutique(null);
    } catch (err: any) {
      console.error("❌ Erreur modification boutique:", err);

      if (
        err.status === 401 ||
        err.message?.includes("401") ||
        err.response?.status === 401 ||
        err.message?.includes("Authentification")
      ) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setIsAuthenticated(false);
        clearAuthToken();

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(err.message || "Erreur lors de la modification");
      }

      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoutique = async () => {
    if (!selectedBoutique) return;

    try {
      if (!checkAuthentication()) {
        throw new Error("Authentification requise");
      }

      setActionLoading(true);
      console.log("🗑️ Suppression boutique:", selectedBoutique.uuid);

      await api.delete(API_ENDPOINTS.BOUTIQUES.DELETE(selectedBoutique.uuid));

      console.log("✅ Boutique supprimée avec succès");
      handleSuccess("Boutique supprimée avec succès !");
      setShowDeleteModal(false);
      setSelectedBoutique(null);
    } catch (err: any) {
      console.error("❌ Erreur suppression boutique:", err);

      if (
        err.status === 401 ||
        err.message?.includes("401") ||
        err.response?.status === 401 ||
        err.message?.includes("Authentification")
      ) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setIsAuthenticated(false);
        clearAuthToken();

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(err.message || "Erreur lors de la suppression");
      }

      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.VENDEUR.LOGOUT);
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
    } finally {
      clearAuthToken();
      router.push("/login");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleExport = () => {
    if (boutiques.length === 0) {
      setError("Aucune boutique à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const csvContent = [
      ["Nom", "Statut", "Slug", "Date création", "Bloqué", "Fermé"],
      ...boutiques.map((boutique) => [
        `"${boutique.nom || ""}"`,
        boutique.statut,
        boutique.slug,
        formatDate(boutique.created_at),
        boutique.est_bloque ? "Oui" : "Non",
        boutique.est_ferme ? "Oui" : "Non",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `mes-boutiques-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  if (authLoading) {
    return (
      <div className="container-fluid p-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid p-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-lg text-center">
              <div className="card-body py-5">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={faStore}
                    className="text-danger fs-1 mb-3"
                  />
                  <h4 className="fw-bold">Accès non autorisé</h4>
                  <p className="text-muted">
                    Vous devez être connecté pour accéder à cette page
                  </p>
                </div>
                <div className="d-grid gap-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="btn btn-primary btn-lg"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Se connecter
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="btn btn-outline-secondary"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateBoutiqueModal
        show={showCreateModal}
        loading={actionLoading}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBoutique}
        vendeurData={null}
      />

      <EditBoutiqueModal
        show={showEditModal}
        boutique={selectedBoutique}
        loading={actionLoading}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBoutique(null);
        }}
        onUpdate={handleUpdateBoutique}
      />

      <DeleteBoutiqueModal
        show={showDeleteModal}
        boutique={selectedBoutique}
        loading={actionLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBoutique(null);
        }}
        onConfirm={handleDeleteBoutique}
      />

      <div className="container-fluid p-3 p-md-4">
        {/* En-tête de la page */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a href="/dashboard" className="text-decoration-none">
                        Dashboard
                      </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Mes Boutiques
                    </li>
                  </ol>
                </nav>
                <h1 className="h2 fw-bold mb-2">Mes Boutiques</h1>
                <p className="text-muted mb-0">
                  Gérez toutes vos boutiques en un seul endroit
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchBoutiques()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  <span className="d-none d-md-inline">Rafraîchir</span>
                </button>

                {/* ✅ SUPPRIMÉ : Bouton "Nouvelle boutique" en haut */}
              </div>
            </div>

            {/* Panneau de débogage */}
            {showDebug && debugInfo && (
              <div className="card border-info mb-4">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                  <span>
                    <FontAwesomeIcon icon={faBug} className="me-2" />
                    Informations de débogage
                  </span>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowDebug(false)}
                  />
                </div>
                <div className="card-body">
                  <pre
                    className="bg-light p-3 rounded"
                    style={{
                      fontSize: "0.8rem",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  <div>
                    <strong>Erreur:</strong> {error}
                  </div>
                </div>
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
                className="alert alert-success alert-dismissible fade show mb-4"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Succès:</strong> {successMessage}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ SUPPRIMÉ : Section des statistiques */}

        {/* Filtres et recherche */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-muted"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Rechercher une boutique..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        disabled={!isAuthenticated}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <FontAwesomeIcon
                          icon={faFilter}
                          className="text-muted"
                        />
                      </span>
                      <select
                        className="form-select border-start-0 ps-0"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        disabled={!isAuthenticated}
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="actif">Actives</option>
                        <option value="en_review">En revue</option>
                        <option value="bloque">Bloquées</option>
                        <option value="ferme">Fermées</option>
                      </select>
                    </div>
                  </div>

                  {/* ✅ SUPPRIMÉ : Bouton export */}
                </div>

                {/* Résultats de recherche */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted">
                        Résultats: <strong>{filteredBoutiques.length}</strong>{" "}
                        boutique(s)
                        {searchTerm && (
                          <>
                            {" "}
                            pour "<strong>{searchTerm}</strong>"
                          </>
                        )}
                        {statusFilter !== "all" && (
                          <>
                            {" "}
                            avec statut "
                            <strong>
                              {statusFilter === "actif"
                                ? "Actif"
                                : statusFilter === "en_review"
                                  ? "En revue"
                                  : statusFilter === "bloque"
                                    ? "Bloqué"
                                    : "Fermé"}
                            </strong>
                            "
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des boutiques */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      Chargement des boutiques...
                    </p>
                  </div>
                ) : filteredBoutiques.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto border-0"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faStore}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">
                        {boutiques.length === 0
                          ? "Aucune boutique trouvée"
                          : "Aucun résultat"}
                      </h5>
                      <p className="mb-0">
                        {boutiques.length === 0
                          ? "Vous n'avez pas encore créé de boutique."
                          : "Aucune boutique ne correspond à vos critères de recherche."}
                      </p>
                      {boutiques.length === 0 && (
                        <div className="mt-3">
                          <button
                            onClick={handleOpenCreateModal}
                            className="btn btn-primary me-2"
                            disabled={!isAuthenticated}
                          >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Créer ma première boutique
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Options de tri */}
                    <div className="p-4 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">
                            {filteredBoutiques.length} boutique(s) trouvée(s)
                          </small>
                        </div>
                        <div className="dropdown">
                          <button
                            className="btn btn-outline-secondary btn-sm dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            disabled={!isAuthenticated}
                          >
                            <FontAwesomeIcon icon={faSort} className="me-1" />
                            Trier
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => requestSort("nom")}
                                disabled={!isAuthenticated}
                              >
                                Par nom {getSortIcon("nom")}
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => requestSort("created_at")}
                                disabled={!isAuthenticated}
                              >
                                Par date {getSortIcon("created_at")}
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => requestSort("statut")}
                                disabled={!isAuthenticated}
                              >
                                Par statut {getSortIcon("statut")}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Panneau de débogage (si activé) */}
                    {showDebug && debugInfo && (
                      <div className="p-4 border-bottom bg-light">
                        <h6 className="fw-bold mb-2">
                          <FontAwesomeIcon
                            icon={faBug}
                            className="me-2 text-info"
                          />
                          Informations de débogage
                        </h6>
                        <pre
                          className="small"
                          style={{ maxHeight: "200px", overflow: "auto" }}
                        >
                          {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Tableau */}
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "40px" }}>#</th>
                            <th style={{ width: "80px" }}>
                              <span className="fw-semibold">Logo</span>
                            </th>
                            <th style={{ width: "250px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("nom")}
                                disabled={!isAuthenticated}
                              >
                                Nom de la boutique
                                {getSortIcon("nom")}
                              </button>
                            </th>
                            <th style={{ width: "120px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("statut")}
                                disabled={!isAuthenticated}
                              >
                                Statut
                                {getSortIcon("statut")}
                              </button>
                            </th>
                            <th style={{ width: "120px" }}>
                              <span className="fw-semibold">Slug</span>
                            </th>
                            <th style={{ width: "150px" }}>
                              <button
                                className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                                onClick={() => requestSort("created_at")}
                                disabled={!isAuthenticated}
                              >
                                Date création
                                {getSortIcon("created_at")}
                              </button>
                            </th>
                            <th
                              style={{ width: "120px" }}
                              className="text-center"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBoutiques.map((boutique, index) => {
                            const startIndex =
                              (pagination.page - 1) * pagination.limit;
                            const displayIndex = startIndex + index + 1;
                            const logoUrl = getLogoUrl(boutique);

                            return (
                              <tr key={boutique.uuid} className="align-middle">
                                <td className="text-center text-muted fw-semibold">
                                  {displayIndex}
                                </td>
                                <td>
                                  {logoUrl ? (
                                    <img
                                      src={logoUrl}
                                      alt={boutique.nom}
                                      className="rounded border"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) =>
                                        handleImageError(boutique.uuid, e)
                                      }
                                    />
                                  ) : (
                                    <div
                                      className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                                      style={{ width: "60px", height: "60px" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faStore}
                                        className="text-muted"
                                      />
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div className="fw-semibold">
                                    {boutique.nom}
                                  </div>
                                  {boutique.description && (
                                    <small
                                      className="text-muted d-block"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      {boutique.description.substring(0, 50)}...
                                    </small>
                                  )}
                                </td>
                                <td>
                                  <BoutiqueStatusBadge
                                    statut={boutique.statut}
                                    est_bloque={boutique.est_bloque}
                                    est_ferme={boutique.est_ferme}
                                  />
                                </td>
                                <td>
                                  <code className="small">{boutique.slug}</code>
                                </td>
                                <td>
                                  <div className="small">
                                    <div>
                                      <FontAwesomeIcon
                                        icon={faCalendar}
                                        className="me-1"
                                      />
                                      {formatDate(boutique.created_at)}
                                    </div>
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
                                      onClick={() =>
                                        handleViewBoutique(boutique.uuid)
                                      }
                                      disabled={!isAuthenticated}
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                      className="btn btn-outline-warning"
                                      title="Modifier"
                                      onClick={() =>
                                        handleOpenEditModal(boutique)
                                      }
                                      disabled={!isAuthenticated}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    {/* ✅ SUPPRIMÉ : Bouton de blocage/déblocage */}
                                    <button
                                      className="btn btn-outline-danger"
                                      title="Supprimer"
                                      onClick={() =>
                                        handleOpenDeleteModal(boutique)
                                      }
                                      disabled={!isAuthenticated}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(page) =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                        onLimitChange={(limit) =>
                          setPagination((prev) => ({
                            ...prev,
                            limit,
                            page: 1,
                          }))
                        }
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SUPPRIMÉ : Bouton flottant pour création rapide */}
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .badge {
          font-weight: 500;
        }
        .breadcrumb {
          background-color: transparent;
          padding: 0;
        }
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .position-fixed {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}