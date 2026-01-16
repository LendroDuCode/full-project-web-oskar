// app/echanges/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface EchangeDetails {
  uuid: string;
  nomElementEchange: string;
  nom_initiateur: string;
  prix: string;
  image: string | null;
  typeDestinataire: string;
  typeEchange: string;
  objetPropose: string;
  objetDemande: string;
  statut: string;
  message: string;
  dateProposition: string;
  dateAcceptation: string | null;
  numero: string;
  disponible: boolean;
  quantite: number;
  createdAt: string | null;
}

export default function EchangeDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const [echange, setEchange] = useState<EchangeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarEchanges, setSimilarEchanges] = useState<EchangeDetails[]>([]);
  const [imageError, setImageError] = useState(false);

  const normalizeImageUrl = useCallback((url: string | null): string => {
    if (!url) return "/images/placeholder-echange.png";

    if (url.startsWith("http:localhost")) {
      url = url.replace("http:localhost", "http://localhost");
    }

    return url;
  }, []);

  useEffect(() => {
    const fetchEchangeDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<EchangeDetails>(
          API_ENDPOINTS.ECHANGES.DETAIL(uuid),
        );

        if (data.image) {
          data.image = normalizeImageUrl(data.image);
        }

        setEchange(data);

        try {
          const similar = await api.get<EchangeDetails[]>(
            API_ENDPOINTS.ECHANGES.PUBLISHED,
          );
          const filteredSimilar = similar
            .filter((e) => e.uuid !== data.uuid)
            .slice(0, 4)
            .map((e) => ({
              ...e,
              image: e.image ? normalizeImageUrl(e.image) : null,
            }));
          setSimilarEchanges(filteredSimilar);
        } catch (similarError) {
          console.error("Erreur chargement échanges similaires:", similarError);
        }
      } catch (err: any) {
        console.error("Erreur chargement détail échange:", err);
        setError(
          err.message || "Impossible de charger les détails de l'échange",
        );
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchEchangeDetails();
    }
  }, [uuid, normalizeImageUrl]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "en_attente":
        return "warning";
      case "accepte":
        return "success";
      case "refuse":
        return "danger";
      case "termine":
        return "secondary";
      default:
        return "info";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "en_attente":
        return "En attente";
      case "accepte":
        return "Accepté";
      case "refuse":
        return "Refusé";
      case "termine":
        return "Terminé";
      default:
        return statut;
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-info mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <h5 className="text-muted">
                  Chargement des détails de l'échange...
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !echange) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-danger shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-exchange-alt fa-4x text-danger"></i>
                </div>
                <h4 className="text-danger mb-3">Échange introuvable</h4>
                <p className="text-muted mb-4">
                  {error || "Cet échange n'existe pas ou a été supprimé."}
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <Link href="/echanges" className="btn btn-outline-danger">
                    <i className="fas fa-arrow-left me-2"></i>
                    Retour aux échanges
                  </Link>
                  <Link href="/" className="btn btn-info">
                    <i className="fas fa-home me-2"></i>
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="bg-white border-bottom shadow-sm">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted">
                  <i className="fas fa-home me-1"></i>
                  Accueil
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  href="/echanges"
                  className="text-decoration-none text-muted"
                >
                  <i className="fas fa-exchange-alt me-1"></i>
                  Échanges
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                style={{ maxWidth: "200px" }}
              >
                {echange.nomElementEchange}
              </li>
            </ol>
            <div className="d-flex align-items-center gap-2">
              <span
                className={`badge bg-${getStatusColor(echange.statut)} px-3 py-2`}
              >
                <i className="fas fa-circle me-1"></i>
                {getStatusLabel(echange.statut)}
              </span>
              {echange.disponible && (
                <span className="badge bg-success px-3 py-2">
                  <i className="fas fa-check-circle me-1"></i>
                  Disponible
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Colonne gauche - Détails de l'échange */}
          <div className="col-lg-8">
            {/* En-tête */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-exchange-alt text-info fa-lg"></i>
                  </div>
                  <div>
                    <h1 className="h3 fw-bold mb-0">
                      {echange.nomElementEchange}
                    </h1>
                    <p className="text-muted mb-0">Proposition d'échange</p>
                  </div>
                </div>

                {echange.message && (
                  <div className="alert alert-info">
                    <i className="fas fa-comment-dots me-2"></i>
                    <strong>Message :</strong> {echange.message}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-info">
                      <div className="card-body">
                        <h5 className="text-info mb-3">
                          <i className="fas fa-arrow-up me-2"></i>
                          Objet proposé
                        </h5>
                        <h4 className="fw-bold mb-3">{echange.objetPropose}</h4>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-user text-muted me-2"></i>
                          <span>Proposé par : {echange.nom_initiateur}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-success">
                      <div className="card-body">
                        <h5 className="text-success mb-3">
                          <i className="fas fa-arrow-down me-2"></i>
                          Objet demandé
                        </h5>
                        <h4 className="fw-bold mb-3">{echange.objetDemande}</h4>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-users text-muted me-2"></i>
                          <span>Type : {echange.typeDestinataire}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image et informations */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-0">
                <div className="row g-0">
                  <div className="col-md-6">
                    <div
                      className="position-relative"
                      style={{ height: "300px" }}
                    >
                      <img
                        src={
                          imageError || !echange.image
                            ? "/images/placeholder-echange.png"
                            : echange.image
                        }
                        alt={echange.nomElementEchange}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        onError={() => setImageError(true)}
                      />
                      <span className="position-absolute top-0 start-0 m-3 badge bg-info">
                        <i className="fas fa-exchange-alt me-1"></i>
                        Échange
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4">
                      <h5 className="fw-bold mb-4">
                        <i className="fas fa-info-circle me-2 text-info"></i>
                        Informations
                      </h5>

                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Type d'échange
                        </small>
                        <strong className="d-block">
                          <i className="fas fa-tag me-2"></i>
                          {echange.typeEchange}
                        </strong>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Valeur estimée
                        </small>
                        <strong className="d-block text-success">
                          <i className="fas fa-money-bill-wave me-2"></i>
                          {parseFloat(echange.prix).toLocaleString(
                            "fr-FR",
                          )}{" "}
                          FCFA
                        </strong>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted d-block">Quantité</small>
                        <strong className="d-block">
                          <i className="fas fa-box me-2"></i>
                          {echange.quantite} unité(s)
                        </strong>
                      </div>

                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Date de proposition
                        </small>
                        <strong className="d-block">
                          <i className="fas fa-calendar-alt me-2"></i>
                          {formatDate(echange.dateProposition)}
                        </strong>
                      </div>

                      {echange.dateAcceptation && (
                        <div className="mb-3">
                          <small className="text-muted d-block">
                            Date d'acceptation
                          </small>
                          <strong className="d-block">
                            <i className="fas fa-calendar-check me-2"></i>
                            {formatDate(echange.dateAcceptation)}
                          </strong>
                        </div>
                      )}

                      <div className="mt-4">
                        <small className="text-muted d-block mb-2">
                          Contact
                        </small>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-phone text-success me-2"></i>
                          <strong>{echange.numero}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">
                  <i className="fas fa-bolt me-2 text-warning"></i>
                  Actions disponibles
                </h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <button
                      className="btn btn-success w-100"
                      disabled={echange.statut !== "en_attente"}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Accepter l'échange
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn btn-outline-danger w-100"
                      disabled={echange.statut !== "en_attente"}
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Refuser l'échange
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button className="btn btn-outline-info w-100">
                      <i className="fas fa-comment me-2"></i>
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Informations complémentaires */}
          <div className="col-lg-4">
            {/* Conseils */}
            <div className="card shadow-sm border-warning mb-4">
              <div className="card-body p-4">
                <h5 className="text-warning fw-bold mb-3">
                  <i className="fas fa-lightbulb me-2"></i>
                  Conseils pour l'échange
                </h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Inspectez les objets avant échange
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Rencontrez-vous dans un lieu public
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Convenez d'une date et heure précises
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Informez un proche du rendez-vous
                  </li>
                  <li>
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Signez un accord si nécessaire
                  </li>
                </ul>
              </div>
            </div>

            {/* Statut de l'échange */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-chart-line me-2 text-info"></i>
                  Suivi de l'échange
                </h5>
                <div className="timeline">
                  <div
                    className={`timeline-item ${echange.statut === "en_attente" ? "active" : ""}`}
                  >
                    <div className="timeline-marker bg-info"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Proposition envoyée</h6>
                      <small className="text-muted">
                        {formatDate(echange.dateProposition)}
                      </small>
                    </div>
                  </div>
                  <div
                    className={`timeline-item ${echange.statut === "accepte" ? "active" : ""}`}
                  >
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Échange accepté</h6>
                      <small className="text-muted">
                        {echange.dateAcceptation
                          ? formatDate(echange.dateAcceptation)
                          : "En attente"}
                      </small>
                    </div>
                  </div>
                  <div
                    className={`timeline-item ${echange.statut === "termine" ? "active" : ""}`}
                  >
                    <div className="timeline-marker bg-secondary"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Échange terminé</h6>
                      <small className="text-muted">À venir</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partage */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Partager cet échange</h5>
                <div className="row g-2">
                  {[
                    {
                      icon: "fab fa-facebook-f",
                      color: "primary",
                      label: "Facebook",
                    },
                    { icon: "fab fa-twitter", color: "info", label: "Twitter" },
                    {
                      icon: "fab fa-whatsapp",
                      color: "success",
                      label: "WhatsApp",
                    },
                    { icon: "fas fa-link", color: "dark", label: "Copier" },
                  ].map((social, index) => (
                    <div key={index} className="col-6">
                      <button
                        className={`btn btn-outline-${social.color} w-100`}
                      >
                        <i className={social.icon + " me-1"}></i>
                        {social.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Échanges similaires */}
        {similarEchanges.length > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold">
                <i className="fas fa-exchange-alt me-2 text-info"></i>
                Échanges similaires
              </h3>
              <Link href="/echanges" className="btn btn-outline-info btn-sm">
                Voir tous les échanges
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {similarEchanges.map((echangeItem) => (
                <div key={echangeItem.uuid} className="col">
                  <div className="card shadow-sm border-0 h-100">
                    <div
                      className="position-relative overflow-hidden"
                      style={{ height: "180px" }}
                    >
                      <img
                        src={
                          echangeItem.image || "/images/placeholder-echange.png"
                        }
                        alt={echangeItem.nomElementEchange}
                        className="img-fluid w-100 h-100 object-fit-cover"
                      />
                      <span className="position-absolute top-0 start-0 m-2 badge bg-info">
                        Échange
                      </span>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold mb-2">
                        {echangeItem.nomElementEchange}
                      </h6>
                      <div className="mb-3">
                        <small className="text-muted d-block">Propose :</small>
                        <strong>{echangeItem.objetPropose}</strong>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">Demande :</small>
                        <strong>{echangeItem.objetDemande}</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className={`badge bg-${getStatusColor(echangeItem.statut)}`}
                        >
                          {getStatusLabel(echangeItem.statut)}
                        </span>
                        <Link
                          href={`/echanges/${echangeItem.uuid}`}
                          className="btn btn-sm btn-outline-info"
                        >
                          <i className="fas fa-eye me-1"></i>
                          Voir
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .object-fit-cover {
          object-fit: cover;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 12px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e9ecef;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-item.active .timeline-marker {
          border: 3px solid white;
          box-shadow: 0 0 0 3px var(--bs-info);
        }

        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #e9ecef;
        }

        .timeline-content {
          padding-left: 10px;
        }
      `}</style>
    </div>
  );
}
