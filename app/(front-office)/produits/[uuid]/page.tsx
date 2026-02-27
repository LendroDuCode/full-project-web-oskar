// app/(front-office)/produits/[uuid]/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";

// Import des icônes FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMessage,
  faUserCheck,
  faHeart,
  faHeadset,
  faUsers,
  faCommentDots,
  faShareAlt,
  faCertificate,
  faStar,
  faHeart as FaHeartSolid,
  faHeart as FaHeartRegular,
  faShoppingBag,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faImages,
  faChevronUp,
  faChevronDown,
  faCopy,
  faEye,
  faHome,
  faArrowLeft,
  faThLarge,
  faCheck,
  faCommentSlash,
  faTimes,
  faHistory,
  faShieldAlt,
  faEdit,
  faUserCircle,
  faIdCard,
  faExclamationCircle,
  faSpinner,
  faTag,
  faBoxOpen,
  faFileAlt,
  faListAlt,
  faShippingFast,
  faFlag,
  faThumbsUp,
  faRecycle,
  faQuestion,
  faMinus,
  faPlus,
  faMapLocationDot,
  faLocationDot,
  faStore,
  faCalendarAlt,
  faClock,
  faDollarSign,
  faGift,
  faExchangeAlt,
  faReply,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegularIcon } from "@fortawesome/free-regular-svg-icons";

// ============================================
// TYPES
// ============================================
interface CreateurInfo {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  avatar: string | null;
  facebook_url?: string | null;
  whatsapp_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  est_verifie?: boolean;
  est_bloque?: boolean;
  userType?: string;
  created_at?: string;
  nombre_annonces?: number;
  nombre_ventes?: number;
  taux_reponse?: number;
  temps_reponse?: string;
}

interface BoutiqueAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  type_boutique_uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  politique_retour: string | null;
  conditions_utilisation: string | null;
  logo_key: string | null;
  banniere_key: string | null;
  statut: string;
  created_at: string;
  updated_at: string;
  vendeurUuid: string;
  agentUuid: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
  vendeur?: CreateurInfo;
}

interface CategorieAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  type: string;
  libelle: string;
  description: string;
  slug: string;
  statut: string | null;
  image_key: string;
  image: string;
  path: string | null;
  depth: number | null;
  createdAt: string | null;
  updatedAt: string;
}

interface ProduitAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image_key: string | null;
  image_direct_url: string | null;
  disponible: boolean;
  publieLe: string | null;
  expireLe: string | null;
  nombreFavoris: number;
  statut: string;
  image: string | null;
  prix: string | number;
  description: string | null;
  etoile: number;
  vendeur_uuid: string;
  boutique_uuid: string;
  categorie_uuid: string;
  categorie?: CategorieAPI;
  boutique?: BoutiqueAPI;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  adminUuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  repartition_notes: any | null;
  demi_etoile: number;
  etoiles_pleines: number;
  etoiles_vides: number;
  utilisateur_uuid?: string | null;
  agentUuid?: string | null;
  createur?: CreateurInfo;
  createurType?: string;
  estUtilisateur?: boolean;
  estVendeur?: boolean;
}

interface ProduitSimilaireAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  type: string | null;
  image_key: string;
  image_direct_url: string | null;
  disponible: boolean;
  publieLe: string | null;
  expireLe: string | null;
  nombreFavoris: number;
  statut: string;
  image: string;
  prix: string | number;
  description: string | null;
  etoile: number;
  vendeur_uuid: string;
  boutique_uuid: string;
  categorie_uuid: string;
  estPublie: boolean;
  estBloque: boolean;
  is_favoris: boolean;
  adminUuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  repartition_notes: any | null;
  demi_etoile: number;
  etoiles_pleines: number;
  etoiles_vides: number;
  utilisateur_uuid?: string | null;
  agentUuid?: string | null;
  createur?: CreateurInfo;
  createurType?: string;
  categorie?: CategorieAPI;
}

interface APIResponse {
  produit: ProduitAPI;
  similaires: ProduitSimilaireAPI[];
}

interface Produit {
  uuid: string;
  nom: string;
  libelle: string;
  slug: string;
  image: string;
  image_key?: string | null;
  disponible: boolean;
  statut: string;
  prix: number;
  description: string | null;
  etoile: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  quantite: number;
  vendeur_uuid: string;
  boutique_uuid: string;
  createdAt: string;
  updatedAt: string;
  categorie?: {
    uuid: string;
    libelle: string;
    description: string;
  };
  createur?: CreateurInfo;
  createurType?: string;
  boutique?: Boutique;
}

interface ProduitSimilaire {
  uuid: string;
  nom: string;
  libelle: string;
  prix: number;
  image: string;
  statut: string;
  note_moyenne: number;
  disponible: boolean;
  quantite: number;
  createur?: CreateurInfo;
  createurType?: string;
  vendeur_uuid: string;
  boutique_uuid: string;
  categorie?: {
    libelle: string;
  };
  nombre_favoris: number;
  nombre_avis: number;
}

interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  statut: string;
  slug: string;
  logo: string | null;
  banniere: string | null;
  logo_key?: string | null;
  banniere_key?: string | null;
  est_bloque: boolean;
  est_ferme: boolean;
  created_at: string;
  updated_at: string;
  vendeur?: CreateurInfo;
  type_boutique_uuid?: string;
  politique_retour?: string | null;
  conditions_utilisation?: string | null;
}

// Interface pour le commentaire API
interface CommentaireAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  contenu: string;
  note: number;
  est_actif: boolean;
  est_signeale: boolean;
  raison_signalement: string | null;
  produitUuid: string | null;
  donUuid: string | null;
  echangeUuid: string | null;
  utilisateurUuid: string;
  auteur?: {
    type: string;
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string | null;
    email: string;
  };
  utilisateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string | null;
  };
  entite?: {
    type: string;
    uuid: string;
    libelle: string;
    description: string;
  };
  nombre_reponses?: number;
  createdAt: string;
  updatedAt: string;
}

interface CommentairesResponse {
  commentaires: CommentaireAPI[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    nombreCommentaires: number;
    nombreNotes: number;
    noteMoyenne: number;
    distributionNotes: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

interface Commentaire {
  uuid: string;
  utilisateur_nom: string;
  utilisateur_prenoms?: string;
  utilisateur_photo: string | null;
  note: number;
  commentaire: string;
  date: string;
  createdAt?: string;
  likes: number;
  is_helpful: boolean;
}

interface NoteStats {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  total: number;
  moyenne: number;
}

// ============================================
// COMPOSANT D'IMAGE SÉCURISÉ
// ============================================
const SecureImage = ({
  src,
  alt,
  fallbackSrc,
  className = "",
  style = {},
  onClick,
  onError = null,
}: {
  src: string | null;
  alt: string;
  fallbackSrc: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onError?:
    | ((event: React.SyntheticEvent<HTMLImageElement, Event>) => void)
    | null;
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (src && src !== "null" && src !== "undefined" && src.trim() !== "") {
      return src;
    }
    return fallbackSrc;
  });

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (src && src !== "null" && src !== "undefined" && src.trim() !== "") {
      setCurrentSrc(src);
      setLoading(true);
      setHasError(false);
      setRetryCount(0);
    } else {
      setCurrentSrc(fallbackSrc);
      setLoading(false);
    }
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc === fallbackSrc || currentSrc.includes("default")) {
      return;
    }

