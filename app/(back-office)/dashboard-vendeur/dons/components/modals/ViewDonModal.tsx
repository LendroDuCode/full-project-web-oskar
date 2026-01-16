"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faGift,
  faTag,
  faAlignLeft,
  faMapMarkerAlt,
  faBox,
  faUser,
  faPhone,
  faCalendar,
  faGlobe,
  faList,
  faCheckCircle,
  faInfoCircle,
  faImage,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";

interface ViewDonModalProps {
  isOpen: boolean;
  don: any;
  onClose: () => void;
}

interface Category {
  label: string;
  value: string;
  uuid: string;
}

const CONDITIONS = {
  neuf: "Neuf (jamais utilisé)",
  tres_bon: "Très bon état",
  bon: "Bon état",
  moyen: "État moyen",
  a_renover: "À rénover/réparer",
};

const DISPONIBILITES = {
  immediate: "Immédiate",
  semaine: "Cette semaine",
  mois: "Ce mois-ci",
};

export default function ViewDonModal({
  isOpen,
  don,
  onClose,
}: ViewDonModalProps) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  // Charger les détails de la catégorie
  useEffect(() => {
    if (isOpen && don?.categorie_uuid) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/categories/${don.categorie_uuid}`);
          if (response) {
            setCategory({
              label: response.libelle || response.type || "Sans nom",
              value: response.uuid,
              uuid: response.uuid,
            });
          }
        } catch (err) {
          console.error("Erreur chargement catégorie:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [isOpen, don]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
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

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !don) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="viewDonModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blue} 100%)`,
              borderBottom: `3px solid ${colors.oskar.blueHover}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faGift} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold" id="viewDonModalLabel">
                  Détails du Don
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Informations complètes du don
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Corps */}
          <div className="modal-body py-4">
            {/* Image du don */}
            <div className="text-center mb-4">
              {don.image ? (
                <div className="position-relative d-inline-block">
                  <img
                    src={don.image}
                    alt={don.titre}
                    className="img-fluid rounded-3 border shadow-sm"
                    style={{
                      maxHeight: "300px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://via.placeholder.com/400x300/6f42c1/ffffff?text=${don.titre.charAt(0)}`;
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light position-absolute bottom-0 end-0 m-2"
                    onClick={() => window.open(don.image, "_blank")}
                    title="Voir l'image en grand"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>
              ) : (
                <div className="bg-light rounded-3 p-5 d-inline-block">
                  <FontAwesomeIcon icon={faImage} className="text-muted fs-1" />
                  <p className="text-muted mt-2 mb-0">Aucune image</p>
                </div>
              )}
            </div>

            <div className="row g-4">
              {/* Colonne gauche - Informations principales */}
              <div className="col-md-8">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="fw-bold mb-0 text-dark">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="text-primary me-2"
                      />
                      Informations principales
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon icon={faTag} className="me-2" />
                          Titre
                        </p>
                        <p className="fw-bold text-dark fs-5">{don.titre}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon icon={faTag} className="me-2" />
                          Type de don
                        </p>
                        <p className="fw-bold text-dark">
                          {don.type_don || "Non spécifié"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon icon={faList} className="me-2" />
                          Catégorie
                        </p>
                        {loading ? (
                          <div className="spinner-border spinner-border-sm text-primary"></div>
                        ) : (
                          <p className="fw-bold text-dark">
                            {category?.label || "Non spécifiée"}
                          </p>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon icon={faBox} className="me-2" />
                          Quantité
                        </p>
                        <p className="fw-bold text-dark">
                          {don.quantite || "1"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">État</p>
                        <p className="fw-bold text-dark">
                          {CONDITIONS[
                            don.condition as keyof typeof CONDITIONS
                          ] || "Non spécifié"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">Disponibilité</p>
                        <p className="fw-bold text-dark">
                          {DISPONIBILITES[
                            don.disponibilite as keyof typeof DISPONIBILITES
                          ] || "Non spécifiée"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Localisation
                        </p>
                        <p className="fw-bold text-dark">
                          {don.localisation || "Non spécifiée"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <p className="text-muted mb-1">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Lieu de retrait
                        </p>
                        <p className="fw-bold text-dark">
                          {don.lieu_retrait || "Non spécifié"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-muted mb-2">
                        <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                        Description
                      </p>
                      <div className="bg-light rounded p-3">
                        <p className="mb-0">
                          {don.description || "Aucune description"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Informations complémentaires */}
              <div className="col-md-4">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="fw-bold mb-0 text-dark">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-primary me-2"
                      />
                      Donataire
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="text-muted mb-1">Nom</p>
                      <p className="fw-bold text-dark">
                        {don.nom_donataire || "Non spécifié"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-muted mb-1">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        Contact
                      </p>
                      <p className="fw-bold text-dark">
                        {don.numero || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-3">
                    <h6 className="fw-bold mb-0 text-dark">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="text-primary me-2"
                      />
                      Métadonnées
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="text-muted mb-1">Statut</p>
                      <span
                        className={`badge ${don.statut === "publie" ? "bg-success" : don.statut === "draft" ? "bg-warning" : "bg-danger"}`}
                      >
                        {don.statut === "publie"
                          ? "Publié"
                          : don.statut === "draft"
                            ? "Brouillon"
                            : "Bloqué"}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-muted mb-1">Date de création</p>
                      <p className="fw-bold text-dark">
                        {formatDate(don.createdAt)}
                      </p>
                    </div>

                    {don.updatedAt && (
                      <div className="mb-3">
                        <p className="text-muted mb-1">Dernière modification</p>
                        <p className="fw-bold text-dark">
                          {formatDate(don.updatedAt)}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <p className="text-muted mb-1">Numéro d'identification</p>
                      <code className="bg-light rounded px-2 py-1 d-inline-block">
                        {don.uuid}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 py-3 px-4">
            <div className="d-flex justify-content-end w-100">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleClose}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .btn {
          border-radius: 8px !important;
          font-weight: 500;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }

        code {
          font-size: 0.75rem;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
