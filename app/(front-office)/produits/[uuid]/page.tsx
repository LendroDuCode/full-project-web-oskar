// app/produits/[uuid]/page.tsx
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
  faShoppingBag,
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
  faStore,
  faTag,
  faBolt,
  faCartPlus,
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
  faShoppingCart,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

// Types basés sur votre réponse API
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
  statut: string;
  image: string | null;
  prix: string | number;
  description: string | null;
  etoile: number;
  vendeurUuid: string;
  boutiqueUuid: string;
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
  nombre_favoris: number;
  etoiles_pleines: number;
  etoiles_vides: number;
  createur?: CreateurInfo;
  createurType?: string;
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
  createur?: CreateurInfo;
  createurType?: string;
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
  vendeurUuid: string;
  boutiqueUuid: string;
  createdAt: string;
  updatedAt: string;
  categorie?: {
    uuid: string;
    libelle: string;
    description: string;
  };
  createur?: CreateurInfo;
  createurType?: string;
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
  reponses?: Commentaire[];
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

// Interface pour le formulaire de message
interface MessageFormData {
  destinataireEmail: string;
  destinataireUuid?: string;
  destinataireNom: string;
  sujet: string;
  contenu: string;
  type: string;
  entiteType?: string;
  entiteUuid?: string;
}

// Composant d'image sécurisé avec fallback
const SecureImage = ({
  src,
  alt,
  fallbackSrc,
  className = "",
  style = {},
  onError = null,
}: {
  src: string | null;
  alt: string;
  fallbackSrc: string;
  className?: string;
  style?: React.CSSProperties;
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

      // Essayer différentes méthodes de fallback
      const url = src;

      // Vérifier si l'URL existe avant de l'utiliser
      if (!url) {
        console.log("URL est null ou undefined");
        return;
      }

      // 1. Si c'est une URL Minio, essayer de la convertir
      if (url.includes("15.236.142.141:9000/oskar-bucket/")) {
        const key = url.replace("http://15.236.142.141:9000/oskar-bucket/", "");
        const encodedKey = encodeURIComponent(key);
        const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
        console.log("Tentative conversion URL Minio vers proxy:", proxyUrl);
        setCurrentSrc(proxyUrl);
        return;
      }

      // 2. Utiliser le fallback fourni
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }

    // Appeler le callback d'erreur personnalisé si fourni
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
      className="position-relative"
      style={{ ...style, minHeight: (style.height as number) || "auto" }}
    >
      {loading && !hasError && (
        <div className="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${loading && !hasError ? "opacity-0" : "opacity-100"}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        style={{
          transition: "opacity 0.3s ease",
          ...(hasError && { display: "none" }),
        }}
      />
      {hasError && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={{ opacity: 1 }}
        />
      )}
    </div>
  );
};

