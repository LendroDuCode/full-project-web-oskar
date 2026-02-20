// components/DataTable.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faEye,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faStore,
  faSpinner,
  faExclamationTriangle,
  faTrash,
  faBan,
  faCalendarCheck,
  faCalendarXmark,
  faCheckSquare,
  faSquare,
  faCheckDouble,
  faBan as faBlock,
  faGlobe,
  faLock,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface ContentItem {
  id: string;
  uuid: string;
  title: string;
  description?: string;
  image: string;
  status: string;
  type: "produit" | "don" | "echange";
  date: string;
  seller?: {
    name: string;
    avatar?: string;
    isPro?: boolean;
  };
  category?: string;
  quantite?: number;
  prix?: string;
  estPublie?: boolean;
  estBloque?: boolean;
  originalData?: any;
}

interface DataTableProps {
  contentType?: "produit" | "don" | "echange";
  statusFilter?: string;
  categoryFilter?: string;
  searchQuery?: string;
  onValidate?: (uuid: string, type: string) => Promise<void>;
  onReject?: (uuid: string, type: string) => Promise<void>;
  onView?: (uuid: string, type: string) => void;
  onPublish?: (uuid: string, type: string, estPublie: boolean) => Promise<void>;
  onDelete?: (uuid: string, type: string) => Promise<void>;
  onBlock?: (uuid: string, type: string, estBloque: boolean) => Promise<void>;
  className?: string;
  data?: ContentItem[];
  loading?: boolean;
}

