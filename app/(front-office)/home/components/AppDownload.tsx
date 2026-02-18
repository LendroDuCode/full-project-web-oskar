// AppDownload.tsx
"use client";

import colors from "@/app/shared/constants/colors";

const AppDownload = () => {
  const handleAppStoreClick = () => {
    console.log("Bouton App Store cliqué");
    // window.open("https://apps.apple.com/app/id123456", "_blank");
  };

  const handlePlayStoreClick = () => {
    console.log("Bouton Google Play cliqué");
    // window.open("https://play.google.com/store/apps/details?id=com.oskar.app", "_blank");
  };

  return (
    <section
      id="app-download"
      className="bg-white py-5 border-top"
      style={{ borderTop: `1px solid ${colors.oskar.lightGrey}` }}
    >
      <div className="container">
        <div
          className="rounded-4 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.oskar.green} 0%, ${colors.oskar.greenHover || "#3D8B40"} 100%)`,
          }}
        >
          <div className="row g-0 align-items-center">
            {/* Contenu texte */}
            <div className="col-md-6">
              <div className="p-4 p-md-5 text-white">
                <h2 className="display-5 fw-bold mb-3">
                  Obtenez l'application mobile OSKAR
                </h2>
                <p
                  className="fs-5 mb-4"
                  style={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  Parcourez, publiez et gérez vos annonces en déplacement.
                  Téléchargez maintenant pour iOS et Android.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3">
                  {/* Bouton App Store */}
                  <button
                    onClick={handleAppStoreClick}
                    className="btn d-flex align-items-center justify-content-center p-3"
                    style={{
                      backgroundColor: "white",
                      color: colors.oskar.black,
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      gap: "12px",
                      transition: "all 0.3s ease",
                      minWidth: "200px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <i className="fa-brands fa-apple fs-2"></i>
                    <div className="text-start">
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "0.75rem",
                          color: colors.oskar.grey,
                        }}
                      >
                        Télécharger sur
                      </p>
                      <p
                        className="mb-0 fw-bold"
                        style={{ fontSize: "0.875rem" }}
                      >
                        l'App Store
                      </p>
                    </div>
                  </button>

                  {/* Bouton Google Play */}
                  <button
                    onClick={handlePlayStoreClick}
                    className="btn d-flex align-items-center justify-content-center p-3"
                    style={{
                      backgroundColor: "white",
                      color: colors.oskar.black,
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      gap: "12px",
                      transition: "all 0.3s ease",
                      minWidth: "200px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <i className="fa-brands fa-google-play fs-2"></i>
                    <div className="text-start">
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "0.75rem",
                          color: colors.oskar.grey,
                        }}
                      >
                        Disponible sur
                      </p>
                      <p
                        className="mb-0 fw-bold"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Google Play
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="col-md-6">
              <div style={{ height: "384px" }}>
                <img
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c69a610a4f-b3837662c836b73af48a.png"
                  alt="Personne utilisant l'application mobile OSKAR sur smartphone"
                  className="w-100 h-100 object-fit-cover"
                  style={{ objectPosition: "center" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
