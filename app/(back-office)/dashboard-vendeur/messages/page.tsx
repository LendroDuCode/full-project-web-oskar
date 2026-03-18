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
  faCommentDots,
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
  faUserTie,
  faUserShield,
  faExclamationTriangle,
  faPlus,
  faEllipsisH,
  faImage,
  faSmile,
  faPaperclip,
  faMicrophone,
  faVideo,
  faCamera,
  faStickyNote,
  faThumbsUp,
  faHeart,
  faShare,
  faDownload,
  faCopy,
  faForward,
  faFlag,
  faVolumeUp,
  faVolumeMute,
  faVolumeOff,
  faPlay,
  faPause,
  faStop,
  faArrowLeft,
  faArrowRight as faArrowRightIcon,
  faCheckDouble,
  faCheck as faCheckIcon,
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFileAudio,
  faFileVideo,
  faFileArchive,
  faTimes as faTimesIcon,
  faSpinner,
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

// ============================================
// DONNÉES MOCKÉES POUR LE DÉVELOPPEMENT
// ============================================
const MOCK_MESSAGES_RECUS = [
  {
    uuid: "mock-rec-1",
    message: {
      uuid: "mock-rec-msg-1",
      sujet: "Question sur votre produit",
      contenu: "Bonjour, je suis intéressé par votre produit. Est-il toujours disponible ?",
      expediteurNom: "Jean Dupont",
      expediteurEmail: "jean.dupont@example.com",
      expediteurUuid: "user-123",
      expediteurAvatar: null,
      destinataireEmail: "vendeur@oskar.ci",
      type: "NOTIFICATION",
      estEnvoye: false,
      envoyeLe: new Date(Date.now() - 3600000).toISOString(),
      estLu: false,
      dateLecture: null,
      piecesJointes: [],
    },
    expediteurAvatar: null,
    statut: "non_lu",
    estLu: false,
    dateLecture: null,
    dateReception: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    uuid: "mock-rec-2",
    message: {
      uuid: "mock-rec-msg-2",
      sujet: "Information livraison",
      contenu: "Pouvez-vous me donner plus d'informations sur les frais de livraison ?",
      expediteurNom: "Marie Konan",
      expediteurEmail: "marie.konan@example.com",
      expediteurUuid: "user-456",
      expediteurAvatar: null,
      destinataireEmail: "vendeur@oskar.ci",
      type: "NOTIFICATION",
      estEnvoye: false,
      envoyeLe: new Date(Date.now() - 86400000).toISOString(),
      estLu: true,
      dateLecture: new Date(Date.now() - 82800000).toISOString(),
      piecesJointes: [],
    },
    expediteurAvatar: null,
    statut: "lu",
    estLu: true,
    dateLecture: new Date(Date.now() - 82800000).toISOString(),
    dateReception: new Date(Date.now() - 86400000).toISOString(),
  },
];

const MOCK_MESSAGES_ENVOYES = [
  {
    uuid: "mock-sent-1",
    message: {
      uuid: "mock-sent-msg-1",
      sujet: "Re: Question sur votre produit",
      contenu: "Bonjour, oui le produit est toujours disponible. Je peux vous livrer demain.",
      expediteurNom: "Vendeur SONEC",
      expediteurEmail: "vendeur@oskar.ci",
      expediteurUuid: "vendeur-789",
      expediteurAvatar: null,
      destinataireEmail: "jean.dupont@example.com",
      type: "NOTIFICATION",
      estEnvoye: true,
      envoyeLe: new Date(Date.now() - 1800000).toISOString(),
      estLu: true,
      dateLecture: new Date(Date.now() - 1200000).toISOString(),
      piecesJointes: [],
    },
    expediteurAvatar: null,
    statut: "lu",
    estLu: true,
    dateLecture: new Date(Date.now() - 1200000).toISOString(),
    dateReception: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    uuid: "mock-sent-2",
    message: {
      uuid: "mock-sent-msg-2",
      sujet: "Re: Information livraison",
      contenu: "Les frais de livraison sont de 2000 FCFA pour Abidjan.",
      expediteurNom: "Vendeur SONEC",
      expediteurEmail: "vendeur@oskar.ci",
      expediteurUuid: "vendeur-789",
      expediteurAvatar: null,
      destinataireEmail: "marie.konan@example.com",
      type: "NOTIFICATION",
      estEnvoye: true,
      envoyeLe: new Date(Date.now() - 7200000).toISOString(),
      estLu: false,
      dateLecture: null,
      piecesJointes: [],
    },
    expediteurAvatar: null,
    statut: "non_lu",
    estLu: false,
    dateLecture: null,
    dateReception: new Date(Date.now() - 7200000).toISOString(),
  },
];

// ============================================
// FONCTION POUR OBTENIR LES INITIALES
// ============================================
const getInitials = (nom?: string, prenoms?: string, email?: string): string => {
  if (prenoms && nom) {
    return `${prenoms.charAt(0).toUpperCase()}${nom.charAt(0).toUpperCase()}`;
  }
  if (prenoms) {
    return prenoms.charAt(0).toUpperCase();
  }
  if (nom) {
    return nom.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "U";
};

// ============================================
// FONCTION POUR CONSTRUIRE L'URL DE L'AVATAR
// ============================================
const buildAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath) return null;
  
  // Si c'est déjà une URL complète
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Construire l'URL vers le serveur de fichiers
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  return `${API_URL}/api/files/${avatarPath}`;
};

// ============================================
// FONCTION POUR CONSTRUIRE L'URL D'UN FICHIER
// ============================================
const buildFileUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) return null;
  
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  return `${API_URL}/api/files/${filePath}`;
};

// ============================================
// COMPOSANT D'AVATAR AVEC FALLBACK VERS INITIALES
// ============================================
const UserAvatar = ({
  avatar,
  nom,
  prenoms,
  email,
  userType = "utilisateur",
  size = 40,
  showStatus = false,
  online = false,
  border = false,
}: {
  avatar?: string | null;
  nom?: string;
  prenoms?: string;
  email?: string;
  userType?: string;
  size?: number;
  showStatus?: boolean;
  online?: boolean;
  border?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = useMemo(() => {
    if (!avatar || imageError) return null;
    return buildAvatarUrl(avatar);
  }, [avatar, imageError]);

  const initials = useMemo(() => {
    return getInitials(nom, prenoms, email);
  }, [nom, prenoms, email]);

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "vendeur":
        return "#25D366";
      default:
        return "#0dcaf0";
    }
  };

  const bgColor = getUserTypeColor(userType);

  return (
    <div className="position-relative d-inline-block">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundColor: avatarUrl && !imageError ? 'transparent' : `${bgColor}20`,
          border: border ? `2px solid ${online ? '#25D366' : '#e9ecef'}` : 'none',
        }}
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={prenoms || nom || email || "Avatar"}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <span
            className="fw-bold"
            style={{
              color: bgColor,
              fontSize: size * 0.4,
            }}
          >
            {initials}
          </span>
        )}
      </div>
      {showStatus && online && (
        <div
          className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
          style={{ width: size * 0.25, height: size * 0.25 }}
        />
      )}
    </div>
  );
};

