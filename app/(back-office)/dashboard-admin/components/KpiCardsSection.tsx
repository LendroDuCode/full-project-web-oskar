"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserTie,
  faStore,
  faHeart,
  faChartLine,
  faShieldHalved,
  faArrowUp,
  faArrowDown,
  faExclamationTriangle,
  faCheckCircle,
  faBan,
  faTrash,
  faUser,
  faRefresh,
  faSpinner,
  faUserCheck,
  faUserXmark,
  faUserSlash,
  faChartSimple,
  faMoneyBillWave,
  faBell,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

interface KpiCardProps {
  id: string;
  title: string;
  value: string;
  unit?: string;
  description?: string;
  icon: any;
  iconBgColor: string;
  iconColor: string;
  trend: string;
  trendColor: string;
  trendBgColor: string;
  stats?: Array<{ label: string; value: string; color: string }>;
  valueColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

interface ApiStats {
  pagination?: {
    total: number;
  };
  data?: any[];
}

export default function KpiCardsSection() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    utilisateurs: {
      total: 0,
      actifs: 0,
      bloques: 0,
      supprimes: 0,
      loading: true,
    },
    agents: {
      total: 0,
      actifs: 0,
      bloques: 0,
      supprimes: 0,
      loading: true,
    },
    vendeurs: {
      total: 0,
      actifs: 0,
      bloques: 0,
      supprimes: 0,
      loading: true,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Fonction pour récupérer le total depuis n'importe quel endpoint
  const fetchTotalCount = async (endpoint: string) => {
    try {
      const response = await api.get(`${endpoint}?limit=1`);

      // Différents formats de réponse possibles
      if (response?.pagination?.total !== undefined) {
        return response.pagination.total;
      } else if (Array.isArray(response)) {
        return response.length;
      } else if (response?.data?.length !== undefined) {
        return response.data.length;
      } else if (typeof response === "object" && response !== null) {
        // Essayer de trouver un champ de total
        const possibleTotalFields = ["total", "count", "size", "length"];
        for (const field of possibleTotalFields) {
          if (response[field] !== undefined) {
            return parseInt(response[field]);
          }
        }
      }

      return 0;
    } catch (err) {
      console.error(`Erreur lors de la récupération de ${endpoint}:`, err);
      return 0;
    }
  };

  // Fonction pour analyser les données utilisateurs actifs
  const analyzeActiveData = async (
    endpoint: string,
    blockedEndpoint: string,
    deletedEndpoint: string,
  ) => {
    try {
      // Récupérer tous les comptes (actifs, bloqués, supprimés)
      const [allResponse, blockedResponse, deletedResponse] = await Promise.all(
        [
          api.get(`${endpoint}?limit=1000`),
          api.get(`${blockedEndpoint}?limit=1000`),
          api.get(`${deletedEndpoint}?limit=1000`),
        ],
      );

      // Extraire les données selon le format
      const extractData = (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.data) return response.data;
        if (response?.pagination?.data) return response.pagination.data;
        return [];
      };

      const allData = extractData(allResponse);
      const blockedData = extractData(blockedResponse);
      const deletedData = extractData(deletedResponse);

      const total = allData.length || 0;
      const bloques = blockedData.length || 0;
      const supprimes = deletedData.length || 0;

      // Calculer les actifs (total - bloqués - supprimés)
      const actifs = Math.max(0, total - bloques - supprimes);

      return { total, actifs, bloques, supprimes };
    } catch (err) {
      console.error("Erreur lors de l'analyse des données actives:", err);

      // Fallback: récupérer uniquement les totaux
      const [total, bloques, supprimes] = await Promise.all([
        fetchTotalCount(endpoint),
        fetchTotalCount(blockedEndpoint),
        fetchTotalCount(deletedEndpoint),
      ]);

      const actifs = Math.max(0, total - bloques - supprimes);
      return { total, actifs, bloques, supprimes };
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Analyser les données pour chaque catégorie
      const [usersStats, agentsStats, vendeursStats] = await Promise.all([
        analyzeActiveData(
          API_ENDPOINTS.ADMIN.USERS.LIST,
          API_ENDPOINTS.ADMIN.USERS.BLOCKED,
          API_ENDPOINTS.ADMIN.USERS.DELETED,
        ),
        analyzeActiveData(
          API_ENDPOINTS.ADMIN.AGENTS.LIST,
          API_ENDPOINTS.ADMIN.AGENTS.BLOCKED,
          API_ENDPOINTS.ADMIN.AGENTS.DELETED,
        ),
        analyzeActiveData(
          API_ENDPOINTS.ADMIN.VENDEURS.LIST,
          API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED,
          API_ENDPOINTS.ADMIN.VENDEURS.DELETED,
        ),
      ]);

      setStats({
        utilisateurs: {
          ...usersStats,
          loading: false,
        },
        agents: {
          ...agentsStats,
          loading: false,
        },
        vendeurs: {
          ...vendeursStats,
          loading: false,
        },
      });

      setLastUpdated(new Date().toLocaleTimeString("fr-FR"));
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError(err.message || "Erreur lors du chargement des données");

      // Fallback: essayer de récupérer au moins les totaux
      try {
        const [usersTotal, usersBloques, usersSupprimes] = await Promise.all([
          fetchTotalCount(API_ENDPOINTS.ADMIN.USERS.LIST),
          fetchTotalCount(API_ENDPOINTS.ADMIN.USERS.BLOCKED),
          fetchTotalCount(API_ENDPOINTS.ADMIN.USERS.DELETED),
        ]);

        const [agentsTotal, agentsBloques, agentsSupprimes] = await Promise.all(
          [
            fetchTotalCount(API_ENDPOINTS.ADMIN.AGENTS.LIST),
            fetchTotalCount(API_ENDPOINTS.ADMIN.AGENTS.BLOCKED),
            fetchTotalCount(API_ENDPOINTS.ADMIN.AGENTS.DELETED),
          ],
        );

        const [vendeursTotal, vendeursBloques, vendeursSupprimes] =
          await Promise.all([
            fetchTotalCount(API_ENDPOINTS.ADMIN.VENDEURS.LIST),
            fetchTotalCount(API_ENDPOINTS.ADMIN.VENDEURS.BLOCKED),
            fetchTotalCount(API_ENDPOINTS.ADMIN.VENDEURS.DELETED),
          ]);

        setStats({
          utilisateurs: {
            total: usersTotal,
            actifs: Math.max(0, usersTotal - usersBloques - usersSupprimes),
            bloques: usersBloques,
            supprimes: usersSupprimes,
            loading: false,
          },
          agents: {
            total: agentsTotal,
            actifs: Math.max(0, agentsTotal - agentsBloques - agentsSupprimes),
            bloques: agentsBloques,
            supprimes: agentsSupprimes,
            loading: false,
          },
          vendeurs: {
            total: vendeursTotal,
            actifs: Math.max(
              0,
              vendeursTotal - vendeursBloques - vendeursSupprimes,
            ),
            bloques: vendeursBloques,
            supprimes: vendeursSupprimes,
            loading: false,
          },
        });
      } catch (fallbackErr) {
        console.error("Erreur même dans le fallback:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Rafraîchir toutes les 2 minutes
    const interval = setInterval(fetchStats, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTrend = (actifs: number, total: number) => {
    if (total === 0)
      return {
        value: "0%",
        color: "text-secondary",
        bgColor: "bg-secondary-subtle",
        icon: faMinus,
      };

    const percentage = Math.round((actifs / total) * 100);
    if (percentage >= 85) {
      return {
        value: `${percentage}%`,
        color: "text-success",
        bgColor: "bg-success-subtle",
        icon: faArrowUp,
      };
    } else if (percentage >= 70) {
      return {
        value: `${percentage}%`,
        color: "text-warning",
        bgColor: "bg-warning-subtle",
        icon: faArrowUp,
      };
    } else if (percentage >= 50) {
      return {
        value: `${percentage}%`,
        color: "text-warning",
        bgColor: "bg-warning-subtle",
        icon: faArrowDown,
      };
    } else {
      return {
        value: `${percentage}%`,
        color: "text-danger",
        bgColor: "bg-danger-subtle",
        icon: faArrowDown,
      };
    }
  };

  const utilisateursTrend = calculateTrend(
    stats.utilisateurs.actifs,
    stats.utilisateurs.total,
  );
  const agentsTrend = calculateTrend(stats.agents.actifs, stats.agents.total);
  const vendeursTrend = calculateTrend(
    stats.vendeurs.actifs,
    stats.vendeurs.total,
  );

  // Calculer les totaux généraux
  const totalUtilisateurs =
    stats.utilisateurs.total + stats.agents.total + stats.vendeurs.total;
  const totalActifs =
    stats.utilisateurs.actifs + stats.agents.actifs + stats.vendeurs.actifs;
  const totalBloques =
    stats.utilisateurs.bloques + stats.agents.bloques + stats.vendeurs.bloques;
  const totalSupprimes =
    stats.utilisateurs.supprimes +
    stats.agents.supprimes +
    stats.vendeurs.supprimes;

  const kpiData: KpiCardProps[] = [
    {
      id: "kpi-utilisateurs",
      title: "Utilisateurs",
      value: stats.utilisateurs.total.toLocaleString(),
      unit: "",
      description: "Comptes clients du système",
      icon: faUsers,
      iconBgColor: "bg-primary-subtle",
      iconColor: "text-primary",
      trend: utilisateursTrend.value,
      trendColor: utilisateursTrend.color,
      trendBgColor: utilisateursTrend.bgColor,
      stats: [
        {
          label: "Actifs",
          value: stats.utilisateurs.actifs.toLocaleString(),
          color: "text-success",
        },
        {
          label: "Bloqués",
          value: stats.utilisateurs.bloques.toLocaleString(),
          color: "text-danger",
        },
        {
          label: "Supprimés",
          value: stats.utilisateurs.supprimes.toLocaleString(),
          color: "text-secondary",
        },
      ],
      valueColor: "text-primary",
      loading: stats.utilisateurs.loading,
      onClick: () => (window.location.href = "/dashboard-admin/utilisateurs"),
    },
    {
      id: "kpi-agents",
      title: "Agents",
      value: stats.agents.total.toLocaleString(),
      unit: "",
      description: "Support et assistance client",
      icon: faUserTie,
      iconBgColor: "bg-info-subtle",
      iconColor: "text-info",
      trend: agentsTrend.value,
      trendColor: agentsTrend.color,
      trendBgColor: agentsTrend.bgColor,
      stats: [
        {
          label: "Actifs",
          value: stats.agents.actifs.toLocaleString(),
          color: "text-success",
        },
        {
          label: "Bloqués",
          value: stats.agents.bloques.toLocaleString(),
          color: "text-danger",
        },
        {
          label: "Supprimés",
          value: stats.agents.supprimes.toLocaleString(),
          color: "text-secondary",
        },
      ],
      valueColor: "text-info",
      loading: stats.agents.loading,
      onClick: () => (window.location.href = "/dashboard-admin/agents"),
    },
    {
      id: "kpi-vendeurs",
      title: "Vendeurs",
      value: stats.vendeurs.total.toLocaleString(),
      unit: "",
      description: "Comptes professionnels",
      icon: faStore,
      iconBgColor: "bg-success-subtle",
      iconColor: "text-success",
      trend: vendeursTrend.value,
      trendColor: vendeursTrend.color,
      trendBgColor: vendeursTrend.bgColor,
      stats: [
        {
          label: "Actifs",
          value: stats.vendeurs.actifs.toLocaleString(),
          color: "text-success",
        },
        {
          label: "Bloqués",
          value: stats.vendeurs.bloques.toLocaleString(),
          color: "text-danger",
        },
        {
          label: "Supprimés",
          value: stats.vendeurs.supprimes.toLocaleString(),
          color: "text-secondary",
        },
      ],
      valueColor: "text-success",
      loading: stats.vendeurs.loading,
      onClick: () => (window.location.href = "/dashboard-admin/vendeurs"),
    },
    {
      id: "kpi-total",
      title: "Total Comptes",
      value: totalUtilisateurs.toLocaleString(),
      unit: "",
      description: "Tous les comptes système",
      icon: faUserCheck,
      iconBgColor: "bg-purple-subtle",
      iconColor: "text-purple",
      trend: `${Math.round((totalActifs / (totalUtilisateurs || 1)) * 100)}%`,
      trendColor:
        totalActifs / (totalUtilisateurs || 1) >= 0.8
          ? "text-success"
          : "text-warning",
      trendBgColor:
        totalActifs / (totalUtilisateurs || 1) >= 0.8
          ? "bg-success-subtle"
          : "bg-warning-subtle",
      stats: [
        {
          label: "Actifs",
          value: totalActifs.toLocaleString(),
          color: "text-success",
        },
        {
          label: "Bloqués",
          value: totalBloques.toLocaleString(),
          color: "text-warning",
        },
        {
          label: "Supprimés",
          value: totalSupprimes.toLocaleString(),
          color: "text-secondary",
        },
      ],
      valueColor: "text-purple",
      loading: loading,
    },
  ];

  return (
    <>
      {/* En-tête avec rafraîchissement */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Tableau de Bord Administrateur</h4>
          <p className="text-muted mb-0 small">
            <FontAwesomeIcon icon={faChartSimple} className="me-1" />
            Statistiques en temps réel • Dernière mise à jour:{" "}
            {lastUpdated || "Chargement..."}
            {error && (
              <span className="text-danger ms-2">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-1"
                />
                {error}
              </span>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={fetchStats}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} spin={loading} />
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>
      </div>

      {/* Section KPIs */}
      <section id="kpi-cards-section" className="row g-3 g-md-4 mb-4 mb-md-5">
        {kpiData.map((kpi) => (
          <div key={kpi.id} className="col-12 col-md-6 col-lg-3">
            <KpiCard {...kpi} />
          </div>
        ))}
      </section>

      {/* Résumé détaillé */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                Détail par Catégorie
              </h5>
              <span className="badge bg-primary">Données Exactes</span>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Catégorie</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Actifs</th>
                      <th className="text-end">Bloqués</th>
                      <th className="text-end">Supprimés</th>
                      <th className="text-end">% Actifs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="me-2 text-primary"
                        />
                        Utilisateurs
                      </td>
                      <td className="text-end fw-bold">
                        {stats.utilisateurs.total.toLocaleString()}
                      </td>
                      <td className="text-end text-success">
                        {stats.utilisateurs.actifs.toLocaleString()}
                      </td>
                      <td className="text-end text-danger">
                        {stats.utilisateurs.bloques.toLocaleString()}
                      </td>
                      <td className="text-end text-secondary">
                        {stats.utilisateurs.supprimes.toLocaleString()}
                      </td>
                      <td className="text-end">
                        <span
                          className={`badge ${utilisateursTrend.bgColor} ${utilisateursTrend.color}`}
                        >
                          {utilisateursTrend.value}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <FontAwesomeIcon
                          icon={faUserTie}
                          className="me-2 text-info"
                        />
                        Agents
                      </td>
                      <td className="text-end fw-bold">
                        {stats.agents.total.toLocaleString()}
                      </td>
                      <td className="text-end text-success">
                        {stats.agents.actifs.toLocaleString()}
                      </td>
                      <td className="text-end text-danger">
                        {stats.agents.bloques.toLocaleString()}
                      </td>
                      <td className="text-end text-secondary">
                        {stats.agents.supprimes.toLocaleString()}
                      </td>
                      <td className="text-end">
                        <span
                          className={`badge ${agentsTrend.bgColor} ${agentsTrend.color}`}
                        >
                          {agentsTrend.value}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <FontAwesomeIcon
                          icon={faStore}
                          className="me-2 text-success"
                        />
                        Vendeurs
                      </td>
                      <td className="text-end fw-bold">
                        {stats.vendeurs.total.toLocaleString()}
                      </td>
                      <td className="text-end text-success">
                        {stats.vendeurs.actifs.toLocaleString()}
                      </td>
                      <td className="text-end text-danger">
                        {stats.vendeurs.bloques.toLocaleString()}
                      </td>
                      <td className="text-end text-secondary">
                        {stats.vendeurs.supprimes.toLocaleString()}
                      </td>
                      <td className="text-end">
                        <span
                          className={`badge ${vendeursTrend.bgColor} ${vendeursTrend.color}`}
                        >
                          {vendeursTrend.value}
                        </span>
                      </td>
                    </tr>
                    <tr className="table-active fw-bold">
                      <td>
                        <FontAwesomeIcon
                          icon={faUserCheck}
                          className="me-2 text-purple"
                        />
                        TOTAL
                      </td>
                      <td className="text-end">
                        {totalUtilisateurs.toLocaleString()}
                      </td>
                      <td className="text-end text-success">
                        {totalActifs.toLocaleString()}
                      </td>
                      <td className="text-end text-warning">
                        {totalBloques.toLocaleString()}
                      </td>
                      <td className="text-end text-secondary">
                        {totalSupprimes.toLocaleString()}
                      </td>
                      <td className="text-end">
                        <span
                          className={`badge ${
                            totalActifs / (totalUtilisateurs || 1) >= 0.8
                              ? "bg-success-subtle text-success"
                              : "bg-warning-subtle text-warning"
                          }`}
                        >
                          {Math.round(
                            (totalActifs / (totalUtilisateurs || 1)) * 100,
                          )}
                          %
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 pt-3 border-top">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                  Données calculées à partir des listes spécifiques :
                  <br />• Total = Liste complète • Bloqués = Liste des bloqués •
                  Supprimés = Liste des supprimés • Actifs = Total - (Bloqués +
                  Supprimés)
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="me-2 text-warning"
                />
                Vue d'Ensemble
              </h5>
              <span className="badge bg-warning">Synthèse</span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className="fs-2 text-success mb-2"
                    />
                    <h3 className="mb-1">{totalActifs.toLocaleString()}</h3>
                    <p className="text-muted mb-0 small">Comptes Actifs</p>
                    <div className="progress mt-2" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${(totalActifs / (totalUtilisateurs || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <FontAwesomeIcon
                      icon={faUserXmark}
                      className="fs-2 text-warning mb-2"
                    />
                    <h3 className="mb-1">{totalBloques.toLocaleString()}</h3>
                    <p className="text-muted mb-0 small">Comptes Bloqués</p>
                    <div className="progress mt-2" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{
                          width: `${(totalBloques / (totalUtilisateurs || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <FontAwesomeIcon
                      icon={faUserSlash}
                      className="fs-2 text-secondary mb-2"
                    />
                    <h3 className="mb-1">{totalSupprimes.toLocaleString()}</h3>
                    <p className="text-muted mb-0 small">Comptes Supprimés</p>
                    <div className="progress mt-2" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-secondary"
                        style={{
                          width: `${(totalSupprimes / (totalUtilisateurs || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="fs-2 text-primary mb-2"
                    />
                    <h3 className="mb-1">
                      {totalUtilisateurs.toLocaleString()}
                    </h3>
                    <p className="text-muted mb-0 small">Total Comptes</p>
                    <div className="mt-2">
                      <small
                        className={`fw-bold ${
                          totalActifs / (totalUtilisateurs || 1) >= 0.8
                            ? "text-success"
                            : totalActifs / (totalUtilisateurs || 1) >= 0.6
                              ? "text-warning"
                              : "text-danger"
                        }`}
                      >
                        {Math.round(
                          (totalActifs / (totalUtilisateurs || 1)) * 100,
                        )}
                        % d'activation
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-3">
                  <FontAwesomeIcon icon={faBell} className="me-2 text-info" />
                  Indicateurs de Performance
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  <span
                    className={`badge ${utilisateursTrend.bgColor} ${utilisateursTrend.color}`}
                  >
                    Utilisateurs: {utilisateursTrend.value} actifs
                  </span>
                  <span
                    className={`badge ${agentsTrend.bgColor} ${agentsTrend.color}`}
                  >
                    Agents: {agentsTrend.value} actifs
                  </span>
                  <span
                    className={`badge ${vendeursTrend.bgColor} ${vendeursTrend.color}`}
                  >
                    Vendeurs: {vendeursTrend.value} actifs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aide et informations */}
      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show mb-4"
          role="alert"
        >
          <div className="d-flex">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="me-2 mt-1"
            />
            <div>
              <h6 className="alert-heading mb-1">Données partielles</h6>
              <p className="mb-0">
                Certaines données n'ont pas pu être chargées. Les statistiques
                affichées peuvent être approximatives.
                <br />
                <button
                  onClick={fetchStats}
                  className="btn btn-sm btn-outline-warning mt-2"
                >
                  Réessayer le chargement
                </button>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}
    </>
  );
}

function KpiCard({
  title,
  value,
  unit,
  description,
  icon,
  iconBgColor,
  iconColor,
  trend,
  trendColor,
  trendBgColor,
  stats,
  valueColor = "text-dark",
  loading = false,
  onClick,
}: KpiCardProps) {
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  return (
    <div
      className={`card border shadow-sm h-100 hover-shadow transition ${onClick ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      style={onClick ? { cursor: "pointer" } : {}}
    >
      <div className="card-body p-3 p-md-4 position-relative">
        {/* Indicateur de clic */}
        {onClick && (
          <div className="position-absolute top-0 end-0 m-3">
            <small className="text-primary opacity-75">
              <FontAwesomeIcon icon={faArrowUp} className="rotate-45" />
            </small>
          </div>
        )}

        {/* En-tête avec icône et tendance */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${iconBgColor} transition-all`}
            style={{
              width: "48px",
              height: "48px",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className={`${iconColor} fs-4`}
              />
            ) : (
              <FontAwesomeIcon icon={icon} className={`${iconColor} fs-4`} />
            )}
          </div>
          <span
            className={`badge ${trendBgColor} ${trendColor} d-flex align-items-center gap-1`}
          >
            {trend}
          </span>
        </div>

        {/* Titre du KPI */}
        <h6 className="text-muted mb-2 small text-uppercase fw-semibold">
          {title}
        </h6>

        {/* Valeur principale */}
        <div className="d-flex align-items-baseline mb-2">
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-2">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <span className="text-muted small">Chargement...</span>
            </div>
          ) : (
            <>
              <h2
                className={`fw-bold mb-0 ${valueColor}`}
                style={{ fontSize: "2rem", lineHeight: 1.2 }}
              >
                {value}
              </h2>
              {unit && <span className="text-muted fs-5 ms-1">{unit}</span>}
            </>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted small mb-3" style={{ minHeight: "20px" }}>
            {description}
          </p>
        )}

        {/* Statistiques supplémentaires */}
        {stats && stats.length > 0 && !loading && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex flex-wrap align-items-center gap-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center gap-1 me-3"
                >
                  <span
                    className={`small ${stat.color} fw-medium d-flex align-items-center gap-1`}
                  >
                    {stat.value}
                    <span className="text-muted fw-normal">{stat.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicateur de clic */}
        {onClick && !loading && (
          <div className="mt-3 pt-2 border-top">
            <small className="text-primary d-flex align-items-center gap-1">
              Voir les détails
              <FontAwesomeIcon icon={faArrowUp} className="rotate-45 fs-10" />
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

// Ajout de l'icône manquante
const faInfoCircle = faExclamationTriangle;
