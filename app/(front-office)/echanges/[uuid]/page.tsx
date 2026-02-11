// app/echanges/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";

// Import des icônes FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faFacebook,
  faFacebookF,
  faWhatsapp as faWhatsappBrand,
} from "@fortawesome/free-brands-svg-icons";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMessage,
  faCommentDots,
  faShareAlt,
  faCertificate,
  faStar,
  faHeart,
  faExchangeAlt,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faImages,
  faChevronUp,
  faChevronDown,
  faCopy,
  faPaperPlane,
  faEye,
  faEyeSlash,
  faHome,
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faThLarge,
  faCheck,
  faCommentSlash,
  faTimes,
  faHistory,
  faShieldAlt,
  faEdit,
  faUserCircle,
  faIdCard,
  faExternalLinkAlt,
  faLock,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faExclamationCircle,
  faSpinner,
  faSignInAlt,
  faExclamationTriangle,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

// Types basés sur votre API
interface EchangeAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string | number;
  image: string | null;
  image_key: string | null;
  typeDestinataire: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  numero: string;
  disponible: boolean;
  quantite: number;
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
  repartition_notes: any | null;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  agent_uuid: string | null;
  createur?: {
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
  };
  createurType?: string;
  destinataire?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    avatar: string | null;
  };
  destinataireType?: string;
}

interface EchangeSimilaireAPI {
  is_deleted: boolean;
  deleted_at: string | null;
  id: number;
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string | number;
  image: string | null;
  image_key: string | null;
  typeDestinataire: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
}

interface EchangeResponse {
  echange: EchangeAPI;
  similaires: EchangeSimilaireAPI[];
}

// Types pour notre composant
interface Echange {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: number;
  image: string;
  image_key?: string | null;
  typeDestinataire: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  numero: string;
  disponible: boolean;
  quantite: number;
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  agent_uuid: string | null;
  createur?: {
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
  };
  createurType?: string;
  destinataire?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone: string;
    avatar: string | null;
  };
  destinataireType?: string;
}

interface EchangeSimilaire {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: number;
  image: string;
  typeDestinataire: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  statut: string;
  disponible: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
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
}

// Interface pour le message à envoyer
interface MessageData {
  destinataireEmail: string;
  destinataireUuid?: string;
  destinataireNom: string;
  sujet: string;
  contenu: string;
  type: string;
  entiteType?: string;
  entiteUuid?: string;
}

