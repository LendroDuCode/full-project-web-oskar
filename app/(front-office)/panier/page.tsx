// app/(front-office)/panier/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import colors from "@/app/shared/constants/colors";
import Link from "next/link";

// Types pour le panier et les items
interface PanierItem {
  uuid: string;
  quantite: number;
  prixUnitaire: string;
  sousTotal: string;
  produit: {
    uuid: string;
    libelle: string;
    description: string | null;
    image: string;
    prix: string;
    disponible: boolean;
    boutique: {
      uuid: string;
      nom: string;
      logo: string | null;
    };
    categorie: {
      uuid: string;
      nom: string;
    };
  };
}

interface Panier {
  uuid: string;
  items: PanierItem[];
  total: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour la commande
interface Commande {
  uuid: string;
  numero_commande: string;
  total: string;
  statut: string;
  statut_paiement: string;
}

// Fonction utilitaire pour obtenir le token avec vérification
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("oskar_token");
};

// Fonction utilitaire pour créer les headers d'authentification
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function PanierPage() {
  const router = useRouter();
  const { isLoggedIn, user, openLoginModal } = useAuth();
  
  const [panier, setPanier] = useState<Panier | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Commande | null>(null);

  // Récupérer le panier actuel
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    fetchPanier();
  }, [isLoggedIn]);

  const fetchPanier = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError("Veuillez vous connecter pour accéder à votre panier");
        setLoading(false);
        return;
      }

      try {
        const panierResponse = await axios.get(API_ENDPOINTS.PANIER.CURRENT, {
          headers: getAuthHeaders(),
        });

        if (panierResponse.data.success && panierResponse.data.data?.uuid) {
          const detailResponse = await axios.get(
            API_ENDPOINTS.PANIER.BY_UUID(panierResponse.data.data.uuid),
            { headers: getAuthHeaders() }
          );

          if (detailResponse.data.success) {
            setPanier(detailResponse.data.data);
          }
        } else if (panierResponse.data.success && panierResponse.data.data?.items) {
          setPanier(panierResponse.data.data);
        }
      } catch (currentError: any) {
        try {
          const getResponse = await axios.get(API_ENDPOINTS.PANIER.GET, {
            headers: getAuthHeaders(),
          });

          if (getResponse.data.success) {
            setPanier(getResponse.data.data);
          }
        } catch (getError: any) {
          if (getError.response?.status === 404 || currentError.response?.status === 404) {
            setPanier(null);
          } else if (getError.response?.status === 401 || currentError.response?.status === 401) {
            setError("Votre session a expiré. Veuillez vous reconnecter.");
            localStorage.removeItem("oskar_token");
            localStorage.removeItem("oskar_user");
            setTimeout(() => openLoginModal(), 1500);
          } else {
            setError("Une erreur est survenue lors du chargement de votre panier");
          }
        }
      }

    } catch (err: any) {
      console.error("Erreur inattendue:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemUuid: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemUuid);
      return;
    }

    try {
      setUpdating(itemUuid);
      setError(null);

      const response = await axios.post(
        API_ENDPOINTS.PANIER.UPDATE_QUANTITY,
        {
          produitUuid: itemUuid,
          quantite: newQuantity,
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        await fetchPanier();
      } else {
        setError(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user");
        setTimeout(() => openLoginModal(), 1500);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la mise à jour de la quantité");
      }
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemUuid: string) => {
    try {
      setUpdating(itemUuid);
      setError(null);

      const response = await axios.delete(API_ENDPOINTS.PANIER.REMOVE_ITEM(itemUuid), {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        await fetchPanier();
      } else {
        setError(response.data.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user");
        setTimeout(() => openLoginModal(), 1500);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la suppression de l'article");
      }
    } finally {
      setUpdating(null);
    }
  };

  const clearPanier = async () => {
    if (!confirm("Voulez-vous vraiment vider votre panier ?")) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(API_ENDPOINTS.PANIER.CLEAR, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setPanier(null);
      } else {
        setError(response.data.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user");
        setTimeout(() => openLoginModal(), 1500);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la suppression du panier");
      }
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour passer commande directement
  const passerCommande = async () => {
    if (!panier || panier.items.length === 0) {
      setError("Votre panier est vide");
      return;
    }

    try {
      setProcessingOrder(true);
      setError(null);

      const response = await axios.post(
        API_ENDPOINTS.COMMANDES.CREATE(panier.uuid),
        {}, // Corps vide car l'UUID du panier est dans l'URL
        { headers: getAuthHeaders() }
      );

      console.log("Commande réponse:", response.data);

      if (response.data.success) {
        setOrderSuccess(response.data.data.commande);
        
        // Option 1: Rediriger vers la page de confirmation
        // setTimeout(() => {
        //   router.push(`/commande/${response.data.data.commande.uuid}`);
        // }, 2000);
        
        // Option 2: Rafraîchir le panier (qui sera vide après commande)
        setTimeout(() => {
          fetchPanier();
        }, 3000);
      } else {
        setError(response.data.message || "Erreur lors de la commande");
      }
    } catch (err: any) {
      console.error("Erreur lors de la commande:", err);
      
      if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        localStorage.removeItem("oskar_token");
        localStorage.removeItem("oskar_user");
        setTimeout(() => openLoginModal(), 1500);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue lors du passage de la commande");
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return "0,00 FCFA";
    
    return numericPrice.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " FCFA";
  };

  // État de chargement
  if (loading) {
    return (
      <main className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-success mb-4" style={{ width: "3rem", height: "3rem" }} role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Chargement de votre panier</h3>
                    <p className="text-muted">Veuillez patienter un instant...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Non connecté
  if (!isLoggedIn) {
    return (
      <main className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 border-0">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: "80px", height: "80px", backgroundColor: colors.oskar.green + "20" }}>
                      <i className="fa-solid fa-shopping-cart fs-2" style={{ color: colors.oskar.green }}></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Accédez à votre panier</h2>
                    <p className="text-muted mb-0">Connectez-vous pour consulter vos articles</p>
                  </div>
                </div>
                <div className="card-body p-4 p-lg-5">
                  <div className="text-center">
                    <button
                      onClick={openLoginModal}
                      className="btn btn-lg w-100 mb-3 py-3 fw-bold shadow-sm"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.oskar.green;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <i className="fa-solid fa-right-to-bracket me-2"></i>
                      Se connecter
                    </button>
                    <p className="text-muted mb-0">
                      Pas encore de compte ?{" "}
                      <button
                        onClick={openLoginModal}
                        className="btn btn-link p-0 text-decoration-none fw-semibold"
                        style={{ color: colors.oskar.green }}
                      >
                        Créer un compte gratuitement
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Panier vide
  if (!panier || panier.items.length === 0) {
    return (
      <main className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 border-0">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: "80px", height: "80px", backgroundColor: colors.oskar.green + "20" }}>
                      <i className="fa-solid fa-cart-shopping fs-2" style={{ color: colors.oskar.green }}></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Votre panier est vide</h2>
                    <p className="text-muted mb-0">Commencez vos achats dès maintenant</p>
                  </div>
                </div>
                <div className="card-body p-4 p-lg-5">
                  <div className="text-center">
                    <Link
                      href="/"
                      className="btn btn-lg w-100 mb-3 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.oskar.green;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <i className="fa-solid fa-store me-2"></i>
                      Découvrir nos produits
                    </Link>
                    <div className="d-flex flex-column flex-md-row gap-3 mt-4">
                      <Link href="/dons-echanges" className="btn btn-outline-secondary flex-fill py-3">
                        <i className="fa-solid fa-gift me-2"></i>
                        Dons & Échanges
                      </Link>
                      <Link href="/liste-favoris" className="btn btn-outline-secondary flex-fill py-3">
                        <i className="fa-solid fa-heart me-2"></i>
                        Mes favoris
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 bg-light py-5">
      <div className="container">
        {/* En-tête */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="fw-bold text-dark mb-2">
                <i className="fa-solid fa-shopping-cart me-3" style={{ color: colors.oskar.green }}></i>
                Mon panier
              </h1>
              <p className="text-muted mb-0">
                <span className="badge bg-success bg-opacity-10 text-success fw-normal px-3 py-2 me-2">
                  {panier.items.length} article{panier.items.length > 1 ? "s" : ""}
                </span>
                <span className="text-muted">Dernière mise à jour: {new Date(panier.updatedAt).toLocaleDateString('fr-FR')}</span>
              </p>
            </div>
            <button
              onClick={clearPanier}
              className="btn btn-outline-danger d-flex align-items-center px-4 py-2"
              disabled={loading || panier.items.length === 0}
            >
              <i className="fa-solid fa-trash-can me-2"></i>
              Vider le panier
            </button>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4 border-0 shadow-sm rounded-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-circle-exclamation fs-4 me-3"></i>
              <div className="flex-grow-1">
                <h6 className="alert-heading fw-bold mb-1">Une erreur est survenue</h6>
                <p className="mb-0">{error}</p>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        {/* Message de succès de commande */}
        {orderSuccess && (
          <div className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm rounded-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-check-circle fs-4 me-3 text-success"></i>
              <div className="flex-grow-1">
                <h6 className="alert-heading fw-bold mb-1">Commande confirmée !</h6>
                <p className="mb-2">
                  Votre commande <strong>{orderSuccess.numero_commande}</strong> a été passée avec succès.
                  Montant total: <strong>{formatPrice(orderSuccess.total)}</strong>
                </p>
                <div className="d-flex gap-2">
                  <Link href={`/commande/${orderSuccess.uuid}`} className="btn btn-sm btn-success">
                    <i className="fa-solid fa-eye me-1"></i>
                    Voir ma commande
                  </Link>
                  <Link href="/mes-commandes" className="btn btn-sm btn-outline-success">
                    <i className="fa-solid fa-list me-1"></i>
                    Mes commandes
                  </Link>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setOrderSuccess(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* Liste des articles */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-white py-4 border-0">
                <div className="d-flex align-items-center justify-content-between">
                  <h3 className="fw-bold text-dark mb-0">
                    <i className="fa-solid fa-box-open me-2 text-success"></i>
                    Vos articles
                  </h3>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                    Total: {formatPrice(panier.total)}
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                {panier.items.map((item, index) => (
                  <div
                    key={item.uuid}
                    className={`border-bottom p-4 ${index === panier.items.length - 1 ? 'border-0' : ''}`}
                    style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}
                  >
                    <div className="row g-4 align-items-center">
                      {/* Image du produit */}
                      <div className="col-3 col-md-2">
                        <div className="position-relative rounded-3 overflow-hidden shadow-sm" style={{ paddingTop: "100%" }}>
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white">
                            {item.produit.image ? (
                              <img
                                src={item.produit.image}
                                alt={item.produit.libelle}
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                                }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light">
                                <i className="fa-solid fa-image fs-1 text-muted mb-2"></i>
                                <small className="text-muted">Pas d'image</small>
                              </div>
                            )}
                          </div>
                          {!item.produit.disponible && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                              <span className="badge bg-warning text-dark px-3 py-2">Indisponible</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Détails du produit */}
                      <div className="col-9 col-md-10">
                        <div className="row g-3 align-items-center">
                          <div className="col-md-6">
                            <Link
                              href={`/produit/${item.produit.uuid}`}
                              className="text-decoration-none"
                              style={{ color: colors.oskar.black }}
                            >
                              <h5 className="fw-bold mb-2">{item.produit.libelle}</h5>
                            </Link>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                              <span className="badge bg-light text-dark px-3 py-2 border">
                                <i className="fa-solid fa-tag me-1 text-success"></i>
                                {item.produit.categorie.nom}
                              </span>
                              <span className="badge bg-light text-dark px-3 py-2 border">
                                <i className="fa-solid fa-store me-1 text-primary"></i>
                                {item.produit.boutique.nom}
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <span className="fs-4 fw-bold text-success me-3">
                                {formatPrice(item.produit.prix)}
                              </span>
                              <small className="text-muted">
                                Prix unitaire
                              </small>
                            </div>
                          </div>

                          {/* Gestion de la quantité */}
                          <div className="col-md-3">
                            <div className="d-flex align-items-center">
                              <div className="input-group input-group-sm" style={{ maxWidth: "140px" }}>
                                <button
                                  className="btn btn-outline-secondary border-end-0 rounded-start"
                                  onClick={() => updateQuantity(item.produit.uuid, item.quantite - 1)}
                                  disabled={updating === item.uuid || item.quantite <= 1}
                                >
                                  <i className="fa-solid fa-minus"></i>
                                </button>
                                <div className="form-control text-center border px-3 py-2 bg-white">
                                  {updating === item.uuid ? (
                                    <div className="spinner-border spinner-border-sm text-success" role="status">
                                      <span className="visually-hidden">Chargement...</span>
                                    </div>
                                  ) : (
                                    <span className="fw-bold">{item.quantite}</span>
                                  )}
                                </div>
                                <button
                                  className="btn btn-outline-secondary border-start-0 rounded-end"
                                  onClick={() => updateQuantity(item.produit.uuid, item.quantite + 1)}
                                  disabled={updating === item.uuid}
                                >
                                  <i className="fa-solid fa-plus"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Sous-total et actions */}
                          <div className="col-md-3">
                            <div className="d-flex flex-column align-items-end">
                              <div className="text-end mb-2">
                                <div className="fs-4 fw-bold text-dark">{formatPrice(item.sousTotal)}</div>
                                <small className="text-muted">
                                  {item.quantite} × {formatPrice(item.prixUnitaire)}
                                </small>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-outline-danger btn-sm d-flex align-items-center"
                                  onClick={() => removeItem(item.produit.uuid)}
                                  disabled={updating === item.uuid}
                                  title="Supprimer"
                                >
                                  {updating === item.uuid ? (
                                    <div className="spinner-border spinner-border-sm" role="status">
                                      <span className="visually-hidden">Suppression...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-trash-can me-1"></i>
                                      Supprimer
                                    </>
                                  )}
                                </button>
                                <Link
                                  href={`/produit/${item.produit.uuid}`}
                                  className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                >
                                  <i className="fa-solid fa-eye me-1"></i>
                                  Voir
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions supplémentaires */}
            <div className="mt-4">
              <div className="card border-0 shadow-sm rounded-4 bg-white">
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Link
                        href="/"
                        className="btn btn-outline-secondary w-100 py-3 d-flex align-items-center justify-content-center"
                      >
                        <i className="fa-solid fa-arrow-left me-3"></i>
                        Continuer vos achats
                      </Link>
                    </div>
                    <div className="col-md-6">
                      <Link
                        href="/liste-favoris"
                        className="btn btn-outline-primary w-100 py-3 d-flex align-items-center justify-content-center"
                      >
                        <i className="fa-solid fa-heart me-3"></i>
                        Voir vos favoris
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif et commande */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "20px" }}>
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-gradient py-4 text-white border-0"
                  style={{ background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)` }}>
                  <h4 className="fw-bold mb-0 text-center">
                    <i className="fa-solid fa-file-invoice-dollar me-2"></i>
                    Récapitulatif
                  </h4>
                </div>
                <div className="card-body p-4">
                  {/* Détails du total */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Sous-total</span>
                      <span className="fw-bold fs-5">{formatPrice(panier.total)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Livraison</span>
                      <span className="text-success fw-semibold">
                        <i className="fa-solid fa-truck me-1"></i>
                        À calculer
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Remise</span>
                      <span className="text-danger fw-semibold">- 0,00 FCFA</span>
                    </div>
                    <hr className="my-3" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-4">Total TTC</span>
                      <span className="fw-bold fs-3" style={{ color: colors.oskar.green }}>
                        {formatPrice(panier.total)}
                      </span>
                    </div>
                  </div>

                  {/* Bouton pour passer commande */}
                  <div className="mb-4">
                    <button
                      onClick={passerCommande}
                      className="btn btn-lg w-100 mb-2 py-3 fw-bold shadow"
                      style={{
                        backgroundColor: colors.oskar.green,
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        transition: "all 0.3s",
                      }}
                      disabled={processingOrder || panier.items.length === 0 || orderSuccess !== null}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.oskar.greenHover;
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colors.oskar.green;
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {processingOrder ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Traitement en cours...
                        </>
                      ) : orderSuccess ? (
                        <>
                          <i className="fa-solid fa-check me-2"></i>
                          Commande confirmée
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cart-arrow-down me-2"></i>
                          Commander maintenant
                          <i className="fa-solid fa-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>
                    
                    {!orderSuccess && (
                      <div className="text-center mt-2">
                        <small className="text-muted">
                          <i className="fa-solid fa-lock me-1"></i>
                          Paiement sécurisé • Livraison garantie
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Paiements sécurisés */}
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-3">
                      <i className="fa-solid fa-shield-halved me-2 text-success"></i>
                      Paiement 100% sécurisé
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <div className="bg-light rounded-3 p-2">
                        <i className="fa-brands fa-cc-visa fs-4 text-primary"></i>
                      </div>
                      <div className="bg-light rounded-3 p-2">
                        <i className="fa-brands fa-cc-mastercard fs-4 text-danger"></i>
                      </div>
                      <div className="bg-light rounded-3 p-2">
                        <i className="fa-brands fa-cc-paypal fs-4 text-info"></i>
                      </div>
                      <div className="bg-light rounded-3 p-2">
                        <i className="fa-solid fa-money-bill-wave fs-4 text-success"></i>
                      </div>
                    </div>
                  </div>

                  {/* Avantages */}
                  <div className="border-top pt-4">
                    <h6 className="fw-bold mb-3">
                      <i className="fa-solid fa-gift me-2 text-success"></i>
                      Avantages Oskar
                    </h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3 mb-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "40px", height: "40px", backgroundColor: colors.oskar.green + "20" }}>
                            <i className="fa-solid fa-truck text-success"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Livraison rapide</h6>
                            <small className="text-muted">Délai moyen de 48h</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3 mb-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "40px", height: "40px", backgroundColor: colors.oskar.green + "20" }}>
                            <i className="fa-solid fa-rotate-left text-success"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Retours gratuits</h6>
                            <small className="text-muted">Sous 30 jours</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center p-3 bg-light rounded-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "40px", height: "40px", backgroundColor: colors.oskar.green + "20" }}>
                            <i className="fa-solid fa-shield text-success"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Garantie satisfait</h6>
                            <small className="text-muted">Ou remboursé sous 14 jours</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Code promo */}
                  <div className="mt-4">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control border-end-0"
                        placeholder="Code promo"
                        aria-label="Code promo"
                      />
                      <button className="btn btn-outline-success border-start-0" type="button">
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance */}
              <div className="card border-0 shadow-sm rounded-4 mt-4 bg-white">
                <div className="card-body p-4 text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "60px", height: "60px", backgroundColor: colors.oskar.green + "20" }}>
                    <i className="fa-solid fa-headset fs-3" style={{ color: colors.oskar.green }}></i>
                  </div>
                  <h6 className="fw-bold mb-2">Besoin d'aide ?</h6>
                  <p className="text-muted small mb-3">Notre équipe est disponible 7j/7</p>
                  <Link href="/contact" className="btn btn-outline-success w-100">
                    <i className="fa-solid fa-phone me-2"></i>
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}