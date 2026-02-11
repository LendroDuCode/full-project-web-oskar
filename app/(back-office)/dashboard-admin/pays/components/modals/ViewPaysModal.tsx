"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faGlobe,
  faFlag,
  faMapMarkerAlt,
  faLanguage,
  faUsers,
  faCalendar,
  faTrash,
  faCopy,
  faExclamationTriangle,
  faToggleOn,
  faToggleOff,
  faEdit,
  faCity,
  faMoneyBillWave,
  faClock,
  faGlobeAmericas,
  faCode,
  faHistory,
  faCheckCircle,
  faList,
  faPhone,
  faDatabase,
  faChartBar,
  faCog,
  faCalendarAlt,
  faInfoCircle,
  faEarth,
  faRulerCombined,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import colors from "@/app/shared/constants/colors";

// Types
interface Pays {
  uuid: string;
  id: number;
  nom: string;
  code: string;
  code_iso: string;
  indicatif: string;
  devise: string;
  langue: string;
  continent: string;
  capitale: string;
  population: number;
  superficie: number;
  fuseau_horaire: string;
  domaine_internet: string;
  statut: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updatedAt: string;
}

interface ViewPaysModalProps {
  show: boolean;
  pays: Pays | null;
  onClose: () => void;
}

// Formatage des nombres
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("fr-FR").format(num);
};

// Formatage de la date
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "N/A";
  }
};

