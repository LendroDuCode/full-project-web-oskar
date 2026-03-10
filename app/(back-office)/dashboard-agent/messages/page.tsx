"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEnvelopeOpen,
  faEnvelopeOpenText,
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
  faExclamationTriangle,
  faCheckDouble,
  faArrowLeft,
  faSmile,
  faPaperclip,
  faCamera,
  faMicrophone,
  faEllipsisH,
  faForward,
  faCopy,
  faHome, // 👈 Ajout de l'icône home
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// Couleurs OSKAR
const colors = {
  oskar: {
    green: "#28a745",
    black: "#1e1e1e",
    grey: "#6c757d",
  },
};

// Types pour les utilisateurs
interface UtilisateurBase {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  boutique?: {
    uuid: string;
    nom: string;
  };
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

interface Agent extends UtilisateurBase {
  userType?: "agent";
}

interface SuperAdmin extends UtilisateurBase {}
interface Vendeur extends UtilisateurBase {}
interface Utilisateur extends UtilisateurBase {}

interface Message {
  uuid: string;
  sujet: string;
  contenu: string;
  expediteurNom: string;
  expediteurEmail: string;
  expediteurUuid?: string;
  destinataireEmail: string;
  destinataireUuid?: string;
  type: string;
  estEnvoye: boolean;
  envoyeLe: string;
  estLu: boolean;
  dateLecture: string | null;
  dateCreation?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size?: number;
  }>;
}

interface MessageReceived {
  uuid: string;
  message: Message;
  statut: string;
  estLu: boolean;
  dateLecture?: string | null;
  dateReception: string;
}

interface ContactConversation {
  uuid: string;
  email: string;
  nom: string;
  prenoms: string;
  telephone: string;
  userType: "super_admin" | "admin" | "agent" | "vendeur" | "utilisateur";
  lastMessageDate?: string;
  lastMessage?: string;
  lastMessageStatus?: "sent" | "delivered" | "read" | "failed";
  unreadCount?: number;
  totalMessages?: number;
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted: boolean;
  is_admin?: boolean;
  is_super_admin?: boolean;
  boutique?: {
    uuid: string;
    nom: string;
  };
  avatar?: string;
  online?: boolean;
  lastSeen?: string;
  typing?: boolean;
}

interface Conversation {
  contact: ContactConversation;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

// Type pour les notifications toast
interface ToastNotification {
  id: string;
  type:
    | "success"
    | "error"
    | "info"
    | "warning"
    | "new-message"
    | "message-read";
  title: string;
  message: string;
  duration?: number;
  read?: boolean;
  messageId?: string;
  expediteur?: string;
  destinataire?: {
    nom?: string;
    email: string;
  };
  details?: {
    sujet?: string;
    date?: string;
  };
}

// Cache pour les appels API
const CACHE_DURATION = 60000; // 1 minute

// ============================================
// COMPOSANTS UTILITAIRES
// ============================================
const StatusBadge = ({
  est_bloque,
  est_verifie,
  is_deleted,
  is_super_admin,
  is_admin,
}: {
  est_bloque: boolean;
  est_verifie: boolean;
  is_deleted?: boolean;
  is_super_admin?: boolean;
  is_admin?: boolean;
}) => {
  if (is_deleted) {
    return (
      <span className="badge bg-secondary d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
        <FontAwesomeIcon icon={faTrash} style={{ fontSize: "0.6rem" }} />
        <span>Supprimé</span>
      </span>
    );
  }

  if (est_bloque) {
    return (
      <span className="badge bg-danger d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
        <FontAwesomeIcon icon={faBan} style={{ fontSize: "0.6rem" }} />
        <span>Bloqué</span>
      </span>
    );
  }

  if (!est_verifie) {
    return (
      <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
        <FontAwesomeIcon icon={faUserSlash} style={{ fontSize: "0.6rem" }} />
        <span>Non vérifié</span>
      </span>
    );
  }

  if (is_super_admin) {
    return (
      <span className="badge bg-purple d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
        <FontAwesomeIcon icon={faCrown} style={{ fontSize: "0.6rem" }} />
        <span>Super Admin</span>
      </span>
    );
  }

  if (is_admin) {
    return (
      <span className="badge bg-info d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
        <FontAwesomeIcon icon={faShield} style={{ fontSize: "0.6rem" }} />
        <span>Admin</span>
      </span>
    );
  }

  return (
    <span className="badge bg-success d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "12px" }}>
      <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: "0.6rem" }} />
      <span>Actif</span>
    </span>
  );
};

const OnlineIndicator = ({ online, lastSeen }: { online?: boolean; lastSeen?: string }) => {
  if (online) {
    return (
      <div className="position-relative d-inline-block">
        <div className="bg-success rounded-circle" style={{ width: "10px", height: "10px" }} />
        <span className="visually-hidden">En ligne</span>
      </div>
    );
  }

  if (lastSeen) {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let lastSeenText = "";
    if (diffMins < 1) lastSeenText = "à l'instant";
    else if (diffMins < 60) lastSeenText = `il y a ${diffMins} min`;
    else if (diffHours < 24) lastSeenText = `il y a ${diffHours} h`;
    else if (diffDays < 7) lastSeenText = `il y a ${diffDays} j`;
    else lastSeenText = date.toLocaleDateString("fr-FR");

    return (
      <div className="d-flex align-items-center gap-1">
        <div className="bg-secondary bg-opacity-25 rounded-circle" style={{ width: "8px", height: "8px" }} />
        <span className="text-muted" style={{ fontSize: "0.65rem" }}>{lastSeenText}</span>
      </div>
    );
  }

  return null;
};

const MessageStatus = ({ status }: { status?: "sent" | "delivered" | "read" | "failed" }) => {
  switch (status) {
    case "sent":
      return <FontAwesomeIcon icon={faCheck} className="text-muted" style={{ fontSize: "0.7rem" }} />;
    case "delivered":
      return <FontAwesomeIcon icon={faCheckDouble} className="text-muted" style={{ fontSize: "0.7rem" }} />;
    case "read":
      return <FontAwesomeIcon icon={faCheckDouble} className="text-primary" style={{ fontSize: "0.7rem" }} />;
    case "failed":
      return <FontAwesomeIcon icon={faExclamationCircle} className="text-danger" style={{ fontSize: "0.7rem" }} />;
    default:
      return null;
  }
};

