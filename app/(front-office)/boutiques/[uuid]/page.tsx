// app/(front-office)/boutiques/[uuid]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faCalendar,
  faBox,
  faStar,
  faShoppingBag,
  faInfoCircle,
  faTags,
  faCheckCircle,
  faClock,
  faBan,
  faLock,
  faRefresh,
  faExclamationTriangle,
  faHeart,
  faShare,
  faShoppingCart,
  faEye,
  faChartLine,
  faMoneyBillWave,
  faThumbsUp,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faCreditCard,
  faTruck,
  faShieldAlt,
  faSync,
  faAward,
  faRocket,
  faLeaf,
  faRecycle,
  faGem as faDiamond,
} from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// Types basés sur votre réponse API
interface TypeBoutique {
  uuid: string;
  code: string;
  libelle: string;
  description: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  statut: string;
}

interface Categorie {
  uuid: string;
  libelle: string;
  type: string;
  image: string;
}

interface Produit {
  id: number;
  uuid: string;
  libelle: string;
  slug: string;
  image: string;
  disponible: boolean;
  statut: string;
  prix: string | null;
  description: string | null;
  quantite: number;
  note_moyenne: number;
  nombre_avis: number;
  estPublie: boolean;
  estBloque: boolean;
  categorie: Categorie | null;
}

interface Boutique {
  uuid: string;
  nom: string;
  slug: string;
  description: string | null;
  logo: string;
  banniere: string;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  created_at: string;
  updated_at: string;
  type_boutique: TypeBoutique;
  produits: Produit[];
  est_bloque: boolean;
  est_ferme: boolean;
  politique_retour?: string;
  conditions_utilisation?: string;
}

