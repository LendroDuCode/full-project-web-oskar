"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import ViewModal from "../components/ViewModal";

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

  // États pour la modal de détails
  const [selectedAnnonce, setSelectedAnnonce] = useState<AnnonceData | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  // Fonction pour transformer les données selon le type
  const transformAnnonceData = (item: any, type: string): AnnonceData => {
    switch (type) {
      case "produit":
        return {
          uuid: item.uuid,
          title: item.libelle || item.nom || "Produit sans nom",
          description: item.description,
          image: item.image || `https://via.placeholder.com/64?text=P`,
          type: "produit" as const,
          status:
            item.statut?.toLowerCase() ||
            (item.estPublie ? "publie" : "en-attente"),
          date: item.createdAt || item.updatedAt || new Date().toISOString(),
          price: item.prix,
          quantity: item.quantite,
          estPublie: item.estPublie || false,
          estBloque: item.estBloque || item.est_bloque || false,
          seller: {
            name: item.vendeur?.nom || item.utilisateur?.nom || "Inconnu",
            avatar: item.vendeur?.avatar || item.utilisateur?.avatar,
            isPro: !!item.boutique?.nom || false,
            type: item.source?.type || "inconnu",
          },
          category: item.categorie?.libelle || item.categorie,
          originalData: item,
        };

      case "don":
        return {
          uuid: item.uuid,
          title: item.nom || item.titre || "Don sans nom",
          description: item.description,
          image: item.image || `https://via.placeholder.com/64?text=D`,
          type: "don" as const,
          status: item.statut?.toLowerCase() || "en-attente",
          date: item.date_debut || new Date().toISOString(),
          price: item.prix,
          quantity: item.quantite,
          estPublie: item.estPublie || false,
          estBloque: item.est_bloque || false,
          seller: {
            name:
              item.utilisateur ||
              item.vendeur ||
              item.nom_donataire ||
              "Donateur inconnu",
            type: item.utilisateur ? "utilisateur" : "vendeur",
          },
          category: item.categorie,
          originalData: item,
        };

      case "echange":
        return {
          uuid: item.uuid,
          title: item.nomElementEchange || item.titre || "Échange sans nom",
          description: item.description || item.message,
          image: item.image || `https://via.placeholder.com/64?text=E`,
          type: "echange" as const,
          status: item.statut?.toLowerCase() || "en-attente",
          date:
            item.dateProposition || item.createdAt || new Date().toISOString(),
          price: item.prix,
          quantity: item.quantite,
          estPublie: item.estPublie || false,
          estBloque: item.estBloque || false,
          seller: {
            name:
              item.utilisateur ||
              item.vendeur ||
              item.nom_initiateur ||
              "Initié par",
            type: item.typeDestinataire || "inconnu",
          },
          category: item.categorie,
          originalData: item,
        };

      default:
        return {
          uuid: item.uuid || Math.random().toString(),
          title: "Annonce sans nom",
          image: `https://via.placeholder.com/64?text=?`,
          type: "produit" as const,
          status: "inconnu",
          date: new Date().toISOString(),
          originalData: item,
        };
    }
  };

  // Charger les détails complets d'une annonce
  const fetchFullDetails = useCallback(async (annonce: AnnonceData) => {
    setDetailLoading(true);
    try {
      let endpoint = "";

      switch (annonce.type) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.DETAIL(annonce.uuid);
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.DETAIL(annonce.uuid);
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.DETAIL(annonce.uuid);
          break;
      }

      const response = await api.get(endpoint);
      setFullDetails(response.data || response);
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails:", err);
      // Utiliser les données de base si l'API échoue
      setFullDetails(annonce.originalData);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Gérer l'ouverture de la modal de détails
  const handleView = useCallback(
    async (uuid: string, type: string) => {
      const annonce = annonces.find((a) => a.uuid === uuid && a.type === type);
      if (annonce) {
        setSelectedAnnonce(annonce);
        setShowViewModal(true);
        await fetchFullDetails(annonce);
      }
    },
    [annonces, fetchFullDetails],
  );

  // Fermer la modal
  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedAnnonce(null);
    setFullDetails(null);
  }, []);

  // Charger les données selon le type et le statut
  const fetchData = useCallback(async (type: string, status: string) => {
    try {
      setLoading(true);
      setError(null);

      let data: any[] = [];

      // Si on veut les annonces bloquées
      if (status === "bloque") {
        setIsFetchingBlocked(true);

        switch (type) {
          case "tous":
            // Charger tous les types bloqués
            const [
              produitsBloquesResponse,
              donsBloquesResponse,
              echangesBloquesResponse,
            ] = await Promise.all([
              api.get(API_ENDPOINTS.PRODUCTS.USER_BLOCKED),
              api.get(API_ENDPOINTS.DONS.USER_BLOCKED),
              api.get(API_ENDPOINTS.ECHANGES.USER_BLOCKED),
            ]);

            // Extraire les données selon la structure de la réponse
            const produitsBloques =
              produitsBloquesResponse.data?.produits || produitsBloquesResponse;
            const donsBloques = donsBloquesResponse.data || donsBloquesResponse;
            const echangesBloques =
              echangesBloquesResponse.data || echangesBloquesResponse;

            data = [
              ...(Array.isArray(produitsBloques) ? produitsBloques : []).map(
                (item) => transformAnnonceData(item, "produit"),
              ),
              ...(Array.isArray(donsBloques) ? donsBloques : []).map((item) =>
                transformAnnonceData(item, "don"),
              ),
              ...(Array.isArray(echangesBloques) ? echangesBloques : []).map(
                (item) => transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produitsResponse = await api.get(
              API_ENDPOINTS.PRODUCTS.USER_BLOCKED,
            );
            const produitsData =
              produitsResponse.data?.produits || produitsResponse;
            data = (Array.isArray(produitsData) ? produitsData : []).map(
              (item) => transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const donsResponse = await api.get(API_ENDPOINTS.DONS.USER_BLOCKED);
            const donsData = donsResponse.data || donsResponse;
            data = (Array.isArray(donsData) ? donsData : []).map((item) =>
              transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echangesResponse = await api.get(
              API_ENDPOINTS.ECHANGES.USER_BLOCKED,
            );
            const echangesData = echangesResponse.data || echangesResponse;
            data = (Array.isArray(echangesData) ? echangesData : []).map(
              (item) => transformAnnonceData(item, "echange"),
            );
            break;
        }
        setIsFetchingBlocked(false);
      } else {
        // Charger les annonces publiées ou selon le statut
        switch (type) {
          case "tous":
            const [produitsResponse, donsResponse, echangesResponse] =
              await Promise.all([
                api.get(API_ENDPOINTS.PRODUCTS.PUBLISHED),
                api.get(API_ENDPOINTS.DONS.PUBLISHED),
                api.get(API_ENDPOINTS.ECHANGES.PUBLISHED),
              ]);

            data = [
              ...(Array.isArray(produitsResponse) ? produitsResponse : []).map(
                (item) => transformAnnonceData(item, "produit"),
              ),
              ...(Array.isArray(donsResponse) ? donsResponse : []).map((item) =>
                transformAnnonceData(item, "don"),
              ),
              ...(Array.isArray(echangesResponse) ? echangesResponse : []).map(
                (item) => transformAnnonceData(item, "echange"),
              ),
            ];
            break;

          case "produit":
            const produits = await api.get(API_ENDPOINTS.PRODUCTS.PUBLISHED);
            data = (Array.isArray(produits) ? produits : []).map((item) =>
              transformAnnonceData(item, "produit"),
            );
            break;

          case "don":
            const dons = await api.get(API_ENDPOINTS.DONS.PUBLISHED);
            data = (Array.isArray(dons) ? dons : []).map((item) =>
              transformAnnonceData(item, "don"),
            );
            break;

          case "echange":
            const echanges = await api.get(API_ENDPOINTS.ECHANGES.PUBLISHED);
            data = (Array.isArray(echanges) ? echanges : []).map((item) =>
              transformAnnonceData(item, "echange"),
            );
            break;
        }
      }

      // Filtrer par statut supplémentaire si nécessaire
      if (status !== "tous" && status !== "bloque") {
        data = data.filter((item) => {
          let itemStatus = item.status;
          if (item.estBloque) itemStatus = "bloque";
          if (item.estPublie && !item.estBloque) itemStatus = "publie";

          // Normaliser les statuts
          if (itemStatus === "en_attente") itemStatus = "en-attente";

          return itemStatus === status;
        });
      }

      setAnnonces(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError(
        err.message ||
          "Une erreur est survenue lors du chargement des annonces",
      );
      setAnnonces([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Actions
  const handleValidate = useCallback(
    async (uuid: string, type: string) => {
      try {
        console.log("Validation:", uuid, type);
        // Implémentez la logique de validation ici
        await fetchData(selectedType, selectedStatus);
      } catch (err) {
        console.error("Erreur lors de la validation:", err);
        alert("Erreur lors de la validation");
      }
    },
    [selectedType, selectedStatus, fetchData],
  );

  const handleReject = useCallback(
    async (uuid: string, type: string) => {
      try {
        console.log("Rejet:", uuid, type);
        // Implémentez la logique de rejet ici
        await fetchData(selectedType, selectedStatus);
      } catch (err) {
        console.error("Erreur lors du rejet:", err);
        alert("Erreur lors du rejet");
      }
    },
    [selectedType, selectedStatus, fetchData],
  );

  const handlePublish = useCallback(
    async (uuid: string, type: string, publish: boolean) => {
      try {
        console.log(
          `${publish ? "Publication" : "Dépublication"}:`,
          uuid,
          type,
        );
        // Implémentez la logique de publication/dépublication ici
        await fetchData(selectedType, selectedStatus);
      } catch (err) {
        console.error("Erreur lors de l'opération:", err);
        alert("Erreur lors de l'opération");
      }
    },
    [selectedType, selectedStatus, fetchData],
  );

  const handleBlock = useCallback(
    async (uuid: string, type: string, block: boolean) => {
      try {
        console.log(`${block ? "Blocage" : "Déblocage"}:`, uuid, type);
        // Implémentez la logique de blocage/déblocage ici
        await fetchData(selectedType, selectedStatus);
      } catch (err) {
        console.error("Erreur lors de l'opération:", err);
        alert("Erreur lors de l'opération");
      }
    },
    [selectedType, selectedStatus, fetchData],
  );

  const handleDelete = useCallback(
    async (uuid: string, type: string) => {
      try {
        console.log("Suppression:", uuid, type);
        // Implémentez la logique de suppression ici
        await fetchData(selectedType, selectedStatus);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression");
      }
    },
    [selectedType, selectedStatus, fetchData],
  );

  const handleBulkAction = useCallback(
    async (action: string, items: AnnonceData[]) => {
      try {
        // Pour l'exemple, on simule l'action
        console.log(`Action en masse "${action}" sur ${items.length} items`);

        // Ici, vous implémenteriez la vraie logique d'action en masse
        // Par exemple, pour chaque item :
        // await api.post(endpoint, { uuid: item.uuid, action });

        // Rafraîchir les données après l'action
        await fetchData(selectedType, selectedStatus);

        // Réinitialiser la sélection
        setSelectedItems(new Set());
      } catch (err) {
        console.error("Erreur lors de l'action en masse:", err);
        alert("Erreur lors de l'opération en masse");
      }
    },
    [selectedType, selectedStatus, fetchData],
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
              Liste des annonces
            </h1>
            <p className="text-muted small mb-0">
              {filteredAnnonces.length} annonce(s) trouvée(s)
              {selectedType !== "tous" && ` • Type: ${selectedType}`}
              {selectedStatus !== "tous" && ` • Statut: ${selectedStatus}`}
              {searchQuery && ` • Recherche: "${searchQuery}"`}
              {selectedStatus === "bloque" && " • (Annonces bloquées)"}
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
            onRefresh={handleRefresh}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onBulkAction={handleBulkAction}
            className="mb-4"
          />
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

      {/* Modal de détails */}
      <ViewModal
        show={showViewModal}
        onClose={handleCloseModal}
        annonce={selectedAnnonce}
        fullDetails={fullDetails}
        loading={detailLoading}
      />
    </div>
  );
}
