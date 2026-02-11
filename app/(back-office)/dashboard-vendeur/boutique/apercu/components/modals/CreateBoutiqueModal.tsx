"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheck,
  faSpinner,
  faTimes,
  faImage,
  faStore,
  faFileAlt,
  faClipboardCheck,
  faInfoCircle,
  faShoppingBag,
  faBox,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

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

interface CreateBoutiqueModalProps {
  show: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
}

const CreateBoutiqueModal = ({
  show,
  loading,
  onClose,
  onCreate,
}: CreateBoutiqueModalProps) => {
  const [formData, setFormData] = useState({
    nom: "",
    type_boutique_uuid: "",
    description: "",
    logo: null as File | null,
    banniere: null as File | null,
    politique_retour: "",
    conditions_utilisation: "",
  });

  const [typesBoutique, setTypesBoutique] = useState<TypeBoutique[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannierePreview, setBannierePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banniere",
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          [type]: "L'image ne doit pas dépasser 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          [type]: "Veuillez sélectionner une image valide",
        });
        return;
      }

      setErrors({ ...errors, [type]: "" });

      if (type === "logo") {
        setFormData({ ...formData, logo: file });
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setFormData({ ...formData, banniere: file });
        setBannierePreview(URL.createObjectURL(file));
      }
    }
  };

  const fetchTypesBoutique = async () => {
    try {
      setLoadingTypes(true);
      setErrors({ ...errors, types: "" });

      // Sans type générique pour plus de flexibilité
      const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.LIST);

      console.log("📦 Réponse types boutique:", response);

      let typesData: TypeBoutique[] = [];

      // Cas 1: Réponse est directement un tableau
      if (Array.isArray(response)) {
        typesData = response;
      }
      // Cas 2: Réponse est un objet avec propriété data (qui peut être un tableau ou objet)
      else if (response && typeof response === "object" && "data" in response) {
        const data = response.data;

        // Si data est un tableau
        if (Array.isArray(data)) {
          typesData = data;
        }
        // Si data est un objet qui contient un tableau
        else if (data && typeof data === "object") {
          // Chercher une propriété qui est un tableau
          const arrayKey = Object.keys(data).find((key) =>
            Array.isArray(data[key]),
          );
          if (arrayKey && data[arrayKey]) {
            typesData = data[arrayKey];
          }
        }
      }
      // Cas 3: Réponse est un objet (chercher un tableau dans l'objet)
      else if (response && typeof response === "object") {
        // Chercher la première propriété qui est un tableau
        const arrayKey = Object.keys(response).find((key) =>
          Array.isArray(response[key]),
        );
        if (arrayKey && response[arrayKey]) {
          typesData = response[arrayKey];
        }
      }

      // Valider que tous les éléments sont bien du bon type
      typesData = typesData.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          "uuid" in item &&
          "libelle" in item,
      );

      if (typesData.length === 0) {
        console.warn("⚠️ Aucun type de boutique trouvé ou format invalide");
        setTypesBoutique([]);
      } else {
        console.log(`✅ ${typesData.length} type(s) de boutique chargé(s)`);
        setTypesBoutique(typesData);
      }
    } catch (error: any) {
      console.error("❌ Erreur chargement types boutique:", error);
      setErrors({
        types:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors du chargement des types de boutique",
      });
      setTypesBoutique([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchTypesBoutique();
      setErrors({});
    }
  }, [show]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de la boutique est requis";
    } else if (formData.nom.length < 3) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.type_boutique_uuid) {
      newErrors.type = "Veuillez sélectionner un type de boutique";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description =
        "La description ne doit pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onCreate(formData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      type_boutique_uuid: "",
      description: "",
      logo: null,
      banniere: null,
      politique_retour: "",
      conditions_utilisation: "",
    });
    setLogoPreview(null);
    setBannierePreview(null);
    setErrors({});
  };

  const removeImage = (type: "logo" | "banniere") => {
    if (type === "logo") {
      setFormData({ ...formData, logo: null });
      setLogoPreview(null);
    } else {
      setFormData({ ...formData, banniere: null });
      setBannierePreview(null);
    }
    setErrors({ ...errors, [type]: "" });
  };

  const getTypeIcon = (type: TypeBoutique) => {
    if (type.code.includes("electronique")) return faShoppingBag;
    if (type.code.includes("test")) return faBox;
    return faTag;
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          <div
            className="modal-header border-0 text-white position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            <div className="position-absolute top-0 end-0 bottom-0 start-0 opacity-10">
              <FontAwesomeIcon
                icon={faStore}
                className="position-absolute"
                style={{ background: colors.oskar.green }}
              />
            </div>
            <div className="position-relative z-1">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                  <FontAwesomeIcon icon={faPlus} className="fs-5" />
                </div>
                <span>Créer une nouvelle boutique</span>
              </h5>
              <p className="mb-0 text-white text-opacity-90 small">
                Remplissez les informations pour créer votre boutique
              </p>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white position-relative z-1"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
            ></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body p-0">
            <div className="p-4 border-bottom">
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} />
                Informations principales
              </h6>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nom de la boutique <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faStore} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ${errors.nom ? "is-invalid" : ""}`}
                      placeholder="Ex: Ma Boutique Élégante"
                      value={formData.nom}
                      onChange={(e) => {
                        setFormData({ ...formData, nom: e.target.value });
                        if (errors.nom) setErrors({ ...errors, nom: "" });
                      }}
                      required
                      disabled={loading}
                      maxLength={100}
                    />
                  </div>
                  {errors.nom && (
                    <div className="invalid-feedback d-block">{errors.nom}</div>
                  )}
                  <small className="text-muted">
                    Le nom qui apparaîtra publiquement (3-100 caractères)
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Type de boutique <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faTag} className="text-muted" />
                    </span>
                    <select
                      className={`form-select border-start-0 ${errors.type ? "is-invalid" : ""}`}
                      value={formData.type_boutique_uuid}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          type_boutique_uuid: e.target.value,
                        });
                        if (errors.type) setErrors({ ...errors, type: "" });
                      }}
                      required
                      disabled={loading || loadingTypes}
                    >
                      <option value="">Sélectionner un type...</option>
                      {loadingTypes ? (
                        <option value="" disabled>
                          Chargement des types...
                        </option>
                      ) : typesBoutique.length > 0 ? (
                        typesBoutique.map((type) => (
                          <option key={type.uuid} value={type.uuid}>
                            {type.libelle}
                            {type.description && ` - ${type.description}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Aucun type disponible
                        </option>
                      )}
                    </select>
                  </div>
                  {loadingTypes && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="text-success"
                        />
                        <small className="text-success">
                          Chargement des types de boutique...
                        </small>
                      </div>
                    </div>
                  )}
                  {errors.types && (
                    <div className="alert alert-warning mt-2 py-2">
                      <small>{errors.types}</small>
                    </div>
                  )}
                  {errors.type && (
                    <div className="invalid-feedback d-block">
                      {errors.type}
                    </div>
                  )}
                  {typesBoutique.length > 0 && !loadingTypes && (
                    <small className="text-muted d-block mt-1">
                      {typesBoutique.length} type(s) disponible(s)
                    </small>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light align-items-start border-end-0 pt-3">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="text-muted"
                      />
                    </span>
                    <textarea
                      className={`form-control border-start-0 ${errors.description ? "is-invalid" : ""}`}
                      rows={3}
                      placeholder="Décrivez votre boutique, vos produits, vos valeurs..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        });
                        if (errors.description)
                          setErrors({ ...errors, description: "" });
                      }}
                      disabled={loading}
                      maxLength={500}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Décrivez ce qui rend votre boutique unique
                    </small>
                    <small
                      className={`${formData.description.length > 450 ? "text-warning" : "text-muted"}`}
                    >
                      {formData.description.length}/500 caractères
                    </small>
                  </div>
                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-bottom">
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faImage} />
                Images
              </h6>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body d-flex flex-column">
                      <label className="form-label fw-semibold mb-3">
                        Logo
                        <span className="text-muted fw-normal ms-1">
                          (Recommandé)
                        </span>
                      </label>

                      <div className="mb-3">
                        <div
                          className={`file-upload-area ${errors.logo ? "border-danger" : "border-dashed"} rounded-3 p-4 text-center`}
                          style={{
                            border: "2px dashed #dee2e6",
                            backgroundColor: logoPreview
                              ? "transparent"
                              : "#f8f9fa",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {logoPreview ? (
                            <div className="position-relative">
                              <img
                                src={logoPreview}
                                alt="Aperçu logo"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: "150px" }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                onClick={() => removeImage("logo")}
                                title="Supprimer l'image"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="mb-3">
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="fs-1 text-muted mb-2"
                                />
                                <p className="mb-1">
                                  Glissez-déposez ou cliquez pour uploader
                                </p>
                                <small className="text-muted">
                                  PNG, JPG, JPEG (max. 5MB)
                                </small>
                              </div>
                              <input
                                type="file"
                                className="form-control d-none"
                                id="logo-upload"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "logo")}
                                disabled={loading}
                              />
                              <label
                                htmlFor="logo-upload"
                                className="btn btn-outline-success btn-sm"
                                style={{
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                              >
                                Choisir un logo
                              </label>
                            </>
                          )}
                        </div>
                        {errors.logo && (
                          <div className="invalid-feedback d-block mt-2">
                            {errors.logo}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <small className="text-muted d-block">
                          <strong>Recommandations :</strong>
                        </small>
                        <small className="text-muted">
                          • Format carré (1:1)
                        </small>
                        <br />
                        <small className="text-muted">
                          • Taille minimale : 200×200px
                        </small>
                        <br />
                        <small className="text-muted">
                          • Fond transparent préférable
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body d-flex flex-column">
                      <label className="form-label fw-semibold mb-3">
                        Bannière
                        <span className="text-muted fw-normal ms-1">
                          (Optionnel)
                        </span>
                      </label>

                      <div className="mb-3">
                        <div
                          className={`file-upload-area ${errors.banniere ? "border-danger" : "border-dashed"} rounded-3 p-4 text-center`}
                          style={{
                            border: "2px dashed #dee2e6",
                            backgroundColor: bannierePreview
                              ? "transparent"
                              : "#f8f9fa",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {bannierePreview ? (
                            <div className="position-relative">
                              <img
                                src={bannierePreview}
                                alt="Aperçu bannière"
                                className="img-fluid rounded shadow-sm"
                                style={{
                                  maxHeight: "150px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                onClick={() => removeImage("banniere")}
                                title="Supprimer l'image"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="mb-3">
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="fs-1 text-muted mb-2"
                                />
                                <p className="mb-1">
                                  Glissez-déposez ou cliquez pour uploader
                                </p>
                                <small className="text-muted">
                                  PNG, JPG, JPEG (max. 5MB)
                                </small>
                              </div>
                              <input
                                type="file"
                                className="form-control d-none"
                                id="banniere-upload"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(e, "banniere")
                                }
                                disabled={loading}
                              />
                              <label
                                htmlFor="banniere-upload"
                                className="btn btn-outline-success btn-sm"
                                style={{
                                  cursor: loading ? "not-allowed" : "pointer",
                                }}
                              >
                                Choisir une bannière
                              </label>
                            </>
                          )}
                        </div>
                        {errors.banniere && (
                          <div className="invalid-feedback d-block mt-2">
                            {errors.banniere}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <small className="text-muted d-block">
                          <strong>Recommandations :</strong>
                        </small>
                        <small className="text-muted">
                          • Format paysage (16:9)
                        </small>
                        <br />
                        <small className="text-muted">
                          • Taille recommandée : 1200×400px
                        </small>
                        <br />
                        <small className="text-muted">
                          • Image haute qualité
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faClipboardCheck} />
                Conditions et politiques
              </h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Politique de retour
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Décrivez votre politique de retour et d'échange..."
                    value={formData.politique_retour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        politique_retour: e.target.value,
                      })
                    }
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Informez vos clients sur les retours et échanges
                    </small>
                    <small className="text-muted">
                      {formData.politique_retour.length}/1000 caractères
                    </small>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Conditions d'utilisation
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Décrivez les conditions générales d'utilisation..."
                    value={formData.conditions_utilisation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditions_utilisation: e.target.value,
                      })
                    }
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Définissez les règles d'utilisation de votre boutique
                    </small>
                    <small className="text-muted">
                      {formData.conditions_utilisation.length}/1000 caractères
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="modal-footer border-0 bg-light rounded-bottom-3">
            <button
              type="button"
              className="btn btn-lg btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleClose}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-lg btn-success d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={loading || loadingTypes || typesBoutique.length === 0}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Création en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  Créer la boutique
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .file-upload-area {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .file-upload-area:hover {
          border-color: #10b981 !important;
          background-color: rgba(16, 185, 129, 0.05) !important;
        }

        .border-dashed {
          border-style: dashed !important;
        }

        .modal-content {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 0.25rem rgba(16, 185, 129, 0.25);
        }

        .card {
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
        }

        .text-success {
          color: #059669 !important;
        }

        .btn-outline-success {
          color: #059669;
          border-color: #059669;
        }

        .btn-outline-success:hover {
          background-color: #059669;
          border-color: #059669;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CreateBoutiqueModal;
