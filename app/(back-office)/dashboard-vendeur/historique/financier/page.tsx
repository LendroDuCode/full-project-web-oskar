"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoriquesActions() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7days");

  const filters = [
    { id: "all", label: "Toutes les actions", icon: "list" },
    { id: "users", label: "Utilisateurs", icon: "users" },
    { id: "system", label: "Système", icon: "server" },
    { id: "security", label: "Sécurité", icon: "shield" },
    { id: "data", label: "Données", icon: "database" },
  ];

  const timeRanges = [
    { id: "24h", label: "24 dernières heures" },
    { id: "7days", label: "7 derniers jours" },
    { id: "30days", label: "30 derniers jours" },
    { id: "custom", label: "Période personnalisée" },
  ];

  const sampleActions = [
    {
      id: 1,
      type: "user",
      action: "Connexion",
      user: "Admin",
      time: "10:30",
      status: "success",
    },
    {
      id: 2,
      type: "system",
      action: "Mise à jour",
      user: "Système",
      time: "09:15",
      status: "info",
    },
    {
      id: 3,
      type: "security",
      action: "Modification rôle",
      user: "SuperAdmin",
      time: "Hier",
      status: "warning",
    },
    {
      id: 4,
      type: "data",
      action: "Export",
      user: "User1",
      time: "23/03",
      status: "success",
    },
    {
      id: 5,
      type: "user",
      action: "Déconnexion",
      user: "Admin",
      time: "22/03",
      status: "success",
    },
  ];

  const getStatusBadge = (status: string) => {
    const colors = {
      success: "bg-success",
      warning: "bg-warning",
      info: "bg-info",
      danger: "bg-danger",
    };

    const labels = {
      success: "Réussi",
      warning: "Avertissement",
      info: "Information",
      danger: "Échec",
    };

    return (
      <span
        className={`badge ${colors[status as keyof typeof colors] || "bg-secondary"} text-white`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getActionIcon = (type: string) => {
    const icons: Record<string, string> = {
      user: "user",
      system: "cog",
      security: "shield",
      data: "database",
    };

    const colors: Record<string, string> = {
      user: "text-primary",
      system: "text-secondary",
      security: "text-warning",
      data: "text-info",
    };

    return (
      <div
        className={`bg-light p-2 rounded-circle ${colors[type] || "text-muted"}`}
      >
        <i className={`fa-solid fa-${icons[type] || "circle"} fa-lg`}></i>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                <i className="fa-solid fa-history me-3 text-primary"></i>
                Historique des Finances
              </h1>
              <p className="text-muted mb-0">
                Suivi et journalisation de toutes les activités du système
              </p>
            </div>
            <div>
              <span className="badge bg-info text-white fs-6 px-3 py-2">
                <i className="fa-solid fa-code me-2"></i>
                EN DÉVELOPPEMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière d'information */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-info border-info border-start border-5">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-clock-rotate-left fa-2x me-3"></i>
              </div>
              <div className="flex-grow-1">
                <h4 className="alert-heading fw-bold mb-2">
                  Module d&apos;historique en construction
                </h4>
                <p className="mb-2">
                  Cette fonctionnalité vous permettra de visualiser et
                  d&apos;auditer toutes les actions effectuées sur la
                  plateforme. Le module est actuellement en phase de
                  développement avancé.
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="progress flex-grow-1 me-3"
                    style={{ height: "8px" }}
                  >
                    <div
                      className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <span className="fw-semibold">75% complété</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Filtres et contrôles */}
        <div className="col-lg-3 col-xl-2 mb-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="fw-bold mb-0">
                <i className="fa-solid fa-filter me-2"></i>
                Filtres
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Type d&apos;action</h6>
                <div className="list-group list-group-flush">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`list-group-item list-group-item-action border-0 py-2 px-0 d-flex align-items-center ${selectedFilter === filter.id ? "active" : ""}`}
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      <i
                        className={`fa-solid fa-${filter.icon} me-3 ${selectedFilter === filter.id ? "text-white" : "text-muted"}`}
                      ></i>
                      <span
                        className={
                          selectedFilter === filter.id
                            ? "text-white fw-semibold"
                            : ""
                        }
                      >
                        {filter.label}
                      </span>
                      {selectedFilter === filter.id && (
                        <i className="fa-solid fa-check ms-auto"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3">Période</h6>
                <div className="list-group list-group-flush">
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      className={`list-group-item list-group-item-action border-0 py-2 px-0 ${timeRange === range.id ? "active" : ""}`}
                      onClick={() => setTimeRange(range.id)}
                    >
                      <span
                        className={
                          timeRange === range.id ? "text-white fw-semibold" : ""
                        }
                      >
                        {range.label}
                      </span>
                      {timeRange === range.id && (
                        <i className="fa-solid fa-check ms-auto"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold mb-3">Actions rapides</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" disabled>
                    <i className="fa-solid fa-download me-2"></i>
                    Exporter
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <i className="fa-solid fa-trash me-2"></i>
                    Nettoyer
                  </button>
                  <button className="btn btn-outline-info btn-sm" disabled>
                    <i className="fa-solid fa-chart-bar me-2"></i>
                    Statistiques
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques prévues */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Statistiques à venir</h6>
              <div className="text-center mb-3">
                <i className="fa-solid fa-chart-pie fa-3x text-muted mb-3"></i>
                <p className="text-muted small">
                  Visualisation des données d&apos;activité
                </p>
              </div>
              <div className="small text-muted">
                <div className="d-flex justify-content-between mb-1">
                  <span>Actions utilisateurs</span>
                  <span>65%</span>
                </div>
                <div className="progress mb-3" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: "65%" }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <span>Actions système</span>
                  <span>20%</span>
                </div>
                <div className="progress mb-3" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="col-lg-9 col-xl-10">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              {/* En-tête du tableau */}
              <div className="p-4 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold mb-0">Journal des activités</h4>
                    <p className="text-muted mb-0 small">
                      Affichage des actions{" "}
                      {filters
                        .find((f) => f.id === selectedFilter)
                        ?.label.toLowerCase()}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: "250px" }}>
                      <span className="input-group-text bg-light">
                        <i className="fa-solid fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher..."
                        disabled
                      />
                    </div>
                    <button className="btn btn-outline-secondary" disabled>
                      <i className="fa-solid fa-sync"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tableau d'actions (placeholder) */}
              <div className="p-4">
                <div className="alert alert-warning mb-4">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-triangle-exclamation fa-xl me-3 text-warning"></i>
                    <div>
                      <h6 className="fw-bold mb-1">Données de démonstration</h6>
                      <p className="mb-0 small">
                        Les données ci-dessous sont des exemples statiques.
                        L&apos;intégration avec le système de journalisation
                        réelle est en cours de développement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions d'exemple */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}></th>
                        <th>Action</th>
                        <th>Utilisateur</th>
                        <th>Date/Heure</th>
                        <th>Statut</th>
                        <th style={{ width: "100px" }}>Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleActions.map((action) => (
                        <tr key={action.id} className="opacity-75">
                          <td className="text-center">
                            {getActionIcon(action.type)}
                          </td>
                          <td>
                            <div className="fw-semibold">{action.action}</div>
                            <small className="text-muted">
                              {action.type === "user" && "Action utilisateur"}
                              {action.type === "system" && "Action système"}
                              {action.type === "security" &&
                                "Action de sécurité"}
                              {action.type === "data" &&
                                "Manipulation de données"}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-light rounded-circle p-1 me-2">
                                <i className="fa-solid fa-user text-muted"></i>
                              </div>
                              <span>{action.user}</span>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted">{action.time}</div>
                          </td>
                          <td>{getStatusBadge(action.status)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Bientôt disponible"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination placeholder */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Affichage de 5 actions sur 1,247 totales
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className="page-item disabled">
                        <button className="page-link">
                          <i className="fa-solid fa-chevron-left"></i>
                        </button>
                      </li>
                      <li className="page-item active">
                        <button className="page-link">1</button>
                      </li>
                      <li className="page-item disabled">
                        <button className="page-link">2</button>
                      </li>
                      <li className="page-item disabled">
                        <button className="page-link">3</button>
                      </li>
                      <li className="page-item disabled">
                        <button className="page-link">
                          <i className="fa-solid fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>

              {/* Fonctionnalités à venir */}
              <div className="p-4 border-top">
                <h5 className="fw-bold mb-3">
                  <i className="fa-solid fa-rocket me-2 text-success"></i>
                  Fonctionnalités en développement
                </h5>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fa-solid fa-chart-line text-info"></i>
                          </div>
                          <h6 className="card-title fw-bold mb-0">
                            Analytique temps réel
                          </h6>
                        </div>
                        <p className="card-text small text-muted">
                          Visualisation en temps réel des activités et tendances
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fa-solid fa-bell text-warning"></i>
                          </div>
                          <h6 className="card-title fw-bold mb-0">
                            Alertes intelligentes
                          </h6>
                        </div>
                        <p className="card-text small text-muted">
                          Notifications pour activités suspectes ou critiques
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fa-solid fa-file-export text-success"></i>
                          </div>
                          <h6 className="card-title fw-bold mb-0">
                            Export avancé
                          </h6>
                        </div>
                        <p className="card-text small text-muted">
                          Export PDF, Excel et JSON avec filtres personnalisés
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de page */}
            <div className="card-footer bg-light py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <button
                    onClick={() => router.push("/dashboard-admin")}
                    className="btn btn-outline-primary"
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Retour au tableau de bord
                  </button>
                </div>
                <div className="text-muted small">
                  <i className="fa-solid fa-calendar me-1"></i>
                  Mise en production prévue : <strong>Avril 2024</strong>
                </div>
                <div>
                  <button className="btn btn-success" disabled>
                    <i className="fa-solid fa-play me-2"></i>
                    Activer le suivi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles supplémentaires */}
      <style jsx>{`
        .opacity-75 {
          opacity: 0.75;
          transition: opacity 0.3s ease;
        }

        .opacity-75:hover {
          opacity: 1;
          background-color: rgba(var(--bs-primary-rgb), 0.05);
        }

        .list-group-item.active {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .list-group-item:not(.active):hover {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
        }

        .table th {
          font-weight: 600;
          color: #495057;
          border-bottom-width: 2px;
        }

        .pagination .page-item.active .page-link {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .card {
          transition: transform 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
