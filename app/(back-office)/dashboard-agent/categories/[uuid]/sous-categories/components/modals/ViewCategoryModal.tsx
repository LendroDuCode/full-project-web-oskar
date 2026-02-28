"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTag,
  faImage,
  faCalendar,
  faEdit,
  faBoxOpen,
  faGift,
  faExchangeAlt,
  faBullhorn,
  faInfoCircle,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faLayerGroup,
  faArrowUp,
  faCopy,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

interface Category {
  id: number;
  uuid: string;
  type: string;
  libelle: string;
  slug: string;
  description?: string;
  image: string;
  image_key?: string;
  statut?: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  path?: string | null;
  depth?: number | null;
  parent?: {
    uuid: string;
    libelle: string;
    type: string;
    image?: string;
    image_key?: string;
  };
  counts?: {
    produits?: number;
    dons?: number;
    echanges?: number;
    annonces?: number;
    total?: number;
  };
}

interface SubCategory {
  uuid: string;
  libelle: string;
  type: string;
  description?: string;
  image?: string;
  image_key?: string;
  statut?: string;
  createdAt?: string;
  counts?: {
    produits: number;
    dons: number;
    echanges: number;
    annonces: number;
    total: number;
  };
}

interface ViewCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onEdit?: () => void;
  onViewSubCategories?: () => void;
}

