// app/(back-office)/dashboard-vendeur/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // Icônes de base
  faStore,
  faShoppingBag,
  faGift,
  faExchangeAlt,
  faUsers,
  faMoneyBillWave,
  faStar,
  faHeart,
  faChartLine,
  faCalendar,
  faClock,
  faBox,
  faShoppingCart,
  faBan,
  faCheckCircle,
  faSpinner,
  faArrowUp,
  faArrowDown,
  faEllipsisH,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faFilter,
  faSearch,
  faChartBar,
  faChartPie,
  faList,
  faBell,
  faCog,
  faUser,
  faTachometerAlt,
  faTag,
  faGlobe,
  faLock,
  faLockOpen,
  faBolt,
  faExclamationTriangle,
  faInfoCircle,
  faSync,
  faDownload,
  faUpload,
  faHistory,
  faCoins,
  faPercent,
  faTags,
  faLayerGroup,
  faFire,
  faRocket,
  faSeedling,
  faWaveSquare,
  faCrown,
  faAward,
  faTrophy,
  faMedal,
  faArrowTrendUp,
  faArrowTrendDown,
  faCompass,
  faBullseye,
  faFlagCheckered,
  faTasks,
  faCalendarAlt,
  faCalendarCheck,
  faCalendarDay,
  faCalendarWeek,
  faChartArea,
  faCircleDot,
  faCircleHalfStroke,
  faCircleNodes,
  faCircleRadiation,
  faCircleChevronRight,
  faCircleChevronLeft,
  faCircleNotch,
  faCloudArrowUp,
  faDatabase,
  faDiagramProject,
  faNetworkWired,
  faSitemap,
  faSquarePollVertical,
  faSquarePollHorizontal,
  faLineChart,
  faDotCircle,
  faTurnUp,
  faTurnDown,
  faChevronLeft,
  faChevronRight,
  faBoxes,
  faBoxOpen,
  faRefresh,
  faTimes,
  faCheck,
  faExclamation,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface Stats {
  totalBoutiques: number;
  boutiquesActives: number;
  boutiquesEnReview: number;
  boutiquesBloquees: number;
  totalProduits: number;
  produitsPublies: number;
  produitsNonPublies: number;
  produitsBloques: number;
  totalDons: number;
  donsPublies: number;
  donsBloques: number;
  donsEnAttente: number;
  totalEchanges: number;
  echangesPublies: number;
  echangesBloques: number;
  echangesEnAttente: number;
  revenusTotaux: number;
  revenusMensuels: number;
  revenusHebdomadaires: number;
  avisMoyen: number;
  totalAvis: number;
  totalFavoris: number;
  tauxConversion: number;
  panierMoyen: number;
}

interface Produit {
  uuid: string;
  libelle: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  quantite: number;
  boutique: {
    nom: string;
    uuid: string;
  } | null;
  createdAt: string | null;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
}

interface Don {
  uuid: string;
  nom: string;
  type_don: string;
  prix: number | null;
  categorie: string;
  image: string;
  statut: string;
  estPublie: boolean;
  est_bloque: boolean | null;
  date_debut: string;
  vendeur: string;
  description: string;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  dateProposition: string;
  objetPropose: string;
  objetDemande: string;
  message: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  logo: string;
  banniere: string;
  statut: string;
  est_bloque: boolean;
  est_ferme: boolean;
  created_at: string;
  type_boutique: {
    libelle: string;
    code: string;
  };
  produits_count?: number;
}

interface Vendeur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
}

