// app/(back-office)/dashboard-utilisateur/mes-produits/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faChartLine,
  faSpinner,
  faPlus,
  faShoppingCart,
  faUser,
  faStore,
  faPercent,
  faComment,
  faLock,
  faLockOpen,
  faCircle,
  faClock,
  faHistory,
  faFileExport,
  faCog,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faChartBar,
  faChartPie,
  faChartArea,
  faArrowUp,
  faArrowDown,
  faUsers,
  faEye as faEyeRegular,
  faLayerGroup,
  faShieldAlt,
  faRocket,
  faTrophy,
  faBolt,
  faCrown,
  faGem,
  faMedal,
  faFire,
  faBullseye,
  faAward,
  faCubes,
  faBoxOpen,
  faBoxes,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import Link from "next/link";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Interface basée sur la réponse API
interface Utilisateur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
  niveau?: string;
  points?: number;
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
  slug: string;
  type: string | null;
  image_key: string;
  image_direct_url: string | null;
  disponible: boolean;
  publieLe: string | null;
  expireLe: string | null;
  statut: string;
  image: string;
  prix: string;
  description: string | null;
  etoile: number;
  utilisateurUuid: string;
  vendeurUuid: string;
  boutiqueUuid: string | null;
  categorie_uuid: string;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  repartition_notes: string | null;
  demi_etoile: number;
  nombre_favoris: number;
  etoiles_pleines: number;
  etoiles_vides: number;
  utilisateur: Utilisateur;
  estUtilisateur: boolean;
  estVendeur: boolean;
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
  categorie: Categorie;
}

