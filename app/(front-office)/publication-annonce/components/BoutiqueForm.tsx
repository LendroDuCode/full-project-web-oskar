// components/PublishAdModal/components/BoutiqueCreationForm.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faImage,
  faCamera,
  faFileContract,
  faInfoCircle,
  faBuilding,
  faArrowRight,
  faArrowLeft,
  faCheckCircle,
  faSpinner,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

interface TypeBoutique {
  uuid: string;
  libelle: string;
  description: string;
}

interface BoutiqueCreationFormProps {
  onCreateBoutique: (data: any) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  boutiqueCreated: boolean;
}

const BoutiqueCreationForm: React.FC<BoutiqueCreationFormProps> = ({
  onCreateBoutique,
  loading,
  error,
  onBack,
  boutiqueCreated,
}) => {
  const [typesBoutique, setTypesBoutique] = useState<TypeBoutique[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Données du formulaire
  const [formData, setFormData] = useState({
    type_boutique_uuid: "",
    nom: "",
    description: "",
    logo: null as File | null,
    banniere: null as File | null,
    registre_commerce: null as File | null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannierePreview, setBannierePreview] = useState<string | null>(null);
  const [registrePreview, setRegistrePreview] = useState<string | null>(null);

  // Charger les types de boutique
  useEffect(() => {
    const fetchTypesBoutique = async () => {
      try {
        setLoadingTypes(true);
        const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.LIST);

        let typesData: any[] = [];

        if (Array.isArray(response)) {
          typesData = response;
        } else if (response && Array.isArray(response.data)) {
          typesData = response.data;
        }

        const formatted: TypeBoutique[] = typesData.map((item) => ({
          uuid: item.uuid,
          libelle: item.libelle || item.nom || "Type sans nom",
          description: item.description || "",
        }));

        setTypesBoutique(formatted);
      } catch (err) {
        console.error("Erreur chargement types boutique:", err);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypesBoutique();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "logo" | "banniere" | "registre",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setValidationErrors((prev) => ({
        ...prev,
        [type]: "Le fichier ne doit pas dépasser 5MB",
      }));
      return;
    }

    // Créer la preview
    const preview = URL.createObjectURL(file);
    switch (type) {
      case "logo":
        setLogoPreview(preview);
        break;
      case "banniere":
        setBannierePreview(preview);
        break;
      case "registre":
        setRegistrePreview(preview);
        break;
    }

    handleInputChange(type, file);
  };

  const removeImage = (type: "logo" | "banniere" | "registre") => {
    switch (type) {
      case "logo":
        setLogoPreview(null);
        handleInputChange("logo", null);
        break;
      case "banniere":
        setBannierePreview(null);
        handleInputChange("banniere", null);
        break;
      case "registre":
        setRegistrePreview(null);
        handleInputChange("registre_commerce", null);
        break;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom de la boutique est requis";
    } else if (formData.nom.trim().length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.type_boutique_uuid) {
      errors.type_boutique_uuid = "Le type de boutique est requis";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est requise";
    } else if (formData.description.trim().length < 10) {
      errors.description =
        "La description doit contenir au moins 10 caractères";
    }

    if (!formData.logo) {
      errors.logo = "Le logo est requis pour une boutique professionnelle";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await onCreateBoutique(formData);
  };

  if (boutiqueCreated) {
    return (
      <div className="p-5 text-center">
        <div className="mb-5">
          <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center mb-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success fs-1"
            />
          </div>
          <h2 className="fw-bold text-dark mb-3">
            Boutique créée avec succès !
          </h2>
          <p className="text-muted">
            Votre boutique a été créée. Vous pouvez maintenant ajouter des
            produits.
          </p>
        </div>

        <div className="alert alert-success border-0 mb-4">
          <div className="d-flex align-items-center justify-content-center">
            <FontAwesomeIcon icon={faInfoCircle} className="me-3" />
            <div>
              <h6 className="fw-bold mb-1">Prochaine étape</h6>
              <p className="mb-0">
                Cliquez sur "Continuer" pour ajouter votre premier produit à la
                boutique.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-success px-4 py-3 rounded-pill fw-semibold shadow-sm"
          onClick={() => {
            /* La redirection est gérée par le parent */
          }}
        >
          <FontAwesomeIcon icon={faArrowRight} className="me-2" />
          Ajouter mon premier produit
        </button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
          <FontAwesomeIcon icon={faBuilding} className="text-warning fs-3" />
        </div>
        <div>
          <h3 className="fw-bold text-dark mb-1">Créer votre boutique</h3>
          <p className="text-muted mb-0">
            Configurez votre espace de vente professionnel
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon icon={faStore} className="text-warning me-2" />
                Informations de la boutique
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Nom de la boutique *
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${validationErrors.nom ? "is-invalid" : ""}`}
                  placeholder="Ex: MaBoutik, TechStore, FashionHub"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  required
                />
                {validationErrors.nom && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.nom}
                  </div>
                )}
                <small className="text-muted">
                  Choisissez un nom attractif et facile à retenir
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Type de boutique *
                </label>
                {loadingTypes ? (
                  <div className="text-center py-3 border rounded bg-light">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    <span className="text-muted">Chargement des types...</span>
                  </div>
                ) : (
                  <>
                    <select
                      className={`form-select ${validationErrors.type_boutique_uuid ? "is-invalid" : ""}`}
                      value={formData.type_boutique_uuid}
                      onChange={(e) =>
                        handleInputChange("type_boutique_uuid", e.target.value)
                      }
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      {typesBoutique.map((type) => (
                        <option key={type.uuid} value={type.uuid}>
                          {type.libelle}
                        </option>
                      ))}
                    </select>
                    {validationErrors.type_boutique_uuid && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.type_boutique_uuid}
                      </div>
                    )}
                  </>
                )}
                <small className="text-muted">
                  Choisissez la catégorie qui correspond à vos produits
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Description de la boutique *
                </label>
                <textarea
                  className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                  rows={4}
                  placeholder="Décrivez votre boutique, vos valeurs, vos produits..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
                {validationErrors.description && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.description}
                  </div>
                )}
                <small className="text-muted">
                  Une bonne description aide les clients à vous connaître
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-flex align-items-center">
                  <FontAwesomeIcon icon={faFileContract} className="me-2" />
                  Registre de commerce (facultatif)
                </label>
                <div className="alert alert-info border-0 mb-3">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    <div>
                      <p className="mb-1 fw-semibold">
                        Pourquoi ajouter un registre de commerce ?
                      </p>
                      <p className="mb-0 small">
                        • Augmente la confiance des clients
                        <br />
                        • Accès à des fonctionnalités professionnelles
                        <br />• Meilleure visibilité dans les recherches
                      </p>
                    </div>
                  </div>
                </div>

                {registrePreview ? (
                  <div className="position-relative mb-3">
                    <div className="card border">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faFileContract}
                            className="text-success fs-3 me-3"
                          />
                          <div>
                            <h6 className="mb-1">
                              Registre de commerce téléchargé
                            </h6>
                            <p className="text-muted small mb-0">
                              Document valide pour vérification
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage("registre")}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      style={{ width: "32px", height: "32px" }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center border-dashed border-2 border-light rounded-3 p-4 mb-3 bg-light bg-opacity-25">
                    <FontAwesomeIcon
                      icon={faFileContract}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="text-muted small mb-2">
                      Ajoutez votre registre de commerce (PDF ou image)
                    </p>
                    <p className="text-muted smaller mb-0">
                      Facultatif - Recommandé pour les professionnels
                    </p>
                  </div>
                )}

                <div className="d-grid">
                  <label className="btn btn-outline-info btn-lg">
                    <FontAwesomeIcon icon={faFileContract} className="me-2" />
                    {registrePreview
                      ? "Changer le document"
                      : "Ajouter un registre de commerce"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="d-none"
                      onChange={(e) => handleImageChange(e, "registre")}
                    />
                  </label>
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
                Images de la boutique
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Logo de la boutique *
                </label>
                {validationErrors.logo && (
                  <div className="alert alert-danger border-0 mb-2 py-2">
                    <small>{validationErrors.logo}</small>
                  </div>
                )}
                {logoPreview ? (
                  <div className="position-relative mb-3">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="img-fluid rounded-3 border"
                      style={{
                        maxHeight: "150px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("logo")}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      style={{ width: "32px", height: "32px" }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center border-dashed border-2 border-light rounded-3 p-4 mb-3 bg-light bg-opacity-25">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-muted fs-1 mb-3"
                    />
                    <p className="text-muted small mb-0">
                      Logo carré (recommandé: 500x500px)
                    </p>
                  </div>
                )}
                <div className="d-grid">
                  <label className="btn btn-outline-warning btn-lg">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    {logoPreview ? "Changer le logo" : "Ajouter un logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleImageChange(e, "logo")}
                    />
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Bannière de la boutique (facultatif)
                </label>
                {validationErrors.banniere && (
                  <div className="alert alert-danger border-0 mb-2 py-2">
                    <small>{validationErrors.banniere}</small>
                  </div>
                )}
                {bannierePreview ? (
                  <div className="position-relative mb-3">
                    <img
                      src={bannierePreview}
                      alt="Bannière preview"
                      className="img-fluid rounded-3 border"
                      style={{
                        maxHeight: "100px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("banniere")}
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                      style={{ width: "32px", height: "32px" }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center border-dashed border-2 border-light rounded-3 p-3 mb-3 bg-light bg-opacity-25">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="text-muted fs-4 mb-2"
                    />
                    <p className="text-muted small mb-0">
                      Bannière large (recommandé: 1200x300px)
                    </p>
                  </div>
                )}
                <div className="d-grid">
                  <label className="btn btn-outline-secondary btn-lg">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    {bannierePreview
                      ? "Changer la bannière"
                      : "Ajouter une bannière"}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleImageChange(e, "banniere")}
                    />
                  </label>
                </div>
              </div>

              <div className="alert alert-warning border-0">
                <small className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <span>
                    Un logo professionnel augmente la confiance de vos clients
                  </span>
                </small>
              </div>

              <div className="alert alert-success border-0 mt-3">
                <h6 className="fw-bold mb-2">Avantages de la boutique</h6>
                <ul className="small mb-0 ps-3">
                  <li>Visibilité accrue dans les recherches</li>
                  <li>Page dédiée pour tous vos produits</li>
                  <li>Statut professionnel vérifié</li>
                  <li>Outils de gestion avancés</li>
                  <li>Tableau de bord personnalisé</li>
                  <li>Statistiques détaillées de vos ventes</li>
                </ul>
              </div>
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
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Création en cours...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Créer ma boutique
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BoutiqueCreationForm;
