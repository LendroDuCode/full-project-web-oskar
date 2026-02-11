// components/PublishAdModal/components/ProductCreationForm.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faInfoCircle,
  faMoneyBill,
  faMapMarkerAlt,
  faImage,
  faCamera,
  faTag,
  faBox,
  faStar,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
  faList,
  faShoppingCart,
  faArrowRight,
  faArrowLeft,
  faUser,
  faBriefcase,
  faBuilding,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { VenteData, SaleMode } from "./constantes/types";

interface Category {
  uuid: string;
  label: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  logo: string | null;
  statut: "en_review" | "actif" | "bloque" | "ferme";
  type_boutique: {
    uuid: string;
    libelle: string;
  };
  est_bloque: boolean;
  est_ferme: boolean;
}

interface ProductCreationFormProps {
  venteData: VenteData;
  setVenteData: (data: VenteData) => void;
  conditions: { value: string; label: string }[];
  imagePreview: string | null;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  saleMode: SaleMode;
  boutiqueCreated: boolean;
  createdBoutiqueUuid: string | null;
  onBack: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  loading: boolean;
  isLoggedIn: boolean;
}

const ProductCreationForm: React.FC<ProductCreationFormProps> = ({
  venteData,
  setVenteData,
  conditions,
  imagePreview,
  onImageUpload,
  onRemoveImage,
  saleMode,
  boutiqueCreated,
  createdBoutiqueUuid,
  onBack,
  onSubmit,
  loading,
  isLoggedIn,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBoutiques, setLoadingBoutiques] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceReload, setForceReload] = useState(0);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);

        let categoriesData: any[] = [];

        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response && Array.isArray(response.data)) {
          categoriesData = response.data;
        }

        const formatted: Category[] = categoriesData.map((item) => ({
          label: item.libelle || item.nom || item.type || "Catégorie sans nom",
          value: item.uuid,
          uuid: item.uuid,
        }));

        setCategories(formatted);
      } catch (err: any) {
        console.error("Erreur chargement catégories:", err);
        setError("Impossible de charger les catégories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Charger les boutiques pour les professionnels
  useEffect(() => {
    const fetchBoutiques = async () => {
      if (saleMode !== "professionnel") {
        setLoadingBoutiques(false);
        return;
      }

      try {
        setLoadingBoutiques(true);
        console.log("🛍️ Chargement des boutiques...");

        const response = await api.get(
          API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR,
        );

        let boutiquesData: Boutique[] = [];

        if (Array.isArray(response)) {
          boutiquesData = response;
        } else if (response && Array.isArray(response.data)) {
          boutiquesData = response.data;
        }

        // Filtrer les boutiques actives
        const boutiquesActives = boutiquesData.filter(
          (boutique) =>
            !boutique.est_bloque &&
            !boutique.est_ferme &&
            (boutique.statut === "actif" || boutique.statut === "en_review"),
        );

        console.log(
          `📊 ${boutiquesActives.length} boutique(s) active(s) chargée(s)`,
        );
        setBoutiques(boutiquesActives);

        // Sélectionner automatiquement la boutique créée
        if (createdBoutiqueUuid && boutiqueCreated) {
          const nouvelleBoutique = boutiquesActives.find(
            (b) => b.uuid === createdBoutiqueUuid,
          );
          if (nouvelleBoutique) {
            console.log("🔄 Sélection automatique de la boutique créée");
            setVenteData({ ...venteData, boutiqueUuid: createdBoutiqueUuid });
          }
        } else if (boutiquesActives.length > 0 && !venteData.boutiqueUuid) {
          // Sélectionner la première boutique par défaut
          setVenteData({
            ...venteData,
            boutiqueUuid: boutiquesActives[0].uuid,
          });
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement boutiques:", err);
        setError("Impossible de charger vos boutiques.");
        setBoutiques([]);
      } finally {
        setLoadingBoutiques(false);
      }
    };

    fetchBoutiques();
  }, [saleMode, createdBoutiqueUuid, boutiqueCreated, forceReload]);

  const reloadBoutiques = () => {
    setForceReload((prev) => prev + 1);
  };

  const selectedBoutique = boutiques.find(
    (b) => b.uuid === venteData.boutiqueUuid,
  );

  const getBoutiqueStatusText = (boutique: Boutique): string => {
    if (boutique.est_bloque) return "Bloqué";
    if (boutique.est_ferme) return "Fermé";
    switch (boutique.statut) {
      case "actif":
        return "Actif";
      case "en_review":
        return "En revue";
      default:
        return boutique.statut;
    }
  };

  const getBoutiqueStatusBadge = (boutique: Boutique) => {
    const statusText = getBoutiqueStatusText(boutique);
    if (boutique.est_bloque) {
      return <span className="badge bg-danger">{statusText}</span>;
    }
    if (boutique.est_ferme) {
      return <span className="badge bg-secondary">{statusText}</span>;
    }
    switch (boutique.statut) {
      case "actif":
        return <span className="badge bg-success">{statusText}</span>;
      case "en_review":
        return <span className="badge bg-warning">{statusText}</span>;
      default:
        return <span className="badge bg-secondary">{statusText}</span>;
    }
  };

  const handleSubmitForm = async () => {
    if (!isLoggedIn) {
      setError("Veuillez vous connecter pour publier un produit");
      return;
    }

    await onSubmit(venteData);
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon
            icon={saleMode === "professionnel" ? faBriefcase : faUser}
            className={`text-${saleMode === "professionnel" ? "warning" : "info"} fs-3`}
          />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {saleMode === "professionnel"
              ? "Ajouter un produit"
              : "Vendre un produit"}{" "}
            - {saleMode === "professionnel" ? "Professionnel" : "Particulier"}
          </h3>
          <p className="text-muted mb-0">
            {saleMode === "professionnel"
              ? "Ajoutez un produit à votre boutique"
              : "Décrivez votre produit et fixez votre prix"}
          </p>
        </div>
      </div>

      {boutiqueCreated && createdBoutiqueUuid && (
        <div className="alert alert-success border-0 mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="me-3 fs-4" />
              <div>
                <h6 className="fw-bold mb-1">Boutique créée avec succès !</h6>
                <p className="mb-0">
                  Votre produit sera associé à votre nouvelle boutique.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={reloadBoutiques}
            >
              <FontAwesomeIcon icon={faArrowRight} className="me-1" />
              Actualiser la liste
            </button>
          </div>
        </div>
      )}

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
                    setVenteData({ ...venteData, libelle: e.target.value })
                  }
                  required
                />
              </div>

              {saleMode === "professionnel" && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon
                      icon={faStore}
                      className="me-2 text-warning"
                    />
                    Boutique associée *
                  </label>
                  <div className="position-relative">
                    {loadingBoutiques ? (
                      <div className="text-center py-3 border rounded bg-light">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        <span className="text-muted">
                          Chargement de vos boutiques...
                        </span>
                      </div>
                    ) : boutiques.length === 0 ? (
                      <div className="alert alert-info border-0">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          <div>
                            <p className="mb-1 fw-semibold">
                              Aucune boutique disponible
                            </p>
                            <p className="mb-0 small">
                              {boutiqueCreated
                                ? "Votre boutique vient d'être créée. Veuillez recharger la liste."
                                : "Vous devez créer une boutique pour vendre en tant que professionnel."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <select
                          className="form-select border-light"
                          value={venteData.boutiqueUuid || ""}
                          onChange={(e) =>
                            setVenteData({
                              ...venteData,
                              boutiqueUuid: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Sélectionnez une boutique</option>
                          {boutiques.map((boutique) => (
                            <option key={boutique.uuid} value={boutique.uuid}>
                              🛒 {boutique.nom} •{" "}
                              {getBoutiqueStatusText(boutique)} •{" "}
                              {boutique.type_boutique.libelle}
                            </option>
                          ))}
                        </select>

                        {venteData.boutiqueUuid &&
                          venteData.boutiqueUuid !== "" &&
                          selectedBoutique && (
                            <div className="mt-3">
                              <div className="card border-0 bg-warning bg-opacity-10 p-3">
                                <div className="d-flex align-items-center">
                                  {selectedBoutique.logo ? (
                                    <img
                                      src={selectedBoutique.logo}
                                      alt={selectedBoutique.nom}
                                      className="rounded-circle me-3"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div className="bg-white rounded-circle p-3 me-3">
                                      <FontAwesomeIcon
                                        icon={faStore}
                                        className="text-warning fs-4"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="fw-bold mb-1 d-flex align-items-center">
                                      {selectedBoutique.nom}
                                      <span className="ms-2">
                                        {getBoutiqueStatusBadge(
                                          selectedBoutique,
                                        )}
                                      </span>
                                    </h6>
                                    <p className="text-muted small mb-0">
                                      {selectedBoutique.description ||
                                        "Aucune description"}
                                    </p>
                                    <div className="d-flex gap-2 mt-2">
                                      <small className="badge bg-light text-dark">
                                        {selectedBoutique.type_boutique.libelle}
                                      </small>
                                      <small className="text-muted">
                                        <FontAwesomeIcon
                                          icon={faBuilding}
                                          className="me-1"
                                        />
                                        Vente professionnelle
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </>
                    )}

                    {!loadingBoutiques && boutiques.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <FontAwesomeIcon icon={faStore} className="me-1" />
                            {boutiques.length} boutique(s) disponible(s)
                          </small>
                          <button
                            type="button"
                            className="btn btn-link text-decoration-none small text-warning fw-semibold p-0"
                            onClick={reloadBoutiques}
                          >
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className="me-1"
                            />
                            Actualiser
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                          setVenteData({ ...venteData, prix: e.target.value })
                        }
                        min="0"
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
                        setVenteData({ ...venteData, quantite: e.target.value })
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
                        setVenteData({ ...venteData, type: e.target.value })
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
                          setVenteData({ ...venteData, lieu: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Description détaillée *
                </label>
                <textarea
                  className="form-control border-light"
                  rows={4}
                  placeholder="Décrivez votre produit en détail..."
                  value={venteData.description}
                  onChange={(e) =>
                    setVenteData({ ...venteData, description: e.target.value })
                  }
                  required
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
                  Photo du produit *
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
                {loadingCategories ? (
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
                      setVenteData({
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
                  État du produit *
                </label>
                <select
                  className="form-select border-light"
                  value={venteData.condition}
                  onChange={(e) =>
                    setVenteData({ ...venteData, condition: e.target.value })
                  }
                  required
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Garantie</label>
                <select
                  className="form-select border-light"
                  value={venteData.garantie}
                  onChange={(e) =>
                    setVenteData({ ...venteData, garantie: e.target.value })
                  }
                >
                  <option value="non">Sans garantie</option>
                  <option value="oui">Avec garantie</option>
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

              {saleMode === "professionnel" ? (
                <div className="alert alert-warning border-0 mt-3">
                  <h6 className="fw-bold mb-2">
                    <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                    Vente professionnelle
                  </h6>
                  <p className="small mb-0">
                    Votre produit sera associé à votre boutique et bénéficiera
                    de plus de visibilité.
                  </p>
                </div>
              ) : (
                <div className="alert alert-info border-0 mt-3">
                  <h6 className="fw-bold mb-2">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Vente privée
                  </h6>
                  <p className="small mb-0">
                    En tant que particulier, prenez des photos de qualité et
                    soyez précis sur l'état du produit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5 pt-4 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary px-4 py-3 rounded-pill fw-semibold"
          onClick={onBack}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Retour
        </button>

        <button
          type="button"
          className="btn btn-warning px-4 py-3 rounded-pill fw-semibold shadow-sm"
          onClick={handleSubmitForm}
          disabled={loading || !isLoggedIn}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faEye} className="me-2" />
              Voir le récapitulatif
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCreationForm;
