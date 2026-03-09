// app/(front-office)/echanges/[uuid]/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";

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
  faHandHoldingHeart,
  faReply,
  faMobile,
  faLaptop,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as FaHeartRegular } from "@fortawesome/free-regular-svg-icons";

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

interface Categorie {
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

interface EchangeAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nomElementEchange: string;
  typeEchange: "produit" | "service";
  objetPropose: string;
  objetDemande: string;
  message: string | null;
  description: string | null;
  prix: number | null;
  image: string | null;
  image_key: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_rencontre: string;
  disponible: boolean;
  quantite: number;
  nom_initiateur: string;
  type_destinataire: string;
  estPublie: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  admin_uuid: string | null;
  agent_uuid: string | null;
  createdAt: string | null;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  etoiles_pleines: number;
  demi_etoile: number;
  etoiles_vides: number;
  repartition_notes: any | null;
  is_favoris: boolean;
  createur: CreateurInfo;
  createurType: "utilisateur" | "vendeur";
  categorie: Categorie | null;
  numero: string;
  categorie_uuid: string;
  publieLe: string | null;
  est_bloque: boolean | null;
  est_public: number;
}

interface EchangeSimilaireAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nomElementEchange: string;
  typeEchange: "produit" | "service";
  objetPropose: string;
  objetDemande: string;
  description: string | null;
  prix: number | null;
  image: string | null;
  image_key: string | null;
  localisation: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  etoiles_pleines: number;
  demi_etoile: number;
  etoiles_vides: number;
  is_favoris: boolean;
  createdAt: string | null;
  updatedAt: string;
  categorie: Categorie | null;
  createur?: CreateurInfo;
}

interface EchangeResponse {
  echange: EchangeAPI;
  similaires: EchangeSimilaireAPI[];
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  typeEchange: "produit" | "service";
  objetPropose: string;
  objetDemande: string;
  message: string | null;
  description: string | null;
  prix: number | null;
  image: string;
  image_key?: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_rencontre: string;
  disponible: boolean;
  quantite: number;
  nom_initiateur: string;
  type_destinataire: string;
  estPublie: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  createdAt: string | null;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  is_favoris: boolean;
  createur?: CreateurInfo;
  createurType?: "utilisateur" | "vendeur";
  categorie: Categorie | null;
  numero: string;
}

interface EchangeSimilaire {
  uuid: string;
  nomElementEchange: string;
  typeEchange: "produit" | "service";
  objetPropose: string;
  objetDemande: string;
  description: string | null;
  prix: number | null;
  image: string;
  localisation: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  categorie: Categorie | null;
  createur?: CreateurInfo;
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
// FONCTION DE CONSTRUCTION D'URL D'IMAGE
// ============================================
const buildImageUrl = (
  imagePath: string | null,
  imageKey: string | null = null,
): string => {
  // Si on a une clé, priorité à la construction via API
  if (imageKey) {
    // Si la clé est déjà une URL complète
    if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
      // Remplacer localhost par l'URL de production si nécessaire
      if (imageKey.includes("localhost")) {
        const productionUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
          "https://oskar-api.mysonec.pro";
        return imageKey.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
      }
      return imageKey;
    }

    // Construire l'URL avec la clé
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
    const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

    // Si la clé contient déjà %2F, l'utiliser directement
    if (imageKey.includes("%2F")) {
      return `${apiUrl}${filesUrl}/${imageKey}`;
    }

    // Sinon, encoder la clé
    const encodedKey = encodeURIComponent(imageKey);
    return `${apiUrl}${filesUrl}/${encodedKey}`;
  }

  // Fallback sur le chemin image
  if (!imagePath || imagePath.trim() === "") {
    return "/images/placeholder.jpg";
  }

  // Si c'est déjà une URL complète
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Remplacer localhost par l'URL de production si nécessaire
    if (imagePath.includes("localhost")) {
      const productionUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
        "https://oskar-api.mysonec.pro";
      return imagePath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return imagePath;
  }

  // Si c'est un chemin encodé (avec %2F)
  if (imagePath.includes("%2F")) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
    const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
    return `${apiUrl}${filesUrl}/${imagePath}`;
  }

  // Si c'est un chemin simple
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
  return `${apiUrl}${filesUrl}/${imagePath}`;
};

