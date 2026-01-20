// app/(back-office)/dashboard-admin/components/PublishAdModal.tsx
"use client";

interface PublishAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PublishAdModal({
  isOpen,
  onClose,
  onSuccess,
}: PublishAdModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-gradient-success text-white border-0">
            <h5 className="modal-title fw-bold">
              <i className="fa-solid fa-plus-circle me-2"></i>
              Publier une annonce (Administrateur)
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-info">
              <i className="fa-solid fa-info-circle me-2"></i>
              En tant qu'administrateur, vous pouvez publier des annonces pour
              tout utilisateur.
            </div>
            <p className="mb-4">
              La fonctionnalité de publication d'annonce complète sera
              disponible prochainement.
            </p>
            <button
              className="btn btn-success"
              onClick={() => {
                onSuccess?.();
                onClose();
              }}
            >
              <i className="fa-solid fa-check me-2"></i>
              Publier (simulé)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
