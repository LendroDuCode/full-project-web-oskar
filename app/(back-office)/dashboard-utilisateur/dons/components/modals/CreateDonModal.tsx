"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faSave,
  faSpinner,
  faImage,
  faTag,
  faFileAlt,
  faUpload,
  faCheckCircle,
  faExclamationTriangle,
  faTrash,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  type: string;
  libelle: string;
  description: string;
  imageFile?: File | null;
}

interface ValidationErrors {
  type?: string;
  libelle?: string;
  description?: string;
  image?: string;
}

const CATEGORY_TYPES = [
  "Alimentation & Boissons",
  "Don & Échange",
  "Électronique",
  "Mode & Accessoires",
  "Maison & Jardin",
  "Automobile",
  "Services",
  "Immobilier",
  "Loisirs & Sport",
  "Santé & Beauté",
  "Éducation",
  "Autre",
];

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  // États
  const [formData, setFormData] = useState<FormData>({
    type: "",
    libelle: "",
    description: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (isOpen) {
      const checkAuth = () => {
        const token = api.getToken();
        const authenticated = !!token;
        setIsAuthenticated(authenticated);

        console.log("🔐 Vérification auth:", {
          authenticated,
          tokenPresent: !!token,
          tokenPreview: token ? token.substring(0, 10) + "..." : "aucun",
        });

        if (!authenticated) {
          setError(
            "Vous devez être connecté pour créer une catégorie. Redirection...",
          );
          setTimeout(() => {
            window.location.href =
              "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }, 2000);
        }
      };

      checkAuth();

      // Réinitialiser le formulaire
      setFormData({
        type: "",
        libelle: "",
        description: "",
        imageFile: null,
      });
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
      setPreviewImage(null);
    }
  }, [isOpen]);

  // Nettoyer les URLs d'aperçu
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.type.trim()) {
      errors.type = "Le type est obligatoire";
    }

    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    } else if (formData.description.length < 10) {
      errors.description =
        "La description doit contenir au moins 10 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  // Gestion du changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setError(
          "Type de fichier non supporté. Utilisez JPG, PNG, WEBP, GIF ou SVG.",
        );
        return;
      }

      // Vérifier la taille (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse. Taille maximale : 10MB.");
        return;
      }

      // Mettre à jour l'état
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));

      // Créer l'aperçu
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Effacer les erreurs
      setError(null);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
    }));

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Soumission principale avec fetch direct
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Vous devez être connecté pour créer une catégorie.");
      return;
    }

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("📤 Début création catégorie...");

      // Vérifier à nouveau l'authentification
      const token = api.getToken();
      if (!token) {
        throw new Error("Authentification perdue. Veuillez vous reconnecter.");
      }

      console.log("🔑 Token valide détecté");

      // Créer FormData
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type.trim());
      formDataToSend.append("libelle", formData.libelle.trim());
      formDataToSend.append("description", formData.description.trim());

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
        console.log("📷 Image ajoutée:", {
          name: formData.imageFile.name,
          type: formData.imageFile.type,
          size: formData.imageFile.size,
        });
      }

      // Afficher les données pour débogage
      console.log("📝 Données FormData prêtes:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }

      // Utiliser fetch directement
      console.log("🚀 Envoi vers:", API_ENDPOINTS.CATEGORIES.CREATE);

      const response = await fetch(API_ENDPOINTS.CATEGORIES.CREATE, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          // NE PAS définir Content-Type pour FormData (le navigateur le fera automatiquement)
        },
      });

      const data = await response.json();

      console.log("✅ Réponse API:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      // Vérifier la réponse
      if (data && data.success !== false) {
        setSuccessMessage(data.message || "Catégorie créée avec succès !");
      } else {
        throw new Error(
          data?.message || "La création a échoué sans message d'erreur",
        );
      }

      // Réinitialiser le formulaire
      setFormData({
        type: "",
        libelle: "",
        description: "",
        imageFile: null,
      });

      // Nettoyer l'aperçu
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);

      // Fermer la modal après succès
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur lors de la création:", err);

      let errorMessage =
        err.message || "Erreur lors de la création de la catégorie";

      // Messages d'erreur spécifiques
      if (
        errorMessage.includes("Authentification") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorMessage = "Authentification requise. Veuillez vous reconnecter.";

        // Rediriger vers login
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href =
              "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }
        }, 2000);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Alternative utilisant la méthode post de l'API client (si elle supporte FormData)
  const handleSubmitWithApiClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier l'authentification
      const token = api.getToken();
      if (!token) {
        throw new Error("Authentification requise");
      }

      // Créer FormData
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type.trim());
      formDataToSend.append("libelle", formData.libelle.trim());
      formDataToSend.append("description", formData.description.trim());

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      // Utiliser la méthode post de l'API client (si elle existe et supporte FormData)
      // Note: Cette méthode nécessite que votre api.post supporte FormData
      const response = await api.post(
        API_ENDPOINTS.CATEGORIES.CREATE,
        formDataToSend,
        {},
      );

      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Catégorie créée avec succès !");
      } else {
        throw new Error(
          response?.message || "La création a échoué sans message d'erreur",
        );
      }

      // Réinitialiser et fermer
      setFormData({
        type: "",
        libelle: "",
        description: "",
        imageFile: null,
      });

      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(null);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur api client:", err);
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const hasChanges =
      formData.type ||
      formData.libelle ||
      formData.description ||
      formData.imageFile;

    if (hasChanges) {
      if (
        !confirm(
          "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?",
        )
      ) {
        return;
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="createCategoryModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.green} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faPlus} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createCategoryModalLabel"
                >
                  Créer une Nouvelle Catégorie
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Remplissez les informations pour créer une nouvelle catégorie
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Corps */}
          <div className="modal-body py-4">
            {/* Message d'authentification */}
            {!isAuthenticated && (
              <div
                className="alert alert-warning border-0 shadow-sm mb-4"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon icon={faLock} className="text-warning" />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">
                      Authentification requise
                    </h6>
                    <p className="mb-0">
                      Vous devez être connecté pour créer une catégorie.
                      Redirection vers la page de connexion...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mb-4 border-0 shadow-sm"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-danger"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Fermer"
                  />
                </div>
              </div>
            )}

            {/* Message de succès */}
            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.green}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">Succès</h6>
                    <p className="mb-0">{successMessage}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccessMessage(null)}
                    aria-label="Fermer"
                  />
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row g-4">
                {/* Type */}
                <div className="col-md-6">
                  <label htmlFor="type" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Type <span className="text-danger">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={`form-select ${validationErrors.type ? "is-invalid" : ""}`}
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">Sélectionner un type...</option>
                    {CATEGORY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.type && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.type}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Sélectionnez le type de catégorie
                  </small>
                </div>

                {/* Libellé */}
                <div className="col-md-6">
                  <label htmlFor="libelle" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Libellé <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="libelle"
                    name="libelle"
                    className={`form-control ${validationErrors.libelle ? "is-invalid" : ""}`}
                    placeholder="Ex: Alimentation & Boissons"
                    value={formData.libelle}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.libelle && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.libelle}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Nom affiché de la catégorie
                  </small>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                    placeholder="Décrivez cette catégorie..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.description && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.description}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Décrivez cette catégorie en quelques mots (minimum 10
                    caractères)
                  </small>
                </div>

                {/* Image */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Image de la catégorie
                    <span className="text-muted ms-1 fw-normal">
                      (Optionnel)
                    </span>
                  </label>

                  {/* Aperçu */}
                  {previewImage && (
                    <div className="mb-3">
                      <div className="position-relative d-inline-block">
                        <img
                          src={previewImage}
                          alt="Aperçu de l'image"
                          className="img-fluid rounded border shadow-sm"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          onClick={handleRemoveImage}
                          disabled={loading || !isAuthenticated}
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
                          <FontAwesomeIcon icon={faTrash} className="fs-10" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload */}
                  <div className="input-group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="imageFile"
                      name="imageFile"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || !isAuthenticated}
                      style={{ borderRadius: "8px 0 0 8px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || !isAuthenticated}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span className="ms-2">Parcourir</span>
                    </button>
                  </div>

                  <div className="text-muted mt-2">
                    <small>
                      Formats acceptés: JPG, PNG, WEBP, GIF, SVG (max 10MB).
                      {!previewImage &&
                        " Si aucune image n'est fournie, une image par défaut sera utilisée."}
                    </small>
                  </div>

                  {/* Nom du fichier */}
                  {formData.imageFile && (
                    <div className="mt-2">
                      <small className="text-success">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-1"
                        />
                        Fichier sélectionné:{" "}
                        <strong>{formData.imageFile.name}</strong> (
                        {Math.round(formData.imageFile.size / 1024)} Ko)
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: `1px solid ${colors.oskar.grey}30`,
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Annuler
              </button>

              <button
                type="button"
                className="btn text-white d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={loading || !isAuthenticated}
                style={{
                  background: isAuthenticated
                    ? colors.oskar.green
                    : colors.oskar.grey,
                  border: `1px solid ${isAuthenticated ? colors.oskar.green : colors.oskar.grey}`,
                  borderRadius: "8px",
                  fontWeight: "500",
                  opacity: !isAuthenticated ? 0.6 : 1,
                  cursor: !isAuthenticated ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Création en cours...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <FontAwesomeIcon icon={faLock} />
                    Connectez-vous
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} />
                    Créer la Catégorie
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .form-control,
        .form-select {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.green};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-10 {
          font-size: 10px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
