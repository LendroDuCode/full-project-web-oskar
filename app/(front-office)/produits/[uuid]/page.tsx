// app/produits/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG, buildApiUrl } from "@/config/env";

// Types basés sur votre réponse API
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
  statut: string;
  image: string | null;
  prix: string | number;
  description: string | null;
  etoile: number;
  vendeurUuid: string;
  boutiqueUuid: string;
  categorie_uuid: string;
  categorie?: {
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
  };
  boutique?: {
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
  };
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
  nombre_favoris: number;
  etoiles_pleines: number;
  etoiles_vides: number;
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
  statut: string;
  image: string;
  prix: string | number;
  description: string | null;
  etoile: number;
  vendeurUuid: string;
  boutiqueUuid: string;
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
  nombre_favoris: number;
  etoiles_pleines: number;
  etoiles_vides: number;
}

interface APIResponse {
  produit: ProduitAPI;
  similaires: ProduitSimilaireAPI[];
}

// Types pour notre composant
interface Produit {
  uuid: string;
  nom: string;
  libelle: string;
  slug: string;
  image: string | null;
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
  vendeurUuid: string;
  boutiqueUuid: string;
  createdAt: string;
  updatedAt: string;
  categorie?: {
    uuid: string;
    libelle: string;
    description: string;
  };
}

interface ProduitSimilaire {
  uuid: string;
  nom: string;
  libelle: string;
  prix: number;
  image: string | null;
  statut: string;
  note_moyenne: number;
  disponible: boolean;
  quantite: number;
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
}

interface CommentaireAPI {
  uuid: string;
  contenu: string;
  note: number | null;
  utilisateurUuid: string;
  utilisateur?: {
    nom: string;
    prenoms: string;
    avatar: string | null;
  };
  produitUuid: string;
  date_creation: string;
  date_modification: string | null;
  likes: number;
  reponses?: CommentaireAPI[];
  is_helpful?: boolean;
}

interface NoteAPI {
  uuid: string;
  note: number;
  commentaire: string | null;
  utilisateurUuid: string;
  utilisateur?: {
    nom: string;
    prenoms: string;
    avatar: string | null;
  };
  produitUuid: string;
  date_creation: string;
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
  reponses?: Commentaire[];
}

