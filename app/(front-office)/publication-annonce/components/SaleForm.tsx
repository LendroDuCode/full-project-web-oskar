// app/(front-office)/publication-annonce/components/SaleForm.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faInfoCircle,
  faMoneyBill,
  faMapMarkerAlt,
  faImage,
  faCamera,
  faTag,
  faBox,
  faStar,
  faCheckCircle,
  faExclamationCircle,
  faList,
  faStore,
  faBuilding,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import {
  Category,
  VenteData,
  Boutique,
  VenteFormProps,
} from "../components/constantes/types";

// ============================================
// COMPOSANT D'IMAGE SÉCURISÉ
// ============================================
const SafeImage = ({
  src,
  alt,
  className,
  style,
  fallbackIcon = faStore,
  fallbackSize = "24px",
}: any) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || "");

  useEffect(() => {
    setImgSrc(src || "");
    setError(false);
  }, [src]);

  if (error || !imgSrc) {
    return (
      <div
        className={`${className} d-flex align-items-center justify-content-center`}
        style={{
          ...style,
          backgroundColor: "#f8f9fa",
        }}
      >
        <FontAwesomeIcon
          icon={fallbackIcon}
          className="text-muted"
          style={{ fontSize: fallbackSize }}
        />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
};

const VenteForm: React.FC<VenteFormProps> = ({
  venteData,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
  boutiques,
  selectedBoutique,
  onBoutiqueChange,
  user,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBoutique, setLoadingBoutique] = useState(false);
  const [vendeurBoutique, setVendeurBoutique] = useState<Boutique | null>(null);

  // Fonction pour obtenir le texte du statut de la boutique
  const getBoutiqueStatusText = (boutique: Boutique) => {
    if (boutique.est_bloque) {
      return "• Bloqué";
    }
    if (boutique.est_ferme) {
      return "• Fermé";
    }
    switch (boutique.statut) {
      case "actif":
        return "• Actif";
      case "en_review":
        return "• En revue";
      case "bloque":
        return "• Bloqué";
      default:
        return "";
    }
  };

  // Fonction pour obtenir le badge de statut (à utiliser en dehors des <option>)
  const getBoutiqueStatusBadge = (boutique: Boutique) => {
    if (boutique.est_bloque) {
      return <span className="badge bg-danger">Bloqué</span>;
    }
    if (boutique.est_ferme) {
      return <span className="badge bg-secondary">Fermé</span>;
    }
    switch (boutique.statut) {
      case "actif":
        return <span className="badge bg-success">Actif</span>;
      case "en_review":
        return <span className="badge bg-warning">En revue</span>;
      case "bloque":
        return <span className="badge bg-danger">Bloqué</span>;
      default:
        return <span className="badge bg-secondary">Inconnu</span>;
    }
  };

  // Logs de débogage
  useEffect(() => {}, [
    venteData.boutiqueUuid,
    user?.type,
    selectedBoutique,
    boutiques,
  ]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          const formatted: Category[] = response.map((item) => ({
            label: item.libelle || item.type || "Catégorie sans nom",
            value: item.uuid,
            uuid: item.uuid,
            icon: faList,
          }));
          setCategories(formatted);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err: any) {
        console.error("Erreur chargement catégories:", err);
        setError("Impossible de charger les catégories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Récupérer la boutique du vendeur
  useEffect(() => {
    const fetchVendeurBoutique = async () => {
      if (!user || user?.type !== "vendeur") {
        console.log("ℹ️ Utilisateur non-vendeur");
        return;
      }

      try {
        setLoadingBoutique(true);
        console.log("🛍️ Chargement boutique vendeur...");

        const response = await api.get(
          API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR,
        );

        let boutiquesData: Boutique[] = [];

        if (Array.isArray(response)) {
          boutiquesData = response;
        } else if (response && Array.isArray(response.data)) {
          boutiquesData = response.data;
        } else if (
          response &&
          response.data &&
          Array.isArray(response.data.data)
        ) {
          boutiquesData = response.data.data;
        } else if (
          response &&
          response.success &&
          Array.isArray(response.data)
        ) {
          boutiquesData = response.data;
        }

        const boutiquesActives = boutiquesData.filter(
          (boutique: Boutique) =>
            !boutique.est_bloque &&
            !boutique.est_ferme &&
            (boutique.statut === "actif" || boutique.statut === "en_review"),
        );

        console.log(`📊 ${boutiquesActives.length} boutique(s) active(s)`);

        if (boutiquesActives.length > 0) {
          const premiereBoutique = boutiquesActives[0];
          setVendeurBoutique(premiereBoutique);

          // Pré-sélectionner automatiquement si pas déjà fait
          if (!venteData.boutiqueUuid) {
            console.log(`✅ Pré-sélection boutique: ${premiereBoutique.uuid}`);
            onChange({
              ...venteData,
              boutiqueUuid: premiereBoutique.uuid,
            });

            if (onBoutiqueChange) {
              onBoutiqueChange(premiereBoutique.uuid);
            }
          }
        } else {
          console.log("ℹ️ Le vendeur n'a pas de boutique active");
          setVendeurBoutique(null);
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement boutique:", err);
        setVendeurBoutique(null);
      } finally {
        setLoadingBoutique(false);
      }
    };

    fetchVendeurBoutique();
  }, [
    user?.type,
    user?.uuid,
    venteData.boutiqueUuid,
    onChange,
    onBoutiqueChange,
  ]);

  const renderVenteStep2 = () => (
    <div className="p-4">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon
            icon={faShoppingCart}
            className="text-success fs-3"
          />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">Détails de la vente</h3>
          <p className="text-muted mb-0">
            Décrivez votre produit et fixez votre prix
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning border-0 mb-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="text-success me-2"
                />
                Information du produit
              </h5>
            </div>
            <div className="card-body">
              {/* Section boutique pour les vendeurs */}
              {user?.type === "vendeur" && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center mb-0">
                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="me-2 text-primary"
                      />
                      Vendre en tant que vendeur
                    </label>
                    {vendeurBoutique && !loadingBoutique && (
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        <FontAwesomeIcon icon={faStore} className="me-1" />
                        Votre boutique
                      </span>
                    )}
                  </div>

                  {loadingBoutique ? (
                    <div className="alert alert-info border-0 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Chargement de votre boutique...
                      </div>
                    </div>
                  ) : vendeurBoutique ? (
                    <div className="mb-4">
                      <div className="alert alert-success border-0 mb-3">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-2"
                          />
                          <span>
                            Votre boutique{" "}
                            <strong>{vendeurBoutique.nom}</strong> a été
                            présélectionnée
                          </span>
                        </div>
                      </div>

                      <div className="card border border-success border-2 bg-success bg-opacity-5 p-3">
                        <div className="d-flex align-items-center">
                          {vendeurBoutique.logo ? (
                            <SafeImage
                              src={vendeurBoutique.logo}
                              alt={vendeurBoutique.nom}
                              className="rounded-circle me-3"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                              fallbackIcon={faBuilding}
                              fallbackSize="20px"
                            />
                          ) : (
                            <div className="bg-white rounded-circle p-3 me-3 border border-success">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="text-success fs-4"
                              />
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="fw-bold mb-1 d-flex align-items-center">
                                  {vendeurBoutique.nom}
                                  <span className="ms-2">
                                    {getBoutiqueStatusBadge(vendeurBoutique)}
                                  </span>
                                </h6>
                                <p className="text-muted small mb-2">
                                  {vendeurBoutique.description ||
                                    "Aucune description"}
                                </p>
                                <div className="d-flex gap-2">
                                  <small className="badge bg-light text-dark">
                                    {vendeurBoutique.type_boutique?.libelle ||
                                      "Type inconnu"}
                                  </small>
                                  <small className="text-muted">
                                    <FontAwesomeIcon
                                      icon={faBuilding}
                                      className="me-1"
                                    />
                                    Votre boutique par défaut
                                  </small>
                                </div>
                              </div>
                              <div className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    console.log("🔄 Changement de boutique");
                                    setVendeurBoutique(null);
                                    onChange({
                                      ...venteData,
                                      boutiqueUuid: "",
                                    });
                                    if (onBoutiqueChange) {
                                      onBoutiqueChange("");
                                    }
                                  }}
                                >
                                  Changer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    !loadingBoutique && (
                      <div className="alert alert-warning border-0 mb-3">
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          className="me-2"
                        />
                        <span>
                          Vous n'avez pas encore de boutique active.{" "}
                          <a
                            href="/dashboard-vendeur/boutiques"
                            className="fw-bold text-decoration-none"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Créer une boutique
                          </a>
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Liste des boutiques pour tous les utilisateurs */}
              {boutiques.length > 0 && (
                <div className="mb-4">
                  <label className="form-label fw-semibold d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="me-2 text-success"
                    />
                    Vendre via une boutique{" "}
                    {user?.type !== "vendeur" ? "(optionnel)" : ""}
                  </label>
                  <select
                    className="form-select border-light"
                    value={venteData.boutiqueUuid}
                    onChange={(e) => {
                      console.log(`🔄 Sélection boutique: ${e.target.value}`);
                      onChange({
                        ...venteData,
                        boutiqueUuid: e.target.value,
                      });
                      if (onBoutiqueChange) {
                        onBoutiqueChange(e.target.value);
                      }
                    }}
                    required={user?.type === "vendeur"}
                  >
                    <option value="">
                      {user?.type === "vendeur"
                        ? "Sélectionnez votre boutique"
                        : "Sélectionnez une boutique (optionnel)"}
                    </option>
                    {boutiques.map((boutique) => (
                      <option key={boutique.uuid} value={boutique.uuid}>
                        🛒 {boutique.nom} {getBoutiqueStatusText(boutique)}
                      </option>
                    ))}
                  </select>

                  {selectedBoutique && (
                    <div className="mt-3 card border-0 bg-success bg-opacity-10 p-3">
                      <div className="d-flex align-items-center">
                        {selectedBoutique.logo ? (
                          <SafeImage
                            src={selectedBoutique.logo}
                            alt={selectedBoutique.nom}
                            className="rounded-circle me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                            fallbackIcon={faBuilding}
                            fallbackSize="20px"
                          />
                        ) : (
                          <div className="bg-white rounded-circle p-3 me-3">
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="text-success fs-4"
                            />
                          </div>
                        )}
                        <div>
                          <h6 className="fw-bold mb-1 d-flex align-items-center">
                            {selectedBoutique.nom}
                            <span className="ms-2">
                              {getBoutiqueStatusBadge(selectedBoutique)}
                            </span>
                          </h6>
                          <p className="text-muted small mb-0">
                            {selectedBoutique.description ||
                              "Aucune description"}
                          </p>
                          <div className="d-flex gap-2 mt-2">
                            <small className="badge bg-light text-dark">
                              {selectedBoutique.type_boutique?.libelle ||
                                "Type inconnu"}
                            </small>
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faBuilding}
                                className="me-1"
                              />
                              Vente via boutique
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg border-light"
                  placeholder="Ex: Casque Audio Sony WH-1000XM5"
                  value={venteData.libelle}
                  onChange={(e) =>
                    onChange({ ...venteData, libelle: e.target.value })
                  }
                  required
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Prix (FCFA) *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-light">
                        <FontAwesomeIcon
                          icon={faMoneyBill}
                          className="text-success"
                        />
                      </span>
                      <input
                        type="number"
                        className="form-control border-light"
                        placeholder="Ex: 250000"
                        value={venteData.prix}
                        onChange={(e) =>
                          onChange({ ...venteData, prix: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Quantité disponible *
                    </label>
                    <input
                      type="number"
                      className="form-control border-light"
                      value={venteData.quantite}
                      onChange={(e) =>
                        onChange({ ...venteData, quantite: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Type de produit
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Ex: accessoire audio"
                      value={venteData.type}
                      onChange={(e) =>
                        onChange({ ...venteData, type: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Lieu *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-light">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-success"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control border-light"
                        placeholder="Ex: Cocody, Abidjan"
                        value={venteData.lieu}
                        onChange={(e) =>
                          onChange({ ...venteData, lieu: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Description détaillée
                </label>
                <textarea
                  className="form-control border-light"
                  rows={4}
                  placeholder="Décrivez votre produit en détail..."
                  value={venteData.description}
                  onChange={(e) =>
                    onChange({ ...venteData, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon
                  icon={faCamera}
                  className="text-success me-2"
                />
                Photo & Catégorie
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Photo du produit
                </label>
                {imagePreview ? (
                  <div className="position-relative mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-fluid rounded-3 border"
                      style={{
                        maxHeight: "200px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-product.png";
                      }}
                    />
                    <button
                      type="button"
                      onClick={onRemoveImage}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      style={{ width: "32px", height: "32px" }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center border-dashed border-2 border-light rounded-3 p-5 mb-3 bg-light bg-opacity-25">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="text-muted small mb-0">
                      Ajoutez une photo du produit
                    </p>
                  </div>
                )}
                <div className="d-grid">
                  <label className="btn btn-outline-success btn-lg">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    {imagePreview ? "Changer la photo" : "Ajouter une photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={onImageUpload}
                    />
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Catégorie *</label>
                {loading ? (
                  <div className="text-center py-2">
                    <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                    Chargement...
                  </div>
                ) : error ? (
                  <div className="text-danger small">Erreur de chargement</div>
                ) : (
                  <select
                    className="form-select border-light"
                    value={venteData.categorie_uuid}
                    onChange={(e) =>
                      onChange({
                        ...venteData,
                        categorie_uuid: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.uuid} value={cat.uuid}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  État du produit
                </label>
                <select
                  className="form-select border-light"
                  value={venteData.condition}
                  onChange={(e) =>
                    onChange({ ...venteData, condition: e.target.value })
                  }
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="alert alert-success border-0">
                <small className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <span>
                    Des photos de qualité augmentent vos chances de vente
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVenteStep3 = () => (
    <div className="p-4">
      <div className="text-center mb-5">
        <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-3">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1" />
        </div>
        <h3 className="fw-bold text-dark mb-2">Récapitulatif de la vente</h3>
        <p className="text-muted">
          Vérifiez les informations avant publication
        </p>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Détails du produit</h5>
                  <p className="text-muted mb-0">Informations principales</p>
                </div>
                <div className="badge bg-success bg-opacity-10 text-success fs-6 p-2">
                  <FontAwesomeIcon icon={faTag} className="me-2" />
                  {selectedBoutique || vendeurBoutique
                    ? "Vente via boutique"
                    : "En vente"}
                </div>
              </div>

              {/* Section boutique */}
              {(selectedBoutique || vendeurBoutique) && (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="me-2 text-success"
                    />
                    {vendeurBoutique
                      ? "Vente via VOTRE boutique"
                      : "Vente via boutique"}
                  </h6>
                  <div
                    className={`card border-0 ${
                      vendeurBoutique
                        ? "bg-primary bg-opacity-10 border-primary"
                        : "bg-success bg-opacity-10"
                    } p-3`}
                  >
                    <div className="d-flex align-items-center">
                      {selectedBoutique?.logo || vendeurBoutique?.logo ? (
                        <SafeImage
                          src={
                            (vendeurBoutique || selectedBoutique)?.logo || ""
                          }
                          alt={
                            (vendeurBoutique || selectedBoutique)?.nom ||
                            "Boutique"
                          }
                          className="rounded-circle me-3"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                          fallbackIcon={faStore}
                          fallbackSize="24px"
                        />
                      ) : (
                        <div
                          className={`rounded-circle p-3 me-3 ${
                            vendeurBoutique
                              ? "bg-primary text-white"
                              : "bg-white"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className={
                              vendeurBoutique
                                ? "text-white fs-3"
                                : "text-success fs-3"
                            }
                          />
                        </div>
                      )}
                      <div>
                        <h5 className="fw-bold mb-1">
                          {(vendeurBoutique || selectedBoutique)?.nom}
                          {vendeurBoutique && (
                            <span className="badge bg-primary ms-2">
                              Votre boutique
                            </span>
                          )}
                        </h5>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {(vendeurBoutique || selectedBoutique) && (
                            <>
                              {getBoutiqueStatusBadge(
                                vendeurBoutique || selectedBoutique!,
                              )}
                              <span className="badge bg-light text-dark">
                                {(vendeurBoutique || selectedBoutique)
                                  ?.type_boutique?.libelle || "Type inconnu"}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-muted small mb-0">
                          {(vendeurBoutique || selectedBoutique)?.description ||
                            "Aucune description fournie"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="row mb-4">
                <div className="col-md-8">
                  <h4 className="fw-bold text-dark mb-3">
                    {venteData.libelle || "Non renseigné"}
                  </h4>
                  <div className="d-flex align-items-center mb-3">
                    <div className="fs-3 fw-bold text-success">
                      {venteData.prix
                        ? `${parseInt(venteData.prix).toLocaleString()} FCFA`
                        : "Prix non défini"}
                    </div>
                    <div className="ms-4 badge bg-light text-dark p-2">
                      <FontAwesomeIcon icon={faBox} className="me-1" />
                      Quantité: {venteData.quantite}
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <div className="fs-1 fw-bold text-success">
                      {venteData.etoile}
                    </div>
                    <div className="text-warning">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={
                            i < parseInt(venteData.etoile)
                              ? "text-warning"
                              : "text-light"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-muted small mb-0 mt-1">Note moyenne</p>
                  </div>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <p className="text-muted mb-1">Catégorie</p>
                    <p className="fw-bold text-dark">
                      {categories.find(
                        (c) => c.uuid === venteData.categorie_uuid,
                      )?.label || "Non renseigné"}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-muted mb-1">Type</p>
                    <p className="fw-bold text-dark">
                      {venteData.type || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <p className="text-muted mb-1">État</p>
                    <p className="fw-bold text-dark">
                      {conditions.find((c) => c.value === venteData.condition)
                        ?.label || "Non renseigné"}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-muted mb-1">Lieu</p>
                    <p className="fw-bold text-dark">
                      {venteData.lieu || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>
              {venteData.description && (
                <div className="mt-4">
                  <p className="text-muted mb-2">Description</p>
                  <div className="bg-light rounded p-3">
                    <p className="mb-0">{venteData.description}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 pt-3 border-top">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="disponibleSwitch"
                        checked={venteData.disponible}
                        readOnly
                      />
                      <label
                        className="form-check-label fw-semibold"
                        htmlFor="disponibleSwitch"
                      >
                        Produit disponible
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Garantie</p>
                    <p className="fw-bold text-dark">
                      {venteData.garantie === "oui" ? "Oui" : "Non"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold text-dark mb-4">Photo du produit</h5>
              {imagePreview ? (
                <div className="text-center mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="img-fluid rounded-3 border shadow-sm"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-product.png";
                    }}
                  />
                </div>
              ) : (
                <div className="text-center border-dashed border-2 border-light rounded-3 p-4 mb-4">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="text-muted fs-1 mb-3"
                  />
                  <p className="text-muted small mb-0">Aucune photo</p>
                </div>
              )}
              <div className="alert alert-success border-0">
                <h6 className="fw-bold mb-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Prêt à vendre
                </h6>
                <p className="small mb-0">
                  {selectedBoutique || vendeurBoutique
                    ? "Votre produit sera publié dans votre boutique."
                    : "Votre produit sera visible par tous les acheteurs."}
                </p>
              </div>
              <div className="alert alert-info border-0 mt-3">
                <h6 className="fw-bold mb-2">
                  Conseils pour vendre rapidement
                </h6>
                <ul className="small mb-0 ps-3">
                  <li>Répondez rapidement aux messages</li>
                  <li>Soyez transparent sur l'état du produit</li>
                  <li>Proposez un prix compétitif</li>
                  <li>Organisez les rencontres en lieu sûr</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 2) return renderVenteStep2();
  if (step === 3) return renderVenteStep3();
  return null;
};

export default VenteForm;
