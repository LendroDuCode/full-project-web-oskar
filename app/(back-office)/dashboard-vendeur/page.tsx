"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faShoppingBag,
  faGift,
  faExchangeAlt,
  faMoneyBillWave,
  faStar,
  faHeart,
  faTachometerAlt,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faSync,
  faDownload,
  faPlus,
  faFilter,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faBan,
  faCheckCircle,
  faClock,
  faQuestion,
  faTag,
  faCalendarWeek,
  faArrowUp,
  faArrowDown,
  faBoxOpen,
  faGift as FaGiftIcon,
  faExchangeAlt as FaExchangeAltIcon,
  faStore as FaStoreIcon,
  faBolt,
  faPercent,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

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
  revenusProduits: number;
  totalFavoris: number;
  produitsFavoris: number;
  donsFavoris: number;
  echangesFavoris: number;
  avisMoyen: number;
  totalAvis: number;
  tauxConversion: number;
  panierMoyen: number;
}

interface Produit {
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
  uuid: string;
  libelle: string;
  slug?: string;
  type?: string | null;
  image_key?: string | null;
  image_direct_url?: string | null;
  disponible?: boolean;
  publieLe?: string | null;
  expireLe?: string | null;
  nombreFavoris?: number;
  statut: string;
  image: string;
  prix: string;
  description?: string;
  etoile?: number;
  utilisateurUuid?: string | null;
  vendeurUuid?: string | null;
  agentUuid?: string | null;
  boutiqueUuid?: string | null;
  boutique?: {
    nom: string;
    uuid: string;
    logo?: string;
    logo_key?: string;
  } | null;
  categorie_uuid?: string;
  categorie?: {
    libelle: string;
    uuid: string;
  };
  estPublie: boolean;
  estBloque: boolean;
  is_favoris?: boolean;
  adminUuid?: string | null;
  dateCreation?: string | null;
  updatedAt?: string | null;
  quantite: number;
  note_moyenne?: string | number;
  nombre_avis?: number;
  repartition_notes?: any;
  demi_etoile?: number;
  etoiles_pleines?: number;
  etoiles_vides?: number;
  estUtilisateur?: boolean;
  estVendeur?: boolean;
}

interface Don {
  uuid: string;
  type_don: string;
  nom: string;
  prix: number | null;
  quantite: number;
  image_key?: string | null;
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
  dateCreation?: string | null;
  updatedAt?: string | null;
  image_url?: string;
  nombreFavoris?: number;
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
  estPublie: boolean | null;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  dateRefus: string | null;
  categorie: string;
  dateCreation?: string | null;
  updatedAt?: string | null;
  image_url?: string;
  nombreFavoris?: number;
}

interface Boutique {
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string;
  banniere: string;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key?: string;
  banniere_key?: string;
  statut: string;
  created_at: string;
  updated_at: string;
  type_boutique: {
    libelle: string;
    code: string;
  } | null;
  vendeurUuid?: string;
  agentUuid?: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
  produits_count?: number;
  adresse?: string;
  ville?: string;
  telephone?: string;
  email?: string;
}

interface Vendeur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_inscription?: string;
}

interface FavoriItem {
  uuid: string;
  itemUuid: string;
  type: "produit" | "don" | "echange";
  produit?: Produit;
  don?: Don;
  echange?: Echange;
  createdAt: string;
}

interface ApiResponseProduits {
  data: Produit[];
  total?: number;
  page?: number;
  limit?: number;
  vendeur?: Vendeur;
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
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

interface ApiResponseFavoris {
  favoris: FavoriItem[];
  total: number;
}

// ✅ FONCTION POUR OBTENIR L'URL DE L'IMAGE AVEC buildImageUrl
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  const url = buildImageUrl(imagePath);
  return url || '';
};

// ✅ FONCTION POUR LES IMAGES PLACEHOLDER AVEC FALLBACK
const getPlaceholderImage = (
  size: number,
  text?: string,
  color?: string,
  bgColor?: string,
): string => {
  const defaultText = text || size.toString();
  const defaultColor = color || "ffffff";
  const defaultBgColor = bgColor || "28a745";
  return `https://via.placeholder.com/${size}/${defaultBgColor}/${defaultColor}?text=${encodeURIComponent(defaultText)}`;
};

