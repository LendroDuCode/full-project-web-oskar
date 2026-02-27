// app/(front-office)/mes-favoris/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import FilterBar from "./components/FilterBar";
import DataTable from "./components/DataTable";
import { FavoriItem, FavorisResponse } from "./type/favoris";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faHeart,
  faGift,
  faArrowRightArrowLeft,
  faFilterCircleXmark,
  faStar,
  faTrash,
  faEye,
  faPlus,
  faTimes,
  faExternalLinkAlt,
  faFileExport,
  faSpinner,
  faUser,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import EmptyState from "./components/EmptyState";
import ViewModal from "../annonces/components/ViewModal";
import colors from "@/app/shared/constants/colors";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // Déjà une URL complète
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    if (imagePath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return imagePath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return imagePath;
  }

  // Chemin avec %2F
  if (imagePath.includes("%2F")) {
    return `${apiUrl}${filesUrl}/${imagePath}`;
  }

  // Chemin simple
  return `${apiUrl}${filesUrl}/${imagePath}`;
};

export default function MesFavorisPage() {
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
  const [filteredFavoris, setFilteredFavoris] = useState<FavoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // États pour la modal de détails
  const [selectedFavori, setSelectedFavori] = useState<{
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
  } | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  // ✅ Transformer un FavoriItem en AnnonceData pour la modal
  const transformFavoriToAnnonce = useCallback((favori: FavoriItem) => {
    let annonceData: any = {
      uuid: favori.itemUuid, // Utiliser itemUuid, pas favori.uuid
      type: favori.type as "produit" | "don" | "echange",
      date: favori.createdAt,
    };

    switch (favori.type) {
      case "produit":
        const produit = favori.produit;
        if (!produit) return null;

        annonceData = {
          ...annonceData,
          title: produit.libelle || produit.libelle || "Produit sans nom",
          description: produit.description,
          image: produit.image
            ? buildImageUrl(produit.image)
            : `https://via.placeholder.com/64?text=P`,
          status:
            produit.statut?.toLowerCase() ||
            (produit.estPublie ? "publie" : "en-attente"),
          price: produit.prix,
          quantity: produit.quantite || 1,
          estPublie: produit.estPublie,
          estBloque: produit.estBloque,
          seller: {
            name: produit.vendeur
              ? `${produit.vendeur.prenoms || ""} ${produit.vendeur.nom || ""}`.trim()
              : produit.createur
                ? `${produit.createur.prenoms || ""} ${produit.createur.nom || ""}`.trim()
                : "Vendeur inconnu",
            avatar: produit.vendeur?.avatar || produit.createur?.avatar,
            isPro: !!produit.vendeur,
            type: produit.vendeur ? "vendeur" : "utilisateur",
          },
          category: produit.categorie?.libelle,
          originalData: produit,
        };
        break;

      case "don":
        const don = favori.don;
        if (!don) return null;

        annonceData = {
          ...annonceData,
          title: don.nom || don.titre || "Don sans nom",
          description: don.description,
          image: don.image
            ? buildImageUrl(don.image)
            : `https://via.placeholder.com/64?text=D`,
          status: don.statut?.toLowerCase() || "en-attente",
          price: don.prix,
          quantity: don.quantite || 1,
          estPublie: don.estPublie,
          estBloque: don.est_bloque,
          seller: {
            name: don.createur
              ? `${don.createur.prenoms || ""} ${don.createur.nom || ""}`.trim()
              : don.createur
                ? `${don.createur || ""} ${don.createur || ""}`.trim()
                : don.nom_donataire || "Donateur inconnu",
            avatar: don.createur?.avatar || don.createur?.avatar,
            isPro: !!don.createur,
            type: don.createur ? "vendeur" : "utilisateur",
          },
          category: don.categorie,
          originalData: don,
        };
        break;

      case "echange":
        const echange = favori.echange;
        if (!echange) return null;

        annonceData = {
          ...annonceData,
          title: echange.nomElementEchange || "Échange sans nom",
          description:
            echange.message || echange.message || echange.nomElementEchange,
          image: echange.image
            ? buildImageUrl(echange.image)
            : `https://via.placeholder.com/64?text=E`,
          status: echange.statut?.toLowerCase() || "en-attente",
          price: echange.prix,
          quantity: echange.quantite || 1,
          estPublie: echange.estPublie,
          estBloque: echange.estBloque,
          seller: {
            name: echange.createur
              ? `${echange.createur.prenoms || ""} ${echange.createur.nom || ""}`.trim()
              : echange.createur
                ? `${echange.createur || ""} ${echange.createur || ""}`.trim()
                : echange.nom_initiateur || "Initiateur inconnu",
            avatar: echange.createur?.avatar || echange.createur?.avatar,
            isPro: !!echange.createur,
            type: echange.createur ? "vendeur" : "utilisateur",
          },
          category: echange.categorie,
          originalData: echange,
        };
        break;
    }

    return annonceData;
  }, []);

  // ✅ Charger les détails complets d'un favori
  const fetchFullDetails = useCallback(async (favori: FavoriItem) => {
    setDetailLoading(true);
    try {
      let endpoint = "";

      switch (favori.type) {
        case "produit":
          endpoint = API_ENDPOINTS.PRODUCTS.DETAIL(favori.itemUuid);
          break;
        case "don":
          endpoint = API_ENDPOINTS.DONS.DETAIL(favori.itemUuid);
          break;
        case "echange":
          endpoint = API_ENDPOINTS.ECHANGES.DETAIL(favori.itemUuid);
          break;
      }

      const response = await api.get(endpoint);
      setFullDetails(response.data || response);
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails:", err);
      // Utiliser les données de base si l'API échoue
      setFullDetails(favori[favori.type as keyof FavoriItem]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ✅ Gérer l'ouverture de la modal de détails
  const handleView = useCallback(
    async (uuid: string, type: string, itemUuid: string) => {
      const favori = favoris.find((f) => f.uuid === uuid && f.type === type);
      if (favori) {
        const annonceData = transformFavoriToAnnonce(favori);
        if (annonceData) {
          setSelectedFavori(annonceData);
          setShowViewModal(true);
          await fetchFullDetails(favori);
        }
      }
    },
    [favoris, transformFavoriToAnnonce, fetchFullDetails],
  );

  // ✅ Fermer la modal
  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedFavori(null);
    setFullDetails(null);
  }, []);

  // ✅ Charger les favoris - UTILISATION DIRECTE DE L'API (VERSION CORRIGÉE)
  const fetchUserFavoris = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Chargement des favoris avec l'endpoint générique...");

      // Utiliser l'endpoint générique /favoris
      const response = await api.get<any>(API_ENDPOINTS.FAVORIS.LIST);
      console.log("✅ Réponse reçue:", response);

      // Extraire les données selon la structure de votre API
      let favorisData: FavoriItem[] = [];

      // CAS 1: La réponse a une propriété 'data' qui contient le tableau
      if (response?.data && Array.isArray(response.data)) {
        favorisData = response.data;
      }
      // CAS 2: La réponse elle-même est un tableau
      else if (Array.isArray(response)) {
        favorisData = response;
      }
      // CAS 3: La réponse a une structure { data: [...] }
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        favorisData = response.data.data;
      }
      // CAS 4: La réponse a une structure avec statusCode et data
      else if (
        response?.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        Array.isArray(response.data.data)
      ) {
        favorisData = response.data.data;
      }
      // CAS 5: La réponse est directement l'objet avec data
      else if (
        response?.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data)
      ) {
        favorisData = response.data;
      }

      console.log(
        `📊 ${favorisData.length} favori(s) trouvé(s) directement depuis l'API`,
      );

      // Filtrer pour ne garder que les favoris avec des données valides
      const validFavoris = favorisData.filter((item) => {
        // Vérifier que l'item a les propriétés minimales
        if (!item || typeof item !== "object") return false;

        // Vérifier selon le type
        if (item.type === "produit" && !item.produit) return false;
        if (item.type === "don" && !item.don) return false;
        if (item.type === "echange" && !item.echange) return false;

        return true;
      });

      // Trier par date (plus récents d'abord)
      const sortedFavoris = validFavoris.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      console.log(`✅ ${sortedFavoris.length} favori(s) valide(s) chargé(s)`);
      setFavoris(sortedFavoris);
      setError(null);

      if (sortedFavoris.length === 0) {
        setError("Vous n'avez pas encore de favoris");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des favoris:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors du chargement des favoris",
      );
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Filtrer les favoris
  useEffect(() => {
    let filtered = favoris;

    // Filtre par type
    if (selectedType !== "tous") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        // Récupérer les détails selon le type
        let title = "";
        let description = "";
        let category = "";

        switch (item.type) {
          case "produit":
            title = item.produit?.libelle || item.produit?.libelle || "";
            description = item.produit?.description || "";
            category = item.produit?.categorie?.libelle || "";
            break;
          case "don":
            title = item.don?.nom || item.don?.titre || "";
            description = item.don?.description || "";
            category = item.don?.categorie || "";
            break;
          case "echange":
            title = item.echange?.nomElementEchange || "";
            description = item.echange?.message || item.echange?.message || "";
            category = item.echange?.categorie || "";
            break;
        }

        return (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        );
      });
    }

    setFilteredFavoris(filtered);
    // Réinitialiser la sélection quand les données changent
    setSelectedItems([]);
    setShowBatchActions(false);
  }, [favoris, selectedType, searchQuery]);

  // ✅ Gérer la sélection multiple
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allUuids = filteredFavoris.map((item) => item.uuid);
        setSelectedItems(allUuids);
        setShowBatchActions(true);
      } else {
        setSelectedItems([]);
        setShowBatchActions(false);
      }
    },
    [filteredFavoris],
  );

  const handleSelectItem = useCallback((uuid: string, checked: boolean) => {
    setSelectedItems((prev) => {
      let newItems;
      if (checked) {
        if (!prev.includes(uuid)) {
          newItems = [...prev, uuid];
        } else {
          newItems = prev;
        }
      } else {
        newItems = prev.filter((id) => id !== uuid);
      }

      // Afficher/masquer les actions groupées
      if (newItems.length > 0) {
        setShowBatchActions(true);
      } else {
        setShowBatchActions(false);
      }

      return newItems;
    });
  }, []);

  // ✅ Retirer un favori - CORRIGÉ : utiliser l'ID du favori
  const handleRemoveFavorite = useCallback(
    async (uuid: string, type: string, itemUuid: string) => {
      try {
        console.log(`🗑️ Retrait du favori ${uuid} (${type})`);

        // Utiliser l'ID du favori pour la suppression
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(uuid));

        // Mise à jour optimiste de l'état
        setFavoris((prev) => prev.filter((f) => f.uuid !== uuid));

        alert("L'élément a été retiré de vos favoris avec succès");
      } catch (err: any) {
        console.error("❌ Erreur lors du retrait du favori:", err);
        alert(
          err.response?.data?.message || "Erreur lors du retrait du favori",
        );

        // En cas d'erreur, recharger pour être sûr
        await fetchUserFavoris();
      }
    },
    [fetchUserFavoris],
  );

  // ✅ Retirer plusieurs favoris
  const handleBatchRemove = useCallback(async () => {
    if (selectedItems.length === 0) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir retirer ${selectedItems.length} élément(s) de vos favoris ?`,
      )
    ) {
      return;
    }

    try {
      // Supprimer tous les favoris sélectionnés en utilisant leurs UUIDs
      const promises = selectedItems.map((uuid) =>
        api.delete(API_ENDPOINTS.FAVORIS.REMOVE(uuid)),
      );

      await Promise.all(promises);

      // Mise à jour optimiste de l'état
      const selectedSet = new Set(selectedItems);
      setFavoris((prev) => prev.filter((f) => !selectedSet.has(f.uuid)));

      // Réinitialiser la sélection
      setSelectedItems([]);
      setShowBatchActions(false);

      alert(
        `${selectedItems.length} élément(s) ont été retirés de vos favoris avec succès`,
      );
    } catch (err: any) {
      console.error("❌ Erreur lors du retrait groupé:", err);
      alert(
        err.response?.data?.message || "Erreur lors du retrait des favoris",
      );

      // En cas d'erreur, recharger
      await fetchUserFavoris();
    }
  }, [selectedItems, fetchUserFavoris]);

  // ✅ Exporter la sélection
  const handleExportSelection = useCallback(() => {
    const selectedFavoris = filteredFavoris.filter((item) =>
      selectedItems.includes(item.uuid),
    );

    const exportData = {
      dateExport: new Date().toISOString(),
      type: "favoris-utilisateur",
      nombreElements: selectedFavoris.length,
      favoris: selectedFavoris.map((favori) => {
        let titre = "";
        switch (favori.type) {
          case "produit":
            titre =
              favori.produit?.libelle ||
              favori.produit?.libelle ||
              "Produit sans nom";
            break;
          case "don":
            titre = favori.don?.nom || favori.don?.titre || "Don sans nom";
            break;
          case "echange":
            titre = favori.echange?.nomElementEchange || "Échange sans nom";
            break;
        }
        return {
          uuid: favori.uuid,
          type: favori.type,
          titre,
          itemUuid: favori.itemUuid,
          dateAjout: favori.createdAt,
          url: `${window.location.origin}/${favori.type}s/${favori.itemUuid}`,
        };
      }),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mes-favoris-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    alert(`${selectedFavoris.length} favori(s) exporté(s) avec succès !`);
  }, [selectedItems, filteredFavoris]);

  const handleClearFilters = useCallback(() => {
    setSelectedType("tous");
    setSearchQuery("");
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedItems([]);
    setShowBatchActions(false);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchUserFavoris();
  }, [fetchUserFavoris]);

  // ✅ Charger au montage
  useEffect(() => {
    fetchUserFavoris();
  }, [fetchUserFavoris]);

  // ✅ Statistiques
  const stats = useMemo(() => {
    const total = favoris.length;
    const produits = favoris.filter((f) => f.type === "produit").length;
    const dons = favoris.filter((f) => f.type === "don").length;
    const echanges = favoris.filter((f) => f.type === "echange").length;

    return { total, produits, dons, echanges };
  }, [favoris]);

  // ✅ Fonction pour naviguer vers le catalogue
  const navigateToMarketplace = useCallback(() => {
    window.location.href = "/boutique";
  }, []);

  // ✅ Ouvrir tous les éléments sélectionnés dans de nouveaux onglets
  const handleOpenAllSelected = useCallback(() => {
    const selectedFavoris = filteredFavoris.filter((item) =>
      selectedItems.includes(item.uuid),
    );

    selectedFavoris.forEach((favori) => {
      window.open(`/${favori.type}s/${favori.itemUuid}`, "_blank");
    });

    alert(
      `${selectedFavoris.length} élément(s) ouvert(s) dans de nouveaux onglets`,
    );
  }, [selectedItems, filteredFavoris]);

  return (
    <div className="container-fluid px-0 min-vh-100 bg-light">
      {/* En-tête de page */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-danger fs-4"
                  />
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1 text-dark">Mes Favoris</h1>
                  <p className="text-muted mb-0">
                    Retrouvez et gérez tous vos contenus préférés en un seul
                    endroit
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 mt-3 mt-lg-0">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faHeart} />
                  )}
                  {loading ? "Chargement..." : "Actualiser"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={navigateToMarketplace}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Explorer
                </button>
              </div>
            </div>
          </div>

          {/* Badge indicateur utilisateur */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-info text-white px-3 py-2 rounded-pill">
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  Mes favoris
                </span>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                  <FontAwesomeIcon icon={faHeart} className="me-1" />
                  {stats.total} favori(s) trouvé(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions groupées */}
      {showBatchActions && (
        <div className="bg-primary bg-opacity-10 border-bottom border-primary">
          <div className="container-fluid py-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary rounded-circle p-2">
                  <FontAwesomeIcon icon={faStar} className="text-white" />
                </div>
                <div>
                  <h6 className="mb-0 fw-semibold text-dark">
                    {selectedItems.length} élément(s) sélectionné(s)
                  </h6>
                  <p className="text-muted mb-0 small">
                    Actions disponibles sur la sélection
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                  onClick={handleOpenAllSelected}
                  title="Ouvrir tous les éléments sélectionnés"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                  Ouvrir tout
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
                  onClick={handleExportSelection}
                  title="Exporter la sélection"
                >
                  <FontAwesomeIcon icon={faFileExport} />
                  Exporter
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  onClick={handleBatchRemove}
                  title="Supprimer la sélection"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Supprimer
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handleClearSelection}
                  title="Annuler la sélection"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de filtres */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-3">
          <FilterBar
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            loading={loading}
            totalItems={filteredFavoris.length}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container-fluid py-5">
        <div className="row">
          {/* Colonne de statistiques */}
          <div className="col-lg-3 mb-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom pb-3">
                  <h5 className="fw-semibold mb-0 d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faFilterCircleXmark} />
                    Vue d'ensemble
                  </h5>
                </div>
                <div className="card-body">
                  {/* Statistiques */}
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-3 border border-light shadow-sm">
                        <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                          <FontAwesomeIcon
                            icon={faHeart}
                            className="text-danger"
                          />
                        </div>
                        <div>
                          <h3 className="fw-bold mb-0">{stats.total}</h3>
                          <p className="text-muted mb-0 small">Total favoris</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-3 border border-light shadow-sm">
                        <div
                          className="rounded-circle p-3 me-3"
                          style={{
                            backgroundColor: `${colors.type.product}15`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faTag}
                            style={{ color: colors.type.product }}
                          />
                        </div>
                        <div>
                          <h4 className="fw-bold mb-0">{stats.produits}</h4>
                          <p className="text-muted mb-0 small">Produits</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-3 border border-light shadow-sm">
                        <div
                          className="rounded-circle p-3 me-3"
                          style={{ backgroundColor: `${colors.type.don}15` }}
                        >
                          <FontAwesomeIcon
                            icon={faGift}
                            style={{ color: colors.type.don }}
                          />
                        </div>
                        <div>
                          <h4 className="fw-bold mb-0">{stats.dons}</h4>
                          <p className="text-muted mb-0 small">Dons</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded-3 border border-light shadow-sm">
                        <div
                          className="rounded-circle p-3 me-3"
                          style={{
                            backgroundColor: `${colors.type.exchange}15`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faArrowRightArrowLeft}
                            style={{ color: colors.type.exchange }}
                          />
                        </div>
                        <div>
                          <h4 className="fw-bold mb-0">{stats.echanges}</h4>
                          <p className="text-muted mb-0 small">Échanges</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filtres actifs */}
                  {(selectedType !== "tous" || searchQuery) && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-semibold mb-3">Filtres actifs</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedType !== "tous" && (
                          <span className="badge bg-light text-dark border">
                            Type: {selectedType}
                          </span>
                        )}
                        {searchQuery && (
                          <span className="badge bg-light text-dark border">
                            Recherche: "{searchQuery}"
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary ms-auto"
                          onClick={handleClearFilters}
                        >
                          Tout effacer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-semibold mb-3">Actions rapides</h6>
                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={handleRefresh}
                        disabled={loading}
                      >
                        {loading ? (
                          <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                          <FontAwesomeIcon icon={faHeart} />
                        )}
                        {loading ? "Chargement..." : "Actualiser la liste"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={navigateToMarketplace}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Explorer le catalogue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne principale - Tableau */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <h5 className="fw-semibold mb-1">Liste des favoris</h5>
                    <p className="text-muted mb-0 small">
                      {filteredFavoris.length} élément(s) trouvé(s)
                      {selectedItems.length > 0 && (
                        <span className="text-primary ms-2">
                          • {selectedItems.length} sélectionné(s)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {selectedItems.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                          onClick={handleOpenAllSelected}
                          title="Ouvrir tous les éléments sélectionnés"
                        >
                          <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                          Ouvrir
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
                          onClick={handleExportSelection}
                          title="Exporter la sélection"
                        >
                          <FontAwesomeIcon icon={faFileExport} size="xs" />
                          Exporter
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                          onClick={handleBatchRemove}
                          title="Supprimer la sélection"
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                          Supprimer
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleClearSelection}
                        >
                          Désélectionner
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      {loading ? (
                        <FontAwesomeIcon icon={faSpinner} spin size="xs" />
                      ) : (
                        "Actualiser"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {filteredFavoris.length > 0 ? (
                  <DataTable
                    data={filteredFavoris}
                    loading={loading}
                    error={error}
                    onRemoveFavorite={handleRemoveFavorite}
                    onRefresh={handleRefresh}
                    selectedItems={selectedItems}
                    onSelectAll={handleSelectAll}
                    onSelectItem={handleSelectItem}
                    onView={handleView}
                    className="mb-0"
                  />
                ) : (
                  <EmptyState
                    title={loading ? "Chargement..." : "Aucun favori trouvé"}
                    description={
                      searchQuery || selectedType !== "tous"
                        ? "Aucun favori ne correspond à vos critères de recherche."
                        : "Vous n'avez pas encore ajouté d'éléments à vos favoris."
                    }
                    searchQuery={searchQuery}
                    showResetButton={
                      selectedType !== "tous" || searchQuery !== ""
                    }
                    onReset={handleClearFilters}
                    onCreateNew={navigateToMarketplace}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedFavori && (
        <ViewModal
          show={showViewModal}
          onClose={handleCloseModal}
          annonce={selectedFavori}
          fullDetails={fullDetails}
          loading={detailLoading}
        />
      )}
    </div>
  );
}
