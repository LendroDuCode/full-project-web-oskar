// app/dashboard/type-boutique/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faRefresh,
  faDownload,
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faStore,
  faImage,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faChartBar,
  faBox,
  faHome,
  faTag,
  faSlidersH,
  faCheckSquare,
  faSquare,
  faCheck,
  faTimes,
  faBan,
  faUsers,
  faEllipsisV,
  faCheckDouble,
  faShoppingBag,
  faBuilding,
  faShop,
  faStoreAlt,
  faStoreSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Composants
import StatusBadge from "./components/StatusBadge";
import VenteBadge from "./components/VenteBadge";
import Pagination from "./components/Pagination";
import CreateTypeBoutiqueModal from "./components/modals/CreateTypeBoutiqueModal";
import EditTypeBoutiqueModal from "./components/modals/EditTypeBoutiqueModal";
import ViewTypeBoutiqueModal from "./components/modals/ViewTypeBoutiqueModal";
import DeleteModal from "./components/modals/DeleteModal";
import LoadingSkeleton from "./components/LoadingSkeleton";

// Types
interface TypeBoutique {
  id: number;
  uuid: string;
  code: string;
  libelle: string;
  description?: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  image_key: string;
  statut: "actif" | "inactif";
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Fonction utilitaire pour formater les URLs d'images
const formatImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    // URL par défaut
    return `https://via.placeholder.com/50/${colors.oskar.blue.replace("#", "")}/ffffff?text=TB`;
  }

  // Si c'est déjà une URL complète
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Si c'est une clé MinIO, construire l'URL via proxy
  if (
    imageUrl.includes("type-boutiques/") ||
    imageUrl.includes("categories/")
  ) {
    try {
      // Nettoyer le chemin
      const cleanPath = imageUrl.startsWith("type-boutiques/")
        ? imageUrl
        : `type-boutiques/${imageUrl}`;

      // Construire l'URL proxy
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/files/${encodeURIComponent(cleanPath)}`;
    } catch (error) {
      console.warn("Erreur de formatage URL:", error);
    }
  }

  return imageUrl;
};

// Hook personnalisé pour gérer les images
const useImageLoader = (imageUrl: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string>(() =>
    formatImageUrl(imageUrl),
  );

  useEffect(() => {
    if (!imageUrl) {
      setFinalUrl(formatImageUrl(null));
      return;
    }

    const formattedUrl = formatImageUrl(imageUrl);
    setFinalUrl(formattedUrl);
    setLoaded(false);
    setError(false);

    // Précharger l'image pour vérifier qu'elle existe
    const img = new Image();
    img.src = formattedUrl;

    img.onload = () => {
      setLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      console.error("❌ Erreur chargement image:", formattedUrl);
      setError(true);
      setLoaded(true);

      // Essayer l'URL MinIO directe en fallback
      if (formattedUrl.includes("/api/files/")) {
        try {
          const proxyPath = formattedUrl.split("/api/files/")[1];
          if (proxyPath) {
            const decodedPath = decodeURIComponent(proxyPath);
            const minioUrl = `http://15.236.142.141:9000/oskar-bucket/${decodedPath}`;
            const fallbackImg = new Image();
            fallbackImg.src = minioUrl;

            fallbackImg.onload = () => {
              setFinalUrl(minioUrl);
              setError(false);
            };

            fallbackImg.onerror = () => {
              // Utiliser un placeholder en dernier recours
              setFinalUrl(
                `https://via.placeholder.com/50/cccccc/ffffff?text=${imageUrl.includes("type-boutiques") ? "TB" : "IMG"}`,
              );
            };
          }
        } catch (decodeError) {
          console.warn("Erreur décodage URL proxy:", decodeError);
          setFinalUrl(`https://via.placeholder.com/50/cccccc/ffffff?text=ERR`);
        }
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { url: finalUrl, loaded, error };
};