export default function DataTable({
  contentType = "produit",
  statusFilter = "tous",
  categoryFilter = "toutes",
  searchQuery = "",
  onValidate,
  onReject,
  onView,
  onPublish,
  onDelete,
  onBlock,
  className = "",
  data: externalData,
  loading: externalLoading,
}: DataTableProps) {
  const router = useRouter();
  const [data, setData] = useState<ContentItem[]>(externalData || []);
  const [loading, setLoading] = useState<boolean>(externalLoading || true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const fetchData = useCallback(async () => {
    if (externalData !== undefined) {
      setData(externalData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let endpoint = "";

      switch (contentType) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.ALL;
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.LIST;
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.LIST;
          break;
        default:
          endpoint = API_ENDPOINTS.PRODUCTS.ALL;
      }

      const response = await api.get<any[]>(endpoint);

      const transformedData = response.map((item) => {
        let title = "";
        let sellerName = "Inconnu";
        let sellerIsPro = false;
        let date = new Date().toISOString();
        let imageUrl = "";
        let status = "";
        let isPublished = false;
        let isBlocked = false;

        if (contentType === "produit") {
          title = item.libelle || "Produit sans nom";
          sellerName = item.vendeur
            ? `${item.vendeur.nom || ""} ${item.vendeur.prenoms || ""}`.trim()
            : "Vendeur";
          sellerIsPro = !!item.boutique?.nom;
          date = item.createdAt || item.updatedAt || new Date().toISOString();
          status =
            item.statut?.toLowerCase() ||
            (item.estPublie ? "publie" : "en-attente");
          isPublished = item.estPublie || false;
          isBlocked = item.estBloque || false;

          if (item.image && item.image.startsWith("/")) {
            imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
          } else if (item.image) {
            imageUrl = item.image;
          } else {
            const firstChar = title?.charAt?.(0) || "P";
            imageUrl = `https://via.placeholder.com/48?text=${encodeURIComponent(firstChar)}`;
          }
        } else if (contentType === "don") {
          title = item.nom || "Don sans nom";
          sellerName = item.nom_donataire || "Donateur";
          date = item.date_debut || new Date().toISOString();
          status = item.statut?.toLowerCase() || "en-attente";
          isPublished = item.estPublie || false;
          isBlocked = item.est_bloque || false;

          if (item.image && item.image.startsWith("/")) {
            imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
          } else if (item.image) {
            imageUrl = item.image;
          } else {
            imageUrl = `https://via.placeholder.com/48?text=D`;
          }
        } else if (contentType === "echange") {
          title =
            item.nomElementEchange ||
            `${item.objetPropose || ""} vs ${item.objetDemande || ""}`.trim() ||
            "Échange sans nom";
          sellerName = item.nom_initiateur || "Initié par";
          date = item.dateProposition || new Date().toISOString();
          status = item.statut?.toLowerCase() || "en-attente";
          isPublished = item.estPublie || false;
          isBlocked = item.estBloque || false;

          if (item.image && item.image.startsWith("/")) {
            imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${item.image}`;
          } else if (item.image) {
            imageUrl = item.image;
          } else {
            imageUrl = `https://via.placeholder.com/48?text=E`;
          }
        }

        if (!title || title.trim() === "") {
          title = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} sans nom`;
        }

        return {
          id: item.id?.toString() || item.uuid || Math.random().toString(),
          uuid: item.uuid || Math.random().toString(),
          title,
          description: item.description || "",
          image: imageUrl,
          status,
          type: contentType,
          date,
          seller: {
            name: sellerName,
            avatar: item.vendeur?.avatar,
            isPro: sellerIsPro,
          },
          category: item.categorie_uuid || item.categorieUuid,
          quantite: item.quantite,
          prix: item.prix,
          estPublie: isPublished,
          estBloque: isBlocked,
          originalData: item,
        };
      });

      setData(transformedData);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError(
        err.message || "Une erreur est survenue lors du chargement des données",
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [contentType, externalData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (externalData !== undefined) {
      setData(externalData);
    }
  }, [externalData]);

  useEffect(() => {
    if (externalLoading !== undefined) {
      setLoading(externalLoading);
    }
  }, [externalLoading]);

  // Filtrer les données
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!item.title) return false;

      // Filtre par statut
      if (statusFilter !== "tous") {
        if (statusFilter === "publie" && !item.estPublie) return false;
        if (statusFilter === "bloque" && !item.estBloque) return false;
        if (
          statusFilter === "en-attente" &&
          item.status !== "en-attente" &&
          item.status !== "en_attente"
        )
          return false;
        if (statusFilter === "valide" && item.status !== "valide") return false;
        if (statusFilter === "refuse" && item.status !== "refuse") return false;
        if (statusFilter === "disponible" && item.status !== "disponible")
          return false;
      }

      // Filtre par catégorie
      if (categoryFilter !== "toutes" && item.category !== categoryFilter) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = item.title?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        const sellerName = item.seller?.name?.toLowerCase() || "";

        const matchesSearch =
          title.includes(query) ||
          description.includes(query) ||
          sellerName.includes(query);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [data, statusFilter, categoryFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Gestion de la sélection
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allUuids = new Set(currentItems.map((item) => item.uuid));
      setSelectedItems(allUuids);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectItem = (uuid: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      newSelected.add(uuid);
    }
    setSelectedItems(newSelected);

    const currentPageUuids = currentItems.map((item) => item.uuid);
    const allSelected = currentPageUuids.every((uuid) => newSelected.has(uuid));
    setSelectAll(allSelected);
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: "#10B981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        label: "Produit",
      },
      don: {
        icon: faGift,
        color: "#8B5CF6",
        bgColor: "rgba(139, 92, 246, 0.1)",
        label: "Don",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: "#F59E0B",
        bgColor: "rgba(245, 158, 11, 0.1)",
        label: "Échange",
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusBadge = (item: ContentItem) => {
    const configs: Record<string, { color: string; label: string }> = {
      "en-attente": { color: "#F59E0B", label: "En attente" },
      en_attente: { color: "#F59E0B", label: "En attente" },
      publie: { color: "#10B981", label: "Publié" },
      disponible: { color: "#3B82F6", label: "Disponible" },
      valide: { color: "#10B981", label: "Validé" },
      refuse: { color: "#EF4444", label: "Refusé" },
      bloque: { color: "#EF4444", label: "Bloqué" },
    };

    let status = item.status;
    if (item.estBloque) {
      status = "bloque";
    } else if (item.estPublie) {
      status = "publie";
    }

    const config = configs[status] || { color: "#6B7280", label: status };

    return (
      <span
        className="badge rounded-pill"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          fontSize: "0.7rem",
          padding: "0.25rem 0.5rem",
        }}
      >
        {config.label}
      </span>
    );
  };

  // Gestion des erreurs d'image
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    title: string,
  ) => {
    const target = e.currentTarget;
    const firstChar = title?.charAt?.(0)?.toUpperCase() || "?";
    target.src = `https://via.placeholder.com/48?text=${encodeURIComponent(firstChar)}`;
    target.onerror = null;
  };

  // ✅ CORRECTION: Fonction handleViewDetails améliorée
  const handleViewDetails = (row: ContentItem) => {
    // Déterminer si l'élément est publié
    const isPublished =
      row.estPublie ||
      row.status === "publie" ||
      row.status === "disponible" ||
      row.status === "valide";

    let basePath = "/dashboard-agent/annonces";

    // Construire l'URL selon le type
    switch (row.type) {
      case "produit":
        if (isPublished) {
          router.push(`${basePath}/produit/${row.uuid}`);
        } else {
          router.push(`${basePath}/produit/non-publie/${row.uuid}`);
        }
        break;

      case "don":
        if (isPublished) {
          router.push(`${basePath}/don/${row.uuid}`);
        } else {
          router.push(`${basePath}/don/non-publie/${row.uuid}`);
        }
        break;

      case "echange":
        if (isPublished) {
          router.push(`${basePath}/echange/${row.uuid}`);
        } else {
          router.push(`${basePath}/echange/${row.uuid}`);
        }
        break;

      default:
        // Fallback
        router.push(`${basePath}/${row.type}/${row.uuid}`);
    }
  };

  // Actions individuelles
  const handleValidate = async (uuid: string) => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      await onValidate?.(uuid, contentType);
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      alert("Erreur lors de la validation");
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  const handleReject = async (uuid: string) => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      await onReject?.(uuid, contentType);
    } catch (err) {
      console.error("Erreur lors du rejet:", err);
      alert("Erreur lors du rejet");
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  const handlePublish = async (uuid: string, estPublie: boolean) => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      await onPublish?.(uuid, contentType, estPublie);
    } catch (err) {
      console.error("Erreur lors de la publication:", err);
      alert("Erreur lors de la publication");
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  const handleDelete = async (uuid: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      await onDelete?.(uuid, contentType);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression");
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  const handleBlock = async (uuid: string, estBloque: boolean) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir ${estBloque ? "débloquer" : "bloquer"} cet élément ?`,
      )
    ) {
      return;
    }

    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      await onBlock?.(uuid, contentType, estBloque);
    } catch (err) {
      console.error("Erreur lors du blocage:", err);
      alert("Erreur lors du blocage");
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action:
      | "validate"
      | "reject"
      | "publish"
      | "unpublish"
      | "block"
      | "unblock"
      | "delete",
  ) => {
    if (selectedItems.size === 0) {
      alert("Veuillez sélectionner au moins un élément");
      return;
    }

    const actionText = {
      validate: "valider",
      reject: "rejeter",
      publish: "publier",
      unpublish: "dépublier",
      block: "bloquer",
      unblock: "débloquer",
      delete: "supprimer",
    }[action];

    if (
      !confirm(
        `Êtes-vous sûr de vouloir ${actionText} ${selectedItems.size} élément(s) ?`,
      )
    ) {
      return;
    }

    const promises = Array.from(selectedItems).map(async (uuid) => {
      try {
        switch (action) {
          case "validate":
            await onValidate?.(uuid, contentType);
            break;
          case "reject":
            await onReject?.(uuid, contentType);
            break;
          case "publish":
            await onPublish?.(uuid, contentType, true);
            break;
          case "unpublish":
            await onPublish?.(uuid, contentType, false);
            break;
          case "block":
            await onBlock?.(uuid, contentType, true);
            break;
          case "unblock":
            await onBlock?.(uuid, contentType, false);
            break;
          case "delete":
            await onDelete?.(uuid, contentType);
            break;
        }
      } catch (err) {
        console.error(`Erreur lors de ${actionText} l'élément ${uuid}:`, err);
      }
    });

    await Promise.all(promises);
    clearSelection();
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const isProcessing = (uuid: string) => processing.has(uuid);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="2x"
          className="text-primary mb-3"
        />
        <p className="text-muted">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="alert alert-danger d-flex align-items-center"
        role="alert"
      >
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-3" />
        <div>
          <h5 className="alert-heading mb-2">Erreur de chargement</h5>
          <p className="mb-0">{error}</p>
          <button
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={fetchData}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3 border border-light overflow-hidden shadow-sm ${className}`}
    >
      {/* Barre d'actions en masse */}
      {selectedItems.size > 0 && (
        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span className="fw-medium text-dark">
              {selectedItems.size} élément(s) sélectionné(s)
            </span>

            <div className="d-flex flex-wrap gap-2">
              {/* Actions en masse */}
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => handleBulkAction("validate")}
                title="Valider la sélection"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="me-1" />
                Valider
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleBulkAction("reject")}
                title="Rejeter la sélection"
              >
                <FontAwesomeIcon icon={faXmark} className="me-1" />
                Rejeter
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleBulkAction("publish")}
                title="Publier la sélection"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                Publier
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleBulkAction("unpublish")}
                title="Dépublier la sélection"
              >
                <FontAwesomeIcon icon={faCalendarXmark} className="me-1" />
                Dépublier
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleBulkAction("block")}
                title="Bloquer la sélection"
              >
                <FontAwesomeIcon icon={faLock} className="me-1" />
                Bloquer
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => handleBulkAction("unblock")}
                title="Débloquer la sélection"
              >
                <FontAwesomeIcon icon={faUnlock} className="me-1" />
                Débloquer
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-dark"
                onClick={() => handleBulkAction("delete")}
                title="Supprimer la sélection"
              >
                <FontAwesomeIcon icon={faTrash} className="me-1" />
                Supprimer
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={clearSelection}
          >
            Annuler la sélection
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr>
              <th
                className="px-3 py-3 text-center border-bottom"
                style={{ width: "40px" }}
              >
                <button
                  type="button"
                  className="btn btn-sm p-0 border-0 bg-transparent"
                  onClick={toggleSelectAll}
                  title={
                    selectAll ? "Désélectionner tout" : "Sélectionner tout"
                  }
                >
                  <FontAwesomeIcon
                    icon={selectAll ? faCheckSquare : faSquare}
                    className={selectAll ? "text-primary" : "text-muted"}
                  />
                </button>
              </th>

              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Photo
              </th>
              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Titre
              </th>
              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Vendeur
              </th>
              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Type
              </th>
              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Statut
              </th>
              <th className="px-3 py-3 text-start text-uppercase fw-semibold text-muted small border-bottom">
                Date
              </th>
              <th className="px-3 py-3 text-center text-uppercase fw-semibold text-muted small border-bottom">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row) => {
              const typeConfig = getTypeConfig(row.type);
              const isItemProcessing = isProcessing(row.uuid);
              const isSelected = selectedItems.has(row.uuid);
              const isEnAttente =
                row.status === "en-attente" || row.status === "en_attente";

              return (
                <tr
                  key={row.uuid}
                  className={`align-middle border-bottom border-light ${isSelected ? "bg-light" : ""}`}
                >
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      className="btn btn-sm p-0 border-0 bg-transparent"
                      onClick={() => toggleSelectItem(row.uuid)}
                      title={isSelected ? "Désélectionner" : "Sélectionner"}
                    >
                      <FontAwesomeIcon
                        icon={isSelected ? faCheckSquare : faSquare}
                        className={isSelected ? "text-primary" : "text-muted"}
                      />
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    <div
                      className="rounded-3 overflow-hidden"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <img
                        src={row.image}
                        alt={row.title}
                        className="w-100 h-100 object-cover"
                        onError={(e) => handleImageError(e, row.title)}
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div>
                      <p className="fw-semibold text-dark mb-1 small">
                        {row.title}
                      </p>
                      {row.description && (
                        <p
                          className="text-muted x-small mb-0 text-truncate"
                          style={{ maxWidth: "150px" }}
                          title={row.description}
                        >
                          {row.description}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: "#f8f9fa",
                          flexShrink: 0,
                        }}
                      >
                        {row.seller?.avatar ? (
                          <img
                            src={row.seller.avatar}
                            alt={row.seller.name}
                            className="w-100 h-100 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/28?text=${encodeURIComponent(row.seller?.name?.charAt(0) || "?")}`;
                            }}
                          />
                        ) : (
                          <span className="text-muted x-small">
                            {row.seller?.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="fw-medium text-dark x-small mb-0">
                          {row.seller?.name || "Inconnu"}
                        </p>
                        {row.seller?.isPro && (
                          <span
                            className="badge rounded-pill d-inline-flex align-items-center gap-1"
                            style={{
                              backgroundColor: "#1D4ED8",
                              color: "white",
                              fontSize: "0.6rem",
                              padding: "0.2rem 0.4rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faStore} size="xs" />
                            Pro
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className="badge rounded-pill d-inline-flex align-items-center gap-1"
                      style={{
                        backgroundColor: typeConfig.bgColor,
                        color: typeConfig.color,
                        fontSize: "0.7rem",
                        padding: "0.3rem 0.6rem",
                        border: `1px solid ${typeConfig.color}20`,
                      }}
                    >
                      <FontAwesomeIcon icon={typeConfig.icon} size="xs" />
                      {typeConfig.label}
                    </span>
                  </td>

                  <td className="px-3 py-3">{getStatusBadge(row)}</td>

                  <td className="px-3 py-3">
                    <div>
                      <p className="fw-medium text-dark x-small mb-0">
                        {new Date(row.date).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-muted x-small mb-0">
                        {new Date(row.date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="d-flex justify-content-center gap-1 flex-nowrap">
                      {isItemProcessing ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <FontAwesomeIcon
                            icon={faSpinner}
                            spin
                            size="sm"
                            className="text-primary"
                          />
                        </div>
                      ) : (
                        <>
                          {/* ✅ Bouton Voir détails corrigé */}
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              color: "#3B82F6",
                              border: "none",
                              borderRadius: "6px",
                            }}
                            onClick={() => handleViewDetails(row)}
                            title="Voir détails"
                            disabled={isItemProcessing}
                          >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </button>

                          {/* Bouton Valider - seulement si en attente */}
                          {isEnAttente && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: "rgba(16, 185, 129, 0.1)",
                                color: "#10B981",
                                border: "none",
                                borderRadius: "6px",
                              }}
                              onClick={() => handleValidate(row.uuid)}
                              title="Valider"
                              disabled={isItemProcessing}
                            >
                              <FontAwesomeIcon icon={faCheck} size="xs" />
                            </button>
                          )}

                          {/* Bouton Refuser - seulement si en attente */}
                          {isEnAttente && (
                            <button
                              type="button"
                              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                color: "#EF4444",
                                border: "none",
                                borderRadius: "6px",
                              }}
                              onClick={() => handleReject(row.uuid)}
                              title="Refuser"
                              disabled={isItemProcessing}
                            >
                              <FontAwesomeIcon icon={faXmark} size="xs" />
                            </button>
                          )}

                          {/* Bouton Publier/Dépublier */}
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: row.estPublie
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(16, 185, 129, 0.1)",
                              color: row.estPublie ? "#F59E0B" : "#10B981",
                              border: "none",
                              borderRadius: "6px",
                            }}
                            onClick={() =>
                              handlePublish(row.uuid, !row.estPublie)
                            }
                            title={row.estPublie ? "Dépublier" : "Publier"}
                            disabled={isItemProcessing}
                          >
                            <FontAwesomeIcon
                              icon={
                                row.estPublie
                                  ? faCalendarXmark
                                  : faCalendarCheck
                              }
                              size="xs"
                            />
                          </button>

                          {/* Bouton Bloquer/Débloquer */}
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: row.estBloque
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(245, 158, 11, 0.1)",
                              color: row.estBloque ? "#10B981" : "#F59E0B",
                              border: "none",
                              borderRadius: "6px",
                            }}
                            onClick={() =>
                              handleBlock(row.uuid, !row.estBloque)
                            }
                            title={row.estBloque ? "Débloquer" : "Bloquer"}
                            disabled={isItemProcessing}
                          >
                            <FontAwesomeIcon
                              icon={row.estBloque ? faUnlock : faLock}
                              size="xs"
                            />
                          </button>

                          {/* Bouton Supprimer */}
                          <button
                            type="button"
                            className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              backgroundColor: "rgba(107, 114, 128, 0.1)",
                              color: "#6B7280",
                              border: "none",
                              borderRadius: "6px",
                            }}
                            onClick={() => handleDelete(row.uuid)}
                            title="Supprimer"
                            disabled={isItemProcessing}
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && !loading && (
        <div className="text-center py-5">
          <div className="mb-3">
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#f8f9fa",
                color: "#6c757d",
                fontSize: "1.5rem",
              }}
            >
              <FontAwesomeIcon icon={faTag} />
            </div>
          </div>
          <h5 className="fw-semibold text-dark mb-2">Aucun résultat trouvé</h5>
          <p className="text-muted mb-0">
            {searchQuery ||
            statusFilter !== "tous" ||
            categoryFilter !== "toutes"
              ? "Aucune donnée ne correspond à vos filtres."
              : "Aucune donnée disponible."}
          </p>
        </div>
      )}

      {filteredData.length > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top">
          <div className="text-muted small mb-2 mb-md-0">
            Affichage de <span className="fw-semibold">{startIndex + 1}</span> à{" "}
            <span className="fw-semibold">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{" "}
            sur <span className="fw-semibold">{filteredData.length}</span>{" "}
            éléments
            {selectedItems.size > 0 && (
              <span className="ms-2 text-primary">
                • {selectedItems.size} sélectionné(s)
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "100px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
                clearSelection();
              }}
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>

            <nav aria-label="Navigation">
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(1);
                      clearSelection();
                    }}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                </li>
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      clearSelection();
                    }}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                </li>

                <li className="page-item active">
                  <span className="page-link">{currentPage}</span>
                </li>

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      clearSelection();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </li>
                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(totalPages);
                      clearSelection();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