const ViewCategoryModal = ({
  isOpen,
  category,
  onClose,
  onEdit,
  onViewSubCategories,
}: ViewCategoryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "subcategories" | "stats"
  >("details");
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Charger les sous-catégories si c'est une catégorie parente
  useEffect(() => {
    if (isOpen && category && (!category.path || category.depth === 0)) {
      loadSubCategories();
    }
  }, [isOpen, category]);

  // Réinitialiser les erreurs d'image quand le modal s'ouvre avec une nouvelle catégorie
  useEffect(() => {
    if (isOpen && category) {
      setImageErrors({});
    }
  }, [isOpen, category?.uuid]);

  const loadSubCategories = async () => {
    // Vérification supplémentaire pour TypeScript
    if (!category) return;

    try {
      setLoadingSubCategories(true);
      const response = await api.get<{ data: SubCategory[] }>(
        API_ENDPOINTS.CATEGORIES.LISTE_SOUS_CATEGORIE(category.uuid),
      );
      setSubCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erreur chargement sous-catégories:", err);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  // ✅ Fonction pour obtenir l'URL de l'image
  const getImageUrl = (item: { image?: string; image_key?: string } | null, id: string): string | null => {
    if (!item) return null;
    
    if (imageErrors[id]) return null;

    // Priorité à image_key
    if (item.image_key) {
      const url = buildImageUrl(item.image_key);
      if (url) return url;
    }

    // Sinon utiliser image
    if (item.image) {
      const url = buildImageUrl(item.image);
      if (url) return url;
    }

    return null;
  };

  // ✅ Gestionnaire d'erreur d'image
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "N/A";
    }
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("produit")) return faBoxOpen;
    if (lowerType.includes("don")) return faGift;
    if (lowerType.includes("échange")) return faExchangeAlt;
    if (lowerType.includes("annonce")) return faBullhorn;
    return faTag;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("produit")) return colors.oskar.blue;
    if (lowerType.includes("don")) return colors.oskar.green;
    if (lowerType.includes("échange")) return colors.oskar.purple;
    if (lowerType.includes("annonce")) return colors.oskar.orange;
    return colors.oskar.grey;
  };

  if (!isOpen || !category) return null;

  const categoryImageUrl = getImageUrl(category, `category-${category.uuid}`);
  const parentImageUrl = category.parent ? getImageUrl(category.parent, `parent-${category.parent.uuid}`) : null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        role="document"
      >
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-white rounded-top-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: `${getTypeColor(category.type)}15`,
                  color: getTypeColor(category.type),
                }}
              >
                <FontAwesomeIcon icon={getTypeIcon(category.type)} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{category.libelle}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${getTypeColor(category.type)}15`,
                      color: getTypeColor(category.type),
                      border: `1px solid ${getTypeColor(category.type)}30`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={getTypeIcon(category.type)}
                      className="me-1"
                    />
                    {category.type}
                  </span>
                  <span
                    className={`badge ${category.statut === "inactif" ? "bg-warning" : "bg-success"} bg-opacity-10 ${category.statut === "inactif" ? "text-warning" : "text-success"}`}
                  >
                    <FontAwesomeIcon
                      icon={
                        category.statut === "inactif"
                          ? faTimesCircle
                          : faCheckCircle
                      }
                      className="me-1"
                    />
                    {category.statut === "inactif" ? "Inactif" : "Actif"}
                  </span>
                  {category.is_deleted && (
                    <span className="badge bg-danger bg-opacity-10 text-danger">
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      Supprimé
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Navigation par onglets */}
          <div className="border-bottom">
            <nav className="nav nav-tabs border-0 px-4">
              <button
                className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                Détails
              </button>
              {(!category.path || category.depth === 0) && (
                <button
                  className={`nav-link ${activeTab === "subcategories" ? "active" : ""}`}
                  onClick={() => setActiveTab("subcategories")}
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                  Sous-catégories
                  {subCategories.length > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">
                      {subCategories.length}
                    </span>
                  )}
                </button>
              )}
              <button
                className={`nav-link ${activeTab === "stats" ? "active" : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                Statistiques
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div
            className="modal-body p-4"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {activeTab === "details" && (
              <div className="row g-4">
                {/* Colonne gauche - Image et infos basiques */}
                <div className="col-md-4">
                  {/* Image */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-0">
                      <div
                        className="position-relative cursor-pointer"
                        onClick={() => setShowImageFullscreen(true)}
                        style={{ aspectRatio: "1/1" }}
                      >
                        {categoryImageUrl ? (
                          <img
                            src={categoryImageUrl}
                            alt={category.libelle}
                            className="img-fluid rounded-top"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={() => handleImageError(`category-${category.uuid}`)}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex align-items-center justify-content-center rounded-top"
                            style={{ height: "100%" }}
                          >
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-muted"
                              size="3x"
                            />
                          </div>
                        )}
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-dark bg-opacity-75">
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            Cliquer pour agrandir
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Image</span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setShowImageFullscreen(true)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations rapides */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title fw-semibold mb-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        Informations
                      </h6>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item px-0 border-0 d-flex justify-content-between">
                          <span className="text-muted">ID:</span>
                          <div className="d-flex align-items-center gap-2">
                            <code className="text-dark">{category.id}</code>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                copyToClipboard(String(category.id))
                              }
                              title="Copier l'ID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                        </div>
                        <div className="list-group-item px-0 border-0 d-flex justify-content-between">
                          <span className="text-muted">UUID:</span>
                          <div className="d-flex align-items-center gap-2">
                            <code
                              className="text-dark"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {category.uuid.substring(0, 8)}...
                            </code>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(category.uuid)}
                              title="Copier l'UUID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                        </div>
                        <div className="list-group-item px-0 border-0 d-flex justify-content-between">
                          <span className="text-muted">Slug:</span>
                          <code className="text-dark">{category.slug}</code>
                        </div>
                        <div className="list-group-item px-0 border-0 d-flex justify-content-between">
                          <span className="text-muted">Niveau:</span>
                          <span className="badge bg-info bg-opacity-10 text-info">
                            Niveau {category.depth || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Détails */}
                <div className="col-md-8">
                  {/* En-tête catégorie parente */}
                  {category.parent && (
                    <div className="card border-0 bg-light mb-4">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <FontAwesomeIcon
                              icon={faArrowUp}
                              className="text-primary"
                            />
                            <div>
                              <small className="text-muted d-block">
                                Catégorie parente
                              </small>
                              <h6 className="mb-0 fw-semibold">
                                {category.parent.libelle}
                              </h6>
                            </div>
                          </div>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${getTypeColor(category.parent.type)}15`,
                              color: getTypeColor(category.parent.type),
                            }}
                          >
                            {category.parent.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title fw-semibold mb-3">
                        <FontAwesomeIcon icon={faTag} className="me-2" />
                        Description
                      </h6>
                      {category.description ? (
                        <p className="mb-0">{category.description}</p>
                      ) : (
                        <p className="text-muted mb-0 fst-italic">
                          Aucune description fournie
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="card-title fw-semibold mb-3">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="me-2"
                            />
                            Dates
                          </h6>
                          <div className="list-group list-group-flush">
                            <div className="list-group-item px-0 border-0">
                              <small className="text-muted d-block">
                                Créé le
                              </small>
                              <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-primary"
                                />
                                <span>{formatDate(category.createdAt)}</span>
                              </div>
                            </div>
                            <div className="list-group-item px-0 border-0">
                              <small className="text-muted d-block">
                                Dernière modification
                              </small>
                              <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-warning"
                                />
                                <span>{formatDate(category.updatedAt)}</span>
                              </div>
                            </div>
                            {category.deleted_at && (
                              <div className="list-group-item px-0 border-0">
                                <small className="text-muted d-block">
                                  Supprimé le
                                </small>
                                <div className="d-flex align-items-center gap-2">
                                  <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="text-danger"
                                  />
                                  <span>{formatDate(category.deleted_at)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h6 className="card-title fw-semibold mb-3">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-2"
                            />
                            État
                          </h6>
                          <div className="list-group list-group-flush">
                            <div className="list-group-item px-0 border-0">
                              <small className="text-muted d-block">
                                Statut
                              </small>
                              <span
                                className={`badge ${category.statut === "inactif" ? "bg-warning" : "bg-success"} ${category.statut === "inactif" ? "text-warning" : "text-success"}`}
                              >
                                {category.statut === "inactif"
                                  ? "Inactif"
                                  : "Actif"}
                              </span>
                            </div>
                            <div className="list-group-item px-0 border-0">
                              <small className="text-muted d-block">
                                Suppression
                              </small>
                              <span
                                className={`badge ${category.is_deleted ? "bg-danger" : "bg-success"}`}
                              >
                                {category.is_deleted
                                  ? "Supprimé"
                                  : "Non supprimé"}
                              </span>
                            </div>
                            <div className="list-group-item px-0 border-0">
                              <small className="text-muted d-block">
                                Chemin hiérarchique
                              </small>
                              <code className="text-dark small">
                                {category.path || "Racine"}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "subcategories" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Sous-catégories</h5>
                    <p className="text-muted mb-0">
                      Liste des sous-catégories attachées à cette catégorie
                    </p>
                  </div>
                  {onViewSubCategories && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={onViewSubCategories}
                    >
                      <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                      Voir toutes les sous-catégories
                    </button>
                  )}
                </div>

                {loadingSubCategories ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted mt-3">
                      Chargement des sous-catégories...
                    </p>
                  </div>
                ) : subCategories.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="alert alert-info mx-auto"
                      style={{ maxWidth: "500px" }}
                    >
                      <FontAwesomeIcon
                        icon={faLayerGroup}
                        className="fs-1 mb-3 text-info"
                      />
                      <h5 className="alert-heading">Aucune sous-catégorie</h5>
                      <p className="mb-0">
                        Cette catégorie ne contient pas encore de
                        sous-catégories.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {subCategories.map((subCat) => {
                      const subCatImageUrl = getImageUrl(subCat, `subcat-${subCat.uuid}`);
                      return (
                        <div key={subCat.uuid} className="col-md-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                              <div className="d-flex align-items-start gap-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    backgroundColor: `${getTypeColor(subCat.type)}15`,
                                    color: getTypeColor(subCat.type),
                                  }}
                                >
                                  {subCatImageUrl ? (
                                    <img
                                      src={subCatImageUrl}
                                      alt={subCat.libelle}
                                      className="rounded-circle"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                      onError={() => handleImageError(`subcat-${subCat.uuid}`)}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={getTypeIcon(subCat.type)}
                                    />
                                  )}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="fw-semibold mb-1">
                                      {subCat.libelle}
                                    </h6>
                                    <span
                                      className={`badge ${subCat.statut === "inactif" ? "bg-warning" : "bg-success"} bg-opacity-10 ${subCat.statut === "inactif" ? "text-warning" : "text-success"}`}
                                    >
                                      {subCat.statut === "inactif"
                                        ? "Inactif"
                                        : "Actif"}
                                    </span>
                                  </div>
                                  <p className="text-muted small mb-2">
                                    {subCat.type}
                                  </p>
                                  {subCat.description && (
                                    <p className="small mb-2">
                                      {subCat.description}
                                    </p>
                                  )}
                                  {subCat.counts && (
                                    <div className="d-flex gap-2 mt-2">
                                      <span className="badge bg-primary bg-opacity-10 text-primary">
                                        {subCat.counts.total || 0} éléments
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <h5 className="fw-bold mb-4">Statistiques</h5>
                {category.counts ? (
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="card border-0 bg-primary bg-opacity-10">
                        <div className="card-body text-center">
                          <h2 className="fw-bold text-primary">
                            {category.counts.total || 0}
                          </h2>
                          <p className="text-muted mb-0">Total éléments</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body text-center">
                          <h2 className="fw-bold text-success">
                            {category.counts.produits || 0}
                          </h2>
                          <p className="text-muted mb-0">Produits</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 bg-info bg-opacity-10">
                        <div className="card-body text-center">
                          <h2 className="fw-bold text-info">
                            {category.counts.dons || 0}
                          </h2>
                          <p className="text-muted mb-0">Dons</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 bg-warning bg-opacity-10">
                        <div className="card-body text-center">
                          <h2 className="fw-bold text-warning">
                            {category.counts.echanges || 0}
                          </h2>
                          <p className="text-muted mb-0">Échanges</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="alert alert-info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Aucune statistique disponible pour cette catégorie
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Fermer
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onEdit}
              >
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal plein écran pour l'image */}
      {showImageFullscreen && categoryImageUrl && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-fullscreen">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowImageFullscreen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center justify-content-center">
                <img
                  src={categoryImageUrl}
                  alt={category.libelle}
                  className="img-fluid"
                  style={{ maxHeight: "80vh", maxWidth: "100%" }}
                  onError={() => handleImageError(`fullscreen-${category.uuid}`)}
                />
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <div className="text-white text-center">
                  <h5>{category.libelle}</h5>
                  <small>{category.type}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCategoryModal;