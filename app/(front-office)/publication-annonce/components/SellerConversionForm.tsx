// components/PublishAdModal/components/SellerConversionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBriefcase,
  faArrowRight,
  faCheckCircle,
  faInfoCircle,
  faShieldAlt,
  faChartLine,
  faStore,
  faSpinner,
  faExclamationCircle,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

interface UserData {
  uuid: string;
  email: string;
  nom_complet: string;
  status: string;
  role?: string;
  user_type?: string;
}

interface SellerConversionFormProps {
  onBecomeSeller: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  currentUser: UserData | null;
}

const SellerConversionForm: React.FC<SellerConversionFormProps> = ({
  onBecomeSeller,
  loading,
  error,
  onBack,
  currentUser,
}) => {
  const [userUuid, setUserUuid] = useState<string>("");
  const [fetchingUuid, setFetchingUuid] = useState(false);

  const benefits = [
    {
      icon: faStore,
      title: "Boutique professionnelle",
      description: "Créez votre propre boutique en ligne",
    },
    {
      icon: faChartLine,
      title: "Statistiques détaillées",
      description: "Suivez vos performances de vente",
    },
    {
      icon: faShieldAlt,
      title: "Confiance accrue",
      description: "Gagnez la confiance des acheteurs",
    },
    {
      icon: faBriefcase,
      title: "Outils avancés",
      description: "Gestion de stocks, promotions, etc.",
    },
  ];

  // Récupérer l'UUID de l'utilisateur connecté
  useEffect(() => {
    const fetchUserUuid = () => {
      try {
        console.log("🔍 Récupération UUID utilisateur...");

        // 1. Vérifier si currentUser contient l'UUID
        if (currentUser && currentUser.uuid) {
          console.log("✅ UUID trouvé dans currentUser:", currentUser.uuid);
          setUserUuid(currentUser.uuid);
          localStorage.setItem("user_uuid", currentUser.uuid);
          return;
        }

        // 2. Essayer depuis localStorage
        const storedUuid = localStorage.getItem("user_uuid");
        if (storedUuid) {
          console.log("✅ UUID trouvé dans localStorage:", storedUuid);
          setUserUuid(storedUuid);
          return;
        }

        // 3. Sinon, essayer de parser le token JWT
        const token = localStorage.getItem("oskar_token");
        if (token) {
          try {
            // Extraire l'UUID du token JWT (partie payload)
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.uuid) {
              console.log("✅ UUID extrait du token:", payload.uuid);
              setUserUuid(payload.uuid);
              localStorage.setItem("user_uuid", payload.uuid);
              return;
            }
          } catch (tokenError) {
            console.log("❌ Impossible d'extraire l'UUID du token");
          }
        }

        // 4. Dernier recours : montrer une erreur
        console.log("⚠️ Impossible de récupérer l'UUID");
        setFetchingUuid(false);
      } catch (err: any) {
        console.error("❌ Erreur récupération UUID:", err);
        setFetchingUuid(false);
      }
    };

    fetchUserUuid();
  }, [currentUser]);

  const handleConversion = async () => {
    if (!userUuid) {
      console.log("❌ Aucun UUID disponible, tentative de récupération...");

      // Réessayer de récupérer l'UUID
      const token = localStorage.getItem("oskar_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.uuid) {
            setUserUuid(payload.uuid);
            localStorage.setItem("user_uuid", payload.uuid);
            console.log("✅ UUID récupéré depuis token après échec");

            // Attendre un peu puis réessayer
            setTimeout(async () => {
              await onBecomeSeller();
            }, 500);
            return;
          }
        } catch (e) {
          console.error("❌ Échec extraction token:", e);
        }
      }

      // Si toujours pas d'UUID, afficher erreur
      console.error("❌ Impossible de récupérer l'UUID utilisateur");
      return;
    }

    try {
      console.log("🔄 Lancement transformation vendeur avec UUID:", userUuid);
      const success = await onBecomeSeller();
      if (!success) {
        console.log("❌ Transformation échouée");
      }
    } catch (err: any) {
      console.error("Erreur dans handleConversion:", err);
    }
  };

  const retryFetchUuid = () => {
    localStorage.removeItem("user_uuid");
    setUserUuid("");

    // Recharger la page pour réinitialiser
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (fetchingUuid) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-warning mb-4" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <h4 className="fw-bold text-dark mb-2">
          Récupération de vos informations
        </h4>
        <p className="text-muted">Veuillez patienter...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="text-center mb-6">
        <div className="rounded-circle bg-warning bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faUser} className="text-warning fs-1" />
        </div>
        <h2 className="fw-bold text-dark mb-3">
          Devenir vendeur professionnel
        </h2>
        <p className="text-muted fs-5">
          Transformez votre compte pour créer une boutique
        </p>
      </div>

      {userUuid && (
        <div className="alert alert-info border-0 mb-4">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            <div>
              <strong>Identifiant utilisateur vérifié</strong>
              <small className="d-block text-muted mt-1">
                Votre compte est prêt à être transformé en compte vendeur.
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="text-warning me-2"
                />
                Transformation de votre compte
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger border-0 mb-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        className="me-2"
                      />
                      <div>
                        <strong>Erreur :</strong> {error}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={retryFetchUuid}
                    >
                      <FontAwesomeIcon icon={faRefresh} className="me-1" />
                      Réessayer
                    </button>
                  </div>
                </div>
              )}

              {!userUuid ? (
                <div className="alert alert-warning border-0">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      className="me-3"
                    />
                    <div>
                      <h6 className="fw-bold mb-2">Identifiant manquant</h6>
                      <p className="mb-0">
                        Impossible de récupérer votre identifiant utilisateur.
                        Veuillez rafraîchir la page.
                      </p>
                      <button
                        type="button"
                        className="btn btn-warning btn-sm mt-3"
                        onClick={retryFetchUuid}
                      >
                        <FontAwesomeIcon icon={faRefresh} className="me-1" />
                        Rafraîchir la page
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="alert alert-success border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="me-3 fs-4"
                      />
                      <div>
                        <h6 className="fw-bold mb-2">
                          Prêt à transformer votre compte
                        </h6>
                        <p className="mb-0">
                          Cliquez sur "Devenir vendeur professionnel" pour
                          compléter la transformation. Vous serez redirigé
                          automatiquement vers la création de boutique.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold text-dark mb-3">
                      Ce qui va changer :
                    </h6>
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <div className="d-flex align-items-start">
                          <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-success"
                            />
                          </div>
                          <div>
                            <strong>Nouveau statut "Vendeur"</strong>
                            <p className="text-muted mb-0 small">
                              Votre compte aura le statut professionnel
                              "Vendeur"
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="mb-3">
                        <div className="d-flex align-items-start">
                          <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-success"
                            />
                          </div>
                          <div>
                            <strong>Création de boutique autorisée</strong>
                            <p className="text-muted mb-0 small">
                              Vous pourrez créer une ou plusieurs boutiques
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="mb-3">
                        <div className="d-flex align-items-start">
                          <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-success"
                            />
                          </div>
                          <div>
                            <strong>Tableau de bord vendeur</strong>
                            <p className="text-muted mb-0 small">
                              Accès à l'interface de gestion des ventes
                            </p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-0 py-4">
              <h5 className="fw-bold mb-0 text-dark">
                <FontAwesomeIcon icon={faStore} className="text-warning me-2" />
                Avantages
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3">
                  Pourquoi devenir vendeur ?
                </h6>
                <div className="row g-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="col-12">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                          <FontAwesomeIcon
                            icon={benefit.icon}
                            className="text-warning"
                          />
                        </div>
                        <div>
                          <strong className="d-block">{benefit.title}</strong>
                          <small className="text-muted">
                            {benefit.description}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="alert alert-success border-0">
                <h6 className="fw-bold mb-2">Gratuit et rapide</h6>
                <p className="small mb-0">
                  La transformation est instantanée et ne vous engage à aucun
                  frais. Vous pourrez toujours vendre en tant que particulier si
                  vous le souhaitez.
                </p>
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
          <FontAwesomeIcon icon={faArrowRight} className="me-2 fa-rotate-180" />
          Retour
        </button>

        <button
          type="button"
          className="btn btn-warning px-4 py-3 rounded-pill fw-semibold shadow-sm"
          onClick={handleConversion}
          disabled={loading || !userUuid}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Transformation en cours...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Devenir vendeur professionnel
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SellerConversionForm;