    if (!hasError) {
      setHasError(true);

      if (src && src.includes("15.236.142.141:9000/oskar-bucket/")) {
        try {
          const key = src.replace(
            "http://15.236.142.141:9000/oskar-bucket/",
            "",
          );
          const encodedKey = encodeURIComponent(key);
          const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
          setCurrentSrc(proxyUrl);
          return;
        } catch (err) {
          console.debug("Erreur conversion proxy:", err);
        }
      }

      if (retryCount >= 2) {
        setCurrentSrc(fallbackSrc);
      } else {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          setCurrentSrc(src || fallbackSrc);
          setHasError(false);
        }, 1000);
      }
    }

    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setHasError(false);
    setRetryCount(0);
  };

  return (
    <div
      className="position-relative w-100 h-100"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {loading && !hasError && currentSrc !== fallbackSrc && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        className={`${className} ${loading && !hasError && currentSrc !== fallbackSrc ? "opacity-0" : "opacity-100"}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        style={{
          transition: "opacity 0.3s ease",
          ...style,
        }}
      />
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function ProduitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [produit, setProduit] = useState<Produit | null>(null);
  const [createur, setCreateur] = useState<CreateurInfo | null>(null);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [produitsSimilaires, setProduitsSimilaires] = useState<
    ProduitSimilaire[]
  >([]);
  const [produitsRecents, setProduitsRecents] = useState<ProduitSimilaire[]>(
    [],
  );
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [commentairesStats, setCommentairesStats] = useState({
    nombreCommentaires: 0,
    nombreNotes: 0,
    noteMoyenne: 0,
    distributionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [images, setImages] = useState<string[]>([]);
  const [imagePrincipale, setImagePrincipale] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingRecents, setLoadingRecents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [favori, setFavori] = useState(false);
  const [showMoreComments, setShowMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentairesFetched, setCommentairesFetched] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    note: 5,
    commentaire: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [contactVisible, setContactVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [favoriInitialized, setFavoriInitialized] = useState(false);

  // ✅ Ref pour suivre si le chargement a déjà été effectué
  const initialLoadDone = useRef(false);

  // Timer pour le toast
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // FAQ
  const faqs = [
    {
      question: "Comment contacter le vendeur ?",
      answer:
        "Vous pouvez contacter le vendeur en utilisant les boutons Appeler, WhatsApp ou Envoyer un message sur cette page. Assurez-vous de vous présenter et de poser toutes vos questions sur l'article avant d'organiser une rencontre.",
    },
    {
      question: "Le prix est-il négociable ?",
      answer:
        "Le prix affiché peut être négociable. N'hésitez pas à contacter le vendeur pour discuter du prix.",
    },
    {
      question: "Comment puis-je vérifier l'authenticité de l'article ?",
      answer:
        "Lors de la rencontre, examinez attentivement l'article, vérifiez les numéros de série si disponibles, et demandez tous les documents d'authenticité.",
    },
    {
      question: "Quels modes de paiement sont acceptés ?",
      answer:
        "Les modes de paiement sont à convenir entre l'acheteur et le vendeur. Privilégiez les paiements en espèces lors de la rencontre.",
    },
    {
      question: "Puis-je retourner l'article si je ne suis pas satisfait ?",
      answer:
        "Les retours dépendent de l'accord entre l'acheteur et le vendeur. Discutez-en avant la transaction.",
    },
  ];

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const getDefaultAvatarUrl = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-avatar.png`;
  };

  const getDefaultProductImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-product.png`;
  };

  const normalizeImageUrl = (
    url: string | null,
    key: string | null = null,
  ): string => {
    if (!url || url === "null" || url === "undefined" || url.trim() === "") {
      return getDefaultProductImage();
    }

    const cleanUrl = url.trim();

    // Si l'URL utilise déjà le proxy /api/files/
    if (cleanUrl.includes("/api/files/")) {
      if (cleanUrl.startsWith("http")) {
        return cleanUrl;
      }
      // Si c'est un chemin relatif vers /api/files/, ajouter la base
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
    }

    // Gestion des URLs MinIO
    if (cleanUrl.includes("15.236.142.141:9000/oskar-bucket/")) {
      try {
        const key = cleanUrl.replace(
          "http://15.236.142.141:9000/oskar-bucket/",
          "",
        );
        const encodedKey = encodeURIComponent(key);
        return `http://localhost:3005/api/files/${encodedKey}`;
      } catch (err) {
        console.debug("Erreur conversion MinIO:", err);
        return getDefaultProductImage();
      }
    }

    // URLs HTTP/HTTPS normales
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }

    // Chemins relatifs
    if (cleanUrl.startsWith("/")) {
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
    }

    return getDefaultProductImage();
  };

  const safeToFixed = (
    value: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(decimals);
  };

  const getSafeNoteMoyenne = (produit: Produit | null): number => {
    if (!produit) return 0;
    if (
      produit.note_moyenne === null ||
      produit.note_moyenne === undefined ||
      isNaN(produit.note_moyenne)
    ) {
      return 0;
    }
    return produit.note_moyenne;
  };

  const formatMemberSince = (dateString: string | undefined) => {
    if (!dateString) return "mars 2023";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "mars 2023";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date inconnue";
      }

      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const timeStr = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (diffDays === 0) {
        return `Aujourd'hui à ${timeStr}`;
      } else if (diffDays === 1) {
        return `Hier à ${timeStr}`;
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
      } else {
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch {
      return "Date inconnue";
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "actif":
      case "active":
        return { text: "Active", color: "success" };
      case "en_review":
        return { text: "En révision", color: "warning" };
      case "ferme":
      case "fermée":
        return { text: "Fermée", color: "danger" };
      case "bloque":
      case "bloquée":
        return { text: "Bloquée", color: "danger" };
      default:
        return { text: statut || "En attente", color: "secondary" };
    }
  };

  const getTypeIcon = (type: string | undefined) => {
    switch (type) {
      case "produit":
      case "vente":
        return faTag;
      case "don":
      case "donation":
        return faGift;
      case "echange":
      case "exchange":
        return faExchangeAlt;
      default:
        return faTag;
    }
  };

  const getConditionBadge = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "neuf":
        return {
          text: "Neuf",
          color: "success",
          bgColor: "bg-success",
          icon: faCertificate,
        };
      case "bon_etat":
        return {
          text: "Bon état",
          color: "warning",
          bgColor: "bg-warning",
          icon: faThumbsUp,
        };
      case "occasion":
        return {
          text: "Occasion",
          color: "info",
          bgColor: "bg-info",
          icon: faRecycle,
        };
      case "publie":
        return {
          text: "Publié",
          color: "primary",
          bgColor: "bg-primary",
          icon: faCheck,
        };
      default:
        return {
          text: "À vérifier",
          color: "secondary",
          bgColor: "bg-secondary",
          icon: faQuestion,
        };
    }
  };

  // ============================================
  // FONCTIONS DE TRANSFORMATION
  // ============================================
  const transformCreateurInfo = (apiCreateur: any): CreateurInfo => {
    return {
      uuid: apiCreateur.uuid || "",
      nom: apiCreateur.nom || "",
      prenoms: apiCreateur.prenoms || "",
      email: apiCreateur.email || "",
      telephone: apiCreateur.telephone || "",
      avatar: apiCreateur.avatar ? normalizeImageUrl(apiCreateur.avatar) : null,
      facebook_url: apiCreateur.facebook_url || null,
      whatsapp_url: apiCreateur.whatsapp_url || null,
      twitter_url: apiCreateur.twitter_url || null,
      instagram_url: apiCreateur.instagram_url || null,
      est_verifie: apiCreateur.est_verifie || false,
      est_bloque: apiCreateur.est_bloque || false,
      userType: apiCreateur.userType || apiCreateur.type || "utilisateur",
      created_at: apiCreateur.created_at || apiCreateur.createdAt,
      nombre_annonces: apiCreateur.nombre_annonces || 0,
      nombre_ventes: apiCreateur.nombre_ventes || 0,
      taux_reponse: apiCreateur.taux_reponse || 98,
      temps_reponse: apiCreateur.temps_reponse || "Moins de 2 heures",
    };
  };

  const transformProduitData = (apiProduit: ProduitAPI): Produit => {
    const safeNoteMoyenne =
      apiProduit.note_moyenne !== null && !isNaN(apiProduit.note_moyenne)
        ? apiProduit.note_moyenne
        : 0;

    return {
      uuid: apiProduit.uuid,
      nom: apiProduit.libelle,
      libelle: apiProduit.libelle,
      slug: apiProduit.slug,
      image: normalizeImageUrl(apiProduit.image, apiProduit.image_key),
      image_key: apiProduit.image_key,
      disponible: apiProduit.disponible,
      statut: apiProduit.statut,
      prix:
        typeof apiProduit.prix === "string"
          ? parseFloat(apiProduit.prix) || 0
          : apiProduit.prix || 0,
      description: apiProduit.description,
      etoile: apiProduit.etoile || 0,
      note_moyenne: safeNoteMoyenne,
      nombre_avis: apiProduit.nombre_avis || 0,
      nombre_favoris: apiProduit.nombreFavoris || 0,
      quantite: apiProduit.quantite || 0,
      vendeur_uuid: apiProduit.vendeur_uuid,
      boutique_uuid: apiProduit.boutique_uuid,
      createdAt: apiProduit.createdAt || new Date().toISOString(),
      updatedAt: apiProduit.updatedAt || new Date().toISOString(),
      ...(apiProduit.categorie && {
        categorie: {
          uuid: apiProduit.categorie.uuid,
          libelle: apiProduit.categorie.libelle,
          description: apiProduit.categorie.description,
        },
      }),
      ...(apiProduit.createur && {
        createur: transformCreateurInfo(apiProduit.createur),
      }),
      createurType: apiProduit.createurType,
      ...(apiProduit.boutique && {
        boutique: transformBoutiqueData(apiProduit.boutique),
      }),
    };
  };

  const transformProduitSimilaireData = (
    apiSimilaire: ProduitSimilaireAPI,
  ): ProduitSimilaire => {
    return {
      uuid: apiSimilaire.uuid,
      nom: apiSimilaire.libelle,
      libelle: apiSimilaire.libelle,
      prix:
        typeof apiSimilaire.prix === "string"
          ? parseFloat(apiSimilaire.prix) || 0
          : apiSimilaire.prix || 0,
      image: normalizeImageUrl(apiSimilaire.image, apiSimilaire.image_key),
      statut: apiSimilaire.statut,
      note_moyenne: apiSimilaire.note_moyenne || 0,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite || 0,
      vendeur_uuid: apiSimilaire.vendeur_uuid,
      boutique_uuid: apiSimilaire.boutique_uuid,
      nombre_favoris: apiSimilaire.nombreFavoris || 0,
      nombre_avis: apiSimilaire.nombre_avis || 0,
      ...(apiSimilaire.createur && {
        createur: transformCreateurInfo(apiSimilaire.createur),
      }),
      createurType: apiSimilaire.createurType,
      ...(apiSimilaire.categorie && {
        categorie: {
          libelle: apiSimilaire.categorie.libelle,
        },
      }),
    };
  };

  const transformBoutiqueData = (apiBoutique: BoutiqueAPI): Boutique => {
    const logoUrl = normalizeImageUrl(apiBoutique.logo, apiBoutique.logo_key);
    const banniereUrl = normalizeImageUrl(
      apiBoutique.banniere,
      apiBoutique.banniere_key,
    );

    const vendeurBoutique = apiBoutique.vendeur
      ? transformCreateurInfo(apiBoutique.vendeur)
      : undefined;

    return {
      uuid: apiBoutique.uuid,
      nom: apiBoutique.nom,
      description: apiBoutique.description,
      statut: apiBoutique.statut,
      slug: apiBoutique.slug,
      logo: logoUrl,
      banniere: banniereUrl,
      logo_key: apiBoutique.logo_key,
      banniere_key: apiBoutique.banniere_key,
      est_bloque: apiBoutique.est_bloque || false,
      est_ferme: apiBoutique.est_ferme || false,
      created_at: apiBoutique.created_at,
      updated_at: apiBoutique.updated_at,
      type_boutique_uuid: apiBoutique.type_boutique_uuid,
      politique_retour: apiBoutique.politique_retour,
      conditions_utilisation: apiBoutique.conditions_utilisation,
      vendeur: vendeurBoutique,
    };
  };

  const transformCommentaireData = (
    apiCommentaire: CommentaireAPI,
  ): Commentaire => {
    const auteur = apiCommentaire.auteur || apiCommentaire.utilisateur || null;

    let nomComplet = "Utilisateur";
    let prenom = "";
    let nom = "";

    if (auteur) {
      prenom = auteur.prenoms || "";
      nom = auteur.nom || "";
      nomComplet = `${prenom} ${nom}`.trim() || "Utilisateur";
    }

    let avatarUrl = null;
    if (auteur?.avatar) {
      avatarUrl = normalizeImageUrl(auteur.avatar);
    }

    return {
      uuid: apiCommentaire.uuid,
      utilisateur_nom: nomComplet,
      utilisateur_prenoms: prenom,
      utilisateur_photo: avatarUrl,
      note: apiCommentaire.note || 0,
      commentaire: apiCommentaire.contenu,
      date: apiCommentaire.createdAt,
      createdAt: apiCommentaire.createdAt,
      likes: 0,
      is_helpful: false,
    };
  };

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
  const fetchProduitsRecents = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoadingRecents(true);

      const endpoints = [
        API_ENDPOINTS.PRODUCTS.PUBLISHED,
        API_ENDPOINTS.DONS.PUBLISHED,
        API_ENDPOINTS.ECHANGES.PUBLISHED,
      ];

      const randomEndpoint =
        endpoints[Math.floor(Math.random() * endpoints.length)];

      const response = await api.get<any[]>(randomEndpoint);

      if (response && Array.isArray(response)) {
        const filtered = response.filter((item) => item.uuid !== uuid);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        const transformed = selected.map((item: any) => ({
          uuid:
            item.uuid || `recent-${Math.random().toString(36).substr(2, 9)}`,
          nom: item.libelle || item.nom || item.titre || "Produit récent",
          libelle: item.libelle || item.nom || item.titre || "Produit récent",
          prix: item.prix || 0,
          image: normalizeImageUrl(item.image, item.image_key),
          note_moyenne: item.note_moyenne || 0,
          disponible: item.disponible || true,
          vendeur_uuid: item.vendeur_uuid || "",
          boutique_uuid: item.boutique_uuid || "",
          createur: item.createur
            ? transformCreateurInfo(item.createur)
            : undefined,
          createurType: item.createurType || "utilisateur",
          statut: item.statut || "disponible",
          quantite: item.quantite || 1,
          nombre_favoris: item.nombreFavoris || 0,
          nombre_avis: item.nombre_avis || 0,
        }));

        setProduitsRecents(transformed);
      }
    } catch (err) {
      console.warn("Erreur chargement produits récents:", err);
      setProduitsRecents([]);
    } finally {
      setLoadingRecents(false);
    }
  }, [uuid]);

  const fetchCommentaires = useCallback(async (produitUuid: string) => {
    if (!produitUuid || commentairesFetched) return;

    try {
      setLoadingComments(true);

      const response = await api.get<CommentairesResponse>(
        API_ENDPOINTS.COMMENTAIRES.BY_PRODUIT(produitUuid),
      );

      if (response && response.commentaires) {
        const commentairesData = response.commentaires.map(
          transformCommentaireData,
        );

        commentairesData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setCommentaires(commentairesData);

        if (response.stats) {
          setCommentairesStats({
            nombreCommentaires: response.stats.nombreCommentaires || 0,
            nombreNotes: response.stats.nombreNotes || 0,
            noteMoyenne: response.stats.noteMoyenne || 0,
            distributionNotes: response.stats.distributionNotes || {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            },
          });
        } else {
          const totalNotes = commentairesData.reduce(
            (sum, c) => sum + c.note,
            0,
          );
          const moyenne =
            commentairesData.length > 0
              ? totalNotes / commentairesData.length
              : 0;

          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          commentairesData.forEach((c) => {
            const note = Math.round(c.note);
            if (note >= 1 && note <= 5) {
              distribution[note as keyof typeof distribution]++;
            }
          });

          setCommentairesStats({
            nombreCommentaires: commentairesData.length,
            nombreNotes: commentairesData.length,
            noteMoyenne: moyenne,
            distributionNotes: distribution,
          });
        }

        setCommentairesFetched(true);
      } else {
        setCommentaires([]);
        setCommentairesFetched(true);
      }
    } catch (err: any) {
      console.warn("⚠️ Erreur chargement commentaires:", err);
      setCommentairesStats({
        nombreCommentaires: 0,
        nombreNotes: 0,
        noteMoyenne: 0,
        distributionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      setCommentaires([]);
      setCommentairesFetched(true);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const fetchProduitDetails = useCallback(async () => {
    if (!uuid) return;

    // ✅ Éviter les chargements multiples
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    try {
      setLoading(true);
      setError(null);
      setFavoriInitialized(false);

      console.log("📦 Chargement du produit:", uuid);
      const response = await api.get<APIResponse>(
        API_ENDPOINTS.PRODUCTS.DETAIL_ALEATOIRE(uuid),
      );

      if (!response || !response.produit) {
        throw new Error("Produit non trouvé");
      }

      const produitData = transformProduitData(response.produit);
      const similairesData = response.similaires.map(
        transformProduitSimilaireData,
      );

      setProduit(produitData);
      setProduitsSimilaires(similairesData);

      // ✅ Initialisation correcte des favoris
      if (isLoggedIn) {
        console.log("🔴 Produit is_favoris:", response.produit.is_favoris);
        setFavori(response.produit.is_favoris === true);
      } else {
        setFavori(false);
      }
      setFavoriInitialized(true);

      // Récupération du créateur
      if (response.produit.createur) {
        const createurData = transformCreateurInfo(response.produit.createur);
        createurData.userType = response.produit.createurType || "utilisateur";
        setCreateur(createurData);
      } else if (response.produit.boutique?.vendeur) {
        const createurData = transformCreateurInfo(
          response.produit.boutique.vendeur,
        );
        createurData.userType = "vendeur";
        setCreateur(createurData);
      }

      // Récupération de la boutique
      if (response.produit.boutique) {
        const boutiqueData = transformBoutiqueData(response.produit.boutique);
        setBoutique(boutiqueData);
      }

      // Construction des images
      const imageUrls: string[] = [produitData.image];

      response.similaires.slice(0, 4).forEach((similaire) => {
        const imgUrl = normalizeImageUrl(similaire.image, similaire.image_key);
        if (imgUrl && !imageUrls.includes(imgUrl)) {
          imageUrls.push(imgUrl);
        }
      });

      while (imageUrls.length < 5) {
        imageUrls.push(getDefaultProductImage());
      }

      setImages(imageUrls.slice(0, 5));
      setImagePrincipale(imageUrls[0]);

      // Chargement des commentaires et produits récents
      fetchCommentaires(produitData.uuid);
      fetchProduitsRecents();
    } catch (err: any) {
      console.error("Erreur détail produit:", err);
      initialLoadDone.current = false; // Réinitialiser en cas d'erreur

      if (
        err.response?.status === 404 ||
        err.message.includes("Produit non trouvé")
      ) {
        setError("Ce produit n'existe pas ou a été supprimé.");
      } else if (err.response?.status === 401) {
        setError("Vous devez être connecté pour voir ce produit.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation de voir ce produit.");
      } else {
        setError(
          "Impossible de charger les détails du produit. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [uuid, isLoggedIn, fetchCommentaires, fetchProduitsRecents]);

  // ✅ useEffect simplifié avec une seule dépendance
  useEffect(() => {
    if (uuid && !initialLoadDone.current) {
      fetchProduitDetails();
    }
  }, [uuid, fetchProduitDetails]);

  // ============================================
  // FONCTIONS D'AFFICHAGE
  // ============================================
  const formatPrice = (price: number) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0 FCFA";
    }
    return price.toLocaleString("fr-FR") + " FCFA";
  };

  const renderStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
      rating = 0;
    }

    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-${i <= roundedRating ? "warning" : "secondary"}`}
        >
          <FontAwesomeIcon icon={faStar} />
        </span>,
      );
    }
    return <>{stars}</>;
  };

  const renderRatingStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
      rating = 0;
    }

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${i <= rating ? "text-warning" : "text-muted"}`}
          style={{ fontSize: "0.9rem" }}
        >
          <FontAwesomeIcon icon={faStar} />
        </span>,
      );
    }
    return <>{stars}</>;
  };

  const calculateNoteStats = (): NoteStats => {
    const stats: NoteStats = {
      1: commentairesStats.distributionNotes[1] || 0,
      2: commentairesStats.distributionNotes[2] || 0,
      3: commentairesStats.distributionNotes[3] || 0,
      4: commentairesStats.distributionNotes[4] || 0,
      5: commentairesStats.distributionNotes[5] || 0,
      total: commentairesStats.nombreCommentaires || 0,
      moyenne: commentairesStats.noteMoyenne || 0,
    };

    if (stats.total === 0 && commentaires.length > 0) {
      stats.total = commentaires.length;
      let totalNotes = 0;

      commentaires.forEach((comment) => {
        const note = comment.note || 0;
        if (note >= 4.5) stats[5]++;
        else if (note >= 3.5) stats[4]++;
        else if (note >= 2.5) stats[3]++;
        else if (note >= 1.5) stats[2]++;
        else stats[1]++;

        totalNotes += note;
      });

      stats.moyenne = totalNotes / commentaires.length;
    }

    if (isNaN(stats.moyenne)) {
      stats.moyenne = 0;
    }

    return stats;
  };

  const noteStats = calculateNoteStats();

  // ============================================
  // FONCTIONS D'ACTIONS
  // ============================================
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  };

  const handleContactWhatsApp = () => {
    if (!createur) return;

    let phoneNumber = createur.telephone || createur.whatsapp_url || "";
    phoneNumber = phoneNumber.replace(/\D/g, "");

    if (phoneNumber.startsWith("225")) {
      phoneNumber = phoneNumber.substring(3);
    }

    if (phoneNumber && !phoneNumber.startsWith("+")) {
      phoneNumber = `+225${phoneNumber}`;
    }

    const message = `Bonjour ${createur.prenoms}, je suis intéressé(e) par votre produit "${produit?.libelle}" sur OSKAR. Pourrions-nous discuter ?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleContactFacebook = () => {
    if (!createur) return;

    if (createur.facebook_url) {
      window.open(createur.facebook_url, "_blank", "noopener,noreferrer");
    } else {
      const searchQuery = encodeURIComponent(
        `${createur.prenoms} ${createur.nom} OSKAR`,
      );
      window.open(
        `https://www.facebook.com/search/top?q=${searchQuery}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  const handleCopyContactInfo = () => {
    if (!createur) return;

    const contactInfo =
      `Créateur du produit: ${createur.prenoms} ${createur.nom}\n` +
      `Téléphone: ${createur.telephone || "Non disponible"}\n` +
      `Email: ${createur.email || "Non disponible"}`;

    navigator.clipboard
      .writeText(contactInfo)
      .then(() => {
        showToast("success", "Informations de contact copiées !");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
        showToast("error", "Impossible de copier les informations.");
      });
  };

  const handleContactVendeur = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!createur) {
      showToast("error", "Informations du vendeur non disponibles");
      return;
    }

    const userType = user?.type || "utilisateur";

    let dashboardPath = "";
    switch (userType) {
      case "admin":
        dashboardPath = "/dashboard-admin";
        break;
      case "agent":
        dashboardPath = "/dashboard-agent";
        break;
      case "vendeur":
        dashboardPath = "/dashboard-vendeur";
        break;
      case "utilisateur":
        dashboardPath = "/dashboard-utilisateur";
        break;
      default:
        dashboardPath = "/dashboard-utilisateur";
    }

    const params = new URLSearchParams({
      destinataireUuid: createur.uuid,
      destinataireEmail: createur.email || "",
      destinataireNom: `${createur.prenoms} ${createur.nom}`,
      sujet: `Question concernant votre produit: ${produit?.libelle}`,
      produitUuid: produit?.uuid || "",
    });

    router.push(`${dashboardPath}/messages?${params.toString()}`);
  };

  const handleAddToFavorites = async () => {
    if (!produit) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      console.log(`🔄 ${favori ? "Retrait" : "Ajout"} aux favoris...`);

      if (favori) {
        const endpoint = API_ENDPOINTS.FAVORIS.REMOVE_PRODUIT(produit.uuid);
        console.log(`📤 Appel API: DELETE ${endpoint}`);

        await api.delete(endpoint);
        setFavori(false);
        showToast("success", "Produit retiré des favoris");
      } else {
        const payload = {
          itemUuid: produit.uuid,
          type: "produit",
        };
        console.log(`📤 Appel API: POST ${API_ENDPOINTS.FAVORIS.ADD}`, payload);

        const response = await api.post(API_ENDPOINTS.FAVORIS.ADD, payload);
        console.log("✅ Réponse favoris:", response);

        setFavori(true);
        showToast("success", "Produit ajouté aux favoris");
      }
    } catch (err: any) {
      console.error("❌ Erreur détaillée mise à jour favoris:", err);

      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

      if (err.response?.status === 401) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        openLoginModal();
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showToast("error", errorMessage);
    }
  };

  const handleShare = (platform: string) => {
    if (!produit) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez ce produit sur OSKAR : ${produit.libelle} - ${formatPrice(produit.prix)}`;

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }

    setShowShareMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        showToast("success", "Lien copié dans le presse-papier !");
        setShowShareMenu(false);
      })
      .catch((err) => {
        console.error("Erreur copie lien:", err);
        showToast("error", "Impossible de copier le lien.");
      });
  };

  const handleLikeComment = async (commentUuid: string) => {
    try {
      await api.post(`/commentaires/${commentUuid}/like`, {});
      setCommentaires((prev) =>
        prev.map((comment) =>
          comment.uuid === commentUuid
            ? { ...comment, likes: comment.likes + 1 }
            : comment,
        ),
      );
      showToast("success", "Merci pour votre retour !");
    } catch (err) {
      console.error("Erreur lors du like:", err);
      showToast("error", "Impossible d'aimer le commentaire");
    }
  };

  const handleReportComment = async (commentUuid: string) => {
    if (window.confirm("Signaler ce commentaire comme inapproprié ?")) {
      try {
        await api.post(API_ENDPOINTS.COMMENTAIRES.REPORT(commentUuid), {});
        showToast(
          "success",
          "Commentaire signalé. Notre équipe le vérifiera sous 24h.",
        );
      } catch (err) {
        console.error("Erreur signalement:", err);
        showToast("error", "Une erreur est survenue lors du signalement.");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!produit) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!newReview.commentaire.trim()) {
      showToast("error", "Veuillez saisir un commentaire.");
      return;
    }

    setSubmittingReview(true);

    try {
      await api.post<{ commentaire: CommentaireAPI }>(
        API_ENDPOINTS.COMMENTAIRES.CREATE,
        {
          contenu: newReview.commentaire,
          produitUuid: produit.uuid,
          note: newReview.note,
        },
      );

      setCommentairesFetched(false);
      await fetchCommentaires(produit.uuid);

      setNewReview({
        note: 5,
        commentaire: "",
      });
      setShowAddReview(false);

      showToast("success", "Votre avis a été ajouté avec succès !");
    } catch (err: any) {
      console.error("Erreur ajout avis:", err);
      if (err.response?.status === 401) {
        showToast(
          "error",
          "Votre session a expiré. Veuillez vous reconnecter.",
        );
        openLoginModal();
      } else {
        showToast("error", "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVisitBoutique = () => {
    if (boutique) {
      router.push(`/boutiques/${boutique.uuid}`);
    }
  };

  const handleVisitUtilisateur = () => {
    if (createur) {
      router.push(`/utilisateurs/${createur.uuid}`);
    }
  };

  // ============================================
  // RENDU
  // ============================================
  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="placeholder-glow">
                <div
                  className="placeholder col-12 rounded bg-secondary"
                  style={{ height: "600px" }}
                ></div>
                <div className="row mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="col-2">
                      <div
                        className="placeholder rounded bg-secondary"
                        style={{ height: "100px" }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body py-5">
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="fa-4x text-muted"
                    />
                  </div>
                  <h1 className="h3 mb-3">Produit introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Ce produit n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link
                      href="/produits"
                      className="btn btn-outline-primary rounded-pill px-4"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Retour aux produits
                    </Link>
                    <Link
                      href="/"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      <FontAwesomeIcon icon={faHome} className="me-2" />
                      Retour à l'accueil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const condition = getConditionBadge(produit.statut);
  const visibleComments = showMoreComments
    ? commentaires
    : commentaires.slice(0, 3);

  const boutiqueStatut = boutique ? getStatutBadge(boutique.statut) : null;

  const produitsAShow =
    produitsSimilaires.length > 0
      ? produitsSimilaires.slice(0, 4)
      : produitsRecents.slice(0, 4);

  return (
    <div className="bg-light min-vh-100">
      {/* Toast notifications */}
      {toast?.show && (
        <div
          className="position-fixed top-0 end-0 m-4 p-3 text-white rounded-3 shadow-lg"
          style={{
            zIndex: 9999,
            backgroundColor:
              toast.type === "success"
                ? "#10b981"
                : toast.type === "error"
                  ? "#ef4444"
                  : "#3b82f6",
            minWidth: "300px",
            animation: "slideIn 0.3s ease",
          }}
        >
          <div className="d-flex align-items-center">
            <i
              className={`fas fa-${toast.type === "success" ? "check-circle" : toast.type === "error" ? "exclamation-circle" : "info-circle"} me-3 fs-4`}
            ></i>
            <span className="flex-grow-1">{toast.message}</span>
            <button
              className="btn-close btn-close-white"
              onClick={() => setToast(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <section className="bg-white border-bottom py-3">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted">
                  <FontAwesomeIcon icon={faHome} className="me-1" />
                  Accueil
                </Link>
              </li>
              {produit.categorie && (
                <>
                  <li className="breadcrumb-item">
                    <Link
                      href={`/categories/${produit.categorie.libelle.toLowerCase().replace(/ /g, "-")}`}
                      className="text-decoration-none text-muted"
                    >
                      {produit.categorie.libelle}
                    </Link>
                  </li>
                </>
              )}
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {produit.libelle}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-5">
        <div className="row g-4">
          {/* Colonne gauche - Galerie et description (8/12) */}
          <div className="col-lg-8">
            {/* Galerie principale */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
              <div className="position-relative" style={{ height: "600px" }}>
                <SecureImage
                  src={imagePrincipale}
                  alt={produit.libelle}
                  fallbackSrc={getDefaultProductImage()}
                  className="w-100 h-100 object-cover"
                />

                {/* 🔴 BOUTON FAVORI - UNIQUEMENT SI CONNECTÉ */}
                {isLoggedIn && favoriInitialized && (
                  <button
                    onClick={handleAddToFavorites}
                    className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-3 shadow-lg hover-bg-warning hover-text-white transition-all"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <FontAwesomeIcon
                      icon={favori ? FaHeartSolid : faHeartRegularIcon}
                      className={favori ? "text-danger" : ""}
                    />
                  </button>
                )}

                <div className="position-absolute top-0 start-0 m-3 bg-success text-white px-4 py-2 rounded-pill fw-semibold d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={getTypeIcon(produit.createurType)} />
                  <span>
                    {produit.createurType === "vendeur" ? "Vente" : "Vente"}
                  </span>
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const newIndex =
                          (selectedThumbnail - 1 + images.length) %
                          images.length;
                        setSelectedThumbnail(newIndex);
                        setImagePrincipale(images[newIndex]);
                      }}
                      className="position-absolute start-0 top-50 translate-middle-y ms-3 btn btn-light bg-opacity-90 rounded-circle p-3 shadow-lg hover-bg-warning hover-text-white transition-all"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={() => {
                        const newIndex =
                          (selectedThumbnail + 1) % images.length;
                        setSelectedThumbnail(newIndex);
                        setImagePrincipale(images[newIndex]);
                      }}
                      className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-light bg-opacity-90 rounded-circle p-3 shadow-lg hover-bg-warning hover-text-white transition-all"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="row g-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="col">
                    <div
                      onClick={() => {
                        setSelectedThumbnail(index);
                        setImagePrincipale(img);
                      }}
                      className={`rounded-lg overflow-hidden border-2 cursor-pointer h-24 transition-all ${
                        selectedThumbnail === index
                          ? "border-warning"
                          : "border-secondary hover-border-warning"
                      }`}
                      style={{ height: "96px" }}
                    >
                      <SecureImage
                        src={img}
                        alt={`${produit.libelle} - vue ${index + 1}`}
                        fallbackSrc={getDefaultProductImage()}
                        className="w-100 h-100 object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Description</h2>
              <div className="text-muted" style={{ lineHeight: 1.8 }}>
                {produit.description ? (
                  <p>{produit.description}</p>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour ce produit.
                  </p>
                )}
              </div>
            </div>

            {/* Spécifications techniques */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Spécifications Techniques</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Marque</span>
                    <span className="fw-semibold">
                      {produit.libelle.split(" ")[0] || "Samsung"}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Modèle</span>
                    <span className="fw-semibold">{produit.libelle}</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">État</span>
                    <span className="text-success fw-semibold">
                      {condition.text}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Couleur</span>
                    <span className="fw-semibold">Gris Fantôme</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Stockage</span>
                    <span className="fw-semibold">128Go</span>
                  </div>
                  <div className="py-3 d-flex justify-content-between">
                    <span className="text-muted">RAM</span>
                    <span className="fw-semibold">8Go</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Taille de l'écran</span>
                    <span className="fw-semibold">6,2 pouces</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Batterie</span>
                    <span className="fw-semibold">4000mAh</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Caméra</span>
                    <span className="fw-semibold">64MP + 12MP + 12MP</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Système d'exploitation</span>
                    <span className="fw-semibold">Android 13</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Connectivité</span>
                    <span className="fw-semibold">
                      5G, WiFi 6, Bluetooth 5.0
                    </span>
                  </div>
                  <div className="py-3 d-flex justify-content-between">
                    <span className="text-muted">Garantie</span>
                    <span className="fw-semibold">6 mois restants</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Localisation</h2>
              <div className="mb-4">
                <div className="d-flex gap-3 mb-4">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-warning fs-4 mt-1"
                  />
                  <div>
                    <p className="fw-semibold h5 mb-1">Cocody, Abidjan</p>
                    <p className="text-muted">
                      Près de Riviera Golf, proche de la route principale
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="bg-light rounded-4 d-flex align-items-center justify-content-center"
                style={{ height: "320px" }}
              >
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faMapLocationDot}
                    className="fa-4x text-muted mb-4"
                  />
                  <p className="text-muted">
                    Carte interactive montrant l'emplacement approximatif
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-info bg-opacity-10 border border-info rounded-4 p-4">
                <div className="d-flex gap-3">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-info fs-4"
                  />
                  <div>
                    <p className="fw-semibold mb-2">Conseil de Sécurité</p>
                    <p className="text-muted small">
                      Pour votre sécurité, rencontrez-vous dans des lieux
                      publics pendant la journée. Venez avec un ami si possible
                      et ne partagez jamais d'informations personnelles
                      sensibles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Avis et évaluations - SECTION AMÉLIORÉE */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Évaluations et Avis</h2>

              {loadingComments ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="text-muted mt-2">Chargement des avis...</p>
                </div>
              ) : (
                <>
                  {/* Résumé des notes */}
                  <div className="bg-light rounded-4 p-4 mb-4">
                    <div className="row align-items-center">
                      <div className="col-md-4 text-center">
                        <div className="display-1 fw-bold text-primary mb-2">
                          {safeToFixed(noteStats.moyenne)}
                        </div>
                        <div className="mb-2 text-warning">
                          {renderStars(noteStats.moyenne)}
                        </div>
                        <p className="text-muted mb-0">
                          Basé sur {noteStats.total} avis
                        </p>
                      </div>
                      <div className="col-md-8">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = noteStats[
                            rating as keyof typeof noteStats
                          ] as number;
                          const maxCount = Math.max(
                            noteStats[5] || 0,
                            noteStats[4] || 0,
                            noteStats[3] || 0,
                            noteStats[2] || 0,
                            noteStats[1] || 0,
                          );
                          const percentage =
                            maxCount > 0
                              ? Math.round((count / maxCount) * 100)
                              : 0;

                          return (
                            <div
                              key={rating}
                              className="d-flex align-items-center gap-3 mb-2"
                            >
                              <span
                                className="text-muted"
                                style={{ width: "70px" }}
                              >
                                {rating} étoiles
                              </span>
                              <div
                                className="progress flex-grow-1"
                                style={{ height: "8px" }}
                              >
                                <div
                                  className="progress-bar bg-warning"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span
                                className="text-muted"
                                style={{ width: "40px" }}
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {showAddReview ? (
                    <div className="card border mb-4">
                      <div className="card-body">
                        <h5 className="card-title mb-3">Donner votre avis</h5>
                        <div className="mb-3">
                          <label className="form-label">Note</label>
                          <div className="d-flex mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="btn btn-link p-0 me-2"
                                onClick={() =>
                                  setNewReview({ ...newReview, note: star })
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className={`fa-2x ${star <= newReview.note ? "text-warning" : "text-muted"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Commentaire</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={newReview.commentaire}
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                commentaire: e.target.value,
                              })
                            }
                            placeholder="Partagez votre expérience avec ce produit..."
                          ></textarea>
                        </div>
                        <div className="d-flex justify-content-between">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowAddReview(false)}
                            disabled={submittingReview}
                          >
                            Annuler
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={handleSubmitReview}
                            disabled={
                              submittingReview || !newReview.commentaire.trim()
                            }
                          >
                            {submittingReview ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                <span className="ms-2">Envoi en cours...</span>
                              </>
                            ) : (
                              "Publier l'avis"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-4">
                      <button
                        className="btn btn-primary rounded-pill px-4"
                        onClick={() => {
                          if (!isLoggedIn) {
                            openLoginModal();
                            return;
                          }
                          setShowAddReview(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Donner votre avis
                      </button>
                    </div>
                  )}

                  {/* ✅ LISTE DES COMMENTAIRES AMÉLIORÉE */}
                  {commentaires.length > 0 ? (
                    <div className="space-y-6">
                      {visibleComments.map((comment) => (
                        <div
                          key={comment.uuid}
                          className="border-bottom pb-4 mb-4"
                        >
                          <div className="d-flex gap-4">
                            {/* Avatar de l'utilisateur */}
                            <div className="flex-shrink-0">
                              {comment.utilisateur_photo ? (
                                <SecureImage
                                  src={comment.utilisateur_photo}
                                  alt={comment.utilisateur_nom}
                                  fallbackSrc={getDefaultAvatarUrl()}
                                  className="rounded-circle"
                                  style={{
                                    width: "56px",
                                    height: "56px",
                                    objectFit: "cover",
                                    border: "2px solid #f0f0f0",
                                  }}
                                />
                              ) : (
                                <div
                                  className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "56px",
                                    height: "56px",
                                    border: "2px solid #f0f0f0",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faUserCircle}
                                    className="text-muted fs-2"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Contenu du commentaire */}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    {comment.utilisateur_nom}
                                  </h6>
                                  <div className="mb-2">
                                    {renderRatingStars(comment.note)}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="me-1"
                                  />
                                  {formatDate(comment.date)}
                                </small>
                              </div>

                              <p className="text-muted mb-3 bg-light p-3 rounded-3">
                                {comment.commentaire}
                              </p>

                              <div className="d-flex gap-3">
                                <button
                                  className="btn btn-link text-muted p-0 text-decoration-none hover-text-primary"
                                  onClick={() =>
                                    handleLikeComment(comment.uuid)
                                  }
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faThumbsUp}
                                    className="me-1"
                                  />
                                  Utile ({comment.likes})
                                </button>
                                <button
                                  className="btn btn-link text-muted p-0 text-decoration-none hover-text-danger"
                                  onClick={() =>
                                    handleReportComment(comment.uuid)
                                  }
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faFlag}
                                    className="me-1"
                                  />
                                  Signaler
                                </button>
                                <button
                                  className="btn btn-link text-muted p-0 text-decoration-none hover-text-warning"
                                  onClick={() => {
                                    if (!isLoggedIn) {
                                      openLoginModal();
                                      return;
                                    }
                                    // Fonction pour répondre au commentaire (à implémenter)
                                  }}
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  <FontAwesomeIcon
                                    icon={faReply}
                                    className="me-1"
                                  />
                                  Répondre
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FontAwesomeIcon
                        icon={faCommentSlash}
                        className="fa-3x text-muted mb-3"
                      />
                      <h5 className="text-muted mb-2">
                        Aucun avis pour le moment
                      </h5>
                      <p className="text-muted mb-4">
                        Soyez le premier à donner votre avis sur ce produit.
                      </p>
                    </div>
                  )}

                  {/* Bouton voir plus */}
                  {commentaires.length > 3 && (
                    <button
                      className="w-100 mt-4 btn btn-outline-warning py-3 fw-semibold"
                      onClick={() => setShowMoreComments(!showMoreComments)}
                    >
                      <FontAwesomeIcon
                        icon={showMoreComments ? faChevronUp : faChevronDown}
                        className="me-2"
                      />
                      {showMoreComments
                        ? "Voir moins d'avis"
                        : `Voir tous les ${commentaires.length} avis`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Articles Similaires */}
            {produitsAShow.length > 0 && (
              <div
                id="similar-items-section"
                className="card border-0 shadow-lg rounded-4 p-5 mt-8"
              >
                <h2 className="h2 fw-bold text-dark mb-4">
                  Articles Similaires que Vous Pourriez Aimer
                </h2>
                <div className="row g-4">
                  {produitsAShow.map((item) => (
                    <div key={item.uuid} className="col-md-6">
                      <Link
                        href={`/produits/${item.uuid}`}
                        className="text-decoration-none"
                      >
                        <div className="card border-0 shadow h-100 hover-shadow-xl transition-all cursor-pointer">
                          <div className="row g-0">
                            <div className="col-4">
                              <div
                                className="position-relative h-100"
                                style={{ minHeight: "120px" }}
                              >
                                <SecureImage
                                  src={item.image}
                                  alt={item.libelle}
                                  fallbackSrc={getDefaultProductImage()}
                                  className="w-100 h-100 object-cover rounded-start"
                                />
                                <div className="position-absolute top-0 start-0 m-1 bg-success text-white px-2 py-1 rounded-pill small">
                                  <FontAwesomeIcon
                                    icon={faTag}
                                    className="me-1"
                                  />
                                  <span>vente</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-8">
                              <div className="card-body p-3">
                                <h6 className="fw-bold text-dark mb-2 text-truncate">
                                  {item.libelle}
                                </h6>
                                <p className="fw-bold text-warning mb-2">
                                  {formatPrice(item.prix)}
                                </p>
                                <div className="d-flex align-items-center text-muted small mb-2">
                                  <div className="me-2 text-warning">
                                    {renderStars(item.note_moyenne)}
                                  </div>
                                  <span>({item.note_moyenne.toFixed(1)})</span>
                                </div>
                                <div className="d-flex align-items-center text-muted small">
                                  <FontAwesomeIcon
                                    icon={faHeart}
                                    className="text-danger me-1"
                                  />
                                  <span className="me-2">
                                    {item.nombre_favoris || 0}
                                  </span>
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="text-info me-1"
                                  />
                                  <span>{item.nombre_avis || 0} avis</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Sidebar (4/12) */}
          <div className="col-lg-4">
            {/* Carte prix et actions */}
            <div
              className="card border-0 shadow-lg rounded-4 p-4 sticky-top"
              style={{ top: "100px" }}
            >
              <div className="mb-4">
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="display-6 fw-bold text-warning">
                    {formatPrice(produit.prix).replace("FCFA", "")}
                  </span>
                  <span className="text-muted">FCFA</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    Négociable
                  </span>
                  <span className="small text-muted">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    Publié {formatDate(produit.createdAt)}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-3 mb-4">
                <button
                  onClick={handleContactVendeur}
                  className="btn btn-warning btn-lg fw-bold text-white py-4"
                >
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Contacter le vendeur
                </button>
                <button
                  onClick={handleContactWhatsApp}
                  className="btn btn-success btn-lg fw-bold py-4"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                  WhatsApp
                </button>
                <button
                  onClick={handleContactVendeur}
                  className="btn btn-outline-warning btn-lg fw-bold py-4"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Envoyer un message
                </button>
              </div>

              {/* 🔴 BOUTON FAVORI DANS LA SIDEBAR - UNIQUEMENT SI CONNECTÉ */}
              {isLoggedIn && favoriInitialized && (
                <div className="border-top pt-4 mb-4">
                  <button
                    onClick={handleAddToFavorites}
                    className="btn btn-light w-100 py-3 fw-semibold"
                  >
                    <FontAwesomeIcon
                      icon={favori ? FaHeartSolid : faHeartRegularIcon}
                      className={`me-2 ${favori ? "text-danger" : ""}`}
                    />
                    {favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </button>
                </div>
              )}

              {/* ✅ Informations de la boutique et du créateur - CORRIGÉ */}
              <div className="bg-info bg-opacity-10 rounded-4 p-4 mb-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-warning rounded-circle p-3">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <p className="fw-semibold mb-1 small">Vendeur vérifié</p>
                    <p className="text-muted small mb-0">
                      Identité vérifiée par OSKAR
                    </p>
                  </div>
                </div>

                {/* ✅ AFFICHAGE DE LA BOUTIQUE AVEC SON LOGO */}
                {boutique && (
                  <div className="d-flex align-items-center gap-3 mt-3">
                    {boutique.logo ? (
                      <SecureImage
                        src={boutique.logo}
                        alt={boutique.nom}
                        fallbackSrc={getDefaultAvatarUrl()}
                        className="rounded-3 cursor-pointer"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        onClick={handleVisitBoutique}
                      />
                    ) : (
                      <div
                        className="bg-white rounded-3 d-flex align-items-center justify-content-center cursor-pointer"
                        style={{
                          width: "60px",
                          height: "60px",
                        }}
                        onClick={handleVisitBoutique}
                      >
                        <FontAwesomeIcon
                          icon={faStore}
                          className="fa-2x text-muted"
                        />
                      </div>
                    )}
                    <div>
                      <p className="fw-semibold mb-1 small">
                        <Link
                          href={`/boutiques/${boutique.uuid}`}
                          className="text-decoration-none text-dark"
                        >
                          {boutique.nom}
                        </Link>
                      </p>
                      {boutique.vendeur && (
                        <p className="text-muted small mb-0">
                          {boutique.vendeur.prenoms} {boutique.vendeur.nom}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ AFFICHAGE DU CRÉATEUR SI PAS DE BOUTIQUE */}
                {!boutique && createur && (
                  <div className="d-flex align-items-center gap-3 mt-3">
                    {createur.avatar ? (
                      <SecureImage
                        src={createur.avatar}
                        alt={`${createur.prenoms} ${createur.nom}`}
                        fallbackSrc={getDefaultAvatarUrl()}
                        className="rounded-circle cursor-pointer"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                        onClick={handleVisitUtilisateur}
                      />
                    ) : (
                      <div
                        className="bg-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                        onClick={handleVisitUtilisateur}
                      >
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="fa-2x text-muted"
                        />
                      </div>
                    )}
                    <div>
                      <p className="fw-semibold small mb-1">Créateur</p>
                      <p className="text-muted small mb-0">
                        {createur.prenoms} {createur.nom}
                      </p>
                    </div>
                  </div>
                )}

                {createur?.est_verifie && (
                  <div className="d-flex align-items-center mt-3 text-success">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    <span className="small">Vendeur vérifié</span>
                  </div>
                )}

                {createur && (
                  <div className="border-top mt-3 pt-3">
                    <p className="fw-semibold small mb-2">Contact créateur</p>
                    {createur.email && (
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        <span className="text-truncate">{createur.email}</span>
                      </div>
                    )}
                    {createur.telephone && (
                      <div className="d-flex align-items-center text-muted small">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        <span>{createur.telephone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informations produit */}
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">ID de l'annonce</span>
                  <span className="fw-semibold">
                    #OSK-{produit.uuid.substring(0, 5).toUpperCase()}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Vues</span>
                  <span className="fw-semibold">
                    {produit.nombre_favoris + 1247}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Catégorie</span>
                  <span className="fw-semibold">
                    {produit.categorie?.libelle || "Électronique"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Stock</span>
                  <span className="fw-semibold">
                    {produit.quantite} unité(s)
                  </span>
                </div>
              </div>

              {/* Bouton signaler */}
              <div className="border-top mt-4 pt-4">
                <button className="btn btn-link text-danger w-100 py-2 text-decoration-none">
                  <FontAwesomeIcon icon={faFlag} className="me-2" />
                  Signaler cette annonce
                </button>
              </div>
            </div>

            {/* ✅ Carte vendeur (fallback si pas de boutique) */}
            {!boutique && createur && (
              <div className="card border-0 shadow-lg rounded-4 p-4 mt-4">
                <h5 className="fw-bold mb-4">Informations sur le vendeur</h5>
                <div className="d-flex align-items-center gap-3 mb-4">
                  {createur.avatar ? (
                    <SecureImage
                      src={createur.avatar}
                      alt={`${createur.prenoms} ${createur.nom}`}
                      fallbackSrc={getDefaultAvatarUrl()}
                      className="rounded-circle"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "64px",
                        height: "64px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="fa-3x text-muted"
                      />
                    </div>
                  )}
                  <div>
                    <p className="fw-bold mb-1">
                      {createur.prenoms} {createur.nom}
                    </p>
                    <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                      {renderStars(produit.note_moyenne)}
                      <span className="text-muted ms-1">
                        ({produit.note_moyenne.toFixed(1)})
                      </span>
                    </div>
                    <p className="small text-muted mb-0">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                      Membre depuis {formatMemberSince(createur.created_at)}
                    </p>
                  </div>
                </div>

                <div className="small mb-4">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Annonces actives</span>
                    <span className="fw-semibold">
                      {createur.nombre_annonces || produitsSimilaires.length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Ventes totales</span>
                    <span className="fw-semibold">
                      {createur.nombre_ventes || produit.nombre_avis}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Taux de réponse</span>
                    <span className="text-success fw-semibold">
                      {createur.taux_reponse || 98}%
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Temps de réponse</span>
                    <span className="fw-semibold">
                      {createur.temps_reponse || "Moins de 2 heures"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleVisitUtilisateur}
                  className="btn btn-outline-warning w-100 py-3 fw-semibold"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Voir toutes les annonces
                </button>
              </div>
            )}

            {/* Conseils de sécurité */}
            <div className="card bg-gradient-orange-red border-0 shadow-lg rounded-4 p-4 mt-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-warning rounded-circle p-3">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
                </div>
                <h5 className="fw-bold mb-0">Conseils de Sécurité</h5>
              </div>
              <ul className="list-unstyled small text-muted">
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Rencontrez-vous dans un lieu sûr et public</span>
                </li>
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Inspectez l'article avant le paiement</span>
                </li>
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>N'envoyez jamais d'argent à l'avance</span>
                </li>
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Vérifiez l'identité du vendeur</span>
                </li>
                <li className="d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Faites confiance à votre instinct</span>
                </li>
              </ul>
              <button className="btn btn-link text-warning text-decoration-none p-0 mt-3 text-start">
                Lire le guide de sécurité complet →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Section récemment consultés */}
      {produitsRecents.length > 0 && (
        <section className="bg-white py-5 mt-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 fw-bold">Récemment Consultés</h2>
              <Link
                href="/produits"
                className="text-warning text-decoration-none fw-semibold"
              >
                Voir Tout
              </Link>
            </div>
            <div className="row g-4">
              {produitsRecents.slice(0, 4).map((item) => (
                <div key={item.uuid} className="col-md-3">
                  <Link
                    href={`/produits/${item.uuid}`}
                    className="text-decoration-none"
                  >
                    <div className="card border-0 shadow h-100 hover-border-warning transition-all cursor-pointer">
                      <div
                        className="position-relative"
                        style={{ height: "200px" }}
                      >
                        <SecureImage
                          src={item.image}
                          alt={item.libelle}
                          fallbackSrc={getDefaultProductImage()}
                          className="w-100 h-100 object-cover"
                        />
                        <div className="position-absolute top-0 start-0 m-2 bg-success text-white px-2 py-1 rounded-pill small">
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          <span>vente</span>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h6 className="fw-bold text-dark mb-2 text-truncate">
                          {item.libelle}
                        </h6>
                        <p className="fw-bold text-warning mb-2">
                          {formatPrice(item.prix)}
                        </p>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <div className="me-2 text-warning">
                            {renderStars(item.note_moyenne)}
                          </div>
                          <span>({item.note_moyenne.toFixed(1)})</span>
                        </div>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {item.createur?.avatar ? (
                              <SecureImage
                                src={item.createur.avatar}
                                alt={item.createur?.prenoms || "Vendeur"}
                                fallbackSrc={getDefaultAvatarUrl()}
                                className="rounded-circle me-2"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faUserCircle}
                                  className="text-muted"
                                  style={{ fontSize: "18px" }}
                                />
                              </div>
                            )}
                            <span
                              className="small text-dark text-truncate"
                              style={{ maxWidth: "80px" }}
                            >
                              {item.createur?.prenoms || "Vendeur"}
                            </span>
                          </div>
                          <span className="btn btn-warning text-white btn-sm px-3">
                            Voir
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Badges de confiance */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <div
                className="bg-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "64px", height: "64px" }}
              >
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-white fa-2x"
                />
              </div>
              <h6 className="fw-bold mb-2">Transactions Sécurisées</h6>
              <p className="small text-muted">
                Informations acheteur et vendeur protégées
              </p>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "64px", height: "64px" }}
              >
                <FontAwesomeIcon
                  icon={faUserCheck}
                  className="text-white fa-2x"
                />
              </div>
              <h6 className="fw-bold mb-2">Utilisateurs Vérifiés</h6>
              <p className="small text-muted">
                Vérification d'identité pour la confiance
              </p>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="bg-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "64px", height: "64px" }}
              >
                <FontAwesomeIcon
                  icon={faHeadset}
                  className="text-white fa-2x"
                />
              </div>
              <h6 className="fw-bold mb-2">Support 24/7</h6>
              <p className="small text-muted">Toujours là pour vous aider</p>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="bg-purple rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#6f42c1",
                }}
              >
                <FontAwesomeIcon icon={faUsers} className="text-white fa-2x" />
              </div>
              <h6 className="fw-bold mb-2">Communauté Locale</h6>
              <p className="small text-muted">
                Connectez-vous avec vos voisins
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-5">
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 className="text-center fw-bold mb-4">
            Questions Fréquemment Posées
          </h2>
          <div className="accordion" id="faqAccordion">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="accordion-item border-2 rounded-4 mb-3"
              >
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${expandedFaq === index ? "" : "collapsed"} bg-white`}
                    type="button"
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                  >
                    <span className="fw-semibold">{faq.question}</span>
                  </button>
                </h2>
                <div
                  className={`accordion-collapse collapse ${expandedFaq === index ? "show" : ""}`}
                >
                  <div className="accordion-body bg-light">
                    <p className="text-muted mb-0">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-success text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            Vous avez quelque chose à vendre ?
          </h2>
          <p className="lead mb-4">
            Rejoignez des milliers de vendeurs et touchez des acheteurs dans
            votre communauté
          </p>
          <Link
            href="/publication-annonce"
            className="btn btn-light btn-lg px-5 py-4 fw-bold text-success"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Publiez votre annonce maintenant
          </Link>
        </div>
      </section>

      <style jsx>{`
        .hover-bg-warning:hover {
          background-color: #f57c00 !important;
          color: white !important;
        }
        .hover-border-warning:hover {
          border-color: #f57c00 !important;
        }
        .hover-text-white:hover {
          color: white !important;
        }
        .hover-shadow-xl:hover {
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .group-hover-scale:hover {
          transform: scale(1.1);
        }
        .group:hover .group-hover-scale {
          transform: scale(1.1);
        }
        .bg-gradient-orange-red {
          background: linear-gradient(135deg, #fff5e6 0%, #fff0f0 100%);
        }
        .bg-purple {
          background-color: #6f42c1;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .sticky-top {
          position: sticky;
          top: 100px;
        }
        .accordion-button:not(.collapsed) {
          background-color: white;
          color: inherit;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: #dee2e6;
        }
        .mt-8 {
          margin-top: 2rem;
        }
        .h-56 {
          height: 224px;
        }
        .h-24 {
          height: 96px;
        }
        .w-10 {
          width: 40px;
        }
        .h-10 {
          height: 40px;
        }
        .shadow-md {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .h-100 {
          height: 100%;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