// Composant Image avec gestion d'erreur
const TypeBoutiqueImage = ({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { url, loaded, error } = useImageLoader(src);

  if (error) {
    return (
      <div
        className={`${className} bg-light d-flex align-items-center justify-content-center`}
        style={{
          ...style,
          backgroundColor: `${colors.oskar.lightGrey} !important`,
        }}
        title={`Image non disponible: ${alt}`}
      >
        <FontAwesomeIcon icon={faStoreSlash} className="text-muted" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`${className} ${!loaded ? "opacity-0" : "opacity-100"}`}
      style={{
        ...style,
        transition: "opacity 0.3s ease",
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          `https://via.placeholder.com/50/${colors.oskar.blue.replace("#", "")}/ffffff?text=${alt.charAt(0)}`;
      }}
    />
  );
};

// Composant de badge de type boutique
const TypeBoutiqueBadge = ({
  type,
  color,
}: {
  type: string;
  color: string;
}) => {
  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes("vêtement") || lowerType.includes("vetement")) {
      return faTag;
    }
    if (lowerType.includes("bien") || lowerType.includes("biens")) {
      return faHome;
    }
    if (lowerType.includes("produit") || lowerType.includes("produits")) {
      return faBox;
    }
    if (
      lowerType.includes("électronique") ||
      lowerType.includes("electronique")
    ) {
      return faShoppingBag;
    }
    return faStore;
  };

  return (
    <span
      className="badge d-inline-flex align-items-center gap-1"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
        padding: "0.25rem 0.5rem",
        fontSize: "0.7rem",
        fontWeight: "500",
      }}
    >
      <FontAwesomeIcon icon={getTypeIcon(type)} className="fs-10" />
      <span>{type}</span>
    </span>
  );
};