export default function BoutiquePremium() {
  const router = useRouter();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("produits");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // ID de la boutique
  const boutiqueUuid = "bb2789fe-d015-4947-bfe1-eb0239e1a8d1";

  const fetchBoutique = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:3005/boutiques/${boutiqueUuid}`,
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBoutique(data);
    } catch (err) {
      console.error("Erreur lors du chargement de la boutique:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des données",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoutique();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const scrollPosition = window.scrollY + window.innerHeight;
      const elementPosition =
        document.getElementById("stats-cards")?.offsetTop || 0;
      if (scrollPosition > elementPosition + 100) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBoutique();
  };

  const toggleFavorite = (produitUuid: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(produitUuid)) {
        newSet.delete(produitUuid);
      } else {
        newSet.add(produitUuid);
      }
      return newSet;
    });
  };

  const shareBoutique = () => {
    if (navigator.share) {
      navigator.share({
        title: boutique?.nom,
        text: `Découvrez la boutique ${boutique?.nom}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papier !");
    }
  };

  // ✅ Fonction pour rediriger vers la page détail produit
  const handleViewProduct = (produitUuid: string) => {
    router.push(`/produits/${produitUuid}`);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price: string | null) => {
    if (!price) return "Gratuit";

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return "Prix sur demande";

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // ✅ Fonction pour obtenir la catégorie de manière sécurisée
  const getCategorieLibelle = (produit: Produit): string => {
    if (produit.categorie && produit.categorie.libelle) {
      return produit.categorie.libelle;
    }
    return "Non catégorisé";
  };

  // Calcul des statistiques
  const stats = boutique
    ? {
        totalProduits: boutique.produits.length,
        produitsPublies: boutique.produits.filter((p) => p.estPublie).length,
        produitsBloques: boutique.produits.filter((p) => p.estBloque).length,
        produitsDisponibles: boutique.produits.filter((p) => p.disponible)
          .length,
        valeurStock: boutique.produits.reduce((sum, p) => {
          const prix = parseFloat(p.prix || "0") || 0;
          return sum + prix * p.quantite;
        }, 0),
        noteMoyenne:
          boutique.produits.length > 0
            ? boutique.produits.reduce((sum, p) => sum + p.note_moyenne, 0) /
              boutique.produits.length
            : 0,
        totalAvis: boutique.produits.reduce((sum, p) => sum + p.nombre_avis, 0),
        totalFavoris: boutique.produits.reduce(
          (sum, p) => sum + (favorites.has(p.uuid) ? 1 : 0),
          0,
        ),
      }
    : null;

  // Générer des étoiles
  const renderStars = (rating: number) => {
    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={i < Math.floor(rating) ? "text-warning" : "text-muted"}
            size="sm"
          />
        ))}
      </div>
    );
  };

  // Badge de statut
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return (
          <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 animate-pulse">
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Actif
          </span>
        );
      case "en_review":
        return (
          <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
            <FontAwesomeIcon icon={faClock} className="me-2" />
            En revue
          </span>
        );
      case "bloque":
        return (
          <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
            <FontAwesomeIcon icon={faBan} className="me-2" />
            Bloqué
          </span>
        );
      case "ferme":
        return (
          <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
            <FontAwesomeIcon icon={faLock} className="me-2" />
            Fermé
          </span>
        );
      default:
        return (
          <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-25">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            {statut}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-eco">
        <LoadingSpinner
          size="lg"
          text="Chargement de la boutique..."
          fullPage
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg rounded-3 overflow-hidden animate-slide-up">
              <div className="card-header bg-danger text-white py-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="fs-1 me-3"
                  />
                  <div>
                    <h4 className="mb-0 fw-bold">Erreur de chargement</h4>
                  </div>
                </div>
              </div>
              <div className="card-body p-5 text-center">
                <p className="text-muted mb-4">{error}</p>
                <button
                  className="btn btn-danger btn-lg px-5 hover-scale"
                  onClick={handleRefresh}
                >
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center py-5 animate-fade-in">
          <FontAwesomeIcon icon={faStore} className="fs-1 mb-3" />
          <h3>Boutique non trouvée</h3>
          <p className="mb-0">Cette boutique n'existe pas ou a été supprimée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div
        className="position-relative overflow-hidden eco-hero animate-fade-in"
        style={{ height: "500px" }}
      >
        {/* Animated background elements */}
        <div className="floating-leaves">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="leaf"
              style={{
                animationDelay: `${i * 2}s`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-cover bg-center"
          style={{
            backgroundImage: `url(${boutique.banniere})`,
            filter: "brightness(0.6)",
          }}
        />

        <div className="position-absolute top-0 start-0 w-100 h-100 eco-gradient" />

        <div className="container position-relative h-100 d-flex align-items-center">
          <div className="row w-100 animate-slide-up">
            <div className="col-lg-8">
              <div className="d-flex align-items-center mb-4">
                <div className="me-4">
                  <div className="logo-container rounded-circle border-4 border-white shadow-lg eco-pulse">
                    <img
                      src={boutique.logo}
                      alt={boutique.nom}
                      className="img-fluid"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(boutique.nom)}&background=10b981&color=fff&size=120&bold=true`;
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h1 className="text-white display-4 fw-bold mb-2 text-shadow">
                    {boutique.nom}
                  </h1>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    {getStatusBadge(boutique.statut)}
                    <span className="text-white-75">
                      <FontAwesomeIcon icon={faCalendar} className="me-1" />
                      Membre depuis{" "}
                      {new Date(boutique.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-white lead mb-4 opacity-75 animate-fade-in-delay">
                {boutique.description ||
                  "Boutique éco-responsable avec une sélection exceptionnelle de produits."}
              </p>

              <div className="d-flex gap-3">
                <button className="btn btn-light btn-lg px-4 eco-btn hover-scale">
                  <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                  Visiter la boutique
                </button>
                <button className="btn btn-outline-light btn-lg px-4 hover-scale">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Suivre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        id="stats-cards"
        className={`container mt-n5 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        <div className="row g-4">
          {[
            {
              icon: faBox,
              value: stats?.totalProduits || 0,
              label: "Produits",
              badge: `${stats?.produitsPublies || 0} publiés`,
              color: "success",
              delay: "0s",
            },
            {
              icon: faMoneyBillWave,
              value: stats?.valeurStock
                ? new Intl.NumberFormat("fr-FR", {
                    minimumFractionDigits: 0,
                  }).format(stats.valeurStock)
                : "0",
              label: "Valeur stock",
              suffix: " F CFA",
              color: "success",
              delay: "0.1s",
            },
            {
              icon: faStar,
              value: stats?.noteMoyenne?.toFixed(1) || "0.0",
              label: "Note moyenne",
              rating: stats?.noteMoyenne || 0,
              color: "warning",
              delay: "0.2s",
            },
            {
              icon: faChartLine,
              value: stats?.produitsDisponibles || 0,
              label: "Disponibles",
              badge: `${stats?.totalAvis || 0} avis`,
              color: "info",
              delay: "0.3s",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="col-md-3"
              style={{ animationDelay: stat.delay }}
            >
              <div className="card border-0 shadow-lg rounded-3 h-100 eco-card hover-lift">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div
                      className={`bg-${stat.color} bg-opacity-10 rounded-circle p-3 me-3 eco-icon`}
                    >
                      <FontAwesomeIcon
                        icon={stat.icon}
                        className={`text-${stat.color} fs-4`}
                      />
                    </div>
                    <div>
                      <h3 className="mb-0 fw-bold">
                        {stat.value}
                        {stat.suffix && (
                          <small className="fs-6 text-muted">
                            {stat.suffix}
                          </small>
                        )}
                      </h3>
                      <p className="text-muted mb-0">{stat.label}</p>
                    </div>
                  </div>
                  {stat.badge && (
                    <div className="mt-3 animate-fade-in">
                      <span
                        className={`badge bg-${stat.color} bg-opacity-10 text-${stat.color}`}
                      >
                        {stat.badge}
                      </span>
                    </div>
                  )}
                  {stat.rating !== undefined && (
                    <div className="mt-2">{renderStars(stat.rating)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-lg rounded-3 mb-4 eco-card hover-lift">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-success me-2"
                  />
                  Informations
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-3">
                    <span className="text-muted">Type de boutique:</span>
                    <span className="fw-semibold text-success">
                      {boutique.type_boutique.libelle}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-3">
                    <span className="text-muted">Code:</span>
                    <code className="text-success">
                      {boutique.type_boutique.code}
                    </code>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-3">
                    <span className="text-muted">Slug:</span>
                    <span className="fw-semibold text-success">
                      {boutique.slug}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-3">
                    <span className="text-muted">Créée le:</span>
                    <span className="text-success">
                      {formatDate(boutique.created_at)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Type Boutique Card */}
            <div className="card border-0 shadow-lg rounded-3 eco-card hover-lift">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faTags}
                    className="text-success me-2"
                  />
                  Type de boutique
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <img
                    src={boutique.type_boutique.image}
                    alt={boutique.type_boutique.libelle}
                    className="rounded eco-img hover-rotate-slow"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(boutique.type_boutique.libelle)}&background=10b981&color=fff&size=60`;
                    }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1">
                      {boutique.type_boutique.libelle}
                    </h6>
                    <p className="small text-muted mb-2">
                      {boutique.type_boutique.code}
                    </p>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {boutique.type_boutique.peut_vendre_produits && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 hover-scale">
                      <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
                      Vente produits
                    </span>
                  )}
                  {boutique.type_boutique.peut_vendre_biens && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 hover-scale">
                      <FontAwesomeIcon icon={faDiamond} className="me-1" />
                      Vente biens
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="card border-0 shadow-lg rounded-3 mt-4 eco-card hover-lift">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <FontAwesomeIcon
                    icon={faAward}
                    className="text-warning me-2"
                  />
                  Avantages
                </h6>
                {[
                  {
                    icon: faShieldAlt,
                    title: "Achat sécurisé",
                    desc: "Paiement 100% sécurisé",
                    color: "success",
                  },
                  {
                    icon: faTruck,
                    title: "Livraison rapide",
                    desc: "Expédition sous 48h",
                    color: "success",
                  },
                  {
                    icon: faSync,
                    title: "Retour gratuit",
                    desc: "30 jours pour changer d'avis",
                    color: "success",
                  },
                  {
                    icon: faRecycle,
                    title: "Éco-responsable",
                    desc: "Emballages recyclables",
                    color: "success",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center mb-3 animate-fade-in-slide"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div
                      className={`bg-${feature.color} bg-opacity-10 rounded-circle p-2 me-3 eco-icon hover-scale`}
                    >
                      <FontAwesomeIcon
                        icon={feature.icon}
                        className={`text-${feature.color}`}
                      />
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold">{feature.title}</p>
                      <small className="text-muted">{feature.desc}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-8">
            {/* Tabs Navigation */}
            <div className="card border-0 shadow-lg rounded-3 mb-4 eco-card hover-lift">
              <div className="card-header bg-white border-0">
                <ul className="nav nav-tabs nav-underline" role="tablist">
                  {[
                    {
                      id: "produits",
                      icon: faBox,
                      label: `Produits (${boutique.produits.length})`,
                    },
                    { id: "about", icon: faInfoCircle, label: "À propos" },
                    {
                      id: "reviews",
                      icon: faStar,
                      label: `Avis (${stats?.totalAvis})`,
                    },
                  ].map((tab) => (
                    <li key={tab.id} className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === tab.id ? "active" : ""} hover-scale`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <FontAwesomeIcon icon={tab.icon} className="me-2" />
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tab Content */}
              <div className="card-body p-4">
                <div
                  className={`tab-content ${activeTab === "produits" ? "animate-fade-in" : "d-none"}`}
                >
                  {/* Produits Tab - AVEC REDIRECTION */}
                  {activeTab === "produits" && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0 fw-bold">Nos Produits</h4>
                        <div className="d-flex gap-2">
                          <select className="form-select form-select-sm w-auto border-success">
                            <option>Trier par : Pertinence</option>
                            <option>Prix croissant</option>
                            <option>Prix décroissant</option>
                            <option>Meilleures notes</option>
                          </select>
                        </div>
                      </div>

                      {boutique.produits.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 animate-spin-slow">
                            <FontAwesomeIcon
                              icon={faBox}
                              className="text-muted fs-1"
                            />
                          </div>
                          <h4 className="fw-bold mb-3">
                            Aucun produit disponible
                          </h4>
                          <p className="text-muted mb-4">
                            Cette boutique n'a pas encore ajouté de produits.
                          </p>
                        </div>
                      ) : (
                        <div className="row g-4">
                          {boutique.produits.map((produit, index) => (
                            <div
                              key={produit.uuid}
                              className="col-md-6 col-lg-6 animate-slide-up"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className="card border-0 shadow-sm h-100 product-card hover-lift">
                                <div className="position-relative">
                                  <div
                                    className="product-image hover-zoom"
                                    style={{
                                      height: "220px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <img
                                      src={produit.image}
                                      alt={produit.libelle}
                                      className="img-fluid w-100 h-100 object-fit-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=10b981&color=fff&size=400`;
                                      }}
                                    />
                                  </div>
                                  <div className="position-absolute top-0 end-0 m-3">
                                    <button
                                      className="btn btn-light btn-sm rounded-circle shadow hover-scale"
                                      onClick={() =>
                                        toggleFavorite(produit.uuid)
                                      }
                                    >
                                      <FontAwesomeIcon
                                        icon={faHeart}
                                        className={
                                          favorites.has(produit.uuid)
                                            ? "text-danger"
                                            : "text-muted"
                                        }
                                      />
                                    </button>
                                  </div>
                                  <div className="position-absolute top-0 start-0 m-3">
                                    {produit.estBloque ? (
                                      <span className="badge bg-danger animate-pulse">
                                        Bloqué
                                      </span>
                                    ) : produit.estPublie ? (
                                      <span className="badge bg-success">
                                        En stock
                                      </span>
                                    ) : (
                                      <span className="badge bg-secondary">
                                        Non publié
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="card-body">
                                  <div className="mb-3">
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                      {getCategorieLibelle(produit)}
                                    </span>
                                  </div>

                                  <h5 className="card-title fw-bold mb-2">
                                    {produit.libelle}
                                  </h5>

                                  {produit.description && (
                                    <p className="card-text text-muted small mb-3">
                                      {produit.description.length > 100
                                        ? `${produit.description.substring(0, 100)}...`
                                        : produit.description}
                                    </p>
                                  )}

                                  <div className="d-flex align-items-center mb-3">
                                    {renderStars(produit.note_moyenne)}
                                    <span className="text-muted small ms-2">
                                      ({produit.note_moyenne.toFixed(1)})
                                    </span>
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h4 className="text-success fw-bold mb-0">
                                        {formatPrice(produit.prix)}
                                      </h4>
                                      <small className="text-muted">
                                        {produit.quantite > 0 ? (
                                          <span className="text-success">
                                            <FontAwesomeIcon
                                              icon={faCheckCircle}
                                              className="me-1"
                                            />
                                            {produit.quantite} en stock
                                          </span>
                                        ) : (
                                          <span className="text-danger">
                                            <FontAwesomeIcon
                                              icon={faExclamationTriangle}
                                              className="me-1"
                                            />
                                            Rupture de stock
                                          </span>
                                        )}
                                      </small>
                                    </div>

                                    <div className="d-flex gap-2">
                                      {/* ✅ BOUTON VOIR - REDIRECTION VERS PAGE PRODUIT */}
                                      <button
                                        className="btn btn-outline-success btn-sm hover-scale"
                                        onClick={() =>
                                          handleViewProduct(produit.uuid)
                                        }
                                      >
                                        <FontAwesomeIcon icon={faEye} />
                                        <span className="ms-1">Voir</span>
                                      </button>
                                      <button
                                        className="btn btn-success btn-sm hover-scale"
                                        onClick={() =>
                                          alert(
                                            `Ajouter au panier: ${produit.libelle}`,
                                          )
                                        }
                                        disabled={
                                          !produit.disponible ||
                                          produit.quantite === 0
                                        }
                                      >
                                        <FontAwesomeIcon
                                          icon={faShoppingCart}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`tab-content ${activeTab === "about" ? "animate-fade-in" : "d-none"}`}
                >
                  {/* About Tab */}
                  {activeTab === "about" && (
                    <div>
                      <h4 className="fw-bold mb-4">
                        À propos de cette boutique
                      </h4>

                      <div className="row mb-4">
                        <div className="col-md-6">
                          <div className="card bg-light border-0 mb-3 eco-card hover-lift">
                            <div className="card-body">
                              <h6 className="fw-bold">
                                <FontAwesomeIcon
                                  icon={faStore}
                                  className="text-success me-2"
                                />
                                Description
                              </h6>
                              <p className="mb-0">
                                {boutique.description ||
                                  "Boutique éco-responsable offrant des produits de qualité."}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card bg-light border-0 mb-3 eco-card hover-lift">
                            <div className="card-body">
                              <h6 className="fw-bold">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-success me-2"
                                />
                                Historique
                              </h6>
                              <p className="mb-0">
                                Créée le {formatDate(boutique.created_at)}
                              </p>
                              <p className="mb-0">
                                Dernière mise à jour :{" "}
                                {formatDate(boutique.updated_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {boutique.politique_retour && (
                        <div className="card border-0 shadow-sm mb-4 eco-card hover-lift">
                          <div className="card-header bg-white">
                            <h6 className="fw-bold mb-0">
                              <FontAwesomeIcon
                                icon={faSync}
                                className="text-warning me-2"
                              />
                              Politique de retour
                            </h6>
                          </div>
                          <div className="card-body">
                            <p className="mb-0">{boutique.politique_retour}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`tab-content ${activeTab === "reviews" ? "animate-fade-in" : "d-none"}`}
                >
                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <div>
                      <h4 className="fw-bold mb-4">Avis des clients</h4>

                      <div className="row mb-4">
                        <div className="col-md-4">
                          <div className="card border-0 shadow-sm text-center p-4 eco-card hover-lift">
                            <h1 className="display-1 fw-bold text-warning animate-pulse">
                              {stats?.noteMoyenne?.toFixed(1) || "0.0"}
                            </h1>
                            <div className="mb-3">
                              {renderStars(stats?.noteMoyenne || 0)}
                            </div>
                            <p className="text-muted">
                              Basé sur {stats?.totalAvis || 0} avis
                            </p>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <div className="card border-0 shadow-sm p-4 eco-card hover-lift">
                            <h6 className="fw-bold mb-3">
                              Répartition des notes
                            </h6>
                            <p className="text-muted mb-0">
                              Les clients sont satisfaits de leurs achats dans
                              cette boutique.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Exemple d'avis */}
                      <div className="card border-0 shadow-sm mb-3 eco-card hover-lift">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="fw-bold mb-1">Client satisfait</h6>
                              <div className="d-flex align-items-center">
                                {renderStars(5)}
                                <span className="text-muted small ms-2">
                                  Il y a 2 jours
                                </span>
                              </div>
                            </div>
                            <div className="animate-wiggle">
                              <FontAwesomeIcon
                                icon={faThumbsUp}
                                className="text-success fs-4"
                              />
                            </div>
                          </div>
                          <p className="mb-0">
                            Produits de qualité, livraison rapide et service
                            client réactif. Je recommande cette boutique !
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="card border-0 shadow-lg rounded-3 eco-gradient text-white animate-fade-in-up">
              <div className="card-body p-5 text-center">
                <div className="animate-bounce">
                  <FontAwesomeIcon
                    icon={faRocket}
                    className="display-1 mb-4 opacity-75"
                  />
                </div>
                <h3 className="fw-bold mb-3">
                  Prêt à découvrir nos produits ?
                </h3>
                <p className="lead mb-4 opacity-75">
                  Des produits exceptionnels vous attendent dans cette boutique
                  éco-responsable
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-light btn-lg px-5 hover-scale">
                    <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                    Explorer la boutique
                  </button>
                  <button className="btn btn-outline-light btn-lg px-5 hover-scale">
                    <FontAwesomeIcon icon={faHeart} className="me-2" />
                    Suivre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-eco {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .eco-gradient {
          background: linear-gradient(
            to bottom,
            rgba(16, 185, 129, 0.2) 0%,
            rgba(5, 150, 105, 0.8) 100%
          );
        }

        .eco-hero {
          position: relative;
          overflow: hidden;
        }

        .floating-leaves {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .leaf {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.1);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          animation: float 15s linear infinite;
          opacity: 0.3;
        }

        .product-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(16, 185, 129, 0.1) !important;
        }

        .product-card:hover {
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .nav-underline .nav-link {
          color: #6c757d;
          border: none;
          padding: 0.75rem 1rem;
        }

        .nav-underline .nav-link.active {
          color: #10b981;
          border-bottom: 3px solid #10b981;
          font-weight: 600;
        }

        .object-fit-cover {
          object-fit: cover;
        }

        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .gradient-text {
          background: linear-gradient(45deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .eco-card {
          border: 1px solid rgba(16, 185, 129, 0.1) !important;
          transition: all 0.3s ease;
        }

        .eco-card:hover {
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .eco-btn {
          background: linear-gradient(45deg, #10b981, #34d399);
          border: none;
          color: white;
        }

        .eco-icon {
          transition: all 0.3s ease;
        }

        .eco-card:hover .eco-icon {
          transform: scale(1.1);
        }

        .eco-img {
          transition: all 0.3s ease;
        }

        .logo-container {
          width: 120px;
          height: 120px;
          overflow: hidden;
          position: relative;
        }

        .logo-container::after {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #10b981, #34d399, #10b981);
          border-radius: 50%;
          z-index: -1;
          animation: rotate 3s linear infinite;
        }

        /* Animations CSS */
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(500px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(5deg);
          }
          75% {
            transform: rotate(-5deg);
          }
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Classes d'animation */
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.6s ease-out;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }

        .animate-fade-in-slide {
          animation: fadeInSlide 0.5s ease-out both;
        }

        /* Classes de hover */
        .hover-scale {
          transition: transform 0.2s ease;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .hover-rotate {
          transition: transform 0.3s ease;
        }

        .hover-rotate:hover {
          transform: rotate(180deg);
        }

        .hover-rotate-slow {
          transition: transform 0.5s ease;
        }

        .hover-rotate-slow:hover {
          transform: rotate(5deg);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.1) !important;
        }

        .hover-zoom {
          transition: transform 0.5s ease;
        }

        .hover-zoom:hover {
          transform: scale(1.1);
        }

        .hover-success:hover {
          color: #10b981 !important;
          padding-left: 5px;
          transition: all 0.3s ease;
        }

        /* Couleurs vertes */
        .bg-success {
          background-color: #10b981 !important;
        }

        .text-success {
          color: #10b981 !important;
        }

        .border-success {
          border-color: #10b981 !important;
        }

        .btn-success {
          background-color: #10b981;
          border-color: #10b981;
        }

        .btn-success:hover {
          background-color: #059669;
          border-color: #059669;
        }

        .btn-outline-success {
          color: #10b981;
          border-color: #10b981;
        }

        .btn-outline-success:hover {
          background-color: #10b981;
          border-color: #10b981;
          color: white;
        }

        .badge.bg-success {
          background-color: #10b981 !important;
        }

        .bg-success.bg-opacity-10 {
          background-color: rgba(16, 185, 129, 0.1) !important;
        }

        .text-success.text-opacity-25 {
          color: rgba(16, 185, 129, 0.25) !important;
        }

        .border-success.border-opacity-25 {
          border-color: rgba(16, 185, 129, 0.25) !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .eco-hero {
            height: 400px;
          }

          .logo-container {
            width: 80px;
            height: 80px;
          }

          .display-4 {
            font-size: 2.5rem;
          }

          .card-body.p-5 {
            padding: 2rem !important;
          }
        }

        /* Optimisations de performance */
        .will-change-transform {
          will-change: transform;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        /* Smooth transitions */
        .transition-all {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}
