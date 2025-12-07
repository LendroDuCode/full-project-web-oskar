// QuickStats.tsx
"use client";

import colors from "../../../shared/constants/colors";

interface StatItem {
  id: number;
  value: string;
  label: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

const QuickStats = () => {
  const stats: StatItem[] = [
    {
      id: 1,
      value: "2,847",
      label: "Annonces actives",
      icon: "fa-box-open",
      iconBgColor: "rgba(76, 175, 80, 0.1)", // Vert clair
      iconColor: colors.oskar.green,
    },
    {
      id: 2,
      value: "1,245",
      label: "Transactions réussies",
      icon: "fa-handshake",
      iconBgColor: "rgba(76, 175, 80, 0.1)", // Vert clair
      iconColor: colors.oskar.green,
    },
    {
      id: 3,
      value: "8,532",
      label: "Utilisateurs actifs",
      icon: "fa-users",
      iconBgColor: "rgba(76, 175, 80, 0.1)", // Vert clair
      iconColor: colors.oskar.green,
    },
    {
      id: 4,
      value: "15,678",
      label: "Articles sauvegardés",
      icon: "fa-heart",
      iconBgColor: "rgba(76, 175, 80, 0.1)", // Vert clair
      iconColor: colors.oskar.green,
    },
  ];

  return (
    <section
      id="quick-stats"
      className="quick-stats-section"
      style={{
        backgroundColor: "white",
        borderTop: `1px solid ${colors.oskar.lightGrey}`,
      }}
    >
      <div className="container">
        <div className="row g-4 g-md-5">
          {stats.map((stat) => (
            <div key={stat.id} className="col-6 col-md-3">
              <div className="stat-card text-center">
                {/* Icône */}
                <div
                  className="stat-icon-wrapper mx-auto mb-3"
                  style={{ backgroundColor: stat.iconBgColor }}
                >
                  <i
                    className={`fa-solid ${stat.icon} stat-icon`}
                    style={{ color: stat.iconColor }}
                  />
                </div>

                {/* Valeur */}
                <p
                  className="stat-value mb-1"
                  style={{ color: colors.oskar.black }}
                >
                  {stat.value}
                </p>

                {/* Label */}
                <p className="stat-label" style={{ color: colors.oskar.grey }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .quick-stats-section {
          padding: 3rem 0;
        }

        .stat-card {
          padding: 1rem 0.5rem;
        }

        .stat-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover .stat-icon-wrapper {
          transform: scale(1.05);
        }

        .stat-icon {
          font-size: 1.75rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.9375rem;
          line-height: 1.4;
          margin: 0;
        }

        @media (min-width: 768px) {
          .quick-stats-section {
            padding: 3.5rem 0;
          }

          .stat-value {
            font-size: 2.25rem;
          }

          .stat-icon-wrapper {
            width: 70px;
            height: 70px;
          }

          .stat-icon {
            font-size: 2rem;
          }
        }

        @media (min-width: 992px) {
          .quick-stats-section {
            padding: 4rem 0;
          }

          .stat-value {
            font-size: 2.5rem;
          }

          .stat-icon-wrapper {
            width: 76px;
            height: 76px;
          }

          .stat-icon {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </section>
  );
};

export default QuickStats;
