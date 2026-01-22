"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faEye,
  faTrash,
  faRefresh,
  faFilter,
  faSearch,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTag,
  faMoneyBillWave,
  faCalendar,
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faEdit,
  faToggleOn,
  faToggleOff,
  faCheck,
  faImage,
  faUser,
  faStore,
  faLayerGroup,
  faChartLine,
  faSpinner,
  faUserTag,
  faShop,
  faArrowRight,
  faExternalLinkAlt,
  faShoppingBag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";
import Link from "next/link";

interface ProduitUtilisateur {
  id: number;
  uuid: string;
  libelle: string;
  description: string | null;
  prix: string;
  quantite: number;
  statut: string;
  estPublie: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  image: string | null;
  categorie: {
    id: number;
    uuid: string;
    type: string;
    libelle: string;
    description: string;
    image: string;
  };
  // Propriétés mises à jour pour gérer les deux cas
  utilisateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string;
    email: string;
    telephone?: string;
    is_admin?: boolean;
    role?: {
      name: string;
    };
  };
  boutique?: {
    uuid: string;
    nom: string;
    logo: string | null;
    slug: string;
    description: string | null;
    statut: string;
    typeBoutique?: {
      libelle: string;
    };
  };
  // Pour compatibilité avec l'ancienne structure
  source?: {
    type: string;
    infos: {
      uuid: string;
      nom: string;
      prenoms: string;
      avatar: string;
      email: string;
    };
  };
}

