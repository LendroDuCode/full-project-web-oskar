"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faUpload,
  faImage,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface Category {
  uuid: string;
  libelle: string;
  type: string;
  description?: string;
  image?: string;
}

interface CreateSubCategoryModalProps {
  isOpen: boolean;
  parentCategory: Category | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const CreateSubCategoryModal = ({
  isOpen,
  parentCategory,
  onClose,
  onSuccess,
}: CreateSubCategoryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    libelle: "",
    type: parentCategory?.type || "",
    description: "",
    statut: "actif",
    image: "",
  });

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && parentCategory) {
      setFormData({
        libelle: "",
        type: parentCategory.type,
        description: "",
        statut: "actif",
        image: "",
      });
      setImagePreview(null);
      setImageFile(null);
      setError(null);
      setUploadProgress(0);
    }
  }, [isOpen, parentCategory]);

  // Gérer l'upload d'image
  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress(10);
      const formData = new FormData();
      formData.append("file", file);

      // Simuler la progression
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Ici, vous devez implémenter l'upload vers votre backend
      // Pour l'exemple, on simule un upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearInterval(interval);
      setUploadProgress(100);

      // Simuler l'URL de l'image uploadée
      return `http://localhost:3005/uploads/${file.name}`;
    } catch (err) {
      console.error("Erreur upload image:", err);
      throw new Error("Échec de l'upload de l'image");
    }
  };

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Gérer la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentCategory) {
      setError("Catégorie parente non définie");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageUrl = "";

      // Upload l'image si fournie
      if (imageFile) {
        try {
          imageUrl = await handleImageUpload(imageFile);
          setFormData((prev) => ({ ...prev, image: imageUrl }));
        } catch (uploadError) {
          console.warn("Échec upload image, continuation sans image");
        }
      }

      // Préparer les données
      const payload = {
        libelle: formData.libelle.trim(),
        type: formData.type.trim(),
        description: formData.description.trim() || null,
        statut: formData.statut,
        image: imageUrl || null,
      };

      // Envoyer la requête
      await api.post(
        API_ENDPOINTS.CATEGORIES.CREATE_SOUS_CATEGORIE(parentCategory.uuid),
        payload,
      );

      // Succès
      onSuccess(`Sous-catégorie "${formData.libelle}" créée avec succès !`);
      onClose();
    } catch (err: any) {
      console.error("❌ Erreur création sous-catégorie:", err);

      let errorMessage = "Erreur lors de la création de la sous-catégorie";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(", ");
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Annuler
  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !parentCategory) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-primary text-white rounded-top-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 rounded-circle p-2">
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  Nouvelle Sous-catégorie
                </h5>
                <small className="opacity-75">
                  Catégorie parente : {parentCategory.libelle}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleCancel}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          {/* Contenu */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Message d'erreur */}
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4"
                  role="alert"
                >
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    <div>
                      <strong>Erreur :</strong> {error}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {/* Informations parent */}
              <div className="card bg-light border-0 mb-4">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-3">
                    {parentCategory.image && (
                      <img
                        src={parentCategory.image}
                        alt={parentCategory.libelle}
                        className="rounded"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/50/cccccc/ffffff?text=${parentCategory.libelle.charAt(0)}`;
                        }}
                      />
                    )}
                    <div>
                      <h6 className="mb-1 fw-semibold">
                        {parentCategory.libelle}
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {parentCategory.type}
                        </span>
                        <small className="text-muted">
                          UUID : {parentCategory.uuid.substring(0, 8)}...
                        </small>
                      </div>
                      {parentCategory.description && (
                        <p className="mb-0 text-muted small mt-1">
                          {parentCategory.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire en deux colonnes */}
              <div className="row g-4">
                {/* Colonne gauche */}
                <div className="col-md-6">
                  {/* Libellé */}
                  <div className="mb-3">
                    <label htmlFor="libelle" className="form-label fw-semibold">
                      Nom de la sous-catégorie *
                    </label>
                    <input
                      type="text"
                      id="libelle"
                      className="form-control"
                      value={formData.libelle}
                      onChange={(e) =>
                        setFormData({ ...formData, libelle: e.target.value })
                      }
                      required
                      disabled={loading}
                      placeholder="Ex: Don, Échange, Alimentaire..."
                      maxLength={100}
                    />
                    <small className="text-muted">Maximum 100 caractères</small>
                  </div>

                  {/* Type (hérité du parent) */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Type *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-muted"
                        />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.type}
                        readOnly
                        disabled
                      />
                      <span className="input-group-text bg-success bg-opacity-10 text-success">
                        Hérité
                      </span>
                    </div>
                    <small className="text-muted">
                      Le type est hérité de la catégorie parente
                    </small>
                  </div>

                  {/* Statut */}
                  <div className="mb-3">
                    <label htmlFor="statut" className="form-label fw-semibold">
                      Statut *
                    </label>
                    <select
                      id="statut"
                      className="form-select"
                      value={formData.statut}
                      onChange={(e) =>
                        setFormData({ ...formData, statut: e.target.value })
                      }
                      disabled={loading}
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                    <small className="text-muted">
                      Détermine si la sous-catégorie est visible
                    </small>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="col-md-6">
                  {/* Description */}
                  <div className="mb-3">
                    <label
                      htmlFor="description"
                      className="form-label fw-semibold"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      disabled={loading}
                      placeholder="Description optionnelle de la sous-catégorie..."
                      maxLength={500}
                    />
                    <small className="text-muted">
                      {formData.description.length}/500 caractères
                    </small>
                  </div>

                  {/* Upload d'image */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Image de la sous-catégorie
                    </label>

                    {/* Zone de drop */}
                    <div
                      className={`border rounded p-4 text-center cursor-pointer ${loading ? "opacity-50" : ""}`}
                      onClick={() =>
                        !loading &&
                        document.getElementById("imageUpload")?.click()
                      }
                      style={{
                        borderStyle: "dashed",
                        backgroundColor: imagePreview
                          ? "transparent"
                          : "#f8f9fa",
                        minHeight: "150px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1rem",
                      }}
                    >
                      <input
                        type="file"
                        id="imageUpload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                      />

                      {imagePreview ? (
                        <div className="position-relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "120px" }}
                          />
                          {!loading && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImagePreview(null);
                                setImageFile(null);
                                setFormData({ ...formData, image: "" });
                              }}
                              style={{
                                width: "24px",
                                height: "24px",
                                padding: 0,
                              }}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                            <FontAwesomeIcon
                              icon={faUpload}
                              className="text-primary fs-4"
                            />
                          </div>
                          <div>
                            <p className="mb-1">
                              <span className="text-primary fw-semibold">
                                Cliquez pour uploader
                              </span>{" "}
                              ou glissez-déposez
                            </p>
                            <small className="text-muted">
                              PNG, JPG, GIF jusqu'à 5MB
                            </small>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Barre de progression */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">
                            Upload en cours...
                          </small>
                          <small className="text-muted">
                            {uploadProgress}%
                          </small>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Règles de validation */}
              <div className="alert alert-info border-0 mt-4">
                <h6 className="alert-heading fw-semibold">
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Recommandations
                </h6>
                <ul className="mb-0 ps-3" style={{ fontSize: "0.85rem" }}>
                  <li>
                    Le nom doit être unique au sein de la catégorie parente
                  </li>
                  <li>Utilisez une image descriptive (ratio 1:1 recommandé)</li>
                  <li>
                    La description aide les utilisateurs à comprendre la
                    catégorie
                  </li>
                  <li>Les sous-catégories inactives ne sont pas visibles</li>
                </ul>
              </div>
            </div>

            {/* Pied de page */}
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.libelle.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Créer la sous-catégorie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubCategoryModal;
