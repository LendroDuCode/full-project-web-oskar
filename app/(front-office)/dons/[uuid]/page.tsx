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
  faHeadset,
  faUsers,
  faCommentDots,
  faShareAlt,
  faCertificate,
  faStar,
  faHeart,
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
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

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

interface DonAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  prix: number | null;
  image: string | null;
  image_key: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_retrait: string;
  disponible: boolean;
  quantite: number;
  nom_donataire: string;
  estPublie: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  admin_uuid: string | null;
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
  agentUuid: string | null;
  adminUuid: string | null;
}

interface DonSimilaireAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  prix: number | null;
  image: string | null;
  image_key: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_retrait: string;
  disponible: boolean;
  quantite: number;
  nom_donataire: string;
  estPublie: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  createdAt: string | null;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  etoiles_pleines: number;
  demi_etoile: number;
  etoiles_vides: number;
  is_favoris: boolean;
  createur?: CreateurInfo;
}

interface DonResponse {
  don: DonAPI;
  similaires: DonSimilaireAPI[];
}

interface Don {
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  prix: number | null;
  image: string;
  image_key?: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_retrait: string;
  disponible: boolean;
  quantite: number;
  nom_donataire: string;
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

interface DonSimilaire {
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  prix: number | null;
  image: string;
  localisation: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  createur?: CreateurInfo;
}

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
  utilisateur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string | null;
  };
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
  utilisateur_photo: string | null;
  note: number;
  commentaire: string;
  date: string;
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
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Erreur chargement image ${src}:`, e);

    if (!hasError) {
      setHasError(true);

      const url = src;

      if (!url) {
        return;
      }

      if (url.includes("15.236.142.141:9000/oskar-bucket/")) {
        const key = url.replace("http://15.236.142.141:9000/oskar-bucket/", "");
        const encodedKey = encodeURIComponent(key);
        const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
        setCurrentSrc(proxyUrl);
        return;
      }

      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }

    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setHasError(false);
  };

  return (
    <div
      className="position-relative w-100 h-100"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {loading && !hasError && (
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
        src={currentSrc || fallbackSrc}
        alt={alt}
        className={`${className} ${loading && !hasError ? "opacity-0" : "opacity-100"}`}
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
export default function DonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [don, setDon] = useState<Don | null>(null);
  const [createur, setCreateur] = useState<CreateurInfo | null>(null);
  const [donsSimilaires, setDonsSimilaires] = useState<DonSimilaire[]>([]);
  const [donsRecents, setDonsRecents] = useState<DonSimilaire[]>([]);
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

  // États pour les galeries
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [contactVisible, setContactVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // FAQ
  const faqs = [
    {
      question: "Comment contacter le donateur ?",
      answer:
        "Vous pouvez contacter le donateur en utilisant les boutons WhatsApp, Facebook ou Envoyer un message sur cette page. Assurez-vous de vous présenter et de poser toutes vos questions sur le don avant d'organiser une rencontre.",
    },
    {
      question: "Comment se passe un retrait de don ?",
      answer:
        "Le donateur vous indiquera le lieu et l'heure de retrait. Rencontrez-vous dans un lieu public et vérifiez l'article avant de l'accepter.",
    },
    {
      question: "Est-ce vraiment gratuit ?",
      answer:
        "Oui, les dons sont entièrement gratuits. Aucun paiement n'est requis. Si quelqu'un vous demande de l'argent, signalez-le immédiatement.",
    },
    {
      question: "Que faire si le donateur ne répond pas ?",
      answer:
        "Vous pouvez essayer de contacter le donateur via plusieurs moyens (WhatsApp, messagerie). S'il ne répond toujours pas, vous pouvez consulter d'autres dons similaires.",
    },
    {
      question: "Puis-je annuler ma demande de don ?",
      answer:
        "Oui, vous pouvez annuler votre demande à tout moment avant le retrait. Nous vous recommandons d'informer le donateur de votre décision.",
    },
  ];

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const getDefaultAvatarUrl = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-avatar.png`;
  };

  const getDefaultDonImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-don.png`;
  };

  const convertMinioUrlToProxy = (minioUrl: string): string => {
    if (!minioUrl) return getDefaultDonImage();

    if (minioUrl.includes("localhost:3005/api/files/")) {
      return minioUrl;
    }

    if (minioUrl.includes("15.236.142.141:9000/oskar-bucket/")) {
      const key = minioUrl.replace(
        "http://15.236.142.141:9000/oskar-bucket/",
        "",
      );
      const encodedKey = encodeURIComponent(key);
      const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
      return proxyUrl;
    }

    if (
      minioUrl.includes("dons/") ||
      minioUrl.includes("produits/") ||
      minioUrl.includes("categories/") ||
      minioUrl.includes("utilisateurs/") ||
      minioUrl.includes("vendeurs/")
    ) {
      const encodedKey = encodeURIComponent(minioUrl);
      return `http://localhost:3005/api/files/${encodedKey}`;
    }

    return minioUrl;
  };

  const normalizeImageUrl = (
    url: string | null,
    key: string | null = null,
  ): string => {
    if (key) {
      if (!key.startsWith("http://") && !key.startsWith("https://")) {
        const encodedKey = encodeURIComponent(key);
        const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
        return proxyUrl;
      }
    }

    if (!url || url.trim() === "") {
      return getDefaultDonImage();
    }

    const cleanUrl = url.trim();

    if (cleanUrl.includes("localhost:3005/api/files/")) {
      if (cleanUrl.includes("http:localhost")) {
        return cleanUrl.replace("http:localhost", "http://localhost");
      }
      return cleanUrl;
    }

    if (cleanUrl.includes("15.236.142.141:9000/oskar-bucket/")) {
      return convertMinioUrlToProxy(cleanUrl);
    }

    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      if (cleanUrl.includes("http:localhost")) {
        return cleanUrl.replace("http:localhost", "http://localhost");
      }
      return cleanUrl;
    }

    if (cleanUrl.startsWith("/")) {
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
    }

    return getDefaultDonImage();
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

  const getSafeNoteMoyenne = (don: Don | null): number => {
    if (!don) return 0;
    if (
      don.note_moyenne === null ||
      don.note_moyenne === undefined ||
      isNaN(don.note_moyenne)
    ) {
      return 0;
    }
    return don.note_moyenne;
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
    return faGift;
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

  const transformDonData = (apiDon: DonAPI): Don => {
    return {
      uuid: apiDon.uuid,
      nom: apiDon.nom,
      type_don: apiDon.type_don,
      description: apiDon.description,
      prix: apiDon.prix,
      image: normalizeImageUrl(apiDon.image, apiDon.image_key),
      image_key: apiDon.image_key,
      localisation: apiDon.localisation,
      statut: apiDon.statut,
      date_debut: apiDon.date_debut,
      date_fin: apiDon.date_fin,
      lieu_retrait: apiDon.lieu_retrait,
      disponible: apiDon.disponible,
      quantite: apiDon.quantite || 1,
      nom_donataire: apiDon.nom_donataire,
      estPublie: apiDon.estPublie,
      vendeur_uuid: apiDon.vendeur_uuid,
      utilisateur_uuid: apiDon.utilisateur_uuid,
      createdAt: apiDon.createdAt,
      updatedAt: apiDon.updatedAt,
      note_moyenne: apiDon.note_moyenne || 0,
      nombre_avis: apiDon.nombre_avis || 0,
      is_favoris: apiDon.is_favoris || false,
      ...(apiDon.createur && {
        createur: transformCreateurInfo(apiDon.createur),
      }),
      createurType: apiDon.createurType,
      categorie: apiDon.categorie,
      numero: apiDon.numero,
    };
  };

  const transformDonSimilaireData = (
    apiSimilaire: DonSimilaireAPI,
  ): DonSimilaire => {
    return {
      uuid: apiSimilaire.uuid,
      nom: apiSimilaire.nom,
      type_don: apiSimilaire.type_don,
      description: apiSimilaire.description,
      prix: apiSimilaire.prix,
      image: normalizeImageUrl(apiSimilaire.image, apiSimilaire.image_key),
      localisation: apiSimilaire.localisation,
      statut: apiSimilaire.statut,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite || 1,
      note_moyenne: apiSimilaire.note_moyenne || 0,
      nombre_avis: apiSimilaire.nombre_avis || 0,
      ...(apiSimilaire.createur && {
        createur: transformCreateurInfo(apiSimilaire.createur),
      }),
    };
  };

  const transformCommentaireData = (
    apiCommentaire: CommentaireAPI,
  ): Commentaire => {
    return {
      uuid: apiCommentaire.uuid,
      utilisateur_nom: apiCommentaire.utilisateur
        ? `${apiCommentaire.utilisateur.prenoms || ""} ${apiCommentaire.utilisateur.nom || ""}`.trim() ||
          "Utilisateur"
        : "Utilisateur",
      utilisateur_photo: apiCommentaire.utilisateur?.avatar
        ? normalizeImageUrl(apiCommentaire.utilisateur.avatar)
        : getDefaultAvatarUrl(),
      note: apiCommentaire.note || 0,
      commentaire: apiCommentaire.contenu,
      date: apiCommentaire.createdAt,
      likes: 0,
      is_helpful: false,
    };
  };

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
  const fetchDonsRecents = useCallback(async () => {
    try {
      setLoadingRecents(true);

      const response = await api.get<any[]>(API_ENDPOINTS.DONS.PUBLISHED);

      if (response && Array.isArray(response)) {
        // Filtrer pour ne pas inclure le don courant
        const filtered = response.filter((item) => item.uuid !== uuid);
        // Mélanger et prendre les 4 premiers
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        const transformed = selected.map((item: any) => ({
          uuid:
            item.uuid || `recent-${Math.random().toString(36).substr(2, 9)}`,
          nom: item.nom || "Don récent",
          type_don: item.type_don || "objet",
          description: item.description || "",
          prix: item.prix || null,
          image: normalizeImageUrl(item.image, item.image_key),
          localisation: item.localisation || "",
          statut: item.statut || "disponible",
          disponible: item.disponible || true,
          quantite: item.quantite || 1,
          note_moyenne: item.note_moyenne || 0,
          nombre_avis: item.nombre_avis || 0,
          ...(item.createur && {
            createur: transformCreateurInfo(item.createur),
          }),
        }));

        setDonsRecents(transformed);
      }
    } catch (err) {
      console.warn("Erreur chargement dons récents:", err);
      setDonsRecents([]);
    } finally {
      setLoadingRecents(false);
    }
  }, [uuid]);

  const fetchCommentaires = useCallback(
    async (donUuid: string) => {
      if (!donUuid || commentairesFetched) return;

      try {
        setLoadingComments(true);

        const response = await api.get<CommentairesResponse>(
          API_ENDPOINTS.COMMENTAIRES.FIND_COMMENTS_DON_BY_UUID(donUuid),
        );

        if (response && response.commentaires) {
          const commentairesData = response.commentaires.map(
            transformCommentaireData,
          );

          commentairesData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          setCommentaires(commentairesData);

          const safeNoteMoyenne = response.stats?.noteMoyenne || 0;
          const safeDistributionNotes = response.stats?.distributionNotes || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };

          setCommentairesStats({
            nombreCommentaires: response.stats?.nombreCommentaires || 0,
            nombreNotes: response.stats?.nombreNotes || 0,
            noteMoyenne: safeNoteMoyenne,
            distributionNotes: safeDistributionNotes,
          });
          setCommentairesFetched(true);
        }
      } catch (err: any) {
        console.warn("Erreur chargement commentaires API:", err);
        const donNoteMoyenne = getSafeNoteMoyenne(don);

        setCommentairesStats({
          nombreCommentaires: 0,
          nombreNotes: 0,
          noteMoyenne: donNoteMoyenne,
          distributionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setCommentaires([]);
        setCommentairesFetched(true);
      } finally {
        setLoadingComments(false);
      }
    },
    [don, commentairesFetched],
  );

  const fetchDonDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<DonResponse>(
        API_ENDPOINTS.DONS.RANDOM_DETAIL(uuid),
      );

      if (!response || !response.don) {
        throw new Error("Don non trouvé");
      }

      const donData = transformDonData(response.don);
      const similairesData = response.similaires.map(transformDonSimilaireData);

      setDon(donData);
      setDonsSimilaires(similairesData);
      setFavori(response.don.is_favoris || false);

      // Gestion du créateur
      if (response.don.createur) {
        const createurData = transformCreateurInfo(response.don.createur);
        createurData.userType = response.don.createurType || "utilisateur";
        setCreateur(createurData);
      }

      // Gestion des images - Générer plusieurs images à partir des dons similaires et récents
      const imageUrls: string[] = [donData.image];

      // Ajouter des images des dons similaires
      response.similaires.slice(0, 4).forEach((similaire) => {
        const imgUrl = normalizeImageUrl(similaire.image, similaire.image_key);
        if (imgUrl && !imageUrls.includes(imgUrl)) {
          imageUrls.push(imgUrl);
        }
      });

      // Si pas assez d'images, ajouter des placeholders
      while (imageUrls.length < 5) {
        imageUrls.push(getDefaultDonImage());
      }

      setImages(imageUrls.slice(0, 5));
      setImagePrincipale(imageUrls[0]);

      // Charger les commentaires
      fetchCommentaires(donData.uuid);

      // Charger les dons récents
      fetchDonsRecents();
    } catch (err: any) {
      console.error("Erreur détail don:", err);

      if (err.response?.status === 404 || err.message.includes("non trouvé")) {
        setError("Ce don n'existe pas ou a été supprimé.");
      } else if (err.response?.status === 401) {
        setError("Vous devez être connecté pour voir ce don.");
      } else if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation de voir ce don.");
      } else {
        setError(
          "Impossible de charger les détails du don. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [uuid, fetchCommentaires, fetchDonsRecents]);

  useEffect(() => {
    if (uuid && loading && !don) {
      fetchDonDetails();
    }
  }, [uuid, fetchDonDetails, loading, don]);

  // ============================================
  // FONCTIONS D'AFFICHAGE
  // ============================================
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "Gratuit";
    }
    if (price === 0) {
      return "Gratuit";
    }
    return price.toLocaleString("fr-FR") + " FCFA";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date inconnue";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Aujourd'hui";
      } else if (diffDays === 1) {
        return "Hier";
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

    const message = `Bonjour ${createur.prenoms}, je suis intéressé(e) par votre don "${don?.nom}" sur OSKAR. Pourrions-nous discuter ?`;
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
      `Donateur: ${createur.prenoms} ${createur.nom}\n` +
      `Téléphone: ${createur.telephone || "Non disponible"}\n` +
      `Email: ${createur.email || "Non disponible"}`;

    navigator.clipboard
      .writeText(contactInfo)
      .then(() => {
        alert("Informations de contact copiées dans le presse-papier !");
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
        alert("Impossible de copier les informations.");
      });
  };

  const handleContactDonateur = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!createur) {
      alert("Informations du donateur non disponibles");
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
      sujet: `Question concernant votre don: ${don?.nom}`,
      donUuid: don?.uuid || "",
    });

    router.push(`${dashboardPath}/messages?${params.toString()}`);
  };

  const handleAddToFavorites = async () => {
    if (!don) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      if (favori) {
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(don.uuid));
        setFavori(false);
        alert("Don retiré des favoris");
      } else {
        await api.post(API_ENDPOINTS.DONS.AJOUT_DON_FAVORIS(don.uuid), {});
        setFavori(true);
        alert("Don ajouté aux favoris");
      }
    } catch (err: any) {
      console.error("Erreur mise à jour favoris:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        openLoginModal();
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleShare = (platform: string) => {
    if (!don) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez ce don sur OSKAR : ${don.nom}`;

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
        alert("Lien copié dans le presse-papier !");
        setShowShareMenu(false);
      })
      .catch((err) => {
        console.error("Erreur copie lien:", err);
        alert("Impossible de copier le lien.");
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
    } catch (err) {
      console.error("Erreur lors du like:", err);
      setCommentaires((prev) =>
        prev.map((comment) =>
          comment.uuid === commentUuid
            ? { ...comment, likes: comment.likes + 1 }
            : comment,
        ),
      );
    }
  };

  const handleReportComment = async (commentUuid: string) => {
    if (window.confirm("Signaler ce commentaire comme inapproprié ?")) {
      try {
        await api.post(API_ENDPOINTS.COMMENTAIRES.REPORT(commentUuid), {});
        alert("Commentaire signalé. Notre équipe le vérifiera sous 24h.");
      } catch (err) {
        console.error("Erreur signalement:", err);
        alert("Une erreur est survenue lors du signalement.");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!don) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!newReview.commentaire.trim()) {
      alert("Veuillez saisir un commentaire.");
      return;
    }

    setSubmittingReview(true);

    try {
      await api.post<{ commentaire: CommentaireAPI }>(
        API_ENDPOINTS.COMMENTAIRES.CREATE,
        {
          contenu: newReview.commentaire,
          donUuid: don.uuid,
          note: newReview.note,
        },
      );

      await fetchCommentaires(don.uuid);

      setNewReview({
        note: 5,
        commentaire: "",
      });
      setShowAddReview(false);

      alert(
        "Votre avis a été ajouté avec succès ! Merci pour votre contribution.",
      );

      await fetchDonDetails();
    } catch (err: any) {
      console.error("Erreur ajout avis:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        openLoginModal();
      } else {
        alert(
          "Une erreur est survenue lors de l'ajout de votre avis. Veuillez réessayer.",
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVisitUtilisateur = () => {
    if (createur) {
      router.push(`/utilisateurs/${createur.uuid}`);
    }
  };

  const handleInterest = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    handleContactDonateur();
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

  if (error || !don) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body py-5">
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={faGift}
                      className="fa-4x text-muted"
                    />
                  </div>
                  <h1 className="h3 mb-3">Don introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Ce don n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link
                      href="/dons"
                      className="btn btn-outline-primary rounded-pill px-4"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Retour aux dons
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

  const condition = getConditionBadge(don.statut);
  const visibleComments = showMoreComments
    ? commentaires
    : commentaires.slice(0, 3);

  // Déterminer les dons à afficher dans la section "Dons Similaires"
  const donsAShow =
    donsSimilaires.length > 0
      ? donsSimilaires.slice(0, 4)
      : donsRecents.slice(0, 4);

  return (
    <div className="bg-light min-vh-100">
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
                <Link href="/dons" className="text-decoration-none text-muted">
                  <FontAwesomeIcon icon={faGift} className="me-1" />
                  Dons
                </Link>
              </li>
              {don.categorie && (
                <li className="breadcrumb-item">
                  <Link
                    href={`/categories/${don.categorie.slug}`}
                    className="text-decoration-none text-muted"
                  >
                    {don.categorie.libelle}
                  </Link>
                </li>
              )}
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {don.nom}
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
                  alt={don.nom}
                  fallbackSrc={getDefaultDonImage()}
                  className="w-100 h-100 object-cover"
                />
                <button
                  onClick={handleAddToFavorites}
                  className="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-3 shadow-lg hover-bg-warning hover-text-white transition-all"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i
                    className={`fa-${favori ? "solid" : "regular"} fa-heart`}
                  />
                </button>
                <div className="position-absolute top-0 start-0 m-3 bg-purple text-white px-4 py-2 rounded-pill fw-semibold d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faGift} />
                  <span>don</span>
                </div>
                {don.prix === null && (
                  <div
                    className="position-absolute top-0 start-0 m-3 bg-success text-white px-4 py-2 rounded-pill fw-semibold d-flex align-items-center gap-2"
                    style={{ marginLeft: "100px" }}
                  >
                    <FontAwesomeIcon icon={faHandHoldingHeart} />
                    <span>gratuit</span>
                  </div>
                )}
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
                        alt={`${don.nom} - vue ${index + 1}`}
                        fallbackSrc={getDefaultDonImage()}
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
                {don.description ? (
                  <p>{don.description}</p>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour ce don.
                  </p>
                )}
              </div>
            </div>

            {/* Détails du don */}
            <div className="card border-0 shadow-lg rounded-4 p-5 mt-8">
              <h2 className="h2 fw-bold mb-4">Détails du don</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Type de don</span>
                    <span className="fw-semibold">{don.type_don}</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Quantité</span>
                    <span className="fw-semibold">{don.quantite} unité(s)</span>
                  </div>
                  {don.categorie && (
                    <div className="border-bottom py-3 d-flex justify-content-between">
                      <span className="text-muted">Catégorie</span>
                      <span className="fw-semibold">
                        {don.categorie.libelle}
                      </span>
                    </div>
                  )}
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Note moyenne</span>
                    <span className="fw-semibold">
                      {safeToFixed(don.note_moyenne)}/5
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Localisation</span>
                    <span className="fw-semibold">{don.localisation}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Date de début</span>
                    <span className="fw-semibold">
                      {formatDate(don.date_debut)}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Date de fin</span>
                    <span className="fw-semibold">
                      {formatDate(don.date_fin)}
                    </span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Lieu de retrait</span>
                    <span className="fw-semibold">{don.lieu_retrait}</span>
                  </div>
                  <div className="border-bottom py-3 d-flex justify-content-between">
                    <span className="text-muted">Numéro</span>
                    <span className="fw-semibold text-purple">
                      {don.numero}
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
              <h2 className="h2 fw-bold mb-4">Localisation</h2>
              <div className="mb-4">
                <div className="d-flex gap-3 mb-4">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-warning fs-4 mt-1"
                  />
                  <div>
                    <p className="fw-semibold h5 mb-1">{don.localisation}</p>
                    <p className="text-muted">
                      Lieu de retrait : {don.lieu_retrait}
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

            {/* Avis et évaluations */}
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

                  {/* Formulaire d'ajout d'avis */}
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
                            placeholder="Partagez votre expérience avec ce don..."
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

                  {/* Liste des commentaires */}
                  {commentaires.length > 0 ? (
                    <div className="space-y-6">
                      {visibleComments.map((comment) => (
                        <div
                          key={comment.uuid}
                          className="border-bottom pb-4 mb-4"
                        >
                          <div className="d-flex gap-4">
                            <SecureImage
                              src={comment.utilisateur_photo}
                              alt={comment.utilisateur_nom}
                              fallbackSrc={getDefaultAvatarUrl()}
                              className="rounded-circle"
                              style={{
                                width: "48px",
                                height: "48px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <p className="fw-bold mb-1">
                                    {comment.utilisateur_nom}
                                  </p>
                                  <div className="mb-2 text-warning">
                                    {renderRatingStars(comment.note)}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {formatDate(comment.date)}
                                </small>
                              </div>
                              <p className="text-muted mb-3">
                                {comment.commentaire}
                              </p>
                              <div className="d-flex gap-4">
                                <button
                                  className="btn btn-link text-muted p-0 text-decoration-none hover-text-warning"
                                  onClick={() =>
                                    handleLikeComment(comment.uuid)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faThumbsUp}
                                    className="me-1"
                                  />
                                  Utile ({comment.likes})
                                </button>
                                <button
                                  className="btn btn-link text-muted p-0 text-decoration-none hover-text-warning"
                                  onClick={() =>
                                    handleReportComment(comment.uuid)
                                  }
                                >
                                  Signaler
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
                        Soyez le premier à donner votre avis sur ce don.
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

            {/* Dons Similaires */}
            {donsAShow.length > 0 && (
              <div
                id="similar-items-section"
                className="card border-0 shadow-lg rounded-4 p-5 mt-8"
              >
                <h2 className="h2 fw-bold text-dark mb-4">
                  Dons Similaires que Vous Pourriez Aimer
                </h2>
                <div className="row g-4">
                  {donsAShow.map((item) => (
                    <div key={item.uuid} className="col-md-6">
                      <Link
                        href={`/dons/${item.uuid}`}
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
                                  alt={item.nom}
                                  fallbackSrc={getDefaultDonImage()}
                                  className="w-100 h-100 object-cover rounded-start"
                                />
                                <div className="position-absolute top-0 start-0 m-1 bg-purple text-white px-2 py-1 rounded-pill small">
                                  <FontAwesomeIcon
                                    icon={faGift}
                                    className="me-1"
                                  />
                                  <span>don</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-8">
                              <div className="card-body p-3">
                                <h6 className="fw-bold text-dark mb-2 text-truncate">
                                  {item.nom}
                                </h6>
                                <p className="fw-bold text-warning mb-2">
                                  {item.prix === null
                                    ? "Gratuit"
                                    : formatPrice(item.prix)}
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
                                    {item.note_moyenne * 10 || 0}
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
                  <span className="display-6 fw-bold text-success">
                    {don.prix === null
                      ? "Gratuit"
                      : formatPrice(don.prix).replace("FCFA", "")}
                  </span>
                  {don.prix !== null && don.prix > 0 && (
                    <span className="text-muted">FCFA</span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                    Don {don.type_don}
                  </span>
                  <span className="small text-muted">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    Publié {formatDate(don.createdAt)}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-3 mb-4">
                <button
                  onClick={handleInterest}
                  className="btn btn-success btn-lg fw-bold text-white py-4"
                  disabled={!don.disponible}
                >
                  <FontAwesomeIcon icon={faHandHoldingHeart} className="me-2" />
                  {don.disponible ? "Je suis intéressé(e)" : "Non disponible"}
                </button>
                <button
                  onClick={handleContactWhatsApp}
                  className="btn btn-success btn-lg fw-bold py-4"
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
                  disabled={!createur?.telephone && !createur?.whatsapp_url}
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="me-2" />
                  WhatsApp
                </button>
                <button
                  onClick={handleContactDonateur}
                  className="btn btn-outline-success btn-lg fw-bold py-4"
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
                    icon={faHeart}
                    className={`me-2 ${favori ? "text-danger" : ""}`}
                  />
                  {favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                </button>
              </div>

              {/* Informations du donateur */}
              {createur && (
                <div className="bg-info bg-opacity-10 rounded-4 p-4 mb-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-success rounded-circle p-3">
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="text-white"
                      />
                    </div>
                    <div>
                      <p className="fw-semibold mb-1 small">Donateur vérifié</p>
                      <p className="text-muted small mb-0">
                        Identité vérifiée par OSKAR
                      </p>
                    </div>
                  </div>

                  {/* Avatar du donateur avec redirection */}
                  <div className="d-flex align-items-center gap-3 mt-3">
                    {createur.avatar ? (
                      <SecureImage
                        src={createur.avatar}
                        alt={`${createur.prenoms} ${createur.nom}`}
                        fallbackSrc={getDefaultAvatarUrl()}
                        className="rounded-3"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                        onClick={handleVisitUtilisateur}
                      />
                    ) : (
                      <div
                        className="bg-white rounded-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "60px",
                          height: "60px",
                          cursor: "pointer",
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
                      <p className="fw-semibold mb-1 small">
                        <Link
                          href={`/utilisateurs/${createur.uuid}`}
                          className="text-decoration-none text-dark"
                        >
                          {createur.prenoms} {createur.nom}
                        </Link>
                      </p>
                      <p className="text-muted small mb-0">
                        {createur.userType === "utilisateur"
                          ? "Utilisateur"
                          : "Vendeur"}
                      </p>
                    </div>
                  </div>

                  {createur.est_verifie && (
                    <div className="d-flex align-items-center mt-3 text-success">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                      <span className="small">Donateur vérifié</span>
                    </div>
                  )}

                  {/* Informations du donateur */}
                  <div className="border-top mt-3 pt-3">
                    <p className="fw-semibold small mb-2">Contact donateur</p>
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
                </div>
              )}

              {/* Informations don */}
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">ID du don</span>
                  <span className="fw-semibold">
                    #OSK-{don.uuid.substring(0, 5).toUpperCase()}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Vues</span>
                  <span className="fw-semibold">
                    {don.note_moyenne * 100 + 500 || 0}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Catégorie</span>
                  <span className="fw-semibold">
                    {don.categorie?.libelle || "Non catégorisé"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Disponibilité</span>
                  <span
                    className={`fw-semibold ${don.disponible ? "text-success" : "text-danger"}`}
                  >
                    {don.disponible ? "Disponible" : "Non disponible"}
                  </span>
                </div>
              </div>

              {/* Bouton signaler */}
              <div className="border-top mt-4 pt-4">
                <button className="btn btn-link text-danger w-100 py-2 text-decoration-none">
                  <FontAwesomeIcon icon={faFlag} className="me-2" />
                  Signaler ce don
                </button>
              </div>
            </div>

            {/* Carte donateur détaillée */}
            {createur && (
              <div className="card border-0 shadow-lg rounded-4 p-4 mt-4">
                <h5 className="fw-bold mb-4">Informations sur le donateur</h5>
                <div className="d-flex align-items-center gap-3 mb-4">
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
                  <div>
                    <p className="fw-bold mb-1">
                      {createur.prenoms} {createur.nom}
                    </p>
                    <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                      {renderStars(don.note_moyenne)}
                      <span className="text-muted ms-1">
                        ({don.note_moyenne.toFixed(1)})
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
                    <span className="text-muted">Dons actifs</span>
                    <span className="fw-semibold">
                      {createur.nombre_annonces || donsSimilaires.length}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Dons réalisés</span>
                    <span className="fw-semibold">
                      {createur.nombre_ventes || don.nombre_avis}
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
                  className="btn btn-outline-success w-100 py-3 fw-semibold"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Voir tous les dons du donateur
                </button>
              </div>
            )}

            {/* Retrait */}
            <div className="card border-0 shadow-lg rounded-4 p-4 mt-4 border-success">
              <h5 className="fw-bold mb-4">
                <FontAwesomeIcon
                  icon={faShippingFast}
                  className="me-2 text-success"
                />
                Retrait
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success me-2"
                  />
                  Retrait sur place
                </li>
                <li className="mb-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success me-2"
                  />
                  Horaires à convenir
                </li>
                <li className="mb-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success me-2"
                  />
                  Vérification de l'article
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success me-2"
                  />
                  Aucun paiement
                </li>
              </ul>
              <div className="mt-3">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                  {don.lieu_retrait}
                </small>
              </div>
            </div>

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
                  <span>Inspectez l'article avant de l'accepter</span>
                </li>
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Ne payez jamais pour un don</span>
                </li>
                <li className="mb-2 d-flex gap-2">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-success mt-1"
                  />
                  <span>Vérifiez l'identité du donateur</span>
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

      {/* Section dons récents */}
      {donsRecents.length > 0 && (
        <section className="bg-white py-5 mt-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 fw-bold">Dons Récents</h2>
              <Link
                href="/dons"
                className="text-warning text-decoration-none fw-semibold"
              >
                Voir Tout
              </Link>
            </div>
            <div className="row g-4">
              {donsRecents.slice(0, 4).map((item) => (
                <div key={item.uuid} className="col-md-3">
                  <Link
                    href={`/dons/${item.uuid}`}
                    className="text-decoration-none"
                  >
                    <div className="card border-0 shadow h-100 hover-border-warning transition-all cursor-pointer">
                      <div
                        className="position-relative"
                        style={{ height: "200px" }}
                      >
                        <SecureImage
                          src={item.image}
                          alt={item.nom}
                          fallbackSrc={getDefaultDonImage()}
                          className="w-100 h-100 object-cover"
                        />
                        <div className="position-absolute top-0 start-0 m-2 bg-purple text-white px-2 py-1 rounded-pill small">
                          <FontAwesomeIcon icon={faGift} className="me-1" />
                          <span>don</span>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h6 className="fw-bold text-dark mb-2 text-truncate">
                          {item.nom}
                        </h6>
                        <p className="fw-bold text-success mb-2">
                          {item.prix === null
                            ? "Gratuit"
                            : formatPrice(item.prix)}
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
                                alt={item.createur?.prenoms || "Donateur"}
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
                              {item.createur?.prenoms || "Donateur"}
                            </span>
                          </div>
                          <span className="btn btn-success text-white btn-sm px-3">
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
              <h6 className="fw-bold mb-2">Dons Sécurisés</h6>
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
              <h6 className="fw-bold mb-2">Donateurs Vérifiés</h6>
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
                  backgroundColor: "#9c27b0",
                }}
              >
                <FontAwesomeIcon icon={faUsers} className="text-white fa-2x" />
              </div>
              <h6 className="fw-bold mb-2">Communauté Solidaire</h6>
              <p className="small text-muted">Entraide entre voisins</p>
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

      {/* CTA - Fond vert */}
      <section className="bg-success text-white py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-3">
            Vous avez quelque chose à donner ?
          </h2>
          <p className="lead mb-4">
            Rejoignez des milliers de donateurs et partagez avec votre
            communauté
          </p>
          <Link
            href="/publication-annonce?type=don"
            className="btn btn-light btn-lg px-5 py-4 fw-bold text-success"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Publiez votre don maintenant
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
          background-color: #9c27b0 !important;
        }
        .text-purple {
          color: #9c27b0 !important;
        }
        .border-purple {
          border-color: #9c27b0 !important;
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
      `}</style>
    </div>
  );
}