// ============================================
// COMPOSANT D'AFFICHAGE DE PIÈCE JOINTE
// ============================================
const FileAttachment = ({
  file,
  onRemove,
  isUploading = false,
}: {
  file: {
    key?: string;
    url?: string;
    name: string;
    type: string;
    size?: number;
    progress?: number;
  };
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return faFileImage;
    if (type.startsWith('audio/')) return faFileAudio;
    if (type.startsWith('video/')) return faFileVideo;
    if (type.includes('pdf')) return faFilePdf;
    if (type.includes('word') || type.includes('document')) return faFileWord;
    if (type.includes('excel') || type.includes('sheet')) return faFileExcel;
    if (type.includes('zip') || type.includes('archive')) return faFileArchive;
    return faFile;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fileUrl = file.url || (file.key ? buildFileUrl(file.key) : null);

  return (
    <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3 mb-2" style={{ maxWidth: '300px' }}>
      <div className="flex-shrink-0">
        <FontAwesomeIcon 
          icon={getFileIcon(file.type)} 
          style={{ 
            fontSize: '1.5rem',
            color: file.type.startsWith('image/') ? '#10b981' : 
                   file.type.startsWith('audio/') ? '#f59e0b' : 
                   '#6b7280'
          }} 
        />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="text-truncate fw-semibold" style={{ fontSize: '0.8rem' }}>
          {file.name}
        </div>
        {file.size && (
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
            {formatFileSize(file.size)}
          </div>
        )}
        {isUploading && file.progress !== undefined && (
          <div className="progress mt-1" style={{ height: '4px' }}>
            <div 
              className="progress-bar bg-success" 
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>
      {onRemove && (
        <button
          className="btn btn-link text-danger p-0"
          onClick={onRemove}
          disabled={isUploading}
          style={{ fontSize: '0.8rem' }}
        >
          <FontAwesomeIcon icon={faTimesIcon} />
        </button>
      )}
    </div>
  );
};

// ============================================
// COMPOSANT DE LECTEUR AUDIO
// ============================================
const AudioPlayer = ({ src, duration }: { src: string; duration?: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setAudioDuration(audioRef.current?.duration || 0);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3" style={{ minWidth: '250px' }}>
      <button
        className="btn btn-sm btn-success rounded-circle d-flex align-items-center justify-content-center"
        onClick={togglePlay}
        style={{ width: '32px', height: '32px' }}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ fontSize: '0.8rem' }} />
      </button>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between mb-1">
          <span style={{ fontSize: '0.7rem' }}>{formatTime(currentTime)}</span>
          <span style={{ fontSize: '0.7rem' }}>{formatTime(audioDuration)}</span>
        </div>
        <div className="progress" style={{ height: '4px' }}>
          <div 
            className="progress-bar bg-success" 
            style={{ width: `${(currentTime / audioDuration) * 100}%` }}
          />
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

// ============================================
// TYPES CORRIGÉS
// ============================================
interface UtilisateurBase {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  boutique?: {
    nom: string;
    uuid: string;
  };
  civilite_uuid?: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
    permissions?: any[];
  };
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  avatar?: string;
  statut?: string;
  is_admin?: boolean;
}

interface VendeurProfile extends UtilisateurBase {
  userType?: "vendeur";
}

interface Attachment {
  key: string;
  url: string;
  nom: string;
  type: string;
  mimeType: string;
  taille: number;
}

// ✅ Structure correcte pour la note vocale (telle que retournée par l'API)
interface NoteVocale {
  key: string;
  duree: number;
  url: string;
}

// ✅ Structure du message (telle que retournée par l'API)
interface Message {
  uuid: string;
  sujet: string;
  contenu: string;
  expediteurNom: string;
  expediteurEmail: string;
  expediteurUuid?: string;
  expediteurAvatar?: string | null;
  destinataireEmail: string;
  destinataireUuid?: string;
  type: string;
  estEnvoye: boolean;
  envoyeLe: string;
  estLu: boolean;
  dateLecture: string | null;
  dateCreation?: string;
  piecesJointes?: Attachment[];
  // ✅ L'API retourne noteVocale comme un objet ou null, pas des champs séparés
  noteVocale?: NoteVocale | null;
  status?: "sent" | "delivered" | "read" | "failed";
}

interface MessageReceived {
  uuid: string;
  message: Message;
  expediteurAvatar?: string | null;
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
  userType: "utilisateur" | "vendeur";
  lastMessageDate?: string;
  lastMessage?: string;
  lastMessageStatus?: "sent" | "delivered" | "read" | "failed";
  unreadCount?: number;
  totalMessages?: number;
  est_verifie: boolean;
  est_bloque: boolean;
  is_deleted: boolean;
  boutique?: {
    nom: string;
    uuid: string;
  };
  avatar?: string | null;
  online?: boolean;
  lastSeen?: string;
  typing?: boolean;
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

// ============================================
// COMPOSANTS UTILITAIRES
// ============================================
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
      return <FontAwesomeIcon icon={faCheckIcon} className="text-muted" style={{ fontSize: "0.7rem" }} />;
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
  senderAvatar,
  onReply,
  onDelete,
  onForward,
  onCopy,
  onDownload,
}: {
  message: Message;
  isOwn: boolean;
  status?: "sent" | "delivered" | "read" | "failed";
  showAvatar?: boolean;
  avatar?: string;
  senderName?: string;
  senderAvatar?: string | null;
  onReply?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onDownload?: (attachment: Attachment) => void;
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return faFileImage;
    if (type.startsWith('audio/')) return faFileAudio;
    if (type.startsWith('video/')) return faFileVideo;
    if (type.includes('pdf')) return faFilePdf;
    if (type.includes('word') || type.includes('document')) return faFileWord;
    if (type.includes('excel') || type.includes('sheet')) return faFileExcel;
    if (type.includes('zip') || type.includes('archive')) return faFileArchive;
    return faFile;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      className={`d-flex ${isOwn ? "justify-content-end" : "justify-content-start"} mb-3`}
      ref={messageRef}
    >
      {!isOwn && showAvatar && (
        <div className="me-2 flex-shrink-0">
          <UserAvatar
            avatar={senderAvatar}
            nom={senderName}
            email={message.expediteurEmail}
            size={36}
          />
        </div>
      )}

      <div
        className={`message-bubble position-relative ${isOwn ? "own-message" : "other-message"}`}
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
        {!isOwn && senderName && (
          <div className="fw-bold mb-1" style={{ fontSize: "0.75rem", color: "#128C7E" }}>
            {senderName}
          </div>
        )}

        <div className="message-content" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
          {message.contenu.split("\n").map((line, i) => (
            <p key={i} className="mb-1">{line}</p>
          ))}
        </div>

        {/* Pièces jointes */}
        {message.piecesJointes && message.piecesJointes.length > 0 && (
          <div className="mt-2">
            {message.piecesJointes.map((attachment, index) => (
              <div key={index} className="mb-2">
                {attachment.type.startsWith("image/") ? (
                  <div className="position-relative">
                    <img
                      src={attachment.url}
                      alt={attachment.nom}
                      style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", cursor: "pointer" }}
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                    <button
                      className="btn btn-sm btn-light position-absolute top-0 end-0 m-1 rounded-circle"
                      onClick={() => onDownload?.(attachment)}
                      style={{ width: '30px', height: '30px' }}
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: '0.8rem' }} />
                    </button>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-3">
                    <FontAwesomeIcon 
                      icon={getFileIcon(attachment.type)} 
                      style={{ fontSize: '1.2rem' }}
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-truncate fw-semibold" style={{ fontSize: '0.8rem' }}>
                        {attachment.nom}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {formatFileSize(attachment.taille)}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-link"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Note vocale */}
        {message.noteVocale && (
          <div className="mt-2">
            <AudioPlayer 
              src={message.noteVocale.url} 
              duration={message.noteVocale.duree} 
            />
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
          <UserAvatar
            avatar={avatar}
            nom="Vous"
            size={36}
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
const detectUserTypeFromEmail = (
  email: string,
): "utilisateur" | "vendeur" => {
  const emailLower = email.toLowerCase();
  if (emailLower.includes("vendeur") || emailLower.includes("@sonecafrica.com") || emailLower.includes("boutique") || emailLower.includes("shop"))
    return "vendeur";
  return "utilisateur";
};

const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case "vendeur":
      return faStore;
    default:
      return faUser;
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case "vendeur":
      return "#25D366";
    default:
      return "#0dcaf0";
  }
};

const getUserTypeLabel = (userType: string) => {
  switch (userType) {
    case "vendeur":
      return "Vendeur";
    default:
      return "Utilisateur";
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

// ============================================
// COMPOSANT PRINCIPAL AVEC SUSPENSE
// ============================================
export default function MessagerieVendeur() {
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
  const [contacts, setContacts] = useState<ContactConversation[]>([]);
  const [messagesRecus, setMessagesRecus] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);
  const [messagesRecusRaw, setMessagesRecusRaw] = useState<MessageReceived[]>([]);
  const [messagesEnvoyesRaw, setMessagesEnvoyesRaw] = useState<MessageReceived[]>([]);
  const [vendeurProfile, setVendeurProfile] = useState<VendeurProfile | null>(
    null,
  );
  const [currentConversation, setCurrentConversation] = useState<{
    contact: ContactConversation;
    messages: Message[];
  } | null>(null);

  // États pour les notifications toast
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // États pour les fichiers
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // États pour le chargement
  const [loading, setLoading] = useState({
    initial: true,
    contacts: false,
    messages: false,
    envoi: false,
    profile: false,
    uploading: false,
  });

  // État pour la suppression
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );

  // État pour la modale de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  // États pour les erreurs et succès
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // État pour le mode démo
  const [isDemoMode, setIsDemoMode] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // État pour le formulaire d'envoi
  const [newMessage, setNewMessage] = useState({
    destinataireEmail: "",
    destinataireUuid: "",
    sujet: "",
    contenu: "",
    type: "NOTIFICATION",
    expediteurNom: "",
    expediteurEmail: "",
    expediteurUuid: "",
  });

  // État pour la saisie en cours
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Cache pour les messages (persistance)
  const messagesCache = useRef<{
    recus: Message[];
    envoyes: Message[];
    lastFetch: number;
  }>({
    recus: [],
    envoyes: [],
    lastFetch: 0,
  });

  // ✅ Fonction pour naviguer vers l'accueil
  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

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
  // FONCTIONS DE GESTION DES FICHIERS
  // ============================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est un fichier audio
    if (!file.type.startsWith('audio/')) {
      showToast('error', '❌ Format non supporté', 'Veuillez sélectionner un fichier audio (MP3, WAV, etc.)');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', '❌ Fichier trop volumineux', 'La note vocale ne doit pas dépasser 10MB');
      return;
    }

    setSelectedAudio(file);

    // Essayer de détecter la durée
    try {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(Math.round(audio.duration));
      });
    } catch (error) {
      console.error('Erreur lors de la lecture de la durée audio:', error);
    }

    // Réinitialiser l'input
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setSelectedAudio(null);
    setAudioDuration(0);
  };

  // ============================================
  // FONCTIONS D'UPLOAD
  // ============================================
  const uploadFile = async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Déterminer le type de fichier
    let type = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';
    
    formData.append('type', type);

    try {
      const response = await api.postFormData<any>(
        API_ENDPOINTS.MESSAGERIE.UPLOAD_PIECE_JOINTE,
        formData
      );

      return {
        key: response.data.key,
        url: response.data.url,
        nom: response.data.nom,
        type: response.data.type,
        mimeType: response.data.mimeType,
        taille: response.data.taille,
      };
    } catch (error) {
      console.error('❌ Erreur upload fichier:', error);
      throw error;
    }
  };

  const uploadAudio = async (file: File, duration: number): Promise<Attachment & { duree: number }> => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('duree', duration.toString());

    try {
      const response = await api.postFormData<any>(
        API_ENDPOINTS.MESSAGERIE.UPLOAD_NOTE_VOCALE,
        formData
      );

      return {
        key: response.data.key,
        url: response.data.url,
        nom: response.data.nom,
        type: response.data.type,
        mimeType: response.data.mimeType,
        taille: response.data.taille,
        duree: response.data.duree,
      };
    } catch (error) {
      console.error('❌ Erreur upload note vocale:', error);
      throw error;
    }
  };

  // ============================================
  // FONCTIONS DE MARQUAGE COMME LU/NON LU
  // ============================================
  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      try {
        // En mode démo, simuler le succès
        if (isDemoMode) {
          setMessagesRecus((prev) =>
            prev.map((msg) =>
              msg.uuid === messageId
                ? { ...msg, estLu: true, dateLecture: new Date().toISOString() }
                : msg,
            ),
          );
          return;
        }

        await api.put(API_ENDPOINTS.MESSAGERIE.MARK_READ(messageId));

        setMessagesRecus((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: true, dateLecture: new Date().toISOString() }
              : msg,
          ),
        );

        if (currentConversation) {
          setCurrentConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.uuid === messageId
                  ? { ...msg, estLu: true, dateLecture: new Date().toISOString() }
                  : msg,
              ),
            };
          });
        }
      } catch (err) {
        console.error("❌ Erreur lors du marquage comme lu:", err);
        // Ne pas afficher d'erreur en mode démo
        if (!isDemoMode) {
          showToast(
            "error",
            "❌ Erreur",
            "Impossible de marquer le message comme lu",
            { duration: 3000 },
          );
        }
      }
    },
    [currentConversation, showToast, isDemoMode],
  );

  const handleMarkAsUnread = useCallback(
    async (messageId: string) => {
      try {
        // En mode démo, simuler le succès
        if (isDemoMode) {
          setMessagesRecus((prev) =>
            prev.map((msg) =>
              msg.uuid === messageId
                ? { ...msg, estLu: false, dateLecture: null }
                : msg,
            ),
          );
          return;
        }

        await api.patch(API_ENDPOINTS.MESSAGERIE.MARK_UNREAD(messageId));

        setMessagesRecus((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: false, dateLecture: null }
              : msg,
          ),
        );

        if (currentConversation) {
          setCurrentConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.uuid === messageId
                  ? { ...msg, estLu: false, dateLecture: null }
                  : msg,
              ),
            };
          });
        }
      } catch (err) {
        console.error("❌ Erreur lors du marquage comme non lu:", err);
        // Ne pas afficher d'erreur en mode démo
        if (!isDemoMode) {
          showToast(
            "error",
            "❌ Erreur",
            "Impossible de marquer le message comme non lu",
            { duration: 3000 },
          );
        }
      }
    },
    [currentConversation, showToast, isDemoMode],
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
      // En mode démo, simuler la suppression
      if (isDemoMode) {
        setMessagesRecus((prev) =>
          prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
        );
        setMessagesEnvoyes((prev) =>
          prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
        );

        if (currentConversation) {
          setCurrentConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.filter((msg) => msg.uuid !== messageToDelete.uuid),
            };
          });
        }
        return;
      }

      await api.delete(API_ENDPOINTS.MESSAGERIE.DELETE(messageToDelete.uuid));

      setMessagesRecus((prev) =>
        prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
      );
      setMessagesEnvoyes((prev) =>
        prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
      );

      if (currentConversation) {
        setCurrentConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.filter((msg) => msg.uuid !== messageToDelete.uuid),
          };
        });
      }

      showToast(
        "success",
        "🗑️ Message supprimé",
        `Le message a été supprimé avec succès`,
        {
          duration: 4000,
        },
      );
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du message:", err);
      if (!isDemoMode) {
        showToast("error", "❌ Erreur", "Impossible de supprimer le message", {
          duration: 4000,
        });
      }
    } finally {
      setDeletingMessageId(null);
      setMessageToDelete(null);
    }
  }, [messageToDelete, currentConversation, showToast, isDemoMode]);

  // ============================================
  // GESTION DES PARAMÈTRES D'URL
  // ============================================
  const handleUrlParams = useCallback(() => {
    const destinataireUuid = searchParams.get("destinataireUuid");
    const destinataireEmail = searchParams.get("destinataireEmail");
    const destinataireNom = searchParams.get("destinataireNom");
    const sujet = searchParams.get("sujet");

    if (destinataireEmail && vendeurProfile) {
      console.log("📨 Paramètres URL reçus:", {
        destinataireUuid,
        destinataireEmail,
        destinataireNom,
        sujet,
      });

      // Créer un contact temporaire
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
      };

      // Mettre à jour le formulaire
      setNewMessage((prev) => ({
        ...prev,
        destinataireEmail: destinataireEmail,
        destinataireUuid: destinataireUuid || "",
        sujet: sujet || `Message concernant votre annonce`,
        contenu: "",
        type: "NOTIFICATION",
      }));

      setCurrentConversation({
        contact,
        messages: [],
      });

      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.search = "";
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, vendeurProfile, router]);

  
  // CHARGEMENT DU PROFIL
  // ============================================
  const fetchVendeurProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      console.log("🔍 Chargement du profil vendeur...");
      const response = await api.get<{ data?: VendeurProfile }>(
        API_ENDPOINTS.AUTH.VENDEUR.PROFILE,
      );

      if (response && response.data) {
        const profile = response.data;
        setVendeurProfile(profile);
        
        const expediteurNom = `${profile.prenoms || ""} ${profile.nom || ""}`.trim() || "Vendeur SONEC";
        const expediteurEmail = profile.email || "";
        const expediteurUuid = profile.uuid || "";
        
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail,
          expediteurNom,
          expediteurUuid,
          type: "NOTIFICATION",
        }));
        
        return profile;
      }
      return null;
    } catch (err) {
      console.error("❌ Erreur chargement profil vendeur:", err);
      
      // Créer un profil par défaut en mode démo
      const demoProfile: VendeurProfile = {
        uuid: "vendeur-demo-123",
        nom: "Vendeur",
        prenoms: "SONEC",
        email: "vendeur@oskar.ci",
        telephone: "+22507070707",
        est_verifie: true,
        est_bloque: false,
        is_deleted: false,
        userType: "vendeur",
      };
      
      setVendeurProfile(demoProfile);
      setNewMessage((prev) => ({
        ...prev,
        expediteurEmail: demoProfile.email,
        expediteurNom: "Vendeur SONEC",
        expediteurUuid: demoProfile.uuid,
        type: "NOTIFICATION",
      }));
      
      return demoProfile;
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  // ============================================
  // ✅ CHARGEMENT DES MESSAGES REÇUS (CORRIGÉ)
  // ============================================
  const fetchMessagesRecus = useCallback(
    async (profileEmail?: string, profileUuid?: string, forceRefresh = false) => {
      const now = Date.now();
      if (!forceRefresh && messagesCache.current.recus.length > 0 && (now - messagesCache.current.lastFetch) < 30000) {
        console.log("📦 Utilisation du cache pour les messages reçus");
        setMessagesRecus(messagesCache.current.recus);
        return;
      }

      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        let transformedMessages: Message[] = [];

        try {
          const response = await api.get<MessageReceived[]>(
            API_ENDPOINTS.MESSAGERIE.RECEIVED,
          );

          console.log("📥 Messages reçus - Réponse API:", response);

          if (response && Array.isArray(response) && response.length > 0) {
            setMessagesRecusRaw(response);
            
            transformedMessages = response
              .map((item: MessageReceived) => {
                const messageData = item.message;
                
                if (!messageData || !messageData.uuid) {
                  return null;
                }

                if (messageData.expediteurEmail === 'system@example.com') {
                  return null;
                }

                const expediteurAvatar = item.expediteurAvatar || messageData.expediteurAvatar;
                const avatarUrl = expediteurAvatar ? buildAvatarUrl(expediteurAvatar) : null;

                return {
                  ...messageData,
                  expediteurAvatar: avatarUrl,
                  piecesJointes: messageData.piecesJointes?.map((pj: any) => ({
                    ...pj,
                    url: buildFileUrl(pj.key) || pj.url,
                  })),
                  // ✅ CORRIGÉ : Utiliser l'objet noteVocale complet
                  noteVocale: messageData.noteVocale ? {
                    key: messageData.noteVocale.key,
                    duree: messageData.noteVocale.duree || 0,
                    url: buildFileUrl(messageData.noteVocale.key) || messageData.noteVocale.url,
                  } : null,
                  status: messageData.estLu ? "read" as const : "delivered" as const,
                } as Message;
              })
              .filter((item): item is Message => item !== null);
          }
        } catch (err) {
          console.log("ℹ️ Mode démo activé pour les messages reçus");
          transformedMessages = MOCK_MESSAGES_RECUS.map(item => item.message as Message);
          setIsDemoMode(true);
        }

        console.log(`✅ ${transformedMessages.length} messages reçus chargés`);
        setMessagesRecus(transformedMessages);
        
        messagesCache.current.recus = transformedMessages;
        messagesCache.current.lastFetch = now;

        const unreadMessages = transformedMessages.filter((m) => !m.estLu);
        if (unreadMessages.length > 0 && !isDemoMode) {
          showToast(
            "info",
            `📬 ${unreadMessages.length} message(s) non lu(s)`,
            "Vous avez des messages en attente de lecture",
            { duration: 5000 },
          );
        }
      } catch (err) {
        console.error("❌ Erreur fatale chargement messages reçus:", err);
        setMessagesRecus(MOCK_MESSAGES_RECUS.map(item => item.message as Message));
        setIsDemoMode(true);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [showToast, isDemoMode],
  );

  // ============================================
  // ✅ CHARGEMENT DES MESSAGES ENVOYÉS (CORRIGÉ)
  // ============================================
  const fetchMessagesEnvoyes = useCallback(
    async (
      profileNom?: string,
      profileEmail?: string,
      profileUuid?: string,
      forceRefresh = false,
    ) => {
      const now = Date.now();
      if (!forceRefresh && messagesCache.current.envoyes.length > 0 && (now - messagesCache.current.lastFetch) < 30000) {
        console.log("📦 Utilisation du cache pour les messages envoyés");
        setMessagesEnvoyes(messagesCache.current.envoyes);
        return;
      }

      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        let formattedMessages: Message[] = [];

        try {
          const response = await api.get<any[]>(API_ENDPOINTS.MESSAGERIE.SENT);

          console.log("📤 Messages envoyés - Réponse API:", response);

          if (response && Array.isArray(response) && response.length > 0) {
            setMessagesEnvoyesRaw(response as MessageReceived[]);
            
            formattedMessages = response
              .map((item: any) => {
                const messageData = item.message || item;
                
                if (!messageData || !messageData.uuid) {
                  return null;
                }

                if (messageData.expediteurEmail === 'system@example.com') {
                  return null;
                }

                const expediteurAvatar = messageData.expediteurAvatar || messageData.avatar;
                const avatarUrl = expediteurAvatar ? buildAvatarUrl(expediteurAvatar) : null;

                return {
                  uuid: messageData.uuid,
                  sujet: messageData.sujet || "Sans sujet",
                  contenu: messageData.contenu || "",
                  expediteurNom: messageData.expediteurNom || profileNom || "Vendeur SONEC",
                  expediteurEmail: messageData.expediteurEmail || profileEmail || "",
                  expediteurUuid: messageData.expediteurUuid || profileUuid || "",
                  expediteurAvatar: avatarUrl,
                  destinataireEmail: messageData.destinataireEmail || "",
                  destinataireUuid: messageData.destinataireUuid || "",
                  type: (messageData.type || "NOTIFICATION").toUpperCase(),
                  estEnvoye: true,
                  envoyeLe: messageData.envoyeLe || new Date().toISOString(),
                  estLu: messageData.estLu === true,
                  dateLecture: messageData.dateLecture || null,
                  piecesJointes: messageData.piecesJointes?.map((pj: any) => ({
                    ...pj,
                    url: buildFileUrl(pj.key) || pj.url,
                  })),
                  // ✅ CORRIGÉ : Utiliser l'objet noteVocale complet
                  noteVocale: messageData.noteVocale ? {
                    key: messageData.noteVocale.key,
                    duree: messageData.noteVocale.duree || 0,
                    url: buildFileUrl(messageData.noteVocale.key) || messageData.noteVocale.url,
                  } : null,
                  status: messageData.estLu ? "read" as const : "sent" as const,
                } as Message;
              })
              .filter((msg): msg is Message => msg !== null);
          }
        } catch (err) {
          console.log("ℹ️ Mode démo activé pour les messages envoyés");
          formattedMessages = MOCK_MESSAGES_ENVOYES.map(item => item.message as Message);
          setIsDemoMode(true);
        }

        console.log(`✅ ${formattedMessages.length} messages envoyés chargés`);
        setMessagesEnvoyes(formattedMessages);
        
        messagesCache.current.envoyes = formattedMessages;
        messagesCache.current.lastFetch = now;
      } catch (err) {
        console.error("❌ Erreur fatale chargement messages envoyés:", err);
        setMessagesEnvoyes(MOCK_MESSAGES_ENVOYES.map(item => item.message as Message));
        setIsDemoMode(true);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [],
  );

  // ============================================
  // FONCTION DE RAFRAÎCHISSEMENT FORCÉ
  // ============================================
  const handleRefresh = useCallback(() => {
    if (vendeurProfile) {
      fetchMessagesRecus(vendeurProfile.email, vendeurProfile.uuid, true);
      fetchMessagesEnvoyes(
        `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() ||
          "Vendeur SONEC",
        vendeurProfile.email,
        vendeurProfile.uuid,
        true,
      );
      showToast("info", "🔄 Actualisation", "Vos messages ont été actualisés", {
        duration: 2000,
      });
    }
  }, [vendeurProfile, fetchMessagesRecus, fetchMessagesEnvoyes, showToast]);

  // ============================================
  // CONSTRUCTION DES CONTACTS À PARTIR DES MESSAGES
  // ============================================
  const buildContactsFromMessages = useCallback(() => {
    if (!vendeurProfile) return;

    if (isFetchingContacts.current) return;
    isFetchingContacts.current = true;

    try {
      console.log("👥 Construction des contacts depuis les messages...");

      const contactsMap = new Map<string, ContactConversation>();

      messagesRecus.forEach((msg) => {
        const email = msg.expediteurEmail;
        if (!email || email === vendeurProfile.email) return;

        if (!contactsMap.has(email)) {
          const contact: ContactConversation = {
            uuid: msg.expediteurUuid || `contact-${Date.now()}-${email}`,
            email,
            nom: msg.expediteurNom?.split(" ").pop() || "",
            prenoms: msg.expediteurNom?.split(" ").slice(0, -1).join(" ") || msg.expediteurNom || "Contact",
            telephone: "",
            userType: detectUserTypeFromEmail(email),
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            lastMessageDate: msg.envoyeLe,
            lastMessage: msg.contenu,
            lastMessageStatus: msg.estLu ? "read" : "delivered",
            unreadCount: !msg.estLu ? 1 : 0,
            totalMessages: 1,
            avatar: msg.expediteurAvatar,
            online: Math.random() > 0.5,
            lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          };
          contactsMap.set(email, contact);
        } else {
          const contact = contactsMap.get(email)!;
          contact.totalMessages = (contact.totalMessages || 0) + 1;
          if (!msg.estLu) {
            contact.unreadCount = (contact.unreadCount || 0) + 1;
          }
          if (new Date(msg.envoyeLe) > new Date(contact.lastMessageDate || "")) {
            contact.lastMessageDate = msg.envoyeLe;
            contact.lastMessage = msg.contenu;
            contact.lastMessageStatus = msg.estLu ? "read" : "delivered";
          }
        }
      });

      messagesEnvoyes.forEach((msg) => {
        const email = msg.destinataireEmail;
        if (!email || email === vendeurProfile.email) return;

        if (!contactsMap.has(email)) {
          const contact: ContactConversation = {
            uuid: msg.destinataireUuid || `contact-${Date.now()}-${email}`,
            email,
            nom: "",
            prenoms: email.split("@")[0] || "Contact",
            telephone: "",
            userType: detectUserTypeFromEmail(email),
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            lastMessageDate: msg.envoyeLe,
            lastMessage: msg.contenu,
            lastMessageStatus: msg.estLu ? "read" : "sent",
            unreadCount: 0,
            totalMessages: 1,
            avatar: null,
            online: Math.random() > 0.5,
            lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          };
          contactsMap.set(email, contact);
        } else {
          const contact = contactsMap.get(email)!;
          contact.totalMessages = (contact.totalMessages || 0) + 1;
          if (new Date(msg.envoyeLe) > new Date(contact.lastMessageDate || "")) {
            contact.lastMessageDate = msg.envoyeLe;
            contact.lastMessage = msg.contenu;
            contact.lastMessageStatus = msg.estLu ? "read" : "sent";
          }
        }
      });

      const contactsArray = Array.from(contactsMap.values())
        .filter((c) => c.email !== vendeurProfile.email)
        .sort((a, b) => {
          const dateA = a.lastMessageDate
            ? new Date(a.lastMessageDate).getTime()
            : 0;
          const dateB = b.lastMessageDate
            ? new Date(b.lastMessageDate).getTime()
            : 0;
          return dateB - dateA;
        });

      console.log(`✅ ${contactsArray.length} contacts trouvés`);
      setContacts(contactsArray);
    } catch (err) {
      console.error("❌ Erreur construction contacts:", err);
    } finally {
      isFetchingContacts.current = false;
    }
  }, [vendeurProfile, messagesRecus, messagesEnvoyes]);

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (hasLoadedInitialData.current) return;

      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        const profile = await fetchVendeurProfile();

        if (!isMounted) return;

        if (profile) {
          await Promise.all([
            fetchMessagesRecus(profile.email, profile.uuid),
            fetchMessagesEnvoyes(
              `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
                "Vendeur SONEC",
              profile.email,
              profile.uuid,
            ),
          ]);
        }

        hasLoadedInitialData.current = true;
        isInitialLoad.current = false;

        if (!isDemoMode) {
          showToast(
            "success",
            "✅ Messagerie chargée",
            "Votre messagerie est prête",
            { duration: 3000 },
          );
        } else {
          showToast(
            "info",
            "🎮 Mode démo actif",
            "Certains messages sont des données de démonstration",
            { duration: 5000 },
          );
        }
      } catch (err) {
        console.error("❌ Erreur chargement initial:", err);
        setIsDemoMode(true);
        showToast(
          "info",
          "🎮 Mode démo actif",
          "Utilisation de données de démonstration",
          { duration: 5000 },
        );
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, initial: false }));
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [
    fetchVendeurProfile,
    fetchMessagesRecus,
    fetchMessagesEnvoyes,
    showToast,
  ]);

  // ============================================
  // CONSTRUCTION DES CONTACTS APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!vendeurProfile) return;

    const messagesRecusChanged =
      prevMessagesRecusLength.current !== messagesRecus.length;
    const messagesEnvoyesChanged =
      prevMessagesEnvoyesLength.current !== messagesEnvoyes.length;

    if (messagesRecusChanged || messagesEnvoyesChanged) {
      buildContactsFromMessages();

      prevMessagesRecusLength.current = messagesRecus.length;
      prevMessagesEnvoyesLength.current = messagesEnvoyes.length;
    }
  }, [
    vendeurProfile,
    messagesRecus,
    messagesEnvoyes,
    buildContactsFromMessages,
  ]);

  // ============================================
  // GESTION DES PARAMÈTRES URL APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (vendeurProfile && !loading.initial) {
      handleUrlParams();
    }
  }, [vendeurProfile, loading.initial, handleUrlParams]);

  // ============================================
  // STATISTIQUES
  // ============================================
  const stats = useMemo(
    () => ({
      totalContacts: contacts.length,
      totalMessages: messagesRecus.length + messagesEnvoyes.length,
      unreadMessages: messagesRecus.filter((m) => !m.estLu).length,
      sentMessages: messagesEnvoyes.length,
    }),
    [contacts, messagesRecus, messagesEnvoyes],
  );

  // ============================================
  // FILTRAGE DES CONTACTS
  // ============================================
  const filteredContacts = useMemo(() => {
    let result = contacts.filter((c) => !c.is_deleted);

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

    return result;
  }, [contacts, searchTerm]);

  // ============================================
  // SÉLECTIONNER LE PREMIER CONTACT PAR DÉFAUT
  // ============================================
  useEffect(() => {
    if (filteredContacts.length > 0 && !currentConversation && !loading.initial) {
      loadConversation(filteredContacts[0]);
    }
  }, [filteredContacts, currentConversation, loading.initial]);

  // ============================================
  // CHARGEMENT DE LA CONVERSATION
  // ============================================
  const loadConversation = useCallback((contact: ContactConversation) => {
    const conversationMessages = [
      ...messagesRecus.filter((m) => m.expediteurEmail === contact.email),
      ...messagesEnvoyes.filter((m) => m.destinataireEmail === contact.email),
    ].sort((a, b) => new Date(a.envoyeLe).getTime() - new Date(b.envoyeLe).getTime());

    setCurrentConversation({
      contact,
      messages: conversationMessages,
    });

    conversationMessages
      .filter((m) => !m.estEnvoye && !m.estLu)
      .forEach((m) => handleMarkAsRead(m.uuid));

    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  }, [messagesRecus, messagesEnvoyes, handleMarkAsRead]);

  // ============================================
  // ✅ ENVOI DE MESSAGE AVEC AFFICHAGE IMMÉDIAT (CORRIGÉ)
  // ============================================
  const handleSendMessage = async () => {
    if (!currentConversation) {
      setInfoMessage("Veuillez sélectionner un contact");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (!newMessage.contenu.trim() && selectedFiles.length === 0 && !selectedAudio) {
      setInfoMessage("Veuillez saisir un message ou joindre un fichier");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    setLoading((prev) => ({ ...prev, envoi: true, uploading: true }));
    setError(null);
    setApiError(null);

    try {
      let uploadedFiles: Attachment[] = [];
      let uploadedAudio: (Attachment & { duree: number }) | null = null;

      if (isDemoMode) {
        console.log("🎮 Mode démo: envoi de message simulé");
        
        const sentMessage: Message = {
          uuid: `demo-${Date.now()}`,
          sujet: newMessage.sujet || `Message pour ${currentConversation.contact.prenoms}`,
          contenu: newMessage.contenu.trim(),
          expediteurNom: vendeurProfile ? `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() : "Vendeur SONEC",
          expediteurEmail: vendeurProfile?.email || "",
          expediteurUuid: vendeurProfile?.uuid || "",
          expediteurAvatar: vendeurProfile?.avatar || null,
          destinataireEmail: currentConversation.contact.email,
          destinataireUuid: currentConversation.contact.uuid,
          type: "NOTIFICATION",
          estEnvoye: true,
          envoyeLe: new Date().toISOString(),
          estLu: false,
          dateLecture: null,
          piecesJointes: [],
          noteVocale: null,
          status: "sent",
        };

        setMessagesEnvoyes((prev) => [sentMessage, ...prev]);
        messagesCache.current.envoyes = [sentMessage, ...messagesCache.current.envoyes];

        setCurrentConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, sentMessage],
          };
        });

        setContacts((prev) =>
          prev.map((c) =>
            c.email === currentConversation.contact.email
              ? {
                  ...c,
                  lastMessageDate: sentMessage.envoyeLe,
                  lastMessage: sentMessage.contenu,
                  lastMessageStatus: "sent",
                  totalMessages: (c.totalMessages || 0) + 1,
                }
              : c,
          ),
        );

        showToast(
          "success",
          "✅ Message envoyé ! (Mode démo)",
          `Votre message a été simulé avec succès`,
          { duration: 3000 },
        );

        setNewMessage((prev) => ({
          ...prev,
          contenu: "",
          sujet: `Message pour ${currentConversation.contact.prenoms}`,
        }));
        setSelectedFiles([]);
        setSelectedAudio(null);
        setAudioDuration(0);
        setUploadedAttachments([]);

        setTimeout(scrollToBottom, 100);
        return;
      }

      for (const file of selectedFiles) {
        try {
          const attachment = await uploadFile(file);
          uploadedFiles.push(attachment);
        } catch (error) {
          console.error("❌ Erreur upload fichier:", error);
          showToast("error", "❌ Erreur upload", `Impossible d'uploader ${file.name}`, { duration: 3000 });
        }
      }

      if (selectedAudio) {
        try {
          uploadedAudio = await uploadAudio(selectedAudio, audioDuration);
        } catch (error) {
          console.error("❌ Erreur upload note vocale:", error);
          showToast("error", "❌ Erreur upload", "Impossible d'uploader la note vocale", { duration: 3000 });
        }
      }

      const messageData: any = {
        destinataireEmail: currentConversation.contact.email,
        sujet: newMessage.sujet || `Message pour ${currentConversation.contact.prenoms}`,
        contenu: newMessage.contenu.trim(),
        type: "NOTIFICATION",
      };

      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        messageData.pieceJointeKey = file.key;
        messageData.pieceJointeNom = file.nom;
        messageData.pieceJointeType = file.type;
        messageData.pieceJointeMimeType = file.mimeType;
        messageData.pieceJointeTaille = file.taille;
      }

      if (uploadedAudio) {
        messageData.noteVocaleKey = uploadedAudio.key;
        messageData.noteVocaleDuree = uploadedAudio.duree;
      }

      console.log("📤 Envoi de message avec fichiers:", messageData);

      const response = await api.post<any>(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData
      );

      console.log("✅ Message envoyé avec succès, réponse:", response);

      // ✅ CRÉER LE MESSAGE LOCALEMENT POUR AFFICHAGE IMMÉDIAT
      const sentMessage: Message = {
        uuid: response.uuid || `msg-${Date.now()}`,
        sujet: messageData.sujet,
        contenu: messageData.contenu,
        expediteurNom: vendeurProfile ? `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() : "Vendeur SONEC",
        expediteurEmail: vendeurProfile?.email || "",
        expediteurUuid: vendeurProfile?.uuid || "",
        expediteurAvatar: vendeurProfile?.avatar || null,
        destinataireEmail: messageData.destinataireEmail,
        destinataireUuid: currentConversation.contact.uuid,
        type: "NOTIFICATION",
        estEnvoye: true,
        envoyeLe: new Date().toISOString(),
        estLu: false,
        dateLecture: null,
        piecesJointes: uploadedFiles,
        // ✅ CORRIGÉ : Créer l'objet noteVocale complet
        noteVocale: uploadedAudio ? {
          key: uploadedAudio.key,
          duree: uploadedAudio.duree,
          url: uploadedAudio.url,
        } : null,
        status: "sent",
      };

      // ✅ MISE À JOUR LOCALE IMMÉDIATE
      setMessagesEnvoyes((prev) => [sentMessage, ...prev]);
      messagesCache.current.envoyes = [sentMessage, ...messagesCache.current.envoyes];

      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, sentMessage],
        };
      });

      setContacts((prev) =>
        prev.map((c) =>
          c.email === currentConversation.contact.email
            ? {
                ...c,
                lastMessageDate: sentMessage.envoyeLe,
                lastMessage: sentMessage.contenu,
                lastMessageStatus: "sent",
                totalMessages: (c.totalMessages || 0) + 1,
              }
            : c,
        ),
      );

      // ✅ RAFRAÎCHISSEMENT EN ARRIÈRE-PLAN
      if (vendeurProfile) {
        Promise.all([
          fetchMessagesRecus(vendeurProfile.email, vendeurProfile.uuid, true).catch(() => {}),
          fetchMessagesEnvoyes(
            `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() ||
              "Vendeur SONEC",
            vendeurProfile.email,
            vendeurProfile.uuid,
            true,
          ).catch(() => {}),
        ]).finally(() => {
          console.log("🔄 Rafraîchissement en arrière-plan terminé");
        });
      }

      showToast(
        "success",
        "✅ Message envoyé !",
        `Votre message a été envoyé à ${currentConversation.contact.prenoms}`,
        {
          duration: 4000,
          destinataire: {
            nom: currentConversation.contact.prenoms,
            email: currentConversation.contact.email,
          },
        },
      );

      setNewMessage((prev) => ({
        ...prev,
        contenu: "",
        sujet: `Message pour ${currentConversation.contact.prenoms}`,
      }));
      setSelectedFiles([]);
      setSelectedAudio(null);
      setAudioDuration(0);
      setUploadedAttachments([]);

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

      setApiError(errorMessage);
      showToast("error", "❌ Erreur d'envoi", errorMessage, { duration: 5000 });
    } finally {
      setLoading((prev) => ({ ...prev, envoi: false, uploading: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ============================================
  // GESTION DE LA SUPPRESSION D'UNE CONVERSATION
  // ============================================
  const handleDeleteConversation = useCallback(() => {
    if (!currentConversation) return;

    setCurrentConversation(null);
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

      {/* Bannière mode démo */}
      {isDemoMode && (
        <div
          className="position-fixed top-0 start-0 w-100 text-center py-2"
          style={{
            backgroundColor: "#f39c12",
            color: "white",
            zIndex: 10000,
            fontSize: "0.9rem",
          }}
        >
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          Mode démo actif - Les messages ne sont pas persistés
        </div>
      )}

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
          {/* PANGAUCHE - LISTE DES CONTACTS */}
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
                <div 
                  className="d-flex align-items-center gap-2" 
                  style={{ cursor: "pointer" }}
                  onClick={navigateToHome}
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

              {/* Filtre "Tous" uniquement */}
              <div className="mt-3">
                <span className="badge bg-success" style={{ borderRadius: "20px", fontSize: "0.8rem", padding: "6px 12px" }}>
                  Tous les contacts
                </span>
              </div>
            </div>

            {/* Liste des contacts */}
            <div className="flex-grow-1 overflow-auto" style={{ background: "#ffffff" }}>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faUsers} className="fs-1 text-muted mb-3 opacity-25" />
                  <h6 className="fw-semibold mb-2">Aucune discussion</h6>
                  <p className="text-muted small px-4">
                    Commencez une conversation en sélectionnant un contact
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.uuid}
                    className={`d-flex align-items-center p-3 border-bottom ${currentConversation?.contact.uuid === contact.uuid ? "bg-success bg-opacity-10" : ""}`}
                    onClick={() => loadConversation(contact)}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (currentConversation?.contact.uuid !== contact.uuid) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentConversation?.contact.uuid !== contact.uuid) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {/* Avatar avec initiales si pas d'image */}
                    <div className="position-relative me-3 flex-shrink-0">
                      <UserAvatar
                        avatar={contact.avatar}
                        nom={contact.nom}
                        prenoms={contact.prenoms}
                        email={contact.email}
                        userType={contact.userType}
                        size={50}
                        showStatus={true}
                        online={contact.online}
                        border={true}
                      />
                    </div>

                    {/* Infos contact */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="fw-bold text-truncate mb-0" style={{ fontSize: "0.95rem", color: "#111b21" }}>
                          {contact.prenoms} {contact.nom}
                        </h6>
                        <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                          {formatLastMessageDate(contact.lastMessageDate)}
                        </small>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <p className="text-muted text-truncate mb-0" style={{ fontSize: "0.8rem", maxWidth: "180px" }}>
                          {contact.lastMessage}
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          {contact.lastMessageStatus && (
                            <MessageStatus status={contact.lastMessageStatus} />
                          )}
                          {contact.unreadCount ? (
                            <span
                              className="badge bg-success rounded-pill"
                              style={{ fontSize: "0.7rem", minWidth: "20px" }}
                            >
                              {contact.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PAN DROIT - CONVERSATION */}
          <div className="flex-grow-1 d-flex flex-column" style={{ background: "#efeae2" }}>
            {currentConversation ? (
              <>
                {/* En-tête de la conversation */}
                <div className="p-3 border-bottom" style={{ background: "#f0f2f5" }}>
                  <div className="d-flex align-items-center">
                    {/* Logo mobile */}
                    <div 
                      className="d-flex align-items-center gap-2 me-2 d-lg-none" 
                      style={{ cursor: "pointer" }}
                      onClick={navigateToHome}
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
                    </div>

                    <div className="position-relative me-3">
                      <UserAvatar
                        avatar={currentConversation.contact.avatar}
                        nom={currentConversation.contact.nom}
                        prenoms={currentConversation.contact.prenoms}
                        email={currentConversation.contact.email}
                        userType={currentConversation.contact.userType}
                        size={45}
                        showStatus={true}
                        online={currentConversation.contact.online}
                        border={true}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1" style={{ fontSize: "1rem", color: "#111b21" }}>
                        {currentConversation.contact.prenoms} {currentConversation.contact.nom}
                      </h6>
                      <div className="d-flex align-items-center">
                        <OnlineIndicator
                          online={currentConversation.contact.online}
                          lastSeen={currentConversation.contact.lastSeen}
                        />
                        {typingUsers.has(currentConversation.contact.uuid) && (
                          <div className="ms-2">
                            <TypingIndicator />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="dropdown">
                      <button
                        className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                        data-bs-toggle="dropdown"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <button 
                          className="dropdown-item d-flex align-items-center gap-2" 
                          onClick={navigateToHome}
                        >
                          <div
                            className="rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "20px",
                              height: "20px",
                              backgroundColor: colors.oskar.green,
                            }}
                          >
                            <span
                              className="text-white fw-bold"
                              style={{ fontSize: "0.65rem" }}
                            >
                              O
                            </span>
                          </div>
                          <span style={{ fontSize: "0.85rem" }}>OSKAR Accueil</span>
                        </button>
                        <div className="dropdown-divider" />
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleRefresh}>
                          <FontAwesomeIcon icon={faHistory} style={{ fontSize: "0.8rem" }} />
                          <span style={{ fontSize: "0.85rem" }}>Actualiser</span>
                        </button>
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => {
                          navigator.clipboard.writeText(currentConversation.contact.email);
                          showToast("success", "📋 Email copié", "L'email a été copié dans le presse-papiers", { duration: 2000 });
                        }}>
                          <FontAwesomeIcon icon={faCopy} style={{ fontSize: "0.8rem" }} />
                          <span style={{ fontSize: "0.85rem" }}>Copier l'email</span>
                        </button>
                        <div className="dropdown-divider" />
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 text-danger"
                          onClick={handleDeleteConversation}
                        >
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: "0.8rem" }} />
                          <span style={{ fontSize: "0.85rem" }}>Fermer la discussion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-grow-1 overflow-auto p-3"
                  style={{
                    background: "#efeae2",
                    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                  }}
                >
                  {currentConversation.messages.map((message) => {
                    const isOwn = message.expediteurEmail === vendeurProfile?.email;
                    const status = isOwn
                      ? message.estLu
                        ? "read"
                        : message.estEnvoye
                          ? "delivered"
                          : "sent"
                      : undefined;

                    return (
                      <MessageBubble
                        key={message.uuid}
                        message={message}
                        isOwn={isOwn}
                        status={status}
                        showAvatar={true}
                        avatar={vendeurProfile?.avatar}
                        senderName={!isOwn ? currentConversation.contact.prenoms : undefined}
                        senderAvatar={!isOwn ? message.expediteurAvatar : null}
                        onReply={() => {
                          setNewMessage((prev) => ({
                            ...prev,
                            contenu: `> ${message.contenu}\n\n`,
                          }));
                          messageInputRef.current?.focus();
                        }}
                        onDelete={() => openDeleteModal(message)}
                        onForward={() => {
                          navigator.clipboard.writeText(message.contenu);
                          showToast("success", "📋 Message copié", "Le message a été copié pour être transféré", { duration: 2000 });
                        }}
                        onCopy={() => {
                          navigator.clipboard.writeText(message.contenu);
                          showToast("success", "📋 Message copié", "Le message a été copié dans le presse-papiers", { duration: 2000 });
                        }}
                        onDownload={(attachment) => {
                          window.open(attachment.url, '_blank');
                          showToast("success", "📥 Téléchargement", `Téléchargement de ${attachment.nom}`, { duration: 2000 });
                        }}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie avec gestion des fichiers */}
                <div className="p-3" style={{ background: "#f0f2f5" }}>
                  {/* Fichiers sélectionnés */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 d-flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <FileAttachment
                          key={index}
                          file={{ name: file.name, type: file.type, size: file.size }}
                          onRemove={() => removeFile(index)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Note vocale sélectionnée */}
                  {selectedAudio && (
                    <div className="mb-2">
                      <FileAttachment
                        file={{ name: selectedAudio.name, type: selectedAudio.type, size: selectedAudio.size }}
                        onRemove={removeAudio}
                      />
                      {audioDuration > 0 && (
                        <small className="text-muted ms-2">
                          Durée: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
                        </small>
                      )}
                    </div>
                  )}

                  {/* Inputs cachés pour les fichiers */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioSelect}
                    accept="audio/*"
                    style={{ display: 'none' }}
                  />

                  {/* Barre d'outils */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <button
                      className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => fileInputRef.current?.click()}
                      title="Joindre un fichier"
                    >
                      <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: "1rem", color: "#54656f" }} />
                    </button>
                    <button
                      className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => audioInputRef.current?.click()}
                      title="Ajouter une note vocale"
                    >
                      <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: "1rem", color: "#54656f" }} />
                    </button>
                    <button
                      className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      title="Ajouter une image"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = "image/*";
                          fileInputRef.current.multiple = true;
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faImage} style={{ fontSize: "1rem", color: "#54656f" }} />
                    </button>
                    <button
                      className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      title="Ajouter un emoji"
                    >
                      <FontAwesomeIcon icon={faSmile} style={{ fontSize: "1rem", color: "#54656f" }} />
                    </button>
                  </div>

                  {/* Zone de texte et bouton d'envoi */}
                  <div className="d-flex align-items-center gap-2">
                    <div className="flex-grow-1 position-relative">
                      <textarea
                        ref={messageInputRef}
                        className="form-control border-0"
                        placeholder="Écrivez votre message..."
                        value={newMessage.contenu}
                        onChange={(e) => setNewMessage({ ...newMessage, contenu: e.target.value })}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        style={{
                          borderRadius: "24px",
                          padding: "12px 16px",
                          fontSize: "0.9rem",
                          resize: "none",
                          maxHeight: "120px",
                          background: "#ffffff",
                        }}
                      />
                    </div>

                    <button
                      className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
                      onClick={handleSendMessage}
                      disabled={loading.envoi || (!newMessage.contenu.trim() && selectedFiles.length === 0 && !selectedAudio)}
                      style={{
                        width: "45px",
                        height: "45px",
                        background: "#25D366",
                        border: "none",
                        opacity: loading.envoi || (!newMessage.contenu.trim() && selectedFiles.length === 0 && !selectedAudio) ? 0.6 : 1,
                      }}
                    >
                      {loading.envoi ? (
                        <span className="spinner-border spinner-border-sm text-white" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "1.1rem", color: "white" }} />
                      )}
                    </button>
                  </div>

                  {/* Indicateur d'upload */}
                  {loading.uploading && (
                    <div className="mt-2 text-center">
                      <small className="text-muted">
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Upload en cours...
                      </small>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Message quand aucun contact n'est disponible */
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
                  <h4 className="fw-bold mb-3" style={{ color: "#41525d" }}>Messagerie Vendeur</h4>
                  <p className="text-muted mb-4" style={{ maxWidth: "400px", fontSize: "0.95rem" }}>
                    Aucune discussion disponible pour le moment
                  </p>
                  <div 
                    className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                    style={{ cursor: "pointer", maxWidth: "fit-content" }}
                    onClick={navigateToHome}
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

        /* Support des émojis */
        .message-content, textarea, input {
          font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Android Emoji', 'EmojiOne Color', 'Twemoji Mozilla', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif !important;
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

        /* Animation pour les nouveaux messages */
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

        .message-bubble {
          animation: slideIn 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .d-flex.h-100 {
            flex-direction: column;
          }
          [style*="width: 350px"] {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}