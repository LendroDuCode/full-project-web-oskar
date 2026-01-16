"use client";

interface WelcomeSectionProps {
  userName?: string;
  greeting?: string;
  subtitle?: string;
  showDate?: boolean;
}

export default function WelcomeSection({
  userName = "Amadou Diallo",
  greeting = "Bonjour",
  subtitle = "Voici un aperçu de vos tâches de modération en attente",
  showDate = true,
}: WelcomeSectionProps) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section id="welcome-section" className="mb-4 mb-md-5">
      <div className="row align-items-center">
        {/* Colonne gauche : Titre et message */}
        <div className="col-12 col-md-8 col-lg-9">
          <h1 className="display-6 fw-bold text-dark mb-2">
            {greeting}, <span className="text-success">{userName}</span>
          </h1>
          {subtitle && <p className="lead text-muted mb-0">{subtitle}</p>}
        </div>

        {/* Colonne droite : Date (optionnelle) */}
        {showDate && (
          <div className="col-12 col-md-4 col-lg-3 mt-3 mt-md-0">
            <div className="card border-0 bg-light shadow-sm">
              <div className="card-body d-flex align-items-center justify-content-center gap-2 py-2">
                <i className="fa-regular fa-calendar text-muted fs-5"></i>
                <span className="text-dark fw-medium">{formattedDate}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
