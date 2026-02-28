// app/(back-office)/dashboard-utilisateur/mes-produits/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faEye,
  faTrash,
  faEdit,
  faBan,
  faCheck,
  faTimes,
  faRefresh,
  faFilter,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faTag,
  faMoneyBillWave,
  faCalendar,
  faStar,
  faHeart,
  faDownload,
  faChartLine,
  faSpinner,
  faPlus,
  faShoppingCart,
  faUser,
  faStore,
  faComment,
  faLock,
  faLockOpen,
  faClock,
  faFileExport,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faArrowUp,
  faArrowDown,
  faGift,
  faExchangeAlt,
  faBoxes,
  faBoxOpen,
  faTrophy,
  faGem,
  faRocket,
  faBolt,
  faBullseye,
  faFire,
  faMedal,
  faCrown,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// Interfaces basées sur les réponses API
interface Utilisateur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
}

interface Categorie {
  uuid: string;
  libelle: string;
  type: string;
  image: string;
}

interface ProduitUtilisateur {
  uuid: string;
  libelle: string;
  description: string | null;
  prix: string | null;
  quantite: number;
  statut: string;
  estPublie: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  image: string;
  categorie: Categorie;
  source: {
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

interface Don {
  uuid: string;
  type_don: string;
  nom: string;
  prix: number | null;
  quantite: number;
  categorie: string;
  image: string;
  localisation: string;
  description: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  estPublie: boolean;
  est_bloque: boolean | null;
  lieu_retrait: string;
  est_public: number;
  vendeur: string;
  utilisateur: string;
  agent: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string;
  quantite: number;
  image: string;
  typeDestinataire: string;
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

interface FavoriItem {
  uuid: string;
  itemUuid: string;
  type: "produit" | "don" | "echange";
  produit?: ProduitUtilisateur;
  don?: Don;
  echange?: Echange;
  createdAt: string;
}

interface ApiResponseProduits {
  status: string;
  message: string;
  data: {
    produits: ProduitUtilisateur[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    utilisateur: Utilisateur;
  };
}

interface ApiResponseDons {
  status: string;
  data: Don[];
}

interface ApiResponseEchanges {
  status: string;
  data: Echange[];
}

interface ApiResponseFavoris {
  favoris: FavoriItem[];
  total: number;
}

interface ApiResponseProduitsBloques {
  status: string;
  message: string;
  data: {
    produits: ProduitUtilisateur[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    utilisateur: Utilisateur;
  };
}

interface ApiResponseDonsBloques {
  status: string;
  data: Don[];
}

interface ApiResponseEchangesBloques {
  status: string;
  data: Echange[];
}

interface StatsData {
  produits: {
    total: number;
    publies: number;
    nonPublies: number;
    bloques: number;
    disponibles: number;
    valeurTotale: number;
    prixMoyen: number;
  };
  dons: {
    total: number;
    publies: number;
    bloques: number;
  };
  echanges: {
    total: number;
    publies: number;
    bloques: number;
    valeurTotale: number;
  };
  favoris: {
    total: number;
    produits: number;
    dons: number;
    echanges: number;
  };
}

// Fonction utilitaire pour les images placeholder
const getPlaceholderImage = (
  size: number,
  text?: string,
  color?: string,
  bgColor?: string,
) => {
  const defaultText = text || size.toString();
  const defaultColor = color || "ffffff";
  const defaultBgColor = bgColor || "007bff";
  return `https://via.placeholder.com/${size}/${defaultBgColor}/${defaultColor}?text=${encodeURIComponent(defaultText)}`;
};

// Formatage
const formatPrix = (prix: string | number | null) => {
  if (prix === null) return "Gratuit";
  const montant = typeof prix === "string" ? parseFloat(prix) : prix;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(montant || 0);
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

// Composant de chargement
const LoadingSpinner = () => (
  <div className="container-fluid py-5">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-lg">
          <div className="card-body text-center py-5">
            <div className="position-relative mb-4">
              <div
                className="spinner-border text-primary"
                style={{ width: "4rem", height: "4rem" }}
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <div className="position-absolute top-50 start-50 translate-middle">
                <FontAwesomeIcon icon={faBox} className="fs-2 text-primary" />
              </div>
            </div>
            <h3 className="fw-bold mb-3 gradient-text">
              Chargement de vos données
            </h3>
            <p className="text-muted mb-0">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Composant de carte de stat
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  trendText,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <FontAwesomeIcon icon={faArrowUp} className="text-success" />;
      case "down":
        return <FontAwesomeIcon icon={faArrowDown} className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 hover-lift">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-uppercase text-muted mb-1 fw-semibold small">
              {title}
            </h6>
            <h2 className="fw-bold mb-0 display-6">{value}</h2>
            {subtitle && (
              <p className="text-muted mb-0 small mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={`rounded-circle p-3 bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
            style={{ width: "60px", height: "60px" }}
          >
            <FontAwesomeIcon icon={icon} className={`fs-3 text-${color}`} />
          </div>
        </div>
        {trend && trendText && (
          <div className="d-flex align-items-center mt-2">
            {getTrendIcon()}
            <span
              className={`fw-semibold ms-1 ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted"}`}
            >
              {trendText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ListeProduitsCreeUtilisateur() {
  // États pour les données
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);
  const [produitsBloques, setProduitsBloques] = useState<ProduitUtilisateur[]>(
    [],
  );
  const [dons, setDons] = useState<Don[]>([]);
  const [donsBloques, setDonsBloques] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [echangesBloques, setEchangesBloques] = useState<Echange[]>([]);
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [activeSection, setActiveSection] = useState<
    "produits" | "dons" | "echanges" | "favoris"
  >("produits");
  const [activeTab, setActiveTab] = useState<"tous" | "publies" | "bloques">(
    "tous",
  );

  // États pour les sélections
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<StatsData>({
    produits: {
      total: 0,
      publies: 0,
      nonPublies: 0,
      bloques: 0,
      disponibles: 0,
      valeurTotale: 0,
      prixMoyen: 0,
    },
    dons: {
      total: 0,
      publies: 0,
      bloques: 0,
    },
    echanges: {
      total: 0,
      publies: 0,
      bloques: 0,
      valeurTotale: 0,
    },
    favoris: {
      total: 0,
      produits: 0,
      dons: 0,
      echanges: 0,
    },
  });

  const getImageSrc = (imagePath: string | null | undefined, fallbackText: string = "I"): string => {
    if (!imagePath) {
      return getPlaceholderImage(60, fallbackText);
    }
    
    // Vérifier si l'image a déjà une erreur
    if (imageErrors[imagePath]) {
      return getPlaceholderImage(60, fallbackText);
    }
    
    return buildImageUrl(imagePath);
  };

  const handleImageError = (imagePath: string) => {
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  // Charger toutes les données
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setImageErrors({});

      // Charger les produits de l'utilisateur
      const produitsResponse = await api.get<ApiResponseProduits>(
        "/produits/liste-mes-utilisateur-produits",
      );

      // Charger les produits bloqués
      const produitsBloquesResponse = await api.get<ApiResponseProduitsBloques>(
        "/produits/produits-utilisateur-bloques",
      );

      // Charger les dons de l'utilisateur
      const donsResponse = await api.get<ApiResponseDons>(
        "/dons/liste-don-utilisateur",
      );

      // Charger les dons bloqués
      const donsBloquesResponse = await api.get<ApiResponseDonsBloques>(
        "/dons/liste-dons-bloques-utilisateur",
      );

      // Charger les échanges de l'utilisateur
      const echangesResponse = await api.get<ApiResponseEchanges>(
        "/echanges/liste-echange-utilisateur",
      );

      // Charger les échanges bloqués
      const echangesBloquesResponse = await api.get<ApiResponseEchangesBloques>(
        "/echanges/liste-echange-bloquees-utilisateur",
      );

      // Charger les favoris
      const favorisResponse = await api.get<ApiResponseFavoris>("/favoris");

      // Traiter les réponses
      if (produitsResponse?.data) {
        setProduits(produitsResponse.data.produits);
        setUtilisateur(produitsResponse.data.utilisateur);
      }

      if (produitsBloquesResponse?.data) {
        setProduitsBloques(produitsBloquesResponse.data.produits);
      }

      if (donsResponse?.data) {
        setDons(Array.isArray(donsResponse.data) ? donsResponse.data : []);
      }

      if (donsBloquesResponse?.data) {
        setDonsBloques(
          Array.isArray(donsBloquesResponse.data)
            ? donsBloquesResponse.data
            : [],
        );
      }

      if (echangesResponse?.data) {
        setEchanges(
          Array.isArray(echangesResponse.data) ? echangesResponse.data : [],
        );
      }

      if (echangesBloquesResponse?.data) {
        setEchangesBloques(
          Array.isArray(echangesBloquesResponse.data)
            ? echangesBloquesResponse.data
            : [],
        );
      }

      if (favorisResponse?.favoris) {
        setFavoris(favorisResponse.favoris);
      }

      // Calculer les statistiques
      calculateStats();
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des données:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des données. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculer les statistiques
  const calculateStats = useCallback(() => {
    // Produits
    const produitsPublies = produits.filter((p) => p.estPublie).length;
    const produitsNonPublies = produits.length - produitsPublies;
    const valeurTotaleProduits = produits.reduce((sum, produit) => {
      const prix = produit.prix ? parseFloat(produit.prix) : 0;
      return sum + prix;
    }, 0);

    // Dons
    const donsPublies = dons.filter((d) => d.estPublie).length;

    // Échanges
    const echangesPublies = echanges.filter((e) => e.estPublie).length;
    const valeurTotaleEchanges = echanges.reduce((sum, echange) => {
      const prix = parseFloat(echange.prix) || 0;
      return sum + prix;
    }, 0);

    // Favoris
    const favorisProduits = favoris.filter((f) => f.type === "produit").length;
    const favorisDons = favoris.filter((f) => f.type === "don").length;
    const favorisEchanges = favoris.filter((f) => f.type === "echange").length;

    setStats({
      produits: {
        total: produits.length + produitsBloques.length,
        publies: produitsPublies,
        nonPublies: produitsNonPublies,
        bloques: produitsBloques.length,
        disponibles: produits.filter((p) => p.statut === "disponible").length,
        valeurTotale: valeurTotaleProduits,
        prixMoyen:
          produits.length > 0 ? valeurTotaleProduits / produits.length : 0,
      },
      dons: {
        total: dons.length + donsBloques.length,
        publies: donsPublies,
        bloques: donsBloques.length,
      },
      echanges: {
        total: echanges.length + echangesBloques.length,
        publies: echangesPublies,
        bloques: echangesBloques.length,
        valeurTotale: valeurTotaleEchanges,
      },
      favoris: {
        total: favoris.length,
        produits: favorisProduits,
        dons: favorisDons,
        echanges: favorisEchanges,
      },
    });
  }, [
    produits,
    produitsBloques,
    dons,
    donsBloques,
    echanges,
    echangesBloques,
    favoris,
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filtrer les données selon la section et l'onglet actifs
  const getFilteredData = () => {
    let data: any[] = [];

    switch (activeSection) {
      case "produits":
        data = activeTab === "bloques" ? produitsBloques : produits;
        break;
      case "dons":
        data = activeTab === "bloques" ? donsBloques : dons;
        break;
      case "echanges":
        data = activeTab === "bloques" ? echangesBloques : echanges;
        break;
      case "favoris":
        data = favoris;
        break;
    }

    // Appliquer le filtre de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter((item: any) => {
        if (activeSection === "favoris") {
          const favItem = item as FavoriItem;
          return (
            favItem.produit?.libelle?.toLowerCase().includes(searchLower) ||
            favItem.don?.nom?.toLowerCase().includes(searchLower) ||
            favItem.echange?.nomElementEchange
              ?.toLowerCase()
              .includes(searchLower) ||
            favItem.produit?.description?.toLowerCase().includes(searchLower) ||
            favItem.don?.description?.toLowerCase().includes(searchLower) ||
            favItem.echange?.message?.toLowerCase().includes(searchLower)
          );
        } else {
          return (
            item.libelle?.toLowerCase().includes(searchLower) ||
            item.nom?.toLowerCase().includes(searchLower) ||
            item.nomElementEchange?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.message?.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  // Fonction pour obtenir les données d'affichage pour chaque élément
  const getDisplayData = (item: any) => {
    if (activeSection === "favoris") {
      const favItem = item as FavoriItem;
      switch (favItem.type) {
        case "produit":
          return {
            uuid: favItem.uuid,
            libelle: favItem.produit?.libelle || "Produit",
            description: favItem.produit?.description || "Pas de description",
            image: favItem.produit?.image,
            prix: favItem.produit?.prix || null,
            statut: favItem.produit?.statut || "inconnu",
            estPublie: favItem.produit?.estPublie || false,
            categorie: favItem.produit?.categorie?.libelle || "Non catégorisé",
            date: favItem.createdAt,
            type: "produit",
            imageKey: `favoris-produit-${favItem.uuid}`,
          };
        case "don":
          return {
            uuid: favItem.uuid,
            libelle: favItem.don?.nom || "Don",
            description: favItem.don?.description || "Pas de description",
            image: favItem.don?.image,
            prix: favItem.don?.prix || null,
            statut: favItem.don?.statut || "inconnu",
            estPublie: favItem.don?.estPublie || false,
            categorie: favItem.don?.categorie || "Non catégorisé",
            date: favItem.createdAt,
            type: "don",
            imageKey: `favoris-don-${favItem.uuid}`,
          };
        case "echange":
          return {
            uuid: favItem.uuid,
            libelle: favItem.echange?.nomElementEchange || "Échange",
            description: favItem.echange?.message || "Pas de description",
            image: favItem.echange?.image,
            prix: favItem.echange?.prix || "0",
            statut: favItem.echange?.statut || "inconnu",
            estPublie: favItem.echange?.estPublie || false,
            categorie: favItem.echange?.categorie || "Non catégorisé",
            date: favItem.createdAt,
            type: "echange",
            imageKey: `favoris-echange-${favItem.uuid}`,
          };
      }
    } else {
      return {
        uuid: item.uuid,
        libelle: item.libelle || item.nom || item.nomElementEchange,
        description: item.description || item.message || "Pas de description",
        image: item.image,
        prix: item.prix,
        statut: item.statut,
        estPublie: item.estPublie,
        categorie:
          item.categorie?.libelle || item.categorie || "Non catégorisé",
        date: item.createdAt || item.updatedAt,
        type: activeSection,
        imageKey: `${activeSection}-${item.uuid}`,
      };
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid py-4">
      {/* Header principal */}
      <div className="mb-5">
        <div
          className="rounded-4 p-4 shadow-lg mb-4 hero-gradient"
          style={{
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="row align-items-center"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                {utilisateur && (
                  <div className="position-relative me-4">
                    <img
                      src={getImageSrc(utilisateur.avatar, `${utilisateur.prenoms?.charAt(0)}${utilisateur.nom?.charAt(0)}`)}
                      alt={`${utilisateur.prenoms} ${utilisateur.nom}`}
                      className="rounded-circle border border-4 border-white shadow"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                      onError={() => utilisateur.avatar && handleImageError(utilisateur.avatar)}
                    />
                    <span
                      className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-3 border-white d-flex align-items-center justify-content-center"
                      style={{ width: "20px", height: "20px" }}
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white"
                        style={{ fontSize: "8px" }}
                      />
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="h2 fw-bold text-white mb-1">
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Tableau de bord
                  </h1>
                  <p className="text-white mb-2" style={{ opacity: 0.9 }}>
                    {utilisateur
                      ? `Bonjour ${utilisateur.prenoms}, voici le résumé de vos activités`
                      : "Vue d'ensemble de vos activités"}
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faBox} className="me-1" />
                      {stats.produits.total} produits
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faGift} className="me-1" />
                      {stats.dons.total} dons
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                      {stats.echanges.total} échanges
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex flex-column flex-md-row gap-2 justify-content-end align-items-start align-items-md-center">
                <button
                  onClick={fetchDashboardData}
                  className="btn btn-outline-light btn-lg d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto hover-lift"
                  disabled={loading}
                  title="Rafraîchir"
                >
                  <FontAwesomeIcon icon={faRefresh} spin={loading} />
                  <span className="d-none d-md-inline">Actualiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="row g-4 mb-4">
          {/* Produits */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Produits Totaux"
              value={stats.produits.total}
              icon={faBoxes}
              color="primary"
              subtitle={`${stats.produits.publies} publiés, ${stats.produits.bloques} bloqués`}
              trend="up"
              trendText="+12% ce mois"
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Valeur Produits"
              value={formatPrix(stats.produits.valeurTotale)}
              icon={faMoneyBillWave}
              color="success"
              subtitle={`Moyenne: ${formatPrix(stats.produits.prixMoyen)}`}
              trend="up"
              trendText="+8%"
            />
          </div>

          {/* Dons */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Dons Totaux"
              value={stats.dons.total}
              icon={faGift}
              color="info"
              subtitle={`${stats.dons.publies} publiés, ${stats.dons.bloques} bloqués`}
              trend="up"
              trendText="+5% ce mois"
            />
          </div>

          {/* Échanges */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Échanges Totaux"
              value={stats.echanges.total}
              icon={faExchangeAlt}
              color="warning"
              subtitle={`Valeur: ${formatPrix(stats.echanges.valeurTotale)}`}
              trend="up"
              trendText="+18% ce mois"
            />
          </div>

          {/* Favoris */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Favoris"
              value={stats.favoris.total}
              icon={faHeart}
              color="danger"
              subtitle={`${stats.favoris.produits} produits, ${stats.favoris.dons} dons, ${stats.favoris.echanges} échanges`}
              trend="up"
              trendText="+25%"
            />
          </div>

          {/* Produits disponibles */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Produits Disponibles"
              value={stats.produits.disponibles}
              icon={faCheckCircle}
              color="success"
              subtitle={`Sur ${stats.produits.total} produits`}
              trend="up"
              trendText={`Taux: ${((stats.produits.disponibles / stats.produits.total) * 100).toFixed(0)}%`}
            />
          </div>

          {/* Produits non publiés */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Produits Non Publiés"
              value={stats.produits.nonPublies}
              icon={faClock}
              color="secondary"
              subtitle="En attente de publication"
              trend="neutral"
              trendText="À publier"
            />
          </div>

          {/* Produits bloqués */}
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Total Bloqués"
              value={
                stats.produits.bloques +
                stats.dons.bloques +
                stats.echanges.bloques
              }
              icon={faBan}
              color="danger"
              subtitle="Contenu restreint"
              trend="down"
              trendText="-3%"
            />
          </div>
        </div>

        {/* Navigation par sections */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "produits" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setActiveSection("produits");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faBox} />
                Produits
                <span className="badge bg-white text-primary ms-1">
                  {stats.produits.total}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "dons" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => {
                  setActiveSection("dons");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faGift} />
                Dons
                <span className="badge bg-white text-success ms-1">
                  {stats.dons.total}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "echanges" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => {
                  setActiveSection("echanges");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faExchangeAlt} />
                Échanges
                <span className="badge bg-white text-warning ms-1">
                  {stats.echanges.total}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "favoris" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => {
                  setActiveSection("favoris");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faHeart} />
                Favoris
                <span className="badge bg-white text-danger ms-1">
                  {stats.favoris.total}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Onglets pour produits, dons et échanges (sauf favoris) */}
        {activeSection !== "favoris" && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${activeTab === "tous" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("tous")}
                >
                  Tous (
                  {activeSection === "produits"
                    ? stats.produits.total
                    : activeSection === "dons"
                      ? stats.dons.total
                      : stats.echanges.total}
                  )
                </button>

                <button
                  className={`btn ${activeTab === "publies" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setActiveTab("publies")}
                >
                  Publiés (
                  {activeSection === "produits"
                    ? stats.produits.publies
                    : activeSection === "dons"
                      ? stats.dons.publies
                      : stats.echanges.publies}
                  )
                </button>

                <button
                  className={`btn ${activeTab === "bloques" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setActiveTab("bloques")}
                >
                  Bloqués (
                  {activeSection === "produits"
                    ? stats.produits.bloques
                    : activeSection === "dons"
                      ? stats.dons.bloques
                      : stats.echanges.bloques}
                  )
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-primary" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={`Rechercher ${activeSection === "produits" ? "un produit" : activeSection === "dons" ? "un don" : activeSection === "echanges" ? "un échange" : "un favori"}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearchTerm("")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  {activeSection === "produits" && (
                    <Link
                      href="/dashboard-utilisateur/mes-produits/nouveau"
                      className="btn btn-primary d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouveau produit
                    </Link>
                  )}

                  {activeSection === "dons" && (
                    <Link
                      href="/dashboard-utilisateur/mes-dons/nouveau"
                      className="btn btn-success d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouveau don
                    </Link>
                  )}

                  {activeSection === "echanges" && (
                    <Link
                      href="/dashboard-utilisateur/mes-echanges/nouveau"
                      className="btn btn-warning d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouvel échange
                    </Link>
                  )}

                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => {
                      setSelectedItems([]);
                      setSearchTerm("");
                    }}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show shadow-sm border-0 mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1">Erreur</h6>
                <p className="mb-0">{error}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show shadow-sm border-0 mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="alert-heading mb-1">Succès</h6>
                <p className="mb-0">{successMessage}</p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
              ></button>
            </div>
          </div>
        )}

        {/* Tableau des données */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {filteredData.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  {activeSection === "produits" && (
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="text-muted fs-1"
                    />
                  )}
                  {activeSection === "dons" && (
                    <FontAwesomeIcon
                      icon={faGift}
                      className="text-muted fs-1"
                    />
                  )}
                  {activeSection === "echanges" && (
                    <FontAwesomeIcon
                      icon={faExchangeAlt}
                      className="text-muted fs-1"
                    />
                  )}
                  {activeSection === "favoris" && (
                    <FontAwesomeIcon
                      icon={faHeart}
                      className="text-muted fs-1"
                    />
                  )}
                </div>
                <h4 className="fw-bold mb-3">
                  Aucun {activeSection === "favoris" ? "favori" : activeSection}{" "}
                  trouvé
                </h4>
                <p className="text-muted mb-4">
                  {searchTerm
                    ? "Aucun résultat ne correspond à votre recherche."
                    : activeSection === "produits"
                      ? "Commencez par créer votre premier produit !"
                      : activeSection === "dons"
                        ? "Commencez par créer votre premier don !"
                        : activeSection === "echanges"
                          ? "Commencez par créer votre premier échange !"
                          : "Ajoutez des produits, dons ou échanges à vos favoris !"}
                </p>
                {(activeSection === "produits" ||
                  activeSection === "dons" ||
                  activeSection === "echanges") && (
                  <Link
                    href={`/dashboard-utilisateur/mes-${activeSection}/nouveau`}
                    className={`btn btn-${activeSection === "produits" ? "primary" : activeSection === "dons" ? "success" : "warning"} btn-lg`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer un{" "}
                    {activeSection === "produits"
                      ? "produit"
                      : activeSection === "dons"
                        ? "don"
                        : "échange"}
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="ps-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectedItems.length === filteredData.length &&
                              filteredData.length > 0
                            }
                            onChange={() => {
                              if (
                                selectedItems.length === filteredData.length
                              ) {
                                setSelectedItems([]);
                              } else {
                                setSelectedItems(
                                  filteredData.map((item: any) => item.uuid),
                                );
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th style={{ width: "80px" }}>Image</th>
                      <th>Nom</th>
                      <th style={{ width: "120px" }}>Prix/Valeur</th>
                      <th style={{ width: "100px" }}>Statut</th>
                      <th style={{ width: "120px" }}>Catégorie</th>
                      <th style={{ width: "150px" }}>Date</th>
                      <th style={{ width: "150px" }} className="text-end pe-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 10).map((item: any) => {
                      const displayData = getDisplayData(item);
                      return (
                        <tr
                          key={displayData.uuid}
                          className={
                            selectedItems.includes(displayData.uuid)
                              ? "table-active"
                              : ""
                          }
                        >
                          <td className="ps-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedItems.includes(
                                  displayData.uuid,
                                )}
                                onChange={() => {
                                  setSelectedItems((prev) =>
                                    prev.includes(displayData.uuid)
                                      ? prev.filter(
                                          (id) => id !== displayData.uuid,
                                        )
                                      : [...prev, displayData.uuid],
                                  );
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <div
                              className="position-relative"
                              style={{ width: "60px", height: "60px" }}
                            >
                              <img
                                src={getImageSrc(displayData.image, displayData.libelle?.charAt(0) || "I")}
                                alt={displayData.libelle}
                                className="rounded-3"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={() => displayData.image && handleImageError(displayData.image)}
                              />
                              {activeSection === "favoris" && (
                                <div className="position-absolute top-0 end-0 translate-middle">
                                  <FontAwesomeIcon
                                    icon={faHeart}
                                    className="text-danger fs-6"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">
                                {displayData.libelle}
                              </span>
                              <small
                                className="text-muted text-truncate"
                                style={{ maxWidth: "200px" }}
                              >
                                {displayData.description?.substring(0, 60) ||
                                  "Pas de description"}
                              </small>
                              {activeSection === "favoris" && (
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={
                                      displayData.type === "produit"
                                        ? faBox
                                        : displayData.type === "don"
                                          ? faGift
                                          : faExchangeAlt
                                    }
                                    className="me-1"
                                  />
                                  {displayData.type === "produit"
                                    ? "Produit"
                                    : displayData.type === "don"
                                      ? "Don"
                                      : "Échange"}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold text-primary">
                              {formatPrix(displayData.prix)}
                            </span>
                          </td>
                          <td>
                            {displayData.estPublie ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="me-1"
                                />
                                Publié
                              </span>
                            ) : activeTab === "bloques" ||
                              displayData.statut === "bloque" ? (
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                <FontAwesomeIcon
                                  icon={faBan}
                                  className="me-1"
                                />
                                Bloqué
                              </span>
                            ) : (
                              <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="me-1"
                                />
                                Non publié
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-info bg-opacity-10 text-info border border-info">
                              {displayData.categorie}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(displayData.date)}
                            </small>
                          </td>
                          <td className="text-end pe-4">
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
                              <button
                                className="btn btn-outline-primary"
                                title="Voir"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-outline-success"
                                title="Modifier"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredData.length > 10 && (
            <div className="card-footer bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">
                    Affichage de <strong>1</strong> à{" "}
                    <strong>{Math.min(10, filteredData.length)}</strong> sur{" "}
                    <strong>{filteredData.length}</strong> éléments
                  </p>
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item">
                      <button className="page-link" aria-label="Précédent">
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                    </li>
                    <li className="page-item active">
                      <button className="page-link">1</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">2</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">3</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link" aria-label="Suivant">
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Section informations */}
        <div className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-info"
                  />
                  Résumé de vos activités
                </h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Produits créés</span>
                      <span className="fw-bold">{stats.produits.total}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Dons créés</span>
                      <span className="fw-bold">{stats.dons.total}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Échanges créés</span>
                      <span className="fw-bold">{stats.echanges.total}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Favoris</span>
                      <span className="fw-bold">{stats.favoris.total}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Contenu bloqué</span>
                      <span className="fw-bold text-danger">
                        {stats.produits.bloques +
                          stats.dons.bloques +
                          stats.echanges.bloques}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <FontAwesomeIcon
                    icon={faBolt}
                    className="me-2 text-warning"
                  />
                  Actions rapides
                </h5>
                <div className="d-grid gap-2">
                  {activeSection === "produits" && (
                    <>
                      <Link
                        href="/dashboard-utilisateur/mes-produits/nouveau"
                        className="btn btn-primary btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter un produit
                      </Link>
                      <button className="btn btn-outline-primary btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes produits
                      </button>
                    </>
                  )}
                  {activeSection === "dons" && (
                    <>
                      <Link
                        href="/dashboard-utilisateur/mes-dons/nouveau"
                        className="btn btn-success btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer un don
                      </Link>
                      <button className="btn btn-outline-success btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes dons
                      </button>
                    </>
                  )}
                  {activeSection === "echanges" && (
                    <>
                      <Link
                        href="/dashboard-utilisateur/mes-echanges/nouveau"
                        className="btn btn-warning btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Proposer un échange
                      </Link>
                      <button className="btn btn-outline-warning btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes échanges
                      </button>
                    </>
                  )}
                  {activeSection === "favoris" && (
                    <>
                      <Link href="/produits" className="btn btn-primary btn-lg">
                        <FontAwesomeIcon icon={faBox} className="me-2" />
                        Explorer les produits
                      </Link>
                      <Link href="/dons" className="btn btn-success btn-lg">
                        <FontAwesomeIcon icon={faGift} className="me-2" />
                        Explorer les dons
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-gradient {
          background: linear-gradient(
            135deg,
            #28a745 0%,
            #20c997 100%
          ) !important;
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .badge {
          font-weight: 500;
          letter-spacing: 0.3px;
          padding: 0.35em 0.65em;
        }

        .card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .btn-success {
          background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
        }

        .btn-warning {
          background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
          border: none;
          color: #212529;
          transition: all 0.3s ease;
        }

        .btn-warning:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        }

        .btn-danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .table-active {
          background-color: rgba(40, 167, 69, 0.05) !important;
        }

        .progress-bar {
          border-radius: 10px;
        }

        .list-group-item {
          border-left: none;
          border-right: none;
        }

        .list-group-item:first-child {
          border-top: none;
        }

        .list-group-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}