// app/(front-office)/liste-favoris/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { api } from "@/lib/api-client";

// Types pour les favoris
interface FavoriItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre: string;
  description?: string | null;
  prix?: number | string | null;
  image?: string | null;
  date?: string;
  disponible?: boolean;
  statut?: string;
  isFavoris?: boolean;
  createur?: {
    uuid: string;
    nom: string;
    prenoms: string;
    email: string;
    telephone?: string;
    avatar?: string | null;
  };
  // Propriétés spécifiques
  libelle?: string;
  type_don?: string;
  lieu_retrait?: string;
  nomElementEchange?: string;
  typeEchange?: string;
  objetPropose?: string;
  objetDemande?: string;
  message?: string;
  localisation?: string;
}

type TabType = "all" | "produits" | "dons" | "echanges";

// Fonction pour formater le prix
const formatPrice = (
  price: number | string | null | undefined,
  type: string,
) => {
  if (price === null || price === undefined) return "Gratuit";
  if (price === 0) return "Gratuit";
  if (type === "don") return "Gratuit";
  if (type === "echange") return "Troc";

  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum)) return "Prix à discuter";
  return `${priceNum.toLocaleString("fr-FR")} FCFA`;
};

// Fonction pour formater la date
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
};

// Image placeholder
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BdWN1bmUgaW1hZ2U8L3RleHQ+PC9zdmc+";

