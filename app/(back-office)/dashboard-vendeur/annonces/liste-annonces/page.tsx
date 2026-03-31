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
import EditDonModal from "../components/EditDonModal";
import EditProduitModal from "../components/EditProduitModal";
import EditEchangeModal from "../components/EditEchangeModal";

interface AnnonceData {
  uuid: string;
  title: string;
  description?: string;
  image: string;
  type: "produit" | "don" | "echange";
  status: string;
  date: string;
  publicationDate?: string | null;
  price?: number | string | null;
  quantity?: number;
  estPublie?: boolean;
  estBloque?: boolean;
  seller?: {
    name: string;
    avatar?: string;
    isPro?: boolean;
    type?: string;
    boutique?: string;
  };
  category?: string;
  originalData?: any;
}

// Fonction pour extraire la date de publication correcte
const getPublicationDate = (item: any, type: string): string | null => {
  if (type === "produit" && item.publierLe) {
    return item.publierLe;
  }
  if (type === "don" && item.publierLe) {
    return item.publierLe;
  }
  if (type === "echange" && item.publieLe) {
    return item.publieLe;
  }
  if (item.dateCreation) {
    return item.dateCreation;
  }
  if (item.createdAt) {
    return item.createdAt;
  }
  return null;
};

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

  // États pour les modals d'édition
  const [editProduitModalOpen, setEditProduitModalOpen] = useState(false);
  const [editDonModalOpen, setEditDonModalOpen] = useState(false);
  const [editEchangeModalOpen, setEditEchangeModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [selectedDon, setSelectedDon] = useState<any>(null);
  const [selectedEchange, setSelectedEchange] = useState<any>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    uuid: string;
    type: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const transformAnnonceData = useCallback(
    (item: any, type: string): AnnonceData => {
      let estBloque = false;
      
      if (item.estBloque === true || item.est_bloque === true) {
        estBloque = true;
      } else if (item.statut && typeof item.statut === 'string') {
        const statutLower = item.statut.toLowerCase();
        if (statutLower.includes('bloque') || statutLower.includes('bloqué')) {
          estBloque = true;
        }
      }

      let estPublie = false;
      if (item.estPublie === true) {
        estPublie = true;
      } else if (item.statut && typeof item.statut === 'string') {
        const statutLower = item.statut.toLowerCase();
        if (statutLower.includes('publie') || statutLower.includes('publié')) {
          estPublie = true;
        }
      }

      const publicationDate = getPublicationDate(item, type);

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
          item.image_key ||
          item.photo ||
          `https://via.placeholder.com/64?text=${type.charAt(0).toUpperCase()}`,
        type: type as "produit" | "don" | "echange",
        status: (item.statut || "").toLowerCase(),
        date: publicationDate || item.dateCreation || item.createdAt || new Date().toISOString(),
        publicationDate: publicationDate,
        price: item.prix || null,
        quantity: item.quantite,
        estPublie: estPublie,
        estBloque: estBloque,
        category:
          typeof item.categorie === "string"
            ? item.categorie
            : item.categorie?.libelle ||
              item.categorie?.nom ||
              "Non catégorisé",
        originalData: item,
      };

      switch (type) {
        case "produit":
          return {
            ...baseData,
            seller: {
              name: item.vendeur?.nom || item.createur?.nom || "Vendeur",
              isPro: !!item.boutique || false,
              type: "vendeur",
              avatar: item.boutique?.logo || item.vendeur?.avatar,
              boutique: item.boutique?.nom,
            },
          };
        case "don":
          return {
            ...baseData,
            seller: {
              name: item.vendeur?.nom || item.createur?.nom || "Donateur",
              type: "vendeur",
            },
          };
        case "echange":
          return {
            ...baseData,
            seller: {
              name: item.vendeur?.nom || item.createur?.nom || "Initiateur",
              type: "vendeur",
            },
          };
        default:
          return baseData;
      }
    },
    [],
  );

  const extractItems = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.data?.produits && Array.isArray(response.data.produits))
      return response.data.produits;
    if (response.data?.dons && Array.isArray(response.data.dons))
      return response.data.dons;
    if (response.data?.echanges && Array.isArray(response.data.echanges))
      return response.data.echanges;
    if (response.produits && Array.isArray(response.produits))
      return response.produits;
    if (response.dons && Array.isArray(response.dons)) return response.dons;
    if (response.echanges && Array.isArray(response.echanges))
      return response.echanges;
    return [];
  };

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

            const produitsData = extractItems(produitsResponse);
            const donsData = extractItems(donsResponse);
            const echangesData = extractItems(echangesResponse);

            data = [
              ...produitsData.map((item: any) =>
                transformAnnonceData(item, "produit"),
              ),
              ...donsData.map((item: any) =>
                transformAnnonceData(item, "don"),
              ),
              ...echangesData.map((item: any) =>
                transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS);
            const produitsData2 = extractItems(produits);
            data = produitsData2.map((item: any) =>
              transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.VENDEUR_DONS);
            const donsData2 = extractItems(dons);
            data = donsData2.map((item: any) =>
              transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES);
            const echangesData2 = extractItems(echanges);
            data = echangesData2.map((item: any) =>
              transformAnnonceData(item, "echange"),
            );
            break;
        }

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

            const produitsData = extractItems(produitsResponse);
            const donsData = extractItems(donsResponse);
            const echangesData = extractItems(echangesResponse);

            data = [
              ...produitsData.map((item: any) =>
                transformAnnonceData(item, "produit"),
              ),
              ...donsData.map((item: any) =>
                transformAnnonceData(item, "don"),
              ),
              ...echangesData.map((item: any) =>
                transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(API_ENDPOINTS.PRODUCTS.BLOCKED);
            const produitsData2 = extractItems(produits);
            data = produitsData2.map((item: any) =>
              transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.VENDEUR_BLOCKED);
            const donsData2 = extractItems(dons);
            data = donsData2.map((item: any) =>
              transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(API_ENDPOINTS.ECHANGES.VENDEUR_BLOCKED);
            const echangesData2 = extractItems(echanges);
            data = echangesData2.map((item: any) =>
              transformAnnonceData(item, "echange"),
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

  const fetchPublishedSpecificData = useCallback(
    async (type: string) => {
      try {
        setLoading(true);
        let data: any[] = [];

        switch (type) {
          case "tous":
            const [produitsResponse, donsResponse, echangesResponse] =
              await Promise.all([
                api.get(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_VENDEUR),
                api.get(API_ENDPOINTS.DONS.LISTE_DON_PUBLIE_VENDEUR),
                api.get(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_VENDEUR),
              ]);

            const produitsData = Array.isArray(produitsResponse) ? produitsResponse : [];
            const donsData = Array.isArray(donsResponse) ? donsResponse : [];
            const echangesData = Array.isArray(echangesResponse) ? echangesResponse : [];

            data = [
              ...produitsData.map((item: any) =>
                transformAnnonceData(item, "produit"),
              ),
              ...donsData.map((item: any) =>
                transformAnnonceData(item, "don"),
              ),
              ...echangesData.map((item: any) =>
                transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_VENDEUR);
            const produitsData2 = Array.isArray(produits) ? produits : [];
            data = produitsData2.map((item: any) =>
              transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.LISTE_DON_PUBLIE_VENDEUR);
            const donsData2 = Array.isArray(dons) ? dons : [];
            data = donsData2.map((item: any) =>
              transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_VENDEUR);
            const echangesData2 = Array.isArray(echanges) ? echanges : [];
            data = echangesData2.map((item: any) =>
              transformAnnonceData(item, "echange"),
            );
            break;
        }

        setAnnonces(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des annonces publiées:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Une erreur est survenue lors du chargement des annonces publiées",
        );
        setAnnonces([]);
      } finally {
        setLoading(false);
      }
    },
    [transformAnnonceData],
  );

  const fetchData = useCallback(
    async (type: string, status: string) => {
      if (status === "bloque") {
        await fetchBlockedData(type);
      } else if (status === "publie") {
        await fetchPublishedSpecificData(type);
      } else if (status === "en-attente") {
        await fetchPublishedData(type);
        setAnnonces((prev) => {
          const filtered = prev.filter(
            (item) =>
              !item.estPublie && 
              !item.estBloque && 
              !item.status?.includes('publie') &&
              !item.status?.includes('bloque')
          );
          return filtered;
        });
      } else {
        await fetchPublishedData(type);
      }
    },
    [fetchPublishedData, fetchBlockedData, fetchPublishedSpecificData],
  );

  useEffect(() => {
    fetchData(selectedType, selectedStatus);
  }, [selectedType, selectedStatus, fetchData]);

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

  // ✅ FONCTION DE BLOCAGE CORRIGÉE avec les bons endpoints
  const handleBlock = useCallback(
    async (uuid: string, type: string, block: boolean) => {
      try {
        setError(null);
        
        let endpoint = "";
        let payload: any = {};
        
        if (block) {
          // Bloquer
          switch (type) {
            case "produit":
              endpoint = API_ENDPOINTS.PRODUCTS.BLOCK(uuid);
              payload = {};
              break;
            case "don":
              endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
              payload = { donUuid: uuid, est_bloque: true };
              break;
            case "echange":
              endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
              payload = { echangeUuid: uuid, est_bloque: true };
              break;
            default:
              throw new Error(`Type non supporté: ${type}`);
          }
        } else {
          // Débloquer
          switch (type) {
            case "produit":
              endpoint = API_ENDPOINTS.PRODUCTS.UNBLOCK(uuid);
              payload = {};
              break;
            case "don":
              endpoint = API_ENDPOINTS.DONS.BLOQUE_DON;
              payload = { donUuid: uuid, est_bloque: false };
              break;
            case "echange":
              endpoint = API_ENDPOINTS.ECHANGES.BLOQUER_ECHNAGE;
              payload = { echangeUuid: uuid, est_bloque: false };
              break;
            default:
              throw new Error(`Type non supporté: ${type}`);
          }
        }

        console.log(`📡 ${block ? 'Blocage' : 'Déblocage'} - Type: ${type}, UUID: ${uuid}`);
        
        await api.post(endpoint, payload);

        // Mise à jour optimiste de l'UI
        setAnnonces((prev) =>
          prev.map((item) =>
            item.uuid === uuid ? { ...item, estBloque: block } : item,
          ),
        );

        // Rafraîchir les données
        await fetchData(selectedType, selectedStatus);
        
      } catch (err: any) {
        console.error("❌ Erreur lors du blocage:", err);
        setError(err.response?.data?.message || "Erreur lors de l'opération");
        alert(err.response?.data?.message || "Erreur lors de l'opération");
      }
    },
    [fetchData, selectedType, selectedStatus],
  );

  // ✅ FONCTION D'ÉDITION
  const handleEdit = useCallback((uuid: string, type: string, item: any) => {
    console.log(`✏️ Édition - Type: ${type}, UUID: ${uuid}`);
    
    switch (type) {
      case "produit":
        setSelectedProduit(item.originalData);
        setEditProduitModalOpen(true);
        break;
      case "don":
        setSelectedDon(item.originalData);
        setEditDonModalOpen(true);
        break;
      case "echange":
        setSelectedEchange(item.originalData);
        setEditEchangeModalOpen(true);
        break;
    }
  }, []);

  // ✅ Callback après modification réussie
  const handleEditSuccess = useCallback((message: string) => {
    console.log("✅ Modification réussie:", message);
    fetchData(selectedType, selectedStatus);
  }, [fetchData, selectedType, selectedStatus]);

  const openDeleteModal = useCallback(
    (uuid: string, type: string, title: string) => {
      setItemToDelete({ uuid, type, title });
      setDeleteModalOpen(true);
    },
    [],
  );

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

      setAnnonces((prev) =>
        prev.filter((item) => item.uuid !== itemToDelete.uuid),
      );
      setFilteredAnnonces((prev) =>
        prev.filter((item) => item.uuid !== itemToDelete.uuid),
      );

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

  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  const handleDelete = useCallback(
    (uuid: string, type: string) => {
      const annonce = annonces.find((item) => item.uuid === uuid);
      openDeleteModal(uuid, type, annonce?.title || "cette annonce");
    },
    [annonces, openDeleteModal],
  );

  const handleValidate = useCallback(async (uuid: string, type: string) => {
    console.log("Validation pour vendeur:", uuid, type);
    alert("Cette fonctionnalité n'est pas disponible pour les vendeurs");
  }, []);

  const handleReject = useCallback(async (uuid: string, type: string) => {
    console.log("Rejet pour vendeur:", uuid, type);
    alert("Cette fonctionnalité n'est pas disponible pour les vendeurs");
  }, []);

  const handleView = useCallback(
    (uuid: string, type: string) => {
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

        for (const item of items) {
          switch (action) {
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

        setSelectedItems(new Set());
      } catch (err) {
        console.error("Erreur lors de l'action en masse:", err);
        alert("Erreur lors de l'opération en masse");
      }
    },
    [handleBlock, handleDelete],
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

  const isLoading = loading || isFetchingBlocked;

  return (
    <div
      className="container-fluid px-0"
      style={{ minHeight: "100vh", backgroundColor: colors.oskar.lightGrey }}
    >
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

      <div className="container-fluid px-4 py-4">
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

        {filteredAnnonces.length > 0 ? (
          <>
            <DataTable
              data={filteredAnnonces}
              loading={isLoading}
              error={error}
              onValidate={handleValidate}
              onReject={handleReject}
              onBlock={handleBlock}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={handleView}
              onRefresh={handleRefresh}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onBulkAction={handleBulkAction}
              className="mb-4"
            />

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
                onBlock={handleBlock}
                onDelete={handleDelete}
              />
            )}

            <DeleteConfirmModal
              isOpen={deleteModalOpen}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
              itemTitle={itemToDelete?.title || ""}
              itemType={itemToDelete?.type || ""}
              isDeleting={isDeleting}
            />

            {/* Modals d'édition */}
            {editProduitModalOpen && selectedProduit && (
              <EditProduitModal
                isOpen={editProduitModalOpen}
                produit={selectedProduit}
                createdAt={selectedProduit.dateCreation}
                onClose={() => {
                  setEditProduitModalOpen(false);
                  setSelectedProduit(null);
                }}
                onSuccess={handleEditSuccess}
              />
            )}

            {editDonModalOpen && selectedDon && (
              <EditDonModal
                isOpen={editDonModalOpen}
                don={selectedDon}
                onClose={() => {
                  setEditDonModalOpen(false);
                  setSelectedDon(null);
                }}
                onSuccess={() => {
                  handleEditSuccess("Don modifié avec succès");
                  setEditDonModalOpen(false);
                  setSelectedDon(null);
                }}
              />
            )}

            {editEchangeModalOpen && selectedEchange && (
              <EditEchangeModal
                isOpen={editEchangeModalOpen}
                echange={selectedEchange}
                onClose={() => {
                  setEditEchangeModalOpen(false);
                  setSelectedEchange(null);
                }}
                onSuccess={() => {
                  handleEditSuccess("Échange modifié avec succès");
                  setEditEchangeModalOpen(false);
                  setSelectedEchange(null);
                }}
              />
            )}
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