"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheck,
  faSpinner,
  faTimes,
  faImage,
  faStore,
  faFileAlt,
  faInfoCircle,
  faExclamationTriangle,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

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
  vendeurData?: any;
}

const CreateBoutiqueModal = ({
  show,
  loading,
  onClose,
  onCreate,
  vendeurData,
}: CreateBoutiqueModalProps) => {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    logo: null as File | null,
    banniere: null as File | null,
  });

  const [loadingTypes, setLoadingTypes] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannierePreview, setBannierePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const banniereInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "logo" | "banniere",
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        [type]: "Format non supporté. Utilisez: JPG, PNG ou WebP",
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors({
        ...errors,
        [type]: "L'image ne doit pas dépasser 5MB",
      });
      return;
    }

    setErrors({ ...errors, [type]: "" });
    setApiError(null); // Effacer l'erreur API lors d'une nouvelle action

    if (type === "logo") {
      // Nettoyer l'ancienne preview
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else {
      if (bannierePreview && bannierePreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannierePreview);
      }
      setFormData({ ...formData, banniere: file });
      setBannierePreview(URL.createObjectURL(file));
    }
  };

  // Nettoyer les previews à la fermeture
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannierePreview && bannierePreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannierePreview);
      }
    };
  }, [logoPreview, bannierePreview]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom de la boutique est requis";
    } else if (formData.nom.length < 3) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.nom.length > 100) {
      newErrors.nom = "Le nom ne doit pas dépasser 100 caractères";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description =
        "La description ne doit pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    setApiError(null); // Effacer l'erreur API lors de la validation
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Créer FormData
      const submitData = new FormData();
      submitData.append("nom", formData.nom.trim());

      if (formData.description?.trim()) {
        submitData.append("description", formData.description.trim());
      }
      
      if (formData.logo) {
        submitData.append("logo", formData.logo);
      }
      if (formData.banniere) {
        submitData.append("banniere", formData.banniere);
      }

      if (vendeurData?.vendeurId) {
        submitData.append("vendeur_uuid", vendeurData.vendeurId);
      }

      // Appeler la fonction onCreate du parent
      await onCreate(submitData);

      // La fermeture et le reset sont gérés par le parent après succès
    } catch (error: any) {
      console.error("Erreur dans handleSubmit:", error);
      // L'erreur est déjà gérée dans le parent
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    // Nettoyer les previews
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    if (bannierePreview && bannierePreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannierePreview);
    }

    setFormData({
      nom: "",
      description: "",
      logo: null,
      banniere: null,
    });
    setLogoPreview(null);
    setBannierePreview(null);
    setErrors({});
    setApiError(null);

    // Réinitialiser les inputs file
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    if (banniereInputRef.current) {
      banniereInputRef.current.value = "";
    }
  };

  const removeImage = (type: "logo" | "banniere") => {
    if (type === "logo") {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      setFormData({ ...formData, logo: null });
      setLogoPreview(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    } else {
      if (bannierePreview && bannierePreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannierePreview);
      }
      setFormData({ ...formData, banniere: null });
      setBannierePreview(null);
      if (banniereInputRef.current) {
        banniereInputRef.current.value = "";
      }
    }
    setErrors({ ...errors, [type]: "" });
    setApiError(null);
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
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
                style={{ fontSize: "8rem", right: "-1rem", bottom: "-2rem" }}
              />
            </div>
            <div className="position-relative z-1">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                  <FontAwesomeIcon icon={faPlus} className="fs-5" />
                </div>
                <span>Créer votre boutique</span>
              </h5>
              <p className="mb-0 text-white text-opacity-90 small">
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
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} />
                Informations principales
              </h6>

              <div className="row g-3">
                <div className="col-12">
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
                        setApiError(null); // Effacer l'erreur API quand l'utilisateur modifie le champ
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
              <h6 className="fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faImage} />
                Images
              </h6>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body">
                      <label className="form-label fw-semibold mb-3">
                        Logo
                        <span className="text-muted fw-normal ms-1">
                          (Recommandé)
                        </span>
                      </label>

                      {/* Aperçu du logo */}
                      {logoPreview && (
                        <div className="mb-3">
                          <div className="position-relative d-inline-block">
                            <img
                              src={logoPreview}
                              alt="Aperçu logo"
                              className="img-fluid rounded border shadow-sm"
                              style={{
                                maxWidth: "150px",
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onClick={() => removeImage("logo")}
                              disabled={loading}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                padding: "0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Supprimer l'image"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="fs-10"
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload logo */}
                      <div className="input-group">
                        <input
                          ref={logoInputRef}
                          type="file"
                          className="form-control"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => handleFileChange(e, "logo")}
                          disabled={loading}
                          style={{ borderRadius: "8px 0 0 8px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={loading}
                          style={{ borderRadius: "0 8px 8px 0" }}
                        >
                          <FontAwesomeIcon icon={faUpload} />
                        </button>
                      </div>
                      {errors.logo && (
                        <div className="text-danger small mt-1">
                          {errors.logo}
                        </div>
                      )}

                      <div className="mt-3">
                        <small className="text-muted d-block">
                          <strong>Recommandations :</strong>
                        </small>
                        <small className="text-muted d-block">
                          • Format carré (1:1)
                        </small>
                        <small className="text-muted d-block">
                          • Taille minimale : 200×200px
                        </small>
                        <small className="text-muted d-block">
                          • Formats: JPG, PNG, WebP (max 5MB)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body">
                      <label className="form-label fw-semibold mb-3">
                        Bannière
                        <span className="text-muted fw-normal ms-1">
                          (Optionnel)
                        </span>
                      </label>

                      {/* Aperçu de la bannière */}
                      {bannierePreview && (
                        <div className="mb-3">
                          <div className="position-relative">
                            <img
                              src={bannierePreview}
                              alt="Aperçu bannière"
                              className="img-fluid rounded border shadow-sm"
                              style={{
                                maxHeight: "100px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onClick={() => removeImage("banniere")}
                              disabled={loading}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                padding: "0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Supprimer l'image"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="fs-10"
                              />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload bannière */}
                      <div className="input-group">
                        <input
                          ref={banniereInputRef}
                          type="file"
                          className="form-control"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => handleFileChange(e, "banniere")}
                          disabled={loading}
                          style={{ borderRadius: "8px 0 0 8px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={() => banniereInputRef.current?.click()}
                          disabled={loading}
                          style={{ borderRadius: "0 8px 8px 0" }}
                        >
                          <FontAwesomeIcon icon={faUpload} />
                        </button>
                      </div>
                      {errors.banniere && (
                        <div className="text-danger small mt-1">
                          {errors.banniere}
                        </div>
                      )}

                      <div className="mt-3">
                        <small className="text-muted d-block">
                          <strong>Recommandations :</strong>
                        </small>
                        <small className="text-muted d-block">
                          • Format paysage (16:9)
                        </small>
                        <small className="text-muted d-block">
                          • Taille recommandée : 1200×400px
                        </small>
                        <small className="text-muted d-block">
                          • Formats: JPG, PNG, WebP (max 5MB)
                        </small>
                      </div>
                    </div>
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
              disabled={loading}
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

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-10 {
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default CreateBoutiqueModal;