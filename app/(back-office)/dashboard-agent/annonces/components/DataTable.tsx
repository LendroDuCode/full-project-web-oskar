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
  faSpinner,
  faExclamationTriangle,
  faTrash,
  faCalendarCheck,
  faCalendarXmark,
  faCheckSquare,
  faSquare,
  faCheckDouble,
  faLock,
  faUnlock,
  faImage,
  faClock,
  faGlobe,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

interface ContentItem {
  id: string;
  uuid: string;
  title: string;
  description?: string;
  image: string;
  status: string;
  type: "produit" | "don" | "echange";
  date: string;
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
  hideVendeurColumn?: boolean;
  onDataChange?: () => void;
}

// Type pour les actions de confirmation
interface ConfirmAction {
  show: boolean;
  type: "delete" | "block" | "unblock" | "validate" | "reject" | "publish" | "unpublish";
  uuid?: string;
  itemType?: "produit" | "don" | "echange";
  bulk?: boolean;
  count?: number;
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
  hideVendeurColumn = true,
  onDataChange,
}: DataTableProps) {
  const router = useRouter();
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // État pour la modal de confirmation
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    type: "delete",
  });

  // ============================================
  // GESTION DES DONNÉES EXTERNES
  // ============================================
  useEffect(() => {
    if (externalData !== undefined) {
      console.log("📊 DataTable - Données externes reçues:", externalData.length);
      setData(externalData);
      setLoading(false);
      setError(null);
    }
  }, [externalData]);

  useEffect(() => {
    if (externalLoading !== undefined) {
      setLoading(externalLoading);
    }
  }, [externalLoading]);

  // ============================================
  // CHARGEMENT DES DONNÉES (SI PAS DE DONNÉES EXTERNES)
  // ============================================
  const fetchData = useCallback(async () => {
    if (externalData !== undefined) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImageErrors(new Set());

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

      console.log("📊 DataTable - Chargement depuis:", endpoint);
      const response = await api.get<any[]>(endpoint);

      const transformedData = response.map((item) => {
        let title = "";
        let date = new Date().toISOString();
        let imageUrl = "";
        let status = "";
        let isPublished = false;
        let isBlocked = false;

        if (contentType === "produit") {
          title = item.libelle || "Produit sans nom";
          date = item.createdAt || item.updatedAt || new Date().toISOString();
          status =
            item.statut?.toLowerCase() ||
            (item.estPublie ? "publie" : "en-attente");
          isPublished = item.estPublie || false;
          isBlocked = item.estBloque || false;
          imageUrl = item.image ? buildImageUrl(item.image) : "";
        } else if (contentType === "don") {
          title = item.nom || "Don sans nom";
          date = item.date_debut || new Date().toISOString();
          status = item.statut?.toLowerCase() || "en-attente";
          isPublished = item.estPublie || false;
          isBlocked = item.est_bloque || false;
          imageUrl = item.image ? buildImageUrl(item.image) : "";
        } else if (contentType === "echange") {
          title =
            item.nomElementEchange ||
            `${item.objetPropose || ""} vs ${item.objetDemande || ""}`.trim() ||
            "Échange sans nom";
          date = item.dateProposition || new Date().toISOString();
          status = item.statut?.toLowerCase() || "en-attente";
          isPublished = item.estPublie || false;
          isBlocked = item.estBloque || false;
          imageUrl = item.image ? buildImageUrl(item.image) : "";
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
    if (externalData === undefined) {
      fetchData();
    }
  }, [fetchData, externalData]);

  // ============================================
  // GESTION DES ERREURS D'IMAGE
  // ============================================
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    title: string,
    uuid: string,
  ) => {
    const target = e.currentTarget;
    setImageErrors((prev) => new Set(prev).add(uuid));
    const firstChar = title?.charAt?.(0)?.toUpperCase() || "?";
    target.src = `https://via.placeholder.com/48?text=${encodeURIComponent(firstChar)}`;
    target.onerror = null;
  };

  const getImageUrl = (item: ContentItem): string => {
    if (imageErrors.has(item.uuid)) {
      const firstChar = item.title?.charAt?.(0)?.toUpperCase() || "?";
      return `https://via.placeholder.com/48?text=${encodeURIComponent(firstChar)}`;
    }
    return item.image || `https://via.placeholder.com/48?text=${encodeURIComponent(item.title?.charAt?.(0)?.toUpperCase() || "?")}`;
  };

  // ============================================
  // FILTRAGE DES DONNÉES
  // ============================================
  const filteredData = useMemo(() => {
    console.log("🔍 DataTable - Filtrage avec:", {
      statusFilter,
      categoryFilter,
      searchQuery,
      dataLength: data.length
    });

    return data.filter((item) => {
      if (!item.title) return false;

      if (statusFilter !== "tous") {
        if (statusFilter === "publie" && item.estPublie !== true) {
          return false;
        }
        if (statusFilter === "bloque" && item.estBloque !== true) {
          return false;
        }
        if (statusFilter === "en-attente") {
          if (item.estPublie === true || item.estBloque === true) {
            return false;
          }
        }
      }

      if (categoryFilter !== "toutes" && item.category !== categoryFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = item.title?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";

        const matchesSearch =
          title.includes(query) || description.includes(query);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [data, statusFilter, categoryFilter, searchQuery]);

  // ============================================
  // PAGINATION
  // ============================================
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [statusFilter, categoryFilter, searchQuery]);

  // ============================================
  // GESTION DE LA SÉLECTION
  // ============================================
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

  // ============================================
  // CONFIGURATIONS
  // ============================================
  const getTypeConfig = (type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: "#10b981",
        bgColor: "#10b98115",
        label: "Produit",
      },
      don: {
        icon: faGift,
        color: "#8b5cf6",
        bgColor: "#8b5cf615",
        label: "Don",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: "#f59e0b",
        bgColor: "#f59e0b15",
        label: "Échange",
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusBadge = (item: ContentItem) => {
    if (item.estBloque) {
      return {
        label: "Bloqué",
        color: "#ef4444",
        icon: faBan,
      };
    }
    
    if (item.estPublie) {
      return {
        label: "Publié",
        color: "#10b981",
        icon: faGlobe,
      };
    }
    
    return {
      label: "En attente",
      color: "#f59e0b",
      icon: faClock,
    };
  };

  // ============================================
  // GESTION DES CONFIRMATIONS
  // ============================================
  const showConfirm = (
    type: ConfirmAction["type"],
    uuid?: string,
    itemType?: "produit" | "don" | "echange",
    bulk: boolean = false
  ) => {
    setConfirmAction({
      show: true,
      type,
      uuid,
      itemType,
      bulk,
      count: bulk ? selectedItems.size : 1,
    });
  };

  const handleConfirmClose = () => {
    setConfirmAction({ ...confirmAction, show: false });
  };

  // ============================================
  // ACTIONS - UTILISATION DU TYPE DE L'ÉLÉMENT
  // ============================================
  const handleViewDetails = (row: ContentItem) => {
    let basePath = "/dashboard-agent/annonces";
    switch (row.type) {
      case "produit":
        router.push(`${basePath}/produit/${row.uuid}`);
        break;
      case "don":
        router.push(`${basePath}/don/${row.uuid}`);
        break;
      case "echange":
        router.push(`${basePath}/echange/${row.uuid}`);
        break;
      default:
        router.push(`${basePath}/${row.type}/${row.uuid}`);
    }
  };

  // ✅ SUPPRESSION
  const handleDelete = async (uuid: string, itemType: "produit" | "don" | "echange") => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      
      console.log(`🗑️ Suppression - Type: ${itemType}, UUID: ${uuid}`);
      
      let endpoint = "";
      
      switch (itemType) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.DELETE(uuid);
          console.log("📡 Endpoint produit:", endpoint);
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.DELETE(uuid);
          console.log("📡 Endpoint don:", endpoint);
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.DELETE(uuid);
          console.log("📡 Endpoint echange:", endpoint);
          break;
      }
      
      await api.delete(endpoint);
      
      toast.success("🗑️ Annonce supprimée définitivement");
      
      if (onDataChange) {
        onDataChange();
      } else {
        setData(prevData => prevData.filter(item => item.uuid !== uuid));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression:", err);
      toast.error(`❌ Erreur: ${err.message || "Impossible de supprimer l'annonce"}`);
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
      handleConfirmClose();
    }
  };

  // ✅ VALIDATION - Supprimée
  const handleValidate = async (uuid: string, itemType: "produit" | "don" | "echange") => {
    // Cette fonction est conservée pour la compatibilité des props mais n'est plus utilisée
    console.warn("La fonction handleValidate n'est plus disponible");
  };

  // ✅ REJET - Supprimé
  const handleReject = async (uuid: string, itemType: "produit" | "don" | "echange") => {
    // Cette fonction est conservée pour la compatibilité des props mais n'est plus utilisée
    console.warn("La fonction handleReject n'est plus disponible");
  };

  // ✅ PUBLICATION/DÉPUBLICATION
  const handlePublish = async (uuid: string, itemType: "produit" | "don" | "echange", estPublie: boolean) => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      
      let endpoint = "";
      let data: any = {};
      
      switch (itemType) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.PUBLLIER;
          data = { productUuid: uuid, est_publie: estPublie };
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.PUBLISH;
          data = { donUuid: uuid, est_publie: estPublie };
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.PUBLISH;
          data = { echangeUuid: uuid, est_publie: estPublie };
          break;
      }
      
      await api.post(endpoint, data);
      toast.success(estPublie ? "📢 Annonce publiée" : "🔇 Annonce dépubliée");
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (err: any) {
      console.error("Erreur lors de la publication:", err);
      toast.error(`❌ Erreur: ${err.message || "Impossible de modifier la publication"}`);
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
      handleConfirmClose();
    }
  };

  // ✅ BLOCAGE/DÉBLOCAGE
  const handleBlock = async (uuid: string, itemType: "produit" | "don" | "echange", estBloque: boolean) => {
    try {
      setProcessing((prev) => new Set(prev).add(uuid));
      
      let endpoint = "";
      let data: any = {};
      
      switch (itemType) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.BLOQUE_PRODUITS;
          data = { productUuid: uuid, est_bloque: estBloque };
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
          data = { donUuid: uuid, est_bloque: estBloque };
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
          data = { echangeUuid: uuid, est_bloque: estBloque };
          break;
      }
      
      await api.post(endpoint, data);
      toast.success(estBloque ? "🔒 Annonce bloquée" : "🔓 Annonce débloquée");
      
      if (onDataChange) {
        onDataChange();
      }
    } catch (err: any) {
      console.error("Erreur lors du blocage:", err);
      toast.error(`❌ Erreur: ${err.message || "Impossible de modifier le blocage"}`);
    } finally {
      setProcessing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uuid);
        return newSet;
      });
      handleConfirmClose();
    }
  };

  // ✅ ACTIONS EN MASSE (sans validation/rejet)
  const handleBulkAction = async (
    action:
      | "publish"
      | "unpublish"
      | "block"
      | "unblock"
      | "delete",
  ) => {
    if (selectedItems.size === 0) {
      toast.warning("Veuillez sélectionner au moins un élément");
      return;
    }

    setProcessing(new Set(selectedItems));
    let successCount = 0;
    let errorCount = 0;

    const promises = Array.from(selectedItems).map(async (uuid) => {
      const item = data.find(item => item.uuid === uuid);
      if (!item) {
        errorCount++;
        return;
      }

      try {
        switch (action) {
          case "delete": {
            let endpoint = "";
            switch (item.type) {
              case "produit": endpoint = API_ENDPOINTS.PRODUCTS.DELETE(uuid); break;
              case "don": endpoint = API_ENDPOINTS.DONS.DELETE(uuid); break;
              case "echange": endpoint = API_ENDPOINTS.ECHANGES.DELETE(uuid); break;
            }
            await api.delete(endpoint);
            break;
          }
          case "publish": {
            let endpoint = "";
            let data: any = {};
            switch (item.type) {
              case "produit":
                endpoint = API_ENDPOINTS.PRODUCTS.PUBLLIER;
                data = { productUuid: uuid, est_publie: true };
                break;
              case "don":
                endpoint = API_ENDPOINTS.DONS.PUBLISH;
                data = { donUuid: uuid, est_publie: true };
                break;
              case "echange":
                endpoint = API_ENDPOINTS.ECHANGES.PUBLISH;
                data = { echangeUuid: uuid, est_publie: true };
                break;
            }
            await api.post(endpoint, data);
            break;
          }
          case "unpublish": {
            let endpoint = "";
            let data: any = {};
            switch (item.type) {
              case "produit":
                endpoint = API_ENDPOINTS.PRODUCTS.PUBLLIER;
                data = { productUuid: uuid, est_publie: false };
                break;
              case "don":
                endpoint = API_ENDPOINTS.DONS.PUBLISH;
                data = { donUuid: uuid, est_publie: false };
                break;
              case "echange":
                endpoint = API_ENDPOINTS.ECHANGES.PUBLISH;
                data = { echangeUuid: uuid, est_publie: false };
                break;
            }
            await api.post(endpoint, data);
            break;
          }
          case "block": {
            let endpoint = "";
            let data: any = {};
            switch (item.type) {
              case "produit":
                endpoint = API_ENDPOINTS.PRODUCTS.BLOQUE_PRODUITS;
                data = { productUuid: uuid, est_bloque: true };
                break;
              case "don":
                endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
                data = { donUuid: uuid, est_bloque: true };
                break;
              case "echange":
                endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
                data = { echangeUuid: uuid, est_bloque: true };
                break;
            }
            await api.post(endpoint, data);
            break;
          }
          case "unblock": {
            let endpoint = "";
            let data: any = {};
            switch (item.type) {
              case "produit":
                endpoint = API_ENDPOINTS.PRODUCTS.BLOQUE_PRODUITS;
                data = { productUuid: uuid, est_bloque: false };
                break;
              case "don":
                endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
                data = { donUuid: uuid, est_bloque: false };
                break;
              case "echange":
                endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
                data = { echangeUuid: uuid, est_bloque: false };
                break;
            }
            await api.post(endpoint, data);
            break;
          }
        }
        successCount++;
      } catch (err) {
        console.error(`Erreur lors de l'action:`, err);
        errorCount++;
      }
    });

    await Promise.all(promises);
    
    if (errorCount === 0) {
      toast.success(`${successCount}/${selectedItems.size} élément(s) traités avec succès`);
    } else {
      toast.warning(`${successCount} succès, ${errorCount} échec(s)`);
    }
    
    setProcessing(new Set());
    clearSelection();
    
    if (onDataChange) {
      onDataChange();
    }
    
    handleConfirmClose();
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const isProcessing = (uuid: string) => processing.has(uuid);

  // ============================================
  // RENDU
  // ============================================
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
    <>
      {/* Modal de confirmation */}
      <ConfirmModal
        show={confirmAction.show}
        type={confirmAction.type}
        title={
          confirmAction.type === "delete" ? "Supprimer définitivement ?" :
          confirmAction.type === "block" ? "Bloquer l'annonce ?" :
          confirmAction.type === "unblock" ? "Débloquer l'annonce ?" :
          confirmAction.type === "validate" ? "Valider l'annonce ?" :
          confirmAction.type === "reject" ? "Rejeter l'annonce ?" :
          confirmAction.type === "publish" ? "Publier l'annonce ?" :
          confirmAction.type === "unpublish" ? "Dépublier l'annonce ?" :
          "Confirmer l'action"
        }
        message={
          confirmAction.type === "delete" ? 
            "Cette action est irréversible. Toutes les données associées seront définitivement effacées." :
          confirmAction.type === "block" ? 
            "L'annonce ne sera plus visible par les utilisateurs. Vous pourrez la débloquer ultérieurement." :
          confirmAction.type === "unblock" ? 
            "L'annonce sera de nouveau visible par tous les utilisateurs." :
          confirmAction.type === "validate" ? 
            "L'annonce sera approuvée et visible par tous les utilisateurs." :
          confirmAction.type === "reject" ? 
            "L'annonce sera rejetée et supprimée définitivement." :
          confirmAction.type === "publish" ? 
            "L'annonce sera publiée et visible par tous les utilisateurs." :
          confirmAction.type === "unpublish" ? 
            "L'annonce ne sera plus visible par les utilisateurs." :
          "Voulez-vous continuer ?"
        }
        confirmText={
          confirmAction.type === "delete" ? "Supprimer" :
          confirmAction.type === "block" ? "Bloquer" :
          confirmAction.type === "unblock" ? "Débloquer" :
          confirmAction.type === "validate" ? "Valider" :
          confirmAction.type === "reject" ? "Rejeter" :
          confirmAction.type === "publish" ? "Publier" :
          confirmAction.type === "unpublish" ? "Dépublier" :
          "Confirmer"
        }
        cancelText="Annuler"
        onConfirm={() => {
          if (confirmAction.bulk) {
            // Action en masse (sans validation/rejet)
            const action = confirmAction.type as "publish" | "unpublish" | "block" | "unblock" | "delete"  | "validate" | "reject";
            if (action === "validate" || action === "reject") {
              console.warn("Les actions de validation/rejet ne sont plus disponibles");
              handleConfirmClose();
              return;
            }
            handleBulkAction(action);
          } else if (confirmAction.uuid && confirmAction.itemType) {
            // Action individuelle (sans validation/rejet)
            switch (confirmAction.type) {
              case "delete":
                handleDelete(confirmAction.uuid, confirmAction.itemType);
                break;
              case "validate":
              case "reject":
                console.warn("Les actions de validation/rejet ne sont plus disponibles");
                handleConfirmClose();
                break;
              case "publish":
                handlePublish(confirmAction.uuid, confirmAction.itemType, true);
                break;
              case "unpublish":
                handlePublish(confirmAction.uuid, confirmAction.itemType, false);
                break;
              case "block":
                handleBlock(confirmAction.uuid, confirmAction.itemType, true);
                break;
              case "unblock":
                handleBlock(confirmAction.uuid, confirmAction.itemType, false);
                break;
            }
          }
        }}
        onCancel={handleConfirmClose}
        itemCount={confirmAction.count}
      />

      <div
        className={`bg-white rounded-3 border border-light overflow-hidden shadow-sm ${className}`}
      >
        {/* Barre d'actions en masse (sans validation/rejet) */}
        {selectedItems.size > 0 && (
          <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <span className="fw-medium text-dark">
                {selectedItems.size} élément(s) sélectionné(s)
              </span>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => showConfirm("publish", undefined, undefined, true)}
                  title="Publier la sélection"
                  disabled={processing.size > 0}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                  Publier
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => showConfirm("unpublish", undefined, undefined, true)}
                  title="Dépublier la sélection"
                  disabled={processing.size > 0}
                >
                  <FontAwesomeIcon icon={faCalendarXmark} className="me-1" />
                  Dépublier
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => showConfirm("block", undefined, undefined, true)}
                  title="Bloquer la sélection"
                  disabled={processing.size > 0}
                >
                  <FontAwesomeIcon icon={faLock} className="me-1" />
                  Bloquer
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => showConfirm("unblock", undefined, undefined, true)}
                  title="Débloquer la sélection"
                  disabled={processing.size > 0}
                >
                  <FontAwesomeIcon icon={faUnlock} className="me-1" />
                  Débloquer
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => showConfirm("delete", undefined, undefined, true)}
                  title="Supprimer définitivement la sélection"
                  disabled={processing.size > 0}
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
              disabled={processing.size > 0}
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
                    disabled={currentItems.length === 0 || processing.size > 0}
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
                const statusBadge = getStatusBadge(row);
                const isItemProcessing = isProcessing(row.uuid);
                const isSelected = selectedItems.has(row.uuid);
                const imageUrl = getImageUrl(row);

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
                        disabled={isItemProcessing}
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
                          src={imageUrl}
                          alt={row.title}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                          onError={(e) =>
                            handleImageError(e, row.title, row.uuid)
                          }
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
                            style={{ maxWidth: "200px" }}
                            title={row.description}
                          >
                            {row.description}
                          </p>
                        )}
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

                    <td className="px-3 py-3">
                      <span
                        className="badge rounded-pill d-inline-flex align-items-center gap-1"
                        style={{
                          backgroundColor: `${statusBadge.color}20`,
                          color: statusBadge.color,
                          fontSize: "0.7rem",
                          padding: "0.3rem 0.6rem",
                        }}
                      >
                        {statusBadge.icon && (
                          <FontAwesomeIcon icon={statusBadge.icon} size="xs" />
                        )}
                        {statusBadge.label}
                      </span>
                    </td>

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
                              onClick={() => showConfirm(row.estPublie ? "unpublish" : "publish", row.uuid, row.type)}
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
                              onClick={() => showConfirm(row.estBloque ? "unblock" : "block", row.uuid, row.type)}
                              title={row.estBloque ? "Débloquer" : "Bloquer"}
                              disabled={isItemProcessing}
                            >
                              <FontAwesomeIcon
                                icon={row.estBloque ? faUnlock : faLock}
                                size="xs"
                              />
                            </button>

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
                              onClick={() => showConfirm("delete", row.uuid, row.type)}
                              title="Supprimer définitivement"
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
    </>
  );
}