// Composant pour la page de connexion
function LoginRequiredPage() {
  const { openLoginModal, openRegisterModal } = useAuth();

  return (
    <>
      {/* Hero Section pour non connecté */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green || "#9C27B0"} 0%, ${colors.oskar.greenHover || "#7B1FA2"} 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <h1 className="display-5 fw-bold mb-2">Mes Favoris</h1>
                <p className="lead mb-3 opacity-90">
                  Retrouvez toutes vos annonces préférées en un seul endroit
                </p>
              </div>
            </div>
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-3"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  width: "120px",
                  height: "120px",
                }}
              >
                <i className="fas fa-heart fa-4x"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="card border-0 shadow-lg overflow-hidden">
                <div className="row g-0">
                  {/* Colonne gauche - Illustration */}
                  <div
                    className="col-md-5 d-none d-md-block"
                    style={{
                      background: `linear-gradient(135deg, ${colors.oskar.purple || "#F3E5F5"} 0%, ${colors.oskar.purpleLight}20 100%)`,
                    }}
                  >
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center p-5">
                      <div className="mb-4">
                        <div className="position-relative">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: "120px",
                              height: "120px",
                              background: `linear-gradient(135deg, ${colors.oskar.purple || "#9C27B0"} 0%, ${colors.oskar.purple}80 100%)`,
                            }}
                          >
                            <i className="fas fa-heart fa-3x text-white"></i>
                          </div>

                          <div
                            className="position-absolute top-0 end-0 rounded-circle"
                            style={{
                              width: "40px",
                              height: "40px",
                              background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green}80 100%)`,
                              opacity: 0.3,
                            }}
                          ></div>
                          <div
                            className="position-absolute bottom-0 start-0 rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              background: `linear-gradient(135deg, ${colors.oskar.blue || "#2196F3"} 0%, ${colors.oskar.blue}80 100%)`,
                              opacity: 0.3,
                            }}
                          ></div>
                        </div>
                      </div>

                      <h3
                        className="fw-bold text-center mb-3"
                        style={{ color: colors.oskar.purple }}
                      >
                        Vos annonces préférées
                      </h3>
                      <p className="text-center text-muted mb-0">
                        Gardez une trace des annonces qui vous intéressent
                      </p>
                    </div>
                  </div>

                  {/* Colonne droite - Contenu */}
                  <div className="col-md-7">
                    <div className="card-body p-4 p-md-5">
                      <div className="text-center mb-4 d-md-none">
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "80px",
                            height: "80px",
                            background: `linear-gradient(135deg, ${colors.oskar.purple || "#9C27B0"} 0%, ${colors.oskar.purple}80 100%)`,
                          }}
                        >
                          <i className="fas fa-heart fa-2x text-white"></i>
                        </div>
                        <h3
                          className="fw-bold mb-2"
                          style={{ color: colors.oskar.purple }}
                        >
                          Connectez-vous
                        </h3>
                      </div>

                      <div className="text-center mb-4 d-none d-md-block">
                        <h2
                          className="fw-bold mb-3"
                          style={{ color: colors.oskar.purple }}
                        >
                          Connectez-vous à votre compte
                        </h2>
                        <p className="text-muted mb-0">
                          Accédez à vos annonces favorites en vous connectant
                        </p>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-4">
                          <div className="text-center">
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                              style={{
                                width: "60px",
                                height: "60px",
                                background: `${colors.oskar.greenHover}20`,
                                border: `2px solid ${colors.oskar.greenHover}`,
                              }}
                            >
                              <i
                                className="fas fa-tag fa-lg"
                                style={{ color: colors.oskar.green }}
                              ></i>
                            </div>
                            <p className="small mb-0 fw-semibold">Produits</p>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                              style={{
                                width: "60px",
                                height: "60px",
                                background: "#F3E5F5",
                                border: `2px solid #E1BEE7`,
                              }}
                            >
                              <i
                                className="fas fa-gift fa-lg"
                                style={{ color: "#9C27B0" }}
                              ></i>
                            </div>
                            <p className="small mb-0 fw-semibold">Dons</p>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                              style={{
                                width: "60px",
                                height: "60px",
                                background: "#E3F2FD",
                                border: `2px solid #BBDEFB`,
                              }}
                            >
                              <i
                                className="fas fa-exchange-alt fa-lg"
                                style={{ color: "#2196F3" }}
                              ></i>
                            </div>
                            <p className="small mb-0 fw-semibold">Échanges</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5
                          className="fw-bold mb-3"
                          style={{ color: colors.oskar.grey }}
                        >
                          Pourquoi créer un compte ?
                        </h5>
                        <div className="d-flex mb-2">
                          <div className="flex-shrink-0">
                            <i
                              className="fas fa-check-circle me-2"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0 small">
                              Sauvegardez vos annonces favorites
                            </p>
                          </div>
                        </div>
                        <div className="d-flex mb-2">
                          <div className="flex-shrink-0">
                            <i
                              className="fas fa-check-circle me-2"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0 small">
                              Recevez des notifications personnalisées
                            </p>
                          </div>
                        </div>
                        <div className="d-flex mb-2">
                          <div className="flex-shrink-0">
                            <i
                              className="fas fa-check-circle me-2"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0 small">
                              Accédez à votre historique d'activité
                            </p>
                          </div>
                        </div>
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <i
                              className="fas fa-check-circle me-2"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0 small">
                              Gérez facilement vos annonces
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="d-grid gap-3">
                        <button
                          className="btn btn-lg"
                          onClick={openLoginModal}
                          style={{
                            background: `linear-gradient(135deg, ${colors.oskar.purple || "#9C27B0"} 0%, ${colors.oskar.purple}90 100%)`,
                            color: "white",
                            border: "none",
                            padding: "12px 24px",
                            fontWeight: "600",
                          }}
                        >
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Se connecter à mon compte
                        </button>

                        <div className="position-relative my-3">
                          <hr className="my-0" />
                          <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                            OU
                          </span>
                        </div>

                        <button
                          className="btn btn-lg btn-outline-success"
                          onClick={openRegisterModal}
                          style={{
                            padding: "12px 24px",
                            fontWeight: "600",
                            borderWidth: "2px",
                          }}
                        >
                          <i className="fas fa-user-plus me-2"></i>
                          Créer un compte gratuitement
                        </button>
                      </div>

                      <div className="text-center mt-4">
                        <p className="text-muted small mb-2">
                          Vous souhaitez d'abord découvrir nos annonces ?
                        </p>
                        <Link
                          href="/dons-echanges"
                          className="btn btn-link text-decoration-none"
                          style={{ color: colors.oskar.purple }}
                        >
                          <i className="fas fa-search me-1"></i>
                          Explorer les annonces disponibles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Composant de carte de favori
