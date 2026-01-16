// components/PublishAdModal/VenteForm.tsx

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
  faSpinner,
  faExclamationCircle,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client"; // Assure-toi que ce client existe
import { Category, VenteData } from "./constantes/types";

interface VenteFormProps {
  venteData: VenteData;
  conditions: { value: string; label: string }[];
  imagePreview: string | null;
  onChange: (newData: VenteData) => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
}

const VenteForm: React.FC<VenteFormProps> = ({
  venteData,
  conditions,
  imagePreview,
  onChange,
  onImageUpload,
  onRemoveImage,
  step,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setVenteData = (newData: VenteData) => onChange(newData);

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
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
                  Description détaillée
                </label>
                <textarea
                  className="form-control border-light"
                  rows={4}
                  placeholder="Décrivez votre produit en détail..."
                  value={venteData.description}
                  onChange={(e) =>
                    setVenteData({ ...venteData, description: e.target.value })
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
                  État du produit
                </label>
                <select
                  className="form-select border-light"
                  value={venteData.condition}
                  onChange={(e) =>
                    setVenteData({ ...venteData, condition: e.target.value })
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
                  En vente
                </div>
              </div>
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
                  Votre produit sera visible par tous les acheteurs.
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
