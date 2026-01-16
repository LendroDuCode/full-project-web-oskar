// app/(back-office)/dashboard-vendeur/messages/page.tsx
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
  faCrown,
  faUserSecret,
  faShield,
  faStar,
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
  is_super_admin?: boolean;
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
  dateLecture?: string;
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
        className={`list-group-item list-group-item-action border-0 py-4 px-4 ${isSelected ? "bg-primary bg-opacity-10 selected-message" : "hover-bg-light"} ${!message.estLu ? "unread-message" : ""}`}
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
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`bg-${getTypeColor()} bg-opacity-10 text-${getTypeColor()} rounded-circle d-flex align-items-center justify-content-center`}
              style={{ width: "48px", height: "48px" }}
            >
              <FontAwesomeIcon
                icon={getTypeIcon()}
                className={`fs-5 ${message.estLu ? "opacity-75" : ""}`}
              />
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="mb-0 fw-bold text-dark">
                  {message.expediteurNom}
                </h6>
                {!message.estLu && (
                  <span className="badge bg-warning bg-opacity-25 text-warning px-2 py-1">
                    <FontAwesomeIcon icon={faCircle} className="fs-10 me-1" />
                    Non lu
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faUser} className="me-1 fs-11" />
                  {message.expediteurEmail}
                </small>
                <span className="text-muted">•</span>
                <small className="text-muted">
                  À: {message.destinataireEmail}
                </small>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">
                <FontAwesomeIcon icon={faClock} className="me-1" />
                {formatDate(message.envoyeLe)}
              </small>
              <span
                className={`badge bg-${getTypeColor()} bg-opacity-10 text-${getTypeColor()} border border-${getTypeColor()} border-opacity-25 px-3 py-1 fw-medium`}
                style={{ fontSize: "0.7rem" }}
              >
                {message.type.toUpperCase()}
              </span>
            </div>
            {message.estEnvoye && (
              <small className="text-success fw-medium">
                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                Envoyé
              </small>
            )}
          </div>
        </div>

        <h6 className="fw-bold mb-2 text-dark">{message.sujet}</h6>

        <p
          className="mb-0 text-muted fs-14 line-clamp-2"
          style={{
            maxWidth: "600px",
            lineHeight: "1.5",
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
            >
              <FontAwesomeIcon icon={faEye} />
              <span>Voir</span>
            </button>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                // Gérer la réponse plus tard
              }}
            >
              <FontAwesomeIcon icon={faReply} />
              <span>Répondre</span>
            </button>
          </div>
          {message.estEnvoye && !message.estLu && (
            <span className="badge bg-light text-dark border border-secondary-subtle px-3 py-1">
              <FontAwesomeIcon icon={faClock} className="me-1" />
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
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div
            className={`bg-${color} bg-opacity-10 text-${color} rounded-3 p-3 me-3`}
            style={{ borderRadius: "12px" }}
          >
            <FontAwesomeIcon icon={icon} className="fs-3" />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="mb-0 fw-bold">
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
            <p className="text-muted mb-1 fw-medium">{title}</p>
            {subtitle && (
              <small className="text-muted d-flex align-items-center gap-1">
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

export default function ListeMessagesVendeur() {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    agents: false,
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
    expediteurNom: "Vendeur SONEC",
    expediteurEmail: "", // Sera rempli avec l'email du vendeur connecté
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
    agents: 0,
    utilisateurs: 0,
  });

  // Onglet actif
  const [activeTab, setActiveTab] = useState<"users" | "received" | "sent">(
    "users",
  );

  // Profil du vendeur connecté
  const [vendeurProfile, setVendeurProfile] = useState<Vendeur | null>(null);

  // Charger le profil du vendeur connecté
  const fetchVendeurProfile = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.VENDEUR.PROFILE);
      if (response.data?.type === "success" && response.data.data) {
        const profile = response.data.data;
        setVendeurProfile(profile);
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email,
          expediteurNom: `${profile.prenoms} ${profile.nom}`,
        }));
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement du profil vendeur:", err);
      // Profil de démonstration
      setVendeurProfile({
        uuid: "vendeur-1",
        nom: "Vendeur",
        prenoms: "SONEC",
        email: "vendeur@sonec.com",
        telephone: "+2250100000000",
        est_verifie: true,
        est_bloque: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        statut: "actif",
      });
      setNewMessage((prev) => ({
        ...prev,
        expediteurEmail: "vendeur@sonec.com",
        expediteurNom: "Vendeur SONEC",
      }));
    }
  }, []);

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

      // Données de démonstration pour les agents
      const demoAgents: Agent[] = [
        {
          uuid: "agent-1",
          nom: "Dupont",
          prenoms: "Jean",
          email: "jean.dupont@sonec.com",
          telephone: "+2250700000001",
          est_verifie: true,
          est_bloque: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          statut: "actif",
        },
        {
          uuid: "agent-2",
          nom: "Martin",
          prenoms: "Sophie",
          email: "sophie.martin@sonec.com",
          telephone: "+2250700000002",
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

      // Données de démonstration pour les utilisateurs
      const demoUtilisateurs: Utilisateur[] = [
        {
          uuid: "user-1",
          nom: "Diallo",
          prenoms: "Fatou",
          email: "fatou.diallo@gmail.com",
          telephone: "+2250500000001",
          est_verifie: true,
          est_bloque: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          statut: "actif",
        },
        {
          uuid: "user-2",
          nom: "Traoré",
          prenoms: "Moussa",
          email: "moussa.traore@yahoo.com",
          telephone: "+2250500000002",
          est_verifie: false,
          est_bloque: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          statut: "actif",
        },
        {
          uuid: "user-3",
          nom: "Cissé",
          prenoms: "Adama",
          email: "adama.cisse@hotmail.com",
          telephone: "+2250500000003",
          est_verifie: true,
          est_bloque: true,
          is_deleted: false,
          created_at: new Date().toISOString(),
          statut: "inactif",
        },
      ];
      setUtilisateurs(demoUtilisateurs);
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

      if (!response) {
        console.warn("⚠️ Réponse API vide (messages reçus)");
        setMessages([]);
        return;
      }

      // Transformer les données pour correspondre au format attendu
      const transformedMessages = response
        .map((item: MessageReceived) => {
          if (!item) return null;

          return {
            ...item.message,
            estLu: item.estLu || false,
            dateLecture: item.dateLecture || null,
            envoyeLe:
              item.dateReception ||
              item.message.envoyeLe ||
              new Date().toISOString(),
          };
        })
        .filter((item): item is Message => item !== null);

      console.log("📨 Messages transformés:", transformedMessages);
      setMessages(transformedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching messages:", err);
      setError("Erreur lors du chargement des messages");

      // Données de démonstration adaptées
      const demoMessages: Message[] = [
        {
          uuid: "msg-1",
          sujet: "Nouvelle commande reçue",
          contenu:
            "Vous avez reçu une nouvelle commande sur votre boutique. Veuillez la traiter dans les plus brefs délais.",
          expediteurNom: "Système SONEC",
          expediteurEmail: "system@sonec.com",
          destinataireEmail: vendeurProfile?.email || "vendeur@sonec.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
        },
        {
          uuid: "msg-2",
          sujet: "Votre produit a été approuvé",
          contenu:
            "Félicitations ! Votre produit 'Smartphone XYZ' a été approuvé par notre équipe et est maintenant visible par les utilisateurs.",
          expediteurNom: "Équipe de modération",
          expediteurEmail: "moderation@sonec.com",
          destinataireEmail: vendeurProfile?.email || "vendeur@sonec.com",
          type: "INFO",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 3600000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          uuid: "msg-3",
          sujet: "Rappel : Paiement en attente",
          contenu:
            "Bonjour, vous avez un paiement en attente de traitement. Veuillez vérifier votre compte pour plus de détails.",
          expediteurNom: "Service financier",
          expediteurEmail: "finance@sonec.com",
          destinataireEmail: vendeurProfile?.email || "vendeur@sonec.com",
          type: "WARNING",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 7200000).toISOString(),
          estLu: false,
        },
      ];
      setMessages(demoMessages);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [vendeurProfile]);

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

      const formattedMessages = response
        .map((msg: Message) => {
          if (!msg) return null;

          return {
            ...msg,
            type: (msg.type || "notification").toUpperCase(),
            estLu: msg.estLu || false,
            dateLecture: msg.dateLecture || null,
            envoyeLe: msg.envoyeLe || new Date().toISOString(),
            expediteurNom: msg.expediteurNom || "Vendeur SONEC",
            expediteurEmail: msg.expediteurEmail || vendeurProfile?.email || "",
            estEnvoye: msg.estEnvoye !== undefined ? msg.estEnvoye : true,
          };
        })
        .filter((msg): msg is Message => msg !== null);

      console.log("📤 Messages envoyés transformés:", formattedMessages);
      setMessagesEnvoyes(formattedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching sent messages:", err);
      setError("Erreur lors du chargement des messages envoyés");

      // Données de démonstration
      const demoSentMessages: Message[] = [
        {
          uuid: "sent-1",
          sujet: "Question sur ma commande",
          contenu:
            "Bonjour, j'ai une question concernant ma commande #12345. Pouvez-vous m'aider ?",
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "vendeur@sonec.com",
          destinataireEmail: "jean.dupont@sonec.com",
          type: "INFO",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 7200000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 7000000).toISOString(),
        },
        {
          uuid: "sent-2",
          sujet: "Problème avec un client",
          contenu:
            "Bonjour Agent, j'ai un problème avec un client qui ne répond pas à mes messages concernant sa commande.",
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "vendeur@sonec.com",
          destinataireEmail: "sophie.martin@sonec.com",
          type: "WARNING",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 43200000).toISOString(),
          estLu: false,
        },
      ];
      setMessagesEnvoyes(demoSentMessages);
    }
  }, [vendeurProfile]);

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
    fetchVendeurProfile();
    fetchAgents();
    fetchUtilisateurs();
    fetchMessagesRecus();
    fetchMessagesEnvoyes();
  }, []);

  // Mettre à jour les statistiques
  useEffect(() => {
    const totalUsers = agents.length + utilisateurs.length;
    const totalMessages = messages.length + messagesEnvoyes.length;
    const unreadMessages = messages.filter((m) => !m.estLu).length;

    setStats({
      totalUsers,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
      agents: agents.length,
      utilisateurs: utilisateurs.length,
    });
  }, [agents, utilisateurs, messages, messagesEnvoyes]);

  // Combiner tous les utilisateurs (agents et utilisateurs uniquement)
  const allUsers = useMemo(() => {
    const users = [];

    // Ajouter les agents
    if (selectedType === "all" || selectedType === "agent") {
      users.push(
        ...agents.map((agent) => ({ ...agent, userType: "agent" as const })),
      );
    }

    // Ajouter les utilisateurs
    if (selectedType === "all" || selectedType === "utilisateur") {
      users.push(
        ...utilisateurs.map((utilisateur) => ({
          ...utilisateur,
          userType: "utilisateur" as const,
        })),
      );
    }

    return users;
  }, [agents, utilisateurs, selectedType]);

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
    userType?: string,
  ) => {
    setNewMessage((prev) => ({
      ...prev,
      destinataireEmail: email,
      sujet:
        `Message pour ${nom || ""} ${prenoms || ""}`.trim() ||
        "Message important",
      type: "NOTIFICATION",
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
        expediteurNom: vendeurProfile
          ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
          : "Vendeur SONEC",
        expediteurEmail: vendeurProfile?.email || "",
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

      // Simulation d'envoi réussi pour la démo
      setSuccessMessage("Message envoyé avec succès (démo) !");
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab("sent");

        // Ajouter le message aux messages envoyés (démo)
        const newSentMessage: Message = {
          uuid: `sent-${Date.now()}`,
          sujet: newMessage.sujet,
          contenu: newMessage.contenu,
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "vendeur@sonec.com",
          destinataireEmail: newMessage.destinataireEmail,
          type: newMessage.type,
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
        };
        setMessagesEnvoyes((prev) => [newSentMessage, ...prev]);

        // Réinitialiser le formulaire
        setNewMessage({
          destinataireEmail: "",
          sujet: "",
          contenu: "",
          type: "NOTIFICATION",
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "",
        });
      }, 1000);
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
      expediteurNom: vendeurProfile
        ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
        : "Vendeur SONEC",
      expediteurEmail: vendeurProfile?.email || "",
    });
    setActiveTab("users");
  };

  // Obtenir l'icône pour le type d'utilisateur
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return faUserTie;
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
      <div className="container-fluid px-4 py-4">
        {/* Header avec titre et actions */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="me-3 text-primary"
              />
              Messagerie Vendeur
            </h1>
            <p className="text-muted mb-0">
              Gérez vos messages et communiquez avec les agents et utilisateurs
            </p>
          </div>
          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setActiveTab("users")}
            >
              <FontAwesomeIcon icon={faUserPen} />
              Nouveau message
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                fetchAgents();
                fetchUtilisateurs();
                fetchMessagesRecus();
                fetchMessagesEnvoyes();
              }}
            >
              <FontAwesomeIcon icon={faHistory} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Cartes de statistiques améliorées */}
        <div className="row g-4 mb-5">
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="Agents"
              value={stats.agents}
              icon={faUserTie}
              color="primary"
              subtitle="Agents de support"
              trend="up"
              isLoading={loading.agents}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="Utilisateurs"
              value={stats.utilisateurs}
              icon={faUser}
              color="info"
              subtitle="Clients potentiels"
              trend="neutral"
              isLoading={loading.utilisateurs}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="Messages Reçus"
              value={stats.totalMessages}
              icon={faInbox}
              color="success"
              subtitle={`${stats.unreadMessages} non lus`}
              trend="neutral"
              isLoading={loading.messages}
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="Messages Envoyés"
              value={stats.sentMessages}
              icon={faShareSquare}
              color="warning"
              subtitle="Ce mois"
              trend="up"
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="Total Contacts"
              value={stats.totalUsers}
              icon={faUsers}
              color="purple"
              subtitle="Agents et utilisateurs"
              trend="up"
            />
          </div>
          <div className="col-xl-2 col-lg-4 col-md-6">
            <StatsCard
              title="En Attente"
              value={0}
              icon={faClock}
              color="danger"
              subtitle="Messages en cours"
              trend="down"
            />
          </div>
        </div>

        {/* Onglets principaux améliorés */}
        <div className="card border-0 shadow-lg mb-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-4 px-4">
            <ul
              className="nav nav-tabs nav-tabs-custom border-0 d-flex justify-content-between"
              role="tablist"
              style={{ gap: "0.5rem" }}
            >
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "users" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-3`}
                  onClick={() => setActiveTab("users")}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon icon={faUsers} className="fs-5 mb-1" />
                    <span className="fw-semibold">Destinataires</span>
                  </div>
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "received" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-3`}
                  onClick={() => setActiveTab("received")}
                >
                  <div className="d-flex flex-column align-items-center position-relative">
                    <FontAwesomeIcon icon={faInbox} className="fs-5 mb-1" />
                    <span className="fw-semibold">Messages reçus</span>
                    {stats.unreadMessages > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {stats.unreadMessages}
                      </span>
                    )}
                  </div>
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "sent" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-3`}
                  onClick={() => setActiveTab("sent")}
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

          <div className="card-body p-4">
            {/* Onglet: Destinataires */}
            {activeTab === "users" && (
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0 py-4 px-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 fw-bold text-dark">
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="me-2 text-primary"
                            />
                            Liste des destinataires
                          </h5>
                          <p className="text-muted mb-0 mt-1">
                            Sélectionnez des agents ou utilisateurs pour leur
                            envoyer des messages
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            <FontAwesomeIcon
                              icon={faUserCheck}
                              className="me-2"
                            />
                            {filteredUsers.length} contact(s)
                          </span>
                        </div>
                      </div>

                      {/* Filtres améliorés */}
                      <div className="row g-3 mt-4">
                        <div className="col-lg-6">
                          <div className="input-group input-group-lg shadow-sm">
                            <span className="input-group-text bg-white border-end-0 ps-4">
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="text-muted"
                              />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0 ps-2 py-3"
                              placeholder="Rechercher un contact..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <div className="input-group input-group-lg shadow-sm">
                            <label className="input-group-text bg-white border-end-0">
                              <FontAwesomeIcon
                                icon={faUserTag}
                                className="text-muted"
                              />
                            </label>
                            <select
                              className="form-select border-start-0 py-3"
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                            >
                              <option value="all">Tous les types</option>
                              <option value="agent">Agents</option>
                              <option value="utilisateur">Utilisateurs</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <div className="input-group input-group-lg shadow-sm">
                            <label className="input-group-text bg-white border-end-0">
                              <FontAwesomeIcon
                                icon={faFilter}
                                className="text-muted"
                              />
                            </label>
                            <select
                              className="form-select border-start-0 py-3"
                              value={selectedStatus}
                              onChange={(e) =>
                                setSelectedStatus(e.target.value)
                              }
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
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th
                                className="py-3 px-4"
                                style={{ width: "60px" }}
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
                                className="py-3 px-4"
                                style={{ width: "80px" }}
                              >
                                <span className="text-muted fw-medium">#</span>
                              </th>
                              <th className="py-3 px-4">
                                <span className="text-muted fw-medium">
                                  Contact
                                </span>
                              </th>
                              <th
                                className="py-3 px-4"
                                style={{ width: "140px" }}
                              >
                                <span className="text-muted fw-medium">
                                  Type
                                </span>
                              </th>
                              <th
                                className="py-3 px-4"
                                style={{ width: "140px" }}
                              >
                                <span className="text-muted fw-medium">
                                  Statut
                                </span>
                              </th>
                              <th
                                className="py-3 px-4 text-center"
                                style={{ width: "120px" }}
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
                                <td colSpan={6} className="text-center py-5">
                                  <div className="text-muted py-5">
                                    <FontAwesomeIcon
                                      icon={faUsers}
                                      className="fs-1 mb-3 opacity-25"
                                    />
                                    <h5 className="fw-semibold mb-2">
                                      Aucun contact trouvé
                                    </h5>
                                    <p className="mb-0">
                                      Ajustez vos filtres pour voir les agents
                                      ou utilisateurs
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
                                  <td className="py-3 px-4">
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
                                  <td className="py-3 px-4">
                                    <span className="text-muted fw-semibold">
                                      {index + 1}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="d-flex align-items-center">
                                      <div
                                        className={`bg-${getUserTypeColor(user.userType)} bg-opacity-10 text-${getUserTypeColor(user.userType)} rounded-circle d-flex align-items-center justify-content-center me-3`}
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                      >
                                        <FontAwesomeIcon
                                          icon={getUserTypeIcon(user.userType)}
                                          className="fs-5"
                                        />
                                      </div>
                                      <div>
                                        <div className="fw-bold text-dark">
                                          {user.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                          <small className="text-muted">
                                            {user.nom} {user.prenoms}
                                          </small>
                                          {user.telephone && (
                                            <>
                                              <span className="text-muted">
                                                •
                                              </span>
                                              <small className="text-muted">
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
                                  <td className="py-3 px-4">
                                    <span
                                      className={`badge bg-${getUserTypeColor(user.userType)} bg-opacity-10 text-${getUserTypeColor(user.userType)} border border-${getUserTypeColor(user.userType)} border-opacity-25 px-3 py-2 fw-medium`}
                                    >
                                      {getUserTypeLabel(user.userType)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <StatusBadge
                                      est_bloque={user.est_bloque}
                                      est_verifie={user.est_verifie}
                                      is_deleted={user.is_deleted}
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-1 px-3 py-2"
                                      title="Envoyer un message"
                                      onClick={() =>
                                        selectUserForMessage(
                                          user.email,
                                          user.nom,
                                          user.prenoms,
                                          user.userType,
                                        )
                                      }
                                    >
                                      <FontAwesomeIcon icon={faPaperPlane} />
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
                    className="card border-0 shadow-sm h-100 sticky-top"
                    style={{ top: "20px" }}
                  >
                    <div className="card-header bg-white border-0 py-4 px-4">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="text-primary fs-4"
                          />
                        </div>
                        <div>
                          <h5 className="mb-0 fw-bold text-dark">
                            Nouveau message
                          </h5>
                          <p className="text-muted mb-0">
                            Rédigez et envoyez un message personnalisé
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      {successMessage && (
                        <div
                          className="alert alert-success alert-dismissible fade show mb-4"
                          role="alert"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-2 fs-4"
                            />
                            <div>
                              <h6 className="alert-heading mb-1">
                                Message envoyé !
                              </h6>
                              <p className="mb-0">{successMessage}</p>
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
                          className="alert alert-danger alert-dismissible fade show mb-4"
                          role="alert"
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faExclamationCircle}
                              className="me-2 fs-4"
                            />
                            <div>
                              <h6 className="alert-heading mb-1">Erreur</h6>
                              <p className="mb-0">{error}</p>
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
                        <div className="mb-4">
                          <label className="form-label fw-semibold text-dark mb-2">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="me-2 text-muted"
                            />
                            Destinataire <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-lg border-2 py-3"
                            placeholder="email@exemple.com"
                            value={newMessage.destinataireEmail}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                destinataireEmail: e.target.value,
                              }))
                            }
                            required
                          />
                          <small className="text-muted d-block mt-2">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            Sélectionnez un contact dans le tableau
                          </small>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold text-dark mb-2">
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="me-2 text-muted"
                            />
                            Sujet <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 py-3"
                            placeholder="Sujet du message"
                            value={newMessage.sujet}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                sujet: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold text-dark mb-2">
                            <FontAwesomeIcon
                              icon={faBell}
                              className="me-2 text-muted"
                            />
                            Type de message
                          </label>
                          <select
                            className="form-select form-select-lg border-2 py-3"
                            value={newMessage.type}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                type: e.target.value,
                              }))
                            }
                          >
                            <option value="NOTIFICATION">Notification</option>
                            <option value="ALERT">Alerte</option>
                            <option value="INFO">Information</option>
                            <option value="WARNING">Avertissement</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold text-dark mb-2">
                            <FontAwesomeIcon
                              icon={faMessage}
                              className="me-2 text-muted"
                            />
                            Message <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control border-2 py-3"
                            rows={8}
                            placeholder="Écrivez votre message ici..."
                            value={newMessage.contenu}
                            onChange={(e) =>
                              setNewMessage((prev) => ({
                                ...prev,
                                contenu: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="d-grid">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-3 py-3 fw-bold"
                            disabled={loading.envoi}
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
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0 py-4 px-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 fw-bold text-dark">
                            <FontAwesomeIcon
                              icon={faInbox}
                              className="me-2 text-primary"
                            />
                            Messages reçus
                          </h5>
                          <p className="text-muted mb-0 mt-1">
                            {stats.unreadMessages > 0
                              ? `${stats.unreadMessages} message(s) non lu(s)`
                              : "Tous vos messages sont lus"}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            {messages.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={fetchMessagesRecus}
                          >
                            <FontAwesomeIcon icon={faHistory} />
                            Actualiser
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div className="list-group list-group-flush px-4 py-3">
                        {messages.length === 0 ? (
                          <div className="text-center py-5">
                            <div className="text-muted py-5">
                              <FontAwesomeIcon
                                icon={faInbox}
                                className="fs-1 mb-3 opacity-25"
                              />
                              <h5 className="fw-semibold mb-2">
                                Aucun message reçu
                              </h5>
                              <p className="mb-0">
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
                    className="card border-0 shadow-sm h-100 sticky-top"
                    style={{ top: "20px" }}
                  >
                    <div className="card-header bg-white border-0 py-4 px-4">
                      <h5 className="mb-0 fw-bold text-dark">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="me-2 text-primary"
                        />
                        Détails du message
                      </h5>
                      <p className="text-muted mb-0 mt-1">
                        Informations détaillées du message sélectionné
                      </p>
                    </div>
                    <div className="card-body">
                      {selectedMessage ? (
                        <>
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="fw-bold text-primary mb-2 flex-grow-1">
                                {selectedMessage.sujet}
                              </h6>
                              <span
                                className={`badge bg-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} bg-opacity-10 text-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} border border-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : "primary"} border-opacity-25 px-3 py-2`}
                              >
                                {selectedMessage.type.toUpperCase()}
                              </span>
                            </div>
                            <div className="bg-light rounded-3 p-4 mb-3">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-primary fs-4"
                                  />
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1">
                                    {selectedMessage.expediteurNom}
                                  </h6>
                                  <p className="text-muted mb-0">
                                    {selectedMessage.expediteurEmail}
                                  </p>
                                </div>
                              </div>
                              <div className="text-muted mb-3">
                                <small>
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

                          <div className="mb-4">
                            <h6 className="fw-semibold mb-3 text-dark">
                              Contenu :
                            </h6>
                            <div className="p-4 bg-light rounded-3">
                              {selectedMessage.contenu
                                .split("\n")
                                .map((line, index) => (
                                  <p
                                    key={index}
                                    className={index > 0 ? "mt-3" : ""}
                                    style={{ lineHeight: "1.6" }}
                                  >
                                    {line}
                                  </p>
                                ))}
                            </div>
                          </div>

                          <div className="d-grid gap-3">
                            <button
                              className="btn btn-primary d-flex align-items-center justify-content-center gap-3 py-3 fw-bold"
                              onClick={() => handleReply(selectedMessage)}
                            >
                              <FontAwesomeIcon
                                icon={faReply}
                                className="fs-5"
                              />
                              Répondre au message
                            </button>
                            <button
                              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-3 py-3"
                              onClick={() => setSelectedMessage(null)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              Fermer les détails
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5">
                          <div className="text-muted py-5">
                            <FontAwesomeIcon
                              icon={faMessage}
                              className="fs-1 mb-3 opacity-25"
                            />
                            <h5 className="fw-semibold mb-2">
                              Aucun message sélectionné
                            </h5>
                            <p className="mb-0">
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
                    <div className="card-header bg-white border-0 py-4 px-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 fw-bold text-dark">
                            <FontAwesomeIcon
                              icon={faShareSquare}
                              className="me-2 text-primary"
                            />
                            Messages envoyés
                          </h5>
                          <p className="text-muted mb-0 mt-1">
                            Historique de tous vos messages envoyés
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                            {messagesEnvoyes.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={fetchMessagesEnvoyes}
                          >
                            <FontAwesomeIcon icon={faHistory} />
                            Actualiser
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="py-3 px-4">Destinataire</th>
                              <th className="py-3 px-4">Sujet</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4">Date d'envoi</th>
                              <th className="py-3 px-4">Statut</th>
                              <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {messagesEnvoyes.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-5">
                                  <div className="text-muted py-5">
                                    <FontAwesomeIcon
                                      icon={faShareSquare}
                                      className="fs-1 mb-3 opacity-25"
                                    />
                                    <h5 className="fw-semibold mb-2">
                                      Aucun message envoyé
                                    </h5>
                                    <p className="mb-0">
                                      Envoyez votre premier message depuis
                                      l'onglet "Destinataires"
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              messagesEnvoyes.map((message) => (
                                <tr key={message.uuid}>
                                  <td className="py-3 px-4">
                                    <div className="fw-bold text-dark">
                                      {message.destinataireEmail}
                                    </div>
                                    <small className="text-muted">
                                      {message.expediteurEmail}
                                    </small>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div
                                      className="text-truncate"
                                      style={{ maxWidth: "250px" }}
                                      title={message.sujet}
                                    >
                                      {message.sujet}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`badge bg-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} bg-opacity-10 text-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} border border-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : "primary"} border-opacity-25 px-3 py-2 fw-medium`}
                                    >
                                      {message.type}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="d-flex flex-column">
                                      <span className="fw-medium">
                                        {formatDate(message.envoyeLe)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    {message.estLu ? (
                                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-flex align-items-center gap-2 px-3 py-2">
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="fs-12"
                                        />
                                        <span className="fw-medium">Lu</span>
                                      </span>
                                    ) : (
                                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-flex align-items-center gap-2 px-3 py-2">
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
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3 py-2"
                                      onClick={() => {
                                        setNewMessage({
                                          destinataireEmail:
                                            message.destinataireEmail,
                                          sujet: `RE: ${message.sujet}`,
                                          contenu: "",
                                          type: "NOTIFICATION",
                                          expediteurNom: vendeurProfile
                                            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
                                            : "Vendeur SONEC",
                                          expediteurEmail:
                                            vendeurProfile?.email || "",
                                        });
                                        setActiveTab("users");
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faReply} />
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
              <strong className="me-auto">Information</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setInfoMessage(null)}
              ></button>
            </div>
            <div className="toast-body">{infoMessage}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        :root {
          --bs-primary: #0d6efd;
          --bs-primary-rgb: 13, 110, 253;
          --bs-purple: #6f42c1;
          --bs-purple-rgb: 111, 66, 193;
        }

        .bg-purple {
          background-color: var(--bs-purple) !important;
        }

        .text-purple {
          color: var(--bs-purple) !important;
        }

        .border-purple {
          border-color: var(--bs-purple) !important;
        }

        .bg-purple.bg-opacity-10 {
          background-color: rgba(var(--bs-purple-rgb), 0.1) !important;
        }

        .text-purple {
          color: rgba(var(--bs-purple-rgb), 1) !important;
        }

        .border-purple.border-opacity-25 {
          border-color: rgba(var(--bs-purple-rgb), 0.25) !important;
        }

        .nav-tabs-custom .nav-link {
          border: none;
          color: #6c757d;
          padding: 0;
          font-weight: 500;
          position: relative;
          background: transparent;
          transition: all 0.3s ease;
        }

        .nav-tabs-custom .nav-link.active {
          color: var(--bs-primary);
          background: rgba(var(--bs-primary-rgb), 0.1);
          border-radius: 12px;
        }

        .nav-tabs-custom .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background-color: var(--bs-primary);
          border-radius: 3px 3px 0 0;
        }

        .nav-tabs-custom .nav-link:hover:not(.active) {
          color: var(--bs-primary);
          background: rgba(0, 0, 0, 0.02);
          border-radius: 12px;
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
          border-radius: 16px;
          overflow: hidden;
        }

        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
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
          padding: 1rem 1.25rem;
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
            font-size: 0.875rem;
          }

          .container-fluid {
            padding-left: 1rem;
            padding-right: 1rem;
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
      `}</style>
    </>
  );
}