export default function ProduitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [produit, setProduit] = useState<Produit | null>(null);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [produitsSimilaires, setProduitsSimilaires] = useState<
    ProduitSimilaire[]
  >([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imagePrincipale, setImagePrincipale] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantite, setQuantite] = useState(1);
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

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = () => {
      const token = api.getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Écouter les changements d'authentification
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Normaliser les URLs d'images - CORRIGÉE
  const normalizeImageUrl = (url: string | null): string => {
    if (!url) return "";

    // Si c'est déjà une URL complète
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Si c'est un chemin relatif avec le préfixe de l'API
    if (url.startsWith("/api/files/")) {
      const cleanUrl = url.replace("/api/files/", "");
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/api/files/${cleanUrl}`;
    }

    // Pour les URLs S3 (comme celles de la boutique)
    if (url.includes("oskar-bucket")) {
      return url;
    }

    // Pour les autres cas, essayer de construire une URL complète
    if (url.includes("/")) {
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${url.startsWith("/") ? url : "/" + url}`;
    }

    return "";
  };

  // URL d'avatar par défaut
  const getDefaultAvatarUrl = () => {
    return "https://ui-avatars.com/api/?name=Utilisateur&background=random&color=fff&size=50";
  };

  // Transformer les données API vers notre format
  const transformProduitData = (apiProduit: ProduitAPI): Produit => {
    return {
      uuid: apiProduit.uuid,
      nom: apiProduit.libelle,
      libelle: apiProduit.libelle,
      slug: apiProduit.slug,
      image: normalizeImageUrl(apiProduit.image),
      image_key: apiProduit.image_key,
      disponible: apiProduit.disponible,
      statut: apiProduit.statut,
      prix:
        typeof apiProduit.prix === "string"
          ? parseFloat(apiProduit.prix)
          : apiProduit.prix,
      description: apiProduit.description,
      etoile: apiProduit.etoile,
      note_moyenne: apiProduit.note_moyenne,
      nombre_avis: apiProduit.nombre_avis,
      nombre_favoris: apiProduit.nombre_favoris,
      quantite: apiProduit.quantite,
      vendeurUuid: apiProduit.vendeurUuid,
      boutiqueUuid: apiProduit.boutiqueUuid,
      createdAt: apiProduit.createdAt || new Date().toISOString(),
      updatedAt: apiProduit.updatedAt || new Date().toISOString(),
      ...(apiProduit.categorie && {
        categorie: {
          uuid: apiProduit.categorie.uuid,
          libelle: apiProduit.categorie.libelle,
          description: apiProduit.categorie.description,
        },
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
          ? parseFloat(apiSimilaire.prix)
          : apiSimilaire.prix,
      image: normalizeImageUrl(apiSimilaire.image),
      statut: apiSimilaire.statut,
      note_moyenne: apiSimilaire.note_moyenne,
      disponible: apiSimilaire.disponible,
      quantite: apiSimilaire.quantite,
    };
  };

  const transformBoutiqueData = (apiBoutique: any): Boutique => {
    return {
      uuid: apiBoutique.uuid,
      nom: apiBoutique.nom,
      description: apiBoutique.description,
      statut: apiBoutique.statut,
      slug: apiBoutique.slug,
      logo: apiBoutique.logo ? normalizeImageUrl(apiBoutique.logo) : null,
      banniere: apiBoutique.banniere
        ? normalizeImageUrl(apiBoutique.banniere)
        : null,
      logo_key: apiBoutique.logo_key,
      banniere_key: apiBoutique.banniere_key,
      est_bloque: apiBoutique.est_bloque || false,
      est_ferme: apiBoutique.est_ferme || false,
      created_at: apiBoutique.created_at,
      updated_at: apiBoutique.updated_at,
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
      date: apiCommentaire.date_creation,
      likes: apiCommentaire.likes || 0,
      is_helpful: apiCommentaire.is_helpful || false,
      reponses: apiCommentaire.reponses?.map(transformCommentaireData),
    };
  };

  // Charger les commentaires et notes
  const fetchCommentaires = useCallback(
    async (produitUuid: string) => {
      if (!produitUuid || commentairesFetched) return;

      try {
        setLoadingComments(true);

        // Charger les commentaires depuis l'API
        try {
          // Endpoint pour les commentaires d'un produit
          const commentairesResponse = await api.get<CommentaireAPI[]>(
            API_ENDPOINTS.COMMENTAIRES.BY_PRODUIT(produitUuid),
          );

          let commentairesData: CommentaireAPI[] = [];

          if (Array.isArray(commentairesResponse)) {
            commentairesData = commentairesResponse;
          } else if (commentairesResponse) {
            commentairesData = Array.isArray(commentairesResponse)
              ? commentairesResponse
              : [];
          }

          // Charger les notes depuis l'API
          const notesResponse = await api.get<NoteAPI[]>(
            `${API_ENDPOINTS.PRODUCTS.DETAIL(produitUuid)}/notes`,
          );

          let notesData: NoteAPI[] = [];
          

          if (Array.isArray(notesResponse)) {
            notesData = notesResponse;
          } else if (notesResponse) {
            notesData = Array.isArray(notesResponse)
              ? notesResponse
              : [];
          }

          // Fusionner les commentaires et notes
          // Note: Dans votre API, les notes et commentaires pourraient être séparés
          // On va considérer que les commentaires incluent déjà les notes si disponibles
          // Sinon, on combine les deux listes
          const allComments: Commentaire[] = [];

          // Ajouter d'abord les commentaires avec notes
          commentairesData.forEach((comment) => {
            if (comment.note) {
              allComments.push(transformCommentaireData(comment));
            }
          });

          // Ajouter les notes sans commentaires
          notesData.forEach((note) => {
            // Vérifier si cette note a déjà été ajoutée via un commentaire
            const existingComment = allComments.find(
              (c) =>
                c.utilisateur_nom.includes(note.utilisateur?.nom || "") &&
                c.note === note.note,
            );

            if (!existingComment && note.commentaire) {
              allComments.push({
                uuid: note.uuid,
                utilisateur_nom: note.utilisateur
                  ? `${note.utilisateur.prenoms || ""} ${note.utilisateur.nom || ""}`.trim() ||
                    "Utilisateur"
                  : "Utilisateur",
                utilisateur_photo: note.utilisateur?.avatar
                  ? normalizeImageUrl(note.utilisateur.avatar)
                  : getDefaultAvatarUrl(),
                note: note.note,
                commentaire: note.commentaire,
                date: note.date_creation,
                likes: 0,
                is_helpful: false,
              });
            }
          });

          // Trier par date (plus récent en premier)
          allComments.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          setCommentaires(allComments);
          setCommentairesFetched(true);
        } catch (apiError: any) {
          console.warn("Erreur chargement commentaires API:", apiError);

          // Fallback: données minimales si l'API échoue
          const fallbackComments: Commentaire[] = [
            {
              uuid: "fallback-1",
              utilisateur_nom: "Utilisateur OSKAR",
              utilisateur_photo: getDefaultAvatarUrl(),
              note: produit?.note_moyenne || 4,
              commentaire:
                "Aucun commentaire disponible pour le moment. Soyez le premier à donner votre avis !",
              date: new Date().toISOString(),
              likes: 0,
              is_helpful: false,
            },
          ];

          setCommentaires(fallbackComments);
          setCommentairesFetched(true);
        }
      } catch (err) {
        console.error("Erreur générale chargement commentaires:", err);
        setCommentaires([]);
        setCommentairesFetched(true);
      } finally {
        setLoadingComments(false);
      }
    },
    [produit?.note_moyenne, commentairesFetched],
  );

  // Charger les données du produit
  const fetchProduitDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Charger le produit avec l'endpoint aléatoire
      try {
        const response = await api.get<APIResponse>(
          API_ENDPOINTS.PRODUCTS.DETAIL_ALEATOIRE(uuid),
        );

        if (!response || !response.produit) {
          throw new Error("Produit non trouvé");
        }

        // Transformer les données
        const produitData = transformProduitData(response.produit);
        const similairesData = response.similaires.map(
          transformProduitSimilaireData,
        );

        setProduit(produitData);
        setProduitsSimilaires(similairesData);
        setFavori(response.produit.is_favoris || false);

        // 2. Préparer les images
        const imageUrls: string[] = [];
        const mainImage =
          produitData.image ||
          "https://via.placeholder.com/400x400?text=Produit+OSKAR";
        imageUrls.push(mainImage);
        setImagePrincipale(mainImage);

        // Ajouter des images supplémentaires depuis les produits similaires
        similairesData.slice(0, 4).forEach((similaire) => {
          if (similaire.image && !imageUrls.includes(similaire.image)) {
            imageUrls.push(similaire.image);
          }
        });

        // Si moins de 4 images, ajouter des placeholders
        while (imageUrls.length < 4) {
          imageUrls.push(
            "https://via.placeholder.com/400x400?text=Produit+OSKAR",
          );
        }

        setImages(imageUrls);

        // 3. Traiter les données de la boutique
        if (response.produit.boutique) {
          // Si la boutique est incluse dans la réponse du produit
          const boutiqueData = transformBoutiqueData(response.produit.boutique);
          setBoutique(boutiqueData);
        } else if (produitData.boutiqueUuid) {
          // Sinon, charger la boutique séparément
          try {
            const boutiqueResponse = await api.get(
              API_ENDPOINTS.BOUTIQUES.DETAIL(produitData.boutiqueUuid),
            );
            const boutiqueData = transformBoutiqueData(boutiqueResponse);
            setBoutique(boutiqueData);
          } catch (err) {
            console.warn("Impossible de charger les détails de la boutique");
            setBoutique({
              uuid: produitData.boutiqueUuid,
              nom: "Boutique OSKAR",
              description: "Boutique officielle OSKAR",
              statut: "en_review",
              slug: "boutique-oskar",
              logo: null,
              banniere: null,
              est_bloque: false,
              est_ferme: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        // 4. Charger les commentaires
        fetchCommentaires(produitData.uuid);
      } catch (err: any) {
        // Si erreur 404 ou 401, utiliser des données factices pour la démo
        if (err.response?.status === 404 || err.response?.status === 401) {
          console.warn("Erreur API, utilisation données factices");

          // Données factices pour le produit
          const produitData: Produit = {
            uuid: uuid,
            nom: "Produit OSKAR",
            libelle: "Produit OSKAR",
            slug: "produit-oskar",
            image: "https://via.placeholder.com/400x400?text=Produit+OSKAR",
            disponible: true,
            statut: "publie",
            prix: 10000,
            description: "Description du produit",
            etoile: 4.5,
            note_moyenne: 4.5,
            nombre_avis: 0,
            nombre_favoris: 0,
            quantite: 5,
            vendeurUuid: "vendeur-123",
            boutiqueUuid: "boutique-456",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Données factices pour les produits similaires
          const similairesData: ProduitSimilaire[] = [
            {
              uuid: "sim1",
              nom: "Produit Similaire 1",
              libelle: "Produit Similaire 1",
              prix: 12000,
              image:
                "https://via.placeholder.com/400x400?text=Produit+Similaire",
              statut: "bon_etat",
              note_moyenne: 4.5,
              disponible: true,
              quantite: 3,
            },
          ];

          setProduit(produitData);
          setProduitsSimilaires(similairesData);

          // Préparer les images factices
          const imageUrls: string[] = [
            "https://via.placeholder.com/400x400?text=Produit+OSKAR",
            "https://via.placeholder.com/400x400?text=Produit+Similaire",
          ];
          setImages(imageUrls);
          setImagePrincipale(
            "https://via.placeholder.com/400x400?text=Produit+OSKAR",
          );

          // Boutique factice
          setBoutique({
            uuid: produitData.boutiqueUuid,
            nom: "Boutique OSKAR",
            description: "Boutique officielle OSKAR",
            statut: "en_review",
            slug: "boutique-oskar",
            logo: null,
            banniere: null,
            est_bloque: false,
            est_ferme: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          // Charger les commentaires
          fetchCommentaires(produitData.uuid);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error("Erreur détail produit:", err);

      if (
        err.message.includes("404") ||
        err.message.includes("Produit non trouvé")
      ) {
        setError("Ce produit n'existe pas ou a été supprimé.");
      } else if (err.message.includes("401")) {
        setError("Vous devez être connecté pour voir ce produit.");
      } else {
        setError(
          "Impossible de charger les détails du produit. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [uuid, fetchCommentaires]);

  // Charger les données une seule fois
  useEffect(() => {
    if (uuid && loading && !produit) {
      fetchProduitDetails();
    }
  }, [uuid, fetchProduitDetails, loading, produit]);

  // Fonctions utilitaires
  const formatPrice = (price: number) => {
    return price.toLocaleString("fr-FR") + " FCFA";
  };

  const formatDate = (dateString: string) => {
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

  const renderStars = (rating: number) => {
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

  const renderRatingStars = (rating: number) => {
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

  const getConditionBadge = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "neuf":
        return {
          text: "Neuf",
          color: "success",
          bgColor: "bg-success",
          icon: "fa-certificate",
        };
      case "bon_etat":
        return {
          text: "Bon état",
          color: "warning",
          bgColor: "bg-warning",
          icon: "fa-thumbs-up",
        };
      case "occasion":
        return {
          text: "Occasion",
          color: "info",
          bgColor: "bg-info",
          icon: "fa-recycle",
        };
      case "publie":
        return {
          text: "Publié",
          color: "primary",
          bgColor: "bg-primary",
          icon: "fa-check",
        };
      default:
        return {
          text: "À vérifier",
          color: "secondary",
          bgColor: "bg-secondary",
          icon: "fa-question",
        };
    }
  };

  // Calculer les statistiques des notes depuis les commentaires réels
  const calculateNoteStats = () => {
    if (commentaires.length === 0) {
      return {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
        total: 0,
        moyenne: produit?.note_moyenne || 0,
      };
    }

    const stats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
      total: commentaires.length,
      moyenne: 0,
    };

    let totalNotes = 0;

    commentaires.forEach((comment) => {
      const note = comment.note;
      if (note >= 4.5) stats[5]++;
      else if (note >= 3.5) stats[4]++;
      else if (note >= 2.5) stats[3]++;
      else if (note >= 1.5) stats[2]++;
      else stats[1]++;

      totalNotes += note;
    });

    stats.moyenne = totalNotes / commentaires.length;

    return stats;
  };

  const noteStats = calculateNoteStats();

  // Handlers
  const handleAddToFavorites = async () => {
    if (!produit) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      return;
    }

    try {
      if (favori) {
        await api.delete(API_ENDPOINTS.FAVORIS.REMOVE(produit.uuid));
        setFavori(false);
        alert("Produit retiré des favoris");
      } else {
        await api.post(
          API_ENDPOINTS.PRODUCTS.AJOUTER_PRODUIT_FAVORIS(produit.uuid),
          {},
        );
        setFavori(true);
        alert("Produit ajouté aux favoris");
      }
    } catch (err: any) {
      console.error("Erreur mise à jour favoris:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleAddToCart = async () => {
    if (!produit) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      return;
    }

    try {
      await api.post(API_ENDPOINTS.PANIER.ADD, {
        produitUuid: produit.uuid,
        quantite: quantite,
      });
      alert("Produit ajouté au panier !");
    } catch (err: any) {
      console.error("Erreur ajout panier:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleBuyNow = () => {
    if (!produit) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      return;
    }

    router.push(`/commande?produit=${produit.uuid}&quantite=${quantite}`);
  };

  const handleContactSeller = () => {
    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/produits/${produit?.uuid}`);
      return;
    }

    if (produit?.vendeurUuid) {
      router.push(
        `/messages/nouveau?vendeur=${produit.vendeurUuid}&produit=${produit.uuid}`,
      );
    }
  };

  const handleLikeComment = async (commentUuid: string) => {
    try {
      // API pour liker un commentaire
      await api.post(`/commentaires/${commentUuid}/like`, {});

      // Mettre à jour localement
      setCommentaires((prev) =>
        prev.map((comment) =>
          comment.uuid === commentUuid
            ? { ...comment, likes: comment.likes + 1 }
            : comment,
        ),
      );
    } catch (err) {
      console.error("Erreur lors du like:", err);
      // Mettre à jour localement malgré l'erreur
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
        await api.post(`/commentaires/${commentUuid}/signaler`, {});
        alert("Commentaire signalé. Notre équipe le vérifiera sous 24h.");
      } catch (err) {
        console.error("Erreur signalement:", err);
        alert("Une erreur est survenue lors du signalement.");
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!produit) return;

    const token = api.getToken();
    if (!token) {
      router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      return;
    }

    if (!newReview.commentaire.trim()) {
      alert("Veuillez saisir un commentaire.");
      return;
    }

    setSubmittingReview(true);

    try {
      // Créer d'abord une note
      const noteResponse = await api.post("/notes", {
        note: newReview.note,
        commentaire: newReview.commentaire,
        produitUuid: produit.uuid,
      });

      // Créer ensuite un commentaire lié à cette note
      const commentaireResponse = await api.post("/commentaires/creer", {
        contenu: newReview.commentaire,
        note: newReview.note,
        produitUuid: produit.uuid,
      });

      // Recharger les commentaires
      await fetchCommentaires(produit.uuid);

      // Réinitialiser le formulaire
      setNewReview({
        note: 5,
        commentaire: "",
      });
      setShowAddReview(false);

      alert(
        "Votre avis a été ajouté avec succès ! Merci pour votre contribution.",
      );

      // Recharger les détails du produit pour mettre à jour les statistiques
      await fetchProduitDetails();
    } catch (err: any) {
      console.error("Erreur ajout avis:", err);
      if (err.response?.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push(`/auth/login?redirect=/produits/${produit.uuid}`);
      } else {
        alert(
          "Une erreur est survenue lors de l'ajout de votre avis. Veuillez réessayer.",
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVisitBoutique = () => {
    if (boutique) {
      router.push(`/boutiques/${boutique.slug || boutique.uuid}`);
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

  if (error || !produit) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow">
                <div className="card-body py-5">
                  <div className="mb-4">
                    <i className="fas fa-box-open fa-4x text-muted"></i>
                  </div>
                  <h1 className="h3 mb-3">Produit introuvable</h1>
                  <p className="text-muted mb-4">
                    {error || "Ce produit n'existe pas ou a été supprimé."}
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link href="/produits" className="btn btn-outline-primary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Retour aux produits
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

  const condition = getConditionBadge(produit.statut);
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
                  href="/produits"
                  className="text-decoration-none text-muted"
                >
                  <i className="fas fa-shopping-bag me-1"></i>
                  Produits
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {produit.libelle}
              </li>
            </ol>
            <div className="d-flex gap-2">
              <span
                className={`badge bg-${produit.disponible ? "success" : "danger"} px-3 py-2`}
              >
                <i
                  className={`fas fa-${produit.disponible ? "check-circle" : "times-circle"} me-1`}
                ></i>
                {produit.disponible ? "Disponible" : "Non disponible"}
              </span>
              {boutique && (
                <span className="badge bg-info px-3 py-2">
                  <i className="fas fa-store me-1"></i>
                  {boutique.nom}
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
                        alt={produit.libelle}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x400?text=Produit+OSKAR";
                        }}
                      />
                      <div className="position-absolute top-0 start-0 p-3">
                        <span
                          className={`badge ${condition.bgColor} text-white px-3 py-2`}
                        >
                          <i className={`fas ${condition.icon} me-1`}></i>
                          {condition.text}
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
                      <h1 className="h3 fw-bold mb-3">{produit.libelle}</h1>

                      {/* Note et avis */}
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-3">
                            {renderStars(produit.note_moyenne)}
                          </div>
                          <span className="text-muted">
                            {produit.note_moyenne.toFixed(1)}
                            /5 ({produit.nombre_avis} avis)
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-heart text-danger me-2"></i>
                          <span className="text-muted">
                            {produit.nombre_favoris} favoris
                          </span>
                        </div>
                      </div>

                      {/* Prix */}
                      <div className="mb-4">
                        <h2 className="text-success fw-bold mb-2">
                          {formatPrice(produit.prix)}
                        </h2>
                        <span className="badge bg-success">
                          <i className="fas fa-tag me-1"></i>
                          Vente
                        </span>
                      </div>

                      {/* Quantité */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Quantité</label>
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setQuantite(Math.max(1, quantite - 1))
                            }
                            disabled={quantite <= 1}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center mx-2"
                            style={{ maxWidth: "80px" }}
                            value={quantite}
                            onChange={(e) =>
                              setQuantite(
                                Math.max(1, parseInt(e.target.value) || 1),
                              )
                            }
                            min="1"
                            max={produit.quantite}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              setQuantite(
                                Math.min(produit.quantite, quantite + 1),
                              )
                            }
                            disabled={quantite >= produit.quantite}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                          <small className="text-muted ms-3">
                            {produit.quantite} disponible(s)
                          </small>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="mt-auto">
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-lg"
                            onClick={handleBuyNow}
                            disabled={!produit.disponible}
                          >
                            <i className="fas fa-bolt me-2"></i>
                            Acheter maintenant
                          </button>
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAddToCart}
                            disabled={!produit.disponible}
                          >
                            <i className="fas fa-cart-plus me-2"></i>
                            Ajouter au panier
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleContactSeller}
                          >
                            <i className="fas fa-envelope me-2"></i>
                            Contacter le vendeur
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                            alt={`${produit.libelle} - vue ${index + 1}`}
                            className="img-fluid h-100 w-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/400x400?text=Produit+OSKAR";
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
                  Description du produit
                </h3>
                {produit.description ? (
                  <div className="prose">
                    <p className="lead">{produit.description}</p>
                  </div>
                ) : (
                  <p className="text-muted">
                    Aucune description disponible pour ce produit.
                  </p>
                )}
              </div>
            </div>

            {/* Spécifications */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h3 className="h5 fw-bold mb-4">
                  <i className="fas fa-list-alt me-2 text-primary"></i>
                  Spécifications
                </h3>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Condition:</strong>
                        <span className={`badge bg-${condition.color} ms-2`}>
                          {condition.text}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">
                          Quantité disponible:
                        </strong>
                        <span className="ms-2">
                          {produit.quantite} unité(s)
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Note moyenne:</strong>
                        <span className="ms-2">
                          {produit.note_moyenne.toFixed(1)}
                          /5
                        </span>
                      </li>
                      {produit.categorie && (
                        <li className="mb-3">
                          <strong className="text-muted">Catégorie:</strong>
                          <span className="ms-2">
                            {produit.categorie.libelle}
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <strong className="text-muted">Publié le:</strong>
                        <span className="ms-2">
                          {formatDate(produit.createdAt)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Mise à jour:</strong>
                        <span className="ms-2">
                          {formatDate(produit.updatedAt)}
                        </span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Favoris:</strong>
                        <span className="ms-2">{produit.nombre_favoris}</span>
                      </li>
                      <li className="mb-3">
                        <strong className="text-muted">Référence:</strong>
                        <span className="ms-2">
                          {produit.uuid.substring(0, 8).toUpperCase()}
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
                  Avis et commentaires ({produit.nombre_avis})
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
                            {noteStats.moyenne.toFixed(1)}
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
                                    setNewReview({
                                      ...newReview,
                                      note: star,
                                    })
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
                                submittingReview ||
                                !newReview.commentaire.trim()
                              }
                            >
                              {submittingReview ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
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
                                `/auth/login?redirect=/produits/${produit.uuid}`,
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

                                  {/* Réponses */}
                                  {comment.reponses &&
                                    comment.reponses.length > 0 && (
                                      <div className="ms-4 ps-3 border-start border-secondary">
                                        {comment.reponses.map((reponse) => (
                                          <div
                                            key={reponse.uuid}
                                            className="mt-3"
                                          >
                                            <div className="d-flex align-items-center mb-2">
                                              <strong className="me-2">
                                                {reponse.utilisateur_nom}
                                              </strong>
                                              <small className="text-muted">
                                                {formatDate(reponse.date)}
                                              </small>
                                            </div>
                                            <p className="mb-2">
                                              {reponse.commentaire}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  <div className="d-flex gap-3 mt-3">
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() =>
                                        handleLikeComment(comment.uuid)
                                      }
                                    >
                                      <i className="far fa-thumbs-up me-1"></i>
                                      Utile ({comment.likes})
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() =>
                                        handleReportComment(comment.uuid)
                                      }
                                    >
                                      <i className="fas fa-flag me-1"></i>
                                      Signaler
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bouton voir plus/moins */}
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
                          Soyez le premier à donner votre avis sur ce produit.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Produits similaires */}
            {produitsSimilaires.length > 0 && (
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold mb-0">
                      <i className="fas fa-th-large me-2 text-primary"></i>
                      Produits similaires ({produitsSimilaires.length})
                    </h3>
                    <Link
                      href="/produits"
                      className="btn btn-outline-primary btn-sm"
                    >
                      Voir tous
                    </Link>
                  </div>

                  <div className="row g-4">
                    {produitsSimilaires.map((produitSim) => (
                      <div key={produitSim.uuid} className="col-md-6">
                        <div className="card border h-100">
                          <div
                            className="position-relative"
                            style={{ height: "200px" }}
                          >
                            <img
                              src={
                                produitSim.image ||
                                "https://via.placeholder.com/400x400?text=Produit+OSKAR"
                              }
                              alt={produitSim.nom}
                              className="img-fluid h-100 w-100 object-fit-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/400x400?text=Produit+OSKAR";
                              }}
                            />
                            <span className="position-absolute top-0 start-0 m-2 badge bg-success">
                              Vente
                            </span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title fw-bold">
                              {produitSim.libelle}
                            </h6>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div>{renderStars(produitSim.note_moyenne)}</div>
                              <small className="text-muted">
                                ({produitSim.note_moyenne.toFixed(1)})
                              </small>
                            </div>
                            <h5 className="text-primary fw-bold mb-3">
                              {formatPrice(produitSim.prix)}
                            </h5>
                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                className={`badge bg-${produitSim.disponible ? "success" : "danger"}`}
                              >
                                {produitSim.disponible
                                  ? "Disponible"
                                  : "Non disponible"}
                              </span>
                              <Link
                                href={`/produits/${produitSim.uuid}`}
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
            {/* Carte boutique */}
            {boutique && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="fas fa-store text-primary fa-lg"></i>
                    </div>
                    <div>
                      <h4 className="h5 fw-bold mb-0">Boutique</h4>
                      <p className="text-muted mb-0">Vendeur du produit</p>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    {boutique.logo ? (
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <img
                          src={boutique.logo}
                          alt={boutique.nom}
                          className="img-fluid h-100 w-100 object-fit-cover"
                          onError={(e) => {
                            console.error(
                              "Erreur chargement logo boutique:",
                              boutique.logo,
                            );
                            e.currentTarget.src =
                              "https://via.placeholder.com/80x80?text=Boutique";
                            e.currentTarget.className = "img-fluid h-100 w-100";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i className="fas fa-store fa-2x text-muted"></i>
                      </div>
                    )}
                    <h5 className="fw-bold mb-2">{boutique.nom}</h5>
                    <span
                      className={`badge bg-${boutique.statut === "actif" ? "success" : "warning"} mb-3`}
                    >
                      {boutique.statut === "actif"
                        ? "Active"
                        : "En vérification"}
                    </span>
                  </div>

                  {boutique.description && (
                    <div className="mb-4">
                      <p className="small text-muted text-center">
                        {boutique.description}
                      </p>
                    </div>
                  )}

                  {/* Informations supplémentaires */}
                  <div className="mb-4">
                    <div className="row text-center">
                      <div className="col-6">
                        <div className="border-end">
                          <div className="fw-bold">
                            {boutique.est_bloque ? "Bloquée" : "Active"}
                          </div>
                          <small className="text-muted">Statut</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div>
                          <div className="fw-bold">
                            {boutique.est_ferme ? "Fermée" : "Ouverte"}
                          </div>
                          <small className="text-muted">Disponibilité</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleVisitBoutique}
                    >
                      <i className="fas fa-eye me-2"></i>
                      Visiter la boutique
                    </button>
                    <button
                      className="btn btn-outline-info"
                      onClick={handleContactSeller}
                    >
                      <i className="fas fa-comment me-2"></i>
                      Contacter le vendeur
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informations produit */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-info-circle me-2 text-info"></i>
                  Informations produit
                </h5>

                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Statut</span>
                      <span
                        className={`badge bg-${produit.statut === "publie" ? "success" : "warning"}`}
                      >
                        {produit.statut === "publie" ? "Publié" : "En attente"}
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Stock</span>
                      <span className="fw-bold">{produit.quantite} unités</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Note moyenne</span>
                      <span className="fw-bold">
                        {produit.note_moyenne.toFixed(1)}
                        /5
                      </span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Nombre d'avis</span>
                      <span className="fw-bold">{produit.nombre_avis}</span>
                    </div>
                  </div>
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Référence</span>
                      <span className="fw-bold">
                        {produit.uuid.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Livraison et paiement */}
            <div className="card shadow-sm border-success">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-shipping-fast me-2 text-success"></i>
                  Livraison & Paiement
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Livraison sous 2-5 jours
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Paiement sécurisé
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Retour sous 14 jours
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Support client 24/7
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
                    Inspectez l'article avant paiement
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Pas d'argent à l'avance
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Vérifiez l'identité
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

        {/* Produits récemment consultés */}
        {produitsSimilaires.length > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold">
                <i className="fas fa-history me-2 text-primary"></i>
                Produits similaires
              </h3>
              <Link href="/produits" className="btn btn-outline-primary btn-sm">
                Voir tout
              </Link>
            </div>

            <div className="row g-4">
              {produitsSimilaires.map((produitSim) => (
                <div key={produitSim.uuid} className="col-md-3">
                  <div className="card border h-100">
                    <div
                      className="position-relative"
                      style={{ height: "150px" }}
                    >
                      <img
                        src={
                          produitSim.image ||
                          "https://via.placeholder.com/400x400?text=Produit+OSKAR"
                        }
                        alt={produitSim.nom}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x400?text=Produit+OSKAR";
                        }}
                      />
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold">
                        {produitSim.libelle}
                      </h6>
                      <h5 className="text-primary fw-bold mb-3">
                        {formatPrice(produitSim.prix)}
                      </h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <span
                            className={`badge bg-${produitSim.disponible ? "success" : "danger"}`}
                          >
                            {produitSim.disponible
                              ? "Disponible"
                              : "Non disponible"}
                          </span>
                        </small>
                        <Link
                          href={`/produits/${produitSim.uuid}`}
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
        .comment-avatar {
          width: 50px;
          height: 50px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
