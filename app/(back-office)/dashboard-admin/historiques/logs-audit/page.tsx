// app/(back-office)/dashboard-admin/logs-audit/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoriquesErreurs() {
  const router = useRouter();
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [expandedError, setExpandedError] = useState<number | null>(null);

  const severityLevels = [
    { id: "all", label: "Toutes", color: "secondary", icon: "layer-group" },
    { id: "critical", label: "Critique", color: "danger", icon: "fire" },
    {
      id: "error",
      label: "Erreur",
      color: "danger",
      icon: "exclamation-circle",
    },
    {
      id: "warning",
      label: "Avertissement",
      color: "warning",
      icon: "exclamation-triangle",
    },
    { id: "info", label: "Information", color: "info", icon: "info-circle" },
    { id: "debug", label: "Debug", color: "secondary", icon: "bug" },
  ];

  const modules = [
    { id: "all", label: "Tous les modules" },
    { id: "auth", label: "Authentification", icon: "lock" },
    { id: "database", label: "Base de données", icon: "database" },
    { id: "api", label: "API", icon: "server" },
    { id: "frontend", label: "Interface", icon: "desktop" },
    { id: "payment", label: "Paiement", icon: "credit-card" },
    { id: "email", label: "Email", icon: "envelope" },
    { id: "cron", label: "Tâches planifiées", icon: "clock" },
  ];

  const timeRanges = [
    { id: "1h", label: "1 heure" },
    { id: "24h", label: "24 heures" },
    { id: "7d", label: "7 jours" },
    { id: "30d", label: "30 jours" },
    { id: "custom", label: "Personnalisé" },
  ];

  const sampleErrors = [
    {
      id: 1,
      timestamp: "2024-03-25 14:32:15",
      severity: "critical",
      module: "database",
      code: "DB_CONN_001",
      message: "Échec de connexion à la base de données principale",
      user: "admin@system.com",
      ip: "192.168.1.100",
      stackTrace:
        "Error: connect ECONNREFUSED 127.0.0.1:5432\n    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)",
      occurrences: 3,
      resolved: false,
    },
    {
      id: 2,
      timestamp: "2024-03-25 13:15:42",
      severity: "error",
      module: "api",
      code: "API_VAL_422",
      message: "Validation échouée pour l'endpoint /users/create",
      user: "user@client.com",
      ip: "41.207.45.123",
      stackTrace:
        "ValidationError: Email invalide\n    at validateEmail (validator.js:45:12)",
      occurrences: 1,
      resolved: true,
    },
    {
      id: 3,
      timestamp: "2024-03-25 10:05:18",
      severity: "warning",
      module: "payment",
      code: "PAY_TIMEOUT",
      message: "Timeout lors du traitement du paiement",
      user: "customer@shop.com",
      ip: "87.98.234.56",
      stackTrace: "TimeoutError: Payment gateway timeout after 30000ms",
      occurrences: 5,
      resolved: false,
    },
    {
      id: 4,
      timestamp: "2024-03-24 22:45:33",
      severity: "info",
      module: "auth",
      code: "AUTH_RETRY",
      message: "Tentative de connexion échouée - nouvelle tentative",
      user: "unknown",
      ip: "185.162.234.89",
      stackTrace:
        "AuthError: Invalid credentials\n    at authenticate (auth.js:78:21)",
      occurrences: 1,
      resolved: true,
    },
    {
      id: 5,
      timestamp: "2024-03-24 18:20:11",
      severity: "debug",
      module: "cron",
      code: "CRON_DEBUG",
      message: "Tâche cron exécutée avec des paramètres par défaut",
      user: "system",
      ip: "127.0.0.1",
      stackTrace: "Debug: Using default parameters for cleanup job",
      occurrences: 1,
      resolved: true,
    },
  ];

  const errorStats = {
    total: 1247,
    critical: 23,
    errors: 156,
    warnings: 345,
    unresolved: 42,
    avgResolution: "2h 15m",
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find((l) => l.id === severity);
    if (!level) return null;

    return (
      <span
        className={`badge bg-${level.color} text-white d-flex align-items-center gap-1 px-3 py-2`}
      >
        <i className={`fa-solid fa-${level.icon} me-1`}></i>
        {level.label}
      </span>
    );
  };

  const getModuleIcon = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    return module?.icon || "cube";
  };

  const getErrorColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "danger",
      error: "danger",
      warning: "warning",
      info: "info",
      debug: "secondary",
    };
    return colors[severity] || "secondary";
  };

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                <i className="fa-solid fa-exclamation-triangle me-3 text-danger"></i>
                Historique des Erreurs
              </h1>
              <p className="text-muted mb-0">
                Surveillance et diagnostic des erreurs système en temps réel
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

          {/* Statistiques */}
          <div className="row g-3 mb-4">
            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-dark text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Total erreurs
                      </h6>
                      <h3 className="fw-bold">
                        {errorStats.total.toLocaleString()}
                      </h3>
                    </div>
                    <i className="fa-solid fa-bug fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-danger text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Critiques
                      </h6>
                      <h3 className="fw-bold">{errorStats.critical}</h3>
                    </div>
                    <i className="fa-solid fa-fire fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-warning text-dark shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Non résolues
                      </h6>
                      <h3 className="fw-bold">{errorStats.unresolved}</h3>
                    </div>
                    <i className="fa-solid fa-clock fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-info text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Avertissements
                      </h6>
                      <h3 className="fw-bold">{errorStats.warnings}</h3>
                    </div>
                    <i className="fa-solid fa-triangle-exclamation fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-secondary text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">Erreurs</h6>
                      <h3 className="fw-bold">{errorStats.errors}</h3>
                    </div>
                    <i className="fa-solid fa-xmark-circle fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4">
              <div className="card border-0 bg-success text-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 opacity-75">
                        Temps moyen
                      </h6>
                      <h3 className="fw-bold">{errorStats.avgResolution}</h3>
                    </div>
                    <i className="fa-solid fa-gauge-high fa-2x opacity-50"></i>
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
          <div className="alert alert-danger border-danger border-start border-5">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-heart-pulse fa-2x me-3 text-danger"></i>
              </div>
              <div className="flex-grow-1">
                <h4 className="alert-heading fw-bold mb-2">
                  Système de monitoring en construction
                </h4>
                <p className="mb-2">
                  Ce module de surveillance des erreurs est en cours de
                  développement. Il permettra une analyse approfondie des
                  problèmes système et une résolution rapide des incidents.
                </p>
                <div className="d-flex align-items-center">
                  <div
                    className="progress flex-grow-1 me-3"
                    style={{ height: "10px" }}
                  >
                    <div
                      className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <span className="fw-semibold">70% complété</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Filtres latéraux */}
        <div className="col-lg-3 col-xl-2 mb-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="fw-bold mb-0">
                <i className="fa-solid fa-filter me-2"></i>
                Filtres
              </h5>
            </div>
            <div className="card-body">
              {/* Gravité */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Niveau de gravité</h6>
                <div className="list-group list-group-flush">
                  {severityLevels.map((level) => (
                    <button
                      key={level.id}
                      className={`list-group-item list-group-item-action border-0 py-2 px-0 d-flex align-items-center ${selectedSeverity === level.id ? "active" : ""}`}
                      onClick={() => setSelectedSeverity(level.id)}
                    >
                      <span
                        className={`badge bg-${level.color} me-3`}
                        style={{ width: "10px", height: "10px" }}
                      ></span>
                      <span
                        className={
                          selectedSeverity === level.id
                            ? "text-white fw-semibold"
                            : ""
                        }
                      >
                        {level.label}
                      </span>
                      {selectedSeverity === level.id && (
                        <i className="fa-solid fa-check ms-auto text-white"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Module</h6>
                <div className="list-group list-group-flush">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      className={`list-group-item list-group-item-action border-0 py-2 px-0 ${selectedModule === module.id ? "active" : ""}`}
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <i
                        className={`fa-solid fa-${module.icon || "cube"} me-2 ${selectedModule === module.id ? "text-white" : "text-muted"}`}
                      ></i>
                      <span
                        className={
                          selectedModule === module.id
                            ? "text-white fw-semibold"
                            : ""
                        }
                      >
                        {module.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Période */}
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="mb-3">
                <h6 className="fw-bold mb-3">Actions</h6>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-danger btn-sm" disabled>
                    <i className="fa-solid fa-trash me-2"></i>
                    Purger anciennes
                  </button>
                  <button className="btn btn-outline-success btn-sm" disabled>
                    <i className="fa-solid fa-check-double me-2"></i>
                    Tout résoudre
                  </button>
                  <button className="btn btn-outline-primary btn-sm" disabled>
                    <i className="fa-solid fa-download me-2"></i>
                    Exporter log
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de gravité */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Répartition par gravité</h6>
              <div className="text-center">
                <div className="position-relative d-inline-block mb-3">
                  <i className="fa-solid fa-chart-pie fa-3x text-muted"></i>
                </div>
              </div>
              <div className="small">
                {severityLevels.slice(1).map((level) => (
                  <div
                    key={level.id}
                    className="d-flex justify-content-between mb-2"
                  >
                    <span>
                      <span
                        className={`badge bg-${level.color} me-2`}
                        style={{ width: "8px", height: "8px" }}
                      ></span>
                      {level.label}
                    </span>
                    <span className="fw-semibold">
                      {level.id === "critical"
                        ? "2%"
                        : level.id === "error"
                          ? "13%"
                          : level.id === "warning"
                            ? "28%"
                            : level.id === "info"
                              ? "45%"
                              : "12%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="col-lg-9 col-xl-10">
          <div className="card border-0 shadow-sm h-100">
            {/* En-tête */}
            <div className="card-header bg-light border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-0">Journal des erreurs</h4>
                  <p className="text-muted mb-0 small">
                    Surveillance en temps réel des incidents système
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <div className="input-group" style={{ width: "250px" }}>
                    <span className="input-group-text bg-white">
                      <i className="fa-solid fa-magnifying-glass text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher erreur..."
                      disabled
                    />
                  </div>
                  <button className="btn btn-outline-secondary" disabled>
                    <i className="fa-solid fa-rotate"></i>
                  </button>
                  <button className="btn btn-danger" disabled>
                    <i className="fa-solid fa-bell me-2"></i>
                    Alertes actives
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des erreurs */}
            <div className="card-body p-0">
              <div className="alert alert-warning m-4">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-vial fa-xl me-3 text-warning"></i>
                  <div>
                    <h6 className="alert-heading fw-bold mb-1">
                      Données de test
                    </h6>
                    <p className="mb-0 small">
                      Les erreurs affichées sont des exemples statiques pour
                      démonstration. L&apos;intégration avec les logs système
                      réels est en cours.
                    </p>
                  </div>
                </div>
              </div>

              {sampleErrors.map((error) => (
                <div
                  key={error.id}
                  className={`border-bottom p-4 ${expandedError === error.id ? "bg-light" : ""}`}
                  onClick={() =>
                    setExpandedError(
                      expandedError === error.id ? null : error.id,
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-3">
                      {getSeverityBadge(error.severity)}
                      <div>
                        <h6 className="fw-bold mb-0">{error.code}</h6>
                        <small className="text-muted">
                          <i
                            className={`fa-solid fa-${getModuleIcon(error.module)} me-1`}
                          ></i>
                          {modules.find((m) => m.id === error.module)?.label}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">
                        <i className="fa-solid fa-clock me-1"></i>
                        {error.timestamp}
                      </span>
                      {error.resolved ? (
                        <span className="badge bg-success">
                          <i className="fa-solid fa-check me-1"></i>
                          Résolue
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <i className="fa-solid fa-exclamation me-1"></i>
                          Non résolue
                        </span>
                      )}
                      <i
                        className={`fa-solid fa-chevron-${expandedError === error.id ? "up" : "down"} text-muted`}
                      ></i>
                    </div>
                  </div>

                  <p className="mb-3">{error.message}</p>

                  <div className="d-flex gap-4 small text-muted mb-3">
                    <div>
                      <i className="fa-solid fa-user me-1"></i>
                      {error.user}
                    </div>
                    <div>
                      <i className="fa-solid fa-network-wired me-1"></i>
                      {error.ip}
                    </div>
                    <div>
                      <i className="fa-solid fa-repeat me-1"></i>
                      {error.occurrences} occurrence
                      {error.occurrences > 1 ? "s" : ""}
                    </div>
                  </div>

                  {expandedError === error.id && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="fw-bold mb-2">
                        <i className="fa-solid fa-code me-2"></i>
                        Stack Trace
                      </h6>
                      <pre
                        className="bg-dark text-light p-3 rounded small mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        {error.stackTrace}
                      </pre>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled
                        >
                          <i className="fa-solid fa-copy me-1"></i>
                          Copier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled
                        >
                          <i className="fa-solid fa-check me-1"></i>
                          Marquer résolu
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled
                        >
                          <i className="fa-solid fa-ban me-1"></i>
                          Ignorer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pied de page */}
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  <i className="fa-solid fa-circle-info me-1"></i>
                  Affichage des 5 dernières erreurs sur {errorStats.total}
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
                  Disponibilité : <strong>Juin 2024</strong>
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
                <i className="fa-solid fa-tools me-2"></i>
                Outils de diagnostic en développement
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-chart-line fa-2x text-danger"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Analytics temps réel</h6>
                          <p className="text-muted small mb-0">
                            Suivi en direct des incidents
                          </p>
                        </div>
                      </div>
                      <ul className="small text-muted mb-0">
                        <li>Dashboard interactif</li>
                        <li>Tendances et patterns</li>
                        <li>Alertes prédictives</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-robot fa-2x text-warning"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">IA de résolution</h6>
                          <p className="text-muted small mb-0">
                            Solutions automatiques
                          </p>
                        </div>
                      </div>
                      <ul className="small text-muted mb-0">
                        <li>Analyse automatique</li>
                        <li>Suggestions de correctifs</li>
                        <li>Auto-réparation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="fa-solid fa-bell fa-2x text-success"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">
                            Notifications intelligentes
                          </h6>
                          <p className="text-muted small mb-0">
                            Alertes contextuelles
                          </p>
                        </div>
                      </div>
                      <ul className="small text-muted mb-0">
                        <li>Escalation automatique</li>
                        <li>Intégration Slack/Teams</li>
                        <li>Rapports quotidiens</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .list-group-item.active {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .list-group-item:not(.active):hover {
          background-color: rgba(var(--bs-primary-rgb), 0.1);
        }

        pre {
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .border-bottom:hover {
          background-color: rgba(var(--bs-primary-rgb), 0.05);
          transition: background-color 0.2s ease;
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
      `}</style>
    </div>
  );
}
