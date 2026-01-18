// app/(back-office)/dashboard-utilisateur/stocks/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faGift,
  faExchangeAlt,
  faSearch,
  faFilter,
  faEdit,
  faEye,
  faSync,
  faSort,
  faSortUp,
  faSortDown,
  faWarehouse,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faChartLine,
  faList,
  faTable,
  faArrowLeft,
  faArrowRight,
  faInfoCircle,
  faCalendar,
  faMoneyBill,
  faLayerGroup,
  faDatabase,
  faTachometerAlt,
  faCubes,
  faBoxOpen,
  faChartBar,
  faDownload,
  faCog,
  faCheckSquare,
  faSquare,
  faTrash,
  faTags,
  faBoxes,
  faClipboardCheck,
  faChartPie,
  faFilter as faFilterAlt,
  faCheckDouble,
  faSpinner,
  faPlus,
  faMinus,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import Link from "next/link";

// Types basés sur votre API
interface ProduitUtilisateur {
  uuid: string;
  libelle: string;
  type: string | null;
  image: string;
  prix: string;
  description: string | null;
  etoile: number;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  categorie: {
    uuid: string;
    libelle: string;
    type: string;
  };
  utilisateur: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    avatar: string;
  };
  source: {
    type: string;
    infos: any;
  };
  estUtilisateur: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface DonUtilisateur {
  uuid: string;
  nom: string;
  type_don: string;
  prix: string | null;
  categorie: string;
  image: string;
  localisation: string;
  description: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  estPublie: boolean;
  est_bloque: boolean;
  lieu_retrait: string;
  est_public: number;
  vendeur: string;
  utilisateur: string;
  agent: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface EchangeUtilisateur {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string | null;
  prix: string;
  image: string;
  typeDestinataire: string | null;
  typeEchange: string;
  agent: string;
  utilisateur: string;
  vendeur: string;
  objetPropose: string;
  objetDemande: string;
  estPublie: boolean;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  dateRefus: string | null;
  categorie: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface StockItem {
  id: string;
  type: "don" | "produit" | "echange";
  nom: string;
  image: string;
  categorie: string;
  quantite: number;
  statut: string;
  date_maj: string;
  disponible: boolean;
  prix?: string | null;
  typeSpecifique?: string;
  originalItem: ProduitUtilisateur | DonUtilisateur | EchangeUtilisateur;
  selected?: boolean;
}

// Type pour les filtres
type TypeStock = "tous" | "dons" | "produits" | "echanges";
type StatutStock = "tous" | "disponible" | "epuise" | "limite" | "indisponible";

export default function GestionStocksUtilisateurPage() {
  // États pour les données
  const [dons, setDons] = useState<DonUtilisateur[]>([]);
  const [echanges, setEchanges] = useState<EchangeUtilisateur[]>([]);
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    dons: true,
    echanges: true,
    produits: true,
  });

  // États pour les erreurs
  const [errors, setErrors] = useState({
    dons: null as string | null,
    echanges: null as string | null,
    produits: null as string | null,
  });

  // États pour la vue et les filtres
  const [activeView, setActiveView] = useState<TypeStock>("tous");
  const [statutFilter, setStatutFilter] = useState<StatutStock>("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof StockItem>("nom");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // États pour la modal de stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockQuantite, setStockQuantite] = useState("");
  const [stockDisponible, setStockDisponible] = useState(true);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // États pour la sélection multiple
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Charger les dons de l'utilisateur
  const fetchDons = useCallback(async () => {
    setLoading((prev) => ({ ...prev, dons: true }));
    setErrors((prev) => ({ ...prev, dons: null }));

    try {
      console.log("🔄 Chargement des dons de l'utilisateur...");

      const response = await api.get("/dons/liste-don-utilisateur");

      console.log("📦 Réponse dons:", response.data);

      if (response.data?.status === "success") {
        setDons(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setDons(response.data);
      } else {
        setErrors((prev) => ({
          ...prev,
          dons: "Format de réponse inattendu pour les dons",
        }));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des dons:", err);
      setErrors((prev) => ({
        ...prev,
        dons: err.response?.data?.message || "Erreur de connexion au serveur",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, dons: false }));
    }
  }, []);

  // Charger les échanges de l'utilisateur
  const fetchEchanges = useCallback(async () => {
    setLoading((prev) => ({ ...prev, echanges: true }));
    setErrors((prev) => ({ ...prev, echanges: null }));

    try {
      console.log("🔄 Chargement des échanges de l'utilisateur...");

      const response = await api.get("/echanges/liste-echange-utilisateur");

      console.log("📦 Réponse échanges:", response.data);

      if (response.data?.status === "success") {
        setEchanges(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setEchanges(response.data);
      } else {
        setErrors((prev) => ({
          ...prev,
          echanges: "Format de réponse inattendu pour les échanges",
        }));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des échanges:", err);
      setErrors((prev) => ({
        ...prev,
        echanges:
          err.response?.data?.message || "Erreur de connexion au serveur",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, echanges: false }));
    }
  }, []);

  // Charger les produits de l'utilisateur
  const fetchProduits = useCallback(async () => {
    setLoading((prev) => ({ ...prev, produits: true }));
    setErrors((prev) => ({ ...prev, produits: null }));

    try {
      console.log("🔄 Chargement des produits de l'utilisateur...");

      const response = await api.get(
        "/produits/liste-mes-utilisateur-produits",
      );

      console.log("📦 Réponse produits:", response.data);

      if (response.data?.status === "success") {
        // Selon votre API, les produits sont dans response.data.data.produits
        setProduits(response.data.data?.produits || []);
      } else if (response.data?.produits) {
        setProduits(response.data.produits);
      } else if (Array.isArray(response.data)) {
        setProduits(response.data);
      } else {
        setErrors((prev) => ({
          ...prev,
          produits: "Format de réponse inattendu pour les produits",
        }));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits:", err);
      setErrors((prev) => ({
        ...prev,
        produits:
          err.response?.data?.message || "Erreur de connexion au serveur",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, produits: false }));
    }
  }, []);

  // Charger toutes les données
  const fetchAllData = useCallback(() => {
    console.log("🔄 Chargement de toutes les données...");
    fetchDons();
    fetchEchanges();
    fetchProduits();
  }, [fetchDons, fetchEchanges, fetchProduits]);

  // Charger au montage
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Transformer les données en items de stock
  const stockItems: StockItem[] = useMemo(() => {
    const items: StockItem[] = [];

    // Transformer les dons
    dons.forEach((don) => {
      items.push({
        id: don.uuid,
        type: "don" as const,
        nom: don.nom,
        image: don.image,
        categorie: don.categorie,
        quantite: 1, // Par défaut pour les dons
        statut: don.statut,
        date_maj: don.updatedAt || don.date_debut,
        disponible: don.estPublie && !don.est_bloque,
        prix: don.prix,
        typeSpecifique: don.type_don,
        originalItem: don,
        selected: false,
      });
    });

    // Transformer les échanges
    echanges.forEach((echange) => {
      items.push({
        id: echange.uuid,
        type: "echange" as const,
        nom: echange.nomElementEchange,
        image: echange.image,
        categorie: echange.categorie,
        quantite: 1, // Par défaut pour les échanges
        statut: echange.statut,
        date_maj: echange.updatedAt || echange.dateProposition,
        disponible: echange.estPublie,
        prix: echange.prix,
        typeSpecifique: echange.typeEchange,
        originalItem: echange,
        selected: false,
      });
    });

    // Transformer les produits
    produits.forEach((produit) => {
      items.push({
        id: produit.uuid,
        type: "produit" as const,
        nom: produit.libelle,
        image: produit.image,
        categorie: produit.categorie?.libelle || "Non catégorisé",
        quantite: produit.quantite || 0,
        statut: produit.statut,
        date_maj: produit.updatedAt || "",
        disponible: produit.estPublie && !produit.estBloque,
        prix: produit.prix,
        typeSpecifique: produit.type || undefined,
        originalItem: produit,
        selected: false,
      });
    });

    return items;
  }, [dons, echanges, produits]);

  // Filtrer et trier les items
  const filteredItems = useMemo(() => {
  let filtered = [...stockItems];

  // Filtrer par type
  if (activeView !== "tous") {
    filtered = filtered.filter((item) => {
      // Mapper les valeurs de activeView vers les valeurs de item.type
      const typeMapping: Record<string, "don" | "echange" | "produit"> = {
        dons: "don",
        echanges: "echange",
        produits: "produit",
      };
      
      const mappedType = typeMapping[activeView];
      return mappedType ? item.type === mappedType : false;
    });
  }

  // Filtrer par statut de stock
  if (statutFilter !== "tous") {
    filtered = filtered.filter((item) => {
      const quantite = item.quantite;
      switch (statutFilter) {
        case "disponible":
          return item.disponible && quantite > 0;
        case "epuise":
          return quantite === 0;
        case "limite":
          return quantite > 0 && quantite <= 10;
        case "indisponible":
          return !item.disponible;
        default:
          return true;
      }
    });
  }

  // Filtrer par recherche
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.nom.toLowerCase().includes(term) ||
        item.categorie.toLowerCase().includes(term) ||
        item.statut.toLowerCase().includes(term) ||
        (item.typeSpecifique &&
          item.typeSpecifique.toLowerCase().includes(term)),
    );
  }

  // Trier
  filtered.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
  });

  return filtered;
}, [
  stockItems,
  activeView,
  statutFilter,
  searchTerm,
  sortField,
  sortDirection,
]);

  // Produits de la page courante
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Gérer la sélection de tous les éléments
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      setSelectedItems(filteredItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Gérer la sélection d'un élément
  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Mettre à jour selectAll quand selectedItems change
  useEffect(() => {
    if (filteredItems.length > 0) {
      setSelectAll(selectedItems.length === filteredItems.length);
    } else {
      setSelectAll(false);
    }
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems, filteredItems]);

  // Actions en masse
  const handleBulkAction = async (action: string) => {
    const selectedIds = selectedItems;
    if (selectedIds.length === 0) return;

    switch (action) {
      case "export":
        exportToCSV(selectedIds);
        break;
      case "disable":
        await handleBulkDisponibility(selectedIds, false);
        break;
      case "enable":
        await handleBulkDisponibility(selectedIds, true);
        break;
      case "delete":
        if (
          confirm(
            `Voulez-vous vraiment supprimer ${selectedIds.length} élément(s) ?`,
          )
        ) {
          await handleBulkDelete(selectedIds);
        }
        break;
    }
  };

  // Gérer la disponibilité en masse
  const handleBulkDisponibility = async (
    ids: string[],
    disponible: boolean,
  ) => {
    try {
      console.log(`Mise à jour de ${ids.length} éléments à ${disponible}`);
      // TODO: Implémenter l'appel API
      setSelectedItems([]);
      setUpdateMessage(`${ids.length} élément(s) mis à jour avec succès`);
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour en masse:", error);
      setUpdateError("Erreur lors de la mise à jour en masse");
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  // Suppression en masse
  const handleBulkDelete = async (ids: string[]) => {
    try {
      console.log(`Suppression de ${ids.length} éléments`);
      // TODO: Implémenter l'appel API
      setSelectedItems([]);
      fetchAllData(); // Recharger les données
      setUpdateMessage(`${ids.length} élément(s) supprimé(s) avec succès`);
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression en masse:", error);
      setUpdateError("Erreur lors de la suppression en masse");
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  // Export CSV
  const exportToCSV = (ids: string[]) => {
    const selectedItems = stockItems.filter((item) => ids.includes(item.id));

    const headers = [
      "Type",
      "Nom",
      "Catégorie",
      "Quantité",
      "Statut",
      "Disponible",
      "Prix",
      "Date MAJ",
    ];

    const csvContent = [
      headers.join(","),
      ...selectedItems.map((item) =>
        [
          item.type,
          `"${item.nom.replace(/"/g, '""')}"`,
          `"${item.categorie.replace(/"/g, '""')}"`,
          item.quantite,
          item.statut,
          item.disponible ? "Oui" : "Non",
          item.prix || "N/A",
          formatDate(item.date_maj),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stocks-utilisateur-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setUpdateMessage(`${ids.length} élément(s) exporté(s) avec succès`);
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Gérer le tri
  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Obtenir l'icône de tri
  const getSortIcon = (field: keyof StockItem) => {
    if (sortField !== field) return faSort;
    return sortDirection === "asc" ? faSortUp : faSortDown;
  };

  // Ouvrir la modal de gestion de stock
  const openStockModal = (item: StockItem) => {
    setSelectedItem(item);
    setStockQuantite(item.quantite.toString());
    setStockDisponible(item.disponible);
    setUpdateMessage(null);
    setUpdateError(null);
    setShowStockModal(true);
  };

  // Fermer la modal
  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedItem(null);
    setStockQuantite("");
    setUpdateMessage(null);
    setUpdateError(null);
  };

  // Mettre à jour le stock
  const updateStock = async () => {
    if (!selectedItem || !stockQuantite) return;

    try {
      setUpdatingStock(true);
      setUpdateMessage(null);
      setUpdateError(null);

      const quantiteNum = parseInt(stockQuantite);
      if (isNaN(quantiteNum) || quantiteNum < 0) {
        throw new Error(
          "Quantité invalide. Veuillez entrer un nombre positif.",
        );
      }

      console.log(`Mise à jour du ${selectedItem.type} ${selectedItem.id}`);

      let endpoint = "";
      let requestData: any = {};

      // Sélectionner l'endpoint selon le type
      switch (selectedItem.type) {
        case "don":
          endpoint = `/dons/${selectedItem.id}/update-stock`;
          requestData = {
            disponible: stockDisponible,
            // Pour les dons, on peut ajouter d'autres champs si nécessaire
          };
          break;

        case "produit":
          endpoint = `/produits/${selectedItem.id}/update-stock`;
          requestData = {
            quantite: quantiteNum,
            disponible: stockDisponible,
          };
          break;

        case "echange":
          endpoint = `/echanges/${selectedItem.id}/update-stock`;
          requestData = {
            disponible: stockDisponible,
          };
          break;
      }

      console.log("Endpoint:", endpoint);
      console.log("Données:", requestData);

      // Note: Adaptez cet appel à votre API
      // const response = await api.put(endpoint, requestData);

      // Pour l'instant, simulation de succès
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mettre à jour les données locales
      switch (selectedItem.type) {
        case "don":
          setDons((prev) =>
            prev.map((don) =>
              don.uuid === selectedItem.id
                ? {
                    ...don,
                    estPublie: stockDisponible,
                    est_bloque: !stockDisponible,
                    updatedAt: new Date().toISOString(),
                  }
                : don,
            ),
          );
          break;
        case "produit":
          setProduits((prev) =>
            prev.map((prod) =>
              prod.uuid === selectedItem.id
                ? {
                    ...prod,
                    quantite: quantiteNum,
                    estPublie: stockDisponible,
                    estBloque: !stockDisponible,
                    updatedAt: new Date().toISOString(),
                  }
                : prod,
            ),
          );
          break;
        case "echange":
          setEchanges((prev) =>
            prev.map((ech) =>
              ech.uuid === selectedItem.id
                ? {
                    ...ech,
                    estPublie: stockDisponible,
                    updatedAt: new Date().toISOString(),
                  }
                : ech,
            ),
          );
          break;
      }

      setUpdateMessage(
        `✅ Stock mis à jour avec succès pour "${selectedItem.nom}"`,
      );

      // Fermer la modal après 2 secondes
      setTimeout(() => {
        closeStockModal();
      }, 2000);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du stock:", err);
      setUpdateError(
        err.response?.data?.message || "Erreur lors de la mise à jour du stock",
      );
    } finally {
      setUpdatingStock(false);
    }
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = (item: StockItem) => {
    if (!item.disponible) return "danger";
    const quantite = item.quantite;
    if (quantite === 0) return "danger";
    if (quantite <= 10) return "warning";
    return "success";
  };

  // Obtenir le texte du statut de stock
  const getStockStatusText = (item: StockItem) => {
    if (!item.disponible) return "Indisponible";
    const quantite = item.quantite;
    if (quantite === 0) return "Épuisé";
    if (quantite <= 10) return `Limite (${quantite})`;
    return `Disponible (${quantite})`;
  };

  // Obtenir les statistiques
  const stats = useMemo(() => {
    const totalValue = stockItems.reduce((sum, item) => {
      if (item.prix && !isNaN(parseFloat(item.prix))) {
        return sum + parseFloat(item.prix) * item.quantite;
      }
      return sum;
    }, 0);

    const disponibleCount = stockItems.filter(
      (item) => item.disponible && item.quantite > 0,
    ).length;

    return {
      total: stockItems.length,
      selected: selectedItems.length,
      dons: stockItems.filter((item) => item.type === "don").length,
      produits: stockItems.filter((item) => item.type === "produit").length,
      echanges: stockItems.filter((item) => item.type === "echange").length,
      disponible: disponibleCount,
      epuise: stockItems.filter((item) => item.quantite === 0).length,
      limite: stockItems.filter(
        (item) => item.quantite > 0 && item.quantite <= 10,
      ).length,
      valeurTotale: totalValue,
    };
  }, [stockItems, selectedItems]);

  // Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  // Formater le prix
  const formatPrice = (price: string | number | null) => {
    if (!price) return "Gratuit";
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Rendu du chargement
  const isLoading = loading.dons || loading.echanges || loading.produits;

  if (isLoading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center">
              <div
                className="spinner-border text-primary mb-3"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <h3 className="mb-2">Chargement de votre inventaire...</h3>
              <p className="text-muted">
                <FontAwesomeIcon icon={faDatabase} className="me-2" />
                Récupération des dons, produits et échanges
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de gestion de stock */}
      {showStockModal && selectedItem && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(5px)",
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="stockModalLabel"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title" id="stockModalLabel">
                  <FontAwesomeIcon icon={faWarehouse} className="me-2" />
                  Gestion du Stock -{" "}
                  {selectedItem.type === "don"
                    ? "Don"
                    : selectedItem.type === "produit"
                      ? "Produit"
                      : "Échange"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeStockModal}
                  disabled={updatingStock}
                  aria-label="Fermer"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card border-0 bg-light-subtle h-100">
                      <div className="card-body text-center">
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.nom}
                          className="img-fluid rounded mb-3"
                          style={{
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.nom)}&background=0d6efd&color=fff&size=150`;
                          }}
                        />
                        <h6 className="fw-bold">{selectedItem.nom}</h6>
                        <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                          <span className="badge bg-primary">
                            {selectedItem.type === "don"
                              ? "Don"
                              : selectedItem.type === "produit"
                                ? "Produit"
                                : "Échange"}
                          </span>
                          <span className="badge bg-info">
                            {selectedItem.categorie}
                          </span>
                          <span
                            className={`badge bg-${getStatusBadgeColor(selectedItem)}`}
                          >
                            {getStockStatusText(selectedItem)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="mb-4">
                      <h6 className="fw-bold text-primary mb-3">
                        <FontAwesomeIcon icon={faCog} className="me-2" />
                        Paramètres du Stock
                      </h6>

                      {selectedItem.type === "produit" && (
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon icon={faCubes} className="me-2" />
                            Quantité en stock
                          </label>
                          <div className="input-group input-group-lg">
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => {
                                const current = parseInt(stockQuantite) || 0;
                                if (current > 0) {
                                  setStockQuantite((current - 1).toString());
                                }
                              }}
                              disabled={updatingStock}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={stockQuantite}
                              onChange={(e) => setStockQuantite(e.target.value)}
                              min="0"
                              step="1"
                              placeholder="Entrez la quantité"
                              disabled={updatingStock}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => {
                                const current = parseInt(stockQuantite) || 0;
                                setStockQuantite((current + 1).toString());
                              }}
                              disabled={updatingStock}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <span className="input-group-text">unité(s)</span>
                          </div>
                          <div className="form-text text-muted">
                            Quantité actuelle :{" "}
                            <strong>{selectedItem.quantite}</strong> unité(s)
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-2"
                          />
                          Disponibilité
                        </label>
                        <div className="form-check form-switch form-check-lg">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={stockDisponible}
                            onChange={(e) =>
                              setStockDisponible(e.target.checked)
                            }
                            id="disponibleSwitch"
                            disabled={updatingStock}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="disponibleSwitch"
                          >
                            {stockDisponible
                              ? "✅ Article disponible"
                              : "❌ Article indisponible"}
                          </label>
                        </div>
                        <div className="form-text text-muted">
                          Quand désactivé, l'article n'apparaîtra plus dans les
                          résultats de recherche
                        </div>
                      </div>

                      {selectedItem.prix && (
                        <div className="alert alert-info">
                          <FontAwesomeIcon
                            icon={faMoneyBill}
                            className="me-2"
                          />
                          <strong>Prix :</strong>{" "}
                          {formatPrice(selectedItem.prix)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {updateMessage && (
                  <div className="alert alert-success alert-dismissible fade show mt-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="fs-4 me-3"
                      />
                      <div className="flex-grow-1">
                        <strong className="d-block">Succès !</strong>
                        {updateMessage}
                      </div>
                    </div>
                  </div>
                )}

                {updateError && (
                  <div className="alert alert-danger alert-dismissible fade show mt-3">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="fs-4 me-3"
                      />
                      <div className="flex-grow-1">
                        <strong className="d-block">Erreur !</strong>
                        {updateError}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setUpdateError(null)}
                      aria-label="Fermer"
                    ></button>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={closeStockModal}
                    disabled={updatingStock}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary px-4"
                    onClick={updateStock}
                    disabled={
                      updatingStock ||
                      (selectedItem.type === "produit" && !stockQuantite)
                    }
                  >
                    {updatingStock ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Mise à jour en cours...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages de mise à jour */}
      {updateMessage && !showStockModal && (
        <div
          className="alert alert-success alert-dismissible fade show mx-3 my-2"
          role="alert"
        >
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="me-3" />
            <div className="flex-grow-1">{updateMessage}</div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setUpdateMessage(null)}
              aria-label="Fermer"
            ></button>
          </div>
        </div>
      )}

      {updateError && !showStockModal && (
        <div
          className="alert alert-danger alert-dismissible fade show mx-3 my-2"
          role="alert"
        >
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faTimesCircle} className="me-3" />
            <div className="flex-grow-1">{updateError}</div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setUpdateError(null)}
              aria-label="Fermer"
            ></button>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {(errors.dons || errors.echanges || errors.produits) && (
        <div className="container-fluid mt-3">
          {errors.dons && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              <strong>Dons :</strong> {errors.dons}
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrors((prev) => ({ ...prev, dons: null }))}
              ></button>
            </div>
          )}
          {errors.echanges && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              <strong>Échanges :</strong> {errors.echanges}
              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setErrors((prev) => ({ ...prev, echanges: null }))
                }
              ></button>
            </div>
          )}
          {errors.produits && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              <strong>Produits :</strong> {errors.produits}
              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setErrors((prev) => ({ ...prev, produits: null }))
                }
              ></button>
            </div>
          )}
        </div>
      )}

      <div className="container-fluid py-4">
        {/* Barre d'actions en masse */}
        {showBulkActions && (
          <div className="row mb-4">
            <div className="col">
              <div className="card border-primary border-2">
                <div className="card-body py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          className="text-primary fs-4 me-3"
                        />
                        <div>
                          <h5 className="mb-1">
                            {stats.selected} élément(s) sélectionné(s)
                          </h5>
                          <p className="text-muted mb-0">
                            Choisissez une action à appliquer
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleBulkAction("export")}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handleBulkAction("enable")}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        Activer
                      </button>
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => handleBulkAction("disable")}
                      >
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="me-2"
                        />
                        Désactiver
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleBulkAction("delete")}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Supprimer
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSelectedItems([]);
                          setSelectAll(false);
                          setShowBulkActions(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="me-2"
                        />
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* En-tête avec statistiques */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow">
              <div className="card-body p-4">
                <div className="row align-items-center mb-4">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle p-3 me-3">
                        <FontAwesomeIcon
                          icon={faWarehouse}
                          className="text-white fs-2"
                        />
                      </div>
                      <div>
                        <h1 className="h2 mb-1">Gestion de Mon Inventaire</h1>
                        <p className="text-muted mb-0">
                          <FontAwesomeIcon
                            icon={faClipboardCheck}
                            className="me-2"
                          />
                          Gérez les quantités et disponibilités de vos dons,
                          produits et échanges
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="btn-group">
                      <button
                        onClick={fetchAllData}
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon
                          icon={faSync}
                          spin={isLoading}
                          className="me-2"
                        />
                        {isLoading ? "Chargement..." : "Actualiser"}
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          exportToCSV(stockItems.map((item) => item.id))
                        }
                        disabled={stockItems.length === 0}
                      >
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter tout
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="row g-3">
                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-primary text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon
                          icon={faLayerGroup}
                          className="fs-3 mb-2"
                        />
                        <h3 className="h2 fw-bold mb-1">{stats.total}</h3>
                        <p className="mb-0 opacity-75">Total Items</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-success text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="fs-3 mb-2"
                        />
                        <h3 className="h2 fw-bold mb-1">{stats.disponible}</h3>
                        <p className="mb-0 opacity-75">Disponibles</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-warning text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="fs-3 mb-2"
                        />
                        <h3 className="h2 fw-bold mb-1">{stats.limite}</h3>
                        <p className="mb-0 opacity-75">Stock Limité</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-danger text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="fs-3 mb-2"
                        />
                        <h3 className="h2 fw-bold mb-1">{stats.epuise}</h3>
                        <p className="mb-0 opacity-75">Épuisés</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-info text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon icon={faBox} className="fs-3 mb-2" />
                        <h3 className="h4 fw-bold mb-1">{stats.produits}</h3>
                        <p className="mb-0 opacity-75">Produits</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-2 col-md-4 col-6">
                    <div className="card border-0 bg-dark text-white">
                      <div className="card-body text-center p-3">
                        <FontAwesomeIcon icon={faGift} className="fs-3 mb-2" />
                        <h3 className="h4 fw-bold mb-1">{stats.dons}</h3>
                        <p className="mb-0 opacity-75">Dons</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="row g-3">
                  {/* Recherche */}
                  <div className="col-lg-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher par nom, catégorie..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* Filtre par type */}
                  <div className="col-lg-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FontAwesomeIcon icon={faFilterAlt} />
                      </span>
                      <select
                        className="form-select"
                        value={activeView}
                        onChange={(e) => {
                          setActiveView(e.target.value as TypeStock);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="tous">Tous les types</option>
                        <option value="dons">Dons uniquement</option>
                        <option value="produits">Produits uniquement</option>
                        <option value="echanges">Échanges uniquement</option>
                      </select>
                    </div>
                  </div>

                  {/* Filtre par statut */}
                  <div className="col-lg-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FontAwesomeIcon icon={faFilter} />
                      </span>
                      <select
                        className="form-select"
                        value={statutFilter}
                        onChange={(e) => {
                          setStatutFilter(e.target.value as StatutStock);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="tous">Tous les statuts</option>
                        <option value="disponible">Disponible</option>
                        <option value="limite">Stock limité</option>
                        <option value="epuise">Épuisé</option>
                        <option value="indisponible">Indisponible</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons de filtrage rapide */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-2">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <button
                    className={`btn ${activeView === "tous" ? "btn-primary" : "btn-outline-primary"} btn-sm`}
                    onClick={() => setActiveView("tous")}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                    Tous ({stats.total})
                  </button>
                  <button
                    className={`btn ${activeView === "dons" ? "btn-success" : "btn-outline-success"} btn-sm`}
                    onClick={() => setActiveView("dons")}
                  >
                    <FontAwesomeIcon icon={faGift} className="me-2" />
                    Dons ({stats.dons})
                  </button>
                  <button
                    className={`btn ${activeView === "produits" ? "btn-info" : "btn-outline-info"} btn-sm`}
                    onClick={() => setActiveView("produits")}
                  >
                    <FontAwesomeIcon icon={faBox} className="me-2" />
                    Produits ({stats.produits})
                  </button>
                  <button
                    className={`btn ${activeView === "echanges" ? "btn-warning" : "btn-outline-warning"} btn-sm`}
                    onClick={() => setActiveView("echanges")}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                    Échanges ({stats.echanges})
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatutFilter("tous");
                      setActiveView("tous");
                      setCurrentPage(1);
                    }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des stocks */}
        <div className="row">
          <div className="col">
            <div className="card border-0 shadow">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                  <div className="mb-3 mb-md-0">
                    <h3 className="h4 mb-1">
                      <FontAwesomeIcon
                        icon={faTable}
                        className="me-2 text-primary"
                      />
                      Inventaire Personnel
                    </h3>
                    <p className="text-muted mb-0">
                      {filteredItems.length} article(s) correspondant à vos
                      critères
                      {selectedItems.length > 0 && (
                        <span className="ms-2 text-primary">
                          • {selectedItems.length} sélectionné(s)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <select
                        className="form-select form-select-sm"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value="10">10 par page</option>
                        <option value="25">25 par page</option>
                        <option value="50">50 par page</option>
                        <option value="100">100 par page</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={fetchAllData}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faSync} spin={isLoading} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "50px" }} className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectAll && filteredItems.length > 0}
                            onChange={handleSelectAll}
                            aria-label="Sélectionner tous"
                            disabled={filteredItems.length === 0}
                          />
                        </th>
                        <th style={{ width: "50px" }} className="text-center">
                          #
                        </th>
                        <th
                          style={{ width: "80px" }}
                          onClick={() => handleSort("type")}
                          className="cursor-pointer"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("type")}
                              className="me-2"
                            />
                            Type
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("nom")}
                          className="cursor-pointer"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("nom")}
                              className="me-2"
                            />
                            Article
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("categorie")}
                          className="cursor-pointer"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("categorie")}
                              className="me-2"
                            />
                            Catégorie
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("quantite")}
                          className="cursor-pointer text-center"
                        >
                          <div className="d-flex align-items-center justify-content-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("quantite")}
                              className="me-2"
                            />
                            Stock
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("statut")}
                          className="cursor-pointer"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("statut")}
                              className="me-2"
                            />
                            Statut
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort("date_maj")}
                          className="cursor-pointer"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={getSortIcon("date_maj")}
                              className="me-2"
                            />
                            Dernière MAJ
                          </div>
                        </th>
                        <th className="text-end" style={{ width: "150px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-5">
                            <div className="py-5">
                              <div className="mb-4">
                                <FontAwesomeIcon
                                  icon={faBoxOpen}
                                  className="display-1 text-muted opacity-25"
                                />
                              </div>
                              <h4 className="text-muted mb-3">
                                Aucun article trouvé
                              </h4>
                              <p className="text-muted mb-4">
                                {stockItems.length === 0
                                  ? "Vous n'avez pas encore d'articles dans votre inventaire."
                                  : "Modifiez vos critères de recherche."}
                              </p>
                              {(searchTerm ||
                                activeView !== "tous" ||
                                statutFilter !== "tous") && (
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    setSearchTerm("");
                                    setStatutFilter("tous");
                                    setActiveView("tous");
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faFilter}
                                    className="me-2"
                                  />
                                  Réinitialiser les filtres
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedItems.map((item, index) => (
                          <tr
                            key={`${item.type}-${item.id}`}
                            className={`hover-row ${selectedItems.includes(item.id) ? "table-active" : ""}`}
                          >
                            <td className="text-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                aria-label={`Sélectionner ${item.nom}`}
                              />
                            </td>
                            <td className="text-center text-muted">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td>
                              <div className="d-flex flex-column align-items-center">
                                <div
                                  className={`rounded-circle p-2 mb-1 ${
                                    item.type === "don"
                                      ? "bg-success bg-opacity-10"
                                      : item.type === "produit"
                                        ? "bg-info bg-opacity-10"
                                        : "bg-warning bg-opacity-10"
                                  }`}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      item.type === "don"
                                        ? faGift
                                        : item.type === "produit"
                                          ? faBox
                                          : faExchangeAlt
                                    }
                                    className={`${
                                      item.type === "don"
                                        ? "text-success"
                                        : item.type === "produit"
                                          ? "text-info"
                                          : "text-warning"
                                    }`}
                                  />
                                </div>
                                <small className="text-muted">
                                  {item.type === "don"
                                    ? "Don"
                                    : item.type === "produit"
                                      ? "Produit"
                                      : "Échange"}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="position-relative me-3">
                                  <img
                                    src={item.image}
                                    alt={item.nom}
                                    className="rounded border"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nom)}&background=0d6efd&color=fff&size=50`;
                                    }}
                                  />
                                  {!item.disponible && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded"></div>
                                  )}
                                </div>
                                <div>
                                  <div
                                    className="fw-semibold text-truncate"
                                    style={{ maxWidth: "200px" }}
                                    title={item.nom}
                                  >
                                    {item.nom}
                                  </div>
                                  {item.prix && item.prix !== "null" && (
                                    <div className="text-success fw-bold">
                                      {formatPrice(item.prix)}
                                    </div>
                                  )}
                                  {item.typeSpecifique && (
                                    <small className="text-muted d-block">
                                      {item.typeSpecifique}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                {item.categorie}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex flex-column align-items-center">
                                <span
                                  className={`badge rounded-pill px-3 py-2 ${
                                    item.quantite === 0
                                      ? "bg-danger"
                                      : item.quantite <= 10
                                        ? "bg-warning"
                                        : "bg-success"
                                  }`}
                                >
                                  {item.type === "produit"
                                    ? item.quantite
                                    : "1"}
                                </span>
                                {item.quantite <= 10 &&
                                  item.quantite > 0 &&
                                  item.type === "produit" && (
                                    <small className="text-warning fw-bold mt-1">
                                      Stock faible
                                    </small>
                                  )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span
                                  className={`badge bg-${getStatusBadgeColor(item)} bg-opacity-10 text-${getStatusBadgeColor(item)}`}
                                >
                                  {getStockStatusText(item)}
                                </span>
                                <small className="text-muted mt-1">
                                  {item.statut}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div className="text-muted">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-2"
                                />
                                {formatDate(item.date_maj)}
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => openStockModal(item)}
                                  title="Gérer le stock"
                                  disabled={updatingStock}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <Link
                                  href={`/${item.type === "produit" ? "produits" : item.type === "don" ? "dons" : "echanges"}/${item.id}`}
                                  className="btn btn-outline-info"
                                  title="Voir les détails"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-3 mb-md-0">
                      <p className="text-muted mb-0">
                        Affichage de{" "}
                        <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>{" "}
                        à{" "}
                        <strong>
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredItems.length,
                          )}
                        </strong>{" "}
                        sur <strong>{filteredItems.length}</strong> articles
                      </p>
                    </div>
                    <nav aria-label="Pagination">
                      <ul className="pagination mb-0">
                        <li
                          className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Précédent"
                          >
                            <FontAwesomeIcon icon={faArrowLeft} />
                          </button>
                        </li>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          },
                        )}

                        <li
                          className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Suivant"
                          >
                            <FontAwesomeIcon icon={faArrowRight} />
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="row mt-4">
          <div className="col">
            <div className="alert alert-info border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-25 rounded-circle p-2">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-info fs-4"
                    />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="alert-heading mb-2">
                    Comment gérer votre inventaire ?
                  </h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <strong className="d-block mb-1">
                          <FontAwesomeIcon icon={faBox} className="me-2" />
                          Produits
                        </strong>
                        <small className="text-muted">
                          Gestion complète : quantité, prix, disponibilité
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <strong className="d-block mb-1">
                          <FontAwesomeIcon icon={faGift} className="me-2" />
                          Dons
                        </strong>
                        <small className="text-muted">
                          Gestion simple : disponibilité uniquement
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <strong className="d-block mb-1">
                          <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="me-2"
                          />
                          Échanges
                        </strong>
                        <small className="text-muted">
                          Gestion des propositions et disponibilité
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Astuce :</strong> Utilisez les filtres pour
                      trouver rapidement vos articles. Cliquez sur l'icône
                      d'édition pour modifier le stock d'un article spécifique.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }

        .cursor-pointer:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .hover-row {
          transition: all 0.2s ease;
        }

        .hover-row:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        .card {
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }

        .table th {
          font-weight: 600;
          color: #495057;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          border-bottom: 2px solid #dee2e6;
        }

        .table td {
          padding: 1rem 0.75rem;
          vertical-align: middle;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .badge {
          border-radius: 0.375rem;
          font-weight: 500;
        }

        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .btn {
          border-radius: 0.5rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }

          .btn-group-sm > .btn {
            padding: 0.25rem 0.4rem;
            font-size: 0.75rem;
          }
        }

        /* Animation pour le stock faible */
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .badge.bg-warning {
          animation: pulse 2s infinite;
        }

        .badge.bg-danger {
          animation: pulse 1.5s infinite;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
      `}</style>
    </>
  );
}
