"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faTag,
  faAlignLeft,
  faMapMarkerAlt,
  faBox,
  faUser,
  faCamera,
  faImage,
  faInfoCircle,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
  faPhone,
  faGlobe,
  faList,
  faHome,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { Category, DonData, ConditionOption } from "./constantes/types";

interface DonFormProps {
  donData: DonData;
  conditions: ConditionOption[];
  imagePreview: string | null;
  onChange: (newData: DonData) => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
}

const DonForm: React.FC<DonFormProps> = ({
  donData,
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const setDonData = (newData: DonData) => onChange(newData);

  // Charger les catégories au montage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);

        let categoriesData = [];
        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response?.success && Array.isArray(response.data)) {
          categoriesData = response.data;
        }

        const formattedCategories: Category[] = categoriesData.map(
          (item: any) => ({
            label: item.libelle || item.nom || item.type || "Sans nom",
            value: item.uuid,
            uuid: item.uuid,
            icon: faList,
          }),
        );

        setCategories(formattedCategories);
      } catch (err: any) {
        console.error("Erreur chargement catégories:", err);
        setError("Impossible de charger les catégories. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Validation des champs requis pour l'étape 2
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!donData.titre?.trim()) errors.titre = "Le titre est requis";
    if (!donData.type_don?.trim())
      errors.type_don = "Le type de don est requis";
    if (!donData.localisation?.trim())
      errors.localisation = "La localisation est requise";
    if (!donData.description?.trim())
      errors.description = "La description est requise";
    if (!donData.lieu_retrait?.trim())
      errors.lieu_retrait = "Le lieu de retrait est requis";
    if (!donData.categorie_uuid)
      errors.categorie_uuid = "La catégorie est requise";
    if (!donData.numero?.trim())
      errors.numero = "Le numéro de contact est requis";
    if (!donData.nom_donataire?.trim())
      errors.nom_donataire = "Le nom du donataire est requis";
    if (!donData.quantite || parseInt(donData.quantite) < 1)
      errors.quantite = "La quantité doit être supérieure à 0";
    if (!imagePreview) errors.image = "Une photo est requise";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Exposer la fonction de validation au parent
  useEffect(() => {
    if (step === 2) {
      // On peut stocker la fonction de validation dans une ref ou utiliser un contexte
      // Pour l'instant, on va simplement logger
      console.log("Validation disponible pour l'étape 2");
    }
  }, [step, donData, imagePreview]);

  const handleInputChange = (field: keyof DonData, value: any) => {
    setDonData({ ...donData, [field]: value });
    // Effacer l'erreur pour ce champ
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field as string];
      setFormErrors(newErrors);
    }
  };

  const renderDonStep2 = () => (
    <div className="p-4">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon icon={faGift} className="text-warning fs-3" />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">Informations principales</h3>
          <p className="text-muted mb-0">Remplissez les détails de votre don</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning border-0 mb-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
        </div>
      )}

      {/* Résumé des erreurs */}
      {Object.keys(formErrors).length > 0 && (
        <div className="alert alert-danger border-0 mb-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          Veuillez corriger les erreurs suivantes :
          <ul className="mb-0 mt-2">
            {Object.values(formErrors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="text-warning me-2"
                />
                Description du don
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                  Titre du don *
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg border-light ${formErrors.titre ? "is-invalid" : ""}`}
                  placeholder="Ex: Livres, Vêtements, Meubles..."
                  value={donData.titre}
                  onChange={(e) => handleInputChange("titre", e.target.value)}
                  required
                />
                {formErrors.titre && (
                  <div className="invalid-feedback">{formErrors.titre}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon icon={faTag} className="me-2 text-warning" />
                  Type de don *
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg border-light ${formErrors.type_don ? "is-invalid" : ""}`}
                  placeholder="Ex: Alimentaire, Vestimentaire, Matériel..."
                  value={donData.type_don}
                  onChange={(e) =>
                    handleInputChange("type_don", e.target.value)
                  }
                  required
                />
                {formErrors.type_don && (
                  <div className="invalid-feedback">{formErrors.type_don}</div>
                )}
                <small className="text-muted">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                  Précisez le type d'article que vous donnez
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faGlobe}
                    className="me-2 text-warning"
                  />
                  Localisation *
                </label>
                <input
                  type="text"
                  className={`form-control border-light ${formErrors.localisation ? "is-invalid" : ""}`}
                  placeholder="Ex: Abidjan, Cocody"
                  value={donData.localisation}
                  onChange={(e) =>
                    handleInputChange("localisation", e.target.value)
                  }
                  required
                />
                {formErrors.localisation && (
                  <div className="invalid-feedback">
                    {formErrors.localisation}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faAlignLeft}
                    className="me-2 text-warning"
                  />
                  Description détaillée *
                </label>
                <textarea
                  className={`form-control border-light ${formErrors.description ? "is-invalid" : ""}`}
                  rows={4}
                  placeholder="Décrivez ce que vous donnez (état, caractéristiques, etc.)..."
                  value={donData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
                {formErrors.description && (
                  <div className="invalid-feedback">
                    {formErrors.description}
                  </div>
                )}
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-warning"
                      />
                      Lieu de retrait *
                    </label>
                    <input
                      type="text"
                      className={`form-control border-light ${formErrors.lieu_retrait ? "is-invalid" : ""}`}
                      placeholder="Ex: Centre jeunesse Abobo Baoulé"
                      value={donData.lieu_retrait}
                      onChange={(e) =>
                        handleInputChange("lieu_retrait", e.target.value)
                      }
                      required
                    />
                    {formErrors.lieu_retrait && (
                      <div className="invalid-feedback">
                        {formErrors.lieu_retrait}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="me-2 text-warning"
                      />
                      Quantité *
                    </label>
                    <input
                      type="number"
                      className={`form-control border-light ${formErrors.quantite ? "is-invalid" : ""}`}
                      value={donData.quantite}
                      onChange={(e) =>
                        handleInputChange("quantite", e.target.value)
                      }
                      min="1"
                      required
                    />
                    {formErrors.quantite && (
                      <div className="invalid-feedback">
                        {formErrors.quantite}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon icon={faUser} className="text-warning me-2" />
                Informations personnelles
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Nom du donataire *
                    </label>
                    <input
                      type="text"
                      className={`form-control border-light ${formErrors.nom_donataire ? "is-invalid" : ""}`}
                      placeholder="Votre nom ou organisation"
                      value={donData.nom_donataire}
                      onChange={(e) =>
                        handleInputChange("nom_donataire", e.target.value)
                      }
                      required
                    />
                    {formErrors.nom_donataire && (
                      <div className="invalid-feedback">
                        {formErrors.nom_donataire}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Numéro de contact *
                    </label>
                    <input
                      type="tel"
                      className={`form-control border-light ${formErrors.numero ? "is-invalid" : ""}`}
                      placeholder="Ex: 0700000000"
                      value={donData.numero}
                      onChange={(e) =>
                        handleInputChange("numero", e.target.value)
                      }
                      required
                    />
                    {formErrors.numero && (
                      <div className="invalid-feedback">
                        {formErrors.numero}
                      </div>
                    )}
                    <small className="text-muted">
                      <FontAwesomeIcon icon={faPhone} className="me-1" />
                      Format: 0700000000
                    </small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      État du produit
                    </label>
                    <select
                      className="form-select border-light"
                      value={donData.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                    >
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Disponibilité
                    </label>
                    <select
                      className="form-select border-light"
                      value={donData.disponibilite}
                      onChange={(e) =>
                        handleInputChange("disponibilite", e.target.value)
                      }
                    >
                      <option value="immediate">Immédiate</option>
                      <option value="semaine">Cette semaine</option>
                      <option value="mois">Ce mois-ci</option>
                    </select>
                  </div>
                </div>
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
                  className="text-warning me-2"
                />
                Photo & Catégorie
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Photo du don *</label>
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
                  <div
                    className={`text-center border-dashed border-2 rounded-3 p-5 mb-3 bg-light bg-opacity-25 ${formErrors.image ? "border-danger" : "border-light"}`}
                  >
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="text-muted small mb-0">
                      Ajoutez une photo claire
                    </p>
                    {formErrors.image && (
                      <p className="text-danger small mt-2">
                        {formErrors.image}
                      </p>
                    )}
                  </div>
                )}
                <div className="d-grid">
                  <label className="btn btn-outline-warning btn-lg">
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
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Chargement...
                  </div>
                ) : error ? (
                  <div className="text-danger small">Erreur de chargement</div>
                ) : (
                  <>
                    <select
                      className={`form-select border-light ${formErrors.categorie_uuid ? "is-invalid" : ""}`}
                      value={donData.categorie_uuid}
                      onChange={(e) =>
                        handleInputChange("categorie_uuid", e.target.value)
                      }
                      required
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.uuid} value={category.uuid}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.categorie_uuid && (
                      <div className="invalid-feedback">
                        {formErrors.categorie_uuid}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="alert alert-warning border-0">
                <small className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Une photo claire augmente les chances que votre don trouve
                  preneur
                </small>
              </div>

              <div className="alert alert-info border-0 mt-3">
                <h6 className="fw-bold mb-2">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Conseils
                </h6>
                <ul className="small mb-0 ps-3">
                  <li>Soyez précis dans la description</li>
                  <li>Indiquez un lieu de retrait exact</li>
                  <li>Restez disponible pour répondre aux questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDonStep3 = () => {
    // Trouver la catégorie sélectionnée
    const selectedCategory = categories.find(
      (c) => c.uuid === donData.categorie_uuid,
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
          <h3 className="fw-bold text-dark mb-2">Récapitulatif du don</h3>
          <p className="text-muted">
            Vérifiez les informations avant publication
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">
                  Détails du don
                </h5>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Titre</p>
                    <p className="fw-bold text-dark">
                      {donData.titre || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Type de don</p>
                    <p className="fw-bold text-dark">
                      {donData.type_don || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Catégorie</p>
                    <p className="fw-bold text-dark">
                      {selectedCategory?.label || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Quantité</p>
                    <p className="fw-bold text-dark">{donData.quantite}</p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">État</p>
                    <p className="fw-bold text-dark">
                      {conditions.find((c) => c.value === donData.condition)
                        ?.label || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Localisation</p>
                    <p className="fw-bold text-dark">
                      {donData.localisation || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Lieu de retrait</p>
                    <p className="fw-bold text-dark">
                      {donData.lieu_retrait || "Non renseigné"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <p className="text-muted mb-1">Disponibilité</p>
                    <p className="fw-bold text-dark">
                      {donData.disponibilite === "immediate"
                        ? "Immédiate"
                        : donData.disponibilite === "semaine"
                          ? "Cette semaine"
                          : "Ce mois-ci"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-muted mb-2">Description</p>
                  <div className="bg-light rounded p-3">
                    <p className="mb-0">
                      {donData.description || "Aucune description"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="fw-bold text-dark mb-3">
                    Informations de contact
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Nom du donataire</p>
                      <p className="fw-bold text-dark">
                        {donData.nom_donataire || "Non renseigné"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-1">Numéro de contact</p>
                      <p className="fw-bold text-dark">
                        {donData.numero || "Non renseigné"}
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
                <h5 className="fw-bold text-dark mb-4">Photo du don</h5>
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
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Prêt à publier
                  </h6>
                  <p className="small mb-0">
                    Votre don sera visible par toute la communauté dès
                    validation.
                  </p>
                </div>

                <div className="alert alert-info border-0 mt-3">
                  <h6 className="fw-bold mb-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Conseils pour un don réussi
                  </h6>
                  <ul className="small mb-0 ps-3">
                    <li>Répondez rapidement aux demandes</li>
                    <li>Précisez bien le lieu de retrait</li>
                    <li>Soyez disponible pour les échanges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (step === 2) return renderDonStep2();
  if (step === 3) return renderDonStep3();
  return null;
};

export default DonForm;
