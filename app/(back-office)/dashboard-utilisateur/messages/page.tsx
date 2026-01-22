// app/(back-office)/dashboard-utilisateur/messages/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEnvelopeOpen,
  faPaperPlane,
  faUser,
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
  faShoppingCart,
  faBox,
  faTruck,
  faCreditCard,
  faReceipt,
  faStar,
  faHeart,
  faComment,
  faShare,
  faTag,
  faPercent,
  faGift,
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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  code?: string;
  avatar?: string;
  statut?: string;
}

interface Agent extends UtilisateurBase {}
interface Vendeur extends UtilisateurBase {
  boutique?: {
    nom: string;
    uuid: string;
  };
}
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
  dateLecture?: string | null;
  dateReception: string;
}

// Type pour les contacts combinés
interface ContactWithType extends UtilisateurBase {
  userType: "agent" | "vendeur";
  boutique?: {
    nom: string;
    uuid: string;
  };
}

// Composant de badge de statut amélioré
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
    const type = message.type.toUpperCase();
    switch (type) {
      case "ALERT":
        return "danger";
      case "WARNING":
        return "warning";
      case "INFO":
        return "info";
      case "NOTIFICATION":
        return "primary";
      case "PROMOTION":
        return "success";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = () => {
    const type = message.type.toUpperCase();
    switch (type) {
      case "ALERT":
        return faBell;
      case "WARNING":
        return faExclamationCircle;
      case "INFO":
        return faInfoCircle;
      case "NOTIFICATION":
        return faEnvelopeCircleCheck;
      case "PROMOTION":
        return faGift;
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
                {message.type.toUpperCase() === "PROMOTION" && (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                    <FontAwesomeIcon icon={faPercent} className="fs-10 me-1" />
                    Promotion
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
                {message.type.toUpperCase() === "PROMOTION"
                  ? "PROMOTION"
                  : message.type.toUpperCase()}
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
              <span style={{ fontSize: "0.8rem" }}>Voir</span>
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
              <span style={{ fontSize: "0.8rem" }}>Répondre</span>
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

export default function MessagerieUtilisateur() {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    agents: false,
    vendeurs: false,
    messages: false,
    envoi: false,
    profile: false,
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
    expediteurNom: "",
    expediteurEmail: "",
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
  });

  // Onglet actif
  const [activeTab, setActiveTab] = useState<"contacts" | "received" | "sent">(
    "contacts",
  );

  // Profil de l'utilisateur connecté
  const [userProfile, setUserProfile] = useState<Utilisateur | null>(null);

  // Charger le profil de l'utilisateur connecté
  const fetchUserProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      console.log("🔍 Chargement du profil utilisateur...");
      const response = await api.get<{
        data?: Utilisateur;
        message?: string;
        status?: string;
      }>(API_ENDPOINTS.AUTH.UTILISATEUR.PROFILE);

      console.log("✅ Réponse du profil utilisateur:", response);

      if (response && response.data) {
        const profile = response.data;
        setUserProfile(profile);
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email || "utilisateur@sonec.com",
          expediteurNom:
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
            "Utilisateur SONEC",
        }));
      } else {
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: "utilisateur@sonec.com",
          expediteurNom: "Utilisateur SONEC",
        }));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement du profil utilisateur:", err);
      setNewMessage((prev) => ({
        ...prev,
        expediteurEmail: "utilisateur@sonec.com",
        expediteurNom: "Utilisateur SONEC",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  // Charger les agents (pour contacter le support)
  const fetchAgents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, agents: true }));
    try {
      console.log("🔄 Chargement des agents...");
      const response = await api.get<{
        data?: Agent[];
        count?: number;
        status?: string;
      }>(API_ENDPOINTS.ADMIN.AGENTS.LIST);

      if (response && response.data) {
        setAgents(response.data);
      } else {
        // Données de démonstration pour les agents
        const demoAgents: Agent[] = [
          {
            uuid: "agent-1",
            nom: "Support",
            prenoms: "Client",
            email: "support@sonec.com",
            telephone: "+2250700000000",
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            statut: "actif",
          },
          {
            uuid: "agent-2",
            nom: "Assistance",
            prenoms: "Technique",
            email: "assistance@sonec.com",
            telephone: "+2250700000001",
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            created_at: new Date().toISOString(),
            statut: "actif",
          },
        ];
        setAgents(demoAgents);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des agents:", err);
      // Données de démonstration en cas d'erreur
      const demoAgents: Agent[] = [
        {
          uuid: "agent-1",
          nom: "Support",
          prenoms: "Client",
          email: "support@sonec.com",
          telephone: "+2250700000000",
          est_verifie: true,
          est_bloque: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          statut: "actif",
        },
      ];
      setAgents(demoAgents);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  }, []);

  // Charger les vendeurs (pour contacter les boutiques)
  const fetchVendeurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, vendeurs: true }));
    try {
      console.log("🔄 Chargement des vendeurs...");
      const response = await api.get<{
        data?: Vendeur[];
        count?: number;
        status?: string;
      }>(API_ENDPOINTS.ADMIN.VENDEURS.LIST);

      if (response && response.data) {
        setVendeurs(response.data);
      } else {
        // Données de démonstration pour les vendeurs
        const demoVendeurs: Vendeur[] = [
          {
            uuid: "vendeur-1",
            nom: "Boutique",
            prenoms: "Electronique",
            email: "electronique@sonec.com",
            telephone: "+2250700000002",
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            boutique: {
              nom: "ElectroShop",
              uuid: "boutique-1",
            },
            created_at: new Date().toISOString(),
            statut: "actif",
          },
          {
            uuid: "vendeur-2",
            nom: "Boutique",
            prenoms: "Mode",
            email: "mode@sonec.com",
            telephone: "+2250700000003",
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            boutique: {
              nom: "Fashion Store",
              uuid: "boutique-2",
            },
            created_at: new Date().toISOString(),
            statut: "actif",
          },
        ];
        setVendeurs(demoVendeurs);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des vendeurs:", err);
      // Données de démonstration en cas d'erreur
      const demoVendeurs: Vendeur[] = [
        {
          uuid: "vendeur-1",
          nom: "Boutique",
          prenoms: "Exemple",
          email: "boutique@sonec.com",
          telephone: "+2250700000002",
          est_verifie: true,
          est_bloque: false,
          is_deleted: false,
          boutique: {
            nom: "Ma Boutique",
            uuid: "boutique-1",
          },
          created_at: new Date().toISOString(),
          statut: "actif",
        },
      ];
      setVendeurs(demoVendeurs);
    } finally {
      setLoading((prev) => ({ ...prev, vendeurs: false }));
    }
  }, []);

  // Charger les messages reçus
  const fetchMessagesRecus = useCallback(async () => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      console.log("🔄 Chargement des messages reçus pour utilisateur...");
      const response = await api.get<MessageReceived[]>(
        API_ENDPOINTS.MESSAGERIE.RECEIVED,
      );

      console.log("📨 Réponse brute des messages reçus:", response);

      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.warn("⚠️ Aucun message reçu trouvé");
        setMessages([]);
        return;
      }

      // Transformer les données
      const transformedMessages = (Array.isArray(response) ? response : [])
        .map((item: any) => {
          if (!item) return null;

          const hasMessageWrapper = item.message !== undefined;
          const messageData = hasMessageWrapper ? item.message : item;

          return {
            uuid: messageData.uuid || item.uuid || `msg-${Date.now()}`,
            sujet: messageData.sujet || "Sans sujet",
            contenu: messageData.contenu || "",
            expediteurNom: messageData.expediteurNom || "Expéditeur inconnu",
            expediteurEmail:
              messageData.expediteurEmail || "inconnu@exemple.com",
            destinataireEmail:
              messageData.destinataireEmail ||
              userProfile?.email ||
              "utilisateur@sonec.com",
            type: (messageData.type || "notification").toUpperCase(),
            estEnvoye:
              messageData.estEnvoye !== undefined
                ? messageData.estEnvoye
                : true,
            envoyeLe:
              messageData.envoyeLe ||
              item.dateReception ||
              new Date().toISOString(),
            estLu: hasMessageWrapper
              ? item.estLu || false
              : messageData.estLu || false,
            dateLecture: hasMessageWrapper
              ? item.dateLecture
              : messageData.dateLecture,
            dateCreation: messageData.dateCreation || item.dateReception,
          } as Message;
        })
        .filter((item): item is Message => item !== null);

      console.log("📨 Messages transformés:", transformedMessages);
      setMessages(transformedMessages);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des messages:", err);
      setError("Erreur lors du chargement des messages");

      // Données de démonstration adaptées aux utilisateurs
      const demoMessages: Message[] = [
        {
          uuid: "msg-1",
          sujet: "Bienvenue sur SONEC !",
          contenu:
            "Bienvenue cher utilisateur ! Nous sommes ravis de vous compter parmi nous. Découvrez nos fonctionnalités et profitez de nos services.",
          expediteurNom: "Équipe SONEC",
          expediteurEmail: "welcome@sonec.com",
          destinataireEmail: userProfile?.email || "utilisateur@sonec.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
          dateLecture: null,
        },
        {
          uuid: "msg-2",
          sujet: "Promotion spéciale -20%",
          contenu:
            "Profitez de -20% sur tous les produits électroniques cette semaine ! Ne manquez pas cette offre exclusive.",
          expediteurNom: "ElectroShop",
          expediteurEmail: "promotions@electroshop.com",
          destinataireEmail: userProfile?.email || "utilisateur@sonec.com",
          type: "PROMOTION",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 3600000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          uuid: "msg-3",
          sujet: "Votre commande a été expédiée",
          contenu:
            "Votre commande #ORD-12345 a été expédiée. Vous pouvez suivre votre colis avec le numéro de suivi TRK-789456.",
          expediteurNom: "Fashion Store",
          expediteurEmail: "shipping@fashionstore.com",
          destinataireEmail: userProfile?.email || "utilisateur@sonec.com",
          type: "INFO",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 86400000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 86300000).toISOString(),
        },
      ];
      setMessages(demoMessages);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [userProfile]);

  // Charger les messages envoyés
  const fetchMessagesEnvoyes = useCallback(async () => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      console.log("🔄 Chargement des messages envoyés...");
      const response = await api.get<any[]>(API_ENDPOINTS.MESSAGERIE.SENT);

      console.log("📤 Réponse brute des messages envoyés:", response);

      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.warn("⚠️ Aucun message envoyé trouvé");
        setMessagesEnvoyes([]);
        return;
      }

      const formattedMessages = (Array.isArray(response) ? response : [])
        .map((msg: any) => {
          if (!msg) return null;

          return {
            uuid: msg.uuid || `sent-${Date.now()}`,
            sujet: msg.sujet || "Sans sujet",
            contenu: msg.contenu || "",
            expediteurNom:
              msg.expediteurNom || userProfile?.nom || "Utilisateur SONEC",
            expediteurEmail:
              msg.expediteurEmail ||
              userProfile?.email ||
              "utilisateur@sonec.com",
            destinataireEmail: msg.destinataireEmail || "",
            type: (msg.type || "notification").toUpperCase(),
            estEnvoye: msg.estEnvoye !== undefined ? msg.estEnvoye : true,
            envoyeLe: msg.envoyeLe || new Date().toISOString(),
            estLu: msg.estLu || false,
            dateLecture: msg.dateLecture || null,
            dateCreation: msg.dateCreation,
          } as Message;
        })
        .filter((msg): msg is Message => msg !== null);

      console.log("📤 Messages envoyés transformés:", formattedMessages);
      setMessagesEnvoyes(formattedMessages);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des messages envoyés:", err);
      setError("Erreur lors du chargement des messages envoyés");

      // Données de démonstration pour les utilisateurs
      const demoSentMessages: Message[] = [
        {
          uuid: "sent-1",
          sujet: "Question sur mon produit",
          contenu:
            "Bonjour, j'ai une question concernant le produit que j'ai acheté. Pouvez-vous m'aider ?",
          expediteurNom: userProfile
            ? `${userProfile.prenoms} ${userProfile.nom}`
            : "Utilisateur SONEC",
          expediteurEmail: userProfile?.email || "utilisateur@sonec.com",
          destinataireEmail: "support@sonec.com",
          type: "INFO",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 7200000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 7000000).toISOString(),
        },
        {
          uuid: "sent-2",
          sujet: "Demande d'assistance technique",
          contenu:
            "J'ai un problème avec mon compte. Pouvez-vous me contacter pour résoudre ce problème ?",
          expediteurNom: userProfile
            ? `${userProfile.prenoms} ${userProfile.nom}`
            : "Utilisateur SONEC",
          expediteurEmail: userProfile?.email || "utilisateur@sonec.com",
          destinataireEmail: "assistance@sonec.com",
          type: "ALERT",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 43200000).toISOString(),
          estLu: false,
          dateLecture: null,
        },
      ];
      setMessagesEnvoyes(demoSentMessages);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [userProfile]);

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
    console.log("🚀 Chargement des données pour utilisateur...");
    fetchUserProfile().then(() => {
      fetchAgents();
      fetchVendeurs();
      fetchMessagesRecus();
      fetchMessagesEnvoyes();
    });
  }, []);

  // Mettre à jour les statistiques
  useEffect(() => {
    const totalContacts = agents.length + vendeurs.length;
    const totalMessages = messages.length + messagesEnvoyes.length;
    const unreadMessages = messages.filter((m) => !m.estLu).length;

    setStats({
      totalContacts,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
    });
  }, [agents, vendeurs, messages, messagesEnvoyes]);

  // Combiner tous les contacts
  const allContacts = useMemo(() => {
    const contacts: ContactWithType[] = [];

    if (selectedType === "all" || selectedType === "agent") {
      contacts.push(
        ...agents.map((agent) => ({
          ...agent,
          userType: "agent" as const,
          boutique: undefined,
        })),
      );
    }

    if (selectedType === "all" || selectedType === "vendeur") {
      contacts.push(
        ...vendeurs.map((vendeur) => ({
          ...vendeur,
          userType: "vendeur" as const,
          boutique: vendeur.boutique,
        })),
      );
    }

    console.log("👥 Tous les contacts combinés:", contacts.length);
    return contacts;
  }, [agents, vendeurs, selectedType]);

  // Filtrer les contacts
  const filteredContacts = useMemo(() => {
    let result = allContacts.filter((v) => !v.is_deleted);

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((v) => {
        // Vérifier les champs de base
        const basicMatch =
          v.nom?.toLowerCase().includes(searchLower) ||
          v.prenoms?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower) ||
          v.telephone?.includes(searchTerm);

        // Vérifier le nom de la boutique seulement pour les vendeurs
        const boutiqueMatch =
          v.userType === "vendeur" &&
          v.boutique?.nom?.toLowerCase().includes(searchLower);

        return basicMatch || boutiqueMatch;
      });
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

    console.log("🔍 Contacts filtrés:", result.length);
    return result;
  }, [allContacts, searchTerm, selectedStatus]);

  // Gestion de la sélection multiple
  const handleSelectContact = (contactId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredContacts.length) {
      setSelectedUsers([]);
    } else {
      const allContactIds = filteredContacts.map((contact) => contact.uuid);
      setSelectedUsers(allContactIds);
    }
  };

  // Sélectionner un contact pour envoyer un message
  const selectContactForMessage = (
    email: string,
    nom?: string,
    prenoms?: string,
    userType?: string,
    boutiqueNom?: string,
  ) => {
    let sujet = "Message de l'utilisateur";

    if (boutiqueNom) {
      sujet = `Question concernant ${boutiqueNom}`;
    } else if (nom || prenoms) {
      sujet = `Message pour ${nom || ""} ${prenoms || ""}`.trim();
    } else if (userType === "agent") {
      sujet = "Demande de support";
    }

    setNewMessage((prev) => ({
      ...prev,
      destinataireEmail: email,
      sujet: sujet || "Message important",
    }));
  };

  // Fonction corrigée pour l'envoi de message
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
      const messageData = {
        destinataireEmail: newMessage.destinataireEmail,
        sujet: newMessage.sujet,
        contenu: newMessage.contenu,
        type: newMessage.type.toLowerCase(),
      };

      console.log("📤 Envoi du message avec les données:", messageData);

      const response = await api.post<Message>(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData,
      );

      console.log("✅ Réponse de l'API:", response);

      if (response) {
        const sentMessage = response as unknown as Message;

        setMessagesEnvoyes((prev) => [
          {
            uuid: sentMessage.uuid || `msg-${Date.now()}`,
            sujet: sentMessage.sujet || newMessage.sujet,
            contenu: sentMessage.contenu || newMessage.contenu,
            expediteurNom:
              sentMessage.expediteurNom || newMessage.expediteurNom,
            expediteurEmail:
              sentMessage.expediteurEmail || newMessage.expediteurEmail,
            destinataireEmail:
              sentMessage.destinataireEmail || newMessage.destinataireEmail,
            type: (sentMessage.type || newMessage.type).toUpperCase(),
            estEnvoye:
              sentMessage.estEnvoye !== undefined
                ? sentMessage.estEnvoye
                : true,
            envoyeLe: sentMessage.envoyeLe || new Date().toISOString(),
            estLu: sentMessage.estLu !== undefined ? sentMessage.estLu : false,
            dateLecture: sentMessage.dateLecture || null,
          },
          ...prev,
        ]);

        setSuccessMessage("Message envoyé avec succès !");

        setNewMessage({
          destinataireEmail: "",
          sujet: "",
          contenu: "",
          type: "NOTIFICATION",
          expediteurNom: newMessage.expediteurNom,
          expediteurEmail: newMessage.expediteurEmail,
        });

        setActiveTab("sent");
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de l'envoi du message:", err);

      let errorMessage = "Erreur lors de l'envoi du message";

      if (err.response) {
        console.error("📥 Détails de l'erreur:", {
          status: err.response.status,
          data: err.response.data,
        });

        if (err.response.status === 400) {
          errorMessage =
            "Données invalides. Vérifiez les informations saisies.";
        } else if (err.response.status === 404) {
          errorMessage = "Destinataire non trouvé. Vérifiez l'adresse email.";
        } else if (err.response.status === 403) {
          errorMessage = "Vous n'êtes pas autorisé à envoyer ce message.";
        } else if (err.response.status === 500) {
          errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
        }

        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setInfoMessage(`Échec de l'envoi: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, envoi: false }));
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
        setInfoMessage(null);
      }, 5000);
    }
  };

  // Marquer un message comme lu
  const handleMarkAsRead = async (messageId: string) => {
    try {
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
      type: message.type,
      expediteurNom: newMessage.expediteurNom,
      expediteurEmail: newMessage.expediteurEmail,
    });
    setActiveTab("contacts");
  };

  // Obtenir l'icône pour le type d'utilisateur
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return faUserShield;
      case "vendeur":
        return faStore;
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
      default:
        return "secondary";
    }
  };

  // Obtenir le label pour le type d'utilisateur
  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "agent":
        return "Support";
      case "vendeur":
        return "Vendeur";
      default:
        return "Contact";
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

  // Charger les données quand l'onglet change
  useEffect(() => {
    if (activeTab === "contacts") {
      fetchAgents();
      fetchVendeurs();
    }
  }, [activeTab, fetchAgents, fetchVendeurs]);

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
              Messagerie Utilisateur
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Gérez vos messages et communiquez avec le support et les vendeurs
            </p>
          </div>
          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setActiveTab("contacts")}
              style={{ fontSize: "0.85rem" }}
            >
              <FontAwesomeIcon icon={faUserPen} />
              Nouveau message
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                fetchAgents();
                fetchVendeurs();
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
              title="Contacts Totaux"
              value={stats.totalContacts}
              icon={faUsers}
              color="primary"
              subtitle="Support et vendeurs"
              trend="up"
              isLoading={loading.agents || loading.vendeurs}
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
              title="Promotions"
              value={
                messages.filter((m) => m.type.toUpperCase() === "PROMOTION")
                  .length
              }
              icon={faGift}
              color="warning"
              subtitle="Offres spéciales"
              trend="neutral"
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
                  className={`nav-link w-100 ${activeTab === "contacts" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-2`}
                  onClick={() => setActiveTab("contacts")}
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
            {activeTab === "contacts" && (
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
                            Contactez le support ou les vendeurs
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
                            {filteredContacts.length} contact(s)
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
                              <option value="all">Tous les contacts</option>
                              <option value="agent">Support</option>
                              <option value="vendeur">Vendeurs</option>
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
                                        filteredContacts.length &&
                                      filteredContacts.length > 0
                                    }
                                    onChange={handleSelectAll}
                                    disabled={filteredContacts.length === 0}
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
                            {filteredContacts.length === 0 ? (
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
                              filteredContacts.map((contact, index) => (
                                <tr
                                  key={`${contact.userType}-${contact.uuid}`}
                                  className="align-middle"
                                >
                                  <td className="py-2 px-3">
                                    <div className="form-check">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedUsers.includes(
                                          contact.uuid,
                                        )}
                                        onChange={() =>
                                          handleSelectContact(contact.uuid)
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
                                        className={`bg-${getUserTypeColor(contact.userType)} bg-opacity-10 text-${getUserTypeColor(contact.userType)} rounded-circle d-flex align-items-center justify-content-center me-2`}
                                        style={{
                                          width: "36px",
                                          height: "36px",
                                          minWidth: "36px",
                                        }}
                                      >
                                        <FontAwesomeIcon
                                          icon={getUserTypeIcon(
                                            contact.userType,
                                          )}
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
                                          {contact.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <small
                                            className="text-muted text-truncate"
                                            style={{
                                              fontSize: "0.75rem",
                                              maxWidth: "200px",
                                            }}
                                          >
                                            {contact.nom} {contact.prenoms}
                                          </small>
                                          {contact.telephone && (
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
                                                {contact.telephone}
                                              </small>
                                            </>
                                          )}
                                          {contact.userType === "vendeur" &&
                                            contact.boutique?.nom && (
                                              <>
                                                <span
                                                  className="text-muted"
                                                  style={{
                                                    fontSize: "0.75rem",
                                                  }}
                                                >
                                                  •
                                                </span>
                                                <small
                                                  className="text-muted text-truncate"
                                                  style={{
                                                    fontSize: "0.75rem",
                                                    maxWidth: "150px",
                                                  }}
                                                >
                                                  <FontAwesomeIcon
                                                    icon={faStore}
                                                    className="me-1"
                                                  />
                                                  {contact.boutique.nom}
                                                </small>
                                              </>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`badge bg-${getUserTypeColor(contact.userType)} bg-opacity-10 text-${getUserTypeColor(contact.userType)} border border-${getUserTypeColor(contact.userType)} border-opacity-25 px-2 py-1 fw-medium`}
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {getUserTypeLabel(contact.userType)}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <StatusBadge
                                      est_bloque={contact.est_bloque}
                                      est_verifie={contact.est_verifie}
                                      is_deleted={contact.is_deleted}
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-1 px-2 py-1"
                                      title="Envoyer un message"
                                      onClick={() =>
                                        selectContactForMessage(
                                          contact.email,
                                          contact.nom,
                                          contact.prenoms,
                                          contact.userType,
                                          contact.userType === "vendeur"
                                            ? contact.boutique?.nom
                                            : undefined,
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
                            <option value="QUESTION">Question</option>
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
                                className={`badge bg-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "PROMOTION" ? "success" : "primary"} bg-opacity-10 text-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "PROMOTION" ? "success" : "primary"} border border-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "PROMOTION" ? "success" : "primary"} border-opacity-25 px-2 py-1`}
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
                                      className={`badge bg-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "PROMOTION" ? "success" : "primary"} bg-opacity-10 text-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "PROMOTION" ? "success" : "primary"} border border-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "PROMOTION" ? "success" : "primary"} border-opacity-25 px-2 py-1 fw-medium`}
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
                                          type: message.type,
                                          expediteurNom:
                                            newMessage.expediteurNom,
                                          expediteurEmail:
                                            newMessage.expediteurEmail,
                                        });
                                        setActiveTab("contacts");
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