// ✅ FONCTION POUR OBTENIR L'IMAGE D'UN ÉLÉMENT AVEC FALLBACK
const getItemImage = (item: any, type: string, defaultText: string): string => {
  let imagePath = null;
  
  if (type === "produit") {
    imagePath = item.image || item.image_key || item.image_direct_url;
  } else if (type === "don") {
    imagePath = item.image || item.image_key || item.image_url;
  } else if (type === "echange") {
    imagePath = item.image || item.image_key || item.image_url;
  } else if (type === "boutique") {
    imagePath = item.logo || item.logo_key;
  }
  
  if (imagePath) {
    const url = getImageUrl(imagePath);
    if (url) return url;
  }
  
  const bgColor = 
    type === "produit" ? "28a745" :
    type === "don" ? "8b5cf6" :
    type === "echange" ? "f59e0b" :
    type === "boutique" ? "0d6efd" : "6c757d";
  
  const size = 60;
  return getPlaceholderImage(size, defaultText, "ffffff", bgColor);
};

// ✅ FONCTION POUR EXTRAIRE LES DONNÉES DE LA RÉPONSE (gère tous les formats)
const extractItems = <T,>(response: any): T[] => {
  if (!response) return [];

  // Si c'est déjà un tableau
  if (Array.isArray(response)) return response;

  // Format: { data: [...] }
  if (response.data && Array.isArray(response.data)) return response.data;

  // Format: { data: { produits: [...] } }
  if (response.data?.produits && Array.isArray(response.data.produits))
    return response.data.produits;

  // Format: { data: { dons: [...] } }
  if (response.data?.dons && Array.isArray(response.data.dons))
    return response.data.dons;

  // Format: { data: { echanges: [...] } }
  if (response.data?.echanges && Array.isArray(response.data.echanges))
    return response.data.echanges;

  // Format: { produits: [...] }
  if (response.produits && Array.isArray(response.produits))
    return response.produits;

  // Format: { dons: [...] }
  if (response.dons && Array.isArray(response.dons)) return response.dons;

  // Format: { echanges: [...] }
  if (response.echanges && Array.isArray(response.echanges))
    return response.echanges;

  // Format: { favoris: [...] }
  if (response.favoris && Array.isArray(response.favoris))
    return response.favoris;

  return [];
};