interface ApiResponseProduits {
  status: string;
  message: string;
  data: {
    produits: Produit[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    vendeur?: Vendeur;
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

interface ApiResponseBoutiques {
  data: Boutique[];
  total: number;
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
  const defaultBgColor = bgColor || "28a745";
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
                className="spinner-border text-success"
                style={{ width: "4rem", height: "4rem" }}
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <div className="position-absolute top-50 start-50 translate-middle">
                <FontAwesomeIcon icon={faStore} className="fs-2 text-success" />
              </div>
            </div>
            <h3 className="fw-bold mb-3 gradient-text">
              Chargement de votre dashboard
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
  color = "success",
  subtitle,
  trend,
  trendText,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: any;
  color?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary"
    | "dark";
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  delay?: number;
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

  const colorClasses = {
    primary: "bg-primary bg-opacity-10 text-primary border-primary",
    success: "bg-success bg-opacity-10 text-success border-success",
    warning: "bg-warning bg-opacity-10 text-warning border-warning",
    danger: "bg-danger bg-opacity-10 text-danger border-danger",
    info: "bg-info bg-opacity-10 text-info border-info",
    secondary: "bg-secondary bg-opacity-10 text-secondary border-secondary",
    dark: "bg-dark bg-opacity-10 text-dark border-dark",
  };

  return (
    <div
      className={`card border-0 shadow-sm h-100 hover-lift`}
      style={{
        animation: `fadeIn 0.5s ease-out ${delay * 100}ms both`,
        transform: "translateY(0)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
      }}
    >
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
            className={`rounded-circle p-3 ${colorClasses[color]} d-flex align-items-center justify-content-center`}
            style={{ width: "60px", height: "60px" }}
          >
            <FontAwesomeIcon icon={icon} className={`fs-3`} />
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

export default function VendeurDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitsBloques, setProduitsBloques] = useState<Produit[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [donsBloques, setDonsBloques] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [echangesBloques, setEchangesBloques] = useState<Echange[]>([]);
  const [vendeur, setVendeur] = useState<Vendeur | null>(null);
  const [activeSection, setActiveSection] = useState<
    "produits" | "dons" | "echanges" | "boutiques"
  >("produits");
  const [activeTab, setActiveTab] = useState<"tous" | "publies" | "bloques">(
    "tous",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("month");

  // Charger toutes les données
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les boutiques
      const boutiquesRes = await api.get<ApiResponseBoutiques>(
        API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR,
      );
      const boutiquesData = Array.isArray(boutiquesRes.data)
        ? boutiquesRes.data
        : boutiquesRes.data || [];
      setBoutiques(boutiquesData);

      // Charger les produits
      const produitsRes = await api.get<ApiResponseProduits>(
        API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS,
      );
      let produitsData = Array.isArray(produitsRes.data)
        ? produitsRes.data
        : produitsRes.data?.produits || [];

      produitsData = produitsData.map((produit) => ({
        ...produit,
        boutique: produit.boutique || { nom: "Sans boutique", uuid: "" },
      }));
      setProduits(produitsData);

      if (produitsRes.data?.vendeur) {
        setVendeur(produitsRes.data.vendeur);
      }

      // Charger les produits bloqués
      try {
        const produitsBloquesRes = await api.get<ApiResponseProduits>(
          "/produits/liste-produits-bloques-vendeur",
        );
        let produitsBloquesData = Array.isArray(produitsBloquesRes.data)
          ? produitsBloquesRes.data
          : produitsBloquesRes.data?.produits || [];
        produitsBloquesData = produitsBloquesData.map((produit) => ({
          ...produit,
          boutique: produit.boutique || { nom: "Sans boutique", uuid: "" },
        }));
        setProduitsBloques(produitsBloquesData);
      } catch (err) {
        console.warn("Erreur chargement produits bloqués:", err);
        setProduitsBloques([]);
      }

      // Charger les dons
      const donsRes = await api.get<ApiResponseDons>(
        API_ENDPOINTS.DONS.VENDEUR_DONS,
      );
      const donsData = Array.isArray(donsRes.data)
        ? donsRes.data
        : donsRes.data || [];
      setDons(donsData);

      // Charger les dons bloqués
      try {
        const donsBloquesRes = await api.get<ApiResponseDons>(
          "/dons/liste-dons-bloques-vendeur",
        );
        const donsBloquesData = Array.isArray(donsBloquesRes.data)
          ? donsBloquesRes.data
          : donsBloquesRes.data || [];
        setDonsBloques(donsBloquesData);
      } catch (err) {
        console.warn("Erreur chargement dons bloqués:", err);
        setDonsBloques([]);
      }

      // Charger les échanges
      const echangesRes = await api.get<ApiResponseEchanges>(
        API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES,
      );
      const echangesData = Array.isArray(echangesRes.data)
        ? echangesRes.data
        : echangesRes.data || [];
      setEchanges(echangesData);

      // Charger les échanges bloqués
      try {
        const echangesBloquesRes = await api.get<ApiResponseEchanges>(
          "/echanges/liste-echange-bloque-vendeur",
        );
        const echangesBloquesData = Array.isArray(echangesBloquesRes.data)
          ? echangesBloquesRes.data
          : echangesBloquesRes.data || [];
        setEchangesBloques(echangesBloquesData);
      } catch (err) {
        console.warn("Erreur chargement échanges bloqués:", err);
        setEchangesBloques([]);
      }

      // Calculer les statistiques
      const statsData: Stats = {
        totalBoutiques: boutiquesData.length,
        boutiquesActives: boutiquesData.filter(
          (b) => b.statut === "actif" && !b.est_bloque && !b.est_ferme,
        ).length,
        boutiquesEnReview: boutiquesData.filter((b) => b.statut === "en_review")
          .length,
        boutiquesBloquees: boutiquesData.filter(
          (b) => b.est_bloque || b.est_ferme,
        ).length,
        totalProduits: produitsData.length + produitsBloques.length,
        produitsPublies: produitsData.filter((p) => p.estPublie).length,
        produitsNonPublies: produitsData.filter(
          (p) => !p.estPublie && !p.estBloque,
        ).length,
        produitsBloques: produitsBloques.length,
        totalDons: donsData.length + donsBloques.length,
        donsPublies: donsData.filter((d) => d.estPublie && !d.est_bloque)
          .length,
        donsBloques: donsBloques.length,
        donsEnAttente: donsData.filter((d) => !d.estPublie && !d.est_bloque)
          .length,
        totalEchanges: echangesData.length + echangesBloques.length,
        echangesPublies: echangesData.filter((e) => e.estPublie).length,
        echangesBloques: echangesBloques.length,
        echangesEnAttente: echangesData.filter((e) => !e.estPublie).length,
        revenusTotaux: 2500000,
        revenusMensuels: 450000,
        revenusHebdomadaires: 120000,
        avisMoyen: 4.5,
        totalAvis: produitsData.reduce(
          (sum, p) => sum + (p.nombre_avis || 0),
          0,
        ),
        totalFavoris: produitsData.reduce(
          (sum, p) => sum + (p.nombre_favoris || 0),
          0,
        ),
        tauxConversion: 2.8,
        panierMoyen: 12500,
      };
      setStats(statsData);
    } catch (err: any) {
      console.error("Erreur lors du chargement du dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des données. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
      case "boutiques":
        data = boutiques;
        break;
    }

    // Appliquer le filtre de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter((item: any) => {
        if (activeSection === "boutiques") {
          return (
            item.nom?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
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
    switch (activeSection) {
      case "produits":
        return {
          uuid: item.uuid,
          libelle: item.libelle || "Produit",
          description: item.description || "Pas de description",
          image: item.image || getPlaceholderImage(60, "P"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: item.estBloque || false,
          categorie: item.categorie?.libelle || "Non catégorisé",
          date: item.createdAt || item.updatedAt,
          boutique: item.boutique?.nom || "Sans boutique",
          note_moyenne: item.note_moyenne || 0,
          nombre_avis: item.nombre_avis || 0,
          nombre_favoris: item.nombre_favoris || 0,
          quantite: item.quantite || 0,
        };
      case "dons":
        return {
          uuid: item.uuid,
          libelle: item.nom || "Don",
          description: item.description || "Pas de description",
          image: item.image || getPlaceholderImage(60, "D"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: item.est_bloque || false,
          categorie: item.categorie || "Non catégorisé",
          date: item.date_debut || item.createdAt,
          type_don: item.type_don || "objet",
          quantite: item.quantite || 1,
        };
      case "echanges":
        return {
          uuid: item.uuid,
          libelle: item.nomElementEchange || "Échange",
          description: item.message || "Pas de description",
          image: item.image || getPlaceholderImage(60, "E"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: false,
          categorie: item.categorie || "Non catégorisé",
          date: item.dateProposition || item.createdAt,
          objetPropose: item.objetPropose || "",
          objetDemande: item.objetDemande || "",
        };
      case "boutiques":
        return {
          uuid: item.uuid,
          libelle: item.nom || "Boutique",
          description: item.description || "Pas de description",
          image: item.logo || getPlaceholderImage(60, "B"),
          statut: item.statut || "inconnu",
          estBloque: item.est_bloque || false,
          estFerme: item.est_ferme || false,
          date: item.created_at,
          type_boutique: item.type_boutique?.libelle || "Standard",
          produits_count: item.produits_count || 0,
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
                {vendeur && (
                  <div className="position-relative me-4">
                    <img
                      src={
                        vendeur.avatar ||
                        getPlaceholderImage(
                          80,
                          `${vendeur.prenoms?.charAt(0)}${vendeur.nom?.charAt(0)}`,
                        )
                      }
                      alt={`${vendeur.prenoms} ${vendeur.nom}`}
                      className="rounded-circle border border-4 border-white shadow"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
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
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard Vendeur
                  </h1>
                  <p className="text-white mb-2" style={{ opacity: 0.9 }}>
                    {vendeur
                      ? `Bonjour ${vendeur.prenoms}, voici le résumé de votre activité`
                      : "Vue d'ensemble de votre activité"}
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faStore} className="me-1" />
                      {stats?.totalBoutiques || 0} boutiques
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
                      {stats?.totalProduits || 0} produits
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faGift} className="me-1" />
                      {stats?.totalDons || 0} dons
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-white fw-semibold border-0">
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                      {stats?.totalEchanges || 0} échanges
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex flex-column flex-md-row gap-2 justify-content-end align-items-start align-items-md-center">
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light d-flex align-items-center gap-2 w-100"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <FontAwesomeIcon icon={faCalendarWeek} />
                    <span className="d-none d-md-inline">
                      {timeRange === "day" && "Aujourd'hui"}
                      {timeRange === "week" && "Cette semaine"}
                      {timeRange === "month" && "Ce mois"}
                      {timeRange === "year" && "Cette année"}
                    </span>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setTimeRange("day")}
                      >
                        Aujourd'hui
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setTimeRange("week")}
                      >
                        Cette semaine
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setTimeRange("month")}
                      >
                        Ce mois
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setTimeRange("year")}
                      >
                        Cette année
                      </button>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 w-100"
                  disabled={loading}
                  title="Rafraîchir"
                >
                  <FontAwesomeIcon icon={faSync} spin={loading} />
                  <span className="d-none d-md-inline">Actualiser</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Boutiques"
              value={stats?.totalBoutiques || 0}
              icon={faStore}
              color="primary"
              subtitle={`${stats?.boutiquesActives || 0} actives, ${stats?.boutiquesEnReview || 0} en revue`}
              trend="up"
              trendText="+12% ce mois"
              delay={0}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Produits"
              value={stats?.totalProduits || 0}
              icon={faShoppingBag}
              color="success"
              subtitle={`${stats?.produitsPublies || 0} publiés, ${stats?.produitsBloques || 0} bloqués`}
              trend="up"
              trendText="+8% ce mois"
              delay={1}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Dons"
              value={stats?.totalDons || 0}
              icon={faGift}
              color="warning"
              subtitle={`${stats?.donsPublies || 0} publiés, ${stats?.donsBloques || 0} bloqués`}
              trend="up"
              trendText="+5% ce mois"
              delay={2}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Échanges"
              value={stats?.totalEchanges || 0}
              icon={faExchangeAlt}
              color="info"
              subtitle={`${stats?.echangesPublies || 0} publiés, ${stats?.echangesBloques || 0} bloqués`}
              trend="up"
              trendText="+18% ce mois"
              delay={3}
            />
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Revenus"
              value={`${((stats?.revenusTotaux || 0) / 1000000).toFixed(1)}M`}
              icon={faMoneyBillWave}
              color="success"
              subtitle={`${(stats?.revenusMensuels || 0).toLocaleString("fr-FR")} FCFA ce mois`}
              trend="up"
              trendText="+25%"
              delay={4}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Avis"
              value={stats?.totalAvis || 0}
              icon={faStar}
              color="warning"
              subtitle={`Note moyenne: ${stats?.avisMoyen || 0}/5`}
              trend="up"
              trendText="+8%"
              delay={5}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Favoris"
              value={stats?.totalFavoris || 0}
              icon={faHeart}
              color="danger"
              subtitle="Ajoutés par les clients"
              trend="up"
              trendText="+22%"
              delay={6}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Conversion"
              value={`${stats?.tauxConversion || 0}%`}
              icon={faPercent}
              color="info"
              subtitle={`Panier moyen: ${(stats?.panierMoyen || 0).toLocaleString("fr-FR")} FCFA`}
              trend="up"
              trendText="+2%"
              delay={7}
            />
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

        {/* Navigation par sections */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "produits" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => {
                  setActiveSection("produits");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                Produits
                <span className="badge bg-white text-success ms-1">
                  {stats?.totalProduits || 0}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "dons" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => {
                  setActiveSection("dons");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faGift} />
                Dons
                <span className="badge bg-white text-warning ms-1">
                  {stats?.totalDons || 0}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "echanges" ? "btn-info" : "btn-outline-info"}`}
                onClick={() => {
                  setActiveSection("echanges");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faExchangeAlt} />
                Échanges
                <span className="badge bg-white text-info ms-1">
                  {stats?.totalEchanges || 0}
                </span>
              </button>

              <button
                className={`btn btn-lg d-flex align-items-center gap-2 ${activeSection === "boutiques" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setActiveSection("boutiques");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faStore} />
                Boutiques
                <span className="badge bg-white text-primary ms-1">
                  {stats?.totalBoutiques || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Onglets pour produits, dons et échanges */}
        {activeSection !== "boutiques" && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${activeTab === "tous" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("tous")}
                >
                  Tous (
                  {activeSection === "produits"
                    ? stats?.totalProduits
                    : activeSection === "dons"
                      ? stats?.totalDons
                      : stats?.totalEchanges}
                  )
                </button>

                <button
                  className={`btn ${activeTab === "publies" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setActiveTab("publies")}
                >
                  Publiés (
                  {activeSection === "produits"
                    ? stats?.produitsPublies
                    : activeSection === "dons"
                      ? stats?.donsPublies
                      : stats?.echangesPublies}
                  )
                </button>

                <button
                  className={`btn ${activeTab === "bloques" ? "btn-danger" : "btn-outline-danger"}`}
                  onClick={() => setActiveTab("bloques")}
                >
                  Bloqués (
                  {activeSection === "produits"
                    ? stats?.produitsBloques
                    : activeSection === "dons"
                      ? stats?.donsBloques
                      : stats?.echangesBloques}
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
                    <FontAwesomeIcon icon={faSearch} className="text-success" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={`Rechercher ${activeSection === "produits" ? "un produit" : activeSection === "dons" ? "un don" : activeSection === "echanges" ? "un échange" : "une boutique"}...`}
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
                      href="/dashboard/produits/create"
                      className="btn btn-success d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouveau produit
                    </Link>
                  )}

                  {activeSection === "dons" && (
                    <Link
                      href="/dashboard/dons/create"
                      className="btn btn-warning d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouveau don
                    </Link>
                  )}

                  {activeSection === "echanges" && (
                    <Link
                      href="/dashboard/echanges/create"
                      className="btn btn-info d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouvel échange
                    </Link>
                  )}

                  {activeSection === "boutiques" && (
                    <Link
                      href="/dashboard/boutiques/create"
                      className="btn btn-primary d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Nouvelle boutique
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
                  {activeSection === "boutiques" && (
                    <FontAwesomeIcon
                      icon={faStore}
                      className="text-muted fs-1"
                    />
                  )}
                </div>
                <h4 className="fw-bold mb-3">Aucun {activeSection} trouvé</h4>
                <p className="text-muted mb-4">
                  {searchTerm
                    ? "Aucun résultat ne correspond à votre recherche."
                    : activeSection === "produits"
                      ? "Commencez par créer votre premier produit !"
                      : activeSection === "dons"
                        ? "Commencez par créer votre premier don !"
                        : activeSection === "echanges"
                          ? "Commencez par créer votre premier échange !"
                          : "Commencez par créer votre première boutique !"}
                </p>
                <Link
                  href={`/dashboard/${activeSection}/create`}
                  className={`btn btn-${activeSection === "produits" ? "success" : activeSection === "dons" ? "warning" : activeSection === "echanges" ? "info" : "primary"} btn-lg`}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Créer un{" "}
                  {activeSection === "produits"
                    ? "produit"
                    : activeSection === "dons"
                      ? "don"
                      : activeSection === "echanges"
                        ? "échange"
                        : "boutique"}
                </Link>
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
                      {activeSection !== "boutiques" && (
                        <th style={{ width: "120px" }}>Prix/Valeur</th>
                      )}
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
                                src={displayData.image}
                                alt={displayData.libelle}
                                className="rounded-3"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    getPlaceholderImage(60, "I");
                                }}
                              />
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
                              {activeSection === "produits" && (
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faStore}
                                    className="me-1"
                                  />
                                  {displayData.boutique}
                                </small>
                              )}
                              {activeSection === "dons" && (
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faTag}
                                    className="me-1"
                                  />
                                  {displayData.type_don}
                                </small>
                              )}
                              {activeSection === "echanges" && (
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faExchangeAlt}
                                    className="me-1"
                                  />
                                  {displayData.objetPropose} →{" "}
                                  {displayData.objetDemande}
                                </small>
                              )}
                              {activeSection === "boutiques" && (
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faTag}
                                    className="me-1"
                                  />
                                  {displayData.type_boutique}
                                </small>
                              )}
                            </div>
                          </td>
                          {activeSection !== "boutiques" && (
                            <td>
                              <span className="fw-bold text-success">
                                {formatPrix(displayData.prix)}
                              </span>
                              {activeSection === "produits" && (
                                <div>
                                  <small className="text-muted">
                                    Stock: {displayData.quantite}
                                  </small>
                                </div>
                              )}
                            </td>
                          )}
                          <td>
                            {activeSection === "boutiques" ? (
                              <>
                                {displayData.estBloque ||
                                displayData.estFerme ? (
                                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                    <FontAwesomeIcon
                                      icon={faBan}
                                      className="me-1"
                                    />
                                    {displayData.estBloque
                                      ? "Bloquée"
                                      : "Fermée"}
                                  </span>
                                ) : displayData.statut === "actif" ? (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                    <FontAwesomeIcon
                                      icon={faCheckCircle}
                                      className="me-1"
                                    />
                                    Active
                                  </span>
                                ) : displayData.statut === "en_review" ? (
                                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                                    <FontAwesomeIcon
                                      icon={faClock}
                                      className="me-1"
                                    />
                                    En revue
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">
                                    <FontAwesomeIcon
                                      icon={faQuestion}
                                      className="me-1"
                                    />
                                    Inactif
                                  </span>
                                )}
                              </>
                            ) : displayData.estBloque ? (
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                <FontAwesomeIcon
                                  icon={faBan}
                                  className="me-1"
                                />
                                Bloqué
                              </span>
                            ) : displayData.estPublie ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="me-1"
                                />
                                Publié
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
                            {activeSection === "produits" &&
                              !displayData.estBloque &&
                              displayData.note_moyenne > 0 && (
                                <div className="mt-1">
                                  <small className="text-warning">
                                    <FontAwesomeIcon
                                      icon={faStar}
                                      className="me-1"
                                    />
                                    {parseFloat(
                                      displayData.note_moyenne,
                                    ).toFixed(1)}
                                  </small>
                                </div>
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
                                onClick={() =>
                                  router.push(
                                    `/dashboard/${activeSection}/${displayData.uuid}`,
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button
                                className="btn btn-outline-success"
                                title="Modifier"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/${activeSection}/${displayData.uuid}/edit`,
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Êtes-vous sûr de vouloir supprimer cet élément ?",
                                    )
                                  ) {
                                    // Logique de suppression
                                  }
                                }}
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
                      <span>Boutiques créées</span>
                      <span className="fw-bold">
                        {stats?.totalBoutiques || 0}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Produits créés</span>
                      <span className="fw-bold">
                        {stats?.totalProduits || 0}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Dons créés</span>
                      <span className="fw-bold">{stats?.totalDons || 0}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Échanges créés</span>
                      <span className="fw-bold">
                        {stats?.totalEchanges || 0}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Revenus totaux</span>
                      <span className="fw-bold text-success">
                        {formatPrix(stats?.revenusTotaux || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Contenu bloqué</span>
                      <span className="fw-bold text-danger">
                        {(stats?.produitsBloques || 0) +
                          (stats?.donsBloques || 0) +
                          (stats?.echangesBloques || 0)}
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
                        href="/dashboard/produits/create"
                        className="btn btn-success btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Ajouter un produit
                      </Link>
                      <button className="btn btn-outline-success btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes produits
                      </button>
                    </>
                  )}
                  {activeSection === "dons" && (
                    <>
                      <Link
                        href="/dashboard/dons/create"
                        className="btn btn-warning btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer un don
                      </Link>
                      <button className="btn btn-outline-warning btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes dons
                      </button>
                    </>
                  )}
                  {activeSection === "echanges" && (
                    <>
                      <Link
                        href="/dashboard/echanges/create"
                        className="btn btn-info btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Proposer un échange
                      </Link>
                      <button className="btn btn-outline-info btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Exporter mes échanges
                      </button>
                    </>
                  )}
                  {activeSection === "boutiques" && (
                    <>
                      <Link
                        href="/dashboard/boutiques/create"
                        className="btn btn-primary btn-lg"
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Créer une boutique
                      </Link>
                      <button className="btn btn-outline-primary btn-lg">
                        <FontAwesomeIcon icon={faDownload} className="me-2" />
                        Gérer mes boutiques
                      </button>
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

        .btn-success {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
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

        .btn-info {
          background: linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }

        .btn-info:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
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

        .bg-opacity-20 {
          --bs-bg-opacity: 0.2;
        }
      `}</style>
    </div>
  );
}
