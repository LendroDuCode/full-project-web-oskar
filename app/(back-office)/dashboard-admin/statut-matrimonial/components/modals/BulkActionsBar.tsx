// app/(back-office)/dashboard-admin/statuts-matrimoniaux/components/BulkActionsBar.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPlay,
  faPause,
  faTrash,
  faBan,
  faCheckCircle,
  faTimesCircle,
  faFilter,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  isAllSelected: boolean;
  totalItems: number;
  loading: boolean;
}

export default function BulkActionsBar({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  isAllSelected,
  totalItems,
  loading,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  // Actions disponibles
  const actions = [
    {
      id: "activate",
      label: "Activer",
      icon: faPlay,
      variant: "success" as const,
      description: "Activer les statuts sélectionnés",
    },
    {
      id: "deactivate",
      label: "Désactiver",
      icon: faPause,
      variant: "warning" as const,
      description: "Désactiver les statuts sélectionnés",
    },
    {
      id: "delete",
      label: "Supprimer",
      icon: faTrash,
      variant: "danger" as const,
      description: "Supprimer définitivement les statuts sélectionnés",
      requiresConfirmation: true,
    },
  ];

  // Calcul des statistiques
  const percentage =
    totalItems > 0 ? Math.round((selectedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-primary bg-opacity-10 border-primary border-start border-5 p-3 mb-3 rounded-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* Section info */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "50px", height: "50px" }}
          >
            <FontAwesomeIcon icon={faCheck} size="lg" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-primary">
              {selectedCount} statut(s) sélectionné(s)
            </h6>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">
                {isAllSelected
                  ? "Tous les statuts sont sélectionnés"
                  : `${selectedCount} sur ${totalItems} statuts sélectionnés`}
              </small>
              {!isAllSelected && (
                <div
                  className="progress"
                  style={{ width: "100px", height: "6px" }}
                >
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section actions */}
        <div className="d-flex flex-wrap gap-2">
          {/* Bouton tout sélectionner/désélectionner */}
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={onSelectAll}
            disabled={loading}
            title={isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>

          {/* Actions groupées */}
          {actions.map((action) => (
            <button
              key={action.id}
              className={`btn btn-${action.variant} btn-sm d-flex align-items-center gap-2`}
              onClick={() => onBulkAction(action.id)}
              disabled={loading}
              title={action.description}
              data-bs-toggle={
                action.requiresConfirmation ? "tooltip" : undefined
              }
              data-bs-title={
                action.requiresConfirmation
                  ? "Cette action nécessite une confirmation"
                  : undefined
              }
            >
              <FontAwesomeIcon icon={action.icon} />
              {action.label}
            </button>
          ))}

          {/* Annuler la sélection */}
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={onClearSelection}
            disabled={loading}
            title="Annuler la sélection"
          >
            <FontAwesomeIcon icon={faBan} />
            Annuler
          </button>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="mt-3 pt-3 border-top border-primary border-opacity-25">
        <div className="d-flex flex-wrap gap-3">
          <div className="d-flex align-items-center gap-1">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-success fs-12"
            />
            <small className="text-muted">Actifs: </small>
            <small className="fw-semibold ms-1">{selectedCount}</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="text-danger fs-12"
            />
            <small className="text-muted">Inactifs: </small>
            <small className="fw-semibold ms-1">0</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <FontAwesomeIcon icon={faFilter} className="text-info fs-12" />
            <small className="text-muted">Filtrés: </small>
            <small className="fw-semibold ms-1">{totalItems}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
