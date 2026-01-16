// components/produits/modals/EditProduitModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faTag,
  faMoneyBillWave,
  faBoxOpen,
  faLayerGroup,
  faImage,
  faStar,
  faCheckCircle,
  faSpinner,
  faUpload,
  faTrash,
  faInfoCircle,
  faChevronDown,
  faSearch,
  faPercent,
  faWeightHanging,
  faRulerVertical,
  faBarcode,
  faPalette,
  faCalendar,
  faClock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { Produit, UpdateProduitDto } from "../shared/types";
import colors from "@/app/shared/constants/colors";

interface EditProduitModalProps {
  isOpen: boolean;
  produit: Produit | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const EditProduitModal = ({
  isOpen,
  produit,
  onClose,
  onSuccess,
}: EditProduitModalProps) => {
  // États
  const [formData, setFormData] = useState<UpdateProduitDto>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    Array<{ uuid: string; libelle: string; image?: string; type: string }>
  >([]);
  const [filteredCategories, setFilteredCategories] = useState<
    Array<{ uuid: string; libelle: string; image?: string; type: string }>
  >([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof UpdateProduitDto, string>>
  >({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Steps configuration
  const steps = [
    { number: 1, title: "Informations de base", icon: faTag },
    { number: 2, title: "Détails & Prix", icon: faMoneyBillWave },
    { number: 3, title: "Caractéristiques", icon: faLayerGroup },
  ];

  // Initialisation avec les données du produit
  useEffect(() => {
    if (produit) {
      setFormData({
        libelle: produit.libelle,
        type: produit.type || "",
        disponible: produit.disponible,
        categorie_uuid: produit.categorie_uuid,
        statut: produit.statut,
        etoile: produit.etoile,
        prix: produit.prix.replace(".00", ""),
        quantite: produit.quantite,
        description: produit.description || "",
        couleur: produit.couleur || "",
        dimensions: produit.dimensions || "",
        poids: produit.poids || "",
        code_barre: produit.code_barre || "",
        promo: produit.promo !== null ? produit.promo : 0,
        promo_date_fin: produit.promo_date_fin || "",
      });
      setImagePreview(produit.image || null);
      setValidationErrors({});
    }
  }, [produit]);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        setCategories(response || []);
        setFilteredCategories(response || []);
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };

    if (isOpen) {
      loadCategories();
      setActiveStep(1);
    }
  }, [isOpen]);

  // Filtrer les catégories
  useEffect(() => {
    if (searchCategory.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (cat) =>
          cat.libelle.toLowerCase().includes(searchCategory.toLowerCase()) ||
          cat.type.toLowerCase().includes(searchCategory.toLowerCase()),
      );
      setFilteredCategories(filtered);
    }
  }, [searchCategory, categories]);

  // Fermer en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UpdateProduitDto, string>> = {};

    if (!formData.libelle?.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 3) {
      errors.libelle = "Le libellé doit contenir au moins 3 caractères";
    }

    if (!formData.prix || parseFloat(formData.prix.toString()) <= 0) {
      errors.prix = "Le prix doit être supérieur à 0";
    }

    if (!formData.quantite || formData.quantite < 0) {
      errors.quantite = "La quantité doit être positive";
    }

    if (!formData.categorie_uuid) {
      errors.categorie_uuid = "La catégorie est obligatoire";
    }

    if (formData.promo && (formData.promo < 0 || formData.promo > 100)) {
      errors.promo = "La promotion doit être entre 0% et 100%";
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
    const { name, value, type } = e.target;

    let newValue: any = value;

    if (type === "number") {
      newValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Effacer l'erreur de validation
    if (validationErrors[name as keyof UpdateProduitDto]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof UpdateProduitDto];
        return newErrors;
      });
    }
  };

  // Gestion des images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.",
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse. Taille maximale : 5MB.");
        return;
      }

      // Progression du téléchargement
      setImageUploadProgress(0);
      const interval = setInterval(() => {
        setImageUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 50);

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setTimeout(() => {
          setImageUploadProgress(100);
          clearInterval(interval);
          setTimeout(() => setImageUploadProgress(0), 500);
        }, 500);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produit) return;

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Champs obligatoires
      formDataToSend.append("libelle", formData.libelle || "");
      formDataToSend.append(
        "disponible",
        (formData.disponible ?? true).toString(),
      );
      formDataToSend.append("categorie_uuid", formData.categorie_uuid || "");
      formDataToSend.append("statut", formData.statut || "publie");
      formDataToSend.append("etoile", (formData.etoile || 5).toString());
      formDataToSend.append(
        "prix",
        formData.prix?.toString().replace("CFA", "").trim() || "0",
      );
      formDataToSend.append("quantite", (formData.quantite || 1).toString());

      // Champs optionnels
      if (formData.type !== undefined)
        formDataToSend.append("type", formData.type);
      if (formData.description !== undefined)
        formDataToSend.append("description", formData.description);
      if (formData.couleur) formDataToSend.append("couleur", formData.couleur);
      if (formData.dimensions)
        formDataToSend.append("dimensions", formData.dimensions);
      if (formData.poids) formDataToSend.append("poids", formData.poids);
      if (formData.code_barre)
        formDataToSend.append("code_barre", formData.code_barre);
      if (formData.promo)
        formDataToSend.append("promo", formData.promo.toString());
      if (formData.promo_date_fin)
        formDataToSend.append("promo_date_fin", formData.promo_date_fin);

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      const response = await api.put(
        `/produits/${produit.uuid}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setSuccessMessage("Produit modifié avec succès !");

      // Effet de succès
      const successElement = document.createElement("div");
      successElement.innerHTML = "✅";
      successElement.style.position = "fixed";
      successElement.style.fontSize = "2rem";
      successElement.style.zIndex = "9999";
      document.body.appendChild(successElement);

      setTimeout(() => {
        successElement.remove();
        onSuccess("Produit modifié avec succès !");
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur modification produit:", err);
      setError(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    const hasChanges = Object.keys(formData).some((key) => {
      const value = formData[key as keyof UpdateProduitDto];
      const originalValue = produit?.[key as keyof Produit];
      return JSON.stringify(value) !== JSON.stringify(originalValue);
    });

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

  if (!isOpen || !produit) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-labelledby="editProduitModalLabel"
      aria-modal="true"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
        ref={modalRef}
      >
        <div
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${colors.oskar.yellow}30`,
          }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 position-relative"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`,
              padding: "1.5rem 2rem",
            }}
          >
            <div className="d-flex align-items-center w-100">
              <div
                className="bg-white bg-opacity-25 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
              >
                <FontAwesomeIcon icon={faEdit} className="fs-4" />
              </div>
              <div className="flex-grow-1">
                <h5 className="modal-title mb-1 fw-bold fs-4">
                  Modifier le produit
                </h5>
                <p className="mb-0 opacity-85" style={{ fontSize: "0.95rem" }}>
                  Mettez à jour les informations de votre produit
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              style={{
                top: "1.5rem",
                right: "1.5rem",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Barre de progression */}
          <div className="px-4 pt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="d-flex align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${activeStep >= step.number ? "text-white" : "text-muted"}`}
                    style={{
                      width: "40px",
                      height: "40px",
                      background:
                        activeStep >= step.number
                          ? `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`
                          : colors.oskar.lightGrey,
                      border: `2px solid ${activeStep >= step.number ? colors.oskar.yellowHover : colors.oskar.grey}30`,
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <div className="ms-2 d-none d-md-block">
                    <small
                      className="d-block text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Étape {step.number}
                    </small>
                    <span
                      className="fw-semibold"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="mx-3"
                      style={{
                        width: "40px",
                        height: "2px",
                        background:
                          activeStep > step.number
                            ? colors.oskar.yellow
                            : colors.oskar.lightGrey,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Corps */}
          <div className="modal-body py-4 px-4">
            {/* Messages */}
            {error && (
              <div
                className="alert alert-danger border-0 shadow-sm mb-4"
                role="alert"
                style={{
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${colors.oskar.red}10 0%, ${colors.oskar.red}5 100%)`,
                  border: `1px solid ${colors.oskar.red}30`,
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.red}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-danger fs-5"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1 fw-bold">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div
                className="alert alert-success border-0 shadow-sm mb-4"
                role="alert"
                style={{
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${colors.oskar.green}15 0%, ${colors.oskar.green}10 100%)`,
                  border: `1px solid ${colors.oskar.green}30`,
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.green}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success fs-5"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1 fw-bold">Succès !</h6>
                    <p className="mb-0">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Étape 1: Informations de base */}
              {activeStep === 1 && (
                <div
                  className="step-content"
                  style={{ animation: "fadeIn 0.3s ease" }}
                >
                  <div className="row">
                    {/* Colonne gauche - Image */}
                    <div className="col-md-4">
                      <div className="sticky-top" style={{ top: "20px" }}>
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faImage}
                                className="me-2 text-primary"
                              />
                              Image du produit
                            </h6>

                            <div className="text-center mb-3">
                              {imagePreview ? (
                                <div className="position-relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="img-fluid rounded-3 shadow"
                                    style={{
                                      maxHeight: "200px",
                                      objectFit: "cover",
                                      border: `3px solid ${colors.oskar.yellow}30`,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                    onClick={handleRemoveImage}
                                    disabled={loading}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                  {imageUploadProgress > 0 && (
                                    <div className="progress mt-2">
                                      <div
                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        style={{
                                          width: `${imageUploadProgress}%`,
                                        }}
                                        aria-valuenow={imageUploadProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="border rounded-3 p-5 text-center"
                                  style={{
                                    borderStyle: "dashed",
                                    borderColor: colors.oskar.grey,
                                    background: colors.oskar.lightGrey + "20",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <FontAwesomeIcon
                                    icon={faImage}
                                    className="fs-1 text-muted mb-3"
                                  />
                                  <p className="mb-2 fw-semibold">
                                    Cliquez pour télécharger une photo
                                  </p>
                                  <p
                                    className="text-muted mb-0"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    Formats: JPG, PNG, WEBP, GIF • Max: 5MB
                                  </p>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="mt-4">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="me-2 text-primary"
                                />
                                Statut
                              </label>
                              <select
                                className={`form-select ${validationErrors.statut ? "is-invalid" : ""}`}
                                name="statut"
                                value={formData.statut || "publie"}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                  borderRadius: "10px",
                                  padding: "0.75rem 1rem",
                                }}
                              >
                                <option value="publie">✅ Publié</option>
                                <option value="draft">📝 Brouillon</option>
                                <option value="en_attente">
                                  ⏳ En attente
                                </option>
                                <option value="bloque">🚫 Bloqué</option>
                              </select>
                            </div>

                            <div className="mt-3">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className="me-2 text-primary"
                                />
                                Évaluation
                              </label>
                              <div className="d-flex align-items-center">
                                <select
                                  className="form-select"
                                  name="etoile"
                                  value={formData.etoile || 5}
                                  onChange={handleChange}
                                  disabled={loading}
                                  style={{
                                    borderRadius: "10px",
                                    padding: "0.75rem 1rem",
                                  }}
                                >
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <option key={star} value={star}>
                                      {"★".repeat(star)} {star} étoile
                                      {star > 1 ? "s" : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="form-check form-switch mt-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="edit-disponible"
                                name="disponible"
                                checked={formData.disponible ?? true}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    disponible: e.target.checked,
                                  }))
                                }
                                disabled={loading}
                                style={{
                                  width: "3em",
                                  height: "1.5em",
                                  cursor: "pointer",
                                }}
                              />
                              <label
                                className="form-check-label fw-semibold ms-2"
                                htmlFor="edit-disponible"
                              >
                                Disponible à la vente
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Colonne droite - Formulaire */}
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faTag}
                              className="me-2 text-primary"
                            />
                            Libellé du produit *
                          </label>
                          <input
                            type="text"
                            className={`form-control ${validationErrors.libelle ? "is-invalid" : ""}`}
                            name="libelle"
                            value={formData.libelle || ""}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Ex: Smartphone Samsung Galaxy S23"
                            style={{
                              borderRadius: "10px",
                              padding: "0.75rem 1rem",
                              border: `1px solid ${validationErrors.libelle ? colors.oskar.red : colors.oskar.grey}30`,
                            }}
                          />
                          {validationErrors.libelle && (
                            <div className="invalid-feedback d-flex align-items-center mt-2">
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="me-2"
                              />
                              {validationErrors.libelle}
                            </div>
                          )}
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="me-2 text-primary"
                            />
                            Description
                          </label>
                          <textarea
                            className="form-control"
                            name="description"
                            rows={4}
                            value={formData.description || ""}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Décrivez votre produit en détail..."
                            style={{
                              borderRadius: "10px",
                              padding: "0.75rem 1rem",
                              minHeight: "120px",
                            }}
                          />
                          <div className="form-text">
                            <small>
                              Caractères: {formData.description?.length || 0}
                              /2000
                            </small>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faLayerGroup}
                              className="me-2 text-primary"
                            />
                            Catégorie *
                          </label>
                          <div className="dropdown">
                            <button
                              className={`form-select text-start d-flex align-items-center justify-content-between ${validationErrors.categorie_uuid ? "is-invalid" : ""}`}
                              type="button"
                              data-bs-toggle="dropdown"
                              style={{
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                                border: `1px solid ${validationErrors.categorie_uuid ? colors.oskar.red : colors.oskar.grey}30`,
                              }}
                            >
                              <div className="d-flex align-items-center">
                                {formData.categorie_uuid &&
                                  categories.find(
                                    (c) => c.uuid === formData.categorie_uuid,
                                  )?.image && (
                                    <img
                                      src={
                                        categories.find(
                                          (c) =>
                                            c.uuid === formData.categorie_uuid,
                                        )?.image
                                      }
                                      alt=""
                                      className="rounded me-2"
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                {formData.categorie_uuid
                                  ? categories.find(
                                      (c) => c.uuid === formData.categorie_uuid,
                                    )?.libelle
                                  : "Sélectionnez une catégorie..."}
                              </div>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="text-muted"
                              />
                            </button>
                            <div
                              className="dropdown-menu w-100 p-3"
                              style={{ maxHeight: "300px", overflowY: "auto" }}
                            >
                              <div className="mb-3">
                                <div className="input-group">
                                  <span className="input-group-text bg-light border-end-0">
                                    <FontAwesomeIcon
                                      icon={faSearch}
                                      className="text-muted"
                                    />
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher une catégorie..."
                                    value={searchCategory}
                                    onChange={(e) =>
                                      setSearchCategory(e.target.value)
                                    }
                                    style={{ borderLeft: 0 }}
                                  />
                                </div>
                              </div>
                              {filteredCategories.map((category) => (
                                <button
                                  key={category.uuid}
                                  type="button"
                                  className={`dropdown-item d-flex align-items-center p-2 mb-1 rounded ${formData.categorie_uuid === category.uuid ? "active" : ""}`}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      categorie_uuid: category.uuid,
                                    }));
                                    setSearchCategory("");
                                  }}
                                >
                                  {category.image && (
                                    <img
                                      src={category.image}
                                      alt={category.libelle}
                                      className="rounded me-3"
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                  <div>
                                    <div className="fw-semibold">
                                      {category.libelle}
                                    </div>
                                    <small className="text-muted">
                                      {category.type}
                                    </small>
                                  </div>
                                </button>
                              ))}
                              {filteredCategories.length === 0 && (
                                <div className="text-center text-muted py-3">
                                  Aucune catégorie trouvée
                                </div>
                              )}
                            </div>
                          </div>
                          {validationErrors.categorie_uuid && (
                            <div className="invalid-feedback d-block mt-2">
                              {validationErrors.categorie_uuid}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FontAwesomeIcon
                              icon={faBoxOpen}
                              className="me-2 text-primary"
                            />
                            Type de produit
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="type"
                            value={formData.type || ""}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Ex: Électronique, Vêtement, etc."
                            style={{
                              borderRadius: "10px",
                              padding: "0.75rem 1rem",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Détails & Prix */}
              {activeStep === 2 && (
                <div
                  className="step-content"
                  style={{ animation: "fadeIn 0.3s ease" }}
                >
                  <h6 className="fw-bold text-dark mb-4 d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "36px",
                        height: "36px",
                        background: colors.oskar.blue,
                        color: "white",
                      }}
                    >
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    Détails & Prix
                  </h6>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                          <h6 className="fw-bold mb-3 text-primary">
                            Prix & Quantité
                          </h6>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faMoneyBillWave}
                                className="me-2"
                              />
                              Prix de vente *
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className={`form-control ${validationErrors.prix ? "is-invalid" : ""}`}
                                name="prix"
                                value={formData.prix || ""}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  padding: "0.75rem 1rem",
                                }}
                              />
                              <span
                                className="input-group-text"
                                style={{ borderRadius: "0 10px 10px 0" }}
                              >
                                CFA
                              </span>
                            </div>
                            {validationErrors.prix && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.prix}
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="me-2"
                              />
                              Quantité en stock *
                            </label>
                            <div className="input-group">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    quantite: Math.max(
                                      0,
                                      (prev.quantite || 1) - 1,
                                    ),
                                  }))
                                }
                                disabled={loading}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className={`form-control text-center ${validationErrors.quantite ? "is-invalid" : ""}`}
                                name="quantite"
                                value={formData.quantite || 1}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                min="0"
                                style={{ borderRadius: 0 }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    quantite: (prev.quantite || 1) + 1,
                                  }))
                                }
                                disabled={loading}
                              >
                                +
                              </button>
                            </div>
                            {validationErrors.quantite && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.quantite}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faPercent}
                                className="me-2"
                              />
                              Promotion (%)
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className={`form-control ${validationErrors.promo ? "is-invalid" : ""}`}
                                name="promo"
                                value={formData.promo || 0}
                                onChange={handleChange}
                                disabled={loading}
                                min="0"
                                max="100"
                                step="1"
                                placeholder="0"
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  padding: "0.75rem 1rem",
                                }}
                              />
                              <span
                                className="input-group-text"
                                style={{ borderRadius: "0 10px 10px 0" }}
                              >
                                %
                              </span>
                            </div>
                            {validationErrors.promo && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.promo}
                              </div>
                            )}
                            {formData.promo && formData.promo > 0 && (
                              <div className="mt-2">
                                <span className="badge bg-success">
                                  Prix après réduction:{" "}
                                  {(
                                    (parseFloat(
                                      formData.prix?.toString() || "0",
                                    ) *
                                      (100 - (formData.promo || 0))) /
                                    100
                                  ).toFixed(2)}{" "}
                                  CFA
                                </span>
                              </div>
                            )}
                          </div>

                          {formData.promo && formData.promo > 0 && (
                            <div className="mb-3">
                              <label className="form-label fw-semibold">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="me-2"
                                />
                                Fin de la promotion
                              </label>
                              <input
                                type="datetime-local"
                                className="form-control"
                                name="promo_date_fin"
                                value={formData.promo_date_fin || ""}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                  borderRadius: "10px",
                                  padding: "0.75rem 1rem",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                          <h6 className="fw-bold mb-3 text-primary">
                            Identifiants
                          </h6>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faBarcode}
                                className="me-2"
                              />
                              Code-barre
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="code_barre"
                              value={formData.code_barre || ""}
                              onChange={handleChange}
                              disabled={loading}
                              placeholder="Ex: 123456789012"
                              style={{
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                              }}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faPalette}
                                className="me-2"
                              />
                              Couleur
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                name="couleur"
                                value={formData.couleur || ""}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Ex: Noir, Rouge, etc."
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  padding: "0.75rem 1rem",
                                }}
                              />
                              {formData.couleur && (
                                <span
                                  className="input-group-text"
                                  style={{
                                    backgroundColor:
                                      formData.couleur.toLowerCase(),
                                    borderRadius: "0 10px 10px 0",
                                    width: "40px",
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faRulerVertical}
                                className="me-2"
                              />
                              Dimensions
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="dimensions"
                              value={formData.dimensions || ""}
                              onChange={handleChange}
                              disabled={loading}
                              placeholder="Ex: 10x20x30 cm"
                              style={{
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                              }}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faWeightHanging}
                                className="me-2"
                              />
                              Poids
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                name="poids"
                                value={formData.poids || ""}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Ex: 1.5"
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  padding: "0.75rem 1rem",
                                }}
                              />
                              <span
                                className="input-group-text"
                                style={{ borderRadius: "0 10px 10px 0" }}
                              >
                                kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div
                        className="alert alert-info border-0"
                        style={{
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${colors.oskar.blue}10 0%, ${colors.oskar.blue}5 100%)`,
                          border: `1px solid ${colors.oskar.blue}30`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-primary fs-5 me-3"
                          />
                          <div>
                            <h6 className="fw-bold mb-1">Conseils de prix</h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              • Comparez avec des produits similaires sur le
                              marché
                              <br />
                              • Tenez compte des frais de port et de commission
                              <br />• Pensez aux promotions saisonnières
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Caractéristiques */}
              {activeStep === 3 && (
                <div
                  className="step-content"
                  style={{ animation: "fadeIn 0.3s ease" }}
                >
                  <h6 className="fw-bold text-dark mb-4 d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "36px",
                        height: "36px",
                        background: colors.oskar.green,
                        color: "white",
                      }}
                    >
                      <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                    Caractéristiques supplémentaires
                  </h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <h6 className="fw-bold mb-3 text-primary">
                            Informations complémentaires
                          </h6>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="me-2"
                              />
                              Date de création
                            </label>
                            <input
                              type="text"
                              className="form-control bg-light"
                              value={new Date(
                                produit.createdAt,
                              ).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              disabled
                              style={{
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                              }}
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-2"
                              />
                              Dernière modification
                            </label>
                            <input
                              type="text"
                              className="form-control bg-light"
                              value={new Date(
                                produit.updatedAt,
                              ).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              disabled
                              style={{
                                borderRadius: "10px",
                                padding: "0.75rem 1rem",
                              }}
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-semibold">
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="me-2"
                                  />
                                  Note moyenne
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${produit.note_moyenne}/5 (${produit.nombre_avis} avis)`}
                                  disabled
                                  style={{
                                    borderRadius: "10px",
                                    padding: "0.75rem 1rem",
                                  }}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-semibold">
                                  <FontAwesomeIcon
                                    icon={faHeart}
                                    className="me-2"
                                  />
                                  Favoris
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-light"
                                  value={`${produit.nombre_favoris} favoris`}
                                  disabled
                                  style={{
                                    borderRadius: "10px",
                                    padding: "0.75rem 1rem",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div
                        className="alert alert-warning border-0"
                        style={{
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${colors.oskar.yellow}10 0%, ${colors.oskar.yellow}5 100%)`,
                          border: `1px solid ${colors.oskar.yellow}30`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-warning fs-5 me-3"
                          />
                          <div>
                            <h6 className="fw-bold mb-1">
                              Aperçu des modifications
                            </h6>
                            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                              Vérifiez attentivement toutes les informations
                              avant de valider les modifications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 pt-4 px-4 pb-4">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <div>
                {activeStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={prevStep}
                    disabled={loading}
                    style={{
                      borderRadius: "10px",
                      padding: "0.75rem 1.5rem",
                      border: `2px solid ${colors.oskar.grey}30`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="me-2 rotate-90"
                    />
                    Étape précédente
                  </button>
                )}
              </div>

              <div className="d-flex gap-3">
                {activeStep < steps.length ? (
                  <button
                    type="button"
                    className="btn text-white d-flex align-items-center"
                    onClick={nextStep}
                    disabled={loading}
                    style={{
                      background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
                      borderRadius: "10px",
                      padding: "0.75rem 2rem",
                      fontWeight: "600",
                    }}
                  >
                    Suivant
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="ms-2 rotate-90"
                    />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn text-white d-flex align-items-center"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: `linear-gradient(135deg, ${colors.oskar.yellow} 0%, ${colors.oskar.yellowHover} 100%)`,
                      borderRadius: "10px",
                      padding: "0.75rem 2rem",
                      fontWeight: "600",
                      border: "none",
                      boxShadow: `0 4px 15px ${colors.oskar.yellow}40`,
                    }}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                        />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content {
          border-radius: 20px !important;
          overflow: hidden;
          animation: fadeIn 0.4s ease-out;
        }

        .form-control,
        .form-select {
          border-radius: 10px !important;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.yellow};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.yellowHover}25;
          transform: translateY(-1px);
        }

        .form-control.is-invalid:focus {
          border-color: ${colors.oskar.red};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.red}25;
        }

        .btn {
          border-radius: 10px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .rotate-90 {
          transform: rotate(90deg);
        }

        .step-content {
          min-height: 400px;
        }

        .dropdown-menu {
          border-radius: 12px;
          border: 1px solid ${colors.oskar.grey}30;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .dropdown-item.active {
          background: linear-gradient(
            135deg,
            ${colors.oskar.yellow}15 0%,
            ${colors.oskar.yellow}10 100%
          );
          color: ${colors.oskar.yellow};
          border-left: 3px solid ${colors.oskar.yellow};
        }

        .progress-bar {
          background: linear-gradient(
            90deg,
            ${colors.oskar.yellow} 0%,
            ${colors.oskar.yellowHover} 100%
          );
        }

        @media (max-width: 768px) {
          .modal-dialog {
            margin: 1rem;
          }

          .sticky-top {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EditProduitModal;