const TypingIndicator = () => (
  <div className="d-flex align-items-center gap-1 p-2">
    <div className="typing-dot" style={{ animationDelay: "0ms" }} />
    <div className="typing-dot" style={{ animationDelay: "150ms" }} />
    <div className="typing-dot" style={{ animationDelay: "300ms" }} />
    <style jsx>{`
      .typing-dot {
        width: 6px;
        height: 6px;
        background-color: #25D366;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
      }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

const MessageBubble = ({
  message,
  isOwn,
  status,
  showAvatar,
  avatar,
  senderName,
  onReply,
  onDelete,
  onForward,
  onCopy,
}: {
  message: Message;
  isOwn: boolean;
  status?: "sent" | "delivered" | "read" | "failed";
  showAvatar?: boolean;
  avatar?: string;
  senderName?: string;
  onReply?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.contenu);
    if (onCopy) onCopy();
    setShowOptions(false);
  };

  const getTypeColor = () => {
    const type = (message.type || "").toUpperCase();
    switch (type) {
      case "ALERT":
        return "#dc3545";
      case "WARNING":
        return "#ffc107";
      case "INFO":
        return "#0dcaf0";
      case "NOTIFICATION":
        return "#0d6efd";
      case "SUPER_ADMIN":
        return "#6f42c1";
      default:
        return "#6c757d";
    }
  };

  return (
    <div
      className={`d-flex ${isOwn ? "justify-content-end" : "justify-content-start"} mb-3`}
      ref={messageRef}
    >
      {!isOwn && showAvatar && (
        <div className="me-2 flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={senderName || "Avatar"}
              className="rounded-circle"
              style={{ width: "36px", height: "36px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px", backgroundColor: "#0d6efd20" }}
            >
              <FontAwesomeIcon icon={faUser} style={{ color: "#0d6efd" }} />
            </div>
          )}
        </div>
      )}

      <div
        className={`position-relative message-bubble ${isOwn ? "own-message" : "other-message"}`}
        style={{
          maxWidth: "70%",
          backgroundColor: isOwn ? "#DCF8C6" : "#FFFFFF",
          borderRadius: "18px",
          borderTopLeftRadius: !isOwn && showAvatar ? "4px" : "18px",
          borderTopRightRadius: isOwn ? "4px" : "18px",
          padding: "8px 12px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          wordWrap: "break-word",
        }}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={(e) => {
          if (optionsRef.current && !optionsRef.current.contains(e.relatedTarget as Node)) {
            setShowOptions(false);
          }
        }}
      >
        {message.type.toUpperCase() === "SUPER_ADMIN" && !isOwn && (
          <div className="mb-1 d-flex align-items-center gap-1">
            <FontAwesomeIcon icon={faCrown} style={{ fontSize: "0.7rem", color: "#6f42c1" }} />
            <span style={{ fontSize: "0.7rem", color: "#6f42c1", fontWeight: "bold" }}>Super Admin</span>
          </div>
        )}
        
        {!isOwn && senderName && message.type.toUpperCase() !== "SUPER_ADMIN" && (
          <div className="fw-bold mb-1" style={{ fontSize: "0.75rem", color: "#0d6efd" }}>
            {senderName}
          </div>
        )}

        <div className="message-content" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
          {message.contenu.split("\n").map((line, i) => (
            <p key={i} className="mb-1">{line}</p>
          ))}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="attachment-preview mb-1">
                {attachment.type.startsWith("image/") ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px" }}
                  />
                ) : (
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                    <FontAwesomeIcon icon={faPaperclip} className="text-muted" />
                    <span className="text-truncate" style={{ fontSize: "0.75rem" }}>
                      {attachment.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-end align-items-center gap-1 mt-1">
          <span style={{ fontSize: "0.65rem", color: "#667781" }}>
            {formatTime(message.envoyeLe)}
          </span>
          {isOwn && status && <MessageStatus status={status} />}
        </div>

        {showOptions && (
          <div
            ref={optionsRef}
            className="position-absolute bg-white shadow rounded p-1"
            style={{
              top: "100%",
              right: isOwn ? 0 : "auto",
              left: isOwn ? "auto" : 0,
              marginTop: "4px",
              zIndex: 10,
              minWidth: "150px",
            }}
          >
            <button
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2"
              onClick={() => {
                if (onReply) onReply();
                setShowOptions(false);
              }}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              <FontAwesomeIcon icon={faReply} style={{ fontSize: "0.7rem" }} />
              Répondre
            </button>
            <button
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2"
              onClick={handleCopy}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              <FontAwesomeIcon icon={faCopy} style={{ fontSize: "0.7rem" }} />
              Copier
            </button>
            <button
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2"
              onClick={() => {
                if (onForward) onForward();
                setShowOptions(false);
              }}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              <FontAwesomeIcon icon={faForward} style={{ fontSize: "0.7rem" }} />
              Transférer
            </button>
            <button
              className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 text-danger"
              onClick={() => {
                if (onDelete) onDelete();
                setShowOptions(false);
              }}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "0.7rem" }} />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {isOwn && showAvatar && (
        <div className="ms-2 flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="Vous"
              className="rounded-circle"
              style={{ width: "36px", height: "36px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px", backgroundColor: "#0d6efd20" }}
            >
              <FontAwesomeIcon icon={faUserTie} style={{ color: "#0d6efd" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChatHeader = ({
  contact,
  onBack,
  onInfo,
  typing,
}: {
  contact: ContactConversation | null;
  onBack?: () => void;
  onInfo?: () => void;
  typing?: boolean;
}) => {
  if (!contact) return null;

  const getStatusText = () => {
    if (contact.est_bloque) return "Bloqué";
    if (contact.online) return "En ligne";
    if (contact.lastSeen) {
      try {
        const lastSeen = new Date(contact.lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - lastSeen.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "En ligne";
        if (diffMins < 60) return `Vu il y a ${diffMins} min`;
        if (diffMins < 1440) return `Vu il y a ${Math.floor(diffMins / 60)} h`;
        return `Vu ${lastSeen.toLocaleDateString("fr-FR")}`;
      } catch {
        return "Hors ligne";
      }
    }
    return "Hors ligne";
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "#6f42c1";
      case "admin":
        return "#0dcaf0";
      case "agent":
        return "#0d6efd";
      case "vendeur":
        return "#ffc107";
      default:
        return "#198754";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return faCrown;
      case "admin":
        return faShield;
      case "agent":
        return faUserTie;
      case "vendeur":
        return faStore;
      default:
        return faUser;
    }
  };

  return (
    <div className="bg-white border-bottom p-3 d-flex align-items-center">
      {onBack && (
        <button
          className="btn btn-link text-dark d-lg-none me-2"
          onClick={onBack}
          style={{ padding: "0.5rem" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      
      <div className="position-relative me-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "45px",
            height: "45px",
            backgroundColor: getUserTypeColor(contact.userType) + "20",
            border: contact.online ? "2px solid #25D366" : "none",
          }}
        >
          <FontAwesomeIcon
            icon={getUserTypeIcon(contact.userType)}
            style={{ fontSize: "1.2rem", color: getUserTypeColor(contact.userType) }}
          />
        </div>
        {contact.online && (
          <div
            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
            style={{ width: "12px", height: "12px" }}
          />
        )}
      </div>

      <div className="flex-grow-1">
        <h6 className="fw-bold mb-1" style={{ fontSize: "1rem", color: "#111b21" }}>
          {contact.prenoms} {contact.nom}
          {contact.userType === "super_admin" && (
            <FontAwesomeIcon icon={faCrown} className="ms-2" style={{ color: "#6f42c1", fontSize: "0.9rem" }} />
          )}
        </h6>
        <div className="d-flex align-items-center">
          {typing ? (
            <TypingIndicator />
          ) : (
            <span className="small text-muted">{getStatusText()}</span>
          )}
        </div>
      </div>

      {onInfo && (
        <button
          className="btn btn-link text-muted"
          onClick={onInfo}
          style={{ padding: "0.5rem" }}
        >
          <FontAwesomeIcon icon={faInfoCircle} />
        </button>
      )}
    </div>
  );
};

const ChatInput = ({
  onSend,
  disabled,
  replyingTo,
  onCancelReply,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="bg-white border-top p-3">
      {replyingTo && (
        <div className="bg-light rounded-3 p-2 mb-3 d-flex align-items-start">
          <div className="flex-grow-1">
            <div className="small fw-bold text-primary mb-1">
              <FontAwesomeIcon icon={faReply} className="me-1" />
              Réponse à {replyingTo.expediteurNom}
            </div>
            <div className="small text-truncate" style={{ maxWidth: "200px" }}>
              {replyingTo.contenu}
            </div>
          </div>
          <button
            className="btn btn-sm btn-link text-muted"
            onClick={onCancelReply}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      <div className="d-flex align-items-end gap-2">
        <div className="flex-grow-1 position-relative">
          <textarea
            ref={inputRef}
            className="form-control border-0 bg-light rounded-4"
            rows={1}
            placeholder="Écrire un message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            style={{
              resize: "none",
              paddingRight: "50px",
              minHeight: "45px",
              maxHeight: "120px",
            }}
          />
          <div className="position-absolute end-0 bottom-0 d-flex gap-1 p-2">
            <button className="btn btn-link text-muted p-1">
              <FontAwesomeIcon icon={faSmile} />
            </button>
            <button className="btn btn-link text-muted p-1">
              <FontAwesomeIcon icon={faPaperclip} />
            </button>
          </div>
        </div>
        
        <button
          className={`btn rounded-circle d-flex align-items-center justify-content-center ${
            message.trim()
              ? "btn-primary"
              : "btn-light text-muted"
          }`}
          style={{
            width: "45px",
            height: "45px",
            transition: "all 0.2s ease",
          }}
          onClick={handleSend}
          disabled={!message.trim() || disabled}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) => {
  const { contact, lastMessage, unreadCount } = conversation;

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return "à l'instant";
      if (diffMins < 60) return `il y a ${diffMins} min`;
      if (diffMins < 1440) return `il y a ${Math.floor(diffMins / 60)} h`;
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getLastMessagePreview = () => {
    if (!lastMessage) return "Nouvelle conversation";
    return lastMessage.contenu.length > 40
      ? `${lastMessage.contenu.substring(0, 40)}...`
      : lastMessage.contenu;
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "#6f42c1";
      case "admin":
        return "#0dcaf0";
      case "agent":
        return "#0d6efd";
      case "vendeur":
        return "#ffc107";
      default:
        return "#198754";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return faCrown;
      case "admin":
        return faShield;
      case "agent":
        return faUserTie;
      case "vendeur":
        return faStore;
      default:
        return faUser;
    }
  };

  return (
    <div
      className={`d-flex align-items-center p-3 border-bottom cursor-pointer ${
        isActive ? "bg-primary bg-opacity-10" : "hover-bg-light"
      }`}
      onClick={onClick}
      style={{
        transition: "background-color 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div className="position-relative me-3 flex-shrink-0">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: getUserTypeColor(contact.userType) + "20",
            border: contact.online ? "2px solid #25D366" : "none",
          }}
        >
          <FontAwesomeIcon
            icon={getUserTypeIcon(contact.userType)}
            style={{ fontSize: "1.3rem", color: getUserTypeColor(contact.userType) }}
          />
        </div>
        {contact.online && (
          <div
            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
            style={{ width: "12px", height: "12px" }}
          />
        )}
      </div>
      
      <div className="flex-grow-1 min-width-0">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="fw-bold text-truncate" style={{ fontSize: "0.95rem", color: "#111b21" }}>
            {contact.prenoms} {contact.nom}
            {contact.userType === "super_admin" && (
              <FontAwesomeIcon icon={faCrown} className="ms-1" style={{ color: "#6f42c1", fontSize: "0.8rem" }} />
            )}
          </div>
          <div className="small text-muted ms-2" style={{ fontSize: "0.7rem" }}>
            {formatLastMessageTime(lastMessage?.envoyeLe)}
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="small text-truncate"
            style={{
              color: unreadCount > 0 ? "#1e293b" : "#64748b",
              fontWeight: unreadCount > 0 ? 500 : 400,
              maxWidth: "180px",
              fontSize: "0.8rem",
            }}
          >
            {getLastMessagePreview()}
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {lastMessage?.status && (
              <MessageStatus status={lastMessage.status} />
            )}
            {unreadCount > 0 && (
              <span className="badge bg-primary rounded-pill" style={{ fontSize: "0.7rem" }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({
  contact,
  onClose,
}: {
  contact: ContactConversation | null;
  onClose?: () => void;
}) => {
  if (!contact) return null;

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "agent":
        return "Agent";
      case "vendeur":
        return "Vendeur";
      default:
        return "Utilisateur";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return faCrown;
      case "admin":
        return faShield;
      case "agent":
        return faUserTie;
      case "vendeur":
        return faStore;
      default:
        return faUser;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "#6f42c1";
      case "admin":
        return "#0dcaf0";
      case "agent":
        return "#0d6efd";
      case "vendeur":
        return "#ffc107";
      default:
        return "#198754";
    }
  };

  return (
    <div className="bg-white h-100">
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 className="mb-0 fw-bold">Infos du contact</h6>
        {onClose && (
          <button className="btn btn-sm btn-link text-muted" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      <div className="p-4 text-center border-bottom">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: getUserTypeColor(contact.userType) + "20",
          }}
        >
          <FontAwesomeIcon
            icon={getUserTypeIcon(contact.userType)}
            style={{ fontSize: "3rem", color: getUserTypeColor(contact.userType) }}
          />
        </div>
        <h5 className="mb-1">
          {contact.prenoms} {contact.nom}
        </h5>
        <p className="text-muted small mb-2">{getUserTypeLabel(contact.userType)}</p>
        <StatusBadge
          est_bloque={contact.est_bloque}
          est_verifie={contact.est_verifie}
          is_deleted={contact.is_deleted}
          is_super_admin={contact.userType === "super_admin"}
          is_admin={contact.userType === "admin"}
        />
      </div>
      
      <div className="p-3">
        <div className="mb-3">
          <div className="small text-muted mb-1">Email</div>
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} className="text-muted" style={{ fontSize: "0.9rem" }} />
            <span style={{ fontSize: "0.9rem" }}>{contact.email}</span>
          </div>
        </div>
        
        {contact.telephone && (
          <div className="mb-3">
            <div className="small text-muted mb-1">Téléphone</div>
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-muted" style={{ fontSize: "0.9rem" }} />
              <span style={{ fontSize: "0.9rem" }}>{contact.telephone}</span>
            </div>
          </div>
        )}
        
        {contact.boutique && (
          <div className="mb-3">
            <div className="small text-muted mb-1">Boutique</div>
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faStore} className="text-muted" style={{ fontSize: "0.9rem" }} />
              <span style={{ fontSize: "0.9rem" }}>{contact.boutique.nom}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
const detectUserTypeFromEmail = (
  email: string,
): "super_admin" | "admin" | "agent" | "vendeur" | "utilisateur" => {
  const emailLower = email.toLowerCase();
  if (emailLower.includes("superadmin") || emailLower.includes("@sonec.com"))
    return "super_admin";
  if (emailLower.includes("admin")) return "admin";
  if (emailLower.includes("agent") || emailLower.includes("@agent.com"))
    return "agent";
  if (emailLower.includes("vendeur") || emailLower.includes("@sonecafrica.com"))
    return "vendeur";
  if (emailLower.includes("boutique") || emailLower.includes("shop"))
    return "vendeur";
  return "utilisateur";
};

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

const formatLastMessageDate = (dateString?: string) => {
  if (!dateString) return "Jamais";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0)
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "Date inconnue";
  }
};

// ============================================
// COMPOSANT PRINCIPAL AVEC SUSPENSE
// ============================================
export default function MessagerieAgent() {
  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <LoadingSpinner
            size="lg"
            text="Chargement de votre messagerie..."
            fullPage
          />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

// ============================================
// COMPOSANT CONTENU DE LA MESSAGERIE
// ============================================
function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // États pour les données
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agentProfile, setAgentProfile] = useState<Agent | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);

  // États pour les notifications toast
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    initial: true,
    superAdmins: false,
    agents: false,
    vendeurs: false,
    utilisateurs: false,
    messages: false,
    envoi: false,
    contacts: false,
  });

  // État pour le message en cours de réponse
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // État pour la suppression
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Cache pour les appels API
  const apiCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // État pour le formulaire d'envoi
  const [newMessage, setNewMessage] = useState({
    destinataireEmail: "",
    destinataireUuid: "",
    sujet: "",
    contenu: "",
    type: "notification",
    expediteurNom: "",
    expediteurEmail: "",
    expediteurUuid: "",
  });

  // États pour la saisie en cours
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // REF pour éviter les boucles infinies
  const isInitialLoad = useRef(true);
  const isFetchingContacts = useRef(false);
  const prevMessagesRecusLength = useRef(0);
  const prevMessagesEnvoyesLength = useRef(0);
  const hasLoadedInitialData = useRef(false);
  const toastContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);

  // Scroll vers le bas des messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (currentConversation) {
      scrollToBottom();
    }
  }, [currentConversation?.messages, scrollToBottom]);

  // ============================================
  // FONCTIONS DE NOTIFICATION TOAST
  // ============================================
  const showToast = useCallback(
    (
      type: ToastNotification["type"],
      title: string,
      message: string,
      options?: {
        duration?: number;
        messageId?: string;
        expediteur?: string;
        destinataire?: { nom?: string; email: string };
        details?: { sujet?: string; date?: string };
        read?: boolean;
      },
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          message,
          duration: options?.duration || 5000,
          messageId: options?.messageId,
          expediteur: options?.expediteur,
          destinataire: options?.destinataire,
          details: options?.details,
          read: options?.read || false,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options?.duration || 5000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ============================================
  // FONCTIONS DE MARQUAGE COMME LU/NON LU - VERSION CORRIGÉE
  // ============================================
  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      try {
        await api.put(API_ENDPOINTS.MESSAGERIE.MARK_READ(messageId));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: true, dateLecture: new Date().toISOString(), status: "read" as const }
              : msg,
          ),
        );

        setMessagesEnvoyes((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: true, dateLecture: new Date().toISOString(), status: "read" as const }
              : msg,
          ),
        );

        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.uuid === messageId
                ? { ...msg, estLu: true, dateLecture: new Date().toISOString(), status: "read" as const }
                : msg
            ),
            unreadCount:
              conv.contact.email === currentConversation?.contact.email
                ? 0
                : conv.unreadCount,
          }))
        );

        if (currentConversation) {
          setCurrentConversation((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.uuid === messageId
                      ? { ...msg, estLu: true, dateLecture: new Date().toISOString(), status: "read" as const }
                      : msg
                  ),
                  unreadCount: 0,
                }
              : null
          );
        }

        showToast(
          "message-read",
          "📖 Message marqué comme lu",
          "Le message a été marqué comme lu avec succès",
          { duration: 3000, messageId },
        );
      } catch (err: any) {
        console.error("❌ Erreur lors du marquage comme lu:", err);
        // Ne pas afficher de toast d'erreur
      }
    },
    [currentConversation, showToast],
  );

  const handleMarkAsUnread = useCallback(
    async (messageId: string) => {
      try {
        await api.patch(API_ENDPOINTS.MESSAGERIE.MARK_UNREAD(messageId));

        setMessages((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: false, dateLecture: null, status: "delivered" as const }
              : msg,
          ),
        );

        setMessagesEnvoyes((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: false, dateLecture: null, status: "delivered" as const }
              : msg,
          ),
        );

        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.uuid === messageId
                ? { ...msg, estLu: false, dateLecture: null, status: "delivered" as const }
                : msg
            ),
          }))
        );

        if (currentConversation) {
          setCurrentConversation((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.uuid === messageId
                      ? { ...msg, estLu: false, dateLecture: null, status: "delivered" as const }
                      : msg
                  ),
                }
              : null
          );
        }

        showToast(
          "info",
          "📬 Message marqué comme non lu",
          "Le message a été marqué comme non lu",
          { duration: 3000, messageId },
        );
      } catch (err: any) {
        console.error("❌ Erreur lors du marquage comme non lu:", err);
        // Ne pas afficher de toast d'erreur
      }
    },
    [currentConversation, showToast],
  );

  // ============================================
  // FONCTION DE SUPPRESSION DE MESSAGE AVEC MODALE
  // ============================================
  const openDeleteModal = useCallback((message: Message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  }, []);

  const confirmDeleteMessage = useCallback(async () => {
    if (!messageToDelete) return;

    setDeletingMessageId(messageToDelete.uuid);
    setShowDeleteModal(false);

    try {
      await api.delete(API_ENDPOINTS.MESSAGERIE.DELETE(messageToDelete.uuid));

      setMessages((prev) => prev.filter((msg) => msg.uuid !== messageToDelete.uuid));
      setMessagesEnvoyes((prev) => prev.filter((msg) => msg.uuid !== messageToDelete.uuid));

      setConversations((prev) =>
        prev.map((conv) => ({
          ...conv,
          messages: conv.messages.filter((msg) => msg.uuid !== messageToDelete.uuid),
        }))
      );

      if (currentConversation) {
        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.filter((msg) => msg.uuid !== messageToDelete.uuid),
              }
            : null
        );
      }

      showToast(
        "success",
        "🗑️ Message supprimé",
        `Le message a été supprimé avec succès`,
        { duration: 4000 }
      );
    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      showToast("error", "❌ Erreur", "Impossible de supprimer le message", {
        duration: 4000,
      });
    } finally {
      setDeletingMessageId(null);
      setMessageToDelete(null);
    }
  }, [messageToDelete, currentConversation, showToast]);

  // ============================================
  // FONCTION UTILITAIRE POUR LE CACHE API
  // ============================================
  const cachedApiCall = useCallback(
    async (key: string, apiCall: () => Promise<any>) => {
      const cached = apiCache.current.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      const data = await apiCall();
      apiCache.current.set(key, { data, timestamp: Date.now() });
      return data;
    },
    [],
  );

  // ============================================
  // GESTION DES PARAMÈTRES D'URL
  // ============================================
  const handleUrlParams = useCallback(() => {
    const destinataireUuid = searchParams.get("destinataireUuid");
    const destinataireEmail = searchParams.get("destinataireEmail");
    const destinataireNom = searchParams.get("destinataireNom");
    const sujet = searchParams.get("sujet");

    if (destinataireEmail && agentProfile) {
      console.log("📨 Paramètres URL reçus:", {
        destinataireUuid,
        destinataireEmail,
        destinataireNom,
        sujet,
      });

      const existingConv = conversations.find(
        (c) => c.contact.email === destinataireEmail
      );

      if (existingConv) {
        setCurrentConversation(existingConv);
      } else {
        const contact: ContactConversation = {
          uuid: destinataireUuid || `contact-${Date.now()}`,
          email: destinataireEmail,
          nom: destinataireNom?.split(" ").pop() || "",
          prenoms:
            destinataireNom?.split(" ").slice(0, -1).join(" ") ||
            destinataireNom ||
            "Contact",
          telephone: "",
          userType: detectUserTypeFromEmail(destinataireEmail),
          est_verifie: true,
          est_bloque: false,
          is_deleted: false,
          online: false,
        };

        const newConv: Conversation = {
          contact,
          messages: [],
          lastMessage: undefined,
          unreadCount: 0,
        };

        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversation(newConv);
      }

      setNewMessage((prev) => ({
        ...prev,
        destinataireEmail: destinataireEmail,
        destinataireUuid: destinataireUuid || "",
        sujet: sujet || `Message pour ${destinataireNom || destinataireEmail}`,
        contenu: "",
        type: "notification",
      }));

      setShowMobileConversations(false);

      const url = new URL(window.location.href);
      url.search = "";
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, agentProfile, conversations, router]);

  // ============================================
  // CHARGEMENT DU PROFIL AGENT
  // ============================================
  const fetchAgentProfile = useCallback(async () => {
    try {
      console.log("🔍 Chargement du profil agent...");
      const response = await api.get(API_ENDPOINTS.AUTH.AGENT.PROFILE);
      console.log("✅ Réponse profil agent:", response);

      if (response && (response.data || response.nom)) {
        const profile = response.data || response;
        console.log("👤 Profil agent chargé:", {
          nom: profile.nom,
          prenoms: profile.prenoms,
          email: profile.email,
          uuid: profile.uuid,
        });

        setAgentProfile(profile);
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email || "",
          expediteurNom:
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
            "Agent SONEC",
          expediteurUuid: profile.uuid || "",
        }));
        return profile;
      }
      return null;
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement du profil agent:", err);
      return null;
    }
  }, []);

  // ============================================
  // CHARGEMENT DES UTILISATEURS
  // ============================================
  const fetchSuperAdmins = useCallback(async () => {
    setLoading((prev) => ({ ...prev, superAdmins: true }));
    try {
      const response = await cachedApiCall("superAdmins", () =>
        api.get<{ data: SuperAdmin[] }>(API_ENDPOINTS.AUTH.ADMIN.LISTE_ADMIN),
      );
      setSuperAdmins(response?.data || []);
    } catch (err: any) {
      console.error("❌ Erreur chargement super-admins:", err);
    } finally {
      setLoading((prev) => ({ ...prev, superAdmins: false }));
    }
  }, [cachedApiCall]);

  const fetchAgents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, agents: true }));
    try {
      const response = await cachedApiCall("agents", () =>
        api.get<{ data: Agent[] }>(API_ENDPOINTS.ADMIN.AGENTS.LIST),
      );
      setAgents(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching agents:", err);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  }, [cachedApiCall]);

  const fetchVendeurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, vendeurs: true }));
    try {
      const response = await cachedApiCall("vendeurs", () =>
        api.get<{ data: Vendeur[] }>(API_ENDPOINTS.ADMIN.VENDEURS.LIST),
      );
      setVendeurs(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching vendeurs:", err);
    } finally {
      setLoading((prev) => ({ ...prev, vendeurs: false }));
    }
  }, [cachedApiCall]);

  const fetchUtilisateurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, utilisateurs: true }));
    try {
      const response = await cachedApiCall("utilisateurs", () =>
        api.get<{ data: Utilisateur[] }>(API_ENDPOINTS.ADMIN.USERS.LIST),
      );
      setUtilisateurs(response?.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching utilisateurs:", err);
    } finally {
      setLoading((prev) => ({ ...prev, utilisateurs: false }));
    }
  }, [cachedApiCall]);

  // ============================================
  // CHARGEMENT DES MESSAGES REÇUS
  // ============================================
  const fetchMessagesRecus = useCallback(
    async (profileEmail?: string, profileUuid?: string) => {
      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        const response = await api.get<MessageReceived[]>(
          API_ENDPOINTS.MESSAGERIE.RECEIVED,
        );

        if (Array.isArray(response)) {
          const formattedMessages = response
            .map((item: any) => {
              const message = item.message || item;
              if (!message || !message.uuid) return null;

              // Filtrer les messages système
              if (message.expediteurEmail === 'system@example.com' ||
                  message.expediteurEmail?.includes('noreply') ||
                  !message.expediteurEmail) {
                return null;
              }

              return {
                uuid: message.uuid,
                sujet: message.sujet || "Sans sujet",
                contenu: message.contenu || "",
                expediteurNom: message.expediteurNom || "Expéditeur inconnu",
                expediteurEmail: message.expediteurEmail || "",
                expediteurUuid: message.expediteurUuid,
                destinataireEmail: message.destinataireEmail || profileEmail || "",
                destinataireUuid: message.destinataireUuid || profileUuid || "",
                type: (message.type || "notification").toUpperCase(),
                estEnvoye: false,
                envoyeLe: message.envoyeLe || item.dateReception || new Date().toISOString(),
                estLu: message.estLu || item.estLu || false,
                dateLecture: message.dateLecture || item.dateLecture || null,
                status: message.estLu ? "read" as const : "delivered" as const,
              } as Message;
            })
            .filter((msg): msg is Message => msg !== null);

          setMessages(formattedMessages);

          const unreadMessages = formattedMessages.filter((m) => !m.estLu);
          if (unreadMessages.length > 0) {
            showToast(
              "info",
              `📬 ${unreadMessages.length} message(s) non lu(s)`,
              "Vous avez des messages en attente de lecture",
              { duration: 5000 },
            );
          }
        } else {
          setMessages([]);
        }
      } catch (err: any) {
        console.error("❌ Erreur chargement messages:", err);
        setMessages([]);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [showToast],
  );

  // ============================================
  // CHARGEMENT DES MESSAGES ENVOYÉS
  // ============================================
  const fetchMessagesEnvoyes = useCallback(
    async (profileNom?: string, profileEmail?: string, profileUuid?: string) => {
      try {
        const response = await api.get<Message[]>(
          API_ENDPOINTS.MESSAGERIE.SENT,
        );

        if (Array.isArray(response)) {
          const formattedMessages = response
            .map((msg: any) => {
              if (!msg || !msg.uuid) return null;

              return {
                uuid: msg.uuid,
                sujet: msg.sujet || "Sans sujet",
                contenu: msg.contenu || "",
                expediteurNom: msg.expediteurNom || profileNom || "Agent SONEC",
                expediteurEmail: msg.expediteurEmail || profileEmail || "",
                expediteurUuid: msg.expediteurUuid || profileUuid,
                destinataireEmail: msg.destinataireEmail || "",
                destinataireUuid: msg.destinataireUuid,
                type: (msg.type || "notification").toUpperCase(),
                estEnvoye: true,
                envoyeLe: msg.envoyeLe || new Date().toISOString(),
                estLu: msg.estLu || false,
                dateLecture: msg.dateLecture || null,
                status: msg.estLu ? "read" as const : "sent" as const,
              } as Message;
            })
            .filter((msg): msg is Message => msg !== null);

          setMessagesEnvoyes(formattedMessages);
        }
      } catch (err: any) {
        console.error("❌ Error fetching sent messages:", err);
        setMessagesEnvoyes([]);
      }
    },
    [],
  );

  // ============================================
  // CONSTRUCTION DES CONTACTS ET CONVERSATIONS
  // ============================================
  const buildContactsAndConversations = useCallback(
    async (profile: Agent) => {
      if (!isMounted.current) return;

      setLoading((prev) => ({ ...prev, contacts: true }));

      try {
        const allMessages = [...messages, ...messagesEnvoyes];
        const contactsMap = new Map<string, ContactConversation>();
        const conversationsMap = new Map<string, Conversation>();

        for (const message of allMessages) {
          const isFromMe = message.expediteurEmail === profile.email;
          const contactEmail = isFromMe
            ? message.destinataireEmail
            : message.expediteurEmail;

          if (!contactEmail || contactEmail === profile.email) continue;

          // Construction du contact
          if (!contactsMap.has(contactEmail)) {
            const contact: ContactConversation = {
              uuid: isFromMe
                ? message.destinataireUuid || `contact-${Date.now()}-${contactEmail}`
                : message.expediteurUuid || `contact-${Date.now()}-${contactEmail}`,
              email: contactEmail,
              nom: isFromMe
                ? ""
                : message.expediteurNom?.split(" ").pop() || "",
              prenoms: isFromMe
                ? contactEmail.split("@")[0]
                : message.expediteurNom?.split(" ").slice(0, -1).join(" ") ||
                  message.expediteurNom ||
                  "Contact",
              telephone: "",
              userType: detectUserTypeFromEmail(contactEmail),
              est_verifie: true,
              est_bloque: false,
              is_deleted: false,
              is_admin: contactEmail.includes("admin"),
              is_super_admin: contactEmail.includes("superadmin"),
              lastMessageDate: message.envoyeLe,
              lastMessage: message.contenu,
              lastMessageStatus: isFromMe ? message.status : (message.estLu ? "read" : "delivered"),
              unreadCount: !isFromMe && !message.estLu ? 1 : 0,
              totalMessages: 1,
              online: Math.random() > 0.5,
              lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            };
            contactsMap.set(contactEmail, contact);
          } else {
            const contact = contactsMap.get(contactEmail)!;
            contact.totalMessages = (contact.totalMessages || 0) + 1;
            if (!isFromMe && !message.estLu) {
              contact.unreadCount = (contact.unreadCount || 0) + 1;
            }
            if (new Date(message.envoyeLe) > new Date(contact.lastMessageDate || "")) {
              contact.lastMessageDate = message.envoyeLe;
              contact.lastMessage = message.contenu;
              contact.lastMessageStatus = isFromMe ? message.status : (message.estLu ? "read" : "delivered");
            }
          }

          // Construction de la conversation
          if (!conversationsMap.has(contactEmail)) {
            const contact = contactsMap.get(contactEmail)!;
            conversationsMap.set(contactEmail, {
              contact,
              messages: [message],
              lastMessage: message,
              unreadCount: !isFromMe && !message.estLu ? 1 : 0,
            });
          } else {
            const conv = conversationsMap.get(contactEmail)!;
            conv.messages.push(message);
            if (!isFromMe && !message.estLu) {
              conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
            if (new Date(message.envoyeLe) > new Date(conv.lastMessage?.envoyeLe || "")) {
              conv.lastMessage = message;
            }
          }
        }

        const conversationsArray = Array.from(conversationsMap.values())
          .map((conv) => ({
            ...conv,
            messages: conv.messages.sort(
              (a, b) => new Date(a.envoyeLe).getTime() - new Date(b.envoyeLe).getTime()
            ),
          }))
          .sort((a, b) => {
            const dateA = a.lastMessage?.envoyeLe
              ? new Date(a.lastMessage.envoyeLe).getTime()
              : 0;
            const dateB = b.lastMessage?.envoyeLe
              ? new Date(b.lastMessage.envoyeLe).getTime()
              : 0;
            return dateB - dateA;
          });

        if (isMounted.current) {
          setConversations(conversationsArray);
        }
      } catch (err) {
        console.error("❌ Erreur construction contacts et conversations:", err);
      } finally {
        if (isMounted.current) {
          setLoading((prev) => ({ ...prev, contacts: false }));
        }
      }
    },
    [messages, messagesEnvoyes],
  );

  // ============================================
  // SÉLECTIONNER LE PREMIER CONTACT PAR DÉFAUT
  // ============================================
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation && !loading.initial) {
      setCurrentConversation(conversations[0]);
      setShowMobileConversations(false);
    }
  }, [conversations, currentConversation, loading.initial]);

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    isMounted.current = true;

    const loadInitialData = async () => {
      if (hasLoadedInitialData.current) return;

      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        const profile = await fetchAgentProfile();

        if (!isMounted.current) return;

        if (profile) {
          await fetchMessagesRecus(profile.email, profile.uuid);
          await fetchMessagesEnvoyes(
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() || "Agent SONEC",
            profile.email,
            profile.uuid,
          );

          await Promise.all([
            fetchSuperAdmins(),
            fetchAgents(),
            fetchVendeurs(),
            fetchUtilisateurs(),
          ]);

          await buildContactsAndConversations(profile);
        }

        hasLoadedInitialData.current = true;
        isInitialLoad.current = false;

        showToast(
          "success",
          "✅ Messagerie chargée",
          "Votre messagerie est prête",
          { duration: 3000 },
        );
      } catch (err) {
        console.error("❌ Erreur chargement initial:", err);
        showToast(
          "error",
          "❌ Erreur de chargement",
          "Impossible de charger la messagerie",
          { duration: 5000 },
        );
      } finally {
        if (isMounted.current) {
          setLoading((prev) => ({ ...prev, initial: false }));
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchAgentProfile, fetchMessagesRecus, fetchMessagesEnvoyes, fetchSuperAdmins, fetchAgents, fetchVendeurs, fetchUtilisateurs, buildContactsAndConversations, showToast]);

  // ============================================
  // GESTION DES PARAMÈTRES URL APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (agentProfile && !loading.initial && conversations.length > 0) {
      handleUrlParams();
    }
  }, [agentProfile, loading.initial, conversations.length, handleUrlParams]);

  // ============================================
  // STATISTIQUES
  // ============================================
  const stats = useMemo(
    () => ({
      totalUsers:
        superAdmins.length + agents.length + vendeurs.length + utilisateurs.length,
      totalMessages: messages.length + messagesEnvoyes.length,
      unreadMessages: messages.filter((m) => !m.estLu).length,
      sentMessages: messagesEnvoyes.length,
      superAdmins: superAdmins.length,
      totalConversations: conversations.length,
    }),
    [superAdmins, agents, vendeurs, utilisateurs, messages, messagesEnvoyes, conversations.length],
  );

  // ============================================
  // COMBINER TOUS LES UTILISATEURS POUR LES CONTACTS
  // ============================================
  const allUsers = useMemo(() => {
    const users: ContactConversation[] = [];

    superAdmins.forEach((user) => {
      users.push({ ...user, userType: "super_admin", online: Math.random() > 0.5 } as ContactConversation);
    });

    agents.forEach((user) => {
      users.push({ ...user, userType: "agent", online: Math.random() > 0.5 } as ContactConversation);
    });

    vendeurs.forEach((user) => {
      users.push({ ...user, userType: "vendeur", online: Math.random() > 0.5 } as ContactConversation);
    });

    utilisateurs.forEach((user) => {
      users.push({ ...user, userType: "utilisateur", online: Math.random() > 0.5 } as ContactConversation);
    });

    return users;
  }, [superAdmins, agents, vendeurs, utilisateurs]);

  // ============================================
  // FILTRAGE DES CONTACTS
  // ============================================
  const filteredContacts = useMemo(() => {
    // Commencer avec les conversations existantes
    const contactEmails = new Set(conversations.map(c => c.contact.email));
    
    // Ajouter tous les utilisateurs qui ne sont pas dans les conversations
    const allContacts = [...conversations.map(c => c.contact)];
    
    allUsers.forEach((user) => {
      if (!contactEmails.has(user.email) && user.email !== agentProfile?.email) {
        allContacts.push({
          ...user,
          lastMessageDate: undefined,
          lastMessage: undefined,
          unreadCount: 0,
          totalMessages: 0,
        });
      }
    });

    let result = allContacts.filter((c) => !c.is_deleted);

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.nom?.toLowerCase().includes(searchLower) ||
          c.prenoms?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.telephone?.includes(searchTerm),
      );
    }

    if (selectedType !== "all") {
      result = result.filter((c) => c.userType === selectedType);
    }

    result.sort((a, b) => {
      const dateA = a.lastMessageDate
        ? new Date(a.lastMessageDate).getTime()
        : 0;
      const dateB = b.lastMessageDate
        ? new Date(b.lastMessageDate).getTime()
        : 0;
      return dateB - dateA;
    });

    return result;
  }, [conversations, allUsers, agentProfile, searchTerm, selectedType]);

  // ============================================
  // CHARGEMENT DE LA CONVERSATION
  // ============================================
  const loadConversation = useCallback((contact: ContactConversation) => {
    const conversation = conversations.find((c) => c.contact.email === contact.email);
    
    if (conversation) {
      setCurrentConversation(conversation);
      
      // Marquer les messages comme lus (sans attendre la réponse du serveur)
      conversation.messages
        .filter((m) => !m.estLu && m.expediteurEmail !== agentProfile?.email)
        .forEach((m) => {
          // Mise à jour locale immédiate
          setMessages((prev) =>
            prev.map((msg) =>
              msg.uuid === m.uuid
                ? { ...msg, estLu: true, dateLecture: new Date().toISOString(), status: "read" as const }
                : msg,
            ),
          );
          // Appel API en arrière-plan
          handleMarkAsRead(m.uuid).catch(() => {});
        });
    } else {
      // Nouvelle conversation
      const newConv: Conversation = {
        contact,
        messages: [],
        lastMessage: undefined,
        unreadCount: 0,
      };
      setCurrentConversation(newConv);
    }

    setShowMobileConversations(false);
    setShowContactInfo(false);

    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  }, [conversations, agentProfile, handleMarkAsRead]);

  // ============================================
  // ENVOI DE MESSAGE
  // ============================================
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentConversation) {
        showToast("error", "❌ Erreur", "Aucune conversation sélectionnée", { duration: 3000 });
        return;
      }

      if (!content.trim()) {
        showToast("error", "❌ Erreur", "Le message ne peut pas être vide", { duration: 3000 });
        return;
      }

      if (!agentProfile) {
        showToast("error", "❌ Erreur", "Profil agent non chargé", { duration: 3000 });
        return;
      }

      setLoading((prev) => ({ ...prev, envoi: true }));

      try {
        const messageData = {
          destinataireEmail: currentConversation.contact.email,
          destinataireUuid: currentConversation.contact.uuid,
          sujet: replyingTo ? `RE: ${replyingTo.sujet}` : `Message pour ${currentConversation.contact.prenoms}`,
          contenu: replyingTo
            ? `En réponse à: "${replyingTo.contenu.substring(0, 50)}${replyingTo.contenu.length > 50 ? "..." : ""}"\n\n${content}`
            : content,
          type: "NOTIFICATION",
        };

        console.log("📤 Envoi de message:", messageData);

        const response = await api.post<any>(
          API_ENDPOINTS.MESSAGERIE.SEND,
          messageData,
        );

        console.log("✅ Message envoyé avec succès, réponse:", response);

        const newMessage: Message = {
          uuid: response.uuid || `temp-${Date.now()}`,
          sujet: messageData.sujet,
          contenu: messageData.contenu,
          expediteurNom: `${agentProfile.prenoms || ""} ${agentProfile.nom || ""}`.trim() || "Agent SONEC",
          expediteurEmail: agentProfile.email || "",
          expediteurUuid: agentProfile.uuid || "",
          destinataireEmail: messageData.destinataireEmail,
          destinataireUuid: messageData.destinataireUuid,
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
          dateLecture: null,
          status: "sent",
        };

        setMessagesEnvoyes((prev) => [newMessage, ...prev]);

        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
          lastMessage: newMessage,
        };
        
        setCurrentConversation(updatedConversation);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.contact.email === currentConversation.contact.email
              ? updatedConversation
              : conv
          )
        );

        setReplyingTo(null);

        showToast(
          "success",
          "✅ Message envoyé avec succès !",
          `Votre message a été envoyé à ${currentConversation.contact.prenoms}`,
          {
            duration: 4000,
            destinataire: {
              nom: `${currentConversation.contact.prenoms} ${currentConversation.contact.nom}`.trim(),
              email: currentConversation.contact.email,
            },
          },
        );

        setTimeout(scrollToBottom, 100);
      } catch (err: any) {
        console.error("❌ Erreur envoi message:", err);

        let errorMessage = "Erreur lors de l'envoi du message";
        if (err.status === 500) {
          errorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard.";
        } else if (err.status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (err.status === 403) {
          errorMessage = "Vous n'avez pas la permission d'envoyer des messages.";
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        showToast("error", "❌ Erreur d'envoi", errorMessage, { duration: 5000 });
      } finally {
        setLoading((prev) => ({ ...prev, envoi: false }));
      }
    },
    [currentConversation, agentProfile, replyingTo, showToast, scrollToBottom],
  );

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleRefresh = useCallback(async () => {
    if (agentProfile) {
      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        await fetchMessagesRecus(agentProfile.email, agentProfile.uuid);
        await fetchMessagesEnvoyes(
          `${agentProfile.prenoms || ""} ${agentProfile.nom || ""}`.trim() || "Agent SONEC",
          agentProfile.email,
          agentProfile.uuid,
        );
        await buildContactsAndConversations(agentProfile);
        showToast("info", "🔄 Actualisation", "Vos messages ont été actualisés", {
          duration: 2000,
        });
      } catch (err) {
        console.error("❌ Erreur lors de l'actualisation:", err);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    }
  }, [agentProfile, fetchMessagesRecus, fetchMessagesEnvoyes, buildContactsAndConversations, showToast]);

  // ============================================
  // GESTION DE LA SUPPRESSION D'UNE CONVERSATION
  // ============================================
  const handleDeleteConversation = useCallback(() => {
    if (!currentConversation) return;
    setCurrentConversation(null);
    setShowContactInfo(false);
    setShowMobileConversations(true);
    showToast(
      "info",
      "🗑️ Conversation fermée",
      "La conversation a été fermée",
      { duration: 3000 },
    );
  }, [currentConversation, showToast]);

  // ============================================
  // RENDU
  // ============================================
  if (loading.initial) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <LoadingSpinner
          size="lg"
          text="Chargement de votre messagerie..."
          fullPage
        />
      </div>
    );
  }

  return (
    <>
      {/* Container des notifications toast */}
      <div
        ref={toastContainerRef}
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999, maxWidth: "450px" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast show mb-3 border-0 shadow-lg animate__animated animate__fadeInRight"
            role="alert"
            style={{
              minWidth: "350px",
              maxWidth: "450px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              background: "white",
            }}
          >
            <div className="toast-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor:
                      toast.type === "success"
                        ? "#DCF8C6"
                        : toast.type === "error"
                          ? "#FFEBEE"
                          : toast.type === "warning"
                            ? "#FFF3E0"
                            : "#E3F2FD",
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      toast.type === "success"
                        ? faCheckCircle
                        : toast.type === "error"
                          ? faTimesCircle
                          : toast.type === "warning"
                            ? faExclamationTriangle
                            : faInfoCircle
                    }
                    style={{
                      fontSize: "1.2rem",
                      color:
                        toast.type === "success"
                          ? "#25D366"
                          : toast.type === "error"
                            ? "#dc3545"
                            : toast.type === "warning"
                              ? "#f39c12"
                              : "#2196f3",
                    }}
                  />
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem", color: "#1f2937" }}>
                    {toast.title}
                  </h6>
                  <p className="mb-0" style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                    {toast.message}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close btn-sm"
                  onClick={() => removeToast(toast.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && messageToDelete && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "#FFEBEE",
                  }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: "1.8rem", color: "#dc3545" }} />
                </div>

                <h5 className="fw-bold mb-2">Confirmer la suppression</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Êtes-vous sûr de vouloir supprimer ce message ?
                </p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light flex-grow-1 py-2"
                    onClick={closeDeleteModal}
                    style={{ borderRadius: "24px" }}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-danger flex-grow-1 py-2"
                    onClick={confirmDeleteMessage}
                    style={{ borderRadius: "24px", background: "#dc3545", border: "none" }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid p-0 vh-100 bg-light">
        <div className="d-flex h-100">
          {/* PANEL GAUCHE - LISTE DES CONVERSATIONS - TOUJOURS AFFICHÉ */}
          <div
            className="d-flex flex-column border-end bg-white"
            style={{
              width: "350px",
              minWidth: "350px",
              maxWidth: "350px",
            }}
          >
            {/* En-tête de la liste avec logo OSKAR */}
<div className="p-3 border-bottom" style={{ background: "#f0f2f5" }}>
  <div className="d-flex align-items-center justify-content-between mb-3">
    {/* 👇 LOGO OSKAR cliquable - Version corrigée */}
    <div 
      className="d-flex align-items-center gap-2" 
      style={{ cursor: "pointer" }}
      onClick={() => {
        // Utiliser l'origine actuelle pour rester sur le même domaine
        const baseUrl = window.location.origin;
        window.location.href = baseUrl;
      }}
    >
      <div
        className="rounded d-flex align-items-center justify-content-center"
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: colors.oskar.green,
        }}
      >
        <span
          className="text-white fw-bold"
          style={{ fontSize: "0.85rem" }}
        >
          O
        </span>
      </div>
      <span
        className="fw-bold"
        style={{
          color: colors.oskar.black,
          fontSize: "1rem",
        }}
      >
        OSKAR
      </span>
    </div>
    <div className="d-flex gap-2">
      <button
        className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "40px", height: "40px" }}
        onClick={handleRefresh}
        title="Actualiser"
      >
        <FontAwesomeIcon icon={faHistory} style={{ fontSize: "1rem" }} />
      </button>
    </div>
  </div>

  {/* Barre de recherche */}
  <div className="position-relative">
    <FontAwesomeIcon
      icon={faSearch}
      className="position-absolute top-50 translate-middle-y ms-3 text-muted"
      style={{ fontSize: "0.9rem" }}
    />
    <input
      type="text"
      className="form-control form-control-lg bg-light border-0 ps-5"
      placeholder="Rechercher une discussion..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{
        borderRadius: "24px",
        fontSize: "0.9rem",
        height: "48px",
      }}
    />
  </div>

  {/* Filtre "Tous" uniquement - affiché de façon statique pour information */}
  <div className="mt-3">
    <span className="badge bg-success" style={{ borderRadius: "20px", fontSize: "0.8rem", padding: "6px 12px" }}>
      Tous les contacts
    </span>
  </div>
</div>

            {/* Liste des conversations */}
            <div className="flex-grow-1 overflow-auto" style={{ background: "#ffffff" }}>
              {loading.contacts ? (
                <div className="text-center py-5">
                  <LoadingSpinner size="sm" />
                  <p className="text-muted mt-2">Chargement des conversations...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faCommentDots} className="fs-1 text-muted mb-3 opacity-25" />
                  <h6 className="fw-semibold mb-2">Aucune discussion</h6>
                  <p className="small text-muted px-4">
                    Commencez une conversation en sélectionnant un contact
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const conversation = conversations.find(c => c.contact.email === contact.email);
                  return (
                    <ConversationItem
                      key={contact.email}
                      conversation={conversation || { contact, messages: [], lastMessage: undefined, unreadCount: 0 }}
                      isActive={currentConversation?.contact.email === contact.email}
                      onClick={() => loadConversation(contact)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL DROIT - CONVERSATION */}
          <div className="flex-grow-1 d-flex flex-column" style={{ background: "#efeae2" }}>
            {currentConversation ? (
              <>
                <ChatHeader
                  contact={currentConversation.contact}
                  onBack={() => setShowMobileConversations(true)}
                  onInfo={() => setShowContactInfo(!showContactInfo)}
                  typing={typingUsers.has(currentConversation.contact.uuid)}
                />

                {/* Messages */}
                <div
                  className="flex-grow-1 overflow-auto p-3"
                  style={{
                    background: "#efeae2",
                    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                  }}
                >
                  {currentConversation.messages.length === 0 ? (
                    <div className="text-center py-5">
                      <FontAwesomeIcon icon={faCommentDots} className="fs-1 text-muted mb-3 opacity-50" />
                      <h6 className="fw-semibold mb-2 text-muted">Aucun message</h6>
                      <p className="small text-muted">Envoyez votre premier message à {currentConversation.contact.prenoms} !</p>
                    </div>
                  ) : (
                    <>
                      {currentConversation.messages.map((message) => (
                        <MessageBubble
                          key={message.uuid}
                          message={message}
                          isOwn={message.expediteurEmail === agentProfile?.email}
                          status={message.status}
                          showAvatar={true}
                          avatar={agentProfile?.avatar}
                          senderName={currentConversation.contact.prenoms}
                          onReply={() => handleReply(message)}
                          onDelete={() => openDeleteModal(message)}
                          onForward={() => {
                            navigator.clipboard.writeText(message.contenu);
                            showToast("success", "📋 Message copié", "Le message a été copié pour être transféré", { duration: 2000 });
                          }}
                          onCopy={() => {
                            navigator.clipboard.writeText(message.contenu);
                            showToast("success", "📋 Message copié", "Le message a été copié dans le presse-papiers", { duration: 2000 });
                          }}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <ChatInput
                  onSend={handleSendMessage}
                  disabled={loading.envoi}
                  replyingTo={replyingTo}
                  onCancelReply={handleCancelReply}
                />
              </>
            ) : (
              /* Écran d'accueil quand aucune conversation n'est sélectionnée */
              <div className="h-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f2f5" }}>
                <div className="text-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                    style={{
                      width: "120px",
                      height: "120px",
                      background: "#e9edef",
                    }}
                  >
                    <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: "3rem", color: "#8696a0" }} />
                  </div>
                  <h4 className="fw-bold mb-3" style={{ color: "#41525d" }}>Messagerie Agent</h4>
                  <p className="text-muted mb-4" style={{ maxWidth: "400px", fontSize: "0.95rem" }}>
                    Sélectionnez une discussion dans la liste pour commencer à échanger
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge bg-purple px-3 py-2">Super Admins</span>
                    <span className="badge bg-info px-3 py-2">Admins</span>
                    <span className="badge bg-primary px-3 py-2">Agents</span>
                    <span className="badge bg-warning px-3 py-2">Vendeurs</span>
                    <span className="badge bg-success px-3 py-2">Utilisateurs</span>
                  </div>
                  {/* 👇 LOGO OSKAR QUAND AUCUN CONTACT */}
                  <div 
                    className="d-flex align-items-center justify-content-center gap-2 mx-auto mt-4"
                    style={{ cursor: "pointer", maxWidth: "fit-content" }}
                    onClick={() => window.location.href = "http://localhost:3001/"}
                  >
                    <div
                      className="rounded d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: colors.oskar.green,
                      }}
                    >
                      <span
                        className="text-white fw-bold"
                        style={{ fontSize: "1rem" }}
                      >
                        O
                      </span>
                    </div>
                    <span
                      className="fw-bold"
                      style={{
                        color: colors.oskar.black,
                        fontSize: "1.2rem",
                      }}
                    >
                      OSKAR
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --bs-purple: #6f42c1;
          --bs-purple-rgb: 111, 66, 193;
        }

        .bg-purple {
          background-color: var(--bs-purple) !important;
        }

        .btn-purple {
          background-color: var(--bs-purple) !important;
          color: white !important;
        }
        .btn-purple:hover {
          background-color: #5936a0 !important;
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

        /* Style WhatsApp */
        .bg-success {
          background-color: #25D366 !important;
        }
        .btn-success {
          background-color: #25D366 !important;
        }
        .btn-success:hover {
          background-color: #128C7E !important;
        }
        .text-success {
          color: #25D366 !important;
        }
        .border-success {
          border-color: #25D366 !important;
        }
        .badge.bg-success {
          background-color: #25D366 !important;
        }

        .conversations-list {
          height: calc(100% - 120px);
          overflow-y: auto;
        }

        .conversations-list::-webkit-scrollbar {
          width: 6px;
        }

        .conversations-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .conversations-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .conversations-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .hover-bg-light:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .min-width-0 {
          min-width: 0;
        }

        @media (max-width: 768px) {
          [style*="width: 350px"] {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        .message-bubble {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar personnalisée */
        .overflow-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}