"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faShoppingCart,
  faMoneyBill,
  faMapMarkerAlt,
  faImage,
  faCamera,
  faTag,
  faBox,
  faInfoCircle,
  faExclamationCircle,
  faSpinner,
  faCheckCircle,
  faTrash,
  faLock,
  faStar,
  faCertificate,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface Category {
  uuid: string;
  libelle: string;
  type?: string;
}

interface ProductFormData {
  nom: string;
  prix: string;
  description: string;
  quantite: string;
  categorie_uuid: string;
  lieu: string;
  condition: string;
  type: string;
  garantie: string;
  etoile: string;
  disponible: boolean;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const conditions = [
  { value: "neuf", label: "Neuf" },
  { value: "tres_bon_etat", label: "Très bon état" },
  { value: "bon_etat", label: "Bon état" },
  { value: "etat_moyen", label: "État moyen" },
  { value: "a_renover", label: "À rénover" },
];

export default function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<ProductFormData>({
    nom: "",
    prix: "",
    description: "",
    quantite: "1",
    categorie_uuid: "",
    lieu: "",
    condition: "bon_etat",
    type: "",
    garantie: "non",
    etoile: "3",
    disponible: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        if (Array.isArray(response)) {
          setCategories(response);
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
      const checkAuth = async () => {
        try {
          // Vérifier avec le profil vendeur
          await api.get(API_ENDPOINTS.AUTH.VENDEUR.PROFILE);
          setIsAuthenticated(true);
        } catch (err: any) {
          setIsAuthenticated(false);
          if (err.response?.status === 401) {
            setError("Votre session a expiré. Redirection...");
            setTimeout(() => {
              window.location.href = `/vendeur/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }, 2000);
          }
        }
      };

      checkAuth();
      handleReset();
    }
  }, [isOpen]);

  // Nettoyer les URLs d'aperçu
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom du produit est obligatoire";
    } else if (formData.nom.trim().length < 3) {
      errors.nom = "Le nom doit faire au moins 3 caractères";
    }

    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      errors.prix = "Le prix doit être supérieur à 0";
    }

    if (!formData.quantite || parseInt(formData.quantite) <= 0) {
      errors.quantite = "La quantité doit être supérieure à 0";
    }

    if (!formData.categorie_uuid) {
      errors.categorie_uuid = "La catégorie est obligatoire";
    }

    if (!formData.lieu.trim()) {
      errors.lieu = "Le lieu est obligatoire";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantite" || name === "prix" || name === "etoile"
          ? value
          : value,
    }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name as keyof ProductFormData]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ProductFormData];
        return newErrors;
      });
    }
  };

  // Gestion du changement de fichier
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
      setImageFile(file);

      // Créer l'aperçu
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Effacer les erreurs
      setError(null);
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Soumission
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError("Vous devez être connecté pour créer un produit.");
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
      formDataToSend.append("nom", formData.nom.trim());
      formDataToSend.append("prix", formData.prix);
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("quantite", formData.quantite);
      formDataToSend.append("categorie_uuid", formData.categorie_uuid);
      formDataToSend.append("lieu", formData.lieu.trim());
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("type", formData.type.trim());
      formDataToSend.append("garantie", formData.garantie);
      formDataToSend.append("etoile", formData.etoile);
      formDataToSend.append("disponible", formData.disponible.toString());

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Envoyer la requête
      const response = await api.post(
        API_ENDPOINTS.PRODUCTS.CREATE,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSuccessMessage("Produit créé avec succès !");

      // Réinitialiser le formulaire
      handleReset();

      // Fermer la modal après succès
      setTimeout(() => {
        if (onSuccess) {
          onSuccess("Produit créé avec succès !");
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur lors de la création:", err);

      let errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de la création du produit";

      if (
        errorMessage.includes("Authentification") ||
        errorMessage.includes("401")
      ) {
        errorMessage = "Authentification requise. Veuillez vous reconnecter.";
        setTimeout(() => {
          window.location.href = `/vendeur/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 2000);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setFormData({
      nom: "",
      prix: "",
      description: "",
      quantite: "1",
      categorie_uuid: "",
      lieu: "",
      condition: "bon_etat",
      type: "",
      garantie: "non",
      etoile: "3",
      disponible: true,
    });
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const hasChanges = Object.values(formData).some(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== "1" &&
        value !== "bon_etat" &&
        value !== "non" &&
        value !== "3" &&
        value !== true,
    );

    if (hasChanges || imageFile || imagePreview) {
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
      aria-labelledby="createProductModalLabel"
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
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
              borderBottom: `3px solid ${colors.oskar.orange}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faShoppingCart} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createProductModalLabel"
                >
                  Créer un Nouveau Produit
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Ajoutez votre produit à vendre
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
                      Vous devez être connecté pour créer un produit.
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
                        icon={faExclamationCircle}
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
            <div className="row g-4">
              {/* Nom du produit */}
              <div className="col-md-12">
                <label htmlFor="nom" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faTag} className="me-2" />
                  Nom du produit <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  className={`form-control ${validationErrors.nom ? "is-invalid" : ""}`}
                  placeholder="Ex: Casque Audio Sony WH-1000XM5"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                />
                {validationErrors.nom && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.nom}
                  </div>
                )}
              </div>

              {/* Prix et Quantité */}
              <div className="col-md-6">
                <label htmlFor="prix" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                  Prix (FCFA) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faMoneyBill}
                      className="text-muted"
                    />
                  </span>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    className={`form-control border-start-0 ps-0 ${validationErrors.prix ? "is-invalid" : ""}`}
                    placeholder="250000"
                    value={formData.prix}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                </div>
                {validationErrors.prix && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.prix}
                  </div>
                )}
              </div>

              <div className="col-md-6">
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
                  onChange={handleInputChange}
                  min="1"
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                />
                {validationErrors.quantite && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.quantite}
                  </div>
                )}
              </div>

              {/* Catégorie et Type */}
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
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                >
                  <option value="">Sélectionnez une catégorie...</option>
                  {categories.map((category) => (
                    <option key={category.uuid} value={category.uuid}>
                      {category.libelle}
                    </option>
                  ))}
                </select>
                {validationErrors.categorie_uuid && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.categorie_uuid}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="type" className="form-label fw-semibold">
                  Type de produit
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  className="form-control"
                  placeholder="Ex: accessoire audio"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                />
              </div>

              {/* Lieu et État */}
              <div className="col-md-6">
                <label htmlFor="lieu" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Lieu de vente <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-muted"
                    />
                  </span>
                  <input
                    type="text"
                    id="lieu"
                    name="lieu"
                    className={`form-control border-start-0 ps-0 ${validationErrors.lieu ? "is-invalid" : ""}`}
                    placeholder="Ex: Cocody, Abidjan"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  />
                </div>
                {validationErrors.lieu && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.lieu}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="condition" className="form-label fw-semibold">
                  État du produit
                </label>
                <select
                  id="condition"
                  name="condition"
                  className="form-select"
                  value={formData.condition}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Garantie et Note */}
              <div className="col-md-6">
                <label htmlFor="garantie" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faCertificate} className="me-2" />
                  Garantie
                </label>
                <select
                  id="garantie"
                  name="garantie"
                  className="form-select"
                  value={formData.garantie}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>

              <div className="col-md-6">
                <label htmlFor="etoile" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Note (étoiles)
                </label>
                <select
                  id="etoile"
                  name="etoile"
                  className="form-select"
                  value={formData.etoile}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                >
                  <option value="1">★☆☆☆☆</option>
                  <option value="2">★★☆☆☆</option>
                  <option value="3">★★★☆☆</option>
                  <option value="4">★★★★☆</option>
                  <option value="5">★★★★★</option>
                </select>
              </div>

              {/* Disponibilité */}
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="disponible"
                    checked={formData.disponible}
                    onChange={(e) =>
                      setFormData({ ...formData, disponible: e.target.checked })
                    }
                    disabled={loading || !isAuthenticated}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="disponible"
                  >
                    Produit disponible
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <label htmlFor="description" className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Décrivez votre produit en détail..."
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading || !isAuthenticated}
                  style={{ borderRadius: "8px" }}
                />
              </div>

              {/* Image */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  <FontAwesomeIcon icon={faImage} className="me-2" />
                  Photo du produit
                  <span className="text-muted ms-1 fw-normal">(Optionnel)</span>
                </label>

                {/* Aperçu */}
                {imagePreview && (
                  <div className="mb-3">
                    <div className="position-relative d-inline-block">
                      <img
                        src={imagePreview}
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
                    onChange={handleImageUpload}
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
                    {!imagePreview &&
                      " Si aucune image n'est fournie, une image par défaut sera utilisée."}
                  </small>
                </div>
              </div>
            </div>
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
                    ? colors.oskar.blue
                    : colors.oskar.grey,
                  border: `1px solid ${isAuthenticated ? colors.oskar.blueHover : colors.oskar.grey}`,
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
                    Créer le Produit
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
          border-color: ${colors.oskar.purple};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.purple}25;
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
