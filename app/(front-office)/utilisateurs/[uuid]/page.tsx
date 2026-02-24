// app/(front-office)/utilisateurs/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG } from "@/config/env";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// Import des icônes FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faClock,
  faBan,
  faMapMarkerAlt,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faStar,
  faHeart,
  faShoppingBag,
  faBox,
  faTag,
  faEye,
  faArrowLeft,
  faUserCircle,
  faIdCard,
  faShieldAlt,
  faBirthdayCake,
  faVenusMars,
  faBriefcase,
  faGraduationCap,
  faAward,
  faCertificate,
  faThumbsUp,
  faComment,
  faShare,
  faLink,
  faExclamationTriangle,
  faInfoCircle,
  faSpinner,
  faHome,
  faStore,
  faUsers,
  faRocket,
  faGem,
  faCrown,
  faLeaf,
  faRecycle,
  faBolt,
  faFire,
  faMedal,
  faTrophy,
  faUserPlus,
  faUserCheck,
  faUserClock,
  faUserLock,
  faUserMinus,
  faUserEdit,
  faUserTag,
  faUserShield,
  faUserGraduate,
  faUserTie,
  faUserCog,
  faHeart as faHeartSolid,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter as faTwitterBrand,
  faInstagram as faInstagramBrand,
  faLinkedin,
  faWhatsapp as faWhatsappBrand,
} from "@fortawesome/free-brands-svg-icons";
import colors from "@/app/shared/constants/colors";

// ============================================
// TYPES
// ============================================
interface Civilite {
  uuid: string;
  libelle: string;
  slug: string;
  statut: string;
}

interface Role {
  uuid: string;
  name: string;
  feature: string;
  status: string;
}

interface ProduitUtilisateur {
  uuid: string;
  libelle: string;
  slug: string;
  image: string | null;
  image_key?: string | null;
  prix: string | number | null;
  description: string | null;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  disponible: boolean;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  nombre_favoris: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface UtilisateurDetail {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  avatar: string | null;
  civilite?: Civilite;
  role?: Role;
  date_naissance?: string;
  statut_matrimonial_uuid?: string;
  est_verifie: boolean;
  est_bloque: boolean;
  est_vendeur: boolean;
  is_admin: boolean;
  statut: string;
  created_at?: string;
  updated_at?: string;
  pseudo?: string | null;
  type_utilisateur?: string;
  ville?: string | null;
  adresse_uuid?: string | null;
  email_verifie_le?: string | null;
  produits: ProduitUtilisateur[];
}

interface APIResponse {
  status: string;
  data: UtilisateurDetail;
}

// ============================================
// COMPOSANT D'IMAGE SÉCURISÉ AVEC NORMALISATION
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

  // ✅ Si l'URL est déjà complète avec le proxy
  if (cleanUrl.includes("/api/files/")) {
    if (cleanUrl.startsWith("http")) {
      return cleanUrl;
    }
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
  }

  // ✅ Si c'est une clé (comme "produits%2F1771901822213-2208100.jpg")
  if (
    cleanUrl.includes("%2F") ||
    cleanUrl.startsWith("produits%2F") ||
    cleanUrl.startsWith("categories%2F") ||
    cleanUrl.startsWith("utilisateurs%2F")
  ) {
    try {
      const encodedKey = encodeURIComponent(cleanUrl);
      return `${API_CONFIG.BASE_URL || "http://localhost:3005"}/api/files/${encodedKey}`;
    } catch (err) {
      console.debug("Erreur conversion clé:", err);
      return getDefaultProductImage();
    }
  }

  // ✅ Si c'est un chemin avec slash
  if (cleanUrl.startsWith("/")) {
    return `${API_CONFIG.BASE_URL || "http://localhost:3005"}${cleanUrl}`;
  }

  // ✅ Si c'est une URL HTTP/HTTPS
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  return getDefaultProductImage();
};