export default function ViewPaysModal({
  show,
  pays,
  onClose,
}: ViewPaysModalProps) {
  if (!show || !pays) return null;

  const handleCopyUUID = () => {
    navigator.clipboard.writeText(pays.uuid);
    alert("UUID copié dans le presse-papier !");
  };

  const handleCopyID = () => {
    navigator.clipboard.writeText(pays.id.toString());
    alert("ID copié dans le presse-papier !");
  };

  const getContinentIcon = (continent: string) => {
    const continentLower = continent.toLowerCase();
    if (continentLower.includes("afrique")) return faGlobeAmericas;
    if (continentLower.includes("europe")) return faGlobeAmericas;
    if (continentLower.includes("asie") || continentLower.includes("asia"))
      return faGlobeAmericas;
    if (
      continentLower.includes("amérique") ||
      continentLower.includes("america")
    )
      return faGlobeAmericas;
    if (
      continentLower.includes("océanie") ||
      continentLower.includes("oceania")
    )
      return faGlobeAmericas;
    return faGlobe;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header border-0 text-white rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.blue} 0%, ${colors.oskar.blueHover} 100%)`,
            }}
          >
            <div className="d-flex align-items-center w-100">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faGlobe} className="fs-5" />
              </div>
              <div className="flex-grow-1">
                <h5 className="modal-title mb-0 fw-bold">Détails du Pays</h5>
                <p className="mb-0 opacity-75 fs-14">
                  Informations complètes sur {pays.nom}
                </p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Fermer"
                style={{ filter: "brightness(0) invert(1)" }}
              ></button>
            </div>
          </div>

          {/* Corps de la modal */}
          <div className="modal-body p-4">
            <div className="row">
              {/* Colonne gauche : Informations principales */}
              <div className="col-md-8">
                {/* Carte d'information générale */}
                <div className="card border-0 shadow-sm mb-4">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      background: colors.oskar.lightGrey,
                      borderLeft: `4px solid ${colors.oskar.blue}`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ backgroundColor: `${colors.oskar.blue}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          style={{ color: colors.oskar.blue }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.blue }}
                        >
                          Informations Générales
                        </h6>
                        <small className="text-muted">
                          Détails de base du pays
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faFlag} />
                            Nom du Pays
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold">{pays.nom}</h5>
                            <span
                              className="badge d-flex align-items-center gap-1 px-2 py-1"
                              style={{
                                backgroundColor: `${colors.oskar.green}15`,
                                color: colors.oskar.green,
                                border: `1px solid ${colors.oskar.green}30`,
                                borderRadius: "20px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faFlag}
                                className="fs-12"
                              />
                              {pays.code}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faGlobe} />
                            Continent
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={getContinentIcon(pays.continent)}
                              className="text-primary"
                            />
                            <span className="fw-semibold">
                              {pays.continent}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faCity} />
                            Capitale
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="text-muted"
                            />
                            <span className="fw-semibold">
                              {pays.capitale || "Non spécifiée"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faLanguage} />
                            Langue(s)
                          </label>
                          <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2">
                              {pays.langue || "Non spécifiée"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            Devise
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">
                              {pays.devise || "Non spécifiée"}
                            </span>
                            {pays.devise && (
                              <small className="text-muted">
                                ({pays.code})
                              </small>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faPhone} />
                            Indicatif téléphonique
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">
                              +{pays.indicatif}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faCode} />
                            Code ISO
                          </label>
                          <div>
                            <code className="bg-light px-3 py-2 rounded border">
                              {pays.code_iso || "N/A"}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faNetworkWired} />
                            Domaine Internet
                          </label>
                          <div>
                            <code className="bg-light px-3 py-2 rounded border">
                              .{pays.domaine_internet || "N/A"}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faClock} />
                            Fuseau horaire
                          </label>
                          <div>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-2">
                              {pays.fuseau_horaire || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faDatabase} />
                            ID
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <code className="bg-light px-2 py-1 rounded">
                              #{pays.id}
                            </code>
                            <button
                              onClick={handleCopyID}
                              className="btn btn-sm btn-outline-secondary"
                              title="Copier l'ID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carte des statistiques */}
                <div className="card border-0 shadow-sm mb-4">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      background: colors.oskar.lightGrey,
                      borderLeft: `4px solid ${colors.oskar.green}`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ backgroundColor: `${colors.oskar.green}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faChartBar}
                          style={{ color: colors.oskar.green }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.green }}
                        >
                          Statistiques
                        </h6>
                        <small className="text-muted">
                          Données démographiques et géographiques
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-3 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.blue}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faUsers}
                              style={{ color: colors.oskar.blue }}
                            />
                          </div>
                          <div>
                            <h4 className="mb-1 fw-bold">
                              {formatNumber(pays.population)}
                            </h4>
                            <p className="mb-0 text-muted">Population</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle p-3 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.orange}15`,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faRulerCombined}
                              style={{ color: colors.oskar.orange }}
                            />
                          </div>
                          <div>
                            <h4 className="mb-1 fw-bold">
                              {formatNumber(pays.superficie)} km²
                            </h4>
                            <p className="mb-0 text-muted">Superficie</p>
                          </div>
                        </div>
                      </div>

                      {pays.population > 0 && pays.superficie > 0 && (
                        <div className="col-12">
                          <div className="alert alert-info border-0">
                            <div className="d-flex align-items-center">
                              <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="me-2"
                              />
                              <div>
                                <p className="mb-1 fw-semibold">
                                  Densité de population :
                                </p>
                                <p className="mb-0">
                                  <strong>
                                    {Math.round(
                                      pays.population / pays.superficie,
                                    )}
                                  </strong>{" "}
                                  habitants/km²
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Carte des métadonnées */}
                <div className="card border-0 shadow-sm">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      background: colors.oskar.lightGrey,
                      borderLeft: `4px solid ${colors.oskar.grey}`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ backgroundColor: `${colors.oskar.grey}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faCog}
                          style={{ color: colors.oskar.grey }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.grey }}
                        >
                          Métadonnées
                        </h6>
                        <small className="text-muted">
                          Informations système
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Créé le
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-muted"
                            />
                            <span className="fw-semibold">
                              {formatDateTime(pays.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faHistory} />
                            Dernière modification
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-muted"
                            />
                            <span className="fw-semibold">
                              {pays.updatedAt
                                ? formatDateTime(pays.updatedAt)
                                : "Jamais modifié"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label text-muted small mb-1 d-flex align-items-center gap-1">
                            <FontAwesomeIcon icon={faCode} />
                            UUID
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              value={pays.uuid}
                              readOnly
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                            />
                            <button
                              onClick={handleCopyUUID}
                              className="btn btn-outline-secondary"
                              type="button"
                              title="Copier l'UUID"
                            >
                              <FontAwesomeIcon icon={faCopy} />
                            </button>
                          </div>
                          <small className="text-muted mt-1">
                            Identifiant unique du pays dans le système
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Statut et actions */}
              <div className="col-md-4">
                {/* Carte de statut */}
                <div className="card border-0 shadow-sm mb-4">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      background: colors.oskar.lightGrey,
                      borderLeft: `4px solid ${
                        pays.statut === "actif"
                          ? colors.oskar.green
                          : colors.oskar.orange
                      }`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{
                          backgroundColor: `${
                            pays.statut === "actif"
                              ? colors.oskar.green
                              : colors.oskar.orange
                          }15`,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            pays.statut === "actif"
                              ? faCheckCircle
                              : faExclamationTriangle
                          }
                          style={{
                            color:
                              pays.statut === "actif"
                                ? colors.oskar.green
                                : colors.oskar.orange,
                          }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{
                            color:
                              pays.statut === "actif"
                                ? colors.oskar.green
                                : colors.oskar.orange,
                          }}
                        >
                          Statut du Pays
                        </h6>
                        <small className="text-muted">
                          État actuel dans le système
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body text-center">
                    <div
                      className={`rounded-circle p-4 d-inline-block mb-3 ${
                        pays.statut === "actif"
                          ? "bg-success bg-opacity-10"
                          : "bg-warning bg-opacity-10"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          pays.statut === "actif"
                            ? faCheckCircle
                            : faExclamationTriangle
                        }
                        className={`fs-1 ${
                          pays.statut === "actif"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      />
                    </div>
                    <h5 className="mb-2">
                      Pays {pays.statut === "actif" ? "Actif" : "Inactif"}
                    </h5>
                    <p className="text-muted mb-0">
                      {pays.statut === "actif"
                        ? "Ce pays est actuellement actif et peut être utilisé dans le système."
                        : "Ce pays est inactif et ne peut pas être utilisé."}
                    </p>
                  </div>
                </div>

                {/* Carte d'actions rapides */}
                <div className="card border-0 shadow-sm">
                  <div
                    className="card-header border-0 py-3"
                    style={{
                      background: colors.oskar.lightGrey,
                      borderLeft: `4px solid ${colors.oskar.blue}`,
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ backgroundColor: `${colors.oskar.blue}15` }}
                      >
                        <FontAwesomeIcon
                          icon={faList}
                          style={{ color: colors.oskar.blue }}
                        />
                      </div>
                      <div>
                        <h6
                          className="mb-0 fw-bold"
                          style={{ color: colors.oskar.blue }}
                        >
                          Actions Rapides
                        </h6>
                        <small className="text-muted">
                          Opérations disponibles
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-3"
                        onClick={() => {
                          onClose();
                          // Ouvrir modal d'édition
                          alert("Ouvrir modal d'édition");
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Modifier ce pays
                      </button>

                      <button
                        className={`btn d-flex align-items-center justify-content-center gap-2 py-3 ${
                          pays.statut === "actif"
                            ? "btn-warning"
                            : "btn-success"
                        }`}
                        onClick={() => {
                          onClose();
                          // Basculer le statut
                          alert("Basculer le statut du pays");
                        }}
                      >
                        <FontAwesomeIcon
                          icon={
                            pays.statut === "actif" ? faToggleOff : faToggleOn
                          }
                        />
                        {pays.statut === "actif" ? "Désactiver" : "Activer"}
                      </button>

                      <button
                        className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2 py-3"
                        onClick={() => {
                          onClose();
                          // Ouvrir modal de suppression
                          alert("Ouvrir modal de suppression");
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Supprimer ce pays
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carte d'informations rapides */}
                <div className="card border-0 shadow-sm mt-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Résumé</h6>
                    <div className="list-group list-group-flush">
                      <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Code :</span>
                        <span className="fw-semibold">{pays.code}</span>
                      </div>
                      <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Code ISO :</span>
                        <span className="fw-semibold">{pays.code_iso}</span>
                      </div>
                      <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Devise :</span>
                        <span className="fw-semibold">
                          {pays.devise || "N/A"}
                        </span>
                      </div>
                      <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Indicatif :</span>
                        <span className="fw-semibold">+{pays.indicatif}</span>
                      </div>
                      <div className="list-group-item border-0 px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Domaine :</span>
                        <span className="fw-semibold">
                          .{pays.domaine_internet || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} />
                Fermer
              </button>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={handleCopyUUID}
                >
                  <FontAwesomeIcon icon={faCopy} />
                  Copier l'UUID
                </button>

                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    onClose();
                    alert("Ouvrir modal d'édition");
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Modifier ce pays
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .card {
          border-radius: 12px !important;
        }

        .list-group-item:last-child {
          border-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
}
