// app/(front-office)/education-culture/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import colors from "@/app/shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import FiltersSidebar from "../home/components/FiltersSidebar";
import FilterStatsBar from "../home/components/FilterStatsBar";
import ListingsGrid from "../home/components/ListingsGrid";

interface CategoryData {
  categorie: {
    uuid: string;
    libelle: string;
    slug: string;
    description: string;
    image: string;
  };
  dons: any[];
  echanges: any[];
  produits: any[];
  stats: {
    totalDons: number;
    totalEchanges: number;
    totalProduits: number;
    totalItems: number;
  };
}

interface CategoryItem {
  uuid: string;
  type: "produit" | "echange" | "don";
  titre: string;
  description?: string;
  prix?: number | string | null;
  image?: string;
  date?: string;
  statut?: string;
  localisation?: string;
  quantite?: number;
  objetPropose?: string;
  objetDemande?: string;
  vendeur?: {
    nom: string;
    prenoms: string;
  };
  utilisateur?: {
    nom: string;
    prenoms: string;
  };
}

export default function EducationCulturePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("recent");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalDons: 0,
    totalEchanges: 0,
    totalProduits: 0,
    totalItems: 0,
  });

  // Fonction pour construire l'URL complète de l'API
  const getFullApiUrl = (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
    return `${baseUrl}${endpoint}`;
  };

  // Charger les données de la catégorie
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          getFullApiUrl(
            API_ENDPOINTS.CATEGORIES.BY_LIBELLE_WITH_ITEMS(
              "Éducation & Culture",
            ),
          ),
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setCategoryData(data);

        // Calculer les statistiques totales
        const stats = {
          totalDons: 0,
          totalEchanges: 0,
          totalProduits: 0,
          totalItems: 0,
        };

        // Transformer les données pour les adapter à ListingsGrid
        const items: CategoryItem[] = [];

        data.forEach((category: CategoryData) => {
          // Ajouter les statistiques
          stats.totalDons += category.stats.totalDons;
          stats.totalEchanges += category.stats.totalEchanges;
          stats.totalProduits += category.stats.totalProduits;
          stats.totalItems += category.stats.totalItems;

          // Ajouter les échanges (selon votre API, il n'y a que des échanges)
          category.echanges.forEach((echange: any) => {
            items.push({
              uuid: echange.uuid,
              type: "echange" as const,
              titre: echange.nomElementEchange,
              description: echange.message,
              prix: echange.prix,
              image: echange.image,
              date: echange.dateProposition,
              statut: echange.statut,
              localisation: "Non spécifié", // À adapter selon vos données
              quantite: echange.quantite,
              objetPropose: echange.objetPropose,
              objetDemande: echange.objetDemande,
              vendeur: echange.vendeur
                ? {
                    nom: echange.vendeur.nom,
                    prenoms: echange.vendeur.prenoms,
                  }
                : undefined,
              utilisateur: echange.utilisateur
                ? {
                    nom: echange.utilisateur.nom,
                    prenoms: echange.utilisateur.prenoms,
                  }
                : undefined,
            });
          });
        });

        setTotalStats(stats);
        setCategoryItems(items);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les données de la catégorie. Veuillez réessayer.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log("Filtres appliqués:", newFilters);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  // Fonction pour obtenir le nom complet du vendeur/utilisateur
  const getSellerName = (item: CategoryItem) => {
    if (item.vendeur) {
      return `${item.vendeur.nom} ${item.vendeur.prenoms}`;
    }
    if (item.utilisateur) {
      return `${item.utilisateur.nom} ${item.utilisateur.prenoms}`;
    }
    return "Anonyme";
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">
            Chargement des articles éducation et culture...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger max-w-md text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h5 className="alert-heading">Erreur de chargement</h5>
          <p>{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="py-4 py-md-5"
        style={{
          background: `linear-gradient(135deg, ${colors.oskar.green || "#2196F3"} 0%, ${colors.oskar.green || "#1976D2"} 100%)`,
          color: "white",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="mb-3">
                <h1 className="display-5 fw-bold mb-2">Éducation & Culture</h1>
                <p className="lead mb-3 opacity-90">
                  Livres, cours, instruments de musique et matériel éducatif.
                  Partagez le savoir et développez vos compétences avec la
                  communauté OSKAR.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    href="/publication-annonce?categorie=education-culture"
                    className="btn btn-light btn-sm px-3 py-2 fw-semibold"
                    style={{ color: colors.oskar.blue || "#2196F3" }}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Publier un article
                  </Link>
                  <Link
                    href="/publication-annonce?type=echange&categorie=education-culture"
                    className="btn btn-outline-light btn-sm px-3 py-2 fw-semibold"
                  >
                    <i className="fas fa-exchange-alt me-1"></i>
                    Proposer un échange
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
                <i className="fas fa-graduation-cap fa-4x"></i>
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
                  style={{ color: colors.oskar.blue || "#2196F3" }}
                >
                  {totalStats.totalItems}
                </div>
                <div className="text-muted small">Total</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.green }}
                >
                  {totalStats.totalDons}
                </div>
                <div className="text-muted small">Dons</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div className="fs-4 fw-bold" style={{ color: "#2196F3" }}>
                  {totalStats.totalEchanges}
                </div>
                <div className="text-muted small">Échanges</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div
                  className="fs-4 fw-bold"
                  style={{ color: colors.oskar.orange || "#FF9800" }}
                >
                  {totalStats.totalProduits}
                </div>
                <div className="text-muted small">Ventes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sous-catégories populaires */}
      <section className="py-3 bg-light">
        <div className="container">
          <h6 className="fw-semibold mb-3">Domaines populaires</h6>
          <div className="d-flex flex-wrap gap-2">
            {[
              { name: "Livres & Manuels", icon: "fa-book", color: "#795548" },
              {
                name: "Instruments de Musique",
                icon: "fa-music",
                color: "#9C27B0",
              },
              {
                name: "Matériel Scolaire",
                icon: "fa-pencil-alt",
                color: "#2196F3",
              },
              {
                name: "Cours & Formations",
                icon: "fa-chalkboard-teacher",
                color: "#4CAF50",
              },
              { name: "Art & Artisanat", icon: "fa-palette", color: "#F44336" },
              { name: "Jeux Éducatifs", icon: "fa-gamepad", color: "#FF9800" },
              { name: "Langues", icon: "fa-language", color: "#009688" },
              { name: "Sciences", icon: "fa-flask", color: "#673AB7" },
            ].map((subCat, index) => (
              <Link
                key={index}
                href={`/recherche?categorie=education&sous-categorie=${subCat.name.toLowerCase()}`}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              >
                <i
                  className={`fas ${subCat.icon}`}
                  style={{ color: subCat.color }}
                ></i>
                <span>{subCat.name}</span>
              </Link>
            ))}
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
                <FiltersSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />

                {/* Conseils pour les échanges éducatifs */}
                <div className="card border-0 shadow-sm mt-3">
                  <div className="card-body p-3">
                    <h6 className="card-title fw-semibold mb-2">
                      <i
                        className="fas fa-lightbulb me-1"
                        style={{
                          color: colors.oskar.orange || "#FF9800",
                          fontSize: "0.9rem",
                        }}
                      ></i>
                      Conseils d'échange
                    </h6>
                    <ul className="list-unstyled small mb-0">
                      <li className="mb-1">
                        <i
                          className="fas fa-check-circle me-1 text-success"
                          style={{ fontSize: "0.7rem" }}
                        ></i>
                        Vérifiez l'état des articles
                      </li>
                      <li className="mb-1">
                        <i
                          className="fas fa-check-circle me-1 text-success"
                          style={{ fontSize: "0.7rem" }}
                        ></i>
                        Demandez des photos supplémentaires
                      </li>
                      <li className="mb-1">
                        <i
                          className="fas fa-check-circle me-1 text-success"
                          style={{ fontSize: "0.7rem" }}
                        ></i>
                        Clarifiez les conditions d'échange
                      </li>
                      <li>
                        <i
                          className="fas fa-check-circle me-1 text-success"
                          style={{ fontSize: "0.7rem" }}
                        ></i>
                        Rendez-vous dans un lieu public
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Catégories éducatives */}
                <div className="card border-0 shadow-sm mt-3">
                  <div className="card-body p-3">
                    <h6 className="card-title fw-semibold mb-2">
                      <i
                        className="fas fa-tags me-1"
                        style={{
                          color: colors.oskar.blue || "#2196F3",
                          fontSize: "0.9rem",
                        }}
                      ></i>
                      Niveaux éducatifs
                    </h6>
                    <div className="d-flex flex-wrap gap-1">
                      {[
                        "Primaire",
                        "Collège",
                        "Lycée",
                        "Université",
                        "Professionnel",
                      ].map((level) => (
                        <span
                          key={level}
                          className="badge bg-light text-dark small"
                        >
                          {level}
                        </span>
                      ))}
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
                    <h2 className="h5 fw-bold mb-0">
                      Articles d'éducation et culture disponibles
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

                <FilterStatsBar
                  totalItems={0}
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  sortOption={sortOption}
                  onSortChange={handleSortChange}
                />
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
                    <FiltersSidebar
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>
                </div>
              )}

              {/* Affichage des annonces */}
              {categoryItems.length > 0 ? (
                <div className="mb-4">
                  <div className="row g-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.uuid}
                        className="col-xl-4 col-lg-6 col-md-6"
                      >
                        <div className="card border-0 shadow-sm h-100">
                          <div className="position-relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.titre}
                                className="card-img-top"
                                style={{ height: "200px", objectFit: "cover" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://via.placeholder.com/300x200/ECEFF1/607D8B?text=${encodeURIComponent(item.titre)}`;
                                }}
                              />
                            ) : (
                              <div
                                className="card-img-top d-flex align-items-center justify-content-center"
                                style={{
                                  height: "200px",
                                  backgroundColor: "#E3F2FD",
                                  color: colors.oskar.blue || "#2196F3",
                                }}
                              >
                                <i className="fas fa-graduation-cap fa-3x"></i>
                              </div>
                            )}
                            <span
                              className="position-absolute top-0 start-0 m-2 badge"
                              style={{
                                backgroundColor: "#2196F3",
                                color: "white",
                                fontSize: "0.7rem",
                              }}
                            >
                              Échange
                            </span>
                            {item.quantite && item.quantite > 1 && (
                              <span
                                className="position-absolute top-0 end-0 m-2 badge"
                                style={{
                                  backgroundColor: "#4CAF50",
                                  color: "white",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {item.quantite} disponibles
                              </span>
                            )}
                          </div>
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title fw-bold mb-2">
                              {item.titre}
                            </h6>

                            {/* Détails de l'échange */}
                            <div className="mb-2">
                              <p className="small mb-1">
                                <strong>Je propose :</strong>{" "}
                                {item.objetPropose || "Non spécifié"}
                              </p>
                              <p className="small mb-1">
                                <strong>Je recherche :</strong>{" "}
                                {item.objetDemande || "Non spécifié"}
                              </p>
                            </div>

                            {item.description && (
                              <p className="card-text small text-muted mb-2 flex-grow-1">
                                {item.description.length > 100
                                  ? `${item.description.substring(0, 100)}...`
                                  : item.description}
                              </p>
                            )}
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-success">
                                  {item.prix
                                    ? `${parseFloat(item.prix.toString()).toLocaleString("fr-FR")} FCFA`
                                    : "Prix à discuter"}
                                </span>
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {item.date
                                    ? new Date(item.date).toLocaleDateString(
                                        "fr-FR",
                                      )
                                    : "Date inconnue"}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="fas fa-user me-1"></i>
                                  {getSellerName(item)}
                                </small>
                                {item.statut && (
                                  <span
                                    className={`badge ${
                                      item.statut === "en_attente"
                                        ? "bg-warning"
                                        : item.statut === "disponible"
                                          ? "bg-success"
                                          : item.statut === "publie"
                                            ? "bg-info"
                                            : "bg-secondary"
                                    }`}
                                  >
                                    {item.statut === "en_attente"
                                      ? "En attente"
                                      : item.statut === "disponible"
                                        ? "Disponible"
                                        : item.statut === "publie"
                                          ? "Publié"
                                          : item.statut}
                                  </span>
                                )}
                              </div>
                              <Link
                                href={`/echanges/${item.uuid}`}
                                className="btn btn-outline-primary btn-sm w-100 mt-2"
                              >
                                <i className="fas fa-exchange-alt me-1"></i>
                                Voir l'échange
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="fas fa-graduation-cap fa-4x text-muted"></i>
                  </div>
                  <h5 className="fw-bold mb-2">Aucun article trouvé</h5>
                  <p className="text-muted mb-4">
                    Aucun article d'éducation ou culture n'est disponible dans
                    cette catégorie pour le moment.
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link
                      href="/publication-annonce?categorie=education-culture"
                      className="btn btn-primary"
                    >
                      <i className="fas fa-plus me-2"></i>
                      Publier un article
                    </Link>
                    <Link
                      href="/publication-annonce?type=echange&categorie=education-culture"
                      className="btn btn-outline-primary"
                    >
                      <i className="fas fa-exchange-alt me-2"></i>
                      Proposer un échange
                    </Link>
                  </div>
                </div>
              )}

              {/* Section avantages */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-3">
                  Pourquoi échanger des articles éducatifs ?
                </h6>
                <div className="row g-3">
                  {[
                    {
                      title: "Accessibilité",
                      description: "Rendre l'éducation accessible à tous",
                      icon: "fa-universal-access",
                      color: "#4CAF50",
                    },
                    {
                      title: "Économie circulaire",
                      description: "Réutiliser et partager les ressources",
                      icon: "fa-recycle",
                      color: "#4CAF50",
                    },
                    {
                      title: "Communauté",
                      description: "Créer des liens autour du savoir",
                      icon: "fa-users",
                      color: "#2196F3",
                    },
                    {
                      title: "Développement",
                      description: "Favoriser l'apprentissage continu",
                      icon: "fa-chart-line",
                      color: "#FF9800",
                    },
                  ].map((benefit, index) => (
                    <div key={index} className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle p-2 me-2 flex-shrink-0"
                              style={{ backgroundColor: `${benefit.color}15` }}
                            >
                              <i
                                className={`fas ${benefit.icon}`}
                                style={{ color: benefit.color }}
                              ></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">{benefit.title}</h6>
                              <p className="small text-muted mb-0">
                                {benefit.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide d'échange éducatif */}
              <div
                className="mt-4 rounded-2 p-3"
                style={{
                  background: `linear-gradient(135deg, ${colors.oskar.blue || "#E3F2FD"} 0%, ${colors.oskar.blueHover || "#E3F2FD"}20 100%)`,
                  border: `1px solid ${colors.oskar.blue || "#2196F3"}20`,
                }}
              >
                <h6 className="fw-bold mb-2">
                  <i className="fas fa-handshake me-2"></i>
                  Guide pour des échanges réussis
                </h6>
                <p className="small text-muted mb-3">
                  Quelques conseils pour des échanges éducatifs fructueux
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    "Vérifiez l'état",
                    "Décrivez précisément",
                    "Fixez un rendez-vous",
                    "Évaluez équitablement",
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-1"
                    >
                      <i className="fas fa-check-circle text-success small"></i>
                      <span className="small">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="mt-4 rounded-2 p-4 text-center"
                style={{ backgroundColor: "#F5F5F5" }}
              >
                <h6 className="fw-bold mb-2">
                  Vous avez des ressources éducatives à partager ?
                </h6>
                <p className="small text-muted mb-3">
                  Contribuez à l'éducation et à la culture de votre communauté
                </p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <Link
                    href="/publication-annonce?type=don&categorie=education-culture"
                    className="btn btn-primary btn-sm px-3"
                  >
                    <i className="fas fa-gift me-1"></i>
                    Donner des ressources
                  </Link>
                  <Link
                    href="/publication-annonce?type=echange&categorie=education-culture"
                    className="btn btn-outline-primary btn-sm px-3"
                  >
                    <i className="fas fa-exchange-alt me-1"></i>
                    Échanger des articles
                  </Link>
                </div>
              </div>
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
              Tout sur les échanges éducatifs et culturels
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
                        color: colors.oskar.blue || "#2196F3",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Comment échanger des livres scolaires ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Vérifiez l'édition et l'état du livre, prenez des photos
                    claires et précisez le niveau scolaire concerné.
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
                        color: colors.oskar.blue || "#2196F3",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Puis-je échanger des cours en ligne ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Oui, vous pouvez proposer des formations en ligne en échange
                    d'autres services ou ressources éducatives.
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
                        color: colors.oskar.blue || "#2196F3",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Comment évaluer un instrument de musique ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Demandez l'avis d'un connaisseur, testez l'instrument si
                    possible et vérifiez l'état général et l'âge.
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
                        color: colors.oskar.blue || "#2196F3",
                        fontSize: "0.9rem",
                      }}
                    ></i>
                    Les échanges sont-ils uniquement locaux ?
                  </h6>
                  <p className="small text-muted mb-0">
                    Non, vous pouvez échanger à distance pour les ressources
                    numériques ou organiser un envoi pour les articles
                    physiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types de ressources */}
      <section className="py-4">
        <div className="container">
          <h6 className="fw-bold mb-3 text-center">
            Types de ressources acceptées
          </h6>
          <div className="row g-3">
            {[
              { name: "Livres & Manuels", icon: "fa-book", count: "100+" },
              {
                name: "Instruments de Musique",
                icon: "fa-guitar",
                count: "50+",
              },
              { name: "Matériel Artistique", icon: "fa-palette", count: "75+" },
              {
                name: "Équipement Scientifique",
                icon: "fa-flask",
                count: "30+",
              },
              { name: "Cours & Tutoriels", icon: "fa-video", count: "200+" },
              { name: "Jeux Éducatifs", icon: "fa-puzzle-piece", count: "60+" },
            ].map((resource, index) => (
              <div key={index} className="col-md-4 col-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-3">
                    <div className="mb-2">
                      <i
                        className={`fas ${resource.icon} fa-2x`}
                        style={{ color: colors.oskar.green || "#2196F3" }}
                      ></i>
                    </div>
                    <h6 className="fw-bold mb-1">{resource.name}</h6>
                    <p className="text-muted small mb-0">
                      {resource.count} disponibles
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .sticky-top {
          position: sticky;
          top: 90px;
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
