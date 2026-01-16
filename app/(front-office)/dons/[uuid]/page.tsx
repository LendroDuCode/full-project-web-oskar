// app/dons/[uuid]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface DonDetails {
  uuid: string;
  nom: string;
  type_don: string;
  description: string;
  prix: number | null;
  image: string | null;
  localisation: string;
  statut: string;
  date_debut: string;
  date_fin: string | null;
  lieu_retrait: string;
  disponible: boolean;
  quantite: number;
  nom_donataire: string;
  estPublie: boolean;
  vendeur_uuid: string | null;
  utilisateur_uuid: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function DonDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const [don, setDon] = useState<DonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarDons, setSimilarDons] = useState<DonDetails[]>([]);
  const [contactVisible, setContactVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fonction pour normaliser l'URL de l'image
  const normalizeImageUrl = useCallback((url: string | null): string => {
    if (!url) return "/images/placeholder-don.png";

    if (url.startsWith("http:localhost")) {
      url = url.replace("http:localhost", "http://localhost");
    }

    return url;
  }, []);

  // Charger les détails du don
  useEffect(() => {
    const fetchDonDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<DonDetails>(API_ENDPOINTS.DONS.DETAIL(uuid));

        if (data.image) {
          data.image = normalizeImageUrl(data.image);
        }

        setDon(data);

        // Charger des dons similaires
        try {
          const similar = await api.get<DonDetails[]>(
            API_ENDPOINTS.DONS.PUBLISHED,
          );
          const filteredSimilar = similar
            .filter((d) => d.uuid !== data.uuid)
            .slice(0, 4)
            .map((d) => ({
              ...d,
              image: d.image ? normalizeImageUrl(d.image) : null,
            }));
          setSimilarDons(filteredSimilar);
        } catch (similarError) {
          console.error("Erreur chargement dons similaires:", similarError);
        }
      } catch (err: any) {
        console.error("Erreur chargement détail don:", err);
        setError(err.message || "Impossible de charger les détails du don");
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchDonDetails();
    }
  }, [uuid, normalizeImageUrl]);

  // Fonction pour formater la date
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

  // Fonction pour obtenir le statut en français
  const getStatusLabel = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "disponible":
        return "Disponible";
      case "en_attente":
        return "En attente";
      case "reserve":
        return "Réservé";
      case "termine":
        return "Terminé";
      default:
        return statut;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "disponible":
        return "success";
      case "en_attente":
        return "warning";
      case "reserve":
        return "info";
      case "termine":
        return "secondary";
      default:
        return "dark";
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-success mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <h5 className="text-muted">Chargement des détails du don...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !don) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-danger shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-exclamation-triangle fa-4x text-danger"></i>
                </div>
                <h4 className="text-danger mb-3">Don introuvable</h4>
                <p className="text-muted mb-4">
                  {error || "Ce don n'existe pas ou a été supprimé."}
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <Link href="/dons" className="btn btn-outline-danger">
                    <i className="fas fa-arrow-left me-2"></i>
                    Retour aux dons
                  </Link>
                  <Link href="/" className="btn btn-success">
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
      {/* Breadcrumb amélioré */}
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
                <Link href="/dons" className="text-decoration-none text-muted">
                  <i className="fas fa-gift me-1"></i>
                  Dons
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                aria-current="page"
                style={{ maxWidth: "200px" }}
              >
                {don.nom}
              </li>
            </ol>
            <div className="d-flex align-items-center">
              <span
                className={`badge bg-${getStatusColor(don.statut)} px-3 py-2`}
              >
                <i className="fas fa-circle me-1"></i>
                {getStatusLabel(don.statut)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Colonne gauche - Images et description */}
          <div className="col-lg-8">
            {/* Carte principale avec image */}
            <div className="card shadow-sm border-0 mb-4 overflow-hidden">
              <div className="row g-0">
                <div className="col-md-7">
                  <div
                    className="position-relative"
                    style={{ height: "350px" }}
                  >
                    <img
                      src={
                        imageError || !don.image
                          ? "/images/placeholder-don.png"
                          : don.image
                      }
                      alt={don.nom}
                      className="img-fluid h-100 w-100 object-fit-cover"
                      onError={() => setImageError(true)}
                    />
                    <div className="position-absolute top-0 start-0 p-3">
                      <span className="badge bg-purple px-3 py-2">
                        <i className="fas fa-gift me-1"></i>
                        Don
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="card-body h-100 d-flex flex-column p-4">
                    <h1 className="card-title h3 fw-bold mb-3">{don.nom}</h1>

                    {/* Informations principales */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <i className="fas fa-map-marker-alt text-muted me-3"></i>
                        <div>
                          <small className="text-muted d-block">
                            Localisation
                          </small>
                          <strong>{don.localisation}</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <i className="fas fa-calendar-alt text-muted me-3"></i>
                        <div>
                          <small className="text-muted d-block">
                            Publié le
                          </small>
                          <strong>{formatDate(don.createdAt)}</strong>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-box text-muted me-3"></i>
                        <div>
                          <small className="text-muted d-block">Quantité</small>
                          <strong>{don.quantite} unité(s)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="mt-auto">
                      <button
                        className="btn btn-success btn-lg w-100 mb-3"
                        onClick={() => setContactVisible(true)}
                        disabled={
                          !don.disponible || don.statut !== "disponible"
                        }
                      >
                        <i className="fas fa-hand-holding-heart me-2"></i>
                        {don.disponible && don.statut === "disponible"
                          ? "Je suis intéressé(e)"
                          : "Non disponible"}
                      </button>

                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-success flex-fill">
                          <i className="fas fa-share-alt me-2"></i>
                          Partager
                        </button>
                        <button className="btn btn-outline-danger flex-fill">
                          <i className="fas fa-heart me-2"></i>
                          Favoris
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description détaillée */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-file-alt text-success fa-lg"></i>
                  </div>
                  <div>
                    <h3 className="h5 fw-bold mb-0">Description</h3>
                    <p className="text-muted mb-0">Détails du don</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="lead mb-0">{don.description}</p>
                </div>

                {/* Informations supplémentaires */}
                <div className="row g-3">
                  {don.type_don && (
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">
                            <i className="fas fa-tag me-2"></i>
                            Type de don
                          </h6>
                          <p className="fw-bold mb-0">{don.type_don}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <div className="card bg-light border-0">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          Lieu de retrait
                        </h6>
                        <p className="fw-bold mb-0">{don.lieu_retrait}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card bg-light border-0">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">
                          <i className="fas fa-calendar-plus me-2"></i>
                          Date de début
                        </h6>
                        <p className="fw-bold mb-0">
                          {formatDate(don.date_debut)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {don.date_fin && (
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">
                            <i className="fas fa-calendar-minus me-2"></i>
                            Date de fin
                          </h6>
                          <p className="fw-bold mb-0">
                            {formatDate(don.date_fin)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Informations du donateur */}
          <div className="col-lg-4">
            {/* Carte du donateur */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-user-circle text-success fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h5 fw-bold mb-0">Donateur</h4>
                    <p className="text-muted mb-0">Informations du donneur</p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: "70px", height: "70px" }}
                    >
                      <i className="fas fa-user text-muted fa-2x"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="mb-1">{don.nom_donataire || "Anonyme"}</h5>
                    <p className="text-muted mb-0">
                      <i className="fas fa-location-dot me-1"></i>
                      {don.localisation}
                    </p>
                  </div>
                </div>

                <div className="border-top pt-4">
                  {contactVisible ? (
                    <div className="alert alert-success">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">
                          <i className="fas fa-phone me-2"></i>
                          Contact disponible
                        </h6>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setContactVisible(false)}
                        >
                          <i className="fas fa-eye-slash"></i>
                        </button>
                      </div>
                      <p className="mb-2 fw-bold">
                        Numéro:{" "}
                        <span className="text-success">+225 XX XX XX XX</span>
                      </p>
                      <small className="text-muted d-block">
                        <i className="fas fa-info-circle me-1"></i>
                        Contactez le donateur pour organiser le retrait
                      </small>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={() => setContactVisible(true)}
                    >
                      <i className="fas fa-eye me-2"></i>
                      Voir le contact
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="card shadow-sm border-success border-2 mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="fas fa-shield-alt text-success"></i>
                  </div>
                  <h5 className="h6 fw-bold mb-0">Conseils de sécurité</h5>
                </div>
                <ul className="list-unstyled mb-0">
                  {[
                    "Rencontrez-vous dans un lieu public",
                    "Informez un proche de votre rendez-vous",
                    "Vérifiez l'état de l'objet avant prise",
                    "Respectez les horaires convenus",
                    "Évitez les transactions en espèces",
                  ].map((tip, index) => (
                    <li key={index} className="mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <small>{tip}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Partage social */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="h6 fw-bold mb-3">Partager ce don</h5>
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
                    {
                      icon: "fas fa-link",
                      color: "dark",
                      label: "Copier le lien",
                    },
                  ].map((social, index) => (
                    <div key={index} className="col-6">
                      <button
                        className={`btn btn-outline-${social.color} w-100`}
                      >
                        <i className={social.icon + " me-2"}></i>
                        {social.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dons similaires */}
        {similarDons.length > 0 && (
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold mb-0">
                <i className="fas fa-gift me-2 text-purple"></i>
                Dons similaires
              </h3>
              <Link href="/dons" className="btn btn-outline-purple btn-sm">
                Voir tous les dons
              </Link>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {similarDons.map((similarDon) => (
                <div key={similarDon.uuid} className="col">
                  <div className="card shadow-sm border-0 h-100">
                    <div
                      className="position-relative overflow-hidden"
                      style={{ height: "180px" }}
                    >
                      <img
                        src={similarDon.image || "/images/placeholder-don.png"}
                        alt={similarDon.nom}
                        className="img-fluid w-100 h-100 object-fit-cover"
                      />
                      <span className="position-absolute top-0 start-0 m-2 badge bg-purple">
                        <i className="fas fa-gift me-1"></i>
                        Don
                      </span>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold mb-2">
                        {similarDon.nom}
                      </h6>
                      <p className="card-text small text-muted mb-3">
                        {similarDon.description?.substring(0, 80)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className={`badge bg-${getStatusColor(similarDon.statut)}`}
                        >
                          {getStatusLabel(similarDon.statut)}
                        </span>
                        <Link
                          href={`/dons/${similarDon.uuid}`}
                          className="btn btn-sm btn-outline-success"
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

      {/* Modal de contact */}
      {contactVisible && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-handshake me-2"></i>
                  Contacter le donateur
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setContactVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Pour contacter le donateur, veuillez utiliser les
                      informations suivantes :
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="text-muted">Don</h6>
                        <p className="fw-bold mb-0">{don.nom}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="text-muted">Donateur</h6>
                        <p className="fw-bold mb-0">
                          {don.nom_donataire || "Anonyme"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card border-success">
                      <div className="card-body">
                        <h6 className="text-success">
                          <i className="fas fa-phone me-2"></i>
                          Contact
                        </h6>
                        <p className="fw-bold fs-5 mb-0">+225 XX XX XX XX</p>
                        <small className="text-muted">
                          (Le numéro complet sera affiché après connexion)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setContactVisible(false)}
                >
                  <i className="fas fa-times me-2"></i>
                  Fermer
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    alert("Fonctionnalité de contact à implémenter");
                  }}
                >
                  <i className="fas fa-comment me-2"></i>
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-purple {
          background-color: #9c27b0 !important;
        }
        .btn-outline-purple {
          color: #9c27b0;
          border-color: #9c27b0;
        }
        .btn-outline-purple:hover {
          background-color: #9c27b0;
          color: white;
        }
        .object-fit-cover {
          object-fit: cover;
        }
        .lead {
          font-size: 1.1rem;
          line-height: 1.7;
        }
        .card {
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
}
