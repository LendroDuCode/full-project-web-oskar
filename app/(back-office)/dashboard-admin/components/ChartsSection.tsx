"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faChartPie,
  faChartBar,
  faDownload,
  faRefresh,
  faEyeSlash,
  faMaximize,
  faEllipsisVertical,
  faMoneyBillWave,
  faUsers,
  faUserTie,
  faStore,
  faUserCheck,
  faUserXmark,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ChartCardProps {
  id: string;
  title: string;
  subtitle: string;
  chartType: "bar" | "pie" | "line";
  height?: number;
}

interface UserStatsData {
  utilisateurs: {
    total: number;
    actifs: number;
    bloques: number;
    supprimes: number;
  };
  agents: {
    total: number;
    actifs: number;
    bloques: number;
    supprimes: number;
  };
  vendeurs: {
    total: number;
    actifs: number;
    bloques: number;
    supprimes: number;
  };
}

export default function ChartsSection() {
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState({
    distribution: true,
    comparison: true,
    evolution: true,
  });
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Simuler la récupération des données depuis votre API
  const fetchUserStats = async () => {
    try {
      // Simuler l'appel API - remplacez par vos appels réels
      const mockData: UserStatsData = {
        utilisateurs: {
          total: 1250,
          actifs: 980,
          bloques: 150,
          supprimes: 120,
        },
        agents: {
          total: 85,
          actifs: 72,
          bloques: 8,
          supprimes: 5,
        },
        vendeurs: {
          total: 320,
          actifs: 280,
          bloques: 25,
          supprimes: 15,
        },
      };

      // Données d'évolution dans le temps
      const evolutionData = generateEvolutionData(timeRange);

      setUserStats(mockData);
      setEvolutionChartData(evolutionData);
      setLoading({ distribution: false, comparison: false, evolution: false });
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading({ distribution: false, comparison: false, evolution: false });
    }
  };

  // Données pour le graphique d'évolution
  const [evolutionChartData, setEvolutionChartData] = useState<any[]>([]);

  const generateEvolutionData = (range: "7d" | "30d" | "90d") => {
    let data = [];
    const now = new Date();

    if (range === "7d") {
      // Données sur 7 jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });

        data.push({
          date: dayName,
          utilisateurs: Math.floor(Math.random() * 30) + 20,
          agents: Math.floor(Math.random() * 5) + 2,
          vendeurs: Math.floor(Math.random() * 15) + 8,
        });
      }
    } else if (range === "30d") {
      // Données sur 30 jours (groupées par semaine)
      const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
      data = weeks.map((week, index) => ({
        date: week,
        utilisateurs: Math.floor(Math.random() * 100) + 150,
        agents: Math.floor(Math.random() * 15) + 10,
        vendeurs: Math.floor(Math.random() * 50) + 30,
      }));
    } else {
      // Données sur 90 jours (groupées par mois)
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
      data = months.map((month) => ({
        date: month,
        utilisateurs: Math.floor(Math.random() * 200) + 300,
        agents: Math.floor(Math.random() * 25) + 15,
        vendeurs: Math.floor(Math.random() * 80) + 60,
      }));
    }

    return data;
  };

  useEffect(() => {
    fetchUserStats();
  }, [timeRange]);

  const chartData: ChartCardProps[] = [
    {
      id: "distribution-chart-card",
      title: "Répartition des Comptes",
      subtitle: "Par catégorie et statut",
      chartType: "bar",
      height: 350,
    },
    {
      id: "comparison-chart-card",
      title: "Comparaison des Statuts",
      subtitle: "Actifs vs Bloqués vs Supprimés",
      chartType: "pie",
      height: 350,
    },
    {
      id: "evolution-chart-card",
      title: "Évolution des Inscriptions",
      subtitle: "Nouveaux comptes par période",
      chartType: "line",
      height: 350,
    },
  ];

  // Calcul des données pour les graphiques
  const barChartData = userStats
    ? [
        {
          name: "Utilisateurs",
          total: userStats.utilisateurs.total,
          actifs: userStats.utilisateurs.actifs,
          bloques: userStats.utilisateurs.bloques,
          supprimes: userStats.utilisateurs.supprimes,
        },
        {
          name: "Agents",
          total: userStats.agents.total,
          actifs: userStats.agents.actifs,
          bloques: userStats.agents.bloques,
          supprimes: userStats.agents.supprimes,
        },
        {
          name: "Vendeurs",
          total: userStats.vendeurs.total,
          actifs: userStats.vendeurs.actifs,
          bloques: userStats.vendeurs.bloques,
          supprimes: userStats.vendeurs.supprimes,
        },
      ]
    : [];

  // Données pour le graphique en camembert (comparaison globale)
  const pieChartData = userStats
    ? [
        {
          name: "Utilisateurs Actifs",
          value: userStats.utilisateurs.actifs,
          color: "#10b981",
        },
        {
          name: "Utilisateurs Bloqués",
          value: userStats.utilisateurs.bloques,
          color: "#ef4444",
        },
        {
          name: "Utilisateurs Supprimés",
          value: userStats.utilisateurs.supprimes,
          color: "#6b7280",
        },
        {
          name: "Agents Actifs",
          value: userStats.agents.actifs,
          color: "#3b82f6",
        },
        {
          name: "Agents Bloqués",
          value: userStats.agents.bloques,
          color: "#f59e0b",
        },
        {
          name: "Agents Supprimés",
          value: userStats.agents.supprimes,
          color: "#8b5cf6",
        },
        {
          name: "Vendeurs Actifs",
          value: userStats.vendeurs.actifs,
          color: "#8b5cf6",
        },
        {
          name: "Vendeurs Bloqués",
          value: userStats.vendeurs.bloques,
          color: "#ec4899",
        },
        {
          name: "Vendeurs Supprimés",
          value: userStats.vendeurs.supprimes,
          color: "#6366f1",
        },
      ].filter((item) => item.value > 0)
    : [];

  // Données résumées pour le camembert simplifié
  const summaryPieData = userStats
    ? [
        {
          name: "Actifs",
          value:
            userStats.utilisateurs.actifs +
            userStats.agents.actifs +
            userStats.vendeurs.actifs,
          color: "#10b981",
        },
        {
          name: "Bloqués",
          value:
            userStats.utilisateurs.bloques +
            userStats.agents.bloques +
            userStats.vendeurs.bloques,
          color: "#ef4444",
        },
        {
          name: "Supprimés",
          value:
            userStats.utilisateurs.supprimes +
            userStats.agents.supprimes +
            userStats.vendeurs.supprimes,
          color: "#6b7280",
        },
      ]
    : [];

  const handleChartOptions = (chartId: string) => {
    setActiveChart(activeChart === chartId ? null : chartId);
  };

  const handleExport = (chartId: string) => {
    console.log(`Exporting chart: ${chartId}`);
    alert(`Export du graphique ${chartId} en cours...`);
  };

  const handleRefresh = () => {
    setLoading({ distribution: true, comparison: true, evolution: true });
    fetchUserStats();
  };

  const totalComptes = userStats
    ? userStats.utilisateurs.total +
      userStats.agents.total +
      userStats.vendeurs.total
    : 0;
  const totalActifs = userStats
    ? userStats.utilisateurs.actifs +
      userStats.agents.actifs +
      userStats.vendeurs.actifs
    : 0;
  const totalBloques = userStats
    ? userStats.utilisateurs.bloques +
      userStats.agents.bloques +
      userStats.vendeurs.bloques
    : 0;
  const totalSupprimes = userStats
    ? userStats.utilisateurs.supprimes +
      userStats.agents.supprimes +
      userStats.vendeurs.supprimes
    : 0;

  return (
    <>
      {/* En-tête des graphiques */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2">
        <div>
          <h4 className="mb-1 fw-bold">Analyses Graphiques</h4>
          <p className="text-muted mb-0 small">
            Visualisation des données utilisateurs, agents et vendeurs
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleRefresh}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            disabled={
              loading.distribution || loading.comparison || loading.evolution
            }
          >
            <FontAwesomeIcon
              icon={faRefresh}
              spin={
                loading.distribution || loading.comparison || loading.evolution
              }
            />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Section graphiques */}
      <section id="charts-section" className="row g-3 g-md-4 mb-4 mb-md-5">
        {chartData.map((chart) => (
          <div key={chart.id} className="col-12 col-lg-4">
            <ChartCard
              {...chart}
              isActive={activeChart === chart.id}
              onOptionsClick={() => handleChartOptions(chart.id)}
              loading={
                loading[
                  chart.id === "distribution-chart-card"
                    ? "distribution"
                    : chart.id === "comparison-chart-card"
                      ? "comparison"
                      : "evolution"
                ]
              }
              barChartData={barChartData}
              pieChartData={
                chart.id === "comparison-chart-card"
                  ? summaryPieData
                  : pieChartData
              }
              evolutionChartData={evolutionChartData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onExport={() => handleExport(chart.id)}
              onRefresh={handleRefresh}
              totalComptes={totalComptes}
              totalActifs={totalActifs}
              userStats={userStats}
            />
          </div>
        ))}
      </section>
    </>
  );
}

function ChartCard({
  id,
  title,
  subtitle,
  chartType,
  height = 350,
  isActive,
  loading,
  onOptionsClick,
  barChartData,
  pieChartData,
  evolutionChartData,
  timeRange,
  onTimeRangeChange,
  onExport,
  onRefresh,
  totalComptes,
  totalActifs,
  userStats,
}: ChartCardProps & {
  isActive: boolean;
  loading: boolean;
  onOptionsClick: () => void;
  barChartData: any[];
  pieChartData: any[];
  evolutionChartData: any[];
  timeRange: "7d" | "30d" | "90d";
  onTimeRangeChange: (range: "7d" | "30d" | "90d") => void;
  onExport: () => void;
  onRefresh: () => void;
  totalComptes: number;
  totalActifs: number;
  userStats: UserStatsData | null;
}) {
  const getChartIcon = () => {
    switch (chartType) {
      case "bar":
        return faChartBar;
      case "pie":
        return faChartPie;
      case "line":
        return faChartLine;
      default:
        return faChartBar;
    }
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="mb-1" style={{ color: entry.color }}>
              {entry.name}: <span className="fw-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage =
        totalComptes > 0 ? ((data.value / totalComptes) * 100).toFixed(1) : "0";
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.name}</p>
          <p className="mb-0">
            Nombre:{" "}
            <span className="fw-bold">{data.value.toLocaleString()}</span>
          </p>
          <p className="mb-0">
            Pourcentage: <span className="fw-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow-sm">
          <p className="fw-bold mb-2">Période: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="mb-1" style={{ color: entry.color }}>
              {entry.name}: <span className="fw-bold">{entry.value}</span>{" "}
              nouveaux comptes
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Rendu du graphique selon le type
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center bg-light rounded">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted mb-0">Chargement des données...</p>
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar
                dataKey="actifs"
                name="Actifs"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="bloques"
                name="Bloqués"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="supprimes"
                name="Supprimés"
                fill="#6b7280"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <h5 className="fw-bold text-dark mb-1">
                {totalActifs.toLocaleString()} / {totalComptes.toLocaleString()}
              </h5>
              <small className="text-muted">Actifs / Total des comptes</small>
            </div>
          </div>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={evolutionChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<LineTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="utilisateurs"
                name="Utilisateurs"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="agents"
                name="Agents"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="vendeurs"
                name="Vendeurs"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Rendu de la légende selon le type de graphique
  const renderLegend = () => {
    if (chartType === "bar") {
      return (
        <>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#10b981",
              }}
            ></div>
            <small className="text-muted">Actifs</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ef4444",
              }}
            ></div>
            <small className="text-muted">Bloqués</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#6b7280",
              }}
            ></div>
            <small className="text-muted">Supprimés</small>
          </div>
        </>
      );
    } else if (chartType === "pie") {
      return pieChartData.map((item, index) => (
        <div key={index} className="d-flex align-items-center gap-1">
          <div
            className="rounded-circle"
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: item.color,
            }}
          ></div>
          <small className="text-muted">{item.name}</small>
        </div>
      ));
    } else {
      return (
        <>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#3b82f6",
              }}
            ></div>
            <small className="text-muted">Utilisateurs</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#f59e0b",
              }}
            ></div>
            <small className="text-muted">Agents</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <div
              className="rounded-circle"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#10b981",
              }}
            ></div>
            <small className="text-muted">Vendeurs</small>
          </div>
        </>
      );
    }
  };

  return (
    <div className="card border shadow-sm h-100">
      <div className="card-header bg-white border-bottom py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1 text-dark">
              <FontAwesomeIcon icon={getChartIcon()} className="me-2" />
              {title}
            </h5>
            <p className="text-muted small mb-0">{subtitle}</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {chartType === "line" && (
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${timeRange === "7d" ? "active" : ""}`}
                  onClick={() => onTimeRangeChange("7d")}
                >
                  7j
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${timeRange === "30d" ? "active" : ""}`}
                  onClick={() => onTimeRangeChange("30d")}
                >
                  30j
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${timeRange === "90d" ? "active" : ""}`}
                  onClick={() => onTimeRangeChange("90d")}
                >
                  90j
                </button>
              </div>
            )}

            <div className="dropdown">
              <button
                className={`btn btn-link text-muted p-0 ${isActive ? "show" : ""}`}
                type="button"
                onClick={onOptionsClick}
                aria-expanded={isActive}
                aria-label={`Options pour ${title}`}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} className="fs-5" />
              </button>

              {isActive && (
                <div
                  className="dropdown-menu show"
                  style={{
                    position: "absolute",
                    inset: "0px auto auto 0px",
                    margin: "0px",
                    transform: "translate(-120px, 30px)",
                    zIndex: 1000,
                  }}
                >
                  <button className="dropdown-item" onClick={onExport}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Exporter
                  </button>
                  <button className="dropdown-item" onClick={onRefresh}>
                    <FontAwesomeIcon icon={faRefresh} className="me-2" />
                    Actualiser
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => console.log(`Masquer ${title}`)}
                  >
                    <FontAwesomeIcon icon={faEyeSlash} className="me-2" />
                    Masquer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-3">
        <div style={{ height: `${height}px`, width: "100%" }}>
          {renderChart()}
        </div>
      </div>

      {/* Légende sous le graphique */}
      <div className="card-footer bg-white border-top py-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {renderLegend()}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => console.log(`Plein écran: ${title}`)}
          >
            <FontAwesomeIcon icon={faMaximize} className="me-1" />
            <span className="d-none d-sm-inline">Plein écran</span>
          </button>
        </div>
      </div>
    </div>
  );
}
