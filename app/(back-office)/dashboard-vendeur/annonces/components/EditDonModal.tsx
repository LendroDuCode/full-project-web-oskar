"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
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
  faGift,
  faPhone,
  faBox,
  faMapMarkerAlt,
  faUser,
  faList,
  faGlobe,
  faCalendar,
  faInfoCircle,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Types
interface Don {
  uuid: string;
  nom: string;
  titre?: string;
  description?: string;
  lieu_retrait?: string;
  categorie_uuid?: string;
  image?: string;
  image_key?: string;
}

interface EditDonModalProps {
  isOpen: boolean;
  don: Don;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditDonModal({
  isOpen,
  don,
  onClose,
  onSuccess,
}: EditDonModalProps) {
  // États
  const [formData, setFormData] = useState({
    nom: "",
    lieu_retrait: "",
    categorie_uuid: "",
    description: "",
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ uuid: string; libelle: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser avec les données du don
  useEffect(() => {
    if (isOpen && don) {
      setFormData({
        nom: don.nom || don.titre || "",
        lieu_retrait: don.lieu_retrait || "",
        categorie_uuid: don.categorie_uuid || "",
        description: don.description || "",
        image: null,
      });

      // Construire l'URL de l'image existante
      if (don.image) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
        setPreviewImage(`${apiUrl}${filesUrl}/${don.image}`);
      } else if (don.image_key) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
        const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
        setPreviewImage(`${apiUrl}${filesUrl}/${don.image_key}`);
      }

      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen, don]);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          setCategories(response.map((item) => ({
            uuid: item.uuid,
            libelle: item.libelle || item.type || "Sans nom",
          })));
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) errors.nom = "Le titre est obligatoire";
    if (!formData.lieu_retrait.trim()) errors.lieu_retrait = "Le lieu de retrait est obligatoire";
    if (!formData.categorie_uuid) errors.categorie_uuid = "La catégorie est obligatoire";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse. Taille maximale : 5MB.");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    if (don.image) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
      const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";
      setPreviewImage(`${apiUrl}${filesUrl}/${don.image}`);
    } else {
      setPreviewImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // SOUMISSION - SUPPRESSION DE LA VÉRIFICATION isAuthenticated
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("lieu_retrait", formData.lieu_retrait);
      formDataToSend.append("categorie_uuid", formData.categorie_uuid);
      
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // ✅ Utiliser l'endpoint UPDATE_DON_PERSO
      const response = await api.putFormData(
        API_ENDPOINTS.DONS.UPDATE_DON_PERSO(don.uuid),
        formDataToSend
      );

      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Don modifié avec succès !");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error(response?.message || "Erreur lors de la modification");
      }
    } catch (err: any) {
      console.error("Erreur modification don:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    const hasChanges = 
      formData.nom !== (don.nom || "") ||
      formData.image !== null;

    if (hasChanges && !confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?")) {
      return;
    }

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1050,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          {/* En-tête */}
          <div
            className="modal-header text-white border-0"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`,
              padding: "1.5rem 2rem",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">Modifier le don</h5>
                <p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>
                  Modifiez les informations de votre don
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

          {/* Corps */}
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert" style={{ borderRadius: "12px" }}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger fs-5 me-3" />
                  <div>
                    <h6 className="alert-heading mb-1 fw-bold">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success border-0 shadow-sm mb-4" role="alert" style={{ borderRadius: "12px" }}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-5 me-3" />
                  <div>
                    <h6 className="alert-heading mb-1 fw-bold">Succès !</h6>
                    <p className="mb-0">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Image */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faImage} className="me-2 text-primary" />
                  Photo du don
                </label>

                {previewImage ? (
                  <div className="position-relative d-inline-block">
                    <img
                      src={previewImage}
                      alt="Aperçu"
                      className="img-fluid rounded-3 shadow"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", padding: 0 }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border rounded-3 p-4 text-center"
                    style={{
                      borderStyle: "dashed",
                      borderColor: colors.oskar.grey,
                      background: colors.oskar.lightGrey + "20",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FontAwesomeIcon icon={faImage} className="fs-2 text-muted mb-2" />
                    <p className="mb-0 small">Cliquez pour ajouter une photo</p>
                    <p className="text-muted mb-0" style={{ fontSize: "0.7rem" }}>
                      JPG, PNG, WEBP, GIF (max 5MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              {/* Nom du don */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                  Titre du don *
                </label>
                <input
                  type="text"
                  name="nom"
                  className={`form-control ${validationErrors.nom ? "is-invalid" : ""}`}
                  value={formData.nom}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Chaussure Air force"
                  style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                />
                {validationErrors.nom && <div className="invalid-feedback">{validationErrors.nom}</div>}
              </div>

              {/* Lieu de retrait */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                  Lieu de retrait *
                </label>
                <input
                  type="text"
                  name="lieu_retrait"
                  className={`form-control ${validationErrors.lieu_retrait ? "is-invalid" : ""}`}
                  value={formData.lieu_retrait}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Abidjan"
                  style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                />
                {validationErrors.lieu_retrait && <div className="invalid-feedback">{validationErrors.lieu_retrait}</div>}
              </div>

              {/* Catégorie */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faList} className="me-2 text-primary" />
                  Catégorie *
                </label>
                <select
                  name="categorie_uuid"
                  className={`form-select ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                  value={formData.categorie_uuid}
                  onChange={handleChange}
                  disabled={loading || categories.length === 0}
                  style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                >
                  <option value="">Sélectionner une catégorie...</option>
                  {categories.map((cat) => (
                    <option key={cat.uuid} value={cat.uuid}>
                      {cat.libelle}
                    </option>
                  ))}
                </select>
                {validationErrors.categorie_uuid && <div className="invalid-feedback d-block">{validationErrors.categorie_uuid}</div>}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                  Description
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Chaussure Air force, 45 pointure."
                  style={{ borderRadius: "10px", padding: "0.75rem 1rem" }}
                />
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-end gap-3 mt-4 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handleClose}
                  disabled={loading}
                  style={{ borderRadius: "10px" }}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Annuler
                </button>

                <button
                  type="submit"
                  className="btn text-white px-4"
                  disabled={loading}
                  style={{
                    background: colors.oskar.green,
                    borderRadius: "10px",
                  }}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}