const SecureImage = ({
  src,
  alt,
  fallbackSrc,
  className = "",
  style = {},
  imageKey = null,
}: {
  src: string | null;
  alt: string;
  fallbackSrc: string;
  className?: string;
  style?: React.CSSProperties;
  imageKey?: string | null;
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!src && !imageKey) return fallbackSrc;
    return normalizeImageUrl(src, imageKey);
  });
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setCurrentSrc(normalizeImageUrl(src, imageKey));
    setHasError(false);
    setRetryCount(0);
  }, [src, imageKey]);

  const handleError = () => {
    if (retryCount < 2) {
      setRetryCount((prev) => prev + 1);
      // Réessayer avec l'URL directe
      if (src && src.includes("%2F")) {
        const directUrl = `${API_CONFIG.BASE_URL || "http://localhost:3005"}/api/files/${src}`;
        setCurrentSrc(directUrl);
      }
    } else {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={{ ...style, objectFit: "cover" }}
      onError={handleError}
      loading="lazy"
    />
  );
};

// ============================================
// COMPOSANT BADGE DE STATUT
// ============================================
const StatusBadge = ({
  est_verifie,
  est_bloque,
  est_vendeur,
  is_admin,
  statut,
}: {
  est_verifie: boolean;
  est_bloque: boolean;
  est_vendeur: boolean;
  is_admin: boolean;
  statut: string;
}) => {
  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2">
        <FontAwesomeIcon icon={faUserLock} className="me-1" />
        Compte bloqué
      </span>
    );
  }

  if (is_admin) {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${colors.oskar.green}15`,
          color: colors.oskar.green,
          border: `1px solid ${colors.oskar.green}40`,
          padding: "0.5rem 1rem",
        }}
      >
        <FontAwesomeIcon icon={faUserShield} className="me-1" />
        Administrateur
      </span>
    );
  }

  if (est_vendeur) {
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2">
        <FontAwesomeIcon icon={faStore} className="me-1" />
        Vendeur
      </span>
    );
  }

  if (est_verifie) {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${colors.oskar.green}15`,
          color: colors.oskar.green,
          border: `1px solid ${colors.oskar.green}40`,
          padding: "0.5rem 1rem",
        }}
      >
        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
        Compte vérifié
      </span>
    );
  }

  if (statut === "actif") {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: `${colors.oskar.green}15`,
          color: colors.oskar.green,
          border: `1px solid ${colors.oskar.green}40`,
          padding: "0.5rem 1rem",
        }}
      >
        <FontAwesomeIcon icon={faUserCheck} className="me-1" />
        Actif
      </span>
    );
  }

  return (
    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2">
      <FontAwesomeIcon icon={faUserClock} className="me-1" />
      En attente
    </span>
  );
};

// ============================================
// COMPOSANT STATISTIQUE
// ============================================
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => {
  const getColorStyles = () => {
    switch (color) {
      case "primary":
        return { bg: `${colors.oskar.green}15`, text: colors.oskar.green };
      case "success":
        return { bg: `${colors.oskar.green}15`, text: colors.oskar.green };
      case "warning":
        return { bg: "#ffc10715", text: "#ffc107" };
      case "info":
        return { bg: "#0dcaf015", text: "#0dcaf0" };
      case "danger":
        return { bg: "#dc354515", text: "#dc3545" };
      default:
        return { bg: `${colors.oskar.green}15`, text: colors.oskar.green };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle p-2 me-3"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: styles.bg,
            }}
          >
            <FontAwesomeIcon
              icon={icon}
              className="fs-4"
              style={{ color: styles.text }}
            />
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: colors.oskar.black }}>
              {value}
            </h4>
            <small className="text-muted">{title}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT PRODUIT CARD - CORRIGÉ
