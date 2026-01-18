// app/(dashboard)/vendeur/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // Icônes de base
  faStore,
  faShoppingBag,
  faGift,
  faExchangeAlt,
  faUsers,
  faMoneyBillWave,
  faStar,
  faHeart,
  faChartLine,
  faCalendar,
  faClock,
  faBox,
  faShoppingCart,
  faBan,
  faCheckCircle,
  faSpinner,
  faArrowUp,
  faArrowDown,
  faEllipsisH,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faFilter,
  faSearch,
  faChartBar,
  faChartPie,
  faList,
  faBell,
  faCog,
  faUser,
  faTachometerAlt,
  faTag,
  faGlobe,
  faLock,
  faLockOpen,
  faBolt,
  faExclamationTriangle,
  faInfoCircle,
  faSync,
  faDownload,
  faUpload,
  faHistory,

  // Icônes monétaires et statistiques
  faCoins,
  faPercent,
  faTags,
  faLayerGroup,
  faFire,
  faRocket,
  faSeedling,
  faWaveSquare,
  faCrown,
  faAward,
  faTrophy,
  faMedal,

  // Icônes de tendances et flèches alternatives
  faArrowTrendUp, // Remplace faTrendUp
  faArrowTrendDown, // Remplace faTrendDown

  // Icônes de navigation et cibles
  faCompass,
  faBullseye,
  faFlagCheckered,
  faTasks,
  faCalendarAlt,
  faCalendarCheck,
  faCalendarDay,
  faCalendarWeek,

  // Icônes de graphiques
  faChartArea,
  faChartColumn, // Existe déjà comme faChartBar
  faChartGantt, // Non disponible dans free-solid-svg-icons

  // Icônes de cercles et formes
  faCircleDot,
  faCircleHalfStroke,
  faCircleNodes,
  faCircleRadiation,
  faCircleChevronRight,
  faCircleChevronLeft,
  faCircleNotch,

  // Icônes technologiques
  faCloudArrowUp,
  faDatabase,
  faDiagramProject,
  faNetworkWired,
  faSitemap,
  faSquarePollVertical,
  faSquarePollHorizontal,

  // Icônes alternatives pour celles qui n'existent pas
  faLineChart, // Alternative à faChartGantt
  faDotCircle, // Alternative à faChartScatter
  faTurnUp, // Alternative si besoin
  faTurnDown, // Alternative si besoin
} from "@fortawesome/free-solid-svg-icons";

import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

// Types
interface Stats {
  totalBoutiques: number;
  boutiquesActives: number;
  boutiquesEnReview: number;
  boutiquesBloquees: number;
  totalProduits: number;
  produitsPublies: number;
  produitsNonPublies: number;
  produitsBloques: number;
  totalDons: number;
  donsPublies: number;
  donsBloques: number;
  donsEnAttente: number;
  totalEchanges: number;
  echangesPublies: number;
  echangesBloques: number;
  echangesEnAttente: number;
  revenusTotaux: number;
  revenusMensuels: number;
  revenusHebdomadaires: number;
  commandesEnAttente: number;
  commandesTraitees: number;
  commandesAnnulees: number;
  avisMoyen: number;
  totalAvis: number;
  totalFavoris: number;
  tauxConversion: number;
  panierMoyen: number;
}

interface Produit {
  uuid: string;
  libelle: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  quantite: number;
  boutique: {
    nom: string;
    uuid: string;
  } | null; // Correction: boutique peut être null
  createdAt: string | null;
  note_moyenne: string;
  nombre_avis: number;
  nombre_favoris: number;
}

interface Don {
  uuid: string;
  nom: string;
  type_don: string;
  prix: number | null;
  categorie: string;
  image: string;
  statut: string;
  estPublie: boolean;
  est_bloque: boolean | null;
  date_debut: string;
  vendeur: string;
  description: string;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  prix: string;
  image: string;
  statut: string;
  estPublie: boolean;
  dateProposition: string;
  objetPropose: string;
  objetDemande: string;
  message: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  logo: string;
  banniere: string;
  statut: string;
  est_bloque: boolean;
  est_ferme: boolean;
  created_at: string;
  type_boutique: {
    libelle: string;
    code: string;
  };
  produits_count?: number;
}

interface RecentActivity {
  id: string;
  type: "produit" | "don" | "echange" | "boutique" | "commande" | "avis";
  action: string;
  description: string;
  date: string;
  status: "success" | "warning" | "danger" | "info" | "primary";
  icon: any;
}