const FavoriCard = ({
  item,
  onRemove,
}: {
  item: FavoriItem;
  onRemove: (uuid: string, type: "produit" | "echange" | "don") => void;
}) => {
  const [isFavorite, setIsFavorite] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "produit":
        return {
          label: "vente",
          color: colors.oskar.green,
          bgColor: "#16a34a",
          btnColor: "#f97316",
          icon: "fa-tag",
          priceColor: "text-success",
        };
      case "don":
        return {
          label: "don",
          color: "#9333ea",
          bgColor: "#9333ea",
          btnColor: "#9333ea",
          icon: "fa-gift",
          priceColor: "text-purple-600",
        };
      case "echange":
        return {
          label: "échange",
          color: "#2563eb",
          bgColor: "#2563eb",
          btnColor: "#2563eb",
          icon: "fa-exchange-alt",
          priceColor: "text-primary",
        };
      default:
        return {
          label: "annonce",
          color: colors.oskar.grey,
          bgColor: colors.oskar.grey,
          btnColor: colors.oskar.orange,
          icon: "fa-tag",
          priceColor: "text-muted",
        };
    }
  };

  const typeConfig = getTypeConfig(item.type);

  const getButtonText = () => {
    switch (item.type) {
      case "produit":
        return "Contacter";
      case "don":
        return "Intéressé";
      case "echange":
        return "Proposer";
      default:
        return "Voir";
    }
  };

  const getDetailLink = () => {
    switch (item.type) {
      case "don":
        return `/dons/${item.uuid}`;
      case "echange":
        return `/echanges/${item.uuid}`;
      case "produit":
        return `/produits/${item.uuid}`;
      default:
        return `/annonces/${item.uuid}`;
    }
  };

  const getImageSrc = () => {
    if (imageError || !item.image) return PLACEHOLDER_IMAGE;
    if (item.image.startsWith("http")) return item.image;
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${item.image}`;
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(false);
    onRemove(item.uuid, item.type);
  };

  return (
    <div className="card h-100 border-0 rounded-4 overflow-hidden shadow group cursor-pointer transition-all">
      {/* Image */}
      <div
        className="position-relative overflow-hidden"
        style={{ height: "224px" }}
      >
        <Link href={getDetailLink()}>
          <img
            src={getImageSrc()}
            alt={item.titre || "Favori"}
            className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
            style={{ transition: "transform 0.3s ease" }}
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Badge type */}
        <div
          className="position-absolute top-0 start-0 px-2 py-1 text-white small fw-bold rounded-3 d-flex align-items-center gap-1 m-2"
          style={{ backgroundColor: typeConfig.bgColor }}
        >
          <i className={`fas ${typeConfig.icon}`}></i>
          <span>{typeConfig.label}</span>
        </div>

        {/* Bouton retirer favori */}
        <button
          className="position-absolute top-0 end-0 w-10 h-10 bg-white rounded-circle d-flex align-items-center justify-content-center shadow border-0 m-2 transition-colors"
          style={{
            width: "40px",
            height: "40px",
            color: "#ff6b6b",
          }}
          onClick={handleRemoveClick}
          aria-label={`Retirer ${item.titre} des favoris`}
        >
          <i className="fa-solid fa-heart"></i>
        </button>
      </div>

      {/* Contenu */}
      <div className="card-body p-4">
        <Link href={getDetailLink()} className="text-decoration-none">
          <h5 className="card-title fw-bold text-dark mb-2 text-truncate">
            {item.titre}
          </h5>
        </Link>

        <div className={`fw-bold fs-4 mb-2 ${typeConfig.priceColor}`}>
          {formatPrice(item.prix, item.type)}
        </div>

        {item.description && (
          <p className="card-text text-muted small mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
          {item.localisation && (
            <span className="d-flex align-items-center">
              <i className="fa-solid fa-location-dot me-1 text-warning"></i>
              {item.localisation}
            </span>
          )}
          {item.date && (
            <span className="d-flex align-items-center">
              <i className="fa-regular fa-clock me-1"></i>
              {formatDate(item.date)}
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div className="d-flex align-items-center">
            {item.createur?.avatar ? (
              <img
                src={item.createur.avatar}
                alt={`${item.createur.prenoms} ${item.createur.nom}`}
                className="rounded-circle object-fit-cover me-2"
                style={{ width: "32px", height: "32px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                style={{ width: "32px", height: "32px" }}
              >
                <i className="fas fa-user text-muted"></i>
              </div>
            )}
            <span className="small fw-medium text-dark">
              {item.createur
                ? `${item.createur.prenoms || ""} ${item.createur.nom || ""}`.trim() ||
                  "Annonceur"
                : "Annonceur"}
            </span>
          </div>
          <Link
            href={getDetailLink()}
            className="btn text-white px-4 py-2 rounded-3 fw-semibold border-0 transition-colors"
            style={{ backgroundColor: typeConfig.btnColor }}
          >
            {getButtonText()}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .group {
          transition: all 0.3s ease;
        }

        .group:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .group:hover .group-hover-scale {
          transform: scale(1.05);
        }

        .transition-transform {
          transition: transform 0.3s ease;
        }

        .transition-colors {
          transition: all 0.3s ease;
        }

        .transition-colors:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .object-fit-cover {
          object-fit: cover;
        }

        .text-purple-600 {
          color: #9333ea;
        }
      `}</style>
    </div>
  );
};

