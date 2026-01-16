// app/dashboard/type-boutique/components/ViewTypeBoutiqueModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faStore,
  faTrash,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";
import VenteBadge from "../VenteBadge";
import StatusBadge from "../StatusBadge";

interface TypeBoutique {
  id: number;
  uuid: string;
  code: string;
  libelle: string;
  description?: string | null;
  peut_vendre_produits: boolean;
  peut_vendre_biens: boolean;
  image: string;
  statut: "actif" | "inactif";
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ViewTypeBoutiqueModalProps {
  isOpen: boolean;
  typeBoutique: TypeBoutique | null;
  onClose: () => void;
}

export default function ViewTypeBoutiqueModal({
  isOpen,
  typeBoutique,
  onClose,
}: ViewTypeBoutiqueModalProps) {
  if (!isOpen || !typeBoutique) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    } catch {
      return "N/A";
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 1050,
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.grey} 0%, ${colors.oskar.greenHover} 100%)`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEye} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">
                  Détails du Type de Boutique
                </h5>
                <p className="mb-0 opacity-75 fs-14">{typeBoutique.libelle}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Fermer"
            />
          </div>

          <div className="modal-body py-4">
            <div className="row">
              <div className="col-md-4 text-center mb-4 mb-md-0">
                {typeBoutique.image ? (
                  <div className="mb-3">
                    <img
                      src={typeBoutique.image}
                      alt={typeBoutique.libelle}
                      className="img-fluid rounded border shadow-sm"
                      style={{ maxWidth: "250px" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://via.placeholder.com/250/cccccc/ffffff?text=${typeBoutique.libelle.charAt(0)}`;
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-light rounded border"
                    style={{ height: "200px", width: "100%" }}
                  >
                    <FontAwesomeIcon
                      icon={faStore}
                      className="text-muted"
                      size="3x"
                    />
                  </div>
                )}
                <h4 className="mt-3 fw-bold">{typeBoutique.libelle}</h4>
                <code className="text-muted">{typeBoutique.code}</code>
              </div>

              <div className="col-md-8">
                <div className="row">
                  <div className="col-12 mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Description</h6>
                    <p className="mb-0">
                      {typeBoutique.description || "Aucune description"}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="fw-semibold text-muted mb-2">
                      Autorisations
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      <VenteBadge
                        type="produits"
                        value={typeBoutique.peut_vendre_produits}
                      />
                      <VenteBadge
                        type="biens"
                        value={typeBoutique.peut_vendre_biens}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Statut</h6>
                    <StatusBadge statut={typeBoutique.statut} />
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="fw-semibold text-muted mb-2">
                      Informations système
                    </h6>
                    <p className="mb-1">
                      <strong>ID:</strong> {typeBoutique.id}
                    </p>
                    <p className="mb-1">
                      <strong>UUID:</strong>{" "}
                      <code className="text-muted fs-12">
                        {typeBoutique.uuid}
                      </code>
                    </p>
                    <p className="mb-1">
                      <strong>Créé le:</strong>{" "}
                      {formatDate(typeBoutique.created_at)}
                    </p>
                    <p className="mb-0">
                      <strong>Modifié le:</strong>{" "}
                      {formatDate(typeBoutique.updated_at)}
                    </p>
                  </div>

                  <div className="col-md-6 mb-3">
                    <h6 className="fw-semibold text-muted mb-2">État</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {typeBoutique.is_deleted ? (
                        <span className="badge bg-danger">
                          <FontAwesomeIcon icon={faTrash} className="me-1" />
                          Supprimé
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          <FontAwesomeIcon icon={faCheck} className="me-1" />
                          Actif
                        </span>
                      )}
                      {typeBoutique.deleted_at && (
                        <span className="badge bg-warning">
                          Supprimé le: {formatDate(typeBoutique.deleted_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
