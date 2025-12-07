import React from "react";
import colors from "../../../shared/constants/colors";

interface SavedSearch {
  id: string;
  title: string;
  description: string;
  status: "active" | "paused";
  iconBg: string;
}

const SavedSearchesSection: React.FC = () => {
  const savedSearches: SavedSearch[] = [
    {
      id: "1",
      title: "Téléphones Samsung à Cocody",
      description: "Prix : 150 000 - 300 000 FCFA • État : Comme neuf",
      status: "active",
      iconBg: colors.oskar.orange,
    },
    {
      id: "2",
      title: "Meubles pour échange à Abidjan",
      description: "Catégorie: Maison et meubles • Type: Échange",
      status: "active",
      iconBg: colors.oskar.blue,
    },
    {
      id: "3",
      title: "Ordinateurs portables de moins de 200 000 FCFA",
      description: "Catégorie : Electronique • Prix max : 200 000 FCFA",
      status: "paused",
      iconBg: colors.oskar.green,
    },
  ];

  const handleCreateAlert = () => {
    console.log("Créer une nouvelle alerte");
  };

  const handleEditSearch = (searchId: string) => {
    console.log("Modifier la recherche:", searchId);
  };

  const handleDeleteSearch = (searchId: string) => {
    console.log("Supprimer la recherche:", searchId);
  };

  return (
    <section
      id="saved-searches-section"
      className="py-5"
      style={{
        backgroundColor: colors.oskar.lightGrey,
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="container">
        <div
          className="bg-white rounded-3 shadow-lg p-5"
          style={{
            borderRadius: "16px",
            padding: "2rem",
          }}
        >
          {/* En-tête */}
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h2
                className="h2 fw-bold mb-2"
                style={{
                  fontSize: "1.875rem",
                  color: colors.oskar.black,
                }}
              >
                Recherches sauvegardées
              </h2>
              <p style={{ color: colors.oskar.grey, margin: 0 }}>
                Recevez une notification lorsque de nouveaux articles
                correspondent à vos critères
              </p>
            </div>
            <button
              className="btn text-white fw-semibold d-flex align-items-center gap-2 border-0"
              style={{
                backgroundColor: colors.oskar.orange,
                borderRadius: "8px",
                padding: "12px 24px",
              }}
              onClick={handleCreateAlert}
            >
              <i className="fa-solid fa-bell"></i>
              <span>Créer une alerte</span>
            </button>
          </div>

          {/* Liste des recherches */}
          <div>
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="d-flex justify-content-between align-items-center p-4 mb-3 rounded-3 transition-all"
                style={{
                  backgroundColor: colors.oskar.lightGrey,
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Partie gauche */}
                <div className="d-flex align-items-center gap-4">
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: search.iconBg,
                      borderRadius: "8px",
                    }}
                  >
                    <i className="fa-solid fa-search text-white"></i>
                  </div>
                  <div>
                    <h3
                      className="fw-bold mb-1"
                      style={{
                        fontSize: "1rem",
                        color: colors.oskar.black,
                      }}
                    >
                      {search.title}
                    </h3>
                    <p
                      className="small mb-0"
                      style={{
                        color: colors.oskar.grey,
                        fontSize: "0.875rem",
                      }}
                    >
                      {search.description}
                    </p>
                  </div>
                </div>

                {/* Partie droite */}
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-pill small fw-semibold d-flex align-items-center"
                    style={{
                      backgroundColor:
                        search.status === "active" ? "#dcfce7" : "#f3f4f6",
                      color:
                        search.status === "active"
                          ? colors.oskar.green
                          : colors.oskar.grey,
                    }}
                  >
                    {search.status === "active" ? (
                      <>
                        <i className="fa-solid fa-bell me-1"></i>
                        Active
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-bell-slash me-1"></i>
                        En pause
                      </>
                    )}
                  </span>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-link p-0 border-0"
                      style={{ color: colors.oskar.grey }}
                      onClick={() => handleEditSearch(search.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.oskar.orange;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.oskar.grey;
                      }}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>

                    <button
                      className="btn btn-link p-0 border-0"
                      style={{ color: colors.oskar.grey }}
                      onClick={() => handleDeleteSearch(search.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.oskar.grey;
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavedSearchesSection;
