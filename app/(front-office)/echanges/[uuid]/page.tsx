// app/echanges/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";

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

interface InitiateurInfo {
  nom: string;
  prenoms: string;
  email: string | null;
  telephone: string | null;
  avatar: string | null;
  facebook_url: string | null;
  whatsapp_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
}

export default function EchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [echange, setEchange] = useState<Echange | null>(null);
  const [initiateur, setInitiateur] = useState<InitiateurInfo | null>(null);
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

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = () => {
      const token = api.getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

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

  // Charger les infos de l'initiateur
  const fetchInitiateurInfo = useCallback(
    async (utilisateurUuid: string | null, vendeurUuid: string | null) => {
      if (!utilisateurUuid && !vendeurUuid) return;

      try {
        let initiateurData: InitiateurInfo | null = null;

        if (utilisateurUuid) {
          const userResponse = await api.get(
            API_ENDPOINTS.AUTH.UTILISATEUR.DETAIL(utilisateurUuid),
          );
          if (userResponse) {
            initiateurData = {
              nom: userResponse.nom || "",
              prenoms: userResponse.prenoms || "",
              email: userResponse.email || null,
              telephone: userResponse.telephone || null,
              avatar: userResponse.avatar
                ? normalizeImageUrl(userResponse.avatar)
                : null,
              facebook_url: userResponse.facebook_url || null,
              whatsapp_url: userResponse.whatsapp_url || null,
              twitter_url: userResponse.twitter_url || null,
              instagram_url: userResponse.instagram_url || null,
            };
          }
        } else if (vendeurUuid) {
          const vendeurResponse = await api.get(
            API_ENDPOINTS.AUTH.VENDEUR.DETAIL(vendeurUuid),
          );
          if (vendeurResponse) {
            initiateurData = {
              nom: vendeurResponse.nom || "",
              prenoms: vendeurResponse.prenoms || "",
              email: vendeurResponse.email || null,
              telephone: vendeurResponse.telephone || null,
              avatar: vendeurResponse.avatar
                ? normalizeImageUrl(vendeurResponse.avatar)
                : null,
              facebook_url: vendeurResponse.facebook_url || null,
              whatsapp_url: vendeurResponse.whatsapp_url || null,
              twitter_url: vendeurResponse.twitter_url || null,
              instagram_url: vendeurResponse.instagram_url || null,
            };
          }
        }

        if (!initiateurData) {
          initiateurData = {
            nom: echange?.nom_initiateur?.split(" ")[0] || "Initiateur",
            prenoms:
              echange?.nom_initiateur?.split(" ").slice(1).join(" ") || "OSKAR",
            email: null,
            telephone: echange?.numero || "+225 XX XX XX XX",
            avatar: null,
            facebook_url: null,
            whatsapp_url: null,
            twitter_url: null,
            instagram_url: null,
          };
        }

        setInitiateur(initiateurData);
      } catch (err) {
        console.warn("Erreur chargement info initiateur:", err);
        setInitiateur({
          nom: echange?.nom_initiateur?.split(" ")[0] || "Initiateur",
          prenoms:
            echange?.nom_initiateur?.split(" ").slice(1).join(" ") || "OSKAR",
          email: null,
          telephone: echange?.numero || "+225 XX XX XX XX",
          avatar: null,
          facebook_url: null,
          whatsapp_url: null,
          twitter_url: null,
          instagram_url: null,
        });
      }
    },
    [echange],
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

      // Charger les infos de l'initiateur
      await fetchInitiateurInfo(
        echangeData.utilisateur_uuid,
        echangeData.vendeur_uuid,
      );

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
  }, [uuid, fetchCommentaires, fetchInitiateurInfo]);

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

  // Handlers
  const handleAddToFavorites = async () => {
    if (!echange) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
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
        router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleAcceptEchange = async () => {
    if (!echange) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
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
          router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
        } else {
          alert("Une erreur est survenue lors de l'acceptation de l'échange.");
        }
      }
    }
  };

  const handleRefuseEchange = async () => {
    if (!echange) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
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
          router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
        } else {
          alert("Une erreur est survenue lors du refus de l'échange.");
        }
      }
    }
  };

  const handleContactInitiateur = () => {
    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/echanges/${echange?.uuid}`);
      return;
    }

    setContactVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!echange) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
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
        router.push(`/auth/login?redirect=/echanges/${echange.uuid}`);
      } else {
        alert(
          "Une erreur est survenue lors de l'ajout de votre avis. Veuillez réessayer.",
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fonctions de partage vers réseaux sociaux
  const handleShare = (platform: string) => {
    if (!echange) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez cet échange sur OSKAR : ${echange.nomElementEchange}`;
    const hashtags = "OSKAR,Échange,Troc,Communauté";

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

  const handleShareToInitiateur = (platform: string) => {
    if (!initiateur) return;

    const message = `Bonjour, je suis intéressé(e) par votre échange "${echange?.nomElementEchange}" sur OSKAR. Pourrions-nous discuter ?`;

    const urls: { [key: string]: string | null } = {
      facebook: initiateur.facebook_url,
      whatsapp: initiateur.whatsapp_url
        ? `https://wa.me/${initiateur.whatsapp_url.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
        : null,
      twitter: initiateur.twitter_url,
      instagram: initiateur.instagram_url,
    };

    const url = urls[platform];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert(`L'initiateur n'a pas fourni de lien ${platform}.`);
    }
  };

  // Copier le lien
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
              <span className="badge bg-info px-3 py-2">
                <i className="fas fa-exchange-alt me-1"></i>
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
                          <i className="fas fa-exchange-alt me-1"></i>
                          Échange
                        </span>
                      </div>
                      <button
                        onClick={handleAddToFavorites}
                        className={`position-absolute top-0 end-0 m-3 btn ${favori ? "btn-danger" : "btn-light"} rounded-circle`}
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
                          <i className="fas fa-heart text-danger me-2"></i>
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
                          <strong>{formatDate(echange.dateProposition)}</strong>
                        </div>
                      </div>

                      {/* Message du demandeur */}
                      {echange.message && (
                        <div className="alert alert-info mb-4">
                          <i className="fas fa-comment-dots me-2"></i>
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
                                <i className="fas fa-check-circle me-2"></i>
                                Accepter l'échange
                              </button>
                              <button
                                className="btn btn-outline-danger btn-lg"
                                onClick={handleRefuseEchange}
                              >
                                <i className="fas fa-times-circle me-2"></i>
                                Refuser l'échange
                              </button>
                            </>
                          )}
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
                              onClick={handleContactInitiateur}
                            >
                              <i className="fas fa-comment me-2"></i>
                              Contacter
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
                    <div className="col-6">
                      <h6 className="text-muted mb-2">
                        Partager sur les réseaux
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleShare("facebook")}
                        >
                          <i className="fab fa-facebook-f me-1"></i>
                          Facebook
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleShare("twitter")}
                        >
                          <i className="fab fa-twitter me-1"></i>
                          Twitter
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleShare("whatsapp")}
                        >
                          <i className="fab fa-whatsapp me-1"></i>
                          WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="text-muted mb-2">
                        Contacter l'initiateur
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleShareToInitiateur("facebook")}
                        >
                          <i className="fab fa-facebook-f me-1"></i>
                          Facebook
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleShareToInitiateur("whatsapp")}
                        >
                          <i className="fab fa-whatsapp me-1"></i>
                          WhatsApp
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
                          <i className="fas fa-copy me-1"></i>
                          Copier
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

            {/* Détails de l'échange */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-4">
                  <i className="fas fa-exchange-alt me-2 text-primary"></i>
                  Détails de l'échange
                </h3>

                <div className="row">
                  <div className="col-md-6">
                    <div className="card border-info mb-4">
                      <div className="card-body">
                        <h5 className="text-info mb-3">
                          <i className="fas fa-arrow-up me-2"></i>
                          Ce que je propose
                        </h5>
                        <h4 className="fw-bold mb-3">{echange.objetPropose}</h4>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-user text-muted me-2"></i>
                          <span>Proposé par : {echange.nom_initiateur}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-success mb-4">
                      <div className="card-body">
                        <h5 className="text-success mb-3">
                          <i className="fas fa-arrow-down me-2"></i>
                          Ce que je recherche
                        </h5>
                        <h4 className="fw-bold mb-3">{echange.objetDemande}</h4>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-users text-muted me-2"></i>
                          <span>Destinataire : {echange.typeDestinataire}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Type d'échange:</strong>
                        <span className="ms-2">{echange.typeEchange}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Valeur estimée:</strong>
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
                              router.push(
                                `/auth/login?redirect=/echanges/${echange.uuid}`,
                              );
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
                            <span className="position-absolute top-0 start-0 m-2 badge bg-info">
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
            {/* Carte initiateur */}
            {initiateur && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-user-circle text-primary fa-lg"></i>
                    </div>
                    <div>
                      <h4 className="h5 fw-bold mb-0">Initiateur</h4>
                      <p className="text-muted mb-0">
                        Informations du demandeur
                      </p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    {initiateur.avatar ? (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <img
                          src={initiateur.avatar}
                          alt={`${initiateur.prenoms} ${initiateur.nom}`}
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
                        <i className="fas fa-user fa-2x text-muted"></i>
                      </div>
                    )}
                    <h5 className="fw-bold mb-2">
                      {initiateur.prenoms} {initiateur.nom}
                    </h5>
                    <span className="badge bg-success mb-3">
                      <i className="fas fa-certificate me-1"></i>
                      Membre vérifié
                    </span>
                  </div>

                  {/* Réseaux sociaux de l'initiateur */}
                  {(initiateur.facebook_url ||
                    initiateur.whatsapp_url ||
                    initiateur.twitter_url) && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Contacter l'initiateur</h6>
                      <div className="d-flex gap-2 justify-content-center">
                        {initiateur.facebook_url && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShareToInitiateur("facebook")}
                            title="Contacter sur Facebook"
                          >
                            <i className="fab fa-facebook-f"></i>
                          </button>
                        )}
                        {initiateur.whatsapp_url && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleShareToInitiateur("whatsapp")}
                            title="Contacter sur WhatsApp"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                        )}
                        {initiateur.twitter_url && (
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleShareToInitiateur("twitter")}
                            title="Contacter sur Twitter"
                          >
                            <i className="fab fa-twitter"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Informations contact */}
                  <div className="border-top pt-4">
                    {contactVisible ? (
                      <div className="alert alert-success">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">
                            <i className="fas fa-phone me-2"></i>
                            Contact disponible
                          </h6>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setContactVisible(false)}
                          >
                            <i className="fas fa-eye-slash"></i>
                          </button>
                        </div>
                        <p className="mb-2 fw-bold">
                          Téléphone:{" "}
                          <span className="text-success">
                            {initiateur.telephone}
                          </span>
                        </p>
                        {initiateur.email && (
                          <p className="mb-2 fw-bold">
                            Email:{" "}
                            <span className="text-success">
                              {initiateur.email}
                            </span>
                          </p>
                        )}
                        <small className="text-muted d-block">
                          <i className="fas fa-info-circle me-1"></i>
                          Contactez l'initiateur pour discuter de l'échange
                        </small>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={handleContactInitiateur}
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir le contact
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
                  <i className="fas fa-exchange-alt me-2 text-success"></i>
                  Processus d'échange
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Proposition envoyée
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Discussion des termes
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Acceptation mutuelle
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
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
                    <i className="fas fa-shield-alt text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-0">Conseils pour l'échange</h5>
                </div>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Vérifiez l'état des objets
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Lieu public et sécurisé
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Évitez les paiements en liquide
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Informez un proche
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

        {/* Échanges récemment consultés */}
        {echangesSimilaires.length > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold">
                <i className="fas fa-history me-2 text-primary"></i>
                Échanges similaires
              </h3>
              <Link href="/echanges" className="btn btn-outline-primary btn-sm">
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
                        <small className="text-muted d-block">Propose :</small>
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
    </div>
  );
}
