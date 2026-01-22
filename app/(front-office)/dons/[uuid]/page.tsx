// app/dons/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";

// Types basés sur votre API
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
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
  repartition_notes: any | null;
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
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
}

interface DonResponse {
  don: DonAPI;
  similaires: DonSimilaireAPI[];
}

// Types pour notre composant
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
  createdAt: string;
  updatedAt: string;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  est_favoris: boolean;
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

interface DonateurInfo {
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

export default function DonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [don, setDon] = useState<Don | null>(null);
  const [donateur, setDonateur] = useState<DonateurInfo | null>(null);
  const [donsSimilaires, setDonsSimilaires] = useState<DonSimilaire[]>([]);
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

  // URL d'image par défaut pour les dons
  const getDefaultDonImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-don.png`;
  };

  // Normaliser les URLs d'images
  const normalizeImageUrl = (url: string | null): string => {
    if (!url) return getDefaultDonImage();

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

    return getDefaultDonImage();
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

  // Transformer les données API
  const transformDonData = (apiDon: DonAPI): Don => {
    const safeNoteMoyenne =
      apiDon.note_moyenne !== null && !isNaN(apiDon.note_moyenne)
        ? apiDon.note_moyenne
        : 0;

    return {
      uuid: apiDon.uuid,
      nom: apiDon.nom,
      type_don: apiDon.type_don,
      description: apiDon.description,
      prix: apiDon.prix,
      image: normalizeImageUrl(apiDon.image),
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
      note_moyenne: safeNoteMoyenne,
      nombre_avis: apiDon.nombre_avis || 0,
      nombre_favoris: apiDon.nombre_favoris || 0,
      est_favoris: apiDon.est_favoris || false,
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
      image: normalizeImageUrl(apiSimilaire.image),
      localisation: apiSimilaire.localisation,
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

  // Charger les infos du donateur
  const fetchDonateurInfo = useCallback(
    async (utilisateurUuid: string | null, vendeurUuid: string | null) => {
      if (!utilisateurUuid && !vendeurUuid) return;

      try {
        let donateurData: DonateurInfo | null = null;

        if (utilisateurUuid) {
          // Charger les infos utilisateur
          const userResponse = await api.get(
            API_ENDPOINTS.AUTH.UTILISATEUR.DETAIL(utilisateurUuid),
          );
          if (userResponse) {
            donateurData = {
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
          // Charger les infos vendeur
          const vendeurResponse = await api.get(
            API_ENDPOINTS.AUTH.VENDEUR.DETAIL(vendeurUuid),
          );
          if (vendeurResponse) {
            donateurData = {
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

        if (!donateurData) {
          // Données par défaut
          donateurData = {
            nom: don?.nom_donataire?.split(" ")[0] || "Donateur",
            prenoms:
              don?.nom_donataire?.split(" ").slice(1).join(" ") || "OSKAR",
            email: null,
            telephone: "+225 XX XX XX XX",
            avatar: null,
            facebook_url: null,
            whatsapp_url: null,
            twitter_url: null,
            instagram_url: null,
          };
        }

        setDonateur(donateurData);
      } catch (err) {
        console.warn("Erreur chargement info donateur:", err);
        // Données par défaut
        setDonateur({
          nom: don?.nom_donataire?.split(" ")[0] || "Donateur",
          prenoms: don?.nom_donataire?.split(" ").slice(1).join(" ") || "OSKAR",
          email: null,
          telephone: "+225 XX XX XX XX",
          avatar: null,
          facebook_url: null,
          whatsapp_url: null,
          twitter_url: null,
          instagram_url: null,
        });
      }
    },
    [don],
  );

  // Charger les données du don
  const fetchDonDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      // Charger le don
      const response = await api.get<DonResponse>(
        API_ENDPOINTS.DONS.RANDOM_DETAIL(uuid),
      );

      if (!response || !response.don) {
        throw new Error("Don non trouvé");
      }

      // Transformer les données
      const donData = transformDonData(response.don);
      const similairesData = response.similaires.map(transformDonSimilaireData);

      setDon(donData);
      setDonsSimilaires(similairesData);
      setFavori(response.don.est_favoris || false);

      // Préparer les images
      const imageUrls: string[] = [];
      const mainImage = donData.image;
      imageUrls.push(mainImage);
      setImagePrincipale(mainImage);

      similairesData.slice(0, 4).forEach((similaire) => {
        if (similaire.image && !imageUrls.includes(similaire.image)) {
          imageUrls.push(similaire.image);
        }
      });

      // Remplir avec des images par défaut si nécessaire
      while (imageUrls.length < 4) {
        imageUrls.push(getDefaultDonImage());
      }

      setImages(imageUrls);

      // Charger les infos du donateur
      await fetchDonateurInfo(donData.utilisateur_uuid, donData.vendeur_uuid);

      // Charger les commentaires
      fetchCommentaires(donData.uuid);
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
  }, [uuid, fetchCommentaires, fetchDonateurInfo]);

  useEffect(() => {
    if (uuid && loading && !don) {
      fetchDonDetails();
    }
  }, [uuid, fetchDonDetails, loading, don]);

  // Fonctions utilitaires
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || isNaN(price)) {
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
    if (!don) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/dons/${don.uuid}`);
      return;
    }

    try {
      if (favori) {
        // API pour retirer des favoris (à adapter selon votre API)
        await api.delete(`/dons/${don.uuid}/favoris`);
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
        router.push(`/auth/login?redirect=/dons/${don.uuid}`);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleContactDonateur = () => {
    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/dons/${don?.uuid}`);
      return;
    }

    setContactVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!don) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/dons/${don.uuid}`);
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
        router.push(`/auth/login?redirect=/dons/${don.uuid}`);
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
    if (!don) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez ce don sur OSKAR : ${don.nom}`;
    const hashtags = "OSKAR,Don,Partage,Communauté";

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

  const handleShareToDonateur = (platform: string) => {
    if (!donateur) return;

    const message = `Bonjour, je suis intéressé(e) par votre don "${don?.nom}" sur OSKAR. Pourrions-nous discuter ?`;

    const urls: { [key: string]: string | null } = {
      facebook: donateur.facebook_url,
      whatsapp: donateur.whatsapp_url
        ? `https://wa.me/${donateur.whatsapp_url.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
        : null,
      twitter: donateur.twitter_url,
      instagram: donateur.instagram_url,
    };

    const url = urls[platform];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert(`Le donateur n'a pas fourni de lien ${platform}.`);
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

  if (error || !don) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow">
                <div className="card-body py-5">
                  <div className="mb-4">
                    <i className="fas fa-gift fa-4x text-muted"></i>
                  </div>
                  <h1 className="h3 mb-3">Don introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Ce don n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link href="/dons" className="btn btn-outline-primary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Retour aux dons
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
                <Link href="/dons" className="text-decoration-none text-muted">
                  <i className="fas fa-gift me-1"></i>
                  Dons
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {don.nom}
              </li>
            </ol>
            <div className="d-flex gap-2">
              <span
                className={`badge bg-${getStatusColor(don.statut)} px-3 py-2`}
              >
                <i
                  className={`fas fa-${don.disponible ? "check-circle" : "times-circle"} me-1`}
                ></i>
                {getStatusLabel(don.statut)}
              </span>
              <span className="badge bg-purple px-3 py-2">
                <i className="fas fa-gift me-1"></i>
                Don
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
                        alt={don.nom}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultDonImage();
                        }}
                      />
                      <div className="position-absolute top-0 start-0 p-3">
                        <span className="badge bg-purple text-white px-3 py-2">
                          <i className="fas fa-gift me-1"></i>
                          Don
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
                      <h1 className="h3 fw-bold mb-3">{don.nom}</h1>

                      {/* Note et avis */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-3">
                            {renderStars(don.note_moyenne)}
                          </div>
                          <span className="text-muted">
                            {safeToFixed(don.note_moyenne)}
                            /5 ({don.nombre_avis} avis)
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-heart text-danger me-2"></i>
                          <span className="text-muted">
                            {don.nombre_favoris} favoris
                          </span>
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="mb-4">
                        <h2 className="text-success fw-bold mb-2">
                          {formatPrice(don.prix)}
                        </h2>
                        <span className="badge bg-success">
                          <i className="fas fa-hand-holding-heart me-1"></i>
                          Don
                        </span>
                      </div>

                      {/* Informations principales */}
                      <div className="mb-4">
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="bg-light rounded p-3">
                              <small className="text-muted d-block">
                                Quantité
                              </small>
                              <strong>{don.quantite} unité(s)</strong>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light rounded p-3">
                              <small className="text-muted d-block">Type</small>
                              <strong>{don.type_don}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Localisation
                          </small>
                          <strong>{don.localisation}</strong>
                        </div>
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Lieu de retrait
                          </small>
                          <strong>{don.lieu_retrait}</strong>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-lg"
                            onClick={handleContactDonateur}
                            disabled={!don.disponible}
                          >
                            <i className="fas fa-hand-holding-heart me-2"></i>
                            {don.disponible
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
                                  router.push(
                                    `/auth/login?redirect=/dons/${don.uuid}`,
                                  );
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
                      Partager ce don
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
                      <h6 className="text-muted mb-2">Contacter le donateur</h6>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleShareToDonateur("facebook")}
                        >
                          <i className="fab fa-facebook-f me-1"></i>
                          Facebook
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleShareToDonateur("whatsapp")}
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
                            alt={`${don.nom} - vue ${index + 1}`}
                            className="img-fluid h-100 w-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultDonImage();
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
                  Description du don
                </h3>
                {don.description ? (
                  <div className="prose">
                    <p className="lead">{don.description}</p>
                  </div>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour ce don.
                  </p>
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
                        <strong className="text-muted">Type de don:</strong>
                        <span className="ms-2">{don.type_don}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Quantité:</strong>
                        <span className="ms-2">{don.quantite} unité(s)</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Note moyenne:</strong>
                        <span className="ms-2">
                          {safeToFixed(don.note_moyenne)}
                          /5
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Localisation:</strong>
                        <span className="ms-2">{don.localisation}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Date de début:</strong>
                        <span className="ms-2">
                          {formatDate(don.date_debut)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Date de fin:</strong>
                        <span className="ms-2">{formatDate(don.date_fin)}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Lieu de retrait:</strong>
                        <span className="ms-2">{don.lieu_retrait}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Publié le:</strong>
                        <span className="ms-2">
                          {formatDate(don.createdAt)}
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
                  Avis et commentaires ({don.nombre_avis})
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
                                `/auth/login?redirect=/dons/${don.uuid}`,
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
                          Soyez le premier à donner votre avis sur ce don.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Dons similaires */}
            {donsSimilaires.length > 0 && (
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold mb-0">
                      <i className="fas fa-th-large me-2 text-primary"></i>
                      Dons similaires ({donsSimilaires.length})
                    </h3>
                    <Link
                      href="/dons"
                      className="btn btn-outline-primary btn-sm"
                    >
                      Voir tous
                    </Link>
                  </div>

                  <div className="row g-4">
                    {donsSimilaires.map((donSim) => (
                      <div key={donSim.uuid} className="col-md-6">
                        <div className="card border h-100">
                          <div
                            className="position-relative"
                            style={{ height: "200px" }}
                          >
                            <img
                              src={donSim.image}
                              alt={donSim.nom}
                              className="img-fluid h-100 w-100 object-fit-cover"
                              onError={(e) => {
                                e.currentTarget.src = getDefaultDonImage();
                              }}
                            />
                            <span className="position-absolute top-0 start-0 m-2 badge bg-purple">
                              Don
                            </span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title fw-bold">{donSim.nom}</h6>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>{renderStars(donSim.note_moyenne)}</div>
                              <small className="text-muted">
                                ({safeToFixed(donSim.note_moyenne)})
                              </small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="text-muted">
                                {donSim.type_don}
                              </span>
                              <span className="badge bg-light text-dark">
                                {donSim.quantite} unité(s)
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                className={`badge bg-${getStatusColor(donSim.statut)}`}
                              >
                                {getStatusLabel(donSim.statut)}
                              </span>
                              <Link
                                href={`/dons/${donSim.uuid}`}
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
            {/* Carte donateur */}
            {donateur && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-user-circle text-primary fa-lg"></i>
                    </div>
                    <div>
                      <h4 className="h5 fw-bold mb-0">Donateur</h4>
                      <p className="text-muted mb-0">Informations du donneur</p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    {donateur.avatar ? (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <img
                          src={donateur.avatar}
                          alt={`${donateur.prenoms} ${donateur.nom}`}
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
                      {donateur.prenoms} {donateur.nom}
                    </h5>
                    <span className="badge bg-success mb-3">
                      <i className="fas fa-certificate me-1"></i>
                      Donateur vérifié
                    </span>
                  </div>

                  {/* Réseaux sociaux du donateur */}
                  {(donateur.facebook_url ||
                    donateur.whatsapp_url ||
                    donateur.twitter_url) && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Contacter le donateur</h6>
                      <div className="d-flex gap-2 justify-content-center">
                        {donateur.facebook_url && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShareToDonateur("facebook")}
                            title="Contacter sur Facebook"
                          >
                            <i className="fab fa-facebook-f"></i>
                          </button>
                        )}
                        {donateur.whatsapp_url && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleShareToDonateur("whatsapp")}
                            title="Contacter sur WhatsApp"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                        )}
                        {donateur.twitter_url && (
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleShareToDonateur("twitter")}
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
                            {donateur.telephone}
                          </span>
                        </p>
                        {donateur.email && (
                          <p className="mb-2 fw-bold">
                            Email:{" "}
                            <span className="text-success">
                              {donateur.email}
                            </span>
                          </p>
                        )}
                        <small className="text-muted d-block">
                          <i className="fas fa-info-circle me-1"></i>
                          Contactez le donateur pour organiser le retrait
                        </small>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={handleContactDonateur}
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir le contact
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Informations don */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-info-circle me-2 text-info"></i>
                  Informations du don
                </h5>

                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Statut</span>
                      <span
                        className={`badge bg-${getStatusColor(don.statut)}`}
                      >
                        {getStatusLabel(don.statut)}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Disponibilité</span>
                      <span
                        className={`fw-bold ${don.disponible ? "text-success" : "text-danger"}`}
                      >
                        {don.disponible ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Note moyenne</span>
                      <span className="fw-bold">
                        {safeToFixed(don.note_moyenne)}/5
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Nombre d'avis</span>
                      <span className="fw-bold">{don.nombre_avis}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Référence</span>
                      <span className="fw-bold">
                        {don.uuid.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Retrait et livraison */}
            <div className="card shadow-sm border-success">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-shipping-fast me-2 text-success"></i>
                  Retrait & Livraison
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Retrait sur place
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Livraison possible (selon donateur)
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Horaires flexibles
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Accès PMR
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
                  <h5 className="fw-bold mb-0">Conseils de Sécurité</h5>
                </div>
                <ul className="list-unstyled mb-0">
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
                    Vérifiez l'article
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Évitez les paiements
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

        {/* Dons récemment consultés */}
        {donsSimilaires.length > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold">
                <i className="fas fa-history me-2 text-primary"></i>
                Dons similaires
              </h3>
              <Link href="/dons" className="btn btn-outline-primary btn-sm">
                Voir tout
              </Link>
            </div>

            <div className="row g-4">
              {donsSimilaires.map((donSim) => (
                <div key={donSim.uuid} className="col-md-3">
                  <div className="card border h-100">
                    <div
                      className="position-relative"
                      style={{ height: "150px" }}
                    >
                      <img
                        src={donSim.image}
                        alt={donSim.nom}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultDonImage();
                        }}
                      />
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold">{donSim.nom}</h6>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">{donSim.type_don}</small>
                        <small className="text-muted">
                          {donSim.quantite} unité(s)
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <span
                            className={`badge bg-${getStatusColor(donSim.statut)}`}
                          >
                            {getStatusLabel(donSim.statut)}
                          </span>
                        </small>
                        <Link
                          href={`/dons/${donSim.uuid}`}
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
        .bg-purple {
          background-color: #9c27b0 !important;
        }
        .btn-outline-purple {
          color: #9c27b0;
          border-color: #9c27b0;
        }
        .btn-outline-purple:hover {
          background-color: #9c27b0;
          color: white;
        }
      `}</style>
    </div>
  );
}