export default function ListeFavorisPage() {
  const { isLoggedIn, openLoginModal, user } = useAuth();
  const [viewMode] = useState<"grid" | "list">("grid"); // Forcé en grid pour correspondre au design
  const [activeFilter, setActiveFilter] = useState<TabType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favoris, setFavoris] = useState<FavoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [stats, setStats] = useState({
    totalProduits: 0,
    totalDons: 0,
    totalEchanges: 0,
    totalFavoris: 0,
  });

  // ✅ Déterminer le type d'utilisateur
  const getUserType = useCallback(() => {
    return user?.type?.toLowerCase() || "utilisateur";
  }, [user]);

  // ✅ FONCTION RÉCUPÉRER LES FAVORIS
  const fetchAllFavoris = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Vous devez être connecté pour voir vos favoris");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📥 Récupération des favoris...");

      const userType = getUserType();
      console.log(`👤 Type d'utilisateur: ${userType}`);

      let produitsEndpoint = "";
      let donsEndpoint = "";
      let echangesEndpoint = "";

      if (userType === "vendeur") {
        produitsEndpoint = API_ENDPOINTS.PRODUCTS.LIST_PRODUITS_FAVORIS_VENDEUR;
        donsEndpoint = API_ENDPOINTS.DONS.LIST_FAVORIS_DON_VENDEUR;
        echangesEndpoint = API_ENDPOINTS.ECHANGES.LIST_ECHANGES_FAVORIS_VENDEUR;
      } else {
        produitsEndpoint =
          API_ENDPOINTS.PRODUCTS.LIST_PRODUITS_FAVORIS_UTILISATEUR;
        donsEndpoint = API_ENDPOINTS.DONS.LIST_FAVORIS_DON_UTILISATEUR;
        echangesEndpoint =
          API_ENDPOINTS.ECHANGES.LIST_ECHANGES_FAVORIS_UTILISATEUR;
      }

      const [produitsRes, donsRes, echangesRes] = await Promise.allSettled([
        api.get<any>(produitsEndpoint),
        api.get<any>(donsEndpoint),
        api.get<any>(echangesEndpoint),
      ]);

      const allFavoris: FavoriItem[] = [];
      let produitsCount = 0;
      let donsCount = 0;
      let echangesCount = 0;

      // Traiter les produits
      if (produitsRes.status === "fulfilled") {
        const response = produitsRes.value;
        let produitsData = [];

        if (response.data && Array.isArray(response.data)) {
          produitsData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          produitsData = response.data.data;
        } else if (Array.isArray(response)) {
          produitsData = response;
        }

        produitsData.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid,
            type: "produit",
            titre: item.libelle || item.titre || "Produit sans nom",
            description: item.description,
            prix: item.prix,
            image: item.image,
            date: item.createdAt || item.updatedAt,
            statut: item.statut,
            disponible: item.disponible,
            localisation: item.localisation || item.ville,
            createur: item.createur || item.vendeur || item.utilisateur,
          });
          produitsCount++;
        });
      }

      // Traiter les dons
      if (donsRes.status === "fulfilled") {
        const response = donsRes.value;
        let donsData = [];

        if (response.data && Array.isArray(response.data)) {
          donsData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          donsData = response.data.data;
        } else if (Array.isArray(response)) {
          donsData = response;
        }

        donsData.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid,
            type: "don",
            titre: item.titre || item.nom || "Don sans titre",
            description: item.description,
            prix: item.prix,
            image: item.image,
            date: item.createdAt,
            statut: item.statut,
            disponible: item.disponible,
            localisation: item.localisation || item.lieu_retrait,
            type_don: item.type_don,
            lieu_retrait: item.lieu_retrait,
            createur: item.createur,
          });
          donsCount++;
        });
      }

      // Traiter les échanges
      if (echangesRes.status === "fulfilled") {
        const response = echangesRes.value;
        let echangesData = [];

        if (response.data && Array.isArray(response.data)) {
          echangesData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          echangesData = response.data.data;
        } else if (Array.isArray(response)) {
          echangesData = response;
        }

        echangesData.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid,
            type: "echange",
            titre: item.nomElementEchange || item.titre || "Échange sans titre",
            description: item.message || item.description,
            prix: item.prix,
            image: item.image,
            date: item.dateProposition || item.createdAt,
            statut: item.statut,
            localisation: item.localisation || item.lieu_rencontre,
            typeEchange: item.typeEchange,
            objetPropose: item.objetPropose,
            objetDemande: item.objetDemande,
          });
          echangesCount++;
        });
      }

      console.log(`📊 Total favoris trouvés: ${allFavoris.length}`);

      setStats({
        totalProduits: produitsCount,
        totalDons: donsCount,
        totalEchanges: echangesCount,
        totalFavoris: allFavoris.length,
      });

      // Trier par date (les plus récents en premier)
      const sortedFavoris = allFavoris.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      setFavoris(sortedFavoris);
      setError(null);
    } catch (err: any) {
      console.error("❌ Erreur lors de la récupération des favoris:", err);

      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError(err.message || "Impossible de charger vos favoris");
      }

      setFavoris([]);
      setStats({
        totalProduits: 0,
        totalDons: 0,
        totalEchanges: 0,
        totalFavoris: 0,
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [isLoggedIn, getUserType]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllFavoris();
    } else {
      setLoading(false);
      setInitialLoad(false);
      setError("Vous devez être connecté pour voir vos favoris");
    }
  }, [fetchAllFavoris, isLoggedIn]);

  // ✅ Fonction pour supprimer un favori
  const handleRemoveFavori = async (
    uuid: string,
    type: "produit" | "echange" | "don",
  ) => {
    try {
      console.log(`🗑️ Suppression du favori ${type}: ${uuid}`);

      let endpoint = "";

      switch (type) {
        case "produit":
          endpoint = API_ENDPOINTS.FAVORIS.REMOVE(uuid);
          break;
        default:
          endpoint = `/favoris/${uuid}`;
      }

      await api.delete(endpoint);

      setFavoris((prev) => prev.filter((item) => item.uuid !== uuid));
      setStats((prev) => ({
        ...prev,
        totalFavoris: prev.totalFavoris - 1,
        totalProduits:
          type === "produit" ? prev.totalProduits - 1 : prev.totalProduits,
        totalDons: type === "don" ? prev.totalDons - 1 : prev.totalDons,
        totalEchanges:
          type === "echange" ? prev.totalEchanges - 1 : prev.totalEchanges,
      }));

      console.log("✅ Favori supprimé avec succès");
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du favori:", err);
      alert("Impossible de supprimer ce favori pour le moment");
    }
  };

  // Filtrer les favoris selon l'onglet actif
  const filteredFavoris = favoris.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "produits") return item.type === "produit";
    if (activeFilter === "dons") return item.type === "don";
    if (activeFilter === "echanges") return item.type === "echange";
    return true;
  });

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId as TabType);
  };

  const handleRefresh = () => {
    fetchAllFavoris();
  };

  // Si l'utilisateur n'est pas connecté
  if (!isLoggedIn && !initialLoad) {
    return <LoginRequiredPage />;
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green || "#9C27B0"} 0%, ${colors.oskar.greenHover || "#7B1FA2"} 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <h1 className="display-5 fw-bold mb-2">Mes Favoris</h1>
                <p className="lead mb-3 opacity-90">
                  Retrouvez toutes vos annonces préférées en un seul endroit
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: colors.oskar.purple || "#9C27B0" }}
                    onClick={handleRefresh}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Actualiser la liste
                  </button>
                  <Link
                    href="/dons-echanges"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-search me-1"></i>
                    Découvrir plus d'annonces
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center p-3"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  width: "120px",
                  height: "120px",
                }}
              >
                <i className="fas fa-heart fa-4x"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-3 border-bottom">
        <div className="container">
          <div className="row g-3">
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.purple || "#9C27B0" }}
                >
                  {stats.totalFavoris}
                </div>
                <div className="text-muted small">Total favoris</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {stats.totalProduits}
                </div>
                <div className="text-muted small">Produits</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#9C27B0" }}>
                  {stats.totalDons}
                </div>
                <div className="text-muted small">Dons</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {stats.totalEchanges}
                </div>
                <div className="text-muted small">Échanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-4">
        <div className="container">
          <div className="row g-3">
            {/* Sidebar des filtres */}
            <div className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                {/* Filtres par type */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="mb-0 fw-semibold">
                      <i
                        className="fas fa-filter me-1"
                        style={{ color: colors.oskar.purple || "#9C27B0" }}
                      ></i>
                      Filtrer par type
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex flex-column gap-2">
                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "all" ? "active" : ""}`}
                        onClick={() => handleFilterChange("all")}
                        style={{
                          background:
                            activeFilter === "all"
                              ? `${colors.oskar.purpleLight || "#F3E5F5"}`
                              : "transparent",
                          color:
                            activeFilter === "all"
                              ? colors.oskar.purple || "#9C27B0"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "all" ? colors.oskar.purple || "#9C27B0" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-layer-group me-2"></i>
                          Tous les favoris
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalFavoris}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "produits" ? "active" : ""}`}
                        onClick={() => handleFilterChange("produits")}
                        style={{
                          background:
                            activeFilter === "produits"
                              ? `${colors.oskar.green}20`
                              : "transparent",
                          color:
                            activeFilter === "produits"
                              ? colors.oskar.green
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "produits" ? colors.oskar.green : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-tag me-2"></i>
                          Produits
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalProduits}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "dons" ? "active" : ""}`}
                        onClick={() => handleFilterChange("dons")}
                        style={{
                          background:
                            activeFilter === "dons" ? "#F3E5F5" : "transparent",
                          color:
                            activeFilter === "dons"
                              ? "#9C27B0"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "dons" ? "#9C27B0" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-gift me-2"></i>
                          Dons
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalDons}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "echanges" ? "active" : ""}`}
                        onClick={() => handleFilterChange("echanges")}
                        style={{
                          background:
                            activeFilter === "echanges"
                              ? "#E3F2FD"
                              : "transparent",
                          color:
                            activeFilter === "echanges"
                              ? "#2196F3"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "echanges" ? "#2196F3" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-exchange-alt me-2"></i>
                          Échanges
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalEchanges}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info supplémentaire */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <h6 className="card-title fw-semibold mb-2">
                      <i
                        className="fas fa-info-circle me-1"
                        style={{
                          color: colors.oskar.purple || "#9C27B0",
                          fontSize: "0.9rem",
                        }}
                      ></i>
                      Vos favoris
                    </h6>
                    <div className="mb-2">
                      <p className="small text-muted mb-1">
                        <i
                          className="fas fa-heart me-1"
                          style={{ color: "#ff6b6b" }}
                        ></i>
                        <strong>Gestion :</strong> Retirez un favori en cliquant
                        sur le cœur
                      </p>
                    </div>
                    <div>
                      <p className="small text-muted mb-0">
                        <i
                          className="fas fa-sync-alt me-1"
                          style={{ color: colors.oskar.purple || "#9C27B0" }}
                        ></i>
                        <strong>Mise à jour :</strong> Cliquez sur "Actualiser"
                        pour voir les derniers favoris
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="col-xl-9 col-lg-8">
              {/* Barre de filtres et options */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h2 className="h4 fw-bold text-dark d-flex align-items-center">
                      {activeFilter === "all" && "Tous mes favoris"}
                      {activeFilter === "produits" && (
                        <>
                          <i className="fas fa-tag text-success me-2"></i>
                          Mes produits favoris
                        </>
                      )}
                      {activeFilter === "dons" && (
                        <>
                          <i className="fas fa-gift text-purple-600 me-2"></i>
                          Mes dons favoris
                        </>
                      )}
                      {activeFilter === "echanges" && (
                        <>
                          <i className="fas fa-exchange-alt text-primary me-2"></i>
                          Mes échanges favoris
                        </>
                      )}
                    </h2>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-outline-success btn-sm d-lg-none"
                      onClick={() => setShowFilters(!showFilters)}
                      type="button"
                    >
                      <i className="fas fa-sliders-h"></i>
                    </button>
                  </div>
                </div>

                {/* Barre d'information */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <p className="text-muted mb-0">
                    Affichage de {filteredFavoris.length} sur{" "}
                    {stats.totalFavoris} résultats
                  </p>
                </div>
              </div>

              {/* Filtres mobiles */}
              {showFilters && (
                <div className="card mb-3 d-lg-none">
                  <div className="card-header bg-white py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small fw-semibold">Filtres</span>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => setShowFilters(false)}
                        type="button"
                      >
                        <i className="fas fa-times small"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-2">
                    <div className="d-flex flex-column gap-2">
                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "all" ? "active" : ""}`}
                        onClick={() => {
                          handleFilterChange("all");
                          setShowFilters(false);
                        }}
                        style={{
                          background:
                            activeFilter === "all"
                              ? `${colors.oskar.purpleLight || "#F3E5F5"}`
                              : "transparent",
                          color:
                            activeFilter === "all"
                              ? colors.oskar.purple || "#9C27B0"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "all" ? colors.oskar.purple || "#9C27B0" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-layer-group me-2"></i>
                          Tous les favoris
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalFavoris}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "produits" ? "active" : ""}`}
                        onClick={() => {
                          handleFilterChange("produits");
                          setShowFilters(false);
                        }}
                        style={{
                          background:
                            activeFilter === "produits"
                              ? `${colors.oskar.green}20`
                              : "transparent",
                          color:
                            activeFilter === "produits"
                              ? colors.oskar.green
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "produits" ? colors.oskar.green : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-tag me-2"></i>
                          Produits
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalProduits}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "dons" ? "active" : ""}`}
                        onClick={() => {
                          handleFilterChange("dons");
                          setShowFilters(false);
                        }}
                        style={{
                          background:
                            activeFilter === "dons" ? "#F3E5F5" : "transparent",
                          color:
                            activeFilter === "dons"
                              ? "#9C27B0"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "dons" ? "#9C27B0" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-gift me-2"></i>
                          Dons
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalDons}
                        </span>
                      </button>

                      <button
                        className={`btn btn-sm d-flex align-items-center justify-content-between ${activeFilter === "echanges" ? "active" : ""}`}
                        onClick={() => {
                          handleFilterChange("echanges");
                          setShowFilters(false);
                        }}
                        style={{
                          background:
                            activeFilter === "echanges"
                              ? "#E3F2FD"
                              : "transparent",
                          color:
                            activeFilter === "echanges"
                              ? "#2196F3"
                              : colors.oskar.grey,
                          border: `1px solid ${activeFilter === "echanges" ? "#2196F3" : "#dee2e6"}`,
                        }}
                      >
                        <span>
                          <i className="fas fa-exchange-alt me-2"></i>
                          Échanges
                        </span>
                        <span className="badge bg-secondary">
                          {stats.totalEchanges}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenu des favoris */}
              {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center py-5">
                  <div
                    className="spinner-border text-success mb-3"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <span className="text-muted">
                    Chargement de vos favoris...
                  </span>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {error}
                  <button
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={handleRefresh}
                  >
                    <i className="fa-solid fa-rotate me-1"></i>
                    Réessayer
                  </button>
                  {error.includes("connecté") && (
                    <button
                      className="btn btn-outline-primary btn-sm ms-2"
                      onClick={openLoginModal}
                    >
                      <i className="fa-solid fa-sign-in-alt me-1"></i>
                      Se connecter
                    </button>
                  )}
                </div>
              ) : filteredFavoris.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i
                      className="fa-regular fa-heart fa-3x"
                      style={{ color: colors.oskar.lightGrey }}
                    ></i>
                  </div>
                  <h4 className="fw-bold mb-3">Aucun favori</h4>
                  <p className="text-muted mb-4">
                    {activeFilter === "all"
                      ? "Vous n'avez pas encore ajouté d'annonces à vos favoris."
                      : activeFilter === "produits"
                        ? "Vous n'avez pas encore ajouté de produits à vos favoris."
                        : activeFilter === "dons"
                          ? "Vous n'avez pas encore ajouté de dons à vos favoris."
                          : "Vous n'avez pas encore ajouté d'échanges à vos favoris."}
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link href="/dons-echanges" className="btn btn-success">
                      <i className="fa-solid fa-search me-2"></i>
                      Explorer les dons & échanges
                    </Link>
                    <Link href="/" className="btn btn-outline-success">
                      <i className="fa-solid fa-tag me-2"></i>
                      Voir tous les produits
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="listings-grid">
                  {/* Toutes les annonces favorites */}
                  <div className="all-listings mb-5">
                    <div className="row g-4">
                      {filteredFavoris.map((item) => (
                        <div
                          key={`${item.type}-${item.uuid}`}
                          className="col-lg-4 col-md-6"
                        >
                          <FavoriCard
                            item={item}
                            onRemove={handleRemoveFavori}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Section d'information */}
              {!loading && !error && filteredFavoris.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle p-2 me-2 flex-shrink-0"
                              style={{ backgroundColor: "#F3E5F5" }}
                            >
                              <i
                                className="fas fa-heart"
                                style={{
                                  color: colors.oskar.purple || "#9C27B0",
                                }}
                              ></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">
                                Gestion des favoris
                              </h6>
                              <p className="small text-muted mb-2">
                                Cliquez sur le cœur pour retirer une annonce de
                                vos favoris.
                              </p>
                              <ul className="list-unstyled small mb-0">
                                <li className="mb-1">
                                  <i
                                    className="fas fa-check-circle me-1"
                                    style={{
                                      color: colors.oskar.purple || "#9C27B0",
                                      fontSize: "0.7rem",
                                    }}
                                  ></i>
                                  Retirez facilement
                                </li>
                                <li className="mb-1">
                                  <i
                                    className="fas fa-check-circle me-1"
                                    style={{
                                      color: colors.oskar.purple || "#9C27B0",
                                      fontSize: "0.7rem",
                                    }}
                                  ></i>
                                  Liste automatiquement mise à jour
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle p-2 me-2 flex-shrink-0"
                              style={{
                                backgroundColor: colors.oskar.greenHover,
                              }}
                            >
                              <i
                                className="fas fa-bell"
                                style={{ color: colors.oskar.green }}
                              ></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">Notifications</h6>
                              <p className="small text-muted mb-2">
                                Soyez informé des changements sur vos favoris.
                              </p>
                              <ul className="list-unstyled small mb-0">
                                <li className="mb-1">
                                  <i
                                    className="fas fa-check-circle me-1"
                                    style={{
                                      color: colors.oskar.green,
                                      fontSize: "0.7rem",
                                    }}
                                  ></i>
                                  Prix modifiés
                                </li>
                                <li>
                                  <i
                                    className="fas fa-check-circle me-1"
                                    style={{
                                      color: colors.oskar.green,
                                      fontSize: "0.7rem",
                                    }}
                                  ></i>
                                  Nouveaux messages
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA compact */}
              {!loading && !error && filteredFavoris.length > 0 && (
                <div
                  className="mt-4 rounded-2 p-3 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${colors.oskar.purpleLight || "#F3E5F5"} 0%, ${colors.oskar.purpleLight || "#F3E5F5"}20 100%)`,
                    border: `1px solid ${colors.oskar.purple || "#9C27B0"}20`,
                  }}
                >
                  <h6 className="fw-bold mb-2">Trouvez plus d'annonces</h6>
                  <p className="small text-muted mb-3">
                    Explorez notre catalogue complet pour découvrir d'autres
                    annonces
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link
                      href="/dons-echanges"
                      className="btn btn-success btn-sm px-3"
                    >
                      <i className="fas fa-gift me-1"></i>
                      Voir les dons & échanges
                    </Link>
                    <Link
                      href="/"
                      className="btn btn-outline-success btn-sm px-3"
                    >
                      <i className="fas fa-search me-1"></i>
                      Explorer tout le catalogue
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="h5 fw-bold mb-1">Questions fréquentes</h3>
            <p className="text-muted small">
              Tout sur la gestion de vos favoris
            </p>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{
                        color: colors.oskar.purple || "#9C27B0",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Comment ajouter des favoris ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Cliquez sur l'icône cœur sur n'importe quelle annonce pour
                    l'ajouter à vos favoris.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{
                        color: colors.oskar.purple || "#9C27B0",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Les favoris sont-ils privés ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, votre liste de favoris est visible uniquement depuis
                    votre compte.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{
                        color: colors.oskar.purple || "#9C27B0",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Puis-je partager mes favoris ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Non, actuellement les favoris sont personnels et non
                    partageables.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <h6 className="fw-semibold mb-2">
                    <i
                      className="fas fa-question-circle me-1"
                      style={{
                        color: colors.oskar.purple || "#9C27B0",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Les favoris sont-ils limités ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Non, vous pouvez ajouter autant d'annonces que vous le
                    souhaitez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .sticky-top {
          position: sticky;
          top: 90px;
        }

        .listings-grid {
          flex: 1;
        }

        .group {
          transition: all 0.3s ease;
        }

        .group:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .group:hover .group-hover-scale {
          transform: scale(1.05);
        }

        .transition-transform {
          transition: transform 0.3s ease;
        }

        .transition-colors {
          transition: all 0.3s ease;
        }

        .text-purple-600 {
          color: #9333ea;
        }

        @media (max-width: 1199.98px) {
          .col-xl-3 {
            flex: 0 0 25%;
            max-width: 25%;
          }
          .col-xl-9 {
            flex: 0 0 75%;
            max-width: 75%;
          }
        }

        @media (max-width: 991.98px) {
          .col-lg-4 {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .col-lg-8 {
            flex: 0 0 66.666667%;
            max-width: 66.666667%;
          }
        }

        @media (max-width: 767.98px) {
          .display-5 {
            font-size: 1.75rem;
          }
          .lead {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
