// app/(front-office)/liste-favoris/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { API_CONFIG, buildApiUrl } from "@/config/env";
import colors from "@/app/shared/constants/colors";

interface FavoriItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre?: string;
  nom?: string;
  description?: string | null;
  prix?: number | string | null;
  image?: string | null;
  date?: string;
  disponible?: boolean;
  statut?: string;
  numero?: string;
  createdAt?: string | null;
  isFavoris?: boolean;
  nomElementEchange?: string;
  typeEchange?: string;
  objetPropose?: string;
  objetDemande?: string;
}

type TabType = "all" | "produits" | "dons" | "echanges";

// Fonction pour convertir les filtres UI en types d'items
const filterToItemType = (filter: string): "don" | "echange" | "produit" => {
  switch(filter) {
    case "dons": return "don";
    case "echanges": return "echange";
    case "produits": return "produit";
    default: return "don"; // Fallback
  }
};

// Fonction pour formater le prix
const formatPrice = (price: number | string | null | undefined) => {
  if (price === null || price === undefined) return "Gratuit";
  if (price === 0) return "Gratuit";

  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(priceNum)) return "Prix à discuter";

  return `${priceNum.toLocaleString("fr-FR")} FCFA`;
};

// Fonction pour formater la date
const formatDate = (dateString?: string) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Image placeholder en base64
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";

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

      {/* Section principale avec design amélioré */}
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

                          {/* Petits cercles décoratifs */}
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

                      {/* Icônes d'illustration */}
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

                      {/* Boutons d'action */}
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

                      {/* Lien de découverte */}
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

              {/* Section des avantages */}
              <div className="mt-5">
                <h4
                  className="text-center fw-bold mb-4"
                  style={{ color: colors.oskar.purple }}
                >
                  Les avantages de vos favoris
                </h4>
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "70px",
                              height: "70px",
                              background: `${colors.oskar.purpleLight}`,
                            }}
                          >
                            <i
                              className="fas fa-bookmark fa-lg"
                              style={{ color: colors.oskar.purple }}
                            ></i>
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Sauvegarde facile</h5>
                        <p className="text-muted small mb-0">
                          Un simple clic pour sauvegarder vos annonces préférées
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "70px",
                              height: "70px",
                              background: `${colors.oskar.greenHover}20`,
                            }}
                          >
                            <i
                              className="fas fa-bell fa-lg"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Notifications</h5>
                        <p className="text-muted small mb-0">
                          Soyez alerté des changements sur vos annonces
                          favorites
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="mb-3">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "70px",
                              height: "70px",
                              background: "#E3F2FD",
                            }}
                          >
                            <i
                              className="fas fa-sync-alt fa-lg"
                              style={{ color: "#2196F3" }}
                            ></i>
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Accès rapide</h5>
                        <p className="text-muted small mb-0">
                          Retrouvez rapidement toutes vos annonces en un seul
                          endroit
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h3
              className="h4 fw-bold mb-2"
              style={{ color: colors.oskar.purple }}
            >
              Questions fréquentes
            </h3>
            <p className="text-muted">
              Tout ce que vous devez savoir sur les favoris
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <i
                        className="fas fa-question-circle fa-lg me-3"
                        style={{ color: colors.oskar.purple }}
                      ></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">
                        Les favoris sont-ils gratuits ?
                      </h5>
                      <p className="text-muted mb-0">
                        Oui, la fonctionnalité "Favoris" est entièrement
                        gratuite pour tous les utilisateurs inscrits sur notre
                        plateforme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <i
                        className="fas fa-question-circle fa-lg me-3"
                        style={{ color: colors.oskar.purple }}
                      ></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">
                        Puis-je partager mes favoris ?
                      </h5>
                      <p className="text-muted mb-0">
                        Non, votre liste de favoris est personnelle et privée.
                        Vous pouvez cependant partager des annonces
                        individuelles avec vos proches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <i
                        className="fas fa-question-circle fa-lg me-3"
                        style={{ color: colors.oskar.purple }}
                      ></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">
                        Combien de favoris puis-je avoir ?
                      </h5>
                      <p className="text-muted mb-0">
                        Il n'y a pas de limite au nombre d'annonces que vous
                        pouvez ajouter à vos favoris. Ajoutez autant d'annonces
                        que vous le souhaitez !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <i
                        className="fas fa-question-circle fa-lg me-3"
                        style={{ color: colors.oskar.purple }}
                      ></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">
                        Mes favoris sont-ils sauvegardés ?
                      </h5>
                      <p className="text-muted mb-0">
                        Oui, vos favoris sont sauvegardés sur votre compte et
                        restent accessibles depuis n'importe quel appareil
                        lorsque vous vous connectez.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="text-center mt-5">
            <div
              className="card border-0 shadow"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.purple}10 0%, ${colors.oskar.green}10 100%)`,
                border: `1px solid ${colors.oskar.purple}20`,
              }}
            >
              <div className="card-body py-5 px-4">
                <h4
                  className="fw-bold mb-3"
                  style={{ color: colors.oskar.purple }}
                >
                  Prêt à découvrir nos annonces ?
                </h4>
                <p className="text-muted mb-4">
                  Rejoignez notre communauté et commencez à sauvegarder vos
                  annonces favorites dès maintenant.
                </p>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <button
                    className="btn btn-lg px-4"
                    onClick={openRegisterModal}
                    style={{
                      background: `linear-gradient(135deg, ${colors.oskar.purple} 0%, ${colors.oskar.purple}90 100%)`,
                      color: "white",
                      border: "none",
                      fontWeight: "600",
                    }}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Créer un compte
                  </button>
                  <button
                    className="btn btn-lg btn-outline-success px-4"
                    onClick={openLoginModal}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ListeFavorisPage() {
  const { isLoggedIn, openLoginModal, user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("recent");
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

  // Fonction pour récupérer le token
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("oskar_token");
  }, []);

  // Fonction pour obtenir le lien de détail
  const getDetailLink = (item: FavoriItem) => {
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

  // Fonction pour obtenir le type en français
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "don":
        return "Don";
      case "echange":
        return "Échange";
      case "produit":
        return "Produit";
      default:
        return "Annonce";
    }
  };

  // Fonction pour obtenir la couleur du type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "don":
        return "#9C27B0";
      case "echange":
        return "#2196F3";
      case "produit":
        return colors.oskar.green;
      default:
        return colors.oskar.grey;
    }
  };

  // Fonction pour récupérer tous les favoris
  const fetchAllFavoris = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setError("Vous devez être connecté pour voir vos favoris");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error(
          "Vous devez vous reconnecter pour accéder à vos favoris.",
        );
      }

      const [produitsResponse, donsResponse, echangesResponse] =
        await Promise.allSettled([
          axios.get(
            buildApiUrl(API_ENDPOINTS.PRODUCTS.DETAIL_FAVORIS_UTILISATEUR),
            {
              headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                Authorization: `Bearer ${token}`,
              },
              timeout: API_CONFIG.TIMEOUT,
            },
          ),
          axios.get(buildApiUrl(API_ENDPOINTS.DONS.DONS_FAVORIS), {
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            timeout: API_CONFIG.TIMEOUT,
          }),
          axios.get(buildApiUrl(API_ENDPOINTS.ECHANGES.ECHANGES_FAVORIS), {
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            timeout: API_CONFIG.TIMEOUT,
          }),
        ]);

      const allFavoris: FavoriItem[] = [];
      let produitsCount = 0;
      let donsCount = 0;
      let echangesCount = 0;

      // Traiter les produits
      if (produitsResponse.status === "fulfilled") {
        const produitsData = Array.isArray(produitsResponse.value.data)
          ? produitsResponse.value.data
          : [];

        produitsCount = produitsData.length;
        produitsData.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid || "",
            type: "produit",
            titre: item.nom || "Produit sans nom",
            nom: item.nom,
            description: item.description,
            prix: item.prix,
            image: item.image || PLACEHOLDER_IMAGE,
            date: item.date,
            disponible: item.disponible,
            isFavoris: true,
            createdAt: item.createdAt,
          });
        });
      }

      // Traiter les dons
      if (donsResponse.status === "fulfilled") {
        const donsData = Array.isArray(donsResponse.value.data)
          ? donsResponse.value.data
          : [];

        donsCount = donsData.length;
        donsData.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid || "",
            type: "don",
            titre: item.titre || "Don sans titre",
            description: item.description,
            prix: item.prix,
            image: item.image || PLACEHOLDER_IMAGE,
            statut: item.statut,
            numero: item.numero,
            isFavoris: true,
            createdAt: item.createdAt,
          });
        });
      }

      // Traiter les échanges
      if (echangesResponse.status === "fulfilled") {
        const echangesData =
          echangesResponse.value.data.data || echangesResponse.value.data;
        const echangesArray = Array.isArray(echangesData) ? echangesData : [];

        echangesCount = echangesArray.length;
        echangesArray.forEach((item: any) => {
          allFavoris.push({
            uuid: item.uuid || "",
            type: "echange",
            titre: item.nomElementEchange || item.titre || "Échange sans titre",
            nomElementEchange: item.nomElementEchange,
            description: item.message,
            prix: item.prix,
            image: item.image || PLACEHOLDER_IMAGE,
            statut: item.statut,
            typeEchange: item.typeEchange,
            objetPropose: item.objetPropose,
            objetDemande: item.objetDemande,
            isFavoris: true,
            createdAt: item.createdAt,
            date: item.dateProposition,
          });
        });
      }

      // Mettre à jour les statistiques
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
      console.error("Erreur lors de la récupération des favoris:", err);

      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err.code === "ECONNABORTED") {
        setError(
          "Le serveur met trop de temps à répondre. Veuillez réessayer.",
        );
      } else if (err.message?.includes("Network Error")) {
        setError("Problème de connexion. Vérifiez votre internet.");
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
  }, [isLoggedIn, getToken]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllFavoris();
    } else {
      setLoading(false);
      setInitialLoad(false);
      setError("Vous devez être connecté pour voir vos favoris");
    }
  }, [fetchAllFavoris, isLoggedIn]);

  // Si l'utilisateur n'est pas connecté
  if (!isLoggedIn && !initialLoad) {
    return <LoginRequiredPage />;
  }

  // Filtrer les favoris selon l'onglet actif
  const filteredFavoris = favoris.filter((item) => {
    if (activeFilter === "all") return true;
    // Utiliser la fonction de conversion pour comparer les types
    const itemType = filterToItemType(activeFilter);
    return item.type === itemType;
  });

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    // Trier localement
    const sorted = [...filteredFavoris].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          const priceA = a.prix ? parseFloat(a.prix.toString()) : 0;
          const priceB = b.prix ? parseFloat(b.prix.toString()) : 0;
          return priceA - priceB;
        case "price-desc":
          const priceC = a.prix ? parseFloat(a.prix.toString()) : 0;
          const priceD = b.prix ? parseFloat(b.prix.toString()) : 0;
          return priceD - priceC;
        case "recent":
        default:
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
      }
    });
    // On ne peut pas directement setFilteredFavoris, donc on met à jour le state principal
    // Pour simplifier, on va juste mettre à jour l'état local de tri
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId as TabType);
  };

  // Fonction pour supprimer un favori
  const handleRemoveFavori = async (
    uuid: string,
    type: "produit" | "echange" | "don",
  ) => {
    try {
      const token = getToken();
      if (!token) {
        alert("Vous devez être connecté pour retirer un favori");
        return;
      }

      let endpoint = "";

      switch (type) {
        case "produit":
          endpoint = API_ENDPOINTS.FAVORIS.REMOVE(uuid);
          break;
        default:
          endpoint = `/favoris/${uuid}`;
          break;
      }

      await axios.delete(buildApiUrl(endpoint), {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      // Mettre à jour la liste localement
      setFavoris((prev) => prev.filter((item) => item.uuid !== uuid));

      // Mettre à jour les statistiques
      setStats((prev) => ({
        ...prev,
        totalFavoris: prev.totalFavoris - 1,
        totalProduits:
          type === "produit" ? prev.totalProduits - 1 : prev.totalProduits,
        totalDons: type === "don" ? prev.totalDons - 1 : prev.totalDons,
        totalEchanges:
          type === "echange" ? prev.totalEchanges - 1 : prev.totalEchanges,
      }));
    } catch (err) {
      console.error("Erreur lors de la suppression du favori:", err);
      alert("Impossible de supprimer ce favori pour le moment");
    }
  };

  return (
    <>
      {/* Hero Section - MÊME DESIGN QUE DONS & ÉCHANGES */}
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
                    onClick={fetchAllFavoris}
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

      {/* Statistiques - MÊME DESIGN QUE DONS & ÉCHANGES */}
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

      {/* Contenu principal - MÊME STRUCTURE QUE DONS & ÉCHANGES */}
      <section className="py-4">
        <div className="container">
          <div className="row g-3">
            {/* Sidebar des filtres */}
            <div className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="sticky-top" style={{ top: "90px" }}>
                {/* Filtres par type - SIMILAIRE À DONS & ÉCHANGES */}
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

                {/* Info supplémentaire - SIMILAIRE À DONS & ÉCHANGES */}
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
              {/* Barre de filtres et options - MÊME DESIGN QUE DONS & ÉCHANGES */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h2 className="h5 fw-bold mb-0">
                      {activeFilter === "all" && "Tous mes favoris"}
                      {activeFilter === "produits" && "Mes produits favoris"}
                      {activeFilter === "dons" && "Mes dons favoris"}
                      {activeFilter === "echanges" && "Mes échanges favoris"}
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

                {/* Barre de tri et vue - SIMILAIRE À DONS & ÉCHANGES */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-2 mb-3">
                  <div className="d-flex gap-1">
                    <button
                      className={`btn btn-sm ${viewMode === "grid" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => handleViewModeChange("grid")}
                      type="button"
                    >
                      <i className="fas fa-th"></i>
                    </button>
                    <button
                      className={`btn btn-sm ${viewMode === "list" ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => handleViewModeChange("list")}
                      type="button"
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">Trier par :</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <option value="recent">Plus récents</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                    </select>
                  </div>
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
                              ? `${colors.oskar.greenHover}20`
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
                    onClick={fetchAllFavoris}
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
                <div
                  className={
                    viewMode === "grid" ? "row g-4" : "list-view-container"
                  }
                >
                  {(sortOption === "recent"
                    ? filteredFavoris
                    : [...filteredFavoris].sort((a, b) => {
                        switch (sortOption) {
                          case "price-asc":
                            const priceA = a.prix
                              ? parseFloat(a.prix.toString())
                              : 0;
                            const priceB = b.prix
                              ? parseFloat(b.prix.toString())
                              : 0;
                            return priceA - priceB;
                          case "price-desc":
                            const priceC = a.prix
                              ? parseFloat(a.prix.toString())
                              : 0;
                            const priceD = b.prix
                              ? parseFloat(b.prix.toString())
                              : 0;
                            return priceD - priceC;
                          default:
                            return 0;
                        }
                      })
                  ).map((item) => (
                    <div
                      key={`${item.type}-${item.uuid}`}
                      className={
                        viewMode === "grid" ? "col-xl-4 col-lg-6 col-md-6" : ""
                      }
                    >
                      {viewMode === "grid" ? (
                        /* Carte en mode grille - STYLE SIMILAIRE À DONS & ÉCHANGES */
                        <div className="card favori-card h-100 border-0 shadow-sm position-relative">
                          <button
                            className="btn btn-link position-absolute top-0 end-0 p-3 z-2"
                            onClick={() =>
                              handleRemoveFavori(item.uuid, item.type)
                            }
                            style={{
                              color: "#ff6b6b",
                              zIndex: 2,
                            }}
                            aria-label={`Retirer ${item.titre} des favoris`}
                          >
                            <i className="fa-solid fa-heart"></i>
                          </button>

                          <div className="position-relative">
                            {/* Image */}
                            <div className="favori-image-container">
                              <Link href={getDetailLink(item)}>
                                <img
                                  src={item.image || PLACEHOLDER_IMAGE}
                                  alt={item.titre || "Favori"}
                                  className="card-img-top favori-image"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = PLACEHOLDER_IMAGE;
                                  }}
                                />
                              </Link>

                              {/* Badge type */}
                              <span
                                className="favori-type-badge"
                                style={{
                                  backgroundColor: getTypeColor(item.type),
                                }}
                              >
                                {getTypeLabel(item.type)}
                              </span>
                            </div>

                            <div className="card-body p-3">
                              {/* Titre */}
                              <h5 className="card-title favori-title mb-2">
                                <Link
                                  href={getDetailLink(item)}
                                  className="text-decoration-none text-dark"
                                >
                                  {item.titre}
                                </Link>
                              </h5>

                              {/* Description */}
                              {item.description && (
                                <p className="card-text text-muted small mb-3">
                                  {item.description.length > 100
                                    ? `${item.description.substring(0, 100)}...`
                                    : item.description}
                                </p>
                              )}

                              <div className="d-flex justify-content-between align-items-center">
                                {/* Prix */}
                                <div
                                  className="favori-price fw-bold"
                                  style={{
                                    color: colors.oskar.green,
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  {formatPrice(item.prix)}
                                </div>

                                {/* Date */}
                                {item.date && (
                                  <div className="text-muted small">
                                    <i className="fa-solid fa-clock me-1"></i>
                                    {formatDate(item.date)}
                                  </div>
                                )}
                              </div>

                              {/* Bouton d'action */}
                              <div className="mt-3">
                                <Link
                                  href={getDetailLink(item)}
                                  className="btn btn-outline-success btn-sm w-100"
                                >
                                  <i className="fa-solid fa-eye me-2"></i>
                                  Voir les détails
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Carte en mode liste - STYLE SIMILAIRE À DONS & ÉCHANGES */
                        <div className="card mb-3 border-0 shadow-sm">
                          <div className="row g-0">
                            <div className="col-md-3 position-relative">
                              <img
                                src={item.image || PLACEHOLDER_IMAGE}
                                alt={item.titre}
                                className="img-fluid rounded-start h-100 w-100 object-fit-cover"
                                style={{ height: "200px" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                              <span
                                className="position-absolute top-0 start-0 m-2 badge"
                                style={{
                                  backgroundColor: getTypeColor(item.type),
                                  color: "white",
                                }}
                              >
                                {getTypeLabel(item.type)}
                              </span>
                              <button
                                className="position-absolute top-0 end-0 m-2 btn btn-link p-1"
                                onClick={() =>
                                  handleRemoveFavori(item.uuid, item.type)
                                }
                                style={{ color: "#ff6b6b" }}
                              >
                                <i className="fa-solid fa-heart"></i>
                              </button>
                            </div>
                            <div className="col-md-9">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <h5 className="card-title mb-1">
                                      <Link
                                        href={getDetailLink(item)}
                                        className="text-decoration-none text-dark"
                                      >
                                        {item.titre}
                                      </Link>
                                    </h5>
                                    {item.description && (
                                      <p className="card-text text-muted small mb-2">
                                        {item.description.length > 200
                                          ? `${item.description.substring(0, 200)}...`
                                          : item.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="ms-3 text-end">
                                    <div
                                      className="fw-bold fs-5"
                                      style={{ color: colors.oskar.green }}
                                    >
                                      {formatPrice(item.prix)}
                                    </div>
                                    {item.date && (
                                      <div className="text-muted small">
                                        <i className="fa-solid fa-clock me-1"></i>
                                        {formatDate(item.date)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                  <div>
                                    <Link
                                      href={getDetailLink(item)}
                                      className="btn btn-success btn-sm"
                                    >
                                      <i className="fa-solid fa-eye me-2"></i>
                                      Voir les détails
                                    </Link>
                                  </div>
                                  <div className="text-muted small">
                                    Réf: {item.uuid.substring(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Section d'information - SIMILAIRE À DONS & ÉCHANGES */}
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

              {/* CTA compact - SIMILAIRE À DONS & ÉCHANGES */}
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

      {/* FAQ - SIMILAIRE À DONS & ÉCHANGES */}
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

        .favori-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }

        .favori-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .favori-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: ${colors.oskar.lightGrey};
        }

        .favori-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .favori-card:hover .favori-image {
          transform: scale(1.05);
        }

        .favori-type-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .favori-title {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .favori-price {
          font-size: 1.1rem;
        }

        .object-fit-cover {
          object-fit: cover;
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
          .favori-image-container {
            height: 180px;
          }
        }
      `}</style>
    </>
  );
}