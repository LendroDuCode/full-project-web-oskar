import { Card, Button, Badge, Image } from "react-bootstrap";

export default function ActivityFeedSection() {
  const activities = [
    {
      id: 1,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      name: "Modérateur A",
      action: "a certifié le compte particulier de",
      target: "'Moussa T.'",
      targetColor: "primary",
      time: "Il y a 3 minutes",
      badgeText: "Certification CNI",
      badgeColor: "success",
      badgeBg: "bg-success-subtle",
      icon: "fa-certificate",
      iconColor: "text-primary",
    },
    {
      id: 2,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      name: "Sarah Koné",
      action: "a validé l'annonce",
      target: '"MacBook Pro 2021"',
      targetColor: "primary",
      time: "Il y a 8 minutes",
      badgeText: "Vente",
      badgeColor: "primary",
      badgeBg: "bg-primary-subtle",
      icon: "fa-check-circle",
      iconColor: "text-success",
    },
    {
      id: 3,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
      name: "Ibrahim Sow",
      action: "a certifié le compte professionnel de",
      target: "'TechStore SARL'",
      targetColor: "warning",
      time: "Il y a 15 minutes",
      badgeText: "Certification RCCM",
      badgeColor: "warning",
      badgeBg: "bg-warning-subtle",
      icon: "fa-building",
      iconColor: "text-warning",
    },
    {
      id: 4,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      name: "Aïcha Diop",
      action: "a refusé l'annonce",
      target: '"Produit contrefait"',
      targetColor: "danger",
      time: "Il y a 22 minutes",
      badgeText: "Refusée",
      badgeColor: "danger",
      badgeBg: "bg-danger-subtle",
      icon: "fa-times-circle",
      iconColor: "text-danger",
    },
    {
      id: 5,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
      name: "Mamadou Bah",
      action: "a traité un signalement pour",
      target: '"Comportement inapproprié"',
      targetColor: "dark",
      time: "Il y a 35 minutes",
      badgeText: "Signalement",
      badgeColor: "warning",
      badgeBg: "bg-warning-subtle",
      icon: "fa-flag",
      iconColor: "text-warning",
    },
    {
      id: 6,
      avatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      name: "Fatoumata Keita",
      action: "a validé l'annonce",
      target: '"Don de vêtements"',
      targetColor: "primary",
      time: "Il y a 1 heure",
      badgeText: "Don",
      badgeColor: "purple",
      badgeBg: "bg-purple-subtle",
      icon: "fa-check-circle",
      iconColor: "text-success",
    },
  ];

  return (
    <Card className="border border-gray-200 rounded-3">
      <Card.Body className="p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <Card.Title className="h5 fw-bold text-dark-gray mb-0">
            Flux d'Activité de l'Équipe
          </Card.Title>
          <Button
            variant="link"
            className="text-decoration-none p-0 text-success fw-semibold"
          >
            Voir tout
          </Button>
        </div>

        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 hover-bg-light-gray transition-all"
            >
              <Image
                src={activity.avatar}
                alt="Avatar"
                roundedCircle
                width={48}
                height={48}
                className="object-fit-cover flex-shrink-0"
              />

              <div className="flex-grow-1">
                <p className="small text-dark mb-2">
                  <span className="fw-bold">{activity.name}</span>{" "}
                  {activity.action}{" "}
                  <span className={`fw-semibold text-${activity.targetColor}`}>
                    {activity.target}
                  </span>
                </p>

                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted small">{activity.time}</span>
                  <Badge
                    className={`${activity.badgeBg} text-${activity.badgeColor} border-0 small fw-medium px-2 py-1`}
                  >
                    {activity.badgeText}
                  </Badge>
                </div>
              </div>

              <i
                className={`fas ${activity.icon} ${activity.iconColor} fs-5 mt-1`}
              ></i>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
