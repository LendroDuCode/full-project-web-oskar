// components/PublishAdModal/components/SummaryForm.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faBox,
  faMoneyBill,
  faMapMarkerAlt,
  faCheckCircle,
  faUser,
  faBriefcase,
  faInfoCircle,
  faArrowLeft,
  faSpinner,
  faImage,
  faTag,
  faBuilding,
  faFileContract,
} from "@fortawesome/free-solid-svg-icons";

interface SummaryFormProps {
  venteData: any;
  boutiqueData: any;
  createdBoutiqueUuid: string | null;
  onBack: () => void;
  onSubmit: () => Promise<boolean>;
  loading: boolean;
  isLoggedIn: boolean;
}

const SummaryForm: React.FC<SummaryFormProps> = ({
  venteData,
  boutiqueData,
  createdBoutiqueUuid,
  onBack,
  onSubmit,
  loading,
  isLoggedIn,
}) => {
  const handleFinalSubmit = async () => {
    await onSubmit();
  };

  const getConditionText = (condition: string) => {
    const conditions: Record<string, string> = {
      neuf: "Neuf (jamais utilisé)",
      tresbon: "Très bon état",
      bon: "Bon état",
      moyen: "État moyen",
      areparer: "À réparer",
    };
    return conditions[condition] || condition;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0 FCFA";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(num);
  };

  return (
    <div className="p-5">
      <div className="text-center mb-6">
        <div className="rounded-circle bg-success bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1" />
        </div>
        <h2 className="fw-bold text-dark mb-3">Récapitulatif</h2>
        <p className="text-muted fs-5">
          Vérifiez les informations avant la publication
        </p>
      </div>

      <div className="alert alert-info border-0 mb-5">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="me-3 fs-4" />
          <div>
            <h6 className="fw-bold mb-1">Flux professionnel complet</h6>
            <p className="mb-0">
              Vous êtes sur le point de publier un produit dans votre nouvelle
              boutique. Voici le récapitulatif de toutes les étapes.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Section Boutique */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                <FontAwesomeIcon icon={faStore} className="text-warning me-2" />
                Votre boutique
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Nom de la boutique</h6>
                    <p className="mb-0">{boutiqueData.nom || "Non spécifié"}</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon icon={faTag} className="text-warning" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Type de boutique</h6>
                    <p className="mb-0">
                      {boutiqueData.type_boutique_uuid
                        ? "Type sélectionné"
                        : "Non spécifié"}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-warning"
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Description</h6>
                    <p className="mb-0">
                      {boutiqueData.description || "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </div>

              {boutiqueData.logo && (
                <div className="alert alert-warning border-0">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    <span>Logo de boutique téléchargé</span>
                  </div>
                </div>
              )}

              {boutiqueData.registre_commerce && (
                <div className="alert alert-success border-0">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileContract} className="me-2" />
                    <span>Registre de commerce fourni</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Produit */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                <FontAwesomeIcon icon={faBox} className="text-success me-2" />
                Votre produit
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon icon={faTag} className="text-success" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Nom du produit</h6>
                    <p className="mb-0">{venteData.libelle}</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon
                      icon={faMoneyBill}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Prix</h6>
                    <p className="mb-0 fw-bold">
                      {formatPrice(venteData.prix)}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon icon={faBox} className="text-success" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Quantité</h6>
                    <p className="mb-0">{venteData.quantite} unité(s)</p>
                  </div>
                </div>

                <div className="d-flex align-items-start mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Lieu</h6>
                    <p className="mb-0">{venteData.lieu}</p>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-success"
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">État du produit</h6>
                    <p className="mb-0">
                      {getConditionText(venteData.condition)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="alert alert-success border-0">
                <h6 className="fw-bold mb-2">Description</h6>
                <p className="mb-0 small">{venteData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé final */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white border-0 py-4">
          <h5 className="fw-bold mb-0 text-dark">Résumé complet</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold text-muted mb-3">Statut du vendeur</h6>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="text-warning"
                  />
                </div>
                <div>
                  <p className="fw-bold mb-0">Vendeur professionnel</p>
                  <p className="text-muted small mb-0">
                    Compte transformé avec succès
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold text-muted mb-3">Mode de vente</h6>
              <div className="d-flex align-items-center mb-4">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                  <FontAwesomeIcon icon={faStore} className="text-success" />
                </div>
                <div>
                  <p className="fw-bold mb-0">Vente professionnelle</p>
                  <p className="text-muted small mb-0">
                    Via votre boutique en ligne
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-warning border-0">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="me-3" />
              <div>
                <h6 className="fw-bold mb-2">Ce qui va se passer</h6>
                <ul className="mb-0 ps-3">
                  <li>
                    Votre produit sera publié dans votre nouvelle boutique
                  </li>
                  <li>Votre boutique sera visible par tous les utilisateurs</li>
                  <li>Vous recevrez des notifications pour vos ventes</li>
                  <li>
                    Vous pourrez gérer votre stock depuis votre tableau de bord
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5 pt-4 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary px-4 py-3 rounded-pill fw-semibold"
          onClick={onBack}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Retour modifier
        </button>

        <button
          type="button"
          className="btn btn-success px-4 py-3 rounded-pill fw-semibold shadow-sm"
          onClick={handleFinalSubmit}
          disabled={loading || !isLoggedIn}
          style={{
            background: "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
            border: "none",
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Publication en cours...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Publier le produit
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SummaryForm;
