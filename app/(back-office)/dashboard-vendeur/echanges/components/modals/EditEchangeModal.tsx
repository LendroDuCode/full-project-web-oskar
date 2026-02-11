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
  faExchangeAlt,
  faPhone,
  faBox,
  faHandHoldingHeart,
  faEdit,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

// Interfaces
interface Category {
  label: string;
  value: string;
  uuid: string;
  icon?: IconDefinition;
}

interface EchangeFormData {
  nomElementEchange: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  categorie_uuid: string;
  quantite: string;
  prix: string;
  numero: string;
  message: string;
  image: File | null;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string;
  image: string;
  typeDestinataire: string;
  typeEchange: string;
  agent: string;
  utilisateur: string;
  vendeur: string;
  objetPropose: string;
  objetDemande: string;
  estPublie: boolean | null;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  dateRefus: string | null;
  categorie: string;
  createdAt: string | null;
  updatedAt: string | null;
  [key: string]: any;
}

interface EditEchangeModalProps {
  isOpen: boolean;
  echange: Echange;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditEchangeModal({
  isOpen,
  echange,
  onClose,
  onSuccess,
}: EditEchangeModalProps) {
  // États
  const [formData, setFormData] = useState<EchangeFormData>({
    nomElementEchange: "",
    typeEchange: echange.typeEchange,
    objetPropose: "",
    objetDemande: "",
    categorie_uuid: "",
    quantite: "1",
    prix: "",
    numero: "",
    message: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof EchangeFormData, string>>
  >({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser avec les données de l'échange
  useEffect(() => {
    if (isOpen && echange) {
      const checkAuth = () => {
        const token = api.getToken();
        setIsAuthenticated(!!token);
      };

      checkAuth();

      // Charger les catégories
      const fetchCategories = async () => {
        try {
          const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
          if (Array.isArray(response)) {
            const formatted: Category[] = response.map((item: any) => ({
              label: item.libelle || item.type || "Sans nom",
              value: item.uuid,
              uuid: item.uuid,
              icon: faExchangeAlt,
            }));
            setCategories(formatted);
          }
        } catch (err) {
          console.error("Erreur chargement catégories:", err);
        }
      };

      fetchCategories();

      // Pré-remplir le formulaire
      setFormData({
        nomElementEchange: echange.nomElementEchange || echange.titre || "",
        typeEchange: echange.typeEchange,
        objetPropose: echange.objetPropose || "",
        objetDemande: echange.objetDemande || "",
        categorie_uuid: echange.categorie_uuid || "",
        quantite: echange.quantite || "1",
        prix: echange.prix || "",
        numero: echange.numero || "",
        message: echange.message || "",
        image: null,
      });

      // Définir l'image existante comme aperçu
      if (echange.image) {
        setPreviewImage(echange.image);
      }

      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [isOpen, echange]);

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
    const errors: Partial<Record<keyof EchangeFormData, string>> = {};

    if (!formData.nomElementEchange.trim()) {
      errors.nomElementEchange = "Le titre est obligatoire";
    } else if (formData.nomElementEchange.trim().length < 5) {
      errors.nomElementEchange = "Le titre doit contenir au moins 5 caractères";
    }

    if (!formData.objetPropose.trim()) {
      errors.objetPropose = "L'objet proposé est obligatoire";
    } else if (formData.objetPropose.trim().length < 3) {
      errors.objetPropose =
        "L'objet proposé doit contenir au moins 3 caractères";
    }

    if (!formData.objetDemande.trim()) {
      errors.objetDemande = "L'objet recherché est obligatoire";
    } else if (formData.objetDemande.trim().length < 3) {
      errors.objetDemande =
        "L'objet recherché doit contenir au moins 3 caractères";
    }

    if (!formData.categorie_uuid) {
      errors.categorie_uuid = "La catégorie est obligatoire";
    }

    if (!formData.numero.trim()) {
      errors.numero = "Le numéro de contact est obligatoire";
    } else if (!/^[\d\s\+\(\)\.-]+$/.test(formData.numero.trim())) {
      errors.numero = "Format de numéro invalide";
    }

    const quantiteNum = parseInt(formData.quantite);
    if (isNaN(quantiteNum) || quantiteNum < 1) {
      errors.quantite = "La quantité doit être un nombre d'au moins 1";
    }

    // Validation de l'image si elle existe
    if (formData.image) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.image.size > maxSize) {
        errors.image = "L'image est trop volumineuse. Taille maximale : 10MB.";
      }
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
    if (validationErrors[name as keyof EchangeFormData]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof EchangeFormData];
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
        image: file,
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
      image: null,
    }));

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    // Réinitialiser à l'image existante si elle existe
    setPreviewImage(echange.image || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Soumission principale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Vous devez être connecté pour modifier un échange.");
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
      formDataToSend.append(
        "nomElementEchange",
        formData.nomElementEchange.trim(),
      );
      formDataToSend.append("typeEchange", formData.typeEchange);
      formDataToSend.append("objetPropose", formData.objetPropose.trim());
      formDataToSend.append("objetDemande", formData.objetDemande.trim());
      formDataToSend.append("categorie_uuid", formData.categorie_uuid);
      formDataToSend.append("quantite", formData.quantite);
      formDataToSend.append("prix", formData.prix || "0");
      formDataToSend.append("numero", formData.numero.trim());
      formDataToSend.append("message", formData.message.trim());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Envoyer avec l'API client
      const response = await api.putFormData(
        API_ENDPOINTS.ECHANGES.UPDATE(echange.uuid),
        formDataToSend,
        {},
      );

      // Vérifier la réponse
      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Échange modifié avec succès !");
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
      console.error("❌ Erreur lors de la modification:", err);

      let errorMessage =
        err.message || "Erreur lors de la modification de l'échange";

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

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const hasChanges =
      formData.nomElementEchange !==
        (echange.nomElementEchange || echange.titre || "") ||
      formData.typeEchange !== (echange.typeEchange || "produit") ||
      formData.objetPropose !== (echange.objetPropose || "") ||
      formData.objetDemande !== (echange.objetDemande || "") ||
      formData.categorie_uuid !== (echange.categorie_uuid || "") ||
      formData.quantite !== (echange.quantite || "1") ||
      formData.prix !== (echange.prix || "") ||
      formData.numero !== (echange.numero || "") ||
      formData.message !== (echange.message || "") ||
      formData.image !== null;

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
        zIndex: 1050,
      }}
      role="dialog"
      aria-labelledby="editEchangeModalLabel"
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
              background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellow} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="editEchangeModalLabel"
                >
                  Modifier l'Échange
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Modifiez les informations de l'échange
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
                      Vous devez être connecté pour modifier un échange.
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
                  <label
                    htmlFor="nomElementEchange"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Titre de l'échange <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="nomElementEchange"
                    name="nomElementEchange"
                    className={`form-control ${validationErrors.nomElementEchange ? "is-invalid" : ""}`}
                    placeholder="Ex: Cahier vs Galaxy S21"
                    value={formData.nomElementEchange}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.nomElementEchange && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.nomElementEchange}
                    </div>
                  )}
                </div>

                {/* Type d'échange */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Type d'échange <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="typeEchange"
                        id="typeProduit"
                        checked={formData.typeEchange === "produit"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            typeEchange: "produit",
                          }))
                        }
                        disabled={loading || !isAuthenticated}
                      />
                      <label className="form-check-label" htmlFor="typeProduit">
                        <FontAwesomeIcon icon={faBox} className="me-2" />
                        Produit
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="typeEchange"
                        id="typeService"
                        checked={formData.typeEchange === "service"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            typeEchange: "service",
                          }))
                        }
                        disabled={loading || !isAuthenticated}
                      />
                      <label className="form-check-label" htmlFor="typeService">
                        <FontAwesomeIcon
                          icon={faHandHoldingHeart}
                          className="me-2"
                        />
                        Service
                      </label>
                    </div>
                  </div>
                </div>

                {/* Catégorie */}
                <div className="col-md-6">
                  <label
                    htmlFor="categorie_uuid"
                    className="form-label fw-semibold"
                  >
                    Catégorie <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categorie_uuid"
                    name="categorie_uuid"
                    className={`form-select ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                    value={formData.categorie_uuid}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
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

                {/* Objet proposé */}
                <div className="col-md-6">
                  <label
                    htmlFor="objetPropose"
                    className="form-label fw-semibold"
                  >
                    Vous proposez <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="objetPropose"
                    name="objetPropose"
                    className={`form-control ${validationErrors.objetPropose ? "is-invalid" : ""}`}
                    placeholder="Ex: iPhone 12 Pro"
                    value={formData.objetPropose}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.objetPropose && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.objetPropose}
                    </div>
                  )}
                </div>

                {/* Objet recherché */}
                <div className="col-md-6">
                  <label
                    htmlFor="objetDemande"
                    className="form-label fw-semibold"
                  >
                    Vous recherchez <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="objetDemande"
                    name="objetDemande"
                    className={`form-control ${validationErrors.objetDemande ? "is-invalid" : ""}`}
                    placeholder="Ex: Samsung Galaxy S21"
                    value={formData.objetDemande}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.objetDemande && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.objetDemande}
                    </div>
                  )}
                </div>

                {/* Quantité */}
                <div className="col-md-6">
                  <label htmlFor="quantite" className="form-label fw-semibold">
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

                {/* Prix estimé */}
                <div className="col-md-6">
                  <label htmlFor="prix" className="form-label fw-semibold">
                    Prix estimé (FCFA)
                  </label>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    className="form-control"
                    placeholder="Ex: 100000"
                    value={formData.prix}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
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
                    placeholder="Ex: 00225 0546895765"
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

                {/* Message */}
                <div className="col-12">
                  <label htmlFor="message" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    placeholder="Décrivez votre proposition d'échange..."
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                </div>

                {/* Image */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Image de l'objet
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/200/cccccc/ffffff?text=Image+Erreur`;
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
                      <span className="ms-2">Changer l'image</span>
                    </button>
                  </div>

                  {validationErrors.image && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.image}
                    </div>
                  )}

                  <div className="text-muted mt-2">
                    <small>
                      Formats acceptés: JPG, PNG, WEBP, GIF, SVG (max 10MB). Si
                      aucune nouvelle image n'est fournie, l'image actuelle sera
                      conservée.
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
                    Modification en cours...
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <FontAwesomeIcon icon={faLock} />
                    Connectez-vous
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Enregistrer les modifications
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

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
