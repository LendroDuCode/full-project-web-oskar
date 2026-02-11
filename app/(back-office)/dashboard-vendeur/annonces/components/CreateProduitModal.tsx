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
  faShieldAlt,
  faHandHoldingHeart,
  faLayerGroup,
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
  { value: "neuf", label: "Neuf", icon: "🆕", color: colors.oskar.green },
  {
    value: "tres_bon",
    label: "Très bon état",
    icon: "✨",
    color: colors.oskar.blue,
  },
  { value: "bon", label: "Bon état", icon: "👍", color: colors.oskar.yellow },
  {
    value: "usage",
    label: "État d'usage",
    icon: "🔧",
    color: colors.oskar.orange,
  },
  {
    value: "reparation",
    label: "À réparer",
    icon: "⚡",
    color: colors.oskar.red,
  },
];

export default function CreateProduitModal({
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
  const [activeStep, setActiveStep] = useState(1);
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
      setActiveStep(1);
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

  // Navigation des étapes
  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
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
        {},
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
        backdropFilter: "blur(3px)",
      }}
      role="dialog"
      aria-labelledby="createDonModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{ borderRadius: "20px" }}
        >
          {/* En-tête avec progression */}
          <div
            className="modal-header border-0 position-relative"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)`,
              padding: "1.5rem 2rem",
            }}
          >
            {/* Éléments décoratifs */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
              <div className="position-absolute top-0 end-0">
                <FontAwesomeIcon
                  icon={faHandHoldingHeart}
                  className="text-white"
                  style={{ fontSize: "8rem", opacity: 0.1 }}
                />
              </div>
            </div>

            <div className="position-relative z-1 w-100">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-3 me-3 shadow">
                    <FontAwesomeIcon
                      icon={faGift}
                      className="fs-4 text-white"
                    />
                  </div>
                  <div>
                    <h5
                      className="modal-title mb-0 fw-bold text-white"
                      id="createDonModalLabel"
                    >
                      Nouveau Don
                    </h5>
                    <p className="mb-0 text-white opacity-90">
                      Partagez un objet ou service avec la communauté
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white bg-white bg-opacity-25 rounded-circle p-2"
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Fermer"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                />
              </div>

              {/* Barre de progression */}
              <div className="progress-container">
                <div className="d-flex justify-content-between align-items-center position-relative">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="d-flex flex-column align-items-center position-relative"
                    >
                      <div
                        className={`progress-step rounded-circle d-flex align-items-center justify-content-center ${activeStep >= step ? "active" : ""}`}
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor:
                            activeStep >= step
                              ? colors.oskar.orange
                              : "rgba(255,255,255,0.2)",
                          border: `3px solid ${activeStep >= step ? colors.oskar.orange : "rgba(255,255,255,0.3)"}`,
                          color: "white",
                          fontWeight: "bold",
                          zIndex: 2,
                        }}
                      >
                        {step === 1 && <FontAwesomeIcon icon={faTag} />}
                        {step === 2 && <FontAwesomeIcon icon={faInfoCircle} />}
                        {step === 3 && <FontAwesomeIcon icon={faImage} />}
                      </div>
                      <span
                        className="text-white mt-2 fw-medium"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {step === 1 && "Informations"}
                        {step === 2 && "Détails"}
                        {step === 3 && "Finalisation"}
                      </span>
                      {step < 3 && (
                        <div
                          className="progress-line"
                          style={{
                            position: "absolute",
                            top: "25px",
                            left: "calc(50% + 25px)",
                            width: "100%",
                            height: "3px",
                            backgroundColor:
                              activeStep > step
                                ? colors.oskar.orange
                                : "rgba(255,255,255,0.3)",
                            zIndex: 1,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className="modal-body p-0">
            {/* Messages d'alerte */}
            <div className="container px-4 pt-4">
              {!isAuthenticated && (
                <div
                  className="alert alert-warning border-0 shadow-sm mb-4 animate__animated animate__fadeIn"
                  role="alert"
                  style={{
                    borderRadius: "12px",
                    borderLeft: `4px solid ${colors.oskar.orange}`,
                    background: `linear-gradient(135deg, ${colors.oskar.orange}10 0%, ${colors.oskar.yellow}10 100%)`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faLock}
                        className="text-warning fs-5"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1 fw-bold">
                        Authentification requise
                      </h6>
                      <p className="mb-0">
                        Connectez-vous pour pouvoir créer et partager des dons
                        avec la communauté.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="alert alert-danger border-0 shadow-sm mb-4 animate__animated animate__shakeX"
                  role="alert"
                  style={{
                    borderRadius: "12px",
                    borderLeft: `4px solid ${colors.oskar.red}`,
                    background: `linear-gradient(135deg, ${colors.oskar.red}10 0%, ${colors.oskar.orange}10 100%)`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.red}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-danger fs-5"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1 fw-bold">Erreur</h6>
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

              {successMessage && (
                <div
                  className="alert alert-success border-0 shadow-sm mb-4 animate__animated animate__fadeIn"
                  role="alert"
                  style={{
                    borderRadius: "12px",
                    borderLeft: `4px solid ${colors.oskar.green}`,
                    background: `linear-gradient(135deg, ${colors.oskar.green}10 0%, ${colors.oskar.blue}10 100%)`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.green}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success fs-5"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1 fw-bold">Succès !</h6>
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
            </div>

            {/* Formulaire avec onglets */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="container px-4 pb-4">
                <div className="row g-4">
                  {/* Étape 1: Informations de base */}
                  {activeStep === 1 && (
                    <>
                      <div className="col-12">
                        <div
                          className="card border-0 shadow-sm mb-4"
                          style={{ borderRadius: "15px" }}
                        >
                          <div className="card-header bg-transparent border-0 py-3">
                            <h6 className="mb-0 fw-bold text-dark">
                              <FontAwesomeIcon
                                icon={faTag}
                                className="me-2 text-primary"
                              />
                              Informations de base
                            </h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="row g-3">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label
                                    htmlFor="titre"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faGift}
                                      className="me-2"
                                    />
                                    Titre du don{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="titre"
                                    name="titre"
                                    className={`form-control form-control-lg ${validationErrors.titre ? "is-invalid" : ""}`}
                                    placeholder="Ex: Table basse en bois massif"
                                    value={formData.titre}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.titre && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.titre}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="type_don"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faLayerGroup}
                                      className="me-2"
                                    />
                                    Type de don{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="type_don"
                                    name="type_don"
                                    className={`form-control ${validationErrors.type_don ? "is-invalid" : ""}`}
                                    placeholder="Ex: Meuble"
                                    value={formData.type_don}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.type_don && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.type_don}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="categorie_uuid"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faList}
                                      className="me-2"
                                    />
                                    Catégorie{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    id="categorie_uuid"
                                    name="categorie_uuid"
                                    className={`form-select ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                                    value={formData.categorie_uuid}
                                    onChange={handleChange}
                                    disabled={
                                      loading ||
                                      !isAuthenticated ||
                                      categories.length === 0
                                    }
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  >
                                    <option value="">
                                      Choisir une catégorie...
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
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.categorie_uuid}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-12">
                                <div className="form-group">
                                  <label
                                    htmlFor="description"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faFileAlt}
                                      className="me-2"
                                    />
                                    Description{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <textarea
                                    id="description"
                                    name="description"
                                    className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                                    rows={3}
                                    placeholder="Décrivez votre don en détail..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.description && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Étape 2: Localisation et contact */}
                  {activeStep === 2 && (
                    <>
                      <div className="col-12">
                        <div
                          className="card border-0 shadow-sm mb-4"
                          style={{ borderRadius: "15px" }}
                        >
                          <div className="card-header bg-transparent border-0 py-3">
                            <h6 className="mb-0 fw-bold text-dark">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="me-2 text-primary"
                              />
                              Localisation & Contact
                            </h6>
                          </div>
                          <div className="card-body pt-0">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="localisation"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faMapMarkerAlt}
                                      className="me-2"
                                    />
                                    Ville/Quartier{" "}
                                    <span className="text-danger">*</span>
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
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.localisation && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.localisation}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="lieu_retrait"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faGlobe}
                                      className="me-2"
                                    />
                                    Lieu de retrait{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="lieu_retrait"
                                    name="lieu_retrait"
                                    className={`form-control ${validationErrors.lieu_retrait ? "is-invalid" : ""}`}
                                    placeholder="Ex: Centre jeunesse Abobo"
                                    value={formData.lieu_retrait}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.lieu_retrait && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.lieu_retrait}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="nom_donataire"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faUser}
                                      className="me-2"
                                    />
                                    Votre nom{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="nom_donataire"
                                    name="nom_donataire"
                                    className={`form-control ${validationErrors.nom_donataire ? "is-invalid" : ""}`}
                                    placeholder="Ex: Jean Dupont"
                                    value={formData.nom_donataire}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.nom_donataire && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.nom_donataire}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label
                                    htmlFor="numero"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPhone}
                                      className="me-2"
                                    />
                                    Numéro de contact{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    id="numero"
                                    name="numero"
                                    className={`form-control ${validationErrors.numero ? "is-invalid" : ""}`}
                                    placeholder="Ex: 07 00 00 00 00"
                                    value={formData.numero}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.numero && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.numero}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-4">
                                <div className="form-group">
                                  <label
                                    htmlFor="quantite"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faBox}
                                      className="me-2"
                                    />
                                    Quantité{" "}
                                    <span className="text-danger">*</span>
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
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  />
                                  {validationErrors.quantite && (
                                    <div className="invalid-feedback d-block animate__animated animate__fadeIn">
                                      <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className="me-1"
                                      />
                                      {validationErrors.quantite}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-4">
                                <div className="form-group">
                                  <label
                                    htmlFor="condition"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faShieldAlt}
                                      className="me-2"
                                    />
                                    État
                                  </label>
                                  <select
                                    id="condition"
                                    name="condition"
                                    className="form-select"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  >
                                    {CONDITIONS.map((cond) => (
                                      <option
                                        key={cond.value}
                                        value={cond.value}
                                      >
                                        <span className="me-2">
                                          {cond.icon}
                                        </span>
                                        {cond.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="col-md-4">
                                <div className="form-group">
                                  <label
                                    htmlFor="disponibilite"
                                    className="form-label fw-semibold"
                                  >
                                    <FontAwesomeIcon
                                      icon={faCalendar}
                                      className="me-2"
                                    />
                                    Disponibilité
                                  </label>
                                  <select
                                    id="disponibilite"
                                    name="disponibilite"
                                    className="form-select"
                                    value={formData.disponibilite}
                                    onChange={handleChange}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef",
                                    }}
                                  >
                                    <option value="immediate">Immédiate</option>
                                    <option value="semaine">
                                      Cette semaine
                                    </option>
                                    <option value="mois">Ce mois-ci</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Étape 3: Image et finalisation */}
                  {activeStep === 3 && (
                    <>
                      <div className="col-12">
                        <div
                          className="card border-0 shadow-sm mb-4"
                          style={{ borderRadius: "15px" }}
                        >
                          <div className="card-header bg-transparent border-0 py-3">
                            <h6 className="mb-0 fw-bold text-dark">
                              <FontAwesomeIcon
                                icon={faImage}
                                className="me-2 text-primary"
                              />
                              Photo & Finalisation
                            </h6>
                          </div>
                          <div className="card-body pt-0">
                            {/* Aperçu de l'image */}
                            {previewImage && (
                              <div className="mb-4 text-center">
                                <div className="position-relative d-inline-block">
                                  <img
                                    src={previewImage}
                                    alt="Aperçu de l'image"
                                    className="img-fluid rounded-3 shadow-lg"
                                    style={{
                                      maxWidth: "300px",
                                      maxHeight: "300px",
                                      objectFit: "cover",
                                      border: `3px solid ${colors.oskar.green}30`,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger position-absolute top-0 end-0 m-2 shadow"
                                    onClick={handleRemoveImage}
                                    disabled={loading || !isAuthenticated}
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    title="Supprimer l'image"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Upload d'image */}
                            <div
                              className="card border-dashed"
                              style={{ borderRadius: "15px" }}
                            >
                              <div className="card-body text-center p-5">
                                <div className="mb-4">
                                  <FontAwesomeIcon
                                    icon={faImage}
                                    className="text-muted"
                                    style={{ fontSize: "4rem" }}
                                  />
                                </div>
                                <h5 className="mb-3 fw-bold">
                                  {previewImage
                                    ? "Changer la photo"
                                    : "Ajouter une photo"}
                                </h5>
                                <p className="text-muted mb-4">
                                  Une photo augmente vos chances de trouver un
                                  preneur
                                </p>
                                <div className="d-flex justify-content-center">
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="image"
                                    name="image"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading || !isAuthenticated}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary d-flex align-items-center px-4 py-3"
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    disabled={loading || !isAuthenticated}
                                    style={{ borderRadius: "10px" }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faUpload}
                                      className="me-2"
                                    />
                                    {previewImage
                                      ? "Changer l'image"
                                      : "Choisir une image"}
                                  </button>
                                </div>
                                <div className="mt-3">
                                  <small className="text-muted">
                                    Formats: JPG, PNG, WEBP, GIF (max 5MB)
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* Résumé */}
                            <div className="mt-4">
                              <h6 className="fw-bold mb-3">
                                Résumé de votre don
                              </h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                      <FontAwesomeIcon
                                        icon={faTag}
                                        className="text-primary"
                                      />
                                    </div>
                                    <div>
                                      <small className="text-muted d-block">
                                        Titre
                                      </small>
                                      <p className="mb-0 fw-semibold">
                                        {formData.titre || "Non spécifié"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                      <FontAwesomeIcon
                                        icon={faBox}
                                        className="text-success"
                                      />
                                    </div>
                                    <div>
                                      <small className="text-muted d-block">
                                        Quantité
                                      </small>
                                      <p className="mb-0 fw-semibold">
                                        {formData.quantite}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                                      <FontAwesomeIcon
                                        icon={faMapMarkerAlt}
                                        className="text-warning"
                                      />
                                    </div>
                                    <div>
                                      <small className="text-muted d-block">
                                        Localisation
                                      </small>
                                      <p className="mb-0 fw-semibold">
                                        {formData.localisation ||
                                          "Non spécifié"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                      <FontAwesomeIcon
                                        icon={faUser}
                                        className="text-info"
                                      />
                                    </div>
                                    <div>
                                      <small className="text-muted d-block">
                                        Donataire
                                      </small>
                                      <p className="mb-0 fw-semibold">
                                        {formData.nom_donataire ||
                                          "Non spécifié"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pied de page avec navigation */}
              <div className="modal-footer border-top-0 pt-4 px-4 pb-4">
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <div>
                    {activeStep > 1 ? (
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2"
                        onClick={prevStep}
                        disabled={loading || !isAuthenticated}
                        style={{ borderRadius: "10px" }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Précédent
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2"
                        onClick={handleClose}
                        disabled={loading}
                        style={{ borderRadius: "10px" }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Annuler
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-3">
                    {activeStep < 3 && (
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                        onClick={nextStep}
                        disabled={loading || !isAuthenticated}
                        style={{ borderRadius: "10px" }}
                      >
                        Suivant
                        <FontAwesomeIcon icon={faSave} />
                      </button>
                    )}

                    {activeStep === 3 && (
                      <button
                        type="button"
                        className="btn btn-success d-flex align-items-center gap-2 px-4 py-2 shadow"
                        onClick={handleSubmit}
                        disabled={loading || !isAuthenticated}
                        style={{
                          borderRadius: "10px",
                          background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover} 100%)`,
                          border: "none",
                          minWidth: "180px",
                        }}
                      >
                        {loading ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Création...
                          </>
                        ) : !isAuthenticated ? (
                          <>
                            <FontAwesomeIcon icon={faLock} />
                            Connexion requise
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faGift} />
                            Publier le don
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 20px !important;
          overflow: hidden;
        }

        .form-control,
        .form-select {
          border-radius: 10px !important;
          transition: all 0.3s ease;
          padding: 0.75rem 1rem;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}25 !important;
          transform: translateY(-1px);
        }

        .form-control-lg {
          font-size: 1.1rem;
          padding: 1rem 1.25rem;
        }

        .card {
          border-radius: 15px !important;
          border: none;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .btn {
          border-radius: 10px !important;
          transition: all 0.3s ease;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn:active {
          transform: translateY(0);
        }

        .progress-step {
          transition: all 0.3s ease;
        }

        .progress-step.active {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
          }
        }

        .border-dashed {
          border: 2px dashed #dee2e6 !important;
        }

        .animate__animated {
          --animate-duration: 0.3s;
        }

        @media (max-width: 768px) {
          .modal-dialog {
            margin: 1rem;
          }

          .progress-step {
            width: 40px !important;
            height: 40px !important;
          }

          .progress-line {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
