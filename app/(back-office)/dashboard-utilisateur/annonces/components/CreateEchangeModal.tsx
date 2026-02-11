"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExchangeAlt,
  faArrowLeft,
  faArrowRight,
  faInfoCircle,
  faCheckCircle,
  faCamera,
  faImage,
  faTag,
  faBox,
  faHandHoldingHeart,
  faPhone,
  faMoneyBillWave,
  faFileAlt,
  faDatabase,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface CreateEchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EchangeFormData {
  titre: string;
  description: string;
  objet_propose: string;
  objet_demande: string;
  type_echange: "produit" | "service";
  categorie_uuid: string;
  prix: string;
  numero: string;
  quantite: string;
  message: string;
}

interface Category {
  uuid: string;
  libelle: string;
  icon?: string;
}

export default function CreateEchangeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEchangeModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<EchangeFormData>({
    titre: "",
    description: "",
    objet_propose: "",
    objet_demande: "",
    type_echange: "produit",
    categorie_uuid: "",
    prix: "",
    numero: "",
    quantite: "1",
    message: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>(
          API_ENDPOINTS.CATEGORIES.LIST,
        );
        if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      objet_propose: "",
      objet_demande: "",
      type_echange: "produit",
      categorie_uuid: "",
      prix: "",
      numero: "",
      quantite: "1",
      message: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setStep(1);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      setImageFile(file);

      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const nextStep = () => {
    // Validation pour passer à l'étape suivante
    if (step === 1) {
      if (!formData.titre.trim()) {
        setError("Le titre est obligatoire");
        return;
      }
      if (!formData.objet_propose.trim()) {
        setError("L'objet proposé est obligatoire");
        return;
      }
      if (!formData.objet_demande.trim()) {
        setError("L'objet recherché est obligatoire");
        return;
      }
    } else if (step === 2) {
      if (!formData.categorie_uuid) {
        setError("La catégorie est obligatoire");
        return;
      }
      if (!formData.numero.trim()) {
        setError("Le numéro de contact est obligatoire");
        return;
      }
    }

    setError(null);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation finale
      if (
        !formData.titre.trim() ||
        !formData.objet_propose.trim() ||
        !formData.objet_demande.trim()
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      let imageUrl = "";

      // Upload de l'image si présente
      if (imageFile) {
        setUploadingImage(true);
        try {
          const formDataImage = new FormData();
          formDataImage.append("image", imageFile);

          // Supposons que vous avez un endpoint pour uploader les images d'échange
          const uploadResponse = await api.post(
            API_ENDPOINTS.ECHANGES.UPLOAD,
            formDataImage,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          if (uploadResponse.url) {
            imageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.error("Erreur upload image:", uploadError);
          // Continuer sans image si l'upload échoue
        } finally {
          setUploadingImage(false);
        }
      }

      // Préparer les données pour l'API
      const echangeData = {
        titre: formData.titre,
        description:
          formData.description ||
          `${formData.objet_propose} vs ${formData.objet_demande}`,
        objet_propose: formData.objet_propose,
        objet_demande: formData.objet_demande,
        type_echange: formData.type_echange,
        categorie_uuid: formData.categorie_uuid,
        prix: formData.prix || "0",
        numero: formData.numero,
        quantite: parseInt(formData.quantite) || 1,
        message: formData.message,
        image: imageUrl,
        statut: "en_attente",
      };

      // Envoyer la requête
      const response = await api.post(
        API_ENDPOINTS.ECHANGES.CREATE,
        echangeData,
      );

      if (response.uuid) {
        setSuccess("Échange créé avec succès !");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error("Erreur lors de la création de l'échange");
      }
    } catch (err: any) {
      console.error("❌ Erreur création échange:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la création",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-primary text-white rounded-top-3 position-relative">
            <div className="w-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="modal-title fw-bold mb-0">
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                  Nouvel Échange
                </h5>
                <button
                  type="button"
                  className="btn btn-close btn-close-white"
                  onClick={onClose}
                  disabled={loading}
                ></button>
              </div>

              {/* Étapes */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className="d-flex flex-column align-items-center"
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        step >= stepNum
                          ? "bg-white text-primary"
                          : "bg-white bg-opacity-25 text-white"
                      }`}
                      style={{ width: "40px", height: "40px" }}
                    >
                      {step > stepNum ? (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      ) : (
                        <span className="fw-bold">{stepNum}</span>
                      )}
                    </div>
                    <small className="mt-1">
                      {stepNum === 1 && "Informations"}
                      {stepNum === 2 && "Détails"}
                      {stepNum === 3 && "Confirmation"}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages d'alerte */}
          {(error || success) && (
            <div className="px-4 pt-3">
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}
              {success && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {success}
                </div>
              )}
            </div>
          )}

          {/* Contenu du modal */}
          <div className="modal-body p-0">
            {/* Étape 1 : Informations de base */}
            {step === 1 && (
              <div className="p-4">
                <h6 className="fw-bold text-dark mb-4">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-primary me-2"
                  />
                  Informations de l'échange
                </h6>

                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faTag}
                          className="me-2 text-primary"
                        />
                        Titre de l'échange *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="titre"
                        value={formData.titre}
                        onChange={handleInputChange}
                        placeholder="Ex: Cahier vs Galaxy S21"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Décrivez votre échange en détails..."
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="me-2 text-primary"
                        />
                        Objet que vous proposez *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="objet_propose"
                        value={formData.objet_propose}
                        onChange={handleInputChange}
                        placeholder="Ex: iPhone 12 Pro"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faHandHoldingHeart}
                          className="me-2 text-primary"
                        />
                        Objet que vous recherchez *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="objet_demande"
                        value={formData.objet_demande}
                        onChange={handleInputChange}
                        placeholder="Ex: Samsung Galaxy S21"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Type d'échange
                      </label>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className={`btn ${formData.type_echange === "produit" ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              type_echange: "produit",
                            }))
                          }
                        >
                          <FontAwesomeIcon icon={faBox} className="me-2" />
                          Produit
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.type_echange === "service" ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              type_echange: "service",
                            }))
                          }
                        >
                          <FontAwesomeIcon
                            icon={faHandHoldingHeart}
                            className="me-2"
                          />
                          Service
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantite"
                        value={formData.quantite}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Détails supplémentaires */}
            {step === 2 && (
              <div className="p-4">
                <h6 className="fw-bold text-dark mb-4">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="text-primary me-2"
                  />
                  Détails supplémentaires
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Catégorie *
                      </label>
                      <select
                        className="form-select"
                        name="categorie_uuid"
                        value={formData.categorie_uuid}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.uuid} value={category.uuid}>
                            {category.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="me-2 text-primary"
                        />
                        Prix estimé (FCFA)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="prix"
                        value={formData.prix}
                        onChange={handleInputChange}
                        placeholder="Ex: 100000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="me-2 text-primary"
                        />
                        Numéro de contact *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        placeholder="Ex: 00225 0546895765"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Message supplémentaire
                      </label>
                      <textarea
                        className="form-control"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Souhaitez-vous procéder à un échange ?"
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FontAwesomeIcon
                          icon={faCamera}
                          className="me-2 text-primary"
                        />
                        Photo de l'objet proposé
                      </label>
                      <div className="border rounded p-3 text-center">
                        {imagePreview ? (
                          <div className="position-relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="img-fluid rounded mb-2"
                              style={{ maxHeight: "200px" }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                              onClick={removeImage}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-muted fs-1 mb-2"
                            />
                            <p className="text-muted mb-3">
                              Aucune photo sélectionnée
                            </p>
                          </div>
                        )}

                        <div className="d-grid">
                          <label className="btn btn-outline-primary">
                            <FontAwesomeIcon icon={faUpload} className="me-2" />
                            {imagePreview
                              ? "Changer la photo"
                              : "Choisir une photo"}
                            <input
                              type="file"
                              className="d-none"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <small className="text-muted mt-2 d-block">
                          Formats acceptés: JPG, PNG, GIF (max 5MB)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Confirmation */}
            {step === 3 && (
              <div className="p-4">
                <h6 className="fw-bold text-dark mb-4">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-primary me-2"
                  />
                  Confirmation
                </h6>

                <div className="alert alert-info mb-4">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Vérifiez les informations avant de créer l'échange
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border mb-3">
                      <div className="card-body">
                        <h6 className="fw-bold text-dark mb-3">
                          Informations principales
                        </h6>
                        <div className="mb-2">
                          <small className="text-muted">Titre</small>
                          <div className="fw-semibold">
                            {formData.titre || "Non renseigné"}
                          </div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Type</small>
                          <div className="fw-semibold">
                            {formData.type_echange === "produit"
                              ? "Produit"
                              : "Service"}
                          </div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Quantité</small>
                          <div className="fw-semibold">{formData.quantite}</div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Catégorie</small>
                          <div className="fw-semibold">
                            {categories.find(
                              (c) => c.uuid === formData.categorie_uuid,
                            )?.libelle || "Non renseignée"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border mb-3">
                      <div className="card-body">
                        <h6 className="fw-bold text-dark mb-3">Objets</h6>
                        <div className="mb-2">
                          <small className="text-muted">Vous proposez</small>
                          <div className="fw-semibold">
                            {formData.objet_propose || "Non renseigné"}
                          </div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Vous recherchez</small>
                          <div className="fw-semibold">
                            {formData.objet_demande || "Non renseigné"}
                          </div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Prix estimé</small>
                          <div className="fw-semibold">
                            {formData.prix
                              ? `${formData.prix} FCFA`
                              : "Non spécifié"}
                          </div>
                        </div>
                        <div className="mb-2">
                          <small className="text-muted">Contact</small>
                          <div className="fw-semibold">
                            {formData.numero || "Non renseigné"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="col-md-12">
                      <div className="card border">
                        <div className="card-body">
                          <h6 className="fw-bold text-dark mb-3">Photo</h6>
                          <div className="text-center">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: "150px" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pied de modal */}
          <div className="modal-footer border-0">
            <div className="d-flex justify-content-between w-100">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Retour
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Annuler
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={loading}
                  >
                    Suivant
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading || uploadingImage}
                  >
                    {loading || uploadingImage ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {uploadingImage
                          ? "Upload de l'image..."
                          : "Création en cours..."}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        Créer l'échange
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
