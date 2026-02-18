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
  faDownload,
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

  // Transformer un FavoriItem en AnnonceData pour la modal
  const transformFavoriToAnnonce = useCallback((favori: FavoriItem) => {
    let annonceData: any = {
      uuid: favori.uuid,
      type: favori.type as "produit" | "don" | "echange",
      date: favori.createdAt,
    };

    switch (favori.type) {
      case "produit":
        const produit = favori.produit;
        annonceData = {
          ...annonceData,
          title: produit?.libelle || "Produit sans nom",
          description: produit?.description,
          image: produit?.image || `https://via.placeholder.com/64?text=P`,
          status:
            produit?.statut?.toLowerCase() ||
            (produit?.estPublie ? "publie" : "en-attente"),
          price: produit?.prix,
          quantity: produit?.quantite,
          estPublie: produit?.estPublie,
          estBloque: produit?.estBloque,
          seller: {
            name: produit?.createur
              ? `${produit.createur.prenoms} ${produit.createur.nom}`
              : "Vendeur inconnu",
            avatar: produit?.createur?.avatar,
            isPro: false,
            type: "utilisateur",
          },
          category: produit?.categorie?.libelle,
          originalData: produit,
        };
        break;

      case "don":
        const don = favori.don;
        annonceData = {
          ...annonceData,
          title: don?.titre || don?.nom || "Don sans nom",
          description: don?.description,
          image: don?.image || `https://via.placeholder.com/64?text=D`,
          status: don?.statut?.toLowerCase() || "en-attente",
          price: don?.prix,
          quantity: don?.quantite,
          estPublie: don?.estPublie,
          estBloque: don?.est_bloque,
          seller: {
            name: don?.createur
              ? `${don.createur.prenoms} ${don.createur.nom}`
              : "Donateur inconnu",
            avatar: don?.createur?.avatar,
            isPro: false,
            type: "utilisateur",
          },
          category: don?.categorie,
          originalData: don,
        };
        break;

      case "echange":
        const echange = favori.echange;
        annonceData = {
          ...annonceData,
          title: echange?.nomElementEchange || "Échange sans nom",
          description: echange?.message || echange?.nomElementEchange,
          image: echange?.image || `https://via.placeholder.com/64?text=E`,
          status: echange?.statut?.toLowerCase() || "en-attente",
          price: echange?.prix,
          quantity: echange?.quantite,
          estPublie: echange?.estPublie,
          estBloque: echange?.estBloque,
          seller: {
            name: echange?.nom_initiateur || "Initié par",
            type: echange?.typeDestinataire || "utilisateur",
          },
          category: echange?.categorie,
          originalData: echange,
        };
        break;
    }

    return annonceData;
  }, []);

  // Charger les détails complets d'un favori
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

  // Gérer l'ouverture de la modal de détails
  const handleView = useCallback(
    async (uuid: string, type: string, itemUuid: string) => {
      const favori = favoris.find((f) => f.uuid === uuid && f.type === type);
      if (favori) {
        const annonceData = transformFavoriToAnnonce(favori);
        setSelectedFavori(annonceData);
        setShowViewModal(true);
        await fetchFullDetails(favori);
      }
    },
    [favoris, transformFavoriToAnnonce, fetchFullDetails],
  );

  // Fermer la modal
  const handleCloseModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedFavori(null);
    setFullDetails(null);
  }, []);

  // ✅ Charger les favoris utilisateur depuis les endpoints spécifiques
  const fetchUserFavoris = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Chargement des favoris utilisateur...");

      // Appeler les 3 endpoints spécifiques pour les utilisateurs
      const [produitsRes, donsRes, echangesRes] = await Promise.allSettled([
        api.get<any>(API_ENDPOINTS.PRODUCTS.LIST_PRODUITS_FAVORIS_UTILISATEUR),
        api.get<any>(API_ENDPOINTS.DONS.LIST_FAVORIS_DON_UTILISATEUR),
        api.get<any>(API_ENDPOINTS.ECHANGES.LIST_ECHANGES_FAVORIS_UTILISATEUR),
      ]);

      const allFavoris: FavoriItem[] = [];

      // Traiter les produits
      if (produitsRes.status === "fulfilled") {
        const response = produitsRes.value;
        const produitsData = response.data || response;

        if (Array.isArray(produitsData)) {
          produitsData.forEach((item: any) => {
            // CORRIGÉ : Structure conforme à l'interface FavoriItem
            allFavoris.push({
              uuid: `produit-${item.uuid}-${Date.now()}`,
              type: "produit",
              produitUuid: item.uuid, // Ajout de produitUuid
              donUuid: "", // Valeur par défaut
              echangeUuid: "", // Valeur par défaut
              utilisateurUuid: item.createur?.uuid || "",
              itemUuid: item.uuid,
              produit: {
                ...item,
                libelle: item.libelle,
                description: item.description,
                prix: item.prix,
                image: item.image,
                statut: item.statut,
                estPublie: item.estPublie,
                estBloque: item.estBloque,
                quantite: item.quantite,
                createur: item.createur,
                categorie: item.categorie,
              },
              createdAt: item.createdAt || new Date().toISOString(),
            });
          });
        }
      }

      // Traiter les dons
      if (donsRes.status === "fulfilled") {
        const response = donsRes.value;
        const donsData = response.data || response;

        if (Array.isArray(donsData)) {
          donsData.forEach((item: any) => {
            // CORRIGÉ : Structure conforme à l'interface FavoriItem
            allFavoris.push({
              uuid: `don-${item.uuid}-${Date.now()}`,
              type: "don",
              produitUuid: "", // Valeur par défaut
              donUuid: item.uuid, // Ajout de donUuid
              echangeUuid: "", // Valeur par défaut
              utilisateurUuid: item.createur?.uuid || "",
              itemUuid: item.uuid,
              don: {
                ...item,
                titre: item.titre,
                nom: item.titre,
                description: item.description,
                prix: item.prix,
                image: item.image,
                statut: item.statut,
                estPublie: item.estPublie,
                est_bloque: item.est_bloque,
                quantite: item.quantite,
                createur: item.createur,
                categorie: item.categorie,
              },
              createdAt: item.createdAt || new Date().toISOString(),
            });
          });
        }
      }

      // Traiter les échanges
      if (echangesRes.status === "fulfilled") {
        const response = echangesRes.value;
        const echangesData = response.data || response;

        if (Array.isArray(echangesData)) {
          echangesData.forEach((item: any) => {
            // CORRIGÉ : Structure conforme à l'interface FavoriItem
            allFavoris.push({
              uuid: `echange-${item.uuid}-${Date.now()}`,
              type: "echange",
              produitUuid: "", // Valeur par défaut
              donUuid: "", // Valeur par défaut
              echangeUuid: item.uuid, // Ajout de echangeUuid
              utilisateurUuid: item.createur?.uuid || "",
              itemUuid: item.uuid,
              echange: {
                ...item,
                nomElementEchange: item.nomElementEchange,
                message: item.message,
                prix: item.prix,
                image: item.image,
                statut: item.statut,
                estPublie: item.estPublie,
                estBloque: item.estBloque,
                quantite: item.quantite,
                nom_initiateur: item.nom_initiateur,
                typeDestinataire: item.typeDestinataire,
              },
              createdAt:
                item.createdAt ||
                item.dateProposition ||
                new Date().toISOString(),
            });
          });
        }
      }

      console.log(`✅ Total favoris utilisateur chargés: ${allFavoris.length}`);

      // Trier par date (plus récents d'abord)
      const sortedFavoris = allFavoris.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setFavoris(sortedFavoris);

      if (allFavoris.length === 0) {
        setError("Vous n'avez pas encore de favoris");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des favoris:", err);
      setError(
        err.message || "Une erreur est survenue lors du chargement des favoris",
      );
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer les favoris
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
            title = item.produit?.libelle || "";
            description = item.produit?.description || "";
            category = item.produit?.categorie?.libelle || "";
            break;
          case "don":
            title = item.don?.titre || item.don?.nom || "";
            description = item.don?.description || "";
            category = item.don?.categorie || "";
            break;
          case "echange":
            title = item.echange?.nomElementEchange || "";
            description =
              item.echange?.message || item.echange?.nomElementEchange || "";
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

  // Gérer la sélection multiple
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
        // Éviter les doublons
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

  // Retirer un favori
  const handleRemoveFavorite = useCallback(
    async (uuid: string, type: string, itemUuid: string) => {
      try {
        console.log(`🗑️ Retrait du favori ${uuid} (${type})`);

        // Utiliser l'endpoint approprié selon le type
        let endpoint = "";
        switch (type) {
          case "produit":
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE(itemUuid);
            break;
          case "don":
            endpoint =
              API_ENDPOINTS.FAVORIS.REMOVE_DON?.(itemUuid) ||
              `/favoris/don/${itemUuid}`;
            break;
          case "echange":
            endpoint =
              API_ENDPOINTS.FAVORIS.REMOVE_ECHANGE?.(itemUuid) ||
              `/favoris/echange/${itemUuid}`;
            break;
        }

        await api.delete(endpoint);

        // Recharger les favoris
        await fetchUserFavoris();

        // Message de succès
        alert("L'élément a été retiré de vos favoris avec succès");
      } catch (err: any) {
        console.error("❌ Erreur lors du retrait du favori:", err);
        alert("Erreur lors du retrait du favori. Veuillez réessayer.");
      }
    },
    [fetchUserFavoris],
  );

  // Retirer plusieurs favoris
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
      const selectedFavoris = filteredFavoris.filter((item) =>
        selectedItems.includes(item.uuid),
      );

      // Retirer chaque favori sélectionné
      const promises = selectedFavoris.map((favori) => {
        let endpoint = "";
        switch (favori.type) {
          case "produit":
            endpoint = API_ENDPOINTS.FAVORIS.REMOVE(favori.itemUuid);
            break;
          case "don":
            endpoint =
              API_ENDPOINTS.FAVORIS.REMOVE_DON?.(favori.itemUuid) ||
              `/favoris/don/${favori.itemUuid}`;
            break;
          case "echange":
            endpoint =
              API_ENDPOINTS.FAVORIS.REMOVE_ECHANGE?.(favori.itemUuid) ||
              `/favoris/echange/${favori.itemUuid}`;
            break;
        }
        return api.delete(endpoint);
      });

      await Promise.all(promises);

      // Recharger les favoris
      await fetchUserFavoris();

      // Réinitialiser la sélection
      setSelectedItems([]);
      setShowBatchActions(false);

      alert(
        `${selectedItems.length} élément(s) ont été retirés de vos favoris avec succès`,
      );
    } catch (err: any) {
      console.error("❌ Erreur lors du retrait groupé:", err);
      alert("Erreur lors du retrait des favoris. Veuillez réessayer.");
    }
  }, [selectedItems, filteredFavoris, fetchUserFavoris]);

  // Exporter la sélection
  const handleExportSelection = useCallback(() => {
    const selectedFavoris = filteredFavoris.filter((item) =>
      selectedItems.includes(item.uuid),
    );

    const exportData = {
      dateExport: new Date().toISOString(),
      type: "favoris-utilisateur",
      nombreElements: selectedFavoris.length,
      favoris: selectedFavoris.map((favori) => ({
        type: favori.type,
        titre:
          favori.produit?.libelle ||
          favori.don?.titre ||
          favori.echange?.nomElementEchange,
        dateAjout: favori.createdAt,
        url: `${window.location.origin}/${favori.type}s/${favori.itemUuid}`,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mes-favoris-utilisateur-${new Date().toISOString().split("T")[0]}.json`;

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

  // Charger au montage
  useEffect(() => {
    fetchUserFavoris();
  }, [fetchUserFavoris]);

  // Statistiques
  const stats = useMemo(() => {
    const total = favoris.length;
    const produits = favoris.filter((f) => f.type === "produit").length;
    const dons = favoris.filter((f) => f.type === "don").length;
    const echanges = favoris.filter((f) => f.type === "echange").length;

    return { total, produits, dons, echanges };
  }, [favoris]);

  // Fonction pour naviguer vers la boutique
  const navigateToMarketplace = useCallback(() => {
    window.location.href = "/boutique";
  }, []);

  // Ouvrir tous les éléments sélectionnés dans de nouveaux onglets
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
                  Favoris utilisateur uniquement
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
      <ViewModal
        show={showViewModal}
        onClose={handleCloseModal}
        annonce={selectedFavori}
        fullDetails={fullDetails}
        loading={detailLoading}
      />
    </div>
  );
}
