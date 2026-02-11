"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSpinner,
  faTag,
  faGift,
  faArrowRightArrowLeft,
  faStore,
  faUser,
  faCalendar,
  faMoneyBill,
  faBox,
  faLayerGroup,
  faCheckCircle,
  faTimesCircle,
  faGlobe,
  faLock,
  faUnlock,
  faExclamationTriangle,
  faImage,
  faInfoCircle,
  faBarcode,
  faWarehouse,
  faMapMarkerAlt,
  faExchangeAlt,
  faUsers,
  faClipboardCheck,
  faFileExport,
  faDownload,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import {
  formatPrice,
  formatDate,
  getStatusLabel,
  getTypeLabel,
  formatRelativeTime,
} from "@/app/shared/utils/formatters";

interface AnnonceData {
  uuid: string;
  title: string;
  description?: string;
  image: string;
  type: "produit" | "don" | "echange";
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
}

interface ViewModalProps {
  show: boolean;
  onClose: () => void;
  annonce: AnnonceData | null;
  fullDetails: any | null;
  loading: boolean;
}

export default function ViewModal({
  show,
  onClose,
  annonce,
  fullDetails,
  loading,
}: ViewModalProps) {
  if (!show || !annonce) return null;

  const getTypeConfig = (type: string) => {
    const configs = {
      produit: {
        icon: faTag,
        color: colors.type.product,
        label: "Produit",
        bgColor: `${colors.type.product}10`,
      },
      don: {
        icon: faGift,
        color: colors.type.don,
        label: "Don",
        bgColor: `${colors.type.don}10`,
      },
      echange: {
        icon: faArrowRightArrowLeft,
        color: colors.type.exchange,
        label: "Échange",
        bgColor: `${colors.type.exchange}10`,
      },
    };
    return configs[type as keyof typeof configs] || configs.produit;
  };

  const getStatusConfig = (item: AnnonceData) => {
    let status = item.status;
    let color = colors.oskar.grey;
    let icon = faExclamationTriangle;
    let bgColor = `${colors.oskar.grey}15`;

    if (item.estBloque) {
      status = "bloque";
      color = colors.status.blocked;
      icon = faLock;
      bgColor = `${colors.status.blocked}15`;
    } else if (item.estPublie) {
      status = "publie";
      color = colors.status.published;
      icon = faGlobe;
      bgColor = `${colors.status.published}15`;
    } else if (status === "en-attente" || status === "en_attente") {
      color = colors.status.pending;
      bgColor = `${colors.status.pending}15`;
    } else if (status === "valide") {
      color = colors.status.validated;
      icon = faCheckCircle;
      bgColor = `${colors.status.validated}15`;
    } else if (status === "refuse") {
      color = colors.oskar.red;
      icon = faTimesCircle;
      bgColor = `${colors.oskar.red}15`;
    } else if (status === "disponible") {
      color = colors.status.available;
      icon = faCheckCircle;
      bgColor = `${colors.status.available}15`;
    }

    return {
      label: getStatusLabel(status),
      color,
      icon,
      bgColor,
    };
  };

  const renderInfoCard = (
    icon: any,
    title: string,
    children: React.ReactNode,
  ) => (
    <div
      className="card border-0 shadow-sm h-100"
      style={{ borderRadius: "12px" }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: colors.oskar.lightGrey,
            }}
          >
            <FontAwesomeIcon
              icon={icon}
              style={{ color: colors.oskar.blueHover }}
            />
          </div>
          <h6
            className="fw-semibold mb-0"
            style={{ color: colors.oskar.black }}
          >
            {title}
          </h6>
        </div>
        <div className="ps-1">{children}</div>
      </div>
    </div>
  );

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
    if (!fullDetails) return null;

    return (
      <div className="row g-4">
        <div className="col-md-6">
          {renderInfoCard(
            faInfoCircle,
            "Informations produit",
            <>
              {renderInfoItem(
                "Référence",
                fullDetails.reference || fullDetails.uuid,
                faBarcode,
              )}
              {renderInfoItem("Marque", fullDetails.marque)}
              {renderInfoItem("Modèle", fullDetails.modele)}
              {renderInfoItem("Condition", fullDetails.condition)}
              {fullDetails.caracteristiques && (
                <div className="mt-3 pt-3 border-top">
                  <div className="text-muted small mb-2">Caractéristiques</div>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(fullDetails.caracteristiques).map(
                      ([key, value]) => (
                        <span
                          key={key}
                          className="badge rounded-pill px-3 py-1"
                          style={{
                            backgroundColor: colors.oskar.lightGrey,
                            color: colors.oskar.grey,
                            fontSize: "0.75rem",
                          }}
                        >
                          {key}: {String(value)}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </>,
          )}
        </div>

        <div className="col-md-6">
          {renderInfoCard(
            faWarehouse,
            "Stock et livraison",
            <>
              {renderInfoItem(
                "Quantité disponible",
                fullDetails.quantite || 1,
                faBox,
              )}
              {renderInfoItem(
                "Poids",
                fullDetails.poids ? `${fullDetails.poids} kg` : null,
              )}
              {renderInfoItem("Dimensions", fullDetails.dimensions)}
              {renderInfoItem(
                "Localisation",
                fullDetails.localisation,
                faMapMarkerAlt,
              )}
            </>,
          )}
        </div>
      </div>
    );
  };

  const renderDonDetails = () => {
    if (!fullDetails) return null;

    return (
      <div className="row g-4">
        <div className="col-md-6">
          {renderInfoCard(
            faInfoCircle,
            "Informations du don",
            <>
              {renderInfoItem(
                "Type de don",
                fullDetails.typeDon || "Général",
                faGift,
              )}
              {renderInfoItem(
                "Date début",
                formatDate(fullDetails.dateDebut),
                faCalendar,
              )}
              {renderInfoItem(
                "Date fin",
                formatDate(fullDetails.dateFin),
                faCalendar,
              )}
              {renderInfoItem("État", fullDetails.etat)}
              {renderInfoItem("Motif du don", fullDetails.motifDon)}
            </>,
          )}
        </div>

        <div className="col-md-6">
          {renderInfoCard(
            faUsers,
            "Coordonnées et conditions",
            <>
              {renderInfoItem(
                "Contact donateur",
                fullDetails.contactDonateur,
                faUser,
              )}
              {renderInfoItem(
                "Conditions de retrait",
                fullDetails.conditionsRetrait,
              )}
              {renderInfoItem(
                "Localisation",
                fullDetails.localisation,
                faMapMarkerAlt,
              )}
              <div className="mt-3 pt-3 border-top">
                <div className="text-muted small mb-2">Disponibilité</div>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: fullDetails.disponible
                        ? colors.oskar.green
                        : colors.oskar.red,
                    }}
                  />
                  <span className="fw-medium">
                    {fullDetails.disponible
                      ? "Actuellement disponible"
                      : "Non disponible"}
                  </span>
                </div>
              </div>
            </>,
          )}
        </div>
      </div>
    );
  };

  const renderEchangeDetails = () => {
    if (!fullDetails) return null;

    return (
      <div className="row g-4">
        <div className="col-md-6">
          {renderInfoCard(
            faExchangeAlt,
            "Détails de l'échange",
            <>
              {renderInfoItem(
                "Type d'échange",
                fullDetails.typeEchange || "Général",
                faExchangeAlt,
              )}
              {renderInfoItem("Élément proposé", fullDetails.elementPropose)}
              {renderInfoItem("Élément demandé", fullDetails.elementDemande)}
              {renderInfoItem(
                "Valeur estimée",
                formatPrice(fullDetails.valeurEstimee),
                faMoneyBill,
              )}
              {renderInfoItem("Message", fullDetails.message)}
            </>,
          )}
        </div>

        <div className="col-md-6">
          {renderInfoCard(
            faClipboardCheck,
            "Dates et conditions",
            <>
              {renderInfoItem(
                "Date de proposition",
                formatDate(fullDetails.dateProposition),
                faCalendar,
              )}
              {renderInfoItem(
                "Date de réponse",
                formatDate(fullDetails.dateReponse),
                faCalendar,
              )}
              {renderInfoItem("Conditions", fullDetails.conditionsEchange)}
              {renderInfoItem(
                "Statut de la proposition",
                fullDetails.statutPropose,
              )}
              <div className="mt-3 pt-3 border-top">
                <div className="text-muted small mb-2">Progression</div>
                <div
                  className="progress"
                  style={{
                    height: "6px",
                    backgroundColor: colors.oskar.lightGrey,
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: fullDetails.progression
                        ? `${fullDetails.progression}%`
                        : "50%",
                      backgroundColor: colors.oskar.blueHover,
                    }}
                  />
                </div>
              </div>
            </>,
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center py-5">
          <div
            className="spinner-border mb-3"
            style={{
              width: "3rem",
              height: "3rem",
              color: colors.oskar.blueHover,
            }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h5 style={{ color: colors.oskar.black }}>
            Chargement des détails...
          </h5>
          <p className="text-muted">Veuillez patienter</p>
        </div>
      );
    }

    const typeConfig = getTypeConfig(annonce.type);
    const statusConfig = getStatusConfig(annonce);

    return (
      <>
        {/* Header avec image et infos principales */}
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
                <img
                  src={annonce.image}
                  alt={annonce.title}
                  className="w-100 h-100 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/140?text=${annonce.title.charAt(0)}`;
                    e.currentTarget.style.backgroundColor = typeConfig.bgColor;
                  }}
                />
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
                  <h2
                    className="h4 fw-bold mb-2"
                    style={{ color: colors.oskar.black }}
                  >
                    {annonce.title}
                  </h2>
                  {annonce.description && (
                    <p className="text-muted mb-3">{annonce.description}</p>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div
                    className="badge rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                      fontSize: "0.85rem",
                    }}
                  >
                    <FontAwesomeIcon icon={statusConfig.icon} />
                    <span className="fw-semibold">{statusConfig.label}</span>
                  </div>

                  {annonce.price && (
                    <div
                      className="badge rounded-pill px-4 py-2"
                      style={{
                        backgroundColor: colors.oskar.green + "15",
                        color: colors.oskar.green,
                        fontSize: "0.85rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                      <span className="fw-bold">
                        {formatPrice(annonce.price)}
                      </span>
                    </div>
                  )}

                  {annonce.quantity && (
                    <div
                      className="badge rounded-pill px-4 py-2"
                      style={{
                        backgroundColor: colors.oskar.blue + "15",
                        color: colors.oskar.blue,
                        fontSize: "0.85rem",
                      }}
                    >
                      <FontAwesomeIcon icon={faBox} className="me-2" />
                      <span className="fw-semibold">
                        {annonce.quantity} unité(s)
                      </span>
                    </div>
                  )}

                  <div
                    className="badge rounded-pill px-4 py-2"
                    style={{
                      backgroundColor: colors.oskar.grey + "15",
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    <span>{formatRelativeTime(annonce.date)}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: colors.oskar.lightGrey,
                        border: `2px solid ${annonce.seller?.isPro ? colors.oskar.blueHover : colors.oskar.grey}`,
                      }}
                    >
                      {annonce.seller?.avatar ? (
                        <img
                          src={annonce.seller.avatar}
                          alt={annonce.seller.name}
                          className="w-100 h-100 object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={annonce.seller?.isPro ? faStore : faUser}
                          style={{ color: colors.oskar.grey }}
                        />
                      )}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6
                          className="fw-semibold mb-0"
                          style={{ color: colors.oskar.black }}
                        >
                          {annonce.seller?.name || "Inconnu"}
                        </h6>
                        {annonce.seller?.isPro && (
                          <span
                            className="badge rounded-pill px-3 py-1"
                            style={{
                              backgroundColor: colors.oskar.blueHover,
                              color: colors.oskar.lightGray,
                              fontSize: "0.7rem",
                            }}
                          >
                            <FontAwesomeIcon icon={faStore} className="me-1" />
                            Professionnel
                          </span>
                        )}
                      </div>
                      <p className="text-muted small mb-0">
                        {annonce.seller?.type || "Utilisateur standard"}
                        {annonce.category &&
                          ` • Catégorie: ${annonce.category}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-3 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: `${typeConfig.color}15`,
                    color: typeConfig.color,
                  }}
                >
                  <FontAwesomeIcon icon={typeConfig.icon} />
                </div>
                <div
                  className="fw-bold h5 mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  {typeConfig.label}
                </div>
                <div className="text-muted small">Type d'annonce</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-3 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: `${statusConfig.color}15`,
                    color: statusConfig.color,
                  }}
                >
                  <FontAwesomeIcon icon={statusConfig.icon} />
                </div>
                <div
                  className="fw-bold h5 mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  {statusConfig.label}
                </div>
                <div className="text-muted small">Statut</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-3 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: `${colors.oskar.blue}15`,
                    color: colors.oskar.blue,
                  }}
                >
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <div
                  className="fw-bold h5 mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  {formatDate(annonce.date).split(" ")[0]}
                </div>
                <div className="text-muted small">Date de création</div>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-3 text-center">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: `${annonce.estPublie ? colors.oskar.green : colors.oskar.yellow}15`,
                    color: annonce.estPublie
                      ? colors.oskar.green
                      : colors.oskar.yellow,
                  }}
                >
                  <FontAwesomeIcon
                    icon={annonce.estPublie ? faGlobe : faLock}
                  />
                </div>
                <div
                  className="fw-bold h5 mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  {annonce.estPublie ? "Publiée" : "Non publiée"}
                </div>
                <div className="text-muted small">Visibilité</div>
              </div>
            </div>
          </div>
        </div>

        {/* Détails spécifiques */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: typeConfig.bgColor,
                color: typeConfig.color,
              }}
            >
              <FontAwesomeIcon icon={faLayerGroup} size="lg" />
            </div>
            <div>
              <h4
                className="h5 fw-bold mb-1"
                style={{ color: colors.oskar.black }}
              >
                Détails{" "}
                {annonce.type === "produit"
                  ? "du produit"
                  : annonce.type === "don"
                    ? "du don"
                    : "de l'échange"}
              </h4>
              <p className="text-muted mb-0">
                Informations complètes et spécifiques
              </p>
            </div>
          </div>

          {!fullDetails ? (
            <div
              className="alert alert-warning border-0 shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: colors.oskar.yellow + "15",
                    color: colors.oskar.yellow,
                  }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                </div>
                <div>
                  <h6
                    className="fw-semibold mb-1"
                    style={{ color: colors.oskar.black }}
                  >
                    Détails non disponibles
                  </h6>
                  <p className="mb-0">
                    Les informations détaillées ne sont pas accessibles pour le
                    moment. Cette annonce ne contient que les informations de
                    base.
                  </p>
                </div>
              </div>
            </div>
          ) : annonce.type === "produit" ? (
            renderProduitDetails()
          ) : annonce.type === "don" ? (
            renderDonDetails()
          ) : (
            renderEchangeDetails()
          )}
        </div>

        {/* Actions */}
        <div className="border-top pt-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6
                className="fw-semibold mb-2"
                style={{ color: colors.oskar.black }}
              >
                Actions disponibles
              </h6>
              <p className="text-muted small mb-0">
                Identifiant unique:{" "}
                <code className="bg-light px-2 py-1 rounded">
                  {annonce.uuid}
                </code>
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(annonce.uuid);
                  alert("UUID copié dans le presse-papier");
                }}
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  color: colors.oskar.grey,
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                <FontAwesomeIcon icon={faClipboardCheck} />
                Copier UUID
              </button>
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={() => {
                  const data = JSON.stringify(
                    annonce.originalData || annonce,
                    null,
                    2,
                  );
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${annonce.type}_${annonce.uuid}.json`;
                  a.click();
                }}
                style={{
                  backgroundColor: colors.oskar.blueHover,
                  color: colors.oskar.lightGray,
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                <FontAwesomeIcon icon={faDownload} />
                Exporter JSON
              </button>
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: annonce.title,
                      text: annonce.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Lien copié dans le presse-papier");
                  }
                }}
                style={{
                  backgroundColor: typeConfig.color,
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                <FontAwesomeIcon icon={faShareAlt} />
                Partager
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`modal-backdrop fade ${show ? "show" : ""}`}
        style={{
          display: show ? "block" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`modal fade ${show ? "show d-block" : ""}`}
        style={{ display: show ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          role="document"
        >
          <div
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            {/* En-tête modal */}
            <div
              className="modal-header border-0 p-4"
              style={{
                background: `linear-gradient(135deg, ${colors.oskar.lightGrey} 0%, ${colors.oskar.lightGrey} 100%)`,
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: annonce
                      ? getTypeConfig(annonce.type).color
                      : colors.oskar.blueHover,
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

            {/* Corps modal */}
            <div
              className="modal-body p-4"
              style={{ maxHeight: "calc(90vh - 140px)", overflowY: "auto" }}
            >
              {renderContent()}
            </div>

            {/* Pied modal */}
            <div
              className="modal-footer border-top border-light p-4"
              style={{ backgroundColor: colors.oskar.lightGrey + "50" }}
            >
              <div className="d-flex justify-content-between w-100 align-items-center">
                <div>
                  <p className="text-muted small mb-0">
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    Consulté le {new Date().toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn px-4 py-2"
                    onClick={onClose}
                    style={{
                      backgroundColor: colors.oskar.lightGrey,
                      color: colors.oskar.grey,
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "500",
                    }}
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    className="btn px-4 py-2"
                    onClick={() => {
                      if (annonce) {
                        window.open(
                          `/dashboard/annonces/${annonce.type}/${annonce.uuid}/edit`,
                          "_blank",
                        );
                      }
                    }}
                    style={{
                      backgroundColor: colors.oskar.blueHover,
                      color: colors.oskar.lightGray,
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "500",
                    }}
                  >
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Éditer l'annonce
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
