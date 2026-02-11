import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Boutique {
  uuid: string;
  nom: string;
}

interface DeleteBoutiqueModalProps {
  show: boolean;
  boutique: Boutique | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteBoutiqueModal = ({
  show,
  boutique,
  loading,
  onClose,
  onConfirm,
}: DeleteBoutiqueModalProps) => {
  if (!show || !boutique) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 bg-danger text-white rounded-top-3">
            <h5 className="modal-title fw-bold">
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              Supprimer la boutique
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-warning mb-3 border-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Attention :</strong> Cette action est définitive
            </div>
            <p className="mb-3">
              Êtes-vous sûr de vouloir supprimer la boutique{" "}
              <strong>"{boutique.nom}"</strong> ?
            </p>
            <div className="text-danger small">
              Cette action est irréversible. Tous les produits, commandes et
              données associés à cette boutique seront perdus.
            </div>
          </div>
          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Suppression...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBoutiqueModal;