// Composant Modal pour la messagerie
const MessagerieModal = ({
  isOpen,
  onClose,
  createur,
  produit,
  loading,
  error,
  success,
}: {
  isOpen: boolean;
  onClose: () => void;
  createur: CreateurInfo | null;
  produit: Produit | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}) => {
  const router = useRouter();
  const { isLoggedIn, user, openLoginModal } = useAuth();
  const [formData, setFormData] = useState<MessageFormData>({
    destinataireEmail: createur?.email || "",
    destinataireUuid: createur?.uuid || "",
    destinataireNom: createur
      ? `${createur.prenoms} ${createur.nom}`.trim()
      : "",
    sujet: produit ? `Question sur votre produit: ${produit.libelle}` : "",
    contenu: "",
    type: "NOTIFICATION",
    entiteType: "PRODUIT",
    entiteUuid: produit?.uuid || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (createur && produit) {
      setFormData({
        destinataireEmail: createur.email || "",
        destinataireUuid: createur.uuid || "",
        destinataireNom: `${createur.prenoms} ${createur.nom}`.trim(),
        sujet: `Question sur votre produit: ${produit.libelle}`,
        contenu: "",
        type: "NOTIFICATION",
        entiteType: "PRODUIT",
        entiteUuid: produit.uuid || "",
      });
    }
  }, [createur, produit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier l'authentification
    if (!isLoggedIn) {
      setLocalError("Vous devez être connecté pour envoyer un message.");
      setTimeout(() => {
        onClose();
        openLoginModal();
      }, 2000);
      return;
    }

    if (!formData.contenu.trim()) {
      setLocalError("Veuillez saisir un message.");
      return;
    }

    if (!formData.destinataireEmail) {
      setLocalError("Destinataire invalide.");
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    setLocalSuccess(null);

    try {
      // Format de données le plus simple possible
      const messageData = {
        destinataireEmail: formData.destinataireEmail.trim(),
        sujet: formData.sujet.trim(),
        contenu: formData.contenu.trim(),
        type: "NOTIFICATION",
      };

      console.log("📤 Tentative d'envoi de message avec données:", {
        ...messageData,
        contenu: `${messageData.contenu.substring(0, 50)}...`,
      });

      // CORRECTION ICI : Utiliser la méthode sendMessage de l'API client
      let response;
      try {
        response = await api.sendMessage(messageData);
        console.log("✅ Réponse API:", response);
      } catch (err: any) {
        console.warn("⚠️ Envoi via méthode spéciale échoué:", {
          error: err,
          message: err.message,
        });

        // Essayer avec l'endpoint standard
        response = await api.post(API_ENDPOINTS.MESSAGERIE.SEND, messageData);
        console.log("✅ Réponse API (essai standard):", response);
      }

      // Gérer la réponse
      console.log("📥 Réponse complète de l'API:", response);

      // Vérifier différents formats de réponse possibles
      let successMessage = "Message envoyé avec succès !";

      if (response) {
        // Format 1: { success: true, message: "..." }
        if (response.success === true || response.success === "true") {
          successMessage = response.message || successMessage;
        }
        // Format 2: { message: "..." }
        else if (response.message) {
          successMessage = response.message;
        }
        // Format 3: { data: { message: "..." } }
        else if (response.data?.message) {
          successMessage = response.data.message;
        }
        // Format 4: { status: "success" }
        else if (response.status === "success" || response.status === "ok") {
          successMessage = response.message || successMessage;
        }
        // Format 5: Réponse simple (string)
        else if (typeof response === "string") {
          successMessage = response;
        }
        // Format 6: Réponse vide mais statut 200
        else {
          // On considère que c'est un succès si on arrive ici sans erreur
          console.log(
            "⚠️ Réponse sans format standard, mais pas d'erreur:",
            response,
          );
        }
      }

      // Réinitialiser le formulaire
      setFormData((prev) => ({ ...prev, contenu: "" }));

      // Afficher le succès
      setLocalSuccess(successMessage);
      setLocalError(null);

      // Fermer le modal après 3 secondes
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("❌ Erreur détaillée lors de l'envoi du message:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = "Erreur lors de l'envoi du message";

      // Extraire les détails de l'erreur
      if (err.response?.status === 401) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
      } else if (err.response?.status === 400) {
        errorMessage = "Données invalides. Veuillez vérifier les informations.";
        if (err.response?.data?.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(", ");
        } else if (err.response?.data) {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.response?.status === 404) {
        errorMessage = "Service de messagerie non disponible.";
      } else if (err.response?.status === 403) {
        errorMessage = "Vous n'êtes pas autorisé à envoyer ce message.";
      } else if (err.response?.status === 422) {
        errorMessage = "Validation des données échouée.";
        if (err.response?.data?.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(", ");
        }
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur interne. Veuillez réessayer plus tard.";
      } else if (
        err.message?.includes("timeout") ||
        err.message?.includes("Timeout")
      ) {
        errorMessage = "Délai d'attente dépassé. Vérifiez votre connexion.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Essayer d'extraire plus de détails
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        try {
          const errorData =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          errorMessage = `Erreur: ${errorData}`;
        } catch (e) {
          errorMessage = "Erreur inconnue du serveur";
        }
      }

      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1055,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faMessage} className="me-2" />
              Envoyer un message à {createur?.prenoms}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Fermer"
            ></button>
          </div>
          <div className="modal-body p-4">
            {localSuccess && (
              <div className="alert alert-success alert-dismissible fade show mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCircleCheck} className="me-2 fs-4" />
                  <div className="flex-grow-1">
                    <strong>Succès !</strong>
                    <p className="mb-0">{localSuccess}</p>
                    <small className="text-success">
                      Votre message a été envoyé avec succès.
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLocalSuccess(null)}
                ></button>
              </div>
            )}

            {error && (
              <div className="alert alert-warning alert-dismissible fade show mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2 fs-4"
                  />
                  <div className="flex-grow-1">
                    <strong>Erreur système</strong>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLocalError(null)}
                ></button>
              </div>
            )}

            {localError && !localSuccess && (
              <div className="alert alert-danger alert-dismissible fade show mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="me-2 fs-4"
                  />
                  <div className="flex-grow-1">
                    <strong>Erreur d'envoi</strong>
                    <p className="mb-0">{localError}</p>
                    <small className="text-danger">
                      Si le problème persiste, contactez le support technique.
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLocalError(null)}
                ></button>
              </div>
            )}

            {!isLoggedIn && (
              <div className="alert alert-warning mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  <div className="flex-grow-1">
                    <strong>Connexion requise</strong>
                    <p className="mb-0">
                      Vous devez être connecté pour envoyer un message via la
                      messagerie interne.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => {
                      onClose();
                      openLoginModal();
                    }}
                  >
                    <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                    Se connecter
                  </button>
                  <Link
                    href="/auth/register"
                    className="btn btn-outline-primary btn-sm"
                    onClick={onClose}
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="alert alert-info">
                <div className="d-flex">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2 mt-1" />
                  <div>
                    <strong>Note importante :</strong>
                    <ul className="mb-0 mt-2 ps-3">
                      <li>
                        Utilisez la messagerie interne pour discuter du produit
                        en toute sécurité.
                      </li>
                      <li>Les conversations sont chiffrées et protégées.</li>
                      <li>
                        Vous recevrez une notification lorsque le destinataire
                        répondra.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Destinataire
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={formData.destinataireNom}
                  disabled
                />
                <small className="text-muted">
                  Conversation avec {createur?.prenoms} {createur?.nom}
                  {createur?.userType && ` (${createur.userType})`}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Sujet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sujet}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sujet: e.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting || !isLoggedIn}
                  maxLength={200}
                  placeholder="Ex: Question sur votre produit..."
                />
                <small className="text-muted">Maximum 200 caractères</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faCommentDots} className="me-2" />
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={formData.contenu}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contenu: e.target.value,
                    }))
                  }
                  placeholder={`Bonjour ${createur?.prenoms}, je vous contacte concernant votre produit "${produit?.libelle}"...`}
                  required
                  disabled={isSubmitting || !isLoggedIn}
                  maxLength={2000}
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <small className="text-muted">
                    Soyez poli et précis dans votre message pour faciliter la
                    discussion.
                  </small>
                  <small
                    className={`text-muted ${formData.contenu.length > 1800 ? "text-danger" : ""}`}
                  >
                    {formData.contenu.length}/2000 caractères
                  </small>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  <FontAwesomeIcon icon={faCertificate} className="me-2" />
                  Type de message
                </label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  disabled={isSubmitting || !isLoggedIn}
                >
                  <option value="NOTIFICATION">
                    Notification (Recommandé)
                  </option>
                  <option value="ALERT">Alerte</option>
                  <option value="INFO">Information</option>
                  <option value="QUESTION">Question</option>
                  <option value="DEMANDE">Demande</option>
                  <option value="PRODUIT">Produit</option>
                </select>
                <small className="text-muted">
                  Choisissez "Notification" pour la plupart des conversations.
                </small>
              </div>

              <div className="d-flex justify-content-between gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  disabled={
                    isSubmitting ||
                    !formData.contenu.trim() ||
                    !formData.sujet.trim() ||
                    !isLoggedIn
                  }
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Envoi en cours...</span>
                    </>
                  ) : !isLoggedIn ? (
                    <>
                      <FontAwesomeIcon icon={faSignInAlt} />
                      <span>Se connecter pour envoyer</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-footer bg-light">
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faLock} className="text-success" />
                <small className="text-muted">
                  Conversation sécurisée et privée
                </small>
              </div>
              {isLoggedIn && localSuccess && (
                <Link
                  href="/messages"
                  className="btn btn-sm btn-outline-primary"
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                  Voir mes messages
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [quantite, setQuantite] = useState(1);
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

  // États pour la messagerie
  const [showMessagerieModal, setShowMessagerieModal] = useState(false);
  const [messagerieLoading, setMessagerieLoading] = useState(false);
  const [messagerieError, setMessagerieError] = useState<string | null>(null);
  const [messagerieSuccess, setMessagerieSuccess] = useState<string | null>(
    null,
  );

  // États pour le contact
  const [contactVisible, setContactVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // URL d'avatar par défaut
  const getDefaultAvatarUrl = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-avatar.png`;
  };

  // URL d'image par défaut pour les produits
  const getDefaultProductImage = (): string => {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/images/default-product.png`;
  };

  // Fonction pour convertir les URLs Minio en URLs proxy
  const convertMinioUrlToProxy = (minioUrl: string): string => {
    if (!minioUrl) return getDefaultProductImage();

    // Si c'est déjà une URL proxy, la retourner telle quelle
    if (minioUrl.includes("localhost:3005/api/files/")) {
      return minioUrl;
    }

    // Si c'est une URL Minio
    if (minioUrl.includes("15.236.142.141:9000/oskar-bucket/")) {
      const key = minioUrl.replace(
        "http://15.236.142.141:9000/oskar-bucket/",
        "",
      );
      const encodedKey = encodeURIComponent(key);
      return `http://localhost:3005/api/files/${encodedKey}`;
    }

    // Si c'est juste une clé S3 (sans l'URL complète)
    if (
      minioUrl.includes("boutiques/") ||
      minioUrl.includes("produits/") ||
      minioUrl.includes("categories/")
    ) {
      const encodedKey = encodeURIComponent(minioUrl);
      return `http://localhost:3005/api/files/${encodedKey}`;
    }

    return minioUrl;
  };

  // Normaliser les URLs d'images - CORRIGÉ POUR MINIO ET BOUTIQUE
  const normalizeImageUrl = (
    url: string | null,
    key: string | null = null,
  ): string => {
    console.log("normalizeImageUrl appelée avec:", { url, key });

    // Priorité 1: Utiliser la clé S3 si disponible
    if (key) {
      // Si c'est une clé S3 (sans http://)
      if (!key.startsWith("http://") && !key.startsWith("https://")) {
        // Construire l'URL proxy pour la clé S3
        const encodedKey = encodeURIComponent(key);
        const proxyUrl = `http://localhost:3005/api/files/${encodedKey}`;
        console.log("URL proxy générée depuis clé:", proxyUrl);
        return proxyUrl;
      }
    }

    // Priorité 2: URL directe
    if (!url || url.trim() === "") {
      return getDefaultProductImage();
    }

    const cleanUrl = url.trim();

    // Si c'est déjà une URL proxy local (localhost:3005/api/files/)
    if (cleanUrl.includes("localhost:3005/api/files/")) {
      // S'assurer qu'elle est bien formatée
      if (cleanUrl.includes("http:localhost")) {
        return cleanUrl.replace("http:localhost", "http://localhost");
      }
      return cleanUrl;
    }

    // IMPORTANT: Gestion spécifique pour les URLs Minio de la boutique
    // Les URLs ressemblent à: http://15.236.142.141:9000/oskar-bucket/boutiques/logos/...
    if (cleanUrl.includes("15.236.142.141:9000/oskar-bucket/")) {
      return convertMinioUrlToProxy(cleanUrl);
    }

    // Si c'est une URL S3/Cloud Storage sans proxy
    if (
      cleanUrl.includes("oskar-bucket/") &&
      !cleanUrl.includes("localhost:3005")
    ) {
      // Essayer d'extraire la clé
      let minioKey = cleanUrl;

      // Si c'est une URL complète avec http
      if (cleanUrl.includes("http://")) {
        const urlParts = cleanUrl.split("/");
        const bucketIndex = urlParts.indexOf("oskar-bucket");
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          minioKey = urlParts.slice(bucketIndex + 1).join("/");
        }
      }

      // Nettoyer le début si nécessaire
      minioKey = minioKey.replace(/^oskar-bucket\//, "");

      console.log("Clé S3 extraite:", minioKey);
      const encodedKey = encodeURIComponent(minioKey);
      return `http://localhost:3005/api/files/${encodedKey}`;
    }

    // Pour les URLs externes valides, les retourner telles quelles
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      // Corriger les URLs mal formées
      if (cleanUrl.includes("http:localhost")) {
        return cleanUrl.replace("http:localhost", "http://localhost");
      }
      return cleanUrl;
    }

    // Pour les chemins relatifs
    if (cleanUrl.startsWith("/")) {
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
    }

    // Par défaut
    console.warn("URL d'image non reconnue:", cleanUrl);
    return getDefaultProductImage();
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

  // Transformer les données API vers notre format
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
      userType: apiCreateur.userType || "utilisateur",
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
      nombre_favoris: apiProduit.nombre_favoris || 0,
      quantite: apiProduit.quantite || 0,
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
      ...(apiProduit.createur && {
        createur: transformCreateurInfo(apiProduit.createur),
      }),
      createurType: apiProduit.createurType,
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
      ...(apiSimilaire.createur && {
        createur: transformCreateurInfo(apiSimilaire.createur),
      }),
      createurType: apiSimilaire.createurType,
    };
  };

  const transformBoutiqueData = (apiBoutique: BoutiqueAPI): Boutique => {
    console.log("Transform boutique data:", {
      logo: apiBoutique.logo,
      logo_key: apiBoutique.logo_key,
      banniere: apiBoutique.banniere,
      banniere_key: apiBoutique.banniere_key,
    });

    // IMPORTANT: Utiliser d'abord logo_key et banniere_key si disponibles
    // Ces clés sont plus fiables que les URLs directes
    const logoUrl = normalizeImageUrl(
      apiBoutique.logo_key ? null : apiBoutique.logo, // Utiliser logo uniquement si pas de clé
      apiBoutique.logo_key, // Priorité à la clé
    );

    const banniereUrl = normalizeImageUrl(
      apiBoutique.banniere_key ? null : apiBoutique.banniere,
      apiBoutique.banniere_key,
    );

    console.log("URLs normalisées boutique:", {
      logoUrl,
      banniereUrl,
      logoKey: apiBoutique.logo_key,
      banniereKey: apiBoutique.banniere_key,
    });

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
      ...(apiBoutique.vendeur && {
        vendeur: transformCreateurInfo(apiBoutique.vendeur),
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

  // Charger les commentaires
  const fetchCommentaires = useCallback(
    async (produitUuid: string) => {
      if (!produitUuid || commentairesFetched) return;

      try {
        setLoadingComments(true);

        // Charger les commentaires depuis l'API
        const response = await api.get<CommentairesResponse>(
          API_ENDPOINTS.COMMENTAIRES.BY_PRODUIT(produitUuid),
        );

        if (response && response.commentaires) {
          const commentairesData = response.commentaires.map(
            transformCommentaireData,
          );

          // Trier par date (plus récent en premier)
          commentairesData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          setCommentaires(commentairesData);

          // S'assurer que les stats ne sont pas null
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
        // Mettre à jour avec des stats par défaut
        const produitNoteMoyenne = getSafeNoteMoyenne(produit);

        setCommentairesStats({
          nombreCommentaires: 0,
          nombreNotes: 0,
          noteMoyenne: produitNoteMoyenne,
          distributionNotes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setCommentaires([]);
        setCommentairesFetched(true);
      } finally {
        setLoadingComments(false);
      }
    },
    [produit, commentairesFetched],
  );

  // Fonction pour debugger les URLs
  const debugImageUrls = (boutique: Boutique | null) => {
    if (!boutique) return;

    console.log("=== DEBUG IMAGES BOUTIQUE ===");
    console.log("Logo original:", boutique.logo);
    console.log("Logo key:", boutique.logo_key);
    console.log("Logo normalisé:", boutique.logo);

    console.log("Bannière original:", boutique.banniere);
    console.log("Bannière key:", boutique.banniere_key);
    console.log("Bannière normalisée:", boutique.banniere);
  };

  // Charger les données du produit
  const fetchProduitDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Charger le produit
      const response = await api.get<APIResponse>(
        API_ENDPOINTS.PRODUCTS.DETAIL_ALEATOIRE(uuid),
      );

      if (!response || !response.produit) {
        throw new Error("Produit non trouvé");
      }

      console.log("Réponse API produit:", response.produit);

      // Transformer les données
      const produitData = transformProduitData(response.produit);
      const similairesData = response.similaires.map(
        transformProduitSimilaireData,
      );

      setProduit(produitData);
      setProduitsSimilaires(similairesData);
      setFavori(response.produit.is_favoris || false);

      // 2. Déterminer le créateur
      if (response.produit.createur) {
        setCreateur(transformCreateurInfo(response.produit.createur));
      } else if (response.produit.vendeurUuid) {
        // Si pas de créateur dans la réponse, essayer de charger le vendeur
        try {
          const vendeurResponse = await api.get(
            API_ENDPOINTS.AUTH.VENDEUR.DETAIL(response.produit.vendeurUuid),
          );
          if (vendeurResponse && vendeurResponse.data) {
            setCreateur(transformCreateurInfo(vendeurResponse.data));
          }
        } catch (err) {
          console.warn("Impossible de charger les détails du vendeur:", err);
        }
      }

      // 3. Préparer les images
      const imageUrls: string[] = [];
      const mainImage = produitData.image;
      imageUrls.push(mainImage);
      setImagePrincipale(mainImage);

      // Ajouter des images supplémentaires depuis les produits similaires
      similairesData.slice(0, 4).forEach((similaire) => {
        if (similaire.image && !imageUrls.includes(similaire.image)) {
          imageUrls.push(similaire.image);
        }
      });

      // Si moins de 4 images, ajouter des images par défaut
      while (imageUrls.length < 4) {
        imageUrls.push(getDefaultProductImage());
      }

      setImages(imageUrls);

      // 4. Traiter les données de la boutique
      if (response.produit.boutique) {
        const boutiqueData = transformBoutiqueData(response.produit.boutique);
        setBoutique(boutiqueData);
        debugImageUrls(boutiqueData);
      } else if (produitData.boutiqueUuid) {
        try {
          const boutiqueResponse = await api.get(
            API_ENDPOINTS.BOUTIQUES.DETAIL(produitData.boutiqueUuid),
          );
          const boutiqueData = transformBoutiqueData(boutiqueResponse);
          setBoutique(boutiqueData);
          debugImageUrls(boutiqueData);
        } catch (err) {
          console.warn(
            "Impossible de charger les détails de la boutique:",
            err,
          );
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

      // 5. Charger les commentaires
      fetchCommentaires(produitData.uuid);
    } catch (err: any) {
      console.error("Erreur détail produit:", err);

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
  }, [uuid, fetchCommentaires]);

  // Charger les données une seule fois
  useEffect(() => {
    if (uuid && loading && !produit) {
      fetchProduitDetails();
    }
  }, [uuid, fetchProduitDetails, loading, produit]);

  // Fonctions utilitaires
  const formatPrice = (price: number) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "0 FCFA";
    }
    return price.toLocaleString("fr-FR") + " FCFA";
  };

  const formatDate = (dateString: string) => {
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

  // Calculer les statistiques des notes depuis les commentaires réels
  const calculateNoteStats = (): NoteStats => {
    // Utiliser les stats de l'API si disponibles
    const stats: NoteStats = {
      1: commentairesStats.distributionNotes[1] || 0,
      2: commentairesStats.distributionNotes[2] || 0,
      3: commentairesStats.distributionNotes[3] || 0,
      4: commentairesStats.distributionNotes[4] || 0,
      5: commentairesStats.distributionNotes[5] || 0,
      total: commentairesStats.nombreCommentaires || 0,
      moyenne: commentairesStats.noteMoyenne || 0,
    };

    // Si pas de stats d'API, calculer à partir des commentaires
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

    // S'assurer que la moyenne n'est pas NaN
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

    const message = `Bonjour ${createur.prenoms}, je suis intéressé(e) par votre produit "${produit?.libelle}" sur OSKAR. Pourrions-nous discuter ?`;
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
      `Créateur du produit: ${createur.prenoms} ${createur.nom}\n` +
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

  // Fonction pour ouvrir la messagerie
  const handleOpenMessagerie = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    setShowMessagerieModal(true);
    setMessagerieError(null);
    setMessagerieSuccess(null);
  };

  // Handlers existants
  const handleAddToFavorites = async () => {
    if (!produit) return;

    if (!isLoggedIn) {
      openLoginModal();
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
        openLoginModal();
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleAddToCart = async () => {
    if (!produit) return;

    if (!isLoggedIn) {
      openLoginModal();
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
        openLoginModal();
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const handleBuyNow = () => {
    if (!produit) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    router.push(`/commande?produit=${produit.uuid}&quantite=${quantite}`);
  };

  const handleShare = (platform: string) => {
    if (!produit) return;

    const shareUrl = window.location.href;
    const shareText = `Découvrez ce produit sur OSKAR : ${produit.libelle} - ${formatPrice(produit.prix)}`;
    const hashtags = "OSKAR,Produit,Vente,Commerce";

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

  const handleLikeComment = async (commentUuid: string) => {
    try {
      // API pour liker un commentaire (à implémenter côté backend si nécessaire)
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
        await api.post(API_ENDPOINTS.COMMENTAIRES.REPORT(commentUuid), {});
        alert("Commentaire signalé. Notre équipe le vérifiera sous 24h.");
      } catch (err) {
        console.error("Erreur signalement:", err);
        alert("Une erreur est survenue lors du signalement.");
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
      alert("Veuillez saisir un commentaire.");
      return;
    }

    setSubmittingReview(true);

    try {
      // Créer un commentaire avec note
      const response = await api.post<{ commentaire: CommentaireAPI }>(
        API_ENDPOINTS.COMMENTAIRES.CREATE,
        {
          contenu: newReview.commentaire,
          produitUuid: produit.uuid,
          note: newReview.note,
        },
      );

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

  const handleVisitBoutique = () => {
    if (boutique) {
      router.push(`/boutiques/${boutique.uuid}`);
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
                    <Link href="/produits" className="btn btn-outline-primary">
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Retour aux produits
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

  const condition = getConditionBadge(produit.statut);
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
                    href="/produits"
                    className="text-decoration-none text-muted"
                  >
                    <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
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
                  <FontAwesomeIcon
                    icon={produit.disponible ? faCheckCircle : faTimesCircle}
                    className="me-1"
                  />
                  {produit.disponible ? "Disponible" : "Non disponible"}
                </span>
                {boutique && (
                  <span className="badge bg-info px-3 py-2">
                    <FontAwesomeIcon icon={faStore} className="me-1" />
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
                        <SecureImage
                          src={imagePrincipale}
                          alt={produit.libelle}
                          fallbackSrc={getDefaultProductImage()}
                          className="img-fluid h-100 w-100 object-fit-cover"
                        />
                        <div className="position-absolute top-0 start-0 p-3">
                          <span
                            className={`badge ${condition.bgColor} text-white px-3 py-2`}
                          >
                            <FontAwesomeIcon
                              icon={condition.icon}
                              className="me-1"
                            />
                            {condition.text}
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
                          <FontAwesomeIcon
                            icon={faHeart}
                            className={favori ? "fas" : "far"}
                          />
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
                              {safeToFixed(produit.note_moyenne)}
                              /5 ({produit.nombre_avis} avis)
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faHeart}
                              className="text-danger me-2"
                            />
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
                            <FontAwesomeIcon icon={faTag} className="me-1" />
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
                              <FontAwesomeIcon icon={faMinus} />
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
                              <FontAwesomeIcon icon={faPlus} />
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
                              <FontAwesomeIcon icon={faBolt} className="me-2" />
                              Acheter maintenant
                            </button>
                            <button
                              className="btn btn-primary btn-lg"
                              onClick={handleAddToCart}
                              disabled={!produit.disponible}
                            >
                              <FontAwesomeIcon
                                icon={faCartPlus}
                                className="me-2"
                              />
                              Ajouter au panier
                            </button>
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
                        Partager ce produit
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
                          Contacter le vendeur
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
                              icon={faMessage}
                              className="me-1"
                            />
                            Messagerie
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
                        Informations du vendeur
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
                            <SecureImage
                              src={createur.avatar}
                              alt={`${createur.prenoms} ${createur.nom}`}
                              fallbackSrc={getDefaultAvatarUrl()}
                              className="rounded-circle img-fluid"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
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
                                <FontAwesomeIcon icon={faMessage} />
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
                            <SecureImage
                              src={img}
                              alt={`${produit.libelle} - vue ${index + 1}`}
                              fallbackSrc={getDefaultProductImage()}
                              className="img-fluid h-100 w-100 object-fit-cover"
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
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="me-2 text-primary"
                    />
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
                    <FontAwesomeIcon
                      icon={faListAlt}
                      className="me-2 text-primary"
                    />
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
                            {safeToFixed(produit.note_moyenne)}
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
                        {produit.createur && (
                          <li className="mb-3">
                            <strong className="text-muted">Vendeur:</strong>
                            <span className="ms-2">
                              {produit.createur.prenoms} {produit.createur.nom}
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
                        {produit.createurType && (
                          <li className="mb-3">
                            <strong className="text-muted">Type:</strong>
                            <span className="ms-2">
                              {produit.createurType === "vendeur"
                                ? "Vente"
                                : produit.createurType === "agent"
                                  ? "Agent"
                                  : "Utilisateur"}
                            </span>
                          </li>
                        )}
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
                    Avis et commentaires ({produit.nombre_avis})
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
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    <span className="ms-2">
                                      Envoi en cours...
                                    </span>
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
                                    <SecureImage
                                      src={comment.utilisateur_photo}
                                      alt={comment.utilisateur_nom}
                                      fallbackSrc={getDefaultAvatarUrl()}
                                      className="rounded-circle"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
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

                                    <div className="d-flex gap-3 mt-3">
                                      <button
                                        className="btn btn-sm btn-outline-secondary"
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
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                          handleReportComment(comment.uuid)
                                        }
                                      >
                                        <FontAwesomeIcon
                                          icon={faFlag}
                                          className="me-1"
                                        />
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
                        <FontAwesomeIcon
                          icon={faThLarge}
                          className="me-2 text-primary"
                        />
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
                              <SecureImage
                                src={produitSim.image}
                                alt={produitSim.nom}
                                fallbackSrc={getDefaultProductImage()}
                                className="img-fluid h-100 w-100 object-fit-cover"
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
                                <div>
                                  {renderStars(produitSim.note_moyenne)}
                                </div>
                                <small className="text-muted">
                                  ({safeToFixed(produitSim.note_moyenne)})
                                </small>
                              </div>
                              <h5 className="text-primary fw-bold mb-3">
                                {formatPrice(produitSim.prix)}
                              </h5>
                              {produitSim.createur && (
                                <div className="mb-2">
                                  <small className="text-muted">Vendeur:</small>
                                  <br />
                                  <small>
                                    {produitSim.createur.prenoms}{" "}
                                    {produitSim.createur.nom}
                                  </small>
                                </div>
                              )}
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
              {/* Carte boutique améliorée avec vendeur */}
              {boutique && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                        <FontAwesomeIcon
                          icon={faStore}
                          className="text-primary fa-lg"
                        />
                      </div>
                      <div>
                        <h4 className="h5 fw-bold mb-0">Boutique & Vendeur</h4>
                        <p className="text-muted mb-0">
                          Informations complètes
                        </p>
                      </div>
                    </div>

                    {/* Logo boutique */}
                    <div className="text-center mb-4">
                      {boutique.logo ? (
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 overflow-hidden border"
                          style={{ width: "100px", height: "100px" }}
                        >
                          <SecureImage
                            src={boutique.logo}
                            alt={boutique.nom}
                            fallbackSrc={getDefaultProductImage()}
                            className="img-fluid h-100 w-100 object-fit-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 border"
                          style={{ width: "100px", height: "100px" }}
                        >
                          <FontAwesomeIcon
                            icon={faStore}
                            className="fa-2x text-muted"
                          />
                        </div>
                      )}
                      <h5 className="fw-bold mb-2">{boutique.nom}</h5>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                        <span
                          className={`badge bg-${boutique.statut === "actif" ? "success" : "warning"}`}
                        >
                          {boutique.statut === "actif"
                            ? "Active"
                            : "En vérification"}
                        </span>
                        {!boutique.est_ferme && (
                          <span className="badge bg-success">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-1"
                            />
                            Ouverte
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informations vendeur */}
                    {(boutique.vendeur || createur) && (
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="rounded-circle overflow-hidden me-3"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <SecureImage
                              src={
                                boutique.vendeur?.avatar ||
                                createur?.avatar ||
                                getDefaultAvatarUrl()
                              }
                              alt={
                                boutique.vendeur
                                  ? `${boutique.vendeur.prenoms} ${boutique.vendeur.nom}`
                                  : createur
                                    ? `${createur.prenoms} ${createur.nom}`
                                    : "Vendeur"
                              }
                              fallbackSrc={getDefaultAvatarUrl()}
                              className="img-fluid h-100 w-100 object-fit-cover"
                            />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">
                              {boutique.vendeur
                                ? `${boutique.vendeur.prenoms} ${boutique.vendeur.nom}`
                                : createur
                                  ? `${createur.prenoms} ${createur.nom}`
                                  : "Vendeur"}
                            </h6>
                            <small className="text-muted">Propriétaire</small>
                          </div>
                        </div>
                      </div>
                    )}

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
                        <FontAwesomeIcon icon={faEye} className="me-2" />
                        Visiter la boutique
                      </button>
                      <button
                        className="btn btn-outline-info"
                        onClick={() => setContactVisible(true)}
                      >
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Voir les contacts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Informations produit */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="me-2 text-info"
                    />
                    Informations produit
                  </h5>

                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Statut</span>
                        <span
                          className={`badge bg-${produit.statut === "publie" ? "success" : "warning"}`}
                        >
                          {produit.statut === "publie"
                            ? "Publié"
                            : "En attente"}
                        </span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Stock</span>
                        <span className="fw-bold">
                          {produit.quantite} unités
                        </span>
                      </div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Note moyenne</span>
                        <span className="fw-bold">
                          {safeToFixed(produit.note_moyenne)}
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
                    <FontAwesomeIcon
                      icon={faShippingFast}
                      className="me-2 text-success"
                    />
                    Livraison & Paiement
                  </h5>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Livraison sous 2-5 jours
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Paiement sécurisé
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
                      Retour sous 14 jours
                    </li>
                    <li>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success me-2"
                      />
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
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="text-white"
                      />
                    </div>
                    <h5 className="fw-bold mb-0">Conseils de Sécurité</h5>
                  </div>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Rencontre dans un lieu public
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Inspectez l'article avant paiement
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Pas d'argent à l'avance
                    </li>
                    <li className="mb-2">
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-success me-2"
                      />
                      Vérifiez l'identité
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

          {/* Produits récemment consultés */}
          {produitsSimilaires.length > 0 && (
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h4 fw-bold">
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="me-2 text-primary"
                  />
                  Produits similaires
                </h3>
                <Link
                  href="/produits"
                  className="btn btn-outline-primary btn-sm"
                >
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
                        <SecureImage
                          src={produitSim.image}
                          alt={produitSim.nom}
                          fallbackSrc={getDefaultProductImage()}
                          className="img-fluid h-100 w-100 object-fit-cover"
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
      </div>

      {/* Modal de messagerie */}
      <MessagerieModal
        isOpen={showMessagerieModal}
        onClose={() => {
          setShowMessagerieModal(false);
          setMessagerieError(null);
          setMessagerieSuccess(null);
        }}
        createur={createur}
        produit={produit}
        loading={messagerieLoading}
        error={messagerieError}
        success={messagerieSuccess}
      />

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
        .modal {
          z-index: 1055;
        }
        .modal-backdrop {
          z-index: 1050;
        }
      `}</style>
    </>
  );
}
