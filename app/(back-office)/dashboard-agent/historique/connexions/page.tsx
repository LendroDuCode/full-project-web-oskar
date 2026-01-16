"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoriquesConnexions() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("list");
  const [timeFilter, setTimeFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");

  const views = [
    { id: "list", label: "Liste", icon: "list" },
    { id: "grid", label: "Grille", icon: "grid" },
    { id: "timeline", label: "Chronologie", icon: "timeline" },
    { id: "map", label: "Carte", icon: "map" },
  ];

  const timeFilters = [
    { id: "today", label: "Aujourd'hui" },
    { id: "yesterday", label: "Hier" },
    { id: "week", label: "7 derniers jours" },
    { id: "month", label: "30 derniers jours" },
    { id: "custom", label: "Personnalisé" },
  ];

  const statusFilters = [
    { id: "all", label: "Tous", color: "secondary" },
    { id: "success", label: "Réussies", color: "success" },
    { id: "failed", label: "Échouées", color: "danger" },
    { id: "locked", label: "Bloquées", color: "warning" },
    { id: "suspicious", label: "Suspectes", color: "danger" },
  ];

  const sampleConnections = [
    {
      id: 1,
      user: "admin@system.com",
      ip: "192.168.1.100",
      location: "Abidjan, CI",
      device: "Chrome - Windows",
      time: "10:30:45",
      status: "success",
      duration: "2h 15m",
    },
    {
      id: 2,
      user: "user1@company.com",
      ip: "41.207.45.123",
      location: "Lagos, NG",
      device: "Firefox - macOS",
      time: "09:15:22",
      status: "success",
      duration: "45m",
    },
    {
      id: 3,
      user: "guest@external.com",
      ip: "87.98.234.56",
      location: "Paris, FR",
      device: "Mobile - Android",
      time: "08:45:10",
      status: "failed",
      duration: "-",
    },
    {
      id: 4,
      user: "admin@system.com",
      ip: "192.168.1.105",
      location: "Abidjan, CI",
      device: "Safari - iOS",
      time: "23:30:15",
      status: "success",
      duration: "30m",
    },
    {
      id: 5,
      user: "hacker@unknown.com",
      ip: "185.162.234.89",
      location: "Moscou, RU",
      device: "Tor Browser",
      time: "03:15:05",
      status: "suspicious",
      duration: "1m",
    },
    {
      id: 6,
      user: "manager@company.com",
      ip: "41.207.45.124",
      location: "Lagos, NG",
      device: "Edge - Windows",
      time: "14:20:33",
      status: "locked",
      duration: "-",
    },
    {
      id: 7,
      user: "support@system.com",
      ip: "192.168.1.110",
      location: "Abidjan, CI",
      device: "Chrome - Windows",
      time: "16:45:18",
      status: "success",
      duration: "3h 10m",
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { color: string; icon: string; label: string }
    > = {
      success: { color: "success", icon: "check-circle", label: "Réussie" },
      failed: { color: "danger", icon: "times-circle", label: "Échouée" },
      locked: { color: "warning", icon: "lock", label: "Bloquée" },
      suspicious: {
        color: "danger",
        icon: "exclamation-triangle",
        label: "Suspecte",
      },
    };

    const cfg = config[status] || {
      color: "secondary",
      icon: "circle",
      label: status,
    };

    return (
      <span
        className={`badge bg-${cfg.color} text-white d-flex align-items-center gap-1 px-3 py-2`}
      >
        <i className={`fa-solid fa-${cfg.icon} me-1`}></i>
        {cfg.label}
      </span>
    );
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes("Chrome")) return "fa-chrome text-danger";
    if (device.includes("Firefox")) return "fa-firefox text-orange";
    if (device.includes("Safari")) return "fa-safari text-primary";
    if (device.includes("Edge")) return "fa-edge text-primary";
    if (device.includes("Mobile")) return "fa-mobile text-info";
    if (device.includes("Tor")) return "fa-user-secret text-dark";
    return "fa-desktop text-secondary";
  };

  const getLocationFlag = (location: string) => {
    const flags: Record<string, string> = {
      "Abidjan, CI": "🇨🇮",
      "Lagos, NG": "🇳🇬",
      "Paris, FR": "🇫🇷",
      "Moscou, RU": "🇷🇺",
    };
    return flags[location] || "🌍";
  };

  const stats = {
    total: 2478,
    today: 42,
    failed: 156,
    suspicious: 23,
    avgDuration: "1h 25m",
  };

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec statistiques */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                <i className="fa-solid fa-sign-in-alt me-3 text-primary"></i>
                Historique des Connexions
              </h1>
              <p className="text-muted mb-0">
                Suivi et analyse des activités de connexion au système
              </p>
            </div>
            <div className="d-flex gap-3">
              <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                <i className="fa-solid fa-code me-2"></i>
                EN DÉVELOPPEMENT
              </span>
              <button
                onClick={() => router.push("/dashboard-admin")}
                className="btn btn-outline-primary"
              >
                <i className="fa-solid fa-arrow-left me-2"></i>
                Retour
              </button>
            </div>
          </div>

          {/* Cartes statistiques */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 bg-primary bg-gradient text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Connexions totales
                      </h6>
                      <h3 className="fw-bold">
                        {stats.total.toLocaleString()}
                      </h3>
                    </div>
                    <i className="fa-solid fa-chart-line fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-success bg-gradient text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Aujourd&apos;hui
                      </h6>
                      <h3 className="fw-bold">{stats.today}</h3>
                    </div>
                    <i className="fa-solid fa-calendar-day fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-danger bg-gradient text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">Échecs</h6>
                      <h3 className="fw-bold">{stats.failed}</h3>
                    </div>
                    <i className="fa-solid fa-times-circle fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card border-0 bg-warning bg-gradient text-dark shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Durée moyenne
                      </h6>
                      <h3 className="fw-bold">{stats.avgDuration}</h3>
                    </div>
                    <i className="fa-solid fa-clock fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière d'information */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-warning border-warning border-start border-5">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-shield-alt fa-2x me-3 text-warning"></i>
              </div>
              <div className="flex-grow-1">
                <h4 className="alert-heading fw-bold mb-2">
                  Module de sécurité en construction
                </h4>
                <p className="mb-2">
                  Ce module de journalisation des connexions est en cours de
                  développement. Il permettra une surveillance complète de la
                  sécurité et la détection d&apos;activités suspectes en temps
                  réel.
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="progress flex-grow-1 me-3"
                    style={{ height: "10px" }}
                  >
                    <div
                      className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <span className="fw-semibold">85% complété</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Barre de contrôle */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex flex-wrap gap-3">
                  {/* Filtres de temps */}
                  <div className="btn-group">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className={`btn btn-outline-secondary ${timeFilter === filter.id ? "active" : ""}`}
                        onClick={() => setTimeFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Filtres de statut */}
                  <div className="btn-group">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.id}
                        className={`btn btn-outline-${filter.color} ${statusFilter === filter.id ? "active" : ""}`}
                        onClick={() => setStatusFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  {/* Vue */}
                  <div className="btn-group">
                    {views.map((view) => (
                      <button
                        key={view.id}
                        className={`btn btn-outline-primary ${activeView === view.id ? "active" : ""}`}
                        onClick={() => setActiveView(view.id)}
                        title={view.label}
                      >
                        <i className={`fa-solid fa-${view.icon}`}></i>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" disabled>
                      <i className="fa-solid fa-download me-2"></i>
                      Exporter
                    </button>
                    <button className="btn btn-outline-danger" disabled>
                      <i className="fa-solid fa-trash me-2"></i>
                      Purger
                    </button>
                    <button className="btn btn-primary" disabled>
                      <i className="fa-solid fa-filter me-2"></i>
                      Filtrer avancé
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {/* En-tête du tableau */}
              <div className="p-4 border-bottom bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold mb-0">Journal des connexions</h4>
                    <p className="text-muted mb-0 small">
                      Affichage des connexions{" "}
                      {timeFilters
                        .find((f) => f.id === timeFilter)
                        ?.label.toLowerCase()}
                      {statusFilter !== "all"
                        ? ` - Statut: ${statusFilters.find((f) => f.id === statusFilter)?.label}`
                        : ""}
                    </p>
                  </div>
                  <div className="input-group" style={{ width: "300px" }}>
                    <span className="input-group-text bg-white">
                      <i className="fa-solid fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par utilisateur, IP..."
                      disabled
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      disabled
                    >
                      <i className="fa-solid fa-sliders"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tableau */}
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: "30px" }}></th>
                      <th>Utilisateur</th>
                      <th>Adresse IP</th>
                      <th>Localisation</th>
                      <th>Appareil/Navigateur</th>
                      <th>Heure</th>
                      <th>Durée</th>
                      <th>Statut</th>
                      <th style={{ width: "80px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleConnections.map((conn) => (
                      <tr key={conn.id} className="align-middle opacity-75">
                        <td>
                          <div className="text-center">
                            <i
                              className={`fa-solid fa-sign-in-alt text-muted`}
                            ></i>
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold">{conn.user}</div>
                        </td>
                        <td>
                          <code className="bg-light p-1 rounded">
                            {conn.ip}
                          </code>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">
                              {getLocationFlag(conn.location)}
                            </span>
                            <span>{conn.location}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i
                              className={`fa-brands ${getDeviceIcon(conn.device)} fa-lg`}
                            ></i>
                            <span className="small">{conn.device}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-muted small">{conn.time}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{conn.duration}</div>
                        </td>
                        <td>{getStatusBadge(conn.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Bientôt disponible"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled
                              title="Bientôt disponible"
                            >
                              <i className="fa-solid fa-ban"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Message données démo */}
              <div className="p-4 border-top">
                <div className="alert alert-info">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-info-circle fa-lg me-3"></i>
                    <div>
                      <h6 className="alert-heading mb-1">
                        Données de démonstration
                      </h6>
                      <p className="mb-0 small">
                        Les connexions affichées sont des exemples statiques.
                        L&apos;intégration avec le système
                        d&apos;authentification réel est en cours de
                        développement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de page */}
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  <i className="fa-solid fa-database me-1"></i>
                  Affichage de {sampleConnections.length} connexions sur{" "}
                  {stats.total.toLocaleString()}
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

                <div className="text-muted small">
                  <i className="fa-solid fa-calendar me-1"></i>
                  Version finale : <strong>Mai 2024</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités à venir */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="fw-bold mb-0">
                <i className="fa-solid fa-rocket me-2"></i>
                Fonctionnalités de sécurité en développement
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                      <i className="fa-solid fa-robot fa-2x text-primary"></i>
                    </div>
                    <h6 className="fw-bold mb-2">Détection d&apos;intrusion</h6>
                    <p className="text-muted small">
                      IA pour détecter les comportements suspects
                    </p>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                      <i className="fa-solid fa-map-marked-alt fa-2x text-success"></i>
                    </div>
                    <h6 className="fw-bold mb-2">Géolocalisation</h6>
                    <p className="text-muted small">
                      Cartographie des connexions en temps réel
                    </p>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                      <i className="fa-solid fa-bell fa-2x text-warning"></i>
                    </div>
                    <h6 className="fw-bold mb-2">Alertes temps réel</h6>
                    <p className="text-muted small">
                      Notifications pour activités anormales
                    </p>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="text-center p-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                      <i className="fa-solid fa-shield-virus fa-2x text-danger"></i>
                    </div>
                    <h6 className="fw-bold mb-2">Protection avancée</h6>
                    <p className="text-muted small">
                      Blocage automatique des IP malveillantes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .opacity-75 {
          opacity: 0.75;
          transition: all 0.3s ease;
        }

        .opacity-75:hover {
          opacity: 1;
          background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
        }

        .bg-orange {
          background-color: #ff9500;
          color: white;
        }

        .btn-group .btn.active {
          background-color: var(--bs-primary);
          color: white;
          border-color: var(--bs-primary);
        }

        .table th {
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        .card {
          transition: transform 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .bg-gradient {
          background: linear-gradient(
            135deg,
            var(--bs-primary) 0%,
            var(--bs-primary-dark) 100%
          );
        }

        .bg-success.bg-gradient {
          background: linear-gradient(
            135deg,
            var(--bs-success) 0%,
            #198754 100%
          );
        }

        .bg-danger.bg-gradient {
          background: linear-gradient(
            135deg,
            var(--bs-danger) 0%,
            #dc3545 100%
          );
        }

        .bg-warning.bg-gradient {
          background: linear-gradient(
            135deg,
            var(--bs-warning) 0%,
            #ffc107 100%
          );
        }
      `}</style>
    </div>
  );
}
