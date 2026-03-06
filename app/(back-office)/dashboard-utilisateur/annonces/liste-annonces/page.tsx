"use client";

import { useState, useEffect, useCallback } from "react";
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
  estPublie?: boolean; // Rendre optionnel pour correspondre à AnnonceItem
  estBloque?: boolean; // Rendre optionnel pour correspondre à AnnonceItem
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

  // ✅ Fonction pour extraire les items (gère tous les formats)
  const extractItems = (response: any): any[] => {
    if (!response) return [];
    
    // Si c'est déjà un tableau
    if (Array.isArray(response)) return response;
    
    // Format: { status: "success", data: { produits: [...] } }
    if (response.data?.produits && Array.isArray(response.data.produits)) 
      return response.data.produits;
    
    // Format: { data: { dons: [...] } }
    if (response.data?.dons && Array.isArray(response.data.dons)) 
      return response.data.dons;
    
    // Format: { data: { echanges: [...] } }
    if (response.data?.echanges && Array.isArray(response.data.echanges)) 
      return response.data.echanges;
    
    // Format: { data: [...] }
    if (response.data && Array.isArray(response.data)) 
      return response.data;
    
    // Format: { produits: [...] }
    if (response.produits && Array.isArray(response.produits)) 
      return response.produits;
    
    // Format: { dons: [...] }
    if (response.dons && Array.isArray(response.dons)) 
      return response.dons;
    
    // Format: { echanges: [...] }
    if (response.echanges && Array.isArray(response.echanges)) 
      return response.echanges;
    
    return [];
  };

  // ✅ Fonction de transformation adaptée à toutes les structures
  const transformAnnonceData = (item: any, type: string): AnnonceData => {
    // Extraire l'UUID
    const uuid = item.uuid || item.id?.toString() || "";

    // Extraire le titre selon le type
    let title = "";
    switch (type) {
      case "produit":
        title = item.libelle || item.nom || item.titre || "Produit sans nom";
        break;
      case "don":
        title = item.nom || item.titre || "Don sans nom";
        break;
      case "echange":
        title = item.nomElementEchange || item.titre || "Échange sans nom";
        break;
      default:
        title = item.titre || item.nom || item.libelle || "Annonce sans nom";
    }

    // Extraire la description
    const description = item.description || item.message || "";

    // Extraire l'image
    const image = item.image || item.image_key || item.avatar || "";

    // Extraire le prix
    let price = null;
    if (item.prix) price = item.prix;
    else if (item.price) price = item.price;

    // Extraire la quantité
    let quantity = 1;
    if (item.quantite) quantity = Number(item.quantite);
    else if (item.quantity) quantity = Number(item.quantity);

    // Déterminer le statut de publication et blocage
    const estPublie = 
      item.estPublie === true || 
      item.publie === true || 
      item.published === true || 
      false;

    const estBloque = 
      item.est_bloque === true || 
      item.estBloque === true || 
      item.bloque === true || 
      item.blocked === true || 
      false;

    // Déterminer le statut général
    let status = "en-attente";
    if (estBloque) status = "bloque";
    else if (estPublie) status = "publie";
    else if (item.statut) status = item.statut.toLowerCase();

    // Extraire la date
    const date = 
      item.dateProposition || 
      item.date_debut || 
      item.createdAt || 
      item.created_at || 
      item.updatedAt || 
      item.updated_at || 
      new Date().toISOString();

    // Extraire la catégorie
    let category = "Non catégorisé";
    if (item.categorie) {
      if (typeof item.categorie === "string") category = item.categorie;
      else if (item.categorie.libelle) category = item.categorie.libelle;
      else if (item.categorie.nom) category = item.categorie.nom;
    }

    return {
      uuid,
      title: String(title),
      description: String(description),
      image: String(image),
      type: type as any,
      status,
      date: String(date),
      price,
      quantity,
      estPublie,
      estBloque,
      category,
      originalData: item,
    };
  };

  // ✅ Charger les détails complets d'une annonce
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
      setFullDetails(annonce.originalData);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ✅ Gérer l'ouverture de la modal de détails
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

  // ✅ Fermer la modal
  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedAnnonce(null);
    setFullDetails(null);
  }, []);

  // ✅ Charger les données selon le type et le statut
  const fetchData = useCallback(async (type: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsFetchingBlocked(status === "bloque");

      let allItems: AnnonceData[] = [];

      // Charger selon le type et le statut
      if (type === "tous") {
        // Déterminer les endpoints à utiliser selon le statut
        let produitsEndpoint, donsEndpoint, echangesEndpoint;
        
        if (status === "publie") {
          produitsEndpoint = API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_UTILISATEUR;
          donsEndpoint = API_ENDPOINTS.DONS.LISTE_DONS_PUBLIE_UTILISATEUR;
          echangesEndpoint = API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_UTILISATEUR;
        } else if (status === "bloque") {
          produitsEndpoint = API_ENDPOINTS.PRODUCTS.USER_BLOCKED;
          donsEndpoint = API_ENDPOINTS.DONS.USER_BLOCKED;
          echangesEndpoint = API_ENDPOINTS.ECHANGES.USER_BLOCKED;
        } else {
          // "tous" ou "en-attente" - utiliser les endpoints génériques
          produitsEndpoint = API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_UTILISATEUR;
          donsEndpoint = API_ENDPOINTS.DONS.USER_DONS;
          echangesEndpoint = API_ENDPOINTS.ECHANGES.USER_ECHANGES;
        }

        const promises = [
          api.get(produitsEndpoint).catch(err => {
            console.warn("Erreur chargement produits:", err);
            return null;
          }),
          api.get(donsEndpoint).catch(err => {
            console.warn("Erreur chargement dons:", err);
            return null;
          }),
          api.get(echangesEndpoint).catch(err => {
            console.warn("Erreur chargement échanges:", err);
            return null;
          }),
        ];

        const [produitsRes, donsRes, echangesRes] = await Promise.all(promises);

        // Log pour déboguer
        console.log("📦 Réponse produits:", produitsRes);
        console.log("📦 Réponse dons:", donsRes);
        console.log("📦 Réponse échanges:", echangesRes);

        if (produitsRes) {
          const produitsItems = extractItems(produitsRes);
          console.log(`📊 Produits extraits: ${produitsItems.length}`);
          allItems.push(...produitsItems.map((item: any) => transformAnnonceData(item, "produit")));
        }

        if (donsRes) {
          const donsItems = extractItems(donsRes);
          console.log(`📊 Dons extraits: ${donsItems.length}`);
          allItems.push(...donsItems.map((item: any) => transformAnnonceData(item, "don")));
        }

        if (echangesRes) {
          const echangesItems = extractItems(echangesRes);
          console.log(`📊 Échanges extraits: ${echangesItems.length}`);
          allItems.push(...echangesItems.map((item: any) => transformAnnonceData(item, "echange")));
        }

        console.log(`📊 Total items: ${allItems.length}`);

        // Si on est en "en-attente", filtrer côté client
        if (status === "en-attente") {
          allItems = allItems.filter(item => 
            !item.estPublie && !item.estBloque
          );
        }
      } else {
        // Type spécifique
        let endpoint;
        
        if (status === "publie") {
          if (type === "produit") endpoint = API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_UTILISATEUR;
          else if (type === "don") endpoint = API_ENDPOINTS.DONS.LISTE_DONS_PUBLIE_UTILISATEUR;
          else if (type === "echange") endpoint = API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_UTILISATEUR;
        } else if (status === "bloque") {
          if (type === "produit") endpoint = API_ENDPOINTS.PRODUCTS.USER_BLOCKED;
          else if (type === "don") endpoint = API_ENDPOINTS.DONS.USER_BLOCKED;
          else if (type === "echange") endpoint = API_ENDPOINTS.ECHANGES.USER_BLOCKED;
        } else {
          // "tous" ou "en-attente"
          if (type === "produit") endpoint = API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_UTILISATEUR;
          else if (type === "don") endpoint = API_ENDPOINTS.DONS.USER_DONS;
          else if (type === "echange") endpoint = API_ENDPOINTS.ECHANGES.USER_ECHANGES;
        }

        if (!endpoint) {
          throw new Error(`Endpoint non trouvé pour type: ${type}, statut: ${status}`);
        }

        console.log(`🌐 Appel API ${type} (${status}):`, endpoint);
        const response = await api.get(endpoint).catch(err => {
          console.warn(`Erreur chargement ${type}:`, err);
          return null;
        });
        
        if (response) {
          console.log(`📦 Réponse ${type}:`, response);
          const items = extractItems(response);
          console.log(`📊 Items extraits ${type}: ${items.length}`);
          allItems = items.map((item: any) => transformAnnonceData(item, type));

          // Si on est en "en-attente", filtrer côté client
          if (status === "en-attente") {
            allItems = allItems.filter(item => 
              !item.estPublie && !item.estBloque
            );
          }
        }
      }

      console.log("📊 Total final:", allItems.length);
      setAnnonces(allItems);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des données:", err);
      setError(err.message || "Une erreur est survenue");
      setAnnonces([]);
    } finally {
      setLoading(false);
      setIsFetchingBlocked(false);
    }
  }, []);

  // ✅ Effet pour charger les données quand les filtres changent
  useEffect(() => {
    fetchData(selectedType, selectedStatus);
  }, [selectedType, selectedStatus, fetchData]);

  // ✅ Filtrer par recherche
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = annonces.filter((item) => {
        const title = item.title.toLowerCase();
        const description = item.description?.toLowerCase() || "";
        const category = item.category?.toLowerCase() || "";

        return (
          title.includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
      setFilteredAnnonces(filtered);
    } else {
      setFilteredAnnonces(annonces);
    }
  }, [annonces, searchQuery]);

  // ✅ Actions
  const handleValidate = useCallback(
    async (uuid: string, type: string) => {
      try {
        console.log("Validation:", uuid, type);
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
        console.log(`${publish ? "Publication" : "Dépublication"}:`, uuid, type);
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
        console.log(`Action en masse "${action}" sur ${items.length} items`);
        
        // Exécuter l'action sur chaque élément
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
              Liste des annonces
            </h1>
            <p className="text-muted small mb-0">
              {filteredAnnonces.length} annonce(s) trouvée(s)
              {selectedType !== "tous" && ` • Type: ${selectedType}`}
              {selectedStatus !== "tous" && ` • Statut: ${selectedStatus}`}
              {searchQuery && ` • Recherche: "${searchQuery}"`}
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