// app/(back-office)/dashboard-vendeur/messages/page.tsx
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
  faChevronRight,
  faChevronLeft,
  faSort,
  faCheckSquare,
  faSquare,
  faBan,
  faUserCheck,
  faUserSlash,
  faCheck,
  faTimes,
  faEdit,
  faUserTag,
  faPhone,
  faCircle,
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
  faBell,
  faEnvelopeCircleCheck,
  faBuilding,
  faBox,
  faShoppingCart,
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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  avatar?: string;
  statut?: string;
}

interface VendeurProfile extends UtilisateurBase {
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

// Interface pour les réponses API
interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: string;
}

// Interface pour les messages de l'API
interface ApiMessage {
  uuid: string;
  sujet: string;
  contenu: string;
  expediteurNom?: string;
  expediteurEmail?: string;
  destinataireEmail?: string;
  type?: string;
  estEnvoye?: boolean;
  envoyeLe?: string;
  estLu?: boolean;
  dateLecture?: string | null;
  dateCreation?: string;
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

export default function MessagerieVendeur() {
  // États pour les données
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [vendeurProfile, setVendeurProfile] = useState<VendeurProfile | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    utilisateurs: false,
    messages: false,
    envoi: false,
    profile: false,
  });

  // États pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
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
    type: "notification",
    expediteurNom: "",
    expediteurEmail: "",
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

  // Charger le profil du vendeur connecté
  const fetchVendeurProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      console.log("🔍 Chargement du profil vendeur...");
      const response = await api.get<ApiResponse<VendeurProfile>>(
        API_ENDPOINTS.AUTH.VENDEUR.PROFILE,
      );
      console.log("✅ Profil vendeur chargé:", response);

      if (response && response.data) {
        const profile = response.data;
        setVendeurProfile(profile);
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email || "vendeur@sonec.com",
          expediteurNom:
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
            "Vendeur SONEC",
        }));
      } else {
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: "vendeur@sonec.com",
          expediteurNom: "Vendeur SONEC",
        }));
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement du profil vendeur:", err);
      setError("Erreur lors du chargement du profil");
      setNewMessage((prev) => ({
        ...prev,
        expediteurEmail: "vendeur@sonec.com",
        expediteurNom: "Vendeur SONEC",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  // Charger les utilisateurs (clients seulement pour vendeur)
  const fetchUtilisateurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, utilisateurs: true }));
    try {
      const response = await api.get<ApiResponse<Utilisateur[]>>(
        API_ENDPOINTS.ADMIN.USERS.LIST,
      );
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
      console.log("🔄 Chargement des messages reçus pour vendeur...");
      const response = await api.get<ApiResponse<any[]>>(
        API_ENDPOINTS.MESSAGERIE.RECEIVED,
      );

      if (
        !response ||
        !response.data ||
        (Array.isArray(response.data) && response.data.length === 0)
      ) {
        console.warn("⚠️ Réponse API vide (messages reçus)");
        setMessages([]);
        return;
      }

      let responseData = Array.isArray(response.data) ? response.data : [];

      const transformedMessages = responseData
        .map((item: any) => {
          if (!item || !item.message) return null;

          return {
            uuid: item.message.uuid || item.uuid || "",
            sujet: item.message.sujet || "",
            contenu: item.message.contenu || "",
            expediteurNom: item.message.expediteurNom || "",
            expediteurEmail: item.message.expediteurEmail || "",
            destinataireEmail: item.message.destinataireEmail || "",
            type: (item.message.type || "notification").toUpperCase(),
            estEnvoye: item.message.estEnvoye || false,
            envoyeLe:
              item.dateReception ||
              item.message.envoyeLe ||
              new Date().toISOString(),
            estLu: item.estLu || false,
            dateLecture: item.dateLecture || null,
            dateCreation: item.message.dateCreation,
          } as Message;
        })
        .filter((item: any): item is Message => item !== null);

      setMessages(transformedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching messages:", err);
      setError("Erreur lors du chargement des messages");

      // Données de démonstration adaptées pour vendeur
      const demoMessages: Message[] = [
        {
          uuid: "c5d30cbd-b606-4721-8ec7-5a00f7df9e87",
          sujet: "Nouvelle commande reçue",
          contenu:
            "Vous avez reçu une nouvelle commande pour votre produit 'Téléphone Samsung'.",
          expediteurNom: "Système SONEC",
          expediteurEmail: "system@sonec.com",
          destinataireEmail: vendeurProfile?.email || "vendeur@sonec.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
          dateLecture: null,
        },
        {
          uuid: "2",
          sujet: "Avis client sur votre produit",
          contenu:
            "Un client a laissé un avis sur votre produit 'Casque Bluetooth'...",
          expediteurNom: "Système SONEC",
          expediteurEmail: "system@sonec.com",
          destinataireEmail: vendeurProfile?.email || "vendeur@sonec.com",
          type: "INFO",
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
  }, [vendeurProfile]);

  // Charger les messages envoyés
  const fetchMessagesEnvoyes = useCallback(async () => {
    try {
      console.log("🔄 Chargement des messages envoyés...");
      const response = await api.get<ApiResponse<ApiMessage[]>>(
        API_ENDPOINTS.MESSAGERIE.SENT,
      );

      if (
        !response ||
        !response.data ||
        (Array.isArray(response.data) && response.data.length === 0)
      ) {
        console.warn("⚠️ Réponse API vide (messages envoyés)");
        setMessagesEnvoyes([]);
        return;
      }

      let responseData = Array.isArray(response.data) ? response.data : [];

      const formattedMessages = responseData
        .map((msg: any) => {
          if (!msg) return null;

          return {
            uuid: msg.uuid || "",
            sujet: msg.sujet || "",
            contenu: msg.contenu || "",
            expediteurNom: msg.expediteurNom || "Vendeur SONEC",
            expediteurEmail: msg.expediteurEmail || vendeurProfile?.email || "",
            destinataireEmail: msg.destinataireEmail || "",
            type: (msg.type || "notification").toUpperCase(),
            estEnvoye: msg.estEnvoye !== undefined ? msg.estEnvoye : true,
            envoyeLe: msg.envoyeLe || new Date().toISOString(),
            estLu: msg.estLu || false,
            dateLecture: msg.dateLecture || null,
            dateCreation: msg.dateCreation,
          } as Message;
        })
        .filter((msg: any): msg is Message => msg !== null);

      setMessagesEnvoyes(formattedMessages);
    } catch (err: any) {
      console.error("❌ Error fetching sent messages:", err);
      setError("Erreur lors du chargement des messages envoyés");

      const demoSentMessages: Message[] = [
        {
          uuid: "sent-1",
          sujet: "Réponse à une question sur mon produit",
          contenu:
            "Bonjour, voici les informations concernant votre question sur le produit...",
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "vendeur@sonec.com",
          destinataireEmail: "client@gmail.com",
          type: "INFO",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 7200000).toISOString(),
          estLu: true,
          dateLecture: new Date(Date.now() - 7000000).toISOString(),
        },
        {
          uuid: "sent-2",
          sujet: "Confirmation d'expédition",
          contenu: "Votre commande a été expédiée aujourd'hui...",
          expediteurNom: vendeurProfile
            ? `${vendeurProfile.prenoms} ${vendeurProfile.nom}`
            : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "vendeur@sonec.com",
          destinataireEmail: "client2@gmail.com",
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date(Date.now() - 43200000).toISOString(),
          estLu: false,
          dateLecture: null,
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
    console.log("🚀 Chargement des données pour vendeur...");
    fetchVendeurProfile();
    fetchUtilisateurs();
    fetchMessagesRecus();
    fetchMessagesEnvoyes();
  }, []);

  // Mettre à jour les statistiques
  useEffect(() => {
    const totalUsers = utilisateurs.length;
    const totalMessages = messages.length + messagesEnvoyes.length;
    const unreadMessages = messages.filter((m) => !m.estLu).length;

    setStats({
      totalUsers,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
    });
  }, [utilisateurs, messages, messagesEnvoyes]);

  // Filtrer les utilisateurs
  const filteredUsers = useMemo(() => {
    let result = utilisateurs.filter((v) => !v.is_deleted);

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
  }, [utilisateurs, searchTerm, selectedStatus]);

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

      const response = await api.post<ApiMessage>(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData,
      );

      console.log("✅ Réponse de l'API:", response);

      if (response) {
        const sentMessage = response as unknown as ApiMessage;

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
          type: "notification",
          expediteurNom: newMessage.expediteurNom,
          expediteurEmail: newMessage.expediteurEmail,
        });

        setActiveTab("sent");
      }
    } catch (err: any) {
      console.error("❌ Error sending message:", err);

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
      } else if (err.errorMessage) {
        errorMessage = err.errorMessage;
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
      type: message.type.toLowerCase(),
      expediteurNom: newMessage.expediteurNom,
      expediteurEmail: newMessage.expediteurEmail,
    });
    setActiveTab("users");
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
              Gérez vos messages et communiquez avec vos clients
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
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Clients Totaux"
              value={stats.totalUsers}
              icon={faUsers}
              color="primary"
              subtitle="Clients disponibles"
              trend="up"
              isLoading={loading.utilisateurs}
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
                    <span className="fw-semibold">Clients</span>
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
            {/* Onglet: Clients */}
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
                            Liste des clients
                          </h5>
                          <p className="text-muted mb-0 mt-1">
                            Sélectionnez des clients pour leur envoyer des
                            messages
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            <FontAwesomeIcon
                              icon={faUserCheck}
                              className="me-2"
                            />
                            {filteredUsers.length} client(s)
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
                              placeholder="Rechercher un client..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
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
                                  Client
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
                                <td colSpan={5} className="text-center py-5">
                                  <div className="text-muted py-5">
                                    <FontAwesomeIcon
                                      icon={faUsers}
                                      className="fs-1 mb-3 opacity-25"
                                    />
                                    <h5 className="fw-semibold mb-2">
                                      Aucun client trouvé
                                    </h5>
                                    <p className="mb-0">Ajustez vos filtres</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map((user, index) => (
                                <tr
                                  key={`utilisateur-${user.uuid}`}
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
                                        className={`bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center me-3`}
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                      >
                                        <FontAwesomeIcon
                                          icon={faUser}
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
                            Rédigez et envoyez un message à un client
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
                            Destinataire (Client){" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-lg border-2 py-3"
                            placeholder="client@exemple.com"
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
                            Sélectionnez un client dans le tableau
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
                            <option value="notification">Notification</option>
                            <option value="alert">Alerte</option>
                            <option value="info">Information</option>
                            <option value="warning">Avertissement</option>
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
                                      l'onglet "Clients"
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
                                          type: message.type.toLowerCase(),
                                          expediteurNom:
                                            newMessage.expediteurNom,
                                          expediteurEmail:
                                            newMessage.expediteurEmail,
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
