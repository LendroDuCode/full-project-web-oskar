"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faEye,
  faTrash,
  faRefresh,
  faFilter,
  faSearch,
  faTimes,
  faCheckCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTag,
  faMoneyBillWave,
  faCalendar,
  faSort,
  faSortUp,
  faSortDown,
  faDownload,
  faEdit,
  faToggleOn,
  faToggleOff,
  faCheck,
  faImage,
  faUser,
  faStore,
  faLayerGroup,
  faChartLine,
  faSpinner,
  faTimesCircle,
  faUpload,
  faChevronDown,
  faPercent,
  faWeightHanging,
  faRulerVertical,
  faBarcode,
  faPalette,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";

interface ProduitUtilisateur {
  id: number;
  uuid: string;
  libelle: string;
  description: string | null;
  prix: string;
  quantite: number;
  statut: string;
  estPublie: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  image: string | null;
  categorie: {
    id: number;
    uuid: string;
    type: string;
    libelle: string;
    description: string;
    image: string;
  };
  source: {
    type: string;
    infos: {
      uuid: string;
      nom: string;
      prenoms: string;
      avatar: string;
      email: string;
    };
  };
}

interface SortConfig {
  key: keyof ProduitUtilisateur;
  direction: "asc" | "desc";
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ================================
// COMPOSANT MODAL VIEW
// ================================
function ViewProduitModal({
  isOpen,
  produit,
  onClose,
}: {
  isOpen: boolean;
  produit: ProduitUtilisateur | null;
  onClose: () => void;
}) {
  if (!isOpen || !produit) return null;

  const [activeTab, setActiveTab] = useState("details");
  const [zoomImage, setZoomImage] = useState(false);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      publie: { color: "success", text: "Publié" },
      en_attente: { color: "warning", text: "En attente" },
      rejete: { color: "danger", text: "Rejeté" },
      brouillon: { color: "secondary", text: "Brouillon" },
    };