interface SortConfig {
  key: keyof ProduitUtilisateur | "sourceType" | "ownerName";
  direction: "asc" | "desc";
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ListeProduitsCreeUtilisateur() {
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all"); // Nouveau filtre: utilisateur/boutique
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    averagePrice: 0,
    publishedCount: 0,
    unpublishedCount: 0,
    totalQuantity: 0,
    withImageCount: 0,
    userProducts: 0,
    boutiqueProducts: 0,
  });

  // Informations utilisateur
  const [utilisateurInfo, setUtilisateurInfo] = useState<{
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string;
    email: string;
  } | null>(null);

  // Charger les produits - VERSION CORRIGÉE
  const fetchProduitsUtilisateur = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Chargement des produits de l'utilisateur...");

      const response = await api.get(
        "/produits/liste-mes-utilisateur-produits",
      );

      console.log("📦 Réponse API complète:", response);

      // Vérifier que response.data existe
      if (!response.data) {
        throw new Error("Aucune donnée reçue de l'API");
      }

      console.log("📦 response.data:", response.data);
      console.log("📦 Status:", response.data?.status);
      console.log("📦 Has data property:", !!response.data?.data);
      console.log("📦 Data content:", response.data?.data);

      // Format 1: Votre API retourne { status: "success", data: { produits: [...] } }
      if (response.data?.status === "success" && response.data.data) {
        console.log("✅ Format détecté: status success avec data");

        const data = response.data.data;
        console.log("📦 Données extraites:", data);

        // Vérifier que data.produits existe et est un tableau
        if (data.produits && Array.isArray(data.produits)) {
          const produitsData = data.produits;
          const paginationData = data.pagination;
          const utilisateurData = data.utilisateur;

          console.log(`✅ ${produitsData.length} produit(s) trouvé(s)`);
          console.log("📦 Premier produit:", produitsData[0]);

          // Normaliser les données des produits
          const normalizedProduits = produitsData.map((produit: any) => {
            // Si le produit a une propriété 'source', la décomposer
            if (produit.source) {
              if (
                produit.source.type === "utilisateur" &&
                produit.source.infos
              ) {
                return {
                  ...produit,
                  utilisateur: produit.source.infos,
                  boutique: undefined,
                };
              } else if (
                produit.source.type === "boutique" &&
                produit.source.infos
              ) {
                return {
                  ...produit,
                  boutique: produit.source.infos,
                  utilisateur: undefined,
                };
              }
            }
            return produit;
          });

          console.log("📦 Produits normalisés:", normalizedProduits);

          // Mettre à jour les états
          setProduits(normalizedProduits);

          if (utilisateurData) {
            setUtilisateurInfo(utilisateurData);
          }

          // Calculer les stats
          const total = normalizedProduits.length;
          const totalValue = normalizedProduits.reduce(
            (sum: number, produit: ProduitUtilisateur) =>
              sum + parseFloat(produit.prix) * produit.quantite,
            0,
          );
          const averagePrice = total > 0 ? totalValue / total : 0;
          const publishedCount = normalizedProduits.filter(
            (p: ProduitUtilisateur) => p.estPublie,
          ).length;
          const unpublishedCount = total - publishedCount;
          const totalQuantity = normalizedProduits.reduce(
            (sum: number, produit: ProduitUtilisateur) =>
              sum + produit.quantite,
            0,
          );
          const withImageCount = normalizedProduits.filter(
            (p: ProduitUtilisateur) => p.image,
          ).length;
          const userProducts = normalizedProduits.filter(
            (p: ProduitUtilisateur) => p.utilisateur,
          ).length;
          const boutiqueProducts = normalizedProduits.filter(
            (p: ProduitUtilisateur) => p.boutique,
          ).length;

          setStats({
            total,
            totalValue,
            averagePrice,
            publishedCount,
            unpublishedCount,
            totalQuantity,
            withImageCount,
            userProducts,
            boutiqueProducts,
          });

          // Mettre à jour la pagination
          if (paginationData) {
            setPagination({
              page: paginationData.page || 1,
              limit: paginationData.limit || 10,
              total: paginationData.total || normalizedProduits.length,
              pages:
                paginationData.totalPages ||
                Math.ceil(normalizedProduits.length / 10),
            });
          } else {
            setPagination({
              page: 1,
              limit: 10,
              total: normalizedProduits.length,
              pages: Math.ceil(normalizedProduits.length / 10),
            });
          }
        } else {
          console.warn("⚠️ data.produits n'est pas un tableau:", data.produits);
          setProduits([]);
          resetStats();
        }
      }
      // Format alternatif: produits directement dans data
      else if (Array.isArray(response.data)) {
        console.log("✅ Format détecté: tableau direct");
        const normalizedProduits = response.data.map((produit: any) => {
          if (produit.source) {
            if (produit.source.type === "utilisateur" && produit.source.infos) {
              return {
                ...produit,
                utilisateur: produit.source.infos,
                boutique: undefined,
              };
            } else if (
              produit.source.type === "boutique" &&
              produit.source.infos
            ) {
              return {
                ...produit,
                boutique: produit.source.infos,
                utilisateur: undefined,
              };
            }
          }
          return produit;
        });
        setProduits(normalizedProduits);
        calculateStats(normalizedProduits);
      }
      // Format alternatif: produits dans une propriété 'produits'
      else if (
        response.data.produits &&
        Array.isArray(response.data.produits)
      ) {
        console.log("✅ Format détecté: produits direct");
        const normalizedProduits = response.data.produits.map(
          (produit: any) => {
            if (produit.source) {
              if (
                produit.source.type === "utilisateur" &&
                produit.source.infos
              ) {
                return {
                  ...produit,
                  utilisateur: produit.source.infos,
                  boutique: undefined,
                };
              } else if (
                produit.source.type === "boutique" &&
                produit.source.infos
              ) {
                return {
                  ...produit,
                  boutique: produit.source.infos,
                  utilisateur: undefined,
                };
              }
            }
            return produit;
          },
        );
        setProduits(normalizedProduits);
        calculateStats(normalizedProduits);
      } else {
        console.error("❌ Format de réponse inattendu:", response.data);
        throw new Error("Format de réponse API non reconnu");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits:", err);

      let errorMessage = "Erreur lors du chargement de vos produits";

      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status === 404) {
        errorMessage = "Aucun produit trouvé pour votre compte.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setProduits([]);
      resetStats();
    } finally {
      setLoading(false);
      console.log("🏁 Chargement terminé");
    }
  }, []);

  useEffect(() => {
    fetchProduitsUtilisateur();
  }, [fetchProduitsUtilisateur]);

  // Calcul des statistiques
  const calculateStats = (produitsList: ProduitUtilisateur[]) => {
    const total = produitsList.length;
    const totalValue = produitsList.reduce(
      (sum, produit) => sum + parseFloat(produit.prix) * produit.quantite,
      0,
    );
    const averagePrice = total > 0 ? totalValue / total : 0;
    const publishedCount = produitsList.filter((p) => p.estPublie).length;
    const unpublishedCount = total - publishedCount;
    const totalQuantity = produitsList.reduce(
      (sum, produit) => sum + produit.quantite,
      0,
    );
    const withImageCount = produitsList.filter((p) => p.image).length;
    const userProducts = produitsList.filter((p) => p.utilisateur).length;
    const boutiqueProducts = produitsList.filter((p) => p.boutique).length;

    setStats({
      total,
      totalValue,
      averagePrice,
      publishedCount,
      unpublishedCount,
      totalQuantity,
      withImageCount,
      userProducts,
      boutiqueProducts,
    });
  };

  const resetStats = () => {
    setStats({
      total: 0,
      totalValue: 0,
      averagePrice: 0,
      publishedCount: 0,
      unpublishedCount: 0,
      totalQuantity: 0,
      withImageCount: 0,
      userProducts: 0,
      boutiqueProducts: 0,
    });
  };

  // Filtrage et tri
  const filteredProduits = useMemo(() => {
    console.log("🔍 Filtrage des produits...");
    console.log("📦 Produits totaux:", produits.length);
    console.log("🔍 Terme de recherche:", searchTerm);
    console.log("🔍 Filtre source:", sourceFilter);

    let result = produits.filter((produit) => {
      // Filtre par recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        produit.libelle.toLowerCase().includes(searchLower) ||
        (produit.description &&
          produit.description.toLowerCase().includes(searchLower)) ||
        produit.prix.toString().includes(searchTerm) ||
        produit.categorie.libelle.toLowerCase().includes(searchLower) ||
        (produit.utilisateur &&
          (`${produit.utilisateur.prenoms} ${produit.utilisateur.nom}`
            .toLowerCase()
            .includes(searchLower) ||
            produit.utilisateur.email.toLowerCase().includes(searchLower))) ||
        (produit.boutique &&
          (produit.boutique.nom.toLowerCase().includes(searchLower) ||
            (produit.boutique.description &&
              produit.boutique.description
                .toLowerCase()
                .includes(searchLower))));

      // Filtre par statut
      const matchesStatus =
        statusFilter === "all" || produit.statut === statusFilter;

      // Filtre par publication
      const matchesPublish =
        publishFilter === "all" ||
        (publishFilter === "published" && produit.estPublie) ||
        (publishFilter === "unpublished" && !produit.estPublie);

      // Filtre par source (utilisateur/boutique)
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "utilisateur" && produit.utilisateur) ||
        (sourceFilter === "boutique" && produit.boutique);

      // Filtre par prix
      const prixNumber = parseFloat(produit.prix);
      const matchesPrice =
        prixNumber >= priceRange[0] && prixNumber <= priceRange[1];

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPublish &&
        matchesSource &&
        matchesPrice
      );
    });

    console.log("✅ Produits filtrés:", result.length);

    // Tri
    if (sortConfig) {
      console.log("🔀 Tri par:", sortConfig.key, sortConfig.direction);
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ProduitUtilisateur];
        const bValue = b[sortConfig.key as keyof ProduitUtilisateur];

        // Tri par type de source
        if (sortConfig.key === "sourceType") {
          const aType = a.utilisateur ? "utilisateur" : "boutique";
          const bType = b.utilisateur ? "utilisateur" : "boutique";
          return sortConfig.direction === "asc"
            ? aType.localeCompare(bType)
            : bType.localeCompare(aType);
        }

        // Tri par nom du propriétaire
        if (sortConfig.key === "ownerName") {
          const aName = a.utilisateur
            ? `${a.utilisateur.prenoms} ${a.utilisateur.nom}`
            : a.boutique
              ? a.boutique.nom
              : "";
          const bName = b.utilisateur
            ? `${b.utilisateur.prenoms} ${b.utilisateur.nom}`
            : b.boutique
              ? b.boutique.nom
              : "";
          return sortConfig.direction === "asc"
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        }

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Gestion spéciale pour le prix (string)
        if (sortConfig.key === "prix") {
          const prixA = parseFloat(a.prix);
          const prixB = parseFloat(b.prix);
          return sortConfig.direction === "asc" ? prixA - prixB : prixB - prixA;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    // Mettre à jour la pagination locale
    const newTotal = result.length;
    const newPages = Math.ceil(newTotal / pagination.limit);

    setPagination((prev) => ({
      ...prev,
      total: newTotal,
      pages: newPages,
      page: prev.page > newPages ? 1 : prev.page, // Ajuster la page si nécessaire
    }));

    return result;
  }, [
    produits,
    searchTerm,
    statusFilter,
    publishFilter,
    sourceFilter,
    priceRange,
    sortConfig,
    pagination.limit,
  ]);

  // Produits de la page courante
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const items = filteredProduits.slice(startIndex, endIndex);

    console.log("📄 Page courante:", pagination.page);
    console.log("📄 Items sur la page:", items.length);
    console.log("📄 Index:", startIndex, "à", endIndex);

    return items;
  }, [filteredProduits, pagination.page, pagination.limit]);

  const requestSort = (key: SortConfig["key"]) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig["key"]) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-muted ms-1"
          style={{ fontSize: "0.8rem" }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    );
  };

  // Formatage
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Récupérer l'image du produit
  const getProductImage = (produit: ProduitUtilisateur) => {
    if (produit.image) {
      return produit.image;
    }

    // Image par défaut avec les initiales du produit
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=80&bold=true`;
  };

  // Récupérer l'image de l'utilisateur
  const getUserImage = (produit: ProduitUtilisateur) => {
    if (produit.utilisateur?.avatar) {
      return produit.utilisateur.avatar;
    }

    // Initiales de l'utilisateur
    const name = produit.utilisateur
      ? `${produit.utilisateur.prenoms} ${produit.utilisateur.nom}`
      : "Utilisateur";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=48`;
  };

  // Récupérer l'image de la boutique
  const getBoutiqueImage = (produit: ProduitUtilisateur) => {
    if (produit.boutique?.logo) {
      return produit.boutique.logo;
    }

    // Initiales de la boutique
    const name = produit.boutique?.nom || "Boutique";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=20c997&color=fff&size=48`;
  };

  // Obtenir le lien du profil
  const getProfileLink = (produit: ProduitUtilisateur) => {
    if (produit.utilisateur) {
      return `/profiles/utilisateurs/${produit.utilisateur.uuid}`;
    }
    if (produit.boutique) {
      return `/boutiques/${produit.boutique.uuid}`;
    }
    return "#";
  };

  // Obtenir le type de source
  const getSourceType = (produit: ProduitUtilisateur) => {
    if (produit.utilisateur) {
      return "utilisateur";
    }
    if (produit.boutique) {
      return "boutique";
    }
    return "inconnu";
  };

  // Obtenir le nom du propriétaire
  const getOwnerName = (produit: ProduitUtilisateur) => {
    if (produit.utilisateur) {
      return `${produit.utilisateur.prenoms} ${produit.utilisateur.nom}`;
    }
    if (produit.boutique) {
      return produit.boutique.nom;
    }
    return "Inconnu";
  };

  // Obtenir l'email du propriétaire
  const getOwnerEmail = (produit: ProduitUtilisateur) => {
    if (produit.utilisateur) {
      return produit.utilisateur.email;
    }
    if (produit.boutique && produit.boutique.description) {
      // Peut contenir des infos de contact
      return (
        produit.boutique.description.substring(0, 50) +
        (produit.boutique.description.length > 50 ? "..." : "")
      );
    }
    return "Non spécifié";
  };

  const getStatusBadge = (statut: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      publie: { color: "success", text: "Publié" },
      en_attente: { color: "warning", text: "En attente" },
      rejete: { color: "danger", text: "Rejeté" },
      brouillon: { color: "secondary", text: "Brouillon" },
    };

    const status = statusMap[statut] || { color: "info", text: statut };
    return (
      <span
        className={`badge bg-${status.color} bg-opacity-10 text-${status.color}`}
      >
        {status.text}
      </span>
    );
  };

  // Actions
  const handleTogglePublish = async (
    produitUuid: string,
    currentState: boolean,
  ) => {
    const action = currentState ? "dépublier" : "publier";
    if (!confirm(`Voulez-vous ${action} ce produit ?`)) return;

    try {
      // TODO: Implémenter l'appel API pour publier/dépublier
      // const endpoint = currentState ? `/produits/${produitUuid}/unpublish` : `/produits/${produitUuid}/publish`;
      // const response = await api.post(endpoint);

      // Simulation
      setProduits((prev) =>
        prev.map((p) =>
          p.uuid === produitUuid ? { ...p, estPublie: !currentState } : p,
        ),
      );

      const successMsg = `Produit ${action} avec succès !`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(`Erreur lors de ${action}:`, err);
      setError(
        err.response?.data?.message || `Erreur lors de ${action} du produit`,
      );
    }
  };

  const handleDeleteProduit = async (produitUuid: string) => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.",
      )
    )
      return;

    try {
      // TODO: Implémenter l'appel API pour supprimer
      // const response = await api.delete(`/produits/${produitUuid}`);

      setProduits((prev) => prev.filter((p) => p.uuid !== produitUuid));
      const successMsg = "Produit supprimé avec succès !";
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la suppression du produit",
      );
    }
  };

  const handleEditProduit = (produitUuid: string) => {
    // TODO: Rediriger vers la page d'édition
    console.log("Éditer le produit:", produitUuid);
    alert(`Redirection vers l'édition du produit: ${produitUuid}`);
    // window.location.href = `/produits/editer/${produitUuid}`;
  };

  const handleViewDetails = (produit: ProduitUtilisateur) => {
    console.log("Voir détails:", produit);

    let ownerInfo = "";
    if (produit.utilisateur) {
      ownerInfo = `\nPropriétaire: ${produit.utilisateur.prenoms} ${produit.utilisateur.nom}\nEmail: ${produit.utilisateur.email}`;
    } else if (produit.boutique) {
      ownerInfo = `\nBoutique: ${produit.boutique.nom}\nStatut: ${produit.boutique.statut}`;
    }

    alert(
      `Détails du produit:\n\n` +
        `Nom: ${produit.libelle}\n` +
        `Prix: ${formatPrice(produit.prix)}\n` +
        `Quantité: ${produit.quantite}\n` +
        `Statut: ${produit.statut}\n` +
        `Publié: ${produit.estPublie ? "Oui" : "Non"}\n` +
        `Catégorie: ${produit.categorie.libelle}\n` +
        `Type: ${produit.utilisateur ? "Produit utilisateur" : "Produit boutique"}` +
        ownerInfo +
        `\nDate de création: ${formatDate(produit.createdAt)}\n` +
        `Dernière modification: ${formatDate(produit.updatedAt)}`,
    );
  };

  // Naviguer vers le profil
  const handleViewProfile = (produit: ProduitUtilisateur) => {
    const link = getProfileLink(produit);
    if (link !== "#") {
      window.open(link, "_blank");
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "publish" | "unpublish" | "delete",
  ) => {
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const actionText = {
      publish: "publier",
      unpublish: "dépublier",
      delete: "supprimer",
    }[action];

    if (
      !confirm(
        `Voulez-vous ${actionText} ${selectedProduits.length} produit(s) ?`,
      )
    )
      return;

    try {
      // TODO: Implémenter les appels API en masse
      if (action === "delete") {
        setProduits((prev) =>
          prev.filter((p) => !selectedProduits.includes(p.uuid)),
        );
      } else {
        const newPublishedState = action === "publish";
        setProduits((prev) =>
          prev.map((p) =>
            selectedProduits.includes(p.uuid)
              ? { ...p, estPublie: newPublishedState }
              : p,
          ),
        );
      }

      setSelectedProduits([]);
      const successMsg = `${selectedProduits.length} produit(s) ${actionText}(s) avec succès`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(`Erreur lors de ${action}:`, err);
      setError(`Erreur lors de ${action} des produits`);
    }
  };

  const handleSelectProduit = (produitUuid: string) => {
    setSelectedProduits((prev) =>
      prev.includes(produitUuid)
        ? prev.filter((id) => id !== produitUuid)
        : [...prev, produitUuid],
    );
  };

  const handleSelectAll = () => {
    if (
      selectedProduits.length === currentItems.length &&
      currentItems.length > 0
    ) {
      setSelectedProduits([]);
    } else {
      setSelectedProduits(currentItems.map((p) => p.uuid));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProduits.length === 0) {
      setError("Aucun produit à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const headers = [
      "UUID",
      "Libellé",
      "Description",
      "Prix",
      "Quantité",
      "Statut",
      "Publié",
      "Catégorie",
      "Type Propriétaire",
      "Propriétaire",
      "Email",
      "Date création",
      "Date modification",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredProduits.map((produit) =>
        [
          produit.uuid,
          escapeCsv(produit.libelle),
          escapeCsv(produit.description || ""),
          produit.prix,
          produit.quantite,
          produit.statut,
          produit.estPublie ? "Oui" : "Non",
          escapeCsv(produit.categorie.libelle),
          produit.utilisateur ? "Utilisateur" : "Boutique",
          escapeCsv(getOwnerName(produit)),
          escapeCsv(getOwnerEmail(produit)),
          produit.createdAt ? formatDate(produit.createdAt) : "",
          produit.updatedAt ? formatDate(produit.updatedAt) : "",
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
      `mes-produits-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const successMsg = "Export CSV réussi !";
    setSuccessMessage(successMsg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPublishFilter("all");
    setSourceFilter("all");
    setPriceRange([0, 1000000]);
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedProduits([]);
  };

  // Calculer le prix max pour le filtre
  const maxPrice = useMemo(() => {
    if (produits.length === 0) return 1000000;
    const max = Math.max(...produits.map((p) => parseFloat(p.prix)));
    return max > 0 ? max : 1000000;
  }, [produits]);

  // Composant de chargement
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="text-center py-5">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-primary"
                style={{ fontSize: "3rem" }}
              />
              <h4 className="mt-4 fw-bold">Chargement de vos produits...</h4>
              <p className="text-muted">
                Veuillez patienter pendant le chargement de vos données
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec info utilisateur */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-3">
              {utilisateurInfo?.avatar && (
                <div className="position-relative me-3">
                  <img
                    src={utilisateurInfo.avatar}
                    alt={`${utilisateurInfo.prenoms} ${utilisateurInfo.nom}`}
                    className="rounded-circle border"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(utilisateurInfo.prenoms + " " + utilisateurInfo.nom)}&background=007bff&color=fff&size=64`;
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="h2 fw-bold mb-1">Mes Produits</h1>
                {utilisateurInfo && (
                  <p className="text-muted mb-0">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {utilisateurInfo.prenoms} {utilisateurInfo.nom}
                    <span className="ms-2 badge bg-primary">
                      {utilisateurInfo.email}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <p className="text-muted mb-0">
              Liste des produits que vous avez créés sur la plateforme
              {searchTerm && ` - Recherche: "${searchTerm}"`}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchProduitsUtilisateur}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRefresh} spin={loading} />
              Rafraîchir
            </button>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              disabled={filteredProduits.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} />
              Exporter CSV
            </button>
            <button
              onClick={resetFilters}
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.red}20` }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1 fw-bold">Erreur</h6>
                <p className="mb-0">{error}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Fermer"
              />
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.green}20` }}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success"
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1 fw-bold">Succès</h6>
                <p className="mb-0">{successMessage}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
                aria-label="Fermer"
              />
            </div>
          </div>
        )}

        {/* Cartes de statistiques */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.blue}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.blue}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faBox} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-muted small">Total produits</div>
                    <div className="fw-bold fs-4">{stats.total}</div>
                    <div className="text-muted small">
                      {filteredProduits.length} filtré(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.green}15 0%, ${colors.oskar.green}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.green}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faToggleOn}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Publiés</div>
                    <div className="fw-bold fs-4">{stats.publishedCount}</div>
                    <div className="text-muted small">
                      {stats.unpublishedCount} non publié(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.yellow}15 0%, ${colors.oskar.yellow}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.yellow}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Valeur totale</div>
                    <div className="fw-bold fs-4">
                      {formatPrice(stats.totalValue)}
                    </div>
                    <div className="text-muted small">
                      {formatPrice(stats.averagePrice)} moyenne
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.purple}15 0%, ${colors.oskar.purple}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.purple}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faUserTag} className="text-purple" />
                  </div>
                  <div>
                    <div className="text-muted small">Utilisateur</div>
                    <div className="fw-bold fs-4">{stats.userProducts}</div>
                    <div className="text-muted small">Produits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.orange}15 0%, ${colors.oskar.orange}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.orange}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faShop} className="text-orange" />
                  </div>
                  <div>
                    <div className="text-muted small">Boutique</div>
                    <div className="fw-bold fs-4">{stats.boutiqueProducts}</div>
                    <div className="text-muted small">Produits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.red}15 0%, ${colors.oskar.red}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.red}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faStore} className="text-red" />
                  </div>
                  <div>
                    <div className="text-muted small">Sélectionnés</div>
                    <div className="fw-bold fs-4">
                      {selectedProduits.length}
                    </div>
                    <div className="text-muted small">
                      {selectedProduits.length > 0
                        ? "Actions disponibles"
                        : "Sélectionnez"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher par nom, propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Rechercher des produits"
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchTerm("")}
                    aria-label="Effacer la recherche"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="publie">Publié</option>
                  <option value="en_attente">En attente</option>
                  <option value="rejete">Rejeté</option>
                  <option value="brouillon">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faToggleOn} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={publishFilter}
                  onChange={(e) => setPublishFilter(e.target.value)}
                  aria-label="Filtrer par publication"
                >
                  <option value="all">Tous</option>
                  <option value="published">Publiés uniquement</option>
                  <option value="unpublished">Non publiés</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faUser} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  aria-label="Filtrer par source"
                >
                  <option value="all">Toutes sources</option>
                  <option value="utilisateur">Utilisateur</option>
                  <option value="boutique">Boutique</option>
                </select>
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="text-muted"
                  />
                </span>
                <input
                  type="range"
                  className="form-range border-start-0"
                  min="0"
                  max={maxPrice}
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  aria-label="Filtrer par prix maximum"
                />
                <span className="input-group-text">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>
          </div>

          {/* Informations de filtrage */}
          <div className="row mt-3">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faFilter} className="me-1" />
                  {filteredProduits.length} produit(s) sur {produits.length}
                  {searchTerm && (
                    <>
                      {" "}
                      pour "<strong>{searchTerm}</strong>"
                    </>
                  )}
                  {sourceFilter !== "all" && (
                    <>
                      {" "}
                      • Source:{" "}
                      <strong>
                        {sourceFilter === "utilisateur"
                          ? "Utilisateur"
                          : "Boutique"}
                      </strong>
                    </>
                  )}
                </small>
                {selectedProduits.length > 0 && (
                  <small className="text-primary fw-semibold">
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    {selectedProduits.length} sélectionné(s)
                  </small>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <small className="text-muted">
                Page {pagination.page} sur {pagination.pages} •{" "}
                {pagination.limit} par page
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en masse */}
      {selectedProduits.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBox} className="text-primary me-2" />
                <span className="fw-semibold">
                  {selectedProduits.length} produit(s) sélectionné(s)
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("publish")}
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOn} />
                  Publier
                </button>
                <button
                  onClick={() => handleBulkAction("unpublish")}
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOff} />
                  Dépublier
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedProduits([])}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredProduits.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <FontAwesomeIcon icon={faBox} className="fs-1 text-muted" />
              </div>
              <h4 className="fw-bold mb-3">
                {produits.length === 0
                  ? "Aucun produit créé"
                  : "Aucun résultat"}
              </h4>
              <p className="text-muted mb-4">
                {produits.length === 0
                  ? "Vous n'avez pas encore créé de produits."
                  : "Aucun produit ne correspond à vos critères de recherche."}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                publishFilter !== "all" ||
                sourceFilter !== "all" ||
                priceRange[1] < maxPrice) && (
                <button onClick={resetFilters} className="btn btn-primary me-2">
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Réinitialiser les filtres
                </button>
              )}
              <button
                onClick={fetchProduitsUtilisateur}
                className="btn btn-outline-secondary"
              >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Recharger
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="text-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectedProduits.length === currentItems.length &&
                              currentItems.length > 0
                            }
                            onChange={handleSelectAll}
                            aria-label="Sélectionner tous les produits de la page"
                          />
                        </div>
                      </th>
                      <th style={{ width: "100px" }} className="text-center">
                        Produit
                      </th>
                      <th style={{ width: "250px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("libelle")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Détails {getSortIcon("libelle")}
                        </button>
                      </th>
                      <th style={{ width: "200px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("ownerName")}
                        >
                          <FontAwesomeIcon icon={faUser} className="me-1" />
                          Propriétaire {getSortIcon("ownerName")}
                        </button>
                      </th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("prix")}
                        >
                          <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="me-1"
                          />
                          Prix {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>Quantité</th>
                      <th style={{ width: "120px" }}>Statut</th>
                      <th style={{ width: "120px" }}>Publication</th>
                      <th style={{ width: "180px" }}>Date modification</th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((produit) => (
                      <tr
                        key={produit.uuid}
                        className={
                          selectedProduits.includes(produit.uuid)
                            ? "table-active"
                            : ""
                        }
                      >
                        <td className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedProduits.includes(produit.uuid)}
                              onChange={() => handleSelectProduit(produit.uuid)}
                              aria-label={`Sélectionner ${produit.libelle}`}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <div
                            className="position-relative mx-auto"
                            style={{ width: "80px", height: "80px" }}
                          >
                            <img
                              src={getProductImage(produit)}
                              alt={produit.libelle}
                              className="img-fluid rounded border"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=80&bold=true`;
                              }}
                            />
                            {!produit.image && (
                              <div className="position-absolute bottom-0 end-0 translate-middle">
                                <span
                                  className="badge bg-warning rounded-circle p-1"
                                  style={{ fontSize: "0.6rem" }}
                                  title="Image par défaut"
                                >
                                  <FontAwesomeIcon icon={faImage} />
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold mb-1">
                            {produit.libelle}
                          </div>
                          {produit.description && (
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: "200px" }}
                              title={produit.description}
                            >
                              {produit.description.substring(0, 80)}
                              {produit.description.length > 80 ? "..." : ""}
                            </small>
                          )}
                          <div className="mt-2">
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faLayerGroup}
                                className="me-1"
                              />
                              {produit.categorie.libelle}
                            </small>
                          </div>
                          <div>
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé: {formatDate(produit.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="position-relative">
                              <img
                                src={
                                  produit.utilisateur
                                    ? getUserImage(produit)
                                    : getBoutiqueImage(produit)
                                }
                                alt={getOwnerName(produit)}
                                className="rounded-circle border cursor-pointer"
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleViewProfile(produit)}
                                title={`Voir profil ${produit.utilisateur ? "utilisateur" : "boutique"}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    produit.utilisateur
                                      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(getOwnerName(produit))}&background=6c757d&color=fff&size=48`
                                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(getOwnerName(produit))}&background=20c997&color=fff&size=48`;
                                }}
                              />
                              <div className="position-absolute bottom-0 end-0 translate-middle">
                                <span
                                  className={`badge ${produit.utilisateur ? "bg-info" : "bg-success"} rounded-circle p-1`}
                                  style={{ fontSize: "0.6rem" }}
                                  title={
                                    produit.utilisateur
                                      ? "Utilisateur"
                                      : "Boutique"
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={produit.utilisateur ? faUser : faShop}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="ms-3">
                              <div
                                className="fw-medium cursor-pointer hover-text-primary"
                                onClick={() => handleViewProfile(produit)}
                                style={{ cursor: "pointer" }}
                                title={`Voir profil ${produit.utilisateur ? "utilisateur" : "boutique"}`}
                              >
                                {getOwnerName(produit)}
                                <FontAwesomeIcon
                                  icon={faExternalLinkAlt}
                                  className="ms-1 text-muted"
                                  style={{ fontSize: "0.7rem" }}
                                />
                              </div>
                              <small className="text-muted d-block">
                                {produit.utilisateur
                                  ? "Utilisateur"
                                  : "Boutique"}
                              </small>
                              <small className="text-muted">
                                {getOwnerEmail(produit)}
                              </small>
                              {produit.utilisateur?.role && (
                                <div className="mt-1">
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                    {produit.utilisateur.role.name}
                                  </span>
                                </div>
                              )}
                              {produit.boutique?.typeBoutique && (
                                <div className="mt-1">
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    {produit.boutique.typeBoutique.libelle}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            {formatPrice(produit.prix)}
                          </div>
                          <small className="text-muted">par unité</small>
                        </td>
                        <td>
                          <div className="fw-semibold">{produit.quantite}</div>
                          <small className="text-muted">en stock</small>
                        </td>
                        <td>{getStatusBadge(produit.statut)}</td>
                        <td>
                          {produit.estPublie ? (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <FontAwesomeIcon
                                icon={faToggleOn}
                                className="me-1"
                              />
                              Publié
                            </span>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              <FontAwesomeIcon
                                icon={faToggleOff}
                                className="me-1"
                              />
                              Non publié
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fw-medium">
                            {formatDate(produit.updatedAt)}
                          </div>
                          <small className="text-muted">modifié</small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-info"
                              title="Voir détails"
                              onClick={() => handleViewDetails(produit)}
                              aria-label={`Voir détails de ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Éditer"
                              onClick={() => handleEditProduit(produit.uuid)}
                              aria-label={`Éditer ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className={`btn ${produit.estPublie ? "btn-outline-warning" : "btn-outline-success"}`}
                              title={
                                produit.estPublie ? "Dépublier" : "Publier"
                              }
                              onClick={() =>
                                handleTogglePublish(
                                  produit.uuid,
                                  produit.estPublie,
                                )
                              }
                              aria-label={`${produit.estPublie ? "Dépublier" : "Publier"} ${produit.libelle}`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  produit.estPublie ? faToggleOff : faToggleOn
                                }
                              />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => handleDeleteProduit(produit.uuid)}
                              aria-label={`Supprimer ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                          <div className="mt-2">
                            <button
                              className="btn btn-sm btn-outline-secondary w-100"
                              title="Voir profil propriétaire"
                              onClick={() => handleViewProfile(produit)}
                              aria-label={`Voir profil de ${getOwnerName(produit)}`}
                            >
                              <FontAwesomeIcon
                                icon={faArrowRight}
                                className="me-1"
                              />
                              Profil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Affichage de{" "}
                        <strong>
                          {(pagination.page - 1) * pagination.limit + 1}
                        </strong>{" "}
                        à{" "}
                        <strong>
                          {Math.min(
                            pagination.page * pagination.limit,
                            filteredProduits.length,
                          )}
                        </strong>{" "}
                        sur <strong>{filteredProduits.length}</strong>{" "}
                        produit(s)
                      </small>
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page - 1,
                              }))
                            }
                            disabled={pagination.page === 1}
                            aria-label="Page précédente"
                          >
                            &laquo;
                          </button>
                        </li>

                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let startPage = Math.max(
                            1,
                            pagination.page - Math.floor(maxVisible / 2),
                          );
                          let endPage = Math.min(
                            pagination.pages,
                            startPage + maxVisible - 1,
                          );

                          if (endPage - startPage + 1 < maxVisible) {
                            startPage = Math.max(1, endPage - maxVisible + 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <li
                                key={i}
                                className={`page-item ${pagination.page === i ? "active" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      page: i,
                                    }))
                                  }
                                >
                                  {i}
                                </button>
                              </li>,
                            );
                          }
                          return pages;
                        })()}

                        <li
                          className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page + 1,
                              }))
                            }
                            disabled={pagination.page === pagination.pages}
                            aria-label="Page suivante"
                          >
                            &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                    <div className="mt-2 mt-md-0">
                      <select
                        className="form-select form-select-sm"
                        value={pagination.limit}
                        onChange={(e) =>
                          setPagination((prev) => ({
                            ...prev,
                            limit: parseInt(e.target.value),
                            page: 1,
                          }))
                        }
                        aria-label="Nombre d'éléments par page"
                      >
                        <option value="5">5 par page</option>
                        <option value="10">10 par page</option>
                        <option value="25">25 par page</option>
                        <option value="50">50 par page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Informations */}
      <div className="mt-4">
        <div className="alert alert-info border-0 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div
                className="rounded-circle p-2"
                style={{ backgroundColor: `${colors.oskar.blue}20` }}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1 fw-bold">
                Gestion de vos produits
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Propriétaire :</strong> Cliquez sur l'image ou le
                      nom pour voir le profil complet (utilisateur ou boutique)
                    </li>
                    <li>
                      <strong>Type de produit :</strong> Les produits peuvent
                      appartenir à un utilisateur individuel ou à une boutique
                    </li>
                    <li>
                      <strong>Publier/Dépublier :</strong> Contrôlez la
                      visibilité de vos produits sur la plateforme
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Export :</strong> Téléchargez la liste de vos
                      produits au format CSV avec toutes les informations
                    </li>
                    <li>
                      <strong>Filtres avancés :</strong> Filtrez par type de
                      propriétaire (utilisateur ou boutique)
                    </li>
                    <li>
                      <strong>Badges :</strong> Les badges de couleur indiquent
                      le type de propriétaire et le statut
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
        }
        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
        .page-link {
          color: #0d6efd;
        }
        .page-link:hover {
          color: #0a58ca;
          background-color: #f8f9fa;
        }
        .form-range::-webkit-slider-thumb {
          background-color: #0d6efd;
        }
        .form-range::-moz-range-thumb {
          background-color: #0d6efd;
        }
        .spinner-border {
          animation-duration: 0.75s;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-text-primary:hover {
          color: #0d6efd !important;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
