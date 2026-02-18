// app/(back-office)/dashboard-utilisateur/messages/page.tsx
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
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// ============================================
// TYPES
// ============================================
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
  userType?: "admin" | "agent" | "vendeur" | "utilisateur";
  boutique?: {
    nom: string;
    uuid: string;
  };
}

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
}

interface MessageReceived {
  uuid: string;
  message: Message;
  statut: string;
  estLu: boolean;
  dateLecture?: string | null;
  dateReception: string;
}

interface ContactConversation extends UtilisateurBase {
  userType: "admin" | "agent" | "vendeur" | "utilisateur";
  lastMessageDate?: string;
  lastMessage?: string;
  unreadCount?: number;
  totalMessages?: number;
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

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
const detectUserTypeFromEmail = (
  email: string,
): "admin" | "agent" | "vendeur" | "utilisateur" => {
  const emailLower = email.toLowerCase();
  if (emailLower.includes("admin") || emailLower.includes("@sonec.com"))
    return "admin";
  if (emailLower.includes("agent") || emailLower.includes("@agent.com"))
    return "agent";
  if (emailLower.includes("vendeur") || emailLower.includes("@sonecafrica.com"))
    return "vendeur";
  if (emailLower.includes("boutique") || emailLower.includes("shop"))
    return "vendeur";
  return "utilisateur";
};

const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case "admin":
      return faUserShield;
    case "agent":
      return faUserShield;
    case "vendeur":
      return faStore;
    default:
      return faUser;
  }
};

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case "admin":
      return "danger";
    case "agent":
      return "primary";
    case "vendeur":
      return "warning";
    default:
      return "info";
  }
};