interface ApiResponse {
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

interface SortConfig {
  key: keyof ProduitUtilisateur;
  direction: "asc" | "desc";
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StatsData {
  total: number;
  valeurTotale: number;
  prixMoyen: number;
  publies: number;
  nonPublies: number;
  disponibles: number;
  indisponibles: number;
  totalVues: number;
  totalFavoris: number;
  totalAvis: number;
  produitsParCategorie: { [key: string]: number };
  evolutionMensuelle: Array<{ mois: string; produits: number; ventes: number }>;
}

// Interface pour les données du graphique circulaire
interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Données pour les graphiques (exemple)
const generateChartData = (produits: ProduitUtilisateur[]) => {
  // Données pour le graphique en barres par catégorie
  const categories = produits.reduce(
    (acc, produit) => {
      const cat = produit.categorie?.libelle || "Non catégorisé";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const barChartData = Object.entries(categories).map(([name, value]) => ({
    name,
    produits: value,
    ventes: Math.floor(Math.random() * 100), // Données simulées
  }));

  // Données pour le graphique circulaire (statut)
  const pieChartData: PieChartDataItem[] = [
    {
      name: "Publiés",
      value: produits.filter((p) => p.estPublie).length,
      color: "#28a745",
    },
    {
      name: "Non publiés",
      value: produits.filter((p) => !p.estPublie && !p.estBloque).length,
      color: "#ffc107",
    },
    {
      name: "Bloqués",
      value: produits.filter((p) => p.estBloque).length,
      color: "#dc3545",
    },
  ];

  // Données pour le graphique linéaire (évolution)
  const lineChartData = [
    { mois: "Jan", produits: 12, ventes: 45, revenus: 120000 },
    { mois: "Fév", produits: 18, ventes: 67, revenus: 185000 },
    { mois: "Mar", produits: 25, ventes: 89, revenus: 245000 },
    { mois: "Avr", produits: 32, ventes: 102, revenus: 320000 },
    { mois: "Mai", produits: 28, ventes: 95, revenus: 280000 },
    { mois: "Jun", produits: 35, ventes: 120, revenus: 380000 },
    { mois: "Jul", produits: 42, ventes: 135, revenus: 420000 },
  ];

  // Données radar (performance)
  const radarData = [
    {
      sujet: "Quantité",
      performance:
        produits.reduce((sum, p) => sum + (p.quantite || 0), 0) / 100,
      max: 100,
    },
    {
      sujet: "Prix",
      performance:
        produits.reduce((sum, p) => {
          const prix = parseFloat(p.prix) || 0;
          return sum + (prix > 10000 ? 100 : (prix / 10000) * 100);
        }, 0) / produits.length,
      max: 100,
    },
    {
      sujet: "Notes",
      performance:
        produits.reduce((sum, p) => sum + (p.note_moyenne || 0), 0) *
        20 *
        produits.length,
      max: 100,
    },
    {
      sujet: "Disponibilité",
      performance:
        (produits.filter((p) => p.disponible).length / produits.length) * 100,
      max: 100,
    },
    {
      sujet: "Favoris",
      performance:
        produits.reduce((sum, p) => sum + (p.nombre_favoris || 0), 0) / 10,
      max: 100,
    },
  ];

  return {
    barChartData,
    pieChartData,
    lineChartData,
    radarData,
  };
};

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

// Fonction utilitaire pour les avatars
const getAvatarPlaceholder = (size: number, initials?: string) => {
  const text = initials ? initials.substring(0, 2).toUpperCase() : "U";
  return getPlaceholderImage(size, text, "ffffff", "6c757d");
};

// Fonction utilitaire pour les catégories
const getCategoryPlaceholder = (size: number, categoryName?: string) => {
  const text = categoryName ? categoryName.charAt(0).toUpperCase() : "C";
  return getPlaceholderImage(size, text, "ffffff", "28a745");
};

// Composant de chargement amélioré
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
              Chargement de vos produits
            </h3>
            <p className="text-muted mb-0">Nous préparons votre dashboard...</p>
            <div className="progress mt-4" style={{ height: "6px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Composant de carte de stat amélioré
const StatCard = ({
  title,
  value,
  icon,
  color,
  change,
  subtitle,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: number;
  subtitle?: string;
  isLoading?: boolean;
}) => (
  <div className="card border-0 shadow-sm h-100 animate__animated animate__fadeInUp">
    <div className="card-body p-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="text-uppercase text-muted mb-1 fw-semibold small">
            {title}
          </h6>
          {isLoading ? (
            <div className="placeholder-glow">
              <h2 className="fw-bold mb-0 placeholder col-6"></h2>
            </div>
          ) : (
            <h2 className="fw-bold mb-0 display-6">{value}</h2>
          )}
          {subtitle && <p className="text-muted mb-0 small mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-circle p-3 bg-${color} bg-opacity-10`}>
          <FontAwesomeIcon icon={icon} className={`fs-3 text-${color}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="d-flex align-items-center mt-2">
          <FontAwesomeIcon
            icon={change >= 0 ? faArrowUp : faArrowDown}
            className={`me-1 fs-6 ${change >= 0 ? "text-success" : "text-danger"}`}
          />
          <span
            className={`fw-semibold ${change >= 0 ? "text-success" : "text-danger"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-muted ms-2 small">vs mois dernier</span>
        </div>
      )}
    </div>
    <div className={`card-footer bg-${color} bg-opacity-10 border-0 py-2`}>
      <div className="progress" style={{ height: "4px" }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${Math.min(100, (change || 0) + 50)}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default function ListeProduitsCreeUtilisateur() {
  // États pour les données
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [activeTab, setActiveTab] = useState("tous");

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [disponibiliteFilter, setDisponibiliteFilter] = useState<string>("all");
  const [prixRange, setPrixRange] = useState<[number, number]>([0, 1000000]);

  // Stats et graphiques
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    valeurTotale: 0,
    prixMoyen: 0,
    publies: 0,
    nonPublies: 0,
    disponibles: 0,
    indisponibles: 0,
    totalVues: 0,
    totalFavoris: 0,
    totalAvis: 0,
    produitsParCategorie: {},
    evolutionMensuelle: [],
  });

  const [chartData, setChartData] = useState<any>(null);

  // Charger les produits de l'utilisateur
  const fetchProduitsUtilisateur = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse>(
        "/produits/liste-mes-utilisateur-produits",
      );

      if (response && response.data) {
        const { produits, pagination, utilisateur } = response.data;

        if (!produits || !Array.isArray(produits)) {
          throw new Error("Format de données invalide");
        }

        setProduits(produits);
        setUtilisateur(utilisateur);
        setPagination({
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: pagination.total || 0,
          pages: pagination.totalPages || 1,
        });

        // Calculer les stats
        const total = produits.length;
        const valeurTotale = produits.reduce((sum, produit) => {
          const prix = parseFloat(produit.prix) || 0;
          return sum + prix;
        }, 0);

        const prixMoyen = total > 0 ? valeurTotale / total : 0;
        const publies = produits.filter((p) => p.estPublie).length;
        const nonPublies = total - publies;
        const disponibles = produits.filter((p) => p.disponible).length;
        const indisponibles = total - disponibles;
        const totalFavoris = produits.reduce(
          (sum, p) => sum + (p.nombre_favoris || 0),
          0,
        );
        const totalAvis = produits.reduce(
          (sum, p) => sum + (p.nombre_avis || 0),
          0,
        );

        // Produits par catégorie
        const produitsParCategorie = produits.reduce(
          (acc, produit) => {
            const cat = produit.categorie?.libelle || "Non catégorisé";
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        setStats({
          total,
          valeurTotale,
          prixMoyen,
          publies,
          nonPublies,
          disponibles,
          indisponibles,
          totalVues: Math.floor(Math.random() * 10000), // Donnée simulée
          totalFavoris,
          totalAvis,
          produitsParCategorie,
          evolutionMensuelle: [], // À remplacer par des données réelles
        });

        // Générer les données pour les graphiques
        setChartData(generateChartData(produits));
      } else {
        throw new Error("Réponse API invalide");
      }
    } catch (err: any) {
      console.error(
        "❌ Erreur lors du chargement des produits utilisateur:",
        err,
      );

      let errorMessage = "Erreur lors du chargement de vos produits";

      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status === 404) {
        errorMessage = "Endpoint non trouvé.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setProduits([]);
      setStats({
        total: 0,
        valeurTotale: 0,
        prixMoyen: 0,
        publies: 0,
        nonPublies: 0,
        disponibles: 0,
        indisponibles: 0,
        totalVues: 0,
        totalFavoris: 0,
        totalAvis: 0,
        produitsParCategorie: {},
        evolutionMensuelle: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduitsUtilisateur();
  }, [fetchProduitsUtilisateur]);

  // Formatage
  const formatPrix = (prix: string | number) => {
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

  // Filtrage et tri
  const filteredProduits = useMemo(() => {
    let result = produits.filter((produit) => {
      // Filtre par recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        produit.libelle.toLowerCase().includes(searchLower) ||
        (produit.description &&
          produit.description.toLowerCase().includes(searchLower)) ||
        produit.prix.includes(searchTerm);

      // Filtre par statut
      const matchesStatut =
        statutFilter === "all" ||
        (statutFilter === "published" && produit.estPublie) ||
        (statutFilter === "unpublished" && !produit.estPublie) ||
        (statutFilter === "blocked" && produit.estBloque);

      // Filtre par disponibilité
      const matchesDisponibilite =
        disponibiliteFilter === "all" ||
        (disponibiliteFilter === "available" && produit.disponible) ||
        (disponibiliteFilter === "unavailable" && !produit.disponible);

      // Filtre par prix
      const prix = parseFloat(produit.prix) || 0;
      const matchesPrix = prix >= prixRange[0] && prix <= prixRange[1];

      // Filtre par onglet
      const matchesTab =
        activeTab === "tous" ||
        (activeTab === "publies" && produit.estPublie) ||
        (activeTab === "non-publies" && !produit.estPublie) ||
        (activeTab === "disponibles" && produit.disponible) ||
        (activeTab === "favoris" && produit.is_favoris);

      return (
        matchesSearch &&
        matchesStatut &&
        matchesDisponibilite &&
        matchesPrix &&
        matchesTab
      );
    });

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

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

        // Pour les prix (string)
        if (typeof aValue === "string" && typeof bValue === "string") {
          const aNum = parseFloat(aValue) || 0;
          const bNum = parseFloat(bValue) || 0;
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        return 0;
      });
    }

    // Mettre à jour la pagination
    setPagination((prev) => ({
      ...prev,
      total: result.length,
      pages: Math.ceil(result.length / prev.limit),
    }));

    return result;
  }, [
    produits,
    searchTerm,
    statutFilter,
    disponibiliteFilter,
    prixRange,
    sortConfig,
    activeTab,
  ]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid py-4">
      {/* Header amélioré avec gradient VERT */}
      <div className="mb-5">
        <div
          className="rounded-4 p-4 shadow-lg mb-4"
          style={{
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Effet de superposition */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          ></div>

          <div
            className="row align-items-center"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                {utilisateur && (
                  <div className="position-relative me-4">
                    <img
                      src={
                        utilisateur.avatar ||
                        getAvatarPlaceholder(
                          80,
                          `${utilisateur.prenoms} ${utilisateur.nom}`,
                        )
                      }
                      alt={`${utilisateur.prenoms} ${utilisateur.nom}`}
                      className="rounded-circle border border-4 border-white shadow"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      className="position-absolute bottom-0 end-0 bg-warning rounded-circle border border-3 border-white d-flex align-items-center justify-content-center"
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
                    <FontAwesomeIcon icon={faBox} className="me-2" />
                    Mes Produits
                  </h1>
                  <p className="text-white mb-2" style={{ opacity: 0.9 }}>
                    {utilisateur
                      ? `Bienvenue, ${utilisateur.prenoms} ${utilisateur.nom}`
                      : "Gérez vos produits publiés"}
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0">
                      <FontAwesomeIcon icon={faTrophy} className="me-1" />
                      {utilisateur?.niveau || "Expert Vendeur"}
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0">
                      <FontAwesomeIcon icon={faGem} className="me-1" />
                      {utilisateur?.points || "0"} points
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0">
                      <FontAwesomeIcon icon={faChartLine} className="me-1" />
                      {stats.total} produits
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex flex-column flex-md-row gap-2 justify-content-end align-items-start align-items-md-center">
                <Link
                  href="/dashboard-utilisateur/mes-produits/nouveau"
                  className="btn btn-light btn-lg d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm w-100 w-md-auto"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    color: "#28a745",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.95)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div className="bg-success bg-opacity-10 rounded-circle p-2">
                    <FontAwesomeIcon icon={faPlus} className="text-success" />
                  </div>
                  Nouveau produit
                </Link>
                <button
                  onClick={fetchProduitsUtilisateur}
                  className="btn btn-outline-light btn-lg d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto"
                  disabled={loading}
                  title="Rafraîchir"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    color: "white",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="bg-white bg-opacity-10 rounded-circle p-2">
                    <FontAwesomeIcon
                      icon={faRefresh}
                      spin={loading}
                      className="text-white"
                    />
                  </div>
                  <span className="d-none d-md-inline">Rafraîchir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="row mt-4" style={{ position: "relative", zIndex: 1 }}>
            <div className="col-12">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 me-3">
                  <div
                    className="text-white small mb-1"
                    style={{ opacity: 0.9 }}
                  >
                    Progression mensuelle
                  </div>
                  <div
                    className="progress bg-white bg-opacity-20"
                    style={{
                      height: "8px",
                      borderRadius: "4px",
                      backdropFilter: "blur(5px)",
                      WebkitBackdropFilter: "blur(5px)",
                    }}
                  >
                    <div
                      className="progress-bar bg-white"
                      role="progressbar"
                      style={{
                        width: "65%",
                        borderRadius: "4px",
                        transition: "width 0.6s ease",
                      }}
                      aria-valuenow={65}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
                <div className="text-white fw-bold">
                  65%{" "}
                  <span
                    className="text-white"
                    style={{ opacity: 0.7, fontSize: "0.875rem" }}
                  >
                    Objectif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques améliorées */}
        <div className="row g-4 mb-4">
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Total Produits"
              value={stats.total}
              icon={faBoxes}
              color="primary"
              change={12}
              subtitle={`${filteredProduits.length} filtré(s)`}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Valeur Totale"
              value={formatPrix(stats.valeurTotale)}
              icon={faMoneyBillWave}
              color="success"
              change={8}
              subtitle={`Moyenne: ${formatPrix(stats.prixMoyen)}`}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Produits Publiés"
              value={stats.publies}
              icon={faRocket}
              color="info"
              change={5}
              subtitle={`${stats.nonPublies} non publiés`}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Disponibles"
              value={stats.disponibles}
              icon={faCheckCircle}
              color="warning"
              change={15}
              subtitle={`${stats.indisponibles} indisponibles`}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Total Favoris"
              value={stats.totalFavoris}
              icon={faHeart}
              color="danger"
              change={23}
              subtitle={`${produits.filter((p) => p.is_favoris).length} produits favoris`}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatCard
              title="Sélectionnés"
              value={selectedProduits.length}
              icon={faBullseye}
              color="purple"
              subtitle={
                selectedProduits.length > 0
                  ? "Actions disponibles"
                  : "Sélectionnez des produits"
              }
            />
          </div>
        </div>

        {/* Graphiques */}
        <div className="row g-4 mb-4">
          {/* Graphique linéaire */}
          <div className="col-xl-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="me-2 text-primary"
                    />
                    Évolution Mensuelle
                  </h5>
                  <div className="dropdown">
                    <button
                      className="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      Cette année
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item" href="#">
                          Cette année
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          L'année dernière
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Tout
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData?.lineChartData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        value.toLocaleString("fr-FR"),
                        "",
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="produits"
                      stroke="#4e73df"
                      fill="#4e73df"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventes"
                      stroke="#1cc88a"
                      fill="#1cc88a"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Graphique circulaire */}
          <div className="col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faChartPie}
                    className="me-2 text-primary"
                  />
                  Répartition par Statut
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData?.pieChartData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(chartData?.pieChartData || []).map(
                        (entry: PieChartDataItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="row text-center mt-3">
                  <div className="col-4">
                    <div className="fw-bold text-success">{stats.publies}</div>
                    <small className="text-muted">Publiés</small>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold text-warning">
                      {stats.nonPublies}
                    </div>
                    <small className="text-muted">Non publiés</small>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold text-danger">
                      {produits.filter((p) => p.estBloque).length}
                    </div>
                    <small className="text-muted">Bloqués</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques supplémentaires */}
        <div className="row g-4 mb-4">
          {/* Graphique en barres */}
          <div className="col-xl-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="me-2 text-primary"
                  />
                  Produits par Catégorie
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData?.barChartData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="produits"
                      fill="#4e73df"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="ventes"
                      fill="#1cc88a"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Graphique radar */}
          <div className="col-xl-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faBullseye}
                    className="me-2 text-primary"
                  />
                  Analyse de Performance
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={chartData?.radarData || []}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="sujet" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Performance"
                      dataKey="performance"
                      stroke="#4e73df"
                      fill="#4e73df"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <ul
              className="nav nav-tabs nav-fill"
              id="produitsTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "tous" ? "active" : ""}`}
                  onClick={() => setActiveTab("tous")}
                  style={{
                    border: "none",
                    color: "#6c757d",
                    fontWeight: 500,
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "tous") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faBox} className="me-2" />
                  Tous les produits
                  <span className="badge bg-primary ms-2">{stats.total}</span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "publies" ? "active" : ""}`}
                  onClick={() => setActiveTab("publies")}
                  style={{
                    border: "none",
                    color: "#6c757d",
                    fontWeight: 500,
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "publies") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faRocket} className="me-2" />
                  Publiés
                  <span className="badge bg-success ms-2">{stats.publies}</span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "non-publies" ? "active" : ""}`}
                  onClick={() => setActiveTab("non-publies")}
                  style={{
                    border: "none",
                    color: "#6c757d",
                    fontWeight: 500,
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "non-publies") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Non publiés
                  <span className="badge bg-warning ms-2">
                    {stats.nonPublies}
                  </span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "disponibles" ? "active" : ""}`}
                  onClick={() => setActiveTab("disponibles")}
                  style={{
                    border: "none",
                    color: "#6c757d",
                    fontWeight: 500,
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "disponibles") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Disponibles
                  <span className="badge bg-info ms-2">
                    {stats.disponibles}
                  </span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "favoris" ? "active" : ""}`}
                  onClick={() => setActiveTab("favoris")}
                  style={{
                    border: "none",
                    color: "#6c757d",
                    fontWeight: 500,
                    padding: "1rem 1.5rem",
                    transition: "all 0.3s ease",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "favoris") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Favoris
                  <span className="badge bg-danger ms-2">
                    {produits.filter((p) => p.is_favoris).length}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre de recherche et filtres améliorée */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-lg-4">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon icon={faSearch} className="text-primary" />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg border-start-0"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-3">
                  <div className="flex-fill">
                    <select
                      className="form-select"
                      value={statutFilter}
                      onChange={(e) => setStatutFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="published">Publiés</option>
                      <option value="unpublished">Non publiés</option>
                      <option value="blocked">Bloqués</option>
                    </select>
                  </div>

                  <div className="flex-fill">
                    <select
                      className="form-select"
                      value={disponibiliteFilter}
                      onChange={(e) => setDisponibiliteFilter(e.target.value)}
                    >
                      <option value="all">Toutes disponibilités</option>
                      <option value="available">Disponibles</option>
                      <option value="unavailable">Indisponibles</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => {}}
                    style={{
                      background:
                        "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(40, 167, 69, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Filtrer
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {}}
                  >
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Exporter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'alerte améliorés */}
        {error && (
          <div
            className="alert alert-danger alert-dismissible fade show shadow-sm border-0"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="fs-4"
                />
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="alert-heading mb-1">Erreur</h5>
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
            className="alert alert-success alert-dismissible fade show shadow-sm border-0"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faCheckCircle} className="fs-4" />
              </div>
              <div className="flex-grow-1 ms-3">
                <h5 className="alert-heading mb-1">Succès !</h5>
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

        {/* Tableau des produits amélioré */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {filteredProduits.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="text-muted"
                    style={{ fontSize: "4rem" }}
                  />
                </div>
                <h4 className="fw-bold mb-3">Aucun produit trouvé</h4>
                <p className="text-muted mb-4">
                  {produits.length === 0
                    ? "Commencez par créer votre premier produit !"
                    : "Ajustez vos filtres pour trouver ce que vous cherchez."}
                </p>
                <Link
                  href="/dashboard-utilisateur/mes-produits/nouveau"
                  className="btn btn-primary btn-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                    border: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(40, 167, 69, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Créer un produit
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
                              selectedProduits.length ===
                                filteredProduits.length &&
                              filteredProduits.length > 0
                            }
                            onChange={() => {
                              if (
                                selectedProduits.length ===
                                filteredProduits.length
                              ) {
                                setSelectedProduits([]);
                              } else {
                                setSelectedProduits(
                                  filteredProduits.map((p) => p.uuid),
                                );
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th style={{ width: "80px" }}>Image</th>
                      <th>Produit</th>
                      <th style={{ width: "120px" }}>Prix</th>
                      <th style={{ width: "100px" }}>Statut</th>
                      <th style={{ width: "120px" }}>Disponibilité</th>
                      <th style={{ width: "100px" }}>Quantité</th>
                      <th style={{ width: "120px" }}>Catégorie</th>
                      <th style={{ width: "150px" }} className="text-end pe-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProduits.slice(0, 10).map((produit) => (
                      <tr
                        key={produit.uuid}
                        className={
                          selectedProduits.includes(produit.uuid)
                            ? "table-active"
                            : ""
                        }
                        style={{
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(40, 167, 69, 0.05)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedProduits.includes(produit.uuid)) {
                            e.currentTarget.style.backgroundColor = "";
                          }
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <td className="ps-4">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedProduits.includes(produit.uuid)}
                              onChange={() => {
                                setSelectedProduits((prev) =>
                                  prev.includes(produit.uuid)
                                    ? prev.filter((id) => id !== produit.uuid)
                                    : [...prev, produit.uuid],
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
                              src={
                                produit.image ||
                                getPlaceholderImage(
                                  60,
                                  produit.libelle?.charAt(0) || "P",
                                )
                              }
                              alt={produit.libelle}
                              className="rounded-3"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                            {produit.is_favoris && (
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
                              {produit.libelle}
                            </span>
                            <small
                              className="text-muted text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {produit.description?.substring(0, 60) ||
                                "Pas de description"}
                            </small>
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              {formatDate(produit.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-primary">
                            {formatPrix(produit.prix)}
                          </span>
                        </td>
                        <td>
                          {produit.estPublie ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="me-1"
                              />
                              Publié
                            </span>
                          ) : produit.estBloque ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                              <FontAwesomeIcon icon={faBan} className="me-1" />
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
                          {produit.disponible ? (
                            <span className="badge bg-info bg-opacity-10 text-info border border-info">
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="me-1"
                              />
                              Disponible
                            </span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="me-1"
                              />
                              Indisponible
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {produit.quantite}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-2">
                              <div
                                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                style={{ width: "30px", height: "30px" }}
                              >
                                <FontAwesomeIcon
                                  icon={faTag}
                                  className="text-primary fs-6"
                                />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold small">
                                {produit.categorie?.libelle}
                              </div>
                              <small className="text-muted">
                                {produit.categorie?.type}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm" role="group">
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
                              className="btn btn-outline-warning"
                              title="Publier/Dépublier"
                            >
                              <FontAwesomeIcon icon={faRocket} />
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination améliorée */}
          {filteredProduits.length > 10 && (
            <div className="card-footer bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">
                    Affichage de <strong>1</strong> à <strong>10</strong> sur{" "}
                    <strong>{filteredProduits.length}</strong> produits
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
                <div>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                  >
                    <option>10 par page</option>
                    <option>25 par page</option>
                    <option>50 par page</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cartes d'information améliorées */}
        <div className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-info"
                  />
                  Conseils de Gestion
                </h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-success bg-opacity-10 p-2">
                          <FontAwesomeIcon
                            icon={faRocket}
                            className="text-success"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Publiez régulièrement</h6>
                        <p className="text-muted mb-0 small">
                          Maintenez vos produits publiés pour augmenter leur
                          visibilité
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                          <FontAwesomeIcon
                            icon={faChartLine}
                            className="text-warning"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Analysez vos performances</h6>
                        <p className="text-muted mb-0 small">
                          Utilisez les graphiques pour optimiser votre stratégie
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                          <FontAwesomeIcon
                            icon={faBolt}
                            className="text-primary"
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h6 className="mb-1">Actions rapides</h6>
                        <p className="text-muted mb-0 small">
                          Utilisez les actions en masse pour gagner du temps
                        </p>
                      </div>
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
                    icon={faTrophy}
                    className="me-2 text-warning"
                  />
                  Prochain Objectif
                </h5>
                <div className="text-center py-4">
                  <div className="position-relative d-inline-block mb-3">
                    <div
                      className="progress"
                      style={{ width: "120px", height: "120px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <h2 className="fw-bold mb-0">75%</h2>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-2">
                    Objectif: 100 produits publiés
                  </h6>
                  <p className="text-muted mb-0">
                    Vous avez publié <strong>{stats.publies}</strong> produits
                    sur <strong>100</strong>
                  </p>
                  <div className="mt-3">
                    <button
                      className="btn btn-primary"
                      style={{
                        background:
                          "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                        border: "none",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(40, 167, 69, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Ajouter des produits
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .badge {
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .progress {
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar {
          transition: width 0.6s ease;
        }

        .card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .animate__animated {
          animation-duration: 0.5s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate__fadeInUp {
          animation-name: fadeInUp;
        }

        .bg-purple {
          background-color: #6f42c1 !important;
        }

        .text-purple {
          color: #6f42c1 !important;
        }

        .nav-link.active {
          color: #28a745 !important;
          border-bottom: 3px solid #28a745 !important;
          background-color: rgba(40, 167, 69, 0.05) !important;
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

        .table-active {
          background-color: rgba(40, 167, 69, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
