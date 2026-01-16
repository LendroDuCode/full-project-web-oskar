// components/SupportTicketsSection.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faExclamationCircle,
  faClock,
  faCheckCircle,
  faFire,
  faUser,
  faBug,
  faBan,
  faTruck,
  faFlag,
  faUndo,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import colors from "@/app/shared/constants/colors";

interface Ticket {
  id: number;
  priority: "high" | "medium" | "low";
  subject: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHandle: string;
  lastMessage: string;
  lastMessageTime: string;
  status: "nouveau" | "encours" | "resolu";
  category?: string;
}

interface SupportTicketsSectionProps {
  className?: string;
  onSelectTicket?: (ticket: Ticket) => void;
  onTabChange?: (tab: "nouveaux" | "encours" | "resolus") => void;
  activeTab?: "nouveaux" | "encours" | "resolus";
}

export default function SupportTicketsSection({
  className = "",
  onSelectTicket,
  onTabChange,
  activeTab: externalTab,
}: SupportTicketsSectionProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<
    "nouveaux" | "encours" | "resolus"
  >("nouveaux");
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  // Utiliser le tab externe s'il est fourni, sinon le tab interne
  const activeTab = externalTab || internalActiveTab;

  const tabs = [
    { id: "nouveaux", label: "Nouveaux (Prioritaire)", count: 8, icon: faFire },
    { id: "encours", label: "En cours", count: 12, icon: faClock },
    { id: "resolus", label: "Résolus", count: 156, icon: faCheckCircle },
  ] as const;

  const tickets: Ticket[] = [
    {
      id: 1,
      priority: "high",
      subject: "Arnaque détectée",
      ticketNumber: "#TK-2847",
      userId: "user_001",
      userName: "Moussa Traoré",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
      userHandle: "@mtraoré",
      lastMessage: "Il y a 30 min",
      lastMessageTime: "Aujourd'hui à 14:32",
      status: "nouveau",
      category: "sécurité",
    },
    {
      id: 2,
      priority: "high",
      subject: "Bug technique paiement",
      ticketNumber: "#TK-2846",
      userId: "user_002",
      userName: "Amina Diallo",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      userHandle: "@adiallo",
      lastMessage: "Il y a 1 heure",
      lastMessageTime: "Aujourd'hui à 14:02",
      status: "nouveau",
      category: "technique",
    },
    {
      id: 3,
      priority: "medium",
      subject: "Compte bloqué par erreur",
      ticketNumber: "#TK-2845",
      userId: "user_003",
      userName: "Kofi Mensah",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg",
      userHandle: "@kmensah",
      lastMessage: "Il y a 2 heures",
      lastMessageTime: "Aujourd'hui à 13:15",
      status: "nouveau",
      category: "compte",
    },
    {
      id: 4,
      priority: "medium",
      subject: "Problème de livraison",
      ticketNumber: "#TK-2844",
      userId: "user_004",
      userName: "Fatou Camara",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg",
      userHandle: "@fcamara",
      lastMessage: "Il y a 3 heures",
      lastMessageTime: "Aujourd'hui à 12:45",
      status: "nouveau",
      category: "livraison",
    },
    {
      id: 5,
      priority: "high",
      subject: "Contenu inapproprié signalé",
      ticketNumber: "#TK-2843",
      userId: "user_005",
      userName: "Ibrahim Sow",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
      userHandle: "@isow",
      lastMessage: "Il y a 4 heures",
      lastMessageTime: "Aujourd'hui à 11:20",
      status: "nouveau",
      category: "modération",
    },
    {
      id: 6,
      priority: "medium",
      subject: "Remboursement demandé",
      ticketNumber: "#TK-2842",
      userId: "user_006",
      userName: "Yacine Ouedraogo",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
      userHandle: "@youedraogo",
      lastMessage: "Il y a 5 heures",
      lastMessageTime: "Aujourd'hui à 10:30",
      status: "nouveau",
      category: "financier",
    },
    {
      id: 7,
      priority: "medium",
      subject: "Question sur certification",
      ticketNumber: "#TK-2841",
      userId: "user_007",
      userName: "Sekou Touré",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg",
      userHandle: "@stoure",
      lastMessage: "Il y a 6 heures",
      lastMessageTime: "Aujourd'hui à 09:15",
      status: "nouveau",
      category: "certification",
    },
    {
      id: 8,
      priority: "high",
      subject: "Fraude suspectée",
      ticketNumber: "#TK-2840",
      userId: "user_008",
      userName: "Mariama Sy",
      userAvatar:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
      userHandle: "@msy",
      lastMessage: "Il y a 7 heures",
      lastMessageTime: "Aujourd'hui à 08:45",
      status: "nouveau",
      category: "sécurité",
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "nouveaux") return ticket.status === "nouveau";
    if (activeTab === "encours") return ticket.status === "encours";
    if (activeTab === "resolus") return ticket.status === "resolu";
    return true;
  });

  const handleTabClick = (tabId: "nouveaux" | "encours" | "resolus") => {
    if (!externalTab) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket.id);
    onSelectTicket?.(ticket);
  };

  const getPriorityColor = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "high":
        return "#EF4444"; // rouge
      case "medium":
        return "#3B82F6"; // bleu
      case "low":
        return "#10B981"; // vert
      default:
        return colors.oskar.grey;
    }
  };

  const getPriorityIcon = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "high":
        return faFire;
      case "medium":
        return faExclamationCircle;
      case "low":
        return faCircle;
      default:
        return faCircle;
    }
  };

  const getStatusConfig = (status: Ticket["status"]) => {
    switch (status) {
      case "nouveau":
        return {
          bg: "#FEE2E2",
          text: "#991B1B",
          label: "Nouveau",
        };
      case "encours":
        return {
          bg: "#DBEAFE",
          text: "#1E40AF",
          label: "En cours",
        };
      case "resolu":
        return {
          bg: "#D1FAE5",
          text: "#065F46",
          label: "Résolu",
        };
      default:
        return {
          bg: colors.oskar.lightGrey,
          text: colors.oskar.grey,
          label: "Inconnu",
        };
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "sécurité":
        return faShieldAlt;
      case "technique":
        return faBug;
      case "compte":
        return faUser;
      case "livraison":
        return faTruck;
      case "modération":
        return faFlag;
      case "financier":
        return faUndo;
      case "certification":
        return faCheckCircle;
      default:
        return faExclamationCircle;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "sécurité":
        return "#EF4444";
      case "technique":
        return "#3B82F6";
      case "compte":
        return "#8B5CF6";
      case "livraison":
        return "#F59E0B";
      case "modération":
        return "#EC4899";
      case "financier":
        return "#10B981";
      case "certification":
        return "#6366F1";
      default:
        return colors.oskar.grey;
    }
  };

  return (
    <div className={`d-flex flex-column h-100 ${className}`}>
      {/* Onglets de filtre */}
      <div className="bg-white border-bottom border-light px-4 py-3">
        <div className="d-flex gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`btn btn-link text-decoration-none position-relative pb-2 px-3 d-flex align-items-center gap-2 ${
                  isActive ? "fw-semibold" : "fw-medium"
                }`}
                style={{
                  color: isActive ? colors.oskar.green : colors.oskar.grey,
                  borderBottom: `2px solid ${isActive ? colors.oskar.green : "transparent"}`,
                  transition: "all 0.2s ease",
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = colors.oskar.black;
                    e.currentTarget.style.borderBottomColor =
                      colors.oskar.lightGrey;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = colors.oskar.grey;
                    e.currentTarget.style.borderBottomColor = "transparent";
                  }
                }}
              >
                <FontAwesomeIcon icon={Icon} style={{ fontSize: "0.875rem" }} />
                {tab.label}
                <span
                  className="badge rounded-pill ms-2"
                  style={{
                    backgroundColor: isActive
                      ? tab.id === "nouveaux"
                        ? "#FEE2E2"
                        : tab.id === "encours"
                          ? "#DBEAFE"
                          : "#D1FAE5"
                      : colors.oskar.lightGrey,
                    color: isActive
                      ? tab.id === "nouveaux"
                        ? "#991B1B"
                        : tab.id === "encours"
                          ? "#1E40AF"
                          : "#065F46"
                      : colors.oskar.grey,
                    fontSize: "0.625rem",
                    padding: "0.125rem 0.5rem",
                    fontWeight: "700",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="flex-grow-1 overflow-auto bg-light p-4">
        <div className="bg-white rounded-3 border border-light overflow-hidden">
          {/* En-tête du tableau */}
          <div className="bg-light border-bottom border-light">
            <div className="row g-0 px-4 py-3">
              <div className="col-md-1">
                <small className="text-uppercase fw-semibold text-muted">
                  Priorité
                </small>
              </div>
              <div className="col-md-3">
                <small className="text-uppercase fw-semibold text-muted">
                  Sujet
                </small>
              </div>
              <div className="col-md-3">
                <small className="text-uppercase fw-semibold text-muted">
                  Utilisateur
                </small>
              </div>
              <div className="col-md-3">
                <small className="text-uppercase fw-semibold text-muted">
                  Dernier message
                </small>
              </div>
              <div className="col-md-2">
                <small className="text-uppercase fw-semibold text-muted">
                  Statut
                </small>
              </div>
            </div>
          </div>

          {/* Corps du tableau */}
          <div className="divide-y divide-light">
            {filteredTickets.map((ticket) => {
              const priorityColor = getPriorityColor(ticket.priority);
              const PriorityIcon = getPriorityIcon(ticket.priority);
              const statusConfig = getStatusConfig(ticket.status);
              const CategoryIcon = getCategoryIcon(ticket.category);
              const categoryColor = getCategoryColor(ticket.category);
              const isSelected = selectedTicket === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className={`row g-0 px-4 py-3 align-items-center cursor-pointer ${
                    isSelected ? "bg-success bg-opacity-10" : "hover-bg-light"
                  }`}
                  style={{
                    transition: "background-color 0.2s ease",
                    borderLeft: isSelected
                      ? `3px solid ${colors.oskar.green}`
                      : "3px solid transparent",
                  }}
                  onClick={() => handleTicketClick(ticket)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        colors.oskar.lightGrey;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "";
                    }
                  }}
                >
                  {/* Priorité */}
                  <div className="col-md-1 mb-2 mb-md-0">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon
                        icon={PriorityIcon}
                        style={{
                          color: priorityColor,
                          fontSize: "0.75rem",
                        }}
                      />
                      <div
                        className="rounded-circle"
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: priorityColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sujet */}
                  <div className="col-md-3 mb-2 mb-md-0">
                    <div className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon
                        icon={CategoryIcon}
                        style={{
                          color: categoryColor,
                          fontSize: "0.875rem",
                          opacity: 0.8,
                        }}
                      />
                      <div>
                        <p
                          className="fw-semibold mb-1"
                          style={{ color: colors.oskar.black }}
                        >
                          {ticket.subject}
                        </p>
                        <p className="small text-muted mb-0">
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Utilisateur */}
                  <div className="col-md-3 mb-2 mb-md-0">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle overflow-hidden"
                        style={{ width: "36px", height: "36px", flexShrink: 0 }}
                      >
                        <img
                          src={ticket.userAvatar}
                          alt={ticket.userName}
                          className="w-100 h-100 object-cover"
                        />
                      </div>
                      <div>
                        <p
                          className="fw-medium mb-1 small"
                          style={{ color: colors.oskar.black }}
                        >
                          {ticket.userName}
                        </p>
                        <p className="small text-muted mb-0">
                          {ticket.userHandle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dernier message */}
                  <div className="col-md-3 mb-2 mb-md-0">
                    <div>
                      <p
                        className="small mb-1"
                        style={{ color: colors.oskar.black }}
                      >
                        {ticket.lastMessage}
                      </p>
                      <p className="small text-muted mb-0">
                        {ticket.lastMessageTime}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="col-md-2">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.text,
                        fontSize: "0.75rem",
                        padding: "0.375rem 0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Message si aucun ticket */}
            {filteredTickets.length === 0 && (
              <div className="text-center py-5">
                <div className="mb-3">
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: colors.oskar.lightGrey,
                      color: colors.oskar.grey,
                      fontSize: "1.5rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </div>
                <h5
                  className="fw-semibold mb-2"
                  style={{ color: colors.oskar.black }}
                >
                  Aucun ticket {activeTab}
                </h5>
                <p className="text-muted small">
                  {activeTab === "nouveaux" &&
                    "Tous les nouveaux tickets ont été traités."}
                  {activeTab === "encours" &&
                    "Aucun ticket en cours de traitement."}
                  {activeTab === "resolus" && "Aucun ticket résolu à afficher."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-4 px-2">
            <div className="text-muted small">
              Affichage de{" "}
              <span className="fw-semibold">1 à {filteredTickets.length}</span>{" "}
              tickets
            </div>
            <nav aria-label="Navigation des tickets">
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link" aria-label="Précédent">
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>
                <li className="page-item active">
                  <button className="page-link">1</button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link">3</button>
                </li>
                <li className="page-item">
                  <button className="page-link" aria-label="Suivant">
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