    const status = statusMap[statut] || { color: "info", text: statut };
    return (
      <span
        className={`badge bg-${status.color} bg-opacity-10 text-${status.color}`}
      >
        {status.text}
      </span>
    );
  };

  const getProductImage = (produit: ProduitUtilisateur) => {
    if (produit.image) {
      return produit.image;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=300&bold=true`;
  };

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
      aria-labelledby="viewProduitModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${colors.oskar.blue}30`,
          }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
              padding: "1.5rem 2rem",
            }}
          >
            <div className="d-flex align-items-center w-100">
              <div
                className="bg-white bg-opacity-25 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px" }}
              >
                <FontAwesomeIcon icon={faEye} className="fs-4" />
              </div>
              <div className="flex-grow-1">
                <h5 className="modal-title mb-1 fw-bold fs-4">
                  Détails du produit
                </h5>
                <p className="mb-0 opacity-85" style={{ fontSize: "0.95rem" }}>
                  Informations complètes sur votre produit
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Corps */}
          <div className="modal-body p-4">
            <div className="row">
              {/* Image */}
              <div className="col-md-5 mb-4 mb-md-0">
                <div className="position-relative">
                  <img
                    src={getProductImage(produit)}
                    alt={produit.libelle}
                    className="img-fluid rounded-3 shadow-lg w-100"
                    style={{ height: "300px", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=300&bold=true`;
                    }}
                  />
                  {produit.estPublie && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span
                        className="badge bg-success"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-1"
                        />
                        Publié
                      </span>
                    </div>
                  )}
                </div>

                {/* Indicateurs rapides */}
                <div className="mt-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="me-2 text-primary"
                        />
                        Informations rapides
                      </h6>
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Statut</small>
                          <div className="mt-1">
                            {getStatusBadge(produit.statut)}
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">
                            Publication
                          </small>
                          <div className="mt-1">
                            {produit.estPublie ? (
                              <span className="badge bg-success bg-opacity-10 text-success">
                                <FontAwesomeIcon
                                  icon={faToggleOn}
                                  className="me-1"
                                />
                                Publié
                              </span>
                            ) : (
                              <span className="badge bg-warning bg-opacity-10 text-warning">
                                <FontAwesomeIcon
                                  icon={faToggleOff}
                                  className="me-1"
                                />
                                Non publié
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Quantité</small>
                          <div className="fw-semibold mt-1">
                            {produit.quantite}
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">
                            Prix unitaire
                          </small>
                          <div className="fw-semibold text-primary mt-1">
                            {formatPrice(produit.prix)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="col-md-7">
                <h2 className="fw-bold mb-3">{produit.libelle}</h2>

                {/* Catégorie */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="me-2 text-muted"
                    />
                    <span className="fw-semibold me-3">Catégorie:</span>
                    <div className="d-flex align-items-center">
                      {produit.categorie.image && (
                        <img
                          src={produit.categorie.image}
                          alt={produit.categorie.libelle}
                          className="rounded me-2"
                          style={{
                            width: "32px",
                            height: "32px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div>
                        <div className="fw-medium">
                          {produit.categorie.libelle}
                        </div>
                        <small className="text-muted">
                          {produit.categorie.type}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FontAwesomeIcon
                      icon={faTag}
                      className="me-2 text-primary"
                    />
                    Description
                  </h6>
                  {produit.description ? (
                    <div className="bg-light rounded p-3">
                      <p className="mb-0" style={{ lineHeight: "1.6" }}>
                        {produit.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted fst-italic">
                      Aucune description disponible
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <h6 className="fw-bold mb-2">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="me-2 text-primary"
                      />
                      Date de création
                    </h6>
                    <div className="fw-semibold">
                      {formatDate(produit.createdAt)}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="fw-bold mb-2">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="me-2 text-primary"
                      />
                      Dernière modification
                    </h6>
                    <div className="fw-semibold">
                      {formatDate(produit.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Informations vendeur */}
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="me-2 text-primary"
                      />
                      Informations du vendeur
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      {produit.source.infos.avatar && (
                        <img
                          src={produit.source.infos.avatar}
                          alt={`${produit.source.infos.prenoms} ${produit.source.infos.nom}`}
                          className="rounded-circle"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div>
                        <div className="fw-bold">
                          {produit.source.infos.prenoms}{" "}
                          {produit.source.infos.nom}
                        </div>
                        <div className="text-muted">{produit.source.type}</div>
                        {produit.source.infos.email && (
                          <div className="text-muted small">
                            {produit.source.infos.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* UUID */}
                <div className="mt-4 pt-4 border-top">
                  <small className="text-muted d-block">
                    Identifiant unique
                  </small>
                  <code className="text-muted">{produit.uuid}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                style={{ borderRadius: "10px", padding: "0.75rem 2rem" }}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Fermer
              </button>
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

        .btn {
          border-radius: 10px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

// ================================
// COMPOSANT MODAL EDIT
// ================================
function EditProduitModal({
  isOpen,
  produit,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  produit: ProduitUtilisateur | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState<{
    libelle: string;
    description: string;
    prix: string;
    quantite: number;
    statut: string;
    estPublie: boolean;
    categorie_uuid: string;
  }>({
    libelle: "",
    description: "",
    prix: "",
    quantite: 1,
    statut: "publie",
    estPublie: false,
    categorie_uuid: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    Array<{
      uuid: string;
      libelle: string;
      image?: string;
      type: string;
    }>
  >([]);
  const [activeStep, setActiveStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (produit) {
      setFormData({
        libelle: produit.libelle,
        description: produit.description || "",
        prix: produit.prix,
        quantite: produit.quantite,
        statut: produit.statut,
        estPublie: produit.estPublie,
        categorie_uuid: produit.categorie.uuid,
      });
    }
  }, [produit]);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      }
    };

    if (isOpen) {
      loadCategories();
      setActiveStep(1);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produit) return;

    setLoading(true);
    setError(null);

    try {
      // Simulation d'API - À remplacer par votre appel API réel
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess(`Produit "${formData.libelle}" modifié avec succès !`);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification du produit");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !produit) return null;

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const steps = [
    { number: 1, title: "Informations", icon: faTag },
    { number: 2, title: "Détails", icon: faMoneyBillWave },
    { number: 3, title: "Confirmation", icon: faCheckCircle },
  ];

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1060,
      }}
      role="dialog"
      aria-labelledby="editProduitModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${colors.oskar.yellow}30`,
          }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0"
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
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer"
              style={{
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
                    }}
                  >
                    <FontAwesomeIcon icon={step.icon} />
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

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="alert alert-danger mx-4 mb-4" role="alert">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {activeStep === 1 && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faTag} className="me-2" />
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="libelle"
                      value={formData.libelle}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Entrez le nom du produit"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="me-2"
                      />
                      Prix *
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        name="prix"
                        value={formData.prix}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min="0"
                        step="0.01"
                      />
                      <span className="input-group-text">CFA</span>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faEdit} className="me-2" />
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Décrivez votre produit..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faBox} className="me-2" />
                      Quantité *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantite"
                      value={formData.quantite}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      min="0"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                      Catégorie *
                    </label>
                    <select
                      className="form-select"
                      name="categorie_uuid"
                      value={formData.categorie_uuid}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.uuid} value={category.uuid}>
                          {category.libelle} ({category.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faToggleOn} className="me-2" />
                      Statut
                    </label>
                    <select
                      className="form-select"
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="publie">Publié</option>
                      <option value="en_attente">En attente</option>
                      <option value="brouillon">Brouillon</option>
                      <option value="rejete">Rejeté</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-block">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                      Publication
                    </label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="edit-estPublie"
                        name="estPublie"
                        checked={formData.estPublie}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="edit-estPublie"
                      >
                        {formData.estPublie ? "Publié" : "Non publié"}
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <FontAwesomeIcon icon={faImage} className="me-2" />
                      Image du produit
                    </label>
                    <div className="border rounded p-3 text-center">
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="fs-1 text-muted mb-2"
                      />
                      <p className="mb-2">Cliquez pour télécharger une image</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="form-control d-none"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Choisir un fichier
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-success"
                      style={{ fontSize: "4rem" }}
                    />
                  </div>
                  <h4 className="fw-bold mb-3">Confirmer les modifications</h4>
                  <p className="text-muted mb-4">
                    Vérifiez les informations ci-dessous avant de sauvegarder
                  </p>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-bold">Produit</h6>
                          <p className="mb-1">{formData.libelle}</p>
                          <small className="text-muted">
                            {formData.description.substring(0, 100)}...
                          </small>
                        </div>
                        <div className="col-md-6">
                          <h6 className="fw-bold">Détails</h6>
                          <p className="mb-1">
                            Prix: {formatPrice(formData.prix)}
                          </p>
                          <p className="mb-1">Quantité: {formData.quantite}</p>
                          <p className="mb-1">Statut: {formData.statut}</p>
                          <p className="mb-0">
                            Publication: {formData.estPublie ? "Oui" : "Non"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className="modal-footer border-top-0">
              <div className="d-flex justify-content-between w-100">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    activeStep > 1 ? setActiveStep(activeStep - 1) : onClose()
                  }
                  disabled={loading}
                >
                  {activeStep > 1 ? "Précédent" : "Annuler"}
                </button>

                {activeStep < steps.length ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveStep(activeStep + 1)}
                    disabled={loading}
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={loading}
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
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="me-2"
                        />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
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
        }

        .btn {
          border-radius: 10px !important;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

// ================================
// COMPOSANT MODAL DELETE
// ================================
function DeleteProduitModal({
  show,
  produit,
  loading,
  onClose,
  onConfirm,
  type = "single",
  count = 0,
}: {
  show: boolean;
  produit: ProduitUtilisateur | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: "single" | "multiple";
  count?: number;
}) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1070,
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {type === "multiple"
                ? "Suppression multiple"
                : "Confirmer la suppression"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-warning mb-3 border-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            {type === "single" && produit ? (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer le produit{" "}
                  <strong>{produit.libelle}</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    à ce produit seront perdues.
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <strong>{count} produit(s)</strong> ?
                </p>
                <div className="text-danger">
                  <small>
                    Cette action est irréversible. Toutes les données associées
                    seront perdues.
                  </small>
                </div>
              </>
            )}
          </div>
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
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {type === "multiple"
                    ? "Suppression en cours..."
                    : "Suppression..."}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  {type === "multiple"
                    ? `Supprimer ${count} produit(s)`
                    : "Supprimer définitivement"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// COMPOSANT PRINCIPAL
// ================================
export default function ListeProduitsCreeUtilisateur() {
  const [produits, setProduits] = useState<ProduitUtilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);

  // États pour les modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] =
    useState<ProduitUtilisateur | null>(null);
  const [deleteType, setDeleteType] = useState<"single" | "multiple">("single");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    averagePrice: 0,
    publishedCount: 0,
    unpublishedCount: 0,
    totalQuantity: 0,
    withImageCount: 0,
  });

  // Informations utilisateur
  const [utilisateurInfo, setUtilisateurInfo] = useState<{
    uuid: string;
    nom: string;
    prenoms: string;
    avatar: string;
  } | null>(null);

  // Charger les produits
  const fetchProduitsUtilisateur = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        "/produits/liste-mes-utilisateur-produits",
      );

      if (response.data?.status === "success" && response.data.data) {
        const data = response.data.data;

        if (data.produits && Array.isArray(data.produits)) {
          const produitsData = data.produits;
          const paginationData = data.pagination;
          const utilisateurData = data.utilisateur;

          setProduits(produitsData);

          if (utilisateurData) {
            setUtilisateurInfo(utilisateurData);
          }

          // Calculer les stats
          const total = produitsData.length;
          const totalValue = produitsData.reduce(
            (sum: number, produit: ProduitUtilisateur) =>
              sum + parseFloat(produit.prix) * produit.quantite,
            0,
          );
          const averagePrice = total > 0 ? totalValue / total : 0;
          const publishedCount = produitsData.filter(
            (p: ProduitUtilisateur) => p.estPublie,
          ).length;
          const unpublishedCount = total - publishedCount;
          const totalQuantity = produitsData.reduce(
            (sum: number, produit: ProduitUtilisateur) =>
              sum + produit.quantite,
            0,
          );
          const withImageCount = produitsData.filter(
            (p: ProduitUtilisateur) => p.image,
          ).length;

          setStats({
            total,
            totalValue,
            averagePrice,
            publishedCount,
            unpublishedCount,
            totalQuantity,
            withImageCount,
          });

          // Mettre à jour la pagination
          if (paginationData) {
            setPagination({
              page: paginationData.page || 1,
              limit: paginationData.limit || 10,
              total: paginationData.total || produitsData.length,
              pages:
                paginationData.totalPages ||
                Math.ceil(produitsData.length / 10),
            });
          } else {
            setPagination({
              page: 1,
              limit: 10,
              total: produitsData.length,
              pages: Math.ceil(produitsData.length / 10),
            });
          }
        } else {
          setProduits([]);
          resetStats();
        }
      } else if (Array.isArray(response.data)) {
        setProduits(response.data);
        calculateStats(response.data);
      } else if (
        response.data.produits &&
        Array.isArray(response.data.produits)
      ) {
        setProduits(response.data.produits);
        calculateStats(response.data.produits);
      } else {
        throw new Error("Format de réponse API non reconnu");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des produits:", err);

      let errorMessage = "Erreur lors du chargement de vos produits";

      if (err.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (err.response?.status === 404) {
        errorMessage = "Aucun produit trouvé pour votre compte.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setProduits([]);
      resetStats();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduitsUtilisateur();
  }, [fetchProduitsUtilisateur]);

  // Fonctions pour les modals
  const handleViewDetails = (produit: ProduitUtilisateur) => {
    setSelectedProduit(produit);
    setIsViewModalOpen(true);
  };

  const handleEditProduit = (produit: ProduitUtilisateur) => {
    setSelectedProduit(produit);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduit = (produitUuid: string) => {
    const produit = produits.find((p) => p.uuid === produitUuid);
    if (produit) {
      setSelectedProduit(produit);
      setDeleteType("single");
      setIsDeleteModalOpen(true);
    }
  };

  const handleBulkDelete = () => {
    setDeleteType("multiple");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);

    try {
      if (deleteType === "single" && selectedProduit) {
        // Simulation d'API - À remplacer par votre appel API réel
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProduits((prev) =>
          prev.filter((p) => p.uuid !== selectedProduit.uuid),
        );
        setSuccessMessage(
          `Produit "${selectedProduit.libelle}" supprimé avec succès !`,
        );
      } else if (deleteType === "multiple") {
        // Simulation d'API - À remplacer par votre appel API réel
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setProduits((prev) =>
          prev.filter((p) => !selectedProduits.includes(p.uuid)),
        );
        setSuccessMessage(
          `${selectedProduits.length} produit(s) supprimé(s) avec succès !`,
        );
        setSelectedProduits([]);
      }

      setIsDeleteModalOpen(false);
      setSelectedProduit(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProduit(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduit(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduit(null);
  };

  const handleEditSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
    fetchProduitsUtilisateur();
  };

  // Calcul des statistiques
  const calculateStats = (produitsList: ProduitUtilisateur[]) => {
    const total = produitsList.length;
    const totalValue = produitsList.reduce(
      (sum, produit) => sum + parseFloat(produit.prix) * produit.quantite,
      0,
    );
    const averagePrice = total > 0 ? totalValue / total : 0;
    const publishedCount = produitsList.filter((p) => p.estPublie).length;
    const unpublishedCount = total - publishedCount;
    const totalQuantity = produitsList.reduce(
      (sum, produit) => sum + produit.quantite,
      0,
    );
    const withImageCount = produitsList.filter((p) => p.image).length;

    setStats({
      total,
      totalValue,
      averagePrice,
      publishedCount,
      unpublishedCount,
      totalQuantity,
      withImageCount,
    });
  };

  const resetStats = () => {
    setStats({
      total: 0,
      totalValue: 0,
      averagePrice: 0,
      publishedCount: 0,
      unpublishedCount: 0,
      totalQuantity: 0,
      withImageCount: 0,
    });
  };

  // Filtrage et tri
  const filteredProduits = useMemo(() => {
    let result = produits.filter((produit) => {
      // Filtre par recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        produit.libelle.toLowerCase().includes(searchLower) ||
        (produit.description &&
          produit.description.toLowerCase().includes(searchLower)) ||
        produit.prix.toString().includes(searchTerm) ||
        produit.categorie.libelle.toLowerCase().includes(searchLower);

      // Filtre par statut
      const matchesStatus =
        statusFilter === "all" || produit.statut === statusFilter;

      // Filtre par publication
      const matchesPublish =
        publishFilter === "all" ||
        (publishFilter === "published" && produit.estPublie) ||
        (publishFilter === "unpublished" && !produit.estPublie);

      // Filtre par prix
      const prixNumber = parseFloat(produit.prix);
      const matchesPrice =
        prixNumber >= priceRange[0] && prixNumber <= priceRange[1];

      return matchesSearch && matchesStatus && matchesPublish && matchesPrice;
    });

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Gestion spéciale pour le prix (string)
        if (sortConfig.key === "prix") {
          const prixA = parseFloat(a.prix);
          const prixB = parseFloat(b.prix);
          return sortConfig.direction === "asc" ? prixA - prixB : prixB - prixA;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    // Mettre à jour la pagination locale
    const newTotal = result.length;
    const newPages = Math.ceil(newTotal / pagination.limit);

    setPagination((prev) => ({
      ...prev,
      total: newTotal,
      pages: newPages,
      page: prev.page > newPages ? 1 : prev.page, // Ajuster la page si nécessaire
    }));

    return result;
  }, [
    produits,
    searchTerm,
    statusFilter,
    publishFilter,
    priceRange,
    sortConfig,
    pagination.limit,
  ]);

  // Produits de la page courante
  const currentItems = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredProduits.slice(startIndex, endIndex);
  }, [filteredProduits, pagination.page, pagination.limit]);

  const requestSort = (key: keyof ProduitUtilisateur) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof ProduitUtilisateur) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="text-muted ms-1"
          style={{ fontSize: "0.8rem" }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        className="text-primary ms-1"
        style={{ fontSize: "0.8rem" }}
      />
    );
  };

  // Formatage
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numPrice || 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Récupérer l'image du produit
  const getProductImage = (produit: ProduitUtilisateur) => {
    if (produit.image) {
      return produit.image;
    }

    // Image par défaut avec les initiales du produit
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=80&bold=true`;
  };

  const getStatusBadge = (statut: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      publie: { color: "success", text: "Publié" },
      en_attente: { color: "warning", text: "En attente" },
      rejete: { color: "danger", text: "Rejeté" },
      brouillon: { color: "secondary", text: "Brouillon" },
    };

    const status = statusMap[statut] || { color: "info", text: statut };
    return (
      <span
        className={`badge bg-${status.color} bg-opacity-10 text-${status.color}`}
      >
        {status.text}
      </span>
    );
  };

  // Actions
  const handleTogglePublish = async (
    produitUuid: string,
    currentState: boolean,
  ) => {
    const action = currentState ? "dépublier" : "publier";
    if (!confirm(`Voulez-vous ${action} ce produit ?`)) return;

    try {
      // TODO: Implémenter l'appel API pour publier/dépublier
      // Simulation
      setProduits((prev) =>
        prev.map((p) =>
          p.uuid === produitUuid ? { ...p, estPublie: !currentState } : p,
        ),
      );

      const successMsg = `Produit ${action} avec succès !`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(`Erreur lors de ${action}:`, err);
      setError(
        err.response?.data?.message || `Erreur lors de ${action} du produit`,
      );
    }
  };

  // Actions en masse
  const handleBulkAction = async (
    action: "publish" | "unpublish" | "delete",
  ) => {
    if (selectedProduits.length === 0) {
      setError("Veuillez sélectionner au moins un produit");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const actionText = {
      publish: "publier",
      unpublish: "dépublier",
      delete: "supprimer",
    }[action];

    if (action === "delete") {
      handleBulkDelete();
      return;
    }

    if (
      !confirm(
        `Voulez-vous ${actionText} ${selectedProduits.length} produit(s) ?`,
      )
    )
      return;

    try {
      // TODO: Implémenter les appels API en masse
      const newPublishedState = action === "publish";
      setProduits((prev) =>
        prev.map((p) =>
          selectedProduits.includes(p.uuid)
            ? { ...p, estPublie: newPublishedState }
            : p,
        ),
      );

      setSelectedProduits([]);
      const successMsg = `${selectedProduits.length} produit(s) ${actionText}(s) avec succès`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(`Erreur lors de ${action}:`, err);
      setError(`Erreur lors de ${action} des produits`);
    }
  };

  const handleSelectProduit = (produitUuid: string) => {
    setSelectedProduits((prev) =>
      prev.includes(produitUuid)
        ? prev.filter((id) => id !== produitUuid)
        : [...prev, produitUuid],
    );
  };

  const handleSelectAll = () => {
    if (
      selectedProduits.length === currentItems.length &&
      currentItems.length > 0
    ) {
      setSelectedProduits([]);
    } else {
      setSelectedProduits(currentItems.map((p) => p.uuid));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProduits.length === 0) {
      setError("Aucun produit à exporter");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const headers = [
      "UUID",
      "Libellé",
      "Description",
      "Prix",
      "Quantité",
      "Statut",
      "Publié",
      "Catégorie",
      "Date création",
      "Date modification",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredProduits.map((produit) =>
        [
          produit.uuid,
          escapeCsv(produit.libelle),
          escapeCsv(produit.description || ""),
          produit.prix,
          produit.quantite,
          produit.statut,
          produit.estPublie ? "Oui" : "Non",
          escapeCsv(produit.categorie.libelle),
          produit.createdAt ? formatDate(produit.createdAt) : "",
          produit.updatedAt ? formatDate(produit.updatedAt) : "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `mes-produits-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const successMsg = "Export CSV réussi !";
    setSuccessMessage(successMsg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPublishFilter("all");
    setPriceRange([0, 1000000]);
    setSortConfig(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedProduits([]);
  };

  // Calculer le prix max pour le filtre
  const maxPrice = useMemo(() => {
    if (produits.length === 0) return 1000000;
    const max = Math.max(...produits.map((p) => parseFloat(p.prix)));
    return max > 0 ? max : 1000000;
  }, [produits]);

  // Composant de chargement
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="text-center py-5">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-primary"
                style={{ fontSize: "3rem" }}
              />
              <h4 className="mt-4 fw-bold">Chargement de vos produits...</h4>
              <p className="text-muted">
                Veuillez patienter pendant le chargement de vos données
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec info utilisateur */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-3">
              {utilisateurInfo?.avatar && (
                <div className="position-relative me-3">
                  <img
                    src={utilisateurInfo.avatar}
                    alt={`${utilisateurInfo.prenoms} ${utilisateurInfo.nom}`}
                    className="rounded-circle border"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(utilisateurInfo.prenoms + " " + utilisateurInfo.nom)}&background=007bff&color=fff&size=64`;
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="h2 fw-bold mb-1">Mes Produits</h1>
                {utilisateurInfo && (
                  <p className="text-muted mb-0">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {utilisateurInfo.prenoms} {utilisateurInfo.nom}
                  </p>
                )}
              </div>
            </div>
            <p className="text-muted mb-0">
              Liste des produits que vous avez créés sur la plateforme
              {searchTerm && ` - Recherche: "${searchTerm}"`}
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
            <button
              onClick={fetchProduitsUtilisateur}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRefresh} spin={loading} />
              Rafraîchir
            </button>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              disabled={filteredProduits.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} />
              Exporter CSV
            </button>
            <button
              onClick={resetFilters}
              className="btn btn-outline-danger d-flex align-items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm mb-4"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle p-2"
                  style={{ backgroundColor: `${colors.oskar.red}20` }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
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
            className="alert alert-success border-0 shadow-sm mb-4"
            role="alert"
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
                <h6 className="alert-heading mb-1 fw-bold">Succès</h6>
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

        {/* Cartes de statistiques */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.blue}15 0%, ${colors.oskar.blue}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.blue}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faBox} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-muted small">Total produits</div>
                    <div className="fw-bold fs-4">{stats.total}</div>
                    <div className="text-muted small">
                      {filteredProduits.length} filtré(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.green}15 0%, ${colors.oskar.green}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.green}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faToggleOn}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Publiés</div>
                    <div className="fw-bold fs-4">{stats.publishedCount}</div>
                    <div className="text-muted small">
                      {stats.unpublishedCount} non publié(s)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.yellow}15 0%, ${colors.oskar.yellow}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.yellow}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Valeur totale</div>
                    <div className="fw-bold fs-4">
                      {formatPrice(stats.totalValue)}
                    </div>
                    <div className="text-muted small">
                      {formatPrice(stats.averagePrice)} moyenne
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.purple}15 0%, ${colors.oskar.purple}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.purple}20`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="text-purple"
                    />
                  </div>
                  <div>
                    <div className="text-muted small">Quantité totale</div>
                    <div className="fw-bold fs-4">{stats.totalQuantity}</div>
                    <div className="text-muted small">En stock</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.orange}15 0%, ${colors.oskar.orange}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.orange}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} className="text-orange" />
                  </div>
                  <div>
                    <div className="text-muted small">Avec images</div>
                    <div className="fw-bold fs-4">{stats.withImageCount}</div>
                    <div className="text-muted small">
                      {stats.total - stats.withImageCount} sans image
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.red}15 0%, ${colors.oskar.red}10 100%)`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: `${colors.oskar.red}20`,
                    }}
                  >
                    <FontAwesomeIcon icon={faStore} className="text-red" />
                  </div>
                  <div>
                    <div className="text-muted small">Sélectionnés</div>
                    <div className="fw-bold fs-4">
                      {selectedProduits.length}
                    </div>
                    <div className="text-muted small">
                      {selectedProduits.length > 0
                        ? "Actions disponibles"
                        : "Sélectionnez"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher par nom, catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Rechercher des produits"
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setSearchTerm("")}
                    aria-label="Effacer la recherche"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faFilter} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="publie">Publié</option>
                  <option value="en_attente">En attente</option>
                  <option value="rejete">Rejeté</option>
                  <option value="brouillon">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="col-md-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon icon={faToggleOn} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={publishFilter}
                  onChange={(e) => setPublishFilter(e.target.value)}
                  aria-label="Filtrer par publication"
                >
                  <option value="all">Tous</option>
                  <option value="published">Publiés uniquement</option>
                  <option value="unpublished">Non publiés</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="text-muted"
                  />
                </span>
                <input
                  type="range"
                  className="form-range border-start-0"
                  min="0"
                  max={maxPrice}
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  aria-label="Filtrer par prix maximum"
                />
                <span className="input-group-text">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>
          </div>

          {/* Informations de filtrage */}
          <div className="row mt-3">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faFilter} className="me-1" />
                  {filteredProduits.length} produit(s) sur {produits.length}
                  {searchTerm && (
                    <>
                      {" "}
                      pour "<strong>{searchTerm}</strong>"
                    </>
                  )}
                </small>
                {selectedProduits.length > 0 && (
                  <small className="text-primary fw-semibold">
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    {selectedProduits.length} sélectionné(s)
                  </small>
                )}
              </div>
            </div>
            <div className="col-md-4 text-end">
              <small className="text-muted">
                Page {pagination.page} sur {pagination.pages} •{" "}
                {pagination.limit} par page
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en masse */}
      {selectedProduits.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBox} className="text-primary me-2" />
                <span className="fw-semibold">
                  {selectedProduits.length} produit(s) sélectionné(s)
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("publish")}
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOn} />
                  Publier
                </button>
                <button
                  onClick={() => handleBulkAction("unpublish")}
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faToggleOff} />
                  Dépublier
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedProduits([])}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredProduits.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <FontAwesomeIcon icon={faBox} className="fs-1 text-muted" />
              </div>
              <h4 className="fw-bold mb-3">
                {produits.length === 0
                  ? "Aucun produit créé"
                  : "Aucun résultat"}
              </h4>
              <p className="text-muted mb-4">
                {produits.length === 0
                  ? "Vous n'avez pas encore créé de produits."
                  : "Aucun produit ne correspond à vos critères de recherche."}
              </p>
              {(searchTerm ||
                statusFilter !== "all" ||
                publishFilter !== "all" ||
                priceRange[1] < maxPrice) && (
                <button onClick={resetFilters} className="btn btn-primary me-2">
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Réinitialiser les filtres
                </button>
              )}
              <button
                onClick={fetchProduitsUtilisateur}
                className="btn btn-outline-secondary"
              >
                <FontAwesomeIcon icon={faRefresh} className="me-2" />
                Recharger
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }} className="text-center">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectedProduits.length === currentItems.length &&
                              currentItems.length > 0
                            }
                            onChange={handleSelectAll}
                            aria-label="Sélectionner tous les produits de la page"
                          />
                        </div>
                      </th>
                      <th style={{ width: "100px" }} className="text-center">
                        Image
                      </th>
                      <th style={{ width: "250px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("libelle")}
                        >
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          Produit {getSortIcon("libelle")}
                        </button>
                      </th>
                      <th style={{ width: "150px" }}>Catégorie</th>
                      <th style={{ width: "120px" }}>
                        <button
                          className="btn btn-link p-0 text-decoration-none fw-semibold text-dark border-0 bg-transparent"
                          onClick={() => requestSort("prix")}
                        >
                          <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="me-1"
                          />
                          Prix {getSortIcon("prix")}
                        </button>
                      </th>
                      <th style={{ width: "100px" }}>Quantité</th>
                      <th style={{ width: "120px" }}>Statut</th>
                      <th style={{ width: "120px" }}>Publication</th>
                      <th style={{ width: "180px" }}>Date modification</th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((produit) => (
                      <tr
                        key={produit.uuid}
                        className={
                          selectedProduits.includes(produit.uuid)
                            ? "table-active"
                            : ""
                        }
                      >
                        <td className="text-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedProduits.includes(produit.uuid)}
                              onChange={() => handleSelectProduit(produit.uuid)}
                              aria-label={`Sélectionner ${produit.libelle}`}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <div
                            className="position-relative mx-auto"
                            style={{ width: "80px", height: "80px" }}
                          >
                            <img
                              src={getProductImage(produit)}
                              alt={produit.libelle}
                              className="img-fluid rounded border"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.libelle)}&background=007bff&color=fff&size=80&bold=true`;
                              }}
                            />
                            {!produit.image && (
                              <div className="position-absolute bottom-0 end-0 translate-middle">
                                <span
                                  className="badge bg-warning rounded-circle p-1"
                                  style={{ fontSize: "0.6rem" }}
                                  title="Image par défaut"
                                >
                                  <FontAwesomeIcon icon={faImage} />
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold mb-1">
                            {produit.libelle}
                          </div>
                          {produit.description && (
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: "200px" }}
                              title={produit.description}
                            >
                              {produit.description.substring(0, 80)}
                              {produit.description.length > 80 ? "..." : ""}
                            </small>
                          )}
                          <div className="mt-2">
                            <small className="text-muted">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="me-1"
                              />
                              Créé: {formatDate(produit.createdAt)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {produit.categorie.image && (
                              <img
                                src={produit.categorie.image}
                                alt={produit.categorie.libelle}
                                className="rounded me-2"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(produit.categorie.libelle)}&background=6c757d&color=fff&size=32`;
                                }}
                              />
                            )}
                            <div>
                              <div className="fw-medium">
                                {produit.categorie.libelle}
                              </div>
                              <small className="text-muted">
                                {produit.categorie.type}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            {formatPrice(produit.prix)}
                          </div>
                          <small className="text-muted">par unité</small>
                        </td>
                        <td>
                          <div className="fw-semibold">{produit.quantite}</div>
                        </td>
                        <td>{getStatusBadge(produit.statut)}</td>
                        <td>
                          {produit.estPublie ? (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <FontAwesomeIcon
                                icon={faToggleOn}
                                className="me-1"
                              />
                              Publié
                            </span>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              <FontAwesomeIcon
                                icon={faToggleOff}
                                className="me-1"
                              />
                              Non publié
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fw-medium">
                            {formatDate(produit.updatedAt)}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-info"
                              title="Voir détails"
                              onClick={() => handleViewDetails(produit)}
                              aria-label={`Voir détails de ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              title="Éditer"
                              onClick={() => handleEditProduit(produit)}
                              aria-label={`Éditer ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className={`btn ${produit.estPublie ? "btn-outline-warning" : "btn-outline-success"}`}
                              title={
                                produit.estPublie ? "Dépublier" : "Publier"
                              }
                              onClick={() =>
                                handleTogglePublish(
                                  produit.uuid,
                                  produit.estPublie,
                                )
                              }
                              aria-label={`${produit.estPublie ? "Dépublier" : "Publier"} ${produit.libelle}`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  produit.estPublie ? faToggleOff : faToggleOn
                                }
                              />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Supprimer"
                              onClick={() => handleDeleteProduit(produit.uuid)}
                              aria-label={`Supprimer ${produit.libelle}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="card-footer bg-white border-0 py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Affichage de{" "}
                        <strong>
                          {(pagination.page - 1) * pagination.limit + 1}
                        </strong>{" "}
                        à{" "}
                        <strong>
                          {Math.min(
                            pagination.page * pagination.limit,
                            filteredProduits.length,
                          )}
                        </strong>{" "}
                        sur <strong>{filteredProduits.length}</strong>{" "}
                        produit(s)
                      </small>
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page - 1,
                              }))
                            }
                            disabled={pagination.page === 1}
                            aria-label="Page précédente"
                          >
                            &laquo;
                          </button>
                        </li>

                        {(() => {
                          const pages = [];
                          const maxVisible = 5;
                          let startPage = Math.max(
                            1,
                            pagination.page - Math.floor(maxVisible / 2),
                          );
                          let endPage = Math.min(
                            pagination.pages,
                            startPage + maxVisible - 1,
                          );

                          if (endPage - startPage + 1 < maxVisible) {
                            startPage = Math.max(1, endPage - maxVisible + 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <li
                                key={i}
                                className={`page-item ${pagination.page === i ? "active" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() =>
                                    setPagination((prev) => ({
                                      ...prev,
                                      page: i,
                                    }))
                                  }
                                >
                                  {i}
                                </button>
                              </li>,
                            );
                          }
                          return pages;
                        })()}

                        <li
                          className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: prev.page + 1,
                              }))
                            }
                            disabled={pagination.page === pagination.pages}
                            aria-label="Page suivante"
                          >
                            &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                    <div className="mt-2 mt-md-0">
                      <select
                        className="form-select form-select-sm"
                        value={pagination.limit}
                        onChange={(e) =>
                          setPagination((prev) => ({
                            ...prev,
                            limit: parseInt(e.target.value),
                            page: 1,
                          }))
                        }
                        aria-label="Nombre d'éléments par page"
                      >
                        <option value="5">5 par page</option>
                        <option value="10">10 par page</option>
                        <option value="25">25 par page</option>
                        <option value="50">50 par page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Informations */}
      <div className="mt-4">
        <div className="alert alert-info border-0 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <div
                className="rounded-circle p-2"
                style={{ backgroundColor: `${colors.oskar.blue}20` }}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1 fw-bold">
                Gestion de vos produits
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Voir détails :</strong> Affiche les informations
                      complètes du produit
                    </li>
                    <li>
                      <strong>Éditer :</strong> Modifiez les informations de vos
                      produits
                    </li>
                    <li>
                      <strong>Publier/Dépublier :</strong> Contrôlez la
                      visibilité de vos produits
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>
                      <strong>Supprimer :</strong> Retirez définitivement un
                      produit
                    </li>
                    <li>
                      <strong>Actions groupées :</strong> Sélectionnez plusieurs
                      produits pour des actions en masse
                    </li>
                    <li>
                      <strong>Export :</strong> Téléchargez la liste de vos
                      produits au format CSV
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewProduitModal
        isOpen={isViewModalOpen}
        produit={selectedProduit}
        onClose={handleCloseViewModal}
      />

      <EditProduitModal
        isOpen={isEditModalOpen}
        produit={selectedProduit}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <DeleteProduitModal
        show={isDeleteModalOpen}
        produit={selectedProduit}
        loading={deleteLoading}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
        type={deleteType}
        count={selectedProduits.length}
      />

      <style jsx>{`
        .table > :not(caption) > * > * {
          padding: 0.75rem 0.5rem;
          vertical-align: middle;
        }
        .table-active {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .form-check-input:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
        }
        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
        .page-link {
          color: #0d6efd;
        }
        .page-link:hover {
          color: #0a58ca;
          background-color: #f8f9fa;
        }
        .form-range::-webkit-slider-thumb {
          background-color: #0d6efd;
        }
        .form-range::-moz-range-thumb {
          background-color: #0d6efd;
        }
        .spinner-border {
          animation-duration: 0.75s;
        }
      `}</style>
    </div>
  );
}
