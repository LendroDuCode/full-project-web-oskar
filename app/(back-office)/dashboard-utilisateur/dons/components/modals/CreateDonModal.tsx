// components/dons/CreateDonModal.tsx
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
  faGift,
  faPhone,
  faBox,
  faMapMarkerAlt,
  faUser,
  faList,
  faGlobe,
  faCalendar,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface DonFormData {
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
  image: File | null;
}

interface Category {
  label: string;
  value: string;
  uuid: string;
  icon: any;
}

interface CreateDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CONDITIONS = [
  { value: "neuf", label: "Neuf" },
  { value: "tres_bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "usage", label: "État d'usage" },
  { value: "reparation", label: "À réparer" },
];

export default function CreateDonModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDonModalProps) {
  // États
  const [formData, setFormData] = useState<DonFormData>({
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
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof DonFormData, string>>
  >({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          const formatted: Category[] = response.map((item) => ({
            label: item.libelle || item.type || "Sans nom",
            value: item.uuid,
            uuid: item.uuid,
            icon: faList,
          }));
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Vérifier l'authentification
  useEffect(() => {
    if (isOpen) {
      const checkAuth = () => {
        const token = api.getToken();
        const authenticated = !!token;
        setIsAuthenticated(authenticated);

        if (!authenticated) {
          setError("Vous devez être connecté pour créer un don.");
        }
      };

      checkAuth();

      // Réinitialiser le formulaire
      setFormData({
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
        image: null,
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
    const errors: Partial<Record<keyof DonFormData, string>> = {};

    if (!formData.titre.trim()) {
      errors.titre = "Le titre est obligatoire";
    }

    if (!formData.type_don.trim()) {
      errors.type_don = "Le type de don est obligatoire";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    }

    if (!formData.localisation.trim()) {
      errors.localisation = "La localisation est obligatoire";
    }

    if (!formData.lieu_retrait.trim()) {
      errors.lieu_retrait = "Le lieu de retrait est obligatoire";
    }

    if (!formData.nom_donataire.trim()) {
      errors.nom_donataire = "Le nom du donataire est obligatoire";
    }

    if (!formData.numero.trim()) {
      errors.numero = "Le numéro de contact est obligatoire";
    }

    if (!formData.categorie_uuid) {
      errors.categorie_uuid = "La catégorie est obligatoire";
    }

    if (parseInt(formData.quantite) < 1) {
      errors.quantite = "La quantité doit être au moins 1";
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
    if (validationErrors[name as keyof DonFormData]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof DonFormData];
        return newErrors;
      });
    }
  };

  // Gestion du changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        image: file,
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
      image: null,
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

    if (!isAuthenticated) {
      setError("Vous devez être connecté pour créer un don.");
      return;
    }

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer FormData
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

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Envoyer avec l'API
      const response = await api.postFormData(
        API_ENDPOINTS.DONS.CREATE,
        formDataToSend,
        {
          requiresAuth: true,
        },
      );

      // Vérifier la réponse
      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Don créé avec succès !");
      } else {
        throw new Error(
          response?.message || "La création a échoué sans message d'erreur",
        );
      }

      // Réinitialiser le formulaire
      setFormData({
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
        image: null,
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

      let errorMessage = err.message || "Erreur lors de la création du don";

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

    const hasChanges = Object.values(formData).some(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== "1" &&
        value !== "bon" &&
        value !== "immediate",
    );

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
      aria-labelledby="createDonModalLabel"
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
              background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faGift} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createDonModalLabel"
                >
                  Créer un Nouveau Don
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Offrez un objet ou service gratuitement
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
                      Vous devez être connecté pour créer un don.
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
                {/* Titre */}
                <div className="col-md-12">
                  <label htmlFor="titre" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Titre du don <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    className={`form-control ${validationErrors.titre ? "is-invalid" : ""}`}
                    placeholder="Ex: Feu"
                    value={formData.titre}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.titre && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.titre}
                    </div>
                  )}
                </div>

                {/* Type de don */}
                <div className="col-md-6">
                  <label htmlFor="type_don" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faGift} className="me-2" />
                    Type de don <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="type_don"
                    name="type_don"
                    className={`form-control ${validationErrors.type_don ? "is-invalid" : ""}`}
                    placeholder="Ex: Allumette"
                    value={formData.type_don}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.type_don && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.type_don}
                    </div>
                  )}
                </div>

                {/* Catégorie */}
                <div className="col-md-6">
                  <label
                    htmlFor="categorie_uuid"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faList} className="me-2" />
                    Catégorie <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categorie_uuid"
                    name="categorie_uuid"
                    className={`form-select ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                    value={formData.categorie_uuid}
                    onChange={handleChange}
                    disabled={
                      loading || !isAuthenticated || categories.length === 0
                    }
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.uuid}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.categorie_uuid && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.categorie_uuid}
                    </div>
                  )}
                </div>

                {/* Localisation */}
                <div className="col-md-6">
                  <label
                    htmlFor="localisation"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Localisation <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="localisation"
                    name="localisation"
                    className={`form-control ${validationErrors.localisation ? "is-invalid" : ""}`}
                    placeholder="Ex: Abidjan, Cocody"
                    value={formData.localisation}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.localisation && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.localisation}
                    </div>
                  )}
                </div>

                {/* Lieu de retrait */}
                <div className="col-md-6">
                  <label
                    htmlFor="lieu_retrait"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Lieu de retrait <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="lieu_retrait"
                    name="lieu_retrait"
                    className={`form-control ${validationErrors.lieu_retrait ? "is-invalid" : ""}`}
                    placeholder="Ex: Centre jeunesse Abobo Baoulé"
                    value={formData.lieu_retrait}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.lieu_retrait && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.lieu_retrait}
                    </div>
                  )}
                </div>

                {/* Quantité */}
                <div className="col-md-4">
                  <label htmlFor="quantite" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faBox} className="me-2" />
                    Quantité <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantite"
                    name="quantite"
                    className={`form-control ${validationErrors.quantite ? "is-invalid" : ""}`}
                    value={formData.quantite}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    min="1"
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.quantite && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.quantite}
                    </div>
                  )}
                </div>

                {/* État */}
                <div className="col-md-4">
                  <label htmlFor="condition" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    État
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    className="form-select"
                    value={formData.condition}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disponibilité */}
                <div className="col-md-4">
                  <label
                    htmlFor="disponibilite"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Disponibilité
                  </label>
                  <select
                    id="disponibilite"
                    name="disponibilite"
                    className="form-select"
                    value={formData.disponibilite}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="immediate">Immédiate</option>
                    <option value="semaine">Cette semaine</option>
                    <option value="mois">Ce mois-ci</option>
                  </select>
                </div>

                {/* Nom du donataire */}
                <div className="col-md-6">
                  <label
                    htmlFor="nom_donataire"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Votre nom/organisation{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom_donataire"
                    name="nom_donataire"
                    className={`form-control ${validationErrors.nom_donataire ? "is-invalid" : ""}`}
                    placeholder="Ex: Association Solidarité"
                    value={formData.nom_donataire}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.nom_donataire && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.nom_donataire}
                    </div>
                  )}
                </div>

                {/* Numéro de contact */}
                <div className="col-md-6">
                  <label htmlFor="numero" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                    Numéro de contact <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    id="numero"
                    name="numero"
                    className={`form-control ${validationErrors.numero ? "is-invalid" : ""}`}
                    placeholder="Ex: 000002222222"
                    value={formData.numero}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.numero && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.numero}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Description détaillée <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                    rows={4}
                    placeholder="Décrivez ce que vous donnez..."
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
                </div>

                {/* Image */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Photo du don
                    <span className="text-muted ms-1 fw-normal">
                      (Optionnel mais recommandé)
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
                      id="image"
                      name="image"
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
                      Formats acceptés: JPG, PNG, WEBP, GIF (max 5MB).
                      {!previewImage &&
                        " Si aucune image n'est fournie, une image par défaut sera utilisée."}
                    </small>
                  </div>
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
                  border: `1px solid ${isAuthenticated ? colors.oskar.greenHover : colors.oskar.grey}`,
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
                    Créer le Don
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
          box-shadow: 0 0 0 0.25rem ${colors.oskar.greenHover}25;
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
