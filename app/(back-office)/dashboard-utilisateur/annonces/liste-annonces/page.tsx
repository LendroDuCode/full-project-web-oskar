"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import ViewModal from "../components/ViewModal";
import CustomAlert from "../components/CustomAlert";
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
  category?: string;
  originalData?: any;
  createurUuid?: string;
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<AnnonceData[]>([]);
  const [filteredAnnonces, setFilteredAnnonces] = useState<AnnonceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("tous");
  const [selectedStatus, setSelectedStatus] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isFetchingBlocked, setIsFetchingBlocked] = useState(false);
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // États pour la modal de détails
  const [selectedAnnonce, setSelectedAnnonce] = useState<AnnonceData | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  // États pour la modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    uuid: string;
    type: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Récupérer l'UUID de l'utilisateur connecté
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userStr = localStorage.getItem("oskar_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.uuid) setUserUuid(user.uuid);
          if (user.email) setUserEmail(user.email);
          console.log("👤 Utilisateur connecté:", { uuid: user.uuid, email: user.email });
        }
      } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", err);
      }
    };
    getUserInfo();
  }, []);

  // ✅ Fonction pour extraire les items (gère tous les formats)
  const extractItems = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.data?.produits && Array.isArray(response.data.produits)) return response.data.produits;
    if (response.data?.dons && Array.isArray(response.data.dons)) return response.data.dons;
    if (response.data?.echanges && Array.isArray(response.data.echanges)) return response.data.echanges;
    if (response.produits && Array.isArray(response.produits)) return response.produits;
    if (response.dons && Array.isArray(response.dons)) return response.dons;
    if (response.echanges && Array.isArray(response.echanges)) return response.echanges;
    return [];
  };

  // ✅ Vérifier si une annonce appartient à l'utilisateur connecté
  const isOwnAnnonce = (item: any, type: string): boolean => {
    if (!userUuid && !userEmail) return true;

    switch (type) {
      case "produit":
        if (item.utilisateurUuid && item.utilisateurUuid === userUuid) return true;
        if (item.utilisateur?.uuid && item.utilisateur.uuid === userUuid) return true;
        if (item.createur?.uuid && item.createur.uuid === userUuid) return true;
        if (item.createurDetails?.uuid && item.createurDetails.uuid === userUuid) return true;
        if (item.utilisateur?.email && item.utilisateur.email === userEmail) return true;
        if (item.createur?.email && item.createur.email === userEmail) return true;
        if (item.createurDetails?.email && item.createurDetails.email === userEmail) return true;
        break;

      case "don":
        if (item.utilisateurUuid && item.utilisateurUuid === userUuid) return true;
        if (item.utilisateur?.uuid && item.utilisateur.uuid === userUuid) return true;
        if (item.createur?.uuid && item.createur.uuid === userUuid) return true;
        if (item.createurDetails?.uuid && item.createurDetails.uuid === userUuid) return true;
        if (item.utilisateur?.email && item.utilisateur.email === userEmail) return true;
        if (item.createur?.email && item.createur.email === userEmail) return true;
        if (item.createurDetails?.email && item.createurDetails.email === userEmail) return true;
        break;

      case "echange":
        if (item.utilisateurUuid && item.utilisateurUuid === userUuid) return true;
        if (item.utilisateur?.uuid && item.utilisateur.uuid === userUuid) return true;
        if (item.createur?.uuid && item.createur.uuid === userUuid) return true;
        if (item.createurDetails?.uuid && item.createurDetails.uuid === userUuid) return true;
        if (item.utilisateur?.email && item.utilisateur.email === userEmail) return true;
        if (item.createur?.email && item.createur.email === userEmail) return true;
        if (item.createurDetails?.email && item.createurDetails.email === userEmail) return true;
        break;
    }

    return false;
  };

  // ✅ Fonction de transformation adaptée à toutes les structures
  const transformAnnonceData = (item: any, type: string): AnnonceData | null => {
    // Filtrer les annonces qui n'appartiennent pas à l'utilisateur
    if (!isOwnAnnonce(item, type)) {
      console.log(`🚫 Annonce ignorée (pas pour l'utilisateur): ${item.uuid} (${type})`);
      return null;
    }

    const uuid = item.uuid || item.id?.toString() || "";

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

    const description = item.description || item.message || "";
    const image = item.image || item.image_key || item.avatar || "";

    let price = null;
    if (item.prix) price = item.prix;
    else if (item.price) price = item.price;

    let quantity = 1;
    if (item.quantite) quantity = Number(item.quantite);
    else if (item.quantity) quantity = Number(item.quantity);

    // ✅ Détection robuste du statut bloqué
    let estBloque = false;
    if (item.est_bloque === true || item.estBloque === true) {
      estBloque = true;
    } else if (item.statut && typeof item.statut === 'string') {
      const statutLower = item.statut.toLowerCase();
      if (statutLower.includes('bloque') || statutLower.includes('bloqué')) {
        estBloque = true;
      }
    }

    // ✅ Détection robuste du statut publié
    let estPublie = false;
    if (item.estPublie === true || item.est_public === 1) {
      estPublie = true;
    } else if (item.statut && typeof item.statut === 'string') {
      const statutLower = item.statut.toLowerCase();
      if (statutLower.includes('publie') || statutLower.includes('publié')) {
        estPublie = true;
      }
    }

    // ✅ Déterminer le statut général
    let status = "en-attente"; // Par défaut
    
    if (estBloque) {
      status = "bloque";
    } else if (estPublie) {
      status = "publie";
    } else if (item.statut && typeof item.statut === 'string') {
      const statutLower = item.statut.toLowerCase();
      if (statutLower.includes('en-attente') || 
          statutLower.includes('en_attente') || 
          statutLower.includes('attente')) {
        status = "en-attente";
      } else {
        status = statutLower;
      }
    }

    const date = 
      item.dateProposition || 
      item.date_debut || 
      item.createdAt || 
      item.created_at || 
      item.updatedAt || 
      item.updated_at || 
      new Date().toISOString();

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
      createurUuid: userUuid || undefined,
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

  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedAnnonce(null);
    setFullDetails(null);
  }, []);

  // ✅ Ouvrir le modal de confirmation de suppression
  const openDeleteModal = useCallback(
    (uuid: string, type: string, title: string) => {
      setItemToDelete({ uuid, type, title });
      setShowDeleteModal(true);
    },
    [],
  );

  // ✅ Annuler la suppression
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // ✅ Confirmer la suppression
  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      let endpoint = "";
      switch (itemToDelete.type) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.DELETE(itemToDelete.uuid);
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.DELETE(itemToDelete.uuid);
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.DELETE(itemToDelete.uuid);
          break;
      }
      if (endpoint) {
        await api.delete(endpoint);
        setSuccessMessage("Annonce supprimée avec succès");
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchData(selectedType, selectedStatus);
      }
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, selectedType, selectedStatus]);

  // ✅ CHARGER LES DONNÉES
  const fetchData = useCallback(async (type: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsFetchingBlocked(status === "bloque");

      let allItems: AnnonceData[] = [];

      console.log(`🔍 Chargement: type=${type}, status=${status}`);

      if (type === "tous") {
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
          // Pour "en-attente" et "tous", on utilise les endpoints génériques
          produitsEndpoint = API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_UTILISATEUR;
          donsEndpoint = API_ENDPOINTS.DONS.USER_DONS;
          echangesEndpoint = API_ENDPOINTS.ECHANGES.USER_ECHANGES;
        }

        console.log("📡 Endpoints:", { produitsEndpoint, donsEndpoint, echangesEndpoint });

        const promises = [
          api.get(produitsEndpoint).catch(err => { console.warn("Erreur produits:", err); return null; }),
          api.get(donsEndpoint).catch(err => { console.warn("Erreur dons:", err); return null; }),
          api.get(echangesEndpoint).catch(err => { console.warn("Erreur échanges:", err); return null; }),
        ];

        const [produitsRes, donsRes, echangesRes] = await Promise.all(promises);

        if (produitsRes) {
          const produitsItems = extractItems(produitsRes);
          const produitsTransformes = produitsItems
            .map((item: any) => transformAnnonceData(item, "produit"))
            .filter((item): item is AnnonceData => item !== null);
          allItems.push(...produitsTransformes);
        }

        if (donsRes) {
          const donsItems = extractItems(donsRes);
          const donsTransformes = donsItems
            .map((item: any) => transformAnnonceData(item, "don"))
            .filter((item): item is AnnonceData => item !== null);
          allItems.push(...donsTransformes);
        }

        if (echangesRes) {
          const echangesItems = extractItems(echangesRes);
          const echangesTransformes = echangesItems
            .map((item: any) => transformAnnonceData(item, "echange"))
            .filter((item): item is AnnonceData => item !== null);
          allItems.push(...echangesTransformes);
        }

        console.log(`📊 Total après filtrage utilisateur: ${allItems.length}`);

        // ✅ SI STATUT "EN-ATTENTE", FILTRER PAR RAPPORT AU STATUT CALCULÉ
        if (status === "en-attente") {
          allItems = allItems.filter(item => 
            item.status === "en-attente" || 
            (!item.estPublie && !item.estBloque && item.status?.includes("attente"))
          );
          console.log(`📊 Après filtrage en-attente: ${allItems.length}`);
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
          const items = extractItems(response);
          const itemsTransformes = items
            .map((item: any) => transformAnnonceData(item, type))
            .filter((item): item is AnnonceData => item !== null);
          allItems = itemsTransformes;

          // ✅ SI STATUT "EN-ATTENTE", FILTRER PAR RAPPORT AU STATUT CALCULÉ
          if (status === "en-attente") {
            allItems = allItems.filter(item => 
              item.status === "en-attente" || 
              (!item.estPublie && !item.estBloque && item.status?.includes("attente"))
            );
            console.log(`📊 Après filtrage en-attente: ${allItems.length}`);
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
  }, [transformAnnonceData]);

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

  // ✅ Supprimer (appelé depuis DataTable)
  const handleDelete = useCallback(
    (uuid: string, type: string) => {
      const annonce = annonces.find((a) => a.uuid === uuid && a.type === type);
      openDeleteModal(uuid, type, annonce?.title || "cette annonce");
    },
    [annonces, openDeleteModal],
  );

  // ✅ Actions en masse (simplifiées - seulement suppression)
  const handleBulkAction = useCallback(
    async (action: string, items: AnnonceData[]) => {
      try {
        if (action !== "delete") {
          setError("Cette action n'est pas disponible pour les utilisateurs");
          setTimeout(() => setError(null), 3000);
          return;
        }

        if (items.length === 1) {
          // Si un seul élément, utiliser la modal normale
          handleDelete(items[0].uuid, items[0].type);
        } else {
          // Si plusieurs, confirmation
          if (!confirm(`Voulez-vous vraiment supprimer ${items.length} annonces ?`)) return;
          
          for (const item of items) {
            let endpoint = "";
            switch (item.type) {
              case "produit":
                endpoint = API_ENDPOINTS.PRODUCTS.DELETE(item.uuid);
                break;
              case "don":
                endpoint = API_ENDPOINTS.DONS.DELETE(item.uuid);
                break;
              case "echange":
                endpoint = API_ENDPOINTS.ECHANGES.DELETE(item.uuid);
                break;
            }
            if (endpoint) {
              await api.delete(endpoint);
            }
          }
          setSuccessMessage(`${items.length} annonce(s) supprimée(s) avec succès`);
          setTimeout(() => setSuccessMessage(null), 3000);
          await fetchData(selectedType, selectedStatus);
          setSelectedItems(new Set());
        }
      } catch (err: any) {
        console.error("Erreur lors de l'action en masse:", err);
        setError(err.response?.data?.message || "Erreur lors de l'opération");
        setTimeout(() => setError(null), 5000);
      }
    },
    [handleDelete, fetchData, selectedType, selectedStatus],
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
      {/* Alertes flottantes */}
      {error && (
        <CustomAlert
          type="danger"
          title="Erreur"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMessage && (
        <CustomAlert
          type="success"
          title="Succès"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

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
            <h1 className="h4 fw-bold mb-2" style={{ color: colors.oskar.black }}>
              Mes annonces
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

        {filteredAnnonces.length > 0 ? (
          <DataTable
            data={filteredAnnonces}
            loading={isLoading}
            error={error}
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
                : "Vous n'avez pas encore créé d'annonce."
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

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemTitle={itemToDelete?.title || ""}
        itemType={itemToDelete?.type || ""}
        isDeleting={isDeleting}
      />

      {/* Modal de visualisation */}
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