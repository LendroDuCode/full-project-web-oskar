"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import ViewModal from "../components/ViewModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

interface AnnonceData {
  uuid: string;
  title: string;
  description?: string;
  image: string;
  type: "produit" | "don" | "echange";
  status: string;
  date: string;
  price?: number | string | null;
  quantity?: number;
  estPublie?: boolean;
  estBloque?: boolean;
  seller?: {
    name: string;
    avatar?: string;
    isPro?: boolean;
    type?: string;
  };
  category?: string;
  originalData?: any;
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<AnnonceData[]>([]);
  const [filteredAnnonces, setFilteredAnnonces] = useState<AnnonceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("tous");
  const [selectedStatus, setSelectedStatus] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isFetchingBlocked, setIsFetchingBlocked] = useState(false);
  const [isVendeur, setIsVendeur] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState<{
    data: any;
    type: string;
  } | null>(null);

  // États pour le modal de confirmation de suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    uuid: string;
    type: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fonction pour transformer les données selon le type
  const transformAnnonceData = useCallback(
    (item: any, type: string): AnnonceData => {
      const baseData = {
        uuid: item.uuid,
        title:
          item.nom ||
          item.libelle ||
          item.titre ||
          item.nomElementEchange ||
          "Sans nom",
        description: item.description || item.message,
        image:
          item.image ||
          item.photo ||
          item.images?.[0] ||
          `https://via.placeholder.com/64?text=${type.charAt(0).toUpperCase()}`,
        type: type as "produit" | "don" | "echange",
        status: (item.statut || "").toLowerCase(),
        date:
          item.date_debut ||
          item.dateProposition ||
          item.createdAt ||
          item.updatedAt ||
          new Date().toISOString(),
        price: item.prix || null,
        quantity: item.quantite,
        estPublie: item.estPublie || false,
        estBloque: item.estBloque || item.est_bloque || false,
        category:
          item.categorie || item.categorie_uuid || item.nom || "Non catégorisé",
        originalData: item,
      };

      // Traitement spécifique selon le type
      switch (type) {
        case "produit":
          return {
            ...baseData,
            seller: {
              name: item.vendeur || "Vendeur",
              isPro: !!item.boutique || false,
              type: "vendeur",
              avatar: item.boutique?.logo,
            },
          };

        case "don":
          return {
            ...baseData,
            seller: {
              name: item.vendeur || item.utilisateur || "Donateur",
              type: item.vendeur ? "vendeur" : "utilisateur",
            },
          };

        case "echange":
          return {
            ...baseData,
            seller: {
              name:
                item.vendeur || item.utilisateur || item.agent || "Initiateur",
              type: item.typeDestinataire || "inconnu",
            },
          };

        default:
          return baseData;
      }
    },
    [],
  );

  // Fonction pour charger les données PUBLIÉES (non bloquées)
  const fetchPublishedData = useCallback(
    async (type: string) => {
      try {
        setLoading(true);
        let data: any[] = [];

        switch (type) {
          case "tous":
            const [produitsResponse, donsResponse, echangesResponse] =
              await Promise.all([
                api.get(API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS),
                api.get(API_ENDPOINTS.DONS.VENDEUR_DONS),
                api.get(API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES),
              ]);

            // Traiter les réponses selon leur format
            const produitsData =
              produitsResponse.data?.data ||
              produitsResponse.data ||
              produitsResponse;
            const donsData =
              donsResponse.data?.data || donsResponse.data || donsResponse;
            const echangesData =
              echangesResponse.data?.data ||
              echangesResponse.data ||
              echangesResponse;

            data = [
              ...(Array.isArray(produitsData) ? produitsData : []).map(
                (item: any) => transformAnnonceData(item, "produit"),
              ),
              ...(Array.isArray(donsData) ? donsData : []).map((item: any) =>
                transformAnnonceData(item, "don"),
              ),
              ...(Array.isArray(echangesData) ? echangesData : []).map(
                (item: any) => transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(
              API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS,
            );
            const produitsData2 =
              produits.data?.data || produits.data || produits;
            data = (Array.isArray(produitsData2) ? produitsData2 : []).map(
              (item: any) => transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.VENDEUR_DONS);
            const donsData2 = dons.data?.data || dons.data || dons;
            data = (Array.isArray(donsData2) ? donsData2 : []).map(
              (item: any) => transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(
              API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES,
            );
            const echangesData2 =
              echanges.data?.data || echanges.data || echanges;
            data = (Array.isArray(echangesData2) ? echangesData2 : []).map(
              (item: any) => transformAnnonceData(item, "echange"),
            );
            break;
        }

        // Filtrer pour n'avoir que les publiés (estPublie = true)
        data = data.filter((item) => item.estPublie === true);

        setAnnonces(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Une erreur est survenue lors du chargement des annonces",
        );
        setAnnonces([]);
      } finally {
        setLoading(false);
      }
    },
    [transformAnnonceData],
  );

  // Fonction pour charger les données BLOQUÉES
  const fetchBlockedData = useCallback(
    async (type: string) => {
      try {
        setLoading(true);
        setIsFetchingBlocked(true);
        let data: any[] = [];

        switch (type) {
          case "tous":
            const [produitsResponse, donsResponse, echangesResponse] =
              await Promise.all([
                api.get(API_ENDPOINTS.PRODUCTS.BLOCKED),
                api.get(API_ENDPOINTS.DONS.VENDEUR_BLOCKED),
                api.get(API_ENDPOINTS.ECHANGES.VENDEUR_BLOCKED),
              ]);

            const produitsData =
              produitsResponse.data?.data ||
              produitsResponse.data ||
              produitsResponse;
            const donsData =
              donsResponse.data?.data || donsResponse.data || donsResponse;
            const echangesData =
              echangesResponse.data?.data ||
              echangesResponse.data ||
              echangesResponse;

            data = [
              ...(Array.isArray(produitsData) ? produitsData : []).map(
                (item: any) => transformAnnonceData(item, "produit"),
              ),
              ...(Array.isArray(donsData) ? donsData : []).map((item: any) =>
                transformAnnonceData(item, "don"),
              ),
              ...(Array.isArray(echangesData) ? echangesData : []).map(
                (item: any) => transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(API_ENDPOINTS.PRODUCTS.BLOCKED);
            const produitsData2 =
              produits.data?.data || produits.data || produits;
            data = (Array.isArray(produitsData2) ? produitsData2 : []).map(
              (item: any) => transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.VENDEUR_BLOCKED);
            const donsData2 = dons.data?.data || dons.data || dons;
            data = (Array.isArray(donsData2) ? donsData2 : []).map(
              (item: any) => transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(
              API_ENDPOINTS.ECHANGES.VENDEUR_BLOCKED,
            );
            const echangesData2 =
              echanges.data?.data || echanges.data || echanges;
            data = (Array.isArray(echangesData2) ? echangesData2 : []).map(
              (item: any) => transformAnnonceData(item, "echange"),
            );
            break;
        }

        setAnnonces(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des annonces bloquées:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Une erreur est survenue lors du chargement des annonces bloquées",
        );
        setAnnonces([]);
      } finally {
        setLoading(false);
        setIsFetchingBlocked(false);
      }
    },
    [transformAnnonceData],
  );

  // Fonction pour charger toutes les données (filtrées par statut)
  const fetchData = useCallback(
    async (type: string, status: string) => {
      if (status === "bloque") {
        await fetchBlockedData(type);
      } else {
        await fetchPublishedData(type);

        // Filtrer par statut supplémentaire si nécessaire
        if (status !== "tous") {
          setAnnonces((prev) => {
            const filtered = prev.filter((item) => {
              let itemStatus = item.status;

              // Normaliser les statuts
              if (itemStatus === "en_attente") itemStatus = "en-attente";
              if (itemStatus === "publie") itemStatus = "publie";
              if (itemStatus === "disponible") itemStatus = "disponible";
              if (itemStatus === "valide") itemStatus = "valide";
              if (itemStatus === "refuse") itemStatus = "refuse";

              return itemStatus === status;
            });
            return filtered;
          });
        }
      }
    },
    [fetchPublishedData, fetchBlockedData],
  );

  // Effet pour charger les données quand les filtres changent
  useEffect(() => {
    fetchData(selectedType, selectedStatus);
  }, [selectedType, selectedStatus, fetchData]);

  // Filtrer par recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = annonces.filter((item) => {
        const title = item.title.toLowerCase();
        const description = item.description?.toLowerCase() || "";
        const sellerName = item.seller?.name?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";

        return (
          title.includes(query) ||
          description.includes(query) ||
          sellerName.includes(query) ||
          category.includes(query)
        );
      });
      setFilteredAnnonces(filtered);
    } else {
      setFilteredAnnonces(annonces);
    }
  }, [annonces, searchQuery]);

  // Actions spécifiques pour vendeur
  const handlePublish = useCallback(
    async (uuid: string, type: string, publish: boolean) => {
      try {
        setError(null);
        const endpoint = getPublishEndpoint(type, uuid, publish);

        if (!endpoint) {
          throw new Error(`Endpoint non défini pour le type: ${type}`);
        }

        await api.post(endpoint);

        // Mise à jour optimiste de l'UI
        setAnnonces((prev) =>
          prev.map((item) =>
            item.uuid === uuid ? { ...item, estPublie: publish } : item,
          ),
        );
      } catch (err: any) {
        console.error("Erreur lors de la publication:", err);
        setError(err.response?.data?.message || "Erreur lors de l'opération");
        alert(err.response?.data?.message || "Erreur lors de l'opération");
      }
    },
    [],
  );

  const handleBlock = useCallback(
    async (uuid: string, type: string, block: boolean) => {
      try {
        setError(null);
        const endpoint = getBlockEndpoint(type, uuid, block);

        if (!endpoint) {
          throw new Error(`Endpoint non défini pour le type: ${type}`);
        }

        await api.post(endpoint);

        // Mise à jour optimiste de l'UI
        setAnnonces((prev) =>
          prev.map((item) =>
            item.uuid === uuid ? { ...item, estBloque: block } : item,
          ),
        );
      } catch (err: any) {
        console.error("Erreur lors du blocage:", err);
        setError(err.response?.data?.message || "Erreur lors de l'opération");
        alert(err.response?.data?.message || "Erreur lors de l'opération");
      }
    },
    [],
  );

  // Nouvelle fonction pour ouvrir le modal de confirmation de suppression
  const openDeleteModal = useCallback(
    (uuid: string, type: string, title: string) => {
      setItemToDelete({ uuid, type, title });
      setDeleteModalOpen(true);
    },
    [],
  );

  // Fonction pour confirmer la suppression
  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      const endpoint = getDeleteEndpoint(itemToDelete.type, itemToDelete.uuid);

      if (!endpoint) {
        throw new Error(
          `Endpoint non défini pour le type: ${itemToDelete.type}`,
        );
      }

      await api.delete(endpoint);

      // Mise à jour optimiste de l'UI
      setAnnonces((prev) =>
        prev.filter((item) => item.uuid !== itemToDelete.uuid),
      );
      setFilteredAnnonces((prev) =>
        prev.filter((item) => item.uuid !== itemToDelete.uuid),
      );

      // Fermer le modal
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete]);

  // Annuler la suppression
  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  const handleDelete = useCallback(
    (uuid: string, type: string) => {
      // Trouver l'annonce pour obtenir le titre
      const annonce = annonces.find((item) => item.uuid === uuid);
      openDeleteModal(uuid, type, annonce?.title || "cette annonce");
    },
    [annonces, openDeleteModal],
  );

  const handleValidate = useCallback(async (uuid: string, type: string) => {
    try {
      console.log("Validation pour vendeur:", uuid, type);
      alert("Fonctionnalité de validation non implémentée pour les vendeurs");
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      alert("Erreur lors de la validation");
    }
  }, []);

  const handleReject = useCallback(async (uuid: string, type: string) => {
    try {
      console.log("Rejet pour vendeur:", uuid, type);
      alert("Fonctionnalité de rejet non implémentée pour les vendeurs");
    } catch (err) {
      console.error("Erreur lors du rejet:", err);
      alert("Erreur lors du rejet");
    }
  }, []);

  const handleView = useCallback(
    (uuid: string, type: string) => {
      // Trouver l'annonce sélectionnée
      const annonce = filteredAnnonces.find((item) => item.uuid === uuid);
      if (annonce && annonce.originalData) {
        setSelectedAnnonce({
          data: annonce.originalData,
          type,
        });
        setViewModalOpen(true);
      }
    },
    [filteredAnnonces],
  );

  const handleEdit = useCallback((uuid: string, type: string) => {
    console.log("Édition pour vendeur:", uuid, type);
    alert("Fonctionnalité d'édition non implémentée pour les vendeurs");
  }, []);

  // Helper functions pour les endpoints
  const getPublishEndpoint = (
    type: string,
    uuid: string,
    publish: boolean,
  ): string => {
    if (publish) {
      switch (type) {
        case "produit":
          return API_ENDPOINTS.PRODUCTS.PUBLLIER;
        case "don":
          return API_ENDPOINTS.DONS.PUBLISH;
        case "echange":
          return API_ENDPOINTS.ECHANGES.PUBLISH;
        default:
          return "";
      }
    } else {
      // Pour dépublication, utiliser l'endpoint d'update avec estPublie = false
      switch (type) {
        case "produit":
          return API_ENDPOINTS.PRODUCTS.UPDATE_STOCK_PRODUIT(uuid);
        case "don":
          return API_ENDPOINTS.DONS.UPDATE_STOCK_DON(uuid);
        case "echange":
          return API_ENDPOINTS.ECHANGES.UPDATE_STOCK_VENDEUR(uuid);
        default:
          return "";
      }
    }
  };

  const getBlockEndpoint = (
    type: string,
    uuid: string,
    block: boolean,
  ): string => {
    if (block) {
      switch (type) {
        case "produit":
          return API_ENDPOINTS.PRODUCTS.BLOCK(uuid);
        case "don":
          return API_ENDPOINTS.DONS.UPDATE_STOCK_DON(uuid);
        case "echange":
          return API_ENDPOINTS.ECHANGES.UPDATE_STOCK_VENDEUR(uuid);
        default:
          return "";
      }
    } else {
      switch (type) {
        case "produit":
          return API_ENDPOINTS.PRODUCTS.UNBLOCK(uuid);
        case "don":
          return API_ENDPOINTS.DONS.UPDATE_STOCK_DON(uuid);
        case "echange":
          return API_ENDPOINTS.ECHANGES.UPDATE_STOCK_VENDEUR(uuid);
        default:
          return "";
      }
    }
  };

  const getDeleteEndpoint = (type: string, uuid: string): string => {
    switch (type) {
      case "produit":
        return API_ENDPOINTS.PRODUCTS.DELETE(uuid);
      case "don":
        return API_ENDPOINTS.DONS.DELETE(uuid);
      case "echange":
        return API_ENDPOINTS.ECHANGES.DELETE(uuid);
      default:
        return "";
    }
  };

  const handleBulkAction = useCallback(
    async (action: string, items: AnnonceData[]) => {
      try {
        console.log(
          `Action en masse "${action}" sur ${items.length} items pour vendeur`,
        );

        // Implémenter les actions en masse
        for (const item of items) {
          switch (action) {
            case "publish":
              await handlePublish(item.uuid, item.type, true);
              break;
            case "unpublish":
              await handlePublish(item.uuid, item.type, false);
              break;
            case "block":
              await handleBlock(item.uuid, item.type, true);
              break;
            case "unblock":
              await handleBlock(item.uuid, item.type, false);
              break;
            case "delete":
              await handleDelete(item.uuid, item.type);
              break;
          }
        }

        // Réinitialiser la sélection
        setSelectedItems(new Set());
      } catch (err) {
        console.error("Erreur lors de l'action en masse:", err);
        alert("Erreur lors de l'opération en masse");
      }
    },
    [handlePublish, handleBlock, handleDelete],
  );

  const handleClearFilters = useCallback(() => {
    setSelectedType("tous");
    setSelectedStatus("tous");
    setSearchQuery("");
    setSelectedItems(new Set());
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(selectedType, selectedStatus);
  }, [selectedType, selectedStatus, fetchData]);

  // Indicateur de chargement combiné
  const isLoading = loading || isFetchingBlocked;

  return (
    <div
      className="container-fluid px-0"
      style={{ minHeight: "100vh", backgroundColor: colors.oskar.lightGrey }}
    >
      {/* Barre de filtres */}
      <FilterBar
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        loading={isLoading}
        totalItems={filteredAnnonces.length}
        onClearFilters={handleClearFilters}
        selectedCount={selectedItems.size}
      />

      {/* Contenu principal */}
      <div className="container-fluid px-4 py-4">
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h4 fw-bold mb-2"
              style={{ color: colors.oskar.black }}
            >
              {isVendeur ? "Mes annonces" : "Liste des annonces"}
            </h1>
            <p className="text-muted small mb-0">
              {filteredAnnonces.length} annonce(s) trouvée(s)
              {selectedType !== "tous" && ` • Type: ${selectedType}`}
              {selectedStatus !== "tous" && ` • Statut: ${selectedStatus}`}
              {searchQuery && ` • Recherche: "${searchQuery}"`}
              {selectedStatus === "bloque" && " • (Annonces bloquées)"}
              {isVendeur && " • (Vue vendeur)"}
            </p>
          </div>

          <div className="d-flex gap-2">
            {(selectedType !== "tous" ||
              selectedStatus !== "tous" ||
              searchQuery) && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleClearFilters}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Tableau ou état vide */}
        {filteredAnnonces.length > 0 ? (
          <>
            <DataTable
              data={filteredAnnonces}
              loading={isLoading}
              error={error}
              onValidate={handleValidate}
              onReject={handleReject}
              onPublish={handlePublish}
              onBlock={handleBlock}
              onDelete={handleDelete}
              onView={handleView}
              onEdit={handleEdit}
              onRefresh={handleRefresh}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onBulkAction={handleBulkAction}
              className="mb-4"
            />

            {/* Modal de visualisation */}
            {selectedAnnonce && (
              <ViewModal
                isOpen={viewModalOpen}
                onClose={() => {
                  setViewModalOpen(false);
                  setSelectedAnnonce(null);
                }}
                annonce={selectedAnnonce.data}
                type={selectedAnnonce.type as "produit" | "don" | "echange"}
                onValidate={handleValidate}
                onReject={handleReject}
                onPublish={handlePublish}
                onBlock={handleBlock}
                onDelete={handleDelete}
              />
            )}

            {/* Modal de confirmation de suppression */}
            <DeleteConfirmModal
              isOpen={deleteModalOpen}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
              itemTitle={itemToDelete?.title || ""}
              itemType={itemToDelete?.type || ""}
              isDeleting={isDeleting}
            />
          </>
        ) : (
          <EmptyState
            title={isLoading ? "Chargement..." : "Aucune annonce trouvée"}
            description={
              searchQuery ||
              selectedStatus !== "tous" ||
              selectedType !== "tous"
                ? "Aucune annonce ne correspond à vos critères de recherche."
                : "Aucune annonce n'a été publiée pour le moment."
            }
            searchQuery={searchQuery}
            showResetButton={
              selectedStatus !== "tous" ||
              selectedType !== "tous" ||
              searchQuery !== ""
            }
            onReset={handleClearFilters}
          />
        )}
      </div>
    </div>
  );
}
