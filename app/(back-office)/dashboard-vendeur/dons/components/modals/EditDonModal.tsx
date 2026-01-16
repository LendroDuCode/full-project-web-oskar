"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEdit,
  faSpinner,
  faImage,
  faTag,
  faAlignLeft,
  faMapMarkerAlt,
  faBox,
  faUser,
  faPhone,
  faGlobe,
  faInfoCircle,
  faCamera,
  faList,
  faCheckCircle,
  faExclamationTriangle,
  faTrash,
  faUpload,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface EditDonModalProps {
  isOpen: boolean;
  don: any; // Le don à modifier
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  titre: string;
  type_don: string;
  description: string;
  localisation: string;
  lieu_retrait: string;
  quantite: string;
  nom_donataire: string;
  numero: string;
  condition: string;
  disponibilite: string;
  categorie_uuid: string;
  imageFile?: File | null;
}

interface Category {
  label: string;
  value: string;
  uuid: string;
  icon: any;
}

interface ValidationErrors {
  [key: string]: string;
}

const CONDITIONS = [
  { value: "neuf", label: "Neuf (jamais utilisé)" },
  { value: "tres_bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "moyen", label: "État moyen" },
  { value: "a_renover", label: "À rénover/réparer" },
];

const DISPONIBILITES = [
  { value: "immediate", label: "Immédiate" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois-ci" },
];

export default function EditDonModal({
  isOpen,
  don,
  onClose,
  onSuccess,
}: EditDonModalProps) {
  // États
  const [formData, setFormData] = useState<FormData>({
    titre: "",
    type_don: "",
    description: "",
    localisation: "",
    lieu_retrait: "",
    quantite: "1",
    nom_donataire: "",
    numero: "",
    condition: "bon",
    disponibilite: "immediate",
    categorie_uuid: "",
    imageFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingDon, setLoadingDon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les données du don et les catégories
  useEffect(() => {
    if (isOpen && don) {
      const loadData = async () => {
        try {
          setLoadingDon(true);

          // Charger les catégories
          const categoriesResponse = await api.get(
            API_ENDPOINTS.CATEGORIES.LIST,
          );
          if (Array.isArray(categoriesResponse)) {
            const formattedCategories: Category[] = categoriesResponse.map(
              (item) => ({
                label: item.libelle || item.type || "Sans nom",
                value: item.uuid,
                uuid: item.uuid,
                icon: faList,
              }),
            );
            setCategories(formattedCategories);
          }

          // Pré-remplir le formulaire avec les données du don
          setFormData({
            titre: don.titre || "",
            type_don: don.type_don || "",
            description: don.description || "",
            localisation: don.localisation || "",
            lieu_retrait: don.lieu_retrait || "",
            quantite: don.quantite?.toString() || "1",
            nom_donataire: don.nom_donataire || "",
            numero: don.numero || "",
            condition: don.condition || "bon",
            disponibilite: don.disponibilite || "immediate",
            categorie_uuid: don.categorie_uuid || "",
            imageFile: null,
          });

          // Définir l'image existante comme aperçu
          if (don.image) {
            setPreviewImage(don.image);
          }

          setError(null);
          setSuccessMessage(null);
          setValidationErrors({});
        } catch (err) {
          console.error("Erreur chargement données:", err);
          setError("Impossible de charger les données");
        } finally {
          setCategoriesLoading(false);
          setLoadingDon(false);
        }
      };

      loadData();
    }
  }, [isOpen, don]);

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

    if (!formData.titre.trim()) {
      errors.titre = "Le titre est obligatoire";
    } else if (formData.titre.length < 2) {
      errors.titre = "Le titre doit contenir au moins 2 caractères";
    }

    if (!formData.type_don.trim()) {
      errors.type_don = "Le type de don est obligatoire";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    } else if (formData.description.length < 10) {
      errors.description =
        "La description doit contenir au moins 10 caractères";
    }

    if (!formData.localisation.trim()) {
      errors.localisation = "La localisation est obligatoire";
    }

    if (!formData.lieu_retrait.trim()) {
      errors.lieu_retrait = "Le lieu de retrait est obligatoire";
    }

    if (!formData.quantite.trim() || parseInt(formData.quantite) < 1) {
      errors.quantite = "La quantité doit être au moins 1";
    }

    if (!formData.nom_donataire.trim()) {
      errors.nom_donataire = "Le nom du donataire est obligatoire";
    }

    if (!formData.numero.trim()) {
      errors.numero = "Le numéro de contact est obligatoire";
    } else if (!/^[0-9+\s\-()]{8,}$/.test(formData.numero)) {
      errors.numero = "Numéro de contact invalide";
    }

    if (!formData.categorie_uuid.trim()) {
      errors.categorie_uuid = "La catégorie est obligatoire";
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
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gestion du changement de fichier
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.",
        );
        return;
      }

      // Vérifier la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse. Taille maximale : 5MB.");
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

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!don || !don.uuid) {
      setError("Don non trouvé");
      return;
    }

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer FormData pour l'envoi
      const formDataToSend = new FormData();
      formDataToSend.append("titre", formData.titre.trim());
      formDataToSend.append("type_don", formData.type_don.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("localisation", formData.localisation.trim());
      formDataToSend.append("lieu_retrait", formData.lieu_retrait.trim());
      formDataToSend.append("quantite", formData.quantite);
      formDataToSend.append("nom_donataire", formData.nom_donataire.trim());
      formDataToSend.append("numero", formData.numero.trim());
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("disponibilite", formData.disponibilite);
      formDataToSend.append("categorie_uuid", formData.categorie_uuid);

      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      // Envoyer avec l'API client (PUT pour mise à jour)
      const response = await api.putFormData(
        API_ENDPOINTS.DONS.UPDATE(don.uuid),
        formDataToSend,
        {
          requiresAuth: true,
        },
      );

      console.log("✅ Réponse API modification don:", response);

      // Vérifier la réponse
      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Don modifié avec succès !");
      } else {
        throw new Error(
          response?.message || "La modification a échoué sans message d'erreur",
        );
      }

      // Fermer la modal après succès
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur lors de la modification du don:", err);

      let errorMessage = err.message || "Erreur lors de la modification du don";

      // Messages d'erreur spécifiques
      if (
        errorMessage.includes("Authentification") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorMessage = "Authentification requise. Veuillez vous reconnecter.";
      }

      setError(errorMessage);
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

    onClose();
  };

  if (!isOpen || !don) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="editDonModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`,
              borderBottom: `3px solid ${colors.oskar.blue}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold" id="editDonModalLabel">
                  Modifier le Don : {don.titre}
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Modifiez les informations du don
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading || loadingDon}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Corps */}
          <div
            className="modal-body py-4"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
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

            {loadingDon ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">
                  Chargement des données du don...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row g-4">
                  {/* Colonne gauche - Informations principales */}
                  <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="fw-bold mb-0 text-dark">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-warning me-2"
                          />
                          Informations principales
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label
                              htmlFor="titre"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faTag}
                                className="me-2 text-warning"
                              />
                              Titre du don *
                            </label>
                            <input
                              type="text"
                              id="titre"
                              name="titre"
                              className={`form-control ${validationErrors.titre ? "is-invalid" : ""}`}
                              placeholder="Ex: Feu"
                              value={formData.titre}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.titre && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.titre}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="type_don"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faTag}
                                className="me-2 text-warning"
                              />
                              Type de don *
                            </label>
                            <input
                              type="text"
                              id="type_don"
                              name="type_don"
                              className={`form-control ${validationErrors.type_don ? "is-invalid" : ""}`}
                              placeholder="Ex: Allumette"
                              value={formData.type_don}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.type_don && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.type_don}
                              </div>
                            )}
                          </div>

                          <div className="col-12">
                            <label
                              htmlFor="description"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faAlignLeft}
                                className="me-2 text-warning"
                              />
                              Description détaillée *
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                              rows={3}
                              placeholder="Décrivez ce que vous donnez..."
                              value={formData.description}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.description && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.description}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="localisation"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-2 text-warning"
                              />
                              Localisation *
                            </label>
                            <input
                              type="text"
                              id="localisation"
                              name="localisation"
                              className={`form-control ${validationErrors.localisation ? "is-invalid" : ""}`}
                              placeholder="Ex: Abidjan, Cocody"
                              value={formData.localisation}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.localisation && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.localisation}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="lieu_retrait"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-2 text-warning"
                              />
                              Lieu de retrait *
                            </label>
                            <input
                              type="text"
                              id="lieu_retrait"
                              name="lieu_retrait"
                              className={`form-control ${validationErrors.lieu_retrait ? "is-invalid" : ""}`}
                              placeholder="Ex: Centre jeunesse Abobo"
                              value={formData.lieu_retrait}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.lieu_retrait && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.lieu_retrait}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="quantite"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faBox}
                                className="me-2 text-warning"
                              />
                              Quantité *
                            </label>
                            <input
                              type="number"
                              id="quantite"
                              name="quantite"
                              className={`form-control ${validationErrors.quantite ? "is-invalid" : ""}`}
                              min="1"
                              value={formData.quantite}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.quantite && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.quantite}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="disponibilite"
                              className="form-label fw-semibold"
                            >
                              Disponibilité
                            </label>
                            <select
                              id="disponibilite"
                              name="disponibilite"
                              className="form-select"
                              value={formData.disponibilite}
                              onChange={handleChange}
                              disabled={loading}
                            >
                              {DISPONIBILITES.map((disp) => (
                                <option key={disp.value} value={disp.value}>
                                  {disp.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="fw-bold mb-0 text-dark">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-warning me-2"
                          />
                          Informations de contact
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label
                              htmlFor="nom_donataire"
                              className="form-label fw-semibold"
                            >
                              Nom du donataire *
                            </label>
                            <input
                              type="text"
                              id="nom_donataire"
                              name="nom_donataire"
                              className={`form-control ${validationErrors.nom_donataire ? "is-invalid" : ""}`}
                              placeholder="Votre nom ou organisation"
                              value={formData.nom_donataire}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.nom_donataire && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.nom_donataire}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="numero"
                              className="form-label fw-semibold"
                            >
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-2 text-warning"
                              />
                              Numéro de contact *
                            </label>
                            <input
                              type="tel"
                              id="numero"
                              name="numero"
                              className={`form-control ${validationErrors.numero ? "is-invalid" : ""}`}
                              placeholder="Ex: 000002222222"
                              value={formData.numero}
                              onChange={handleChange}
                              disabled={loading}
                            />
                            {validationErrors.numero && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.numero}
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label
                              htmlFor="condition"
                              className="form-label fw-semibold"
                            >
                              État du produit
                            </label>
                            <select
                              id="condition"
                              name="condition"
                              className="form-select"
                              value={formData.condition}
                              onChange={handleChange}
                              disabled={loading}
                            >
                              {CONDITIONS.map((cond) => (
                                <option key={cond.value} value={cond.value}>
                                  {cond.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite - Photo & Catégorie */}
                  <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="fw-bold mb-0 text-dark">
                          <FontAwesomeIcon
                            icon={faCamera}
                            className="text-warning me-2"
                          />
                          Photo du don
                        </h6>
                      </div>
                      <div className="card-body">
                        {/* Aperçu de l'image */}
                        {previewImage ? (
                          <div className="position-relative mb-3">
                            <img
                              src={previewImage}
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
                              onClick={handleRemoveImage}
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                              style={{ width: "32px", height: "32px" }}
                              disabled={loading}
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
                              Aucune photo
                            </p>
                          </div>
                        )}

                        {/* Upload button */}
                        <div className="d-grid">
                          <label
                            className={`btn btn-outline-warning ${loading ? "disabled" : ""}`}
                          >
                            <FontAwesomeIcon icon={faCamera} className="me-2" />
                            {previewImage
                              ? "Changer la photo"
                              : "Ajouter une photo"}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={handleFileChange}
                              disabled={loading}
                            />
                          </label>
                        </div>
                        <small className="text-muted mt-2 d-block">
                          Formats: JPG, PNG, WEBP, GIF (max 5MB)
                        </small>
                      </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 py-3">
                        <h6 className="fw-bold mb-0 text-dark">
                          <FontAwesomeIcon
                            icon={faList}
                            className="text-warning me-2"
                          />
                          Catégorie *
                        </h6>
                      </div>
                      <div className="card-body">
                        {categoriesLoading ? (
                          <div className="text-center py-3">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Chargement des catégories...
                          </div>
                        ) : (
                          <>
                            <select
                              id="categorie_uuid"
                              name="categorie_uuid"
                              className={`form-select ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                              value={formData.categorie_uuid}
                              onChange={handleChange}
                              disabled={loading}
                            >
                              <option value="">
                                Sélectionnez une catégorie
                              </option>
                              {categories.map((category) => (
                                <option
                                  key={category.uuid}
                                  value={category.uuid}
                                >
                                  {category.label}
                                </option>
                              ))}
                            </select>
                            {validationErrors.categorie_uuid && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.categorie_uuid}
                              </div>
                            )}
                          </>
                        )}

                        <div className="alert alert-info border-0 mt-3 mb-0">
                          <small className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-2"
                            />
                            Laisser vide pour garder l'image actuelle
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 py-3 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleClose}
                disabled={loading || loadingDon}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Annuler
              </button>

              <button
                type="button"
                className="btn btn-primary text-white d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={loading || loadingDon}
                style={{
                  background: colors.oskar.blue,
                  border: `1px solid ${colors.oskar.blue}`,
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEdit} />
                    Modifier le Don
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

        .fs-14 {
          font-size: 14px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