// Composant de carte statistique avec animations
const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  change,
  subtitle,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: any;
  color?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "secondary"
    | "dark";
  change?: { value: number; isPositive: boolean };
  subtitle?: string;
  delay?: number;
}) => {
  const colorClasses = {
    primary: "bg-primary bg-opacity-10 text-primary border-primary",
    success: "bg-success bg-opacity-10 text-success border-success",
    warning: "bg-warning bg-opacity-10 text-warning border-warning",
    danger: "bg-danger bg-opacity-10 text-danger border-danger",
    info: "bg-info bg-opacity-10 text-info border-info",
    secondary: "bg-secondary bg-opacity-10 text-secondary border-secondary",
    dark: "bg-dark bg-opacity-10 text-dark border-dark",
  };

  return (
    <div
      className={`card border border-2 ${colorClasses[color]} border-opacity-25 shadow-lg h-100 animate-fade-in`}
      style={{
        animationDelay: `${delay * 100}ms`,
        transform: "translateY(0)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
      }}
    >
      <div className="card-body position-relative overflow-hidden">
        {/* Effet de fond décoratif */}
        <div
          className={`position-absolute top-0 end-0 ${colorClasses[color].split(" ")[0]} bg-opacity-5`}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            transform: "translate(30px, -30px)",
          }}
        ></div>

        <div className="d-flex justify-content-between align-items-start mb-3">
          <div
            className={`rounded-circle p-3 ${colorClasses[color]} border border-2 border-opacity-25 shadow-sm`}
          >
            <FontAwesomeIcon icon={icon} className="fs-4" />
          </div>
          {change && (
            <div
              className={`badge d-flex align-items-center animate-pulse ${change.isPositive ? "bg-success" : "bg-danger"}`}
              style={{ animationDelay: `${delay * 100 + 500}ms` }}
            >
              <FontAwesomeIcon
                icon={change.isPositive ? faArrowUp : faArrowDown}
                className="me-1"
              />
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        <h3
          className="fw-bold mb-1 display-6 animate-count-up"
          data-value={value}
        >
          {value}
        </h3>
        <p className="text-muted mb-0 fw-semibold">{title}</p>
        {subtitle && (
          <small className="text-muted d-flex align-items-center mt-2">
            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
            {subtitle}
          </small>
        )}

        {/* Barre de progression décorative */}
        <div className="progress mt-3" style={{ height: "4px" }}>
          <div
            className={`progress-bar ${colorClasses[color].split(" ")[0]}`}
            style={{
              width: "75%",
              animation: `progressBarFill 2s ease-out ${delay * 100}ms forwards`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Composant de diagramme circulaire avancé
const AdvancedPieChart = ({
  title,
  data,
  colors,
  showLegend = true,
  showValues = true,
  showPercentage = true,
  innerRadius = 40,
  outerRadius = 80,
  delay = 0,
}: {
  title: string;
  data: { label: string; value: number; description?: string }[];
  colors: string[];
  showLegend?: boolean;
  showValues?: boolean;
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  delay?: number;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulated = 0;
  const centerX = 100;
  const centerY = 100;

  return (
    <div
      className="card border-0 shadow-lg h-100 animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          <FontAwesomeIcon icon={faChartPie} className="me-2 text-primary" />
          {title}
        </h5>
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="dropdown"
          >
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item">
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Exporter
              </button>
            </li>
            <li>
              <button className="dropdown-item">
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Actualiser
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="card-body">
        <div className="row align-items-center">
          <div className={showLegend ? "col-md-7" : "col-12"}>
            <div className="position-relative" style={{ height: "220px" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200">
                {/* Effets de brillance */}
                <defs>
                  <radialGradient id="glow">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <filter
                    id="shadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="2"
                      dy="2"
                      stdDeviation="3"
                      floodColor="rgba(0,0,0,0.3)"
                    />
                  </filter>
                </defs>

                {/* Secteurs du diagramme */}
                {data.map((item, index) => {
                  const percentage = (item.value / total) * 100;
                  const startAngle = (accumulated / total) * 360;
                  const endAngle = ((accumulated + item.value) / total) * 360;
                  accumulated += item.value;

                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);

                  const x1 = centerX + outerRadius * Math.cos(startRad);
                  const y1 = centerY + outerRadius * Math.sin(startRad);
                  const x2 = centerX + outerRadius * Math.cos(endRad);
                  const y2 = centerY + outerRadius * Math.sin(endRad);

                  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${centerX} ${centerY}`,
                  ].join(" ");

                  return (
                    <g key={index} filter="url(#shadow)">
                      <path
                        d={pathData}
                        fill={colors[index % colors.length]}
                        stroke="#fff"
                        strokeWidth="3"
                        opacity="0.9"
                        className="animate-sector"
                        style={{
                          animationDelay: `${index * 200 + delay * 100}ms`,
                        }}
                      >
                        <title>
                          {item.label}: {item.value} ({percentage.toFixed(1)}%)
                          {item.description && `\n${item.description}`}
                        </title>
                      </path>
                    </g>
                  );
                })}

                {/* Cercle intérieur avec effet de brillance */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius}
                  fill="url(#glow)"
                />
                <circle cx={centerX} cy={centerY} r={innerRadius} fill="#fff" />

                {/* Texte au centre */}
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  className="fw-bold"
                  fontSize="16"
                  fill="#2c3e50"
                >
                  {showValues && total}
                </text>
                <text
                  x={centerX}
                  y={centerY + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#7f8c8d"
                >
                  Total
                </text>
                {showPercentage && (
                  <text
                    x={centerX}
                    y={centerY + 35}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#95a5a6"
                  >
                    {data.length} catégories
                  </text>
                )}
              </svg>
            </div>
          </div>

          {showLegend && (
            <div className="col-md-5">
              <div className="legend mt-3 mt-md-0">
                {data.map((item, index) => {
                  const percentage = (item.value / total) * 100;
                  return (
                    <div
                      key={index}
                      className="d-flex align-items-center mb-3 animate-fade-in"
                      style={{
                        animationDelay: `${index * 100 + delay * 100 + 500}ms`,
                      }}
                    >
                      <div
                        className="rounded me-2 shadow-sm"
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: colors[index % colors.length],
                        }}
                      ></div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small fw-semibold">
                            {item.label}
                          </span>
                          <div>
                            {showValues && (
                              <span className="small fw-bold me-2">
                                {item.value}
                              </span>
                            )}
                            {showPercentage && (
                              <span className="small text-muted">
                                {percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="progress mt-1"
                          style={{ height: "6px" }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length],
                              animation: `progressBarFill 1.5s ease-out ${index * 100 + delay * 100 + 500}ms forwards`,
                            }}
                          ></div>
                        </div>
                        {item.description && (
                          <small className="text-muted d-block mt-1">
                            {item.description}
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant de diagramme à barres animé
const AnimatedBarChart = ({
  title,
  data,
  color = "primary",
  unit = "",
  delay = 0,
  showGrid = true,
  showValues = true,
}: {
  title: string;
  data: { label: string; value: number; sublabel?: string }[];
  color?: string;
  unit?: string;
  delay?: number;
  showGrid?: boolean;
  showValues?: boolean;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const chartHeight = 180;
  const barWidth = 40;
  const spacing = 20;

  return (
    <div
      className="card border-0 shadow-lg h-100 animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          <FontAwesomeIcon icon={faChartColumn} className="me-2 text-primary" />
          {title}
        </h5>
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="dropdown"
          >
            <FontAwesomeIcon icon={faFilter} className="me-1" />
            Filtrer
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item">7 derniers jours</button>
            </li>
            <li>
              <button className="dropdown-item">30 derniers jours</button>
            </li>
            <li>
              <button className="dropdown-item">3 derniers mois</button>
            </li>
          </ul>
        </div>
      </div>
      <div className="card-body">
        <div
          className="position-relative"
          style={{ height: `${chartHeight}px`, overflow: "hidden" }}
        >
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            {/* Grille de fond */}
            {showGrid && (
              <g>
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={`${percent}%`}
                      x2="100%"
                      y2={`${percent}%`}
                      stroke="#e9ecef"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    <text
                      x="0"
                      y={`${percent}%`}
                      dx="-25"
                      dy="4"
                      textAnchor="end"
                      fontSize="10"
                      fill="#95a5a6"
                    >
                      {Math.round((maxValue * percent) / 100)}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Barres */}
            {data.map((item, index) => {
              const barHeight = (item.value / maxValue) * (chartHeight - 30);
              const x = index * (barWidth + spacing) + 50;
              const y = chartHeight - barHeight;

              return (
                <g key={index} className="animate-bar">
                  <defs>
                    <linearGradient
                      id={`gradient-${index}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={`var(--bs-${color})`}
                        stopOpacity="0.8"
                      />
                      <stop
                        offset="100%"
                        stopColor={`var(--bs-${color})`}
                        stopOpacity="0.4"
                      />
                    </linearGradient>
                  </defs>

                  {/* Barre avec effet 3D */}
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={`url(#gradient-${index})`}
                    rx="4"
                    className="animate-bar-grow"
                    style={{
                      animationDelay: `${index * 100 + delay * 100}ms`,
                      transformOrigin: `center bottom`,
                    }}
                  >
                    <title>
                      {item.label}: {item.value} {unit}
                      {item.sublabel && `\n${item.sublabel}`}
                    </title>
                  </rect>

                  {/* Effet de brillance sur la barre */}
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight / 3}
                    fill="#fff"
                    opacity="0.2"
                    rx="4 4 0 0"
                  />

                  {/* Valeur au-dessus de la barre */}
                  {showValues && (
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={`var(--bs-${color})`}
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${index * 100 + delay * 100 + 300}ms`,
                      }}
                    >
                      {item.value}
                      {unit}
                    </text>
                  )}

                  {/* Label en bas */}
                  <text
                    x={x}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6c757d"
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 100 + delay * 100 + 400}ms`,
                    }}
                  >
                    {item.label}
                  </text>

                  {/* Sous-label */}
                  {item.sublabel && (
                    <text
                      x={x}
                      y={chartHeight + 30}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#95a5a6"
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${index * 100 + delay * 100 + 500}ms`,
                      }}
                    >
                      {item.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Composant de diagramme en radar
const RadarChart = ({
  title,
  data,
  maxValue = 100,
  delay = 0,
}: {
  title: string;
  data: { label: string; value: number }[];
  maxValue?: number;
  delay?: number;
}) => {
  const sides = data.length;
  const angle = (2 * Math.PI) / sides;
  const radius = 70;
  const centerX = 100;
  const centerY = 100;

  const getPoint = (index: number, value: number) => {
    const r = (value / maxValue) * radius;
    const a = angle * index - Math.PI / 2;
    return {
      x: centerX + r * Math.cos(a),
      y: centerY + r * Math.sin(a),
    };
  };

  const points = data.map((item, i) => getPoint(i, item.value));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      className="card border-0 shadow-lg h-100 animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <FontAwesomeIcon icon={faBullseye} className="me-2 text-primary" />
          {title}
        </h5>
      </div>
      <div className="card-body">
        <div className="position-relative" style={{ height: "220px" }}>
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {/* Grille */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => {
              const r = radius * scale;
              const gridPoints = Array.from({ length: sides })
                .map((_, j) => {
                  const a = angle * j - Math.PI / 2;
                  return `${centerX + r * Math.cos(a)},${centerY + r * Math.sin(a)}`;
                })
                .join(" ");

              return (
                <polygon
                  key={i}
                  points={gridPoints}
                  fill="none"
                  stroke="#e9ecef"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Axes */}
            {data.map((_, i) => {
              const a = angle * i - Math.PI / 2;
              const x = centerX + radius * Math.cos(a);
              const y = centerY + radius * Math.sin(a);

              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="#dee2e6"
                  strokeWidth="1"
                />
              );
            })}

            {/* Zone de données */}
            <polygon
              points={polygonPoints}
              fill="rgba(13, 110, 253, 0.2)"
              stroke="#0d6efd"
              strokeWidth="2"
              className="animate-radar"
              style={{ animationDelay: `${delay * 100}ms` }}
            />

            {/* Points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#0d6efd"
                  stroke="#fff"
                  strokeWidth="2"
                  className="animate-point"
                  style={{ animationDelay: `${i * 100 + delay * 100 + 300}ms` }}
                />
              </g>
            ))}

            {/* Labels */}
            {data.map((item, i) => {
              const a = angle * i - Math.PI / 2;
              const labelX = centerX + (radius + 15) * Math.cos(a);
              const labelY = centerY + (radius + 15) * Math.sin(a);

              return (
                <text
                  key={i}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#495057"
                  dy="3"
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 100 + delay * 100 + 500}ms` }}
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Composant de ligne de temps
const TimelineChart = ({
  title,
  data,
  delay = 0,
}: {
  title: string;
  data: { date: string; value: number; label: string }[];
  delay?: number;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;
  const height = 150;
  const pointRadius = 4;

  const getY = (value: number) => {
    return height - ((value - minValue) / range) * (height - 30);
  };

  const points = data.map((item, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = getY(item.value);
    return {
      x: `${x}%`,
      y,
      value: item.value,
      label: item.label,
      date: item.date,
    };
  });

  const linePath = points.map((p) => `${p.x} ${p.y}`).join(" L ");

  return (
    <div
      className="card border-0 shadow-lg h-100 animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">
          <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
          {title}
        </h5>
      </div>
      <div className="card-body">
        <div className="position-relative" style={{ height: `${height}px` }}>
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            {/* Zone sous la courbe */}
            <defs>
              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0d6efd" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Zone remplie */}
            <path
              d={`M 0% ${height} L ${linePath} L 100% ${height} Z`}
              fill="url(#areaGradient)"
              className="animate-area-fill"
              style={{ animationDelay: `${delay * 100}ms` }}
            />

            {/* Ligne */}
            <path
              d={`M ${linePath}`}
              fill="none"
              stroke="#0d6efd"
              strokeWidth="2"
              className="animate-line-draw"
              style={{ animationDelay: `${delay * 100 + 200}ms` }}
            />

            {/* Points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill="#fff"
                  stroke="#0d6efd"
                  strokeWidth="2"
                  className="animate-point"
                  style={{ animationDelay: `${i * 100 + delay * 100 + 400}ms` }}
                >
                  <title>
                    {point.label}: {point.value}
                    {point.date && `\n${point.date}`}
                  </title>
                </circle>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius * 2}
                  fill="#0d6efd"
                  opacity="0.1"
                  className="animate-ripple"
                  style={{ animationDelay: `${i * 100 + delay * 100 + 500}ms` }}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Composant d'activité récente avec animations
const AnimatedRecentActivityCard = ({
  activities,
  delay = 0,
}: {
  activities: RecentActivity[];
  delay?: number;
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return faCheckCircle;
      case "warning":
        return faExclamationTriangle;
      case "danger":
        return faBan;
      case "info":
        return faInfoCircle;
      case "primary":
        return faBell;
      default:
        return faBell;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "danger":
        return "danger";
      case "info":
        return "info";
      case "primary":
        return "primary";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className="card border-0 shadow-lg h-100 animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">
          <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
          Activité récente
        </h5>
        <button className="btn btn-sm btn-outline-secondary">
          <FontAwesomeIcon icon={faSync} />
        </button>
      </div>
      <div className="card-body">
        <div className="timeline">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="timeline-item mb-3 animate-slide-left"
              style={{ animationDelay: `${index * 100 + delay * 100}ms` }}
            >
              <div className="d-flex">
                <div className="timeline-icon me-3">
                  <div
                    className={`rounded-circle p-2 bg-${getStatusColor(activity.status)} bg-opacity-10 text-${getStatusColor(activity.status)} shadow-sm`}
                    style={{
                      animation: `pulse 2s infinite ${index * 200}ms`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={activity.icon || getStatusIcon(activity.status)}
                    />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1 fw-semibold">{activity.action}</h6>
                    <small className="text-muted">
                      {new Date(activity.date).toLocaleDateString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                  <p className="mb-0 text-muted small">
                    {activity.description}
                  </p>
                  <span
                    className={`badge bg-${getStatusColor(activity.status)} bg-opacity-10 text-${getStatusColor(activity.status)} mt-1 animate-fade-in`}
                    style={{
                      animationDelay: `${index * 100 + delay * 100 + 200}ms`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={getStatusIcon(activity.status)}
                      className="me-1"
                    />
                    {activity.status === "success" && "Succès"}
                    {activity.status === "warning" && "Attention"}
                    {activity.status === "danger" && "Erreur"}
                    {activity.status === "info" && "Information"}
                    {activity.status === "primary" && "Notification"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant de tableau de produits avec animations
const AnimatedProductsTable = ({
  products,
  delay = 0,
}: {
  products: Produit[];
  delay?: number;
}) => {
  const router = useRouter();

  const getStatusBadge = (produit: Produit) => {
    if (produit.estBloque) {
      return (
        <span className="badge bg-danger bg-opacity-10 text-danger animate-pulse">
          <FontAwesomeIcon icon={faBan} className="me-1" />
          Bloqué
        </span>
      );
    }
    if (produit.estPublie) {
      return (
        <span className="badge bg-success bg-opacity-10 text-success">
          <FontAwesomeIcon icon={faGlobe} className="me-1" />
          Publié
        </span>
      );
    }
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary">
        <FontAwesomeIcon icon={faLock} className="me-1" />
        Non publié
      </span>
    );
  };

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  return (
    <div
      className="card border-0 shadow-lg animate-slide-up"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="card-header bg-white border-0 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            <FontAwesomeIcon
              icon={faShoppingBag}
              className="me-2 text-primary"
            />
            Mes produits récents
          </h5>
          <button
            className="btn btn-sm btn-primary animate-pulse-hover"
            onClick={() => router.push("/dashboard/produits")}
          >
            <FontAwesomeIcon icon={faEye} className="me-1" />
            Voir tout
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Boutique</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((produit, index) => (
                <tr
                  key={produit.uuid}
                  className="animate-slide-right"
                  style={{
                    animationDelay: `${index * 50 + delay * 100}ms`,
                    transform: "translateX(0)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(5px)";
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="position-relative me-2">
                        <img
                          src={produit.image}
                          alt={produit.libelle}
                          className="rounded shadow-sm"
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/45/cccccc/ffffff?text=P";
                          }}
                        />
                        {produit.note_moyenne &&
                          parseFloat(produit.note_moyenne) >= 4 && (
                            <div className="position-absolute top-0 start-100 translate-middle badge bg-warning text-dark">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="fs-xxsmall"
                              />
                            </div>
                          )}
                      </div>
                      <div>
                        <div className="fw-semibold">{produit.libelle}</div>
                        <small className="text-muted">
                          Note: {produit.note_moyenne || "N/A"} (
                          {produit.nombre_avis || 0} avis)
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {/* CORRECTION: Vérification si boutique est null */}
                    <span className="fw-semibold">
                      {produit.boutique
                        ? produit.boutique.nom
                        : "Sans boutique"}
                    </span>
                  </td>
                  <td className="fw-bold text-success">
                    {formatPrice(produit.prix)}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span
                        className={`badge ${produit.quantite > 10 ? "bg-success" : produit.quantite > 0 ? "bg-warning" : "bg-danger"}`}
                      >
                        {produit.quantite}
                      </span>
                      {produit.nombre_favoris > 0 && (
                        <small className="ms-2 text-danger">
                          <FontAwesomeIcon icon={faHeart} className="me-1" />
                          {produit.nombre_favoris}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(produit)}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary animate-scale-hover"
                        title="Voir"
                        onClick={() =>
                          router.push(`/dashboard/produits/${produit.uuid}`)
                        }
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="btn btn-outline-warning animate-scale-hover"
                        title="Modifier"
                        onClick={() =>
                          router.push(
                            `/dashboard/produits/${produit.uuid}/edit`,
                          )
                        }
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Page principale
const VendeurDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [timeRange, setTimeRange] = useState("month");

  // Charger les données
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Charger les boutiques
        const boutiquesRes = await api.get<{
          data: Boutique[];
          total: number;
        }>(API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR);
        const boutiquesData = Array.isArray(boutiquesRes.data)
          ? boutiquesRes.data
          : boutiquesRes.data || [];
        setBoutiques(boutiquesData);

        // Charger les produits
        const produitsRes = await api.get<{
          data: Produit[];
          total: number;
        }>(API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS);
        let produitsData = Array.isArray(produitsRes.data)
          ? produitsRes.data
          : produitsRes.data || [];

        // Normaliser les données pour s'assurer que boutique a une structure correcte
        produitsData = produitsData.map((produit) => ({
          ...produit,
          boutique: produit.boutique || { nom: "Sans boutique", uuid: "" },
        }));

        setProduits(produitsData);

        // Charger les dons
        const donsRes = await api.get<{ status: string; data: Don[] }>(
          API_ENDPOINTS.DONS.VENDEUR_DONS,
        );
        const donsData = Array.isArray(donsRes.data)
          ? donsRes.data
          : donsRes.data || [];
        setDons(donsData);

        // Charger les échanges
        const echangesRes = await api.get<{ status: string; data: Echange[] }>(
          API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES,
        );
        const echangesData = Array.isArray(echangesRes.data)
          ? echangesRes.data
          : echangesRes.data || [];
        setEchanges(echangesData);

        // Calculer les statistiques
        const boutiquesBloqueesFermees = boutiquesData.filter(
          (b) => b.est_bloque || b.est_ferme,
        ).length;
        const donsEnAttente = donsData.filter(
          (d) => !d.estPublie && !d.est_bloque,
        ).length;
        const echangesEnAttente = echangesData.filter(
          (e) => !e.estPublie,
        ).length;

        const statsData: Stats = {
          totalBoutiques: boutiquesData.length,
          boutiquesActives: boutiquesData.filter(
            (b) => b.statut === "actif" && !b.est_bloque && !b.est_ferme,
          ).length,
          boutiquesEnReview: boutiquesData.filter(
            (b) => b.statut === "en_review",
          ).length,
          boutiquesBloquees: boutiquesBloqueesFermees,
          totalProduits: produitsData.length,
          produitsPublies: produitsData.filter((p) => p.estPublie).length,
          produitsNonPublies: produitsData.filter(
            (p) => !p.estPublie && !p.estBloque,
          ).length,
          produitsBloques: produitsData.filter((p) => p.estBloque).length,
          totalDons: donsData.length,
          donsPublies: donsData.filter((d) => d.estPublie && !d.est_bloque)
            .length,
          donsBloques: donsData.filter((d) => d.est_bloque).length,
          donsEnAttente: donsEnAttente,
          totalEchanges: echangesData.length,
          echangesPublies: echangesData.filter((e) => e.estPublie).length,
          echangesBloques: 0, // À calculer si disponible
          echangesEnAttente: echangesEnAttente,
          revenusTotaux: 2500000,
          revenusMensuels: 450000,
          revenusHebdomadaires: 120000,
          commandesEnAttente: 8,
          commandesTraitees: 37,
          commandesAnnulees: 3,
          avisMoyen: 4.5,
          totalAvis: 128,
          totalFavoris: produitsData.reduce(
            (sum, p) => sum + (p.nombre_favoris || 0),
            0,
          ),
          tauxConversion: 2.8,
          panierMoyen: 12500,
        };
        setStats(statsData);

      const activities: RecentActivity[] = [
  // Activités des boutiques
  ...boutiquesData.slice(0, 2).map((boutique) => ({
    id: boutique.uuid,
    type: "boutique" as const,
    action: "Boutique créée",
    description: `Nouvelle boutique "${boutique.nom}"`,
    date: boutique.created_at,
    status: "success" as const,
    icon: faStore,
  })),

  // Activités des produits
  ...produitsData.slice(0, 3).map((produit) => ({
    id: produit.uuid,
    type: "produit" as const,
    action: produit.estPublie ? "Produit publié" : "Produit créé",
    description: `Produit "${produit.libelle}"`,
    date: produit.createdAt || new Date().toISOString(),
    status: (produit.estBloque ? "danger" : "success") as "danger" | "success",
    icon: produit.estPublie ? faGlobe : faShoppingBag,
  })),

  // Activités des dons
  ...donsData.slice(0, 2).map((don) => ({
    id: don.uuid,
    type: "don" as const,
    action: don.estPublie ? "Don publié" : "Don créé",
    description: `Don "${don.nom}"`,
    date: don.date_debut,
    status: (don.est_bloque ? "danger" : "info") as "danger" | "info",
    icon: faGift,
  })),

  // Activités des échanges
  ...echangesData.slice(0, 2).map((echange) => ({
    id: echange.uuid,
    type: "echange" as const,
    action: "Échange proposé",
    description: `Échange "${echange.nomElementEchange}"`,
    date: echange.dateProposition,
    status: "warning" as const,
    icon: faExchangeAlt,
  })),

  // Autres activités
  {
    id: "1",
    type: "commande" as const,
    action: "Nouvelle commande",
    description: "Commande #ORD-7890 reçue",
    date: new Date(Date.now() - 3600000).toISOString(),
    status: "primary" as const,
    icon: faShoppingCart,
  },
  {
    id: "2",
    type: "avis" as const,
    action: "Nouvel avis",
    description: "Avis 5 étoiles sur votre produit",
    date: new Date(Date.now() - 7200000).toISOString(),
    status: "success" as const,
    icon: faStar,
  },
].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

        setRecentActivities(activities.slice(0, 6));
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Données pour les diagrammes
  const produitStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Publiés",
        value: stats.produitsPublies,
        description: "Produits visibles en ligne",
      },
      {
        label: "Non publiés",
        value: stats.produitsNonPublies,
        description: "En attente de publication",
      },
      {
        label: "Bloqués",
        value: stats.produitsBloques,
        description: "Produits désactivés",
      },
    ];
  }, [stats]);

  const boutiqueStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Actives",
        value: stats.boutiquesActives,
        description: "Boutiques en ligne",
      },
      {
        label: "En revue",
        value: stats.boutiquesEnReview,
        description: "En attente de validation",
      },
      {
        label: "Bloquées/Fermées",
        value: stats.boutiquesBloquees,
        description: "Boutiques désactivées",
      },
    ];
  }, [stats]);

  const donsStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Publiés", value: stats.donsPublies },
      { label: "Bloqués", value: stats.donsBloques },
      { label: "En attente", value: stats.donsEnAttente },
    ];
  }, [stats]);

  const echangesStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "Publiés", value: stats.echangesPublies },
      { label: "En attente", value: stats.echangesEnAttente },
      { label: "Bloqués", value: stats.echangesBloques },
    ];
  }, [stats]);

  const performanceData = [
    { label: "Taux conversion", value: stats?.tauxConversion || 2.8 },
    { label: "Panier moyen", value: (stats?.panierMoyen || 0) / 1000 },
    { label: "Satisfaction", value: (stats?.avisMoyen || 0) * 20 },
    { label: "Produits favoris", value: (stats?.totalFavoris || 0) / 10 },
    { label: "Commandes", value: (stats?.commandesTraitees || 0) / 5 },
    { label: "Revenus", value: (stats?.revenusMensuels || 0) / 50000 },
  ];

  const monthlyRevenueData = [
    { label: "Jan", value: 1200000, sublabel: "+12%" },
    { label: "Fév", value: 1800000, sublabel: "+25%" },
    { label: "Mar", value: 1500000, sublabel: "+8%" },
    { label: "Avr", value: 2200000, sublabel: "+32%" },
    { label: "Mai", value: 1900000, sublabel: "+18%" },
    { label: "Jun", value: 2500000, sublabel: "+45%" },
    { label: "Jul", value: 2800000, sublabel: "+52%" },
  ];

  const timelineData = [
    { date: "01/01", value: 120, label: "Début d'année" },
    { date: "01/02", value: 180, label: "Pic de vente" },
    { date: "01/03", value: 150, label: "Stabilisation" },
    { date: "01/04", value: 220, label: "Promotion" },
    { date: "01/05", value: 190, label: "Post-promo" },
    { date: "01/06", value: 250, label: "Record" },
    { date: "01/07", value: 280, label: "Actuel" },
  ];

  const categoryData = [
    { label: "Électronique", value: 35 },
    { label: "Mode", value: 25 },
    { label: "Maison", value: 20 },
    { label: "Sport", value: 15 },
    { label: "Autres", value: 5 },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted fw-semibold animate-pulse">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3 py-md-4 bg-light">
      {/* En-tête avec animation */}
      <div className="row mb-4 animate-fade-in">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold mb-1 text-success">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Dashboard Vendeur
              </h1>
              <p className="text-muted mb-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                Aujourd'hui,{" "}
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2 animate-scale-hover"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <FontAwesomeIcon icon={faCalendarWeek} />
                  <span className="d-none d-md-inline">
                    {timeRange === "day" && "Aujourd'hui"}
                    {timeRange === "week" && "Cette semaine"}
                    {timeRange === "month" && "Ce mois"}
                    {timeRange === "year" && "Cette année"}
                  </span>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setTimeRange("day")}
                    >
                      Aujourd'hui
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setTimeRange("week")}
                    >
                      Cette semaine
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setTimeRange("month")}
                    >
                      Ce mois
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setTimeRange("year")}
                    >
                      Cette année
                    </button>
                  </li>
                </ul>
              </div>
              <button
                className="btn btn-primary d-flex align-items-center gap-2 animate-pulse-hover"
                onClick={() => router.push("/dashboard/produits/create")}
              >
                <FontAwesomeIcon icon={faRocket} />
                <span className="d-none d-md-inline">Lancer une vente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-lg-6">
          <StatCard
            title="Boutiques"
            value={stats?.totalBoutiques || 0}
            icon={faStore}
            color="primary"
            change={{ value: 12, isPositive: true }}
            subtitle={`${stats?.boutiquesActives || 0} actives`}
            delay={0}
          />
        </div>
        <div className="col-xl-3 col-lg-6">
          <StatCard
            title="Produits"
            value={stats?.totalProduits || 0}
            icon={faShoppingBag}
            color="success"
            change={{ value: 8, isPositive: true }}
            subtitle={`${stats?.produitsPublies || 0} publiés`}
            delay={1}
          />
        </div>
        <div className="col-xl-3 col-lg-6">
          <StatCard
            title="Revenus"
            value={`${(stats?.revenusTotaux || 0 / 1000000).toFixed(1)}M`}
            icon={faCoins}
            color="warning"
            change={{ value: 25, isPositive: true }}
            subtitle={`${(stats?.revenusMensuels || 0).toLocaleString("fr-FR")} FCFA ce mois`}
            delay={2}
          />
        </div>
        <div className="col-xl-3 col-lg-6">
          <StatCard
            title="Performance"
            value={`${stats?.tauxConversion || 0}%`}
            icon={faExchangeAlt}
            color="info"
            change={{ value: 15, isPositive: true }}
            subtitle={`Panier moyen: ${(stats?.panierMoyen || 0).toLocaleString("fr-FR")} FCFA`}
            delay={3}
          />
        </div>
      </div>

      {/* Deuxième ligne de statistiques */}
      <div className="row g-4 mb-4">
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Dons"
            value={stats?.totalDons || 0}
            icon={faGift}
            color="secondary"
            change={{ value: -3, isPositive: false }}
            subtitle={`${stats?.donsPublies || 0} publiés`}
            delay={4}
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Échanges"
            value={stats?.totalEchanges || 0}
            icon={faExchangeAlt}
            color="dark"
            change={{ value: 5, isPositive: true }}
            subtitle={`${stats?.echangesPublies || 0} publiés`}
            delay={5}
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Commandes"
            value={stats?.commandesTraitees || 0}
            icon={faShoppingCart}
            color="success"
            change={{ value: 18, isPositive: true }}
            subtitle={`${stats?.commandesEnAttente || 0} en attente`}
            delay={6}
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Avis"
            value={stats?.totalAvis || 0}
            icon={faStar}
            color="warning"
            change={{ value: 8, isPositive: true }}
            subtitle={`Note moyenne: ${stats?.avisMoyen || 0}/5`}
            delay={7}
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Favoris"
            value={stats?.totalFavoris || 0}
            icon={faHeart}
            color="danger"
            change={{ value: 22, isPositive: true }}
            subtitle={`Ajoutés par les clients`}
            delay={8}
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <StatCard
            title="Conversion"
            value={`${stats?.tauxConversion || 0}%`}
            icon={faPercent}
            color="primary"
            change={{ value: 2, isPositive: true }}
            subtitle={`Taux de conversion`}
            delay={9}
          />
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="row g-4 mb-4">
        {/* Revenus mensuels */}
        <div className="col-xl-8">
          <AnimatedBarChart
            title="Revenus mensuels (en milliers de FCFA)"
            data={monthlyRevenueData}
            color="success"
            unit="k"
            delay={0}
          />
        </div>

        {/* Performance radar */}
        <div className="col-xl-4">
          <RadarChart
            title="Performance globale"
            data={performanceData}
            maxValue={100}
            delay={1}
          />
        </div>
      </div>

      {/* Deuxième ligne de graphiques */}
      <div className="row g-4 mb-4">
        {/* Évolution des ventes */}
        <div className="col-xl-4">
          <TimelineChart
            title="Évolution des ventes"
            data={timelineData}
            delay={2}
          />
        </div>

        {/* Statut des produits */}
        <div className="col-xl-4">
          <AdvancedPieChart
            title="Statut des produits"
            data={produitStatusData}
            colors={["#28a745", "#6c757d", "#dc3545"]}
            showValues={true}
            showPercentage={true}
            innerRadius={30}
            delay={3}
          />
        </div>

        {/* Catégories de produits */}
        <div className="col-xl-4">
          <AdvancedPieChart
            title="Produits par catégorie"
            data={categoryData}
            colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]}
            showValues={true}
            showPercentage={true}
            innerRadius={40}
            delay={4}
          />
        </div>
      </div>

      {/* Troisième ligne de graphiques */}
      <div className="row g-4 mb-4">
        {/* Statut des boutiques */}
        <div className="col-xl-4">
          <AdvancedPieChart
            title="Statut des boutiques"
            data={boutiqueStatusData}
            colors={["#28a745", "#ffc107", "#dc3545"]}
            showValues={true}
            showPercentage={true}
            innerRadius={35}
            delay={5}
          />
        </div>

        {/* Statut des dons */}
        <div className="col-xl-4">
          <AdvancedPieChart
            title="Statut des dons"
            data={donsStatusData}
            colors={["#17a2b8", "#6c757d", "#ffc107"]}
            showValues={true}
            showPercentage={true}
            innerRadius={35}
            delay={6}
          />
        </div>

        {/* Statut des échanges */}
        <div className="col-xl-4">
          <AdvancedPieChart
            title="Statut des échanges"
            data={echangesStatusData}
            colors={["#20c997", "#6c757d", "#fd7e14"]}
            showValues={true}
            showPercentage={true}
            innerRadius={35}
            delay={7}
          />
        </div>
      </div>

      {/* Tableau des produits et activités */}
      <div className="row g-4 mb-4">
        {/* Produits récents */}
        <div className="col-xl-8">
          <AnimatedProductsTable products={produits.slice(0, 6)} delay={8} />
        </div>

        {/* Activité récente */}
        <div className="col-xl-4">
          <AnimatedRecentActivityCard activities={recentActivities} delay={9} />
        </div>
      </div>

      {/* Boutiques récentes */}
      <div className="row g-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-lg animate-slide-up"
            style={{ animationDelay: "1000ms" }}
          >
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <FontAwesomeIcon
                    icon={faStore}
                    className="me-2 text-primary"
                  />
                  Mes boutiques
                </h5>
                <button
                  className="btn btn-sm btn-primary animate-pulse-hover"
                  onClick={() => router.push("/dashboard/boutiques")}
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" />
                  Voir tout
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {boutiques.slice(0, 4).map((boutique, index) => (
                  <div
                    key={boutique.uuid}
                    className="col-lg-3 col-md-6"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div
                      className="card h-100 border-0 shadow-sm-hover position-relative overflow-hidden"
                      style={{
                        cursor: "pointer",
                        animation: `slideUp 0.5s ease-out ${index * 200}ms both`,
                      }}
                      onClick={() =>
                        router.push(`/dashboard/boutiques/${boutique.uuid}`)
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-8px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 15px 35px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 5px 15px rgba(0,0,0,0.1)";
                      }}
                    >
                      {/* Badge de statut */}
                      <div className="position-absolute top-0 start-0 p-2 z-1">
                        <div
                          className={`badge ${
                            boutique.statut === "actif"
                              ? "bg-success"
                              : boutique.statut === "en_review"
                                ? "bg-warning"
                                : "bg-secondary"
                          } shadow-sm`}
                        >
                          {boutique.statut === "actif" && "Actif"}
                          {boutique.statut === "en_review" && "En revue"}
                          {boutique.statut === "bloque" && "Bloqué"}
                          {boutique.statut === "ferme" && "Fermé"}
                        </div>
                      </div>

                      {/* Bannière */}
                      <div
                        className="card-img-top"
                        style={{
                          height: "120px",
                          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%), url(${boutique.banniere})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                        }}
                      >
                        {/* Overlay gradient */}
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(13,110,253,0.2) 0%, rgba(0,0,0,0) 100%)",
                          }}
                        ></div>
                      </div>

                      {/* Logo et infos */}
                      <div className="card-body text-center position-relative">
                        <div
                          className="position-relative d-inline-block"
                          style={{ marginTop: "-50px" }}
                        >
                          <div className="position-relative">
                            <img
                              src={boutique.logo}
                              alt={boutique.nom}
                              className="rounded-circle border border-4 border-white shadow-lg"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/80/cccccc/ffffff?text=B";
                              }}
                            />
                            {/* Animation autour du logo */}
                            <div
                              className="position-absolute top-0 start-0 w-100 h-100 rounded-circle border border-2 border-primary"
                              style={{
                                animation: "pulseRing 2s infinite",
                              }}
                            ></div>
                          </div>
                        </div>
                        <h6 className="mt-3 mb-1 fw-bold">{boutique.nom}</h6>
                        <p className="text-muted small mb-2">
                          <FontAwesomeIcon icon={faTag} className="me-1" />
                          {boutique.type_boutique.libelle}
                        </p>
                        <div className="d-flex justify-content-center gap-2 mt-2">
                          {boutique.est_bloque && (
                            <span className="badge bg-danger animate-pulse">
                              <FontAwesomeIcon icon={faBan} className="me-1" />
                              Bloqué
                            </span>
                          )}
                          {boutique.est_ferme && (
                            <span className="badge bg-warning">
                              <FontAwesomeIcon icon={faLock} className="me-1" />
                              Fermé
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer avec statistiques */}
                      <div className="card-footer bg-transparent border-0 py-2">
                        <div className="d-flex justify-content-around text-center">
                          <div>
                            <div className="fw-bold text-primary">
                              {boutique.produits_count || 0}
                            </div>
                            <small className="text-muted">Produits</small>
                          </div>
                          <div>
                            <div className="fw-bold text-success">
                              {Math.round(Math.random() * 100)}
                            </div>
                            <small className="text-muted">Ventes</small>
                          </div>
                          <div>
                            <div className="fw-bold text-warning">
                              {Math.round(Math.random() * 50)}
                            </div>
                            <small className="text-muted">Vues</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="row g-4 mt-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-lg animate-slide-up"
            style={{ animationDelay: "1100ms" }}
          >
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <FontAwesomeIcon icon={faBolt} className="me-2 text-warning" />
                Actions rapides
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  {
                    icon: faStore,
                    label: "Nouvelle boutique",
                    color: "primary",
                    action: "/dashboard/boutiques/create",
                    description: "Créez une nouvelle boutique",
                  },
                  {
                    icon: faPlus,
                    label: "Nouveau produit",
                    color: "success",
                    action: "/dashboard/produits/create",
                    description: "Ajoutez un produit à vendre",
                  },
                  {
                    icon: faGift,
                    label: "Nouveau don",
                    color: "warning",
                    action: "/dashboard/dons/create",
                    description: "Proposez un don gratuit",
                  },
                  {
                    icon: faExchangeAlt,
                    label: "Nouvel échange",
                    color: "info",
                    action: "/dashboard/echanges/create",
                    description: "Proposez un échange",
                  },
                  {
                    icon: faChartLine,
                    label: "Analytiques",
                    color: "dark",
                    action: "/dashboard/analytics",
                    description: "Consultez vos statistiques",
                  },
                  {
                    icon: faUsers,
                    label: "Clients",
                    color: "secondary",
                    action: "/dashboard/clients",
                    description: "Gérez vos clients",
                  },
                ].map((item, index) => (
                  <div key={index} className="col-xl-2 col-md-4 col-6">
                    <button
                      className={`btn btn-outline-${item.color} w-100 d-flex flex-column align-items-center py-3 h-100 animate-scale-hover`}
                      onClick={() => router.push(item.action)}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        transform: "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <div
                        className={`rounded-circle p-3 bg-${item.color} bg-opacity-10 text-${item.color} mb-2`}
                      >
                        <FontAwesomeIcon icon={item.icon} className="fs-3" />
                      </div>
                      <span className="fw-semibold">{item.label}</span>
                      <small className="text-muted mt-1 text-center">
                        {item.description}
                      </small>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS globaux pour les animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes progressBarFill {
          from {
            width: 0%;
          }
          to {
            width: var(--target-width);
          }
        }

        @keyframes barGrow {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }

        @keyframes sector {
          from {
            transform: rotate(0deg) scale(0);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes radar {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes lineDraw {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes areaFill {
          from {
            fill-opacity: 0;
          }
          to {
            fill-opacity: 0.2;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes scaleHover {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-left {
          animation: slideLeft 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-right {
          animation: slideRight 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-count-up {
          animation: countUp 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-pulse-hover:hover {
          animation: pulse 0.5s ease-in-out;
        }

        .animate-scale-hover:hover {
          animation: scaleHover 0.3s ease-out;
        }

        .animate-bar {
          animation: fadeIn 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-bar-grow {
          animation: barGrow 0.8s ease-out;
          animation-fill-mode: both;
          transform-origin: center bottom;
        }

        .animate-sector {
          animation: sector 0.8s ease-out;
          animation-fill-mode: both;
          transform-origin: center;
        }

        .animate-radar {
          animation: radar 1.5s ease-out;
          animation-fill-mode: both;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .animate-line-draw {
          animation: lineDraw 2s ease-out;
          animation-fill-mode: both;
        }

        .animate-area-fill {
          animation: areaFill 1s ease-out 0.5s;
          animation-fill-mode: both;
        }

        .animate-point {
          animation: fadeIn 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-ripple {
          animation: ripple 1s ease-out infinite;
        }

        .text-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .shadow-sm-hover {
          transition: all 0.3s ease;
        }

        .shadow-sm-hover:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-item:not(:last-child):before {
          content: "";
          position: absolute;
          left: 24px;
          top: 40px;
          bottom: -20px;
          width: 2px;
          background: linear-gradient(to bottom, #dee2e6, transparent);
        }

        .progress {
          background-color: rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .btn-outline-primary {
          border-width: 2px;
        }

        .badge {
          transition: all 0.3s ease;
        }

        .table-hover tbody tr {
          transition: all 0.3s ease;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .bg-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default VendeurDashboard;
