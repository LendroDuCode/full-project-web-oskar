// app/dashboard/type-boutique/components/EditTypeBoutiqueModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTag,
  faStore,
  faInfoCircle,
  faBox,
  faHome,
  faImage,
  faTimes,
  faSave,
  faSpinner,
  faUndo,
  faSync,
  faTrash,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import StatusBadge from "../StatusBadge";

interface TypeBoutique {
  id: number;
  uuid: string;
  code: string;
  libelle: string;
  description?: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  statut: "actif" | "inactif";
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

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
}

interface EditTypeBoutiqueModalProps {
  isOpen: boolean;
  typeBoutique: TypeBoutique | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function EditTypeBoutiqueModal({
  isOpen,
  typeBoutique,
  onClose,
  onSuccess,
}: EditTypeBoutiqueModalProps) {
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
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser
  useEffect(() => {
    if (typeBoutique && isOpen) {
      setFormData({
        code: typeBoutique.code || "",
        libelle: typeBoutique.libelle || "",
        description: typeBoutique.description || "",
        peut_vendre_produits: typeBoutique.peut_vendre_produits,
        peut_vendre_biens: typeBoutique.peut_vendre_biens,
        imageFile: null,
      });

      const imageUrl = typeBoutique.image || null;
      setPreviewImage(imageUrl);
      setOriginalImage(imageUrl);
      setHasChanges(false);
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [typeBoutique, isOpen]);

  // Vérifier les changements
  useEffect(() => {
    if (typeBoutique) {
      const original = {
        code: typeBoutique.code || "",
        libelle: typeBoutique.libelle || "",
        description: typeBoutique.description || "",
        peut_vendre_produits: typeBoutique.peut_vendre_produits,
        peut_vendre_biens: typeBoutique.peut_vendre_biens,
      };

      const current = {
        code: formData.code,
        libelle: formData.libelle,
        description: formData.description,
        peut_vendre_produits: formData.peut_vendre_produits,
        peut_vendre_biens: formData.peut_vendre_biens,
      };

      const hasFormChanges =
        JSON.stringify(original) !== JSON.stringify(current);
      const hasImageChanges = formData.imageFile !== null;
      const hasPreviewChanges = previewImage !== originalImage;

      setHasChanges(hasFormChanges || hasImageChanges || hasPreviewChanges);
    }
  }, [formData, typeBoutique, previewImage, originalImage]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.code.trim()) {
      errors.code = "Le code est obligatoire";
    }

    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    }

    if (!formData.peut_vendre_produits && !formData.peut_vendre_biens) {
      errors.peut_vendre_produits =
        "Au moins un type de vente doit être autorisé";
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
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];

      if (!validTypes.includes(file.type)) {
        setError(
          "Type de fichier non supporté. Formats acceptés: JPG, PNG, WEBP, GIF, SVG.",
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse (max 5MB)");
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));

      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null }));

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(originalImage);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!typeBoutique) return;

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer FormData correctement
      const formDataToSend = new FormData();
      formDataToSend.append("code", formData.code.trim());
      formDataToSend.append("libelle", formData.libelle.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append(
        "peut_vendre_produits",
        formData.peut_vendre_produits ? "1" : "0",
      );
      formDataToSend.append(
        "peut_vendre_biens",
        formData.peut_vendre_biens ? "1" : "0",
      );

      // Ajouter l'image seulement si un nouveau fichier est sélectionné
      if (formData.imageFile) {
        console.log("📤 Upload d'image détecté:", {
          name: formData.imageFile.name,
          type: formData.imageFile.type,
          size: formData.imageFile.size,
        });
        formDataToSend.append("image", formData.imageFile);
      } else {
        console.log(
          "📝 Pas de nouvelle image, mise à jour des données uniquement",
        );
      }

      // Debug: Afficher le contenu de FormData
      console.log("📦 Contenu FormData à envoyer:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const endpoint = API_ENDPOINTS.TYPES_BOUTIQUE.UPDATE(typeBoutique.uuid);
      console.log("🚀 Envoi PATCH vers:", endpoint);

      const response = await api.request(endpoint, {
        method: "PATCH",
        body: formDataToSend,
        requiresAuth: true,
        isFormData: true,
      });

      console.log("✅ Réponse API:", response);

      if (response && response.success !== false) {
        const successMsg =
          response.message || "Type de boutique modifié avec succès !";
        setSuccessMessage(successMsg);

        // Nettoyer l'aperçu blob
        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }

        // Mettre à jour l'image avec celle du serveur
        const newImageUrl =
          response.data?.image ||
          response.data?.image_url ||
          typeBoutique.image;
        console.log("🖼️ Nouvelle URL d'image:", newImageUrl);

        setPreviewImage(newImageUrl);
        setOriginalImage(newImageUrl);
        setFormData((prev) => ({ ...prev, imageFile: null }));

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(successMsg);
          }
          onClose();
        }, 1500);
      } else {
        throw new Error(response?.message || "La modification a échoué");
      }
    } catch (err: any) {
      console.error("❌ Erreur modification type boutique:", err);

      let errorMessage = err.message || "Erreur lors de la modification";

      // Messages d'erreur spécifiques
      if (
        err.message?.includes("413") ||
        err.message?.includes("Payload Too Large")
      ) {
        errorMessage = "Fichier trop volumineux. Taille maximale: 5MB.";
      } else if (
        err.message?.includes("415") ||
        err.message?.includes("Unsupported Media Type")
      ) {
        errorMessage = "Format d'image non supporté.";
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("fetch")
      ) {
        errorMessage = "Erreur réseau. Vérifiez votre connexion.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!typeBoutique) return;

    setFormData({
      code: typeBoutique.code || "",
      libelle: typeBoutique.libelle || "",
      description: typeBoutique.description || "",
      peut_vendre_produits: typeBoutique.peut_vendre_produits,
      peut_vendre_biens: typeBoutique.peut_vendre_biens,
      imageFile: null,
    });

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(originalImage);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (loading) return;

    if (hasChanges) {
      if (!confirm("Vous avez des modifications non sauvegardées. Annuler ?")) {
        return;
      }
    }

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    onClose();
  };

  if (!isOpen || !typeBoutique) return null;

  const isDeleted = typeBoutique.is_deleted;
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR");
    } catch {
      return "N/A";
    }
  };

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
          style={{ borderRadius: "16px" }}
        >
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Modifier le Type de Boutique
                  {hasChanges && (
                    <span className="badge bg-warning ms-2 fs-12">
                      Modifications
                    </span>
                  )}
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {typeBoutique.libelle} • {typeBoutique.code}
                  {isDeleted && " • ❌ Supprimé"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
            />
          </div>

          <div className="modal-body py-4">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="me-2"
                  />
                  <div>
                    <strong>Erreur:</strong> {error}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                />
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Succès:</strong> {successMessage}
                  </div>
                </div>
              </div>
            )}

            {hasChanges && !successMessage && (
              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    <span>Modifications détectées</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faUndo} className="me-1" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                    disabled={loading || isDeleted}
                    placeholder="boutique_vetement"
                  />
                  {validationErrors.code && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.code}
                    </div>
                  )}
                  <small className="text-muted">
                    Code unique en minuscules avec underscores
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
                    disabled={loading || isDeleted}
                    placeholder="Vêtements"
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
                    disabled={loading || isDeleted}
                    placeholder="Description du type de boutique..."
                  />
                </div>

                {/* Options de vente */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold d-block">
                    Autorisations de vente
                  </label>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="peut_vendre_produits"
                      name="peut_vendre_produits"
                      checked={formData.peut_vendre_produits}
                      onChange={handleChange}
                      disabled={loading || isDeleted}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="peut_vendre_produits"
                    >
                      <FontAwesomeIcon
                        icon={faBox}
                        className="me-2 text-success"
                      />
                      Peut vendre des produits
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
                      disabled={loading || isDeleted}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="peut_vendre_biens"
                    >
                      <FontAwesomeIcon
                        icon={faHome}
                        className="me-2 text-primary"
                      />
                      Peut vendre des biens
                    </label>
                  </div>
                  {validationErrors.peut_vendre_produits && (
                    <div className="text-danger mt-2">
                      {validationErrors.peut_vendre_produits}
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Image
                  </label>

                  <div className="mb-3">
                    <p className="text-muted mb-2">Image actuelle:</p>
                    {previewImage ? (
                      <div className="position-relative d-inline-block">
                        <img
                          src={previewImage}
                          alt={typeBoutique.libelle}
                          className="img-fluid rounded border"
                          style={{ maxWidth: "150px", maxHeight: "150px" }}
                          onError={(e) => {
                            console.error(
                              "❌ Erreur chargement image:",
                              previewImage,
                            );
                            (e.target as HTMLImageElement).src =
                              `https://via.placeholder.com/150/cccccc/ffffff?text=${typeBoutique.libelle.charAt(0)}`;
                          }}
                        />
                        {previewImage !== originalImage && (
                          <span className="badge bg-warning position-absolute top-0 start-0 m-1">
                            Modifié
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">
                        <FontAwesomeIcon icon={faImage} className="me-2" />
                        Aucune image
                      </div>
                    )}
                  </div>

                  {previewImage &&
                    previewImage !== originalImage &&
                    previewImage.startsWith("blob:") && (
                      <div className="mb-3">
                        <p className="text-muted mb-2">Nouvelle image:</p>
                        <div className="position-relative d-inline-block">
                          <img
                            src={previewImage}
                            alt="Nouvelle image"
                            className="img-fluid rounded border"
                            style={{ maxWidth: "150px", maxHeight: "150px" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={handleRemoveImage}
                            disabled={loading || isDeleted}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              padding: "0",
                            }}
                            title="Annuler le changement d'image"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
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
                      disabled={loading || isDeleted}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || isDeleted}
                    >
                      <FontAwesomeIcon icon={faImage} />
                    </button>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Formats: JPG, PNG, WEBP, GIF, SVG (max 5MB)
                  </small>
                </div>

                {/* Informations */}
                <div className="col-12">
                  <div className="card border-0 bg-light-subtle">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3">Informations</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>ID:</strong> {typeBoutique.id}
                          </p>
                          <p className="mb-2">
                            <strong>UUID:</strong>{" "}
                            <code className="text-muted">
                              {typeBoutique.uuid}
                            </code>
                          </p>
                          <p className="mb-2">
                            <strong>Créé le:</strong>{" "}
                            {formatDate(typeBoutique.created_at)}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Modifié le:</strong>{" "}
                            {formatDate(typeBoutique.updated_at)}
                          </p>
                          <p className="mb-2">
                            <strong>Statut:</strong>{" "}
                            <StatusBadge statut={typeBoutique.statut} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer border-top-0">
            <div className="d-flex justify-content-between w-100">
              <div>
                {!isDeleted && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      // TODO: Gestion suppression
                      alert("Fonctionnalité de suppression à implémenter");
                    }}
                    disabled={loading || isDeleted}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Supprimer
                  </button>
                )}
              </div>
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading || isDeleted || !hasChanges}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