// ============================================
const ProduitCard = ({ produit }: { produit: ProduitUtilisateur }) => {
  const router = useRouter();

  const formatPrice = (price: number | string | null) => {
    if (!price) return "Gratuit";
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return "Prix sur demande";
    return numericPrice.toLocaleString("fr-FR") + " FCFA";
  };

  const getStatusBadge = () => {
    if (produit.estBloque) {
      return <span className="badge bg-danger">Bloqué</span>;
    }
    if (produit.estPublie) {
      return (
        <span className="badge" style={{ backgroundColor: colors.oskar.green }}>
          Publié
        </span>
      );
    }
    return <span className="badge bg-secondary">Brouillon</span>;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i <= Math.round(rating) ? "text-warning" : "text-muted"}
          size="sm"
        />,
      );
    }
    return <div className="d-flex">{stars}</div>;
  };

  // ✅ Fonction pour naviguer vers le détail du produit
  const handleViewProduct = () => {
    router.push(`/produits/${produit.uuid}`);
  };

  return (
    <div
      className="card h-100 border-0 shadow-sm product-card"
      onClick={handleViewProduct}
      style={{ cursor: "pointer" }}
    >
      <div className="position-relative">
        <div style={{ height: "180px", overflow: "hidden" }}>
          <SecureImage
            src={produit.image}
            alt={produit.libelle}
            fallbackSrc={getDefaultProductImage()}
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover" }}
            imageKey={produit.image_key}
          />
        </div>
        <div className="position-absolute top-0 start-0 m-2">
          {getStatusBadge()}
        </div>
        {!produit.disponible && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-danger">Rupture</span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title fw-bold mb-2 text-truncate">
          {produit.libelle}
        </h6>
        {produit.description && (
          <p className="card-text small text-muted mb-2 text-truncate">
            {produit.description}
          </p>
        )}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="small">{renderStars(produit.note_moyenne)}</div>
          <small className="text-muted">({produit.nombre_avis} avis)</small>
        </div>
        <h5 className="fw-bold mb-3" style={{ color: colors.oskar.green }}>
          {formatPrice(produit.prix)}
        </h5>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <small className="text-muted">
            <FontAwesomeIcon icon={faBox} className="me-1" />
            Stock: {produit.quantite}
          </small>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: `${colors.oskar.green}15`,
              color: colors.oskar.green,
              border: `1px solid ${colors.oskar.green}30`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" />
            Voir
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function UtilisateurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const { isLoggedIn, user, openLoginModal } = useAuth();

  const [utilisateur, setUtilisateur] = useState<UtilisateurDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"produits" | "informations">(
    "produits",
  );
  const [isFollowing, setIsFollowing] = useState(false);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non renseigné";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Date invalide";
    }
  };

  const calculateAge = (dateString?: string): string => {
    if (!dateString) return "Non renseigné";
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return `${age} ans`;
    } catch {
      return "Non renseigné";
    }
  };

  // ✅ Fonction pour transformer les produits et normaliser les images
  const transformProduits = (produits: any[]): ProduitUtilisateur[] => {
    return produits.map((p) => ({
      ...p,
      image: p.image || p.image_key || null,
      image_key: p.image_key || null,
    }));
  };

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
  const fetchUtilisateurDetails = useCallback(async () => {
    if (!uuid) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<APIResponse>(
        API_ENDPOINTS.AUTH.UTILISATEUR.DETAIL(uuid),
      );

      console.log("✅ Réponse API utilisateur:", response);

      if (response && response.data) {
        // Transformer les produits pour normaliser les images
        const dataWithNormalizedProduits = {
          ...response.data,
          produits: transformProduits(response.data.produits || []),
        };
        setUtilisateur(dataWithNormalizedProduits);
      } else {
        throw new Error("Utilisateur non trouvé");
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement utilisateur:", err);

      if (err.response?.status === 404) {
        setError("Cet utilisateur n'existe pas ou a été supprimé.");
      } else {
        setError("Impossible de charger les informations de l'utilisateur.");
      }
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    if (uuid) {
      fetchUtilisateurDetails();
    }
  }, [uuid, fetchUtilisateurDetails]);

  // ============================================
  // FILTRAGE DES PRODUITS
  // ============================================
  const produitsPublies =
    utilisateur?.produits.filter((p) => p.estPublie && !p.estBloque) || [];
  const produitsBloques =
    utilisateur?.produits.filter((p) => p.estBloque) || [];
  const produitsEnAttente =
    utilisateur?.produits.filter((p) => !p.estPublie && !p.estBloque) || [];

  // ============================================
  // RENDU
  // ============================================
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <LoadingSpinner
          size="lg"
          text="Chargement du profil utilisateur..."
          fullPage
        />
      </div>
    );
  }

  if (error || !utilisateur) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow-lg rounded-4 p-5">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="fa-4x"
                    style={{ color: `${colors.oskar.green}40` }}
                  />
                </div>
                <h2
                  className="h4 fw-bold mb-3"
                  style={{ color: colors.oskar.black }}
                >
                  Utilisateur introuvable
                </h2>
                <p className="text-muted mb-4">
                  {error || "Cet utilisateur n'existe pas ou a été supprimé."}
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Link
                    href="/"
                    className="btn px-4 py-2"
                    style={{
                      backgroundColor: colors.oskar.green,
                      color: "white",
                      border: "none",
                    }}
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
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Breadcrumb */}
      <nav className="bg-white border-bottom shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link
                  href="/"
                  className="text-decoration-none"
                  style={{ color: colors.oskar.grey }}
                >
                  <FontAwesomeIcon icon={faHome} className="me-1" />
                  Accueil
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  href="/utilisateurs"
                  className="text-decoration-none"
                  style={{ color: colors.oskar.grey }}
                >
                  <FontAwesomeIcon icon={faUsers} className="me-1" />
                  Utilisateurs
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px", color: colors.oskar.green }}
              >
                {utilisateur.prenoms} {utilisateur.nom}
              </li>
            </ol>
            <Link
              href="/"
              className="btn btn-outline-secondary btn-sm"
              style={{ borderColor: colors.oskar.lightGrey }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              Retour
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Vert prédominant */}
      <div
        className="py-5 position-relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 50%, #059669 100%)`,
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center">
                {/* Avatar avec bordure verte animée */}
                <div className="position-relative me-4">
                  <div
                    className="rounded-circle border-4 border-white shadow-lg overflow-hidden"
                    style={{
                      width: "120px",
                      height: "120px",
                      animation: "pulse-green 2s infinite",
                    }}
                  >
                    <SecureImage
                      src={utilisateur.avatar}
                      alt={`${utilisateur.prenoms} ${utilisateur.nom}`}
                      fallbackSrc={getDefaultAvatarUrl()}
                      className="img-fluid w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  {utilisateur.est_verifie && (
                    <div
                      className="position-absolute bottom-0 end-0 rounded-circle p-1 border border-2 border-white"
                      style={{ backgroundColor: colors.oskar.green }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-white"
                        size="xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <h1 className="display-5 fw-bold mb-0 text-white">
                      {utilisateur.prenoms} {utilisateur.nom}
                    </h1>
                    {utilisateur.is_admin && (
                      <span
                        className="badge px-3 py-2"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        <FontAwesomeIcon icon={faUserShield} className="me-1" />
                        Admin
                      </span>
                    )}
                    {utilisateur.est_vendeur && !utilisateur.is_admin && (
                      <span className="badge bg-warning bg-opacity-25 text-white border border-warning border-opacity-25 px-3 py-2">
                        <FontAwesomeIcon icon={faStore} className="me-1" />
                        Vendeur
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <StatusBadge
                      est_verifie={utilisateur.est_verifie}
                      est_bloque={utilisateur.est_bloque}
                      est_vendeur={utilisateur.est_vendeur}
                      is_admin={utilisateur.is_admin || false}
                      statut={utilisateur.statut}
                    />

                    <span className="text-white-75">
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Membre depuis {formatDate(utilisateur.created_at)}
                    </span>

                    {utilisateur.type_utilisateur && (
                      <span className="text-white-75">
                        <FontAwesomeIcon icon={faTag} className="me-1" />
                        {utilisateur.type_utilisateur === "particulier"
                          ? "Particulier"
                          : "Professionnel"}
                      </span>
                    )}
                  </div>

                  {utilisateur.pseudo && (
                    <p className="text-white-50 mt-3 mb-0">
                      <FontAwesomeIcon icon={faUserTag} className="me-1" />@
                      {utilisateur.pseudo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="d-flex gap-3 justify-content-lg-end mt-4 mt-lg-0">
                {isLoggedIn ? (
                  <>
                    <button
                      className="btn btn-light px-4 py-2"
                      onClick={() => setIsFollowing(!isFollowing)}
                    >
                      <FontAwesomeIcon
                        icon={isFollowing ? faHeartSolid : faHeart}
                        className={`me-2 ${isFollowing ? "text-danger" : ""}`}
                      />
                      {isFollowing ? "Suivi" : "Suivre"}
                    </button>
                    <button
                      className="btn btn-outline-light px-4 py-2"
                      onClick={() =>
                        router.push(`/messages?user=${utilisateur.uuid}`)
                      }
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Message
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-light px-4 py-2"
                    onClick={openLoginModal}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Se connecter pour suivre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mt-n5">
        <div className="row g-4">
          <div className="col-md-3">
            <StatCard
              title="Produits publiés"
              value={produitsPublies.length}
              icon={faBox}
              color="primary"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Produits en attente"
              value={produitsEnAttente.length}
              icon={faClock}
              color="warning"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Total des produits"
              value={utilisateur.produits.length}
              icon={faShoppingBag}
              color="success"
            />
          </div>
          <div className="col-md-3">
            <StatCard
              title="Note moyenne"
              value={
                utilisateur.produits.length > 0
                  ? Number(
                      (
                        utilisateur.produits.reduce(
                          (acc, p) => acc + p.note_moyenne,
                          0,
                        ) / utilisateur.produits.length
                      ).toFixed(1),
                    )
                  : 0
              }
              icon={faStar}
              color="warning"
            />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="container py-5">
        <div className="row">
          {/* Sidebar - Informations de contact */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5
                  className="fw-bold mb-0"
                  style={{ color: colors.oskar.black }}
                >
                  <FontAwesomeIcon
                    icon={faIdCard}
                    style={{ color: colors.oskar.green }}
                    className="me-2"
                  />
                  Informations personnelles
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: `${colors.oskar.green}15` }}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ color: colors.oskar.green }}
                      className="fa-lg"
                    />
                  </div>
                  <div>
                    <small className="text-muted d-block">Nom complet</small>
                    <h6
                      className="fw-bold mb-0"
                      style={{ color: colors.oskar.black }}
                    >
                      {utilisateur.civilite?.libelle} {utilisateur.prenoms}{" "}
                      {utilisateur.nom}
                    </h6>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div
                    className="rounded-circle p-3 me-3"
                    style={{ backgroundColor: `${colors.oskar.green}15` }}
                  >
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ color: colors.oskar.green }}
                      className="fa-lg"
                    />
                  </div>
                  <div>
                    <small className="text-muted d-block">Email</small>
                    <h6
                      className="fw-bold mb-0"
                      style={{ color: colors.oskar.black }}
                    >
                      {utilisateur.email}
                    </h6>
                    {utilisateur.email_verifie_le ? (
                      <span
                        className="badge mt-1"
                        style={{
                          backgroundColor: `${colors.oskar.green}15`,
                          color: colors.oskar.green,
                          border: `1px solid ${colors.oskar.green}40`,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-1"
                        />
                        Vérifié
                      </span>
                    ) : (
                      <span className="badge bg-warning bg-opacity-10 text-warning mt-1">
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="me-1"
                        />
                        Non vérifié
                      </span>
                    )}
                  </div>
                </div>

                {utilisateur.telephone && (
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="rounded-circle p-3 me-3"
                      style={{ backgroundColor: `${colors.oskar.green}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{ color: colors.oskar.green }}
                        className="fa-lg"
                      />
                    </div>
                    <div>
                      <small className="text-muted d-block">Téléphone</small>
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {utilisateur.telephone}
                      </h6>
                    </div>
                  </div>
                )}

                {utilisateur.ville && (
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="rounded-circle p-3 me-3"
                      style={{ backgroundColor: `${colors.oskar.green}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        style={{ color: colors.oskar.green }}
                        className="fa-lg"
                      />
                    </div>
                    <div>
                      <small className="text-muted d-block">Localisation</small>
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: colors.oskar.black }}
                      >
                        {utilisateur.ville}
                      </h6>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5
                  className="fw-bold mb-0"
                  style={{ color: colors.oskar.black }}
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    style={{ color: colors.oskar.green }}
                    className="me-2"
                  />
                  Détails du compte
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="border rounded-3 p-3 text-center">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        style={{ color: colors.oskar.green }}
                        className="mb-2"
                      />
                      <small className="text-muted d-block">Inscription</small>
                      <span
                        className="fw-bold small"
                        style={{ color: colors.oskar.black }}
                      >
                        {formatDate(utilisateur.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded-3 p-3 text-center">
                      <FontAwesomeIcon
                        icon={faBirthdayCake}
                        style={{ color: colors.oskar.green }}
                        className="mb-2"
                      />
                      <small className="text-muted d-block">Âge</small>
                      <span
                        className="fw-bold small"
                        style={{ color: colors.oskar.black }}
                      >
                        {calculateAge(utilisateur.date_naissance)}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded-3 p-3 text-center">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        style={{ color: colors.oskar.green }}
                        className="mb-2"
                      />
                      <small className="text-muted d-block">Statut</small>
                      <span
                        className="fw-bold small"
                        style={{ color: colors.oskar.black }}
                      >
                        {utilisateur.statut_matrimonial_uuid
                          ? "Renseigné"
                          : "Non renseigné"}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded-3 p-3 text-center">
                      <FontAwesomeIcon
                        icon={faUserGraduate}
                        style={{ color: colors.oskar.green }}
                        className="mb-2"
                      />
                      <small className="text-muted d-block">Rôle</small>
                      <span
                        className="fw-bold small"
                        style={{ color: colors.oskar.black }}
                      >
                        {utilisateur.role?.name || "Utilisateur"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges et certifications */}
            <div className="card border-0 shadow-sm rounded-4 mt-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5
                  className="fw-bold mb-0"
                  style={{ color: colors.oskar.black }}
                >
                  <FontAwesomeIcon
                    icon={faAward}
                    style={{ color: colors.oskar.green }}
                    className="me-2"
                  />
                  Badges & Certifications
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap gap-2">
                  {utilisateur.est_verifie && (
                    <span
                      className="badge p-2"
                      style={{
                        backgroundColor: `${colors.oskar.green}15`,
                        color: colors.oskar.green,
                        border: `1px solid ${colors.oskar.green}40`,
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      Compte vérifié
                    </span>
                  )}
                  {utilisateur.est_vendeur && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 p-2">
                      <FontAwesomeIcon icon={faStore} className="me-1" />
                      Vendeur certifié
                    </span>
                  )}
                  {utilisateur.is_admin && (
                    <span
                      className="badge p-2"
                      style={{
                        backgroundColor: `${colors.oskar.green}15`,
                        color: colors.oskar.green,
                        border: `1px solid ${colors.oskar.green}40`,
                      }}
                    >
                      <FontAwesomeIcon icon={faUserShield} className="me-1" />
                      Administrateur
                    </span>
                  )}
                  {utilisateur.produits.length >= 5 && (
                    <span
                      className="badge p-2"
                      style={{
                        backgroundColor: `${colors.oskar.green}15`,
                        color: colors.oskar.green,
                        border: `1px solid ${colors.oskar.green}40`,
                      }}
                    >
                      <FontAwesomeIcon icon={faRocket} className="me-1" />
                      Vendeur actif
                    </span>
                  )}
                  {utilisateur.produits.some((p) => p.note_moyenne >= 4.5) && (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 p-2">
                      <FontAwesomeIcon icon={faStar} className="me-1" />
                      Top vendeur
                    </span>
                  )}
                  {utilisateur.produits.length === 0 && (
                    <span
                      className="badge p-2"
                      style={{
                        backgroundColor: `${colors.oskar.green}15`,
                        color: colors.oskar.green,
                        border: `1px solid ${colors.oskar.green}40`,
                      }}
                    >
                      <FontAwesomeIcon icon={faLeaf} className="me-1" />
                      Nouveau membre
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="col-lg-8">
            {/* Navigation des onglets */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <ul className="nav nav-tabs nav-underline" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "produits" ? "active" : ""}`}
                      onClick={() => setActiveTab("produits")}
                      style={{
                        color:
                          activeTab === "produits"
                            ? colors.oskar.green
                            : colors.oskar.grey,
                        borderBottom:
                          activeTab === "produits"
                            ? `3px solid ${colors.oskar.green}`
                            : "none",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faBox}
                        className="me-2"
                        style={{
                          color:
                            activeTab === "produits"
                              ? colors.oskar.green
                              : colors.oskar.grey,
                        }}
                      />
                      Produits ({utilisateur.produits.length})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "informations" ? "active" : ""}`}
                      onClick={() => setActiveTab("informations")}
                      style={{
                        color:
                          activeTab === "informations"
                            ? colors.oskar.green
                            : colors.oskar.grey,
                        borderBottom:
                          activeTab === "informations"
                            ? `3px solid ${colors.oskar.green}`
                            : "none",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="me-2"
                        style={{
                          color:
                            activeTab === "informations"
                              ? colors.oskar.green
                              : colors.oskar.grey,
                        }}
                      />
                      À propos
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                {/* Onglet Produits */}
                {activeTab === "produits" && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5
                          className="fw-bold mb-1"
                          style={{ color: colors.oskar.black }}
                        >
                          <FontAwesomeIcon
                            icon={faBox}
                            style={{ color: colors.oskar.green }}
                            className="me-2"
                          />
                          Produits de {utilisateur.prenoms}
                        </h5>
                        <p className="text-muted small mb-0">
                          {produitsPublies.length} produit
                          {produitsPublies.length > 1 ? "s" : ""} disponible
                          {produitsPublies.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          style={{
                            width: "auto",
                            borderColor: colors.oskar.lightGrey,
                          }}
                        >
                          <option>Tous les produits</option>
                          <option>Publiés</option>
                          <option>En attente</option>
                        </select>
                      </div>
                    </div>

                    {utilisateur.produits.length === 0 ? (
                      <div className="text-center py-5">
                        <div
                          className="rounded-circle d-inline-flex p-4 mb-3"
                          style={{ backgroundColor: `${colors.oskar.green}10` }}
                        >
                          <FontAwesomeIcon
                            icon={faBox}
                            style={{ color: `${colors.oskar.green}60` }}
                            className="fa-3x"
                          />
                        </div>
                        <h5
                          className="fw-bold mb-2"
                          style={{ color: colors.oskar.black }}
                        >
                          Aucun produit
                        </h5>
                        <p className="text-muted mb-0">
                          Cet utilisateur n'a pas encore publié de produits.
                        </p>
                      </div>
                    ) : (
                      <div className="row g-4">
                        {utilisateur.produits
                          .filter((p) => p.estPublie && !p.estBloque)
                          .map((produit) => (
                            <div key={produit.uuid} className="col-md-6">
                              <ProduitCard produit={produit} />
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Produits bloqués - Visible uniquement pour l'admin */}
                    {utilisateur.is_admin && produitsBloques.length > 0 && (
                      <div className="mt-5">
                        <h6 className="fw-bold mb-3 text-danger">
                          <FontAwesomeIcon icon={faBan} className="me-2" />
                          Produits bloqués ({produitsBloques.length})
                        </h6>
                        <div className="row g-4">
                          {produitsBloques.map((produit) => (
                            <div key={produit.uuid} className="col-md-6">
                              <ProduitCard produit={produit} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet À propos */}
                {activeTab === "informations" && (
                  <div>
                    <h5
                      className="fw-bold mb-4"
                      style={{ color: colors.oskar.black }}
                    >
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        style={{ color: colors.oskar.green }}
                        className="me-2"
                      />
                      À propos de {utilisateur.prenoms}
                    </h5>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6
                              className="fw-bold mb-3"
                              style={{ color: colors.oskar.green }}
                            >
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="me-2"
                              />
                              Informations générales
                            </h6>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Civilité:
                                </span>
                                <strong style={{ color: colors.oskar.black }}>
                                  {utilisateur.civilite?.libelle ||
                                    "Non renseigné"}
                                </strong>
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Type de compte:
                                </span>
                                <strong style={{ color: colors.oskar.black }}>
                                  {utilisateur.type_utilisateur ===
                                  "particulier"
                                    ? "Particulier"
                                    : utilisateur.type_utilisateur ===
                                        "professionnel"
                                      ? "Professionnel"
                                      : "Non spécifié"}
                                </strong>
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">Rôle:</span>
                                <strong style={{ color: colors.oskar.black }}>
                                  {utilisateur.role?.name || "Utilisateur"}
                                </strong>
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Date de naissance:
                                </span>
                                <strong style={{ color: colors.oskar.black }}>
                                  {utilisateur.date_naissance
                                    ? formatDate(utilisateur.date_naissance)
                                    : "Non renseignée"}
                                </strong>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6
                              className="fw-bold mb-3"
                              style={{ color: colors.oskar.green }}
                            >
                              <FontAwesomeIcon
                                icon={faShieldAlt}
                                className="me-2"
                              />
                              Sécurité & Vérification
                            </h6>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Email vérifié:
                                </span>
                                {utilisateur.email_verifie_le ? (
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: `${colors.oskar.green}15`,
                                      color: colors.oskar.green,
                                    }}
                                  >
                                    Oui
                                  </span>
                                ) : (
                                  <span className="badge bg-warning bg-opacity-10 text-warning">
                                    Non
                                  </span>
                                )}
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">Compte:</span>
                                {utilisateur.est_bloque ? (
                                  <span className="badge bg-danger">
                                    Bloqué
                                  </span>
                                ) : (
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: `${colors.oskar.green}15`,
                                      color: colors.oskar.green,
                                    }}
                                  >
                                    Actif
                                  </span>
                                )}
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Vendeur:
                                </span>
                                {utilisateur.est_vendeur ? (
                                  <span className="badge bg-warning bg-opacity-10 text-warning">
                                    Oui
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">
                                    Non
                                  </span>
                                )}
                              </li>
                              <li className="mb-2">
                                <span className="text-muted me-2">
                                  Administrateur:
                                </span>
                                {utilisateur.is_admin ? (
                                  <span
                                    className="badge"
                                    style={{
                                      backgroundColor: `${colors.oskar.green}15`,
                                      color: colors.oskar.green,
                                    }}
                                  >
                                    Oui
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">
                                    Non
                                  </span>
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <h6
                              className="fw-bold mb-3"
                              style={{ color: colors.oskar.green }}
                            >
                              <FontAwesomeIcon
                                icon={faShoppingBag}
                                className="me-2"
                              />
                              Statistiques de vente
                            </h6>
                            <div className="row g-3">
                              <div className="col-6 col-md-3">
                                <div className="text-center p-3 bg-white rounded-3">
                                  <div
                                    className="fs-4 fw-bold"
                                    style={{ color: colors.oskar.green }}
                                  >
                                    {utilisateur.produits.length}
                                  </div>
                                  <small className="text-muted">
                                    Total produits
                                  </small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-3 bg-white rounded-3">
                                  <div
                                    className="fs-4 fw-bold"
                                    style={{ color: colors.oskar.green }}
                                  >
                                    {produitsPublies.length}
                                  </div>
                                  <small className="text-muted">Publiés</small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-3 bg-white rounded-3">
                                  <div
                                    className="fs-4 fw-bold"
                                    style={{ color: "#ffc107" }}
                                  >
                                    {produitsEnAttente.length}
                                  </div>
                                  <small className="text-muted">
                                    En attente
                                  </small>
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-center p-3 bg-white rounded-3">
                                  <div
                                    className="fs-4 fw-bold"
                                    style={{ color: "#dc3545" }}
                                  >
                                    {produitsBloques.length}
                                  </div>
                                  <small className="text-muted">Bloqués</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section recommandations */}
            {produitsPublies.length > 0 && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5
                      className="fw-bold mb-0"
                      style={{ color: colors.oskar.black }}
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ color: "#ffc107" }}
                        className="me-2"
                      />
                      Produits recommandés
                    </h5>
                    <Link
                      href={`/utilisateurs/${utilisateur.uuid}/produits`}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: `${colors.oskar.green}15`,
                        color: colors.oskar.green,
                        border: `1px solid ${colors.oskar.green}30`,
                      }}
                    >
                      Voir tout
                    </Link>
                  </div>
                  <div className="row g-4">
                    {produitsPublies.slice(0, 2).map((produit) => (
                      <div key={produit.uuid} className="col-md-6">
                        <ProduitCard produit={produit} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .nav-underline .nav-link {
          border: none;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .nav-underline .nav-link:hover {
          background-color: rgba(16, 185, 129, 0.05);
        }

        .stat-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          border-radius: 16px;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1) !important;
        }

        .product-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1) !important;
        }

        @media (max-width: 768px) {
          .display-5 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
