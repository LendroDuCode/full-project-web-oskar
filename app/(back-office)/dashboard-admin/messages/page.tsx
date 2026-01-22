// app/(back-office)/dashboard-admin/messages/liste-messages/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEnvelopeOpen,
  faPaperPlane,
  faUser,
  faUserTie,
  faStore,
  faUsers,
  faSearch,
  faFilter,
  faCalendar,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faTrash,
  faReply,
  faArchive,
  faEye,
  faMessage,
  faCommentDots,
  faChevronRight,
  faChevronLeft,
  faPlus,
  faSort,
  faSortUp,
  faSortDown,
  faCheckSquare,
  faSquare,
  faBan,
  faUserCheck,
  faUserSlash,
  faCheck,
  faTimes,
  faLock,
  faLockOpen,
  faUserShield,
  faEdit,
  faUserTag,
  faPhone,
  faCircle,
  faCircleCheck,
  faCircleExclamation,
  faArrowRight,
  faInbox,
  faShareSquare,
  faHistory,
  faInfoCircle,
  faEllipsisVertical,
  faChevronDown,
  faChevronUp,
  faCalendarDays,
  faUserPen,
  faBuilding,
  faBell,
  faEnvelopeCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

// Types pour les utilisateurs
interface UtilisateurBase {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  civilite_uuid?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted: boolean;
  is_admin?: boolean;
  type?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  code?: string;
  avatar?: string;
  statut?: string;
}

interface Agent extends UtilisateurBase {}
interface Vendeur extends UtilisateurBase {}
interface Utilisateur extends UtilisateurBase {}

interface Message {
  uuid: string;
  sujet: string;
  contenu: string;
  expediteurNom: string;
  expediteurEmail: string;
  destinataireEmail: string;
  type: string;
  estEnvoye: boolean;
  envoyeLe: string;
  estLu: boolean;
  dateLecture: string | null;
  dateCreation?: string;
}

// Type pour la réponse de l'API des messages reçus
interface MessageReceived {
  uuid: string;
  message: Message;
  statut: string;
  estLu: boolean;
  dateLecture?: string;
  dateReception: string;
}

// Composant de badge de statut
const StatusBadge = ({
  est_bloque,
  est_verifie,
  is_deleted,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
  is_deleted?: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faTrash} className="fs-12" />
        <span className="fw-medium">Supprimé</span>
      </span>
    );
  }

  if (est_bloque) {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faBan} className="fs-12" />
        <span className="fw-medium">Bloqué</span>
      </span>
    );
  }

  if (!est_verifie) {
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faUserSlash} className="fs-12" />
        <span className="fw-medium">Non vérifié</span>
      </span>
    );
  }

  return (
    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
      <FontAwesomeIcon icon={faUserCheck} className="fs-12" />
      <span className="fw-medium">Actif</span>
    </span>
  );
};

// Composant pour afficher un message dans la liste
const MessageItem = ({
  message,
  isSelected,
  onSelect,
  showSeparator = false,
}: {
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
  showSeparator?: boolean;
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date inconnue";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return "à l'instant";
      } else if (diffMins < 60) {
        return `il y a ${diffMins} min`;
      } else if (diffHours < 24) {
        return `il y a ${diffHours} h`;
      } else if (diffDays < 7) {
        return `il y a ${diffDays} j`;
      } else {
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      return "Date inconnue";
    }
  };

  const getTypeColor = () => {
    const type = (message.type || "").toUpperCase();
    switch (type) {
      case "ALERT":
        return "danger";
      case "WARNING":
        return "warning";
      case "INFO":
        return "info";
      case "NOTIFICATION":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = () => {
    const type = (message.type || "").toUpperCase();
    switch (type) {
      case "ALERT":
        return faBell;
      case "WARNING":
        return faExclamationCircle;
      case "INFO":
        return faInfoCircle;
      case "NOTIFICATION":
        return faEnvelopeCircleCheck;
      default:
        return faEnvelope;
    }
  };

  return (
    <>
      {showSeparator && (
        <div className="separator d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="px-3 text-muted fs-12 fw-medium">
            <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
            Messages plus anciens
          </span>
          <hr className="flex-grow-1" />
        </div>
      )}

      <div
        className={`list-group-item list-group-item-action border-0 py-3 px-3 ${isSelected ? "bg-primary bg-opacity-10 selected-message" : "hover-bg-light"} ${!message.estLu ? "unread-message" : ""}`}
        onClick={() => onSelect(message)}
        style={{
          cursor: "pointer",
          borderLeft: isSelected
            ? "4px solid var(--bs-primary)"
            : !message.estLu
              ? "4px solid var(--bs-warning)"
              : "4px solid transparent",
          transition: "all 0.2s ease",
          borderRadius: "8px",
          marginBottom: "4px",
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`bg-${getTypeColor()} bg-opacity-10 text-${getTypeColor()} rounded-circle d-flex align-items-center justify-content-center`}
              style={{ width: "40px", height: "40px" }}
            >
              <FontAwesomeIcon
                icon={getTypeIcon()}
                className={`fs-5 ${message.estLu ? "opacity-75" : ""}`}
              />
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6
                  className="mb-0 fw-bold text-dark"
                  style={{ fontSize: "0.9rem" }}
                >
                  {message.expediteurNom}
                </h6>
                {!message.estLu && (
                  <span className="badge bg-warning bg-opacity-25 text-warning px-2 py-1">
                    <FontAwesomeIcon icon={faCircle} className="fs-10 me-1" />
                    Non lu
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  <FontAwesomeIcon icon={faUser} className="me-1 fs-11" />
                  {message.expediteurEmail}
                </small>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  •
                </span>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  À: {message.destinataireEmail}
                </small>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                <FontAwesomeIcon icon={faClock} className="me-1" />
                {formatDate(message.envoyeLe)}
              </small>
              <span
                className={`badge bg-${getTypeColor()} bg-opacity-10 text-${getTypeColor()} border border-${getTypeColor()} border-opacity-25 px-2 py-1 fw-medium`}
                style={{ fontSize: "0.65rem" }}
              >
                {message.type.toUpperCase()}
              </span>
            </div>
            {message.estEnvoye && (
              <small
                className="text-success fw-medium"
                style={{ fontSize: "0.75rem" }}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                Envoyé
              </small>
            )}
          </div>
        </div>

        <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: "0.9rem" }}>
          {message.sujet}
        </h6>

        <p
          className="mb-0 text-muted fs-14 line-clamp-2"
          style={{
            fontSize: "0.8rem",
            maxWidth: "600px",
            lineHeight: "1.4",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            display: "-webkit-box",
          }}
        >
          {message.contenu}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(message);
              }}
              style={{ fontSize: "0.8rem" }}
            >
              <FontAwesomeIcon icon={faEye} style={{ fontSize: "0.8rem" }} />
              <span>Voir</span>
            </button>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                // Gérer la réponse plus tard
              }}
              style={{ fontSize: "0.8rem" }}
            >
              <FontAwesomeIcon icon={faReply} style={{ fontSize: "0.8rem" }} />
              <span>Répondre</span>
            </button>
          </div>
          {message.estEnvoye && !message.estLu && (
            <span
              className="badge bg-light text-dark border border-secondary-subtle px-2 py-1"
              style={{ fontSize: "0.75rem" }}
            >
              <FontAwesomeIcon
                icon={faClock}
                className="me-1"
                style={{ fontSize: "0.7rem" }}
              />
              En attente de lecture
            </span>
          )}
        </div>
      </div>
    </>
  );
};

