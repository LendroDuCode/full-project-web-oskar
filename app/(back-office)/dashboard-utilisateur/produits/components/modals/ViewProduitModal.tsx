// components/produits/modals/ViewProduitModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faMoneyBillWave,
  faBoxOpen,
  faStar,
  faLayerGroup,
  faEdit,
  faUser,
  faTimes,
  faCalendar,
  faClock,
  faWeightHanging,
  faRulerVertical,
  faBarcode,
  faPalette,
  faHeart,
  faShoppingCart,
  faTag,
  faPercent,
  faInfoCircle,
  faShareAlt,
  faPrint,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import StatusBadge from "../shared/StatusBadge";
import { Produit } from "../shared/types";
import colors from "@/app/shared/constants/colors";

interface ViewProduitModalProps {
  isOpen: boolean;
  produit: Produit | null;
  onClose: () => void;
}

const ViewProduitModal = ({
  isOpen,
  produit,
  onClose,
}: ViewProduitModalProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [zoomImage, setZoomImage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
      setZoomImage(false);
    }
  }, [isOpen]);

  if (!isOpen || !produit) return null;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculatePromoPrice = () => {
    if (produit.promo && produit.promo > 0) {
      const originalPrice = parseFloat(produit.prix);
      const discount = (originalPrice * produit.promo) / 100;
      return formatPrice((originalPrice - discount).toFixed(2));
    }
    return null;
  };

  const promoPrice = calculatePromoPrice();

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-labelledby="viewProduitModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content border-0 shadow-lg overflow-hidden"
          style={{
            borderRadius: "20px",
            border: `2px solid ${colors.oskar.blue}30`,
          }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 position-relative"
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
                  Informations complètes sur le produit
                </p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-flex align-items-center"
                onClick={() => window.print()}
                title="Imprimer"
              >
                <FontAwesomeIcon icon={faPrint} />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-light d-flex align-items-center"
                title="Partager"
              >
                <FontAwesomeIcon icon={faShareAlt} />
              </button>
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
          </div>

          {/* Corps */}
          <div className="modal-body p-0">
            <div className="row g-0">
              {/* Colonne gauche - Image et statut */}
              <div className="col-md-5">
                <div
                  className="p-4 h-100"
                  style={{ background: colors.oskar.lightGrey + "20" }}
                >
                  {/* Image principale */}
                  <div
                    className={`position-relative ${zoomImage ? "fixed-top start-0 w-100 h-100 z-3 bg-dark bg-opacity-90 p-5" : ""}`}
                    onClick={() => setZoomImage(!zoomImage)}
                    style={{ cursor: zoomImage ? "zoom-out" : "zoom-in" }}
                  >
                    <div
                      className={`${zoomImage ? "h-100 d-flex align-items-center justify-content-center" : ""}`}
                    >
                      <img
                        src={produit.image}
                        alt={produit.libelle}
                        className={`img-fluid ${zoomImage ? "w-auto h-auto" : "w-100 rounded-3 shadow-lg"}`}
                        style={{
                          maxHeight: zoomImage ? "90vh" : "400px",
                          objectFit: "contain",
                          transition: "all 0.3s ease",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/600x400/007bff/ffffff?text=${produit.libelle?.charAt(0) || "P"}`;
                        }}
                      />
                    </div>
                    {zoomImage && (
                      <div className="position-fixed top-0 end-0 p-4">
                        <button
                          type="button"
                          className="btn btn-light rounded-circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomImage(false);
                          }}
                          style={{ width: "40px", height: "40px" }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Indicateurs */}
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <StatusBadge statut={produit.statut} />
                      </div>
                      <div className="d-flex gap-2">
                        {produit.promo && produit.promo > 0 && (
                          <span
                            className="badge bg-danger"
                            style={{ fontSize: "0.9rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faPercent}
                              className="me-1"
                            />
                            -{produit.promo}%
                          </span>
                        )}
                        <span
                          className={`badge ${produit.disponible ? "bg-success" : "bg-danger"}`}
                        >
                          {produit.disponible ? "En stock" : "Épuisé"}
                        </span>
                      </div>
                    </div>

                    {/* Évaluation */}
                    <div className="card border-0 shadow-sm mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="fw-bold mb-1">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="me-2 text-warning"
                              />
                              Évaluation
                            </h6>
                            <div className="d-flex align-items-center">
                              {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                  key={i}
                                  icon={faStar}
                                  className={`fs-5 ${i < produit.etoile ? "text-warning" : "text-muted"}`}
                                />
                              ))}
                              <span className="ms-2 fw-bold fs-5">
                                {produit.note_moyenne}
                              </span>
                              <span className="text-muted ms-2">
                                ({produit.nombre_avis} avis)
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-muted">Favoris</div>
                            <div className="fw-bold text-primary">
                              <FontAwesomeIcon
                                icon={faHeart}
                                className="me-1"
                              />
                              {produit.nombre_favoris}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informations rapides */}
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2 text-primary"
                          />
                          Caractéristiques
                        </h6>
                        <div className="row g-2">
                          {produit.type && (
                            <div className="col-6">
                              <small className="text-muted d-block">Type</small>
                              <span className="fw-semibold">
                                {produit.type}
                              </span>
                            </div>
                          )}
                          {produit.couleur && (
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Couleur
                              </small>
                              <span className="fw-semibold">
                                {produit.couleur}
                              </span>
                            </div>
                          )}
                          {produit.poids && (
                            <div className="col-6">
                              <small className="text-muted d-block">
                                <FontAwesomeIcon
                                  icon={faWeightHanging}
                                  className="me-1"
                                />
                                Poids
                              </small>
                              <span className="fw-semibold">
                                {produit.poids} kg
                              </span>
                            </div>
                          )}
                          {produit.dimensions && (
                            <div className="col-6">
                              <small className="text-muted d-block">
                                <FontAwesomeIcon
                                  icon={faRulerVertical}
                                  className="me-1"
                                />
                                Dimensions
                              </small>
                              <span className="fw-semibold">
                                {produit.dimensions}
                              </span>
                            </div>
                          )}
                          {produit.code_barre && (
                            <div className="col-12 mt-2">
                              <small className="text-muted d-block">
                                <FontAwesomeIcon
                                  icon={faBarcode}
                                  className="me-1"
                                />
                                Code-barre
                              </small>
                              <span className="fw-semibold">
                                {produit.code_barre}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Détails */}
              <div className="col-md-7">
                <div className="p-4 h-100">
                  {/* En-tête produit */}
                  <div className="mb-4">
                    <h2 className="fw-bold mb-2">{produit.libelle}</h2>
                    <div className="d-flex align-items-center mb-3">
                      {produit.categorie && (
                        <div className="d-flex align-items-center me-3">
                          <FontAwesomeIcon
                            icon={faTag}
                            className="me-2 text-muted"
                          />
                          <span className="fw-semibold">
                            {produit.categorie.libelle}
                          </span>
                        </div>
                      )}
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="me-2 text-muted"
                        />
                        <span className="fw-semibold">
                          {formatDate(produit.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center">
                        {promoPrice ? (
                          <>
                            <div className="me-3">
                              <div className="text-muted text-decoration-line-through">
                                {formatPrice(produit.prix)}
                              </div>
                              <div className="fw-bold fs-2 text-danger">
                                {promoPrice}
                              </div>
                            </div>
                            <span className="badge bg-danger fs-6">
                              Économisez {produit.promo}%
                            </span>
                          </>
                        ) : (
                          <div className="fw-bold fs-2 text-primary">
                            {formatPrice(produit.prix)}
                          </div>
                        )}
                      </div>
                      <div className="text-muted mt-1">
                        <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                        {produit.quantite} unités disponibles
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <nav>
                    <div
                      className="nav nav-tabs border-0 mb-4"
                      id="nav-tab"
                      role="tablist"
                    >
                      <button
                        className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                        id="nav-details-tab"
                        onClick={() => setActiveTab("details")}
                        style={{
                          borderRadius: "8px 8px 0 0",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          fontWeight: "600",
                          color:
                            activeTab === "details"
                              ? colors.oskar.blue
                              : "#6c757d",
                        }}
                      >
                        Détails
                      </button>
                      <button
                        className={`nav-link ${activeTab === "seller" ? "active" : ""}`}
                        id="nav-seller-tab"
                        onClick={() => setActiveTab("seller")}
                        style={{
                          borderRadius: "8px 8px 0 0",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          fontWeight: "600",
                          color:
                            activeTab === "seller"
                              ? colors.oskar.blue
                              : "#6c757d",
                        }}
                      >
                        Vendeur
                      </button>
                      <button
                        className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                        id="nav-history-tab"
                        onClick={() => setActiveTab("history")}
                        style={{
                          borderRadius: "8px 8px 0 0",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          fontWeight: "600",
                          color:
                            activeTab === "history"
                              ? colors.oskar.blue
                              : "#6c757d",
                        }}
                      >
                        Historique
                      </button>
                    </div>
                  </nav>

                  {/* Contenu des tabs */}
                  <div className="tab-content" id="nav-tabContent">
                    {/* Détails */}
                    <div
                      className={`tab-pane fade ${activeTab === "details" ? "show active" : ""}`}
                    >
                      {produit.description ? (
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3">
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="me-2 text-primary"
                            />
                            Description
                          </h6>
                          <div className="bg-light rounded p-4">
                            <p className="mb-0" style={{ lineHeight: "1.6" }}>
                              {produit.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-info border-0 mb-4">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          Aucune description disponible
                        </div>
                      )}

                      {/* Catégorie */}
                      {produit.categorie && (
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3">
                            <FontAwesomeIcon
                              icon={faLayerGroup}
                              className="me-2 text-primary"
                            />
                            Catégorie
                          </h6>
                          <div
                            className="d-flex align-items-center gap-3 p-3 rounded"
                            style={{
                              background: `linear-gradient(135deg, ${colors.oskar.blue}10 0%, ${colors.oskar.blue}5 100%)`,
                              border: `1px solid ${colors.oskar.blue}30`,
                            }}
                          >
                            {produit.categorie.image && (
                              <img
                                src={produit.categorie.image}
                                alt={produit.categorie.libelle}
                                className="rounded"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <div className="fw-bold">
                                {produit.categorie.libelle}
                              </div>
                              <small className="text-muted">
                                Type: {produit.categorie.type}
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vendeur */}
                    <div
                      className={`tab-pane fade ${activeTab === "seller" ? "show active" : ""}`}
                    >
                      {produit.source ? (
                        <div className="card border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="fw-bold mb-4">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="me-2 text-primary"
                              />
                              Informations du vendeur
                            </h6>
                            <div className="d-flex align-items-start gap-3">
                              {produit.source.infos.avatar && (
                                <img
                                  src={produit.source.infos.avatar}
                                  alt={produit.source.infos.nom}
                                  className="rounded-circle"
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <div className="flex-grow-1">
                                <h5 className="fw-bold mb-1">
                                  {produit.source.infos.nom}{" "}
                                  {produit.source.infos.prenoms}
                                </h5>
                                <div className="text-muted mb-3">
                                  {produit.source.type}
                                </div>
                                <div className="row">
                                  <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">
                                      Email
                                    </small>
                                    <span className="fw-semibold">
                                      {produit.source.email || "N/A"}
                                    </span>
                                  </div>
                                  <div className="col-md-6 mb-2">
                                    <small className="text-muted d-block">
                                      Téléphone
                                    </small>
                                    <span className="fw-semibold">
                                      {produit.source.telephone || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-info border-0">
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="me-2"
                          />
                          Informations du vendeur non disponibles
                        </div>
                      )}
                    </div>

                    {/* Historique */}
                    <div
                      className={`tab-pane fade ${activeTab === "history" ? "show active" : ""}`}
                    >
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="fw-bold mb-4">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="me-2 text-primary"
                            />
                            Historique du produit
                          </h6>
                          <div className="timeline">
                            <div className="timeline-item mb-3">
                              <div className="timeline-marker bg-primary"></div>
                              <div className="timeline-content">
                                <h6 className="fw-bold mb-1">Création</h6>
                                <p className="text-muted mb-0">
                                  {formatDate(produit.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="timeline-item mb-3">
                              <div className="timeline-marker bg-success"></div>
                              <div className="timeline-content">
                                <h6 className="fw-bold mb-1">
                                  Dernière modification
                                </h6>
                                <p className="text-muted mb-0">
                                  {formatDate(produit.updatedAt)}
                                </p>
                              </div>
                            </div>
                            {produit.promo_date_fin && (
                              <div className="timeline-item">
                                <div className="timeline-marker bg-warning"></div>
                                <div className="timeline-content">
                                  <h6 className="fw-bold mb-1">
                                    Promotion expire le
                                  </h6>
                                  <p className="text-muted mb-0">
                                    {formatDate(produit.promo_date_fin)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 pt-4 px-4 pb-4">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center"
                onClick={onClose}
                style={{
                  borderRadius: "10px",
                  padding: "0.75rem 2rem",
                  border: `2px solid ${colors.oskar.grey}30`,
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Fermer
              </button>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  style={{
                    borderRadius: "10px",
                    padding: "0.75rem 2rem",
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Commander
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center"
                  style={{
                    borderRadius: "10px",
                    padding: "0.75rem 2rem",
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Ajouter aux favoris
                </button>
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

        .nav-tabs .nav-link {
          transition: all 0.3s ease;
        }

        .nav-tabs .nav-link.active {
          background: linear-gradient(
            135deg,
            ${colors.oskar.blue}10 0%,
            ${colors.oskar.blue}5 100%
          );
          border-bottom: 3px solid ${colors.oskar.blue};
        }

        .nav-tabs .nav-link:not(.active):hover {
          color: ${colors.oskar.blue} !important;
        }

        .timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 0.6rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }

        .timeline-item {
          position: relative;
          padding-left: 1.5rem;
        }

        .timeline-marker {
          position: absolute;
          left: 0;
          top: 0.25rem;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          border: 3px solid white;
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

        .fixed-top {
          position: fixed !important;
          top: 0 !important;
          z-index: 1050 !important;
        }

        .z-3 {
          z-index: 3;
        }

        @media (max-width: 768px) {
          .modal-dialog {
            margin: 1rem;
          }

          .row.g-0 > [class*="col-"] {
            padding: 1rem !important;
          }

          .d-flex.justify-content-between {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewProduitModal;
