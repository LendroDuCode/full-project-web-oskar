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
  faExclamationTriangle,
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
  images?: string[];
  photo?: string;
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
  const [imageError, setImageError] = useState(false);

  // Fonction pour obtenir l'URL de l'image correcte
  const getImageUrl = () => {
    // Vérifier toutes les sources possibles d'image
    const imageUrl =
      echangeDetails?.image ||
      echangeDetails?.photo ||
      echangeDetails?.images?.[0] ||
      echange?.image ||
      echange?.photo ||
      echange?.images?.[0];

    return imageUrl || null;
  };

  // Fonction pour obtenir le titre correct
  const getTitle = () => {
    return echangeDetails?.titre || echange?.titre || "Échange";
  };

  // Charger les détails de l'échange
  useEffect(() => {
    const fetchEchangeDetails = async () => {
      if (!echange?.uuid) return;

      try {
        setLoading(true);
        setError(null);
        setImageError(false); // Réinitialiser l'erreur d'image

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
            uuid: echange.uuid,
            titre: echange.titre || echange.nomElementEchange || "Échange",
            description: echange.description || echange.message || "",
            objet_propose:
              echange.objet_propose ||
              echange.titre ||
              echange.nomElementEchange ||
              "Non spécifié",
            objet_demande: echange.objet_demande || "Non spécifié",
            type_echange: echange.type_echange || "produit",
            prix: echange.prix || "0",
            numero: echange.numero || echange.contact || "Non renseigné",
            quantite: echange.quantite || 1,
            message: echange.message || "",
            image: echange.image || echange.photo || echange.images?.[0],
            images: echange.images || (echange.image ? [echange.image] : []),
            statut: echange.statut || echange.status || "en_attente",
            createdAt:
              echange.createdAt ||
              echange.dateProposition ||
              new Date().toISOString(),
            updatedAt: echange.updatedAt || new Date().toISOString(),
            estPublie: echange.estPublie || false,
            est_bloque: echange.est_bloque || echange.estBloque || false,
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
    if (!price || price === "0" || price === "0.00") return "Gratuit";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(num);
  };

  const getStatusInfo = (statut: string) => {
    const status = statut?.toLowerCase() || "";

    if (status.includes("attente") || status === "pending") {
      return {
        icon: faHourglassHalf,
        color: "warning",
        label: "En attente",
        className: "bg-warning bg-opacity-10 text-warning",
      };
    } else if (
      status.includes("disponible") ||
      status === "available" ||
      status === "publie"
    ) {
      return {
        icon: faCheckCircle,
        color: "success",
        label: "Disponible",
        className: "bg-success bg-opacity-10 text-success",
      };
    } else if (status.includes("accept") || status === "valide") {
      return {
        icon: faCheckCircle,
        color: "primary",
        label: "Accepté",
        className: "bg-primary bg-opacity-10 text-primary",
      };
    } else if (status.includes("refus")) {
      return {
        icon: faTimesCircle,
        color: "danger",
        label: "Refusé",
        className: "bg-danger bg-opacity-10 text-danger",
      };
    } else if (status.includes("indisponible") || status.includes("bloque")) {
      return {
        icon: faBan,
        color: "secondary",
        label: status.includes("bloque") ? "Bloqué" : "Indisponible",
        className: "bg-secondary bg-opacity-10 text-secondary",
      };
    } else {
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
  const imageUrl = getImageUrl();
  const title = getTitle();

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
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
                  className="btn-close btn-close-white"
                  onClick={onClose}
                  aria-label="Fermer"
                ></button>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge ${statusInfo.className} border-0`}>
                    <FontAwesomeIcon icon={statusInfo.icon} className="me-1" />
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
                  ID: {echange.uuid?.substring(0, 8) || "N/A"}...
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
                {/* Image principale - CORRIGÉ */}
                <div className="position-relative">
                  {imageUrl && !imageError ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="img-fluid w-100"
                      style={{
                        maxHeight: "300px",
                        minHeight: "200px",
                        objectFit: "cover",
                        backgroundColor: "#f8f9fa",
                      }}
                      onError={(e) => {
                        console.error(
                          "Erreur de chargement d'image:",
                          imageUrl,
                        );
                        setImageError(true);
                        // Fallback immédiat
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="w-100 d-flex flex-column align-items-center justify-content-center bg-light"
                      style={{
                        height: "250px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={imageError ? faExclamationTriangle : faImage}
                        size="3x"
                        className="text-white mb-3"
                        style={{ opacity: 0.8 }}
                      />
                      <span className="text-white fw-semibold">
                        {imageError
                          ? "Image non disponible"
                          : title?.charAt(0)?.toUpperCase() || "E"}
                      </span>
                    </div>
                  )}

                  {/* Overlay avec titre */}
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3"
                    style={{
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    }}
                  >
                    <h4 className="text-white fw-bold mb-0">{title}</h4>
                  </div>
                </div>

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
                                {echangeDetails?.objet_propose || title}
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
                                {(echangeDetails?.numero || echange.numero) && (
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
                                )}
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
                                    {echange.uuid?.substring(0, 8) || "N/A"}...
                                  </small>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      copyToClipboard(echange.uuid || "")
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
                                    {echangeDetails.categorie.libelle ||
                                      echangeDetails.categorie.nom ||
                                      "Non catégorisé"}
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

                        {/* Galerie d'images */}
                        {echangeDetails?.images &&
                          echangeDetails.images.length > 0 && (
                            <div className="card border-0 shadow-sm mb-4">
                              <div className="card-body">
                                <h6 className="fw-bold text-dark mb-3">
                                  <FontAwesomeIcon
                                    icon={faImage}
                                    className="me-2 text-primary"
                                  />
                                  Galerie ({echangeDetails.images.length})
                                </h6>
                                <div className="d-flex flex-wrap gap-2">
                                  {echangeDetails.images.map((img, index) => (
                                    <div
                                      key={index}
                                      className="rounded overflow-hidden border"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => window.open(img, "_blank")}
                                    >
                                      <img
                                        src={img}
                                        alt={`Image ${index + 1}`}
                                        className="w-100 h-100 object-fit-cover"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    </div>
                                  ))}
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
                                onClick={() =>
                                  copyToClipboard(echange.uuid || "")
                                }
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
                                  a.download = `echange-${echange.uuid || "export"}.json`;
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
              className="btn btn-info text-white"
              onClick={() => {
                // Action de contact ou autre
                const phone = echangeDetails?.numero || echange.numero;
                if (phone && phone !== "Non renseigné") {
                  window.open(`tel:${phone}`);
                } else {
                  alert("Aucun numéro de contact disponible");
                }
              }}
              disabled={
                !(echangeDetails?.numero || echange.numero) ||
                echangeDetails?.numero === "Non renseigné" ||
                echange.numero === "Non renseigné"
              }
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