// Composant de statistiques
const StatsCard = ({ title, value, icon, color, subtitle, loading }: any) => (
  <div
    className="card border-0 shadow-sm h-100"
    style={{ borderRadius: "10px" }}
  >
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
            {title}
          </h6>
          <h3 className="mb-0 fw-bold" style={{ color }}>
            {loading ? (
              <div
                className="placeholder placeholder-wave"
                style={{ width: "60px", height: "1.5rem" }}
              />
            ) : (
              value
            )}
          </h3>
          {subtitle && (
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>
              {loading ? (
                <div
                  className="placeholder placeholder-wave mt-1"
                  style={{ width: "80px", height: "0.8rem" }}
                />
              ) : (
                subtitle
              )}
            </small>
          )}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "45px",
            height: "45px",
            backgroundColor: `${color}15`,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <FontAwesomeIcon
            icon={icon}
            style={{
              color,
              fontSize: "1rem",
              animation: loading
                ? "placeholder-wave 2s infinite linear"
                : "none",
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default function TypeBoutiquePage() {
  // États
  const [typesBoutique, setTypesBoutique] = useState<TypeBoutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteMultipleModal, setShowDeleteMultipleModal] = useState(false);
  const [selectedTypeBoutique, setSelectedTypeBoutique] =
    useState<TypeBoutique | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVente, setSelectedVente] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TypeBoutique;
    direction: "asc" | "desc";
  } | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // États pour la sélection multiple
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Charger les types de boutique
  const fetchTypesBoutique = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);

      console.log("📡 Chargement des types boutique...");

      const response = await api.get<TypeBoutique[]>(
        API_ENDPOINTS.TYPES_BOUTIQUE.LIST,
      );

      console.log("✅ Réponse API types boutique:", {
        count: Array.isArray(response) ? response.length : "non-array",
        data: Array.isArray(response) ? response.slice(0, 2) : response,
      });

      if (Array.isArray(response)) {
        // Assurer que toutes les URLs d'images sont correctement formatées
        const formattedResponse = response.map((type) => ({
          ...type,
          image: formatImageUrl(type.image),
        }));

        setTypesBoutique(formattedResponse);
        setPagination((prev) => ({
          ...prev,
          total: formattedResponse.length,
          pages: Math.ceil(formattedResponse.length / prev.limit),
        }));

        // Réinitialiser la sélection
        setSelectedTypes([]);
        setSelectAll(false);

        console.log(
          `✅ ${formattedResponse.length} type(s) boutique chargé(s)`,
        );
      } else {
        console.error("❌ Réponse API invalide (non tableau):", response);
        throw new Error("Format de réponse API invalide");
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement types boutique:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors du chargement des types de boutique";
      setError(errorMsg);
      setTypesBoutique([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypesBoutique();
  }, [fetchTypesBoutique]);

  // Fonctions de tri
  const requestSort = (key: keyof TypeBoutique) => {
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

  const getSortIcon = (key: keyof TypeBoutique) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-muted ms-1"
          style={{ fontSize: "0.8rem" }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    );
  };

  // Filtrer et trier
  const sortedTypes = useMemo(() => {
    if (!sortConfig) return typesBoutique;
    return [...typesBoutique].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (sortConfig.direction === "asc") return aValue < bValue ? -1 : 1;
      return aValue > bValue ? -1 : 1;
    });
  }, [typesBoutique, sortConfig]);

  const filteredTypes = useMemo(() => {
    return sortedTypes.filter((type) => {
      const matchesSearch =
        !searchTerm.trim() ||
        type.libelle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description &&
          type.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesVente =
        selectedVente === "all" ||
        (selectedVente === "produits" && type.peut_vendre_produits) ||
        (selectedVente === "biens" && type.peut_vendre_biens) ||
        (selectedVente === "both" &&
          type.peut_vendre_produits &&
          type.peut_vendre_biens);

      const matchesStatus =
        selectedStatus === "all" || type.statut === selectedStatus;

      return matchesSearch && matchesVente && matchesStatus;
    });
  }, [sortedTypes, searchTerm, selectedVente, selectedStatus]);

  // Statistiques
  const stats = useMemo(() => {
    const totalTypes = typesBoutique.length;
    const activeTypes = typesBoutique.filter(
      (t) => t.statut === "actif",
    ).length;
    const deletedTypes = typesBoutique.filter((t) => t.is_deleted).length;
    const typesWithImage = typesBoutique.filter(
      (t) => t.image && t.image !== "",
    ).length;

    return {
      total: totalTypes,
      active: activeTypes,
      deleted: deletedTypes,
      withImage: typesWithImage,
    };
  }, [typesBoutique]);

  // Gestion succès
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchTypesBoutique();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Suppression
  const handleDelete = async () => {
    if (!selectedTypeBoutique) return;

    try {
      setDeleteLoading(true);
      await api.delete(
        API_ENDPOINTS.TYPES_BOUTIQUE.DELETE(selectedTypeBoutique.uuid),
      );

      setShowDeleteModal(false);
      setSelectedTypeBoutique(null);
      handleSuccess("Type de boutique supprimé avec succès !");
    } catch (err: any) {
      console.error("❌ Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    if (selectedTypes.length === 0) return;

    try {
      setDeleteLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const typeUuid of selectedTypes) {
        try {
          await api.delete(API_ENDPOINTS.TYPES_BOUTIQUE.DELETE(typeUuid));
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le type ${typeUuid}:`, err);
          errorCount++;
        }
      }

      setShowDeleteMultipleModal(false);
      handleSuccess(
        `${successCount} type(s) de boutique supprimé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );

      setSelectedTypes([]);
      setSelectAll(false);
    } catch (err: any) {
      console.error("❌ Erreur suppression multiple:", err);
      setError("Erreur lors de la suppression multiple");
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (type: TypeBoutique) => {
    setSelectedTypeBoutique(type);
    setShowDeleteModal(true);
  };

  // Ouvrir modal de suppression multiple
  const openDeleteMultipleModal = () => {
    if (selectedTypes.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un type");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }
    setShowDeleteMultipleModal(true);
  };

  // Export
  const handleExport = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.EXPORT_PDF, {
      });
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.download = `types-boutique-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleSuccess("Export PDF réussi !");
    } catch (err) {
      console.error("Erreur export PDF, tentative CSV...");
      createCSVExport();
    }
  };

  const createCSVExport = () => {
    if (typesBoutique.length === 0) {
      setInfoMessage("Aucun type de boutique à exporter");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    const csvContent = [
      [
        "ID",
        "Code",
        "Libellé",
        "Description",
        "Peut vendre produits",
        "Peut vendre biens",
        "Statut",
        "Image",
        "Créé le",
        "Modifié le",
      ],
      ...typesBoutique.map((type) => [
        type.id,
        `"${type.code || ""}"`,
        `"${type.libelle || ""}"`,
        `"${type.description || ""}"`,
        type.peut_vendre_produits ? "Oui" : "Non",
        type.peut_vendre_biens ? "Oui" : "Non",
        type.statut,
        `"${type.image || ""}"`,
        type.created_at
          ? new Date(type.created_at).toLocaleDateString("fr-FR")
          : "",
        type.updated_at
          ? new Date(type.updated_at).toLocaleDateString("fr-FR")
          : "",
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
      `types-boutique-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleSuccess("Export CSV réussi !");
  };

  // Gestion de la sélection multiple
  const handleSelectType = (typeUuid: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeUuid)) {
        return prev.filter((id) => id !== typeUuid);
      } else {
        return [...prev, typeUuid];
      }
    });
  };

  const handleSelectAllOnPage = () => {
    const pageTypeIds = currentItems.map((type) => type.uuid);
    const allSelected = pageTypeIds.every((id) => selectedTypes.includes(id));

    if (allSelected) {
      // Désélectionner toutes les types de la page
      setSelectedTypes((prev) =>
        prev.filter((id) => !pageTypeIds.includes(id)),
      );
    } else {
      // Sélectionner toutes les types de la page
      const newSelection = [...new Set([...selectedTypes, ...pageTypeIds])];
      setSelectedTypes(newSelection);
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (selectedTypes.length === 0) {
      setInfoMessage("Veuillez sélectionner au moins un type");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (action === "delete") {
      openDeleteMultipleModal();
      return;
    }

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const typeUuid of selectedTypes) {
        try {
          const type = typesBoutique.find((t) => t.uuid === typeUuid);
          if (!type) continue;

          await api.put(API_ENDPOINTS.TYPES_BOUTIQUE.UPDATE(typeUuid), {
            statut: action === "activate" ? "actif" : "inactif",
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur pour le type ${typeUuid}:`, err);
          errorCount++;
        }
      }

      setSuccessMessage(
        `${successCount} type(s) de boutique ${action === "activate" ? "activé(s)" : "désactivé(s)"} avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ""}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      fetchTypesBoutique();
      setSelectedTypes([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Erreur lors de l'action en masse:", err);
      setError("Erreur lors de l'action en masse");
      setTimeout(() => setError(null), 3000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Pagination
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredTypes.slice(startIndex, startIndex + pagination.limit);
  }, [filteredTypes, pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredTypes.length,
      pages: Math.ceil(filteredTypes.length / prev.limit),
    }));
  }, [filteredTypes]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedVente("all");
    setSelectedStatus("all");
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedTypes([]);
    setSelectAll(false);
  };

  // Effet pour mettre à jour selectAll
  useEffect(() => {
    if (currentItems.length > 0) {
      const allSelected = currentItems.every((type) =>
        selectedTypes.includes(type.uuid),
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedTypes, currentItems]);

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    } catch {
      return "N/A";
    }
  };

  return (
    <>
      {/* Modals */}
      <CreateTypeBoutiqueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(message) => handleSuccess(message)}
      />
      {selectedTypeBoutique && (
        <EditTypeBoutiqueModal
          isOpen={showEditModal}
          typeBoutique={selectedTypeBoutique}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTypeBoutique(null);
          }}
          onSuccess={(message) => handleSuccess(message)}
        />
      )}
      {selectedTypeBoutique && (
        <ViewTypeBoutiqueModal
          isOpen={showViewModal}
          typeBoutique={selectedTypeBoutique}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTypeBoutique(null);
          }}
        />
      )}
      <DeleteModal
        show={showDeleteModal}
        typeBoutique={selectedTypeBoutique}
        loading={deleteLoading}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTypeBoutique(null);
        }}
        onConfirm={handleDelete}
        type="single"
      />
      <DeleteModal
        show={showDeleteMultipleModal}
        typeBoutique={null}
        loading={deleteLoading}
        onClose={() => setShowDeleteMultipleModal(false)}
        onConfirm={handleDeleteMultiple}
        type="multiple"
        count={selectedTypes.length}
      />

      <div className="p-3 p-md-4">
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <p className="text-muted mb-1">Gestion des Types de Boutique</p>
                <div className="d-flex align-items-center gap-3">
                  <h2 className="h4 mb-0 fw-bold">Types de Boutique</h2>
                  <span className="badge bg-primary bg-opacity-10 text-primary">
                    {filteredTypes.length} type(s)
                    {selectedTypes.length > 0 &&
                      ` (${selectedTypes.length} sélectionné(s))`}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => fetchTypesBoutique()}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  Rafraîchir
                </button>

                <button
                  onClick={handleExport}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={typesBoutique.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Exporter
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-success d-flex align-items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Nouveau Type
                </button>
              </div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mt-3 mb-0"
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
                className="alert alert-success alert-dismissible fade show mt-3 mb-0"
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

            {infoMessage && (
              <div
                className="alert alert-info alert-dismissible fade show mt-3 mb-0"
                role="alert"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <div>
                    <strong>Information:</strong> {infoMessage}
                  </div>
                </div>
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
          {selectedTypes.length > 0 && (
            <div className="p-3 border-bottom bg-warning bg-opacity-10">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faStore} className="text-warning" />
                  <span className="fw-semibold">
                    {selectedTypes.length} type(s) sélectionné(s)
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("activate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Activer</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                    onClick={() => handleBulkAction("deactivate")}
                    disabled={bulkActionLoading}
                  >
                    <FontAwesomeIcon icon={faBan} />
                    <span>Désactiver</span>
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
                      setSelectedTypes([]);
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
                    placeholder="Rechercher par code, libellé ou description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
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
                    value={selectedVente}
                    onChange={(e) => {
                      setSelectedVente(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    <option value="all">Tous les types de vente</option>
                    <option value="produits">Peut vendre produits</option>
                    <option value="biens">Peut vendre biens</option>
                    <option value="both">Produits et biens</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSlidersH} className="text-muted" />
                  </span>
                  <select
                    className="form-select border-start-0 ps-0"
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
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
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1,
                      }));
                    }}
                  >
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Résultats: <strong>{filteredTypes.length}</strong> type(s)
                    {searchTerm && (
                      <>
                        {" "}
                        pour "<strong>{searchTerm}</strong>"
                      </>
                    )}
                    {selectedVente !== "all" && (
                      <>
                        {" "}
                        pouvant vendre "
                        <strong>
                          {selectedVente === "produits"
                            ? "produits"
                            : selectedVente === "biens"
                              ? "biens"
                              : "produits et biens"}
                        </strong>
                        "
                      </>
                    )}
                    {selectedStatus !== "all" && (
                      <>
                        {" "}
                        et statut "
                        <strong>
                          {selectedStatus === "actif" ? "Actif" : "Inactif"}
                        </strong>
                        "
                      </>
                    )}
                  </small>
                </div>
              </div>

              <div className="col-md-4 text-end">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  {selectedTypes.length > 0 && (
                    <small className="text-primary fw-semibold">
                      {selectedTypes.length} sélectionné(s)
                    </small>
                  )}
                  <button
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                    disabled={loading}
                    title="Réinitialiser les filtres"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span className="d-none d-md-inline">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="table-responsive">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredTypes.length === 0 ? (
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
                    {typesBoutique.length === 0
                      ? "Aucun type de boutique trouvé"
                      : "Aucun résultat"}
                  </h5>
                  <p className="mb-0 text-center">
                    {typesBoutique.length === 0
                      ? "Aucun type de boutique dans la base de données."
                      : "Aucun type de boutique ne correspond à vos critères de recherche."}
                  </p>
                  {typesBoutique.length === 0 ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Créer le premier type
                    </button>
                  ) : (
                    <button
                      onClick={resetFilters}
                      className="btn btn-outline-primary mt-3"
                    >
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      Effacer la recherche
                    </button>
                  )}
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
                            type="checkbox"
                            className="form-check-input"
                            checked={selectAll && currentItems.length > 0}
                            onChange={handleSelectAllOnPage}
                            disabled={currentItems.length === 0}
                            title={
                              selectAll
                                ? "Désélectionner cette page"
                                : "Sélectionner cette page"
                            }
                          />
                        </div>
                      </th>
                      <th style={{ width: "60px" }} className="text-center">
                        #
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("libelle")}
                        >
                          <FontAwesomeIcon icon={faStore} className="me-1" />
                          Libellé
                          {getSortIcon("libelle")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("code")}
                        >
                          Code
                          {getSortIcon("code")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>
                        <span className="fw-semibold">Image</span>
                      </th>
                      <th style={{ width: "160px" }}>
                        <span className="fw-semibold">Vente</span>
                      </th>
                      <th style={{ width: "120px" }}>
                        <span className="fw-semibold">Statut</span>
                      </th>
                      <th style={{ width: "150px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("created_at")}
                        >
                          <FontAwesomeIcon icon={faCalendar} className="me-1" />
                          Créé le
                          {getSortIcon("created_at")}
                        </button>
                      </th>
                      <th style={{ width: "140px" }} className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((type, index) => (
                      <tr
                        key={type.uuid}
                        className={`align-middle ${selectedTypes.includes(type.uuid) ? "table-active" : ""}`}
                      >
                        <td className="text-center">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedTypes.includes(type.uuid)}
                              onChange={() => handleSelectType(type.uuid)}
                            />
                          </div>
                        </td>
                        <td className="text-center text-muted fw-semibold">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <FontAwesomeIcon icon={faStore} />
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <div className="fw-semibold">{type.libelle}</div>
                              {type.description && (
                                <small
                                  className="text-muted text-truncate d-block"
                                  style={{
                                    maxWidth: "150px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={type.description}
                                >
                                  {type.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code
                            className="text-muted bg-light rounded px-2 py-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {type.code}
                          </code>
                        </td>
                        <td>
                          <div
                            className="position-relative"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <TypeBoutiqueImage
                              src={type.image}
                              alt={type.libelle}
                              className="img-fluid rounded border"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            {!type.image && (
                              <div className="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100">
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="text-muted"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <VenteBadge
                              type="produits"
                              value={type.peut_vendre_produits}
                            />
                            <VenteBadge
                              type="biens"
                              value={type.peut_vendre_biens}
                            />
                          </div>
                        </td>
                        <td>
                          <StatusBadge statut={type.statut} />
                          {type.is_deleted && (
                            <div className="mt-1">
                              <span
                                className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                                style={{ fontSize: "0.65rem" }}
                              >
                                Supprimé
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted me-2"
                            />
                            <small className="text-muted">
                              {formatDate(type.created_at)}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              title="Voir détails"
                              onClick={() => {
                                setSelectedTypeBoutique(type);
                                setShowViewModal(true);
                              }}
                              disabled={loading}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Modifier"
                              onClick={() => {
                                setSelectedTypeBoutique(type);
                                setShowEditModal(true);
                              }}
                              disabled={loading || type.is_deleted}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => openDeleteModal(type)}
                              disabled={loading || type.is_deleted}
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
                {filteredTypes.length > pagination.limit && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={filteredTypes.length}
                    itemsPerPage={pagination.limit}
                    indexOfFirstItem={(pagination.page - 1) * pagination.limit}
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
        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .fs-12 {
          font-size: 0.75rem !important;
        }
        .fs-10 {
          font-size: 0.625rem !important;
        }
        .card {
          border-radius: 12px;
          overflow: hidden;
        }
        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
        }
        .table td {
          border-bottom: 1px solid #e9ecef;
        }
        .badge {
          font-weight: 500;
        }
        .opacity-0 {
          opacity: 0 !important;
        }
        .opacity-100 {
          opacity: 1 !important;
        }
        /* Animation pour le skeleton */
        .placeholder-wave {
          animation: placeholder-wave 2s infinite linear;
        }
        @keyframes placeholder-wave {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
