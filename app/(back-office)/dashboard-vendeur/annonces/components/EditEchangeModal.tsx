"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExchangeAlt,
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
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface EditEchangeModalProps {
  isOpen: boolean;
  echange: any;
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
  statut: string;
}

interface Category {
  uuid: string;
  libelle: string;
}

export default function EditEchangeModal({
  isOpen,
  echange,
  onClose,
  onSuccess,
}: EditEchangeModalProps) {
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
    statut: "en_attente",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Charger les catégories et initialiser le formulaire
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

    const initializeForm = () => {
      if (echange) {
        setFormData({
          titre: echange.titre || "",
          description: echange.description || "",
          objet_propose: echange.objet_propose || echange.titre || "",
          objet_demande: echange.objet_demande || "",
          type_echange: echange.type_echange || "produit",
          categorie_uuid:
            echange.categorie?.uuid || echange.categorie_uuid || "",
          prix: echange.prix || "",
          numero: echange.numero || "",
          quantite: echange.quantite?.toString() || "1",
          message: echange.message || "",
          statut: echange.statut || "en_attente",
        });

        if (echange.image) {
          setImagePreview(echange.image);
        }
      }
    };

    if (isOpen) {
      fetchCategories();
      initializeForm();
      setError(null);
      setSuccess(null);
      setImageFile(null);
    }
  }, [isOpen, echange]);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (
        !formData.titre.trim() ||
        !formData.objet_propose.trim() ||
        !formData.objet_demande.trim()
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      let imageUrl = imagePreview || "";

      // Upload de la nouvelle image si présente
      if (imageFile) {
        setUploadingImage(true);
        try {
          const formDataImage = new FormData();
          formDataImage.append("image", imageFile);

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
          // Continuer avec l'ancienne image si l'upload échoue
        } finally {
          setUploadingImage(false);
        }
      }

      // Préparer les données pour l'API
      const echangeData = {
        titre: formData.titre,
        description: formData.description,
        objet_propose: formData.objet_propose,
        objet_demande: formData.objet_demande,
        type_echange: formData.type_echange,
        categorie_uuid: formData.categorie_uuid,
        prix: formData.prix || "0",
        numero: formData.numero,
        quantite: parseInt(formData.quantite) || 1,
        message: formData.message,
        image: imageUrl,
        statut: formData.statut,
      };

      // Envoyer la requête de mise à jour
      const response = await api.put(
        API_ENDPOINTS.ECHANGES.UPDATE(echange.uuid),
        echangeData,
      );

      if (response.uuid) {
        setSuccess("Échange modifié avec succès !");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error("Erreur lors de la modification de l'échange");
      }
    } catch (err: any) {
      console.error("❌ Erreur modification échange:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la modification",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !echange) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-warning text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
              Modifier l'échange
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
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
          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-md-8">
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
                      <label className="form-label fw-semibold">Statut</label>
                      <select
                        className="form-select"
                        name="statut"
                        value={formData.statut}
                        onChange={handleInputChange}
                      >
                        <option value="en_attente">En attente</option>
                        <option value="disponible">Disponible</option>
                        <option value="accepte">Accepté</option>
                        <option value="refuse">Refusé</option>
                        <option value="indisponible">Indisponible</option>
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
                </div>
              </div>

              <div className="col-md-4">
                <div className="sticky-top" style={{ top: "20px" }}>
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold text-dark mb-3">
                        <FontAwesomeIcon
                          icon={faCamera}
                          className="me-2 text-primary"
                        />
                        Photo
                      </h6>

                      {imagePreview ? (
                        <div className="position-relative mb-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid rounded mb-2"
                            style={{
                              maxHeight: "200px",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            onClick={removeImage}
                            disabled={loading}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4 border rounded mb-3 bg-light">
                          <FontAwesomeIcon
                            icon={faImage}
                            className="text-muted fs-1 mb-2"
                          />
                          <p className="text-muted mb-0">Aucune photo</p>
                        </div>
                      )}

                      <div className="d-grid">
                        <label className="btn btn-outline-primary">
                          <FontAwesomeIcon icon={faUpload} className="me-2" />
                          {imagePreview
                            ? "Changer la photo"
                            : "Ajouter une photo"}
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

                  <div className="card border mt-3">
                    <div className="card-body">
                      <h6 className="fw-bold text-dark mb-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="me-2 text-primary"
                        />
                        Informations
                      </h6>
                      <div className="mb-2">
                        <small className="text-muted">ID</small>
                        <div className="fw-semibold text-truncate">
                          {echange.uuid}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Date création</small>
                        <div className="fw-semibold">
                          {new Date(
                            echange.createdAt || Date.now(),
                          ).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Statut actuel</small>
                        <div className="fw-semibold">
                          {echange.statut === "en_attente" && (
                            <span className="badge bg-warning">En attente</span>
                          )}
                          {echange.statut === "disponible" && (
                            <span className="badge bg-success">Disponible</span>
                          )}
                          {echange.statut === "accepte" && (
                            <span className="badge bg-primary">Accepté</span>
                          )}
                          {echange.statut === "refuse" && (
                            <span className="badge bg-danger">Refusé</span>
                          )}
                          {echange.statut === "indisponible" && (
                            <span className="badge bg-secondary">
                              Indisponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de modal */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="button"
              className="btn btn-warning"
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
            >
              {loading || uploadingImage ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {uploadingImage ? "Upload..." : "Modification..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Modifier l'échange
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