export default function EchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  // Utiliser le contexte d'authentification
  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [echange, setEchange] = useState<Echange | null>(null);
  const [createur, setCreateur] = useState<CreateurInfo | null>(null);
  const [echangesSimilaires, setEchangesSimilaires] = useState<
    EchangeSimilaire[]
  >([]);
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
  const [error, setError] = useState<string | null>(null);
  const [favori, setFavori] = useState(false);
  const [showMoreComments, setShowMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentairesFetched, setCommentairesFetched] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    note: 5,
    commentaire: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // URL d'avatar par défaut
  const getDefaultAvatarUrl = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-avatar.png`;
  };

  // URL d'image par défaut pour les échanges
  const getDefaultEchangeImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-echange.png`;
  };

  // Normaliser les URLs d'images
  const normalizeImageUrl = (url: string | null): string => {
    if (!url) return getDefaultEchangeImage();

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    if (url.startsWith("/api/files/")) {
      const cleanUrl = url.replace("/api/files/", "");
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/api/files/${cleanUrl}`;
    }

    if (url.includes("oskar-bucket")) {
      return url;
    }

    if (url.includes("/")) {
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${url.startsWith("/") ? url : "/" + url}`;
    }

    return getDefaultEchangeImage();
  };

  // Fonction sécurisée pour formater les nombres
  const safeToFixed = (
    value: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(decimals);
  };

  // Fonction sécurisée pour obtenir la note moyenne
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

  // Transformer les données API
  const transformEchangeData = (apiEchange: EchangeAPI): Echange => {
    const safeNoteMoyenne =
      apiEchange.note_moyenne !== null && !isNaN(apiEchange.note_moyenne)
        ? apiEchange.note_moyenne
        : 0;

    return {
      uuid: apiEchange.uuid,
      nomElementEchange: apiEchange.nomElementEchange,
      nom_initiateur: apiEchange.nom_initiateur,
      prix:
        typeof apiEchange.prix === "string"
          ? parseFloat(apiEchange.prix) || 0
          : apiEchange.prix || 0,
      image: normalizeImageUrl(apiEchange.image),
      image_key: apiEchange.image_key,
      typeDestinataire: apiEchange.typeDestinataire,
      typeEchange: apiEchange.typeEchange,
      objetPropose: apiEchange.objetPropose,
      objetDemande: apiEchange.objetDemande,
      statut: apiEchange.statut,
      message: apiEchange.message,
      dateProposition: apiEchange.dateProposition,
      dateAcceptation: apiEchange.dateAcceptation,
      numero: apiEchange.numero,
      disponible: apiEchange.disponible,
      quantite: apiEchange.quantite || 1,
      createdAt: apiEchange.createdAt,
      updatedAt: apiEchange.updatedAt,
      note_moyenne: safeNoteMoyenne,
      nombre_avis: apiEchange.nombre_avis || 0,
      nombre_favoris: apiEchange.nombre_favoris || 0,
      est_favoris: apiEchange.est_favoris || false,
      vendeur_uuid: apiEchange.vendeur_uuid,
      utilisateur_uuid: apiEchange.utilisateur_uuid,
      agent_uuid: apiEchange.agent_uuid,
      createur: apiEchange.createur
        ? {
            uuid: apiEchange.createur.uuid,
            nom: apiEchange.createur.nom,
            prenoms: apiEchange.createur.prenoms,
            email: apiEchange.createur.email,
            telephone: apiEchange.createur.telephone,
            avatar: apiEchange.createur.avatar
              ? normalizeImageUrl(apiEchange.createur.avatar)
              : null,
            facebook_url: apiEchange.createur.facebook_url,
            whatsapp_url: apiEchange.createur.whatsapp_url,
            twitter_url: apiEchange.createur.twitter_url,
            instagram_url: apiEchange.createur.instagram_url,
            est_verifie: apiEchange.createur.est_verifie,
            est_bloque: apiEchange.createur.est_bloque,
          }
        : undefined,
      createurType: apiEchange.createurType,
      destinataire: apiEchange.destinataire,
      destinataireType: apiEchange.destinataireType,
    };
  };

  const transformEchangeSimilaireData = (
    apiSimilaire: EchangeSimilaireAPI,
  ): EchangeSimilaire => {
    return {
      uuid: apiSimilaire.uuid,
      nomElementEchange: apiSimilaire.nomElementEchange,
      nom_initiateur: apiSimilaire.nom_initiateur,
      prix:
        typeof apiSimilaire.prix === "string"
          ? parseFloat(apiSimilaire.prix) || 0
          : apiSimilaire.prix || 0,
      image: normalizeImageUrl(apiSimilaire.image),
      typeDestinataire: apiSimilaire.typeDestinataire,
      typeEchange: apiSimilaire.typeEchange,
      objetPropose: apiSimilaire.objetPropose,
      objetDemande: apiSimilaire.objetDemande,
      statut: apiSimilaire.statut,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite || 1,
      note_moyenne: apiSimilaire.note_moyenne || 0,
      nombre_avis: apiSimilaire.nombre_avis || 0,
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

  // Charger les informations du créateur
  const fetchCreateurInfo = useCallback(async (echangeData: Echange) => {
    if (!echangeData) return;

    try {
      let createurData: CreateurInfo | null = null;

      // Si l'API nous a déjà fourni les infos du créateur
      if (echangeData.createur) {
        createurData = {
          uuid: echangeData.createur.uuid,
          nom: echangeData.createur.nom || "",
          prenoms: echangeData.createur.prenoms || "",
          email: echangeData.createur.email || "",
          telephone: echangeData.createur.telephone || echangeData.numero || "",
          avatar: echangeData.createur.avatar
            ? normalizeImageUrl(echangeData.createur.avatar)
            : null,
          facebook_url: echangeData.createur.facebook_url || null,
          whatsapp_url: echangeData.createur.whatsapp_url || null,
          twitter_url: echangeData.createur.twitter_url || null,
          instagram_url: echangeData.createur.instagram_url || null,
          est_verifie: echangeData.createur.est_verifie || false,
          est_bloque: echangeData.createur.est_bloque || false,
          userType: echangeData.createurType || "utilisateur",
        };
      } else {
        // Sinon, on tente de charger les infos selon le type de créateur
        const userType = echangeData.createurType || "utilisateur";
        const userId =
          echangeData.utilisateur_uuid ||
          echangeData.vendeur_uuid ||
          echangeData.agent_uuid;

        if (userId) {
          let endpoint = "";
          if (userType === "vendeur") {
            endpoint = API_ENDPOINTS.AUTH.VENDEUR.DETAIL(userId);
          } else if (userType === "agent") {
            endpoint = API_ENDPOINTS.ADMIN.AGENTS.DETAIL(userId);
          } else {
            endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.DETAIL(userId);
          }

          try {
            const response = await api.get<any>(endpoint);
            if (response && response.data) {
              const userData = response.data;
              createurData = {
                uuid: userData.uuid || userId,
                nom: userData.nom || "",
                prenoms: userData.prenoms || "",
                email: userData.email || "",
                telephone: userData.telephone || echangeData.numero || "",
                avatar: userData.avatar
                  ? normalizeImageUrl(userData.avatar)
                  : null,
                facebook_url: userData.facebook_url || null,
                whatsapp_url: userData.whatsapp_url || null,
                twitter_url: userData.twitter_url || null,
                instagram_url: userData.instagram_url || null,
                est_verifie: userData.est_verifie || false,
                est_bloque: userData.est_bloque || false,
                userType: userType,
              };
            }
          } catch (err) {
            console.warn("Erreur chargement info créateur:", err);
          }
        }
      }

      // Si on n'a pas réussi à charger les infos, on crée des données par défaut
      if (!createurData) {
        createurData = {
          uuid:
            echangeData.utilisateur_uuid ||
            echangeData.vendeur_uuid ||
            echangeData.agent_uuid ||
            "system",
          nom: echangeData.nom_initiateur?.split(" ")[0] || "Créateur",
          prenoms:
            echangeData.nom_initiateur?.split(" ").slice(1).join(" ") ||
            "OSKAR",
          email: "",
          telephone: echangeData.numero || "+225 XX XX XX XX",
          avatar: null,
          facebook_url: null,
          whatsapp_url: null,
          twitter_url: null,
          instagram_url: null,
          est_verifie: true,
          est_bloque: false,
          userType: echangeData.createurType || "utilisateur",
        };
      }

      setCreateur(createurData);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des informations du créateur:",
        err,
      );
      setCreateur({
        uuid: "unknown",
        nom: "Créateur",
        prenoms: "OSKAR",
        email: "",
        telephone: "",
        avatar: null,
        userType: echangeData.createurType || "utilisateur",
      });
    }
  }, []);

  // Charger les commentaires
  const fetchCommentaires = useCallback(
    async (echangeUuid: string) => {
      if (!echangeUuid || commentairesFetched) return;

      try {
        setLoadingComments(true);
        const response = await api.get<CommentairesResponse>(
          API_ENDPOINTS.COMMENTAIRES.FIND_COMMENTS_ECHANGE_BY_UUID(echangeUuid),
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
    [echange, commentairesFetched],
  );

  // Charger les données de l'échange
  const fetchEchangeDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      // Charger l'échange
      const response = await api.get<EchangeResponse>(
        API_ENDPOINTS.ECHANGES.RANDOM_DETAIL(uuid),
      );

      if (!response || !response.echange) {
        throw new Error("Échange non trouvé");
      }

      // Transformer les données
      const echangeData = transformEchangeData(response.echange);
      const similairesData = response.similaires.map(
        transformEchangeSimilaireData,
      );

      setEchange(echangeData);
      setEchangesSimilaires(similairesData);
      setFavori(response.echange.est_favoris || false);

      // Préparer les images
      const imageUrls: string[] = [];
      const mainImage = echangeData.image;
      imageUrls.push(mainImage);
      setImagePrincipale(mainImage);

      similairesData.slice(0, 4).forEach((similaire) => {
        if (similaire.image && !imageUrls.includes(similaire.image)) {
          imageUrls.push(similaire.image);
        }
      });

      // Remplir avec des images par défaut si nécessaire
      while (imageUrls.length < 4) {
        imageUrls.push(getDefaultEchangeImage());
      }

      setImages(imageUrls);

      // Charger les infos du créateur
      await fetchCreateurInfo(echangeData);

      // Charger les commentaires
      fetchCommentaires(echangeData.uuid);
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
  }, [uuid, fetchCommentaires, fetchCreateurInfo]);

  useEffect(() => {
    if (uuid && loading && !echange) {
      fetchEchangeDetails();
    }
  }, [uuid, fetchEchangeDetails, loading, echange]);

  // Fonctions utilitaires
  const formatPrice = (price: number) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "Valeur estimée";
    }
    return price.toLocaleString("fr-FR") + " FCFA";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
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
      return dateString;
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

  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "en_attente":
        return "En attente";
      case "accepte":
        return "Accepté";
      case "refuse":
        return "Refusé";
      case "termine":
        return "Terminé";
      case "publie":
        return "Publié";
      default:
        return statut;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "en_attente":
        return "warning";
      case "accepte":
      case "publie":
        return "success";
      case "refuse":
        return "danger";
      case "termine":
        return "secondary";
      default:
        return "info";
    }
  };

  // Calculer les statistiques des notes
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

  // Fonctions pour le contact via réseaux sociaux
  const handleContactWhatsApp = () => {
    if (!createur) return;

    let phoneNumber = createur.telephone || createur.whatsapp_url || "";

    // Nettoyer le numéro de téléphone
    phoneNumber = phoneNumber.replace(/\D/g, "");

    // Si c'est un numéro ivoirien (commence par 225), retirer le préfixe pour WhatsApp
    if (phoneNumber.startsWith("225")) {
      phoneNumber = phoneNumber.substring(3);
    }

    // Ajouter l'indicateur de pays pour la Côte d'Ivoire
    if (phoneNumber && !phoneNumber.startsWith("+")) {
      phoneNumber = `+225${phoneNumber}`;
    }

    const message = `Bonjour ${createur.prenoms}, je suis intéressé(e) par votre échange "${echange?.nomElementEchange}" sur OSKAR. Pourrions-nous discuter ?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleContactFacebook = () => {
    if (!createur) return;

    if (createur.facebook_url) {
      window.open(createur.facebook_url, "_blank", "noopener,noreferrer");
    } else {
      // Si pas de lien Facebook direct, ouvrir la recherche
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
      `Créateur de l'échange: ${createur.prenoms} ${createur.nom}\n` +
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

  // Fonction pour ouvrir la messagerie interne
  // Remplacer la fonction handleOpenMessagerie par ceci :
  const handleOpenMessagerie = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!createur) {
      alert("Impossible de contacter le créateur. Informations manquantes.");
      return;
    }

    try {
      // Préparer les données du message SIMPLIFIÉES
      // Le backend a besoin d'un format spécifique
      const messageData = {
        destinataireEmail: createur.email || "",
        sujet: echange
          ? `Question sur votre échange: ${echange.nomElementEchange}`
          : "Question sur votre échange",
        contenu: `Bonjour ${createur.prenoms},\n\nJe vous contacte concernant votre échange "${echange?.nomElementEchange}".\n\nPourriez-vous m'en dire plus ?`,
      };

      console.log("📤 Envoi message simplifié:", messageData);

      // Essayer d'envoyer le message
      await api.post(API_ENDPOINTS.MESSAGERIE.SEND, messageData);

      // Si l'envoi réussit, rediriger vers la messagerie
      let messagerieUrl = "/messages";

      if (user?.type === "admin") {
        messagerieUrl = "/dashboard-admin/messages";
      } else if (user?.type === "agent") {
        messagerieUrl = "/dashboard-agent/messages";
      } else if (user?.type === "vendeur") {
        messagerieUrl = "/dashboard-vendeur/messages";
      } else if (user?.type === "utilisateur") {
        messagerieUrl = "/dashboard-utilisateur/messages";
      }

      // Rediriger vers la messagerie
      router.push(messagerieUrl);
    } catch (err: any) {
      console.error("❌ Erreur détaillée lors de l'envoi:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = "Erreur lors de l'envoi du message";

      // Analyser l'erreur spécifique
      if (err.response?.data) {
        // Essayer d'extraire le message d'erreur du backend
        const errorData = err.response.data;

        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          // Si c'est une erreur de validation
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = `Erreur de validation: ${validationErrors.join(", ")}`;
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        openLoginModal();
      } else if (err.response?.status === 500) {
        errorMessage =
          "Le service de messagerie est temporairement indisponible. Veuillez réessayer plus tard ou contacter le support.";
      }

      alert(errorMessage);

      // Si c'est une erreur 500, essayer avec un format encore plus simple
      if (err.response?.status === 500) {
        try {
          console.log("🔄 Essai avec format minimal...");
          const minimalData = {
            destinataireEmail: createur.email || "",
            sujet: "Question sur votre échange",
            contenu: `Bonjour ${createur.prenoms}, je suis intéressé par votre échange "${echange?.nomElementEchange}".`,
          };

          // Essayer avec l'endpoint public
          await api.post(API_ENDPOINTS.MESSAGERIE.PUBLIC_SEND, minimalData);

          // Si ça réussit, rediriger quand même
          let fallbackMessagerieUrl = "/messages";
          if (user?.type === "vendeur")
            fallbackMessagerieUrl = "/dashboard-vendeur/messages";
          if (user?.type === "utilisateur")
            fallbackMessagerieUrl = "/dashboard-utilisateur/messages";

          router.push(fallbackMessagerieUrl);
          return;
        } catch (fallbackErr) {
          console.error("⚠️ Échec de la tentative de secours:", fallbackErr);
        }
      }
    }
  };

  // Handlers existants
  const handleAddToFavorites = async () => {
    if (!echange) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    try {
      if (favori) {
        await api.delete(`/echanges/${echange.uuid}/favoris`);
        setFavori(false);
        alert("Échange retiré des favoris");
      } else {
        await api.post(
          API_ENDPOINTS.ECHANGES.AJOUT_ECHANGE_FAVORIS(echange.uuid),
          {},
        );
        setFavori(true);
        alert("Échange ajouté aux favoris");
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

  const handleAcceptEchange = async () => {
    if (!echange) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir accepter cet échange ?")) {
      try {
        await api.post(API_ENDPOINTS.ECHANGES.ACCEPT(echange.uuid), {});
        alert("Échange accepté avec succès !");
        fetchEchangeDetails();
      } catch (err: any) {
        console.error("Erreur acceptation échange:", err);
        if (err.response?.status === 401) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          openLoginModal();
        } else {
          alert("Une erreur est survenue lors de l'acceptation de l'échange.");
        }
      }
    }
  };

  const handleRefuseEchange = async () => {
    if (!echange) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir refuser cet échange ?")) {
      try {
        await api.post(API_ENDPOINTS.ECHANGES.REFUSE(echange.uuid), {});
        alert("Échange refusé.");
        fetchEchangeDetails();
      } catch (err: any) {
        console.error("Erreur refus échange:", err);
        if (err.response?.status === 401) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          openLoginModal();
        } else {
          alert("Une erreur est survenue lors du refus de l'échange.");
        }
      }
    }
  };

  const handleShare = (platform: string) => {
    if (!echange) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez cet échange sur OSKAR : ${echange.nomElementEchange}`;
    const hashtags = "OSKAR,Échange,Troc,Communauté";

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
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

  const handleSubmitReview = async () => {
    if (!echange || !isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!newReview.commentaire.trim()) {
      alert("Veuillez saisir un commentaire");
      return;
    }

    setSubmittingReview(true);

    try {
      await api.post(API_ENDPOINTS.COMMENTAIRES.CREATE, {
        echangeUuid: echange.uuid,
        contenu: newReview.commentaire,
        note: newReview.note,
      });

      alert("Votre avis a été publié !");
      setShowAddReview(false);
      setNewReview({ note: 5, commentaire: "" });

      // Recharger les commentaires
      setCommentairesFetched(false);
      fetchCommentaires(echange.uuid);
    } catch (err: any) {
      console.error("Erreur publication avis:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        openLoginModal();
      } else {
        alert("Une erreur est survenue lors de la publication de votre avis.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="placeholder-glow">
                <div
                  className="placeholder col-12 rounded bg-secondary"
                  style={{ height: "400px" }}
                ></div>
                <div className="row mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="col-3">
                      <div
                        className="placeholder rounded bg-secondary"
                        style={{ height: "80px" }}
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
              <div className="card border-0 shadow">
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
                    <Link href="/echanges" className="btn btn-outline-primary">
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Retour aux échanges
                    </Link>
                    <Link href="/" className="btn btn-primary">
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

  const visibleComments = showMoreComments
    ? commentaires
    : commentaires.slice(0, 3);

  return (
    <>
      <div className="bg-light min-vh-100">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="bg-white border-bottom">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center py-3">
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
                <li
                  className="breadcrumb-item active text-truncate"
                  style={{ maxWidth: "200px" }}
                >
                  {echange.nomElementEchange}
                </li>
              </ol>
              <div className="d-flex gap-2">
                <span
                  className={`badge bg-${getStatusColor(echange.statut)} px-3 py-2`}
                >
                  <FontAwesomeIcon
                    icon={echange.disponible ? faCheckCircle : faTimesCircle}
                    className="me-1"
                  />
                  {getStatusLabel(echange.statut)}
                </span>
                <span className="badge bg-info px-3 py-2">
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                  Échange
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenu principal */}
        <div className="container py-5">
          <div className="row g-4">
            {/* Colonne gauche - Images et description */}
            <div className="col-lg-8">
              {/* Image principale */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-0">
                  <div className="row g-0">
                    <div className="col-md-7">
                      <div
                        className="position-relative"
                        style={{ height: "400px" }}
                      >
                        <img
                          src={imagePrincipale}
                          alt={echange.nomElementEchange}
                          className="img-fluid h-100 w-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.src = getDefaultEchangeImage();
                          }}
                        />
                        <div className="position-absolute top-0 start-0 p-3">
                          <span className="badge bg-info text-white px-3 py-2">
                            <FontAwesomeIcon
                              icon={faExchangeAlt}
                              className="me-1"
                            />
                            Échange
                          </span>
                        </div>
                        <button
                          onClick={handleAddToFavorites}
                          className={`position-absolute top-0 end-0 m-3 btn ${favori ? "btn-danger" : "btn-light"} rounded-circle`}
                          style={{ width: "50px", height: "50px" }}
                          title={
                            favori
                              ? "Retirer des favoris"
                              : "Ajouter aux favoris"
                          }
                        >
                          <FontAwesomeIcon icon={faHeart} />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="p-4 h-100 d-flex flex-column">
                        <h1 className="h3 fw-bold mb-3">
                          {echange.nomElementEchange}
                        </h1>

                        {/* Note et avis */}
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-3">
                              {renderStars(echange.note_moyenne)}
                            </div>
                            <span className="text-muted">
                              {safeToFixed(echange.note_moyenne)}
                              /5 ({echange.nombre_avis} avis)
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faHeart}
                              className="text-danger me-2"
                            />
                            <span className="text-muted">
                              {echange.nombre_favoris} favoris
                            </span>
                          </div>
                        </div>

                        {/* Informations principales */}
                        <div className="mb-4">
                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <div className="bg-light rounded p-3">
                                <small className="text-muted d-block">
                                  Valeur estimée
                                </small>
                                <strong className="text-success">
                                  {formatPrice(echange.prix)}
                                </strong>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="bg-light rounded p-3">
                                <small className="text-muted d-block">
                                  Quantité
                                </small>
                                <strong>{echange.quantite} unité(s)</strong>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Type d'échange
                            </small>
                            <strong>{echange.typeEchange}</strong>
                          </div>
                          <div className="mb-3">
                            <small className="text-muted d-block">
                              Date de proposition
                            </small>
                            <strong>
                              {formatDate(echange.dateProposition)}
                            </strong>
                          </div>
                        </div>

                        {/* Message du demandeur */}
                        {echange.message && (
                          <div className="alert alert-info mb-4">
                            <FontAwesomeIcon
                              icon={faCommentDots}
                              className="me-2"
                            />
                            <strong>Message :</strong> {echange.message}
                          </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            {echange.statut === "en_attente" && (
                              <>
                                <button
                                  className="btn btn-success btn-lg"
                                  onClick={handleAcceptEchange}
                                >
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="me-2"
                                  />
                                  Accepter l'échange
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-lg"
                                  onClick={handleRefuseEchange}
                                >
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="me-2"
                                  />
                                  Refuser l'échange
                                </button>
                              </>
                            )}
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-outline-primary flex-fill"
                                onClick={() => setShowShareMenu(!showShareMenu)}
                              >
                                <FontAwesomeIcon
                                  icon={faShareAlt}
                                  className="me-2"
                                />
                                Partager
                              </button>
                              <button
                                className="btn btn-outline-info flex-fill"
                                onClick={() =>
                                  setContactVisible(!contactVisible)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="me-2"
                                />
                                Contact
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu de partage */}
              {showShareMenu && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">
                        <FontAwesomeIcon
                          icon={faShareAlt}
                          className="me-2 text-primary"
                        />
                        Partager cet échange
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowShareMenu(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>

                    <div className="row g-3">
                      <div className="col-6">
                        <h6 className="text-muted mb-2">
                          Partager sur les réseaux
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShare("facebook")}
                          >
                            <FontAwesomeIcon
                              icon={faFacebookF}
                              className="me-1"
                            />
                            Facebook
                          </button>
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleShare("twitter")}
                          >
                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                            Twitter
                          </button>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleShare("whatsapp")}
                          >
                            <FontAwesomeIcon
                              icon={faWhatsapp}
                              className="me-1"
                            />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                      <div className="col-6">
                        <h6 className="text-muted mb-2">
                          Contacter le créateur
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {(createur?.facebook_url || true) && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={handleContactFacebook}
                            >
                              <FontAwesomeIcon
                                icon={faFacebookF}
                                className="me-1"
                              />
                              Facebook
                            </button>
                          )}
                          {(createur?.telephone || createur?.whatsapp_url) && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={handleContactWhatsApp}
                            >
                              <FontAwesomeIcon
                                icon={faWhatsapp}
                                className="me-1"
                              />
                              WhatsApp
                            </button>
                          )}
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={handleOpenMessagerie}
                          >
                            <FontAwesomeIcon
                              icon={faComments}
                              className="me-1"
                            />
                            Messagerie interne
                          </button>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={window.location.href}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={handleCopyLink}
                          >
                            <FontAwesomeIcon icon={faCopy} className="me-1" />
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section contact créateur */}
              {contactVisible && createur && (
                <div className="card shadow-sm border-info mb-4">
                  <div className="card-header bg-info bg-opacity-10 border-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0 text-info">
                        <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                        Informations du créateur
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setContactVisible(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 text-center mb-4 mb-md-0">
                        {createur.avatar ? (
                          <div className="mb-3">
                            <img
                              src={createur.avatar}
                              alt={`${createur.prenoms} ${createur.nom}`}
                              className="rounded-circle img-fluid"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = getDefaultAvatarUrl();
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mb-3">
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: "120px", height: "120px" }}
                            >
                              <FontAwesomeIcon
                                icon={faUserCircle}
                                className="text-muted fa-4x"
                              />
                            </div>
                          </div>
                        )}
                        <h5 className="fw-bold mb-1">
                          {createur.prenoms} {createur.nom}
                        </h5>
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                          <span
                            className={`badge bg-${createur.userType === "vendeur" ? "warning" : createur.userType === "agent" ? "primary" : "success"}`}
                          >
                            {createur.userType === "vendeur"
                              ? "Vendeur"
                              : createur.userType === "agent"
                                ? "Agent"
                                : "Utilisateur"}
                          </span>
                          {createur.est_verifie && (
                            <span className="badge bg-success">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="me-1"
                              />
                              Vérifié
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-8">
                        <div className="row g-3">
                          <div className="col-12">
                            <h6 className="fw-bold text-muted mb-3">
                              Informations de contact
                            </h6>
                          </div>
                          {createur.email && (
                            <div className="col-md-6">
                              <div className="d-flex align-items-center mb-2">
                                <FontAwesomeIcon
                                  icon={faEnvelope}
                                  className="text-primary me-2"
                                />
                                <div>
                                  <small className="text-muted d-block">
                                    Email
                                  </small>
                                  <strong>{createur.email}</strong>
                                </div>
                              </div>
                            </div>
                          )}
                          {createur.telephone && (
                            <div className="col-md-6">
                              <div className="d-flex align-items-center mb-2">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="text-success me-2"
                                />
                                <div>
                                  <small className="text-muted d-block">
                                    Téléphone
                                  </small>
                                  <strong>{createur.telephone}</strong>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="col-12">
                            <hr />
                            <h6 className="fw-bold text-muted mb-3">
                              Contacter via
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {(createur.whatsapp_url ||
                                createur.telephone) && (
                                <button
                                  className="btn btn-success d-flex align-items-center gap-2"
                                  onClick={handleContactWhatsApp}
                                >
                                  <FontAwesomeIcon icon={faWhatsappBrand} />
                                  <span>WhatsApp</span>
                                </button>
                              )}
                              <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={handleContactFacebook}
                              >
                                <FontAwesomeIcon icon={faFacebookF} />
                                <span>Facebook</span>
                              </button>
                              <button
                                className="btn btn-outline-primary d-flex align-items-center gap-2"
                                onClick={handleOpenMessagerie}
                              >
                                <FontAwesomeIcon icon={faComments} />
                                <span>Messagerie interne</span>
                              </button>
                              <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={handleCopyContactInfo}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                                <span>Copier les infos</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Miniatures d'images */}
              {images.length > 1 && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <FontAwesomeIcon
                        icon={faImages}
                        className="me-2 text-primary"
                      />
                      Galerie d'images
                    </h5>
                    <div className="row g-3">
                      {images.map((img, index) => (
                        <div key={index} className="col-6 col-md-3">
                          <div
                            className={`border ${imagePrincipale === img ? "border-primary border-2" : "border-secondary"} rounded cursor-pointer overflow-hidden`}
                            onClick={() => setImagePrincipale(img)}
                            style={{ height: "120px" }}
                          >
                            <img
                              src={img}
                              alt={`${echange.nomElementEchange} - vue ${index + 1}`}
                              className="img-fluid h-100 w-100 object-fit-cover"
                              onError={(e) => {
                                e.currentTarget.src = getDefaultEchangeImage();
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Détails de l'échange */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faExchangeAlt}
                      className="me-2 text-primary"
                    />
                    Détails de l'échange
                  </h3>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-info mb-4">
                        <div className="card-body">
                          <h5 className="text-info mb-3">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className="me-2"
                            />
                            Ce que je propose
                          </h5>
                          <h4 className="fw-bold mb-3">
                            {echange.objetPropose}
                          </h4>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-muted me-2"
                            />
                            <span>Proposé par : {echange.nom_initiateur}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-success mb-4">
                        <div className="card-body">
                          <h5 className="text-success mb-3">
                            <FontAwesomeIcon
                              icon={faArrowDown}
                              className="me-2"
                            />
                            Ce que je recherche
                          </h5>
                          <h4 className="fw-bold mb-3">
                            {echange.objetDemande}
                          </h4>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-muted me-2"
                            />
                            <span>
                              Destinataire : {echange.typeDestinataire}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-3">
                          <strong className="text-muted">
                            Type d'échange:
                          </strong>
                          <span className="ms-2">{echange.typeEchange}</span>
                        </li>
                        <li className="mb-3">
                          <strong className="text-muted">
                            Valeur estimée:
                          </strong>
                          <span className="ms-2">
                            {formatPrice(echange.prix)}
                          </span>
                        </li>
                        <li className="mb-3">
                          <strong className="text-muted">Quantité:</strong>
                          <span className="ms-2">
                            {echange.quantite} unité(s)
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="list-unstyled">
                        <li className="mb-3">
                          <strong className="text-muted">
                            Date de proposition:
                          </strong>
                          <span className="ms-2">
                            {formatDate(echange.dateProposition)}
                          </span>
                        </li>
                        <li className="mb-3">
                          <strong className="text-muted">
                            Date d'acceptation:
                          </strong>
                          <span className="ms-2">
                            {formatDate(echange.dateAcceptation)}
                          </span>
                        </li>
                        <li className="mb-3">
                          <strong className="text-muted">Publié le:</strong>
                          <span className="ms-2">
                            {formatDate(echange.createdAt)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaires et avis */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="me-2 text-warning"
                    />
                    Avis et commentaires ({echange.nombre_avis})
                  </h3>

                  {loadingComments ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="text-muted mt-2">Chargement des avis...</p>
                    </div>
                  ) : (
                    <>
                      {/* Statistiques des notes */}
                      <div className="bg-light rounded p-4 mb-4">
                        <div className="row align-items-center">
                          <div className="col-md-4 text-center">
                            <div className="display-4 fw-bold text-primary mb-2">
                              {safeToFixed(noteStats.moyenne)}
                            </div>
                            <div className="mb-2">
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
                              const percentage =
                                noteStats.total > 0
                                  ? Math.round((count / noteStats.total) * 100)
                                  : 0;

                              return (
                                <div
                                  key={rating}
                                  className="d-flex align-items-center mb-2"
                                >
                                  <span
                                    className="text-muted me-2"
                                    style={{ width: "70px" }}
                                  >
                                    {rating} étoiles
                                  </span>
                                  <div
                                    className="progress flex-grow-1 me-2"
                                    style={{ height: "10px" }}
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
                            <h5 className="card-title mb-3">
                              Donner votre avis
                            </h5>
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
                                  submittingReview ||
                                  !newReview.commentaire.trim()
                                }
                              >
                                {submittingReview ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                    ></span>
                                    Envoi en cours...
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
                            className="btn btn-primary"
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
                        <>
                          <div className="mt-4">
                            {visibleComments.map((comment) => (
                              <div
                                key={comment.uuid}
                                className="border-bottom pb-4 mb-4"
                              >
                                <div className="d-flex">
                                  <div className="me-3">
                                    <img
                                      src={
                                        comment.utilisateur_photo ||
                                        getDefaultAvatarUrl()
                                      }
                                      alt={comment.utilisateur_nom}
                                      className="rounded-circle"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          getDefaultAvatarUrl();
                                      }}
                                    />
                                  </div>
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
                                        {formatDate(comment.date)}
                                      </small>
                                    </div>
                                    <p className="mb-3">
                                      {comment.commentaire}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {commentaires.length > 3 && (
                            <div className="text-center mt-4">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  setShowMoreComments(!showMoreComments)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    showMoreComments
                                      ? faChevronUp
                                      : faChevronDown
                                  }
                                  className="me-2"
                                />
                                {showMoreComments
                                  ? "Voir moins d'avis"
                                  : `Voir tous les ${commentaires.length} avis`}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-5">
                          <div className="mb-3">
                            <FontAwesomeIcon
                              icon={faCommentSlash}
                              className="fa-3x text-muted"
                            />
                          </div>
                          <h5 className="text-muted mb-2">
                            Aucun avis pour le moment
                          </h5>
                          <p className="text-muted mb-4">
                            Soyez le premier à donner votre avis sur cet
                            échange.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Échanges similaires */}
              {echangesSimilaires.length > 0 && (
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="h5 fw-bold mb-0">
                        <FontAwesomeIcon
                          icon={faThLarge}
                          className="me-2 text-primary"
                        />
                        Échanges similaires ({echangesSimilaires.length})
                      </h3>
                      <Link
                        href="/echanges"
                        className="btn btn-outline-primary btn-sm"
                      >
                        Voir tous
                      </Link>
                    </div>

                    <div className="row g-4">
                      {echangesSimilaires.map((echangeSim) => (
                        <div key={echangeSim.uuid} className="col-md-6">
                          <div className="card border h-100">
                            <div
                              className="position-relative"
                              style={{ height: "200px" }}
                            >
                              <img
                                src={echangeSim.image}
                                alt={echangeSim.nomElementEchange}
                                className="img-fluid h-100 w-100 object-fit-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    getDefaultEchangeImage();
                                }}
                              />
                              <span className="position-absolute top-0 start-0 m-2 badge bg-info">
                                Échange
                              </span>
                            </div>
                            <div className="card-body">
                              <h6 className="card-title fw-bold">
                                {echangeSim.nomElementEchange}
                              </h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  {renderStars(echangeSim.note_moyenne)}
                                </div>
                                <small className="text-muted">
                                  ({safeToFixed(echangeSim.note_moyenne)})
                                </small>
                              </div>
                              <div className="mb-3">
                                <small className="text-muted d-block">
                                  Propose :
                                </small>
                                <strong>{echangeSim.objetPropose}</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  className={`badge bg-${getStatusColor(echangeSim.statut)}`}
                                >
                                  {getStatusLabel(echangeSim.statut)}
                                </span>
                                <Link
                                  href={`/echanges/${echangeSim.uuid}`}
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  <FontAwesomeIcon
                                    icon={faEye}
                                    className="me-1"
                                  />
                                  Voir
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite - Sidebar */}
            <div className="col-lg-4">
              {/* Carte créateur améliorée */}
              {createur && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-primary fa-lg"
                        />
                      </div>
                      <div>
                        <h4 className="h5 fw-bold mb-0">
                          Créateur de l'échange
                        </h4>
                        <p className="text-muted mb-0">
                          Contactez directement le propriétaire
                        </p>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      {createur.avatar ? (
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <img
                            src={createur.avatar}
                            alt={`${createur.prenoms} ${createur.nom}`}
                            className="img-fluid h-100 w-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultAvatarUrl();
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            className="fa-2x text-muted"
                          />
                        </div>
                      )}
                      <h5 className="fw-bold mb-2">
                        {createur.prenoms} {createur.nom}
                      </h5>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                        <span className="badge bg-success">
                          <FontAwesomeIcon
                            icon={faCertificate}
                            className="me-1"
                          />
                          Membre {createur.userType}
                        </span>
                        {createur.est_verifie && (
                          <span className="badge bg-info">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-1"
                            />
                            Vérifié
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Boutons de contact rapide */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Contacter rapidement</h6>
                      <div className="row g-2">
                        {(createur.whatsapp_url || createur.telephone) && (
                          <div className="col-6">
                            <button
                              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                              onClick={handleContactWhatsApp}
                            >
                              <FontAwesomeIcon icon={faWhatsapp} />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        )}
                        <div
                          className={
                            createur.whatsapp_url || createur.telephone
                              ? "col-6"
                              : "col-12"
                          }
                        >
                          <button
                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleContactFacebook}
                          >
                            <FontAwesomeIcon icon={faFacebookF} />
                            <span>Facebook</span>
                          </button>
                        </div>
                        <div className="col-12">
                          <button
                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
                            onClick={handleOpenMessagerie}
                          >
                            <FontAwesomeIcon icon={faComments} />
                            <span>Messagerie interne</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Informations contact détaillées */}
                    <div className="border-top pt-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                          <FontAwesomeIcon icon={faIdCard} className="me-2" />
                          Informations de contact
                        </h6>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setContactVisible(!contactVisible)}
                        >
                          <FontAwesomeIcon
                            icon={contactVisible ? faEyeSlash : faEye}
                          />
                        </button>
                      </div>

                      {contactVisible ? (
                        <div className="alert alert-success">
                          <div className="mb-2">
                            <strong>Email:</strong>
                            <p className="mb-1">
                              {createur.email || "Non disponible"}
                            </p>
                          </div>
                          <div className="mb-2">
                            <strong>Téléphone:</strong>
                            <p className="mb-1">
                              {createur.telephone || "Non disponible"}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary flex-fill"
                              onClick={handleCopyContactInfo}
                            >
                              <FontAwesomeIcon icon={faCopy} className="me-1" />
                              Copier
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline-success w-100"
                          onClick={() => setContactVisible(true)}
                        >
                          <FontAwesomeIcon icon={faEye} className="me-2" />
                          Voir les coordonnées
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informations échange */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="me-2 text-info"
                    />
                    Informations de l'échange
                  </h5>

                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Statut</span>
                        <span
                          className={`badge bg-${getStatusColor(echange.statut)}`}
                        >
                          {getStatusLabel(echange.statut)}
                        </span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Disponibilité</span>
                        <span
                          className={`fw-bold ${echange.disponible ? "text-success" : "text-danger"}`}
                        >
                          {echange.disponible ? "Oui" : "Non"}
                        </span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Note moyenne</span>
                        <span className="fw-bold">
                          {safeToFixed(echange.note_moyenne)}/5
                        </span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Nombre d'avis</span>
                        <span className="fw-bold">{echange.nombre_avis}</span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Référence</span>
                        <span className="fw-bold">
                          {echange.uuid.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processus d'échange */}
              <div className="card shadow-sm border-success">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faExchangeAlt}
                      className="me-2 text-success"
                    />
                    Processus d'échange
                  </h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Proposition envoyée
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Discussion des termes
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Acceptation mutuelle
                    </li>
                    <li>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Échange effectué
                    </li>
                  </ul>
                </div>
              </div>

              {/* Conseils de sécurité */}
              <div className="card shadow-sm border-warning mt-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning rounded-circle p-2 me-3">
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="text-white"
                      />
                    </div>
                    <h5 className="fw-bold mb-0">Conseils pour l'échange</h5>
                  </div>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Vérifiez l'état des objets
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Lieu public et sécurisé
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Évitez les paiements en liquide
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Informez un proche
                    </li>
                    <li>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Faites confiance à votre instinct
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Échanges récemment consultés */}
          {echangesSimilaires.length > 0 && (
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h4 fw-bold">
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="me-2 text-primary"
                  />
                  Échanges similaires
                </h3>
                <Link
                  href="/echanges"
                  className="btn btn-outline-primary btn-sm"
                >
                  Voir tout
                </Link>
              </div>

              <div className="row g-4">
                {echangesSimilaires.map((echangeSim) => (
                  <div key={echangeSim.uuid} className="col-md-3">
                    <div className="card border h-100">
                      <div
                        className="position-relative"
                        style={{ height: "150px" }}
                      >
                        <img
                          src={echangeSim.image}
                          alt={echangeSim.nomElementEchange}
                          className="img-fluid h-100 w-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.src = getDefaultEchangeImage();
                          }}
                        />
                      </div>
                      <div className="card-body">
                        <h6 className="card-title fw-bold">
                          {echangeSim.nomElementEchange}
                        </h6>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Propose :
                          </small>
                          <strong>{echangeSim.objetPropose}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <span
                              className={`badge bg-${getStatusColor(echangeSim.statut)}`}
                            >
                              {getStatusLabel(echangeSim.statut)}
                            </span>
                          </small>
                          <Link
                            href={`/echanges/${echangeSim.uuid}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .object-fit-cover {
          object-fit: cover;
        }
        .prose {
          line-height: 1.7;
        }
        .prose p {
          white-space: pre-line;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
