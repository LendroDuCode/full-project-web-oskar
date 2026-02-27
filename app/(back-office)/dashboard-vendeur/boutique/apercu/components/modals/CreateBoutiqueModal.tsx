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
  faExclamationTriangle,
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
  vendeurData?: any; // ✅ Données du vendeur pour le workflow après connexion
}

const CreateBoutiqueModal = ({
  show,
  loading,
  onClose,
  onCreate,
  vendeurData, // ✅ Nouvelle prop
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
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ Nettoyage des previews à la fermeture
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannierePreview) URL.revokeObjectURL(bannierePreview);
    };
  }, [logoPreview, bannierePreview]);

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
      setApiError(null);

      if (type === "logo") {
        // ✅ Nettoyer l'ancienne preview
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setFormData({ ...formData, logo: file });
        setLogoPreview(URL.createObjectURL(file));
      } else {
        if (bannierePreview) URL.revokeObjectURL(bannierePreview);
        setFormData({ ...formData, banniere: file });
        setBannierePreview(URL.createObjectURL(file));
      }
    }
  };

  const fetchTypesBoutique = async () => {
    try {
      setLoadingTypes(true);
      setErrors({ ...errors, types: "" });
      setApiError(null);

      console.log("📦 Chargement des types de boutique...");
      const response = await api.get(API_ENDPOINTS.TYPES_BOUTIQUE.LIST);

      console.log("📦 Réponse types boutique:", response);

      let typesData: TypeBoutique[] = [];

      // ✅ Extraction robuste des données
      if (Array.isArray(response)) {
        typesData = response;
      } else if (response && typeof response === "object") {
        if ("data" in response && Array.isArray(response.data)) {
          typesData = response.data;
        } else {
          // Chercher le premier tableau dans l'objet
          const arrayKey = Object.keys(response).find((key) =>
            Array.isArray(response[key]),
          );
          if (arrayKey && response[arrayKey]) {
            typesData = response[arrayKey];
          }
        }
      }

      // ✅ Filtrer les entrées valides
      typesData = typesData.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          "uuid" in item &&
          "libelle" in item &&
          "code" in item,
      );

      if (typesData.length === 0) {
        console.warn("⚠️ Aucun type de boutique trouvé ou format invalide");
        setTypesBoutique([]);
        setErrors({
          types: "Aucun type de boutique disponible pour le moment",
        });
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
      setApiError(null);
    } else {
      // ✅ Réinitialiser quand le modal se ferme
      resetForm();
    }
  }, [show]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de la boutique est requis";
    } else if (formData.nom.length < 3) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.nom.length > 100) {
      newErrors.nom = "Le nom ne doit pas dépasser 100 caractères";
    }

    if (!formData.type_boutique_uuid) {
      newErrors.type = "Veuillez sélectionner un type de boutique";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description =
        "La description ne doit pas dépasser 500 caractères";
    }

    if (formData.politique_retour && formData.politique_retour.length > 1000) {
      newErrors.politique_retour =
        "La politique de retour ne doit pas dépasser 1000 caractères";
    }

    if (
      formData.conditions_utilisation &&
      formData.conditions_utilisation.length > 1000
    ) {
      newErrors.conditions_utilisation =
        "Les conditions d'utilisation ne doivent pas dépasser 1000 caractères";
    }

    setErrors(newErrors);
    setApiError(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // ✅ Préparer les données pour l'API
      const submitData = new FormData();
      submitData.append("nom", formData.nom);
      submitData.append("type_boutique_uuid", formData.type_boutique_uuid);
      if (formData.description) {
        submitData.append("description", formData.description);
      }
      if (formData.politique_retour) {
        submitData.append("politique_retour", formData.politique_retour);
      }
      if (formData.conditions_utilisation) {
        submitData.append(
          "conditions_utilisation",
          formData.conditions_utilisation,
        );
      }
      if (formData.logo) {
        submitData.append("logo", formData.logo);
      }
      if (formData.banniere) {
        submitData.append("banniere", formData.banniere);
      }

      // ✅ Ajouter l'UUID du vendeur si disponible
      if (vendeurData?.vendeurId) {
        submitData.append("vendeur_uuid", vendeurData.vendeurId);
      }

      await onCreate(submitData);
      // ✅ La fermeture et le reset seront gérés par le parent après succès
    } catch (error: any) {
      console.error("Erreur dans handleSubmit:", error);
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Une erreur est survenue lors de la création",
      );
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    // ✅ Nettoyer les previews
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    if (bannierePreview) URL.revokeObjectURL(bannierePreview);

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
    setApiError(null);
  };

  const removeImage = (type: "logo" | "banniere") => {
    if (type === "logo") {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setFormData({ ...formData, logo: null });
      setLogoPreview(null);
    } else {
      if (bannierePreview) URL.revokeObjectURL(bannierePreview);
      setFormData({ ...formData, banniere: null });
      setBannierePreview(null);
    }
    setErrors({ ...errors, [type]: "" });
    setApiError(null);
  };

  const getTypeIcon = (type: TypeBoutique) => {
    if (type.code.includes("electronique")) return faShoppingBag;
    if (type.code.includes("test")) return faBox;
    return faTag;
  };

  const getTypeDescription = (type: TypeBoutique) => {
    if (type.description) return type.description;
    if (type.peut_vendre_produits && type.peut_vendre_biens) {
      return "Peut vendre produits et biens";
    }
    if (type.peut_vendre_produits) return "Peut vendre des produits";
    if (type.peut_vendre_biens) return "Peut vendre des biens";
    return "";
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 20000 }} // ✅ Z-index très élevé
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg overflow-hidden">
          <div
            className="modal-header border-0 text-white position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", // ✅ Bleu pour les vendeurs
              padding: "1.5rem 2rem",
            }}
          >
            <div className="position-absolute top-0 end-0 bottom-0 start-0 opacity-10">
              <FontAwesomeIcon
                icon={faStore}
                className="position-absolute"
                style={{ fontSize: "8rem", right: "-1rem", bottom: "-2rem" }}
              />
            </div>
            <div className="position-relative z-1">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-3 mb-2">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                  <FontAwesomeIcon icon={faPlus} className="fs-5" />
                </div>
                <span>Créer votre boutique</span>
              </h5>
              <p className="mb-0 text-white text-opacity-90 small ps-5">
                {vendeurData?.firstName
                  ? `Bonjour ${vendeurData.firstName}, `
                  : ""}
                configurez votre boutique pour commencer à vendre
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
            {/* Message d'erreur API */}
            {apiError && (
              <div
                className="alert alert-danger border-0 mx-4 mt-4 mb-0 d-flex align-items-center"
                role="alert"
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-3 fs-4"
                />
                <div>
                  <strong className="d-block">
                    Erreur lors de la création
                  </strong>
                  <span>{apiError}</span>
                </div>
                <button
                  type="button"
                  className="btn-close ms-auto"
                  onClick={() => setApiError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            <div className="p-4 border-bottom">
              <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
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
                        setApiError(null);
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
                        setApiError(null);
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
                          className="text-primary"
                        />
                        <small className="text-primary">
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
                        setApiError(null);
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
              <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
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
                                className="btn btn-outline-primary btn-sm"
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
                                className="btn btn-outline-primary btn-sm"
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
              <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faClipboardCheck} />
                Conditions et politiques
              </h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Politique de retour
                  </label>
                  <textarea
                    className={`form-control ${errors.politique_retour ? "is-invalid" : ""}`}
                    rows={3}
                    placeholder="Décrivez votre politique de retour et d'échange..."
                    value={formData.politique_retour}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        politique_retour: e.target.value,
                      });
                      if (errors.politique_retour)
                        setErrors({ ...errors, politique_retour: "" });
                      setApiError(null);
                    }}
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Informez vos clients sur les retours et échanges
                    </small>
                    <small
                      className={`${formData.politique_retour.length > 900 ? "text-warning" : "text-muted"}`}
                    >
                      {formData.politique_retour.length}/1000 caractères
                    </small>
                  </div>
                  {errors.politique_retour && (
                    <div className="invalid-feedback d-block">
                      {errors.politique_retour}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Conditions d'utilisation
                  </label>
                  <textarea
                    className={`form-control ${errors.conditions_utilisation ? "is-invalid" : ""}`}
                    rows={3}
                    placeholder="Décrivez les conditions générales d'utilisation..."
                    value={formData.conditions_utilisation}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        conditions_utilisation: e.target.value,
                      });
                      if (errors.conditions_utilisation)
                        setErrors({ ...errors, conditions_utilisation: "" });
                      setApiError(null);
                    }}
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Définissez les règles d'utilisation de votre boutique
                    </small>
                    <small
                      className={`${formData.conditions_utilisation.length > 900 ? "text-warning" : "text-muted"}`}
                    >
                      {formData.conditions_utilisation.length}/1000 caractères
                    </small>
                  </div>
                  {errors.conditions_utilisation && (
                    <div className="invalid-feedback d-block">
                      {errors.conditions_utilisation}
                    </div>
                  )}
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
              className="btn btn-lg btn-primary d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={loading || loadingTypes || typesBoutique.length === 0}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                border: "none",
              }}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
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
          border-color: #0ea5e9 !important;
          background-color: rgba(14, 165, 233, 0.05) !important;
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
          border-color: #0ea5e9;
          box-shadow: 0 0 0 0.25rem rgba(14, 165, 233, 0.25);
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

        .text-primary {
          color: #0284c7 !important;
        }

        .btn-outline-primary {
          color: #0284c7;
          border-color: #0284c7;
        }

        .btn-outline-primary:hover {
          background-color: #0284c7;
          border-color: #0284c7;
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CreateBoutiqueModal;