// Formatage
const formatPrix = (prix: string | number | null) => {
  if (prix === null || prix === undefined) return "Gratuit";

  let montant: number;
  if (typeof prix === "string") {
    const cleanPrix = prix.replace(/[^0-9.-]/g, "");
    montant = parseFloat(cleanPrix) || 0;
  } else {
    montant = prix || 0;
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
};

// ✅ Fonction pour formater les grands nombres avec adaptation de la taille
const formatLargeNumber = (num: number): { value: string; size: string } => {
  const absNum = Math.abs(num);
  
  if (absNum >= 1_000_000_000) {
    return { 
      value: (num / 1_000_000_000).toFixed(1) + 'B', 
      size: 'h1' 
    };
  } else if (absNum >= 1_000_000) {
    return { 
      value: (num / 1_000_000).toFixed(1) + 'M', 
      size: 'h2' 
    };
  } else if (absNum >= 10_000) {
    return { 
      value: (num / 1000).toFixed(1) + 'k', 
      size: 'h2' 
    };
  } else if (absNum >= 1000) {
    return { 
      value: num.toLocaleString('fr-FR'), 
      size: 'h2' 
    };
  } else {
    return { 
      value: num.toString(), 
      size: absNum >= 100 ? 'h2' : 'display-6' 
    };
  }
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
            <h3 className="fw-bold mb-3 text-dark">
              Chargement de votre dashboard
            </h3>
            <p className="text-muted mb-0">Veuillez patienter...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Composant de carte de stat avec gestion adaptative de la taille
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

  // Déterminer la taille de la police en fonction de la longueur du nombre
  const getFontSizeClass = (val: string | number): string => {
    const str = val.toString();
    const length = str.length;
    
    if (str.includes('B') || str.includes('M') || str.includes('k')) {
      if (length <= 4) return 'fs-1';
      if (length <= 6) return 'fs-2';
      return 'fs-3';
    }
    
    if (length <= 4) return 'display-6';
    if (length <= 6) return 'fs-1';
    if (length <= 8) return 'fs-2';
    if (length <= 10) return 'fs-3';
    return 'fs-4';
  };

  const fontSizeClass = getFontSizeClass(value);
  const isNumericValue = typeof value === 'number' || !isNaN(Number(value?.toString().replace(/[^0-9.-]/g, '')));

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
      <div className="card-body p-3 p-lg-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1 me-2">
            <h6 className="text-uppercase text-muted mb-1 fw-semibold small">
              {title}
            </h6>
            <div className="d-flex align-items-baseline flex-wrap">
              <h2 className={`fw-bold mb-0 ${fontSizeClass} text-dark text-truncate`} style={{ maxWidth: "calc(100% - 40px)" }}>
                {value}
              </h2>
              {isNumericValue && (
                <small className="text-muted ms-1 d-none d-sm-inline">
                  {typeof value === 'number' && value >= 1000 ? (
                    <span className="badge bg-light text-dark">{value.toLocaleString('fr-FR')}</span>
                  ) : null}
                </small>
              )}
            </div>
            {subtitle && (
              <p className="text-muted mb-0 small mt-1 text-truncate" style={{ maxWidth: "200px" }}>
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`rounded-circle p-2 p-sm-3 ${colorClasses[color]} d-flex align-items-center justify-content-center flex-shrink-0`}
            style={{ width: "clamp(40px, 5vw, 60px)", height: "clamp(40px, 5vw, 60px)" }}
          >
            <FontAwesomeIcon icon={icon} className={`fs-5 fs-sm-4 fs-md-3`} />
          </div>
        </div>
        {trend && trendText && (
          <div className="d-flex align-items-center mt-2 small">
            {getTrendIcon()}
            <span
              className={`fw-semibold ms-1 ${trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted"} text-truncate`}
              style={{ maxWidth: "150px" }}
            >
              {trendText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Composant de carte de boutique
const BoutiqueCard = ({ boutique }: { boutique: Boutique }) => {
  const [imageError, setImageError] = useState(false);
  
  const logoUrl = !imageError && boutique.logo_key 
    ? getImageUrl(boutique.logo_key) 
    : getPlaceholderImage(100, boutique.nom?.charAt(0) || "B", "ffffff", "0d6efd");

  const getStatusBadge = () => {
    if (boutique.est_bloque) {
      return <span className="badge bg-danger">Bloquée</span>;
    }
    if (boutique.est_ferme) {
      return <span className="badge bg-secondary">Fermée</span>;
    }
    if (boutique.statut === "actif") {
      return <span className="badge bg-success">Active</span>;
    }
    if (boutique.statut === "en_attente") {
      return <span className="badge bg-warning text-dark">En attente</span>;
    }
    return <span className="badge bg-secondary">Inactive</span>;
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0 shadow-sm hover-lift">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative me-3">
              <img
                src={logoUrl}
                alt={boutique.nom}
                className="rounded-3"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                onError={() => setImageError(true)}
              />
              <div className="position-absolute top-0 end-0 translate-middle">
                {getStatusBadge()}
              </div>
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1 text-dark">{boutique.nom}</h6>
              <small className="text-muted d-block">
                <FontAwesomeIcon icon={faTag} className="me-1" size="xs" />
                {boutique.type_boutique?.libelle || "Boutique standard"}
              </small>
            </div>
          </div>

          <p className="small text-muted mb-2">
            {boutique.description || "Aucune description"}
          </p>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-light text-dark border">
              <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
              {boutique.produits_count || 0} produit(s)
            </span>
            <span className="badge bg-light text-dark border">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              {formatDate(boutique.created_at)}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <Link
              href={`/dashboard-vendeur/boutiques/${boutique.uuid}`}
              className="btn btn-sm btn-outline-primary"
            >
              <FontAwesomeIcon icon={faEye} className="me-1" />
              Voir
            </Link>
            <Link
              href={`/dashboard-vendeur/boutiques/${boutique.uuid}/edit`}
              className="btn btn-sm btn-outline-success"
            >
              <FontAwesomeIcon icon={faEdit} className="me-1" />
              Modifier
            </Link>
          </div>
        </div>
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
  const [dons, setDons] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
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

  // Fonction pour calculer la somme des prix des produits
  const calculerRevenusProduits = (produitsData: Produit[]): number => {
    return produitsData.reduce((total, produit) => {
      if (produit.prix) {
        const prixNettoye = produit.prix.replace(/[^0-9.-]/g, "");
        const prix = parseFloat(prixNettoye) || 0;
        return total + prix;
      }
      return total;
    }, 0);
  };

  // ✅ Fonction pour charger les favoris
  const fetchFavoris = useCallback(async () => {
    try {
      const response = await api.get<ApiResponseFavoris>(API_ENDPOINTS.FAVORIS.LIST);
      let favorisData: FavoriItem[] = [];

      if (response?.favoris && Array.isArray(response.favoris)) {
        favorisData = response.favoris;
      } else {
        favorisData = extractItems<FavoriItem>(response);
      }

      setFavoris(favorisData);
      return favorisData;
    } catch (err) {
      console.warn("Erreur chargement favoris:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour calculer les favoris par type
  const calculerFavorisParType = (favorisData: FavoriItem[]) => {
    return {
      produits: favorisData.filter(f => f.type === "produit").length,
      dons: favorisData.filter(f => f.type === "don").length,
      echanges: favorisData.filter(f => f.type === "echange").length,
      total: favorisData.length
    };
  };

  // ✅ Fonction pour charger les produits publiés spécifiques
  const fetchProduitsPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_VENDEUR);
      return extractItems<Produit>(response);
    } catch (err) {
      console.warn("Erreur chargement produits publiés:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour charger les produits bloqués
  const fetchProduitsBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.BLOCKED);
      return extractItems<Produit>(response);
    } catch (err) {
      console.warn("Erreur chargement produits bloqués:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour charger les dons publiés
  const fetchDonsPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.DONS.LISTE_DON_PUBLIE_VENDEUR);
      return Array.isArray(response) ? response : [];
    } catch (err) {
      console.warn("Erreur chargement dons publiés:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour charger les dons bloqués
  const fetchDonsBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.DONS.VENDEUR_BLOCKED);
      return extractItems<Don>(response);
    } catch (err) {
      console.warn("Erreur chargement dons bloqués:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour charger les échanges publiés
  const fetchEchangesPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_VENDEUR);
      return Array.isArray(response) ? response : [];
    } catch (err) {
      console.warn("Erreur chargement échanges publiés:", err);
      return [];
    }
  }, []);

  // ✅ Fonction pour charger les échanges bloqués
  const fetchEchangesBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.ECHANGES.VENDEUR_BLOCKED);
      return extractItems<Echange>(response);
    } catch (err) {
      console.warn("Erreur chargement échanges bloqués:", err);
      return [];
    }
  }, []);

  // Charger toutes les données
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les boutiques
      let boutiquesData: Boutique[] = [];
      try {
        const boutiquesRes = await api.get<ApiResponseBoutiques>(
          API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR,
        );
        boutiquesData = extractItems<Boutique>(boutiquesRes);
        setBoutiques(boutiquesData);
      } catch (err) {
        console.warn("Erreur chargement boutiques:", err);
      }

      // Charger tous les produits
      let produitsData: Produit[] = [];
      try {
        const produitsRes = await api.get<ApiResponseProduits>(
          API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS,
        );
        produitsData = extractItems<Produit>(produitsRes);
        
        // Enrichir avec les données de boutique
        produitsData = produitsData.map((produit) => ({
          ...produit,
          boutique: produit.boutique || { nom: "Sans boutique", uuid: "" },
        }));
        
        setProduits(produitsData);

        // Récupérer le vendeur si disponible
        if (produitsRes && "vendeur" in produitsRes && produitsRes.vendeur) {
          setVendeur(produitsRes.vendeur);
        }
      } catch (err) {
        console.warn("Erreur chargement produits:", err);
      }

      // Charger tous les dons
      let donsData: Don[] = [];
      try {
        const donsRes = await api.get<ApiResponseDons>(
          API_ENDPOINTS.DONS.VENDEUR_DONS,
        );
        donsData = extractItems<Don>(donsRes);
        setDons(donsData);
      } catch (err) {
        console.warn("Erreur chargement dons:", err);
      }

      // Charger tous les échanges
      let echangesData: Echange[] = [];
      try {
        const echangesRes = await api.get<ApiResponseEchanges>(
          API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES,
        );
        echangesData = extractItems<Echange>(echangesRes);
        setEchanges(echangesData);
      } catch (err) {
        console.warn("Erreur chargement échanges:", err);
      }

      // Charger les favoris
      const favorisData = await fetchFavoris();
      
      // Charger les données spécifiques pour les statistiques avancées
      const [produitsPublies, produitsBloques, donsPublies, donsBloques, echangesPublies, echangesBloques] = await Promise.all([
        fetchProduitsPublies(),
        fetchProduitsBloques(),
        fetchDonsPublies(),
        fetchDonsBloques(),
        fetchEchangesPublies(),
        fetchEchangesBloques(),
      ]);

      // Calculer les favoris par type
      const favorisParType = calculerFavorisParType(favorisData);

      // Calculer les statistiques
      const revenusProduits = calculerRevenusProduits(produitsData);

      const statsData: Stats = {
        totalBoutiques: boutiquesData.length,
        boutiquesActives: boutiquesData.filter(
          (b) => b.statut === "actif" && !b.est_bloque && !b.est_ferme,
        ).length,
        boutiquesEnReview: boutiquesData.filter((b) => b.statut === "en_attente")
          .length,
        boutiquesBloquees: boutiquesData.filter(
          (b) => b.est_bloque || b.est_ferme,
        ).length,
        totalProduits: produitsData.length,
        produitsPublies: produitsPublies.length,
        produitsNonPublies: produitsData.filter(
          (p) => !p.estPublie && !p.estBloque,
        ).length,
        produitsBloques: produitsBloques.length,
        totalDons: donsData.length,
        donsPublies: donsPublies.length,
        donsBloques: donsBloques.length,
        donsEnAttente: donsData.filter((d) => !d.estPublie && !d.est_bloque)
          .length,
        totalEchanges: echangesData.length,
        echangesPublies: echangesPublies.length,
        echangesBloques: echangesBloques.length,
        echangesEnAttente: echangesData.filter((e) => !e.estPublie).length,
        revenusTotaux: revenusProduits,
        revenusProduits: revenusProduits,
        totalFavoris: favorisParType.total,
        produitsFavoris: favorisParType.produits,
        donsFavoris: favorisParType.dons,
        echangesFavoris: favorisParType.echanges,
        avisMoyen: produitsData.reduce((sum, p) => {
          const note = typeof p.note_moyenne === 'string' ? parseFloat(p.note_moyenne) : (p.note_moyenne || 0);
          return sum + note;
        }, 0) / (produitsData.length || 1),
        totalAvis: produitsData.reduce(
          (sum, p) => sum + (p.nombre_avis || 0),
          0,
        ),
        tauxConversion: 2.8,
        panierMoyen:
          produitsData.length > 0
            ? Math.round(revenusProduits / produitsData.length)
            : 0,
      };

      setStats(statsData);
    } catch (err: any) {
      console.error("Erreur lors du chargement du dashboard:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Erreur lors du chargement des données. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchProduitsPublies, fetchProduitsBloques, fetchDonsPublies, fetchDonsBloques, fetchEchangesPublies, fetchEchangesBloques, fetchFavoris]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filtrer les données selon la section et l'onglet actifs
  const getFilteredData = () => {
    let data: any[] = [];

    switch (activeSection) {
      case "produits":
        data = produits;
        break;
      case "dons":
        data = dons;
        break;
      case "echanges":
        data = echanges;
        break;
      case "boutiques":
        data = boutiques;
        break;
    }

    // Filtrer par onglet (tous/publies/bloques)
    if (activeSection !== "boutiques") {
      if (activeTab === "publies") {
        data = data.filter((item) => item.estPublie === true);
      } else if (activeTab === "bloques") {
        data = data.filter((item) => 
          item.estBloque === true || item.est_bloque === true
        );
      }
    }

    // Appliquer le filtre de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter((item: any) => {
        if (activeSection === "boutiques") {
          return (
            item.nom?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.type_boutique?.libelle?.toLowerCase().includes(searchLower)
          );
        } else if (activeSection === "produits") {
          return (
            item.libelle?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.categorie?.libelle?.toLowerCase().includes(searchLower)
          );
        } else if (activeSection === "dons") {
          return (
            item.nom?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.categorie?.toLowerCase().includes(searchLower)
          );
        } else if (activeSection === "echanges") {
          return (
            item.nomElementEchange?.toLowerCase().includes(searchLower) ||
            item.message?.toLowerCase().includes(searchLower) ||
            item.objetPropose?.toLowerCase().includes(searchLower) ||
            item.objetDemande?.toLowerCase().includes(searchLower) ||
            item.categorie?.toLowerCase().includes(searchLower)
          );
        }
        return false;
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
          image: getItemImage(item, "produit", "P"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: item.estBloque || false,
          categorie: item.categorie?.libelle || "Non catégorisé",
          date: item.dateCreation || item.createdAt || item.updatedAt,
          boutique: item.boutique?.nom || "Sans boutique",
          note_moyenne: item.note_moyenne || 0,
          nombre_avis: item.nombre_avis || 0,
          nombre_favoris: item.nombreFavoris || 0,
          quantite: item.quantite || 0,
        };
      case "dons":
        return {
          uuid: item.uuid,
          libelle: item.nom || "Don",
          description: item.description || "Pas de description",
          image: getItemImage(item, "don", "D"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: item.est_bloque || false,
          categorie: item.categorie || "Non catégorisé",
          date: item.date_debut || item.dateCreation || item.createdAt,
          type_don: item.type_don || "objet",
          quantite: item.quantite || 1,
          nombre_favoris: item.nombreFavoris || 0,
        };
      case "echanges":
        return {
          uuid: item.uuid,
          libelle: item.nomElementEchange || "Échange",
          description: item.message || "Pas de description",
          image: getItemImage(item, "echange", "E"),
          prix: item.prix || null,
          statut: item.statut || "inconnu",
          estPublie: item.estPublie || false,
          estBloque: false,
          categorie: item.categorie || "Non catégorisé",
          date: item.dateProposition || item.dateCreation || item.createdAt,
          objetPropose: item.objetPropose || "",
          objetDemande: item.objetDemande || "",
          nombre_favoris: item.nombreFavoris || 0,
        };
      case "boutiques":
        return {
          uuid: item.uuid,
          libelle: item.nom || "Boutique",
          description: item.description || "Pas de description",
          image: getItemImage(item, "boutique", "B"),
          statut: item.statut || "inconnu",
          estBloque: item.est_bloque || false,
          estFerme: item.est_ferme || false,
          date: item.created_at,
          type_boutique: item.type_boutique?.libelle || "Standard",
          produits_count: item.produits_count || 0,
          adresse: item.adresse || "Non spécifiée",
          ville: item.ville || "Non spécifiée",
          telephone: item.telephone || "Non spécifié",
        };
    }
  };

  // ✅ Fonction pour obtenir l'image de l'avatar du vendeur
  const getVendeurAvatar = (): string => {
    if (vendeur?.avatar) {
      const url = getImageUrl(vendeur.avatar);
      if (url) return url;
    }
    return getPlaceholderImage(
      80, 
      `${vendeur?.prenoms?.charAt(0) || 'V'}${vendeur?.nom?.charAt(0) || 'D'}`,
      "ffffff",
      "28a745"
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid py-4">
      {/* Header principal */}
      <div className="mb-5">
        <div
          className="rounded-4 p-3 p-md-4 shadow-lg mb-4 hero-gradient"
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
                  <div className="position-relative me-2 me-md-3">
                    <img
                      src={getVendeurAvatar()}
                      alt={`${vendeur.prenoms} ${vendeur.nom}`}
                      className="rounded-circle border border-3 border-white shadow"
                      style={{
                        width: "clamp(50px, 8vw, 80px)",
                        height: "clamp(50px, 8vw, 80px)",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          getPlaceholderImage(80, "V", "ffffff", "28a745");
                      }}
                    />
                    <span
                      className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                      style={{ width: "clamp(12px, 2vw, 20px)", height: "clamp(12px, 2vw, 20px)" }}
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white"
                        style={{ fontSize: "clamp(6px, 1vw, 8px)" }}
                      />
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="h4 h3-sm h2-md fw-bold text-dark mb-1 text-truncate">
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard Vendeur
                  </h1>
                  <p className="text-dark mb-2 small small-md text-truncate" style={{ opacity: 0.9, maxWidth: "100%" }}>
                    {vendeur
                      ? `Bonjour ${vendeur.prenoms} ${vendeur.nom}, voici le résumé de votre activité`
                      : "Vue d'ensemble de votre activité"}
                  </p>
                  {vendeur?.email && (
                    <p className="text-white-50 small mb-0">
                      <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                      {vendeur.email}
                    </p>
                  )}
                  <div className="d-flex flex-wrap gap-1 gap-md-2 align-items-center mt-2">
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0 small">
                      <FontAwesomeIcon icon={faStore} className="me-1" />
                      {stats?.totalBoutiques || 0}
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0 small">
                      <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
                      {stats?.totalProduits || 0}
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0 small">
                      <FontAwesomeIcon icon={faGift} className="me-1" />
                      {stats?.totalDons || 0}
                    </span>
                    <span className="badge bg-white bg-opacity-20 text-dark fw-semibold border-0 small">
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                      {stats?.totalEchanges || 0}
                    </span>
                    <span className="badge bg-danger bg-opacity-20 text-dark fw-semibold border-0 small">
                      <FontAwesomeIcon icon={faHeart} className="me-1" />
                      {stats?.totalFavoris || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mt-2 mt-md-0">
              <div className="d-flex flex-column flex-md-row gap-2 justify-content-end align-items-start align-items-md-center">
                <div className="dropdown w-100 w-md-auto">
                  <button
                    className="btn btn-outline-light d-flex align-items-center gap-2 w-100 w-md-auto"
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
                  className="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto"
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
        <div className="row g-3 g-md-4 mb-4">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Boutiques"
              value={stats?.totalBoutiques || 0}
              icon={faStore}
              color="primary"
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Produits"
              value={stats?.totalProduits || 0}
              icon={faShoppingBag}
              color="success"
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Dons"
              value={stats?.totalDons || 0}
              icon={faGift}
              color="warning"
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Échanges"
              value={stats?.totalEchanges || 0}
              icon={faExchangeAlt}
              color="info"
            />
          </div>
        </div>

        <div className="row g-3 g-md-4 mb-4">
     

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Favoris"
              value={stats?.totalFavoris || 0}
              icon={faHeart}
              color="danger"
              subtitle={`${stats?.produitsFavoris || 0} produits, ${stats?.donsFavoris || 0} dons, ${stats?.echangesFavoris || 0} échanges`}
            />
          </div>

          <div className="col-xl-3 col-lg-4 col-md-6">
            <StatCard
              title="Prix moyen"
              value={formatPrix(stats?.panierMoyen || 0)}
              icon={faPercent}
              color="info"
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
                <p className="mb-0 small">{error}</p>
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
                <p className="mb-0 small">{successMessage}</p>
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
          <div className="card-body p-2 p-md-3">
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm btn-lg-md d-flex align-items-center gap-1 gap-md-2 ${activeSection === "produits" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => {
                  setActiveSection("produits");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                <span className="d-none d-sm-inline">Produits</span>
                <span className="badge bg-white text-success ms-1">
                  {stats?.totalProduits || 0}
                </span>
              </button>

              <button
                className={`btn btn-sm btn-lg-md d-flex align-items-center gap-1 gap-md-2 ${activeSection === "dons" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => {
                  setActiveSection("dons");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faGift} />
                <span className="d-none d-sm-inline">Dons</span>
                <span className="badge bg-white text-warning ms-1">
                  {stats?.totalDons || 0}
                </span>
              </button>

              <button
                className={`btn btn-sm btn-lg-md d-flex align-items-center gap-1 gap-md-2 ${activeSection === "echanges" ? "btn-info" : "btn-outline-info"}`}
                onClick={() => {
                  setActiveSection("echanges");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faExchangeAlt} />
                <span className="d-none d-sm-inline">Échanges</span>
                <span className="badge bg-white text-info ms-1">
                  {stats?.totalEchanges || 0}
                </span>
              </button>

              <button
                className={`btn btn-sm btn-lg-md d-flex align-items-center gap-1 gap-md-2 ${activeSection === "boutiques" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setActiveSection("boutiques");
                  setActiveTab("tous");
                  setSearchTerm("");
                }}
              >
                <FontAwesomeIcon icon={faStore} />
                <span className="d-none d-sm-inline">Boutiques</span>
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
            <div className="card-body p-2 p-md-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${activeTab === "tous" ? "btn-primary" : "btn-outline-primary"}`}
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
                  className={`btn btn-sm ${activeTab === "publies" ? "btn-success" : "btn-outline-success"}`}
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
                  className={`btn btn-sm ${activeTab === "bloques" ? "btn-danger" : "btn-outline-danger"}`}
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
          <div className="card-body p-3">
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
                      href="/dashboard-vendeur/produits/nouveau"
                      className="btn btn-success btn-sm d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span className="d-none d-sm-inline">Nouveau produit</span>
                    </Link>
                  )}

                  {activeSection === "dons" && (
                    <Link
                      href="/dashboard-vendeur/dons/nouveau"
                      className="btn btn-warning btn-sm d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span className="d-none d-sm-inline">Nouveau don</span>
                    </Link>
                  )}

                  {activeSection === "echanges" && (
                    <Link
                      href="/dashboard-vendeur/echanges/nouveau"
                      className="btn btn-info btn-sm d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span className="d-none d-sm-inline">Nouvel échange</span>
                    </Link>
                  )}

                  {activeSection === "boutiques" && (
                    <Link
                      href="/dashboard-vendeur/boutiques/nouveau"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span className="d-none d-sm-inline">Nouvelle boutique</span>
                    </Link>
                  )}

                  <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                    onClick={() => {
                      setSelectedItems([]);
                      setSearchTerm("");
                    }}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span className="d-none d-sm-inline">Réinitialiser</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des données ou grille des boutiques */}
        {activeSection === "boutiques" ? (
          <div className="row">
            {filteredData.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faStore} className="text-muted fs-1 mb-3" />
                  <h4 className="fw-bold mb-3">Aucune boutique trouvée</h4>
                  <p className="text-muted mb-4">
                    {searchTerm
                      ? "Aucune boutique ne correspond à votre recherche."
                      : "Commencez par créer votre première boutique !"}
                  </p>
                  <Link
                    href="/dashboard-vendeur/boutiques/nouveau"
                    className="btn btn-primary btn-lg"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer une boutique
                  </Link>
                </div>
              </div>
            ) : (
              filteredData.map((item: any) => (
                <BoutiqueCard key={item.uuid} boutique={item} />
              ))
            )}
          </div>
        ) : (
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
                  </div>
                  <h4 className="fw-bold mb-3">Aucun {activeSection} trouvé</h4>
                  <p className="text-muted mb-4">
                    {searchTerm
                      ? "Aucun résultat ne correspond à votre recherche."
                      : activeSection === "produits"
                        ? "Commencez par créer votre premier produit !"
                        : activeSection === "dons"
                          ? "Commencez par créer votre premier don !"
                          : "Commencez par créer votre premier échange !"}
                  </p>
                  <Link
                    href={`/dashboard-vendeur/${activeSection}/nouveau`}
                    className={`btn btn-${activeSection === "produits" ? "success" : activeSection === "dons" ? "warning" : "info"} btn-lg`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer un{" "}
                    {activeSection === "produits"
                      ? "produit"
                      : activeSection === "dons"
                        ? "don"
                        : "échange"}
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "40px" }} className="ps-3">
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
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Nom</th>
                        <th style={{ width: "100px" }}>Prix/Valeur</th>
                        <th style={{ width: "90px" }}>Statut</th>
                        <th style={{ width: "100px" }}>Catégorie</th>
                        <th style={{ width: "80px" }}>
                          <FontAwesomeIcon icon={faHeart} className="text-danger" />
                        </th>
                        <th style={{ width: "120px" }}>Date</th>
                        <th style={{ width: "120px" }} className="text-end pe-3">
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
                            <td className="ps-3">
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
                                style={{ width: "50px", height: "50px" }}
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
                                    const bgColor = 
                                      activeSection === "produits" ? "28a745" :
                                      activeSection === "dons" ? "8b5cf6" :
                                      activeSection === "echanges" ? "f59e0b" :
                                      "6c757d";
                                    (e.target as HTMLImageElement).src =
                                      getPlaceholderImage(50, "I", "ffffff", bgColor);
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="fw-semibold small text-dark">
                                  {displayData.libelle}
                                </span>
                                <small
                                  className="text-muted text-truncate"
                                  style={{ maxWidth: "180px" }}
                                >
                                  {displayData.description?.substring(0, 40) ||
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
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold text-success small">
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
                            <td>
                              {displayData.estBloque ? (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger small">
                                  <FontAwesomeIcon
                                    icon={faBan}
                                    className="me-1"
                                  />
                                  Bloqué
                                </span>
                              ) : displayData.estPublie ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success small">
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="me-1"
                                  />
                                  Publié
                                </span>
                              ) : (
                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning small">
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
                                        displayData.note_moyenne.toString(),
                                      ).toFixed(1)}
                                    </small>
                                  </div>
                                )}
                            </td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info border border-info small">
                                {displayData.categorie}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-danger bg-opacity-10 text-danger border-0">
                                <FontAwesomeIcon icon={faHeart} className="me-1" />
                                {displayData.nombre_favoris || 0}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatDate(displayData.date)}
                              </small>
                            </td>
                            <td className="text-end pe-3">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-outline-primary"
                                  title="Voir"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard-vendeur/${activeSection}/${displayData.uuid}`,
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
                                      `/dashboard-vendeur/${activeSection}/${displayData.uuid}/edit`,
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
              <div className="card-footer bg-white border-0 py-2 py-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 text-muted small">
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
        )}
      </div>

      <style jsx global>{`
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
          padding: 0.3em 0.6em;
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

        /* Classes de tailles personnalisées */
        .fs-7 {
          font-size: 0.8rem !important;
        }
        .fs-8 {
          font-size: 0.7rem !important;
        }
        .fs-9 {
          font-size: 0.6rem !important;
        }

        /* Media queries pour les tailles de police */
        @media (max-width: 768px) {
          .display-6 {
            font-size: 1.5rem;
          }
          .fs-1 {
            font-size: 1.3rem;
          }
          .fs-2 {
            font-size: 1.1rem;
          }
        }

        /* Animation pour les cartes */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}