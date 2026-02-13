// app/(front-office)/echanges/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";

// Types basés sur votre API
interface Createur {
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
  createur: Createur;
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
}

interface EchangeResponse {
  echange: EchangeAPI;
  similaires: EchangeSimilaireAPI[];
}

// Types pour notre composant
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
  createur: Createur;
  createurType: "utilisateur" | "vendeur";
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
  userType: "vendeur" | "utilisateur";
}

export default function EchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string>("utilisateur");
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

  // Vérifier l'authentification et le type d'utilisateur
  useEffect(() => {
    const checkAuth = () => {
      const token = api.getToken();
      setIsAuthenticated(!!token);

      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("oskar_user="));

      if (userCookie) {
        try {
          const userData = JSON.parse(
            decodeURIComponent(userCookie.split("=")[1]),
          );
          setUserType(userData.type || "utilisateur");
        } catch (e) {
          console.warn("Impossible de parser le cookie utilisateur", e);
          setUserType("utilisateur");
        }
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ✅ Redirection vers la page de connexion appropriée
  const redirectToLogin = () => {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("oskar_user="));

    let currentUserType = "utilisateur";

    if (userCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userCookie.split("=")[1]),
        );
        currentUserType = userData.type || "utilisateur";
      } catch (e) {
        console.warn("Impossible de parser le cookie utilisateur", e);
      }
    }

    const redirectPath = `/auth/${currentUserType}/login?redirect=/echanges/${uuid}`;
    console.log("Redirecting to:", redirectPath);
    router.push(redirectPath);
  };

  // ✅ REDIRECTION VERS LA MESSAGERIE - SANS MODAL
  const redirectToMessaging = (createur: CreateurInfo, echange: Echange) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    // Déterminer le dashboard en fonction du type d'utilisateur
    let dashboardPath = "/dashboard-utilisateur/messages";

    if (userType === "agent") {
      dashboardPath = "/dashboard-agent/messages";
    } else if (userType === "vendeur") {
      dashboardPath = "/dashboard-vendeur/messages";
    } else if (userType === "admin") {
      dashboardPath = "/dashboard-admin/messages";
    }

    // Construire les paramètres pour pré-remplir le formulaire
    const params = new URLSearchParams({
      destinataireUuid: createur.uuid,
      destinataireEmail: createur.email,
      destinataireNom: `${createur.prenoms} ${createur.nom}`,
      sujet: `Question concernant votre échange: ${echange.nomElementEchange}`,
      echangeUuid: echange.uuid,
    });

    // ✅ REDIRECTION DIRECTE - SANS MODAL
    router.push(`${dashboardPath}?${params.toString()}`);
  };

  const getDefaultAvatarUrl = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-avatar.png`;
  };

  const getDefaultEchangeImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-echange.png`;
  };

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

  const safeToFixed = (
    value: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(decimals);
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
      image: normalizeImageUrl(apiEchange.image),
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
      createur: apiEchange.createur,
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
      image: normalizeImageUrl(apiSimilaire.image),
      localisation: apiSimilaire.localisation,
      statut: apiSimilaire.statut,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite || 1,
      note_moyenne: apiSimilaire.note_moyenne || 0,
      nombre_avis: apiSimilaire.nombre_avis || 0,
      categorie: apiSimilaire.categorie,
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

  // app/(front-office)/echanges/[uuid]/page.tsx
  // Lignes 524-540 - CORRIGÉES

  // ✅ Chargement sécurisé des informations du créateur - CORRIGÉ
  const fetchCreateurInfo = useCallback(async (createur: Createur) => {
    if (!createur || !createur.uuid) {
      console.warn("❌ Créateur sans UUID, impossible de charger les détails");
      return null;
    }

    console.log("🟡 Chargement des informations du créateur:", {
      uuid: createur.uuid,
      email: createur.email,
      nom: createur.nom,
      prenoms: createur.prenoms,
    });

    try {
      // ✅ ÉTAPE 1: Essayer d'abord avec l'endpoint utilisateur SANS skipAuth
      try {
        console.log(`🟡 Tentative 1/3: Chargement en tant qu'utilisateur...`);

        // ✅ CORRIGÉ: Supprimer l'option skipAuth qui n'existe pas
        const userResponse = await api.get(
          API_ENDPOINTS.AUTH.UTILISATEUR.DETAIL(createur.uuid),
        );

        if (userResponse) {
          console.log("✅ Créateur chargé comme utilisateur:", userResponse);

          const createurData: CreateurInfo = {
            uuid: createur.uuid,
            nom: userResponse.nom || createur.nom || "",
            prenoms: userResponse.prenoms || createur.prenoms || "",
            email: userResponse.email || createur.email || "",
            telephone: userResponse.telephone || createur.telephone || "",
            avatar: userResponse.avatar
              ? normalizeImageUrl(userResponse.avatar)
              : createur.avatar
                ? normalizeImageUrl(createur.avatar)
                : null,
            facebook_url: userResponse.facebook_url || null,
            whatsapp_url: userResponse.whatsapp_url || null,
            twitter_url: userResponse.twitter_url || null,
            instagram_url: userResponse.instagram_url || null,
            userType: "utilisateur",
          };

          setCreateur(createurData);
          return createurData;
        }
      } catch (userErr: any) {
        console.log("🟡 Tentative 1 échouée - Ce n'est pas un utilisateur:", {
          status: userErr.response?.status,
          message: userErr.message,
        });
      }

      // ✅ ÉTAPE 2: Essayer avec l'endpoint vendeur SANS skipAuth
      try {
        console.log(`🟡 Tentative 2/3: Chargement en tant que vendeur...`);

        // ✅ CORRIGÉ: Supprimer l'option skipAuth qui n'existe pas
        const vendeurResponse = await api.get(
          API_ENDPOINTS.AUTH.VENDEUR.DETAIL(createur.uuid),
        );

        if (vendeurResponse) {
          console.log("✅ Créateur chargé comme vendeur:", vendeurResponse);

          const createurData: CreateurInfo = {
            uuid: createur.uuid,
            nom: vendeurResponse.nom || createur.nom || "",
            prenoms: vendeurResponse.prenoms || createur.prenoms || "",
            email: vendeurResponse.email || createur.email || "",
            telephone: vendeurResponse.telephone || createur.telephone || "",
            avatar: vendeurResponse.avatar
              ? normalizeImageUrl(vendeurResponse.avatar)
              : createur.avatar
                ? normalizeImageUrl(createur.avatar)
                : null,
            facebook_url: vendeurResponse.facebook_url || null,
            whatsapp_url: vendeurResponse.whatsapp_url || null,
            twitter_url: vendeurResponse.twitter_url || null,
            instagram_url: vendeurResponse.instagram_url || null,
            userType: "vendeur",
          };

          setCreateur(createurData);
          return createurData;
        }
      } catch (vendeurErr: any) {
        console.log("🟡 Tentative 2 échouée - Ce n'est pas un vendeur:", {
          status: vendeurErr.response?.status,
          message: vendeurErr.message,
        });
      }

      // ✅ ÉTAPE 3: Utiliser les données du createur fournies par l'API
      console.log("🟡 Tentative 3/3: Utilisation des données du créateur");

      const createurData: CreateurInfo = {
        uuid: createur.uuid,
        nom: createur.nom || "",
        prenoms: createur.prenoms || "",
        email: createur.email || "",
        telephone: createur.telephone || "",
        avatar: createur.avatar ? normalizeImageUrl(createur.avatar) : null,
        facebook_url: createur.facebook_url || null,
        whatsapp_url: createur.whatsapp_url || null,
        twitter_url: createur.twitter_url || null,
        instagram_url: createur.instagram_url || null,
        userType: "utilisateur", // ✅ CORRIGÉ: utiliser "utilisateur" par défaut
      };

      console.log(
        "✅ Créateur créé à partir des données de base:",
        createurData,
      );
      setCreateur(createurData);
      return createurData;
    } catch (err) {
      console.error("❌ Erreur critique lors du chargement du créateur:", err);

      // ✅ ÉTAPE 4: Fallback - Utiliser les données minimales
      const createurData: CreateurInfo = {
        uuid: createur.uuid,
        nom: createur.nom || "Créateur",
        prenoms: createur.prenoms || "OSKAR",
        email: createur.email || "",
        telephone: createur.telephone || "",
        avatar: createur.avatar ? normalizeImageUrl(createur.avatar) : null,
        facebook_url: null,
        whatsapp_url: null,
        twitter_url: null,
        instagram_url: null,
        userType: "utilisateur",
      };

      console.log(
        "✅ Fallback: Créateur créé avec données minimales:",
        createurData,
      );
      setCreateur(createurData);
      return createurData;
    }
  }, []);

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

  // ✅ Chargement principal
  const fetchEchangeDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🟡 Chargement de l'échange:", uuid);
      const response = await api.get<EchangeResponse>(
        API_ENDPOINTS.ECHANGES.RANDOM_DETAIL(uuid),
      );

      if (!response || !response.echange) {
        throw new Error("Échange non trouvé");
      }

      console.log("✅ Échange chargé avec succès:", response.echange.uuid);
      console.log("📊 Catégorie reçue:", response.echange.categorie);

      const echangeData = transformEchangeData(response.echange);
      const similairesData = response.similaires.map(
        transformEchangeSimilaireData,
      );

      setEchange(echangeData);
      setEchangesSimilaires(similairesData);
      setFavori(response.echange.is_favoris || false);

      const imageUrls: string[] = [];
      const mainImage = echangeData.image;
      imageUrls.push(mainImage);
      setImagePrincipale(mainImage);

      similairesData.slice(0, 4).forEach((similaire) => {
        if (similaire.image && !imageUrls.includes(similaire.image)) {
          imageUrls.push(similaire.image);
        }
      });

      while (imageUrls.length < 4) {
        imageUrls.push(getDefaultEchangeImage());
      }

      setImages(imageUrls);

      // ✅ Charger les informations du créateur
      if (response.echange.createur && response.echange.createur.uuid) {
        console.log("🟡 Chargement des informations du créateur...");
        await fetchCreateurInfo(response.echange.createur);
      } else {
        console.warn("⚠️ Aucun créateur trouvé pour cet échange");
      }

      // Charger les commentaires
      fetchCommentaires(echangeData.uuid);
    } catch (err: any) {
      console.error("❌ Erreur détail échange:", err);

      if (err.response?.status === 404 || err.message?.includes("non trouvé")) {
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
  }, [uuid, fetchCreateurInfo, fetchCommentaires]);

  useEffect(() => {
    if (uuid && !echange && loading) {
      fetchEchangeDetails();
    }
  }, [uuid, fetchEchangeDetails, loading, echange]);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "Prix à discuter";
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
        <i
          key={i}
          className={`fas fa-star ${i <= roundedRating ? "text-warning" : "text-secondary"}`}
        ></i>,
      );
    }
    return stars;
  };

  const renderRatingStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
      rating = 0;
    }

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= rating ? "text-warning" : "text-muted"}`}
          style={{ fontSize: "0.9rem" }}
        ></i>,
      );
    }
    return stars;
  };

  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "disponible":
        return "Disponible";
      case "en_attente":
        return "En attente";
      case "reserve":
        return "Réservé";
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
      case "disponible":
      case "publie":
        return "success";
      case "en_attente":
        return "warning";
      case "reserve":
        return "info";
      case "termine":
        return "secondary";
      default:
        return "dark";
    }
  };

  const getTypeEchangeLabel = (type: "produit" | "service") => {
    return type === "produit" ? "Produit" : "Service";
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

  const handleAddToFavorites = async () => {
    if (!echange) return;

    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      if (favori) {
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(echange.uuid));
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
        redirectToLogin();
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleContactCreateur = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (!createur) {
      alert(
        "Impossible de contacter le créateur. Informations non disponibles.",
      );
      return;
    }

    // ✅ REDIRECTION DIRECTE VERS LA MESSAGERIE
    redirectToMessaging(createur, echange!);
  };

  const handleSubmitReview = async () => {
    if (!echange) return;

    if (!isAuthenticated) {
      redirectToLogin();
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
          echangeUuid: echange.uuid,
          note: newReview.note,
        },
      );

      await fetchCommentaires(echange.uuid);

      setNewReview({
        note: 5,
        commentaire: "",
      });
      setShowAddReview(false);

      alert(
        "Votre avis a été ajouté avec succès ! Merci pour votre contribution.",
      );

      await fetchEchangeDetails();
    } catch (err: any) {
      console.error("Erreur ajout avis:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        redirectToLogin();
      } else {
        alert(
          "Une erreur est survenue lors de l'ajout de votre avis. Veuillez réessayer.",
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!echange) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez cet échange sur OSKAR : ${echange.nomElementEchange}`;
    const hashtags = "OSKAR,Echange,Troc,Communauté";

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform as keyof typeof urls]) {
      window.open(
        urls[platform as keyof typeof urls],
        "_blank",
        "noopener,noreferrer",
      );
    }

    setShowShareMenu(false);
  };

  const openWhatsApp = (phoneNumber: string | null) => {
    if (!phoneNumber) {
      alert("Le créateur n'a pas fourni de numéro WhatsApp.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const message = `Bonjour, je suis intéressé(e) par votre échange "${echange?.nomElementEchange}" sur OSKAR. Pourrions-nous discuter ?`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openFacebook = (facebookUrl: string | null) => {
    if (!facebookUrl) {
      alert("Le créateur n'a pas fourni de lien Facebook.");
      return;
    }
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
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

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("225")) {
      const rest = cleaned.slice(3);
      if (rest.length === 8) {
        return `+225 ${rest.match(/.{2}/g)?.join(" ") || rest}`;
      }
    }
    return phone;
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
                    <i className="fas fa-exchange-alt fa-4x text-muted"></i>
                  </div>
                  <h1 className="h3 mb-3">Échange introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Cet échange n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link href="/echanges" className="btn btn-outline-primary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Retour aux échanges
                    </Link>
                    <Link href="/" className="btn btn-primary">
                      <i className="fas fa-home me-2"></i>
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
    <div className="bg-light min-vh-100">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="bg-white border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted">
                  <i className="fas fa-home me-1"></i>
                  Accueil
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  href="/echanges"
                  className="text-decoration-none text-muted"
                >
                  <i className="fas fa-exchange-alt me-1"></i>
                  Échanges
                </Link>
              </li>
              {echange.categorie && (
                <li className="breadcrumb-item">
                  <Link
                    href={`/echanges?categorie=${echange.categorie.slug}`}
                    className="text-decoration-none text-muted"
                  >
                    <i className="fas fa-tag me-1"></i>
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
            <div className="d-flex gap-2">
              <span
                className={`badge bg-${getStatusColor(echange.statut)} px-3 py-2`}
              >
                <i
                  className={`fas fa-${echange.disponible ? "check-circle" : "times-circle"} me-1`}
                ></i>
                {getStatusLabel(echange.statut)}
              </span>
              <span className="badge bg-primary px-3 py-2">
                <i className="fas fa-exchange-alt me-1"></i>
                Échange
              </span>
              {echange.prix === 0 && (
                <span className="badge bg-success px-3 py-2">
                  <i className="fas fa-gift me-1"></i>
                  Gratuit
                </span>
              )}
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
                        className="img-fluid h-100 w-100 object-fit-cover rounded-start"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultEchangeImage();
                        }}
                      />
                      <div className="position-absolute top-0 start-0 p-3">
                        <span className="badge bg-primary text-white px-3 py-2">
                          <i className="fas fa-exchange-alt me-1"></i>
                          Échange
                        </span>
                        <span className="badge bg-info text-white px-3 py-2 ms-2">
                          {getTypeEchangeLabel(echange.typeEchange)}
                        </span>
                      </div>
                      <button
                        onClick={handleAddToFavorites}
                        className={`position-absolute top-0 end-0 m-3 btn ${favori ? "btn-danger" : "btn-light"} rounded-circle shadow-sm`}
                        style={{ width: "50px", height: "50px" }}
                        title={
                          favori ? "Retirer des favoris" : "Ajouter aux favoris"
                        }
                      >
                        <i className={`${favori ? "fas" : "far"} fa-heart`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="p-4 h-100 d-flex flex-column">
                      <h1 className="h3 fw-bold mb-3">
                        {echange.nomElementEchange}
                      </h1>

                      {echange.categorie && (
                        <div className="mb-3">
                          <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                            <i className="fas fa-tag me-1"></i>
                            {echange.categorie.libelle}
                          </span>
                        </div>
                      )}

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
                          <i className="fas fa-heart text-danger me-2"></i>
                          <span className="text-muted">
                            {echange.is_favoris
                              ? "Dans vos favoris"
                              : "Ajouter aux favoris"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h2 className="text-primary fw-bold mb-2">
                          {formatPrice(echange.prix)}
                        </h2>
                      </div>

                      <div className="mb-4">
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="bg-light rounded p-3">
                              <small className="text-muted d-block">
                                Je propose
                              </small>
                              <strong>{echange.objetPropose}</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light rounded p-3">
                              <small className="text-muted d-block">
                                Je recherche
                              </small>
                              <strong>{echange.objetDemande}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Localisation
                          </small>
                          <strong>{echange.localisation}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Lieu de rencontre
                          </small>
                          <strong>{echange.lieu_rencontre}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Quantité disponible
                          </small>
                          <strong>{echange.quantite} unité(s)</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Numéro de référence
                          </small>
                          <strong className="text-primary">
                            {echange.numero}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={handleContactCreateur}
                            disabled={!echange.disponible}
                          >
                            <i className="fas fa-hand-holding-heart me-2"></i>
                            {echange.disponible
                              ? "Je suis intéressé(e)"
                              : "Non disponible"}
                          </button>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary flex-fill"
                              onClick={() => setShowShareMenu(!showShareMenu)}
                            >
                              <i className="fas fa-share-alt me-2"></i>
                              Partager
                            </button>
                            <button
                              className="btn btn-outline-info flex-fill"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  redirectToLogin();
                                  return;
                                }
                                setShowAddReview(true);
                              }}
                            >
                              <i className="fas fa-star me-2"></i>
                              Noter
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
                      <i className="fas fa-share-alt me-2 text-primary"></i>
                      Partager cet échange
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="input-group mb-3">
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
                          <i className="fas fa-copy me-1"></i>
                          Copier le lien
                        </button>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline-primary d-flex align-items-center gap-2"
                          onClick={() => handleShare("facebook")}
                        >
                          <i className="fab fa-facebook-f"></i>
                          Facebook
                        </button>
                        <button
                          className="btn btn-outline-info d-flex align-items-center gap-2"
                          onClick={() => handleShare("twitter")}
                        >
                          <i className="fab fa-twitter"></i>
                          Twitter
                        </button>
                        <button
                          className="btn btn-outline-success d-flex align-items-center gap-2"
                          onClick={() => handleShare("whatsapp")}
                        >
                          <i className="fab fa-whatsapp"></i>
                          WhatsApp
                        </button>
                        <button
                          className="btn btn-outline-primary d-flex align-items-center gap-2"
                          onClick={() => handleShare("linkedin")}
                        >
                          <i className="fab fa-linkedin"></i>
                          LinkedIn
                        </button>
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
                    <i className="fas fa-images me-2 text-primary"></i>
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

            {/* Description */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-4">
                  <i className="fas fa-file-alt me-2 text-primary"></i>
                  Description de l'échange
                </h3>
                {echange.description ? (
                  <div className="prose">
                    <p className="lead">{echange.description}</p>
                  </div>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour cet échange.
                  </p>
                )}
                {echange.message && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="fw-bold mb-2">Message du créateur :</h6>
                    <p className="mb-0">{echange.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Spécifications */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-4">
                  <i className="fas fa-list-alt me-2 text-primary"></i>
                  Informations détaillées
                </h3>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Type d'échange:</strong>
                        <span className="ms-2">
                          {getTypeEchangeLabel(echange.typeEchange)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Je propose:</strong>
                        <span className="ms-2">{echange.objetPropose}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Je recherche:</strong>
                        <span className="ms-2">{echange.objetDemande}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Quantité:</strong>
                        <span className="ms-2">
                          {echange.quantite} unité(s)
                        </span>
                      </li>
                      {echange.categorie && (
                        <li className="mb-3">
                          <strong className="text-muted">Catégorie:</strong>
                          <span className="ms-2">
                            {echange.categorie.libelle}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Date de début:</strong>
                        <span className="ms-2">
                          {formatDate(echange.date_debut)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Date de fin:</strong>
                        <span className="ms-2">
                          {formatDate(echange.date_fin)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">
                          Lieu de rencontre:
                        </strong>
                        <span className="ms-2">{echange.lieu_rencontre}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Numéro:</strong>
                        <span className="ms-2 text-primary">
                          {echange.numero}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Statut:</strong>
                        <span
                          className={`ms-2 badge bg-${getStatusColor(echange.statut)}`}
                        >
                          {getStatusLabel(echange.statut)}
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
                  <i className="fas fa-star me-2 text-warning"></i>
                  Avis et commentaires ({echange.nombre_avis})
                </h3>

                {loadingComments ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted mt-2">Chargement des avis...</p>
                  </div>
                ) : (
                  <>
                    {echange.nombre_avis > 0 && (
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
                    )}

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
                                  <i
                                    className={`fas fa-star fa-2x ${star <= newReview.note ? "text-warning" : "text-muted"}`}
                                  ></i>
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
                            if (!isAuthenticated) {
                              redirectToLogin();
                              return;
                            }
                            setShowAddReview(true);
                          }}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Donner votre avis
                        </button>
                      </div>
                    )}

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
                                  <p className="mb-3">{comment.commentaire}</p>
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
                              <i
                                className={`fas fa-${showMoreComments ? "chevron-up" : "chevron-down"} me-2`}
                              ></i>
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
                          <i className="fas fa-comment-slash fa-3x text-muted"></i>
                        </div>
                        <h5 className="text-muted mb-2">
                          Aucun avis pour le moment
                        </h5>
                        <p className="text-muted mb-4">
                          Soyez le premier à donner votre avis sur cet échange.
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
                      <i className="fas fa-th-large me-2 text-primary"></i>
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
                                e.currentTarget.src = getDefaultEchangeImage();
                              }}
                            />
                            <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
                              Échange
                            </span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title fw-bold">
                              {echangeSim.nomElementEchange}
                            </h6>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>{renderStars(echangeSim.note_moyenne)}</div>
                              <small className="text-muted">
                                ({safeToFixed(echangeSim.note_moyenne)})
                              </small>
                            </div>
                            <div className="mb-3">
                              <span className="text-muted d-block small">
                                {echangeSim.typeEchange === "produit"
                                  ? "Produit"
                                  : "Service"}
                              </span>
                              <small className="text-muted">
                                {echangeSim.objetPropose} →{" "}
                                {echangeSim.objetDemande}
                              </small>
                              {echangeSim.categorie && (
                                <small className="text-muted d-block mt-1">
                                  <i className="fas fa-tag me-1"></i>
                                  {echangeSim.categorie.libelle}
                                </small>
                              )}
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
                                <i className="fas fa-eye me-1"></i>
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
            {/* Carte créateur */}
            {createur && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-user-circle text-primary fa-lg"></i>
                    </div>
                    <div>
                      <h4 className="h5 fw-bold mb-0">Créateur</h4>
                      <p className="text-muted mb-0">
                        Informations du créateur
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    {createur.avatar ? (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden border border-3 border-primary"
                        style={{ width: "100px", height: "100px" }}
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
                        className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 border border-3 border-primary"
                        style={{ width: "100px", height: "100px" }}
                      >
                        <i className="fas fa-user fa-3x text-muted"></i>
                      </div>
                    )}
                    <h5 className="fw-bold mb-2">
                      {createur.prenoms} {createur.nom}
                    </h5>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <span className="badge bg-success">
                        <i className="fas fa-certificate me-1"></i>
                        Créateur vérifié
                      </span>
                      <span className="badge bg-info">
                        <i className="fas fa-user me-1"></i>
                        {createur.userType === "utilisateur"
                          ? "Utilisateur"
                          : "Vendeur"}
                      </span>
                    </div>
                  </div>

                  <div className="border-top pt-4">
                    {contactVisible ? (
                      <div className="space-y-4">
                        {/* BOUTON WHATSAPP */}
                        {createur.telephone && (
                          <button
                            className="btn btn-success d-flex align-items-center justify-content-center gap-3 py-3 w-100 mb-3"
                            onClick={() => openWhatsApp(createur.telephone)}
                          >
                            <i className="fab fa-whatsapp fa-2x"></i>
                            <div className="text-start">
                              <div className="fw-bold">WhatsApp</div>
                              <small className="opacity-75">
                                {formatPhoneNumber(createur.telephone)}
                              </small>
                            </div>
                          </button>
                        )}

                        {/* BOUTON FACEBOOK - CORRIGÉ */}
                        {createur.facebook_url && (
                          <button
                            className="btn btn-primary d-flex align-items-center justify-content-center gap-3 py-3 w-100 mb-3"
                            onClick={() => {
                              // ✅ CORRIGÉ: Vérification que facebook_url n'est pas undefined
                              if (createur.facebook_url) {
                                openFacebook(createur.facebook_url);
                              }
                            }}
                          >
                            <i className="fab fa-facebook-f fa-2x"></i>
                            <div className="text-start">
                              <div className="fw-bold">Facebook</div>
                              <small className="opacity-75">
                                Profil Facebook
                              </small>
                            </div>
                          </button>
                        )}
                        {/* ✅ BOUTON MESSAGERIE - REDIRECTION DIRECTE */}
                        <button
                          className="btn btn-info d-flex align-items-center justify-content-center gap-3 py-3 w-100 mb-3"
                          onClick={handleContactCreateur}
                        >
                          <i className="fas fa-envelope fa-2x"></i>
                          <div className="text-start">
                            <div className="fw-bold">Messagerie OSKAR</div>
                            <small className="opacity-75">
                              Nouvelle conversation
                            </small>
                          </div>
                        </button>
                        {/* EMAIL */}
                        {createur.email && (
                          <div className="alert alert-light border">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-envelope text-primary fa-lg me-3"></i>
                              <div className="flex-grow-1">
                                <div className="fw-bold mb-1">Email</div>
                                <div className="text-break">
                                  {createur.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="alert alert-warning mt-3">
                          <h6 className="fw-bold">
                            <i className="fas fa-shield-alt me-2"></i>
                            Conseils de sécurité
                          </h6>
                          <ul className="mb-0 small">
                            <li>Rencontrez-vous dans un lieu public</li>
                            <li>Vérifiez l'article avant l'échange</li>
                            <li>Ne partagez pas d'informations personnelles</li>
                            <li>Privilégiez les échanges équitables</li>
                          </ul>
                        </div>
                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={() => setContactVisible(false)}
                        >
                          <i className="fas fa-eye-slash me-2"></i>
                          Masquer les contacts
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => setContactVisible(true)}
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir les options de contact
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
                  <i className="fas fa-info-circle me-2 text-info"></i>
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
                      <span className="text-muted">Type</span>
                      <span className="fw-bold">
                        {getTypeEchangeLabel(echange.typeEchange)}
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
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Numéro</span>
                      <span className="fw-bold text-primary">
                        {echange.numero}
                      </span>
                    </div>
                  </div>
                  {echange.categorie && (
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Catégorie</span>
                        <span className="fw-bold">
                          {echange.categorie.libelle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rencontre */}
            <div className="card shadow-sm border-success">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-handshake me-2 text-success"></i>
                  Rencontre
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Lieu public à convenir
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Horaires flexibles
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Échange direct
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Pas d'argent nécessaire
                  </li>
                </ul>
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {echange.lieu_rencontre}
                  </small>
                </div>
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="card shadow-sm border-warning mt-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning rounded-circle p-2 me-3">
                    <i className="fas fa-shield-alt text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-0">Conseils de Sécurité</h5>
                </div>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Rencontre dans un lieu public
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Informez un proche
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Vérifiez l'état de l'article
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Échange équitable
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Faites confiance à votre instinct
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
