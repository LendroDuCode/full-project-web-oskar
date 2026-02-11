"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faUser,
  faStore,
  faCalendarAlt,
  faCalendarXmark,
  faCalendarCheck,
  faUnlock,
  faImages,
  faTrash,
  faMapMarkerAlt,
  faBox,
  faDollarSign,
  faCheck,
  faTimes as faXmark,
  faLock,
  faGlobe,
  faImage,
  faComment,
  faStar,
  faShoppingCart,
  faExchangeAlt,
  faHandHoldingHeart,
  faInfoCircle,
  faTruck,
  faPercent,
  faLayerGroup,
  faHashtag,
  faRuler,
  faWeight,
  faPalette,
  faBarcode,
  faShieldAlt,
  faCertificate,
  faClock,
  faEye,
  faHeart,
  faTachometerAlt,
  faWarehouse,
  faBoxes,
  faBalanceScale,
  faRulerCombined,
  faCube,
  faShippingFast,
  faMoneyBillWave,
  faChartLine,
  faShoppingBag,
  faUsers,
  faHandshake,
  faBullseye,
  faBullhorn, // AJOUTÉ pour les annonces
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatDate,
  getStatusLabel,
} from "@/app/shared/utils/formatters";

interface ViewModalProps {
  // Propriétés principales de l'annonce
  annonce: {
    uuid: string;
    title: string;
    description?: string;
    image: string;
    type: "produit" | "don" | "echange" | "annonce";
    status: string;
    date: string;
    price?: number | string | null;
    quantity?: number;
    estPublie?: boolean;
    estBloque?: boolean;
    seller?: {
      name: string;
      avatar?: string;
      isPro?: boolean;
      type?: string;
    };
    category?: string;
    originalData?: any;
    favoriteId: string;
    addedAt: string;
    itemUuid: string;

    // Autres propriétés possibles
    [key: string]: any;
  };

  type: "produit" | "don" | "echange" | "annonce";

  // Propriétés pour la modal de visualisation
  isOpen: boolean;
  onClose: () => void;
  fullDetails?: any;
  loading?: boolean;
  onValidate?: (uuid: string, type: string) => void;
  onReject?: (uuid: string, type: string) => void;
  onPublish?: (uuid: string, type: string, publish: boolean) => void;
  onBlock?: (uuid: string, type: string, block: boolean) => void;
  onDelete?: (uuid: string, type: string) => void;
}