// ============================================
// FONCTION DE FORMATAGE DE DATE
// ============================================
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Date inconnue";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date inconnue";
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `Aujourd'hui à ${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    return "Date inconnue";
  }
};

// ============================================
// FONCTION DE FORMATAGE DE PRIX - CORRIGÉE
// ============================================
const formatPrice = (price: number | null): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return "Prix à discuter";
  }
  if (price === 0) {
    return "Gratuit";
  }
  // 🔥 CORRECTION: Supprimer les décimales et ajouter les séparateurs de milliers
  const priceInt = Math.floor(price);
  return (
    priceInt.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + " FCFA"
  );
};

// ============================================
// FONCTION DE FORMATAGE DE NOMBRE
// ============================================
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// ============================================
// FONCTION DE FORMATAGE DES NOTES
// ============================================
const formatRating = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0,0";
  }
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

// ============================================
// FALLBACK IMAGES
// ============================================
const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18'%3E%3C/rect%3E%3Cline x1='7' y1='2' x2='7' y2='22'%3E%3C/line%3E%3Cline x1='17' y1='2' x2='17' y2='22'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='2' y1='7' x2='7' y2='7'%3E%3C/line%3E%3Cline x1='2' y1='17' x2='7' y2='17'%3E%3C/line%3E%3Cline x1='17' y1='17' x2='22' y2='17'%3E%3C/line%3E%3Cline x1='17' y1='7' x2='22' y2='7'%3E%3C/line%3E%3C/svg%3E";

const DEFAULT_AVATAR_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

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

      // Tentative de reconstruction de l'URL
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1);

        // Essayer de reconstruire l'URL
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

        // Extraire le chemin de l'URL actuelle
        const urlParts = currentSrc.split("/api/files/");
        if (urlParts.length > 1) {
          const path = urlParts[1];
          setCurrentSrc(`${apiUrl}${filesUrl}/${path}`);
          return;
        }
      }

      // Si tous les essais échouent, utiliser le fallback
      setCurrentSrc(fallbackSrc);
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
export default function EchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [echange, setEchange] = useState<Echange | null>(null);
  const [createur, setCreateur] = useState<CreateurInfo | null>(null);
  const [echangesSimilaires, setEchangesSimilaires] = useState<
    EchangeSimilaire[]
  >([]);
  const [echangesRecents, setEchangesRecents] = useState<EchangeSimilaire[]>(
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
  
  // ✅ État pour la modal d'appel
  const [showCallModal, setShowCallModal] = useState(false);
  // ✅ État pour la modal de publication
  const [showPublishModal, setShowPublishModal] = useState(false);
  // ✅ Détection du type d'appareil
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Détecter si c'est un appareil mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    
    checkMobile();
  }, []);

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
      question: "Comment contacter le créateur de l'échange ?",
      answer:
        "Vous pouvez contacter le créateur en utilisant les boutons WhatsApp, Facebook ou Envoyer un message sur cette page. Assurez-vous de vous présenter et de poser toutes vos questions sur l'échange avant d'organiser une rencontre.",
    },
    {
      question: "Comment se déroule un échange ?",
      answer:
        "L'échange se fait directement entre les deux parties. Vous convenez d'un lieu et d'une heure de rencontre, puis vous échangez les articles ou services proposés.",
    },
    {
      question: "Puis-je proposer autre chose que ce qui est demandé ?",
      answer:
        "Vous pouvez contacter le créateur pour discuter d'autres possibilités d'échange. Le propriétaire de l'annonce est libre d'accepter ou non votre proposition.",
    },
    {
      question: "Que faire en cas de problème pendant l'échange ?",
      answer:
        "En cas de problème, vous pouvez contacter notre support. Pour votre sécurité, rencontrez-vous toujours dans des lieux publics et inspectez l'article avant l'échange.",
    },
    {
      question: "Puis-je annuler un échange ?",
      answer:
        "Oui, vous pouvez annuler l'échange à tout moment avant la rencontre. Si vous avez déjà contacté le créateur, nous vous recommandons de l'informer de votre décision.",
    },
  ];

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const getDefaultAvatarUrl = (): string => {
    return DEFAULT_AVATAR_IMAGE;
  };

  const getDefaultEchangeImage = (): string => {
    return DEFAULT_PRODUCT_IMAGE;
  };

  const normalizeImageUrl = (
    url: string | null,
    key: string | null = null,
  ): string => {
    return buildImageUrl(url, key);
  };

  const safeToFixed = (
    value: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0,0";
    }
    return value.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getSafeNoteMoyenne = (echange: Echange | null): number => {
    if (!echange) return 0;
    if (
      echange.note_moyenne === null ||
      echange.note_moyenne === undefined ||
      isNaN(echange.note_moyenne)
    ) {
      return 0;
    }
    return echange.note_moyenne;
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

  const getTypeIcon = (type: string | undefined) => {
    switch (type) {
      case "produit":
        return faBoxOpen;
      case "service":
        return faHandHoldingHeart;
      default:
        return faExchangeAlt;
    }
  };

  const getConditionBadge = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "disponible":
        return {
          text: "Disponible",
          color: "success",
          bgColor: "bg-success",
          icon: faCheckCircle,
        };
      case "en_attente":
        return {
          text: "En attente",
          color: "warning",
          bgColor: "bg-warning",
          icon: faClock,
        };
      case "reserve":
        return {
          text: "Réservé",
          color: "info",
          bgColor: "bg-info",
          icon: faCalendarAlt,
        };
      case "termine":
        return {
          text: "Terminé",
          color: "secondary",
          bgColor: "bg-secondary",
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

  const transformEchangeData = (apiEchange: EchangeAPI): Echange => {
    return {
      uuid: apiEchange.uuid,
      nomElementEchange: apiEchange.nomElementEchange,
      typeEchange: apiEchange.typeEchange,
      objetPropose: apiEchange.objetPropose,
      objetDemande: apiEchange.objetDemande,
      message: apiEchange.message,
      description: apiEchange.description,
      prix: apiEchange.prix,
      image: normalizeImageUrl(apiEchange.image, apiEchange.image_key),
      image_key: apiEchange.image_key,
      localisation: apiEchange.localisation,
      statut: apiEchange.statut,
      date_debut: apiEchange.date_debut,
      date_fin: apiEchange.date_fin,
      lieu_rencontre: apiEchange.lieu_rencontre,
      disponible: apiEchange.disponible,
      quantite: apiEchange.quantite || 1,
      nom_initiateur: apiEchange.nom_initiateur,
      type_destinataire: apiEchange.type_destinataire,
      estPublie: apiEchange.estPublie,
      vendeur_uuid: apiEchange.vendeur_uuid,
      utilisateur_uuid: apiEchange.utilisateur_uuid,
      createdAt: apiEchange.createdAt,
      updatedAt: apiEchange.updatedAt,
      note_moyenne: apiEchange.note_moyenne || 0,
      nombre_avis: apiEchange.nombre_avis || 0,
      is_favoris: apiEchange.is_favoris || false,
      ...(apiEchange.createur && {
        createur: transformCreateurInfo(apiEchange.createur),
      }),
      createurType: apiEchange.createurType,
      categorie: apiEchange.categorie,
      numero: apiEchange.numero,
    };
  };

  const transformEchangeSimilaireData = (
    apiSimilaire: EchangeSimilaireAPI,
  ): EchangeSimilaire => {
    return {
      uuid: apiSimilaire.uuid,
      nomElementEchange: apiSimilaire.nomElementEchange,
      typeEchange: apiSimilaire.typeEchange,
      objetPropose: apiSimilaire.objetPropose,
      objetDemande: apiSimilaire.objetDemande,
      description: apiSimilaire.description,
      prix: apiSimilaire.prix,
      image: normalizeImageUrl(apiSimilaire.image, apiSimilaire.image_key),
      localisation: apiSimilaire.localisation,
      statut: apiSimilaire.statut,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite || 1,
      note_moyenne: apiSimilaire.note_moyenne || 0,
      nombre_avis: apiSimilaire.nombre_avis || 0,
      categorie: apiSimilaire.categorie,
      ...(apiSimilaire.createur && {
        createur: transformCreateurInfo(apiSimilaire.createur),
      }),
    };
  };

  // ? FONCTION TRANSFORM COMMENTAIRE AMÉLIORÉE
  const transformCommentaireData = (
    apiCommentaire: CommentaireAPI,
  ): Commentaire => {
    // Récupérer l'auteur (peut être dans auteur ou utilisateur selon la structure API)
    const auteur = apiCommentaire.auteur || apiCommentaire.utilisateur || null;

    let nomComplet = "Utilisateur";
    let prenom = "";
    let nom = "";

    if (auteur) {
      prenom = auteur.prenoms || "";
      nom = auteur.nom || "";
      nomComplet = `${prenom} ${nom}`.trim() || "Utilisateur";
    }

    // Construire l'URL de l'avatar
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
  const fetchEchangesRecents = useCallback(async () => {
    try {
      setLoadingRecents(true);

      const response = await api.get<any[]>(API_ENDPOINTS.ECHANGES.PUBLISHED);

      if (response && Array.isArray(response)) {
        const filtered = response.filter((item) => item.uuid !== uuid);
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        const transformed = selected.map((item: any) => ({
          uuid:
            item.uuid || `recent-${Math.random().toString(36).substr(2, 9)}`,
          nomElementEchange:
            item.nomElementEchange || item.libelle || "Échange récent",
          typeEchange: item.typeEchange || "produit",
          objetPropose: item.objetPropose || "",
          objetDemande: item.objetDemande || "",
          description: item.description || item.message || null,
          prix: item.prix || null,
          image: normalizeImageUrl(item.image, item.image_key),
          localisation: item.localisation || "",
          statut: item.statut || "disponible",
          disponible: item.disponible || true,
          quantite: item.quantite || 1,
          note_moyenne: item.note_moyenne || 0,
          nombre_avis: item.nombre_avis || 0,
          categorie: item.categorie || null,
          ...(item.createur && {
            createur: transformCreateurInfo(item.createur),
          }),
        }));

        setEchangesRecents(transformed);
      }
    } catch (err) {
      console.warn("Erreur chargement échanges récents:", err);
      setEchangesRecents([]);
    } finally {
      setLoadingRecents(false);
    }
  }, [uuid]);

  // ? FONCTION FETCH COMMENTAIRES AMÉLIORÉE
  const fetchCommentaires = useCallback(
    async (echangeUuid: string) => {
      if (!echangeUuid || commentairesFetched) return;

      try {
        setLoadingComments(true);
        console.log(
          "📢 Chargement des commentaires pour l'échange:",
          echangeUuid,
        );

        const response = await api.get<CommentairesResponse>(
          API_ENDPOINTS.COMMENTAIRES.FIND_COMMENTS_ECHANGE_BY_UUID(echangeUuid),
        );

        console.log("✅ Réponse commentaires:", response);

        if (response && response.commentaires) {
          const commentairesData = response.commentaires.map(
            transformCommentaireData,
          );

          // Trier par date (plus récent d'abord)
          commentairesData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          console.log(`📊 ${commentairesData.length} commentaires chargés`);
          setCommentaires(commentairesData);

          // Mettre à jour les stats
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
            // Calculer les stats manuellement si non fournies
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
          console.log("ℹ️ Aucun commentaire trouvé");
          setCommentaires([]);
          setCommentairesFetched(true);
        }
      } catch (err: any) {
        console.warn("⚠️ Erreur chargement commentaires:", err);
        const echangeNoteMoyenne = getSafeNoteMoyenne(echange);

        setCommentairesStats({
          nombreCommentaires: 0,
          nombreNotes: 0,
          noteMoyenne: echangeNoteMoyenne,
          distributionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setCommentaires([]);
        setCommentairesFetched(true);
      } finally {
        setLoadingComments(false);
      }
    },
    [echange],
  );

  const fetchEchangeDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<EchangeResponse>(
        API_ENDPOINTS.ECHANGES.RANDOM_DETAIL(uuid),
      );

      if (!response || !response.echange) {
        throw new Error("Échange non trouvé");
      }

      const echangeData = transformEchangeData(response.echange);
      const similairesData = response.similaires.map(
        transformEchangeSimilaireData,
      );

      setEchange(echangeData);
      setEchangesSimilaires(similairesData);

      setFavori(response.echange.is_favoris || false);

      if (response.echange.createur) {
        const createurData = transformCreateurInfo(response.echange.createur);
        createurData.userType = response.echange.createurType || "utilisateur";
        setCreateur(createurData);
      }

      const imageUrls: string[] = [echangeData.image || DEFAULT_PRODUCT_IMAGE];

      response.similaires.slice(0, 4).forEach((similaire) => {
        const imgUrl = normalizeImageUrl(similaire.image, similaire.image_key);
        if (imgUrl && !imageUrls.includes(imgUrl)) {
          imageUrls.push(imgUrl);
        }
      });

      while (imageUrls.length < 5) {
        imageUrls.push(DEFAULT_PRODUCT_IMAGE);
      }

      setImages(imageUrls.slice(0, 5));
      setImagePrincipale(imageUrls[0]);

      fetchCommentaires(echangeData.uuid);
      fetchEchangesRecents();
    } catch (err: any) {
      console.error("Erreur détail échange:", err);

      if (err.response?.status === 404 || err.message.includes("non trouvé")) {
        setError("Cet échange n'existe pas ou a été supprimé.");
      } else if (err.response?.status === 401) {
        setError("Vous devez être connecté pour voir cet échange.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation de voir cet échange.");
      } else {
        setError(
          "Impossible de charger les détails de l'échange. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [uuid, fetchCommentaires, fetchEchangesRecents]);

  useEffect(() => {
    if (uuid && loading && !echange) {
      fetchEchangeDetails();
    }
  }, [uuid, fetchEchangeDetails, loading, echange]);

  // ============================================
  // FONCTIONS D'AFFICHAGE
  // ============================================
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
  // FONCTIONS D'ACTIONS - AVEC VÉRIFICATION D'AUTH
  // ============================================
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ show: true, type, message });
  };

  // ? Vérification d'authentification pour toutes les actions
  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    action();
  };

  // ✅ Gestionnaire pour ouvrir la modale de publication
  const handleOpenPublishModal = () => {
    if (!isLoggedIn) {
      openLoginModal();
    } else {
      setShowPublishModal(true);
    }
  };

  // ✅ NOUVELLE FONCTION : Appel téléphonique direct
  const handleCallCreateur = () => {
    requireAuth(() => {
      if (!createur || !createur.telephone) {
        showToast("error", "Numéro de téléphone non disponible");
        return;
      }

      const phoneNumber = createur.telephone.replace(/\s/g, "");

      if (isMobile) {
        // Sur mobile : appel direct
        window.location.href = `tel:${phoneNumber}`;
      } else {
        // Sur desktop : ouvrir la modal
        setShowCallModal(true);
      }
    });
  };

  // 🔥 FONCTION WHATSAPP CORRIGÉE - PLUS JAMAIS GRISÉE
  const handleContactWhatsApp = () => {
    requireAuth(() => {
      if (!createur) return;

      // Essayer d'obtenir le numéro de téléphone depuis différentes sources
      let phoneNumber = createur.telephone || createur.whatsapp_url || "";

      // Nettoyer le numéro (garder seulement les chiffres)
      phoneNumber = phoneNumber.replace(/\D/g, "");

      // Si pas de numéro, utiliser un format par défaut
      if (!phoneNumber) {
        showToast("info", "Le créateur n'a pas de numéro WhatsApp renseigné");
        return;
      }

      // S'assurer que le numéro est au format international
      if (phoneNumber.startsWith("225")) {
        phoneNumber = `+${phoneNumber}`;
      } else if (!phoneNumber.startsWith("+")) {
        phoneNumber = `+225${phoneNumber}`;
      }

      const message = `Bonjour ${createur.prenoms}, je suis intéressé(e) par votre échange "${echange?.nomElementEchange}" sur OSKAR. Pourrions-nous discuter ?`;
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  };

  const handleContactFacebook = () => {
    requireAuth(() => {
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
    });
  };

  const handleCopyContactInfo = () => {
    requireAuth(() => {
      if (!createur) return;

      const contactInfo = `${createur.telephone || "Numéro non disponible"}`;

      navigator.clipboard
        .writeText(contactInfo)
        .then(() => {
          showToast("success", "Numéro de téléphone copié !");
          setShowCallModal(false);
        })
        .catch((err) => {
          console.error("Erreur lors de la copie:", err);
          showToast("error", "Impossible de copier le numéro.");
        });
    });
  };

  const handleContactCreateur = () => {
    requireAuth(() => {
      if (!createur) {
        showToast("error", "Informations du créateur non disponibles");
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
        sujet: `Question concernant votre échange: ${echange?.nomElementEchange}`,
        echangeUuid: echange?.uuid || "",
      });

      router.push(`${dashboardPath}/messages?${params.toString()}`);
    });
  };

  // ? FONCTION POUR LES FAVORIS - AVEC AUTH
  const handleAddToFavorites = () => {
    requireAuth(async () => {
      if (!echange) return;

      try {
        console.log(`📢 ${favori ? "Retrait" : "Ajout"} aux favoris...`);

        if (favori) {
          const endpoint = API_ENDPOINTS.FAVORIS.REMOVE_ECHANGE(echange.uuid);
          console.log(`📡 Appel API: DELETE ${endpoint}`);

          await api.delete(endpoint);

          setFavori(false);
          showToast("success", "Échange retiré des favoris");
        } else {
          const payload = {
            itemUuid: echange.uuid,
            type: "echange",
          };
          console.log(`📡 Appel API: POST ${API_ENDPOINTS.FAVORIS.ADD}`, payload);

          const response = await api.post(API_ENDPOINTS.FAVORIS.ADD, payload);
          console.log("✅ Réponse favoris:", response);

          setFavori(true);
          showToast("success", "Échange ajouté aux favoris");
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
    });
  };

  const handleShare = (platform: string) => {
    if (!echange) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez cet échange sur OSKAR : ${echange.nomElementEchange}`;

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

  const handleLikeComment = (commentUuid: string) => {
    requireAuth(async () => {
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
    });
  };

  const handleReportComment = (commentUuid: string) => {
    requireAuth(() => {
      if (window.confirm("Signaler ce commentaire comme inapproprié ?")) {
        api
          .post(API_ENDPOINTS.COMMENTAIRES.REPORT(commentUuid), {})
          .then(() => {
            showToast(
              "success",
              "Commentaire signalé. Notre équipe le vérifiera sous 24h.",
            );
          })
          .catch((err) => {
            console.error("Erreur signalement:", err);
            showToast("error", "Une erreur est survenue lors du signalement.");
          });
      }
    });
  };

  const handleSubmitReview = () => {
    requireAuth(async () => {
      if (!echange) return;

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
            echangeUuid: echange.uuid,
            note: newReview.note,
          },
        );

        setCommentairesFetched(false);
        await fetchCommentaires(echange.uuid);

        setNewReview({
          note: 5,
          commentaire: "",
        });
        setShowAddReview(false);

        showToast("success", "Votre avis a été ajouté avec succès !");
        await fetchEchangeDetails();
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
    });
  };

  const handleVisitUtilisateur = () => {
    requireAuth(() => {
      if (createur) {
        router.push(`/utilisateurs/${createur.uuid}`);
      }
    });
  };

  const handleInterest = () => {
    handleCallCreateur(); // ✅ MAINTENANT : Appelle la fonction d'appel
  };

  const handleReplyToComment = (commentUuid: string) => {
    requireAuth(() => {
      // Fonction pour répondre au commentaire (à implémenter)
      console.log("Répondre au commentaire:", commentUuid);
    });
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

  if (error || !echange) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body py-5">
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={faExchangeAlt}
                      className="fa-4x text-muted"
                    />
                  </div>
                  <h1 className="h3 mb-3">Échange introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Cet échange n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link
                      href="/echanges"
                      className="btn btn-outline-primary rounded-pill px-4"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Retour aux échanges
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

  const condition = getConditionBadge(echange.statut);
  const visibleComments = showMoreComments
    ? commentaires
    : commentaires.slice(0, 3);

  const echangesAShow =
    echangesSimilaires.length > 0
      ? echangesSimilaires.slice(0, 4)
      : echangesRecents.slice(0, 4);

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

      {/* ✅ MODAL D'APPEL POUR ORDINATEUR */}
      {showCallModal && createur && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowCallModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <FontAwesomeIcon icon={faPhone} className="text-success me-2" />
                  Contacter le créateur
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCallModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-4">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "80px", height: "80px" }}>
                    {createur.avatar ? (
                      <SecureImage
                        src={createur.avatar}
                        alt={`${createur.prenoms} ${createur.nom}`}
                        fallbackSrc={DEFAULT_AVATAR_IMAGE}
                        className="rounded-circle w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} className="fa-3x text-muted" />
                    )}
                  </div>
                  <h6 className="fw-bold mb-1">{createur.prenoms} {createur.nom}</h6>
                  <p className="text-muted small mb-3">{createur.userType === "vendeur" ? "Vendeur" : "Utilisateur"}</p>
                  
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="text-success" />
                      <span className="fw-semibold fs-5">{createur.telephone || "Non disponible"}</span>
                    </div>
                  </div>

                  <p className="text-muted small">
                    <FontAwesomeIcon icon={faLaptop} className="me-1" />
                    Vous êtes sur un ordinateur. Pour appeler directement, utilisez votre téléphone ou copiez le numéro.
                  </p>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-outline-success px-4 py-2"
                    onClick={handleCopyContactInfo}
                  >
                    <FontAwesomeIcon icon={faCopy} className="me-2" />
                    Copier le numéro
                  </button>
                  <button
                    className="btn btn-success px-4 py-2"
                    onClick={() => {
                      if (createur.telephone) {
                        window.open(`https://wa.me/${createur.telephone.replace(/\D/g, '')}`, '_blank');
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                    WhatsApp
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-center">
                <button
                  className="btn btn-link text-muted text-decoration-none"
                  onClick={() => setShowCallModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
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
              <li className="breadcrumb-item">
                <Link
                  href="/echanges"
                  className="text-decoration-none text-muted"
                >
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                  Échanges
                </Link>
              </li>
              {echange.categorie && (
                <li className="breadcrumb-item">
                  <Link
                    href={`/categories/${echange.categorie.slug}`}
                    className="text-decoration-none text-muted"
                  >
                    {echange.categorie.libelle}
                  </Link>
                </li>
              )}
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {echange.nomElementEchange}
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
                  alt={echange.nomElementEchange}
                  fallbackSrc={DEFAULT_PRODUCT_IMAGE}
                  className="w-100 h-100 object-cover"
                />
                <button
                  onClick={handleAddToFavorites}
                  className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-3 shadow-lg hover-bg-warning hover-text-white transition-all"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FontAwesomeIcon
                    icon={favori ? FaHeartSolid : FaHeartRegular}
                    className={favori ? "text-danger" : ""}
                  />
                </button>
                <div className="position-absolute top-0 start-0 m-3 bg-primary text-white px-4 py-2 rounded-pill fw-semibold d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faExchangeAlt} />
                  <span>échange</span>
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
                        alt={`${echange.nomElementEchange} - vue ${index + 1}`}
                        fallbackSrc={DEFAULT_PRODUCT_IMAGE}
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
                {echange.description ? (
                  <>
                    <p>{echange.description}</p>
                    {echange.message && (
                      <div className="mt-4 p-4 bg-light rounded-4">
                        <h6 className="fw-bold mb-2">Message du créateur :</h6>
                        <p className="mb-0">{echange.message}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour cet échange.
                  </p>
                )}
              </div>
            </div>

            {/* Spécifications */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Détails de l'échange</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Type d'échange</span>
                    <span className="fw-semibold">
                      {echange.typeEchange === "produit"
                        ? "Produit"
                        : "Service"}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Je propose</span>
                    <span className="fw-semibold">{echange.objetPropose}</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Je recherche</span>
                    <span className="fw-semibold">{echange.objetDemande}</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Quantité</span>
                    <span className="fw-semibold">
                      {formatNumber(echange.quantite)} unité(s)
                    </span>
                  </div>
                  {echange.categorie && (
                    <div className="border-bottom py-3 d-flex justify-content-between">
                      <span className="text-muted">Catégorie</span>
                      <span className="fw-semibold">
                        {echange.categorie.libelle}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Date de début</span>
                    <span className="fw-semibold">
                      {formatDate(echange.date_debut)}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Date de fin</span>
                    <span className="fw-semibold">
                      {formatDate(echange.date_fin)}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Lieu de rencontre</span>
                    <span className="fw-semibold">
                      {echange.lieu_rencontre}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Numéro</span>
                    <span className="fw-semibold text-primary">
                      {echange.numero}
                    </span>
                  </div>
                  <div className="py-3 d-flex justify-content-between">
                    <span className="text-muted">Statut</span>
                    <span className={`fw-semibold text-${condition.color}`}>
                      {condition.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
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
                          {safeToFixed(noteStats.moyenne, 1)}
                        </div>
                        <div className="mb-2 text-warning">
                          {renderStars(noteStats.moyenne)}
                        </div>
                        <p className="text-muted mb-0">
                          Basé sur {formatNumber(noteStats.total)} avis
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
                                {rating} étoile{rating > 1 ? "s" : ""}
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
                                {formatNumber(count)}
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
                            placeholder="Partagez votre expérience avec cet échange..."
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

                  {/* ? LISTE DES COMMENTAIRES AMÉLIORÉE */}
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
                                  fallbackSrc={DEFAULT_AVATAR_IMAGE}
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
                                  Utile ({formatNumber(comment.likes)})
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
                                  onClick={() => handleReplyToComment(comment.uuid)}
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
                        Soyez le premier à donner votre avis sur cet échange.
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
                        : `Voir tous les ${formatNumber(commentaires.length)} avis`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Échanges Similaires */}
            {echangesAShow.length > 0 && (
              <div
                id="similar-items-section"
                className="card border-0 shadow-lg rounded-4 p-5 mt-8"
              >
                <h2 className="h2 fw-bold text-dark mb-4">
                  Échanges Similaires que Vous Pourriez Aimer
                </h2>
                <div className="row g-4">
                  {echangesAShow.map((item) => (
                    <div key={item.uuid} className="col-md-6">
                      <Link
                        href={`/echanges/${item.uuid}`}
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
                                  alt={item.nomElementEchange}
                                  fallbackSrc={DEFAULT_PRODUCT_IMAGE}
                                  className="w-100 h-100 object-cover rounded-start"
                                />
                                <div className="position-absolute top-0 start-0 m-1 bg-primary text-white px-2 py-1 rounded-pill small">
                                  <FontAwesomeIcon
                                    icon={faExchangeAlt}
                                    className="me-1"
                                  />
                                  <span>échange</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-8">
                              <div className="card-body p-3">
                                <h6 className="fw-bold text-dark mb-2 text-truncate">
                                  {item.nomElementEchange}
                                </h6>
                                <p className="fw-bold text-warning mb-2">
                                  {item.prix === 0
                                    ? "Gratuit"
                                    : formatPrice(item.prix)}
                                </p>
                                <div className="d-flex align-items-center text-muted small mb-2">
                                  <div className="me-2 text-warning">
                                    {renderStars(item.note_moyenne)}
                                  </div>
                                  <span>
                                    ({formatRating(item.note_moyenne)})
                                  </span>
                                </div>
                                <div className="d-flex align-items-center text-muted small">
                                  <FontAwesomeIcon
                                    icon={faHeart}
                                    className="text-danger me-1"
                                  />
                                  <span className="me-2">
                                    {formatNumber(item.note_moyenne * 10 || 0)}
                                  </span>
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="text-info me-1"
                                  />
                                  <span>
                                    {formatNumber(item.nombre_avis || 0)} avis
                                  </span>
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
                    {echange.prix === 0
                      ? "Gratuit"
                      : formatPrice(echange.prix).replace("FCFA", "")}
                  </span>
                  {echange.prix !== 0 && echange.prix !== null && (
                    <span className="text-muted">FCFA</span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    {echange.typeEchange === "produit"
                      ? "Échange de produit"
                      : "Échange de service"}
                  </span>
                  <span className="small text-muted">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    Publié {formatDate(echange.createdAt)}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-3 mb-4">
                {/* ✅ BOUTON INTÉRESSÉ - ADAPTÉ SELON L'APPAREIL */}
                <button
                  onClick={handleInterest}
                  className="btn btn-warning btn-lg fw-bold text-white py-4"
                  disabled={!echange.disponible}
                >
                  <FontAwesomeIcon icon={isMobile ? faPhone : faLaptop} className="me-2" />
                  {echange.disponible
                    ? isMobile
                      ? "Appeler le créateur"
                      : "Voir le contact"
                    : "Non disponible"}
                </button>
                <button
                  onClick={handleContactWhatsApp}
                  className="btn btn-success btn-lg fw-bold py-4"
                  // 🔥 PLUS JAMAIS GRISÉ - Supprimé la condition disabled
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                  WhatsApp
                </button>
                <button
                  onClick={handleContactCreateur}
                  className="btn btn-outline-warning btn-lg fw-bold py-4"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Envoyer un message
                </button>
              </div>

              <div className="border-top pt-4 mb-4">
                <button
                  onClick={handleAddToFavorites}
                  className="btn btn-light w-100 py-3 fw-semibold"
                >
                  <FontAwesomeIcon
                    icon={favori ? FaHeartSolid : FaHeartRegular}
                    className={`me-2 ${favori ? "text-danger" : ""}`}
                  />
                  {favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                </button>
              </div>

              {/* Informations échange */}
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">ID de l'échange</span>
                  <span className="fw-semibold">
                    #OSK-{echange.uuid.substring(0, 5).toUpperCase()}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Vues</span>
                  <span className="fw-semibold">
                    {formatNumber(echange.note_moyenne * 100 + 500 || 0)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Catégorie</span>
                  <span className="fw-semibold">
                    {echange.categorie?.libelle || "Non catégorisé"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Disponibilité</span>
                  <span
                    className={`fw-semibold ${echange.disponible ? "text-success" : "text-danger"}`}
                  >
                    {echange.disponible ? "Disponible" : "Non disponible"}
                  </span>
                </div>
              </div>

              {/* Bouton signaler */}
              <div className="border-top mt-4 pt-4">
                <button 
                  onClick={() => requireAuth(() => {
                    if (window.confirm("Signaler cet échange comme inapproprié ?")) {
                      // Logique de signalement à implémenter
                      showToast("info", "Fonctionnalité de signalement bientôt disponible");
                    }
                  })}
                  className="btn btn-link text-danger w-100 py-2 text-decoration-none"
                >
                  <FontAwesomeIcon icon={faFlag} className="me-2" />
                  Signaler cet échange
                </button>
              </div>
            </div>

            {/* Carte créateur détaillée */}
            {createur && (
              <div className="card border-0 shadow-lg rounded-4 p-4 mt-4">
                <h5 className="fw-bold mb-4">Informations sur le créateur</h5>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <SecureImage
                    src={createur.avatar}
                    alt={`${createur.prenoms} ${createur.nom}`}
                    fallbackSrc={DEFAULT_AVATAR_IMAGE}
                    className="rounded-circle"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <p className="fw-bold mb-1">
                      {createur.prenoms} {createur.nom}
                    </p>
                    <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                      {renderStars(echange.note_moyenne)}
                      <span className="text-muted ms-1">
                        ({formatRating(echange.note_moyenne)})
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
                    <span className="text-muted">Échanges actifs</span>
                    <span className="fw-semibold">
                      {formatNumber(
                        createur.nombre_annonces || echangesSimilaires.length,
                      )}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Échanges réalisés</span>
                    <span className="fw-semibold">
                      {formatNumber(
                        createur.nombre_ventes || echange.nombre_avis,
                      )}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Taux de réponse</span>
                    <span className="text-success fw-semibold">
                      {formatNumber(createur.taux_reponse || 98)}%
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
                  Voir tous les échanges du créateur
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
                  <span>Inspectez l'article avant l'échange</span>
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
                  <span>Vérifiez l'identité du créateur</span>
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
                Lire le guide de sécurité complet ?
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Section échanges récents */}
      {echangesRecents.length > 0 && (
        <section className="bg-white py-5 mt-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 fw-bold">Échanges Récents</h2>
              <Link
                href="/echanges"
                className="text-warning text-decoration-none fw-semibold"
              >
                Voir Tout
              </Link>
            </div>
            <div className="row g-4">
              {echangesRecents.slice(0, 4).map((item) => (
                <div key={item.uuid} className="col-md-3">
                  <Link
                    href={`/echanges/${item.uuid}`}
                    className="text-decoration-none"
                  >
                    <div className="card border-0 shadow h-100 hover-border-warning transition-all cursor-pointer">
                      <div
                        className="position-relative"
                        style={{ height: "200px" }}
                      >
                        <SecureImage
                          src={item.image}
                          alt={item.nomElementEchange}
                          fallbackSrc={DEFAULT_PRODUCT_IMAGE}
                          className="w-100 h-100 object-cover"
                        />
                        <div className="position-absolute top-0 start-0 m-2 bg-primary text-white px-2 py-1 rounded-pill small">
                          <FontAwesomeIcon
                            icon={faExchangeAlt}
                            className="me-1"
                          />
                          <span>échange</span>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h6 className="fw-bold text-dark mb-2 text-truncate">
                          {item.nomElementEchange}
                        </h6>
                        <p className="fw-bold text-warning mb-2">
                          {item.prix === 0 ? "Gratuit" : formatPrice(item.prix)}
                        </p>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <div className="me-2 text-warning">
                            {renderStars(item.note_moyenne)}
                          </div>
                          <span>({formatRating(item.note_moyenne)})</span>
                        </div>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {item.createur?.avatar ? (
                              <SecureImage
                                src={item.createur.avatar}
                                alt={item.createur?.prenoms || "Créateur"}
                                fallbackSrc={DEFAULT_AVATAR_IMAGE}
                                className="rounded-circle me-2"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ width: "30px", height: "30px" }}
                              >
                                <FontAwesomeIcon
                                  icon={faUserCircle}
                                  className="text-muted"
                                />
                              </div>
                            )}
                            <span
                              className="small text-dark text-truncate"
                              style={{ maxWidth: "80px" }}
                            >
                              {item.createur?.prenoms || "Créateur"}
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
              <h6 className="fw-bold mb-2">Échanges Sécurisés</h6>
              <p className="small text-muted">
                Informations des deux parties protégées
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

      {/* CTA - MODIFIÉ POUR OUVRIR LA MODALE */}
      <section className="bg-success text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            Vous avez quelque chose à échanger ?
          </h2>
          <p className="lead mb-4">
            Rejoignez des milliers d'utilisateurs et proposez vos échanges dans
            votre communauté
          </p>
          
          {/* REMPLACÉ LE LINK PAR UN BOUTON AVEC ONCLICK */}
          <button
            onClick={handleOpenPublishModal}
            className="btn btn-light btn-lg px-5 py-4 fw-bold text-success"
            style={{ border: "none", cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Publiez votre échange maintenant
          </button>
        </div>
      </section>

      {/* MODAL DE PUBLICATION - AJOUTÉ À LA FIN */}
      <PublishAdModal
        visible={showPublishModal}
        onHide={() => setShowPublishModal(false)}
        isLoggedIn={isLoggedIn}
        onLoginRequired={() => {
          setShowPublishModal(false);
          openLoginModal();
        }}
      />

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