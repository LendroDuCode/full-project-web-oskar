// app/dashboard/type-boutique/components/CreateTypeBoutiqueModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTag,
  faStore,
  faInfoCircle,
  faBox,
  faHome,
  faImage,
  faSave,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface FormDataTypeBoutique {
  code: string;
  libelle: string;
  description: string;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  imageFile?: File | null;
}

interface ValidationErrors {
  code?: string;
  libelle?: string;
  peut_vendre_produits?: string;
  peut_vendre_biens?: string;
  image?: string;
}

interface CreateTypeBoutiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function CreateTypeBoutiqueModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTypeBoutiqueModalProps) {
  const [formData, setFormData] = useState<FormDataTypeBoutique>({
    code: "",
    libelle: "",
    description: "",
    peut_vendre_produits: true,
    peut_vendre_biens: true,
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction utilitaire pour générer un image_key
  const generateImageKey = (file?: File): string | null => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    if (file) {
      const sanitizedName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      return `type-boutique-${timestamp}-${random}-${sanitizedName}`;
    }
    return `type-boutique-default-${timestamp}-${random}`;
  };

  // Initialiser
  useEffect(() => {
    if (isOpen) {
      resetForm();
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

  const resetForm = () => {
    setFormData({
      code: "",
      libelle: "",
      description: "",
      peut_vendre_produits: true,
      peut_vendre_biens: true,
      imageFile: null,
    });
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.code.trim()) {
      errors.code = "Le code est obligatoire";
    } else if (formData.code.length < 2) {
      errors.code = "Le code doit contenir au moins 2 caractères";
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code =
        "Le code doit contenir uniquement des lettres minuscules, chiffres et underscores";
    }

    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
    }

    if (!formData.peut_vendre_produits && !formData.peut_vendre_biens) {
      errors.peut_vendre_produits =
        "Au moins un type de vente doit être autorisé";
      errors.peut_vendre_biens = "Au moins un type de vente doit être autorisé";
    }

    // Validation de l'image (optionnelle mais recommandée)
    if (formData.imageFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.imageFile.size > maxSize) {
        errors.image = "L'image est trop volumineuse. Taille maximale : 5MB.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];

      if (!validTypes.includes(file.type)) {
        setImageError(
          "Type de fichier non supporté. Formats acceptés: JPG, PNG, WEBP, GIF, SVG.",
        );
        setError(null);
        return;
      }

      // Vérifier la taille
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setImageError("L'image est trop volumineuse. Taille maximale : 5MB.");
        setError(null);
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImageError(null);
      setError(null);

      // Nettoyer l'ancienne URL d'aperçu
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      // Créer l'aperçu
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      console.log("📷 Fichier sélectionné:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log("📤 Début création type boutique...");

      // Créer FormData pour l'upload d'image
      const formDataToSend = new FormData();

      // Ajouter les champs textuels
      formDataToSend.append("code", formData.code.trim());
      formDataToSend.append("libelle", formData.libelle.trim());
      formDataToSend.append("description", formData.description.trim());

      // CORRECTION: Utiliser 1/0 au lieu de true/false pour MySQL
      formDataToSend.append(
        "peut_vendre_produits",
        formData.peut_vendre_produits ? "1" : "0",
      );
      formDataToSend.append(
        "peut_vendre_biens",
        formData.peut_vendre_biens ? "1" : "0",
      );

      // CORRECTION: Passer undefined si imageFile est null
      const imageKey = generateImageKey(formData.imageFile || undefined);
      formDataToSend.append("image_key", imageKey || "");
      console.log("🔑 Image key généré:", imageKey);

      // Ajouter l'image si elle existe
      if (formData.imageFile) {
        console.log("📷 Ajout de l'image:", {
          name: formData.imageFile.name,
          type: formData.imageFile.type,
          size: formData.imageFile.size,
        });

        formDataToSend.append("image", formData.imageFile);
      } else {
        console.log("ℹ️  Aucune image à uploader");
      }

      // Debug: Afficher le contenu de FormData
      console.log("🔍 Contenu du FormData avant envoi:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`,
          );
        } else {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        }
      }

      // Envoi de la requête
      console.log("🚀 Envoi POST vers:", API_ENDPOINTS.TYPES_BOUTIQUE.CREATE);

      const response = await api.request(API_ENDPOINTS.TYPES_BOUTIQUE.CREATE, {
        method: "POST",
        body: formDataToSend,
        requiresAuth: true,
        isFormData: true, // Important: indiquer que c'est FormData
      });

      console.log("✅ Réponse API création type boutique:", {
        success: response.success,
        message: response.message,
        data: response.data,
      });

      if (response && response.success !== false) {
        const successMsg =
          response.message || "Type de boutique créé avec succès !";
        setSuccessMessage(successMsg);

        // Nettoyer l'aperçu
        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }

        // Réinitialiser le formulaire
        resetForm();

        // Fermer après succès
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(successMsg);
          }
          onClose();
        }, 1500);
      } else {
        throw new Error(
          response?.message ||
            response?.error ||
            "La création a échoué sans message d'erreur",
        );
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la création du type boutique:", {
        error: err,
        message: err.message,
        status: err.status,
        data: err.data,
      });

      let errorMessage =
        err.message || "Erreur lors de la création du type de boutique";

      // Messages d'erreur spécifiques
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (
        err.message?.includes("image_key") ||
        err.message?.includes("doesn't have a default value")
      ) {
        errorMessage =
          "Erreur de base de données: champ 'image_key' manquant. Veuillez contacter l'administrateur.";
      } else if (
        err.message?.includes("Incorrect integer value") ||
        err.message?.includes("peut_vendre_produits") ||
        err.message?.includes("peut_vendre_biens")
      ) {
        errorMessage = "Erreur de format pour les autorisations de vente.";
      } else if (
        err.message?.includes("413") ||
        err.message?.includes("Payload Too Large")
      ) {
        errorMessage = "Fichier trop volumineux. Taille maximale: 5MB.";
      } else if (
        err.message?.includes("415") ||
        err.message?.includes("Unsupported Media Type")
      ) {
        errorMessage =
          "Format d'image non supporté. Formats acceptés: JPG, PNG, WEBP, GIF, SVG.";
      } else if (
        err.message?.includes("409") ||
        err.message?.includes("duplicate") ||
        err.message?.includes("existe déjà")
      ) {
        errorMessage = "Un type de boutique avec ce code existe déjà.";
      } else if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        errorMessage = "Authentification requise. Veuillez vous reconnecter.";
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("fetch")
      ) {
        errorMessage = "Erreur réseau. Vérifiez votre connexion internet.";
      }

      setError(errorMessage);

      // Afficher plus de détails pour le débogage
      if (process.env.NODE_ENV === "development") {
        console.error("🔍 Détails de l'erreur:", {
          originalError: err,
          formData: formData,
          hasImageFile: !!formData.imageFile,
          fullError: err,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    // Nettoyer l'aperçu
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 1050,
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: "16px",
            border: `2px solid ${colors.oskar.blue}20`,
          }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.blue} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faPlus} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Nouveau Type de Boutique
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Ajouter un nouveau type de boutique
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
                      style={{ backgroundColor: `${colors.oskar.red}20` }}
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
                    {error.includes("image_key") && (
                      <small className="d-block mt-1">
                        <strong>Solution:</strong> Le champ image_key est
                        obligatoire dans la base de données.
                      </small>
                    )}
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

            <form onSubmit={handleSubmit} id="create-type-form">
              <div className="row g-4">
                {/* Code */}
                <div className="col-md-6">
                  <label htmlFor="code" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    className={`form-control ${validationErrors.code ? "is-invalid" : ""}`}
                    value={formData.code}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: boutique_vetement"
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.code && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.code}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Code unique (lettres minuscules, chiffres et underscores)
                  </small>
                </div>

                {/* Libellé */}
                <div className="col-md-6">
                  <label htmlFor="libelle" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    Libellé <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="libelle"
                    name="libelle"
                    className={`form-control ${validationErrors.libelle ? "is-invalid" : ""}`}
                    value={formData.libelle}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ex: Boutique Vêtements"
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.libelle && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.libelle}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Description du type de boutique..."
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                {/* Options de vente */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold d-block mb-3">
                    <FontAwesomeIcon icon={faBox} className="me-2" />
                    Autorisations de vente{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <div className="card border-0 bg-light-subtle mb-3">
                    <div className="card-body">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="peut_vendre_produits"
                          name="peut_vendre_produits"
                          checked={formData.peut_vendre_produits}
                          onChange={handleChange}
                          disabled={loading}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        />
                        <label
                          className="form-check-label ms-3 d-flex align-items-center"
                          htmlFor="peut_vendre_produits"
                        >
                          <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-2">
                            <FontAwesomeIcon icon={faBox} />
                          </div>
                          <div>
                            <div className="fw-semibold">Produits</div>
                            <small className="text-muted">
                              Vente de produits physiques
                            </small>
                          </div>
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="peut_vendre_biens"
                          name="peut_vendre_biens"
                          checked={formData.peut_vendre_biens}
                          onChange={handleChange}
                          disabled={loading}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        />
                        <label
                          className="form-check-label ms-3 d-flex align-items-center"
                          htmlFor="peut_vendre_biens"
                        >
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-2">
                            <FontAwesomeIcon icon={faHome} />
                          </div>
                          <div>
                            <div className="fw-semibold">Biens</div>
                            <small className="text-muted">
                              Vente de biens immobiliers
                            </small>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {(validationErrors.peut_vendre_produits ||
                    validationErrors.peut_vendre_biens) && (
                    <div
                      className="alert alert-warning p-2 mt-2"
                      style={{ borderRadius: "6px" }}
                    >
                      <small className="text-danger">
                        {validationErrors.peut_vendre_produits}
                      </small>
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Image de type de boutique
                    <span className="text-muted ms-1 fw-normal">
                      (Recommandé)
                    </span>
                  </label>

                  {previewImage && (
                    <div className="mb-3 position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <p className="text-muted mb-0">Aperçu:</p>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={removeImage}
                          disabled={loading}
                          style={{ borderRadius: "6px", fontSize: "0.75rem" }}
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-1" />
                          Supprimer
                        </button>
                      </div>
                      <div className="position-relative d-inline-block">
                        <img
                          src={previewImage}
                          alt="Aperçu de l'image"
                          className="img-fluid rounded border shadow-sm"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.error(
                              "❌ Erreur chargement aperçu:",
                              previewImage,
                            );
                            (e.target as HTMLImageElement).src =
                              `https://via.placeholder.com/150/${colors.oskar.blue.replace("#", "")}/ffffff?text=Image+Error`;
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="imageFile"
                      name="imageFile"
                      className="form-control"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={handleFileChange}
                      disabled={loading}
                      style={{ borderRadius: "8px 0 0 8px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary d-flex align-items-center"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span className="ms-2">
                        {previewImage ? "Changer" : "Sélectionner"}
                      </span>
                    </button>
                  </div>

                  {imageError && (
                    <div
                      className="alert alert-warning p-2 mt-2"
                      style={{ borderRadius: "6px" }}
                    >
                      <small className="text-warning">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="me-1"
                        />
                        {imageError}
                      </small>
                    </div>
                  )}

                  {validationErrors.image && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.image}
                    </div>
                  )}

                  <div className="text-muted mt-2">
                    <small>
                      Formats acceptés: JPG, PNG, WEBP, GIF, SVG (max 5MB).
                      L'image sera automatiquement redimensionnée si nécessaire.
                    </small>
                  </div>
                </div>
              </div>

              {/* Informations système (cachées) */}
              <div style={{ display: "none" }}>
                <p className="text-muted small">
                  <strong>Note:</strong> Un identifiant unique (image_key) sera
                  généré automatiquement pour l'image.
                </p>
              </div>
            </form>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0">
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
                  padding: "0.5rem 1rem",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Annuler
              </button>

              <button
                type="submit"
                form="create-type-form"
                className="btn btn-success d-flex align-items-center gap-2"
                disabled={loading}
                style={{
                  background: colors.oskar.green,
                  border: `1px solid ${colors.oskar.green}`,
                  borderRadius: "8px",
                  fontWeight: "500",
                  padding: "0.5rem 1.5rem",
                }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Créer le type de boutique
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
          border-color: ${colors.oskar.blue};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.blue}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }

        .badge {
          font-weight: 500;
        }

        .alert {
          border-radius: 10px !important;
        }

        .card {
          border-radius: 10px !important;
          transition: transform 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .input-group:focus-within {
          border-color: ${colors.oskar.blue};
          box-shadow: 0 0 0 0.2rem ${colors.oskar.blue}20;
        }
      `}</style>
    </div>
  );
}