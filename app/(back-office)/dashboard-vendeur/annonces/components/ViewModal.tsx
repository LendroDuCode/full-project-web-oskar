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
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatDate,
  getStatusLabel,
  formatRelativeTime,
} from "@/app/shared/utils/formatters";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setProcessingAction(null);
      setImageErrors({});
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !annonce) return null;

  // Fonction pour obtenir l'URL de l'image correcte selon le type
  const getImageUrl = (item: any = annonce, index?: string) => {
    const imageKey = index ? `image-${index}` : "main";

    if (imageErrors[`${imageKey}-${item.uuid || 'unknown'}`]) {
      return `https://via.placeholder.com/800x800?text=${type?.charAt(0).toUpperCase() || 'A'}`;
    }

    if (item.image_key) {
      const url = buildImageUrl(item.image_key);
      if (url) return url;
    }

    if (item.image) {
      const url = buildImageUrl(item.image);
      if (url) return url;
    }

    if (type === "echange") {
      const possibleSources = [
        item.photo,
        item.images?.[0],
        item.photos?.[0],
        item.image_url,
        item.imageUrl,
        item.photo_url,
        item.photoUrl,
        item.imagePrincipale,
        item.image_principale,
        item.url_image,
        item.urlImage,
        item.media?.image,
        item.media?.url,
        item.attachments?.[0]?.url,
        item.fichiers?.[0]?.url,
      ];

      for (const source of possibleSources) {
        if (source) {
          const url = buildImageUrl(source);
          if (url) return url;
        }
      }
    }

    if (type === "produit") {
      const possibleSources = [
        item.photo,
        item.images?.[0],
        item.photos?.[0],
        item.image_url,
        item.imageUrl,
        item.imagePrincipale,
      ];

      for (const source of possibleSources) {
        if (source) {
          const url = buildImageUrl(source);
          if (url) return url;
        }
      }
    }

    if (type === "don") {
      const possibleSources = [
        item.photo,
        item.images?.[0],
        item.photos?.[0],
        item.image_url,
        item.imageUrl,
      ];

      for (const source of possibleSources) {
        if (source) {
          const url = buildImageUrl(source);
          if (url) return url;
        }
      }
    }

    return `https://via.placeholder.com/800x800?text=${type?.charAt(0).toUpperCase() || 'A'}`;
  };

  const getAllImages = (item: any = annonce) => {
    const images: string[] = [];

    const mainImage = getImageUrl(item);
    if (mainImage && !mainImage.includes("placeholder")) {
      images.push(mainImage);
    }

    if (type === "echange") {
      const sources = [
        ...(item.images || []),
        ...(item.photos || []),
        ...(item.attachments?.map((a: any) => a.url) || []),
        ...(item.fichiers?.map((f: any) => f.url) || []),
      ];

      sources.forEach((source) => {
        if (source && typeof source === 'string' && !images.includes(source)) {
          const url = buildImageUrl(source);
          if (url && !images.includes(url) && !images.includes(source)) {
            images.push(url);
          }
        }
      });
    }

    const otherSources = [
      ...(item.images || []),
      ...(item.photos || []),
    ];

    otherSources.forEach((source) => {
      if (source && typeof source === 'string' && !images.includes(source)) {
        const url = buildImageUrl(source);
        if (url && !images.includes(url) && !images.includes(source)) {
          images.push(url);
        }
      }
    });

    return images.length > 0 ? images : [getImageUrl(item)];
  };

  const getTypeConfig = () => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        label: "Produit",
        bgColor: `${colors.type.product}10`,
        gradient: "linear-gradient(135deg, #0061a8 0%, #0d6efd 100%)",
        accentColor: "#0d6efd",
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        label: "Don",
        bgColor: `${colors.type.don}10`,
        gradient: "linear-gradient(135deg, #0061a8 0%, #0d6efd 100%)",
        accentColor: "#0d6efd",
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        label: "Échange",
        bgColor: `${colors.type.exchange}10`,
        gradient: "linear-gradient(135deg, #0061a8 0%, #0d6efd 100%)",
        accentColor: "#0d6efd",
      },
      annonce: {
        icon: faBullhorn,
        color: colors.oskar.warning,
        label: "Annonce",
        bgColor: `${colors.oskar.warning}10`,
        gradient: "linear-gradient(135deg, #0061a8 0%, #0d6efd 100%)",
        accentColor: "#0d6efd",
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

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  };

  const renderInfoCard = (
    icon: any,
    title: string,
    children: React.ReactNode,
    color: string = "primary",
  ) => {
    const colorClasses: Record<string, { bg: string; text: string }> = {
      primary: { bg: `${colors.oskar.blue}15`, text: colors.oskar.blue },
      success: { bg: `${colors.oskar.green}15`, text: colors.oskar.green },
      warning: { bg: `${colors.oskar.orange}15`, text: colors.oskar.orange },
      info: { bg: `${colors.oskar.cyan}15`, text: colors.oskar.cyan },
      danger: { bg: `${colors.oskar.red}15`, text: colors.oskar.red },
    };

    const colorStyle = colorClasses[color] || colorClasses.primary;

    return (
      <div
        className="card border-0 shadow-sm h-100"
        style={{ borderRadius: "12px", transition: "all 0.3s ease" }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: colorStyle.bg,
              }}
            >
              <FontAwesomeIcon icon={icon} style={{ color: colorStyle.text }} />
            </div>
            <h6 className="fw-semibold mb-0" style={{ color: colors.oskar.black }}>
              {title}
            </h6>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const renderInfoItem = (
    label: string,
    value: React.ReactNode,
    icon?: any,
  ) => (
    <div className="d-flex align-items-start gap-2 mb-3">
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          size="sm"
          style={{
            color: colors.oskar.grey,
            marginTop: "2px",
            minWidth: "16px",
          }}
        />
      )}
      <div className="flex-grow-1">
        <div className="text-muted small mb-1">{label}</div>
        <div className="fw-medium" style={{ color: colors.oskar.black }}>
          {value || "Non spécifié"}
        </div>
      </div>
    </div>
  );

  const renderProduitDetails = () => {
    const typeConfig = getTypeConfig();
    const mainImage = getImageUrl();

    return (
      <div className="row g-4">
        {/* En-tête avec image et infos principales */}
        <div className="col-12">
          <div
            className="rounded-4 p-4 mb-4 position-relative"
            style={{
              background: `linear-gradient(135deg, ${typeConfig.bgColor} 0%, ${colors.oskar.lightGrey} 100%)`,
              border: `1px solid ${typeConfig.color}20`,
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-3 col-md-4">
                <div
                  className="rounded-4 overflow-hidden shadow-lg position-relative"
                  style={{ width: "140px", height: "140px" }}
                >
                  {mainImage && !imageErrors[`main-${annonce.uuid}`] ? (
                    <img
                      src={mainImage}
                      alt={annonce.title || annonce.nom || "Produit"}
                      className="w-100 h-100 object-cover"
                      onError={() => handleImageError(`main-${annonce.uuid}`)}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light">
                      <FontAwesomeIcon
                        icon={faImage}
                        size="2x"
                        className="text-muted mb-2"
                      />
                      <span className="text-muted small">Image non disponible</span>
                    </div>
                  )}
                  <div
                    className="position-absolute top-0 end-0 m-2"
                    style={{
                      backgroundColor: typeConfig.color + "90",
                      backdropFilter: "blur(4px)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                    }}
                  >
                    <span className="text-white small fw-medium">
                      <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-9 col-md-8 mt-3 mt-md-0">
                <div className="d-flex flex-column h-100">
                  <div className="mb-3">
                    <h2 className="h4 fw-bold mb-2" style={{ color: colors.oskar.black }}>
                      {annonce.nom || annonce.nom || "Sans nom"}
                    </h2>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: typeConfig.gradient,
                          color: "white",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                        {typeConfig.label}
                      </span>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: colors.oskar.lightGrey,
                          color: colors.oskar.grey,
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faHashtag} className="me-1" />
                        {annonce.sku || "N/A"}
                      </span>
                    </div>
                    <div className="display-5 fw-bold" style={{ color: typeConfig.accentColor }}>
                      {formatPrice(annonce.prix)}
                    </div>
                  </div>

                  {annonce.description && (
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faComment} className="text-muted" />
                        Description
                      </h6>
                      <p className="mb-0 text-muted">{annonce.description}</p>
                    </div>
                  )}

                  {annonce.boutique && (
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
                      <div className="bg-white rounded-circle p-3 shadow-sm">
                        <FontAwesomeIcon icon={faStore} className="text-primary" size="lg" />
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
            </div>,
            "primary",
          )}
        </div>

        {/* Section 2: Détails techniques */}
        <div className="col-md-4">
          {renderInfoCard(
            faTachometerAlt,
            "Détails Techniques",
            <>
              {renderInfoItem("SKU", annonce.sku || "N/A", faBarcode)}
              {renderInfoItem("TVA", `${annonce.tva || 0}%`, faPercent)}
              {renderInfoItem("Poids", annonce.poids || "N/A", faWeight)}
              {renderInfoItem("Dimensions", annonce.dimensions || "N/A", faRulerCombined)}
            </>,
            "info",
          )}
        </div>

        {/* Section 3: Catégorisation */}
        <div className="col-md-4">
          {renderInfoCard(
            faLayerGroup,
            "Catégorisation",
            <div className="text-center py-3">
              <div className="fw-bold fs-5 mb-2">{annonce.categorie || "Non catégorisé"}</div>
              <small className="text-muted">Catégorie principale</small>
              {annonce.sous_categorie && (
                <>
                  <div className="fw-medium mt-3">{annonce.sous_categorie}</div>
                  <small className="text-muted">Sous-catégorie</small>
                </>
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
            <>
              {renderInfoItem("Garantie", annonce.garantie || "Aucune garantie", faShieldAlt)}
              {renderInfoItem("Mode de livraison", annonce.livraison || "Standard", faShippingFast)}
            </>,
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
                <div className="display-6 fw-bold">{annonce.nombre_vues || 0}</div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  Vues
                </small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-danger">{annonce.nombre_favoris || 0}</div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faHeart} className="me-1" />
                  Favoris
                </small>
              </div>
              <div className="col-4">
                <div className="display-6 fw-bold text-warning">{annonce.note_moyenne || "0"}/5</div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faStar} className="me-1" />
                  Note
                </small>
              </div>
            </div>,
            "danger",
          )}
        </div>
      </div>
    );
  };

  const renderDonDetails = () => {
    const typeConfig = getTypeConfig();
    const mainImage = getImageUrl();

    return (
      <div className="row g-4">
        <div className="col-12">
          <div
            className="rounded-4 p-4 mb-4 position-relative"
            style={{
              background: `linear-gradient(135deg, ${typeConfig.bgColor} 0%, ${colors.oskar.lightGrey} 100%)`,
              border: `1px solid ${typeConfig.color}20`,
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-3 col-md-4">
                <div
                  className="rounded-4 overflow-hidden shadow-lg position-relative"
                  style={{ width: "140px", height: "140px" }}
                >
                  {mainImage && !imageErrors[`main-${annonce.uuid}`] ? (
                    <img
                      src={mainImage}
                      alt={annonce.title || "Don"}
                      className="w-100 h-100 object-cover"
                      onError={() => handleImageError(`main-${annonce.uuid}`)}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light">
                      <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                      <span className="text-muted small">Image non disponible</span>
                    </div>
                  )}
                  <div
                    className="position-absolute top-0 end-0 m-2"
                    style={{
                      backgroundColor: typeConfig.color + "90",
                      backdropFilter: "blur(4px)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                    }}
                  >
                    <span className="text-white small fw-medium">
                      <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-9 col-md-8 mt-3 mt-md-0">
                <div className="d-flex flex-column h-100">
                  <div className="mb-3">
                    <h2 className="h4 fw-bold mb-2" style={{ color: colors.oskar.black }}>
                      {annonce.libelle || annonce.title || "Don"}
                    </h2>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: typeConfig.gradient,
                          color: "white",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                        {typeConfig.label}
                      </span>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: colors.oskar.green + "15",
                          color: colors.oskar.green,
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faHandHoldingHeart} className="me-1" />
                        Don
                      </span>
                    </div>
                    {annonce.valeur_estimee && (
                      <div className="display-5 fw-bold text-success">
                        {formatPrice(annonce.valeur_estimee)}
                      </div>
                    )}
                  </div>

                  {annonce.description && (
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faComment} className="text-muted" />
                        Description
                      </h6>
                      <p className="mb-0 text-muted">{annonce.description}</p>
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
                    <div className="bg-white rounded-circle p-3 shadow-sm">
                      <FontAwesomeIcon icon={faUser} className="text-primary" size="lg" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {annonce.vendeur || annonce.utilisateur || "Anonyme"}
                      </h6>
                      <p className="text-muted small mb-0">
                        {annonce.seller?.type || (annonce.vendeur ? "Vendeur" : "Particulier")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {renderInfoCard(
            faInfoCircle,
            "Informations du don",
            <>
              {renderInfoItem("Type de don", annonce.typeDon || "Général", faGift)}
              {renderInfoItem("Date début", formatDate(annonce.dateDebut), faCalendarAlt)}
              {renderInfoItem("Date fin", formatDate(annonce.dateFin), faCalendarXmark)}
              {renderInfoItem("État", annonce.etat || annonce.condition)}
              {renderInfoItem("Motif du don", annonce.motifDon)}
            </>,
            "primary",
          )}
        </div>

        <div className="col-md-6">
          {renderInfoCard(
            faUsers,
            "Coordonnées et conditions",
            <>
              {renderInfoItem("Contact donateur", annonce.contactDonateur, faUser)}
              {renderInfoItem("Conditions de retrait", annonce.conditionsRetrait)}
              {renderInfoItem("Localisation", annonce.localisation, faMapMarkerAlt)}
              <div className="mt-3 pt-3 border-top">
                <div className="text-muted small mb-2">Disponibilité</div>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: annonce.disponible ? colors.oskar.green : colors.oskar.red,
                    }}
                  />
                  <span className="fw-medium">
                    {annonce.disponible ? "Actuellement disponible" : "Non disponible"}
                  </span>
                </div>
              </div>
            </>,
            "success",
          )}
        </div>
      </div>
    );
  };

  const renderEchangeDetails = () => {
    const typeConfig = getTypeConfig();
    const mainImage = getImageUrl();
    const allImages = getAllImages();

    return (
      <div className="row g-4">
        <div className="col-12">
          <div
            className="rounded-4 p-4 mb-4 position-relative"
            style={{
              background: `linear-gradient(135deg, ${typeConfig.bgColor} 0%, ${colors.oskar.lightGrey} 100%)`,
              border: `1px solid ${typeConfig.color}20`,
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-3 col-md-4">
                <div
                  className="rounded-4 overflow-hidden shadow-lg position-relative"
                  style={{ width: "140px", height: "140px" }}
                >
                  {mainImage && !imageErrors[`main-${annonce.uuid}`] ? (
                    <img
                      src={mainImage}
                      alt={annonce.title || annonce.nomElementEchange || "Échange"}
                      className="w-100 h-100 object-cover"
                      onError={() => handleImageError(`main-${annonce.uuid}`)}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light">
                      <FontAwesomeIcon icon={faImage} size="2x" className="text-muted mb-2" />
                      <span className="text-muted small">Image non disponible</span>
                    </div>
                  )}
                  <div
                    className="position-absolute top-0 end-0 m-2"
                    style={{
                      backgroundColor: typeConfig.color + "90",
                      backdropFilter: "blur(4px)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                    }}
                  >
                    <span className="text-white small fw-medium">
                      <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-9 col-md-8 mt-3 mt-md-0">
                <div className="d-flex flex-column h-100">
                  <div className="mb-3">
                    <h2 className="h4 fw-bold mb-2" style={{ color: colors.oskar.black }}>
                      {annonce.nomElementEchange || annonce.titre || annonce.title || "Échange"}
                    </h2>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: typeConfig.gradient,
                          color: "white",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={typeConfig.icon} className="me-1" />
                        {typeConfig.label}
                      </span>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: colors.oskar.cyan + "15",
                          color: colors.oskar.cyan,
                          fontSize: "0.85rem",
                        }}
                      >
                        <FontAwesomeIcon icon={faHandshake} className="me-1" />
                        Proposition d'échange
                      </span>
                    </div>
                    {annonce.valeur_estimee && (
                      <div className="display-5 fw-bold text-info">
                        {formatPrice(annonce.valeur_estimee)}
                      </div>
                    )}
                  </div>

                  {annonce.description && (
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faComment} className="text-muted" />
                        Description
                      </h6>
                      <p className="mb-0 text-muted">{annonce.description}</p>
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
                    <div className="bg-white rounded-circle p-3 shadow-sm">
                      <FontAwesomeIcon icon={faUser} className="text-primary" size="lg" />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {annonce.utilisateur || annonce.vendeur || annonce.agent || "Inconnu"}
                      </h6>
                      <p className="text-muted small mb-0">
                        {annonce.typeDestinataire || "Particulier"}
                      </p>
                    </div>
                  </div>

                  {allImages.length > 1 && (
                    <div className="d-flex gap-2 mt-3">
                      {allImages.slice(1, 5).map((img: string, index: number) => (
                        <div
                          key={index}
                          className="rounded overflow-hidden border shadow-sm"
                          style={{ width: "50px", height: "50px", cursor: "pointer" }}
                          onClick={() => window.open(img, "_blank")}
                        >
                          <img
                            src={img}
                            alt={`Miniature ${index + 1}`}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      ))}
                      {allImages.length > 5 && (
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center"
                          style={{ width: "50px", height: "50px" }}
                        >
                          <small className="text-muted">+{allImages.length - 5}</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div className="fw-semibold">{annonce.etat || annonce.condition || "Bon état"}</div>
                <small className="text-muted">État de l'objet</small>
              </div>
            </div>,
            "primary",
          )}
        </div>

        <div className="col-md-4">
          {renderInfoCard(
            faUsers,
            "Destinataire",
            <div className="text-center py-4">
              <FontAwesomeIcon icon={faBullseye} size="2x" className="text-success mb-3" />
              <h5 className="fw-bold mb-2">{annonce.type_destinataire || "Tout type"}</h5>
              <p className="text-muted mb-0">{annonce.objet_recherche || "À définir"}</p>
            </div>,
            "success",
          )}
        </div>

        <div className="col-md-4">
          {renderInfoCard(
            faExchangeAlt,
            "Modalités",
            <>
              {renderInfoItem("Mode d'échange", annonce.mode_echange || "Direct", faExchangeAlt)}
              {renderInfoItem("Lieu d'échange", annonce.lieu_echange || "À convenir", faMapMarkerAlt)}
              {renderInfoItem("Date proposition", formatDate(annonce.dateProposition), faCalendarAlt)}
            </>,
            "info",
          )}
        </div>

        {annonce.conditions_echange && (
          <div className="col-md-12">
            {renderInfoCard(
              faInfoCircle,
              "Conditions d'Échange",
              <div className="alert alert-info mb-0">{annonce.conditions_echange}</div>,
              "info",
            )}
          </div>
        )}
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
        return (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">
              <FontAwesomeIcon icon={faBullhorn} size="3x" />
            </div>
            <h3 className="mb-3">{annonce.title || "Annonce"}</h3>
            <p className="text-muted">{annonce.description || "Aucune description disponible"}</p>
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
      <div
        className={`modal-backdrop fade ${isOpen ? "show" : ""}`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1040 }}
        onClick={onClose}
      />

      <div
        className={`modal fade ${isOpen ? "show d-block" : ""}`}
        style={{ zIndex: 1050 }}
        tabIndex={-1}
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: "20px" }}>
            {/* En-tête avec fond gris clair (comme le premier modal) */}
            <div
              className="modal-header border-0 p-4"
              style={{
                background: colors.oskar.lightGrey,
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: typeConfig.color,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="lg"
                    style={{ color: "white" }}
                  />
                </div>
                <div>
                  <h5
                    className="modal-title fw-bold mb-1"
                    style={{ color: colors.oskar.black }}
                  >
                    Détails de l'annonce
                  </h5>
                  <p className="text-muted small mb-0">
                    Informations complètes et actions
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  borderRadius: "50%",
                  padding: "10px",
                  opacity: 0.7,
                }}
              />
            </div>

            {/* Corps du modal */}
            <div className="modal-body p-0">
              <div className="container-fluid p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {contentToShow}
              </div>
            </div>

            {/* Pied du modal */}
            <div className="modal-footer border-top p-4" style={{ backgroundColor: colors.oskar.lightGrey + "50" }}>
              <div className="d-flex justify-content-between w-100 align-items-center">
                <div>
                  <p className="text-muted small mb-0">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Consulté le {new Date().toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-outline-danger d-flex align-items-center gap-2 px-4 py-2 rounded-pill"
                      onClick={() => handleAction("delete")}
                      disabled={processingAction === "delete"}
                      style={{ fontWeight: "500" }}
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
                    className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                    onClick={onClose}
                    style={{ fontWeight: "500" }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}