export default function ViewModal({
  isOpen,
  onClose,
  annonce,
  type,
  onValidate,
  onReject,
  onPublish,
  onBlock,
  onDelete,
}: ViewModalProps) {
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setProcessingAction(null);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !annonce) return null;

  const getTypeConfig = () => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        label: "Produit",
        bgColor: `${colors.type.product}15`,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        accentColor: "#667eea",
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        label: "Don",
        bgColor: `${colors.type.don}15`,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        accentColor: "#f5576c",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        label: "Échange",
        bgColor: `${colors.type.exchange}15`,
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        accentColor: "#4facfe",
      },
      annonce: {
        icon: faBullhorn,
        color: colors.oskar.warning,
        label: "Annonce",
        bgColor: `${colors.oskar.warning}15`,
        gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
        accentColor: "#f6d365",
      },
    };
    return configs[type];
  };

  const getStatusConfig = () => {
    const isBlocked = annonce.estBloque || annonce.est_bloque;
    const isPublished = annonce.estPublie;
    let status = annonce.status || annonce.statut || "";
    let color = colors.oskar.grey;
    let icon = null;
    let label = "Inconnu";

    if (isBlocked) {
      color = colors.status.blocked;
      icon = faLock;
      label = "Bloqué";
    } else if (isPublished) {
      if (status === "publie" || status === "disponible") {
        color = colors.status.published;
        icon = faGlobe;
        label = "Publié";
      } else if (status === "en-attente" || status === "en_attente") {
        color = colors.status.pending;
        label = "En attente";
      } else if (status === "valide") {
        color = colors.status.validated;
        icon = faCheck;
        label = "Validé";
      } else if (status === "refuse") {
        color = colors.oskar.red;
        icon = faXmark;
        label = "Refusé";
      } else {
        label = getStatusLabel(status) || status;
      }
    } else {
      color = colors.oskar.warning;
      label = "Non publié";
    }

    return { label, color, icon };
  };

  const handleAction = async (action: string) => {
    if (processingAction) return;

    try {
      setProcessingAction(action);

      switch (action) {
        case "validate":
          onValidate?.(annonce.uuid, type);
          break;
        case "reject":
          onReject?.(annonce.uuid, type);
          break;
        case "publish":
          onPublish?.(annonce.uuid, type, true);
          break;
        case "unpublish":
          onPublish?.(annonce.uuid, type, false);
          break;
        case "block":
          onBlock?.(annonce.uuid, type, true);
          break;
        case "unblock":
          onBlock?.(annonce.uuid, type, false);
          break;
        case "delete":
          if (confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
            onDelete?.(annonce.uuid, type);
          }
          break;
      }

      if (action !== "view") {
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error("Erreur lors de l'action:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const renderInfoCard = (
    icon: any,
    title: string,
    children: React.ReactNode,
    color: string = "primary",
  ) => {
    const colorClasses = {
      primary: "bg-primary bg-opacity-10 text-primary",
      success: "bg-success bg-opacity-10 text-success",
      warning: "bg-warning bg-opacity-10 text-warning",
      info: "bg-info bg-opacity-10 text-info",
      danger: "bg-danger bg-opacity-10 text-danger",
    };

    return (
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div
              className={`rounded-circle p-2 me-3 ${colorClasses[color as keyof typeof colorClasses]}`}
            >
              <FontAwesomeIcon icon={icon} />
            </div>
            <h6 className="card-title mb-0 fw-semibold">{title}</h6>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const renderProduitDetails = () => {
    const typeConfig = getTypeConfig();

    return (
      <div className="row g-4">
        {/* En-tête avec image et infos principales */}
        <div className="col-12">
          <div className="card border-0 shadow-lg overflow-hidden">
            <div className="row g-0">
              {/* Image principale */}
              <div className="col-md-5 position-relative">
                <div className="ratio ratio-1x1 h-100">
                  <img
                    src={annonce.image || annonce.photo || annonce.images?.[0]}
                    alt={annonce.title || annonce.nom || "Produit"}
                    className="img-fluid object-fit-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/800x800?text=${type.charAt(0).toUpperCase()}`;
                    }}
                  />
                </div>
                {annonce.images && annonce.images.length > 1 && (
                  <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-50">
                    <small className="text-white">
                      {annonce.images.length} image(s) disponible(s)
                    </small>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="col-md-7">
                <div className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h2 className="h3 fw-bold mb-2">
                        {annonce.nom || annonce.title || "Sans nom"}
                      </h2>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span
                          className="badge"
                          style={{
                            background: typeConfig.gradient,
                            color: "white",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={typeConfig.icon}
                            className="me-1"
                          />
                          {typeConfig.label}
                        </span>
                        <span className="text-muted">
                          <FontAwesomeIcon icon={faHashtag} className="me-1" />
                          {annonce.sku || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div
                        className="display-5 fw-bold"
                        style={{ color: typeConfig.accentColor }}
                      >
                        {formatPrice(annonce.prix)}
                      </div>
                      {annonce.prix_promotionnel && (
                        <div className="text-muted text-decoration-line-through">
                          {formatPrice(annonce.prix_promotionnel)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2">
                      <FontAwesomeIcon
                        icon={faComment}
                        className="me-2 text-muted"
                      />
                      Description
                    </h6>
                    <p className="mb-0 text-muted">
                      {annonce.description || "Aucune description disponible"}
                    </p>
                  </div>

                  {/* Boutique */}
                  {annonce.boutique && (
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4">
                      <div className="bg-white rounded-circle p-3">
                        <FontAwesomeIcon
                          icon={faStore}
                          className="text-primary"
                          size="lg"
                        />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{annonce.boutique.nom}</h6>
                        <p className="text-muted small mb-0">
                          {annonce.boutique.type || "Boutique"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Stock et quantité */}
        <div className="col-md-4">
          {renderInfoCard(
            faBoxes,
            "Stock et Quantité",
            <div className="text-center py-3">
              <div className="display-4 fw-bold text-primary mb-2">
                {annonce.quantite || 1}
              </div>
              <div className="text-muted">
                <FontAwesomeIcon icon={faCube} className="me-1" />
                {annonce.unite || "Pièce(s)"}
              </div>
              {annonce.quantite_minimale && (
                <div className="mt-2">
                  <small className="text-muted">
                    Quantité minimale: {annonce.quantite_minimale}
                  </small>
                </div>
              )}
            </div>,
            "primary",
          )}
        </div>

        {/* Section 2: Détails techniques */}
        <div className="col-md-4">
          {renderInfoCard(
            faTachometerAlt,
            "Détails Techniques",
            <div className="space-y-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">SKU</span>
                <span className="fw-medium">{annonce.sku || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">TVA</span>
                <span className="badge bg-info">{annonce.tva || 0}%</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Poids</span>
                <span className="fw-medium">{annonce.poids || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Dimensions</span>
                <span className="fw-medium">{annonce.dimensions || "N/A"}</span>
              </div>
            </div>,
            "info",
          )}
        </div>

        {/* Section 3: Catégorisation */}
        <div className="col-md-4">
          {renderInfoCard(
            faLayerGroup,
            "Catégorisation",
            <div className="text-center py-3">
              <div className="mb-3">
                <div className="fw-bold fs-5">
                  {annonce.categorie || "Non catégorisé"}
                </div>
                <small className="text-muted">Catégorie principale</small>
              </div>
              {annonce.sous_categorie && (
                <div>
                  <div className="fw-medium">{annonce.sous_categorie}</div>
                  <small className="text-muted">Sous-catégorie</small>
                </div>
              )}
            </div>,
            "success",
          )}
        </div>

        {/* Section 4: Garantie et livraison */}
        <div className="col-md-6">
          {renderInfoCard(
            faShieldAlt,
            "Garantie et Livraison",
            <div className="space-y-2">
              <div className="d-flex align-items-center gap-3">
                <FontAwesomeIcon icon={faShieldAlt} className="text-warning" />
                <div>
                  <div className="fw-medium">
                    {annonce.garantie || "Aucune garantie"}
                  </div>
                  <small className="text-muted">Garantie</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mt-3">
                <FontAwesomeIcon
                  icon={faShippingFast}
                  className="text-primary"
                />
                <div>
                  <div className="fw-medium">
                    {annonce.livraison || "Standard"}
                  </div>
                  <small className="text-muted">Mode de livraison</small>
                </div>
              </div>
            </div>,
            "warning",
          )}
        </div>

        {/* Section 5: Statistiques */}
        <div className="col-md-6">
          {renderInfoCard(
            faChartLine,
            "Statistiques",
            <div className="row text-center">
              <div className="col-4">
                <div className="display-6 fw-bold">
                  {annonce.nombre_vues || 0}
                </div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  Vues
                </small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-danger">
                  {annonce.nombre_favoris || 0}
                </div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faHeart} className="me-1" />
                  Favoris
                </small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-warning">
                  {annonce.note_moyenne || "0"}/5
                </div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faStar} className="me-1" />
                  Note
                </small>
              </div>
            </div>,
            "danger",
          )}
        </div>

        {/* Métadonnées */}
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-4 justify-content-center text-muted small">
                <span>
                  <FontAwesomeIcon icon={faCertificate} className="me-1" />
                  UUID: {annonce.uuid}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  Créé: {formatDate(annonce.createdAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faClock} className="me-1" />
                  Modifié: {formatDate(annonce.updatedAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faWarehouse} className="me-1" />
                  Stock: {annonce.quantite || 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDonDetails = () => {
    const typeConfig = getTypeConfig();

    return (
      <div className="row g-4">
        {/* En-tête avec image et infos principales */}
        <div className="col-12">
          <div className="card border-0 shadow-lg overflow-hidden">
            <div className="row g-0">
              {/* Image principale */}
              <div className="col-md-5 position-relative">
                <div className="ratio ratio-1x1 h-100">
                  <img
                    src={annonce.image || annonce.photo || annonce.images?.[0]}
                    alt={annonce.title || "Don"}
                    className="img-fluid object-fit-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/800x800?text=D`;
                    }}
                  />
                </div>
                {annonce.images && annonce.images.length > 1 && (
                  <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-50">
                    <small className="text-white">
                      {annonce.images.length} image(s) disponible(s)
                    </small>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="col-md-7">
                <div className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h2 className="h3 fw-bold mb-2">
                        {annonce.libelle || annonce.title || "Don"}
                      </h2>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span
                          className="badge"
                          style={{
                            background: typeConfig.gradient,
                            color: "white",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={typeConfig.icon}
                            className="me-1"
                          />
                          {typeConfig.label}
                        </span>
                        <span className="badge bg-success">
                          <FontAwesomeIcon
                            icon={faHandHoldingHeart}
                            className="me-1"
                          />
                          Don
                        </span>
                      </div>
                    </div>
                    {annonce.valeur_estimee && (
                      <div className="text-end">
                        <div className="display-5 fw-bold text-success">
                          {formatPrice(annonce.valeur_estimee)}
                        </div>
                        <small className="text-muted">Valeur estimée</small>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2">
                      <FontAwesomeIcon
                        icon={faComment}
                        className="me-2 text-muted"
                      />
                      Description
                    </h6>
                    <p className="mb-0 text-muted">
                      {annonce.description ||
                        annonce.message ||
                        "Aucune description disponible"}
                    </p>
                  </div>

                  {/* Donateur */}
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4">
                    <div className="bg-white rounded-circle p-3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-primary"
                        size="lg"
                      />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {annonce.vendeur || annonce.utilisateur || "Anonyme"}
                      </h6>
                      <p className="text-muted small mb-0">
                        {annonce.seller?.type ||
                          (annonce.vendeur ? "Vendeur" : "Particulier")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Détails du don */}
        <div className="col-md-4">
          {renderInfoCard(
            faBox,
            "Détails du Don",
            <div className="text-center py-3">
              <div className="display-4 fw-bold text-primary mb-2">
                {annonce.quantite || 1}
              </div>
              <div className="text-muted">
                <FontAwesomeIcon icon={faCube} className="me-1" />
                {annonce.unite || "Pièce(s)"}
              </div>
              <div className="mt-3">
                <div className="fw-semibold">
                  {annonce.condition || "Bon état"}
                </div>
                <small className="text-muted">Condition</small>
              </div>
            </div>,
            "primary",
          )}
        </div>

        {/* Section 2: Localisation */}
        <div className="col-md-4">
          {renderInfoCard(
            faMapMarkerAlt,
            "Localisation",
            <div className="text-center py-4">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                size="2x"
                className="text-danger mb-3"
              />
              <h5 className="fw-bold mb-2">
                {annonce.ville || annonce.localisation || "Non spécifiée"}
              </h5>
              <p className="text-muted mb-0">
                Zone: {annonce.zone_don || "Toute la ville"}
              </p>
            </div>,
            "danger",
          )}
        </div>

        {/* Section 3: Disponibilité */}
        <div className="col-md-4">
          {renderInfoCard(
            faCalendarAlt,
            "Disponibilité",
            <div className="space-y-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date début</span>
                <span className="fw-medium">
                  {formatDate(annonce.date_debut) || "Immédiate"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date fin</span>
                <span className="fw-medium">
                  {formatDate(annonce.date_fin) || "Illimitée"}
                </span>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <span className="text-muted">Mode de retrait</span>
                <span className="badge bg-info">
                  {annonce.mode_retrait || "À convenir"}
                </span>
              </div>
            </div>,
            "warning",
          )}
        </div>

        {/* Section 4: Conditions spécifiques */}
        {annonce.conditions_retrait && (
          <div className="col-md-6">
            {renderInfoCard(
              faInfoCircle,
              "Conditions de Retrait",
              <div className="alert alert-warning mb-0">
                {annonce.conditions_retrait}
              </div>,
              "warning",
            )}
          </div>
        )}

        {/* Section 5: Informations supplémentaires */}
        <div className="col-md-6">
          {renderInfoCard(
            faShieldAlt,
            "Informations Supplémentaires",
            <div className="space-y-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Type de don</span>
                <span className="fw-medium">
                  {annonce.type_don || "Standard"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">État général</span>
                <span className="badge bg-success">
                  {annonce.condition || "Bon état"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Garantie</span>
                <span className="fw-medium">
                  {annonce.garantie_don || "Sans garantie"}
                </span>
              </div>
            </div>,
            "info",
          )}
        </div>

        {/* Métadonnées */}
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-4 justify-content-center text-muted small">
                <span>
                  <FontAwesomeIcon icon={faCertificate} className="me-1" />
                  UUID: {annonce.uuid}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  Créé: {formatDate(annonce.createdAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faClock} className="me-1" />
                  Modifié: {formatDate(annonce.updatedAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faHeart} className="me-1" />
                  {annonce.nombre_favoris || 0} favori(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEchangeDetails = () => {
    const typeConfig = getTypeConfig();

    return (
      <div className="row g-4">
        {/* En-tête avec image et infos principales */}
        <div className="col-12">
          <div className="card border-0 shadow-lg overflow-hidden">
            <div className="row g-0">
              {/* Image principale */}
              <div className="col-md-5 position-relative">
                <div className="ratio ratio-1x1 h-100">
                  <img
                    src={annonce.image || annonce.photo || annonce.images?.[0]}
                    alt={annonce.title || "Échange"}
                    className="img-fluid object-fit-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/800x800?text=E`;
                    }}
                  />
                </div>
                {annonce.images && annonce.images.length > 1 && (
                  <div className="position-absolute bottom-0 start-0 end-0 p-3 bg-dark bg-opacity-50">
                    <small className="text-white">
                      {annonce.images.length} image(s) disponible(s)
                    </small>
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="col-md-7">
                <div className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h2 className="h3 fw-bold mb-2">
                        {annonce.nomElementEchange ||
                          annonce.title ||
                          "Échange"}
                      </h2>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span
                          className="badge"
                          style={{
                            background: typeConfig.gradient,
                            color: "white",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={typeConfig.icon}
                            className="me-1"
                          />
                          {typeConfig.label}
                        </span>
                        <span className="badge bg-info">
                          <FontAwesomeIcon
                            icon={faHandshake}
                            className="me-1"
                          />
                          Proposition d'échange
                        </span>
                      </div>
                    </div>
                    {annonce.valeur_estimee && (
                      <div className="text-end">
                        <div className="display-5 fw-bold text-info">
                          {formatPrice(annonce.valeur_estimee)}
                        </div>
                        <small className="text-muted">Valeur estimée</small>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2">
                      <FontAwesomeIcon
                        icon={faComment}
                        className="me-2 text-muted"
                      />
                      Description
                    </h6>
                    <p className="mb-0 text-muted">
                      {annonce.description ||
                        annonce.message ||
                        "Aucune description disponible"}
                    </p>
                  </div>

                  {/* Initiateur */}
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-4">
                    <div className="bg-white rounded-circle p-3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-primary"
                        size="lg"
                      />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {annonce.utilisateur ||
                          annonce.vendeur ||
                          annonce.agent ||
                          "Inconnu"}
                      </h6>
                      <p className="text-muted small mb-0">
                        {annonce.typeDestinataire || "Particulier"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Détails de la proposition */}
        <div className="col-md-4">
          {renderInfoCard(
            faBox,
            "Proposition",
            <div className="text-center py-3">
              <div className="display-4 fw-bold text-primary mb-2">
                {annonce.quantite || 1}
              </div>
              <div className="text-muted">
                <FontAwesomeIcon icon={faCube} className="me-1" />
                {annonce.unite || "Pièce(s)"}
              </div>
              <div className="mt-3">
                <div className="fw-semibold">{annonce.etat || "Bon état"}</div>
                <small className="text-muted">État de l'objet</small>
              </div>
            </div>,
            "primary",
          )}
        </div>

        {/* Section 2: Destinataire recherché */}
        <div className="col-md-4">
          {renderInfoCard(
            faUsers,
            "Destinataire",
            <div className="text-center py-4">
              <FontAwesomeIcon
                icon={faBullseye}
                size="2x"
                className="text-success mb-3"
              />
              <h5 className="fw-bold mb-2">
                {annonce.type_destinataire || "Tout type"}
              </h5>
              <p className="text-muted mb-0">
                {annonce.objet_recherche || "À définir"}
              </p>
            </div>,
            "success",
          )}
        </div>

        {/* Section 3: Modalités d'échange */}
        <div className="col-md-4">
          {renderInfoCard(
            faExchangeAlt,
            "Modalités",
            <div className="space-y-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Mode d'échange</span>
                <span className="badge bg-info">
                  {annonce.mode_echange || "Direct"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Lieu d'échange</span>
                <span className="fw-medium">
                  {annonce.lieu_echange || "À convenir"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Date proposition</span>
                <span className="fw-medium">
                  {formatDate(annonce.dateProposition || annonce.createdAt)}
                </span>
              </div>
            </div>,
            "info",
          )}
        </div>

        {/* Section 4: Conditions spécifiques */}
        {annonce.conditions_echange && (
          <div className="col-md-6">
            {renderInfoCard(
              faInfoCircle,
              "Conditions d'Échange",
              <div className="alert alert-info mb-0">
                {annonce.conditions_echange}
              </div>,
              "info",
            )}
          </div>
        )}

        {/* Section 5: Statistiques */}
        <div className="col-md-6">
          {renderInfoCard(
            faChartLine,
            "Statistiques",
            <div className="row text-center">
              <div className="col-4">
                <div className="display-6 fw-bold">
                  {annonce.nombre_vues || 0}
                </div>
                <small className="text-muted">Vues</small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-danger">
                  {annonce.nombre_favoris || 0}
                </div>
                <small className="text-muted">Intéressés</small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-warning">
                  {annonce.statut || "En attente"}
                </div>
                <small className="text-muted">Statut</small>
              </div>
            </div>,
            "warning",
          )}
        </div>

        {/* Métadonnées */}
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-4 justify-content-center text-muted small">
                <span>
                  <FontAwesomeIcon icon={faCertificate} className="me-1" />
                  UUID: {annonce.uuid}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  Créé: {formatDate(annonce.createdAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faClock} className="me-1" />
                  Modifié: {formatDate(annonce.updatedAt)}
                </span>
                <span>
                  <FontAwesomeIcon icon={faHandshake} className="me-1" />
                  Type: {annonce.typeDestinataire || "Utilisateur"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImages = () => {
    const images = annonce.images || annonce.photos || [];
    const mainImage = annonce.image || annonce.photo || annonce.images?.[0];
    const allImages = mainImage
      ? [mainImage, ...images.filter((img: string) => img !== mainImage)]
      : images;

    if (allImages.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">
            <FontAwesomeIcon icon={faImage} size="3x" />
          </div>
          <p className="text-muted">Aucune image disponible</p>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {/* Image principale en grand */}
        {mainImage && (
          <div className="col-12">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="ratio ratio-21x9">
                <img
                  src={mainImage}
                  alt="Image principale"
                  className="img-fluid object-fit-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/1200x500?text=Image+Principale`;
                  }}
                />
              </div>
              <div className="card-footer bg-white text-center py-3">
                <h6 className="fw-bold mb-0">Image principale</h6>
              </div>
            </div>
          </div>
        )}

        {/* Galerie d'images */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center mb-4">
                <FontAwesomeIcon
                  icon={faImages}
                  className="me-3 text-primary"
                />
                Galerie d'images ({allImages.length})
              </h5>
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
                {allImages.map((img: string, index: number) => (
                  <div key={index} className="col">
                    <div
                      className="card border-0 shadow-sm hover-shadow transition-all cursor-pointer h-100"
                      onClick={() => window.open(img, "_blank")}
                    >
                      <div className="ratio ratio-1x1">
                        <img
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="img-fluid object-fit-cover rounded-top"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/300x300?text=Img+${index + 1}`;
                          }}
                        />
                      </div>
                      <div className="card-footer bg-white text-center py-2">
                        <small className="text-muted">
                          Image {index + 1}
                          {index === 0 && " (principale)"}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetails = () => {
    switch (type) {
      case "produit":
        return renderProduitDetails();
      case "don":
        return renderDonDetails();
      case "echange":
        return renderEchangeDetails();
      case "annonce":
        // Vous pouvez créer une fonction renderAnnonceDetails() si nécessaire
        // Pour l'instant, afficher les informations de base
        return (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">
              <FontAwesomeIcon icon={faBullhorn} size="3x" />
            </div>
            <h3 className="mb-3">{annonce.title || "Annonce"}</h3>
            <p className="text-muted">
              {annonce.description || "Aucune description disponible"}
            </p>
            <div className="mt-4">
              <small className="text-muted">
                UUID: {annonce.uuid || "N/A"}
              </small>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">
              <FontAwesomeIcon icon={faTimes} size="3x" />
            </div>
            <p className="text-muted">Aucun détail disponible pour ce type</p>
          </div>
        );
    }
  };

  const typeConfig = getTypeConfig();
  const statusConfig = getStatusConfig();

  const contentToShow = renderDetails();

  return (
    <>
      {/* Overlay */}
      <div
        className={`modal-backdrop fade ${isOpen ? "show" : ""}`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1040 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        style={{ zIndex: 1050 }}
        tabIndex={-1}
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg overflow-hidden">
            {/* En-tête avec gradient */}
            <div
              className="modal-header text-white border-0 position-relative"
              style={{
                background: typeConfig.gradient,
                padding: "1.5rem 2rem",
              }}
            >
              <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                <div
                  className="w-100 h-100"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E')",
                  }}
                />
              </div>

              <div className="position-relative z-1 d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3">
                    <FontAwesomeIcon icon={typeConfig.icon} size="lg" />
                  </div>
                  <div>
                    <h4
                      className="modal-title fw-bold mb-1 text-truncate"
                      style={{ maxWidth: "600px" }}
                    >
                      {annonce.title ||
                        annonce.nom ||
                        annonce.libelle ||
                        "Sans titre"}
                    </h4>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-white bg-opacity-25 border-0">
                        {typeConfig.label}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${statusConfig.color}40`,
                          color: "white",
                        }}
                      >
                        {statusConfig.icon && (
                          <FontAwesomeIcon
                            icon={statusConfig.icon}
                            className="me-1"
                            size="xs"
                          />
                        )}
                        {statusConfig.label}
                      </span>
                      <span className="text-white-75 small">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="me-1"
                        />
                        {formatDate(annonce.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white position-relative z-1"
                  onClick={onClose}
                  aria-label="Fermer"
                  style={{ opacity: 0.9 }}
                />
              </div>
            </div>

            {/* Corps du modal - Tous les détails affichés */}
            <div className="modal-body p-0">
              <div
                className="container-fluid p-4"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {contentToShow}
              </div>
            </div>

            {/* Pied du modal avec actions */}
            <div className="modal-footer border-top bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                {/* Actions selon le statut */}
                {onValidate &&
                  (annonce.status === "en-attente" ||
                    annonce.status === "en_attente") && (
                    <>
                      <button
                        type="button"
                        className="btn btn-success d-flex align-items-center gap-2"
                        onClick={() => handleAction("validate")}
                        disabled={processingAction === "validate"}
                      >
                        {processingAction === "validate" ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                        Valider
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger d-flex align-items-center gap-2"
                        onClick={() => handleAction("reject")}
                        disabled={processingAction === "reject"}
                      >
                        {processingAction === "reject" ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <FontAwesomeIcon icon={faXmark} />
                        )}
                        Refuser
                      </button>
                    </>
                  )}

                {onPublish && (
                  <button
                    type="button"
                    className={`btn ${annonce.estPublie ? "btn-warning" : "btn-primary"} d-flex align-items-center gap-2`}
                    onClick={() =>
                      handleAction(annonce.estPublie ? "unpublish" : "publish")
                    }
                    disabled={processingAction?.includes("publish")}
                  >
                    {processingAction?.includes("publish") ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FontAwesomeIcon
                        icon={
                          annonce.estPublie ? faCalendarXmark : faCalendarCheck
                        }
                      />
                    )}
                    {annonce.estPublie ? "Dépublier" : "Publier"}
                  </button>
                )}

                {onBlock && (
                  <button
                    type="button"
                    className={`btn ${annonce.estBloque ? "btn-success" : "btn-secondary"} d-flex align-items-center gap-2`}
                    onClick={() =>
                      handleAction(annonce.estBloque ? "unblock" : "block")
                    }
                    disabled={processingAction?.includes("block")}
                  >
                    {processingAction?.includes("block") ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FontAwesomeIcon
                        icon={annonce.estBloque ? faUnlock : faLock}
                      />
                    )}
                    {annonce.estBloque ? "Débloquer" : "Bloquer"}
                  </button>
                )}
              </div>

              <div className="d-flex gap-2">
                {onDelete && (
                  <button
                    type="button"
                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                    onClick={() => handleAction("delete")}
                    disabled={processingAction === "delete"}
                  >
                    {processingAction === "delete" ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                    Supprimer
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
