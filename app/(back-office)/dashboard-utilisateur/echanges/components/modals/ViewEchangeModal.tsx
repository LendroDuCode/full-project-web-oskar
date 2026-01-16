"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExchangeAlt,
  faCalendar,
  faUser,
  faPhone,
  faMoneyBillWave,
  faTag,
  faBox,
  faHandHoldingHeart,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faBan,
  faImage,
  faCopy,
  faShare,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface ViewEchangeModalProps {
  isOpen: boolean;
  echange: any;
  onClose: () => void;
}

interface EchangeDetails {
  uuid: string;
  titre: string;
  description: string;
  objet_propose: string;
  objet_demande: string;
  type_echange: string;
  categorie: any;
  prix: string;
  numero: string;
  quantite: number;
  message: string;
  image: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  estPublie?: boolean;
  est_bloque?: boolean;
  vendeur?: any;
  utilisateur?: any;
  agent?: any;
}

export default function ViewEchangeModal({
  isOpen,
  echange,
  onClose,
}: ViewEchangeModalProps) {
  const [loading, setLoading] = useState(false);
  const [echangeDetails, setEchangeDetails] = useState<EchangeDetails | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Charger les détails de l'échange
  useEffect(() => {
    const fetchEchangeDetails = async () => {
      if (!echange?.uuid) return;

      try {
        setLoading(true);
        setError(null);

        // Essayer d'abord l'endpoint détaillé, sinon utiliser les données existantes
        try {
          const response = await api.get<EchangeDetails>(
            API_ENDPOINTS.ECHANGES.DETAIL(echange.uuid),
          );
          setEchangeDetails(response);
        } catch (detailError) {
          // Si l'endpoint détaillé n'existe pas, utiliser les données de base
          console.log("Utilisation des données de base");
          setEchangeDetails({
            ...echange,
            objet_propose: echange.objet_propose || echange.titre,
            objet_demande: echange.objet_demande || "Non spécifié",
            type_echange: echange.type_echange || "produit",
            quantite: echange.quantite || 1,
            message: echange.message || "",
            createdAt: echange.createdAt || new Date().toISOString(),
            updatedAt: echange.updatedAt || new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement détails:", err);
        setError("Impossible de charger les détails de l'échange");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && echange) {
      fetchEchangeDetails();
    }
  }, [isOpen, echange]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price: string) => {
    if (!price || price === "0") return "Gratuit";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(num);
  };

  const getStatusInfo = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "en_attente":
        return {
          icon: faHourglassHalf,
          color: "warning",
          label: "En attente",
          className: "bg-warning bg-opacity-10 text-warning",
        };
      case "disponible":
        return {
          icon: faCheckCircle,
          color: "success",
          label: "Disponible",
          className: "bg-success bg-opacity-10 text-success",
        };
      case "accepte":
        return {
          icon: faCheckCircle,
          color: "primary",
          label: "Accepté",
          className: "bg-primary bg-opacity-10 text-primary",
        };
      case "refuse":
        return {
          icon: faTimesCircle,
          color: "danger",
          label: "Refusé",
          className: "bg-danger bg-opacity-10 text-danger",
        };
      case "indisponible":
        return {
          icon: faBan,
          color: "secondary",
          label: "Indisponible",
          className: "bg-secondary bg-opacity-10 text-secondary",
        };
      default:
        return {
          icon: faInfoCircle,
          color: "info",
          label: statut || "Inconnu",
          className: "bg-info bg-opacity-10 text-info",
        };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Vous pouvez ajouter un toast de confirmation ici
      alert("Copié dans le presse-papier !");
    });
  };

  if (!isOpen || !echange) return null;

  const statusInfo = getStatusInfo(echangeDetails?.statut || echange.statut);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-info text-white rounded-top-3 position-relative">
            <div className="w-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="modal-title fw-bold mb-0">
                  <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                  Détails de l'échange
                </h5>
                <button
                  type="button"
                  className="btn btn-close btn-close-white"
                  onClick={onClose}
                ></button>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${statusInfo.className} border-0`}>
                    <FontAwesomeIcon icon={statusInfo.icon} className="me-2" />
                    {statusInfo.label}
                  </span>

                  {echangeDetails?.estPublie && (
                    <span className="badge bg-success bg-opacity-10 text-success border-0">
                      <FontAwesomeIcon icon={faShare} className="me-1" />
                      Publié
                    </span>
                  )}

                  {echangeDetails?.est_bloque && (
                    <span className="badge bg-danger bg-opacity-10 text-danger border-0">
                      <FontAwesomeIcon icon={faBan} className="me-1" />
                      Bloqué
                    </span>
                  )}
                </div>

                <small className="text-white-50">
                  ID: {echange.uuid.substring(0, 8)}...
                </small>
              </div>
            </div>
          </div>

          {/* Contenu du modal */}
          <div className="modal-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-3 text-muted">Chargement des détails...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger m-4">
                <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                {error}
              </div>
            ) : (
              <div className="p-0">
                {/* Image principale */}
                {(echangeDetails?.image || echange.image) && (
                  <div className="position-relative">
                    <img
                      src={echangeDetails?.image || echange.image}
                      alt={echangeDetails?.titre || echange.titre}
                      className="img-fluid w-100"
                      style={{
                        maxHeight: "300px",
                        objectFit: "cover",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/800x300/4A90E2/FFFFFF?text=${(echangeDetails?.titre || echange.titre || "E").charAt(0)}`;
                      }}
                    />
                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-3"
                      style={{
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      }}
                    >
                      <h4 className="text-white fw-bold mb-0">
                        {echangeDetails?.titre || echange.titre}
                      </h4>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="row g-4">
                    {/* Colonne gauche - Informations principales */}
                    <div className="col-lg-8">
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                          <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-primary me-2"
                            />
                            Informations de l'échange
                          </h5>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faBox}
                                  className="me-2"
                                />
                                Objet proposé
                              </p>
                              <p className="fw-bold text-dark fs-5">
                                {echangeDetails?.objet_propose || echange.titre}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faHandHoldingHeart}
                                  className="me-2"
                                />
                                Objet recherché
                              </p>
                              <p className="fw-bold text-dark fs-5">
                                {echangeDetails?.objet_demande ||
                                  "Non spécifié"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faTag}
                                  className="me-2"
                                />
                                Type d'échange
                              </p>
                              <p className="fw-bold text-dark">
                                {echangeDetails?.type_echange === "service"
                                  ? "Service"
                                  : "Produit"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faMoneyBillWave}
                                  className="me-2"
                                />
                                Prix estimé
                              </p>
                              <p className="fw-bold text-dark fs-5">
                                {formatPrice(
                                  echangeDetails?.prix || echange.prix || "0",
                                )}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faBox}
                                  className="me-2"
                                />
                                Quantité
                              </p>
                              <p className="fw-bold text-dark">
                                {echangeDetails?.quantite ||
                                  echange.quantite ||
                                  1}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <p className="text-muted mb-1">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="me-2"
                                />
                                Contact
                              </p>
                              <div className="d-flex align-items-center gap-2">
                                <p className="fw-bold text-dark mb-0">
                                  {echangeDetails?.numero ||
                                    echange.numero ||
                                    "Non renseigné"}
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    copyToClipboard(
                                      echangeDetails?.numero ||
                                        echange.numero ||
                                        "",
                                    )
                                  }
                                  title="Copier le numéro"
                                >
                                  <FontAwesomeIcon icon={faCopy} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {(echangeDetails?.description ||
                            echange.description) && (
                            <div className="mt-4">
                              <p className="text-muted mb-2">Description</p>
                              <div className="bg-light rounded p-3">
                                <p className="mb-0">
                                  {echangeDetails?.description ||
                                    echange.description}
                                </p>
                              </div>
                            </div>
                          )}

                          {echangeDetails?.message && (
                            <div className="mt-4">
                              <p className="text-muted mb-2">
                                Message supplémentaire
                              </p>
                              <div className="bg-info bg-opacity-10 rounded p-3">
                                <p className="mb-0">{echangeDetails.message}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informations de dates */}
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                              <h6 className="fw-bold text-dark mb-3">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-primary me-2"
                                />
                                Dates
                              </h6>
                              <div className="mb-2">
                                <small className="text-muted">Créé le</small>
                                <div className="fw-semibold">
                                  {formatDate(
                                    echangeDetails?.createdAt ||
                                      echange.createdAt ||
                                      Date.now().toString(),
                                  )}
                                </div>
                              </div>
                              {echangeDetails?.updatedAt && (
                                <div>
                                  <small className="text-muted">
                                    Modifié le
                                  </small>
                                  <div className="fw-semibold">
                                    {formatDate(echangeDetails.updatedAt)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Informations utilisateur */}
                        {(echangeDetails?.vendeur ||
                          echangeDetails?.utilisateur) && (
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                <h6 className="fw-bold text-dark mb-3">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-primary me-2"
                                  />
                                  Créateur
                                </h6>
                                <div className="mb-2">
                                  <small className="text-muted">Type</small>
                                  <div className="fw-semibold">
                                    {echangeDetails.vendeur
                                      ? "Vendeur"
                                      : "Utilisateur"}
                                  </div>
                                </div>
                                {echangeDetails.vendeur?.nom && (
                                  <div>
                                    <small className="text-muted">Nom</small>
                                    <div className="fw-semibold">
                                      {echangeDetails.vendeur.nom}
                                    </div>
                                  </div>
                                )}
                                {echangeDetails.utilisateur?.email && (
                                  <div>
                                    <small className="text-muted">Email</small>
                                    <div className="fw-semibold">
                                      {echangeDetails.utilisateur.email}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne droite - Informations supplémentaires */}
                    <div className="col-lg-4">
                      <div className="sticky-top" style={{ top: "20px" }}>
                        {/* Statut et actions */}
                        <div className="card border-0 shadow-sm mb-4">
                          <div className="card-body">
                            <h6 className="fw-bold text-dark mb-3">Statut</h6>
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-semibold">Publication</span>
                                <span
                                  className={`badge ${echangeDetails?.estPublie ? "bg-success" : "bg-secondary"}`}
                                >
                                  {echangeDetails?.estPublie
                                    ? "Publié"
                                    : "Non publié"}
                                </span>
                              </div>

                              <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-semibold">Blocage</span>
                                <span
                                  className={`badge ${echangeDetails?.est_bloque ? "bg-danger" : "bg-success"}`}
                                >
                                  {echangeDetails?.est_bloque
                                    ? "Bloqué"
                                    : "Actif"}
                                </span>
                              </div>

                              <div className="d-flex align-items-center justify-content-between">
                                <span className="fw-semibold">ID</span>
                                <div className="d-flex align-items-center gap-1">
                                  <small
                                    className="text-muted text-truncate"
                                    style={{ maxWidth: "100px" }}
                                  >
                                    {echange.uuid.substring(0, 8)}...
                                  </small>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      copyToClipboard(echange.uuid)
                                    }
                                    title="Copier l'ID"
                                  >
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Catégorie */}
                        {echangeDetails?.categorie && (
                          <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                              <h6 className="fw-bold text-dark mb-3">
                                Catégorie
                              </h6>
                              <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                  <FontAwesomeIcon
                                    icon={faTag}
                                    className="text-primary"
                                  />
                                </div>
                                <div>
                                  <div className="fw-bold">
                                    {echangeDetails.categorie.libelle}
                                  </div>
                                  {echangeDetails.categorie.description && (
                                    <small className="text-muted">
                                      {echangeDetails.categorie.description}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions rapides */}
                        <div className="card border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="fw-bold text-dark mb-3">Actions</h6>
                            <div className="d-grid gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                                onClick={() => copyToClipboard(echange.uuid)}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                                Copier l'ID
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                                onClick={() => {
                                  // Logique d'export
                                  const data = JSON.stringify(
                                    echangeDetails || echange,
                                    null,
                                    2,
                                  );
                                  const blob = new Blob([data], {
                                    type: "application/json",
                                  });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `echange-${echange.uuid}.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                <FontAwesomeIcon icon={faDownload} />
                                Exporter JSON
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pied de modal */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Fermer
            </button>

            <button
              type="button"
              className="btn btn-info"
              onClick={() => {
                // Action de contact ou autre
                if (echangeDetails?.numero || echange.numero) {
                  window.open(
                    `tel:${echangeDetails?.numero || echange.numero}`,
                  );
                }
              }}
              disabled={!(echangeDetails?.numero || echange.numero)}
            >
              <FontAwesomeIcon icon={faPhone} className="me-2" />
              Contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