// Composant de statistiques amélioré
const StatsCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  isLoading,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <FontAwesomeIcon icon={faChevronUp} className="text-success fs-12" />
        );
      case "down":
        return (
          <FontAwesomeIcon icon={faChevronDown} className="text-danger fs-12" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 stats-card">
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div
            className={`bg-${color} bg-opacity-10 text-${color} rounded-3 p-2 me-3`}
            style={{ borderRadius: "12px" }}
          >
            <FontAwesomeIcon icon={icon} className="fs-2" />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="mb-0 fw-bold" style={{ fontSize: "1.25rem" }}>
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </span>
                ) : (
                  value.toLocaleString()
                )}
              </h3>
              {trend && getTrendIcon()}
            </div>
            <p
              className="text-muted mb-1 fw-medium"
              style={{ fontSize: "0.8rem" }}
            >
              {title}
            </p>
            {subtitle && (
              <small
                className="text-muted d-flex align-items-center gap-1"
                style={{ fontSize: "0.7rem" }}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="fs-11" />
                {subtitle}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ListeMessages() {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    agents: false,
    vendeurs: false,
    utilisateurs: false,
    messages: false,
    envoi: false,
  });

  // États pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // États pour la sélection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // États pour les messages de succès/erreur
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // État pour le formulaire d'envoi de message
  const [newMessage, setNewMessage] = useState({
    destinataireEmail: "",
    sujet: "",
    contenu: "",
    type: "NOTIFICATION",
    expediteurNom: "Administrateur SONEC",
    expediteurEmail: "admin@sonec.com",
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
  });

  // Onglet actif
  const [activeTab, setActiveTab] = useState<"users" | "received" | "sent">(
    "users",
  );

  // Charger les agents
  const fetchAgents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, agents: true }));
    try {
      const response = await api.get<{
        data: Agent[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.AGENTS.LIST);
      setAgents(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching agents:", err);
      setError("Erreur lors du chargement des agents");
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  }, []);

  // Charger les vendeurs
  const fetchVendeurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, vendeurs: true }));
    try {
      const response = await api.get<{
        data: Vendeur[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.VENDEURS.LIST);
      setVendeurs(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching vendeurs:", err);
      setError("Erreur lors du chargement des vendeurs");
    } finally {
      setLoading((prev) => ({ ...prev, vendeurs: false }));
    }
  }, []);

  // Charger les utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, utilisateurs: true }));
    try {
      const response = await api.get<{
        data: Utilisateur[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.USERS.LIST);
      setUtilisateurs(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching utilisateurs:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading((prev) => ({ ...prev, utilisateurs: false }));
    }
  }, []);

  // Charger les messages reçus
  const fetchMessagesRecus = useCallback(async () => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      console.log("🔄 Chargement des messages reçus...");
      const response = await api.get<MessageReceived[]>(
        API_ENDPOINTS.MESSAGERIE.RECEIVED,
      );

      console.log("📨 Réponse brute de l'API:", response);

      if (!response) {
        console.warn("⚠️ Réponse API vide (messages reçus)");
        setMessages([]);
        return;
      }

      // Transformer les données pour correspondre au format attendu
      const transformedMessages = (Array.isArray(response) ? response : [])
        .map((item: any) => {
          if (!item) return null;

          // Si l'API retourne directement un objet Message
          if (item.message) {
            const msg = item.message;
            return {
              estLu: item.estLu || false,
              dateLecture: item.dateLecture || null,
              envoyeLe:
                msg.envoyeLe || item.dateReception || new Date().toISOString(),
              uuid: msg.uuid || item.uuid || `msg-${Date.now()}`,
              sujet: msg.sujet || "Sans sujet",
              contenu: msg.contenu || "",
              expediteurNom: msg.expediteurNom || "Expéditeur inconnu",
              expediteurEmail: msg.expediteurEmail || "inconnu@exemple.com",
              destinataireEmail:
                msg.destinataireEmail || "destinataire@exemple.com",
              type: (msg.type || "notification").toUpperCase(),
              estEnvoye: msg.estEnvoye !== undefined ? msg.estEnvoye : true,
              dateCreation: msg.dateCreation || item.dateReception,
            } as Message;
          } else {
            // Si l'API retourne directement un message sans wrapper
            return {
              estLu: item.estLu || false,
              dateLecture: item.dateLecture || null,
              envoyeLe:
                item.envoyeLe || item.dateReception || new Date().toISOString(),
              uuid: item.uuid || `msg-${Date.now()}`,
              sujet: item.sujet || "Sans sujet",
              contenu: item.contenu || "",
              expediteurNom: item.expediteurNom || "Expéditeur inconnu",
              expediteurEmail: item.expediteurEmail || "inconnu@exemple.com",
              destinataireEmail:
                item.destinataireEmail || "destinataire@exemple.com",
              type: (item.type || "notification").toUpperCase(),
              estEnvoye: item.estEnvoye !== undefined ? item.estEnvoye : true,
              dateCreation: item.dateCreation || item.dateReception,
            } as Message;
          }
        })
        .filter((item): item is Message => item !== null);

      console.log("📨 Messages transformés:", transformedMessages);
      setMessages(transformedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching messages:", err);
      setError("Erreur lors du chargement des messages");

      // Données de démonstration avec type sécurisé
      const demoMessages: Message[] = [
        {
          uuid: "c5d30cbd-b606-4721-8ec7-5a00f7df9e87",
          sujet: "Confirmation de votre inscription",
          contenu:
            "Bienvenue Julien ! Votre compte SONEC a été créé avec succès. Connectez-vous dès maintenant pour découvrir nos services.",
          expediteurNom: "N'GUESSAN Jessica Carine",
          expediteurEmail: "jessica.nguessan@agent.com",
          destinataireEmail: "admin@sonec.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
          dateLecture: null,
        },
        {
          uuid: "2",
          sujet: "Notification de sécurité importante",
          contenu:
            "Nous avons détecté une activité suspecte sur votre compte. Veuillez vérifier vos activités récentes...",
          expediteurNom: "Système de sécurité",
          expediteurEmail: "security@sonec.com",
          destinataireEmail: "admin@sonec.com",
          type: "ALERT",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 3600000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 3500000).toISOString(),
        },
      ];
      setMessages(demoMessages);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, []);

  // Charger les messages envoyés
  const fetchMessagesEnvoyes = useCallback(async () => {
    try {
      console.log("🔄 Chargement des messages envoyés...");
      const response = await api.get<Message[]>(API_ENDPOINTS.MESSAGERIE.SENT);

      if (!response) {
        console.warn("⚠️ Réponse API vide (messages envoyés)");
        setMessagesEnvoyes([]);
        return;
      }

      // Formatter le type de message pour correspondre à l'interface
      const formattedMessages = response
        .map((msg: Message) => {
          if (!msg) return null;

          return {
            ...msg,
            type: (msg.type || "notification").toUpperCase(),
            estLu: msg.estLu || false,
            dateLecture: msg.dateLecture || null,
            envoyeLe: msg.envoyeLe || new Date().toISOString(),
            expediteurNom: msg.expediteurNom || "Administrateur SONEC",
            expediteurEmail: msg.expediteurEmail || "admin@sonec.com",
            estEnvoye: msg.estEnvoye !== undefined ? msg.estEnvoye : true,
          } as Message;
        })
        .filter((msg): msg is Message => msg !== null);

      console.log("📤 Messages envoyés transformés:", formattedMessages);
      setMessagesEnvoyes(formattedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching sent messages:", err);
      setError("Erreur lors du chargement des messages envoyés");

      const demoSentMessages: Message[] = [
        {
          uuid: "49807144-1990-41e9-a78c-a29307c74d5a",
          sujet: "Confirmation de votre inscription",
          contenu:
            "Bienvenue Julien ! Votre compte SONEC a été créé avec succès. Connectez-vous dès maintenant pour découvrir nos services.",
          expediteurNom: "Super Admin",
          expediteurEmail: "superadmin@sonec.com",
          destinataireEmail: "jessica.nguessan@agent.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 7200000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 7000000).toISOString(),
        },
        {
          uuid: "6",
          sujet: "Rappel de sécurité",
          contenu:
            "N'oubliez pas de mettre à jour votre mot de passe régulièrement...",
          expediteurNom: "Administrateur SONEC",
          expediteurEmail: "admin@sonec.com",
          destinataireEmail: "fatou.kone@sonecafrica.com",
          type: "WARNING",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 43200000).toISOString(),
          estLu: false,
          dateLecture: null,
        },
      ];
      setMessagesEnvoyes(demoSentMessages);
    }
  }, []);

  // Recharger les messages périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "received") {
        fetchMessagesRecus();
      } else if (activeTab === "sent") {
        fetchMessagesEnvoyes();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab, fetchMessagesRecus, fetchMessagesEnvoyes]);

  // Charger toutes les données au montage
  useEffect(() => {
    console.log("🚀 Chargement des données...");
    fetchAgents();
    fetchVendeurs();
    fetchUtilisateurs();
    fetchMessagesRecus();
    fetchMessagesEnvoyes();
  }, []);

  // Mettre à jour les statistiques
  useEffect(() => {
    const totalUsers = agents.length + vendeurs.length + utilisateurs.length;
    const totalMessages = messages.length + messagesEnvoyes.length;
    const unreadMessages = messages.filter((m) => !m.estLu).length;

    setStats({
      totalUsers,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
    });
  }, [agents, vendeurs, utilisateurs, messages, messagesEnvoyes]);

  // Combiner tous les utilisateurs
  const allUsers = useMemo(() => {
    const users = [];

    if (selectedType === "all" || selectedType === "agent") {
      users.push(
        ...agents.map((agent) => ({ ...agent, userType: "agent" as const })),
      );
    }

    if (selectedType === "all" || selectedType === "vendeur") {
      users.push(
        ...vendeurs.map((vendeur) => ({
          ...vendeur,
          userType: "vendeur" as const,
        })),
      );
    }

    if (selectedType === "all" || selectedType === "utilisateur") {
      users.push(
        ...utilisateurs.map((utilisateur) => ({
          ...utilisateur,
          userType: "utilisateur" as const,
        })),
      );
    }

    return users;
  }, [agents, vendeurs, utilisateurs, selectedType]);

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    let result = allUsers.filter((v) => !v.is_deleted);

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.nom?.toLowerCase().includes(searchLower) ||
          v.prenoms?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower) ||
          v.telephone?.includes(searchTerm),
      );
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        result = result.filter((v) => !v.est_bloque && v.est_verifie);
      } else if (selectedStatus === "blocked") {
        result = result.filter((v) => v.est_bloque);
      } else if (selectedStatus === "unverified") {
        result = result.filter((v) => !v.est_verifie);
      }
    }

    return result;
  }, [allUsers, searchTerm, selectedStatus]);

  // Gestion de la sélection multiple
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      const allUserIds = filteredUsers.map((user) => user.uuid);
      setSelectedUsers(allUserIds);
    }
  };

  // Sélectionner un utilisateur pour envoyer un message
  const selectUserForMessage = (
    email: string,
    nom?: string,
    prenoms?: string,
  ) => {
    setNewMessage((prev) => ({
      ...prev,
      destinataireEmail: email,
      sujet:
        `Message pour ${nom || ""} ${prenoms || ""}`.trim() ||
        "Message important",
    }));
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (
      !newMessage.destinataireEmail.trim() ||
      !newMessage.sujet.trim() ||
      !newMessage.contenu.trim()
    ) {
      setInfoMessage("Veuillez remplir tous les champs obligatoires");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    setLoading((prev) => ({ ...prev, envoi: true }));
    setError(null);

    try {
      const response = await api.post<Message>(API_ENDPOINTS.MESSAGERIE.SEND, {
        destinataireEmail: newMessage.destinataireEmail,
        sujet: newMessage.sujet,
        contenu: newMessage.contenu,
        type: newMessage.type.toLowerCase(),
      });

      setSuccessMessage("Message envoyé avec succès !");

      // Réinitialiser le formulaire
      setNewMessage({
        destinataireEmail: "",
        sujet: "",
        contenu: "",
        type: "NOTIFICATION",
        expediteurNom: "Administrateur SONEC",
        expediteurEmail: "admin@sonec.com",
      });

      // Recharger les messages envoyés
      fetchMessagesEnvoyes();

      // Basculer vers l'onglet des messages envoyés
      setActiveTab("sent");
    } catch (err: any) {
      console.error("❌ Error sending message:", err);
      setError(
        err.response?.data?.message || "Erreur lors de l'envoi du message",
      );
    } finally {
      setLoading((prev) => ({ ...prev, envoi: false }));
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  // Marquer un message comme lu
  const handleMarkAsRead = async (messageId: string) => {
    try {
      console.warn("⚠️ L'endpoint MARK_READ n'est pas disponible");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.uuid === messageId ? { ...msg, estLu: true } : msg,
        ),
      );

      if (selectedMessage?.uuid === messageId) {
        setSelectedMessage((prev) => (prev ? { ...prev, estLu: true } : null));
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  // Répondre à un message
  const handleReply = (message: Message) => {
    setNewMessage({
      destinataireEmail: message.expediteurEmail,
      sujet: `RE: ${message.sujet}`,
      contenu: `\n\n--- Message original ---\n${message.contenu}`,
      type: "NOTIFICATION",
      expediteurNom: "Administrateur SONEC",
      expediteurEmail: "admin@sonec.com",
    });
    setActiveTab("users");
  };

  // Obtenir l'icône pour le type d'utilisateur
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return faUserTie;
      case "vendeur":
        return faStore;
      case "utilisateur":
        return faUser;
      default:
        return faUser;
    }
  };

  // Obtenir la couleur pour le type d'utilisateur
  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "agent":
        return "primary";
      case "vendeur":
        return "warning";
      case "utilisateur":
        return "info";
      default:
        return "secondary";
    }
  };

  // Obtenir le label pour le type d'utilisateur
  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "agent":
        return "Agent";
      case "vendeur":
        return "Vendeur";
      case "utilisateur":
        return "Utilisateur";
      default:
        return "Inconnu";
    }
  };

  // Grouper les messages par date pour les séparateurs
  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const showSeparator = index > 0 && index % 3 === 0;
      return {
        message,
        showSeparator,
      };
    });
  }, [messages]);

  // Format date pour affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date inconnue";
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  return (
    <>
      <div className="container-fluid px-3 py-3">
        {/* Header avec titre et actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h2 fw-bold text-dark mb-1"
              style={{ fontSize: "1.5rem" }}
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="me-3 text-primary"
              />
              Messagerie
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Gérez vos messages et communiquez avec vos utilisateurs
            </p>
          </div>
          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setActiveTab("users")}
              style={{ fontSize: "0.85rem" }}
            >
              <FontAwesomeIcon icon={faUserPen} />
              Nouveau message
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                fetchMessagesRecus();
                fetchMessagesEnvoyes();
              }}
              style={{ fontSize: "0.85rem" }}
            >
              <FontAwesomeIcon icon={faHistory} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Cartes de statistiques améliorées */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Utilisateurs Totaux"
              value={stats.totalUsers}
              icon={faUsers}
              color="primary"
              subtitle="Agents, Vendeurs, Utilisateurs"
              trend="up"
              isLoading={
                loading.agents || loading.vendeurs || loading.utilisateurs
              }
            />
          </div>
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Messages Reçus"
              value={stats.totalMessages}
              icon={faInbox}
              color="info"
              subtitle={`${stats.unreadMessages} non lus`}
              trend="neutral"
              isLoading={loading.messages}
            />
          </div>
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Messages Envoyés"
              value={stats.sentMessages}
              icon={faShareSquare}
              color="success"
              subtitle="Messages envoyés"
              trend="up"
            />
          </div>
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="En Attente"
              value={0}
              icon={faClock}
              color="warning"
              subtitle="Messages en cours"
              trend="down"
            />
          </div>
        </div>

        {/* Onglets principaux améliorés */}
        <div className="card border-0 shadow-lg mb-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-3 px-3">
            <ul
              className="nav nav-tabs nav-tabs-custom border-0 d-flex justify-content-between"
              role="tablist"
              style={{ gap: "0.5rem" }}
            >
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "users" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-2`}
                  onClick={() => setActiveTab("users")}
                  style={{ fontSize: "0.85rem" }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon icon={faUsers} className="fs-5 mb-1" />
                    <span className="fw-semibold">Contacts</span>
                  </div>
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "received" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-2`}
                  onClick={() => setActiveTab("received")}
                  style={{ fontSize: "0.85rem" }}
                >
                  <div className="d-flex flex-column align-items-center position-relative">
                    <FontAwesomeIcon icon={faInbox} className="fs-5 mb-1" />
                    <span className="fw-semibold">Messages reçus</span>
                    {stats.unreadMessages > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {stats.unreadMessages}
                      </span>
                    )}
                  </div>
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "sent" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-2`}
                  onClick={() => setActiveTab("sent")}
                  style={{ fontSize: "0.85rem" }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon
                      icon={faShareSquare}
                      className="fs-5 mb-1"
                    />
                    <span className="fw-semibold">Messages envoyés</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-3">
            {/* Onglet: Contacts */}
            {activeTab === "users" && (
              <div className="row g-3">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0 py-3 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5
                            className="mb-0 fw-bold text-dark"
                            style={{ fontSize: "1rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="me-2 text-primary"
                            />
                            Liste des contacts
                          </h5>
                          <p
                            className="text-muted mb-0 mt-1"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Sélectionnez des contacts pour leur envoyer des
                            messages
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faUserCheck}
                              className="me-2"
                            />
                            {filteredUsers.length} contact(s)
                          </span>
                        </div>
                      </div>

                      {/* Filtres améliorés */}
                      <div className="row g-2 mt-3">
                        <div className="col-lg-6">
                          <div className="input-group input-group-sm shadow-sm">
                            <span className="input-group-text bg-white border-end-0 ps-3">
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-2 py-2"
                              placeholder="Rechercher un contact..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{ fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <div className="input-group input-group-sm shadow-sm">
                            <label
                              className="input-group-text bg-white border-end-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon
                                icon={faUserTag}
                                className="text-muted"
                              />
                            </label>
                            <select
                              className="form-select border-start-0 py-2"
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <option value="all">Tous les types</option>
                              <option value="agent">Agents</option>
                              <option value="vendeur">Vendeurs</option>
                              <option value="utilisateur">Utilisateurs</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <div className="input-group input-group-sm shadow-sm">
                            <label
                              className="input-group-text bg-white border-end-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon
                                icon={faFilter}
                                className="text-muted"
                              />
                            </label>
                            <select
                              className="form-select border-start-0 py-2"
                              value={selectedStatus}
                              onChange={(e) =>
                                setSelectedStatus(e.target.value)
                              }
                              style={{ fontSize: "0.85rem" }}
                            >
                              <option value="all">Tous les statuts</option>
                              <option value="active">Actifs</option>
                              <option value="blocked">Bloqués</option>
                              <option value="unverified">Non vérifiés</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-0">
                      <div
                        className="table-responsive"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        <table className="table table-hover align-middle mb-0">
                          <thead
                            className="table-light sticky-top"
                            style={{ top: 0 }}
                          >
                            <tr>
                              <th
                                className="py-2 px-3"
                                style={{ width: "50px", fontSize: "0.8rem" }}
                              >
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                      selectedUsers.length ===
                                        filteredUsers.length &&
                                      filteredUsers.length > 0
                                    }
                                    onChange={handleSelectAll}
                                    disabled={filteredUsers.length === 0}
                                  />
                                </div>
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ width: "60px", fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">#</span>
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">
                                  Contact
                                </span>
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ width: "120px", fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">
                                  Type
                                </span>
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ width: "120px", fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">
                                  Statut
                                </span>
                              </th>
                              <th
                                className="py-2 px-3 text-center"
                                style={{ width: "100px", fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">
                                  Actions
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  <div className="text-muted py-3">
                                    <FontAwesomeIcon
                                      icon={faUsers}
                                      className="fs-1 mb-3 opacity-25"
                                    />
                                    <h5
                                      className="fw-semibold mb-2"
                                      style={{ fontSize: "0.9rem" }}
                                    >
                                      Aucun contact trouvé
                                    </h5>
                                    <p
                                      className="mb-0"
                                      style={{ fontSize: "0.8rem" }}
                                    >
                                      Ajustez vos filtres ou vérifiez vos
                                      permissions
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user, index) => (
                                <tr
                                  key={`${user.userType}-${user.uuid}`}
                                  className="align-middle"
                                >
                                  <td className="py-2 px-3">
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedUsers.includes(
                                          user.uuid,
                                        )}
                                        onChange={() =>
                                          handleSelectUser(user.uuid)
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className="text-muted fw-semibold"
                                      style={{ fontSize: "0.8rem" }}
                                    >
                                      {index + 1}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="d-flex align-items-center">
                                      <div
                                        className={`bg-${getUserTypeColor(user.userType)} bg-opacity-10 text-${getUserTypeColor(user.userType)} rounded-circle d-flex align-items-center justify-content-center me-2`}
                                        style={{
                                          width: "36px",
                                          height: "36px",
                                          minWidth: "36px",
                                        }}
                                      >
                                        <FontAwesomeIcon
                                          icon={getUserTypeIcon(user.userType)}
                                          className="fs-5"
                                        />
                                      </div>
                                      <div
                                        className="flex-grow-1"
                                        style={{ minWidth: 0 }}
                                      >
                                        <div
                                          className="fw-bold text-dark text-truncate"
                                          style={{ fontSize: "0.85rem" }}
                                        >
                                          {user.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <small
                                            className="text-muted text-truncate"
                                            style={{
                                              fontSize: "0.75rem",
                                              maxWidth: "200px",
                                            }}
                                          >
                                            {user.nom} {user.prenoms}
                                          </small>
                                          {user.telephone && (
                                            <>
                                              <span
                                                className="text-muted"
                                                style={{ fontSize: "0.75rem" }}
                                              >
                                                •
                                              </span>
                                              <small
                                                className="text-muted text-truncate"
                                                style={{
                                                  fontSize: "0.75rem",
                                                  maxWidth: "120px",
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  icon={faPhone}
                                                  className="me-1"
                                                />
                                                {user.telephone}
                                              </small>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`badge bg-${getUserTypeColor(user.userType)} bg-opacity-10 text-${getUserTypeColor(user.userType)} border border-${getUserTypeColor(user.userType)} border-opacity-25 px-2 py-1 fw-medium`}
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {getUserTypeLabel(user.userType)}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <StatusBadge
                                      est_bloque={user.est_bloque}
                                      est_verifie={user.est_verifie}
                                      is_deleted={user.is_deleted}
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-1 px-2 py-1"
                                      title="Envoyer un message"
                                      onClick={() =>
                                        selectUserForMessage(
                                          user.email,
                                          user.nom,
                                          user.prenoms,
                                        )
                                      }
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faPaperPlane}
                                        style={{ fontSize: "0.7rem" }}
                                      />
                                      <span className="d-none d-md-inline">
                                        Message
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{ top: "20px" }}
                  >
                    <div className="card-header bg-white border-0 py-3 px-3">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="text-primary fs-4"
                          />
                        </div>
                        <div>
                          <h5
                            className="mb-0 fw-bold text-dark"
                            style={{ fontSize: "0.95rem" }}
                          >
                            Nouveau message
                          </h5>
                          <p
                            className="text-muted mb-0"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Rédigez et envoyez un message
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      {successMessage && (
                        <div
                          className="alert alert-success alert-dismissible fade show mb-3"
                          role="alert"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-2 fs-4"
                            />
                            <div>
                              <h6
                                className="alert-heading mb-1"
                                style={{ fontSize: "0.85rem" }}
                              >
                                Message envoyé !
                              </h6>
                              <p
                                className="mb-0"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {successMessage}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccessMessage(null)}
                          ></button>
                        </div>
                      )}

                      {error && (
                        <div
                          className="alert alert-danger alert-dismissible fade show mb-3"
                          role="alert"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faExclamationCircle}
                              className="me-2 fs-4"
                            />
                            <div>
                              <h6
                                className="alert-heading mb-1"
                                style={{ fontSize: "0.85rem" }}
                              >
                                Erreur
                              </h6>
                              <p
                                className="mb-0"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {error}
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

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                      >
                        <div className="mb-3">
                          <label
                            className="form-label fw-semibold text-dark mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              className="me-2 text-muted"
                            />
                            Destinataire <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-sm border-2 py-2"
                            placeholder="contact@exemple.com"
                            value={newMessage.destinataireEmail}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                destinataireEmail: e.target.value,
                              }))
                            }
                            required
                            style={{ fontSize: "0.85rem" }}
                          />
                          <small
                            className="text-muted d-block mt-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            Sélectionnez un contact dans le tableau
                          </small>
                        </div>

                        <div className="mb-3">
                          <label
                            className="form-label fw-semibold text-dark mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="me-2 text-muted"
                            />
                            Sujet <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm border-2 py-2"
                            placeholder="Sujet du message"
                            value={newMessage.sujet}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                sujet: e.target.value,
                              }))
                            }
                            required
                            style={{ fontSize: "0.85rem" }}
                          />
                        </div>

                        <div className="mb-3">
                          <label
                            className="form-label fw-semibold text-dark mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faBell}
                              className="me-2 text-muted"
                            />
                            Type de message
                          </label>
                          <select
                            className="form-select form-select-sm border-2 py-2"
                            value={newMessage.type}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                            style={{ fontSize: "0.85rem" }}
                          >
                            <option value="NOTIFICATION">Notification</option>
                            <option value="ALERT">Alerte</option>
                            <option value="INFO">Information</option>
                            <option value="WARNING">Avertissement</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label
                            className="form-label fw-semibold text-dark mb-2"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faMessage}
                              className="me-2 text-muted"
                            />
                            Message <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control border-2 py-2"
                            rows={6}
                            placeholder="Écrivez votre message ici..."
                            value={newMessage.contenu}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                contenu: e.target.value,
                              }))
                            }
                            required
                            style={{ fontSize: "0.85rem" }}
                          />
                        </div>

                        <div className="d-grid">
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-3 py-2 fw-bold"
                            disabled={loading.envoi}
                            style={{ fontSize: "0.85rem" }}
                          >
                            {loading.envoi ? (
                              <>
                                <span className="spinner-border spinner-border-sm"></span>
                                <span>Envoi en cours...</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faPaperPlane}
                                  className="fs-5"
                                />
                                <span>Envoyer le message</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet: Messages reçus */}
            {activeTab === "received" && (
              <div className="row g-3">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0 py-3 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5
                            className="mb-0 fw-bold text-dark"
                            style={{ fontSize: "1rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faInbox}
                              className="me-2 text-primary"
                            />
                            Messages reçus
                          </h5>
                          <p
                            className="text-muted mb-0 mt-1"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {stats.unreadMessages > 0
                              ? `${stats.unreadMessages} message(s) non lu(s)`
                              : "Tous vos messages sont lus"}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {messages.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={fetchMessagesRecus}
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon icon={faHistory} />
                            Actualiser
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div
                        className="list-group list-group-flush px-3 py-2"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        {messages.length === 0 ? (
                          <div className="text-center py-4">
                            <div className="text-muted py-3">
                              <FontAwesomeIcon
                                icon={faInbox}
                                className="fs-1 mb-3 opacity-25"
                              />
                              <h5
                                className="fw-semibold mb-2"
                                style={{ fontSize: "0.9rem" }}
                              >
                                Aucun message reçu
                              </h5>
                              <p
                                className="mb-0"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Vos messages apparaîtront ici
                              </p>
                            </div>
                          </div>
                        ) : (
                          groupedMessages.map(
                            ({ message, showSeparator }, index) => (
                              <MessageItem
                                key={message.uuid}
                                message={message}
                                isSelected={
                                  selectedMessage?.uuid === message.uuid
                                }
                                onSelect={(msg) => {
                                  setSelectedMessage(msg);
                                  if (!msg.estLu) {
                                    handleMarkAsRead(msg.uuid);
                                  }
                                }}
                                showSeparator={showSeparator}
                              />
                            ),
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{ top: "20px" }}
                  >
                    <div className="card-header bg-white border-0 py-3 px-3">
                      <h5
                        className="mb-0 fw-bold text-dark"
                        style={{ fontSize: "0.95rem" }}
                      >
                        <FontAwesomeIcon
                          icon={faEye}
                          className="me-2 text-primary"
                        />
                        Détails du message
                      </h5>
                      <p
                        className="text-muted mb-0 mt-1"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Informations détaillées du message sélectionné
                      </p>
                    </div>
                    <div className="card-body">
                      {selectedMessage ? (
                        <>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6
                                className="fw-bold text-primary mb-2 flex-grow-1"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {selectedMessage.sujet}
                              </h6>
                              <span
                                className={`badge bg-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} bg-opacity-10 text-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} border border-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} border-opacity-25 px-2 py-1`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {selectedMessage.type.toUpperCase()}
                              </span>
                            </div>
                            <div className="bg-light rounded-3 p-3 mb-2">
                              <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-primary fs-4"
                                  />
                                </div>
                                <div>
                                  <h6
                                    className="fw-bold mb-1"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    {selectedMessage.expediteurNom}
                                  </h6>
                                  <p
                                    className="text-muted mb-0"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {selectedMessage.expediteurEmail}
                                  </p>
                                </div>
                              </div>
                              <div className="text-muted mb-2">
                                <small style={{ fontSize: "0.75rem" }}>
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="me-1"
                                  />
                                  Envoyé le{" "}
                                  {new Date(
                                    selectedMessage.envoyeLe,
                                  ).toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h6
                              className="fw-semibold mb-2 text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Contenu :
                            </h6>
                            <div
                              className="p-3 bg-light rounded-3"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {selectedMessage.contenu
                                .split("\n")
                                .map((line, index) => (
                                  <p
                                    key={index}
                                    className={index > 0 ? "mt-2" : ""}
                                    style={{
                                      lineHeight: "1.5",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {line}
                                  </p>
                                ))}
                            </div>
                          </div>

                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-primary d-flex align-items-center justify-content-center gap-3 py-2 fw-bold"
                              onClick={() => handleReply(selectedMessage)}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon
                                icon={faReply}
                                className="fs-5"
                              />
                              Répondre au message
                            </button>
                            <button
                              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-3 py-2"
                              onClick={() => setSelectedMessage(null)}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              Fermer les détails
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-muted py-3">
                            <FontAwesomeIcon
                              icon={faMessage}
                              className="fs-1 mb-3 opacity-25"
                            />
                            <h5
                              className="fw-semibold mb-2"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Aucun message sélectionné
                            </h5>
                            <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                              Sélectionnez un message pour voir les détails
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet: Messages envoyés */}
            {activeTab === "sent" && (
              <div className="row">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 py-3 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5
                            className="mb-0 fw-bold text-dark"
                            style={{ fontSize: "1rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faShareSquare}
                              className="me-2 text-primary"
                            />
                            Messages envoyés
                          </h5>
                          <p
                            className="text-muted mb-0 mt-1"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Historique de tous vos messages envoyés
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="badge bg-success bg-opacity-10 text-success px-3 py-2"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {messagesEnvoyes.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={fetchMessagesEnvoyes}
                            style={{ fontSize: "0.85rem" }}
                          >
                            <FontAwesomeIcon icon={faHistory} />
                            Actualiser
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div
                        className="table-responsive"
                        style={{ maxHeight: "500px", overflowY: "auto" }}
                      >
                        <table className="table table-hover align-middle mb-0">
                          <thead
                            className="table-light sticky-top"
                            style={{ top: 0 }}
                          >
                            <tr>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Destinataire
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Sujet
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Type
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Date d'envoi
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Statut
                              </th>
                              <th
                                className="py-2 px-3 text-center"
                                style={{ fontSize: "0.8rem" }}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {messagesEnvoyes.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  <div className="text-muted py-3">
                                    <FontAwesomeIcon
                                      icon={faShareSquare}
                                      className="fs-1 mb-3 opacity-25"
                                    />
                                    <h5
                                      className="fw-semibold mb-2"
                                      style={{ fontSize: "0.9rem" }}
                                    >
                                      Aucun message envoyé
                                    </h5>
                                    <p
                                      className="mb-0"
                                      style={{ fontSize: "0.8rem" }}
                                    >
                                      Envoyez votre premier message depuis
                                      l'onglet "Contacts"
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              messagesEnvoyes.map((message) => (
                                <tr key={message.uuid}>
                                  <td className="py-2 px-3">
                                    <div
                                      className="fw-bold text-dark"
                                      style={{ fontSize: "0.85rem" }}
                                    >
                                      {message.destinataireEmail}
                                    </div>
                                    <small
                                      className="text-muted"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      {message.expediteurEmail}
                                    </small>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div
                                      className="text-truncate"
                                      style={{
                                        maxWidth: "200px",
                                        fontSize: "0.85rem",
                                      }}
                                      title={message.sujet}
                                    >
                                      {message.sujet}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`badge bg-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} bg-opacity-10 text-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} border border-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} border-opacity-25 px-2 py-1 fw-medium`}
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {message.type}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="d-flex flex-column">
                                      <span
                                        className="fw-medium"
                                        style={{ fontSize: "0.85rem" }}
                                      >
                                        {formatDate(message.envoyeLe)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    {message.estLu ? (
                                      <span
                                        className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-flex align-items-center gap-2 px-2 py-1"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="fs-12"
                                        />
                                        <span className="fw-medium">Lu</span>
                                      </span>
                                    ) : (
                                      <span
                                        className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-flex align-items-center gap-2 px-2 py-1"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        <FontAwesomeIcon
                                          icon={faClock}
                                          className="fs-12"
                                        />
                                        <span className="fw-medium">
                                          Non lu
                                        </span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-2 py-1"
                                      onClick={() => {
                                        setNewMessage({
                                          destinataireEmail:
                                            message.destinataireEmail,
                                          sujet: `RE: ${message.sujet}`,
                                          contenu: "",
                                          type: "NOTIFICATION",
                                          expediteurNom: "Administrateur SONEC",
                                          expediteurEmail: "admin@sonec.com",
                                        });
                                        setActiveTab("users");
                                      }}
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faReply}
                                        style={{ fontSize: "0.7rem" }}
                                      />
                                      <span>Répondre</span>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages d'information */}
      {infoMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4"
          style={{ zIndex: 1050 }}
        >
          <div
            className="toast show border-0 shadow-lg"
            role="alert"
            style={{ minWidth: "300px" }}
          >
            <div className="toast-header bg-info bg-opacity-10 text-info border-bottom">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong className="me-auto" style={{ fontSize: "0.9rem" }}>
                Information
              </strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setInfoMessage(null)}
              ></button>
            </div>
            <div className="toast-body" style={{ fontSize: "0.85rem" }}>
              {infoMessage}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root {
          --bs-primary: #0d6efd;
          --bs-primary-rgb: 13, 110, 253;
        }

        .nav-tabs-custom .nav-link {
          border: none;
          color: #6c757d;
          padding: 0;
          font-weight: 500;
          position: relative;
          background: transparent;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .nav-tabs-custom .nav-link.active {
          color: var(--bs-primary);
          background: rgba(var(--bs-primary-rgb), 0.1);
          border-radius: 8px;
        }

        .nav-tabs-custom .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 2px;
          background-color: var(--bs-primary);
          border-radius: 3px 3px 0 0;
        }

        .nav-tabs-custom .nav-link:hover:not(.active) {
          color: var(--bs-primary);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
        }

        .hover-bg-light:hover {
          background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .selected-message {
          box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.2) !important;
        }

        .unread-message {
          background-color: rgba(255, 193, 7, 0.05) !important;
        }

        .stats-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }

        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
        }

        .fs-10 {
          font-size: 0.625rem;
        }

        .fs-11 {
          font-size: 0.6875rem;
        }

        .fs-12 {
          font-size: 0.75rem;
        }

        .fs-13 {
          font-size: 0.8125rem;
        }

        .fs-14 {
          font-size: 0.875rem;
        }

        .separator {
          color: #6c757d;
        }

        .separator hr {
          border-top: 1px dashed #dee2e6;
        }

        .form-check-input:checked {
          background-color: var(--bs-primary);
          border-color: var(--bs-primary);
        }

        .table > :not(caption) > * > * {
          padding: 0.75rem 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #f1f3f5;
        }

        .table > :not(caption) > * > *:last-child {
          border-right: none;
        }

        .table-light {
          background-color: #f8fafc;
        }

        .list-group-item-action:focus,
        .list-group-item-action:hover {
          background-color: rgba(var(--bs-primary-rgb), 0.05);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .nav-tabs-custom .nav-link {
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          .container-fluid {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          h1 {
            font-size: 1.25rem !important;
          }

          .card-header h5 {
            font-size: 0.9rem !important;
          }
        }

        /* Animation pour les nouveaux messages */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-item {
          animation: fadeIn 0.3s ease;
        }

        /* Scrollbar personnalisée */
        .table-responsive::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .list-group-flush::-webkit-scrollbar {
          width: 6px;
        }

        .list-group-flush::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .list-group-flush::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .list-group-flush::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}