const getUserTypeLabel = (userType: string) => {
  switch (userType) {
    case "admin":
      return "Admin";
    case "agent":
      return "Support";
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
      return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
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

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours} h`;
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ============================================
// COMPOSANT PRINCIPAL AVEC SUSPENSE
// ============================================
export default function MessagerieUtilisateur() {
  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
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
  const [userProfile, setUserProfile] = useState<UtilisateurBase | null>(null);

  // États pour les notifications toast
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    initial: true,
    contacts: false,
    messages: false,
    envoi: false,
    profile: false,
  });

  // État pour la suppression
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );

  // État pour la modale de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  // États pour les erreurs
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // États pour la sélection
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<ContactConversation | null>(null);

  // État pour stocker le message original en réponse
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

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

  // Onglet actif
  const [activeTab, setActiveTab] = useState<"contacts" | "received" | "sent">(
    "contacts",
  );

  // Statistiques
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
  });

  // REF pour éviter les boucles infinies
  const isInitialLoad = useRef(true);
  const isFetchingContacts = useRef(false);
  const prevMessagesRecusLength = useRef(0);
  const prevMessagesEnvoyesLength = useRef(0);
  const hasLoadedInitialData = useRef(false);
  const toastContainerRef = useRef<HTMLDivElement | null>(null);

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

      // Auto-suppression après durée
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
  // ✅ FONCTIONS DE MARQUAGE COMME LU/NON LU
  // ============================================
  const handleMarkAsRead = useCallback(
    async (messageId: string) => {
      try {
        await api.put(API_ENDPOINTS.MESSAGERIE.MARK_READ(messageId));

        setMessagesRecus((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: true, dateLecture: new Date().toISOString() }
              : msg,
          ),
        );

        if (selectedMessage?.uuid === messageId) {
          setSelectedMessage((prev) =>
            prev
              ? { ...prev, estLu: true, dateLecture: new Date().toISOString() }
              : null,
          );
        }

        setStats((prev) => ({
          ...prev,
          unreadMessages: Math.max(0, prev.unreadMessages - 1),
        }));

        showToast(
          "message-read",
          "📖 Message marqué comme lu",
          "Le message a été marqué comme lu avec succès",
          { duration: 3000, messageId },
        );
      } catch (err) {
        console.error("❌ Erreur lors du marquage comme lu:", err);
        showToast(
          "error",
          "❌ Erreur",
          "Impossible de marquer le message comme lu",
          {
            duration: 3000,
          },
        );
      }
    },
    [selectedMessage, showToast],
  );

  const handleMarkAsUnread = useCallback(
    async (messageId: string) => {
      try {
        await api.patch(API_ENDPOINTS.MESSAGERIE.MARK_UNREAD(messageId));

        setMessagesRecus((prev) =>
          prev.map((msg) =>
            msg.uuid === messageId
              ? { ...msg, estLu: false, dateLecture: null }
              : msg,
          ),
        );

        if (selectedMessage?.uuid === messageId) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, estLu: false, dateLecture: null } : null,
          );
        }

        setStats((prev) => ({
          ...prev,
          unreadMessages: prev.unreadMessages + 1,
        }));

        showToast(
          "info",
          "📬 Message marqué comme non lu",
          "Le message a été marqué comme non lu",
          { duration: 3000, messageId },
        );
      } catch (err) {
        console.error("❌ Erreur lors du marquage comme non lu:", err);
        showToast(
          "error",
          "❌ Erreur",
          "Impossible de marquer le message comme non lu",
          {
            duration: 3000,
          },
        );
      }
    },
    [selectedMessage, showToast],
  );

  // ============================================
  // ✅ FONCTION DE SUPPRESSION DE MESSAGE AVEC MODALE
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

      setMessagesRecus((prev) =>
        prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
      );
      setMessagesEnvoyes((prev) =>
        prev.filter((msg) => msg.uuid !== messageToDelete.uuid),
      );

      if (selectedMessage?.uuid === messageToDelete.uuid) {
        setSelectedMessage(null);
      }

      setStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages - 1,
        unreadMessages: messageToDelete.estLu
          ? prev.unreadMessages
          : Math.max(0, prev.unreadMessages - 1),
      }));

      showToast(
        "success",
        "🗑️ Message supprimé",
        `Le message "${messageToDelete.sujet.substring(0, 50)}${messageToDelete.sujet.length > 50 ? "..." : ""}" a été supprimé avec succès`,
        {
          duration: 4000,
          details: {
            sujet: messageToDelete.sujet,
            date: new Date(messageToDelete.envoyeLe).toLocaleDateString(
              "fr-FR",
            ),
          },
        },
      );
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du message:", err);
      showToast("error", "❌ Erreur", "Impossible de supprimer le message", {
        duration: 4000,
      });
    } finally {
      setDeletingMessageId(null);
      setMessageToDelete(null);
    }
  }, [messageToDelete, selectedMessage, showToast]);

  // ============================================
  // ✅ GESTION DES PARAMÈTRES D'URL - DÉCLARÉ EN PREMIER
  // ============================================
  const handleUrlParams = useCallback(() => {
    const destinataireUuid = searchParams.get("destinataireUuid");
    const destinataireEmail = searchParams.get("destinataireEmail");
    const destinataireNom = searchParams.get("destinataireNom");
    const sujet = searchParams.get("sujet");
    const produitUuid = searchParams.get("produitUuid");
    const donUuid = searchParams.get("donUuid");
    const echangeUuid = searchParams.get("echangeUuid");

    if (destinataireEmail && userProfile) {
      console.log("📨 Paramètres URL reçus:", {
        destinataireUuid,
        destinataireEmail,
        destinataireNom,
        sujet,
        produitUuid,
        donUuid,
        echangeUuid,
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
        sujet: sujet || `Question concernant votre annonce`,
        contenu: "",
        type: "QUESTION",
      }));

      setSelectedContact(contact);
      setActiveTab("contacts");

      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.search = "";
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, userProfile, router]);

  // ============================================
  // ✅ CHARGEMENT DU PROFIL - SANS DÉPENDANCES CYCLIQUES
  // ============================================
  const fetchUserProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const response = await api.get<{ data?: UtilisateurBase }>(
        API_ENDPOINTS.AUTH.UTILISATEUR.PROFILE,
      );
      if (response?.data) {
        const profile = response.data;
        setUserProfile(profile);
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email || "",
          expediteurNom:
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
            "Utilisateur SONEC",
          expediteurUuid: profile.uuid || "",
        }));
        return profile;
      }
      return null;
    } catch (err) {
      console.error("❌ Erreur chargement profil:", err);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  // ============================================
  // ✅ CHARGEMENT DES MESSAGES REÇUS - AVEC PARAMÈTRES
  // ============================================
  const fetchMessagesRecus = useCallback(
    async (profileEmail?: string, profileUuid?: string) => {
      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        const response = await api.get<MessageReceived[]>(
          API_ENDPOINTS.MESSAGERIE.RECEIVED,
        );

        if (!response || !Array.isArray(response) || response.length === 0) {
          setMessagesRecus([]);
          return;
        }

        const transformedMessages = response
          .map((item: any) => {
            const messageData = item.message || item;
            return {
              uuid: messageData.uuid || item.uuid || `msg-${Date.now()}`,
              sujet: messageData.sujet || "Sans sujet",
              contenu: messageData.contenu || "",
              expediteurNom: messageData.expediteurNom || "Expéditeur inconnu",
              expediteurEmail:
                messageData.expediteurEmail || "inconnu@exemple.com",
              expediteurUuid: messageData.expediteurUuid,
              destinataireEmail: messageData.destinataireEmail || profileEmail,
              destinataireUuid: messageData.destinataireUuid || profileUuid,
              type: (messageData.type || "notification").toUpperCase(),
              estEnvoye: false,
              envoyeLe:
                messageData.envoyeLe ||
                item.dateReception ||
                new Date().toISOString(),
              estLu: item.estLu || messageData.estLu || false,
              dateLecture: item.dateLecture || messageData.dateLecture,
            } as Message;
          })
          .filter((item): item is Message => item !== null);

        setMessagesRecus(transformedMessages);

        const unreadMessages = transformedMessages.filter((m) => !m.estLu);
        if (unreadMessages.length > 0) {
          showToast(
            "info",
            `📬 ${unreadMessages.length} message(s) non lu(s)`,
            "Vous avez des messages en attente de lecture",
            { duration: 5000 },
          );
        }
      } catch (err) {
        console.error("❌ Erreur chargement messages reçus:", err);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [showToast],
  );

  // ============================================
  // ✅ CHARGEMENT DES MESSAGES ENVOYÉS - AVEC PARAMÈTRES
  // ============================================
  const fetchMessagesEnvoyes = useCallback(
    async (
      profileNom?: string,
      profileEmail?: string,
      profileUuid?: string,
    ) => {
      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        const response = await api.get<any[]>(API_ENDPOINTS.MESSAGERIE.SENT);

        if (!response || !Array.isArray(response) || response.length === 0) {
          setMessagesEnvoyes([]);
          return;
        }

        const formattedMessages = response
          .map((msg: any) => {
            if (!msg) return null;

            const formattedMsg: Message = {
              uuid: msg.uuid || `sent-${Date.now()}`,
              sujet: msg.sujet || "Sans sujet",
              contenu: msg.contenu || "",
              expediteurNom:
                msg.expediteurNom || profileNom || "Utilisateur SONEC",
              expediteurEmail: msg.expediteurEmail || profileEmail || "",
              destinataireEmail: msg.destinataireEmail || "",
              type: (msg.type || "notification").toUpperCase(),
              estEnvoye: true,
              envoyeLe: msg.envoyeLe || new Date().toISOString(),
              estLu: msg.estLu || false,
              dateLecture: msg.dateLecture || null,
            };

            if (msg.expediteurUuid || profileUuid) {
              formattedMsg.expediteurUuid = msg.expediteurUuid || profileUuid;
            }
            if (msg.destinataireUuid) {
              formattedMsg.destinataireUuid = msg.destinataireUuid;
            }

            return formattedMsg;
          })
          .filter((msg): msg is Message => msg !== null);

        setMessagesEnvoyes(formattedMessages);
      } catch (err) {
        console.error("❌ Erreur chargement messages envoyés:", err);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [],
  );

  // ============================================
  // ✅ CONSTRUCTION DES CONTACTS (SIMPLIFIÉE)
  // ============================================
  const buildContactsFromMessages = useCallback(() => {
    if (!userProfile) return;

    if (isFetchingContacts.current) return;
    isFetchingContacts.current = true;

    try {
      console.log("👥 Construction des contacts depuis les messages...");

      const contactsMap = new Map<string, ContactConversation>();

      // Traiter les messages en une seule passe
      const allMessages = [...messagesRecus, ...messagesEnvoyes];

      for (const msg of allMessages) {
        const email = msg.expediteurEmail || msg.destinataireEmail;
        if (!email || email === userProfile.email) continue;

        if (!contactsMap.has(email)) {
          const isExpediteur = msg.expediteurEmail === email;
          const contact: ContactConversation = {
            uuid: isExpediteur
              ? msg.expediteurUuid || `contact-${Date.now()}-${email}`
              : msg.destinataireUuid || `contact-${Date.now()}-${email}`,
            email,
            nom: isExpediteur ? msg.expediteurNom?.split(" ").pop() || "" : "",
            prenoms: isExpediteur
              ? msg.expediteurNom?.split(" ").slice(0, -1).join(" ") ||
                msg.expediteurNom ||
                "Contact"
              : email.split("@")[0] || "Contact",
            telephone: "",
            userType: detectUserTypeFromEmail(email),
            est_verifie: true,
            est_bloque: false,
            is_deleted: false,
            lastMessageDate: msg.envoyeLe,
            lastMessage: msg.contenu,
            unreadCount: msg.estLu === false && msg.estEnvoye === false ? 1 : 0,
            totalMessages: 1,
          };
          contactsMap.set(email, contact);
        } else {
          const contact = contactsMap.get(email)!;
          contact.totalMessages = (contact.totalMessages || 0) + 1;
          if (msg.estLu === false && msg.estEnvoye === false) {
            contact.unreadCount = (contact.unreadCount || 0) + 1;
          }
          if (
            new Date(msg.envoyeLe) > new Date(contact.lastMessageDate || "")
          ) {
            contact.lastMessageDate = msg.envoyeLe;
            contact.lastMessage = msg.contenu;
          }
        }
      }

      const contactsArray = Array.from(contactsMap.values())
        .filter((c) => c.email !== userProfile.email)
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
  }, [userProfile, messagesRecus, messagesEnvoyes]);

  // ============================================
  // ✅ CHARGEMENT INITIAL - UNE SEULE FOIS
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (hasLoadedInitialData.current) return;

      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        const profile = await fetchUserProfile();

        if (!isMounted) return;

        if (profile) {
          await fetchMessagesRecus(profile.email, profile.uuid);
          await fetchMessagesEnvoyes(
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
              "Utilisateur SONEC",
            profile.email,
            profile.uuid,
          );
        }

        hasLoadedInitialData.current = true;
        isInitialLoad.current = false;

        showToast(
          "success",
          "✅ Messagerie chargée",
          "Votre messagerie est prête",
          {
            duration: 3000,
          },
        );
      } catch (err) {
        console.error("❌ Erreur chargement initial:", err);
        showToast(
          "error",
          "❌ Erreur de chargement",
          "Impossible de charger la messagerie",
          {
            duration: 5000,
          },
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
  }, [fetchUserProfile, fetchMessagesRecus, fetchMessagesEnvoyes, showToast]);

  // ============================================
  // ✅ CONSTRUCTION DES CONTACTS APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!userProfile) return;

    const messagesRecusChanged =
      prevMessagesRecusLength.current !== messagesRecus.length;
    const messagesEnvoyesChanged =
      prevMessagesEnvoyesLength.current !== messagesEnvoyes.length;

    if (messagesRecusChanged || messagesEnvoyesChanged) {
      buildContactsFromMessages();

      prevMessagesRecusLength.current = messagesRecus.length;
      prevMessagesEnvoyesLength.current = messagesEnvoyes.length;
    }
  }, [userProfile, messagesRecus, messagesEnvoyes, buildContactsFromMessages]);

  // ============================================
  // ✅ GESTION DES PARAMÈTRES URL APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (userProfile && !loading.initial) {
      handleUrlParams();
    }
  }, [userProfile, loading.initial, handleUrlParams]);

  // ============================================
  // STATISTIQUES
  // ============================================
  useEffect(() => {
    const totalContacts = contacts.length;
    const totalMessages = messagesRecus.length + messagesEnvoyes.length;
    const unreadMessages = messagesRecus.filter((m) => !m.estLu).length;

    setStats({
      totalContacts,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
    });
  }, [contacts, messagesRecus, messagesEnvoyes]);

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
          c.boutique?.nom?.toLowerCase().includes(searchLower),
      );
    }

    if (selectedType !== "all") {
      result = result.filter((c) => c.userType === selectedType);
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        result = result.filter((c) => !c.est_bloque && c.est_verifie);
      } else if (selectedStatus === "blocked") {
        result = result.filter((c) => c.est_bloque);
      } else if (selectedStatus === "unverified") {
        result = result.filter((c) => !c.est_verifie);
      }
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
  }, [contacts, searchTerm, selectedType, selectedStatus]);

  // ============================================
  // ✅ ACTIONS
  // ============================================
  const handleSendMessage = async () => {
    if (!newMessage.destinataireEmail.trim()) {
      setInfoMessage("Veuillez saisir une adresse email");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (!newMessage.sujet.trim()) {
      setInfoMessage("Veuillez saisir un sujet");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    if (!newMessage.contenu.trim()) {
      setInfoMessage("Veuillez saisir un message");
      setTimeout(() => setInfoMessage(null), 3000);
      return;
    }

    setLoading((prev) => ({ ...prev, envoi: true }));
    setError(null);
    setApiError(null);

    try {
      const messageData = {
        destinataireEmail: newMessage.destinataireEmail.trim(),
        destinataireUuid: newMessage.destinataireUuid,
        sujet: newMessage.sujet.trim(),
        contenu: newMessage.contenu.trim(),
        type: newMessage.type.toLowerCase(),
      };

      const response = await api.post<any>(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData,
      );

      const sentMessage: Message = {
        uuid: response.uuid || `temp-${Date.now()}`,
        sujet: messageData.sujet,
        contenu: messageData.contenu,
        expediteurNom: newMessage.expediteurNom,
        expediteurEmail: newMessage.expediteurEmail,
        expediteurUuid: newMessage.expediteurUuid,
        destinataireEmail: messageData.destinataireEmail,
        destinataireUuid: newMessage.destinataireUuid,
        type: newMessage.type.toUpperCase(),
        estEnvoye: true,
        envoyeLe: new Date().toISOString(),
        estLu: false,
        dateLecture: null,
      };

      setMessagesEnvoyes((prev) => [sentMessage, ...prev]);

      // Trouver le destinataire dans les contacts pour obtenir son nom
      const destinataireContact = contacts.find(
        (c) => c.email === newMessage.destinataireEmail,
      );

      showToast(
        "success",
        "✅ Message envoyé avec succès !",
        `Votre message a été envoyé à ${destinataireContact?.prenoms || ""} ${destinataireContact?.nom || ""} <${newMessage.destinataireEmail}>`,
        {
          duration: 6000,
          destinataire: {
            nom: destinataireContact
              ? `${destinataireContact.prenoms} ${destinataireContact.nom}`.trim()
              : undefined,
            email: newMessage.destinataireEmail,
          },
          details: {
            sujet: newMessage.sujet,
            date: new Date().toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        },
      );

      // Réinitialiser le message original
      setReplyToMessage(null);

      setNewMessage({
        destinataireEmail: "",
        destinataireUuid: "",
        sujet: "",
        contenu: "",
        type: "NOTIFICATION",
        expediteurNom: userProfile
          ? `${userProfile.prenoms || ""} ${userProfile.nom || ""}`.trim()
          : "Utilisateur SONEC",
        expediteurEmail: userProfile?.email || "",
        expediteurUuid: userProfile?.uuid || "",
      });

      setSelectedContact(null);
      setActiveTab("sent");
    } catch (err: any) {
      console.error("❌ Erreur envoi message:", err);

      let errorMessage = "Erreur lors de l'envoi du message";
      if (err.status === 500) {
        errorMessage =
          "Erreur interne du serveur. Veuillez réessayer plus tard.";
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
      setLoading((prev) => ({ ...prev, envoi: false }));
      setTimeout(() => {
        setSuccessMessage(null);
        setApiError(null);
      }, 5000);
    }
  };

  const handleReply = (message: Message) => {
    // Stocker le message original
    setReplyToMessage(message);

    // Mettre à jour le formulaire
    setNewMessage({
      ...newMessage,
      destinataireEmail: message.expediteurEmail,
      destinataireUuid: message.expediteurUuid || "",
      sujet: `RE: ${message.sujet}`,
      contenu: "",
      type: message.type,
    });

    const contact = contacts.find((c) => c.email === message.expediteurEmail);
    if (contact) setSelectedContact(contact);
    setActiveTab("contacts");
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
    setNewMessage({
      ...newMessage,
      sujet: "",
      contenu: "",
    });
  };

  const selectContactForMessage = (contact: ContactConversation) => {
    // Annuler toute réponse en cours
    setReplyToMessage(null);

    setSelectedContact(contact);
    setNewMessage((prev) => ({
      ...prev,
      destinataireEmail: contact.email,
      destinataireUuid: contact.uuid,
      sujet: `Message pour ${contact.prenoms} ${contact.nom}`.trim(),
      contenu: "",
    }));
  };

  const handleRefresh = () => {
    if (userProfile) {
      fetchMessagesRecus(userProfile.email, userProfile.uuid);
      fetchMessagesEnvoyes(
        `${userProfile.prenoms || ""} ${userProfile.nom || ""}`.trim() ||
          "Utilisateur SONEC",
        userProfile.email,
        userProfile.uuid,
      );
      showToast("info", "🔄 Actualisation", "Vos messages ont été actualisés", {
        duration: 2000,
      });
    }
  };

  // ============================================
  // GROUPEMENT DES MESSAGES
  // ============================================
  const groupedMessages = useMemo(() => {
    return messagesRecus.map((message, index) => ({
      message,
      showSeparator: index > 0 && index % 3 === 0,
    }));
  }, [messagesRecus]);

  // ============================================
  // RENDU
  // ============================================
  if (loading.initial) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
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
              borderRadius: "16px",
              overflow: "hidden",
              border: "none",
              boxShadow:
                "0 12px 28px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)",
              background: "white",
            }}
          >
            {/* Barre de couleur selon le type */}
            <div
              style={{
                height: "6px",
                width: "100%",
                background:
                  toast.type === "success"
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : toast.type === "error"
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : toast.type === "warning"
                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        : toast.type === "new-message"
                          ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                          : toast.type === "message-read"
                            ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                            : "linear-gradient(90deg, #6b7280, #9ca3af)",
              }}
            />

            <div className="toast-body p-3">
              <div className="d-flex">
                {/* Icône */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    background:
                      toast.type === "success"
                        ? "rgba(16, 185, 129, 0.15)"
                        : toast.type === "error"
                          ? "rgba(239, 68, 68, 0.15)"
                          : toast.type === "warning"
                            ? "rgba(245, 158, 11, 0.15)"
                            : toast.type === "new-message"
                              ? "rgba(59, 130, 246, 0.15)"
                              : toast.type === "message-read"
                                ? "rgba(139, 92, 246, 0.15)"
                                : "rgba(107, 114, 128, 0.15)",
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
                            : toast.type === "new-message"
                              ? faEnvelope
                              : toast.type === "message-read"
                                ? faEnvelopeOpenText
                                : faInfoCircle
                    }
                    style={{
                      fontSize: "1.5rem",
                      color:
                        toast.type === "success"
                          ? "#10b981"
                          : toast.type === "error"
                            ? "#ef4444"
                            : toast.type === "warning"
                              ? "#f59e0b"
                              : toast.type === "new-message"
                                ? "#3b82f6"
                                : toast.type === "message-read"
                                  ? "#8b5cf6"
                                  : "#6b7280",
                    }}
                  />
                </div>

                {/* Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6
                      className="fw-bold mb-1"
                      style={{ fontSize: "1rem", color: "#1f2937" }}
                    >
                      {toast.title}
                    </h6>
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      onClick={() => removeToast(toast.id)}
                      aria-label="Fermer"
                    ></button>
                  </div>

                  <p
                    className="mb-1"
                    style={{ fontSize: "0.9rem", color: "#4b5563" }}
                  >
                    {toast.message}
                  </p>

                  {/* Informations supplémentaires pour l'envoi de message */}
                  {toast.type === "success" && toast.destinataire && (
                    <div
                      className="mt-2 p-2 rounded-3"
                      style={{
                        background: "#f3f4f6",
                        borderLeft: "4px solid #10b981",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={faUser}
                          style={{ fontSize: "0.7rem", color: "#6b7280" }}
                        />
                        <small className="text-muted">Destinataire:</small>
                        <small className="fw-semibold text-dark">
                          {toast.destinataire.nom || toast.destinataire.email}
                        </small>
                      </div>
                      {toast.details?.sujet && (
                        <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            style={{ fontSize: "0.7rem", color: "#6b7280" }}
                          />
                          <small className="text-muted">Sujet:</small>
                          <small
                            className="text-dark text-truncate"
                            style={{ maxWidth: "180px" }}
                          >
                            {toast.details.sujet}
                          </small>
                        </div>
                      )}
                      {toast.details?.date && (
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <FontAwesomeIcon
                            icon={faClock}
                            style={{ fontSize: "0.7rem", color: "#6b7280" }}
                          />
                          <small className="text-muted">Envoyé le:</small>
                          <small className="text-dark">
                            {toast.details.date}
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informations pour les nouveaux messages */}
                  {toast.type === "new-message" && toast.expediteur && (
                    <div
                      className="mt-2 p-2 rounded-3"
                      style={{
                        background: "#eff6ff",
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <FontAwesomeIcon
                          icon={faUser}
                          style={{ fontSize: "0.7rem", color: "#3b82f6" }}
                        />
                        <small className="text-muted">Expéditeur:</small>
                        <small className="fw-semibold text-primary">
                          {toast.expediteur}
                        </small>
                      </div>
                      {toast.details?.sujet && (
                        <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            style={{ fontSize: "0.7rem", color: "#3b82f6" }}
                          />
                          <small className="text-muted">Sujet:</small>
                          <small className="text-primary">
                            {toast.details.sujet}
                          </small>
                        </div>
                      )}
                      {toast.messageId && (
                        <button
                          className="btn btn-sm btn-outline-primary w-100 mt-2"
                          onClick={() => {
                            const message = messagesRecus.find(
                              (m) => m.uuid === toast.messageId,
                            );
                            if (message) {
                              setSelectedMessage(message);
                              setActiveTab("received");
                              removeToast(toast.id);
                            }
                          }}
                          style={{ fontSize: "0.8rem" }}
                        >
                          <FontAwesomeIcon icon={faEye} className="me-2" />
                          Voir le message
                        </button>
                      )}
                    </div>
                  )}

                  {/* Informations pour la suppression */}
                  {toast.type === "success" &&
                    toast.message?.includes("supprimé") &&
                    toast.details?.sujet && (
                      <div
                        className="mt-2 p-2 rounded-3"
                        style={{
                          background: "#f3f4f6",
                          borderLeft: "4px solid #ef4444",
                        }}
                      >
                        <small className="text-muted d-block text-truncate">
                          Sujet: {toast.details.sujet}
                        </small>
                        {toast.details.date && (
                          <small className="text-muted d-block">
                            Date: {toast.details.date}
                          </small>
                        )}
                      </div>
                    )}
                </div>
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
            style={{ maxWidth: "450px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              {/* Barre de couleur rouge */}
              <div
                style={{
                  height: "8px",
                  width: "100%",
                  background: "linear-gradient(90deg, #ef4444, #f87171)",
                }}
              />

              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    style={{ fontSize: "2.5rem" }}
                  />
                </div>

                <h4 className="fw-bold mb-3" style={{ color: "#1f2937" }}>
                  Confirmer la suppression
                </h4>

                <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                  Êtes-vous sûr de vouloir supprimer ce message ?
                </p>

                {/* Aperçu du message */}
                <div
                  className="p-3 mb-4 rounded-3 text-start"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ fontSize: "0.9rem", color: "#6b7280" }}
                    />
                    <span
                      className="fw-semibold text-dark"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {messageToDelete.sujet}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ fontSize: "0.8rem", color: "#6b7280" }}
                    />
                    <small className="text-muted">
                      De: {messageToDelete.expediteurNom} (
                      {messageToDelete.expediteurEmail})
                    </small>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <FontAwesomeIcon
                      icon={faClock}
                      style={{ fontSize: "0.8rem", color: "#6b7280" }}
                    />
                    <small className="text-muted">
                      {new Date(messageToDelete.envoyeLe).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </small>
                  </div>

                  {messageToDelete.contenu && (
                    <div
                      className="mt-2 p-2 rounded-2"
                      style={{
                        background: "#fff",
                        borderLeft: "3px solid #ef4444",
                      }}
                    >
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {messageToDelete.contenu.length > 100
                          ? `${messageToDelete.contenu.substring(0, 100)}...`
                          : messageToDelete.contenu}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-3">
                  <button
                    className="btn btn-outline-secondary flex-grow-1 py-2"
                    onClick={closeDeleteModal}
                    style={{
                      borderRadius: "12px",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      border: "2px solid #e9ecef",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-danger flex-grow-1 py-2"
                    onClick={confirmDeleteMessage}
                    style={{
                      borderRadius: "12px",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      background: "linear-gradient(90deg, #ef4444, #dc2626)",
                      border: "none",
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Supprimer
                  </button>
                </div>

                <small
                  className="text-muted d-block mt-3"
                  style={{ fontSize: "0.75rem" }}
                >
                  Cette action est irréversible.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {stats.unreadMessages > 0 && (
                <span className="badge bg-danger ms-3 px-3 py-2">
                  {stats.unreadMessages} nouveau(x)
                </span>
              )}
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {contacts.length > 0
                ? `${contacts.length} contact${contacts.length > 1 ? "s" : ""} avec qui vous avez échangé`
                : "Commencez une conversation avec un contact"}
            </p>
          </div>
          <div className="d-flex gap-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => {
                setReplyToMessage(null);
                setActiveTab("contacts");
              }}
              style={{ fontSize: "0.85rem" }}
            >
              <FontAwesomeIcon icon={faUserPen} />
              Nouveau message
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleRefresh}
              style={{ fontSize: "0.85rem" }}
            >
              <FontAwesomeIcon icon={faHistory} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Contacts"
              value={stats.totalContacts}
              icon={faUsers}
              color="primary"
              subtitle="Avec qui vous avez échangé"
              trend="up"
              isLoading={loading.contacts}
            />
          </div>
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Messages Reçus"
              value={messagesRecus.length}
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
                messagesRecus.filter(
                  (m) => m.type.toUpperCase() === "PROMOTION",
                ).length
              }
              icon={faGift}
              color="warning"
              subtitle="Offres spéciales"
              trend="neutral"
            />
          </div>
        </div>

        {/* Messages d'erreur API */}
        {apiError && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-3"
            role="alert"
          >
            <div className="d-flex align-items-center">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="me-2 fs-4"
              />
              <div className="flex-grow-1">
                <h6
                  className="alert-heading mb-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  Erreur d'envoi
                </h6>
                <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                  {apiError}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setApiError(null)}
            ></button>
          </div>
        )}

        {/* Onglets principaux */}
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
                  onClick={() => {
                    setReplyToMessage(null);
                    setActiveTab("contacts");
                  }}
                  style={{ fontSize: "0.85rem" }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon icon={faUsers} className="fs-5 mb-1" />
                    <span className="fw-semibold">Mes contacts</span>
                    {contacts.length > 0 && (
                      <span
                        className="badge bg-primary mt-1"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {contacts.length}
                      </span>
                    )}
                  </div>
                </button>
              </li>
              <li className="nav-item flex-grow-1" role="presentation">
                <button
                  className={`nav-link w-100 ${activeTab === "received" ? "active" : ""} d-flex align-items-center justify-content-center gap-2 py-2`}
                  onClick={() => {
                    setReplyToMessage(null);
                    setActiveTab("received");
                  }}
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
                  onClick={() => {
                    setReplyToMessage(null);
                    setActiveTab("sent");
                  }}
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
            {/* ======================================== */}
            {/* ONGLET: MES CONTACTS */}
            {/* ======================================== */}
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
                            Contactez le support, les vendeurs ou d'autres
                            utilisateurs
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
                              <option value="admin">Admin</option>
                              <option value="agent">Support</option>
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
                                className="py-2 px-3"
                                style={{ width: "150px", fontSize: "0.8rem" }}
                              >
                                <span className="text-muted fw-medium">
                                  Dernier message
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
                                      {contacts.length === 0
                                        ? "Vous n'avez pas encore échangé de messages"
                                        : "Aucun contact ne correspond à vos filtres"}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredContacts.map((contact, index) => (
                                <tr
                                  key={`${contact.userType}-${contact.uuid}`}
                                  className={
                                    contact.unreadCount ? "table-warning" : ""
                                  }
                                >
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
                                          className="fw-bold text-dark text-truncate d-flex align-items-center"
                                          style={{ fontSize: "0.85rem" }}
                                        >
                                          {contact.email}
                                          {contact.unreadCount ? (
                                            <span className="badge bg-danger ms-2">
                                              {contact.unreadCount}
                                            </span>
                                          ) : null}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <small
                                            className="text-muted text-truncate"
                                            style={{
                                              fontSize: "0.75rem",
                                              maxWidth: "200px",
                                            }}
                                          >
                                            {contact.prenoms} {contact.nom}
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
                                  <td className="py-2 px-3">
                                    <div className="d-flex flex-column">
                                      <small
                                        className="text-muted"
                                        style={{ fontSize: "0.7rem" }}
                                      >
                                        {formatLastMessageDate(
                                          contact.lastMessageDate,
                                        )}
                                      </small>
                                      {contact.lastMessage && (
                                        <small
                                          className="text-truncate"
                                          style={{
                                            fontSize: "0.75rem",
                                            maxWidth: "150px",
                                          }}
                                        >
                                          {contact.lastMessage.substring(0, 30)}
                                          ...
                                        </small>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      className="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-1 px-2 py-1 mx-auto"
                                      title="Envoyer un message"
                                      onClick={() =>
                                        selectContactForMessage(contact)
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
                            {selectedContact
                              ? replyToMessage
                                ? `Réponse à ${selectedContact.prenoms}`
                                : `Message à ${selectedContact.prenoms}`
                              : "Nouveau message"}
                          </h5>
                          <p
                            className="text-muted mb-0"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {selectedContact
                              ? selectedContact.email
                              : "Rédigez et envoyez un message"}
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

                      {/* AFFICHAGE DU MESSAGE ORIGINAL EN LECTURE SEULE */}
                      {replyToMessage && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon
                              icon={faReply}
                              className="text-primary me-2"
                            />
                            <span
                              className="fw-semibold text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Vous répondez à :
                            </span>
                          </div>
                          <div
                            className="bg-light border rounded p-3"
                            style={{
                              backgroundColor: "#f8f9fa",
                              borderColor: "#dee2e6",
                              fontSize: "0.85rem",
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <span className="fw-bold text-dark">
                                  {replyToMessage.expediteurNom}
                                </span>
                                <span className="text-muted ms-2">
                                  &lt;{replyToMessage.expediteurEmail}&gt;
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                {replyToMessage.estLu ? (
                                  <span className="badge bg-success bg-opacity-10 text-success me-2">
                                    <FontAwesomeIcon
                                      icon={faCheckCircle}
                                      className="me-1"
                                    />
                                    Lu
                                  </span>
                                ) : (
                                  <span className="badge bg-warning bg-opacity-10 text-warning me-2">
                                    <FontAwesomeIcon
                                      icon={faClock}
                                      className="me-1"
                                    />
                                    Non lu
                                  </span>
                                )}
                                <small className="text-muted">
                                  {new Date(
                                    replyToMessage.envoyeLe,
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="fw-semibold mb-1 text-dark">
                                {replyToMessage.sujet}
                              </div>
                              <div
                                className="text-muted"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  backgroundColor: "#f1f3f5",
                                  padding: "0.75rem",
                                  borderRadius: "0.375rem",
                                  borderLeft: "3px solid #0d6efd",
                                }}
                              >
                                {replyToMessage.contenu}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-end mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelReply}
                              style={{ fontSize: "0.75rem" }}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="me-1"
                              />
                              Annuler la réponse
                            </button>
                          </div>
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
                              setNewMessage({
                                ...newMessage,
                                destinataireEmail: e.target.value,
                              })
                            }
                            required
                            style={{ fontSize: "0.85rem" }}
                            readOnly={!!replyToMessage}
                          />
                          <small
                            className="text-muted d-block mt-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-1"
                            />
                            Sélectionnez un contact dans la liste
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
                              setNewMessage({
                                ...newMessage,
                                sujet: e.target.value,
                              })
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
                              setNewMessage({
                                ...newMessage,
                                type: e.target.value,
                              })
                            }
                            style={{ fontSize: "0.85rem" }}
                          >
                            <option value="NOTIFICATION">Notification</option>
                            <option value="ALERT">Alerte</option>
                            <option value="INFO">Information</option>
                            <option value="QUESTION">Question</option>
                            <option value="SUPPORT">Support</option>
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
                            rows={replyToMessage ? 4 : 6}
                            placeholder="Écrivez votre message ici..."
                            value={newMessage.contenu}
                            onChange={(e) =>
                              setNewMessage({
                                ...newMessage,
                                contenu: e.target.value,
                              })
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
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                ></span>
                                <span>Envoi en cours...</span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faPaperPlane}
                                  className="fs-5"
                                />
                                <span>
                                  {replyToMessage
                                    ? "Répondre"
                                    : "Envoyer le message"}
                                </span>
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

            {/* ONGLET MESSAGES REÇUS */}
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
                            {messagesRecus.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={() =>
                              userProfile &&
                              fetchMessagesRecus(
                                userProfile.email,
                                userProfile.uuid,
                              )
                            }
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
                        {messagesRecus.length === 0 ? (
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
                          groupedMessages.map(({ message, showSeparator }) => (
                            <MessageItem
                              key={message.uuid}
                              message={message}
                              isSelected={
                                selectedMessage?.uuid === message.uuid
                              }
                              onSelect={(msg) => {
                                setSelectedMessage(msg);
                                if (!msg.estLu) handleMarkAsRead(msg.uuid);
                              }}
                              onReply={() => handleReply(message)}
                              onDelete={openDeleteModal}
                              onMarkAsUnread={handleMarkAsUnread}
                              showSeparator={showSeparator}
                              isDeleting={deletingMessageId === message.uuid}
                            />
                          ))
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
                              <div className="d-flex align-items-center gap-2">
                                {selectedMessage.estLu ? (
                                  <span
                                    className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1"
                                    title={`Lu le ${selectedMessage.dateLecture ? new Date(selectedMessage.dateLecture).toLocaleString("fr-FR") : ""}`}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCheckCircle}
                                      className="fs-12"
                                    />
                                    <span className="fw-medium">Lu</span>
                                  </span>
                                ) : (
                                  <span
                                    className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1"
                                    onClick={() =>
                                      handleMarkAsRead(selectedMessage.uuid)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <FontAwesomeIcon
                                      icon={faClock}
                                      className="fs-12"
                                    />
                                    <span className="fw-medium">Non lu</span>
                                  </span>
                                )}
                                <span
                                  className={`badge bg-${
                                    selectedMessage.type.toUpperCase() ===
                                    "ALERT"
                                      ? "danger"
                                      : selectedMessage.type.toUpperCase() ===
                                          "WARNING"
                                        ? "warning"
                                        : selectedMessage.type.toUpperCase() ===
                                            "PROMOTION"
                                          ? "success"
                                          : "primary"
                                  } bg-opacity-10 text-${
                                    selectedMessage.type.toUpperCase() ===
                                    "ALERT"
                                      ? "danger"
                                      : selectedMessage.type.toUpperCase() ===
                                          "WARNING"
                                        ? "warning"
                                        : selectedMessage.type.toUpperCase() ===
                                            "PROMOTION"
                                          ? "success"
                                          : "primary"
                                  } border border-${
                                    selectedMessage.type.toUpperCase() ===
                                    "ALERT"
                                      ? "danger"
                                      : selectedMessage.type.toUpperCase() ===
                                          "WARNING"
                                        ? "warning"
                                        : selectedMessage.type.toUpperCase() ===
                                            "PROMOTION"
                                          ? "success"
                                          : "primary"
                                  } border-opacity-25 px-2 py-1`}
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {selectedMessage.type.toUpperCase()}
                                </span>
                              </div>
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
                              {selectedMessage.dateLecture &&
                                selectedMessage.estLu && (
                                  <div className="text-success">
                                    <small style={{ fontSize: "0.75rem" }}>
                                      <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="me-1"
                                      />
                                      Lu le{" "}
                                      {new Date(
                                        selectedMessage.dateLecture,
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
                                )}
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
                              onClick={() => {
                                handleReply(selectedMessage);
                                setSelectedMessage(null);
                              }}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon
                                icon={faReply}
                                className="fs-5"
                              />
                              Répondre au message
                            </button>

                            {!selectedMessage.estLu ? (
                              <button
                                className="btn btn-outline-success d-flex align-items-center justify-content-center gap-3 py-2"
                                onClick={() =>
                                  handleMarkAsRead(selectedMessage.uuid)
                                }
                                style={{ fontSize: "0.85rem" }}
                                disabled={
                                  deletingMessageId === selectedMessage.uuid
                                }
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Marquer comme lu
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-warning d-flex align-items-center justify-content-center gap-3 py-2"
                                onClick={() =>
                                  handleMarkAsUnread(selectedMessage.uuid)
                                }
                                style={{ fontSize: "0.85rem" }}
                                disabled={
                                  deletingMessageId === selectedMessage.uuid
                                }
                              >
                                <FontAwesomeIcon icon={faClock} />
                                Marquer comme non lu
                              </button>
                            )}

                            <button
                              className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-3 py-2"
                              onClick={() => openDeleteModal(selectedMessage)}
                              style={{ fontSize: "0.85rem" }}
                              disabled={
                                deletingMessageId === selectedMessage.uuid
                              }
                            >
                              {deletingMessageId === selectedMessage.uuid ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  />
                                  <span>Suppression...</span>
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faTrash} />
                                  <span>Supprimer</span>
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-3 py-2"
                              onClick={() => setSelectedMessage(null)}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              Fermer
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

            {/* ONGLET MESSAGES ENVOYÉS */}
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
                            onClick={() =>
                              userProfile &&
                              fetchMessagesEnvoyes(
                                `${userProfile.prenoms || ""} ${userProfile.nom || ""}`.trim() ||
                                  "Utilisateur SONEC",
                                userProfile.email,
                                userProfile.uuid,
                              )
                            }
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
                                style={{ width: "120px", fontSize: "0.8rem" }}
                              >
                                Type
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ width: "180px", fontSize: "0.8rem" }}
                              >
                                Date d'envoi
                              </th>
                              <th
                                className="py-2 px-3"
                                style={{ width: "100px", fontSize: "0.8rem" }}
                              >
                                Statut de lecture
                              </th>
                              <th
                                className="py-2 px-3 text-center"
                                style={{ width: "100px", fontSize: "0.8rem" }}
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
                                      l'onglet "Mes contacts"
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
                                      className={`badge bg-${
                                        message.type === "ALERT"
                                          ? "danger"
                                          : message.type === "WARNING"
                                            ? "warning"
                                            : message.type === "PROMOTION"
                                              ? "success"
                                              : "primary"
                                      } bg-opacity-10 text-${
                                        message.type === "ALERT"
                                          ? "danger"
                                          : message.type === "WARNING"
                                            ? "warning"
                                            : message.type === "PROMOTION"
                                              ? "success"
                                              : "primary"
                                      } border border-${
                                        message.type === "ALERT"
                                          ? "danger"
                                          : message.type === "WARNING"
                                            ? "warning"
                                            : message.type === "PROMOTION"
                                              ? "success"
                                              : "primary"
                                      } border-opacity-25 px-2 py-1 fw-medium`}
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
                                        className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-2 px-2 py-1"
                                        title={
                                          message.dateLecture
                                            ? `Lu le ${new Date(message.dateLecture).toLocaleString("fr-FR")}`
                                            : ""
                                        }
                                      >
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="fs-12"
                                        />
                                        <span className="fw-medium">Lu</span>
                                      </span>
                                    ) : (
                                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 d-inline-flex align-items-center gap-2 px-2 py-1">
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
                                        setReplyToMessage(null);
                                        setNewMessage({
                                          ...newMessage,
                                          destinataireEmail:
                                            message.destinataireEmail,
                                          destinataireUuid:
                                            message.destinataireUuid || "",
                                          sujet: `RE: ${message.sujet}`,
                                          contenu: "",
                                          type: message.type,
                                          expediteurNom: userProfile
                                            ? `${userProfile.prenoms || ""} ${userProfile.nom || ""}`.trim()
                                            : "Utilisateur SONEC",
                                          expediteurEmail:
                                            userProfile?.email || "",
                                          expediteurUuid:
                                            userProfile?.uuid || "",
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
        .table-responsive::-webkit-scrollbar,
        .list-group-flush::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .table-responsive::-webkit-scrollbar-track,
        .list-group-flush::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .table-responsive::-webkit-scrollbar-thumb,
        .list-group-flush::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .table-responsive::-webkit-scrollbar-thumb:hover,
        .list-group-flush::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
}

// ============================================
// COMPOSANT MESSAGE ITAMÉLIORÉ
// ============================================
const MessageItem = ({
  message,
  isSelected,
  onSelect,
  onReply,
  onDelete,
  onMarkAsUnread,
  showSeparator = false,
  isDeleting = false,
}: {
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
  onReply?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onMarkAsUnread?: (messageId: string) => void;
  showSeparator?: boolean;
  isDeleting?: boolean;
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date inconnue";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "à l'instant";
      if (diffMins < 60) return `il y a ${diffMins} min`;
      if (diffHours < 24) return `il y a ${diffHours} h`;
      if (diffDays < 7) return `il y a ${diffDays} j`;
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
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
      case "PROMOTION":
        return "success";
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
          opacity: isDeleting ? 0.5 : 1,
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`bg-${getTypeColor()} bg-opacity-10 text-${getTypeColor()} rounded-circle d-flex align-items-center justify-content-center position-relative`}
              style={{ width: "40px", height: "40px" }}
            >
              <FontAwesomeIcon
                icon={getTypeIcon()}
                className={`fs-5 ${message.estLu ? "opacity-75" : ""}`}
              />
              {message.estLu && (
                <div
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                  style={{ width: "12px", height: "12px" }}
                  title="Message lu"
                />
              )}
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
              {message.estLu && (
                <span
                  className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1 px-2 py-1"
                  title={
                    message.dateLecture
                      ? `Lu le ${new Date(message.dateLecture).toLocaleString("fr-FR")}`
                      : ""
                  }
                  style={{ fontSize: "0.65rem" }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="fs-10" />
                  <span>Lu</span>
                </span>
              )}
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
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faEye} style={{ fontSize: "0.8rem" }} />
              <span>Voir</span>
            </button>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                if (onReply) onReply(message);
              }}
              style={{ fontSize: "0.8rem" }}
              disabled={isDeleting}
            >
              <FontAwesomeIcon icon={faReply} style={{ fontSize: "0.8rem" }} />
              <span>Répondre</span>
            </button>
            {message.estLu && onMarkAsUnread && (
              <button
                className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsUnread(message.uuid);
                }}
                style={{ fontSize: "0.8rem" }}
                title="Marquer comme non lu"
                disabled={isDeleting}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  style={{ fontSize: "0.8rem" }}
                />
              </button>
            )}
            {onDelete && (
              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(message);
                }}
                style={{ fontSize: "0.8rem" }}
                disabled={isDeleting}
                title="Supprimer"
              >
                {isDeleting ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faTrash}
                    style={{ fontSize: "0.8rem" }}
                  />
                )}
              </button>
            )}
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
          {message.dateLecture && message.estLu && (
            <small className="text-success" style={{ fontSize: "0.7rem" }}>
              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
              Lu {formatDate(message.dateLecture)}
            </small>
          )}
        </div>
      </div>
    </>
  );
};
