// app/(front-office)/publication-annonce/components/SaleForm.tsx
"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
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
  faPencil,
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
  user,
  validationErrors = {},
  // Props optionnelles avec valeurs par défaut
  boutiques: externalBoutiques = [],
  selectedBoutique: externalSelectedBoutique = null,
  onBoutiqueChange: externalOnBoutiqueChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBoutiques, setLoadingBoutiques] = useState(false);
  const [boutiques, setBoutiques] = useState<Boutique[]>(externalBoutiques);
  const [boutiqueInputMode, setBoutiqueInputMode] = useState(false);
  const [nouvelleBoutiqueNom, setNouvelleBoutiqueNom] = useState("");

  // Fonction pour vérifier si l'utilisateur est un vendeur
  const isUserVendeur = useCallback(() => {
    if (user?.type?.toLowerCase() === "vendeur") return true;
    if (user?.role?.toLowerCase() === "vendeur") return true;
    return false;
  }, [user]);

  // Charger toutes les boutiques si aucune n'est fournie de l'extérieur
  useEffect(() => {
    const fetchAllBoutiques = async () => {
      // Si des boutiques sont déjà fournies de l'extérieur, on les utilise
      if (externalBoutiques && externalBoutiques.length > 0) {
        setBoutiques(externalBoutiques);
        return;
      }

      try {
        setLoadingBoutiques(true);
        console.log("🏪 Chargement de toutes les boutiques...");

        const response = await api.get(API_ENDPOINTS.BOUTIQUES.ALL);
        console.log("📦 Réponse boutiques:", response);

        let boutiquesData: Boutique[] = [];
        if (response?.data && Array.isArray(response.data)) {
          boutiquesData = response.data;
        } else if (Array.isArray(response)) {
          boutiquesData = response;
        }

        // Filtrer les boutiques valides (non bloquées, non fermées)
        const boutiquesValides = boutiquesData.filter(
          (b) => !b.est_bloque && !b.est_ferme,
        );

        console.log(`✅ ${boutiquesValides.length} boutiques disponibles`);
        setBoutiques(boutiquesValides);
      } catch (error) {
        console.error("❌ Erreur chargement boutiques:", error);
      } finally {
        setLoadingBoutiques(false);
      }
    };

    fetchAllBoutiques();
  }, [externalBoutiques]);

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

  // Gérer le changement de boutique
  const handleBoutiqueSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const uuid = e.target.value;
    setBoutiqueInputMode(false);

    // Mettre à jour l'état local
    onChange({
      ...venteData,
      boutiqueUuid: uuid,
    });

    // Appeler le callback externe si fourni
    if (externalOnBoutiqueChange) {
      externalOnBoutiqueChange(uuid);
    }
  };

  const handleNouvelleBoutiqueNomChange = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const nom = e.target.value;
    setNouvelleBoutiqueNom(nom);
    // Ici on garde boutiqueUuid vide pour indiquer qu'on veut créer une nouvelle boutique
    // La création réelle se fera dans PublishAdModal
    onChange({
      ...venteData,
      boutiqueUuid: "",
    });
  };

  const toggleInputMode = () => {
    setBoutiqueInputMode(!boutiqueInputMode);
    if (!boutiqueInputMode) {
      // Passage en mode saisie
      setNouvelleBoutiqueNom("");
      onChange({
        ...venteData,
        boutiqueUuid: "",
      });
    }
  };

  const renderVenteStep2 = () => {
    return (
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
                {/* Section Boutique */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center mb-0">
                      <FontAwesomeIcon
                        icon={faStore}
                        className="me-2 text-success"
                      />
                      Boutique
                      {isUserVendeur() && (
                        <span className="badge bg-primary bg-opacity-10 text-primary ms-2">
                          Recommandé pour les vendeurs
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={toggleInputMode}
                    >
                      <FontAwesomeIcon icon={faPencil} className="me-1" />
                      {boutiqueInputMode
                        ? "Choisir une boutique existante"
                        : "Créer une nouvelle boutique"}
                    </button>
                  </div>

                  {loadingBoutiques ? (
                    <div className="alert alert-info border-0">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Chargement des boutiques...
                      </div>
                    </div>
                  ) : boutiqueInputMode ? (
                    <div>
                      <input
                        type="text"
                        className="form-control form-control-lg border-light"
                        placeholder="Nom de votre nouvelle boutique"
                        value={nouvelleBoutiqueNom}
                        onChange={handleNouvelleBoutiqueNomChange}
                      />
                      {nouvelleBoutiqueNom && (
                        <div className="mt-2 p-2 bg-info bg-opacity-10 rounded-3">
                          <small className="text-info">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            Une nouvelle boutique sera créée avec le nom "
                            {nouvelleBoutiqueNom}"
                          </small>
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      className="form-select form-select-lg border-light"
                      value={venteData.boutiqueUuid}
                      onChange={handleBoutiqueSelect}
                    >
                      <option value="">
                        Sélectionnez une boutique (optionnel)
                      </option>
                      {boutiques.map((boutique) => (
                        <option key={boutique.uuid} value={boutique.uuid}>
                          🏪 {boutique.nom} -{" "}
                          {boutique.statut === "actif"
                            ? "✓ Active"
                            : `⏳ ${boutique.statut}`}
                          {boutique.vendeurUuid === user?.uuid
                            ? " (Votre boutique)"
                            : ""}
                        </option>
                      ))}
                    </select>
                  )}

                  {venteData.boutiqueUuid && (
                    <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3">
                      <small className="text-success">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-1"
                        />
                        Produit associé à une boutique existante
                      </small>
                    </div>
                  )}

                  {boutiqueInputMode && nouvelleBoutiqueNom && (
                    <div className="mt-3 p-3 bg-info bg-opacity-10 rounded-3">
                      <small className="text-info">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                        Nouvelle boutique à créer : "{nouvelleBoutiqueNom}"
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg border-light ${
                      validationErrors.libelle ? "is-invalid" : ""
                    }`}
                    placeholder="Ex: Casque Audio Sony WH-1000XM5"
                    value={venteData.libelle}
                    onChange={(e) =>
                      onChange({ ...venteData, libelle: e.target.value })
                    }
                    required
                  />
                  {validationErrors.libelle && (
                    <div className="invalid-feedback">
                      {validationErrors.libelle}
                    </div>
                  )}
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
                          className={`form-control border-light ${
                            validationErrors.prix ? "is-invalid" : ""
                          }`}
                          placeholder="Ex: 250000"
                          value={venteData.prix}
                          onChange={(e) =>
                            onChange({ ...venteData, prix: e.target.value })
                          }
                          required
                        />
                      </div>
                      {validationErrors.prix && (
                        <div className="invalid-feedback">
                          {validationErrors.prix}
                        </div>
                      )}
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
                          className={`form-control border-light ${
                            validationErrors.lieu ? "is-invalid" : ""
                          }`}
                          placeholder="Ex: Cocody, Abidjan"
                          value={venteData.lieu}
                          onChange={(e) =>
                            onChange({ ...venteData, lieu: e.target.value })
                          }
                          required
                        />
                      </div>
                      {validationErrors.lieu && (
                        <div className="invalid-feedback">
                          {validationErrors.lieu}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Description détaillée
                  </label>
                  <textarea
                    className={`form-control border-light ${
                      validationErrors.description ? "is-invalid" : ""
                    }`}
                    rows={4}
                    placeholder="Décrivez votre produit en détail..."
                    value={venteData.description}
                    onChange={(e) =>
                      onChange({ ...venteData, description: e.target.value })
                    }
                  />
                  {validationErrors.description && (
                    <div className="invalid-feedback">
                      {validationErrors.description}
                    </div>
                  )}
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
                    <div className="text-danger small">
                      Erreur de chargement
                    </div>
                  ) : (
                    <select
                      className={`form-select border-light ${
                        validationErrors.categorie ? "is-invalid" : ""
                      }`}
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
                  {validationErrors.categorie && (
                    <div className="invalid-feedback">
                      {validationErrors.categorie}
                    </div>
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
  };

  const renderVenteStep3 = () => {
    // Trouver la boutique sélectionnée
    const selectedBoutique = boutiques.find(
      (b) => b.uuid === venteData.boutiqueUuid,
    );

    return (
      <div className="p-4">
        <div className="text-center mb-5">
          <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success fs-1"
            />
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
                    <h5 className="fw-bold text-dark mb-1">
                      Détails du produit
                    </h5>
                    <p className="text-muted mb-0">Informations principales</p>
                  </div>
                  <div className="badge bg-success bg-opacity-10 text-success fs-6 p-2">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    {selectedBoutique || nouvelleBoutiqueNom
                      ? "Vente via boutique"
                      : "En vente"}
                  </div>
                </div>

                {/* Section boutique */}
                {(selectedBoutique || nouvelleBoutiqueNom) && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faStore}
                        className="me-2 text-success"
                      />
                      Vente via boutique
                    </h6>
                    <div className="card border-0 bg-success bg-opacity-10 p-3">
                      <div className="d-flex align-items-center">
                        {selectedBoutique?.logo ? (
                          <SafeImage
                            src={selectedBoutique.logo}
                            alt={selectedBoutique.nom}
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
                          <div className="bg-white rounded-circle p-3 me-3">
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className="text-success fs-3"
                            />
                          </div>
                        )}
                        <div>
                          <h5 className="fw-bold mb-1">
                            {selectedBoutique?.nom || nouvelleBoutiqueNom}
                            {!selectedBoutique && nouvelleBoutiqueNom && (
                              <span className="badge bg-info ms-2">
                                Nouvelle boutique
                              </span>
                            )}
                          </h5>
                          {selectedBoutique && (
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge bg-light text-dark">
                                {selectedBoutique.type_boutique?.libelle ||
                                  "Boutique"}
                              </span>
                            </div>
                          )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (step === 2) return renderVenteStep2();
  if (step === 3) return renderVenteStep3();
  return null;
};

export default VenteForm;
