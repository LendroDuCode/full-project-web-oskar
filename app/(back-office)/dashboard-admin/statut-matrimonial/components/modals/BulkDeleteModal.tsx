// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/BulkDeleteModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faTimes,
  faExclamationTriangle,
  faList,
  faDatabase,
  faCalendar,
  faShield,
} from "@fortawesome/free-solid-svg-icons";

interface BulkDeleteModalProps {
  show: boolean;
  loading: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
  itemType?: string;
}

export default function BulkDeleteModal({
  show,
  loading,
  count,
  onClose,
  onConfirm,
  itemType = "statuts matrimoniaux",
}: BulkDeleteModalProps) {
  if (!show) return null;

  // Calculer l'impact
  const getImpactLevel = () => {
    if (count <= 5) return { level: "faible", color: "warning" };
    if (count <= 20) return { level: "modéré", color: "danger" };
    return { level: "élevé", color: "danger" };
  };

  const impact = getImpactLevel();

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête */}
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faTrash} className="fs-5" />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  Suppression multiple
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Confirmez la suppression de {count} {itemType}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Corps */}
          <div className="modal-body p-4">
            {/* Alerte principale */}
            <div
              className="alert alert-danger border-0 mb-4"
              style={{ borderRadius: "10px" }}
            >
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="fs-4 me-3"
                />
                <div>
                  <h6 className="alert-heading mb-1">Action définitive !</h6>
                  <p className="mb-0">
                    Cette action ne peut pas être annulée. Toutes les données
                    seront perdues définitivement.
                  </p>
                </div>
              </div>
            </div>

            {/* Détails de la suppression */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3">
                <FontAwesomeIcon icon={faList} className="me-2" />
                Résumé de la suppression
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: "rgba(220, 53, 69, 0.1)" }}
                        >
                          <FontAwesomeIcon
                            icon={faDatabase}
                            className="text-danger"
                          />
                        </div>
                        <div>
                          <div className="fw-bold fs-5">{count}</div>
                          <small className="text-muted">
                            {itemType} à supprimer
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div
                          className="rounded-circle p-2 me-3"
                          style={{ backgroundColor: "rgba(255, 193, 7, 0.1)" }}
                        >
                          <FontAwesomeIcon
                            icon={faShield}
                            className="text-warning"
                          />
                        </div>
                        <div>
                          <div className="fw-bold fs-5 text-capitalize">
                            {impact.level}
                          </div>
                          <small className="text-muted">Impact estimé</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conséquences */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2 text-warning"
                />
                Conséquences
              </h6>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 py-2 border-0">
                  <small className="text-danger">
                    • Toutes les données des {count} {itemType} seront
                    définitivement effacées
                  </small>
                </li>
                <li className="list-group-item px-0 py-2 border-0">
                  <small className="text-danger">
                    • Les utilisateurs associés à ces statuts seront affectés
                  </small>
                </li>
                <li className="list-group-item px-0 py-2 border-0">
                  <small className="text-danger">
                    • Cette action est irréversible et ne peut pas être annulée
                  </small>
                </li>
                <li className="list-group-item px-0 py-2 border-0">
                  <small className="text-muted">
                    • Date de suppression :{" "}
                    {new Date().toLocaleDateString("fr-FR")}
                  </small>
                </li>
              </ul>
            </div>

            {/* Confirmation finale */}
            <div className="alert alert-warning border-0">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2"
                />
                <div>
                  <small>
                    <strong>Confirmation requise :</strong> Tapez "SUPPRIMER"
                    pour confirmer la suppression.
                  </small>
                  <div className="input-group mt-2">
                    <input
                      type="text"
                      id="confirmationInput"
                      className="form-control form-control-sm"
                      placeholder="Tapez SUPPRIMER ici..."
                      onChange={(e) => {
                        const btn = document.getElementById("confirmDeleteBtn");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={onClose}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
              Annuler
            </button>
            <button
              type="button"
              id="confirmDeleteBtn"
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={onConfirm}
              disabled={true} // Désactivé par défaut
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Suppression en cours...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} />
                  Supprimer {count} {itemType}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Script pour la confirmation */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('confirmationInput')?.addEventListener('input', function(e) {
              const btn = document.getElementById('confirmDeleteBtn');
              if (btn) {
                btn.disabled = e.target.value !== 'SUPPRIMER';
              }
            });
          `,
        }}
      />
    </div>
  );
}
